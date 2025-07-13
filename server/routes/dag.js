import express from 'express'

const router = express.Router()

// Get DAG structure
router.get('/structure', (req, res) => {
  // Mock data - em produção, isso viria da análise real do código
  const dagStructure = {
    nodes: [
      { id: 'main.ts', type: 'file', label: 'main.ts', metrics: { cpu: 15, memory: 23, calls: 45 } },
      { id: 'server.js', type: 'file', label: 'server.js', metrics: { cpu: 25, memory: 35, calls: 78 } },
      { id: 'AdaptiveWarRoom', type: 'warroom', label: 'AdaptiveWarRoom', metrics: { cpu: 45, memory: 52, calls: 124 } },
      { id: 'SessionOrchestrator', type: 'agent', label: 'SessionOrchestrator', metrics: { cpu: 35, memory: 41, calls: 89 } },
    ],
    links: [
      { source: 'main.ts', target: 'server.js', type: 'execution' },
      { source: 'server.js', target: 'AdaptiveWarRoom', type: 'execution' },
      { source: 'AdaptiveWarRoom', target: 'SessionOrchestrator', type: 'execution' },
    ]
  }
  
  res.json(dagStructure)
})

// Get real-time metrics
router.get('/metrics', (req, res) => {
  const metrics = {
    cpu: Math.round(Math.random() * 30 + 40),
    memory: Math.round(Math.random() * 20 + 50),
    throughput: Math.round(Math.random() * 25 + 65),
    timestamp: new Date().toISOString()
  }
  
  res.json(metrics)
})

// Update node position
router.post('/node/:id/position', (req, res) => {
  const { id } = req.params
  const { x, y } = req.body
  
  // Em produção, salvar a posição no banco de dados
  console.log(`Updating position for node ${id}: (${x}, ${y})`)
  
  res.json({ success: true })
})

export default router