
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, DiscreteTerm } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * ENGINE V7.5 - Oracle Core Fidelity
 * Tratamento rigoroso de Prazos (0-1-2) e Impacto Temporal.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators,
  previousState?: any // Estado herdado da rodada anterior
) => {
  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  const interestRate = (indicators.interestRateTR / 100);
  
  // Saldos Iniciais Herdados (Prazos de rodadas anteriores que vencem agora)
  const previousReceivables = sanitize(previousState?.receivables_t1 || 0);
  const previousPayables = sanitize(previousState?.payables_t1 || 0);
  const currentCash = sanitize(previousState?.cash || 840200);

  // 1. ANÁLISE DE MERCADO & VENDAS
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc, r) => acc + sanitize(r.price), 0) / (regions.length || 1);
  const totalMarketing = regions.reduce((acc, r) => acc + sanitize(r.marketing), 0);
  
  // Eficiência de Vendas baseada no Prazo (Prazo 2 atrai mais clientes mas gera risco de caixa)
  const termEffect = regions.reduce((acc, r) => acc + (r.term === 2 ? 1.15 : r.term === 1 ? 1.05 : 1.0), 0) / 9;
  
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const companyImage = Math.min(100, (totalMarketing * 3) + 40);
  const demand = marketPotential * Math.pow(avgPrice / 330, -1.8) * (companyImage / 70) * termEffect;

  // 2. PRODUÇÃO & CUSTOS
  const capacity = 10000 * (sanitize(decisions.production.activityLevel, 100) / 100);
  const salesVolume = Math.min(demand, capacity);
  const revenue = salesVolume * avgPrice;
  
  const unitCostMP = (indicators.providerPrices.mpA + (indicators.providerPrices.mpB / 2)) * inflation;
  const cpv = salesVolume * unitCostMP;
  
  // 3. LOGICA DE PRAZOS (CONSTRUÇÃO DA LINHA DO TEMPO)
  // Vendas Atuais: 0 = 100% no T+1 | 1 = 100% no T+2 | 2 = 50% T+1, 50% T+2
  let currentSalesInflowProjected = 0;
  let nextCycleReceivables = 0;

  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) {
      currentSalesInflowProjected += regRev;
    } else if (r.term === 1) {
      nextCycleReceivables += regRev;
    } else {
      currentSalesInflowProjected += regRev * 0.5;
      nextCycleReceivables += regRev * 0.5;
    }
  });

  // Compras MP Atuais: 0 = 100% no T+1 | 1 = 100% no T+2 | 2 = 50% T+1, 50% T+2
  const mpTotalCost = (sanitize(decisions.production.purchaseMPA) * indicators.providerPrices.mpA) + 
                     (sanitize(decisions.production.purchaseMPB) * indicators.providerPrices.mpB);
  
  let currentMPOutflowProjected = 0;
  let nextCyclePayables = 0;

  if (decisions.production.paymentType === 0) {
    currentMPOutflowProjected = mpTotalCost;
  } else if (decisions.production.paymentType === 1) {
    nextCyclePayables = mpTotalCost;
  } else {
    currentMPOutflowProjected = mpTotalCost * 0.5;
    nextCyclePayables = mpTotalCost * 0.5;
  }

  // 4. RESULTADOS FINANCEIROS
  const fixedCosts = 120000 + (sanitize(decisions.hr.salary) * 50);
  const ebitda = revenue - cpv - fixedCosts - (totalMarketing * indicators.marketingExpenseBase / 100);
  const netProfit = ebitda * 0.85; // Simplificação IR

  // FLUXO DE CAIXA REAL (Saldos Herdados + Projeções Atuais)
  const projectedCashEnd = currentCash 
    + previousReceivables 
    + currentSalesInflowProjected 
    - previousPayables 
    - currentMPOutflowProjected 
    - fixedCosts 
    + sanitize(decisions.finance.loanRequest)
    - (sanitize(decisions.finance.application));

  return {
    revenue,
    ebitda,
    netProfit,
    salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    oee: sanitize(decisions.production.activityLevel),
    // Fluxo de Caixa para a Linha do Tempo
    cashFlowNext: projectedCashEnd,
    receivables: nextCycleReceivables, // O que sobrará para receber no Round+2
    payables: nextCyclePayables      // O que sobrará para pagar no Round+2
  };
};
