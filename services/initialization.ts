import { AccountNode, CurrencyType, KPIs, MachineInstance, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE, INITIAL_MACHINES_P00 } from '../constants';

export interface AccountingModelTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  branch: 'industrial' | 'commercial' | 'services' | 'agro' | 'construction';
  countryCode: string;
  version: string;
}

export const SUPPORTED_ACCOUNTING_MODELS: AccountingModelTemplate[] = [
  {
    id: 'industrial_br_v1',
    code: 'INDUSTRIAL_BR',
    name: 'Template Industrial Brasil (Custeio Absorção CPC 16)',
    description: 'Estrutura padrão industrial brasileira com custeio por absorção real, contas de faturamento industrial BRL/USD.',
    branch: 'industrial',
    countryCode: 'BR',
    version: 'v19.23'
  },
  {
    id: 'commercial_retail_v1',
    code: 'COMMERCIAL_RETAIL',
    name: 'Template Comercial Varejo (Custo Médio / PEPS)',
    description: 'Estrutura de varejo comercial com impostos sobre circulação de mercadorias (ICMS) e CMV flutuante.',
    branch: 'commercial',
    countryCode: 'BR',
    version: 'v19.23'
  },
  {
    id: 'services_tech_v1',
    code: 'SERVICES_TECH',
    name: 'Template Serviços e Tecnologia (SaaS & Assinaturas)',
    description: 'Contabilidade SaaS para prestadoras de serviços focadas em LTV/CAC e reconhecimento diferido de receita líquida.',
    branch: 'services',
    countryCode: 'BR',
    version: 'v19.23'
  },
  {
    id: 'agrocooperative_v1',
    code: 'AGRO_COOPERATIVE',
    name: 'Template Cooperativa Agropecuária (CPR)',
    description: 'Estrutura fiduciária baseada em armazenagem cooperada de grãos, valuation de safras e derivativos agrícolas.',
    branch: 'agro',
    countryCode: 'BR',
    version: 'v19.23'
  }
];

export interface MachineConfig {
  model: MachineModel;
  qty: number;
  age: number; // em anos (ex: 0-20), impacta depreciação e eficiência
  efficiency: number; // de 0.0 a 1.0 (ex: 0.95 = 95%)
  installation_cost?: number; // custo de instalação individual para formação do imobilizado
}

export interface WorkforceConfig {
  operatorsPerAlpha: number;
  operatorsPerBeta: number;
  operatorsPerGamma: number;
  baseSalary: number;
  trainingLevel: number; // 1 a 5
  production_hours_period?: number;
  max_shifts?: number;
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
  buildings_depreciation_rate?: number;
  property_depreciation_rate?: number; // taxa de depreciação do imóvel próprio (% a.a.)
  machines_depreciation_rate?: number; // taxa de depreciação das máquinas (% a.a.)

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
  profit_incorporation_frequency?: number; // A cada X rounds a contabilidade irá incorporar o saldo de lucros no capital social
  
