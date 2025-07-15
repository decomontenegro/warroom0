import express from 'express';
import LLMManager from '../services/llm-manager.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Instância global do LLM Manager
let llmManager = null;

// Inicializar LLM Manager
const initLLMManager = async () => {
  if (!llmManager) {
    llmManager = new LLMManager();
  }
  return llmManager;
};

/**
 * GET /api/llm/config
 * Retorna a configuração atual dos LLMs
 */
router.get('/config', async (req, res) => {
  try {
    const config = {
      claude: {
        enabled: process.env.CLAUDE_CODE_API_KEY ? true : false,
        apiKey: process.env.CLAUDE_CODE_API_KEY ? '***' + process.env.CLAUDE_CODE_API_KEY.slice(-4) : '',
        maxRequests: 100,
        status: 'unconfigured'
      },
      gemini: {
        enabled: process.env.ENABLE_GEMINI_CLI === 'true',
        authenticated: false, // Verificar via CLI
        maxRequests: 1000,
        status: 'unconfigured'
      },
      openrouter: {
        enabled: process.env.OPENROUTER_API_KEY ? true : false,
        apiKey: process.env.OPENROUTER_API_KEY ? '***' + process.env.OPENROUTER_API_KEY.slice(-4) : '',
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        status: 'unconfigured'
      }
    };
    
    // Verificar status real
    const manager = await initLLMManager();
    const health = await manager.healthCheck();
    
    config.claude.status = health.claude?.status || 'unconfigured';
    config.gemini.status = health.gemini?.status || 'unconfigured';
    config.openrouter.status = health.openrouter?.status || 'unconfigured';
    
    // Verificar autenticação Gemini
    if (config.gemini.enabled) {
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        await execAsync('gemini-cli --version');
        config.gemini.authenticated = true;
      } catch (error) {
        config.gemini.authenticated = false;
      }
    }
    
    res.json(config);
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/llm/config
 * Atualiza a configuração dos LLMs
 */
router.post('/config', async (req, res) => {
  try {
    const config = req.body;
    const envPath = path.join(__dirname, '..', '..', '.env');
    
    // Ler arquivo .env atual
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      console.log('Criando novo arquivo .env');
    }
    
    // Atualizar variáveis
    const updateEnvVar = (name, value) => {
      const regex = new RegExp(`^${name}=.*$`, 'gm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${name}=${value}`);
      } else {
        envContent += `\n${name}=${value}`;
      }
    };
    
    // Claude Code
    if (config.claude?.apiKey && !config.claude.apiKey.startsWith('***')) {
      updateEnvVar('CLAUDE_CODE_API_KEY', config.claude.apiKey);
    }
    updateEnvVar('ENABLE_CLAUDE_CODE', config.claude?.enabled || false);
    
    // Gemini CLI
    updateEnvVar('ENABLE_GEMINI_CLI', config.gemini?.enabled || false);
    
    // OpenRouter
    if (config.openrouter?.apiKey && !config.openrouter.apiKey.startsWith('***')) {
      updateEnvVar('OPENROUTER_API_KEY', config.openrouter.apiKey);
    }
    if (config.openrouter?.model) {
      updateEnvVar('OPENROUTER_MODEL', config.openrouter.model);
    }
    
    // Multi-LLM
    updateEnvVar('ENABLE_MULTI_LLM', 'true');
    
    // Salvar arquivo .env
    await fs.writeFile(envPath, envContent.trim() + '\n');
    
    // Recarregar configuração no LLM Manager
    const manager = await initLLMManager();
    await manager.initializeProviders();
    
    res.json({ success: true, message: 'Configuração salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/llm/health
 * Verifica a saúde de todos os providers
 */
router.get('/health', async (req, res) => {
  try {
    const manager = await initLLMManager();
    const health = await manager.healthCheck();
    res.json(health);
  } catch (error) {
    console.error('Erro ao verificar saúde:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/llm/test
 * Testa um provider específico
 */
router.post('/test', async (req, res) => {
  try {
    const { provider, config } = req.body;
    const manager = await initLLMManager();
    
    // Atualizar configuração temporariamente para teste
    if (config) {
      await manager.updateProviderConfig(provider, config);
    }
    
    // Criar agente de teste
    const testAgent = {
      id: 0,
      name: 'Test Agent',
      role: 'System Tester',
      capabilities: ['Testing LLM connectivity']
    };
    
    const testTask = 'Say "Hello World" to confirm the connection is working';
    
    try {
      const response = await manager.queryWithProvider(provider, testAgent, testTask, {
        language: 'en-US',
        test: true
      });
      
      if (response && response.content) {
        res.json({ 
          success: true, 
          response: response.content.substring(0, 100),
          provider: response.provider,
          model: response.model
        });
      } else {
        throw new Error('Resposta vazia do provider');
      }
    } catch (error) {
      res.json({ 
        success: false, 
        error: error.message,
        provider
      });
    }
  } catch (error) {
    console.error('Erro ao testar provider:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/llm/stats
 * Retorna estatísticas de uso dos LLMs
 */
router.get('/stats', async (req, res) => {
  try {
    const manager = await initLLMManager();
    const stats = manager.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/llm/gemini/check-auth
 * Verifica se o Gemini CLI está autenticado
 */
router.get('/gemini/check-auth', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Tentar executar comando simples
    const { stdout } = await execAsync('gemini-cli prompt "test" --non-interactive --json', {
      timeout: 5000
    });
    
    res.json({ authenticated: true });
  } catch (error) {
    res.json({ authenticated: false, error: error.message });
  }
});

/**
 * POST /api/llm/optimize
 * Otimiza a distribuição de agentes baseada em performance
 */
router.post('/optimize', async (req, res) => {
  try {
    const manager = await initLLMManager();
    
    // Implementar otimização no workflow
    const stats = manager.getStats();
    
    // Análise simples de performance
    const recommendations = [];
    
    // Verificar taxa de erro
    for (const [provider, providerStats] of Object.entries(stats.requestCounts)) {
      const errorRate = stats.errorCounts[provider] / providerStats;
      if (errorRate > 0.2) {
        recommendations.push({
          type: 'warning',
          provider,
          message: `Alta taxa de erro (${(errorRate * 100).toFixed(1)}%)`
        });
      }
    }
    
    // Verificar tempo de resposta
    for (const [provider, times] of Object.entries(stats.avgResponseTimes)) {
      if (times > 5000) {
        recommendations.push({
          type: 'warning',
          provider,
          message: `Tempo de resposta alto (${(times / 1000).toFixed(1)}s)`
        });
      }
    }
    
    res.json({
      success: true,
      recommendations,
      currentStats: stats
    });
  } catch (error) {
    console.error('Erro ao otimizar:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/llm/distribution
 * Retorna a distribuição atual de agentes por provider
 */
router.get('/distribution', async (req, res) => {
  try {
    // Carregar distribuição do arquivo de configuração
    const configPath = path.join(__dirname, '..', '..', 'warroom-agents-llm-config.json');
    
    let distribution = {
      claude: { agents: [], description: 'Arquitetura e estratégia' },
      gemini: { agents: [], description: 'Desenvolvimento e design' },
      openrouter: { agents: [], description: 'QA e suporte' }
    };
    
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      // Mapear agentes para providers
      for (const category of Object.values(config.agentLLMConfiguration)) {
        const provider = category.provider;
        if (distribution[provider]) {
          distribution[provider].agents.push(...category.agents);
        }
      }
    } catch (error) {
      console.log('Usando distribuição padrão');
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('Erro ao obter distribuição:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;