# DAG Visualizer - Instruções de Uso

## Como fazer upload de arquivos

1. **Ao abrir a página DAG Visualizer**, você verá uma área de upload clara e visível no centro da tela
2. **Arraste e solte** seus arquivos de código na área indicada, ou **clique** para selecionar arquivos
3. **Formatos aceitos**: .js, .jsx, .ts, .tsx, .py, .java, .cpp, .c, .h, .cs, .rb, .go, .rs, .php, .swift

## Passo a passo:

### 1. Upload de Arquivos
- Arraste múltiplos arquivos de código para a zona de upload
- Ou clique na área para abrir o seletor de arquivos
- Você verá a lista de arquivos selecionados antes da análise

### 2. Análise
- Clique no botão "Analisar Arquivos"
- O sistema processará seus arquivos e extrairá:
  - Estrutura de arquivos
  - Classes e funções
  - Dependências entre componentes
  - Métricas de complexidade

### 3. Visualização
- Após a análise, um grafo interativo será exibido
- Cada nó representa um componente do código (arquivo, classe, função)
- As conexões mostram as dependências

### 4. Interação com o Grafo
- **Arrastar nós**: Reorganize a visualização
- **Zoom**: Use a roda do mouse ou gestos de pinça
- **Filtrar**: Use o menu lateral para filtrar por tipo de componente
- **Clicar em nós**: Veja detalhes do componente selecionado

### 5. Novo Upload
- Para analisar novos arquivos, clique em "Novo Upload" nos controles
- Ou use o botão "Fazer Upload de Arquivos" na barra lateral

## Dicas:
- Para melhores resultados, faça upload de múltiplos arquivos relacionados
- O sistema detecta automaticamente as relações entre arquivos
- Use os filtros para focar em tipos específicos de componentes
- As métricas em tempo real mostram a complexidade estimada

## Legenda de Cores:
- **Azul**: Arquivos
- **Verde**: Funções
- **Laranja**: Classes
- **Vermelho**: Agentes
- **Roxo**: War Room
- **Ciano**: Módulos