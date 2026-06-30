# Analytics Monorepo

Este é um monorepo que contém uma biblioteca de analytics completa e um aplicativo Next.js de demonstração. O projeto utiliza **bun** como package manager para melhor performance.

## 📁 Estrutura do Projeto

```
analytics-monorepo/
├── packages/
│   └── analytics/              # Biblioteca principal de analytics
│       ├── src/
│       │   ├── index.ts        # Export principal
│       │   ├── WebAnalyticsEngine.ts
│       │   ├── database/
│       │   ├── utils/
│       │   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── apps/
│   └── test/                   # App Next.js de demonstração
│       ├── src/app/
│       │   ├── page.tsx        # Dashboard de analytics
│       │   ├── blog/           # Página de blog
│       │   ├── produto/[id]/   # Páginas de produto
│       │   └── api/analytics/  # API routes
│       ├── prisma/             # Schema do banco de dados
│       ├── package.json
│       └── next.config.js
├── pnpm-workspace.yaml         # Configuração do workspace
├── turbo.json                  # Configuração do Turborepo
├── package.json                # Scripts do monorepo
└── README.md                   # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- [bun](https://bun.sh/) - Package manager e runtime JavaScript

### Instalação

```bash
# Instalar dependências do monorepo
bun install

# Construir a biblioteca de analytics
bun run build:lib

# Construir o app de demonstração
bun run build:app
```

## 📊 Biblioteca de Analytics (servidor)

### Funcionalidades Principais

- **Rastreamento de Page Views**: Monitora visualizações de página
- **Análise de Sessões**: Gerenciamento inteligente de sessões
- **Detecção de Tráfego**: Origem orgânica, paga, social, direta
- **Análise de Campanhas UTM**: Parâmetros de marketing
- **Bounce Rate**: Taxa de rejeição
- **Tempo na Página**: Análise de engajamento
- **Suporte a Múltiplos Bancos**: SQLite, PostgreSQL, MySQL, MongoDB

### Uso Básico

```typescript
import { WebAnalyticsEngine } from "analytics";

const analytics = new WebAnalyticsEngine({
  database: {
    type: "sqlite",
    url: "file:./analytics.db",
  },
  tracking: {
    sessionTimeout: 30,
    enableRealTime: true,
    enableUTMTracking: true,
  },
});

// Conectar ao banco
await analytics.connect();

// Rastrear uma pageview
await analytics.trackPageView({
  sessionId: "session_123",
  url: "https://example.com/page",
  title: "Page Title",
  userAgent: navigator.userAgent,
});

// Obter métricas
const bounceRate = await analytics.getBounceRate();
const pageAnalytics = await analytics.getPageAnalytics();
```

## 🎯 @insyte/track — Integração com providers (client-side)

Pacote para integrar **Google Analytics**, **Mixpanel**, **PostHog**, **Segment**, **Amplitude**, **Plausible**, **Facebook Pixel**, **Microsoft Clarity** e **providers customizados** em qualquer app JavaScript.

Funciona com React, Vue, Angular, Vite, Next.js e vanilla JS.

```typescript
import { setupAnalytics, googleAnalytics, mixpanel } from "@insyte/track";

await setupAnalytics({
  autoPageView: true,
  providers: [
    googleAnalytics({ measurementId: "G-XXXXXXXX" }),
    mixpanel({ token: "YOUR_TOKEN" }),
  ],
});
```

Documentação completa: [`packages/track/README.md`](packages/track/README.md)

## 🎯 App de Demonstração (Next.js)

O app de demonstração mostra como integrar a biblioteca em um projeto real.

### Executar o App

```bash
# Desenvolver
bun run dev:app

# Build para produção
bun run build:app
bun run start:app
```

### Páginas Disponíveis

- **`/`** - Dashboard completo com métricas em tempo real
- **`/blog`** - Página de blog com rastreamento
- **`/produto/[id]`** - Páginas dinâmicas de produto
- **`/api/analytics`** - API endpoints para analytics

### Funcionalidades do Demo

- **Dashboard Interativo**: Visualização de dados em tempo real
- **Simulação de Dados**: Botão para gerar dados de teste
- **Rastreamento Automático**: Pageviews rastreadas automaticamente
- **API Mock**: Dados simulados para demonstração

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Monorepo
bun run build           # Build de todos os pacotes
bun run dev             # Desenvolvimento de todos os pacotes
bun run lint            # Lint de todos os pacotes
bun run type-check      # Verificação de tipos

# Biblioteca
bun run build:lib       # Build da biblioteca
bun run dev:lib         # Desenvolvimento da biblioteca

# App
bun run dev:app         # Desenvolvimento do app Next.js
bun run build:app       # Build do app Next.js
bun run start:app       # Executar app em produção
```

### Adicionando Novos Recursos

#### Na Biblioteca

1. Adicione código em `packages/analytics/src/`
2. Atualize exports em `packages/analytics/src/index.ts`
3. Execute `pnpm run build:lib`

#### No App de Demonstração

1. Adicione páginas em `apps/test/src/app/`
2. Atualize API routes se necessário
3. Teste com `pnpm run dev:app`

## 🗄️ Banco de Dados

### Configuração do Prisma

O app de demonstração usa Prisma com SQLite:

```bash
cd apps/test
npx prisma studio    # Interface visual
npx prisma db push   # Aplicar mudanças no schema
```

### Schema do Banco

O schema inclui tabelas para:

- `Session` - Sessões de usuário
- `Pageview` - Visualizações de página
- `UserInfo` - Informações do usuário
- `TrafficSource` - Origens de tráfego
- `RealTimeEvent` - Eventos em tempo real
- `AnalyticsCache` - Cache de analytics

## 🔧 Configuração

### Variáveis de Ambiente

#### App de Demonstração

```env
DATABASE_URL="file:./dev.db"
```

#### Produção

Configure as variáveis apropriadas para seu banco de dados preferido.

## 📈 Próximos Passos

- [ ] Implementar autenticação de usuário
- [ ] Adicionar dashboards customizáveis
- [x] Integrar com Google Analytics (`@insyte/track`)
- [ ] Implementar exportação de dados
- [ ] Adicionar testes automatizados
- [ ] Criar interface de administração
- [ ] Suporte a múltiplos sites/tenants

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Teste thoroughly
5. Submeta um pull request

## 📄 Licença

MIT License - veja LICENSE para detalhes.

---

**Nota**: Esta é uma implementação completa de analytics que pode ser usada tanto para desenvolvimento quanto produção. O app de demonstração serve como exemplo de integração em projetos Next.js.
