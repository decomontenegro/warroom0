import React, { useState, useEffect } from 'react';
import './LLMConfiguration.css';

/**
 * Interface de Configuração Multi-LLM
 * Permite configurar Claude Code, Gemini CLI e OpenRouter
 */
export function LLMConfiguration({ onClose, onSave }) {
  const [config, setConfig] = useState({
    claude: { 
      enabled: false, 
      apiKey: '', 
      maxRequests: 100,
      status: 'unconfigured'
    },
    gemini: { 
      enabled: false, 
      authenticated: false, 
      maxRequests: 1000,
      status: 'unconfigured'
    },
    openrouter: { 
      enabled: true, 
      apiKey: '', 
      model: 'anthropic/claude-opus-4',
      status: 'unconfigured'
    }
  });
  
  const [stats, setStats] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState({});
  
  // Carregar configuração atual
  useEffect(() => {
    loadCurrentConfig();
    checkProvidersHealth();
  }, []);
  
  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/llm/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };
  
  const checkProvidersHealth = async () => {
    try {
      const response = await fetch('/api/llm/health');
      const health = await response.json();
      
      setConfig(prev => ({
        ...prev,
        claude: { ...prev.claude, status: health.claude?.status || 'error' },
        gemini: { ...prev.gemini, status: health.gemini?.status || 'error' },
        openrouter: { ...prev.openrouter, status: health.openrouter?.status || 'error' }
      }));
    } catch (error) {
      console.error('Erro ao verificar saúde dos providers:', error);
    }
  };
  
  const updateProvider = (provider, field, value) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };
  
  const authenticateGemini = async () => {
    try {
      // Abrir janela de autenticação do Google
      const authUrl = 'https://cli.gemini.dev/auth';
      const authWindow = window.open(authUrl, 'gemini-auth', 'width=600,height=600');
      
      // Aguardar callback de autenticação
      const checkAuth = setInterval(async () => {
        try {
          const response = await fetch('/api/llm/gemini/check-auth');
          const data = await response.json();
          
          if (data.authenticated) {
            clearInterval(checkAuth);
            authWindow.close();
            updateProvider('gemini', 'authenticated', true);
            updateProvider('gemini', 'status', 'healthy');
            showNotification('Gemini CLI autenticado com sucesso!', 'success');
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
      }, 2000);
      
      // Timeout após 2 minutos
      setTimeout(() => {
        clearInterval(checkAuth);
        authWindow.close();
      }, 120000);
      
    } catch (error) {
      console.error('Erro ao autenticar Gemini:', error);
      showNotification('Erro ao autenticar Gemini CLI', 'error');
    }
  };
  
  const testProvider = async (provider) => {
    setTesting(true);
    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));
    
    try {
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config: config[provider] })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({ ...prev, [provider]: 'success' }));
        updateProvider(provider, 'status', 'healthy');
        showNotification(`${provider} testado com sucesso!`, 'success');
      } else {
        setTestResults(prev => ({ ...prev, [provider]: 'error' }));
        updateProvider(provider, 'status', 'error');
        showNotification(`Erro ao testar ${provider}: ${result.error}`, 'error');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
      showNotification(`Erro ao testar ${provider}`, 'error');
    } finally {
      setTesting(false);
    }
  };
  
  const saveConfiguration = async () => {
    try {
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        showNotification('Configuração salva com sucesso!', 'success');
        if (onSave) onSave(config);
        if (onClose) onClose();
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      showNotification('Erro ao salvar configuração', 'error');
    }
  };
  
  const showNotification = (message, type) => {
    // Implementar notificação visual
    console.log(`[${type}] ${message}`);
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'error': return '❌';
      case 'disabled': return '⚫';
      default: return '❓';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'healthy': return 'status-healthy';
      case 'error': return 'status-error';
      case 'disabled': return 'status-disabled';
      default: return 'status-unknown';
    }
  };
  
  return (
    <div className="llm-config-modal">
      <div className="llm-config-panel">
        <div className="config-header">
          <h2>⚙️ Configuração Multi-LLM</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="config-intro">
          <p>Configure múltiplos provedores de LLM para otimizar o desempenho e custo do WarRoom.</p>
          <p>Cada agente será automaticamente direcionado para o LLM mais adequado.</p>
        </div>
        
        <div className="providers-grid">
          {/* Claude Code */}
          <div className="provider-card">
            <div className="provider-header">
              <div className="provider-title">
                <h3>🎭 Claude Code (Opus 4)</h3>
                <span className={`status-badge ${getStatusClass(config.claude.status)}`}>
                  {getStatusIcon(config.claude.status)} {config.claude.status}
                </span>
              </div>
              <label className="enable-switch">
                <input 
                  type="checkbox" 
                  checked={config.claude.enabled}
                  onChange={(e) => updateProvider('claude', 'enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="provider-info">
              <p className="provider-description">
                Melhor modelo para código (72.5% SWE-bench), 200k contexto.
                Ideal para arquitetura e decisões críticas.
              </p>
              
              <div className="config-field">
                <label>API Key</label>
                <input 
                  type="password"
                  placeholder="sk-ant-..."
                  value={config.claude.apiKey}
                  onChange={(e) => updateProvider('claude', 'apiKey', e.target.value)}
                  disabled={!config.claude.enabled}
                />
              </div>
              
              <div className="provider-stats">
                <div className="stat">
                  <span className="stat-label">Limite diário:</span>
                  <span className="stat-value">{config.claude.maxRequests}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Custo estimado:</span>
                  <span className="stat-value">$0.10-0.20/análise</span>
                </div>
              </div>
              
              <div className="assigned-agents">
                <h4>Agentes Designados:</h4>
                <p>Lead Architect, Chief Strategy Officer, Innovation Strategist, System Architects</p>
              </div>
              
              <button 
                className="test-btn"
                onClick={() => testProvider('claude')}
                disabled={!config.claude.enabled || !config.claude.apiKey || testing}
              >
                {testResults.claude === 'testing' ? '⏳ Testando...' : 
                 testResults.claude === 'success' ? '✅ Testado' :
                 testResults.claude === 'error' ? '❌ Falhou' : '🧪 Testar'}
              </button>
            </div>
          </div>
          
          {/* Gemini CLI */}
          <div className="provider-card">
            <div className="provider-header">
              <div className="provider-title">
                <h3>✨ Gemini CLI (2.5 Pro)</h3>
                <span className={`status-badge ${getStatusClass(config.gemini.status)}`}>
                  {getStatusIcon(config.gemini.status)} {config.gemini.status}
                </span>
              </div>
              <label className="enable-switch">
                <input 
                  type="checkbox" 
                  checked={config.gemini.enabled}
                  onChange={(e) => updateProvider('gemini', 'enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="provider-info">
              <p className="provider-description">
                1000 requests/dia grátis, 1M contexto, multimodal.
                Perfeito para desenvolvimento e design.
              </p>
              
              <div className="config-field">
                <button 
                  className={`auth-btn ${config.gemini.authenticated ? 'authenticated' : ''}`}
                  onClick={authenticateGemini}
                  disabled={!config.gemini.enabled || config.gemini.authenticated}
                >
                  {config.gemini.authenticated ? '✅ Autenticado' : '🔐 Autenticar com Google'}
                </button>
              </div>
              
              <div className="provider-stats">
                <div className="stat">
                  <span className="stat-label">Limite diário:</span>
                  <span className="stat-value">{config.gemini.maxRequests} (grátis!)</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Custo:</span>
                  <span className="stat-value free">GRÁTIS</span>
                </div>
              </div>
              
              <div className="assigned-agents">
                <h4>Agentes Designados:</h4>
                <p>Frontend/Backend Developers, UX/UI Designers, DevOps Engineers</p>
              </div>
              
              <button 
                className="test-btn"
                onClick={() => testProvider('gemini')}
                disabled={!config.gemini.enabled || !config.gemini.authenticated || testing}
              >
                {testResults.gemini === 'testing' ? '⏳ Testando...' : 
                 testResults.gemini === 'success' ? '✅ Testado' :
                 testResults.gemini === 'error' ? '❌ Falhou' : '🧪 Testar'}
              </button>
            </div>
          </div>
          
          {/* OpenRouter */}
          <div className="provider-card">
            <div className="provider-header">
              <div className="provider-title">
                <h3>🌐 OpenRouter (Fallback)</h3>
                <span className={`status-badge ${getStatusClass(config.openrouter.status)}`}>
                  {getStatusIcon(config.openrouter.status)} {config.openrouter.status}
                </span>
              </div>
              <label className="enable-switch">
                <input 
                  type="checkbox" 
                  checked={config.openrouter.enabled}
                  onChange={(e) => updateProvider('openrouter', 'enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="provider-info">
              <p className="provider-description">
                Acesso a múltiplos modelos, sistema de fallback.
                Para QA, testes e análises auxiliares.
              </p>
              
              <div className="config-field">
                <label>API Key</label>
                <input 
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={config.openrouter.apiKey}
                  onChange={(e) => updateProvider('openrouter', 'apiKey', e.target.value)}
                  disabled={!config.openrouter.enabled}
                />
              </div>
              
              <div className="config-field">
                <label>Modelo</label>
                <select 
                  value={config.openrouter.model}
                  onChange={(e) => updateProvider('openrouter', 'model', e.target.value)}
                  disabled={!config.openrouter.enabled}
                >
                  <option value="anthropic/claude-opus-4">Claude Opus 4</option>
                  <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                  <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="google/gemini-pro">Gemini Pro</option>
                </select>
              </div>
              
              <div className="provider-stats">
                <div className="stat">
                  <span className="stat-label">Custo:</span>
                  <span className="stat-value">Varia por modelo</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Uso:</span>
                  <span className="stat-value">Fallback & Auxiliar</span>
                </div>
              </div>
              
              <div className="assigned-agents">
                <h4>Agentes Designados:</h4>
                <p>QA Engineers, Test Engineers, Security Analysts, Support Agents</p>
              </div>
              
              <button 
                className="test-btn"
                onClick={() => testProvider('openrouter')}
                disabled={!config.openrouter.enabled || !config.openrouter.apiKey || testing}
              >
                {testResults.openrouter === 'testing' ? '⏳ Testando...' : 
                 testResults.openrouter === 'success' ? '✅ Testado' :
                 testResults.openrouter === 'error' ? '❌ Falhou' : '🧪 Testar'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Estatísticas Globais */}
        {stats && (
          <div className="global-stats">
            <h3>📊 Estatísticas de Uso</h3>
            <div className="stats-grid">
              {Object.entries(stats).map(([provider, providerStats]) => (
                <div key={provider} className="stat-card">
                  <h4>{provider}</h4>
                  <p>Requests: {providerStats.requests}</p>
                  <p>Taxa de Sucesso: {providerStats.successRate}%</p>
                  <p>Tempo Médio: {providerStats.avgTime}ms</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="config-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="save-btn" onClick={saveConfiguration}>
            💾 Salvar Configuração
          </button>
        </div>
        
        <div className="config-tips">
          <h4>💡 Dicas de Configuração:</h4>
          <ul>
            <li>Use Gemini CLI para aproveitar 1000 requests/dia grátis</li>
            <li>Configure Claude Code apenas para agentes críticos</li>
            <li>OpenRouter serve como fallback confiável</li>
            <li>O sistema otimiza automaticamente a distribuição baseada em performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LLMConfiguration;