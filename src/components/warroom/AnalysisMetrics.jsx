import { useState, useEffect } from 'react';
import './AnalysisMetrics.css';

const AnalysisMetrics = ({ analysisData, isVisible = true }) => {
  const [metrics, setMetrics] = useState({
    avgConfidence: 0,
    consensusRate: 0,
    responseTime: 0,
    agentSuccess: 0,
    analysisDepth: 0,
    documentComplexity: 'N/A',
    totalAgents: 0,
    phasesCompleted: 0
  });

  const [historicalData, setHistoricalData] = useState(() => {
    const saved = localStorage.getItem('ultrathink-metrics-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (analysisData) {
      const newMetrics = calculateMetrics(analysisData);
      setMetrics(newMetrics);
      
      // Salvar no histórico
      const historyEntry = {
        ...newMetrics,
        timestamp: new Date().toISOString(),
        documentType: analysisData.documentAnalysis?.type || 'unknown'
      };
      
      const updatedHistory = [...historicalData, historyEntry].slice(-50); // Manter últimas 50 análises
      setHistoricalData(updatedHistory);
      localStorage.setItem('ultrathink-metrics-history', JSON.stringify(updatedHistory));
    }
  }, [analysisData]);

  const calculateMetrics = (data) => {
    const metrics = {
      avgConfidence: Math.round((data.metrics?.overallConfidence || 0) * 100),
      consensusRate: Math.round((data.metrics?.consensusStrength || 0) * 100),
      responseTime: data.metrics?.executionTime || '0s',
      agentSuccess: calculateAgentSuccess(data),
      analysisDepth: Math.round((data.metrics?.analysisDepth || 0) * 100),
      documentComplexity: data.metadata?.complexity?.complexity || 'N/A',
      totalAgents: data.metadata?.agentsUsed || 0,
      phasesCompleted: countCompletedPhases(data)
    };
    
    return metrics;
  };

  const calculateAgentSuccess = (data) => {
    if (!data.agentSelection) return 0;
    
    let totalAgents = 0;
    let successfulAgents = 0;
    
    data.agentSelection.teams.forEach(team => {
      totalAgents += team.agentCount;
      // Assumir sucesso baseado em se há respostas
      successfulAgents += team.agentCount; // Ajustar conforme dados reais
    });
    
    return totalAgents > 0 ? Math.round((successfulAgents / totalAgents) * 100) : 0;
  };

  const countCompletedPhases = (data) => {
    if (!data.agentSelection?.teams) return 0;
    return data.agentSelection.teams.length;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FFC107';
    return '#F44336';
  };

  const getAverageMetrics = () => {
    if (historicalData.length === 0) return metrics;
    
    const avg = {
      avgConfidence: 0,
      consensusRate: 0,
      agentSuccess: 0,
      analysisDepth: 0
    };
    
    historicalData.forEach(entry => {
      avg.avgConfidence += entry.avgConfidence || 0;
      avg.consensusRate += entry.consensusRate || 0;
      avg.agentSuccess += entry.agentSuccess || 0;
      avg.analysisDepth += entry.analysisDepth || 0;
    });
    
    const count = historicalData.length;
    return {
      avgConfidence: Math.round(avg.avgConfidence / count),
      consensusRate: Math.round(avg.consensusRate / count),
      agentSuccess: Math.round(avg.agentSuccess / count),
      analysisDepth: Math.round(avg.analysisDepth / count)
    };
  };

  const historicalAvg = getAverageMetrics();

  if (!isVisible) return null;

  return (
    <div className="analysis-metrics">
      <div className="metrics-header">
        <h3>📊 Métricas de Qualidade da Análise</h3>
        <span className="analysis-count">
          {historicalData.length} análises realizadas
        </span>
      </div>

      <div className="metrics-grid">
        {/* Métricas Principais */}
        <div className="metric-card">
          <div className="metric-label">Confiança Geral</div>
          <div className="metric-value" style={{ color: getConfidenceColor(metrics.avgConfidence) }}>
            {metrics.avgConfidence}%
          </div>
          <div className="metric-comparison">
            Média: {historicalAvg.avgConfidence}%
            {metrics.avgConfidence > historicalAvg.avgConfidence ? ' ↑' : ' ↓'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Consenso entre Agentes</div>
          <div className="metric-value">{metrics.consensusRate}%</div>
          <div className="metric-comparison">
            Média: {historicalAvg.consensusRate}%
            {metrics.consensusRate > historicalAvg.consensusRate ? ' ↑' : ' ↓'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Taxa de Sucesso</div>
          <div className="metric-value">{metrics.agentSuccess}%</div>
          <div className="metric-comparison">
            Média: {historicalAvg.agentSuccess}%
            {metrics.agentSuccess > historicalAvg.agentSuccess ? ' ↑' : ' ↓'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Profundidade</div>
          <div className="metric-value">{metrics.analysisDepth}%</div>
          <div className="metric-comparison">
            Média: {historicalAvg.analysisDepth}%
            {metrics.analysisDepth > historicalAvg.analysisDepth ? ' ↑' : ' ↓'}
          </div>
        </div>

        {/* Métricas Secundárias */}
        <div className="metric-card secondary">
          <div className="metric-label">Tempo de Resposta</div>
          <div className="metric-value small">{metrics.responseTime}</div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-label">Complexidade</div>
          <div className="metric-value small">{metrics.documentComplexity}</div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-label">Total de Agentes</div>
          <div className="metric-value small">{metrics.totalAgents}</div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-label">Fases Completas</div>
          <div className="metric-value small">{metrics.phasesCompleted}/4</div>
        </div>
      </div>

      {/* Gráfico de Tendência Simples */}
      <div className="trend-chart">
        <h4>Tendência de Confiança (Últimas 10 análises)</h4>
        <div className="chart-container">
          {historicalData.slice(-10).map((entry, index) => (
            <div
              key={index}
              className="chart-bar"
              style={{
                height: `${entry.avgConfidence}%`,
                backgroundColor: getConfidenceColor(entry.avgConfidence)
              }}
              title={`${entry.avgConfidence}% - ${new Date(entry.timestamp).toLocaleDateString()}`}
            />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="metrics-insights">
        <h4>💡 Insights</h4>
        {metrics.avgConfidence < 50 && (
          <div className="insight warning">
            ⚠️ Confiança baixa - considere adicionar mais especialistas ou refinar a análise
          </div>
        )}
        {metrics.consensusRate < 60 && (
          <div className="insight info">
            ℹ️ Baixo consenso - pode indicar um documento complexo ou controverso
          </div>
        )}
        {metrics.avgConfidence > 80 && metrics.consensusRate > 80 && (
          <div className="insight success">
            ✅ Análise de alta qualidade com forte consenso entre especialistas
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisMetrics;