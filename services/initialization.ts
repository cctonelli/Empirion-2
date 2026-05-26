import { AccountNode, CurrencyType, KPIs, MachineInstance, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE, INITIAL_MACHINES_P00 } from '../constants';

export interface MachineConfig {
  model: MachineModel;
  qty: number;
  age: number; // em anos (ex: 0-20), impacta depreciação e eficiência
  efficiency: number; // de 0.0 a 1.0 (ex: 0.95 = 95%)
}

export interface WorkforceConfig {
  operatorsPerAlpha: number;
  operatorsPerBeta: number;
  operatorsPerGamma: number;
  baseSalary: number;
  trainingLevel: number; // 1 a 5
}

export interface RegionP0Config {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number;
  suggested_price: number;
  distribution_cost: number;
  marketing_cost: number;
}

export interface InventoryP0Config {
  mpa_qty: number;
  mpa_unit_val: number;
  mpb_qty: number;
  mpb_unit_val: number;
  finished_qty: number;
  finished_unit_val: number;
}

export interface BaseP0Config {
  tutorName: string;
  institutionName: string;
  tournamentName: string;
  currency: CurrencyType;
  round_duration: number;
  total_rounds: number;
  transparency_level: 'low' | 'medium' | 'high' | 'full';
  gazeta_mode: 'anonymous' | 'identified';

  // Configurações de Atividade e Início
  activity_type: string; // "industrial"
  accounting_template_id: string; // "industrial_br_v1"

  // Step 3: Parque Industrial
  machines: MachineConfig[];
  workforce: WorkforceConfig;

  // Step 4: Regiões
  regions: RegionP0Config[];

  // Step 5: Financeiro Inicial
  capital_social: number;
  caixa_inicial: number;
  inventories: InventoryP0Config;
  financial_investments: number;
  share_price_initial: number;
  dividend_percent: number;
  dividend_frequency: number; // A cada X rounds
  
  // Step 6: Overrides
  macroOverrides: Record<string, any>;
}

export interface StartFromZeroConfig extends BaseP0Config {
  starting_mode: 'start_from_zero';
  financial_investments: 0;
}

export interface StartWithBaseConfig extends BaseP0Config {
  starting_mode: 'start_with_base';
}

export interface StartWithRunningConfig extends BaseP0Config {
  starting_mode: 'start_with_running';
}

export type TutorP0Config = StartFromZeroConfig | StartWithBaseConfig | StartWithRunningConfig;

export interface P0Template {
  id: string;
  name: string;
  description: string;
  config: TutorP0Config;
  is_public: boolean;
  created_by?: string;
  created_at?: string;
}

// Helper to deeply inject values into an AccountNode tree by ID
export function updateNodeValue(nodes: AccountNode[], id: string, newValue: number, customLabel?: string): boolean {
  for (const node of nodes) {
    if (node.id === id) {
      node.value = parseFloat(newValue.toFixed(2));
      if (customLabel) node.label = customLabel;
      return true;
    }
    if (node.children && node.children.length > 0) {
      if (updateNodeValue(node.children, id, newValue, customLabel)) {
        return true;
      }
    }
  }
  return false;
}

// Recalcula todos os sumários ('totalizer') de baixo para cima recursivamente
export function recalculateTotalizers(nodes: AccountNode[]): number {
  let sum = 0;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childSum = recalculateTotalizers(node.children);
      node.value = parseFloat(childSum.toFixed(2));
    }
    // Se o tipo do nó for 'contra_asset' ou label indicar redutor ou id for PECLD, ele subtrai!
    const isRedutor = node.label?.startsWith('(-)') || node.id?.includes('deprec') || node.id?.includes('pecld') || node.id?.includes('prov') || node.label?.includes('(-)');
    if (node.type !== 'totalizer') {
      const signedVal = isRedutor ? -Math.abs(node.value) : Math.abs(node.value);
      node.value = signedVal;
      sum += signedVal;
    } else {
      sum += node.value;
    }
  }
  return sum;
}

