-- 30 dias grátis automáticos no cadastro (plano Destaque) e vídeos nos anúncios.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_role text;
  v_plan uuid;
begin
  v_role := case
    when lower(new.email) in ('cfcwendel@hotmail.com', 'suporte.gabibmp@gmail.com') then 'admin'
    else 'advertiser'
  end;

  insert into public.profiles (id, email, role, full_name, company_name, phone)
  values (
    new.id,
    new.email,
    v_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), '')
  );

  if v_role = 'advertiser' then
    select id into v_plan from public.plans where slug = 'profissional' and active;
    if v_plan is null then
      select id into v_plan from public.plans where active order by max_listings desc limit 1;
    end if;
    if v_plan is not null then
      insert into public.subscriptions (advertiser_id, plan_id, status, is_trial, current_period_end)
      values (new.id, v_plan, 'active', true, now() + interval '30 days');
    end if;
  end if;

  return new;
end;
$function$;

alter table public.listings add column if not exists video_paths text[] not null default '{}';
