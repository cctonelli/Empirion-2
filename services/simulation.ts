
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
  
  // 1. HERANÇA DE SALDOS (SNAPSHOT Round 0)
  const inheritedReceivables = sanitize(previousState?.receivables_t1 || 1823735);
  const inheritedPayables = sanitize(previousState?.payables_t1 || 717605);
  const currentCash = sanitize(previousState?.cash || 840200);

  // 2. LÓGICA DE RECUPERAÇÃO (IMPACTO ENGINE)
  let recoveryModifier = 1.0;
  let interestPremium = 1.0;
  let legalFees = 0;
  let capexBlocked = false;

  if (decisions.legal?.recovery_mode === 'judicial') {
    // RJ: Proteção de caixa (paga 10% do passivo), mas bloqueia máquinas e juros +100%
    recoveryModifier = 0.1;
    interestPremium = 2.0;
    legalFees = 75000;
    capexBlocked = true;
  } else if (decisions.legal?.recovery_mode === 'extrajudicial') {
    // REJ: Alívio moderado, juros +20%
    recoveryModifier = 0.6;
    interestPremium = 1.2;
    legalFees = 25000;
  }

  // 3. ANÁLISE COMERCIAL & DEMANDA REGIONAL
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc, r) => acc + sanitize(r.price), 0) / (regions.length || 1);
  const totalMarketing = regions.reduce((acc, r) => acc + sanitize(r.marketing), 0);
  
  // Efeito Prazo: Diferido atrai 10% mais demanda
  const termEffect = regions.reduce((acc, r) => acc + (r.term === 1 ? 1.1 : 1.0), 0) / (regions.length || 1);
  
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const salesVolume = Math.min(marketPotential * termEffect * (1 + (totalMarketing/1000)), 12000);
  const revenue = salesVolume * avgPrice;

  // 4. RH & CUSTO FOLHA (Encargos Standard 1.6x)
  const salary = sanitize(decisions.hr?.salary || 1313);
  const staffCount = sanitize(decisions.hr?.sales_staff_count || 50);
  const payrollTotal = (salary * staffCount * 1.6) + (sanitize(decisions.hr?.trainingPercent) * 100);

  // 5. CUSTOS INDUSTRIAIS (MP CONSUMO)
  const mpA_Price = indicators.providerPrices.mpA * inflation;
  const mpB_Price = indicators.providerPrices.mpB * inflation;
  const unitCost = (mpA_Price + (mpB_Price / 2)); 
  const cpv = salesVolume * unitCost;

  // 6. LOGICA DE PRAZOS (ENTRADA CAIXA)
  let currentSalesInflow = 0;
  let nextCycleReceivables = 0;
  regions.forEach(r => {
    const regRev = (sanitize(r.price) * (salesVolume / 9));
    if (r.term === 0) currentSalesInflow += regRev; // À vista entra agora
    else if (r.term === 1) nextCycleReceivables += regRev; // Diferido entra depois
    else if (r.term === 2) { currentSalesInflow += regRev * 0.5; nextCycleReceivables += regRev * 0.5; }
  });

  // 7. COMPRAS MATÉRIAS-PRIMAS (SAÍDA CAIXA)
  const mpPurchaseTotal = (sanitize(decisions.production.purchaseMPA) * mpA_Price) + 
                          (sanitize(decisions.production.purchaseMPB) * mpB_Price);
  
  let currentMPOutflow = 0;
  if (decisions.production.paymentType === 0) currentMPOutflow = mpPurchaseTotal;
  else if (decisions.production.paymentType === 2) currentMPOutflow = mpPurchaseTotal * 0.5;

  // 8. RESULTADO LÍQUIDO & CAIXA FINAL
  const fixedCosts = 150000 + payrollTotal + legalFees;
  const ebitda = revenue - cpv - fixedCosts;
  const netProfit = ebitda * 0.85;

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
    suggestRecovery: (projectedCashNext < 0 && (revenue / (inheritedPayables || 1)) < 1.05),
    capexBlocked
  };
};
