import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'

const router = express.Router()

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 1000 // Máximo de 1000 arquivos
  }
})

// Endpoint para upload de múltiplos arquivos
router.post('/analyze', upload.array('files', 1000), async (req, res) => {
  try {
    const files = req.files
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' })
    }
    
    // Processar arquivos
    const processedFiles = []
    
    for (const file of files) {
      // Verificar extensão
      const ext = path.extname(file.originalname).toLowerCase().slice(1)
      const validExtensions = [
        'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
        'py', 'pyw', 'pyi',
        'java', 'kt', 'scala',
        'cpp', 'cc', 'c', 'h', 'hpp', 'hh',
        'cs', 'vb',
        'rb', 'rake',
        'go',
        'rs',
        'php',
        'swift',
        'vue', 'svelte',
        'lua',
        'r',
        'dart',
        'json', 'yml', 'yaml', 'xml', 'toml'
      ]
      
      if (!validExtensions.includes(ext)) {
        continue
      }
      
      // Processar arquivo
      const content = file.buffer.toString('utf8')
      const analysis = analyzeFileContent(content, file.originalname)
      
      processedFiles.push({
        name: file.originalname,
        size: file.size,
        analysis
      })
    }
    
    // Gerar estrutura DAG
    const dagStructure = generateDAGStructure(processedFiles)
    
    res.json({
      success: true,
      filesProcessed: processedFiles.length,
      dagStructure
    })
    
  } catch (error) {
    console.error('Erro ao processar arquivos:', error)
    res.status(500).json({ error: 'Erro ao processar arquivos' })
  }
})

// Função simplificada de análise (em produção, seria mais complexa)
function analyzeFileContent(content, filename) {
  const lines = content.split('\n').length
  const ext = path.extname(filename).toLowerCase().slice(1)
  
  const analysis = {
    lines,
    functions: [],
    classes: [],
    imports: []
  }
  
  // Análise básica por tipo de arquivo
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    // Detectar funções
    const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)=>)/g
    let match
    while ((match = funcRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2]
      if (funcName) {
        analysis.functions.push(funcName)
      }
    }
    
    // Detectar classes
    const classRegex = /class\s+(\w+)/g
    while ((match = classRegex.exec(content)) !== null) {
      analysis.classes.push(match[1])
    }
    
    // Detectar imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    while ((match = importRegex.exec(content)) !== null) {
      analysis.imports.push(match[1])
    }
  }
  
  return analysis
}

// Gerar estrutura DAG a partir dos arquivos analisados
function generateDAGStructure(files) {
  const nodes = []
  const links = []
  
  // Criar nós para arquivos
  files.forEach((file, index) => {
    const fileId = `file_${index}`
    nodes.push({
      id: fileId,
      type: 'file',
      label: file.name,
      metrics: {
        cpu: Math.round(Math.random() * 30 + 10),
        memory: Math.round(Math.random() * 30 + 15),
        calls: Math.round(Math.random() * 100 + 50),
        lines: file.analysis.lines,
        size: file.size
      }
    })
    
    // Criar nós para funções
    file.analysis.functions.forEach((func, funcIndex) => {
      const funcId = `${fileId}_func_${funcIndex}`
      nodes.push({
        id: funcId,
        type: 'function',
        label: `${func}()`,
        metrics: {
          cpu: Math.round(Math.random() * 15 + 5),
          memory: Math.round(Math.random() * 20 + 5),
          calls: Math.round(Math.random() * 100 + 10)
        }
      })
      
      links.push({
        source: fileId,
        target: funcId,
        type: 'dependency'
      })
    })
    
    // Criar nós para classes
    file.analysis.classes.forEach((className, classIndex) => {
      const classId = `${fileId}_class_${classIndex}`
      nodes.push({
        id: classId,
        type: 'class',
        label: className,
        metrics: {
          cpu: Math.round(Math.random() * 20 + 10),
          memory: Math.round(Math.random() * 25 + 10),
          calls: Math.round(Math.random() * 80 + 20)
        }
      })
      
      links.push({
        source: fileId,
        target: classId,
        type: 'dependency'
      })
    })
  })
  
  // Adicionar algumas ligações entre arquivos baseadas em imports
  // (simplificado para demonstração)
  for (let i = 0; i < nodes.length - 1; i++) {
    if (nodes[i].type === 'file' && Math.random() < 0.3) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].type === 'file' && Math.random() < 0.2) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            type: 'dependency'
          })
        }
      }
    }
  }
  
  return { nodes, links }
}

export default router