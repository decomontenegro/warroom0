import { useState, useEffect } from 'react'

function WarRoomMinimal() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    console.log('WarRoomMinimal mounted')
    
    const ws = new WebSocket('ws://localhost:3005/warroom-ws')
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Message received:', data)
      setMessages(prev => [...prev, data])
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
    
    ws.onclose = () => {
      console.log('WebSocket closed')
      setIsConnected(false)
    }
    
    return () => {
      ws.close()
    }
  }, [])
  
  const sendMessage = () => {
    console.log('Sending message:', input)
    setInput('')
  }
  
  return (
    <div style={{
      background: '#0D1117',
      color: 'white',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚀 WarRoom Minimal</h1>
      
      <div style={{
        background: isConnected ? 'rgba(80, 250, 123, 0.2)' : 'rgba(255, 85, 85, 0.2)',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        WebSocket: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </div>
      
      <div style={{
        background: 'rgba(22, 27, 34, 0.9)',
        padding: '20px',
        borderRadius: '10px',
        minHeight: '300px',
        marginBottom: '20px'
      }}>
        <h3>Mensagens:</h3>
        {messages.length === 0 ? (
          <p>Nenhuma mensagem ainda...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              {JSON.stringify(msg)}
            </div>
          ))
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '5px',
            color: 'white'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default WarRoomMinimal