# Analytics Test App

Este é um aplicativo Next.js 15 criado para testar e demonstrar a biblioteca de analytics em um ambiente real.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visualização em tempo real de métricas de analytics
- **Rastreamento Automático**: Pageviews, tempo na página e fontes de tráfego
- **Simulação de Dados**: Botão para gerar dados de teste
- **Páginas de Demonstração**: Produto e blog para diferentes cenários
- **Integração com Prisma**: Banco de dados SQLite local
- **API Routes**: Endpoints para interagir com a biblioteca de analytics

## 📁 Estrutura do Projeto

```
apps/test/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── dev.db                 # Banco SQLite (gerado automaticamente)
├── src/
│   ├── app/
│   │   ├── api/analytics/     # API routes para analytics
│   │   ├── blog/              # Página de blog
│   │   ├── produto/[id]/      # Páginas dinâmicas de produto
│   │   └── page.tsx           # Dashboard principal
│   └── lib/                   # Utilitários (se necessário)
├── package.json               # Dependências do projeto
├── .env.local                 # Configurações de ambiente
└── README.md                  # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# No diretório raiz do monorepo
cd apps/test

# Instalar dependências
npm install

# Configurar banco de dados
npx prisma generate
npx prisma db push
```

### Configuração do Ambiente

O arquivo `.env.local` já está configurado com:
```env
DATABASE_URL="file:./dev.db"
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
# No diretório raiz do monorepo
bun run dev:app
# ou
npm run dev
```

### Build para Produção
```bash
npm run build
npm run start
```

## 📊 Como Usar

### 1. Dashboard Principal
- Acesse `http://localhost:3000`
- Visualize métricas em tempo real
- Use o botão "Simulate Page View" para gerar dados de teste

### 2. Páginas de Demonstração
- **Blog**: `http://localhost:3000/blog`
- **Produtos**: `http://localhost:3000/produto/1`, `http://localhost:3000/produto/2`

### 3. API Analytics
- `GET /api/analytics` - Dados em tempo real
- `POST /api/analytics` - Executar ações de analytics

#### Exemplos de uso da API:

```javascript
// Rastrear uma pageview
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'trackPageView',
    sessionId: 'session_123',
    url: 'https://example.com/page',
    title: 'Page Title',
    userAgent: navigator.userAgent
  })
})

// Obter bounce rate
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getBounceRate' })
})
```

## 🎯 Funcionalidades Demonstradas

### Rastreamento Automático
- **Page Views**: Toda visita é automaticamente rastreada
- **Session Tracking**: Sessões são identificadas e gerenciadas
- **User Agent Detection**: Informações do dispositivo e navegador
- **Traffic Source Detection**: Origem do tráfego (orgânico, pago, social, etc.)

### Métricas Disponíveis
- **Bounce Rate**: Taxa de rejeição
- **Page Analytics**: Visualizações, tempo médio na página
- **Traffic Sources**: Origens de tráfego
- **Campaign Analytics**: Análise de campanhas UTM
- **Real-time Data**: Dados atualizados a cada 30 segundos

### Simulação de Cenários
- **Produtos**: Demonstra rastreamento de páginas de produto
- **Blog**: Mostra análise de conteúdo
- **UTM Parameters**: Simulação de campanhas de marketing
- **Different Devices**: Vários user agents para teste

## 🔧 Desenvolvimento

### Adicionando Novas Páginas
1. Crie um novo diretório em `src/app/`
2. Adicione o arquivo `page.tsx`
3. Implemente o rastreamento usando `useEffect`

### Modificando a API
- Edite `src/app/api/analytics/route.ts`
- Adicione novas ações no switch statement
- Teste com dados reais ou simulados

### Database Schema
Para modificar o schema do banco:
```bash
npx prisma studio  # Interface visual
# ou edite prisma/schema.prisma diretamente
npx prisma db push  # Aplicar mudanças
```

## 📈 Monitoramento

O dashboard mostra dados em tempo real incluindo:
- Usuários ativos nos últimos 5 minutos
- Page views por minuto
- Top páginas mais visitadas
- Fontes de tráfego
- Análise de campanhas
- Métricas de engajamento

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão com banco:**
```bash
npx prisma db push
```

**Problemas com dependências:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build falhando:**
```bash
npm run build 2>&1 | cat  # Ver logs completos
```

## 📚 Próximos Passos

- [ ] Adicionar autenticação de usuário
- [ ] Implementar dashboards customizáveis
- [ ] Adicionar gráficos e visualizações avançadas
- [ ] Integrar com ferramentas externas (Google Analytics, etc.)
- [ ] Implementar exportação de dados
- [ ] Adicionar testes automatizados

## 🤝 Contribuição

Para contribuir com melhorias:
1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Teste thoroughly
5. Submeta um pull request

---

**Nota**: Este é um projeto de demonstração. Para uso em produção, considere implementar:
- Autenticação e autorização
- Rate limiting
- Data retention policies
- Backup e recuperação
- Monitoramento e alertas