# Plano do Ecommerce - Teclados e Periféricos

## Visão Geral
Ecommerce para venda de teclados e periféricos no mercado brasileiro.
Primeira versão: funcionalidades essenciais para lançamento rápido.

## Stack Tecnológica

### Frontend
- **React + Vite** (SPA)
- **TypeScript**
- **Tailwind CSS** (estilização)
- **React Router** (navegação)
- **Zustand** (gerenciamento de estado)

### Backend
- **Fastify** (API REST)
- **TypeScript**
- **Prisma** (ORM)
- **Supabase** (PostgreSQL + Auth + Storage)

### Infraestrutura
- **Vercel** (deploy do frontend)
- **Railway/Fly.io** (deploy do backend Fastify)
- **Supabase** (banco de dados + auth + storage para imagens)

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   Supabase      │
│   React + Vite  │     │   Fastify       │     │   PostgreSQL    │
│   (Vercel)      │     │   (Railway)     │     │   Auth + Storage│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Modelagem de Dados

### Tabelas Principais

#### users (Supabase Auth)
- id (uuid, PK)
- email
- created_at

#### profiles
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- full_name
- phone
- created_at

#### addresses
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- street
- number
- complement
- neighborhood
- city
- state (UF)
- zip_code
- is_default (boolean)

#### categories
- id (uuid, PK)
- name
- slug
- description
- image_url

#### products
- id (uuid, PK)
- name
- slug
- description
- price (decimal)
- category_id (uuid, FK -> categories)
- image_url
- created_at

#### product_variations
- id (uuid, PK)
- product_id (uuid, FK -> products)
- name (ex: "Switch Blue", "Cor Preto")
- sku
- price_override (decimal, opcional - se diferente do produto base)
- stock_quantity (integer)
- attributes (jsonb) - ex: {"switch": "Blue", "color": "Black"}

#### orders
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- status (enum: pending, paid, shipped, delivered, cancelled)
- total (decimal)
- shipping_address_id (uuid, FK -> addresses)
- payment_method (enum: stripe, pix)
- payment_id (string)
- created_at

#### order_items
- id (uuid, PK)
- order_id (uuid, FK -> orders)
- product_id (uuid, FK -> products)
- variation_id (uuid, FK -> product_variations, opcional)
- quantity (integer)
- unit_price (decimal)

## Funcionalidades por Módulo

### 1. Catálogo de Produtos (Público)
- [ ] Listar produtos por categoria
- [ ] Buscar produtos
- [ ] Ver detalhes do produto
- [ ] Ver variações disponíveis
- [ ] Página de produto individual

### 2. Carrinho de Compras
- [ ] Adicionar produto ao carrinho
- [ ] Selecionar variação
- [ ] Alterar quantidade
- [ ] Remover item
- [ ] Calcular frete (Correios)
- [ ] Salvar carrinho no localStorage + sincronizar com conta

### 3. Autenticação (Supabase Auth)
- [ ] Cadastro com email/senha
- [ ] Login com email/senha
- [ ] Login com Google (OAuth)
- [ ] Esqueci minha senha
- [ ] Perfil do usuário

### 4. Checkout
- [ ] Selecionar/criar endereço de entrega
- [ ] Calcular frete por CEP
- [ ] Escolher forma de pagamento (Stripe/PIX)
- [ ] Finalizar pedido
- [ ] Tela de confirmação

### 5. Pagamentos
- **Stripe (Cartão de crédito/débito)**
  - [ ] Criar sessão de pagamento
  - [ ] Webhook para confirmar pagamento
  - [ ] Tratar falha no pagamento
  
- **PIX**
  - [ ] Gerar payload PIX via Stripe
  - [ ] QR Code para pagamento
  - [ ] Webhook para confirmar pagamento
  - [ ] Expiração do PIX (15-30 min)

### 6. Pedidos (Usuário)
- [ ] Listar meus pedidos
- [ ] Ver detalhes do pedido
- [ ] Status do pedido

### 7. Painel Admin (Básico)
- [ ] Login admin (mesmo Supabase, com role)
- [ ] Listar/editar produtos
- [ ] Criar novos produtos
- [ ] Gerenciar variações
- [ ] Listar pedidos
- [ ] Atualizar status do pedido
- [ ] Dashboard básico (pedidos hoje, faturamento)

