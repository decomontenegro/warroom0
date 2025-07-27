import { useState, useEffect } from 'react'

function WarRoomSimpleTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    console.log('WarRoomSimpleTest mounted')
    
    // Teste de WebSocket
    try {
      const ws = new WebSocket('ws://localhost:3005/warroom-ws')
      
      ws.onopen = () => {
        console.log('WebSocket conectado!')
        setIsConnected(true)
      }
      
      ws.onerror = (err) => {
        console.error('WebSocket erro:', err)
        setError('Erro ao conectar WebSocket')
      }
      
      ws.onclose = () => {
        console.log('WebSocket desconectado')
        setIsConnected(false)
      }
      
      return () => {
        ws.close()
      }
    } catch (err) {
      console.error('Erro ao criar WebSocket:', err)
      setError(err.message)
    }
  }, [])
  
  return (
    <div style={{
      padding: '20px',
      background: '#0D1117',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🧪 WarRoom Simple Test</h1>
      
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: isConnected ? 'rgba(80, 250, 123, 0.2)' : 'rgba(255, 85, 85, 0.2)',
        borderRadius: '8px'
      }}>
        <h2>Status:</h2>
        <p>WebSocket: {isConnected ? '✅ Conectado' : '❌ Desconectado'}</p>
        {error && <p>Erro: {error}</p>}
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: 'rgba(0, 92, 235, 0.2)',
        borderRadius: '8px'
      }}>
        <h2>Testes realizados:</h2>
        <ul>
          <li>✅ React renderizado</li>
          <li>✅ useState funcionando</li>
          <li>✅ useEffect executado</li>
          <li>{isConnected ? '✅' : '⏳'} WebSocket testado</li>
        </ul>
      </div>
    </div>
  )
}

export default WarRoomSimpleTest