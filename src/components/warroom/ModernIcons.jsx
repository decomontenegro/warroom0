// Modern Icon Components for WarRoom

export const ModernIcons = {
  // Special Chats
  UltraThink: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="url(#ultrathink-gradient)" strokeWidth="2"/>
      <path d="M12 2C12 2 12 7 12 12C12 12 17 12 22 12" stroke="url(#ultrathink-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 7 12 2 12" stroke="url(#ultrathink-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 12 17 12 22" stroke="url(#ultrathink-gradient)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="url(#ultrathink-gradient)"/>
      <defs>
        <linearGradient id="ultrathink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  
  AllExperts: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" fill="#60a5fa"/>
      <circle cx="16" cy="8" r="3" fill="#a78bfa"/>
      <circle cx="8" cy="16" r="3" fill="#34d399"/>
      <circle cx="16" cy="16" r="3" fill="#fbbf24"/>
      <path d="M8 11v2M16 11v2M11 8h2M11 16h2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  
  Summary: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#60a5fa" strokeWidth="2"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="17" r="4" fill="#3b82f6"/>
      <path d="M16 17l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  PromptBuilder: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" stroke="#fbbf24" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" fill="#fbbf24"/>
    </svg>
  ),
  
  // Agent Type Icons
  Architecture: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2L2 6v8l8 4 8-4V6l-8-4zM10 4.5L14.5 6.7 10 8.9 5.5 6.7 10 4.5zM4 8.3l5 2.5v4.4l-5-2.5V8.3zm7 6.9v-4.4l5-2.5v4.4l-5 2.5z"/>
    </svg>
  ),
  
  Frontend: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 8l2 2-2 2M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Backend: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2C5.5 2 2 5.5 2 10s3.5 8 8 8 8-3.5 8-8-3.5-8-8-8zm0 2c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"/>
      <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Security: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2L3 5v6c0 4.5 3 8.7 7 9.9 4-1.2 7-5.4 7-9.9V5l-7-3zm0 2.2l5 2.1v5.7c0 3.3-2.2 6.4-5 7.5-2.8-1.1-5-4.2-5-7.5V6.3l5-2.1z"/>
      <path d="M9 11l-2-2 1-1 1 1 3-3 1 1-4 4z"/>
    </svg>
  ),
  
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <ellipse cx="10" cy="5" rx="7" ry="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M3 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M3 10c0 1.7 3.1 3 7 3s7-1.3 7-3" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  
  DevOps: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M10 2v5M10 13v5M2 10h5M13 10h5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  
  AI: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="10" cy="10" r="2" fill="currentColor"/>
      <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.5 4.5l2 2M13.5 13.5l2 2M15.5 4.5l-2 2M6.5 13.5l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  
  Business: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 2h4v4h6v12H2V6h6V2zm2 2v2h0V4h0zm-6 4v8h12V8H4zm3 2h2v4H7v-4zm4 0h2v4h-2v-4z"/>
    </svg>
  ),
  
  Design: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.4 2.6c-.8-.8-2-.8-2.8 0l-10 10c-.2.2-.4.5-.5.8l-1.5 4.5c-.1.4 0 .8.3 1.1.2.2.5.3.8.3.1 0 .2 0 .3 0l4.5-1.5c.3-.1.6-.3.8-.5l10-10c.8-.8.8-2 0-2.8l-.9-.9zM7.2 14.8l-2.7.9.9-2.7 8.5-8.5 1.8 1.8-8.5 8.5z"/>
    </svg>
  ),
  
  Quality: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 2L2 8v6c0 3.5 2.5 6.8 7 7.9 4.5-1.1 7-4.4 7-7.9V8L9 2zm0 2.4l5 3.6v5.5c0 2.4-1.8 4.7-5 5.5-3.2-.8-5-3.1-5-5.5V8l5-3.6z"/>
      <path d="M8 10.5L6.5 9 5 10.5 8 13.5 14 7.5 12.5 6 8 10.5z"/>
    </svg>
  ),
  
  // UI Action Icons
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 2l16 8-16 8v-6l11-2L2 8V2z"/>
    </svg>
  ),
  
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12.5 12.5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
      <path d="M10 3.5c-.4 0-.8 0-1.2.1L8 1.1C8.7 1 9.3 1 10 1s1.3 0 2 .1l-.8 2.5c-.4-.1-.8-.1-1.2-.1zM4.9 5.5c.5-.6 1.1-1.1 1.7-1.5l1.5 2.1c-.4.3-.7.6-1 1L4.9 5.5zM2.1 10c0-.7.1-1.3.2-2l2.5.8c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2.5.8c-.1-.7-.2-1.3-.2-2zM4.9 14.5L7.1 13c.3.4.6.7 1 1l-1.5 2.1c-.6-.4-1.2-.9-1.7-1.6zM10 16.5c.4 0 .8 0 1.2-.1l.8 2.5c-.7.1-1.3.1-2 .1s-1.3 0-2-.1l.8-2.5c.4.1.8.1 1.2.1zM15.1 14.5c-.5.6-1.1 1.1-1.7 1.5L11.9 14c.4-.3.7-.6 1-1l2.2 1.5zM17.9 10c0 .7-.1 1.3-.2 2l-2.5-.8c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2.5-.8c.1.7.2 1.3.2 2zM15.1 5.5L12.9 7c-.3-.4-.6-.7-1-1l1.5-2.1c.6.4 1.2.9 1.7 1.6z"/>
    </svg>
  ),
  
  More: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="4" r="2"/>
      <circle cx="10" cy="10" r="2"/>
      <circle cx="10" cy="16" r="2"/>
    </svg>
  ),
  
  Expand: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 12l1.4 1.4L8 10.8V16h2v-5.2l2.6 2.6L14 12l-4-4-4 4zM16 4H4v2h12V4z"/>
    </svg>
  ),
  
  Minimize: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 8l1.4-1.4L8 9.2V4h2v5.2l2.6-2.6L14 8l-4 4-4-4zM16 16H4v-2h12v2z"/>
    </svg>
  ),
  
  // Status Icons
  Online: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" fill="#22c55e" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  
  Busy: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" fill="#f59e0b" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  
  Offline: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" fill="#64748b" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  
  Loading: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
      <path d="M18 10a8 8 0 01-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

