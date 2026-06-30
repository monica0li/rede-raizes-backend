# API Raízes do Nordeste

API para rede de lanchonetes com sistema de pedidos, estoque, fidelidade e pagamento.

## Tecnologias

- Node.js (v18+)
- TypeScript
- Express
- Prisma ORM
- SQLite
- JWT para autenticação
- Swagger/OpenAPI para documentação

## Requisitos

- Node.js (v18 ou superior)
- npm (ou yarn)
- Git

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/monica0li/rede-raizes-backend.git
cd rede-raizes-backend
```

2. Instale as dependências:
```bash
npm install
```

## Configuração

1. Copie o arquivo de exemplo das variáveis de ambiente:
```bash
cp .env.example .env
```

2. Configure as variáveis no arquivo `.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=3333
JWT_SECRET="sua-chave-secreta"
```

## Banco de dados

1. Execute as migrations para criar as tabelas:
```bash
npx prisma migrate dev
```

2. (Opcional) Popule o banco com dados iniciais:
```bash
npx prisma db seed
```

## Execução

Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

O servidor estará disponível em:
```
http://localhost:3333
```

## Documentação da API

A documentação interativa está disponível via Swagger:
```
http://localhost:3333/api-docs
```

## Endpoints principais

### Autenticação

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/auth/register` | Cadastrar usuário | Público |
| POST | `/auth/login` | Login | Público |

### Unidades

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/units` | Criar unidade | ADMIN |
| GET | `/units` | Listar unidades ativas | Público |
| GET | `/units/:id` | Buscar unidade por ID | Público |
| PUT | `/units/:id` | Atualizar unidade | ADMIN |
| DELETE | `/units/:id` | Inativar unidade | ADMIN |
| PATCH | `/units/:id/reactivate` | Reativar unidade | ADMIN |

### Produtos

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/products` | Criar produto | ADMIN |
| GET | `/products` | Listar produtos | Público |
| GET | `/products/:id` | Buscar produto por ID | Público |
| PUT | `/products/:id` | Atualizar produto | ADMIN |
| DELETE | `/products/:id` | Inativar produto | ADMIN |

### Estoque

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/stock/add` | Adicionar estoque | ADMIN |
| PUT | `/stock/:productId` | Atualizar estoque | ADMIN |
| GET | `/stock/:productId` | Consultar estoque | JWT |

### Pedidos

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/orders` | Criar pedido | JWT |
| GET | `/orders` | Listar pedidos | JWT |
| GET | `/orders/:id` | Buscar pedido por ID | JWT |
| PATCH | `/orders/:id/status` | Atualizar status | JWT |
| PATCH | `/orders/:id/cancel` | Cancelar pedido | JWT |

### Pagamentos

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/payments/process` | Processar pagamento (mock) | JWT |
| GET | `/payments/status/:orderId` | Consultar status do pagamento | JWT |

### Promoções

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/promotions` | Criar promoção | ADMIN |
| GET | `/promotions` | Listar todas promoções | ADMIN |
| GET | `/promotions/active` | Listar promoções ativas | Público |
| PUT | `/promotions/:id` | Atualizar promoção | ADMIN |
| DELETE | `/promotions/:id` | Inativar promoção | ADMIN |

### Fidelidade

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/loyalty/balance` | Consultar saldo de pontos | JWT |
| GET | `/loyalty/history` | Consultar histórico | JWT |

### Auditoria

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/audit-logs` | Listar logs | ADMIN |
| GET | `/audit-logs/order/:orderId` | Logs por pedido | ADMIN |
| GET | `/audit-logs/user/:userId` | Logs por usuário | ADMIN |

### Health

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/health` | Verificar status da API | Público |

## Usuários padrão (seed)

| Email | Senha | Role |
|-------|-------|------|
| `admin@raizes.com` | `Admin@123` | ADMIN |
| `cliente@teste.com` | `Cliente@123` | CLIENTE |

## Testes

A coleção Postman está disponível no repositório:
- Arquivo: `Raizes_Nordeste.postman_collection.json`

### Como executar os testes

1. Importe o arquivo `.json` no Postman
2. A coleção está organizada por pastas: Auth, Units, Products, Stock, Orders, Payments, Promotions, Loyalty, Audit
3. Execute as requisições na ordem sugerida:
   - Primeiro: Auth (cadastro e login)
   - Depois: os demais endpoints conforme necessário

### Cenários de teste incluídos

A coleção contempla cenários positivos e negativos:
- Login válido e inválido
- Criação de recursos com e sem permissão
- Validação de campos obrigatórios
- Estoque insuficiente
- Canal inválido
- Pagamento aprovado e recusado
- Logs de auditoria

## Estrutura do projeto

```
src/
├── application/
│   └── services/        # Regras de negócio
├── presentation/
│   ├── controllers/     # Controllers da API
│   ├── routes/          # Rotas
│   └── middlewares/     # Middlewares (auth, audit)
├── infrastructure/
│   └── config/          # Configurações (Prisma, Swagger)
├── domain/              # Entidades e enums
└── utils/               # Utilitários (hash, jwt)
```

## Segurança e LGPD

- Senhas armazenadas com hash (bcrypt)
- Autenticação via JWT
- Controle de acesso por roles (ADMIN, CLIENTE, ATENDENTE, COZINHA)
- Logs de auditoria para ações sensíveis
- Dados pessoais não expostos nas respostas da API

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar servidor em modo desenvolvimento |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor em produção |
| `npx prisma studio` | Abrir interface do banco de dados |
| `npx prisma migrate dev` | Criar/atualizar migrations |
| `npx prisma db seed` | Popular banco com dados iniciais |

## Licença

Projeto acadêmico - UNINTER