### 8. Frete (Correios)
- [ ] Consultar frete por CEP
- [ ] Exibir prazo e valor
- [ ] Calcular total com frete

## Fluxos Principais

### Fluxo de Compra
```
1. Usuário navega no catálogo
2. Seleciona produto
3. Escolhe variação (se houver)
4. Adiciona ao carrinho
5. Vai para o carrinho
6. Informa CEP para frete
7. Escolhe pagamento (Stripe/PIX)
8. Finaliza pedido
9. Redireciona para pagamento
10. Pagamento confirmado → Pedido criado
11. Tela de confirmação
```

### Fluxo Admin
```
1. Admin faz login
2. Acessa painel
3. Gerencia produtos (CRUD)
4. Visualiza pedidos
5. Atualiza status do pedido
```

## Estrutura de Pastas

```
ecommerce-teclados/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas/Pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand store
│   │   ├── services/        # Chamadas API
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Funções utilitárias
│   └── public/
│
├── backend/                  # Fastify
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── services/        # Serviços externos
│   │   ├── prisma/          # Schema e migrations
│   │   └── utils/           # Funções utilitárias
│   └── prisma/
│       └── schema.prisma
│
└── supabase/                 # Configurações Supabase
    ├── migrations/
    └── seed.sql
```

## Endpoints da API (Principais)

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:slug` - Buscar produto por slug
- `GET /api/categories` - Listar categorias

### Carrinho
- `POST /api/cart/calculate` - Calcular frete

### Usuário
- `POST /api/auth/register` - Cadastrar
- `POST /api/auth/login` - Login (via Supabase)

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar pedidos do usuário
- `GET /api/orders/:id` - Detalhes do pedido

### Pagamento
- `POST /api/payments/stripe` - Criar sessão Stripe
- `POST /api/payments/pix` - Gerar PIX
- `POST /api/webhooks/stripe` - Webhook Stripe

### Admin
- `GET /api/admin/products` - Listar produtos (admin)
- `POST /api/admin/products` - Criar produto
- `PUT /api/admin/products/:id` - Atualizar produto
- `DELETE /api/admin/products/:id` - Deletar produto
- `GET /api/admin/orders` - Listar pedidos (admin)
- `PATCH /api/admin/orders/:id/status` - Atualizar status

## Prioridades de Desenvolvimento (Ordem)

### Fase 1: Fundação (Semana 1)
1. Setup do projeto (frontend + backend)
2. Configurar Supabase (banco + auth)
3. Modelagem de dados (Prisma schema)
4. CRUD básico de produtos

### Fase 2: Catálogo (Semana 2)
5. Páginas de produto
6. Listagem de produtos
7. Busca de produtos

### Fase 3: Carrinho + Checkout (Semana 3)
8. Carrinho de compras
9. Cálculo de frete (Correios)
10. Fluxo de checkout

### Fase 4: Pagamentos (Semana 4)
11. Integração Stripe (cartão)
12. Integração PIX
13. Webhooks

### Fase 5: Admin (Semana 5)
14. Painel administrativo
15. Gerenciamento de produtos
16. Gerenciamento de pedidos

### Fase 6: Polish (Semana 6)
17. Tratamento de erros
18. Loading states
19. Validações
20. Deploy final

## Decisões Técnicas

### Por que Supabase?
- PostgreSQL gerenciado
- Auth pronto (login, OAuth, JWT)
- Storage para imagens de produto
- Realtime (para updates de pedido no futuro)
- Dashboard para gerenciar dados

### Por que Fastify separado?
- Controle total da API
- Melhor performance que Express
- Fácil de deployar em Railway/Fly.io
- Pode escalar independente do frontend

### Por que React + Vite (não Next.js)?
- SPA é suficiente para ecommerce
- Vite é mais rápido para desenvolvimento
- Deploy mais simples na Vercel
- Menos complexidade para V1

## Próximos Passos Imediatos

1. Criar conta no Supabase e configurar projeto
2. Criar conta no Stripe (modo teste)
3. Inicializar projeto frontend (Vite + React + TS)
4. Inicializar projeto backend (Fastify + TS + Prisma)
5. Configurar ambiente de desenvolvimento
6. Criar schema do Prisma
7. Rodar migrations
8. Começar CRUD de produtos
