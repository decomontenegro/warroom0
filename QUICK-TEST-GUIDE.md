# Guia Rápido de Teste - War Room

## Como Iniciar

1. **Iniciar o Backend**
   ```bash
   cd server
   npm run dev
   ```
   Servidor rodará em http://localhost:3005

2. **Iniciar o Frontend**
   ```bash
   npm run dev
   ```
   Aplicação rodará em http://localhost:5173

3. **Abrir o War Room**
   - Acesse: http://localhost:5173
   - Ou use um dos arquivos HTML de atalho na raiz do projeto

## Testando as Novas Funcionalidades

### 1. Teste de Prompts Diversos

**Opção A - Teste Manual Interativo:**
1. Abra `test-warroom-prompts-manual.html` em seu navegador
2. Clique em qualquer prompt para copiá-lo
3. Cole no War Room e observe as respostas

**Opção B - Testes Automatizados:**
```bash
npm test -- tests/test-warroom-prompts.spec.js
```

### 2. Enhanced Prompt Dialog

1. Envie um prompt qualquer no War Room
2. Aguarde a síntese do Meta-Agent
3. Clique no botão "Refinar Prompt" que aparece na síntese
4. Escolha entre:
   - **Perguntas Dinâmicas**: Responda perguntas geradas automaticamente
   - **Especialistas de Refinamento**: Escolha um especialista para melhorar seu prompt

### 3. Histórico de Conversas

1. Clique no ícone de relógio (History) no header
2. Explore:
   - Conversas organizadas por data
   - Busca por conteúdo
   - Filtros por período
   - Estatísticas de uso
   - Exportação para Markdown (botão download)

### 4. Feedback em Tempo Real

1. Envie um prompt para todos os especialistas
2. Observe o mini-painel no canto inferior direito
3. Clique para expandir e ver:
   - Fases do processamento
   - Agentes ativos
   - Métricas em tempo real
   - Progresso detalhado

### 5. Integração com Code Graph

1. Clique no ícone de código (</>) no header
2. Faça upload de arquivos ou pasta de código
3. Escolha o tipo de análise:
   - Arquitetura
   - Qualidade
   - Performance
   - Segurança
   - Dependências
4. Veja os insights gerados
5. Envie para o War Room com contexto

## Prompts de Teste Recomendados

### Básicos
- "Quero criar um app de delivery"
- "Preciso de um sistema para escola"
- "Quero fazer uma plataforma de streaming"

### Complexos
- "Quero criar uma plataforma educacional com IA que personaliza o aprendizado baseado no perfil e progresso de cada aluno"
- "Preciso desenvolver uma fintech com conta digital, cartão virtual, investimentos e cashback, focada em jovens universitários"

### Para Code Graph
1. Faça upload de alguns arquivos JavaScript/TypeScript
2. Escolha "Análise de Arquitetura"
3. Observe os insights sobre estrutura e dependências

## Verificando Funcionalidades

### ✅ Checklist Rápido

- [ ] Enviar prompt e receber respostas de múltiplos agentes
- [ ] Ver síntese do Meta-Agent ao final
- [ ] Usar Enhanced Prompt Dialog (ambos os modos)
- [ ] Navegar pelo histórico de conversas
- [ ] Exportar uma conversa para Markdown
- [ ] Ver feedback em tempo real durante processamento
- [ ] Fazer análise de código com Code Graph
- [ ] Verificar responsividade em diferentes tamanhos de tela

## Atalhos Úteis

- **Nova Conversa**: Botão "+ Nova Conversa" no histórico
- **Limpar Cache**: Recarregar a página (F5)
- **Debug**: Abrir console do navegador (F12)

## Troubleshooting

**Tela preta/escura?**
- Verifique se o servidor backend está rodando
- Confirme a porta 3005 está livre

**Agentes não aparecem?**
- Verifique o arquivo `warroom-agents-100.json`
- Confirme que o WebSocket está conectado

**Erro ao refinar prompt?**
- Aguarde a síntese completa antes de clicar
- Tente recarregar a página

---

**Dica:** Use o arquivo `test-warroom-prompts-manual.html` para testes rápidos e completos!