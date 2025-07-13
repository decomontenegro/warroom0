# 🧠 War Room CLI

Solução integrada de linha de comando para todos os tipos de problemas em tech e projetos, powered by 100+ agentes especializados de IA.

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Tornar global (opcional)
npm link

# Ou executar diretamente
npm run warroom
```

## 📚 Comandos Disponíveis

### Comandos Básicos
- `/help` - Mostra ajuda completa
- `/mode [modo]` - Altera modo de operação
- `/agents` - Lista todos os agentes disponíveis
- `/project [path]` - Define o projeto atual
- `/clear` - Limpa a tela
- `/exit` - Sair do War Room

### Análise e Review
- `/analyze [arquivo]` - Análise profunda de código/arquitetura
- `/review [arquivo]` - Code review com IA
- `/security` - Auditoria completa de segurança
- `/perf` - Análise de performance

### Desenvolvimento
- `/plan [descrição]` - Cria plano detalhado de projeto
- `/debug [erro]` - Debug assistido por IA
- `/test [arquivo]` - Gera testes automaticamente
- `/deploy` - Estratégia de deployment e CI/CD

### Gestão de Sessão
- `/history` - Histórico de comandos
- `/export [arquivo]` - Exporta sessão atual

## 🎯 Modos de Operação

1. **interactive** - Discussão interativa com agentes
2. **analysis** - Análise profunda de código/arquitetura
3. **debug** - Debug assistido por IA
4. **planning** - Planejamento de projetos
5. **review** - Code review inteligente
6. **security** - Auditoria de segurança
7. **performance** - Otimização de performance
8. **architecture** - Design de arquitetura
9. **testing** - Estratégia de testes
10. **deployment** - CI/CD e deployment

## 💡 Exemplos de Uso

### Análise de Projeto
```bash
war-room> /project ./meu-projeto
war-room> /analyze
war-room> Quais são os principais problemas de arquitetura?
```

### Debug de Erro
```bash
war-room> /mode debug
war-room> /debug TypeError: Cannot read property 'map' of undefined
```

### Planejamento de Feature
```bash
war-room> /plan Sistema de autenticação com OAuth2 e JWT
```

### Code Review
```bash
war-room> /review src/components/Auth.jsx
```

### Auditoria de Segurança
```bash
war-room> /project ./backend-api
war-room> /security
```

## 🤖 Agentes Especializados

O War Room CLI tem acesso a 100+ agentes especializados organizados em 8 fases:

### Brainstorm (16 agentes)
- Innovation Catalyst, Creative Director, Trend Analyst...

### Development (16 agentes)
- System Architect, Backend/Frontend Engineers, DevOps...

### Product (12 agentes)
- Product Manager, Business Analyst, Market Researcher...

### UX (12 agentes)
- UX Designer, UI Designer, Interaction Designer...

### Design (12 agentes)
- Design System Architect, Visual Designer, Motion Designer...

### Marketing (10 agentes)
- Marketing Strategist, Content Creator, SEO Specialist...

### Security (11 agentes)
- Security Architect, Penetration Tester, Compliance Officer...

### Testing (11 agentes)
- QA Lead, Test Engineer, Automation Specialist...

## 🔧 Configuração

O CLI usa as mesmas configurações do arquivo `.env`:

```env
OPENROUTER_API_KEY=sua-chave-aqui
OPENROUTER_MODEL=anthropic/claude-3-haiku
ENABLE_AI=true
```

## 📊 Features Avançadas

### Auto-detecção de Projeto
O CLI detecta automaticamente o tipo de projeto (React, Vue, Node.js, Python, etc.) e sugere os agentes mais relevantes.

### Seleção Inteligente de Agentes
Baseado no contexto da conversa, o CLI seleciona automaticamente os agentes mais relevantes para responder.

### Histórico Persistente
Todas as sessões podem ser exportadas para análise posterior.

### Integração com Projeto
Pode analisar código, gerar testes e fazer review diretamente dos arquivos do projeto.

## 🛠️ Troubleshooting

### Servidor não encontrado
O CLI inicia automaticamente o servidor se não estiver rodando.

### Erro de conexão WebSocket
Verifique se a porta 3005 está disponível.

### API não responde
Verifique se a OPENROUTER_API_KEY está configurada corretamente.

## 📈 Roadmap

- [ ] Integração com Git para análise de commits
- [ ] Exportação de relatórios em PDF
- [ ] Modo batch para processar múltiplos arquivos
- [ ] Integração com IDEs populares
- [ ] Suporte a mais linguagens de programação
- [ ] Templates de projetos
- [ ] Métricas de qualidade de código

---

**War Room CLI** - Transformando a forma como resolvemos problemas em tecnologia! 🚀