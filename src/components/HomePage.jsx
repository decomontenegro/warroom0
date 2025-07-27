import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🧠 War Room 3.0</h1>
        <p className="subtitle">Sistema Multi-Agente com 100+ Especialistas em Tech</p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">💬</div>
            <h3>Chat Individual</h3>
            <p>Converse com cada especialista separadamente</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">👥</div>
            <h3>Todos os Especialistas</h3>
            <p>Todos os especialistas respondendo juntos</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Resumos ajustáveis</h3>
            <p>Resumos ajustáveis das discussões</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔧</div>
            <h3>Construa perguntas complexas</h3>
            <p>Construa perguntas complexas facilmente</p>
          </div>
        </div>
        
        <button 
          className="cta-button"
          onClick={() => navigate('/warroom3')}
        >
          Acessar War Room 3.0 →
        </button>
        
        <div className="info-section">
          <h2>Como funciona?</h2>
          <ol>
            <li>Escolha um especialista ou use a sala coletiva</li>
            <li>Faça sua pergunta técnica</li>
            <li>Receba respostas especializadas em tempo real</li>
            <li>Use o resumo inteligente para consolidar informações</li>
          </ol>
        </div>
        
        <div className="tech-stack">
          <p>Powered by: React • WebSocket • AI Multi-Agent System</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage