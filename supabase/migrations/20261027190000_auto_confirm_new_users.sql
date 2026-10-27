-- Cadastro sem confirmação de e-mail (pedido do cliente): a conta nasce confirmada e o
-- anunciante entra na hora.
create or replace function private.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

create or replace trigger auto_confirm_user
  before insert on auth.users
  for each row execute function private.auto_confirm_user();
