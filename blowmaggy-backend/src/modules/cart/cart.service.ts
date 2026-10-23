/**
 * UNIFIED CART — one cart across all six departments, for guests (cookie) and users.
 * Every read re-prices with the server pricing engine and returns per-item warnings.
 */
import { BUNDLE_NUDGE_THRESHOLD, GROCERY_SLOTS, MAX_QTY_PER_LINE } from '../../config/constants';
import { pct, sumBy } from '../../lib/money';
import { prisma, type Db } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { available, deptBrief, optionsOf } from '../catalog/serialize';
import { getActiveBundles, getCouponByCode, getPricingUser } from '../pricing/context';
import { priceCart, type PriceLineInput } from '../pricing/pricing';

export interface CartCtx { userId?: string; guestId?: string }

export const cartInclude = {
  items: {
    orderBy: { addedAt: 'asc' as const },
    include: { variant: { include: { product: { include: { department: true } } } } },
  },
};

type CartWithItems = NonNullable<Awaited<ReturnType<typeof findCart>>>;

export async function findCart(db: Db, ctx: CartCtx) {
  if (ctx.userId) return db.cart.findUnique({ where: { userId: ctx.userId }, include: cartInclude });
  if (ctx.guestId) return db.cart.findUnique({ where: { guestId: ctx.guestId }, include: cartInclude });
  return null;
}

async function getOrCreateCart(db: Db, ctx: CartCtx) {
  if (ctx.userId) return db.cart.upsert({ where: { userId: ctx.userId }, create: { userId: ctx.userId }, update: {}, include: cartInclude });
  if (ctx.guestId) return db.cart.upsert({ where: { guestId: ctx.guestId }, create: { guestId: ctx.guestId }, update: {}, include: cartInclude });
  throw new AppError(400, 'No cart identity');
}

export type ItemWarning = 'OUT_OF_STOCK' | 'QTY_REDUCED' | 'PRICE_CHANGED' | 'INACTIVE' | 'LOW_STOCK';

