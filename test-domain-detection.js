/**
 * Test específico para verificar detecção de domínios
 */

import deepContextAnalyzer from './src/services/deep-context-analyzer.js';

console.log('🔍 Teste de Detecção de Domínios\n');

// Verificar domainKnowledge
console.log('=== Domínios Configurados ===');
const analyzer = deepContextAnalyzer;
console.log('Domínios disponíveis:', Object.keys(analyzer.domainKnowledge));

// Verificar keywords de cada domínio
Object.entries(analyzer.domainKnowledge).forEach(([domain, data]) => {
  console.log(`\n${domain}:`);
  console.log('  Keywords:', data.keywords);
});

// Testar queries específicas
console.log('\n\n=== Teste de Queries ===');

const testCases = [
  {
    query: 'Vender café premium globalmente com pagamento em Bitcoin',
    expectedDomains: ['coffee', 'crypto', 'global', 'ecommerce'],
    shouldNotHave: ['gaming']
  },
  {
    query: 'Como criar um jogo de plataforma estilo Mario',
    expectedDomains: ['gaming'],
    shouldNotHave: ['coffee', 'crypto']
  },
  {
    query: 'Desenvolver uma API REST para e-commerce',
    expectedDomains: ['ecommerce'],
    shouldNotHave: ['gaming', 'coffee', 'crypto']
  },
  {
    query: 'Sistema de pagamento com blockchain para marketplace',
    expectedDomains: ['crypto', 'ecommerce'],
    shouldNotHave: ['gaming', 'coffee']
  }
];

testCases.forEach(({ query, expectedDomains, shouldNotHave }) => {
  console.log(`\n📝 Query: "${query}"`);
  
  // Análise básica
  const basicContext = analyzer.analyzeInput(query);
  console.log(`   Domínio básico: ${basicContext.domain || 'nenhum'}`);
  
  // Análise profunda
  const deepContext = analyzer.analyzeDeepContext(query);
  console.log(`   Domínios profundos: ${deepContext.domains.join(', ') || 'nenhum'}`);
  
  // Verificar expectativas
  const hasExpected = expectedDomains.every(d => 
    deepContext.domains.includes(d) || basicContext.domain === d
  );
  const hasUnexpected = shouldNotHave.some(d => 
    deepContext.domains.includes(d) || basicContext.domain === d
  );
  
  if (hasExpected && !hasUnexpected) {
    console.log('   ✅ Detecção correta');
  } else {
    console.log('   ❌ Problema na detecção:');
    if (!hasExpected) {
      const missing = expectedDomains.filter(d => 
        !deepContext.domains.includes(d) && basicContext.domain !== d
      );
      console.log(`      - Faltando: ${missing.join(', ')}`);
    }
    if (hasUnexpected) {
      const unwanted = shouldNotHave.filter(d => 
        deepContext.domains.includes(d) || basicContext.domain === d
      );
      console.log(`      - Não deveria ter: ${unwanted.join(', ')}`);
    }
  }
  
  // Debug: verificar porque gaming aparece
  if (deepContext.domains.includes('gaming') && shouldNotHave.includes('gaming')) {
    console.log('\n   🐛 Debug - Por que gaming foi detectado?');
    const gamingKeywords = analyzer.domainKnowledge.gaming.keywords;
    gamingKeywords.forEach(keyword => {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`      - Encontrou keyword "${keyword}" na query`);
      }
    });
  }
});

console.log('\n\n💡 Conclusão:');
console.log('Se "gaming" está aparecendo em queries não relacionadas, verifique:');
console.log('1. Se há palavras como "game", "player", etc. sendo detectadas incorretamente');
console.log('2. Se o contexto está sendo mantido entre execuções (cache/estado global)');
console.log('3. Se há alguma lógica de fallback que sempre adiciona gaming');