-- Espaços de publicidade (banners) + pagamento de assinatura via Pix.

-- 1) Banners de publicidade --------------------------------------------------
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  image_path text not null,
  link_url text check (link_url is null or link_url ~* '^https?://'),
  placement text not null check (placement in ('home', 'listing_side', 'listing_inline', 'listing_grid')),
  position integer not null default 0 check (position between 0 and 999),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index ads_placement_idx on public.ads (placement, active, position);

create trigger ads_set_updated_at
  before update on public.ads
  for each row execute function private.set_updated_at();

alter table public.ads enable row level security;

-- O público só enxerga banners ativos e dentro do período de veiculação.
create policy ads_public_select on public.ads
  for select to anon, authenticated
  using (
    (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
    or private.is_admin()
  );

create policy ads_admin_insert on public.ads
  for insert to authenticated with check (private.is_admin());
create policy ads_admin_update on public.ads
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy ads_admin_delete on public.ads
  for delete to authenticated using (private.is_admin());

-- Bucket público de imagens dos banners; só o admin envia/remove.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ad-images', 'ad-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy ad_images_storage_admin_select on storage.objects
  for select to authenticated using (bucket_id = 'ad-images' and private.is_admin());
create policy ad_images_storage_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'ad-images' and private.is_admin());
create policy ad_images_storage_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'ad-images' and private.is_admin());
create policy ad_images_storage_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'ad-images' and private.is_admin());

-- 2) Pix -----------------------------------------------------------------------
-- Pix não é recorrente: cada pagamento aprovado libera 1 mês. Esta função é chamada só
-- pelo servidor (service_role) depois de confirmar o pagamento direto na API do
-- Mercado Pago, e é idempotente: o mesmo pagamento nunca estende o período duas vezes.
create or replace function public.apply_pix_payment(
  p_subscription_id uuid,
  p_payment_id text,
  p_amount_cents integer,
  p_status text,
  p_raw jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_status text;
begin
  perform pg_advisory_xact_lock(hashtext('pix:' || p_payment_id));

  select status into v_previous_status
  from public.payments
  where mercadopago_payment_id = p_payment_id;

  insert into public.payments (subscription_id, mercadopago_payment_id, amount_cents, status, raw)
  values (p_subscription_id, p_payment_id, p_amount_cents, p_status, p_raw)
  on conflict (mercadopago_payment_id) do update
    set status = excluded.status, amount_cents = excluded.amount_cents, raw = excluded.raw;

  if p_status = 'approved' and v_previous_status is distinct from 'approved' then
    update public.subscriptions
    set status = 'active',
        current_period_end = greatest(coalesce(current_period_end, now()), now()) + interval '1 month'
    where id = p_subscription_id;
  end if;
end;
$$;

revoke execute on function public.apply_pix_payment(uuid, text, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.apply_pix_payment(uuid, text, integer, text, jsonb) to service_role;

-- Assinaturas pagas por Pix (sem preapproval) vencem no fim do período pago
-- (com 3 dias de tolerância); depois disso não dá pra publicar novos anúncios até renovar.
create or replace function private.enforce_listing_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_listings integer;
  v_current_count integer;
begin
  if private.is_admin() then
    return new;
  end if;

  select p.max_listings into v_max_listings
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.advertiser_id = new.advertiser_id
    and s.status = 'active'
    and (
      s.mercadopago_preapproval_id is not null
      or s.current_period_end is null
      or s.current_period_end + interval '3 days' > now()
    )
  order by s.created_at desc
  limit 1;

  if v_max_listings is null then
    raise exception 'no_active_subscription' using hint = 'Assine um plano para publicar anúncios.';
  end if;

  select count(*) into v_current_count
  from public.listings
  where advertiser_id = new.advertiser_id
    and status in ('pending_review','approved','paused');

  if v_current_count >= v_max_listings then
    raise exception 'plan_limit_reached' using hint = 'Limite de anúncios do seu plano atingido.';
  end if;

  return new;
end;
$$;
