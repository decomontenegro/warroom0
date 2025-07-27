import { useState } from 'react'

function WarRoom3Test() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ 
      background: 'white', 
      color: 'black', 
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1>WarRoom3 Test Component</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      <button onClick={() => setCount(count + 1)}>
        Cliques: {count}
      </button>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2>Debug Info:</h2>
        <p>Window location: {window.location.href}</p>
        <p>Component mounted: Yes</p>
      </div>
    </div>
  )
}

export default WarRoom3Test