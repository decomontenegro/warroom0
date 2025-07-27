import { useState } from 'react'

function WarRoomTest() {
  const [message, setMessage] = useState('WarRoom Test Component')
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#0D1117', 
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🧪 WarRoom Test Component</h1>
      <p>{message}</p>
      <button 
        onClick={() => setMessage('Button clicked!')}
        style={{
          background: '#FF9800',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Test Button
      </button>
      
      <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0, 92, 235, 0.2)', borderRadius: '8px' }}>
        <h2>Component Status:</h2>
        <p>✅ React is working</p>
        <p>✅ Component rendered</p>
        <p>✅ State management working</p>
      </div>
    </div>
  )
}

export default WarRoomTest