/** Builds the full cart response (and fixes quantities that exceed stock). */
export async function buildCartView(cart: CartWithItems | null, userId?: string) {
  if (!cart) return emptyView();

  const warnings: { itemId: string; code: ItemWarning; message: string }[] = [];
  const purchasable: (CartWithItems['items'][number] & { warnings: ItemWarning[]; available: number })[] = [];
  const unavailable: typeof purchasable = [];

  for (const item of cart.items) {
    const v = item.variant;
    const p = v.product;
    const avail = available(v);
    const w: ItemWarning[] = [];
    let qty = item.qty;

    if (!v.isActive || !p.isActive) {
      w.push('INACTIVE');
      warnings.push({ itemId: item.id, code: 'INACTIVE', message: `${p.name} is no longer available` });
    } else if (avail <= 0) {
      w.push('OUT_OF_STOCK');
      warnings.push({ itemId: item.id, code: 'OUT_OF_STOCK', message: `${p.name} just sold out` });
    } else if (qty > avail) {
      qty = avail;
      w.push('QTY_REDUCED');
      warnings.push({ itemId: item.id, code: 'QTY_REDUCED', message: `Only ${avail} left of ${p.name} — quantity updated` });
      await prisma.cartItem.update({ where: { id: item.id }, data: { qty } });
    } else if (avail <= v.lowStockAt) {
      w.push('LOW_STOCK');
    }
    if (item.priceAtAdd !== v.price) {
      w.push('PRICE_CHANGED');
      warnings.push({
        itemId: item.id, code: 'PRICE_CHANGED',
        message: `Price of ${p.name} ${v.price < item.priceAtAdd ? 'dropped' : 'changed'} since you added it`,
      });
      await prisma.cartItem.update({ where: { id: item.id }, data: { priceAtAdd: v.price } });
    }
    const row = { ...item, qty, warnings: w, available: avail };
    (w.includes('INACTIVE') || w.includes('OUT_OF_STOCK') ? unavailable : purchasable).push(row);
  }

  const coupon = await getCouponByCode(prisma, cart.couponCode);
  const [user, bundles] = await Promise.all([getPricingUser(prisma, userId, coupon?.id), getActiveBundles(prisma)]);
  const lines: PriceLineInput[] = purchasable.map((i) => ({
    variantId: i.variantId,
    productId: i.variant.productId,
    departmentId: i.variant.product.departmentId,
    departmentSlug: i.variant.product.department.slug,
    unitPrice: i.variant.price,
    qty: i.qty,
  }));
  const price = priceCart({ lines, coupon, user, bundles });
  const priced = new Map(price.lines.map((l) => [l.variantId, l]));

  const itemView = (i: (typeof purchasable)[number]) => {
    const pl = priced.get(i.variantId);
    const p = i.variant.product;
    return {
      id: i.id,
      variantId: i.variantId,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      image: i.variant.image ?? p.images[0] ?? null,
      options: optionsOf(i.variant),
      sku: i.variant.sku,
      unitPrice: i.variant.price,
      mrp: i.variant.mrp,
      qty: i.qty,
      available: i.available,
      maxQty: Math.min(i.available, MAX_QTY_PER_LINE),
      gross: pl?.gross ?? 0,
      discount: pl?.discount ?? 0,
      lineTotal: pl?.net ?? 0,
      bundle: pl?.bundleSlug ?? null,
      purchasable: !!pl,
      warnings: i.warnings,
    };
  };

  // group by department (department sort order)
  const all = [...purchasable, ...unavailable];
  const deptMap = new Map<string, { department: ReturnType<typeof deptBrief> & { sortOrder: number }; items: ReturnType<typeof itemView>[] }>();
  for (const i of all) {
    const d = i.variant.product.department;
    if (!deptMap.has(d.slug)) deptMap.set(d.slug, { department: { ...deptBrief(d), sortOrder: d.sortOrder }, items: [] });
    deptMap.get(d.slug)!.items.push(itemView(i));
  }
  const groups = [...deptMap.values()].sort((a, b) => a.department.sortOrder - b.department.sortOrder);

  // bundle nudges: ≥ 60% of a bundle already in cart
  const productIds = new Set(purchasable.map((i) => i.variant.productId));
  const nudges = [];
  for (const b of bundles) {
    if (price.appliedBundles.includes(b.slug)) continue;
    const have = b.productIds.filter((id) => productIds.has(id));
    if (b.productIds.length && have.length / b.productIds.length >= BUNDLE_NUDGE_THRESHOLD) {
      const missing = await prisma.product.findMany({
        where: { id: { in: b.productIds.filter((id) => !productIds.has(id)) } },
        select: { id: true, slug: true, name: true, basePrice: true, images: true },
      });
      const bundleValue = sumBy(price.lines.filter((l) => b.productIds.includes(l.productId)), (l) => l.gross) + sumBy(missing, (m) => m.basePrice);
      nudges.push({
        slug: b.slug, name: b.name, discountPct: b.discountPct,
        missing: missing.map((m) => ({ productId: m.id, slug: m.slug, name: m.name, price: m.basePrice, image: m.images[0] ?? null })),
        estimatedSaving: pct(bundleValue, b.discountPct),
        message: `Add ${missing.map((m) => m.name).join(' + ')} to complete ${b.name} and save ${b.discountPct}%`,
      });
    }
  }

  const hasGrocery = price.groups.some((g) => g.needsSlot);
  return {
    id: cart.id,
    itemCount: sumBy(purchasable, (i) => i.qty),
    lineCount: all.length,
    departmentCount: groups.length,
    groups,
    shipments: price.groups.map((g) => ({ group: g.group, label: g.label, etaDays: g.etaDays, needsSlot: g.needsSlot, departments: g.departments, itemCount: g.variantIds.length })),
    summary: {
      subtotal: price.subtotal,
      bundleDiscount: price.bundleDiscount,
      couponDiscount: price.couponDiscount,
      memberSavings: price.memberSavings,
      discountTotal: price.discountTotal,
      deliveryFee: price.deliveryFee,
      tax: price.tax,
      total: price.total,
      freeDeliveryGap: price.freeDeliveryGap,
      memberPreviewSavings: price.memberPreviewSavings,
    },
    coupon: price.coupon,
    appliedBundles: price.appliedBundles,
    bundleNudges: nudges,
    grocerySlot: hasGrocery ? cart.grocerySlot ?? GROCERY_SLOTS[0] : null,
    grocerySlots: hasGrocery ? GROCERY_SLOTS : [],
    warnings,
    canCheckout: purchasable.length > 0 && unavailable.length === 0,
  };
}

function emptyView() {
  return {
    id: null, itemCount: 0, lineCount: 0, departmentCount: 0, groups: [], shipments: [],
    summary: { subtotal: 0, bundleDiscount: 0, couponDiscount: 0, memberSavings: 0, discountTotal: 0, deliveryFee: 0, tax: 0, total: 0, freeDeliveryGap: 0, memberPreviewSavings: 0 },
    coupon: null, appliedBundles: [], bundleNudges: [], grocerySlot: null, grocerySlots: [], warnings: [], canCheckout: false,
  };
}

export async function getCart(ctx: CartCtx) {
  return buildCartView(await findCart(prisma, ctx), ctx.userId);
}

async function loadSellableVariant(variantId: string) {
  const v = await prisma.variant.findUnique({ where: { id: variantId }, include: { product: true } });
  if (!v || !v.isActive || !v.product.isActive) throw new AppError(404, 'Product not available');
  return v;
}

