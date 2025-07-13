export function getAvailableAgents() {
  return [
    {
      id: 'session-orchestrator',
      name: 'SessionOrchestrator',
      type: 'orchestrator',
      capability: 'Team composition and session management',
      priority: 'high',
      skills: ['team-building', 'task-analysis', 'coordination'],
      dependencies: []
    },
    {
      id: 'ai-dialog-moderator',
      name: 'AIDialogModerator',
      type: 'moderator',
      capability: 'Conversation flow and conflict resolution',
      priority: 'medium',
      skills: ['communication', 'mediation', 'consensus-building'],
      dependencies: ['SessionOrchestrator']
    },
    {
      id: 'validation-pipeline',
      name: 'ValidationPipeline',
      type: 'validator',
      capability: 'Decision validation and quality assurance',
      priority: 'high',
      skills: ['validation', 'testing', 'quality-control'],
      dependencies: []
    },
    {
      id: 'code-analyzer',
      name: 'CodeAnalyzer',
      type: 'analyzer',
      capability: 'Code analysis and pattern detection',
      priority: 'high',
      skills: ['ast-parsing', 'pattern-recognition', 'complexity-analysis'],
      dependencies: []
    },
    {
      id: 'requirements-analyzer',
      name: 'RequirementsAnalyzer',
      type: 'analyzer',
      capability: 'Requirements extraction and validation',
      priority: 'medium',
      skills: ['nlp', 'requirement-parsing', 'specification-analysis'],
      dependencies: []
    },
    {
      id: 'test-generator',
      name: 'TestGenerator',
      type: 'generator',
      capability: 'Test case generation and validation',
      priority: 'medium',
      skills: ['test-design', 'edge-case-detection', 'coverage-analysis'],
      dependencies: ['CodeAnalyzer']
    },
    {
      id: 'documentation-generator',
      name: 'DocumentationGenerator',
      type: 'generator',
      capability: 'Documentation and comment generation',
      priority: 'low',
      skills: ['technical-writing', 'api-documentation', 'markdown'],
      dependencies: ['CodeAnalyzer']
    },
    {
      id: 'refactoring-agent',
      name: 'RefactoringAgent',
      type: 'generator',
      capability: 'Code refactoring and optimization',
      priority: 'medium',
      skills: ['code-optimization', 'design-patterns', 'performance'],
      dependencies: ['CodeAnalyzer', 'ValidationPipeline']
    },
    {
      id: 'security-auditor',
      name: 'SecurityAuditor',
      type: 'validator',
      capability: 'Security vulnerability detection',
      priority: 'high',
      skills: ['security-patterns', 'vulnerability-detection', 'owasp'],
      dependencies: ['CodeAnalyzer']
    },
    {
      id: 'performance-optimizer',
      name: 'PerformanceOptimizer',
      type: 'analyzer',
      capability: 'Performance analysis and optimization',
      priority: 'medium',
      skills: ['profiling', 'algorithm-analysis', 'memory-optimization'],
      dependencies: ['CodeAnalyzer']
    }
  ];
}

export function getAgentsByType(type) {
  return getAvailableAgents().filter(agent => agent.type === type);
}

export function getAgentById(id) {
  return getAvailableAgents().find(agent => agent.id === id);
}

export function getAgentByName(name) {
  return getAvailableAgents().find(agent => agent.name === name);
}

export function getRecommendedAgents(task) {
  const agents = getAvailableAgents();
  const recommendations = [];
  
  // Always include orchestrator
  recommendations.push(agents.find(a => a.id === 'session-orchestrator'));
  
  const taskLower = task.toLowerCase();
  
  // Add agents based on task keywords
  if (taskLower.includes('analyze') || taskLower.includes('review')) {
    recommendations.push(agents.find(a => a.id === 'code-analyzer'));
  }
  
  if (taskLower.includes('test')) {
    recommendations.push(agents.find(a => a.id === 'test-generator'));
  }
  
  if (taskLower.includes('secure') || taskLower.includes('security')) {
    recommendations.push(agents.find(a => a.id === 'security-auditor'));
  }
  
  if (taskLower.includes('performance') || taskLower.includes('optimize')) {
    recommendations.push(agents.find(a => a.id === 'performance-optimizer'));
  }
  
  if (taskLower.includes('refactor')) {
    recommendations.push(agents.find(a => a.id === 'refactoring-agent'));
  }
  
  if (taskLower.includes('document')) {
    recommendations.push(agents.find(a => a.id === 'documentation-generator'));
  }
  
  // Add validation pipeline for quality assurance
  if (recommendations.length > 2) {
    recommendations.push(agents.find(a => a.id === 'validation-pipeline'));
  }
  
  // Add moderator for complex sessions
  if (recommendations.length > 4) {
    recommendations.push(agents.find(a => a.id === 'ai-dialog-moderator'));
  }
  
  return recommendations.filter(Boolean);
}