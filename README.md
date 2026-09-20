# AgroNegocia

Marketplace de compra e venda de máquinas agrícolas e veículos automotivos. Anunciantes
assinam um plano mensal para publicar anúncios; a AgroNegocia atua como intermediadora
(não vende diretamente) e modera todo o conteúdo publicado.

Desenvolvido por PMG Code.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row Level Security
- [Mercado Pago](https://www.mercadopago.com.br/developers) — assinaturas recorrentes (Preapproval)

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha as variáveis (veja abaixo).

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

## Variáveis de ambiente

| Variável | Onde encontrar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (**secreta**, nunca expor no cliente; usada apenas pelo webhook do Mercado Pago) |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago → Suas integrações → Credenciais |
| `MERCADOPAGO_WEBHOOK_SECRET` | Mercado Pago → Suas integrações → Webhooks → Assinatura secreta |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site em produção (ex: `https://agronegocia.com.br`) |

O banco de dados (Supabase) já foi provisionado e as migrations/políticas de segurança
(Row Level Security) já foram aplicadas ao projeto `agronegocia`.

## Como virar administrador

Não existe senha de admin "hardcoded" por segurança. Para acessar o `/admin`:

1. Acesse `/cadastro` e crie uma conta normalmente usando o e-mail **cfcwendel@hotmail.com**.
2. Um gatilho no banco de dados promove automaticamente esse e-mail para `role = admin`.
3. Faça login em `/entrar` — você será redirecionado para `/admin`.

Qualquer outro e-mail cadastrado vira `advertiser` (anunciante) por padrão.

## Configurando o Mercado Pago (assinaturas)

1. Crie uma aplicação em https://www.mercadopago.com.br/developers/panel.
2. Copie o **Access Token** de produção (ou teste) para `MERCADOPAGO_ACCESS_TOKEN`.
3. Configure uma URL de Webhook apontando para:
   `https://SEU_DOMINIO/api/mercadopago/webhook`
   — assinatura de eventos: `subscription_preapproval` e `subscription_authorized_payment`.
4. Copie a "Assinatura secreta" (chave usada para validar a assinatura do webhook) para
   `MERCADOPAGO_WEBHOOK_SECRET`.
5. Preencha `SUPABASE_SERVICE_ROLE_KEY` — o webhook usa esta chave (nunca exposta ao
   navegador) para ativar assinaturas e registrar pagamentos, contornando as políticas de
   RLS apenas nesse ponto controlado do servidor.

Sem essas três variáveis preenchidas em produção, o fluxo de "Assinar plano" e a ativação
automática de assinaturas não funcionam.

## Segurança

- Row Level Security (RLS) ativado em **todas** as tabelas: anunciantes só enxergam e
  editam os próprios anúncios/dados; o público só vê anúncios aprovados; o admin tem
  acesso total via uma função `is_admin()` isolada em um schema não exposto pela API.
- Mudança de status de anúncio (aprovado/recusado) só pode ser feita pelo admin — reforçado
  por trigger no banco, não apenas pela UI.
- Limite de anúncios por plano reforçado também no banco (não só no front).
- Rate limiting em login, cadastro, recuperação de senha e formulário de contato.
- Cabeçalhos de segurança (CSP, HSTS, X-Frame-Options, etc.) em `next.config.ts`.
- Upload de imagens validado por tipo/tamanho no cliente **e** na própria política do
  bucket do Supabase Storage.
- Webhook do Mercado Pago valida a assinatura HMAC antes de processar qualquer evento.
- Nenhuma chave secreta fica no código-fonte; tudo vem de variáveis de ambiente e
  `.env.local`/`.env.example` estão no `.gitignore` (exceto o `.env.example`, que não tem
  segredos reais).

## Deploy

O projeto é um app Next.js padrão — pode ser publicado em qualquer host compatível
(Vercel, Railway, etc.). Configure as variáveis de ambiente listadas acima no ambiente de
produção antes do deploy.
