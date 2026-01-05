import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * Motor Industrial Empirion v8.0 - Full Fidelity Engine
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
) => {
  // BLOQUEIO ROUND 0: Garante paridade absoluta legado ($ 73.928)
  if (isRoundZero) {
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
      indicators: getRoundZeroAdvanced()
    };
  }

  const inflation = 1 + (ecoConfig.inflationRate || 0.01);
  
  // 1. HERANÇA DE SALDOS
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

  // 3. COMERCIAL
  const regions = Object.values(decisions.regions || {});
  const avgPrice = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.price), 0) / regions.length : 372;
  const totalMarketing = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.marketing), 0) : 0;
  
  const avgTerm = regions.length > 0 
    ? regions.reduce((acc, r) => acc + (r.term === 1 ? 60 : r.term === 2 ? 30 : 0), 0) / regions.length 
    : 0;
  
  const termEffect = 1 + (avgTerm / 300);
  const marketPotential = (indicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const baseSales = marketPotential * termEffect * (1 + (totalMarketing / 1200));
  const salesVolume = Math.min(baseSales, 12000); 
  const revenue = salesVolume * avgPrice;

  // 4. RH
  const salary = sanitize(decisions.hr?.salary || 1313);
  const staffCount = sanitize(decisions.hr?.sales_staff_count || 50);
  const payrollTotal = (salary * staffCount * 1.6) * recoveryModifier + (sanitize(decisions.hr?.trainingPercent) * 250);

  // 5. CUSTOS
  const mpA_Price = indicators.providerPrices.mpA * inflation;
  const mpB_Price = indicators.providerPrices.mpB * inflation;
  const unitCost = (mpA_Price + (mpB_Price / 2)); 
  const cpv = salesVolume * unitCost;

  const adminCosts = 145000 + legalFees;
  const fixedCosts = adminCosts + payrollTotal;
  const ebitda = revenue - cpv - fixedCosts;
  const netProfit = ebitda * 0.85;

  const adv = calculateAdvanced(revenue, cpv, ebitda, netProfit, inheritedReceivables, inheritedPayables, currentCash, decisions);

  return {
    revenue, ebitda, netProfit, salesVolume,
    marketShare: (salesVolume / (marketPotential * 8)) * 100,
    cashFlowNext: currentCash + inheritedReceivables - inheritedPayables - fixedCosts,
    receivables: revenue * 0.5,
    suggestRecovery: (netProfit < 0),
    capexBlocked,
    indicators: adv
  };
};

const calculateAdvanced = (
  rev: number, 
  cpv: number, 
  ebitda: number, 
  net: number, 
  rec: number, 
  pay: number, 
  cash: number,
  decisions: DecisionData
): AdvancedIndicators => {
  const dailyRev = Math.max(rev / 30, 1);
  const dailyCPV = Math.max(cpv / 30, 1);
  
  const pmrv = rec / dailyRev;
  const pmre = 1466605 / dailyCPV; 
  const pmpc = pay / dailyCPV;

  return {
    nldcg_days: (rec + 1466605 - pay) / dailyRev,
    nldcg_components: {
      receivables: rec,
      inventory_finished: 0,
      inventory_raw: 1466605,
      suppliers: pay,
      other_payables: 31528
    },
    trit: (net / 9176940) * 100,
    insolvency_index: 2.19, 
    prazos: { pmre, pmrv, pmpc, pmdo: 69, pmmp: 96 },
    ciclos: {
      operacional: pmre + pmrv,
      financeiro: (pmre + pmrv) - pmpc,
      economico: pmre
    },
    fontes_financiamento: {
      ecp: rec + 417553,
      ccp: net - 905000,
      elp: 1500000
    },
    scissors_effect: {
      ncg: rec + 717474,
      available_capital: cash + 500000,
      gap: (cash + 500000) - (rec + 717474)
    }
  };
};

const getRoundZeroAdvanced = (): AdvancedIndicators => ({
  nldcg_days: 70,
  nldcg_components: {
    receivables: 1823735,
    inventory_finished: 0,
    inventory_raw: 1466605,
    suppliers: 717605,
    other_payables: 31528
  },
  trit: 0.95,
  insolvency_index: 2.19,
  prazos: { pmre: 58, pmrv: 49, pmpc: 46, pmdo: 69, pmmp: 96 },
  ciclos: { operacional: 107, financeiro: -7, economico: 62 },
  fontes_financiamento: { ecp: 2241288, ccp: -831153, elp: 1500000 },
  scissors_effect: { ncg: 2541209, available_capital: 668847, gap: -1890843 }
});