export async function addItem(ctx: CartCtx, variantId: string, qty: number) {
  const v = await loadSellableVariant(variantId);
  const avail = available(v);
  if (avail <= 0) throw new AppError(409, 'This item is out of stock', 'OUT_OF_STOCK');
  const cart = await getOrCreateCart(prisma, ctx);
  // atomic increment (double-click safe thanks to @@unique([cartId, variantId]))
  const item = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, qty: Math.min(qty, avail, MAX_QTY_PER_LINE), priceAtAdd: v.price },
    update: { qty: { increment: qty } },
  });
  const cap = Math.min(avail, MAX_QTY_PER_LINE);
  if (item.qty > cap) await prisma.cartItem.update({ where: { id: item.id }, data: { qty: cap } });
  return getCart(ctx);
}

async function ownedItem(ctx: CartCtx, itemId: string) {
  const cart = await findCart(prisma, ctx);
  const item = cart?.items.find((i) => i.id === itemId);
  if (!item) throw new AppError(404, 'Cart item not found');
  return item;
}

export async function updateItem(ctx: CartCtx, itemId: string, qty: number) {
  const item = await ownedItem(ctx, itemId);
  if (qty === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    const cap = Math.min(available(item.variant), MAX_QTY_PER_LINE);
    if (cap <= 0) throw new AppError(409, 'This item is out of stock', 'OUT_OF_STOCK');
    await prisma.cartItem.update({ where: { id: item.id }, data: { qty: Math.min(qty, cap) } });
  }
  return getCart(ctx);
}

export async function removeItem(ctx: CartCtx, itemId: string) {
  const item = await ownedItem(ctx, itemId);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(ctx);
}

export async function applyCoupon(ctx: CartCtx, code: string) {
  const coupon = await getCouponByCode(prisma, code);
  if (!coupon) throw new AppError(404, 'Coupon not found', 'COUPON_NOT_FOUND');
  const cart = await getOrCreateCart(prisma, ctx);
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code } });
  const view = await getCart(ctx);
  if (!view.coupon?.applied) {
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: cart.couponCode } });
    throw new AppError(400, view.coupon?.reason ?? 'Coupon not applicable', 'COUPON_INVALID');
  }
  return view;
}

export async function removeCoupon(ctx: CartCtx) {
  const cart = await findCart(prisma, ctx);
  if (cart) await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
  return getCart(ctx);
}

export async function setGrocerySlot(ctx: CartCtx, slot: string) {
  if (!GROCERY_SLOTS.includes(slot)) throw new AppError(400, 'Unknown delivery slot', 'BAD_SLOT', { slots: GROCERY_SLOTS });
  const cart = await getOrCreateCart(prisma, ctx);
  await prisma.cart.update({ where: { id: cart.id }, data: { grocerySlot: slot } });
  return getCart(ctx);
}

/** Adds every product of a bundle (cheapest in-stock variant, or the ones the client picked). */
export async function addBundle(ctx: CartCtx, slug: string, picks: Record<string, string> = {}) {
  const bundle = await prisma.bundle.findUnique({
    where: { slug },
    include: { items: { include: { product: { include: { variants: { where: { isActive: true }, orderBy: { price: 'asc' } } } } } } },
  });
  if (!bundle || !bundle.isActive) throw new AppError(404, 'Bundle not found');
  const cart = await getOrCreateCart(prisma, ctx);
  for (const { product } of bundle.items) {
    const chosen = product.variants.find((v) => v.id === picks[product.id] && available(v) > 0)
      ?? product.variants.find((v) => available(v) > 0);
    if (!chosen) throw new AppError(409, `${product.name} is out of stock`, 'OUT_OF_STOCK');
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: chosen.id } },
      create: { cartId: cart.id, variantId: chosen.id, qty: 1, priceAtAdd: chosen.price },
      update: {},
    });
  }
  return getCart(ctx);
}

/** Called right after login/register: moves the guest cart into the user's cart. */
export async function mergeGuestCart(guestId: string | undefined, userId: string) {
  if (!guestId) return;
  await prisma.$transaction(async (tx) => {
    const guest = await tx.cart.findUnique({ where: { guestId }, include: cartInclude });
    if (!guest || guest.userId) return;
    const userCart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: { items: true } });
    for (const g of guest.items) {
      const cap = Math.min(available(g.variant), MAX_QTY_PER_LINE);
      if (cap <= 0) continue;
      const existing = userCart.items.find((i) => i.variantId === g.variantId);
      if (existing) {
        await tx.cartItem.update({ where: { id: existing.id }, data: { qty: Math.min(existing.qty + g.qty, cap) } });
      } else {
        await tx.cartItem.create({ data: { cartId: userCart.id, variantId: g.variantId, qty: Math.min(g.qty, cap), priceAtAdd: g.priceAtAdd } });
      }
    }
    await tx.cart.update({
      where: { id: userCart.id },
      data: { couponCode: userCart.couponCode ?? guest.couponCode, grocerySlot: userCart.grocerySlot ?? guest.grocerySlot },
    });
    await tx.cart.delete({ where: { id: guest.id } });
  });
}