export const INDUSTRIAL_BR_TEMPLATE = {
  id: 'industrial_br_v1',
  code: 'INDUSTRIAL_BR',
  name: 'Template Industrial Brasil',
  description: 'Estrutura contábil industrial brasileira completa v19.14.',
  countryCode: 'BR',
  version: '1.0'
};

/**
 * Função Oracle determinística para gerar as demonstrações de P0 (Round 0)
 * baseado nas configurações exatas do Tutor.
 */
export function generatePureP0(config: TutorP0Config): { 
  balance_sheet: AccountNode[]; 
  dre: AccountNode[]; 
  cash_flow: AccountNode[]; 
  machines: MachineInstance[];
  kpis: Partial<KPIs>;
} {
  // Clona a árvore padrão contábil imutável para não alterar o original
  const financials = JSON.parse(JSON.stringify(INITIAL_FINANCIAL_TREE));
  const bs = financials.balance_sheet;
  const dre = financials.dre;
  const cf = financials.cash_flow;

  // Preço padrão das máquinas regulado
  const ALPHA_PRICE = 500000.00;
  const BETA_PRICE = 1500000.00;
  const GAMMA_PRICE = 3000000.00;

  // 1. Gerar instâncias físicas das máquinas e calcular valores industriais
  const generatedMachines: MachineInstance[] = [];
  let totalMachinesAcquisitionValue = 0;
  let totalMachinesAccumDeprec = 0;

  config.machines.forEach((mac, index) => {
    const modelPrice = mac.model === 'alfa' ? ALPHA_PRICE : mac.model === 'beta' ? BETA_PRICE : GAMMA_PRICE;
    for (let q = 0; q < mac.qty; q++) {
      const uniqueId = `m-${mac.model}-${index}-${q}`;
      // Deprecação: 2.5% por ano
      const deprecRate = 0.025;
      const accDeprec = modelPrice * mac.age * deprecRate * mac.efficiency;
      
      generatedMachines.push({
        id: uniqueId,
        model: mac.model,
        age: mac.age,
        acquisition_value: modelPrice,
        accumulated_depreciation: parseFloat(accDeprec.toFixed(2))
      });

      totalMachinesAcquisitionValue += modelPrice;
      totalMachinesAccumDeprec += accDeprec;
    }
  });

  // 2. Resolver Modo de Inicialização Contábil
  let cash = config.caixa_inicial;
  let capital = config.capital_social;
  let investments = config.financial_investments;
  
  let mpa_val = config.inventories.mpa_qty * config.inventories.mpa_unit_val;
  let mpb_val = config.inventories.mpb_qty * config.inventories.mpb_unit_val;
  let finished_val = config.inventories.finished_qty * config.inventories.finished_unit_val;
  let totalStock = mpa_val + mpb_val + finished_val;

  let land = 0;
  let buildings = 0;
  let bDeprec = 0;
  
  let clients = 0;
  let pecld = 0;

  let suppliers = 0;
  let taxes = 0;
  let dividends = 0;
  let ppr = 0;

  let loans_st = 0;
  let loans_lt = 0;
  let profit_accum = 0;

  if (config.starting_mode === 'start_from_zero') {
    // Apenas capital e caixa. Outros zerados.
    totalMachinesAcquisitionValue = 0;
    totalMachinesAccumDeprec = 0;
    totalStock = 0;
    mpa_val = 0;
    mpb_val = 0;
    finished_val = 0;
    generatedMachines.length = 0;
  } else if (config.starting_mode === 'start_with_base') {
    // Uma estrutura industrial enxuta e saudável
    land = 1000000.00;
    buildings = 2000000.00;
    bDeprec = 2000000.00 * 0.04 * 2; // 4% ao ano por 2 anos = 160.000
  } else {
    // Start with Running Company (Empresa Rodando - Complexo)
    land = 1200000.00;
    buildings = 5440000.00;
    bDeprec = 2176000.00;
    clients = 2092193.00;
    pecld = -18529.46;
    suppliers = 717605.00;
    taxes = 14871.31;
    dividends = 11153.49;
  }

  // Calcular Ativo Líquido Imobilizado
  const imobilizadoBruto = land + buildings + totalMachinesAcquisitionValue;
  const imobilizadoDeprec = -(bDeprec + totalMachinesAccumDeprec);
  const totalCapexNet = imobilizadoBruto + imobilizadoDeprec;

  // Calcular Ativos Totais (sem caixa nem investimentos nem estoques pra podermos ver a sobra)
  const otherAssets = clients + pecld + totalStock;
  const cashAssets = cash + investments;
  const sumAssets = cashAssets + otherAssets + totalCapexNet;

  // Determinar Passivo / Contas a pagar prévios
  const fixedLiabilities = suppliers + taxes + dividends + ppr;

  // BALANCIAMENTO FIDUCIÁRIO RIGOROSO (MANDATO SAPPHIRE)
  // Assets = Liabilities + PL
  // Assets = (suppliers + taxes + dividends + ppr + loans_st + loans_lt) + (capital_social + profit_accum)
  // Let's solve loans and profit_accum to make Assets === Passivo + PL exactly!
  const excess = sumAssets - (fixedLiabilities + capital);

  if (config.starting_mode === 'start_from_zero') {
    loans_st = 0;
    loans_lt = 0;
    profit_accum = parseFloat(excess.toFixed(2));
  } else if (config.starting_mode === 'start_with_base') {
    if (excess > 0) {
      // Financiou os ativos remanescentes com empréstimos
      loans_st = parseFloat((excess * 0.4).toFixed(2));
      loans_lt = parseFloat((excess * 0.6).toFixed(2));
      profit_accum = 0;
    } else {
      // Tem lucros ou perdas acumuladas
      loans_st = 0;
      loans_lt = 0;
      profit_accum = parseFloat(excess.toFixed(2));
    }
  } else {
    // Running Company
    if (excess > 0) {
      // Usa os empréstimos tradicionais da árvore
      const remainingForLoans = excess - 52171.74; // Reserva o lucro histórico
      if (remainingForLoans > 0) {
        loans_st = parseFloat((remainingForLoans * 0.6).toFixed(2));
        loans_lt = parseFloat((remainingForLoans * 0.4).toFixed(2));
        profit_accum = 52171.74;
      } else {
        loans_st = 0;
        loans_lt = 0;
        profit_accum = parseFloat(excess.toFixed(2));
      }
    } else {
      loans_st = 0;
      loans_lt = 0;
      profit_accum = parseFloat(excess.toFixed(2));
    }
  }

  // 3. Atualizar Valores das Contas no Balanço Patrimonial
  updateNodeValue(bs, 'assets.current.cash', cash);
  updateNodeValue(bs, 'assets.current.investments', investments);
  updateNodeValue(bs, 'assets.current.clients', clients);
  updateNodeValue(bs, 'assets.current.pecld', pecld);
  
  updateNodeValue(bs, 'assets.current.stock.pa', finished_val, `Estoque Produto Acabado (${config.inventories.finished_qty} un)`);
  updateNodeValue(bs, 'assets.current.stock.mpa', mpa_val, `Estoque MP A (${config.inventories.mpa_qty} un)`);
  updateNodeValue(bs, 'assets.current.stock.mpb', mpb_val, `Estoque MP B (${config.inventories.mpb_qty} un)`);

  updateNodeValue(bs, 'assets.noncurrent.fixed.land', land);
  updateNodeValue(bs, 'assets.noncurrent.fixed.buildings', buildings);
  updateNodeValue(bs, 'assets.noncurrent.fixed.buildings_deprec', -bDeprec);
  updateNodeValue(bs, 'assets.noncurrent.fixed.machines', totalMachinesAcquisitionValue, `Máquinas (${generatedMachines.length} un)`);
  updateNodeValue(bs, 'assets.noncurrent.fixed.machines_deprec', -totalMachinesAccumDeprec);

  updateNodeValue(bs, 'liabilities.current.suppliers', suppliers);
  updateNodeValue(bs, 'liabilities.current.taxes', taxes);
  updateNodeValue(bs, 'liabilities.current.dividends', dividends);
  updateNodeValue(bs, 'liabilities.current.ppr_payable', ppr);
  updateNodeValue(bs, 'liabilities.current.loans_st', loans_st);
  updateNodeValue(bs, 'liabilities.longterm.loans_lt', loans_lt);

  updateNodeValue(bs, 'equity.capital', capital);
  updateNodeValue(bs, 'equity.profit', profit_accum);

  // Recalcular Totalizadores de cima para baixo
  recalculateTotalizers(bs);

  // Garantir igualdade fiduciária absoluta após arredondamentos
  // assetsTotal vs liabilitiesPLTotal
  const assetsNode = bs.find((n: any) => n.id === 'assets');
  const liabPLNode = bs.find((n: any) => n.id === 'liabilities_pl');
  if (assetsNode && liabPLNode && assetsNode.value !== liabPLNode.value) {
    const lDiff = assetsNode.value - liabPLNode.value;
    // Ajusta o Lucro Líquido Acumulado para soldar o Balanço
    profit_accum += lDiff;
    updateNodeValue(bs, 'equity.profit', profit_accum);
    recalculateTotalizers(bs);
  }

  // 4. Tratar demonstrações DRE e Fluxo de Caixa para P0
  if (config.starting_mode === 'start_from_zero') {
    // Zera DRE pois a empresa inicia zerada
    dre.forEach((node: any) => {
      node.value = 0;
      if (node.children) node.children.forEach((c: any) => c.value = 0);
    });
    // Fluxo de caixa tem saldo inicial = Caixa Inicial
    cf.forEach((node: any) => {
      node.value = 0;
      if (node.children) node.children.forEach((c: any) => c.value = 0);
    });
    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.final', cash);
  } else if (config.starting_mode === 'start_with_base') {
    // Valores de DRE simplificados (ou zerados)
    dre.forEach((node: any) => {
      node.value = 0;
      if (node.children) node.children.forEach((c: any) => c.value = 0);
    });
    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.final', cash);
  } else {
    // Running Company: Mantém o histórico real demonstrado em INITIAL_FINANCIAL_TREE
    updateNodeValue(cf, 'cf.start', cash); // Caixa vira saldo de caixa inicial
  }

  // Recalcular as outras demonstrações
  recalculateTotalizers(dre);
  recalculateTotalizers(cf);

  const finalAssetsVal = assetsNode?.value || 0;
  const finalEquityVal = bs.find((n: any) => n.id === 'equity')?.value || 0;

  // 5. Preencher os KPIs iniciais para o primeiro período de faturamento
  const p0Kpis: Partial<KPIs> = {
    rating: 'AAA',
    current_cash: cash,
    equity: finalEquityVal,
    total_assets: finalAssetsVal,
    stock_value: totalStock,
    fixed_assets_value: imobilizadoBruto,
    fixed_assets_depreciation: bDeprec + totalMachinesAccumDeprec,
    stock_quantities: {
      mp_a: config.inventories.mpa_qty,
      mp_b: config.inventories.mpb_qty,
      finished_goods: config.inventories.finished_qty
    },
    last_price: config.share_price_initial,
    last_units_sold: 0,
    ebitda: config.starting_mode === 'start_with_running' ? 208387.77 : 0,
    interest_coverage: 100,
    solvency_score_kanitz: 1.5,
    altman_z_score: 6.25,
    dcf_valuation: 1.7
  };

  return {
    balance_sheet: bs,
    dre,
    cash_flow: cf,
    machines: generatedMachines,
    kpis: p0Kpis
  };
}
