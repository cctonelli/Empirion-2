
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, DiscreteTerm } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * ENGINE V7.0 - Bernard Fidelity
 * Calcula o impacto financeiro com base nos prazos discretos 0-1-2.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators
) => {
  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  const interestRate = (indicators.interestRateTR / 100);

  // 1. ANÁLISE DE MERCADO & VENDAS
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc, r) => acc + sanitize(r.price), 0) / (regions.length || 1);
  const totalMarketing = regions.reduce((acc, r) => acc + sanitize(r.marketing), 0);
  
  // Eficiência de Vendas baseada no Prazo (Prazo 2 atrai mais clientes mas gera risco)
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
  
  // 3. LOGICA DE PRAZOS (A GRANDE TACADA)
  // Vendas: 0 = 100% no T+1 | 1 = 100% no T+2 | 2 = 50% T+1, 50% T+2
  let cashInflowNext = 0;
  let accountsReceivableLongTerm = 0;

  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) cashInflowNext += regRev;
    else if (r.term === 1) accountsReceivableLongTerm += regRev;
    else {
      cashInflowNext += regRev * 0.5;
      accountsReceivableLongTerm += regRev * 0.5;
    }
  });

  // Compras MP: 0 = 100% no T+1 | 1 = 100% no T+2 | 2 = 50% T+1, 50% T+2
  const mpTotalCost = (sanitize(decisions.production.purchaseMPA) * indicators.providerPrices.mpA) + 
                     (sanitize(decisions.production.purchaseMPB) * indicators.providerPrices.mpB);
  
  let cashOutMPNext = 0;
  let accountsPayableLongTerm = 0;

  if (decisions.production.paymentType === 0) cashOutMPNext = mpTotalCost;
  else if (decisions.production.paymentType === 1) accountsPayableLongTerm = mpTotalCost;
  else {
    cashOutMPNext = mpTotalCost * 0.5;
    accountsPayableLongTerm = mpTotalCost * 0.5;
  }

  // 4. RESULTADOS FINAIS
  const fixedCosts = 120000 + (sanitize(decisions.hr.salary) * 50);
  const ebitda = revenue - cpv - fixedCosts - (totalMarketing * indicators.marketingExpenseBase / 100);
  const netProfit = ebitda * 0.85; // Simplificação IR

  return {
    revenue,
    ebitda,
    netProfit,
    salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    oee: sanitize(decisions.production.activityLevel),
    // Fluxo de Caixa Projetado
    cashFlowNext: cashInflowNext - cashOutMPNext - fixedCosts + sanitize(decisions.finance.loanRequest),
    receivables: accountsReceivableLongTerm,
    payables: accountsPayableLongTerm
  };
};
