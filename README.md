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

## Publicidade (banners)

O admin gerencia os banners em **/admin/publicidade** — incluir, pausar, reordenar ou
excluir um banner não exige mexer no código. Espaços disponíveis:

| Espaço | Onde aparece | Qtd. exibida |
| --- | --- | --- |
| `home` | Vitrine logo abaixo do topo da página inicial | até 20 |
| `listing_side` | Página do produto, ao lado das fotos | até 2 |
| `listing_inline` | Página do produto, faixa entre as fotos e a descrição | 1 |
| `listing_grid` | Lista de anúncios, um banner a cada 4 produtos | até 3 |

Todo banner aparece com a etiqueta **“Publicidade”** e borda própria, para não se
confundir com os anúncios dos clientes. Cada banner pode ter link e período de veiculação
(início/fim); fora do período ele some sozinho. As imagens ficam no bucket `ad-images`.

## Pagamento via Pix

Além da assinatura recorrente no cartão, o anunciante pode pagar com **Pix** em
`/painel/assinatura`: o site gera o QR Code / Pix Copia e Cola pelo Mercado Pago (mesmo
`MERCADOPAGO_ACCESS_TOKEN`), e cada Pix aprovado libera **1 mês** do plano. A confirmação
chega pelo mesmo webhook (`/api/mercadopago/webhook`, evento `payment`) e a tela do QR Code
também confere o status sozinha. Para renovar, o anunciante gera um novo Pix na mesma tela.
Vencido o período (com 3 dias de tolerância), não dá pra publicar novos anúncios até renovar.

A conta do Mercado Pago precisa ter uma **chave Pix cadastrada** para gerar cobranças Pix.

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
