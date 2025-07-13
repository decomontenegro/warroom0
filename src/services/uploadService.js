import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api'

export class UploadService {
  // Fazer upload de arquivos grandes para o servidor
  async uploadFilesForAnalysis(files, onProgress) {
    const formData = new FormData()
    
    // Adicionar arquivos ao FormData
    files.forEach(file => {
      formData.append('files', file)
    })
    
    try {
      const response = await axios.post(`${API_URL}/upload/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        }
      })
      
      return response.data.dagStructure
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      throw error
    }
  }
  
  // Verificar se deve usar upload do servidor baseado no tamanho
  shouldUseServerUpload(files) {
    // Se tiver mais de 100 arquivos ou tamanho total > 10MB
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    return files.length > 100 || totalSize > 10 * 1024 * 1024
  }
}

export const uploadService = new UploadService()