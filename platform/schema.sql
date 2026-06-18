-- =============================================================================
-- Invasive Ops — Liquor Sales & Inventory schema
-- =============================================================================
-- Run this once against your Supabase project:
--   Supabase dashboard → SQL Editor → paste → Run
--
-- All tables are prefixed `ops_` so they never collide with the public site's
-- Beer Passport tables in the same project.
-- =============================================================================

create extension if not exists pgcrypto;

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
-- The spirits (and anything else) you sell.
create table if not exists ops_products (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  category      text        not null default 'Spirit',  -- Bourbon | Rum | Vodka | Beer | Other
  size          text,                                    -- e.g. 750ml
  proof         text,                                    -- e.g. "80 proof" / "40% ABV"
  sku           text,
  unit_price    numeric(10,2) not null default 0,        -- sale price
  unit_cost     numeric(10,2) not null default 0,        -- cost of goods
  reorder_point integer     not null default 0,          -- low-stock threshold
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- ── STOCK MOVEMENTS ──────────────────────────────────────────────────────────
-- One append-only ledger for every change in stock. On-hand = SUM(qty).
-- Positive = stock in (received), negative = stock out (sale / waste).
create table if not exists ops_stock_movements (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid        not null references ops_products(id) on delete cascade,
  qty          integer     not null,                     -- signed
  type         text        not null default 'adjustment',-- received | adjustment | sale | waste
  reference_id uuid,                                     -- links to ops_sales.id for sales
  note         text,
  created_at   timestamptz not null default now(),
  created_by   text
);
create index if not exists idx_ops_movements_product on ops_stock_movements(product_id);

-- ── SALES ────────────────────────────────────────────────────────────────────
create table if not exists ops_sales (
  id            uuid primary key default gen_random_uuid(),
  sold_at       timestamptz not null default now(),
  customer_name text,
  channel       text        not null default 'Taproom',  -- Taproom | Distribution | Online | Other
  total         numeric(10,2) not null default 0,
  note          text,
  created_by    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_ops_sales_date on ops_sales(sold_at desc);

-- ── SALE ITEMS ───────────────────────────────────────────────────────────────
create table if not exists ops_sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid        not null references ops_sales(id) on delete cascade,
  product_id  uuid        not null references ops_products(id),
  quantity    integer     not null,
  unit_price  numeric(10,2) not null,
  line_total  numeric(10,2) not null
);
create index if not exists idx_ops_sale_items_sale on ops_sale_items(sale_id);

-- ── ON-HAND VIEW ─────────────────────────────────────────────────────────────
-- Each product with its current stock on hand (sum of the ledger).
create or replace view ops_product_stock as
select
  p.*,
  coalesce(sum(m.qty), 0)::integer as on_hand
from ops_products p
left join ops_stock_movements m on m.product_id = p.id
group by p.id;

-- Respect the caller's RLS rather than the view owner's.
alter view ops_product_stock set (security_invoker = true);

-- ── ATOMIC SALE ──────────────────────────────────────────────────────────────
-- Records a sale + its line items + the negative stock movements in one
-- transaction, and returns the new sale id.
-- p_items: jsonb array of { product_id, quantity, unit_price }
create or replace function ops_record_sale(
  p_items      jsonb,
  p_customer   text default null,
  p_channel    text default 'Taproom',
  p_note       text default null,
  p_created_by text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_sale_id uuid;
  v_item    jsonb;
  v_total   numeric(10,2) := 0;
  v_line    numeric(10,2);
begin
  if auth.role() is distinct from 'authenticated' then
    raise exception 'Not authorized';
  end if;

  insert into ops_sales (customer_name, channel, note, created_by, total)
  values (p_customer, coalesce(p_channel, 'Taproom'), p_note, p_created_by, 0)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_line  := (v_item->>'quantity')::int * (v_item->>'unit_price')::numeric;
    v_total := v_total + v_line;

    insert into ops_sale_items (sale_id, product_id, quantity, unit_price, line_total)
    values (
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      v_line
    );

    insert into ops_stock_movements (product_id, qty, type, reference_id, created_by)
    values (
      (v_item->>'product_id')::uuid,
      -1 * (v_item->>'quantity')::int,
      'sale',
      v_sale_id,
      p_created_by
    );
  end loop;

  update ops_sales set total = v_total where id = v_sale_id;
  return v_sale_id;
end;
$$;

-- ── ROW-LEVEL SECURITY ───────────────────────────────────────────────────────
-- Internal team tool: any signed-in user (Phil's team) has full access.
-- Public visitors (no session) can't touch anything.
alter table ops_products        enable row level security;
alter table ops_stock_movements enable row level security;
alter table ops_sales           enable row level security;
alter table ops_sale_items      enable row level security;

create policy "ops_products_auth"  on ops_products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "ops_movements_auth" on ops_stock_movements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "ops_sales_auth"     on ops_sales
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "ops_sale_items_auth" on ops_sale_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ── SEED: current spirits lineup (runs only if the table is empty) ────────────
insert into ops_products (name, category, size, proof, unit_price, unit_cost, reorder_point)
select * from (values
  ('High Rye Bourbon',              'Bourbon', '750ml', '80 proof', 39.00, 18.00, 6),
  ('Show Pony Sweet Tea Bourbon',   'Bourbon', '750ml', '',         42.00, 20.00, 6),
  ('High Rye Ninety Nine Bourbon',  'Bourbon', '750ml', '99 proof', 42.00, 20.00, 6),
  ('Amburana Cask Bourbon',         'Bourbon', '750ml', '95 proof', 42.00, 21.00, 4),
  ('Barrel Aged Florida Rum',       'Rum',     '750ml', '80 proof', 36.00, 17.00, 6),
  ('Sugarcane Vodka',               'Vodka',   '750ml', '80 proof', 33.00, 15.00, 8)
) as v(name, category, size, proof, unit_price, unit_cost, reorder_point)
where not exists (select 1 from ops_products);
