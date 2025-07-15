import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createServer } from 'http'
import dagRoutes from './routes/dag.js'
import taskRoutes from './routes/tasks.js'
import uploadRoutes from './routes/upload.js'
import warRoomRoutes, { createWarRoomWebSocket } from './routes/warroom.js'
import llmRoutes from './routes/llm.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3005

// Create HTTP server for WebSocket support
const server = createServer(app)

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// API Routes
app.use('/api/dag', dagRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/warroom', warRoomRoutes)
app.use('/api/llm', llmRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Create WebSocket server
createWarRoomWebSocket(server)

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`War Room WebSocket available at ws://localhost:${PORT}/warroom-ws`)
})