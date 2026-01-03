
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, DiscreteTerm } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators,
  previousState?: any
) => {
  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  
  // 1. HERANÇA DE SALDOS
  const inheritedReceivables = sanitize(previousState?.receivables_t1 || 1823735);
  const inheritedPayables = sanitize(previousState?.payables_t1 || 717605);
  const currentCash = sanitize(previousState?.cash || 840200);

  // 2. LÓGICA DE RECUPERAÇÃO (IMPACTO ENGINE)
  let recoveryModifier = 1.0;
  let interestPremium = 1.0;
  let legalFees = 0;

  if (decisions.legal?.recovery_mode === 'judicial') {
    recoveryModifier = 0.2;
    interestPremium = 1.5;
    legalFees = 50000;
  } else if (decisions.legal?.recovery_mode === 'extrajudicial') {
    recoveryModifier = 0.7;
    interestPremium = 1.1;
    legalFees = 15000;
  }

  // 3. ANÁLISE COMERCIAL & MARKET SHARE
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc, r) => acc + sanitize(r.price), 0) / (regions.length || 1);
  const termEffect = regions.reduce((acc, r) => acc + (r.term === 2 ? 1.15 : r.term === 1 ? 1.05 : 1.0), 0) / (regions.length || 1);
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  
  const salesVolume = Math.min(marketPotential * termEffect, 10000);
  const revenue = salesVolume * avgPrice;

  // 4. RH & PRODUTIVIDADE (NOVO)
  const salary = sanitize(decisions.hr?.salary || 1313);
  const staffCount = sanitize(decisions.hr?.sales_staff_count || 50);
  const trainingExp = (salary * staffCount) * (sanitize(decisions.hr?.trainingPercent) / 100);
  const payrollTotal = (salary * staffCount * 1.6) + trainingExp; // 1.6 = Encargos Bernard Standard

  // 5. LOGICA DE PRAZOS (ENTRADA)
  let currentSalesInflow = 0;
  let nextCycleReceivables = 0;
  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) currentSalesInflow += regRev;
    else if (r.term === 1) nextCycleReceivables += regRev;
    else if (r.term === 2) { currentSalesInflow += regRev * 0.5; nextCycleReceivables += regRev * 0.5; }
  });

  // 6. CUSTOS & COMPRAS (SAÍDA)
  const unitCostMP = (indicators.providerPrices.mpA + (indicators.providerPrices.mpB / 2)) * inflation;
  const cpv = salesVolume * unitCostMP;
  const mpPurchaseTotal = (sanitize(decisions.production.purchaseMPA) * indicators.providerPrices.mpA) + 
                          (sanitize(decisions.production.purchaseMPB) * indicators.providerPrices.mpB);

  let currentMPOutflow = 0;
  if (decisions.production.paymentType === 0) currentMPOutflow = mpPurchaseTotal;
  else if (decisions.production.paymentType === 2) currentMPOutflow = mpPurchaseTotal * 0.5;

  // 7. RESULTADOS FINANCEIROS
  const adminCosts = 120000 + legalFees;
  const fixedCosts = adminCosts + payrollTotal;
  const ebitda = revenue - cpv - fixedCosts;
  const netProfit = ebitda * 0.85;

  // 8. FLUXO DE CAIXA FINAL (RECOVERY ADJUSTED)
  const projectedCashNext = currentCash 
    + inheritedReceivables 
    + currentSalesInflow 
    - (inheritedPayables * recoveryModifier)
    - currentMPOutflow 
    - fixedCosts 
    + (sanitize(decisions.finance.loanRequest) * (1 / interestPremium))
    - sanitize(decisions.finance.application);

  return {
    revenue, ebitda, netProfit, salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    cashFlowNext: projectedCashNext,
    receivables: nextCycleReceivables,
    suggestRecovery: (projectedCashNext < 0 && (revenue / (inheritedPayables || 1)) < 1.1)
  };
};
