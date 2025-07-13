#!/usr/bin/env node

/**
 * Teste do UltraThink Enhanced com o White Paper FanBet
 * Demonstra a análise avançada de documentos técnicos
 */

import UltrathinkWorkflowEnhanced from './src/services/ultrathink-workflow-enhanced.js';

// Trecho do white paper FanBet para teste
const fanBetWhitePaper = `
FanBet: Decentralized Sports Betting Platform Using Fixed Percentage Fan Token Betting Units

Abstract
This white paper presents a decentralized sports betting platform that leverages blockchain technology and fan tokens to create a fair, transparent, and engaging betting experience. The platform introduces a novel approach by using fixed percentages of total fan token supplies as betting units, ensuring fairness across teams with different token supplies and allowing token prices to influence implied odds naturally. This document provides a comprehensive architectural overview, mathematical formulations, system workflows, usage examples, and discusses the benefits and novel aspects of the proposed system.

1. Introduction
The integration of blockchain technology into sports betting offers opportunities for enhanced transparency, fairness, and user engagement. This white paper introduces a decentralized sports betting platform that utilizes fan tokens as the core medium for placing bets. By adopting a novel approach where betting units are fixed percentages of the total supply of each team's fan tokens, the platform ensures equitable participation regardless of token supply disparities and allows token prices to naturally influence betting odds.

2. Overview of the Betting Platform
2.1 Key Features
- Decentralized Architecture: Built on blockchain technology, ensuring transparency and security.
- Fan Token Integration: Uses team-specific fan tokens for betting, enhancing fan engagement.
- Fixed Percentage Betting Units: Betting units are fixed percentages of total token supplies, ensuring fairness.
- Dynamic Odds Adjustment: Token price movements affect implied odds naturally.
- Automated Market Maker (AMM): Provides continuous liquidity and adjusts prices based on supply and demand.
- User-Friendly Interface: Intuitive platform design for ease of use.

3. Betting Mechanism Based on Fixed Percentage of Total Supply
3.1 Defining the Betting Unit
Betting Unit: A fixed percentage p of the total supply of a team's fan tokens.
Purpose: Standardizes the value of bets across teams with different token supplies.

3.2 Adjusting for Different Token Supplies
Consistency: Each bet represents the same proportion of a team's total token supply.
Calculation: BettingUnit_i = p × TotalSupply_i

3.3 Price Movements Affecting Implied Odds
Fully Diluted Valuation (FDV): FDV_i = Price_i × TotalSupply_i
Implied Odds: ImpliedOdds_i = FDV_i / (FDV_A + FDV_B)
Dynamic Adjustment: Token price fluctuations adjust FDVs and implied odds naturally without altering betting units.

4. System Architecture
4.1 Smart Contracts
4.1.1 MatchManager Contract
Purpose: Manages the creation and tracking of individual match markets.
Functions:
- createMatch(matchId, teams): Deploys a new MatchMarket contract for a specific match.
- getMatch(matchId): Retrieves the address of the MatchMarket contract for a given match ID.

4.1.2 MatchMarket Contracts
Purpose: Individual contracts for each match, handling bets and interactions specific to that match.
Functions:
- initialize(teams, bettingUnits): Initializes the match with participating teams and betting units.
- placeBet(team, amount): Allows users to place bets on a specific team.
- resolve(winningTeam): Resolves the match outcome.
`;

async function testFanBetAnalysis() {
  console.log('🚀 Testando UltraThink Enhanced com FanBet White Paper\n');
  
  const ultrathink = new UltrathinkWorkflowEnhanced();
  
  // Callback para mostrar progresso
  const progressCallback = (phase, agent, message) => {
    if (agent) {
      console.log(`\n[${agent.name}] ${message.substring(0, 150)}...`);
    } else {
      console.log(`\n📊 ${phase.toUpperCase()}: ${message}`);
    }
  };
  
  try {
    console.time('Análise completa');
    
    const result = await ultrathink.executeAdvancedWorkflow(fanBetWhitePaper, {
      documentType: 'whitepaper',
      maxAgents: 10,
      synthesisLevel: 'technical',
      targetSystem: 'claude-code',
      progressCallback
    });
    
    console.timeEnd('Análise completa');
    
    console.log('\n\n=== RESULTADO DA ANÁLISE ===\n');
    
    // Mostrar análise do documento
    console.log('📄 ANÁLISE DO DOCUMENTO:');
    console.log(`- Tipo: ${result.documentAnalysis.type}`);
    console.log(`- Complexidade: ${result.metadata.complexity.complexity}`);
    console.log(`- Domínios técnicos: ${result.documentAnalysis.technicalDomains.map(d => d.domain).join(', ')}`);
    console.log(`- Estrutura: ${result.documentAnalysis.structure.totalSections} seções`);
    
    // Mostrar agentes selecionados
    console.log('\n👥 AGENTES SELECIONADOS:');
    result.agentSelection.teams.forEach(team => {
      console.log(`\n${team.phase.toUpperCase()} (${team.agentCount} agentes):`);
      team.agents.forEach(agent => {
        console.log(`  - ${agent.name} (${agent.role})`);
      });
    });
    
    // Mostrar síntese principal
    console.log('\n📊 SÍNTESE PRINCIPAL:');
    if (result.synthesis.summary) {
      console.log(result.synthesis.summary);
    }
    
    // Mostrar análise técnica
    if (result.synthesis.technical_analysis) {
      console.log('\n🔧 ANÁLISE TÉCNICA:');
      console.log('Conceitos-chave identificados:');
      result.synthesis.technical_analysis.key_concepts.forEach(concept => {
        console.log(`  • ${concept}`);
      });
    }
    
    // Mostrar guia de implementação
    if (result.synthesis.implementation_guide) {
      console.log('\n🚀 GUIA DE IMPLEMENTAÇÃO:');
      console.log(`Abordagem recomendada: ${result.synthesis.implementation_guide.recommended_approach}`);
    }
    
    // Mostrar avaliação de riscos
    if (result.synthesis.risk_mitigation?.critical_risks) {
      console.log('\n⚠️ RISCOS CRÍTICOS:');
      result.synthesis.risk_mitigation.critical_risks.forEach(risk => {
        console.log(`  • ${risk.description || risk}`);
      });
    }
    
    // Mostrar métricas
    console.log('\n📈 MÉTRICAS:');
    console.log(`- Confiança geral: ${Math.round(result.metrics.overallConfidence * 100)}%`);
    console.log(`- Força do consenso: ${Math.round(result.metrics.consensusStrength * 100)}%`);
    console.log(`- Profundidade da análise: ${Math.round(result.metrics.analysisDepth * 100)}%`);
    console.log(`- Tempo de execução: ${result.metrics.executionTime}`);
    
    // Salvar resultado completo
    const fs = await import('fs');
    fs.writeFileSync(
      'fanbet-analysis-result.json', 
      JSON.stringify(result, null, 2)
    );
    console.log('\n✅ Resultado completo salvo em fanbet-analysis-result.json');
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  }
}

// Executar teste
testFanBetAnalysis();