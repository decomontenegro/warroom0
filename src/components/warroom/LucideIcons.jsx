/**
 * Lucide Icons for WarRoom
 * Created: 2025-07-19
 * 
 * Ícones usando lucide-react
 */

import {
  Send,
  Loader2,
  Users,
  Zap,
  Target,
  Trash2,
  Download,
  X,
  Network,
  Edit3,
  BarChart3,
  Brain,
  Shield,
  Code2,
  Palette,
  Database,
  Globe,
  Briefcase,
  Lightbulb,
  CheckCircle,
  Wrench,
  Search,
  MessageSquare,
  ChevronDown,
  Menu,
  Settings,
  FileText,
  GitBranch,
  Cpu,
  Lock,
  Smartphone,
  Cloud,
  TrendingUp,
  BookOpen,
  Sparkles,
  Rocket,
  Award,
  Layout,
  Server,
  Package,
  Bot,
  Paperclip,
  MoreVertical
} from 'lucide-react'

// Mapeamento de nomes para componentes Lucide
export const lucideIcons = {
  // Ações básicas
  Send,
  Loader: Loader2,
  Trash: Trash2,
  Download,
  X,
  Search,
  Menu,
  Settings,
  ChevronDown,
  
  // Features
  Users,
  Zap,
  Target,
  Network,
  Edit: Edit3,
  BarChart: BarChart3,
  Brain,
  
  // Agentes e Roles
  Shield,
  Code: Code2,
  Palette,
  Database,
  Globe,
  Briefcase,
  Lightbulb,
  CheckCircle,
  Wrench,
  MessageSquare,
  FileText,
  GitBranch,
  Cpu,
  Lock,
  Smartphone,
  Cloud,
  TrendingUp,
  BookOpen,
  Sparkles,
  Rocket,
  Award,
  Layout,
  Server,
  Package,
  Bot,
  Paperclip,
  MoreVertical,
  BarChart3 // Alias para compatibilidade
}

// Componente wrapper para usar Lucide icons
export const Icon = ({ name, size = 20, className = '', ...props }) => {
  const LucideIcon = lucideIcons[name]
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`)
    return null
  }
  
  return <LucideIcon size={size} className={className} {...props} />
}

// Função para obter ícone baseado no role do agente
export const getAgentIcon = (role) => {
  const roleIconMap = {
    // Architecture & System
    'System Architecture': 'Cpu',
    'Frontend Architecture': 'Layout',
    'Backend Architecture': 'Server',
    'Database Architecture': 'Database',
    'Cloud Architecture': 'Cloud',
    
    // Development
    'Developer': 'Code',
    'Engineer': 'Wrench',
    'Designer': 'Palette',
    'Researcher': 'Search',
    
    // Security & Testing
    'Security': 'Shield',
    'Testing': 'CheckCircle',
    'Quality': 'Award',
    
    // Business & Strategy
    'Business': 'Briefcase',
    'Product': 'Package',
    'Strategy': 'TrendingUp',
    'Innovation': 'Lightbulb',
    
    // Leadership
    'Lead': 'Users',
    'Chief': 'Award',
    'Director': 'Briefcase',
    'Manager': 'Users',
    
    // Specialized
    'Data': 'Database',
    'AI': 'Brain',
    'Mobile': 'Smartphone',
    'Analytics': 'BarChart',
    'DevOps': 'GitBranch',
    'Blockchain': 'Lock',
    'UX': 'Sparkles'
  }
  
  // Procurar match parcial
  for (const [key, iconName] of Object.entries(roleIconMap)) {
    if (role.includes(key)) {
      return <Icon name={iconName} size={16} />
    }
  }
  
  // Ícone padrão
  return <Icon name="Users" size={16} />
}

// Exportar tudo como default também
export default {
  Icon,
  getAgentIcon,
  lucideIcons
}