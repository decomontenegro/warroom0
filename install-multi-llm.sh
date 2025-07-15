#!/bin/bash

echo "🚀 Instalando suporte Multi-LLM para WarRoom UltraThink"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão $NODE_VERSION detectada. É necessário Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Função para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 instalado${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $1 não encontrado${NC}"
        return 1
    fi
}

# 1. Instalar Claude Code SDK (se NPM disponível)
echo ""
echo -e "${BLUE}📦 Instalando Claude Code SDK...${NC}"
if npm list @anthropic-ai/claude-code &> /dev/null; then
    echo -e "${GREEN}✅ Claude Code SDK já instalado${NC}"
else
    npm install @anthropic-ai/claude-code --save
    echo -e "${GREEN}✅ Claude Code SDK instalado${NC}"
fi

# 2. Verificar/Instalar Gemini CLI
echo ""
echo -e "${BLUE}🌟 Verificando Gemini CLI...${NC}"
if check_command "gemini-cli"; then
    GEMINI_VERSION=$(gemini-cli --version 2>/dev/null || echo "versão desconhecida")
    echo -e "   Versão: ${GEMINI_VERSION}"
else
    echo -e "${YELLOW}📥 Instalando Gemini CLI...${NC}"
    echo -e "   Por favor, execute o seguinte comando:"
    echo -e "   ${BLUE}curl -sSL https://cli.gemini.dev/install.sh | bash${NC}"
    echo ""
    read -p "Deseja instalar agora? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        curl -sSL https://cli.gemini.dev/install.sh | bash
        echo -e "${GREEN}✅ Gemini CLI instalado${NC}"
    else
        echo -e "${YELLOW}⚠️  Você pode instalar o Gemini CLI mais tarde${NC}"
    fi
fi

# 3. Configurar variáveis de ambiente
echo ""
echo -e "${BLUE}⚙️  Configurando variáveis de ambiente...${NC}"

# Fazer backup do .env se existir
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup do .env criado${NC}"
fi

# Adicionar configurações Multi-LLM ao .env
if ! grep -q "ENABLE_MULTI_LLM" .env 2>/dev/null; then
    cat >> .env << EOL

# ========================================
# Multi-LLM Configuration
# ========================================
# Habilitar sistema Multi-LLM
ENABLE_MULTI_LLM=true

# Claude Code Configuration
ENABLE_CLAUDE_CODE=false
CLAUDE_CODE_API_KEY=

# Gemini CLI Configuration
ENABLE_GEMINI_CLI=false
GEMINI_CLI_PATH=gemini-cli

# OpenRouter Configuration (já configurado acima)
# OPENROUTER_API_KEY=
# OPENROUTER_MODEL=anthropic/claude-opus-4
EOL
    echo -e "${GREEN}✅ Configurações Multi-LLM adicionadas ao .env${NC}"
else
    echo -e "${YELLOW}⚠️  Configurações Multi-LLM já existem no .env${NC}"
fi

# 4. Criar arquivo de configuração de distribuição
echo ""
echo -e "${BLUE}📊 Criando configuração de distribuição de agentes...${NC}"

cat > warroom-agents-llm-config.json << 'EOL'
{
  "agentLLMConfiguration": {
    "criticalAnalysis": {
      "provider": "claude",
      "model": "opus-4",
      "description": "Arquitetura, estratégia e decisões críticas",
      "agents": [1, 2, 3, 20, 21, 31, 32, 49, 50, 69, 70, 91, 92, 93, 94]
    },
    "technicalImplementation": {
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "description": "Desenvolvimento técnico e implementação",
      "agents": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 73, 74, 75, 76, 77]
    },
    "creativeDesign": {
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "description": "Design, UX/UI e criatividade",
      "agents": [37, 38, 39, 40, 41, 42, 43, 58, 59, 60, 61, 62, 71, 72]
    },
    "qualityAssurance": {
      "provider": "openrouter",
      "model": "claude-3-haiku",
      "description": "QA, testes e validação",
      "agents": [18, 19, 23, 24, 25, 26, 27, 28, 29, 30]
    },
    "supportAndAnalysis": {
      "provider": "openrouter",
      "model": "claude-3-haiku",
      "description": "Suporte, análise e tarefas auxiliares",
      "agents": [16, 17, 44, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 63, 64, 65, 66, 67, 68, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 95, 96, 97, 98, 99, 100]
    }
  },
  "fallbackPriority": ["openrouter", "gemini", "claude"],
  "costOptimization": {
    "preferFreeProviders": true,
    "maxCostPerDay": 10.00,
    "alertThreshold": 5.00
  }
}
EOL