// Icon wrapper component for consistent styling
export function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
  const IconComponent = ModernIcons[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color }}
    >
      <IconComponent />
    </span>
  )
}

// Get icon for agent type
export function getAgentIcon(agent) {
  const agentInfo = (agent.name + ' ' + agent.role).toLowerCase()
  
  if (agentInfo.includes('architect')) return 'Architecture'
  if (agentInfo.includes('frontend')) return 'Frontend'
  if (agentInfo.includes('backend')) return 'Backend'
  if (agentInfo.includes('security')) return 'Security'
  if (agentInfo.includes('database')) return 'Database'
  if (agentInfo.includes('devops')) return 'DevOps'
  if (agentInfo.includes('ai') || agentInfo.includes('ml')) return 'AI'
  if (agentInfo.includes('business')) return 'Business'
  if (agentInfo.includes('design')) return 'Design'
  if (agentInfo.includes('quality') || agentInfo.includes('qa')) return 'Quality'
  
  return 'Architecture' // default
}

// Get color for agent based on their type/role - Liqi Theme
export function getAgentColor(agent) {
  const agentInfo = (agent.name + ' ' + agent.role).toLowerCase()
  
  // Cores vibrantes da paleta Liqi
  if (agentInfo.includes('architect')) return '#9C27B0' // Roxo Liqi
  if (agentInfo.includes('frontend')) return '#005CEB' // Azul Liqi
  if (agentInfo.includes('backend')) return '#9C27B0' // Roxo Liqi
  if (agentInfo.includes('security')) return '#FF9800' // Laranja Liqi
  if (agentInfo.includes('database')) return '#FDD835' // Amarelo Liqi
  if (agentInfo.includes('devops')) return '#005CEB' // Azul Liqi
  if (agentInfo.includes('ai') || agentInfo.includes('ml')) return '#FF9800' // Laranja Liqi
  if (agentInfo.includes('business')) return '#FDD835' // Amarelo Liqi
  if (agentInfo.includes('design')) return '#FF9800' // Laranja Liqi
  if (agentInfo.includes('quality') || agentInfo.includes('qa')) return '#005CEB' // Azul Liqi
  
  return '#9C27B0' // Roxo default (ao invés de cinza)
}