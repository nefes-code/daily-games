# DailyGames — Plano de Comercialização SaaS

> Hub centralizado para registrar e acompanhar resultados de jogos diários entre amigos, times e empresas.

---

## Visão geral

Transformar o projeto atual (single-tenant, branding fixo "NeFEs") em um SaaS multi-tenant freemium onde qualquer grupo pode criar seu próprio workspace, personalizar e convidar membros — com monetização via planos.

### Por que SaaS e não venda de licença?

- Receita recorrente (MRR) e previsível
- Controle total da infra, atualizações automáticas
- Suporte simplificado (uma versão, um ambiente)
- Barreira de entrada zero para o cliente (basta criar conta)

### Diferenciais competitivos

- Daily word games (Wordle, Connections, etc.) são extremamente populares e **não existe um hub social bom** para trackear resultados entre amigos
- UX polida com pódio visual, reactions, multi-round
- Dois modos de jogo (competitivo e cooperativo) cobrem desde jogos de score individual até desafios em grupo
- Stack moderna e performática (Next.js 16, React 19, Drizzle ORM)

---

## Modelo de negócio: Freemium com upsell

|                | **Free**                          | **Pro** (~R$29/mês)              |
| -------------- | --------------------------------- | -------------------------------- |
| Membros        | 5                                 | 25                               |
| Jogos ativos   | 3                                 | Ilimitados                       |
| Leaderboard    | 7 dias                            | 30 dias + histórico completo     |
| Personalização | Não                               | Logo, cor primária, nome do time |
| Convites       | Email manual                      | Link de convite com auto-join    |
| Branding       | "Powered by DailyGames" no rodapé | Sem branding forçado             |

### Estratégia de aquisição

- **Plano Free é a máquina de crescimento**: o "Powered by DailyGames" visível no rodapé gera tráfego orgânico
- **Upsell natural**: acontece quando o grupo cresce além de 5 membros ou quer personalizar
- **Viralidade embutida**: leaderboards compartilháveis atraem novos grupos
- **Email digest**: "Fulano jogou hoje, você ainda não!" gera retenção diária

---

## Diagnóstico do estado atual

### O que precisa mudar

O projeto é **100% single-tenant**:

- Não existe conceito de workspace ou organização
- Branding "NeFEs" hardcoded em múltiplos pontos do código
- Admin usa PIN global via env var (`ADMIN_PIN`) com HMAC token em cookie — não baseado em roles
- Todos os jogos e resultados vivem no mesmo espaço sem isolamento algum

### Pontos de branding hardcoded que precisam ser dinamizados

| Arquivo                                                   | O que tem hardcoded                                     |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `src/app/layout.tsx`                                      | `title: "NeFEs - Hub de Jogos Diários"`                 |
| `src/components/LoginModal/index.tsx`                     | Logo NeFEs + texto "membro da NeFEs!"                   |
| `src/components/DashboardShell/index.tsx`                 | `<NefesLogo />` na topbar mobile                        |
| `src/components/Sidebar/index.tsx`                        | `<NefesLogo />` no topo da sidebar                      |
| `src/components/GamePage/components/PodiumCard/index.tsx` | Importa e usa `<NefesLogo />`                           |
| `src/app/api/games/[slug]/leaderboard/route.ts`           | `name: "NeFEs"` hardcoded no modo cooperativo           |
| `src/theme.ts`                                            | Cor primária `#F5A605` fixa no sistema de tokens Chakra |
| `src/styles/global.css`                                   | Cor `#F5A605` fixa no `::selection`                     |
| `src/components/NefesLogo/index.tsx`                      | Componente inteiro é branding fixo                      |

### Schema atual (tabelas relevantes)

```
User        (id, name, email, image, active, createdAt)
Game        (id, slug, name, url, type, resultType, resultSuffix, resultMax,
             lowerIsBetter, icon, resultRounds, position, active, createdAt)
GameResult  (id, value, playedAt, createdAt, gameId, userId, registeredById, round, status)
ResultReaction (id, emoji, resultId, userId)
```

Nenhuma tabela tem conceito de workspace. Tudo é global.

### Auth atual

- NextAuth v5 com Google OAuth
- Sessão JWT — `token.userId` injetado no callback
- Admin separado com PIN via `src/lib/admin-auth.ts`: env var `ADMIN_PIN` + HMAC `ADMIN_SECRET` em cookie

---

## Implementação — 5 Fases

### Fase 1: Multi-tenancy ⚠️ (pré-requisito para tudo)

**Objetivo**: Isolar dados por workspace para que múltiplos grupos coexistam no mesmo banco.

