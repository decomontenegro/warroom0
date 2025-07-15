import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
    this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.enabled = process.env.ENABLE_AI === 'true';
  }

  async chat(messages, options = {}) {
    if (!this.enabled) {
      console.log('AI is disabled. Using mock response.');
      return this.getMockResponse(messages);
    }

    if (!this.apiKey) {
      console.error('OpenRouter API key not configured');
      return this.getMockResponse(messages);
    }

    // Retry logic with exponential backoff
    const maxRetries = options.maxRetries || 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Making AI request with model: ${this.model} (attempt ${attempt}/${maxRetries})`);
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3005',
              'X-Title': 'War Room AI Assistant'
            },
            timeout: options.timeout || 30000 // 30 second timeout
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        lastError = error;
        const errorType = error.code === 'ECONNABORTED' ? 'Timeout' : 
                         error.response?.status === 429 ? 'Rate Limit' :
                         error.response?.status >= 500 ? 'Server Error' : 'API Error';
        
        console.error(`AI API ${errorType} (attempt ${attempt}/${maxRetries}):`, 
                     error.response?.data || error.message);
        
        // Don't retry on client errors (4xx except 429)
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s...
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    console.error('All retry attempts failed. Using mock response.');
    console.log('To enable real AI:');
    console.log('1. Get a valid OpenRouter API key from https://openrouter.ai/');
    console.log('2. Update OPENROUTER_API_KEY in your .env file');
    console.log('3. Restart the server');
    
    // Return error info with mock response
    const mockResponse = this.getMockResponse(messages);
    if (typeof mockResponse === 'string') {
      return mockResponse;
    }
    return {
      ...mockResponse,
      error: true,
      errorType: lastError?.code === 'ECONNABORTED' ? 'timeout' : 'api_error'
    };
  }

  async analyzeCode(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert code analyst. Analyze the given code and provide insights on quality, potential issues, and suggestions for improvement.'
      },
      {
        role: 'user',
        content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a structured analysis including:\n1. Code quality score (A-F)\n2. Potential issues\n3. Security concerns\n4. Performance suggestions\n5. Best practices recommendations`
      }
    ];

    const response = await this.chat(messages);
    return this.parseAnalysisResponse(response);
  }

  async generateTests(code, framework = 'jest') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert test engineer. Generate comprehensive unit tests using ${framework}.`
      },
      {
        role: 'user',
        content: `Generate unit tests for this code:\n\n\`\`\`javascript\n${code}\n\`\`\`\n\nInclude edge cases and ensure good coverage.`
      }
    ];

    return await this.chat(messages);
  }

  async refactorSuggestions(code) {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert software architect. Suggest refactoring improvements.'
      },
      {
        role: 'user',
        content: `Suggest refactoring for this code to improve maintainability, readability, and performance:\n\n\`\`\`javascript\n${code}\n\`\`\``
      }
    ];

    return await this.chat(messages);
  }

  async explainCode(code) {
    const messages = [
      {
        role: 'system',
        content: 'You are a patient programming teacher. Explain code in clear, simple terms.'
      },
      {
        role: 'user',
        content: `Explain what this code does in simple terms:\n\n\`\`\`javascript\n${code}\n\`\`\``
      }
    ];

    return await this.chat(messages);
  }

  async warRoomDiscussion(task, context = {}) {
    // ULTRATHINK multi-agent system
    const personas = [
      { name: 'SessionOrchestrator', role: 'system', focus: 'team coordination and workflow management' },
      { name: 'Architect', role: 'system', focus: 'architecture and design patterns' },
      { name: 'Security', role: 'system', focus: 'security vulnerabilities and best practices' },
      { name: 'Performance', role: 'system', focus: 'performance optimization' },
      { name: 'Quality', role: 'system', focus: 'code quality and maintainability' },
      { name: 'TestEngineer', role: 'system', focus: 'testing strategies and test coverage' },
      { name: 'DevOps', role: 'system', focus: 'deployment, CI/CD, and infrastructure' },
      { name: 'AIDialogModerator', role: 'system', focus: 'synthesizing insights and conflict resolution' }
    ];

    const discussion = [];

    for (const persona of personas) {
      const messages = [
        {
          role: 'system',
          content: `You are ${persona.name}, an AI expert focused on ${persona.focus}. Provide your perspective on the given task.`
        },
        {
          role: 'user',
          content: `Task: ${task}\n\nContext: ${JSON.stringify(context)}\n\nWhat is your perspective as ${persona.name}?`
        }
      ];

      const response = await this.chat(messages);
      discussion.push({
        persona: persona.name,
        perspective: response
      });
    }

    return discussion;
  }

  parseAnalysisResponse(response) {
    // Try to parse structured response, fallback to raw text
    try {
      const lines = response.split('\n');
      const analysis = {
        quality: 'B',
        issues: [],
        security: [],
        performance: [],
        bestPractices: [],
        rawResponse: response
      };

      // Simple parsing logic
      let currentSection = '';
      lines.forEach(line => {
        if (line.includes('quality') || line.includes('score')) {
          const match = line.match(/[A-F][+-]?/);
          if (match) analysis.quality = match[0];
        } else if (line.includes('issue')) {
          currentSection = 'issues';
        } else if (line.includes('security')) {
          currentSection = 'security';
        } else if (line.includes('performance')) {
          currentSection = 'performance';
        } else if (line.includes('practice')) {
          currentSection = 'bestPractices';
        } else if (line.trim() && currentSection) {
          analysis[currentSection].push(line.trim());
        }
      });

      return analysis;
    } catch (error) {
      return {
        quality: 'B',
        issues: ['Unable to parse detailed analysis'],
        security: [],
        performance: [],
        bestPractices: [],
        rawResponse: response
      };
    }
  }

  getMockResponse(messages) {
    const lastMessage = messages[messages.length - 1].content;
    console.log('Using intelligent mock response for:', lastMessage.substring(0, 100) + '...');
    
    // Import the intelligent mock response generator
    try {
      const { getIntelligentMockResponse } = require('./ai-temp-fix.js');
      
      // Extract task and agent info
      if (lastMessage.includes('Task:') && lastMessage.includes('perspective')) {
        const task = lastMessage.match(/Task: ([^\n]+)/)?.[1] || 'the given task';
        const agentMatch = lastMessage.match(/from the perspective of (.*?)\./) || 
                          lastMessage.match(/as (.*?)[,\.]/) ||
                          lastMessage.match(/Agent: (.*?)[\n,]/);
        const agentName = agentMatch ? agentMatch[1] : 'Technical Expert';
        const language = lastMessage.includes('Tarefa:') ? 'pt-BR' : 'en-US';
        
        return getIntelligentMockResponse(agentName, task, language);
      }
    } catch (error) {
      console.log('Fallback to simple mock response');
    }
    
    // Original mock response logic as fallback
    if (lastMessage.includes('Task:') && lastMessage.includes('perspective')) {
      const task = lastMessage.match(/Task: ([^\n]+)/)?.[1] || 'the given task';
      
      if (lastMessage.includes('Architect')) {
        return `Analisando "${task}" sob a perspectiva arquitetural:

🏗️ **Estrutura Proposta:**
- Separação clara de responsabilidades usando padrão MVC/MVVM
- Microserviços para escalabilidade horizontal
- API RESTful com versionamento semântico
- Camada de cache distribuído (Redis)

📐 **Decisões Técnicas:**
1. Backend: Node.js com Express/NestJS
2. Frontend: React com Context API/Redux
3. Database: PostgreSQL + MongoDB para dados não-estruturados
4. Message Queue: RabbitMQ para processamento assíncrono

🔄 **Fluxo de Implementação:**
- Fase 1: Core da aplicação e autenticação
- Fase 2: Features principais
- Fase 3: Otimizações e monitoramento

Recomendo começar com um MVP focado na funcionalidade principal.`;
      }
      
      if (lastMessage.includes('Security')) {
        return `Análise de segurança para "${task}":

🔒 **Pontos Críticos:**
- Autenticação multi-fator (MFA) obrigatória
- Tokens JWT com refresh token strategy
- Rate limiting por IP e por usuário
- Sanitização de inputs em todas as entradas

🛡️ **Implementações Necessárias:**
1. OWASP Top 10 compliance
2. Criptografia AES-256 para dados sensíveis
3. HTTPS/TLS 1.3 obrigatório
4. WAF (Web Application Firewall)

🚨 **Monitoramento:**
- Logs centralizados com alertas
- Detecção de anomalias com ML
- Auditoria completa de ações
- Backup automático com criptografia

Sugiro implementar security by design desde o início.`;
      }
      
      if (lastMessage.includes('Performance')) {
        return `Otimizações de performance para "${task}":

⚡ **Estratégias Principais:**
- CDN global para assets estáticos
- Lazy loading e code splitting
- Database indexing otimizado
- Caching em múltiplas camadas

📊 **Métricas Target:**
1. Time to First Byte (TTFB) < 200ms
2. First Contentful Paint (FCP) < 1.5s
3. API response time < 100ms (p95)
4. 99.9% uptime SLA

🔧 **Técnicas de Otimização:**
- Query optimization com EXPLAIN ANALYZE
- Connection pooling configurado
- Compressão gzip/brotli
- Service Workers para offline-first

Recomendo implementar APM (Application Performance Monitoring) desde o início.`;
      }
      
      if (lastMessage.includes('Quality')) {
        return `Garantia de qualidade para "${task}":

✅ **Cobertura de Testes:**
- Unit tests: mínimo 80% coverage
- Integration tests para fluxos críticos
- E2E tests com Cypress/Playwright
- Performance tests com K6/JMeter

📋 **Padrões de Código:**
1. ESLint + Prettier configurados
2. Conventional Commits obrigatório
3. Code review com mínimo 2 aprovações
4. Documentation as Code

🔄 **CI/CD Pipeline:**
- Build automatizado no push
- Testes rodando em paralelo
- Deploy automático para staging
- Rollback automático em caso de falha

Sugiro implementar TDD desde o início do desenvolvimento.`;
      }
      
      if (lastMessage.includes('SessionOrchestrator')) {
        return `🎯 Orquestrando sessão para "${task}":

**Composição do Time:**
- Architect: Design e estrutura
- Security: Vulnerabilidades e proteção
- Performance: Otimização e escalabilidade
- Quality: Padrões e testes
- TestEngineer: Estratégias de teste
- DevOps: Deploy e infraestrutura

**Fluxo de Trabalho:**
1. Análise inicial de requisitos
2. Design arquitetural colaborativo
3. Implementação com pair programming
4. Testes contínuos durante desenvolvimento
5. Deploy automatizado com monitoramento

**Próximos Passos:**
Iniciando discussão colaborativa entre os agentes...`;
      }
      
      if (lastMessage.includes('TestEngineer')) {
        return `🧪 Estratégia de testes para "${task}":

**Pirâmide de Testes:**
- 70% Unit Tests (Jest/Mocha)
- 20% Integration Tests
- 10% E2E Tests (Cypress)

**Cobertura Específica:**
1. Testes de contrato para APIs
2. Testes de mutação para qualidade
3. Testes de carga com K6
4. Testes de segurança automatizados

**Automação:**
- Pre-commit hooks com Husky
- CI pipeline com testes paralelos
- Relatórios de cobertura no PR
- Testes de regressão visual

Recomendo implementar testes antes do código (TDD).`;
      }
      
      if (lastMessage.includes('DevOps')) {
        return `🚀 Estratégia DevOps para "${task}":

**Pipeline CI/CD:**
- GitHub Actions/GitLab CI
- Build multi-stage Docker
- Testes automatizados em cada push
- Deploy automático para ambientes

**Infraestrutura:**
1. Kubernetes para orquestração
2. Terraform para IaC
3. Prometheus + Grafana para monitoring
4. ELK Stack para logging

**Ambientes:**
- Development (auto-deploy)
- Staging (manual approval)
- Production (blue-green deployment)

**SRE Practices:**
- SLI/SLO/SLA definidos
- Runbooks automatizados
- Chaos engineering mensalmente

Sugiro começar com containers desde o início.`;
      }
      
      if (lastMessage.includes('AIDialogModerator')) {
        return `🤝 Síntese da discussão sobre "${task}":

**Consenso Alcançado:**
- Arquitetura modular e escalável
- Segurança implementada por design
- Performance como requisito não-funcional
- Qualidade garantida por automação

**Pontos de Atenção:**
1. Trade-off entre complexidade e manutenibilidade
2. Custo de infraestrutura vs performance
3. Time to market vs perfeição técnica

**Recomendação Final:**
Implementar em sprints iterativos, começando pelo MVP com foco em:
- Funcionalidade core
- Segurança básica
- Testes essenciais
- Deploy automatizado

A equipe está alinhada e pronta para começar!`;
      }
    }

    // Other mock responses (lower priority)
    if (lastMessage.includes('analyze')) {
      return {
        quality: 'B+',
        issues: [
          'Consider adding error handling for edge cases',
          'Some functions lack proper documentation'
        ],
        security: [
          'Input validation needed for user-provided data'
        ],
        performance: [
          'Consider using memoization for expensive computations',
          'Database queries could be optimized with indexing'
        ],
        bestPractices: [
          'Add TypeScript for better type safety',
          'Implement comprehensive unit tests'
        ],
        rawResponse: 'Mock analysis for development mode'
      };
    }

    if (lastMessage.includes('test') && !lastMessage.includes('Task:')) {
      return `describe('Example Test Suite', () => {
  it('should handle basic functionality', () => {
    expect(true).toBe(true);
  });

  it('should handle edge cases', () => {
    // Add edge case tests
  });
});`;
    }

    if (lastMessage.includes('refactor')) {
      return `Refactoring suggestions:
1. Extract complex logic into separate functions
2. Use dependency injection for better testability
3. Consider using the Strategy pattern for conditional logic
4. Add proper error boundaries`;
    }

    return 'This is a mock AI response. Configure OpenRouter API key for real AI responses.';
  }
}

export default new AIService();