
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, DiscreteTerm } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * ENGINE V7.0 - Oracle Core Fidelity
 * Tratamento rigoroso de Linha do Tempo e Prazos (0-1-2).
 * Garante que o caixa projetado respeite os recebimentos diferidos de rodadas anteriores.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators,
  previousState?: any // Snapshot herdado do banco de dados (Round anterior)
) => {
  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  
  // 1. HERANÇA DE SALDOS (Timing do Caixa)
  // No fechamento do round anterior, o engine salva 'receivables_t1' (o que entra agora)
  const inheritedReceivables = sanitize(previousState?.receivables_t1 || 1823735); // Valor inicial do PDF
  const inheritedPayables = sanitize(previousState?.payables_t1 || 717605);
  const currentCash = sanitize(previousState?.cash || 840200);

  // 2. ANÁLISE COMERCIAL & RECEITA
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc, r) => acc + sanitize(r.price), 0) / (regions.length || 1);
  const totalMarketing = regions.reduce((acc, r) => acc + sanitize(r.marketing), 0);
  
  // Elasticidade baseada em Preço e Prazo (Prazo 2 atrai +15% demanda, mas impacta caixa futuro)
  const termEffect = regions.reduce((acc, r) => acc + (r.term === 2 ? 1.15 : r.term === 1 ? 1.05 : 1.0), 0) / (regions.length || 1);
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  
  const salesVolume = Math.min(marketPotential * termEffect, 10000); // Teto de produção
  const revenue = salesVolume * avgPrice;

  // 3. LOGICA DE PRAZOS (CONSTRUÇÃO DO T+1 E T+2)
  let currentSalesInflow = 0; // O que entra no caixa NESTE round (Prazo 0)
  let nextCycleReceivables = 0; // O que vai para o T+1 do próximo round (Prazo 1 e 50% do Prazo 2)

  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) {
      currentSalesInflow += regRev;
    } else if (r.term === 1) {
      nextCycleReceivables += regRev;
    } else if (r.term === 2) {
      currentSalesInflow += regRev * 0.5;
      nextCycleReceivables += regRev * 0.5;
    }
  });

  // 4. CUSTOS & COMPRAS MP
  const unitCostMP = (indicators.providerPrices.mpA + (indicators.providerPrices.mpB / 2)) * inflation;
  const cpv = salesVolume * unitCostMP;
  const mpPurchaseTotal = (sanitize(decisions.production.purchaseMPA) * indicators.providerPrices.mpA) + 
                          (sanitize(decisions.production.purchaseMPB) * indicators.providerPrices.mpB);

  let currentMPOutflow = 0;
  let nextCyclePayables = 0;

  if (decisions.production.paymentType === 0) {
    currentMPOutflow = mpPurchaseTotal;
  } else if (decisions.production.paymentType === 1) {
    nextCyclePayables = mpPurchaseTotal;
  } else if (decisions.production.paymentType === 2) {
    currentMPOutflow = mpPurchaseTotal * 0.5;
    nextCyclePayables = mpPurchaseTotal * 0.5;
  }

  // 5. RESULTADOS FINANCEIROS (DRE)
  const fixedCosts = 120000 + (sanitize(decisions.hr.salary) * 50);
  const ebitda = revenue - cpv - fixedCosts;
  const netProfit = ebitda * 0.85; // Simplificação IR

  // 6. FLUXO DE CAIXA FINAL (O Grande Equilíbrio)
  // Caixa Final = Saldo Inicial + Entradas (Herdadas + Novas) - Saídas (Herdadas + Novas)
  const projectedCashNext = currentCash 
    + inheritedReceivables 
    + currentSalesInflow 
    - inheritedPayables 
    - currentMPOutflow 
    - fixedCosts 
    + sanitize(decisions.finance.loanRequest)
    - sanitize(decisions.finance.application);

  return {
    revenue,
    ebitda,
    netProfit,
    salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    cashFlowNext: projectedCashNext,
    receivables: nextCycleReceivables, // Vai para o snapshot como 'receivables_t1'
    payables: nextCyclePayables,       // Vai para o snapshot como 'payables_t1'
    oee: sanitize(decisions.production.activityLevel)
  };
};
