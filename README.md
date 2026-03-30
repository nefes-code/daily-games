# Daily Games — NEFES

Hub centralizado para registrar e acompanhar os resultados dos jogos diários jogados pelos membros do NEFES. A ideia é simples: cada dia, quem jogou entra na plataforma, registra seu resultado, e pode ver como se saiu em relação aos outros.

## O que o projeto faz

- Cadastro de jogos com suporte a dois modos: **competitivo** (cada jogador tem sua própria pontuação, do melhor para o pior) e **cooperativo** (o grupo todo ganha ou perde junto)
- Registro de resultados diários por jogador, com suporte a múltiplas rodadas por sessão
- Leaderboard diário com pódio visual para os três primeiros colocados
- Histórico de resultados por jogo
- Autenticação via Google OAuth — apenas contas previamente cadastradas por um admin podem acessar
- Painel de administração para gerenciar jogos, resultados e usuários
- Interface responsiva, funciona bem em mobile e desktop

## Stack

- **Next.js 16** com App Router
- **React 19** e **Chakra UI v3**
- **Auth.js (NextAuth v5)** com provedor Google e sessão JWT
- **Drizzle ORM** com **PostgreSQL**
- **TanStack Query v5** para gerenciamento de estado assíncrono no cliente

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Uma instância PostgreSQL acessível (local ou remota)
- Uma credencial OAuth do Google configurada no [Google Cloud Console](https://console.cloud.google.com/)

### Instalação

```bash
git clone <url-do-repositorio>
cd daily-games
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/daily-games

AUTH_SECRET=uma-string-aleatoria-longa
AUTH_GOOGLE_ID=seu-client-id-do-google
AUTH_GOOGLE_SECRET=seu-client-secret-do-google

ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=senha-do-painel-admin
```

`ADMIN_EMAIL` e `ADMIN_PASSWORD` são as credenciais de acesso ao painel `/admin`, que é protegido por autenticação básica separada da autenticação Google.

### Banco de dados

Execute as migrações para criar as tabelas:

```bash
npm run db:migrate
```

Se quiser visualizar e editar os dados diretamente via interface web:

```bash
npm run db:studio
```

### Rodando o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura relevante

```
src/
  app/          # Rotas e páginas (App Router)
  components/   # Componentes de UI
  lib/          # Configurações centrais (auth, db, schema)
  services/     # Camada de acesso a dados via React Query
  utils/        # Utilitários de UI
```

## Acesso

O login é feito via Google. Contas novas que tentam logar são registradas automaticamente, mas o acesso à aplicação depende de o admin ativar a conta no painel. O painel de administração fica em `/admin` e requer as credenciais definidas nas variáveis de ambiente.
