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
  
  // Propriedades Imobiliárias Fiduciárias (v19.16)
  building_mode?: 'rented' | 'owned';
  building_value?: number;
  building_age?: number;
  installations_value?: number;
  land_value?: number;
  real_estate_acquisition_funding?: 'capital' | 'debt';

  // Parâmetros Contábeis Avançados de P0 (v19.17-v19.18)
  clients_initial?: number;
  suppliers_initial?: number;
  taxes_initial?: number;
  dividends_initial?: number;
  custom_pecld_val?: number;
  wip_stock_value?: number;

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
 * baseado nas configurações exatas do Tutor na v19.18 Obsidian Diamond Enterprise.
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

  const isZeroMode = config.starting_mode === 'start_from_zero';
  const isBaseMode = config.starting_mode === 'start_with_base';
  const isRunningMode = config.starting_mode === 'start_with_running';

  // 1. Gerar instâncias físicas de máquinas baseadas no modo e dados do tutor
  const generatedMachines: MachineInstance[] = [];
  let totalMachinesAcquisitionValue = 0;
  let totalMachinesAccumDeprec = 0;

  // Forçar zero absoluto no parque de máquinas para Greenfield de fábrica
  const actualMachines = isZeroMode ? [] : config.machines;

  actualMachines.forEach((mac, index) => {
    const modelPrice = mac.model === 'alfa' ? ALPHA_PRICE : mac.model === 'beta' ? BETA_PRICE : GAMMA_PRICE;
    for (let q = 0; q < mac.qty; q++) {
      const uniqueId = `m-${mac.model}-${index}-${q}`;
      // Deprecação: linear consistente de máquinas: 2.5% por ano
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

  // 2. Parâmetros de Entrada Contábeis e Financeiros
  let cash = config.caixa_inicial;
  let capital = config.capital_social;
  let investments = config.financial_investments;
  
  // Garantir estoques zerados no Greenfield
  let mpa_val = isZeroMode ? 0 : (config.inventories.mpa_qty * config.inventories.mpa_unit_val);
  let mpb_val = isZeroMode ? 0 : (config.inventories.mpb_qty * config.inventories.mpb_unit_val);
  let finished_val = isZeroMode ? 0 : (config.inventories.finished_qty * config.inventories.finished_unit_val);

  // Estoque WIP (Work-in-progress / em elaboração) parametrizado
  const wip_stock = isZeroMode ? 0 : (config.wip_stock_value !== undefined ? config.wip_stock_value : (isBaseMode ? 50000.00 : 250000.00));
  let totalStock = mpa_val + mpb_val + finished_val + wip_stock;

  // Contas do Ativo Circulante
  let clients = 0;
  let pecld = 0;

  // Contas de Passivo e Obrigações
  let suppliers = 0;
  let taxes = 0;
  let dividends = 0;
  let ppr = 0;

  let loans_st = 0;
  let loans_lt = 0;
  let profit_accum = 0;

  // Imobiliário Fiduciário: Prédio Locado vs Próprio
  const buildingMode = config.building_mode ?? (isZeroMode ? 'rented' : 'owned');
  const bValDefault = isZeroMode ? 2000000.00 : (isBaseMode ? 2000000.00 : 5440000.00);
  const buildingBaseValue = buildingMode === 'owned' ? (config.building_value ?? bValDefault) : 0;
  
  const bAgeDefault = isZeroMode ? 0 : (isBaseMode ? 2 : 10);
  const buildingAge = config.building_age ?? bAgeDefault;

  const landValDefault = isZeroMode ? 1000000.00 : (isBaseMode ? 1000000.00 : 1200000.00);
  const calculatedLand = buildingMode === 'owned' ? (config.land_value ?? landValDefault) : 0;

  // Benfeitorias/Instalações: sempre existente para montagem de linha de montagem
  const installValDefault = isZeroMode ? 200000.00 : (isBaseMode ? 500000.00 : 1000000.00);
  const installationsVal = config.installations_value ?? installValDefault;

  // Cálculo de Depreciação ou Amortização acumulada:
  // - Prédio Próprio: Depreciação em edificação (vida útil útil 25 anos = 4.0% ao ano sobre prédio físico)
  // - Prédio Locado: Amortização em Benfeitorias em Imóveis de Terceiros (linear 10 anos = 10% s/ instalações)
  let buildingsAssetValue = 0;
  let buildingAccDeprecOrAmort = 0;
  let land = 0;

  if (buildingMode === 'owned') {
    land = calculatedLand;
    buildingsAssetValue = buildingBaseValue + installationsVal;
    buildingAccDeprecOrAmort = parseFloat((buildingBaseValue * 0.04 * buildingAge).toFixed(2));
  } else {
    // Alugada: Sem terreno próprio. Valor ativo em benfeitorias físicas. Amortização de 10% a.a. sobre instalações
    land = 0;
    buildingsAssetValue = installationsVal;
    buildingAccDeprecOrAmort = parseFloat((installationsVal * 0.10 * buildingAge).toFixed(2));
  }

  // 3. Calibração e Diferenciação dos Modos Contábeis
  if (isZeroMode) {
    // Greenfield Purista
    clients = 0;
    pecld = 0;
    suppliers = 0;
    taxes = 0;
    dividends = 0;
    ppr = 0;

    // Funding do Setup Imobiliário Greenfield
    const realEstateNet = land + buildingsAssetValue - buildingAccDeprecOrAmort;
    if (realEstateNet > 0) {
      const funding = config.real_estate_acquisition_funding ?? 'capital';
      if (funding === 'capital') {
        // Integralização total dos Sócios
        capital = config.capital_social + realEstateNet;
        loans_lt = 0;
      } else {
        // Alavancagem Imobiliária via Dívida de Longo Prazo
        loans_lt = realEstateNet;
      }
    }
    loans_st = 0;
    profit_accum = 0;
    
  } else if (isBaseMode) {
    // Cenário PME - Indústria de Base (Pequena/Média Empresa em Movimento)
    clients = config.clients_initial !== undefined ? config.clients_initial : 300000.00;
    pecld = config.custom_pecld_val !== undefined ? -Math.abs(config.custom_pecld_val) : -parseFloat((clients * 0.015).toFixed(2)); // PECLD histórica padrão 1.5%
    suppliers = config.suppliers_initial !== undefined ? config.suppliers_initial : 100000.00;
    taxes = config.taxes_initial !== undefined ? config.taxes_initial : 15000.00;
    dividends = config.dividends_initial !== undefined ? config.dividends_initial : 5000.00;
    ppr = 0;

    // Lucro Acumulado histórico de fomento correspondente ao Balancete DRE
    profit_accum = 25080.00;

    // Calcular Ativos e Equalizar balanço via Capital ou Empréstimo Sócio-Fomento
    const totalImobilizadoNet = land + buildingsAssetValue - buildingAccDeprecOrAmort + (totalMachinesAcquisitionValue - totalMachinesAccumDeprec);
    const totalCirculanteAssets = cash + investments + (clients + pecld) + totalStock;
    const computedAssets = totalCirculanteAssets + totalImobilizadoNet;

    const subtotalLiabsPME = suppliers + taxes + dividends + ppr;
    let excess = computedAssets - (subtotalLiabsPME + capital + profit_accum);

    if (excess > 0) {
      // Diferença fiduciária vira dívida bancária de curto e longo prazo (PME)
      loans_st = parseFloat((excess * 0.3).toFixed(2));
      loans_lt = parseFloat((excess * 0.7).toFixed(2));
    } else if (excess < 0) {
      capital = parseFloat((capital + excess).toFixed(2));
    }

  } else {
    // Cenário S.A. - Corporação Running (Empresa de Grande Porte Ativa)
    clients = config.clients_initial !== undefined ? config.clients_initial : 2092193.00;
    pecld = config.custom_pecld_val !== undefined ? -Math.abs(config.custom_pecld_val) : -18529.46; // Perdas Estimadas correspondentes ao DRE real
    suppliers = config.suppliers_initial !== undefined ? config.suppliers_initial : 717605.00;
    taxes = config.taxes_initial !== undefined ? config.taxes_initial : 14871.31;
    dividends = config.dividends_initial !== undefined ? config.dividends_initial : 11153.49;
    ppr = 25000.00; // PPR provisionado histórico

    profit_accum = 52171.74; // Lucro retido histórico real de S.A.

    // Calcular Ativos Totais e Reconciliar
    const totalImobilizadoNet = land + buildingsAssetValue - buildingAccDeprecOrAmort + (totalMachinesAcquisitionValue - totalMachinesAccumDeprec);
    const totalCirculanteAssets = cash + investments + (clients + pecld) + totalStock;
    const computedAssets = totalCirculanteAssets + totalImobilizadoNet;

    const subtotalLiabsRunning = suppliers + taxes + dividends + ppr;
    let excess = computedAssets - (subtotalLiabsRunning + capital + profit_accum);

    if (excess > 0) {
      // Reconcilia Alavancagem padrão (Capital de Giro e Linhas de Fomento Corporativo)
      loans_st = parseFloat((excess * 0.6).toFixed(2));
      loans_lt = parseFloat((excess * 0.4).toFixed(2));
    } else if (excess < 0) {
      loans_st = 0;
      loans_lt = 0;
      capital = parseFloat((capital + excess).toFixed(2));
    }
  }

  // 4. Injeção Analítica das Contas Ativas do Balanço Patrimonial
  updateNodeValue(bs, 'assets.current.cash', cash);
  updateNodeValue(bs, 'assets.current.investments', investments);
  updateNodeValue(bs, 'assets.current.clients', clients);
  updateNodeValue(bs, 'assets.current.pecld', pecld); // Inadimplência
  
  updateNodeValue(bs, 'assets.current.stock.pa', finished_val, `Estoque Produto Acabado (${isZeroMode ? 0 : config.inventories.finished_qty} un)`);
  updateNodeValue(bs, 'assets.current.stock.mpa', mpa_val, `Estoque MP A (${isZeroMode ? 0 : config.inventories.mpa_qty} un)`);
  updateNodeValue(bs, 'assets.current.stock.mpb', mpb_val, `Estoque MP B (${isZeroMode ? 0 : config.inventories.mpb_qty} un)`);

  // Sincronizar dinamicamente Estoques WIP (Work-in-progress) na árvore do Ativo Circulante
  const activeCurrentGroup = bs.find((n: any) => n.id === 'assets')?.children?.find((c: any) => c.id === 'assets.current');
  const stockNode = activeCurrentGroup?.children?.find((c: any) => c.id === 'assets.current.stock');
  if (stockNode && stockNode.children) {
    // Purga o anterior para evitar acumulação de leaks de nó
    stockNode.children = stockNode.children.filter((c: any) => c.id !== 'assets.current.stock.wip');
    if (wip_stock > 0) {
      stockNode.children.push({
        id: 'assets.current.stock.wip',
        label: 'Estoque de Produtos em Elaboração (WIP)',
        value: wip_stock,
        type: 'asset',
        isEditable: true
      });
    }
  }

  // Injeção do Ativo Imobilizado
  updateNodeValue(bs, 'assets.noncurrent.fixed.land', land);
  
  const labelImovel = buildingMode === 'rented' ? 'Benfeitorias em Imóveis de Terceiros (Locado)' : 'Prédios e Instalações (Próprio)';
  const labelAmort = buildingMode === 'rented' ? '(-) Amortização de Benfeitorias Terceiros' : '(-) Deprec. Acum. Prédios/Inst.';
  
  updateNodeValue(bs, 'assets.noncurrent.fixed.buildings', buildingsAssetValue, labelImovel);
  updateNodeValue(bs, 'assets.noncurrent.fixed.buildings_deprec', -buildingAccDeprecOrAmort, labelAmort);
  
  updateNodeValue(bs, 'assets.noncurrent.fixed.machines', totalMachinesAcquisitionValue, `Máquinas (${generatedMachines.length} un)`);
  updateNodeValue(bs, 'assets.noncurrent.fixed.machines_deprec', -totalMachinesAccumDeprec);

  // 5. Injeção das Contas Passivas e do Patrimônio Líquido
  updateNodeValue(bs, 'liabilities.current.suppliers', suppliers);
  updateNodeValue(bs, 'liabilities.current.taxes', taxes);
  updateNodeValue(bs, 'liabilities.current.dividends', dividends);
  updateNodeValue(bs, 'liabilities.current.ppr_payable', ppr);
  updateNodeValue(bs, 'liabilities.current.loans_st', loans_st);
  updateNodeValue(bs, 'liabilities.longterm.loans_lt', loans_lt);

  updateNodeValue(bs, 'equity.capital', capital);
  updateNodeValue(bs, 'equity.profit', profit_accum);

  // Recalcular toda a árvore patrimonial (totalizers) de baixo para cima recursivamente
  recalculateTotalizers(bs);

  // Reconciliação fiduciária analítica (Sincronismo Ativo vs Passivo+PL ao centavo)
  const assetsNode = bs.find((n: any) => n.id === 'assets');
  const liabPLNode = bs.find((n: any) => n.id === 'liabilities_pl');
  if (assetsNode && liabPLNode && assetsNode.value !== liabPLNode.value) {
    const diffDecimal = assetsNode.value - liabPLNode.value;
    profit_accum = parseFloat((profit_accum + diffDecimal).toFixed(2));
    updateNodeValue(bs, 'equity.profit', profit_accum);
    recalculateTotalizers(bs);
  }

  // 6. Atualização de DRE e DFC Históricas para P00
  if (isZeroMode) {
    // Greenfield purista começa do zero absoluto comercial
    dre.forEach((node: any) => {
      node.value = 0;
      if (node.children) node.children.forEach((c: any) => c.value = 0);
    });
    cf.forEach((node: any) => {
      node.value = 0;
      if (node.children) node.children.forEach((c: any) => c.value = 0);
    });
    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.final', cash);
    
  } else if (isBaseMode) {
    // DRE e Fluxos de Caixa coerentes de PME
    updateNodeValue(dre, 'rev', 1255000.00);
    updateNodeValue(dre, 'vat_sales', -125500.00);
    
    updateNodeValue(dre, 'dre.mod', -380000.00);
    updateNodeValue(dre, 'dre.cif', -105000.00);
    updateNodeValue(dre, 'dre.cpv_mp', -400000.00);
    
    updateNodeValue(dre, 'opex.sales', -95000.00);
    updateNodeValue(dre, 'opex.adm', -85000.00);
    updateNodeValue(dre, 'opex.bad_debt', -15000.00);
    updateNodeValue(dre, 'opex.rd', -20000.00);
    
    updateNodeValue(dre, 'fin.exp', -1500.00);
    updateNodeValue(dre, 'tax_prov', -3420.00);
    
    // DFC de Base PME
    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.inflow.cash_sales', 900000.00);
    updateNodeValue(cf, 'cf.inflow.term_sales', 355000.00);
    updateNodeValue(cf, 'cf.outflow.payroll', -380000.00);
    updateNodeValue(cf, 'cf.outflow.social_charges', -114000.00);
    updateNodeValue(cf, 'cf.outflow.vat_payable', -65000.00);
    updateNodeValue(cf, 'cf.outflow.marketing', -45000.00);
    updateNodeValue(cf, 'cf.outflow.distribution', -70000.00);
    updateNodeValue(cf, 'cf.outflow.storage', -10000.00);
    updateNodeValue(cf, 'cf.outflow.suppliers', -540000.00);
    updateNodeValue(cf, 'cf.outflow.maintenance', -20000.00);
    updateNodeValue(cf, 'cf.outflow.amortization', -25000.00);
    updateNodeValue(cf, 'cf.outflow.interest', -1500.00);
    updateNodeValue(cf, 'cf.outflow.taxes', -3420.00);
    
    updateNodeValue(cf, 'cf.final', cash);
    
  } else {
    // S.A. Running: Restaura o DRE complexo histórico herdado do Simulador Sênior
    updateNodeValue(dre, 'rev', 4184440.05);
    updateNodeValue(dre, 'vat_sales', 0.00);
    updateNodeValue(dre, 'dre.mod', -1269000.00);
    updateNodeValue(dre, 'dre.cif', -330502.50);
    updateNodeValue(dre, 'dre.cpv_mp', -1373328.43);
    
    updateNodeValue(dre, 'opex.sales', -873250.00);
    updateNodeValue(dre, 'opex.adm', -216000.00);
    updateNodeValue(dre, 'opex.bad_debt', -18529.46);
    updateNodeValue(dre, 'opex.rd', -41844.40);
    updateNodeValue(dre, 'fin.exp', -2500.00);
    updateNodeValue(dre, 'tax_prov', -14871.31);
    
    // DFC de S.A.
    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.inflow.cash_sales', 2900000.00);
    updateNodeValue(cf, 'cf.inflow.term_sales', 1284440.05);
    updateNodeValue(cf, 'cf.outflow.payroll', -1269000.00);
    updateNodeValue(cf, 'cf.outflow.social_charges', -380700.00);
    updateNodeValue(cf, 'cf.outflow.marketing', -450000.00);
    updateNodeValue(cf, 'cf.outflow.distribution', -423250.00);
    updateNodeValue(cf, 'cf.outflow.suppliers', -1100000.00);
    updateNodeValue(cf, 'cf.outflow.interest', -2500.00);
    updateNodeValue(cf, 'cf.outflow.taxes', -14871.31);
    
    updateNodeValue(cf, 'cf.final', cash);
  }

  // Recalcular as outras demonstrações
  recalculateTotalizers(dre);
  recalculateTotalizers(cf);

  const finalAssetsVal = assetsNode?.value || 0;
  const finalEquityVal = bs.find((n: any) => n.id === 'equity')?.value || 0;

  // 7. Consolidação de KPIs de P00 e Capacidades Produtivas para a Arena
  const p0Kpis: Partial<KPIs> = {
    rating: isZeroMode ? 'AAA' : (isBaseMode ? 'AA' : 'A'),
    current_cash: cash,
    equity: finalEquityVal,
    total_assets: finalAssetsVal,
    stock_value: totalStock,
    fixed_assets_value: totalMachinesAcquisitionValue + land + buildingsAssetValue,
    fixed_assets_depreciation: buildingAccDeprecOrAmort + totalMachinesAccumDeprec,
    stock_quantities: {
      mp_a: isZeroMode ? 0 : config.inventories.mpa_qty,
      mp_b: isZeroMode ? 0 : config.inventories.mpb_qty,
      finished_goods: isZeroMode ? 0 : config.inventories.finished_qty
    },
    last_price: config.share_price_initial,
    last_units_sold: 0,
    ebitda: isZeroMode ? 0 : (isBaseMode ? 62000.00 : 208387.77),
    interest_coverage: isZeroMode ? 1000 : (loans_st + loans_lt > 0 ? 50 : 100),
    solvency_score_kanitz: isZeroMode ? 5.0 : (isBaseMode ? 2.1 : 1.5),
    altman_z_score: isZeroMode ? 8.0 : (isBaseMode ? 5.8 : 3.2),
    dcf_valuation: finalEquityVal * (isZeroMode ? 1.0 : isBaseMode ? 1.25 : 1.45)
  };

  return {
    balance_sheet: bs,
    dre,
    cash_flow: cf,
    machines: generatedMachines,
    kpis: p0Kpis
  };
}
