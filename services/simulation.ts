
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType, MachineMaintenanceConfig, BuildingSpec, InitialBuilding } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

/**
 * Sanitizador Alpha Node 08 - Preservação de Floats
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v30.20 - EFICÁCIA CONTÁBIL TOTAL
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

  // --- 0. PREPARAÇÃO DE SALDOS INICIAIS (CONTEXTO PATRIMONIAL) ---
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  
  // Saldos vindos do Balanço Anterior (ou Inicial)
  const prevBS = previousState?.statements?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  
  const prevCash = sanitize(previousState?.cash, 170000);
  const prevClients = sanitize(prevBS?.current?.clients, 1823735);
  const prevSuppliers = sanitize(prevBS?.current?.suppliers, 717605);
  const prevStockMPA_Val = sanitize(prevBS?.current?.stock?.mpa, 628545);
  const prevStockMPB_Val = sanitize(prevBS?.current?.stock?.mpb, 838060);
  const prevStockPA_Val = sanitize(prevBS?.current?.stock?.pa, 454000);
  const prevStockPA_Qty = 2000; // Baseline Qty
  
  const prevEquity = sanitize(previousState?.equity || 5055447);
  const prevInvestments = sanitize(prevBS?.current?.investments, 0);
  const prevLoansST = sanitize(prevBS?.current?.loans_st, 1872362);

  // --- 1. OPERAÇÕES E CUSTO DE PRODUÇÃO (CPP) ---
  const fleet = (previousState?.fleet || indicators.initial_machinery_mix) as InitialMachine[];
  const machineSpecs = indicators.machine_specs;
  const buildingSpec = indicators.building_spec;
  
  const nominalCapacity = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.production_capacity || 0), 0);
  const requiredProdStaff = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.operators_required || 0), 0);
  
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const productionPercent = activityLevel / 100;
  const unitsProduced = nominalCapacity * productionPercent;

  // Juros de Fornecedor (PMT) incorporado ao Preço de Compra
  const i_supp = sanitize(indicators.supplier_interest, 1.5) / 100;
  const payType = safeDecisions.production.paymentType || 0; // 0=Vista, 1=50/50, 2=33/33/33
  const n_supp = payType + 1;
  
  let unitCostMPA = indicators.prices.mp_a;
  let unitCostMPB = indicators.prices.mp_b;

  if (i_supp > 0 && n_supp > 1) {
    const pmtFactor = (i_supp * Math.pow(1 + i_supp, n_supp)) / (Math.pow(1 + i_supp, n_supp) - 1);
    unitCostMPA = (indicators.prices.mp_a * pmtFactor) * n_supp;
    unitCostMPB = (indicators.prices.mp_b * pmtFactor) * n_supp;
  }

  // Compras do Período
  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const totalPurchaseValue = (purchaseMPA_Qty * unitCostMPA) + (purchaseMPB_Qty * unitCostMPB);

  // Saída de Caixa para Fornecedores (Parcela à Vista + Pagamento da Dívida Anterior)
  const cashOutflowSuppliers = (totalPurchaseValue / n_supp) + (prevSuppliers * 0.5); // Amortiza 50% do passivo anterior
  const newSuppliersLiability = (prevSuppliers * 0.5) + (totalPurchaseValue * (n_supp - 1) / n_supp);

  // Consumo MP (3 MP-A + 2 MP-B por Unidade)
  const mpaConsumedVal = (unitsProduced * 3 * unitCostMPA);
  const mpbConsumedVal = (unitsProduced * 2 * unitCostMPB);
  
  // MOD e Encargos
  const salaryBase = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const payrollProduction = (requiredProdStaff * salaryBase) * (1 + socialChargesRate);

  // Depreciação e Manutenção
  const machineDeprec = fleet.reduce((acc, m) => acc + ((m.book_value || 500000) * 0.025), 0);
  const buildingDeprec = buildingSpec.initial_value * buildingSpec.depreciation_rate;
  const totalMaint = fleet.length * 5000; // Simplificado para o core

  // Estocagem
  const qtyMPA_End = Math.max(0, (prevStockMPA_Val / indicators.prices.mp_a) + purchaseMPA_Qty - (unitsProduced * 3));
  const qtyMPB_End = Math.max(0, (prevStockMPB_Val / indicators.prices.mp_b) + purchaseMPB_Qty - (unitsProduced * 2));
  const storageCost = (qtyMPA_End + qtyMPB_End) * indicators.prices.storage_mp;

  // CPP FINAL
  const totalProductionCost = mpaConsumedVal + mpbConsumedVal + payrollProduction + machineDeprec + buildingDeprec + totalMaint + storageCost;
  const currentCPP = unitsProduced > 0 ? totalProductionCost / unitsProduced : 0;

  // WAC (Custo Médio Ponderado) do Produto Acabado
  const wacPA = unitsProduced > 0 
    ? (prevStockPA_Val + (unitsProduced * currentCPP)) / (prevStockPA_Qty + unitsProduced)
    : (prevStockPA_Val / Math.max(1, prevStockPA_Qty));

  // --- 2. VENDAS E RECEBIMENTOS ---
  const rd_percent = sanitize(safeDecisions.production.rd_investment, 0);
  const rd_market_bonus = 1 + (rd_percent / 40);
  const unitsSold = Math.min(prevStockPA_Qty + unitsProduced, (nominalCapacity * 0.125) * rd_market_bonus);
  
  let totalRevenue = 0;
  let cashFromNewSales = 0;
  let i_term = sanitize(safeDecisions.production.term_interest_rate, 1.5) / 100;

  // Simulação por regiões para composição de preço e prazo
  const regions = Object.values(safeDecisions.regions);
  const unitsPerRegion = unitsSold / Math.max(regions.length, 1);

  regions.forEach((reg: any) => {
    const price = sanitize(reg.price, 375);
    const n = (reg.term || 0) + 1;
    let pmt = price;
    if (i_term > 0 && n > 1) {
      const pow = Math.pow(1 + i_term, n);
      pmt = price * (i_term * pow) / (pow - 1);
    }
    const totalToReceivePerUnit = pmt * n;
    totalRevenue += (totalToReceivePerUnit * unitsPerRegion);
    cashFromNewSales += (pmt * unitsPerRegion);
  });

  // Recebimento de Clientes (Giro do saldo anterior)
  const collectionFromPrev = prevClients * 0.45; // 45% do saldo anterior entra no caixa
  const totalCashInflowClients = cashFromNewSales + collectionFromPrev;
  const newClientsBalance = (prevClients - collectionFromPrev) + (totalRevenue - cashFromNewSales);

  // --- 3. DRE (RESULTADO ECONÔMICO) ---
  const cpv = unitsSold * wacPA;
  const grossProfit = totalRevenue - cpv;
  
  const opexSales = (10 * salaryBase * 4) * (1 + socialChargesRate); // Equipe Vendas
  const opexAdm = (20 * salaryBase * 4) * (1 + socialChargesRate);   // Equipe Adm
  const rd_expense = totalRevenue * (rd_percent / 100);
  const totalOpex = opexSales + opexAdm + rd_expense;
  
  const operatingProfit = grossProfit - totalOpex;
  
  const finRev = prevInvestments * (sanitize(indicators.investment_return_rate, 1.0) / 100);
  const finExp = (prevLoansST * 0.02) + (sanitize(safeDecisions.finance.loanRequest, 0) * 0.03);
  const finResult = finRev - finExp;
  
  const lair = operatingProfit + finResult;
  const tax = lair > 0 ? lair * 0.15 : 0;
  const netProfit = lair - tax;

  // --- 4. FLUXO DE CAIXA (REGIME DE CAIXA) ---
  const totalInflow = totalCashInflowClients + finRev + sanitize(safeDecisions.finance.loanRequest, 0);
  const totalOutflow = cashOutflowSuppliers + payrollProduction + opexSales + opexAdm + rd_expense + totalMaint + finExp + tax;
  const finalCash = prevCash + totalInflow - totalOutflow - sanitize(safeDecisions.finance.application, 0);

  // --- 5. BALANÇO PATRIMONIAL (PATRIMÔNIO) ---
  const finalStockPA = (prevStockPA_Qty + unitsProduced - unitsSold) * wacPA;
  const finalStockMP = (qtyMPA_End * indicators.prices.mp_a) + (qtyMPB_End * indicators.prices.mp_b);
  
  // Lucro Retido para o PL
  const newRetainedEarnings = netProfit; 

  return {
    revenue: totalRevenue,
    netProfit: netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'B',
    health: { rating: netProfit > 0 ? 'AAA' : 'B', cpp: currentCPP, cash: finalCash },
    kpis: {
      market_share: 12.5 * rd_market_bonus,
      rating: netProfit > 0 ? 'AAA' : 'B',
      insolvency_status: finalCash > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + newRetainedEarnings,
      fleet: fleet.map(m => ({ ...m, age: m.age + 1 }))
    },
    statements: {
      dre: {
        revenue: totalRevenue,
        cpv,
        gross_profit: grossProfit,
        opex: totalOpex,
        operating_profit: operatingProfit,
        financial_result: finResult,
        lair,
        tax,
        net_profit: netProfit,
        details: { cpp: currentCPP, wac_pa: wacPA, storage_cost: storageCost, deprec: machineDeprec + buildingDeprec }
      },
      cash_flow: {
        start: prevCash,
        inflow: { total: totalInflow, cash_sales: cashFromNewSales, term_sales: collectionFromPrev, loans: sanitize(safeDecisions.finance.loanRequest, 0) },
        outflow: { total: totalOutflow, suppliers: cashOutflowSuppliers, payroll: payrollProduction, taxes: tax, interest: finExp },
        final: finalCash
      },
      balance_sheet: {
        current: {
          cash: finalCash,
          clients: newClientsBalance,
          stock: { mpa: qtyMPA_End * unitCostMPA, mpb: qtyMPB_End * unitCostMPB, pa: finalStockPA },
          investments: sanitize(safeDecisions.finance.application, 0),
          suppliers: newSuppliersLiability,
          taxes: tax,
          loans_st: prevLoansST + sanitize(safeDecisions.finance.loanRequest, 0)
        },
        equity: {
          total: prevEquity + newRetainedEarnings
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rd_bonus = 1 + (sanitize(decisions.production.rd_investment, 0) / 30);
  return (Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.06)), 0) / 4) * rd_bonus;
};
