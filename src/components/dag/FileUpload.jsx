import { useState, useRef, useCallback, useEffect } from 'react'
import { codeAnalyzer } from '../../services/codeAnalyzer'
import { uploadService } from '../../services/uploadService'
import './FileUpload.css'

function FileUpload({ onFilesAnalyzed }) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [uploadMode, setUploadMode] = useState('files') // 'files' or 'folder'
  const [browserSupportsFolder, setBrowserSupportsFolder] = useState(true)

  // Detectar suporte para upload de pasta ao montar
  useEffect(() => {
    const input = document.createElement('input')
    input.type = 'file'
    const supportsDirectory = 'webkitdirectory' in input || 'directory' in input || 'mozdirectory' in input
    setBrowserSupportsFolder(supportsDirectory)
    
    if (!supportsDirectory) {
      console.warn('Este navegador não suporta upload direto de pastas. Use arrastar e soltar ou selecione múltiplos arquivos.')
    }
  }, [])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // Processar items do DataTransfer para suportar pastas
    const items = e.dataTransfer.items
    const fileList = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry()
      if (item) {
        await processEntry(item, fileList)
      }
    }
    
    handleFiles(fileList)
  }

  // Função recursiva para processar entradas de arquivos/pastas
  const processEntry = async (entry, fileList, path = '') => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file) => {
          // Adicionar o caminho relativo ao arquivo
          file.relativePath = path + file.name
          fileList.push(file)
          resolve()
        })
      })
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader()
      const entries = await new Promise((resolve) => {
        dirReader.readEntries((entries) => resolve(entries))
      })
      
      for (const childEntry of entries) {
        await processEntry(childEntry, fileList, path + entry.name + '/')
      }
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    // Adicionar caminho relativo se estiver usando webkitdirectory
    if (e.target.webkitdirectory) {
      selectedFiles.forEach(file => {
        file.relativePath = file.webkitRelativePath || file.name
      })
    }
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    // Filtros para ignorar
    const ignorePaths = [
      'node_modules',
      '.git',
      '.vscode',
      '.idea',
      'dist',
      'build',
      'coverage',
      '.cache',
      '__pycache__',
      '.pytest_cache',
      '.DS_Store'
    ]
    
    // Filtrar arquivos
    const filteredFiles = newFiles.filter(file => {
      const path = file.relativePath || file.name
      
      // Ignorar caminhos específicos
      for (const ignorePath of ignorePaths) {
        if (path.includes(ignorePath + '/') || path.includes('/' + ignorePath + '/')) {
          return false
        }
      }
      
      // Verificar extensão
      const ext = file.name.split('.').pop().toLowerCase()
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
        'r', 'R',
        'dart',
        'json', 'yml', 'yaml', 'xml', 'toml'
      ]
      
      return validExtensions.includes(ext)
    })

    if (filteredFiles.length === 0) {
      alert('Nenhum arquivo de código válido foi encontrado após aplicar os filtros.')
      return
    }

    // Limitar a 1000 arquivos para evitar problemas de performance
    if (filteredFiles.length > 1000) {
      if (!confirm(`Foram encontrados ${filteredFiles.length} arquivos. Processar apenas os primeiros 1000?`)) {
        return
      }
      setFiles(filteredFiles.slice(0, 1000))
    } else {
      setFiles(filteredFiles)
    }
    
    // Calcular tamanho total
    const totalSize = filteredFiles.reduce((sum, file) => sum + file.size, 0)
    console.log(`Total de arquivos: ${filteredFiles.length}, Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  }

  const analyzeFiles = async () => {
    if (files.length === 0) return

    setIsAnalyzing(true)
    setShowProgress(true)
    setAnalysisProgress(0)

    try {
      let analysisResults
      
      // Decidir se deve usar upload no servidor ou análise local
      if (uploadService.shouldUseServerUpload(files)) {
        console.log('Usando análise no servidor para', files.length, 'arquivos')
        
        // Upload para o servidor
        analysisResults = await uploadService.uploadFilesForAnalysis(files, (progress) => {
          setAnalysisProgress(progress)
        })
      } else {
        console.log('Usando análise local para', files.length, 'arquivos')
        
        // Processar arquivos localmente em lotes
        const batchSize = 50
        const totalBatches = Math.ceil(files.length / batchSize)
        const allResults = { nodes: [], links: [] }
        
        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize
          const end = Math.min(start + batchSize, files.length)
          const batch = files.slice(start, end)
          
          // Analisar lote
          const batchResults = await codeAnalyzer.analyzeFiles(batch)
          
          // Mesclar resultados
          allResults.nodes.push(...batchResults.nodes)
          allResults.links.push(...batchResults.links)
          
          // Atualizar progresso
          const progress = Math.round(((i + 1) / totalBatches) * 100)
          setAnalysisProgress(progress)
          
          // Dar uma pausa para não travar a UI
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        
        // Detectar dependências cross-file após processar todos os arquivos
        const crossFileLinks = codeAnalyzer.detectCrossFileDependencies(allResults.nodes, files)
        allResults.links.push(...crossFileLinks)
        
        analysisResults = allResults
      }
      
      // Passar os resultados para o componente pai
      onFilesAnalyzed(analysisResults)
      
      // Limpar arquivos após análise
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
      
      // Limpar cache do analisador se muitos arquivos foram processados
      if (files.length > 100) {
        codeAnalyzer.clearCache()
      }
    } catch (error) {
      console.error('Erro ao analisar arquivos:', error)
      alert('Erro ao analisar arquivos. Por favor, tente novamente.')
    } finally {
      setIsAnalyzing(false)
      setShowProgress(false)
      setAnalysisProgress(0)
    }
  }


  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <h3>Upload de Arquivos para Análise DAG</h3>
        <p>Arraste arquivos de código ou clique para selecionar</p>
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          // Não fazer nada aqui - deixar os botões específicos lidarem com cliques
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.pyw,.pyi,.java,.kt,.scala,.cpp,.cc,.c,.h,.hpp,.hh,.cs,.vb,.rb,.rake,.go,.rs,.php,.swift,.vue,.svelte,.lua,.r,.R,.dart,.json,.yml,.yaml,.xml,.toml"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <input
          ref={folderInputRef}
          type="file"
          {...(browserSupportsFolder && {
            webkitdirectory: "true",
            directory: "true",
            mozdirectory: "true"
          })}
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="upload-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="upload-text">
          <p className="upload-main-text">
            {isDragging ? 'Solte os arquivos ou pastas aqui' : 'Arraste arquivos/pastas ou clique para selecionar'}
          </p>
          <p className="upload-sub-text">
            Suporta upload de projetos completos. node_modules, .git e outros serão ignorados automaticamente.
          </p>
        </div>
        
        <div className="upload-mode-buttons">
          <button
            className="mode-button"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
            </svg>
            Selecionar Arquivos
          </button>
          
          <button
            className={`mode-button ${!browserSupportsFolder ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              
              // Verificar suporte para upload de pasta
              if (!browserSupportsFolder) {
                // Fallback - usar input de múltiplos arquivos
                alert('Seu navegador não suporta upload direto de pastas. Por favor, selecione múltiplos arquivos ou use arrastar e soltar.')
                fileInputRef.current?.click()
              } else {
                folderInputRef.current?.click()
              }
            }}
            title={browserSupportsFolder ? "Selecionar uma pasta inteira" : "Navegador não suporta upload de pastas - use arrastar e soltar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2"/>
            </svg>
            Selecionar Pasta
            {!browserSupportsFolder && <span className="unsupported-badge">!</span>}
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <h4>Arquivos Selecionados ({files.length})</h4>
          
          {files.length > 20 ? (
            <div className="file-summary">
              <p>Total de arquivos: <strong>{files.length}</strong></p>
              <p>Tamanho total: <strong>{(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB</strong></p>
              
              <details>
                <summary>Ver lista de arquivos</summary>
                <div className="file-list compact">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name" title={file.relativePath || file.name}>
                        {file.relativePath || file.name}
                      </span>
                      <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name" title={file.relativePath || file.name}>
                    {file.relativePath || file.name}
                  </span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button
                    className="remove-file"
                    onClick={() => removeFile(index)}
                    title="Remover arquivo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button
            className="analyze-button"
            onClick={analyzeFiles}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                Analisando...
              </>
            ) : (
              'Analisar Arquivos'
            )}
          </button>
          
          {showProgress && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${analysisProgress}%` }}
                >
                  <span className="progress-text">{analysisProgress}%</span>
                </div>
              </div>
              <p className="progress-info">
                Analisando {files.length} arquivos...
              </p>
            </div>
          )}
        </div>
      )}

      <div className="upload-info">
        <h4>Como funciona:</h4>
        <ol>
          <li>Faça upload de arquivos individuais ou pastas inteiras do projeto</li>
          <li>Arquivos desnecessários (node_modules, .git, etc.) são filtrados automaticamente</li>
          <li>O sistema analisará as dependências e estrutura do código de forma incremental</li>
          <li>Um grafo DAG será gerado mostrando as relações entre arquivos, funções e classes</li>
          <li>Suporta projetos com centenas de arquivos sem travar o navegador</li>
        </ol>
        
        <div className="supported-formats">
          <h5>Linguagens suportadas:</h5>
          <p>JavaScript, TypeScript, Python, Java, C/C++, C#, Ruby, Go, Rust, PHP, Swift, Vue, Svelte, e mais...</p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload