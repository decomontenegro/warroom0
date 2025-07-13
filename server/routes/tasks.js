import express from 'express'

const router = express.Router()

// In-memory storage for demo
let tasks = []
let sessions = []

// Create new task/session
router.post('/session', (req, res) => {
  const { request, type } = req.body
  
  const session = {
    id: Date.now(),
    request,
    type,
    status: 'analyzing',
    startTime: new Date().toISOString(),
    agents: [],
    log: []
  }
  
  sessions.push(session)
  
  // Simulate agent selection after 2 seconds
  setTimeout(() => {
    session.status = 'in-progress'
    session.agents = ['SessionOrchestrator', 'AIDialogModerator', 'ValidationPipeline']
    session.log.push({
      time: new Date().toISOString(),
      message: `Team composed: ${session.agents.join(', ')}`
    })
  }, 2000)
  
  res.json(session)
})

// Get session status
router.get('/session/:id', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id))
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  res.json(session)
})

// Get all sessions
router.get('/sessions', (req, res) => {
  res.json(sessions)
})

// Update session
router.put('/session/:id', (req, res) => {
  const sessionId = parseInt(req.params.id)
  const session = sessions.find(s => s.id === sessionId)
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  Object.assign(session, req.body)
  res.json(session)
})

// Get agents
router.get('/agents', (req, res) => {
  const agents = [
    { id: 1, name: 'SessionOrchestrator', status: 'idle', capability: 'Team composition and session management' },
    { id: 2, name: 'AIDialogModerator', status: 'idle', capability: 'Conversation flow and conflict resolution' },
    { id: 3, name: 'ValidationPipeline', status: 'idle', capability: 'Decision validation and quality assurance' },
    { id: 4, name: 'CodeAnalyzer', status: 'idle', capability: 'Code analysis and pattern detection' },
    { id: 5, name: 'RequirementsAnalyzer', status: 'idle', capability: 'Requirements extraction and validation' },
    { id: 6, name: 'TestGenerator', status: 'idle', capability: 'Test case generation and validation' }
  ]
  
  res.json(agents)
})

export default router