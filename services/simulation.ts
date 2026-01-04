
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, DiscreteTerm } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * Motor Industrial Empirion v7.5 - Fidelity Round 0 & Crisis Engine
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
) => {
  // BLOQUEIO ROUND 0: Retorno de valores exatos do Relatório Inicial (Fidelidade PDF Legado)
  // Garante que todas as empresas comecem com exatamente o mesmo Lucro Líquido ($ 73.928)
  if (isRoundZero || (previousState === undefined && decisions === undefined)) {
    return {
      revenue: 3322735,
      ebitda: 1044555,
      netProfit: 73928,
      salesVolume: 8932,
      marketShare: 12.5,
      cashFlowNext: 840200,
      receivables: 1823735,
      suggestRecovery: false,
      capexBlocked: false,
      suggestedActions: []
    };
  }

  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  
  // 1. HERANÇA DE SALDOS ( Bernard Fidelity Snaps )
  const inheritedReceivables = sanitize(previousState?.receivables_t1 || 1823735);
  const inheritedPayables = sanitize(previousState?.payables_t1 || 717605);
  const currentCash = sanitize(previousState?.cash || 840200);

  // 2. LÓGICA DE RECUPERAÇÃO JURÍDICA
  let recoveryModifier = 1.0;
  let interestPremium = 1.0;
  let legalFees = 0;
  let capexBlocked = false;

  if (decisions.legal?.recovery_mode === 'judicial') {
    recoveryModifier = 0.1;
    interestPremium = 2.0;
    legalFees = 75000;
    capexBlocked = true;
  } else if (decisions.legal?.recovery_mode === 'extrajudicial') {
    recoveryModifier = 0.6;
    interestPremium = 1.25;
    legalFees = 25000;
  }

  // 3. ANÁLISE COMERCIAL (9 REGIÕES)
  const regions = Object.values(decisions.regions || {});
  const avgPrice = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.price), 0) / regions.length : 372;
  const totalMarketing = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.marketing), 0) : 0;
  const termEffect = regions.length > 0 ? regions.reduce((acc, r) => acc + (r.term === 1 ? 1.08 : r.term === 0 ? 0.98 : 1.0), 0) / regions.length : 1.0;
  
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const baseSales = marketPotential * termEffect * (1 + (totalMarketing / 1200));
  const salesVolume = Math.min(baseSales, 12000); 
  const revenue = salesVolume * avgPrice;

  // 4. RH (Bernard Standard 1.6x)
  const salary = sanitize(decisions.hr?.salary || 1313);
  const staffCount = sanitize(decisions.hr?.sales_staff_count || 50);
  const payrollTotal = (salary * staffCount * 1.6) + (sanitize(decisions.hr?.trainingPercent) * 250);

  // 5. CUSTOS INDUSTRIAIS (MP CONSUMO)
  const mpA_Price = indicators.providerPrices.mpA * inflation;
  const mpB_Price = indicators.providerPrices.mpB * inflation;
  const unitCost = (mpA_Price + (mpB_Price / 2)); 
  const cpv = salesVolume * unitCost;

  // 6. PRAZOS
  let currentSalesInflow = 0;
  let nextCycleReceivables = 0;
  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) currentSalesInflow += regRev; 
    else if (r.term === 1) nextCycleReceivables += regRev; 
    else if (r.term === 2) { currentSalesInflow += regRev * 0.5; nextCycleReceivables += regRev * 0.5; }
  });

  // 7. COMPRAS
  const mpPurchaseTotal = (sanitize(decisions.production?.purchaseMPA) * mpA_Price) + 
                          (sanitize(decisions.production?.purchaseMPB) * mpB_Price);
  
  let currentMPOutflow = 0;
  if (decisions.production?.paymentType === 0) currentMPOutflow = mpPurchaseTotal;
  else if (decisions.production?.paymentType === 2) currentMPOutflow = mpPurchaseTotal * 0.5;

  // 8. RESULTADO
  const adminCosts = 145000 + legalFees;
  const fixedCosts = adminCosts + payrollTotal;
  const ebitda = revenue - cpv - fixedCosts;
  const netProfit = ebitda * 0.85;

  const projectedCashNext = currentCash 
    + inheritedReceivables 
    + currentSalesInflow 
    - (inheritedPayables * recoveryModifier)
    - currentMPOutflow 
    - fixedCosts 
    + (sanitize(decisions.finance?.loanRequest) * (1 / interestPremium))
    - sanitize(decisions.finance?.application);

  return {
    revenue, ebitda, netProfit, salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    cashFlowNext: projectedCashNext,
    receivables: nextCycleReceivables,
    suggestRecovery: (projectedCashNext < 0 && (revenue / (inheritedPayables || 1)) < 1.05),
    capexBlocked,
    suggestedActions: projectedCashNext < 0 ? ["OFERTA_EMPRESTIMO_EMERGENCIA"] : []
  };
};
