
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
 * CORE ORACLE ENGINE v24.2 - PLR & CASH FLOW INTEGRATION
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

  // Recuperação de Estado Anterior
  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);
  const prevTaxProvision = sanitize(prevBS.liabilities?.current_taxes || 13045);

  const roundOverride = roundRules?.[currentRound] || {};
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...roundOverride };

  // 0. STAFFING CONTEXT
  const staffAdmin = sanitize(indicators.staffing.admin.count, 20);
  const staffSales = sanitize(indicators.staffing.sales.count, 10);
  const staffProd = sanitize(indicators.staffing.production.count, 470);
  const totalStaff = staffAdmin + staffSales + staffProd;

  // 1. GESTÃO DE PESSOAL E CUSTOS FIXOS
  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const socialChargesFactor = 1 + socialChargesRate;
  const basePayrollOutflow = (totalStaff * salaryDecided) * socialChargesFactor;

  // 2. PRODUÇÃO E CPV (PLR não entra aqui conforme regra)
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80) / 100;
  const unitsProduced = 10000 * sanitize(indicators.labor_productivity, 1.0) * activityLevel;
  const totalMPCost = (unitsProduced * 3 * sanitize(indicators.prices.mp_a, 20)) + (unitsProduced * 2 * sanitize(indicators.prices.mp_b, 40));
  
  // MOD Direta (apenas produção)
  const modDirect = (staffProd * salaryDecided) * socialChargesFactor;
  const productionCost = totalMPCost + modDirect + 150000; // + Depreciação fixa
  const unitCost = productionCost / Math.max(unitsProduced, 1);

  // 3. VENDAS E RECEITA
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const marketDemand = (10000 * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const myShare = forcedShare || (100 / teamsCount);
  const unitsSold = Math.min(unitsProduced, (marketDemand * (myShare/100)));
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const revenue = unitsSold * avgPrice;

  // 4. DRE TÁTICO
  const cpv = unitsSold * unitCost;
  const grossProfit = revenue - cpv;
  const opex = ((staffAdmin + staffSales) * salaryDecided) * socialChargesFactor + 350000;
  
  const operatingProfit = grossProfit - opex;
  const financialExpense = 40000;
  const lair = operatingProfit - financialExpense;

  // IR
  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  
  const profitAfterTax = lair - irProvision;

  // REGRA PLR: Calculado após lucro pós-IR e pago no mesmo período
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrValue = profitAfterTax > 0 ? (profitAfterTax * plrPercent) : 0;
  const plrPerEmployee = plrValue / Math.max(totalStaff, 1);

  const netProfit = profitAfterTax - plrValue;

  // 5. FLUXO DE CAIXA (CASH FLOW)
  // O PLR é debitado diretamente da conta "FOLHA DE PAGAMENTO" no mesmo período
  const totalPayrollOutflow = basePayrollOutflow + plrValue;
  const cashOutflowTaxes = prevTaxProvision; 
  
  // 6. BALANÇO PATRIMONIAL
  const currentTaxesLiability = irProvision;

  return {
    revenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'C',
    marketShare: myShare,
    health: { 
      rating: netProfit > 0 ? 'AAA' : 'C',
      plr_distributed: plrValue > 0,
      plr_per_capita: plrPerEmployee,
      motivation_index: 0.7 + (plrPercent * 2) // Simulação de impacto motivacional
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
        tax: irProvision, 
        profit_after_tax: profitAfterTax,
        plr: plrValue, // (-) PPR - PARTICIPAÇÃO NO LUCRO
        net_profit: netProfit,
        details: {
           unit_cost: unitCost,
           plr_per_employee: plrPerEmployee,
           total_staff: totalStaff
        }
      },
      balance_sheet: {
        liabilities: {
          current_taxes: currentTaxesLiability
        }
      },
      cash_flow: {
        outflow: {
          payroll: totalPayrollOutflow, // Folha + PLR
          taxes: cashOutflowTaxes 
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
