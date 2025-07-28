import React, { useState, useEffect } from 'react'
import { Icon } from './LucideIcons'
import './CodeGraphIntegration.css'
import { CodeAnalyzer } from '../../services/codeAnalyzer'

/**
 * Code Graph Integration Component
 * Integra análise de código com o War Room
 */
function CodeGraphIntegration({ 
  isOpen,
  onClose,
  onAnalysisComplete,
  currentContext = {}
}) {
  const [files, setFiles] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [selectedView, setSelectedView] = useState('upload') // upload, results, insights
  const [codeAnalyzer] = useState(() => new CodeAnalyzer())

  // Tipos de análise disponíveis
  const analysisTypes = [
    {
      id: 'architecture',
      name: 'Análise de Arquitetura',
      icon: 'Layers',
      description: 'Analisa a estrutura e organização do código',
      prompts: [
        'Como está organizada a arquitetura deste projeto?',
        'Quais são os principais componentes e suas responsabilidades?',
        'Existem problemas de acoplamento ou dependências circulares?'
      ]
    },
    {
      id: 'quality',
      name: 'Análise de Qualidade',
      icon: 'Shield',
      description: 'Avalia a qualidade e manutenibilidade do código',
      prompts: [
        'Qual o nível de qualidade deste código?',
        'Existem code smells ou anti-patterns?',
        'O código segue boas práticas de desenvolvimento?'
      ]
    },
    {
      id: 'performance',
      name: 'Análise de Performance',
      icon: 'Zap',
      description: 'Identifica gargalos e oportunidades de otimização',
      prompts: [
        'Existem problemas de performance neste código?',
        'Quais funções consomem mais recursos?',
        'Como otimizar o desempenho desta aplicação?'
      ]
    },
    {
      id: 'security',
      name: 'Análise de Segurança',
      icon: 'Lock',
      description: 'Detecta vulnerabilidades e riscos de segurança',
      prompts: [
        'Existem vulnerabilidades de segurança neste código?',
        'Os dados sensíveis estão sendo tratados adequadamente?',
        'Há riscos de injection ou exposição de dados?'
      ]
    },
    {
      id: 'dependencies',
      name: 'Análise de Dependências',
      icon: 'Network',
      description: 'Mapeia dependências e bibliotecas utilizadas',
      prompts: [
        'Quais são as principais dependências deste projeto?',
        'Existem dependências desatualizadas ou com vulnerabilidades?',
        'Como está o acoplamento entre módulos?'
      ]
    }
  ]

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files)
    setFiles(uploadedFiles)
  }

  // Handle folder upload
  const handleFolderUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files)
    setFiles(uploadedFiles)
  }

  // Analyze code
  const analyzeCode = async (analysisType) => {
    setIsAnalyzing(true)
    setSelectedView('results')

    try {
      // Analisar arquivos
      const analysis = await codeAnalyzer.analyzeFiles(files)
      
      // Gerar insights baseados no tipo de análise
      const insights = generateInsights(analysis, analysisType)
      
      setAnalysisResults({
        ...analysis,
        insights,
        analysisType,
        timestamp: new Date().toISOString()
      })
      
      // Notificar componente pai
      if (onAnalysisComplete) {
        onAnalysisComplete({
          analysis,
          insights,
          files: files.map(f => ({
            name: f.name,
            path: f.relativePath || f.name,
            size: f.size
          }))
        })
      }
    } catch (error) {
      console.error('Erro ao analisar código:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate insights based on analysis
  const generateInsights = (analysis, analysisType) => {
    const insights = []
    
    // Análise básica de métricas
    const totalNodes = analysis.nodes.length
    const totalLinks = analysis.links.length
    const avgComplexity = calculateAverageComplexity(analysis.nodes)
    
    insights.push({
      type: 'overview',
      title: 'Visão Geral do Projeto',
      content: `Analisados ${totalNodes} componentes com ${totalLinks} conexões. Complexidade média: ${avgComplexity.toFixed(2)}`
    })
    
    // Insights específicos por tipo
    switch (analysisType.id) {
      case 'architecture':
        insights.push(...generateArchitectureInsights(analysis))
        break
      case 'quality':
        insights.push(...generateQualityInsights(analysis))
        break
      case 'performance':
        insights.push(...generatePerformanceInsights(analysis))
        break
      case 'security':
        insights.push(...generateSecurityInsights(analysis))
        break
      case 'dependencies':
        insights.push(...generateDependencyInsights(analysis))
        break
    }
    
    return insights
  }

  const calculateAverageComplexity = (nodes) => {
    const complexitySum = nodes.reduce((sum, node) => {
      return sum + (node.metrics?.complexity || 5)
    }, 0)
    return complexitySum / nodes.length
  }

  const generateArchitectureInsights = (analysis) => {
    const insights = []
    
    // Identificar componentes centrais (muitas conexões)
    const centralComponents = analysis.nodes
      .map(node => ({
        ...node,
        connectionCount: analysis.links.filter(l => 
          l.source === node.id || l.target === node.id
        ).length
      }))
      .sort((a, b) => b.connectionCount - a.connectionCount)
      .slice(0, 5)
    
    if (centralComponents.length > 0) {
      insights.push({
        type: 'architecture',
        title: 'Componentes Centrais',
        content: 'Os seguintes componentes são centrais na arquitetura:',
        items: centralComponents.map(c => ({
          name: c.label,
          description: `${c.connectionCount} conexões`
        }))
      })
    }
    
    // Detectar possíveis problemas
    const circularDeps = detectCircularDependencies(analysis.links)
    if (circularDeps.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Dependências Circulares Detectadas',
        content: 'Foram encontradas dependências circulares que podem causar problemas:',
        items: circularDeps
      })
    }
    
    return insights
  }

  const generateQualityInsights = (analysis) => {
    const insights = []
    
    // Arquivos muito grandes
    const largeFiles = analysis.nodes
      .filter(n => n.type === 'file' && n.metrics?.lines > 500)
      .map(n => ({
        name: n.label,
        description: `${n.metrics.lines} linhas`
      }))
    
    if (largeFiles.length > 0) {
      insights.push({
        type: 'quality',
        title: 'Arquivos Muito Grandes',
        content: 'Considere refatorar estes arquivos para melhor manutenibilidade:',
        items: largeFiles
      })
    }
    
    // Complexidade alta
    const complexNodes = analysis.nodes
      .filter(n => n.metrics?.complexity > 10)
      .map(n => ({
        name: n.label,
        description: `Complexidade: ${n.metrics.complexity}`
      }))
    
    if (complexNodes.length > 0) {
      insights.push({
        type: 'quality',
        title: 'Alta Complexidade Ciclomática',
        content: 'Estes componentes têm alta complexidade:',
        items: complexNodes
      })
    }
    
    return insights
  }

  const generatePerformanceInsights = (analysis) => {
    const insights = []
    
    // Identificar hotspots
    const hotspots = analysis.nodes
      .filter(n => n.metrics?.cpu > 70 || n.metrics?.memory > 70)
      .map(n => ({
        name: n.label,
        description: `CPU: ${n.metrics.cpu}%, Memória: ${n.metrics.memory}%`
      }))
    
    if (hotspots.length > 0) {
      insights.push({
        type: 'performance',
        title: 'Hotspots de Performance',
        content: 'Estes componentes consomem mais recursos:',
        items: hotspots
      })
    }
    
    return insights
  }

  const generateSecurityInsights = (analysis) => {
    const insights = []
    
    // Verificar padrões suspeitos
    const suspiciousPatterns = [
      { pattern: 'eval', risk: 'Code injection' },
      { pattern: 'innerHTML', risk: 'XSS vulnerability' },
      { pattern: 'password', risk: 'Hardcoded credentials' }
    ]
    
    // Simulação - em produção, faria análise real do conteúdo
    insights.push({
      type: 'security',
      title: 'Análise de Segurança',
      content: 'Recomenda-se uma análise mais profunda com ferramentas especializadas como SAST/DAST'
    })
    
    return insights
  }

  const generateDependencyInsights = (analysis) => {
    const insights = []
    
    // Contar dependências externas
    const externalDeps = analysis.links.filter(l => l.type === 'external').length
    
    insights.push({
      type: 'dependencies',
      title: 'Dependências Externas',
      content: `O projeto tem ${externalDeps} dependências externas. Verifique se todas são necessárias e estão atualizadas.`
    })
    
    return insights
  }

  const detectCircularDependencies = (links) => {
    // Algoritmo simplificado para detectar ciclos
    const cycles = []
    // TODO: Implementar detecção real de ciclos
    return cycles
  }

  // Generate prompt for War Room
  const generateWarRoomPrompt = (analysisType, insights) => {
    const type = analysisTypes.find(t => t.id === analysisType.id)
    let prompt = `Analisei o código do projeto e identifiquei os seguintes pontos:\n\n`
    
    insights.forEach(insight => {
      prompt += `**${insight.title}**\n${insight.content}\n`
      if (insight.items) {
        insight.items.forEach(item => {
          prompt += `- ${item.name}: ${item.description}\n`
        })
      }
      prompt += '\n'
    })
    
    prompt += `\nCom base nesta análise, ${type.prompts[0]}`
    
    return prompt
  }

  if (!isOpen) return null

  return (
    <div className="code-graph-integration">
      <div className="cgi-header">
        <h2>
          <Icon name="Code" size={24} />
          Integração com Code Graph
        </h2>
        <button className="cgi-close" onClick={onClose}>
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="cgi-tabs">
        <button 
          className={`cgi-tab ${selectedView === 'upload' ? 'active' : ''}`}
          onClick={() => setSelectedView('upload')}
        >
          <Icon name="Upload" size={16} />
          Upload
        </button>
        <button 
          className={`cgi-tab ${selectedView === 'results' ? 'active' : ''}`}
          onClick={() => setSelectedView('results')}
          disabled={!analysisResults}
        >
          <Icon name="BarChart3" size={16} />
          Resultados
        </button>
        <button 
          className={`cgi-tab ${selectedView === 'insights' ? 'active' : ''}`}
          onClick={() => setSelectedView('insights')}
          disabled={!analysisResults}
        >
          <Icon name="Lightbulb" size={16} />
          Insights
        </button>
      </div>

      {selectedView === 'upload' && (
        <div className="cgi-upload-view">
          <div className="cgi-upload-area">
            <Icon name="FolderOpen" size={48} />
            <h3>Faça upload do seu código</h3>
            <p>Selecione arquivos ou uma pasta completa para análise</p>
            
            <div className="cgi-upload-buttons">
              <label className="cgi-upload-btn">
                <Icon name="File" size={16} />
                Selecionar Arquivos
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload}
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs,.go,.rs,.php"
                />
              </label>
              
              <label className="cgi-upload-btn">
                <Icon name="Folder" size={16} />
                Selecionar Pasta
                <input 
                  type="file" 
                  webkitdirectory="true"
                  directory="true"
                  multiple 
                  onChange={handleFolderUpload}
                />
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <>
              <div className="cgi-file-list">
                <h4>Arquivos selecionados ({files.length})</h4>
                <div className="cgi-files">
                  {files.slice(0, 10).map((file, idx) => (
                    <div key={idx} className="cgi-file-item">
                      <Icon name="FileCode" size={16} />
                      <span>{file.name}</span>
                      <span className="cgi-file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  {files.length > 10 && (
                    <div className="cgi-file-more">
                      ... e mais {files.length - 10} arquivos
                    </div>
                  )}
                </div>
              </div>

              <div className="cgi-analysis-types">
                <h4>Escolha o tipo de análise</h4>
                <div className="cgi-type-grid">
                  {analysisTypes.map(type => (
                    <div 
                      key={type.id}
                      className="cgi-type-card"
                      onClick={() => analyzeCode(type)}
                    >
                      <Icon name={type.icon} size={24} />
                      <h5>{type.name}</h5>
                      <p>{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {selectedView === 'results' && analysisResults && (
        <div className="cgi-results-view">
          <div className="cgi-results-header">
            <h3>Resultados da Análise</h3>
            <span className="cgi-timestamp">
              {new Date(analysisResults.timestamp).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="cgi-metrics-grid">
            <div className="cgi-metric">
              <Icon name="FileCode" size={20} />
              <div>
                <span className="cgi-metric-value">{analysisResults.nodes.length}</span>
                <span className="cgi-metric-label">Componentes</span>
              </div>
            </div>
            
            <div className="cgi-metric">
              <Icon name="Link" size={20} />
              <div>
                <span className="cgi-metric-value">{analysisResults.links.length}</span>
                <span className="cgi-metric-label">Conexões</span>
              </div>
            </div>
            
            <div className="cgi-metric">
              <Icon name="Activity" size={20} />
              <div>
                <span className="cgi-metric-value">
                  {calculateAverageComplexity(analysisResults.nodes).toFixed(1)}
                </span>
                <span className="cgi-metric-label">Complexidade Média</span>
              </div>
            </div>
            
            <div className="cgi-metric">
              <Icon name="Files" size={20} />
              <div>
                <span className="cgi-metric-value">{files.length}</span>
                <span className="cgi-metric-label">Arquivos</span>
              </div>
            </div>
          </div>

          <div className="cgi-graph-preview">
            <h4>Visualização do Grafo</h4>
            <div className="cgi-graph-placeholder">
              <Icon name="Network" size={48} />
              <p>Prévia do grafo de código</p>
              <button className="cgi-view-graph-btn">
                <Icon name="Maximize2" size={16} />
                Ver Grafo Completo
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'insights' && analysisResults && (
        <div className="cgi-insights-view">
          <div className="cgi-insights-header">
            <h3>Insights da Análise</h3>
            <button 
              className="cgi-send-to-warroom"
              onClick={() => {
                const prompt = generateWarRoomPrompt(
                  analysisResults.analysisType,
                  analysisResults.insights
                )
                onAnalysisComplete({ prompt })
                onClose()
              }}
            >
              <Icon name="Send" size={16} />
              Enviar para War Room
            </button>
          </div>

          <div className="cgi-insights-list">
            {analysisResults.insights.map((insight, idx) => (
              <div key={idx} className={`cgi-insight ${insight.type}`}>
                <div className="cgi-insight-header">
                  <h4>{insight.title}</h4>
                  {insight.type === 'warning' && <Icon name="AlertTriangle" size={16} />}
                  {insight.type === 'quality' && <Icon name="Shield" size={16} />}
                  {insight.type === 'performance' && <Icon name="Zap" size={16} />}
                  {insight.type === 'security' && <Icon name="Lock" size={16} />}
                </div>
                
                <p>{insight.content}</p>
                
                {insight.items && (
                  <ul className="cgi-insight-items">
                    {insight.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <strong>{item.name}:</strong> {item.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="cgi-suggested-prompts">
            <h4>Prompts Sugeridos</h4>
            {analysisTypes
              .find(t => t.id === analysisResults.analysisType.id)
              ?.prompts.map((prompt, idx) => (
                <button 
                  key={idx}
                  className="cgi-prompt-suggestion"
                  onClick={() => {
                    onAnalysisComplete({ 
                      prompt: `${prompt}\n\nContexto: ${analysisResults.insights[0]?.content}` 
                    })
                    onClose()
                  }}
                >
                  {prompt}
                </button>
              ))}
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="cgi-loading">
          <Icon name="Loader2" size={32} className="cgi-spinner" />
          <p>Analisando código...</p>
        </div>
      )}
    </div>
  )
}

export default CodeGraphIntegration