-- Primeiro mês de anúncio grátis: cada anunciante pode ativar 1 mês grátis, uma única vez,
-- se nunca teve assinatura. A assinatura de teste não tem preapproval, então vence no fim
-- do período como as pagas por Pix (enforce_listing_quota) e é renovada pelo Pix/cartão.

alter table public.subscriptions add column if not exists is_trial boolean not null default false;

create or replace function public.start_free_trial(p_plan_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.plans where id = p_plan_id and active) then
    raise exception 'invalid_plan';
  end if;

  -- Serializa por usuário para não criar dois testes em cliques simultâneos.
  perform pg_advisory_xact_lock(hashtext('trial:' || auth.uid()::text));

  if exists (select 1 from public.subscriptions where advertiser_id = auth.uid()) then
    raise exception 'trial_not_eligible';
  end if;

  insert into public.subscriptions (advertiser_id, plan_id, status, is_trial, current_period_end)
  values (auth.uid(), p_plan_id, 'active', true, now() + interval '1 month')
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.start_free_trial(uuid) from public, anon;
grant execute on function public.start_free_trial(uuid) to authenticated;
