import { generatePureP0 } from './services/initialization';
import { calculateProjections, findAccountValue as fVal } from './services/simulation';
import { validateTripleConsistency } from './services/simulation-core';
import { Team, DecisionData, EcosystemConfig, MacroIndicators } from './types';

function runTest() {
  console.log("=== SIMULANDO GERAÇÃO P0 ===");
  const p0Template = generatePureP0({
    starting_mode: 'start_from_zero',
    capital_social: 10000000.00,
    caixa_inicial: 10000000.00,
    financial_investments: 0.00,
    building_mode: 'rented',
    monthly_rent_value: 35000.00,
    initial_installations_value: 200000.00,
    installations_acquisition_funding: 'debt',
    inventories: {
      finished_qty: 0,
      mpa_qty: 0,
      mpb_qty: 0
    },
    machines: []
  });

  console.log("p0Template keys:", Object.keys(p0Template));
  console.log("p0Template.kpis.stock_quantities:", p0Template.kpis?.stock_quantities);
  console.log("p0Template.kpis.statements.balance_sheet keys or cash:", fVal(p0Template.balance_sheet, 'assets.current.cash'));
  console.log("p0Template.kpis.statements.balance_sheet machines:", fVal(p0Template.balance_sheet, 'assets.noncurrent.fixed.machines'));

  console.log("=== CHECKING P0 CONSISTENCY ===");
  const p0Check = validateTripleConsistency({
    balance_sheet: p0Template.balance_sheet,
    dre: p0Template.dre,
    cash_flow: p0Template.cash_flow
  });
  console.log("P0 isValid:", p0Check.isValid);
  console.log("P0 Errors:", p0Check.errors);
  console.log("P0 Warnings:", p0Check.warnings);

  const team: Team = {
    id: 'team-trial-01',
    championship_id: 'champ-01',
    name: 'EQUIPE TRIAL 01',
    is_bot: false,
    strategic_profile: 'conservative',
    kpis: {
      ...p0Template.kpis,
      statements: {
        balance_sheet: p0Template.balance_sheet,
        dre: p0Template.dre,
        cash_flow: p0Template.cash_flow
      },
      current_cash: 10000000.00,
      machines: p0Template.machines,
      loans: p0Template.loans
    } as any,
    equity: 10000000.00
  };

  const decision: DecisionData = {
    production: {
      shifts: 1,
      activityLevel: 100,
      purchaseMPA: 0,
      purchaseMPB: 0,
      term_interest_rate: 0,
      paymentType: 0
    },
    machinery: {
      sell_ids: [],
      buy: { alfa: 2, beta: 0, gama: 0 } // Compra 2 Alfas para capex de 1.089.250 reais
    },
    finance: {
      loanRequest: 0,
      loanTerm: 0,
      applicationAmount: 0,
      dividendsDistribution: 0
    },
    pricing: {
      retail: 0,
      corporate: 0
    },
    marketing: {
      retail: 0,
      corporate: 0
    },
    hr: {
      hired: 0,
      fired: 0,
      salary: 2200,
      salary_sales: 2000,
      salary_adm: 3000,
      trainingPercent: 0,
      pprTarget: 0
    }
  } as any;

  const config: EcosystemConfig = {
    branch: 'industrial',
    capital_social: 10000000.00,
    caixa_inicial: 10000000.00,
    starting_mode: 'start_from_zero'
  } as any;

  const indicators: MacroIndicators = {
    inflation_rate: 0,
    gdp_growth: 0,
    tax_rate: 34.0,
    hr_base: { salary: 2200, salary_sales: 1800, salary_adm: 3000 },
    prices: { 
      mp_a: 20.00, 
      mp_b: 40.00, 
      finished_product: 150.00,
      distribution_unit: 50.00, 
      marketing_campaign: 10000.00,
      storage_mp: 1.40,
      storage_finished: 20.00
    },
    interest_rate_tr: 10.0,
    compulsory_loan_agio: 5.0,
    machinery_values: { alfa: 500000.00, beta: 1500000.00, gama: 3000000.00 },
    machine_alpha_price_adjust: 8.9250, // 8.925% de reajuste de preço (alfa fica 544.625)
    machine_beta_price_adjust: 0,
    machine_gamma_price_adjust: 0,
    investment_return_rate: 0.5,
    vat_purchases_rate: 0,
    machine_sale_discount: 10,
    regional_demands: {},
    import_tariff_brazil: 0,
    import_tariff_uk: 0,
    demand_variation: 0,
    supplier_interest: 15.0,
    avg_selling_price: 150,
    BRL: 5.0,
    GBP: 6.2,
    machine_specs: {
      alfa: { production_capacity: 10000, operators_required: 4 },
      beta: { production_capacity: 40000, operators_required: 12 },
      gama: { production_capacity: 100000, operators_required: 24 }
    }
  } as any;

  console.log("=== EXECUTANDO MULTIPLICAÇÃO / SIMULAÇÃO ===");
  const res = calculateProjections(decision, 'industrial', config, indicators, team, [], 1, {});

  console.log("=== DADOS RESULTANTES ===");
  console.log("Ativo Total (kpis):", res.kpis.total_assets);
  console.log("PL (kpis):", res.kpis.equity);

  const bs = res.kpis.statements.balance_sheet;
  const cash = bs.find((n: any) => n.id === 'assets')?.children?.find((c: any) => c.id === 'assets.current')?.children?.find((c: any) => c.id === 'assets.current.cash')?.value;
  const machines = bs.find((n: any) => n.id === 'assets')?.children?.find((c: any) => c.id === 'assets.noncurrent')?.children?.find((c: any) => c.id === 'assets.noncurrent.fixed')?.children?.find((c: any) => c.id === 'assets.noncurrent.fixed.machines')?.value;
  const loansLt = bs.find((n: any) => n.id === 'liabilities_pl')?.children?.find((c: any) => c.id === 'liabilities.longterm')?.children?.find((c: any) => c.id === 'liabilities.longterm.loans_lt')?.value;
  const loansSt = bs.find((n: any) => n.id === 'liabilities_pl')?.children?.find((c: any) => c.id === 'liabilities.current')?.children?.find((c: any) => c.id === 'liabilities.current.loans_st')?.value;

  console.log("Cash na conta balance_sheet leaf:", cash);
  console.log("Machines na conta balance_sheet leaf:", machines);
  console.log("Loans LT na conta balance_sheet leaf:", loansLt);
  console.log("Loans ST na conta balance_sheet leaf:", loansSt);

  console.log("=== DIAGNÓSTICO DE VALIDAÇÃO ===");
  console.log("fVal cash:", fVal(bs, 'assets.current.cash'));
  console.log("fVal machines:", fVal(bs, 'assets.noncurrent.fixed.machines'));
  console.log("fVal suppliers:", fVal(bs, 'liabilities.current.suppliers'));
  console.log("fVal loans_st:", fVal(bs, 'liabilities.current.loans_st'));
  console.log("fVal loans_lt:", fVal(bs, 'liabilities.longterm.loans_lt'));
  console.log("fVal ppr:", fVal(bs, 'liabilities.current.ppr_payable'));
  console.log("fVal capital:", fVal(bs, 'equity.capital'));
  console.log("fVal profit:", fVal(bs, 'equity.profit'));

  function printTree(nodes: any[], depth = 0) {
    for (const node of nodes) {
      console.log("  ".repeat(depth) + `- ${node.id}: ${node.value} (${node.label})`);
      if (node.children) {
        printTree(node.children, depth + 1);
      }
    }
  }
  console.log("=== FULL BALANCE SHEET TREE ===");
  printTree(bs);

  console.log("=== FULL DRE TREE ===");
  printTree(res.kpis.statements.dre);

  console.log("=== FULL CASH FLOW TREE ===");
  printTree(res.kpis.statements.cash_flow);

  console.log("=== STOCK DIAGNOSTICS ===");
  console.log("kardex:", JSON.stringify(res.kpis.kardex, null, 2));
  console.log("cpv_details:", JSON.stringify(res.kpis.cpv_details, null, 2));
  console.log("closingStockPA (result):", res.kpis.stock_quantities?.finished_goods);
  console.log("closingStockValuePA (result):", fVal(bs, 'assets.current.stock.pa'));
  console.log("wacUnit (result):", res.kpis.kardex?.pa?.saldoFinalUnitario);
  console.log("unitCPP (result):", res.kpis.cpv_details?.custoUnitarioProducao);
  console.log("unitsProduced (result):", res.kpis.kardex?.pa?.entradasQtd);
  console.log("totalUnitsSold (result):", res.kpis.kardex?.pa?.saidasQtd);
  console.log("prevStockValue (result):", res.kpis.kardex?.pa?.saldoInicialValor);

  console.log("=== CHAMANDO VALIDAÇÃO CONTÁBIL TRIPLICE ===");
  const check = validateTripleConsistency(res.kpis.statements);
  console.log("isValid:", check.isValid);
  console.log("Errors:", check.errors);
  console.log("Warnings:", check.warnings);
}

runTest();
