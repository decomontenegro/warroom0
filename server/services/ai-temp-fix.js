// Temporary fix for AI responses
import { agentResponseTemplates } from './agent-response-templates.js';

export function getIntelligentMockResponse(agentName, task, language = 'pt-BR') {
  // Use the agent response templates for more realistic responses
  const templates = agentResponseTemplates[language] || agentResponseTemplates['pt-BR'];
  
  // Find the agent template
  const agentKey = Object.keys(templates).find(key => 
    agentName.toLowerCase().includes(key.toLowerCase())
  );
  
  if (agentKey && templates[agentKey]) {
    const template = templates[agentKey];
    const responses = template.responses || [template.response];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Replace placeholders
    return response
      .replace(/\{task\}/g, task)
      .replace(/\{problem\}/g, task)
      .replace(/\{feature\}/g, task);
  }
  
  // Fallback to a generic intelligent response
  if (language === 'pt-BR') {
    return `Analisando "${task}" sob a perspectiva de ${agentName}:

🎯 **Análise Inicial:**
• Identifico oportunidades significativas nesta abordagem
• A mudança de paradigma de arquivos para processos é fundamental
• Isso se alinha com as melhores práticas de arquitetura orientada a domínio

💡 **Considerações Técnicas:**
• Implementar um sistema baseado em fluxos e processos
• Criar abstrações que representem o workflow real
• Mapear dependências entre processos, não entre arquivos

🚀 **Recomendações:**
1. Começar mapeando os processos principais do Vibe Code
2. Criar visualizações de fluxo de trabalho
3. Implementar navegação baseada em contexto de processo
4. Adicionar metadados de processo aos componentes

✨ **Benefícios Esperados:**
• Melhor compreensão do sistema como um todo
• Navegação mais intuitiva
• Redução da complexidade cognitiva
• Facilita onboarding de novos desenvolvedores`;
  }
  
  // English fallback
  return `Analyzing "${task}" from ${agentName}'s perspective:

🎯 **Initial Analysis:**
• I see significant opportunities in this approach
• The paradigm shift from files to processes is fundamental
• This aligns with domain-driven architecture best practices

💡 **Technical Considerations:**
• Implement a flow and process-based system
• Create abstractions representing real workflows
• Map dependencies between processes, not files

🚀 **Recommendations:**
1. Start by mapping Vibe Code's main processes
2. Create workflow visualizations
3. Implement process-context-based navigation
4. Add process metadata to components

✨ **Expected Benefits:**
• Better understanding of the system as a whole
• More intuitive navigation
• Reduced cognitive complexity
• Easier onboarding for new developers`;
}