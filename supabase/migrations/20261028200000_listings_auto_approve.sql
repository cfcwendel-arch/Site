-- Anúncios dos clientes entram no ar na hora, sem aprovação (pedido do cliente). O admin
-- continua podendo recusar, pausar ou excluir pelo /admin.
create or replace function private.enforce_listing_status()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if private.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'approved';
    new.rejection_reason := null;
    new.views := 0;
    return new;
  end if;

  if new.status is distinct from old.status then
    if old.status = 'approved' and new.status in ('paused','sold') then
      null;
    elsif old.status in ('paused') and new.status = 'approved' then
      null;
    else
      raise exception 'not allowed to change listing status directly';
    end if;
  end if;

  new.rejection_reason := old.rejection_reason;
  new.views := old.views;
  new.advertiser_id := old.advertiser_id;
  return new;
end;
$function$;
