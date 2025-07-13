import { useState, useEffect, useRef } from 'react'
import './WarRoomChat.css'

function WarRoomSimple() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)
  
  useEffect(() => {
    // Conectar ao mesmo servidor que o CLI usa
    const ws = new WebSocket('ws://localhost:3005/warroom-ws')
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('✅ Conectado ao War Room')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'agent-response' || data.type === 'agent-message') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'agent',
          agent: data.agent,
          content: data.content || data.message,
          timestamp: new Date()
        }])
      }
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      setTimeout(() => window.location.reload(), 3000)
    }
    
    wsRef.current = ws
    
    // Mensagem inicial
    setMessages([{
      id: 1,
      type: 'system',
      content: `🧠 War Room - Vibe Code Assistant
      
Eu sou seu assistente para vibe code. Pergunte qualquer coisa sobre seu código:
• "revisar este arquivo"
• "como debugar esse erro"  
• "melhorar performance aqui"
• "criar testes para isso"

Ou use o CLI com: npm run warroom`,
      timestamp: new Date()
    }])
    
    return () => ws.close()
  }, [])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !isConnected) return
    
    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    
    // Enviar para o servidor
    wsRef.current.send(JSON.stringify({
      type: 'agent-request',
      agent: { name: 'CodeAssistant', role: 'Vibe Code Helper' },
      task: userMessage,
      capabilities: ['Code Review', 'Debugging', 'Performance', 'Testing']
    }))
  }
  
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header simples */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          🧠 War Room
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            CLI: npm run warroom
          </span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444'
          }}/>
        </div>
      </div>
      
      {/* Mensagens */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            maxWidth: msg.type === 'user' ? '70%' : '85%',
            alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.agent && (
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.7,
                marginBottom: '0.25rem'
              }}>
                {msg.agent}
              </div>
            )}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: msg.type === 'user' ? '#3b82f6' : 
                        msg.type === 'system' ? 'rgba(16, 185, 129, 0.1)' : 
                        'rgba(255,255,255,0.05)',
              border: msg.type === 'system' ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '1rem'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pergunte sobre seu código..."
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!isConnected || !inputValue.trim()}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '24px',
            background: isConnected ? '#3b82f6' : '#6b7280',
            border: 'none',
            color: '#fff',
            fontWeight: '600',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: !inputValue.trim() ? 0.5 : 1
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default WarRoomSimple