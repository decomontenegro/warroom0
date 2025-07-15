import React from 'react';
import { agentCategories, getCategoryLegend } from './agentCategories';
import './AgentColorSystem.css';

/**
 * Componente de Legenda de Cores dos Agentes
 * Mostra as categorias e suas cores para fácil identificação
 */
export function AgentColorLegend({ collapsed = false, onToggle }) {
  const legend = getCategoryLegend();
  
  if (collapsed) {
    return (
      <button 
        className="agent-legend-toggle"
        onClick={onToggle}
        title="Mostrar legenda de cores"
      >
        🎨 Legenda
      </button>
    );
  }
  
  return (
    <div className="agent-legend-container">
      <div className="agent-legend-header">
        <h4>🎨 Categorias de Especialistas</h4>
        <button 
          className="agent-legend-close"
          onClick={onToggle}
          title="Esconder legenda"
        >
          ✕
        </button>
      </div>
      
      <div className="agent-legend">
        {legend.map(category => (
          <div key={category.key} className="agent-legend-item">
            <div 
              className="agent-legend-color"
              style={{ background: category.color }}
            />
            <div className="agent-legend-info">
              <span className="agent-legend-icon">{category.icon}</span>
              <span className="agent-legend-name">{category.name}</span>
              <span className="agent-legend-count">({category.count})</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="agent-legend-tip">
        💡 Cada especialista tem uma variação de tom dentro da sua categoria
      </div>
    </div>
  );
}

/**
 * Badge visual para mostrar o agente com sua cor
 */
export function AgentBadge({ agentName, showCategory = true, size = 'medium' }) {
  const badge = getAgentBadge(agentName);
  
  return (
    <div 
      className={`agent-badge agent-badge-${size} ${badge.className}`}
      style={{ 
        background: badge.color,
        color: getContrastColor(badge.color)
      }}
    >
      <span className="agent-badge-icon">{badge.icon}</span>
      <span className="agent-badge-name">{agentName}</span>
      {showCategory && (
        <span className="agent-badge-category">• {badge.categoryName}</span>
      )}
    </div>
  );
}

/**
 * Calcula cor de contraste para texto
 */
function getContrastColor(hexColor) {
  // Converte hex para RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna preto para cores claras, branco para cores escuras
  return luminance > 0.5 ? '#0D1117' : '#FFFFFF';
}

/**
 * Exemplo de uso no chat
 */
export function ColoredAgentMessage({ agent, message, timestamp }) {
  const category = getAgentCategory(agent.name);
  const color = getAgentColor(agent.name);
  
  return (
    <div className={`message agent-message ${category.key}`}>
      <div className="message-header">
        <AgentBadge agentName={agent.name} size="small" />
        <span className="message-time">{timestamp}</span>
      </div>
      
      <div 
        className="message-content"
        style={{ 
          borderLeft: `4px solid ${color}`,
          background: `linear-gradient(90deg, ${hexToRgba(color, 0.1)} 0%, transparent 50%)`
        }}
      >
        {message}
      </div>
    </div>
  );
}

/**
 * Converte hex para rgba
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helpers exportados
export { getAgentCategory, getAgentColor, getAgentBadge } from './agentCategories';