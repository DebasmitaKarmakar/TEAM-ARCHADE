import React, { useMemo, useState } from 'react';
import { Edit3, PackagePlus, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId, Product } from '../../types/store';
import { formatInr } from '../../lib/currency';

type ProductDraft = Pick<Product, 'name' | 'sku' | 'department' | 'category' | 'price' | 'stockCount' | 'description'>;
const newDraft = (): ProductDraft => ({ name: '', sku: '', department: 'fashion', category: 'New arrivals', price: 50, stockCount: 25, description: '' });

export const AdminCatalogManager: React.FC = () => {
  const { products, catalogStatus, addProduct, updateProduct, deleteProduct } = useStore();
  const [draft, setDraft] = useState<ProductDraft>(newDraft);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isOpen, setOpen] = useState(false);
  const imageForDepartment = useMemo(() => Object.fromEntries((Object.keys(DEPARTMENTS) as DepartmentId[]).map((id) => [id, products.find((product) => product.department === id)?.images.front || ''])), [products]);

  const openCreate = () => { setEditing(null); setDraft(newDraft()); setOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setDraft({ name: product.name, sku: product.sku, department: product.department, category: product.category, price: product.price, stockCount: product.stockCount, description: product.description }); setOpen(true); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const department = DEPARTMENTS[draft.department];
    const nextProduct: Product = {
      id: editing?.id || `product-${Date.now()}`,
      sku: draft.sku.trim().toUpperCase(),
      name: draft.name.trim(),
      department: draft.department,
      deptLabel: department.title,
      deptNumber: department.deptNumber,
      category: draft.category.trim(),
      price: Number(draft.price),
      rating: editing?.rating || 4.5,
      reviewsCount: editing?.reviewsCount || 0,
      inStock: Number(draft.stockCount) > 0,
      stockCount: Number(draft.stockCount),
      safetyBuffer: editing?.safetyBuffer || 10,
      stockStatus: Number(draft.stockCount) < 5 ? 'critical' : Number(draft.stockCount) < 10 ? 'low_warning' : 'optimal',
      description: draft.description.trim(),
      extendedDescription: editing?.extendedDescription || `An editor-selected addition to the ${department.title} collection.`,
      badge: editing?.badge || 'New Arrival',
      tagline: editing?.tagline || `${department.title} • ${draft.sku.trim().toUpperCase()}`,
      images: editing?.images || { front: imageForDepartment[draft.department] },
      variants: editing?.variants,
      specs: editing?.specs,
      pairings: editing?.pairings,
    };
    if (editing) updateProduct(nextProduct); else addProduct(nextProduct);
    setOpen(false);
  };

  return (
    <section className="border border-[#2D2D35] bg-[#1A1A1E] p-6" aria-labelledby="admin-catalog-title">
      <div className="mb-4 flex flex-col gap-3 border-b border-[#2D2D35] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Store administrator</p><h2 id="admin-catalog-title" className="font-display-hero text-2xl text-[#FAF9F5]">Product catalogue</h2><p className="mt-1 text-xs text-[#8E8D94]">Create, edit or remove shopper-facing products from the local demo catalogue.</p></div><button id="admin-create-product" type="button" onClick={openCreate} className="flex min-h-11 items-center justify-center gap-2 bg-[#C9A84C] px-4 font-mono text-xs font-bold uppercase text-[#0E0E10] hover:bg-[#d6b75e]"><PackagePlus className="h-4 w-4" />Add product</button></div>
      <div className="max-h-[28rem] overflow-auto"><table className="w-full min-w-[42rem] text-left text-xs"><thead className="sticky top-0 bg-[#141417] font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]"><tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Department</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Visibility</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#2D2D35]">{products.map((product) => <tr key={product.id} className="hover:bg-[#141417]/50"><td className="px-3 py-3"><span className="block font-medium text-[#FAF9F5]">{product.name}</span><span className="font-mono text-[10px] text-[#8E8D94]">{product.sku}</span></td><td className="px-3 py-3 text-[#C5C7C9]">{DEPARTMENTS[product.department].title}</td><td className="px-3 py-3 font-mono text-[#FAF9F5]">{formatInr(product.price)}</td><td className="px-3 py-3"><span className={catalogStatus[product.id] === 'live' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>{catalogStatus[product.id]}</span></td><td className="px-3 py-3"><div className="flex justify-end gap-2"><button id={`catalog-edit-${product.id}`} type="button" onClick={() => openEdit(product)} className="min-h-9 border border-[#3E3E47] px-2 text-[#FAF9F5] hover:border-[#C9A84C]" aria-label={`Edit ${product.name}`}><Edit3 className="h-3.5 w-3.5" /></button><button id={`catalog-delete-${product.id}`} type="button" onClick={() => deleteProduct(product.id)} className="min-h-9 border border-[#DC2626]/40 px-2 text-[#F87171] hover:bg-[#DC2626]/10" aria-label={`Delete ${product.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>
      {isOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0E0E10]/90 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#3E3E47] bg-[#1A1A1E] p-6"><div className="mb-5 flex items-start justify-between border-b border-[#2D2D35] pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Product editor</p><h3 className="font-display-hero text-2xl text-[#FAF9F5]">{editing ? 'Edit product' : 'Add product'}</h3></div><button id="close-product-editor" type="button" onClick={() => setOpen(false)} className="p-2 text-[#8E8D94] hover:text-[#FAF9F5]"><X className="h-5 w-5" /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Product name<input id="catalog-product-name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">SKU<input id="catalog-product-sku" required value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Department<select id="catalog-product-department" value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value as DepartmentId })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]">{(Object.keys(DEPARTMENTS) as DepartmentId[]).map((id) => <option key={id} value={id}>{DEPARTMENTS[id].title}</option>)}</select></label><label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Category<input id="catalog-product-category" required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Price (catalogue base)<input id="catalog-product-price" required min="1" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Opening stock<input id="catalog-product-stock" required min="0" type="number" value={draft.stockCount} onChange={(event) => setDraft({ ...draft, stockCount: Number(event.target.value) })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="sm:col-span-2 text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">Shopper description<textarea id="catalog-product-description" required rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1.5 w-full border border-[#3E3E47] bg-[#141417] p-2.5 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label></div><div className="mt-6 flex justify-end gap-3"><button id="cancel-product-editor" type="button" onClick={() => setOpen(false)} className="min-h-11 px-4 font-mono text-xs uppercase text-[#8E8D94]">Cancel</button><button id="save-product-editor" type="submit" className="min-h-11 bg-[#C9A84C] px-4 font-mono text-xs font-bold uppercase text-[#0E0E10]">{editing ? 'Save changes' : 'Create product'}</button></div></form></div>}
    </section>
  );
};