#### Novas tabelas (Drizzle)

```ts
export const workspaces = pgTable("Workspace", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  primaryColor: text("primaryColor"),
  plan: text("plan").notNull().default("FREE"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const workspaceMembers = pgTable(
  "WorkspaceMember",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("MEMBER"), // OWNER | ADMIN | MEMBER
    joinedAt: timestamp("joinedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.workspaceId, t.userId)],
);
```

#### Alterações em tabelas existentes

```ts
// Adicionar em games e gameResults:
workspaceId: text("workspaceId").notNull().references(() => workspaces.id),
```

#### Migration para dados existentes

1. Criar workspace "NeFEs" com slug `nefes`
2. Associar todos os `Game` e `GameResult` existentes a esse workspace
3. Criar `WorkspaceMember` para todos os `User` existentes (owner e members conforme necessário)

#### O que muda no código

- **Todas as queries** em `src/app/api/` devem filtrar por `workspaceId`
- **Sessão JWT** em `src/lib/auth.ts` deve incluir `workspaceId` ativo e `role` do membro
- **Schema Drizzle** em `src/lib/schema.ts` recebe as novas tabelas e relações
- **Services** em `src/services/` passam `workspaceId` em todos os requests

#### Decisão arquitetural

- **Schema compartilhado** (todos os workspaces no mesmo banco, filtrado por `workspaceId`) — suficiente até milhares de workspaces
- **Path-based routing** (`app.dailygames.com.br/w/{slug}/...`) no MVP — subdomínios são complexidade desnecessária por agora

---

### Fase 2: Onboarding & Convites

**Objetivo**: Permitir que qualquer pessoa crie um workspace e convide membros via link.

#### Fluxo de onboarding

1. Usuário faz login com Google
2. Se não pertence a nenhum workspace → tela de "Criar workspace" ou "Inserir código de convite"
3. Ao criar: vira OWNER, escolhe nome e slug
4. Redirecionado para o dashboard do workspace

#### Nova tabela

```ts
export const workspaceInvites = pgTable("WorkspaceInvite", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdById: text("createdById")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expiresAt", { mode: "date" }),
  maxUses: integer("maxUses"),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
```

#### Fluxo de convite

1. OWNER ou ADMIN gera link no painel
2. Link: `app.dailygames.com.br/invite/{token}`
3. Pessoa clica → Google login → auto-join no workspace
4. Se workspace Free já tem 5 membros → mensagem de limite com CTA de upgrade

#### Telas novas

- **Criar workspace** (nome, slug, prévia do link)
- **Gerenciar membros** (listar, remover, alterar role)
- **Convites** (gerar link, ver ativos, revogar)

---

### Fase 3: Personalização & Branding dinâmico

**Objetivo**: Substituir todo branding hardcoded por dados vindos do workspace ativo.

#### Cor primária dinâmica

- Lê `workspace.primaryColor` e injeta como CSS variable `--brand-primary` no root
- Substituir os tokens fixos `#F5A605` em `src/theme.ts` e `src/styles/global.css` por referências à variável

#### Logo dinâmico

- Novo componente `WorkspaceLogo` que renderiza `workspace.logo` (URL de imagem) ou fallback com iniciais do nome
- Substituir todas as ocorrências de `<NefesLogo />` em DashboardShell, Sidebar, LoginModal e PodiumCard

#### Nome dinâmico

- Substituir "NeFEs" hardcoded pelo `workspace.name` em todos os textos
- Incluir o `name: "NeFEs"` na rota de leaderboard cooperativo (`src/app/api/games/[slug]/leaderboard/route.ts`)
- Título da página em `src/app/layout.tsx` passa a ser `"{workspace.name} - Jogos Diários"`

#### Upload de logo

- Endpoint `POST /api/workspace/logo` com upload para Cloudflare R2 (mais barato que S3 e sem custo de egress)
- URL salva em `workspace.logo`

#### "Powered by DailyGames"

- Componente fixo no rodapé para workspaces Free, com link para a landing page
- Removido automaticamente para workspaces Pro

---

### Fase 4: Admin baseado em roles

**Objetivo**: Eliminar o admin com PIN e integrar o controle de acesso ao sistema de roles do workspace.

#### O que muda

1. **Remover** `src/lib/admin-auth.ts` (lógica de PIN + HMAC)
2. **Integrar** as funcionalidades de admin ao dashboard do workspace, acessíveis por OWNER e ADMIN
3. **Adicionar middleware de autorização** que checa `role` do `WorkspaceMember` antes de cada operação administrativa
4. **Remover** variáveis de ambiente `ADMIN_PIN` e `ADMIN_SECRET`

