/**
 * Sistema de Categorização e Cores dos Agentes
 * Agrupa especialistas por área de expertise com cores harmônicas
 */

export const agentCategories = {
  architecture: {
    name: 'Arquitetura & Engenharia',
    color: '#2196F3', // Azul
    icon: '🏗️',
    agents: [
      'Lead Architect',
      'System Architect',
      'Solution Architect',
      'Enterprise Architect',
      'Frontend Architect',
      'Backend Architect',
      'Cloud Architect',
      'Mobile Architect',
      'Microservices Architect',
      'Event-Driven Architect'
    ]
  },
  
  development: {
    name: 'Desenvolvimento',
    color: '#4CAF50', // Verde
    icon: '💻',
    agents: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'Game Developer',
      'API Developer',
      'Integration Specialist',
      'Embedded Systems Developer',
      'Blockchain Developer'
    ]
  },
  
  design: {
    name: 'Design & UX',
    color: '#9C27B0', // Roxo
    icon: '🎨',
    agents: [
      'UI Designer',
      'UX Designer',
      'Product Designer',
      'Design System Architect',
      'Interaction Designer',
      'Brand Designer',
      'Motion Designer',
      '3D Designer',
      'Illustrator',
      'Visual Designer',
      'Voice UI Designer',
      'Accessibility Specialist'
    ]
  },
  
  devops: {
    name: 'DevOps & Infraestrutura',
    color: '#FF9800', // Laranja
    icon: '🚀',
    agents: [
      'DevOps Lead',
      'Infrastructure Engineer',
      'Site Reliability Engineer',
      'Platform Engineer',
      'Kubernetes Specialist',
      'Terraform Expert',
      'Cloud Security Engineer',
      'DevSecOps Engineer',
      'Network Engineer',
      'Observability Engineer',
      'Automation Engineer'
    ]
  },
  
  security: {
    name: 'Segurança & Qualidade',
    color: '#F44336', // Vermelho
    icon: '🔒',
    agents: [
      'Security Architect',
      'Penetration Tester',
      'Cloud Security Engineer',
      'DevSecOps Engineer',
      'QA Lead',
      'Performance Engineer',
      'Chaos Engineer',
      'Test Automation Engineer',
      'Load Balancing Expert',
      'Privacy Officer'
    ]
  },
  
  data: {
    name: 'Dados & Analytics',
    color: '#00BCD4', // Ciano
    icon: '📊',
    agents: [
      'Data Scientist',
      'Data Engineer',
      'Analytics Engineer',
      'Business Intelligence Analyst',
      'Machine Learning Engineer',
      'AI/ML Engineer',
      'Data Analyst',
      'Financial Analyst',
      'Market Research Analyst'
    ]
  },
  
  business: {
    name: 'Produto & Negócios',
    color: '#FDD835', // Amarelo
    icon: '💼',
    agents: [
      'Product Manager',
      'Business Analyst',
      'Scrum Master',
      'Product Owner',
      'Marketing Strategist',
      'Sales Engineer',
      'Growth Hacker',
      'Content Strategist',
      'Community Manager',
      'Customer Success Manager',
      'Technical Account Manager',
      'Partnerships Manager'
    ]
  },
  
  innovation: {
    name: 'Inovação & Estratégia',
    color: '#E91E63', // Rosa
    icon: '🌟',
    agents: [
      'Innovation Strategist',
      'Chief Innovation Officer',
      'Research Lead',
      'Blockchain Specialist',
      'IoT Specialist',
      'AR/VR Developer',
      'Quantum Computing Researcher',
      'Edge Computing Specialist',
      'Chief Strategy Officer',
      'Technical Writer',
      'Developer Advocate'
    ]
  }
};

/**
 * Retorna a categoria de um agente pelo nome
 */
export function getAgentCategory(agentName) {
  // Validação de entrada
  if (!agentName || typeof agentName !== 'string') {
    console.warn('getAgentCategory: Invalid agentName:', agentName);
    return {
      key: 'general',
      name: 'Geral',
      color: '#9E9E9E',
      icon: '👤',
      agents: []
    };
  }
  
  for (const [categoryKey, category] of Object.entries(agentCategories)) {
    if (category.agents.some(agent => 
      agent.toLowerCase() === agentName.toLowerCase() ||
      agentName.toLowerCase().includes(agent.toLowerCase())
    )) {
      return {
        key: categoryKey,
        ...category
      };
    }
  }
  
  // Categoria padrão se não encontrar
  return {
    key: 'general',
    name: 'Geral',
    color: '#9E9E9E',
    icon: '👤',
    agents: []
  };
}

/**
 * Retorna a cor específica de um agente com variação de tonalidade
 */
export function getAgentColor(agentName) {
  // Validação de entrada
  if (!agentName || typeof agentName !== 'string') {
    console.warn('getAgentColor: Invalid agentName:', agentName);
    return '#9E9E9E'; // Cor padrão
  }
  
  const category = getAgentCategory(agentName);
  const agentIndex = category.agents.findIndex(agent => 
    agent.toLowerCase() === agentName.toLowerCase() ||
    agentName.toLowerCase().includes(agent.toLowerCase())
  );
  
  if (agentIndex === -1) return category.color;
  
  // Calcular variação de luminosidade baseada na posição
  const baseColor = category.color;
  const variation = 0.8 + (agentIndex * 0.05); // 80% a 130% de luminosidade
  
  return adjustColorBrightness(baseColor, variation);
}

/**
 * Ajusta o brilho de uma cor hex
 */
function adjustColorBrightness(hex, factor) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) * factor));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * factor));
  const b = Math.min(255, Math.floor((num & 0x0000FF) * factor));
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Retorna classe CSS para a categoria
 */
export function getAgentCategoryClass(agentName) {
  const category = getAgentCategory(agentName);
  return `agent-category-${category.key}`;
}

/**
 * Retorna badge HTML para o agente
 */
export function getAgentBadge(agentName) {
  const category = getAgentCategory(agentName);
  const color = getAgentColor(agentName);
  
  return {
    category: category.key,
    categoryName: category.name,
    color,
    icon: category.icon,
    className: `agent-badge ${agentName.toLowerCase().replace(/\s+/g, '-')}`
  };
}

/**
 * Gera legenda de categorias para UI
 */
export function getCategoryLegend() {
  return Object.entries(agentCategories).map(([key, category]) => ({
    key,
    name: category.name,
    color: category.color,
    icon: category.icon,
    count: category.agents.length
  }));
}