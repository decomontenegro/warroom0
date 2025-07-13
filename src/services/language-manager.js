/**
 * Language Manager for UltraThink System
 * Manages language preferences across client and server
 */

import { i18n } from './i18n-config.js';
import { generateAgentResponse } from './agent-response-templates.js';

export class LanguageManager {
  constructor() {
    this.currentLanguage = 'pt-BR';
  }

  /**
   * Set the current language
   */
  setLanguage(language) {
    this.currentLanguage = language;
    i18n.setLanguage(language);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('warroom-language', language);
    }
    
    return language;
  }

  /**
   * Get the current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Initialize language from localStorage or default
   */
  initializeLanguage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('warroom-language');
      if (saved) {
        this.setLanguage(saved);
      }
    }
    return this.currentLanguage;
  }

  /**
   * Generate agent response in the current language
   */
  generateAgentResponse(agent, context) {
    return generateAgentResponse(agent, context, this.currentLanguage);
  }

  /**
   * Get language instruction for AI prompts
   */
  getLanguageInstruction() {
    const instructions = {
      'pt-BR': 'Responda em português.',
      'en-US': 'Respond in English.',
      'es-ES': 'Responde en español.',
      'fr-FR': 'Répondez en français.',
      'de-DE': 'Antworten Sie auf Deutsch.',
      'it-IT': 'Rispondi in italiano.',
      'ja-JP': '日本語で返信してください。',
      'zh-CN': '请用中文回复。'
    };
    
    return instructions[this.currentLanguage] || instructions['pt-BR'];
  }

  /**
   * Get mock response for an agent in the current language
   */
  getMockResponse(agent, task) {
    const agentName = agent?.name || 'Assistant';
    const agentRole = agent?.role || 'Helper';
    
    const responses = {
      'pt-BR': {
        'Lead Architect': `Como Arquiteto Líder, vejo que ${task} requer uma abordagem estruturada. Sugiro começar com uma análise de requisitos clara e depois definir a arquitetura base.`,
        'Security Specialist': `Do ponto de vista de segurança, ${task} precisa considerar autenticação, autorização e proteção de dados desde o início.`,
        'Performance Engineer': `Para otimizar ${task}, recomendo implementar cache, lazy loading e monitoramento de métricas desde o MVP.`,
        'Frontend Architect': `No frontend de ${task}, sugiro usar component-based architecture com state management centralizado.`,
        'Backend Architect': `Para o backend de ${task}, recomendo microserviços com API RESTful e message queuing.`,
        'Database Architect': `A modelagem de dados para ${task} deve considerar escalabilidade e performance desde o design inicial.`,
        'DevOps Lead': `Para ${task}, implemente CI/CD desde o início com testes automatizados e deploy containerizado.`,
        'QA Engineer': `Qualidade em ${task} requer testes unitários, integração e E2E com no mínimo 80% de cobertura.`,
        'default': `Como ${agentName} (${agentRole}), acredito que ${task} requer análise cuidadosa e implementação iterativa.`
      },
      'en-US': {
        'Lead Architect': `As Lead Architect, I see that ${task} requires a structured approach. I suggest starting with clear requirements analysis and then defining the base architecture.`,
        'Security Specialist': `From a security perspective, ${task} needs to consider authentication, authorization, and data protection from the start.`,
        'Performance Engineer': `To optimize ${task}, I recommend implementing caching, lazy loading, and metrics monitoring from the MVP.`,
        'Frontend Architect': `For the frontend of ${task}, I suggest using component-based architecture with centralized state management.`,
        'Backend Architect': `For the backend of ${task}, I recommend microservices with RESTful API and message queuing.`,
        'Database Architect': `Data modeling for ${task} should consider scalability and performance from the initial design.`,
        'DevOps Lead': `For ${task}, implement CI/CD from the start with automated tests and containerized deployment.`,
        'QA Engineer': `Quality in ${task} requires unit, integration, and E2E tests with at least 80% coverage.`,
        'default': `As ${agentName} (${agentRole}), I believe ${task} requires careful analysis and iterative implementation.`
      },
      'es-ES': {
        'Lead Architect': `Como Arquitecto Principal, veo que ${task} requiere un enfoque estructurado. Sugiero comenzar con un análisis claro de requisitos y luego definir la arquitectura base.`,
        'Security Specialist': `Desde la perspectiva de seguridad, ${task} necesita considerar autenticación, autorización y protección de datos desde el inicio.`,
        'Performance Engineer': `Para optimizar ${task}, recomiendo implementar caché, carga diferida y monitoreo de métricas desde el MVP.`,
        'Frontend Architect': `Para el frontend de ${task}, sugiero usar arquitectura basada en componentes con gestión de estado centralizada.`,
        'Backend Architect': `Para el backend de ${task}, recomiendo microservicios con API RESTful y cola de mensajes.`,
        'Database Architect': `El modelado de datos para ${task} debe considerar escalabilidad y rendimiento desde el diseño inicial.`,
        'DevOps Lead': `Para ${task}, implemente CI/CD desde el inicio con pruebas automatizadas y despliegue en contenedores.`,
        'QA Engineer': `La calidad en ${task} requiere pruebas unitarias, de integración y E2E con al menos 80% de cobertura.`,
        'default': `Como ${agentName} (${agentRole}), creo que ${task} requiere análisis cuidadoso e implementación iterativa.`
      }
    };
    
    const langResponses = responses[this.currentLanguage] || responses['pt-BR'];
    return langResponses[agentName] || langResponses['default'];
  }
}

// Export singleton instance
export const languageManager = new LanguageManager();