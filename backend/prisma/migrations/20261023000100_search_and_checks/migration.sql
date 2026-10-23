-- Full-text search + database-level safety nets.
-- Prisma can't express generated columns or CHECK constraints, so they live here.

-- array_to_string is STABLE; generated columns need IMMUTABLE expressions.
CREATE OR REPLACE FUNCTION bm_tags_text(tags TEXT[]) RETURNS TEXT
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT coalesce(array_to_string(tags, ' '), '') $$;

ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple'::regconfig, coalesce("name", '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce("brand", '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, bm_tags_text("tags")), 'C') ||
    setweight(to_tsvector('simple'::regconfig, coalesce("description", '')), 'D')
  ) STORED;

CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");

-- Safety checks: even buggy code can't create negative stock or bad ratings.
ALTER TABLE "Variant"   ADD CONSTRAINT "Variant_stock_nonneg"     CHECK ("stock" >= 0);
ALTER TABLE "Variant"   ADD CONSTRAINT "Variant_reserved_nonneg"  CHECK ("reserved" >= 0);
ALTER TABLE "Variant"   ADD CONSTRAINT "Variant_reserved_le_stock" CHECK ("reserved" <= "stock");
ALTER TABLE "Variant"   ADD CONSTRAINT "Variant_price_valid"      CHECK ("price" > 0 AND "mrp" >= "price");
ALTER TABLE "CartItem"  ADD CONSTRAINT "CartItem_qty_range"       CHECK ("qty" BETWEEN 1 AND 10);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_qty_pos"        CHECK ("qty" > 0);
ALTER TABLE "Review"    ADD CONSTRAINT "Review_rating_range"      CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Coupon"    ADD CONSTRAINT "Coupon_used_within_limit" CHECK ("usageLimit" IS NULL OR "usedCount" <= "usageLimit");
