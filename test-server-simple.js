import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3006

app.use(cors())
app.use(express.json())

app.get('/api/test', (req, res) => {
  console.log('Received test request')
  res.json({ status: 'ok', message: 'Backend is working!' })
})

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`)
})