echo -e "${GREEN}✅ Arquivo de configuração criado${NC}"

# 5. Atualizar rotas do servidor
echo ""
echo -e "${BLUE}🔧 Atualizando servidor...${NC}"

# Verificar se a rota LLM já está registrada
if ! grep -q "llmRoutes" server/index.js 2>/dev/null; then
    echo -e "${YELLOW}📝 Adicionando rotas LLM ao servidor...${NC}"
    
    # Criar backup
    cp server/index.js server/index.js.backup
    
    # Adicionar import e rota
    sed -i '' '/import warRoomRoutes/a\
import llmRoutes from '\''./routes/llm.js'\'';
' server/index.js
    
    sed -i '' '/app.use.*warroom/a\
app.use('\''/api/llm'\'', llmRoutes);
' server/index.js
    
    echo -e "${GREEN}✅ Rotas LLM adicionadas ao servidor${NC}"
else
    echo -e "${GREEN}✅ Rotas LLM já configuradas${NC}"
fi

# 6. Criar script de teste
echo ""
echo -e "${BLUE}🧪 Criando script de teste...${NC}"

cat > test-multi-llm.js << 'EOL'
import LLMManager from './server/services/llm-manager.js';

console.log('🧪 Testando Sistema Multi-LLM...\n');

const testMultiLLM = async () => {
  const manager = new LLMManager();
  
  // Verificar saúde dos providers
  console.log('📊 Verificando status dos providers...');
  const health = await manager.healthCheck();
  
  console.log('\nStatus:');
  console.log('- Claude Code:', health.claude?.status || 'não configurado');
  console.log('- Gemini CLI:', health.gemini?.status || 'não configurado');
  console.log('- OpenRouter:', health.openrouter?.status || 'não configurado');
  
  // Testar um agente
  const testAgent = {
    id: 1,
    name: 'Test Architect',
    role: 'System Architect',
    capabilities: ['System design', 'Architecture patterns']
  };
  
  console.log('\n🤖 Testando consulta com agente...');
  
  try {
    const response = await manager.queryAgent(
      testAgent, 
      'Sugira uma arquitetura para um sistema de chat em tempo real',
      { language: 'pt-BR' }
    );
    
    console.log('\n✅ Resposta recebida:');
    console.log('Provider:', response.provider);
    console.log('Conteúdo:', response.content.substring(0, 200) + '...');
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
  
  // Mostrar estatísticas
  const stats = manager.getStats();
  console.log('\n📈 Estatísticas:');
  console.log(JSON.stringify(stats, null, 2));
};

testMultiLLM().catch(console.error);
EOL

echo -e "${GREEN}✅ Script de teste criado${NC}"

# 7. Instruções finais
echo ""
echo -e "${GREEN}🎉 Instalação concluída!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo ""
echo "1. Configure as API Keys no arquivo .env:"
echo -e "   ${YELLOW}CLAUDE_CODE_API_KEY=${NC}sua-chave-aqui"
echo -e "   ${YELLOW}OPENROUTER_API_KEY=${NC}sua-chave-aqui"
echo ""
echo "2. Para Gemini CLI, faça login:"
echo -e "   ${BLUE}gemini-cli auth${NC}"
echo ""
echo "3. Ative os providers desejados no .env:"
echo -e "   ${YELLOW}ENABLE_CLAUDE_CODE=true${NC}"
echo -e "   ${YELLOW}ENABLE_GEMINI_CLI=true${NC}"
echo ""
echo "4. Reinicie o servidor:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "5. Acesse a configuração no WarRoom:"
echo "   - Clique no ícone ⚙️ no canto superior direito"
echo "   - Selecione 'Configuração Multi-LLM'"
echo ""
echo "6. Teste o sistema:"
echo -e "   ${BLUE}node test-multi-llm.js${NC}"
echo ""
echo -e "${GREEN}💡 Dica:${NC} Use Gemini CLI para aproveitar 1000 requests/dia grátis!"
echo ""
echo -e "${YELLOW}⚠️  Importante:${NC} Não commite suas API keys! O .env está no .gitignore."

# Tornar scripts executáveis
chmod +x test-multi-llm.js
chmod +x install-multi-llm.sh

echo ""
echo -e "${GREEN}✨ Sistema Multi-LLM pronto para uso!${NC}"