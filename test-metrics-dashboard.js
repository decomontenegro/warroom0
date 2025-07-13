// Test script to verify metrics dashboard functionality
import UltrathinkWorkflowEnhanced from './src/services/ultrathink-workflow-enhanced.js';

// Sample test document
const testDocument = `
FanBet Whitepaper Summary - Test Document

This is a test document to verify the metrics dashboard functionality.
It contains information about a decentralized betting platform with:
- Smart contract integration
- Blockchain technology
- Tokenomics and governance
- Security features and audits
- Community engagement mechanisms
`;

async function testMetricsDashboard() {
  console.log('🧪 Starting Metrics Dashboard Test...\n');
  
  const workflow = new UltrathinkWorkflowEnhanced();
  
  // Simular uma análise para gerar métricas
  console.log('📊 Executando análise UltraThink...');
  
  try {
    // Configurar callbacks para capturar progresso
    workflow.setProgressCallback((phase, message, data) => {
      console.log(`\n[${phase}] ${message}`);
      if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
      }
    });
    
    // Executar análise
    const startTime = Date.now();
    const result = await workflow.analyze(testDocument);
    const endTime = Date.now();
    
    console.log('\n✅ Análise concluída!');
    console.log(`⏱️  Tempo total: ${(endTime - startTime) / 1000}s`);
    
    // Exibir métricas principais
    console.log('\n📈 Métricas Calculadas:');
    console.log(`- Confiança Geral: ${Math.round((result.metrics?.overallConfidence || 0) * 100)}%`);
    console.log(`- Taxa de Consenso: ${Math.round((result.metrics?.consensusStrength || 0) * 100)}%`);
    console.log(`- Total de Agentes: ${result.metadata?.agentsUsed || 0}`);
    console.log(`- Complexidade do Documento: ${result.metadata?.complexity?.complexity || 'N/A'}`);
    
    // Verificar se os dados são adequados para o dashboard
    console.log('\n🔍 Verificando compatibilidade com dashboard:');
    const requiredFields = [
      'metrics.overallConfidence',
      'metrics.consensusStrength', 
      'metrics.executionTime',
      'metadata.agentsUsed',
      'metadata.complexity',
      'agentSelection.teams'
    ];
    
    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], result);
      console.log(`- ${field}: ${value !== undefined ? '✅' : '❌'}`);
    });
    
    // Salvar resultado para inspeção
    const fs = await import('fs/promises');
    await fs.writeFile(
      'test-metrics-result.json',
      JSON.stringify(result, null, 2)
    );
    
    console.log('\n💾 Resultado salvo em test-metrics-result.json');
    console.log('\n🎯 Teste concluído! Abra o navegador e execute uma análise no chat UltraThink para ver as métricas.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testMetricsDashboard();