  // Propriedades Imobiliárias Fiduciárias (v19.16)
  building_mode?: 'rented' | 'owned';
  building_value?: number;
  building_age?: number;
  installations_value?: number;
  land_value?: number;
  real_estate_acquisition_funding?: 'capital' | 'debt';
  monthly_rent_value?: number;
  rent_allocation_productive?: number;
  rent_allocation_administrative?: number;
  rent_allocation_sales?: number;

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

// Zera recursivamente todos os nós folha e totalizadores de uma árvore contábil
export function clearFinancialTree(nodes: AccountNode[]) {
  nodes.forEach(node => {
    node.value = 0;
    if (node.children && node.children.length > 0) {
      clearFinancialTree(node.children);
    }
  });
}

// Busca recursivamente um nó por ID na árvore contábil
export function findNodeInTree(nodes: AccountNode[], id: string): AccountNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
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
 * Função fiduciária para validação profunda e higienização final ("Start from Zero" Shield).
 * Garante que em modo "Start from Zero", ativos obsoletos, depreciações anteriores, 
 * estoques fantasmas e passivos anacrônicos sejam forçados a zero absoluto.
 */
export function validateCleanP0(
  balance_sheet: AccountNode[],
  dre: AccountNode[],
  cash_flow: AccountNode[],
  starting_mode: string,
  initial_cash: number
): { balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] } {
  const isZeroMode = starting_mode === 'start_from_zero';

  if (isZeroMode) {
    // Preservar os valores do imobilizado do imobiliário e do financiamento calculados no generatePureP0
    const originalLand = findNodeInTree(balance_sheet, 'assets.noncurrent.fixed.land')?.value || 0;
    const originalBuildings = findNodeInTree(balance_sheet, 'assets.noncurrent.fixed.buildings')?.value || 0;
    const originalBuildingsDeprec = findNodeInTree(balance_sheet, 'assets.noncurrent.fixed.buildings_deprec')?.value || 0;
    const originalLoansLt = findNodeInTree(balance_sheet, 'liabilities.longterm.loans_lt')?.value || 0;
    const originalCapital = findNodeInTree(balance_sheet, 'equity.capital')?.value || (initial_cash + originalLand + originalBuildings + originalBuildingsDeprec - originalLoansLt);

    // 1. Forçar caixa ao valor inicial fiduciário parametrizado
    updateNodeValue(balance_sheet, 'assets.current.cash', initial_cash);

    // 2. Forçar zeragem de todas as contas do Ativo Circulante exceto Caixa Inicial e Aplicações
    updateNodeValue(balance_sheet, 'assets.current.clients', 0);
    updateNodeValue(balance_sheet, 'assets.current.pecld', 0);
    updateNodeValue(balance_sheet, 'assets.current.stock.pa', 0);
    updateNodeValue(balance_sheet, 'assets.current.stock.mpa', 0);
    updateNodeValue(balance_sheet, 'assets.current.stock.mpb', 0);
    
    // Purgar qualquer nó WIP da árvore de estoques
    const currentGroup = balance_sheet.find(n => n.id === 'assets')?.children?.find(c => c.id === 'assets.current');
    const stockNode = currentGroup?.children?.find(c => c.id === 'assets.current.stock');
    if (stockNode && stockNode.children) {
      stockNode.children = stockNode.children.filter(c => c.id !== 'assets.current.stock.wip');
    }

    // 3. Forçar zeragem das contas do Passivo Circulante
    updateNodeValue(balance_sheet, 'liabilities.current.suppliers', 0);
    updateNodeValue(balance_sheet, 'liabilities.current.vat_payable', 0);
    updateNodeValue(balance_sheet, 'liabilities.current.taxes', 0);
    updateNodeValue(balance_sheet, 'liabilities.current.dividends', 0);
    updateNodeValue(balance_sheet, 'liabilities.current.ppr_payable', 0);
    updateNodeValue(balance_sheet, 'liabilities.current.loans_st', 0);

    // 4. Forçar zeragem do Ativo Não Circulante exceto imobiliário preservado, e do Passivo LP
    updateNodeValue(balance_sheet, 'assets.noncurrent.fixed.land', originalLand);
    updateNodeValue(balance_sheet, 'assets.noncurrent.fixed.buildings', originalBuildings);
    updateNodeValue(balance_sheet, 'assets.noncurrent.fixed.buildings_deprec', originalBuildingsDeprec);
    updateNodeValue(balance_sheet, 'assets.noncurrent.fixed.machines', 0);
    updateNodeValue(balance_sheet, 'assets.noncurrent.fixed.machines_deprec', 0);
    updateNodeValue(balance_sheet, 'liabilities.longterm.loans_lt', originalLoansLt);

    // 5. Lucros acumulados iniciais devem ser estritamente zero no Greenfield
    updateNodeValue(balance_sheet, 'equity.profit', 0);
    
    // 6. Recalcular e Reconciliar
    recalculateTotalizers(balance_sheet);
    
    // Sincronizar o Capital Social de forma coerente e precisa
    updateNodeValue(balance_sheet, 'equity.capital', originalCapital);
    updateNodeValue(balance_sheet, 'equity.profit', 0);
    recalculateTotalizers(balance_sheet);

    // 7. Forçar zeragem total e higienização para DRE e Fluxo de Caixa no Greenfield
    clearFinancialTree(dre);
    clearFinancialTree(cash_flow);
    updateNodeValue(cash_flow, 'cf.start', initial_cash);
    updateNodeValue(cash_flow, 'cf.final', initial_cash);
  }

  return { balance_sheet, dre, cash_flow };
}

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

  // ZERAGEM RADICAL FIDUCIÁRIA DAS ÁRVORES CONTÁBEIS CLONADAS (Para evitar vazamentos do default histórico)
  clearFinancialTree(bs);
  clearFinancialTree(dre);
  clearFinancialTree(cf);

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
    const normalizedModel = (mac.model as string) === 'alfa' ? 'alpha' : (mac.model as string) === 'gama' ? 'gamma' : mac.model;
    const modelPrice = normalizedModel === 'alpha' ? ALPHA_PRICE : normalizedModel === 'beta' ? BETA_PRICE : GAMMA_PRICE;
    for (let q = 0; q < mac.qty; q++) {
      const uniqueId = `m-${normalizedModel}-${index}-${q}`;
      // Deprecação: linear consistente de máquinas baseada na taxa parametrizada (CPC 27)
      const deprecRate = (config.machines_depreciation_rate !== undefined ? config.machines_depreciation_rate : 5) / 100;
      const accDeprec = modelPrice * mac.age * deprecRate * mac.efficiency;
      
      generatedMachines.push({
        id: uniqueId,
        model: normalizedModel as MachineModel,
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

  // Custos de instalação por máquina das configurações do Tutor
  const alphaInstallCost = config.machines?.[0]?.installation_cost !== undefined ? Number(config.machines[0].installation_cost) : 150000.00;
  const betaInstallCost = config.machines?.[1]?.installation_cost !== undefined ? Number(config.machines[1].installation_cost) : 600000.00;
  const gammaInstallCost = config.machines?.[2]?.installation_cost !== undefined ? Number(config.machines[2].installation_cost) : 1500000.00;

  // Imobiliário Fiduciário: Prédio Locado vs Próprio
  const buildingMode = config.building_mode ?? (isZeroMode ? 'rented' : 'owned');
  
  // No modo Greenfield (Start from Zero), as instalações e edificações começam ZERADAS no P0
  const buildingBaseValue = isZeroMode ? 0 : (buildingMode === 'owned' ? (config.building_value ?? (isBaseMode ? 2000000.00 : 5440000.00)) : 0);
  const buildingAge = isZeroMode ? 0 : (config.building_age ?? (isBaseMode ? 2 : 10));
  const calculatedLand = isZeroMode ? 0 : (buildingMode === 'owned' ? (config.land_value ?? (isBaseMode ? 1000000.00 : 1200000.00)) : 0);

  // Instalações de abertura: ZERADAS no Greenfield, calculadas dinamicamente com base nas máquinas em frota para outros modos
  let installationsVal = 0;
  if (!isZeroMode) {
    actualMachines.forEach(mac => {
      const normalizedModel = (mac.model as string) === 'alfa' ? 'alpha' : (mac.model as string) === 'gama' ? 'gamma' : mac.model;
      const macInstallCost = normalizedModel === 'alpha' ? alphaInstallCost : normalizedModel === 'beta' ? betaInstallCost : gammaInstallCost;
      installationsVal += macInstallCost * mac.qty;
    });
  }

  // Cálculo de Depreciação ou Amortização acumulada em P0:
  // - Prédio Próprio: Depreciação em edificação (taxa parametrizável property_depreciation_rate, default 4% ao ano s/ prédio)
  // - Instalações Industriais / Benfeitorias: taxa parametrizável buildings_depreciation_rate (default 10% s/ instalações)
  let buildingsAssetValue = 0;
  let buildingAccDeprecOrAmort = 0;
  let land = 0;

  const parsed_deprec_rate = (config.buildings_depreciation_rate !== undefined ? config.buildings_depreciation_rate : 10) / 100;
  const property_deprec_rate = (config.property_depreciation_rate !== undefined ? config.property_depreciation_rate : 4) / 100;

  if (buildingMode === 'owned') {
    land = calculatedLand;
    buildingsAssetValue = buildingBaseValue + installationsVal;
    buildingAccDeprecOrAmort = parseFloat((buildingBaseValue * property_deprec_rate * buildingAge + installationsVal * parsed_deprec_rate * buildingAge).toFixed(2));
  } else {
    land = 0;
    buildingsAssetValue = installationsVal;
    buildingAccDeprecOrAmort = parseFloat((installationsVal * parsed_deprec_rate * buildingAge).toFixed(2));
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
    profit_accum = 0;

    // O PL (capital social) deve refletir exatamente o valor parametrizado pelo Tutor
    capital = config.capital_social;

    // No modo "Start from Zero", o imobilizado do imobiliário (land, buildingsAssetValue, buildingAccDeprecOrAmort)
    // NÃO é zerado se houver configurações parametrizadas pelo Tutor. Ele é mantido e contra-balançado por Capital ou Dívida.
    const netBuilding = land + buildingsAssetValue - buildingAccDeprecOrAmort;
    loans_st = 0;
    if (netBuilding > 0) {
      const funding = config.real_estate_acquisition_funding ?? 'capital';
      if (funding === 'capital') {
        cash = Math.max(0, config.capital_social - netBuilding);
        capital = config.capital_social;
        loans_lt = 0;
      } else {
        cash = config.caixa_inicial;
        capital = config.capital_social;
        loans_lt = netBuilding;
      }
    } else {
      cash = config.caixa_inicial;
      loans_lt = 0;
    }

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
  
  updateNodeValue(bs, 'assets.current.stock.pa', finished_val, `Estoque PA (${isZeroMode ? 0 : config.inventories.finished_qty} un)`);
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
  
  const labelImovel = buildingMode === 'rented' ? 'Instalações Industriais (Locado)' : 'Prédios e Instalações (Próprio)';
  const labelAmort = buildingMode === 'rented' ? '(-) Depreciação de Instalações' : '(-) Deprec. Acum. Prédios/Inst.';
  
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
    // Greenfield purista começa de uma árvore fiduciária 100% limpa recursivamente, sem qualquer aluguel no DRE/DFC de P0
    clearFinancialTree(dre);
    clearFinancialTree(cf);

    updateNodeValue(cf, 'cf.start', cash);
    updateNodeValue(cf, 'cf.final', cash);
    
  } else if (isBaseMode) {
    // DRE e Fluxos de Caixa coerentes de PME
    const rentVal = buildingMode === 'rented' ? (config.monthly_rent_value ?? 50000.00) : 0;
    const pProd = config.rent_allocation_productive ?? 70;
    const pAdm = config.rent_allocation_administrative ?? 10;
    const pSales = config.rent_allocation_sales ?? 20;

    const valCif = rentVal * (pProd / 100);
    const valAdm = rentVal * (pAdm / 100);
    const valSales = rentVal * (pSales / 100);

    updateNodeValue(dre, 'rev', 1255000.00);
    updateNodeValue(dre, 'vat_sales', -125500.00);
    
    updateNodeValue(dre, 'dre.mod', -380000.00);
    updateNodeValue(dre, 'dre.cif', -(105000.00 + valCif));
    updateNodeValue(dre, 'dre.cpv_mp', -400000.00);
    
    updateNodeValue(dre, 'opex.sales', -(95000.00 + valSales));
    updateNodeValue(dre, 'opex.adm', -(85000.00 + valAdm));
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
    updateNodeValue(cf, 'cf.outflow.rent', -rentVal);
    updateNodeValue(cf, 'cf.outflow.maintenance', -20000.00);
    updateNodeValue(cf, 'cf.outflow.amortization', -25000.00);
    updateNodeValue(cf, 'cf.outflow.interest', -1500.00);
    updateNodeValue(cf, 'cf.outflow.taxes', -3420.00);
    
    updateNodeValue(cf, 'cf.final', cash - rentVal);
    
  } else {
    // S.A. Running: Restaura o DRE complexo histórico herdado do Simulador Sênior
    const rentVal = buildingMode === 'rented' ? (config.monthly_rent_value ?? 50000.00) : 0;
    const pProd = config.rent_allocation_productive ?? 70;
    const pAdm = config.rent_allocation_administrative ?? 10;
    const pSales = config.rent_allocation_sales ?? 20;

    const valCif = rentVal * (pProd / 100);
    const valAdm = rentVal * (pAdm / 100);
    const valSales = rentVal * (pSales / 100);

    updateNodeValue(dre, 'rev', 4184440.05);
    updateNodeValue(dre, 'vat_sales', 0.00);
    updateNodeValue(dre, 'dre.mod', -1269000.00);
    updateNodeValue(dre, 'dre.cif', -(330502.50 + valCif));
    updateNodeValue(dre, 'dre.cpv_mp', -1373328.43);
    
    updateNodeValue(dre, 'opex.sales', -(873250.00 + valSales));
    updateNodeValue(dre, 'opex.adm', -(216000.00 + valAdm));
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
    updateNodeValue(cf, 'cf.outflow.rent', -rentVal);
    updateNodeValue(cf, 'cf.outflow.interest', -2500.00);
    updateNodeValue(cf, 'cf.outflow.taxes', -14871.31);
    
    updateNodeValue(cf, 'cf.final', cash - rentVal);
  }

  // Helper interno de busca de valor para o rateio e consolidação horizontal fiduciária
  const getTreeValue = (nodes: AccountNode[], id: string): number => {
    const found = findNodeInTree(nodes, id);
    return found ? found.value : 0;
  };

  // --- RECALCULO HORIZONTAL INTEGRAL E ARITMÉTICO DA DRE ---
  const val_rev = getTreeValue(dre, 'rev');
  const val_vat_sales = getTreeValue(dre, 'vat_sales');
  
  const val_mod = getTreeValue(dre, 'dre.mod');
  const val_cif = getTreeValue(dre, 'dre.cif');
  const val_cpv_mp = getTreeValue(dre, 'dre.cpv_mp');
  const total_cpv = val_mod + val_cif + val_cpv_mp;
  updateNodeValue(dre, 'cpv', total_cpv);

  const total_gross = val_rev + val_vat_sales + total_cpv;
  updateNodeValue(dre, 'gross_profit', total_gross);

  const val_opex_sales = getTreeValue(dre, 'opex.sales');
  const val_opex_adm = getTreeValue(dre, 'opex.adm');
  const val_opex_bad = getTreeValue(dre, 'opex.bad_debt');
  const val_opex_rd = getTreeValue(dre, 'opex.rd');
  const total_opex = val_opex_sales + val_opex_adm + val_opex_bad + val_opex_rd;
  updateNodeValue(dre, 'opex', total_opex);

  const operating_profit = total_gross + total_opex;
  updateNodeValue(dre, 'operating_profit', operating_profit);

  const val_fin_rev = getTreeValue(dre, 'fin.rev');
  const val_fin_exp = getTreeValue(dre, 'fin.exp');
  const val_fx_var = getTreeValue(dre, 'fin.fx_variance') || 0;
  const total_fin = val_fin_rev + val_fin_exp + val_fx_var;
  updateNodeValue(dre, 'fin_res', total_fin);

  const val_non_op_rev = getTreeValue(dre, 'non_op.rev');
  const val_non_op_exp = getTreeValue(dre, 'non_op.exp');
  const total_non_op = val_non_op_rev + val_non_op_exp;
  updateNodeValue(dre, 'non_op_res', total_non_op);

  const lair_val = operating_profit + total_fin + total_non_op;
  updateNodeValue(dre, 'lair', lair_val);

  const val_tax_prov = getTreeValue(dre, 'tax_prov');
  const val_ppr_dre = getTreeValue(dre, 'ppr');
  const total_tax_ppr = val_tax_prov + val_ppr_dre;
  updateNodeValue(dre, 'tax_ppr_group', total_tax_ppr);

  const final_profit_val = lair_val + total_tax_ppr;
  updateNodeValue(dre, 'final_profit', final_profit_val);

  // --- RECALCULO HORIZONTAL INTEGRAL DO SFC/DFC (FLUXO DE CAIXA) ---
  const cf_start_val = getTreeValue(cf, 'cf.start');
  const cf_cash_sales = getTreeValue(cf, 'cf.inflow.cash_sales');
  const cf_term_sales = getTreeValue(cf, 'cf.inflow.term_sales');
  const total_inflow = cf_cash_sales + cf_term_sales;
  updateNodeValue(cf, 'cf.inflow', total_inflow);

  const cf_payroll = getTreeValue(cf, 'cf.outflow.payroll');
  const cf_charges = getTreeValue(cf, 'cf.outflow.social_charges');
  const cf_vat_payable = getTreeValue(cf, 'cf.outflow.vat_payable');
  const cf_marketing = getTreeValue(cf, 'cf.outflow.marketing');
  const cf_dist = getTreeValue(cf, 'cf.outflow.distribution');
  const cf_storage = getTreeValue(cf, 'cf.outflow.storage');
  const cf_suppliers = getTreeValue(cf, 'cf.outflow.suppliers');
  const cf_rent = getTreeValue(cf, 'cf.outflow.rent');
  const cf_maint = getTreeValue(cf, 'cf.outflow.maintenance');
  const cf_amort = getTreeValue(cf, 'cf.outflow.amortization');
  const cf_interest = getTreeValue(cf, 'cf.outflow.interest');
  const cf_taxes = getTreeValue(cf, 'cf.outflow.taxes');
  const total_outflow = cf_payroll + cf_charges + cf_vat_payable + cf_marketing + cf_dist + cf_storage + cf_suppliers + cf_rent + cf_maint + cf_amort + cf_interest + cf_taxes;
  updateNodeValue(cf, 'cf.outflow', total_outflow);

  const cf_final_val = cf_start_val + total_inflow + total_outflow;
  updateNodeValue(cf, 'cf.final', cf_final_val);

  // EXECUTA CHANCELA E HIGIENIZAÇÃO MÁXIMA DA ÁRVORE PARA GARANTIR ZERO ABSOLUTO
  validateCleanP0(bs, dre, cf, config.starting_mode, cash);

  const finalAssetsVal = assetsNode?.value || 0;
  const finalEquityVal = bs.find((n: any) => n.id === 'equity')?.value || 0;

  const initialLoansList: any[] = [];
  if (loans_st > 0) {
    initialLoansList.push({
      id: 'L-INIT-ST',
      type: 'normal',
      amount: loans_st,
      interest_rate: isBaseMode ? 14.5 : 12.0,
      term: 1,
      remaining_rounds: 1
    });
  }
  if (loans_lt > 0) {
    initialLoansList.push({
      id: 'L-INIT-LT',
      type: 'normal',
      amount: loans_lt,
      interest_rate: isBaseMode ? 12.5 : 10.0,
      term: 8,
      remaining_rounds: 8
    });
  }

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
    loans: initialLoansList,
    last_price: config.share_price_initial,
    share_price: config.share_price_initial,
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
