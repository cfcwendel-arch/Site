-- O perfil passa a receber nome, empresa e telefone informados no cadastro.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, email, role, full_name, company_name, phone)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) in ('cfcwendel@hotmail.com', 'suporte.gabibmp@gmail.com') then 'admin'
      else 'advertiser'
    end,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), '')
  );
  return new;
end;
$function$;
