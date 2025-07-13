import { useState } from 'react'
import WarRoomSmart from './WarRoomSmart'
import UltrathinkPanel from './UltrathinkPanel'
import './WarRoom.css'

function WarRoomIntegrated() {
  const [ultrathinkWorkflow, setUltrathinkWorkflow] = useState(null)
  
  const handleStartWorkflow = (workflow) => {
    console.log('Starting ULTRATHINK workflow:', workflow)
    setUltrathinkWorkflow(workflow)
    
    // Send workflow to War Room via WebSocket
    // This will be handled by the WarRoomSmart component
  }
  
  return (
    <div className="warroom-integrated">
      {/* UltraThink Panel at the top */}
      <div className="ultrathink-section">
        <UltrathinkPanel onStartWorkflow={handleStartWorkflow} />
      </div>
      
      {/* War Room Chat below */}
      <div className="warroom-section">
        <WarRoomSmart ultrathinkWorkflow={ultrathinkWorkflow} />
      </div>
    </div>
  )
}

export default WarRoomIntegrated