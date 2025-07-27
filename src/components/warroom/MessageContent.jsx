import React from 'react'

/**
 * Componente simples para renderizar conteúdo com formatação markdown básica
 */
function MessageContent({ text, isSynthesis, onEnhancedPrompt }) {
  // Renderizar markdown básico sem bibliotecas externas
  const renderMarkdown = (content) => {
    if (!content) return null
    
    // Split por linhas para processar
    const lines = content.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeBlockContent = []
    let codeBlockLang = ''
    
    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeBlockLang = line.slice(3).trim()
          codeBlockContent = []
        } else {
          inCodeBlock = false
          elements.push(
            <pre key={`code-${index}`} className="wr3-code-block">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          )
        }
        return
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line)
        return
      }
      
      // Headers
      if (line.startsWith('####')) {
        elements.push(<h5 key={index} className="wr3-h5">{line.slice(4).trim()}</h5>)
      } else if (line.startsWith('###')) {
        elements.push(<h4 key={index} className="wr3-h4">{line.slice(3).trim()}</h4>)
      } else if (line.startsWith('##')) {
        elements.push(<h3 key={index} className="wr3-h3">{line.slice(2).trim()}</h3>)
      } else if (line.startsWith('#')) {
        elements.push(<h2 key={index} className="wr3-h2">{line.slice(1).trim()}</h2>)
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="wr3-list-item">
            {renderInlineMarkdown(line.trim().slice(2))}
          </li>
        )
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li key={index} className="wr3-numbered-item">
            {renderInlineMarkdown(line.trim().replace(/^\d+\.\s/, ''))}
          </li>
        )
      }
      // Emojis + Bold text lines (like "✅ **Text**")
      else if (line.includes('**') && /^[^\w\s]/.test(line.trim())) {
        elements.push(
          <p key={index} className="wr3-emoji-line">
            {renderInlineMarkdown(line)}
          </p>
        )
      }
      // Normal paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={index} className="wr3-paragraph">
            {renderInlineMarkdown(line)}
          </p>
        )
      }
      // Empty lines
      else {
        elements.push(<br key={index} />)
      }
    })
    
    return elements
  }
  
  // Renderizar markdown inline (bold, italic, code)
  const renderInlineMarkdown = (text) => {
    if (!text) return text
    
    // Processar bold, italic e code inline
    let processed = text
    
    // Bold
    processed = processed.split(/\*\*(.+?)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
    
    // Italic
    processed = processed.map((part, i) => {
      if (typeof part === 'string') {
        return part.split(/\*(.+?)\*/g).map((subpart, j) => 
          j % 2 === 1 ? <em key={`${i}-${j}`}>{subpart}</em> : subpart
        )
      }
      return part
    }).flat()
    
    // Code inline
    processed = processed.map((part, i) => {
      if (typeof part === 'string') {
        return part.split(/`(.+?)`/g).map((subpart, j) => 
          j % 2 === 1 ? <code key={`${i}-${j}`} className="wr3-inline-code">{subpart}</code> : subpart
        )
      }
      return part
    }).flat()
    
    return processed
  }
  
  return (
    <div className={`wr3-message-content ${isSynthesis ? 'synthesis' : ''}`}>
      {renderMarkdown(text)}
      {isSynthesis && onEnhancedPrompt && (
        <div className="wr3-synthesis-actions">
          <button 
            className="wr3-enhanced-prompt-btn"
            onClick={onEnhancedPrompt}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
            </svg>
            Enhanced Prompt
          </button>
        </div>
      )}
    </div>
  )
}

export default MessageContent