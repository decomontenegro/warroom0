# 📊 Teste do Dashboard de Métricas - UltraThink

## Como Testar o Dashboard de Métricas

### 1. Abrir o Aplicativo
- O servidor já está rodando em http://localhost:5173
- Abra seu navegador e acesse este endereço

### 2. Navegar para o Chat UltraThink
- Na sidebar esquerda, clique em "🚀 UltraThink Workflow" (primeiro item)
- Este é o chat especial que tem o dashboard de métricas

### 3. Executar uma Análise
- Digite ou cole o conteúdo do whitepaper FanBet no campo de mensagem
- Pressione Enter para enviar
- Aguarde a análise ser processada (você verá mensagens dos agentes)

### 4. Visualizar as Métricas
- Após a análise, procure o botão "📊 Mostrar Métricas" no canto superior direito da área de chat
- Clique no botão para exibir/ocultar o dashboard
- O dashboard mostrará:
  - **Confiança Geral**: Nível de confiança da análise (0-100%)
  - **Consenso entre Agentes**: Taxa de acordo entre especialistas
  - **Taxa de Sucesso**: Porcentagem de agentes que completaram suas tarefas
  - **Profundidade**: Quão detalhada foi a análise
  - **Tempo de Resposta**: Duração total da análise
  - **Complexidade**: Classificação do documento (baixa/média/alta)
  - **Total de Agentes**: Número de especialistas envolvidos
  - **Fases Completas**: Progresso das etapas (0-4)

### 5. Recursos Adicionais
- **Histórico**: O dashboard mantém um histórico das últimas 50 análises
- **Comparações**: Cada métrica mostra a média histórica para comparação
- **Tendências**: Gráfico visual das últimas 10 análises
- **Insights**: Recomendações baseadas nas métricas atuais

### 6. Testar Múltiplas Análises
- Execute várias análises com diferentes documentos ou perguntas
- Observe como as métricas mudam e o histórico é construído
- Os dados são salvos localmente no navegador (localStorage)

## Indicadores de Qualidade

### 🟢 Boa Qualidade (Verde)
- Confiança ≥ 80%
- Alto consenso entre agentes
- Todas as fases completadas

### 🟡 Qualidade Média (Amarelo)  
- Confiança entre 60-79%
- Consenso moderado
- Pode precisar de refinamento

### 🔴 Baixa Qualidade (Vermelho)
- Confiança < 60%
- Baixo consenso
- Considere adicionar mais especialistas

## Solução de Problemas

### Dashboard não aparece?
1. Certifique-se de estar no chat "UltraThink Workflow"
2. Execute pelo menos uma análise primeiro
3. Clique no botão "📊 Mostrar Métricas"

### Métricas zeradas?
- Aguarde a análise completar totalmente
- Verifique se há erros no console do navegador (F12)

### Histórico não salva?
- Verifique se o navegador permite localStorage
- Tente um navegador diferente se necessário