#### Permissões por role

| Ação                    | MEMBER | ADMIN | OWNER |
| ----------------------- | ------ | ----- | ----- |
| Ver jogos e leaderboard | ✅     | ✅    | ✅    |
| Registrar resultado     | ✅     | ✅    | ✅    |
| Reagir a resultado      | ✅     | ✅    | ✅    |
| Criar / editar jogos    | ❌     | ✅    | ✅    |
| Gerenciar membros       | ❌     | ✅    | ✅    |
| Gerar convites          | ❌     | ✅    | ✅    |
| Personalizar branding   | ❌     | ❌    | ✅    |
| Alterar plano / billing | ❌     | ❌    | ✅    |
| Deletar workspace       | ❌     | ❌    | ✅    |

---

### Fase 5: Billing & Enforcement de limites

**Objetivo**: Cobrar pelo plano Pro com cobrança recorrente e bloquear limites do Free.

#### Provedor recomendado: Lemon Squeezy

- Mais simples que Stripe para começar
- Cuida de impostos automaticamente (importante para vendas no Brasil e internacionais)
- Webhooks para eventos de subscription
- Alternativa: Stripe (mais flexível, mais complexo, exige mais configuração fiscal)

#### Nova tabela

```ts
export const subscriptions = pgTable("Subscription", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspaceId")
    .notNull()
    .unique()
    .references(() => workspaces.id),
  externalId: text("externalId").notNull(), // ID do Lemon Squeezy
  plan: text("plan").notNull(), // FREE | PRO
  status: text("status").notNull(), // active | cancelled | past_due
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
```

#### Enforcement de limites

Middleware ou helper chamado antes de operações sensíveis:

- **Criar membro**: `count(WorkspaceMember) >= limite do plano` → bloquear
- **Criar jogo ativo**: `count(Game where active AND workspaceId) >= limite do plano` → bloquear
- **Acessar histórico**: checar se o período solicitado está dentro do permitido pelo plano

Quando limite é atingido → modal de upgrade com CTA direto para o checkout.

#### Telas novas

- **Pricing page** (landing page pública, antes do login)
- **Billing settings** (dentro do workspace, só OWNER)
- **Upgrade modal** (aparece automaticamente quando limite é atingido)

---

## Ordem de dependência entre as fases

```
Fase 1 (Multi-tenancy)
  ├── Fase 2 (Onboarding & Convites)  — depende de 1
  ├── Fase 3 (Personalização)         — depende de 1
  └── Fase 4 (Admin por roles)        — depende de 1
        └── Fase 5 (Billing)          — depende de 1 e 4
```

**Fases 2, 3 e 4 podem ser paralelizadas** após a conclusão da Fase 1.

**MVP para lançar beta**: Fases 1 + 2 + 3 — já permite workspaces, convites e personalização básica.

---

## Rebrand necessário

O projeto precisa de um nome genérico desvinculado da "NeFEs". Sugestões:

- **DailyGames** — direto e descritivo
- **Placar** — curto, brasileiro
- **DailyBoard** — combina "daily" com "leaderboard"

O nome escolhido afeta: domínio, slug do repo, textos na UI, landing page e SEO.

---

## Checklist de verificação pós-implementação

- [ ] Workspace A **não vê** dados do workspace B (isolamento completo)
- [ ] 6º membro em workspace Free é **bloqueado** com mensagem clara
- [ ] 4º jogo ativo em workspace Free é **bloqueado** com CTA de upgrade
- [ ] Fluxo E2E: signup → criar workspace → personalizar → convidar → jogar → ver leaderboard
- [ ] "Powered by DailyGames" aparece no Free, **não aparece** no Pro
- [ ] Admin PIN completamente removido — apenas roles controlam acesso
- [ ] Cor primária customizada reflete em **toda** a UI do workspace
- [ ] Logo customizado aparece em sidebar, topbar mobile, login modal e pódio
- [ ] Link de convite funciona: clique → Google login → auto-join
- [ ] Webhook de billing atualiza plano corretamente após pagamento e cancelamento
- [ ] Leaderboard cooperativo exibe nome do workspace, não "NeFEs" hardcoded

---

## Features futuras (pós-MVP)

1. **Leaderboard público compartilhável** — URL sem login, viraliza o produto
2. **Email digest diário** — "Fulano jogou hoje, você ainda não!" — retenção passiva
3. **Streaks e achievements** — gamificação em cima da gamificação
4. **Bot Slack / Discord** — posta resultados automaticamente no canal do time
5. **API pública** — permite integrações de terceiros e automações
6. **PWA com push notifications** — lembrete diário para jogar
