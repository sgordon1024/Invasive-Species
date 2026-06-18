-- =============================================================================
-- Invasive Ops — Migration 001: staff allowlist
-- =============================================================================
-- Locks the platform down to approved staff emails. Before this, ANY signed-in
-- Supabase user (including the leftover Beer Passport accounts) could read and
-- write the ops_* tables. Run this once in the Supabase SQL editor.
-- =============================================================================

-- Allowlist of staff who may use the platform.
create table if not exists ops_staff (
  email    text primary key,
  added_at timestamptz not null default now()
);

-- Seed the first staff member. Add more below, or via the Supabase Table editor.
insert into ops_staff (email) values
  ('sgordon1024@gmail.com')
on conflict do nothing;

-- Is the current caller an approved staff member?
create or replace function ops_is_staff()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from ops_staff
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- Staff can read the allowlist.
alter table ops_staff enable row level security;
drop policy if exists "ops_staff_select" on ops_staff;
create policy "ops_staff_select" on ops_staff
  for select using (ops_is_staff());

-- Replace the permissive "any authenticated user" policies with staff-only.
drop policy if exists "ops_products_auth"   on ops_products;
drop policy if exists "ops_movements_auth"  on ops_stock_movements;
drop policy if exists "ops_sales_auth"      on ops_sales;
drop policy if exists "ops_sale_items_auth" on ops_sale_items;

create policy "ops_products_staff"   on ops_products
  for all using (ops_is_staff()) with check (ops_is_staff());
create policy "ops_movements_staff"  on ops_stock_movements
  for all using (ops_is_staff()) with check (ops_is_staff());
create policy "ops_sales_staff"      on ops_sales
  for all using (ops_is_staff()) with check (ops_is_staff());
create policy "ops_sale_items_staff" on ops_sale_items
  for all using (ops_is_staff()) with check (ops_is_staff());

-- Tighten the atomic-sale function to staff only.
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
  if not ops_is_staff() then
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

-- To add more staff later, run:
--   insert into ops_staff (email) values ('their-email@example.com');
