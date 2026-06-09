# GIRA

Sistema de Gestão de Chamados de Manutenção — abre e acompanha chamados de manutenção predial e de equipamentos. Cada chamado ganha número, status, responsável e histórico, do registro até a resolução.

Projeto da Avaliação N3 de Segurança da Informação (Prof. Edson Vaz Lopes, Católica SC), com foco no funcionamento e nos controles de segurança: acesso por perfil, senha em hash, validação no servidor e auditoria das ações.

## Integrantes

- Anttonio Osório Molinaro Maccagnini
- Gabriel Lengert Guedes
- João Pedro Alves de Lima
- João Vitor Paranhos
- Rafael Alexandre Alves Bandoch

## Stack

- **Frontend:** React + Vite (SPA, na raiz)
- **Backend:** Node + Express, em `backend/`
- **Banco:** MySQL (via `mysql2`), provisionado por Docker
- **Auth:** JWT em cookie `httpOnly`
- **Segurança:** `bcrypt` nas senhas e `zod` na validação do servidor

## Perfis

### Solicitante
- Abre chamados
- Vê apenas os próprios chamados

### Técnico
- Atende os chamados atribuídos
- Altera status
- Registra observações

### Administrador
- Gerencia usuários
- Atribui responsáveis
- Visualiza todos os chamados
- Acessa os logs de auditoria

## Como rodar

Pré-requisitos:
- Node.js 18+

### 1. Banco de dados (MySQL em localhost:3307)

```bash
docker compose up -d
```

### 2. Backend (API em localhost:3000)

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

### 3. Frontend (localhost:5173)

```bash
npm install
npm run dev
```

## API

A API responde em:

- `/api`
- `/api/auth`
- `/api/tickets`
- `/api/users`
- `/api/audit`

## Configuração

As variáveis de ambiente ficam em:

```text
.env
```

Esse arquivo não deve ser versionado.

O modelo de configuração está em:

```text
.env.example
```

## Usuários de teste

Os usuários de teste são criados através do comando:

```bash
npm run seed
```

Será criado um usuário para cada perfil do sistema.

## Status

Em desenvolvimento para os checkpoints da N3.

Próximas etapas:

- CRUD completo de chamados
- Logs de auditoria
- Relatório técnico final
