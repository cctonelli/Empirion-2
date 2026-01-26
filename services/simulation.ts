
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

/**
 * Sanitizador Alpha Node 08
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v24.1 - TAX REGIME & CASH FLOW KERNEL
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators = DEFAULT_MACRO,
  previousState?: any,
  roundHistory: any[] = [],
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>,
  forcedShare?: number,
  championshipData?: Championship
): ProjectionResult => {
  
  const safeDecisions: DecisionData = JSON.parse(JSON.stringify(decisions, (key, value) => {
      if (typeof value === 'number') return (isNaN(value) || !isFinite(value)) ? 0 : value;
      return value;
  }));

  // Recuperação de Estado Anterior (Balanço e DRE)
  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);
  const prevTaxProvision = sanitize(prevBS.liabilities?.current_taxes || 13045); // Valor a ser pago neste round

  const roundOverride = roundRules?.[currentRound] || {};
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...roundOverride };

  // 0. CONFIGURAÇÕES TRIBUTÁRIAS
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const socialChargesFactor = 1 + socialChargesRate;
  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;

  // 1. GESTÃO DE PESSOAL E CUSTOS FIXOS
  const staffProd = sanitize(indicators.staffing.production.count, 470);
  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const modPayrollBase = salaryDecided * staffProd;

  // 2. PRODUÇÃO E CPV
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80) / 100;
  const unitsProduced = 10000 * sanitize(indicators.labor_productivity, 1.0) * activityLevel;
  
  const totalMPCost = (unitsProduced * 3 * sanitize(indicators.prices.mp_a, 20)) + (unitsProduced * 2 * sanitize(indicators.prices.mp_b, 40));
  const productionCost = totalMPCost + (modPayrollBase * socialChargesFactor) + 150000; // + Depreciação fixa
  const unitCost = productionCost / Math.max(unitsProduced, 1);

  // 3. VENDAS E RECEITA
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const marketDemand = (10000 * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const myShare = forcedShare || (100 / teamsCount);
  const unitsSold = Math.min(unitsProduced, (marketDemand * (myShare/100)));
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const revenue = unitsSold * avgPrice;

  // 4. DRE TÁTICO - CÁLCULO DO LAIR E IR
  const cpv = unitsSold * unitCost;
  const grossProfit = revenue - cpv;
  const opex = (salaryDecided * 30 * 4) * socialChargesFactor + 350000; // Simplificado: Admin + Vendas + Fixo
  
  const operatingProfit = grossProfit - opex;
  const financialExpense = 40000; // Juros fixos de baseline
  const lair = operatingProfit - financialExpense;

  // REGRA IMPOSTO DE RENDA: Incide apenas se LAIR > 0
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  
  // Premiações e PLR
  const precisionBonus = 0; // Calculado em v23.5
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrValue = lair > 0 ? (lair * plrPercent) : 0;
  
  const netProfit = lair - irProvision + precisionBonus - plrValue;

  // 5. FLUXO DE CAIXA (CASH FLOW)
  // Pagamento do IR provisionado no round anterior
  const cashOutflowTaxes = prevTaxProvision; 
  
  // 6. BALANÇO PATRIMONIAL (BALANCE SHEET)
  // A nova provisão vai para o Passivo Circulante
  const currentTaxesLiability = irProvision;

  return {
    revenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'C',
    marketShare: myShare,
    health: { 
      rating: netProfit > 0 ? 'AAA' : 'C',
      tax_payment_executed: cashOutflowTaxes > 0
    },
    kpis: {
      market_share: myShare,
      rating: netProfit > 0 ? 'AAA' : 'C',
      insolvency_status: netProfit > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + netProfit
    },
    statements: {
      dre: { 
        revenue, 
        cpv, 
        gross_profit: grossProfit, 
        opex, 
        operating_profit: operatingProfit,
        lair,
        tax: irProvision, // (-) PROVISÃO PARA O IR
        net_profit: netProfit,
        details: {
           unit_cost: unitCost,
           tax_rate_applied: taxRateIR * 100
        }
      },
      balance_sheet: {
        liabilities: {
          current_taxes: currentTaxesLiability // IMPOSTO DE RENDA A PAGAR
        }
      },
      cash_flow: {
        outflow: {
          taxes: cashOutflowTaxes // IMPOSTO DE RENDA (Pago)
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
