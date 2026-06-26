# GIRA — Sistema de Gestão de Chamados

Sistema web para abertura e acompanhamento de chamados de manutenção predial e de equipamentos. Cada chamado recebe número, status, responsável e histórico completo, do registro até a resolução.

> Projeto da Avaliação N3 de Segurança da Informação — Prof. Edson Vaz Lopes, Católica SC.
> Foco em funcionamento e controles de segurança: acesso por perfil (RBAC), senha em hash, validação no servidor e auditoria das ações.

## Integrantes

- Anttonio Osório Molinaro Maccagnini
- Gabriel Lengert Guedes
- João Pedro Alves de Lima
- João Vitor Paranhos
- Rafael Alexandre Alves Bandoch

---

## Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 19 + Vite (SPA) |
| **Backend** | Node.js + Express |
| **Banco de dados** | MySQL (conexão direta via `mysql2`) |
| **Autenticação** | JWT armazenado em cookie `httpOnly` |
| **Hash de senhas** | `bcrypt` (salt rounds: 10) |
| **Validação** | `zod` (server-side) |
| **Segurança HTTP** | `helmet`, `cors`, `xss-clean`, `express-rate-limit` |

---

## Perfis de Acesso

### Solicitante
- Abre chamados
- Visualiza **apenas os próprios chamados**
- Pode cancelar seus próprios chamados
- Pode adicionar observações nos seus chamados

### Técnico
- Visualiza todos os chamados atribuídos a ele
- Altera status dos chamados
- Registra observações e histórico de atendimento

### Administrador
- Gerencia usuários (CRUD completo)
- Visualiza **todos** os chamados do sistema
- Atribui técnicos responsáveis a chamados
- Acessa os logs de auditoria
- Pode criar chamados

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **MySQL** 8+ instalado e rodando localmente
- Um banco de dados criado no MySQL (ex.: `gira_db`)

---

## Como Executar Localmente

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd Sistema-de-chamados
```

### 2. Configurar variáveis de ambiente

O projeto usa um único arquivo `.env` na raiz, lido tanto pelo backend quanto pela configuração de build do frontend.

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do MySQL local:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=gira_db
PORT=3000
JWT_SECRET=troque_por_uma_chave_secreta_longa_e_aleatoria
FRONTEND_URL=http://localhost:5173
```

> ⚠️ O arquivo `.env` **nunca deve ser commitado**. Ele já está no `.gitignore`.

### 3. Criar o banco de dados no MySQL

Antes de rodar as migrações, o banco precisa existir. Execute no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS gira_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Instalar dependências e configurar o backend

```bash
cd backend
npm install
```

#### 4.1 Rodar as migrações (criação das tabelas)

```bash
npm run migrate
```

Isso cria as tabelas: `users`, `tickets`, `ticket_history`, `audit_logs` e `token_blacklist`.

#### 4.2 Popular o banco com usuários de teste

```bash
npm run seed
```

#### 4.3 Iniciar o servidor backend

```bash
npm run dev
```

A API ficará disponível em: `http://localhost:3000`

### 5. Instalar dependências e iniciar o frontend

Abra um **novo terminal** na raiz do projeto:

```bash
cd Sistema-de-chamados   # raiz do projeto (onde está o package.json do frontend)
npm install
npm run dev
```

O frontend ficará disponível em: `http://localhost:5173`

---

## Usuários de Teste

Criados automaticamente pelo `npm run seed` (executado dentro de `backend/`):

| Nome | E-mail | Senha | Perfil |
|---|---|---|---|
| Admin Supremo | `admin@gira.com` | `123` | `admin` |
| Técnico Especialista | `tecnico@gira.com` | `123` | `tecnico` |
| Solicitante Comum | `solicitante@gira.com` | `123` | `solicitante` |

> As senhas são armazenadas com **hash bcrypt** (salt rounds: 10). A senha `123` nunca fica em texto plano no banco.

---

## API — Endpoints

Base URL: `http://localhost:3000/api`

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/auth/login` | Login (retorna JWT em cookie httpOnly) | Público |
| `POST` | `/auth/logout` | Logout (invalida o cookie) | Autenticado |
| `GET` | `/auth/me` | Retorna dados do usuário logado | Autenticado |

### Chamados (`/api/tickets`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/tickets` | Criar chamado | solicitante, admin |
| `GET` | `/tickets` | Listar chamados (filtrado por perfil) | Autenticado |
| `GET` | `/tickets/:id` | Detalhe de um chamado | Autenticado |
| `PUT` | `/tickets/:id` | Atualizar chamado | solicitante, tecnico, admin |
| `DELETE` | `/tickets/:id` | Cancelar chamado | solicitante (próprio) |
| `POST` | `/tickets/:id/history` | Adicionar observação/histórico | Autenticado |

### Usuários (`/api/users`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/users` | Listar usuários | **admin** |
| `POST` | `/users` | Criar usuário | **admin** |
| `PUT` | `/users/:id` | Editar usuário | **admin** |
| `DELETE` | `/users/:id` | Excluir usuário | **admin** |

### Auditoria (`/api/audit`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/audit` | Listar logs de auditoria | **admin** |

---

## Controles de Segurança Implementados

| Controle | Descrição |
|---|---|
| **Hash de senhas** | `bcrypt` com salt rounds 10 — senhas nunca salvas em texto plano |
| **JWT httpOnly** | Token de sessão em cookie `httpOnly`, invisível ao JavaScript do browser |
| **RBAC** | Middleware `requireRole` bloqueia rotas por perfil; retorna `403 Forbidden` |
| **Autorização por dono** | Solicitante só acessa/cancela os próprios chamados |
| **Validação server-side** | Todos os inputs validados com `zod` antes de chegar ao banco |
| **Helmet** | Adiciona cabeçalhos HTTP de segurança (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS restrito** | Somente a origem do frontend (`FRONTEND_URL`) é aceita |
| **Rate limiting** | 100 req/15min geral; 5 tentativas de login/15min por IP |
| **XSS-clean** | Sanitiza inputs para prevenir ataques Stored XSS |
| **Logs de auditoria** | Tabela `audit_logs` registra ação, usuário, IP e timestamp |
| **Token blacklist** | Tokens invalidados no logout são armazenados para não reutilização |

### Exemplo de ação bloqueada por falta de permissão

Tentar acessar `GET /api/users` ou `GET /api/audit` com um usuário de perfil **solicitante** ou **técnico** retorna:

```json
HTTP 403 Forbidden
{ "message": "Acesso negado. Perfil sem permissão." }
```

---


## Backup e Restauração (Plano Inicial)

### Backup do banco de dados

```bash
# Exportar o banco completo
mysqldump -u root -p gira_db > backup_gira_$(date +%Y%m%d).sql
```

### Restauração

```bash
# Criar o banco (se necessário)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gira_db;"

# Importar o backup
mysql -u root -p gira_db < backup_gira_YYYYMMDD.sql
```

