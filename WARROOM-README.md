# 🚀 War Room - Sistema Multi-Agente Inteligente

## 🎯 Visão Geral

O War Room é um sistema avançado de colaboração multi-agente que simula uma equipe completa de desenvolvimento, permitindo consultas simultâneas a múltiplos especialistas em diferentes áreas.

## ✨ Características Principais

### 1. **Interface Estilo WhatsApp**
- Chat individual com cada especialista
- Sala coletiva "Todos os Especialistas"
- Sincronização automática entre chats
- Indicadores de status online/offline

### 2. **100+ Agentes Especializados**
- Frontend, Backend, DevOps, Security, Database, etc.
- Seleção inteligente baseada na consulta
- Respostas contextualizadas por especialidade

### 3. **Sistema de Vetores**
- **Vetores de Tópico** (T1, T2, T3...): Rastreiam cada assunto
- **Vetores de Agente** (A1, A2, A3...): Identificam cada especialista
- Facilita análise e aprendizado futuro

### 4. **UltraThink Workflow**
- Sistema regenerativo com 8 fases
- Auto-aprendizado entre iterações
- Resolução automática de conflitos
- Otimização contínua

## 🚀 Como Usar

### Iniciando o Sistema

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env e adicionar OPENROUTER_API_KEY

# 3. Iniciar servidor e cliente
npm run dev

# 4. Acessar interface
http://localhost:5173/warroom
```

### Fazendo Consultas

#### 1. **Sala "Todos os Especialistas"**
- Clique em "👥 Todos os Especialistas"
- Digite sua pergunta
- 5 especialistas relevantes responderão automaticamente
- Resumo automático será gerado ao final

#### 2. **Chat Individual**
- Selecione um especialista específico
- Converse diretamente para aprofundar tópicos
- Mensagens da sala coletiva aparecem marcadas com 👥

#### 3. **Prompt Builder**
- Use para criar consultas complexas
- Selecione tópicos e especialistas
- Visualize preview antes de enviar

#### 4. **UltraThink Workflow**
- Para projetos complexos que precisam análise completa
- Executa 8 fases automaticamente
- Gera relatório detalhado com recomendações

## ⚙️ Configurações

Acesse clicando no botão ⚙️:

- **Número de Agentes**: 1-10 especialistas por consulta
- **Resumo Automático**: Liga/desliga geração automática
- **Delay do Resumo**: 500-5000ms após respostas

## 📊 Indicadores Visuais

### Status dos Agentes
- 🔄 **Amarelo pulsante**: Processando
- ✅ **Verde**: Resposta bem-sucedida
- ❌ **Vermelho**: Erro ou timeout
- ⚡ **Tempo**: Mostra tempo de resposta

### Tipos de Mensagem
- **Azul**: Suas mensagens
- **Cinza**: Respostas dos agentes
- **Cinza escuro**: Mensagens do sistema
- **Borda verde**: Mensagem vinda da sala coletiva

## 🔧 Recursos Avançados

### Sistema de Vetores
```
Exemplo de rastreamento:
- Pergunta sobre React: T1
- Frontend Architect responde: T1-A1
- Performance Engineer responde: T1-A2
- Nova pergunta sobre API: T2
```

### Novo Assunto
- Clique em "🆕 Novo Assunto" para iniciar novo contexto
- Cria novo vetor de tópico automaticamente
- Mantém histórico organizado

### Persistência
- Mensagens salvas automaticamente
- Recuperadas ao recarregar página
- Botão 🗑️ para limpar histórico

## 🐛 Troubleshooting

### "Apenas X agentes responderam"
- Verifique OPENROUTER_API_KEY no .env
- Aumente timeout nas configurações
- Verifique logs do servidor

### "Resumo não foi gerado"
- Ative "Resumo Automático" nas configurações
- Aguarde o delay configurado
- Verifique se há mensagens para resumir

### "Conexão perdida"
- Verifique se servidor está rodando (porta 3005)
- Recarregue a página
- Verifique console para erros

## 🧪 Testando o Sistema

```bash
# Teste automatizado
node test-warroom-agents.js

# Resultado esperado:
✅ Conectado ao War Room WebSocket
🚀 Iniciando processamento com 5 agentes
✅ Frontend Architect [2.3s]
✅ Backend Architect [1.8s]
✅ DevOps Lead [2.1s]
✅ Security Specialist [1.9s]
✅ Database Architect [2.4s]

📊 === RESULTADO DO TESTE ===
✅ Respostas bem-sucedidas: 5/5
🎉 TESTE PASSOU!
```

## 📚 Casos de Uso

### 1. **Arquitetura de Sistema**
"Como estruturar um e-commerce escalável?"
- Múltiplas perspectivas técnicas
- Considerações de segurança e performance
- Recomendações de stack

### 2. **Resolução de Problemas**
"Sistema está lento, como otimizar?"
- Análise de diferentes camadas
- Sugestões específicas por área
- Plano de ação priorizado

### 3. **Planejamento de Features**
"Implementar sistema de notificações real-time"
- Design técnico completo
- Considerações de UX
- Estimativas e riscos

### 4. **Code Review Coletivo**
"Revisar arquitetura do módulo X"
- Múltiplas perspectivas
- Identificação de melhorias
- Best practices por área

## 🔐 Segurança

- API keys nunca expostas no frontend
- Comunicação via WebSocket seguro
- Sanitização de inputs
- Rate limiting implementado

## 🚀 Próximas Melhorias

- [ ] Exportar conversas em PDF/Markdown
- [ ] Integração com IDEs
- [ ] Modo offline com cache
- [ ] Análise de sentimento nas respostas
- [ ] Métricas de uso e performance

---

**War Room** - Transformando a forma como desenvolvemos software através da inteligência coletiva! 🎯