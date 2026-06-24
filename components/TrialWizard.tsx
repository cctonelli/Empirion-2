import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Rocket,
  Loader2,
  Info,
  CheckCircle2,
  Factory,
  Users,
  Globe,
  Timer,
  Cpu,
  Sparkles,
  Landmark,
  DollarSign,
  Euro,
  PoundSterling,
  Target,
  Calculator,
  Settings2,
  X,
  Bot,
  Boxes,
  TrendingUp,
  Percent,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart,
  Activity,
  Flame,
  Package,
  Award,
  MapPin,
  Gauge,
  BarChart3,
  Scale,
  Truck,
  UserPlus,
  UserMinus,
  Hammer,
  ShoppingCart,
  Briefcase,
  Tractor,
  Bitcoin,
  ClipboardList,
  HardDrive,
  ShieldAlert,
  Plus,
  Trash2,
  Library,
  Save,
  FolderOpen,
  Play,
} from "lucide-react";
import { motion as _motion, AnimatePresence } from "framer-motion";
const motion = _motion as any;
import {
  supabase,
  createChampionshipWithTeams,
  getP0Templates,
  saveP0Template,
  deleteP0Template,
} from "../services/supabase";
import {
  generatePureP0,
  TutorP0Config,
  P0Template,
  SUPPORTED_ACCOUNTING_MODELS,
} from "../services/initialization";
import {
  DEFAULT_INITIAL_SHARE_PRICE,
  DEFAULT_MACRO,
  DEFAULT_INDUSTRIAL_CHRONOGRAM,
} from "../constants";
import FinancialStructureEditor from "./FinancialStructureEditor";
import EmpireParticles from "./EmpireParticles";
import {
  Branch,
  SalesMode,
  AccountNode,
  DeadlineUnit,
  CurrencyType,
  MacroIndicators,
  RegionConfig,
  TransparencyLevel,
  GazetaMode,
  StrategicProfile,
} from "../types";
import { formatCurrency, getCurrencySymbol } from "../utils/formatters";
import { useNavigate } from "react-router-dom";

const translateTransparency = (level?: string) => {
  if (!level) return "MÉDIA (PADRÃO)";
  switch (level.toLowerCase()) {
    case "low":
      return "BAIXA (SIGILOSA)";
    case "medium":
      return "MÉDIA (PADRÃO)";
    case "high":
      return "ALTA (TRANSPARENTE)";
    case "full":
      return "TOTAL (OPEN DATA)";
    default:
      return level.toUpperCase();
  }
};

const OFFICIAL_PRESETS: any[] = [
  {
    id: "preset-greenfield-rented",
    name: "Greenfield Purista (Galpão Alugado)",
    description:
      "Empresa começa do absoluto zero em galpão locada. Capital Social de $1.2M focado 100% em Giro e Ativos de curto prazo.",
    config: {
      tutorName: "PROF. CLAUDIO TONELLI",
      institutionName: "UNIVERSIDADE EMPIRION",
      tournamentName: "COPA GREENFIELD DO ZERO",
      currency: "BRL",
      round_duration: 1,
      total_rounds: 6,
      transparency_level: "medium",
      gazeta_mode: "identified",
      activity_type: "industrial",
      accounting_template_id: "industrial_br_v1",
      starting_mode: "start_from_zero",
      building_mode: "rented",
      real_estate_acquisition_funding: "capital",
      installations_value: 500000,
      monthly_rent_value: 50000,
      rent_allocation_productive: 70,
      rent_allocation_administrative: 20,
      rent_allocation_sales: 10,
      machines: [
        {
          model: "alpha",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 150000,
        },
        {
          model: "beta",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 600000,
        },
        {
          model: "gamma",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 1500000,
        },
      ],
      workforce: {
        operatorsPerAlpha: 94,
        operatorsPerBeta: 235,
        operatorsPerGamma: 445,
        baseSalary: 2500,
        trainingLevel: 1,
      },
      regions: [
        {
          id: 1,
          name: "Sudeste",
          currency: "BRL",
          demand_weight: 50,
          suggested_price: 180,
          distribution_cost: 12,
          marketing_cost: 20000,
        },
        {
          id: 2,
          name: "Sul",
          currency: "BRL",
          demand_weight: 30,
          suggested_price: 185,
          distribution_cost: 15,
          marketing_cost: 15000,
        },
        {
          id: 3,
          name: "Nordeste",
          currency: "BRL",
          demand_weight: 20,
          suggested_price: 195,
          distribution_cost: 22,
          marketing_cost: 10000,
        },
      ],
      capital_social: 10000000,
      caixa_inicial: 10000000,
      inventories: {
        mpa_qty: 0,
        mpa_unit_val: 20,
        mpb_qty: 0,
        mpb_unit_val: 40,
        finished_qty: 0,
        finished_unit_val: 0,
      },
      financial_investments: 0,
      share_price_initial: 100,
      dividend_percent: 25,
      dividend_frequency: 2,
      profit_incorporation_frequency: 2,
      clients_initial: 0,
      custom_pecld_val: 0,
      suppliers_initial: 0,
      taxes_initial: 0,
      dividends_initial: 0,
      wip_stock_value: 0,
      macroOverrides: {},
    },
  },
  {
    id: "preset-greenfield-owned",
    name: "Greenfield Real Estate (Prédio Próprio)",
    description:
      "Galpão industrial próprio integralizado no Balanço de P0 ($2.25M bruto). Financiamento via Capital Próprio expandido.",
    config: {
      tutorName: "PROF. CLAUDIO TONELLI",
      institutionName: "UNIVERSIDADE EMPIRION",
      tournamentName: "COPA GREENFIELD REAL ESTATE",
      currency: "BRL",
      round_duration: 1,
      total_rounds: 6,
      transparency_level: "medium",
      gazeta_mode: "identified",
      activity_type: "industrial",
      accounting_template_id: "industrial_br_v1",
      starting_mode: "start_from_zero",
      building_mode: "owned",
      real_estate_acquisition_funding: "capital",
      building_value: 2000000,
      land_value: 1000000,
      installations_value: 250000,
      building_age: 0,
      machines: [
        {
          model: "alpha",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 150000,
        },
        {
          model: "beta",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 600000,
        },
        {
          model: "gamma",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 1500000,
        },
      ],
      workforce: {
        operatorsPerAlpha: 4,
        operatorsPerBeta: 6,
        operatorsPerGamma: 10,
        baseSalary: 2500,
        trainingLevel: 1,
      },
      regions: [
        {
          id: 1,
          name: "Sudeste",
          currency: "BRL",
          demand_weight: 50,
          suggested_price: 180,
          distribution_cost: 12,
          marketing_cost: 20000,
        },
        {
          id: 2,
          name: "Sul",
          currency: "BRL",
          demand_weight: 30,
          suggested_price: 185,
          distribution_cost: 15,
          marketing_cost: 15000,
        },
        {
          id: 3,
          name: "Nordeste",
          currency: "BRL",
          demand_weight: 20,
          suggested_price: 195,
          distribution_cost: 22,
          marketing_cost: 10000,
        },
      ],
      capital_social: 1200000,
      caixa_inicial: 1200000,
      inventories: {
        mpa_qty: 0,
        mpa_unit_val: 20,
        mpb_qty: 0,
        mpb_unit_val: 40,
        finished_qty: 0,
        finished_unit_val: 0,
      },
      financial_investments: 0,
      share_price_initial: 100,
      dividend_percent: 25,
      dividend_frequency: 2,
      profit_incorporation_frequency: 2,
      clients_initial: 0,
      custom_pecld_val: 0,
      suppliers_initial: 0,
      taxes_initial: 0,
      dividends_initial: 0,
      wip_stock_value: 0,
      macroOverrides: {},
    },
  },
  {
    id: "preset-base-standard",
    name: "Cenário PME - Indústria de Base",
    description:
      "Estrutura tradicional balanceada e de menor risco contendo 3 máquinas Alpha físicas, estoques ativos e Contas a Receber.",
    config: {
      tutorName: "PROF. CLAUDIO TONELLI",
      institutionName: "UNIVERSIDADE EMPIRION",
      tournamentName: "COPA BASE SAUDÁVEL",
      currency: "BRL",
      round_duration: 1,
      total_rounds: 6,
      transparency_level: "medium",
      gazeta_mode: "identified",
      activity_type: "industrial",
      accounting_template_id: "industrial_br_v1",
      starting_mode: "start_with_base",
      building_mode: "owned",
      real_estate_acquisition_funding: "capital",
      building_value: 2000000,
      land_value: 1000000,
      installations_value: 500000,
      building_age: 2,
      machines: [
        {
          model: "alpha",
          qty: 3,
          age: 3,
          efficiency: 1.0,
          installation_cost: 150000,
        },
        {
          model: "beta",
          qty: 2,
          age: 5,
          efficiency: 0.95,
          installation_cost: 600000,
        },
        {
          model: "gamma",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 1500000,
        },
      ],
      workforce: {
        operatorsPerAlpha: 94,
        operatorsPerBeta: 235,
        operatorsPerGamma: 445,
        baseSalary: 2500,
        trainingLevel: 2,
      },
      regions: [
        {
          id: 1,
          name: "Sudeste",
          currency: "BRL",
          demand_weight: 50,
          suggested_price: 180,
          distribution_cost: 12,
          marketing_cost: 20000,
        },
        {
          id: 2,
          name: "Sul",
          currency: "BRL",
          demand_weight: 30,
          suggested_price: 185,
          distribution_cost: 15,
          marketing_cost: 15000,
        },
        {
          id: 3,
          name: "Nordeste",
          currency: "BRL",
          demand_weight: 20,
          suggested_price: 195,
          distribution_cost: 22,
          marketing_cost: 10000,
        },
      ],
      capital_social: 7200000,
      caixa_inicial: 1500000,
      inventories: {
        mpa_qty: 30150,
        mpa_unit_val: 20,
        mpb_qty: 20100,
        mpb_unit_val: 40,
        finished_qty: 120,
        finished_unit_val: 180,
      },
      financial_investments: 0,
      share_price_initial: 100,
      dividend_percent: 25,
      dividend_frequency: 2,
      profit_incorporation_frequency: 2,
      clients_initial: 300000.0,
      custom_pecld_val: 4500.0,
      suppliers_initial: 100000.0,
      taxes_initial: 15000.0,
      dividends_initial: 5000.0,
      wip_stock_value: 50000.0,
      macroOverrides: {},
    },
  },
  {
    id: "preset-running-complex",
    name: "Cenário S.A. - Corporação running",
    description:
      "Nível Avançado. Operação com alto volume financeiro acumulado, obrigações, dividendos pré-declarados e estoque em processamento pleno.",
    config: {
      tutorName: "PROF. CLAUDIO TONELLI",
      institutionName: "UNIVERSIDADE EMPIRION",
      tournamentName: "ARENA RUNNING PLENA",
      currency: "BRL",
      round_duration: 1,
      total_rounds: 6,
      transparency_level: "medium",
      gazeta_mode: "identified",
      activity_type: "industrial",
      accounting_template_id: "industrial_br_v1",
      starting_mode: "start_with_running",
      building_mode: "owned",
      real_estate_acquisition_funding: "debt",
      building_value: 5440000,
      land_value: 1200000,
      installations_value: 1000000,
      building_age: 10,
      machines: [
        {
          model: "alpha",
          qty: 5,
          age: 6,
          efficiency: 1.0,
          installation_cost: 150000,
        },
        {
          model: "beta",
          qty: 1,
          age: 4,
          efficiency: 0.98,
          installation_cost: 600000,
        },
        {
          model: "gamma",
          qty: 0,
          age: 0,
          efficiency: 1.0,
          installation_cost: 1500000,
        },
      ],
      workforce: {
        operatorsPerAlpha: 94,
        operatorsPerBeta: 235,
        operatorsPerGamma: 445,
        baseSalary: 2500,
        trainingLevel: 3,
      },
      regions: [
        {
          id: 1,
          name: "Sudeste",
          currency: "BRL",
          demand_weight: 50,
          suggested_price: 180,
          distribution_cost: 12,
          marketing_cost: 20000,
        },
        {
          id: 2,
          name: "Sul",
          currency: "BRL",
          demand_weight: 30,
          suggested_price: 185,
          distribution_cost: 15,
          marketing_cost: 15000,
        },
        {
          id: 3,
          name: "Nordeste",
          currency: "BRL",
          demand_weight: 20,
          suggested_price: 195,
          distribution_cost: 22,
          marketing_cost: 10000,
        },
      ],
      capital_social: 7200000,
      caixa_inicial: 1500000,
      inventories: {
        mpa_qty: 35000,
        mpa_unit_val: 20,
        mpb_qty: 25000,
        mpb_unit_val: 40,
        finished_qty: 1200,
        finished_unit_val: 180,
      },
      financial_investments: 500000,
      share_price_initial: 100,
      dividend_percent: 25,
      dividend_frequency: 2,
      profit_incorporation_frequency: 2,
      clients_initial: 2092193.0,
      custom_pecld_val: 18529.46,
      suppliers_initial: 717605.0,
      taxes_initial: 14871.31,
      dividends_initial: 11153.49,
      wip_stock_value: 50000.0,
      macroOverrides: {},
    },
  },
];

const TrialWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  // Ajustado para 8 passos claros e didáticos de acordo com os requisitos Sapphire v19.14
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // v19.14 Tutor Controller Config
  const [tutorConfig, setTutorConfig] = useState<TutorP0Config>({
    tutorName: "PROF. CLAUDIO TONELLI",
    institutionName: "UNIVERSIDADE EMPIRION",
    tournamentName: "COPA EMPIRION",
    segmentName: "SEMICONDUTORES",
    currency: "BRL",
    round_duration: 1,
    total_rounds: 6,
    transparency_level: "medium",
    gazeta_mode: "anonymous",
    buildings_depreciation_rate: 5,
    property_depreciation_rate: 5,
    machines_depreciation_rate: 5,
    admin_sales_installations: 0,

    starting_mode: "start_with_base",
    activity_type: "industrial",
    accounting_template_id: "industrial_br_v1",

    machines: [
      {
        model: "alpha",
        qty: 3,
        age: 3,
        efficiency: 1.0,
        installation_cost: 150000,
      },
      {
        model: "beta",
        qty: 2,
        age: 5,
        efficiency: 1.0,
        installation_cost: 600000,
      },
      {
        model: "gamma",
        qty: 0,
        age: 0,
        efficiency: 1.0,
        installation_cost: 1500000,
      },
    ],
    workforce: {
      operatorsPerAlpha: 94,
      operatorsPerBeta: 235,
      operatorsPerGamma: 445,
      baseSalary: 2500.0,
      trainingLevel: 3,
      production_hours_period: 176,
      max_shifts: 1,
      admin_count: 10,
      sales_count: 10,
      salary_multiplier: 1.5,
    },
    regions: [
      {
        id: 1,
        name: "BRASIL (LOCAL)",
        currency: "BRL",
        demand_weight: 40,
        suggested_price: 425.0,
        distribution_cost: 50.0,
        marketing_cost: 10000.0,
      },
      {
        id: 2,
        name: "EUA (EXPORT)",
        currency: "USD",
        demand_weight: 20,
        suggested_price: 425.0,
        distribution_cost: 50.0,
        marketing_cost: 10000.0,
      },
      {
        id: 3,
        name: "EUROPA (EXPORT)",
        currency: "EUR",
        demand_weight: 20,
        suggested_price: 425.0,
        distribution_cost: 50.0,
        marketing_cost: 10000.0,
      },
      {
        id: 4,
        name: "CHINA (EXPORT)",
        currency: "CNY",
        demand_weight: 20,
        suggested_price: 425.0,
        distribution_cost: 50.0,
        marketing_cost: 10000.0,
      },
    ],
    capital_social: 7200000.0,
    caixa_inicial: 1500000.0,
    inventories: {
      mpa_qty: 30150,
      mpa_unit_val: 20.0,
      mpb_qty: 20100,
      mpb_unit_val: 40.0,
      finished_qty: 0,
      finished_unit_val: 0.0,
    },
    financial_investments: 0.0 as any, // asserts for starting modes compatibility
    share_price_initial: 100.0,
    dividend_percent: 25.0,
    dividend_frequency: 1,
    profit_incorporation_frequency: 2,
    building_mode: "owned",
    real_estate_acquisition_funding: "capital",
    installations_value: 500000.0,
    building_value: 2000000.0,
    land_value: 10000000.0,
    building_age: 2,
    monthly_rent_value: 50000.0,
    rent_allocation_productive: 70,
    rent_allocation_administrative: 20,
    rent_allocation_sales: 10,
    macroOverrides: {},
  });

  // Salvar/Carregar templates
  const [savedTemplates, setSavedTemplates] = useState<P0Template[]>([]);
  const [showFiduciaryMonitor, setShowFiduciaryMonitor] = useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<
    any | null
  >(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [showSaveTplModal, setShowSaveTplModal] = useState(false);
  const [templateIsPublic, setTemplateIsPublic] = useState(true);
  const [tplLoading, setTplLoading] = useState(false);
  const [activeAuditTab, setActiveAuditTab] = useState<
    "esds" | "liquidity" | "assets" | "governance" | "financials"
  >("esds");
  const [selectedFinancialTab, setSelectedFinancialTab] = useState<
    "balance" | "dre" | "cashflow"
  >("balance");
  const [isLiveHudOpen, setIsLiveHudOpen] = useState(false);

  const previewFinancials = useMemo(() => {
    if (!selectedPreviewTemplate?.config) return null;
    try {
      return generatePureP0(selectedPreviewTemplate.config);
    } catch (e) {
      console.error("Erro ao gerar preview de template:", e);
      return null;
    }
  }, [selectedPreviewTemplate]);

  // Teams counts and state
  const [humanTeamsCount, setHumanTeamsCount] = useState(1);
  const [botsCount, setBotsCount] = useState(0);
  const [teamNames, setTeamNames] = useState<string[]>(["EQUIPE TRIAL 01"]);

  // Chronogram parameters of rounds
  const [roundRules, setRoundRules] = useState<
    Record<number, Partial<MacroIndicators>>
  >(DEFAULT_INDUSTRIAL_CHRONOGRAM);

  // Sincronizar nomes de equipes humanas
  useEffect(() => {
    setTeamNames((prev) => {
      const next = [...prev];
      if (next.length < humanTeamsCount) {
        for (let i = next.length; i < humanTeamsCount; i++) {
          next.push(`EQUIPE TRIAL 0${i + 1}`);
        }
      }
      return next.slice(0, humanTeamsCount);
    });
  }, [humanTeamsCount]);

  // Carregar templates ao iniciar
  const loadTemplatesFromSupabase = async () => {
    setTplLoading(true);
    const list = await getP0Templates();
    setSavedTemplates(list);
    setTplLoading(false);
  };

  useEffect(() => {
    loadTemplatesFromSupabase();
  }, []);

  // Recurso de alteração de modo de P0
  const handleModeChange = (
    mode: "start_from_zero" | "start_with_base" | "start_with_running",
  ) => {
    setTutorConfig((prev) => {
      const updated = { ...prev, starting_mode: mode } as any;
      if (mode === "start_from_zero") {
        updated.caixa_inicial = 10000000.0;
        updated.capital_social = 10000000.0;
        updated.financial_investments = 0;
        updated.inventories = {
          mpa_qty: 0,
          mpa_unit_val: 20.0,
          mpb_qty: 0,
          mpb_unit_val: 40.0,
          finished_qty: 0,
          finished_unit_val: 0.0,
        };
        updated.machines = [
          { model: "alpha", qty: 0, age: 0, efficiency: 1.0 },
          { model: "beta", qty: 0, age: 0, efficiency: 1.0 },
          { model: "gamma", qty: 0, age: 0, efficiency: 1.0 },
        ];
        updated.clients_initial = 0;
        updated.custom_pecld_val = 0;
        updated.suppliers_initial = 0;
        updated.taxes_initial = 0;
        updated.dividends_initial = 0;
        updated.wip_stock_value = 0;
        // Calibrações contábeis e físicas imobiliárias para o Greenfield do zero
        updated.building_mode = "rented";
        updated.building_value = 0.0;
        updated.land_value = 0.0;
        updated.building_age = 0;
        updated.installations_value = 500000.0;
        updated.admin_sales_installations = 500000.0;
      } else if (mode === "start_with_base") {
        updated.caixa_inicial = 1500000.0;
        updated.capital_social = 7200000.0;
        updated.financial_investments = 0;
        updated.inventories = {
          mpa_qty: 30150,
          mpa_unit_val: 20.0,
          mpb_qty: 20100,
          mpb_unit_val: 40.0,
          finished_qty: 0,
          finished_unit_val: 0.0,
        };
        updated.machines = [
          { model: "alpha", qty: 3, age: 3, efficiency: 1.0 },
          { model: "beta", qty: 2, age: 5, efficiency: 0.95 },
          { model: "gamma", qty: 0, age: 0, efficiency: 1.0 },
        ];
        updated.clients_initial = 300000.0;
        updated.custom_pecld_val = 4500.0;
        updated.suppliers_initial = 100000.0;
        updated.taxes_initial = 15000.0;
        updated.dividends_initial = 5000.0;
        updated.wip_stock_value = 50000.0;
        // Calibrações contábeis e físicas imobiliárias para o modo de Base
        updated.building_mode = "owned";
        updated.building_value = 2000000.0;
        updated.land_value = 10000000.0;
        updated.building_age = 2;
        updated.installations_value = 500000.0;
        updated.admin_sales_installations = 500000.0;
      } else {
        // start_with_running
        updated.caixa_inicial = 1500000.0;
        updated.capital_social = 7200000.0;
        updated.financial_investments = 500000.0;
        updated.inventories = {
          mpa_qty: 35000,
          mpa_unit_val: 20.0,
          mpb_qty: 25000,
          mpb_unit_val: 40.0,
          finished_qty: 1200,
          finished_unit_val: 180.0,
        };
        updated.machines = [
          { model: "alpha", qty: 5, age: 6, efficiency: 1.0 },
          { model: "beta", qty: 1, age: 4, efficiency: 0.98 },
          { model: "gamma", qty: 0, age: 0, efficiency: 1.0 },
        ];
        updated.clients_initial = 2092193.0;
        updated.custom_pecld_val = 18529.46;
        updated.suppliers_initial = 717605.0;
        updated.taxes_initial = 14871.31;
        updated.dividends_initial = 11153.49;
        updated.wip_stock_value = 500000.0;
        // Calibrações contábeis e físicas imobiliárias para o modo Corporativo Ativo
        updated.building_mode = "owned";
        updated.building_value = 5440000.0;
        updated.land_value = 1200000.0;
        updated.building_age = 10;
        updated.installations_value = 10000000.0;
        updated.admin_sales_installations = 10000000.0;
      }
      return updated as TutorP0Config;
    });
  };

  // Gerar P0 determinístico com base no editor ou estado
  const p0StatementsResult = useMemo(() => {
    return generatePureP0(tutorConfig);
  }, [tutorConfig]);

  // Metricas fiduciárias e subnotas de auditoria do Tutor calculados em tempo real (v19.22)
  const fiduciaryMetrics = useMemo(() => {
    const isZeroMode = tutorConfig.starting_mode === "start_from_zero";
    const isBaseMode = tutorConfig.starting_mode === "start_with_base";
    const isRunningMode = tutorConfig.starting_mode === "start_with_running";

    const bs = p0StatementsResult.balance_sheet;

    // Helper para extrair qualquer ID de conta de forma robusta e recursiva
    const findNodeValue = (nodes: any[], targetId: string): number => {
      const search = (list: any[]): { found: boolean; value: number } => {
        for (const n of list) {
          if (n.id === targetId) return { found: true, value: n.value };
          if (n.children && n.children.length > 0) {
            const res = search(n.children);
            if (res.found) return res;
          }
        }
        return { found: false, value: 0 };
      };
      return search(nodes).value;
    };

    // Extração direta do Balanço Patrimonial sênior recalculado de forma reativa
    const current_assets = findNodeValue(bs, "assets.current") || 10000000;
    const current_liabilities = findNodeValue(bs, "liabilities.current") || 0;
    const loans_lt = findNodeValue(bs, "liabilities.longterm.loans_lt") || 0;
    const total_liabilities = current_liabilities + loans_lt;
    const imobilizado = findNodeValue(bs, "assets.noncurrent.fixed") || 0;
    const total_assets = findNodeValue(bs, "assets") || 10000000;

    const liquidity_current =
      current_liabilities > 0 ? current_assets / current_liabilities : 99.9;
    const leverage = total_assets > 0 ? total_liabilities / total_assets : 0;

    const alphaCapBase = tutorConfig.machines[0]?.capacity_at_100 !== undefined ? Number(tutorConfig.machines[0].capacity_at_100) : 2000;
    const betaCapBase = tutorConfig.machines[1]?.capacity_at_100 !== undefined ? Number(tutorConfig.machines[1].capacity_at_100) : 7000;
    const gamaCapBase = tutorConfig.machines[2]?.capacity_at_100 !== undefined ? Number(tutorConfig.machines[2].capacity_at_100) : 15000;

    const capAlpha = isZeroMode
      ? 0
      : (tutorConfig.machines[0]?.qty || 0) * alphaCapBase;
    const capBeta = isZeroMode ? 0 : (tutorConfig.machines[1]?.qty || 0) * betaCapBase;
    const capGama = isZeroMode
      ? 0
      : (tutorConfig.machines[2]?.qty || 0) * gamaCapBase;
    const capTotal = capAlpha + capBeta + capGama;

    const m_deprec_round = (isZeroMode ? [] : tutorConfig.machines).reduce(
      (acc, m) => {
        const price =
          m.price !== undefined ? Number(m.price) : (m.model === "alpha" ? 500000 : m.model === "beta" ? 1500000 : 3000000);
        const rate =
          (tutorConfig.machines_depreciation_rate !== undefined
            ? tutorConfig.machines_depreciation_rate
            : 5) / 100;
        return acc + price * m.qty * rate * m.efficiency;
      },
      0,
    );

    const buildingMode =
      tutorConfig.building_mode ?? (isZeroMode ? "rented" : "owned");
    const bValDefault = isZeroMode ? 2000000 : isBaseMode ? 2000000 : 5440000;
    const buildingBaseValue =
      buildingMode === "owned"
        ? (tutorConfig.building_value ?? bValDefault)
        : 0;

    const alphaInstallCost = 150000;
    const betaInstallCost = 600000;
    const gammaInstallCost = 1500000;

    const installationsMachinesVal = isZeroMode
      ? 0
      : (tutorConfig.machines[0]?.qty || 0) * alphaInstallCost +
        (tutorConfig.machines[1]?.qty || 0) * betaInstallCost +
        (tutorConfig.machines[2]?.qty || 0) * gammaInstallCost;

    const installationsVal = tutorConfig.installations_value !== undefined && tutorConfig.installations_value !== null
      ? Number(tutorConfig.installations_value)
      : (installationsMachinesVal + (tutorConfig.admin_sales_installations || 0));

    const parsed_deprec_rate =
      (tutorConfig.buildings_depreciation_rate !== undefined
        ? tutorConfig.buildings_depreciation_rate
        : 10) / 100;
    const property_deprec_rate_local =
      (tutorConfig.property_depreciation_rate !== undefined
        ? tutorConfig.property_depreciation_rate
        : 4) / 100;

    const building_deprec_only =
      buildingMode === "owned"
        ? buildingBaseValue * property_deprec_rate_local
        : 0;
    const installations_deprec_only = installationsVal * parsed_deprec_rate;

    const b_deprec_round = building_deprec_only + installations_deprec_only;
    const total_deprec_round = m_deprec_round + b_deprec_round;

    const total_operators = isZeroMode
      ? 0
      : (tutorConfig.machines[0]?.qty || 0) *
          tutorConfig.workforce.operatorsPerAlpha +
        (tutorConfig.machines[1]?.qty || 0) *
          tutorConfig.workforce.operatorsPerBeta +
        (tutorConfig.machines[2]?.qty || 0) *
          tutorConfig.workforce.operatorsPerGamma;
    const payroll_round = total_operators * tutorConfig.workforce.baseSalary;

    const scoreLiquidity =
      liquidity_current >= 2.5
        ? 10
        : liquidity_current >= 1.5
          ? 8.5
          : liquidity_current >= 1.0
            ? 7
            : 4;
    const scoreLeverage =
      leverage <= 0.2 ? 10 : leverage <= 0.4 ? 8.5 : leverage <= 0.6 ? 7 : 3;
    const scoreOperators =
      tutorConfig.workforce.baseSalary >= 2500
        ? 10
        : tutorConfig.workforce.baseSalary >= 1800
          ? 8
          : 5;

    return {
      current_assets,
      current_liabilities,
      total_liabilities,
      liquidity_current,
      leverage,
      capAlpha,
      capBeta,
      capGama,
      capTotal,
      imobilizado,
      total_assets,
      total_operators,
      payroll_round,
      total_deprec_round,
      building_deprec_only,
      installations_deprec_only,
      m_deprec_round,
      installationsMachinesVal,
      installationsVal,
      buildings_depreciation_rate_pct:
        tutorConfig.buildings_depreciation_rate ?? 10,
      property_depreciation_rate_pct:
        tutorConfig.property_depreciation_rate ?? 4,
      scoreLiquidity,
      scoreLeverage,
      scoreOperators,
    };
  }, [tutorConfig, p0StatementsResult]);

  const [editableFinancials, setEditableFinancials] = useState<{
    balance_sheet: AccountNode[];
    dre: AccountNode[];
    cash_flow: AccountNode[];
  }>(() => {
    return {
      balance_sheet: p0StatementsResult.balance_sheet,
      dre: p0StatementsResult.dre,
      cash_flow: p0StatementsResult.cash_flow,
    };
  });

  // Atualiza as demonstrações da UI de preview quando o P0 matemático recalculado é alterado
  useEffect(() => {
    setEditableFinancials({
      balance_sheet: p0StatementsResult.balance_sheet,
      dre: p0StatementsResult.dre,
      cash_flow: p0StatementsResult.cash_flow,
    });
  }, [p0StatementsResult]);

  // Recalcular P0 manual
  const handleRecalculate = () => {
    const fresh = generatePureP0(tutorConfig);
    setEditableFinancials({
      balance_sheet: fresh.balance_sheet,
      dre: fresh.dre,
      cash_flow: fresh.cash_flow,
    });
  };

  // Salvar template contábil/configuração atualizado
  const handleSaveTpl = async () => {
    if (!templateName) {
      alert("Defina o nome do template!");
      return;
    }
    const maxRounds = tutorConfig.total_rounds || 6;
    const cleanChronogram: Record<number, any> = {};
    Object.keys(roundRules).forEach((k) => {
      const rIndex = Number(k);
      if (rIndex <= maxRounds) {
        cleanChronogram[rIndex] = roundRules[rIndex];
      }
    });

    const tplPayload = {
      name: templateName,
      description: templateDesc,
      category: "industrial",
      code: `TPL_${templateName.replace(/\s+/g, "_").toUpperCase()}_${Date.now()}`,
      config: {
        ...tutorConfig,
        humanTeamsCount,
        teamNames,
        botsCount,
        round_rules: cleanChronogram,
        DEFAULT_INDUSTRIAL_CHRONOGRAM: cleanChronogram,
      },
      is_public: templateIsPublic,
    };

    await saveP0Template(tplPayload);
    setShowSaveTplModal(false);
    loadTemplatesFromSupabase();
    alert("Template P0 Salvo com Sucesso!");
  };

  const handleLoadTpl = (tpl: P0Template) => {
    setTutorConfig(tpl.config);
    if (tpl.config) {
      const loadedChrono = tpl.config.round_rules || tpl.config.DEFAULT_INDUSTRIAL_CHRONOGRAM || DEFAULT_INDUSTRIAL_CHRONOGRAM;
      setRoundRules(loadedChrono);

      if (typeof tpl.config.humanTeamsCount === 'number') {
        setHumanTeamsCount(tpl.config.humanTeamsCount);
      }
      if (Array.isArray(tpl.config.teamNames)) {
        setTeamNames(tpl.config.teamNames);
      }
      if (typeof tpl.config.botsCount === 'number') {
        setBotsCount(tpl.config.botsCount);
      }
    }
    alert(`Template "${tpl.name}" carregado com sucesso!`);
  };

  const handleDeleteTpl = async (id: string) => {
    if (
      window.confirm(
        "Deseja mesmo excluir este template contábil de forma permanente?",
      )
    ) {
      const res = await deleteP0Template(id);
      if (res.success) {
        await loadTemplatesFromSupabase();
        alert("Template excluído com sucesso das nuvens fiduciárias!");
      } else {
        alert("Falha fiduciária ao tentar remover template.");
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Lançar Arena com as preferências contábeis v19.14
  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const profiles: StrategicProfile[] = [
        "AGRESSIVO",
        "CONSERVADOR",
        "EFICIENTE",
        "INOVADOR",
        "EQUILIBRADO",
      ];
      const teamsToCreate = [
        ...teamNames.map((n) => ({ name: n, is_bot: false })),
        ...Array.from({ length: botsCount }, (_, i) => ({
          name: `SYNTH NODE 0${i + 1}`,
          is_bot: true,
          strategic_profile: profiles[i % profiles.length],
        })),
      ];

      // Determinar quantidade de máquinas estruturadas e quantidades de estoques
      const initialStockQty = {
        mp_a: tutorConfig.inventories.mpa_qty,
        mp_b: tutorConfig.inventories.mpb_qty,
        finished_goods: tutorConfig.inventories.finished_qty,
      };

      // Limpar (limitar pelas rodadas reais configuradas) as regras temporais para o payload de arena
      const maxRounds = tutorConfig.total_rounds || 6;
      const cleanChronogram: Record<number, any> = {};
      Object.keys(roundRules).forEach((k) => {
        const rIndex = Number(k);
        if (rIndex <= maxRounds) {
          cleanChronogram[rIndex] = roundRules[rIndex];
        }
      });

      // Preparação e despacho do payload
      const champ = await createChampionshipWithTeams(
        {
          name: tutorConfig.tournamentName,
          starting_mode: tutorConfig.starting_mode,
          total_rounds: tutorConfig.total_rounds,
          sales_mode: "hybrid" as SalesMode,
          branch: "industrial" as Branch,
          regions_count: tutorConfig.regions.length,
          deadline_value: tutorConfig.round_duration,
          deadline_unit: "hours" as DeadlineUnit,
          transparency_level: tutorConfig.transparency_level,
          gazeta_mode: tutorConfig.gazeta_mode,
          initial_share_price: tutorConfig.share_price_initial,
          region_names: tutorConfig.regions.map((r) => r.name),
          region_configs: tutorConfig.regions.map((r) => ({
            id: r.id,
            name: r.name,
            currency: r.currency,
            demand_weight: r.demand_weight,
          })),
          initial_financials: editableFinancials,
          initial_machines: p0StatementsResult.machines,
          initial_stock_quantities: initialStockQty,
          is_trial: true,
          config: {
            ...tutorConfig,
            round_rules: cleanChronogram,
          },
          ecosystem_config: {
            starting_mode: tutorConfig.starting_mode,
            building_mode:
              tutorConfig.building_mode ??
              (tutorConfig.starting_mode === "start_from_zero"
                ? "rented"
                : "owned"),
            building_value:
              tutorConfig.building_value ??
              (tutorConfig.starting_mode === "start_from_zero"
                ? 2000000.0
                : tutorConfig.starting_mode === "start_with_base"
                  ? 2000000.0
                  : 5440000.0),
            building_age:
              tutorConfig.building_age ??
              (tutorConfig.starting_mode === "start_from_zero"
                ? 0
                : tutorConfig.starting_mode === "start_with_base"
                  ? 2
                  : 10),
            installations_value:
              tutorConfig.installations_value ??
              (tutorConfig.starting_mode === "start_from_zero"
                ? 500000.0
                : tutorConfig.starting_mode === "start_with_base"
                  ? 500000.0
                  : 10000000.0),
            land_value:
              tutorConfig.land_value ??
              (tutorConfig.starting_mode === "start_from_zero"
                ? 10000000.0
                : tutorConfig.starting_mode === "start_with_base"
                  ? 10000000.0
                  : 1200000.0),
            real_estate_acquisition_funding:
              tutorConfig.real_estate_acquisition_funding ?? "capital",
            monthly_rent_value: tutorConfig.monthly_rent_value ?? 50000.0,
            rent_allocation_productive:
              tutorConfig.rent_allocation_productive ?? 70,
            rent_allocation_administrative:
              tutorConfig.rent_allocation_administrative ?? 20,
            rent_allocation_sales: tutorConfig.rent_allocation_sales ?? 10,
            buildings_depreciation_rate:
              tutorConfig.buildings_depreciation_rate ?? 5,
            property_depreciation_rate:
              tutorConfig.property_depreciation_rate ?? 5,
            machines_depreciation_rate:
              tutorConfig.machines_depreciation_rate ?? 5,
          },
          market_indicators: {
            ...DEFAULT_MACRO,
            dividend_percent: tutorConfig.dividend_percent,
            max_shifts: tutorConfig.workforce.max_shifts ?? 1,
            production_hours_period:
              tutorConfig.workforce.production_hours_period ?? 176,
            prices: {
              ...DEFAULT_MACRO.prices,
              mp_a: tutorConfig.inventories.mpa_unit_val ?? 20.0,
              mp_b: tutorConfig.inventories.mpb_unit_val ?? 40.0,
              distribution_unit: tutorConfig.regions[0]?.distribution_cost ?? 50.0,
              marketing_campaign: tutorConfig.regions[0]?.marketing_cost ?? 10000.0,
            },
            machinery_values: {
              alpha: tutorConfig.machines[0]?.price ?? 500000.0,
              beta: tutorConfig.machines[1]?.price ?? 1500000.0,
              gamma: tutorConfig.machines[2]?.price ?? 3000000.0,
            },
            hr_base: {
              ...DEFAULT_MACRO.hr_base,
              salary: tutorConfig.workforce.baseSalary ?? 2500.0,
            },
            staffing: {
              admin: { count: tutorConfig.workforce.admin_count ?? 20, salaries: 4 },
              sales: { count: tutorConfig.workforce.sales_count ?? 10, salaries: 4 },
              production: { count: DEFAULT_MACRO.staffing.production.count, salaries: 1 }
            },
            machine_specs: {
              ...DEFAULT_MACRO.machine_specs,
              alpha: {
                ...DEFAULT_MACRO.machine_specs.alpha,
                initial_value: tutorConfig.machines[0]?.price ?? 500000.0,
                production_capacity: tutorConfig.machines[0]?.capacity_at_100 ?? 2000,
                operators_required:
                  tutorConfig.workforce.operatorsPerAlpha ?? 94,
              },
              beta: {
                ...DEFAULT_MACRO.machine_specs.beta,
                initial_value: tutorConfig.machines[1]?.price ?? 1500000.0,
                production_capacity: tutorConfig.machines[1]?.capacity_at_100 ?? 7000,
                operators_required:
                  tutorConfig.workforce.operatorsPerBeta ?? 235,
              },
              gamma: {
                ...DEFAULT_MACRO.machine_specs.gamma,
                initial_value: tutorConfig.machines[2]?.price ?? 3000000.0,
                production_capacity: tutorConfig.machines[2]?.capacity_at_100 ?? 15000,
                operators_required:
                  tutorConfig.workforce.operatorsPerGamma ?? 445,
              },
            },
            region_configs: tutorConfig.regions.map((r) => ({
              id: r.id,
              name: r.name,
              currency: r.currency,
              demand_weight: r.demand_weight,
            })),
          },
          round_rules: roundRules,
          tutor_name: tutorConfig.tutorName,
          institution_name: tutorConfig.institutionName,
        },
        teamsToCreate,
        true,
      );

      // Auto-selecionar a nova arena e a primeira equipe humana para evitar vazamento de dados antigos
      if (champ && champ.id) {
        try {
          const { data: teamData } = await supabase
            .from("trial_teams")
            .select("id")
            .eq("championship_id", champ.id)
            .eq("is_bot", false)
            .order("name", { ascending: true })
            .limit(1);

          if (teamData && teamData[0]) {
            localStorage.setItem("active_champ_id", champ.id);
            localStorage.setItem("active_team_id", teamData[0].id);
            localStorage.setItem("is_trial_session", "true");
            console.log(
              "Oracle Session Matcher – Auto-seleção completada:",
              champ.id,
              teamData[0].id,
            );
          }
        } catch (selectErr) {
          console.error(
            "Oracle Session Matcher Fault – Falha no auto-align de sessão:",
            selectErr,
          );
        }
      }

      onComplete();

      setTimeout(() => {
        navigate("/app");
      }, 500);
    } catch (e: any) {
      alert(`FALHA NA SOLDA DA ARENA: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules((prev) => ({
      ...prev,
      [round]: { ...(prev[round] || {}), [key]: val },
    }));
  };

  // Auxiliares de visualização e cálculo
  const stepsCount = 8;
  const totalPeriods = tutorConfig.total_rounds + 1;

  const totalAssets = useMemo(() => {
    const findNodeValue = (nodes: any[], targetId: string): number => {
      const search = (list: any[]): { found: boolean; value: number } => {
        for (const n of list) {
          if (n.id === targetId) return { found: true, value: n.value };
          if (n.children && n.children.length > 0) {
            const res = search(n.children);
            if (res.found) return res;
          }
        }
        return { found: false, value: 0 };
      };
      return search(nodes).value;
    };
    const assetsFound = findNodeValue(
      p0StatementsResult.balance_sheet,
      "assets",
    );
    return assetsFound || 9493163.54;
  }, [p0StatementsResult.balance_sheet]);

  const totalEquity = useMemo(() => {
    const findNodeValue = (nodes: any[], targetId: string): number => {
      const search = (list: any[]): { found: boolean; value: number } => {
        for (const n of list) {
          if (n.id === targetId) return { found: true, value: n.value };
          if (n.children && n.children.length > 0) {
            const res = search(n.children);
            if (res.found) return res;
          }
        }
        return { found: false, value: 0 };
      };
      return search(nodes).value;
    };
    const plFound = findNodeValue(p0StatementsResult.balance_sheet, "equity");
    return plFound || totalAssets - 10000000;
  }, [p0StatementsResult.balance_sheet, totalAssets]);

  // Estimativa do E-SDS base do P0
  const estimatedESDS = useMemo(() => {
    const isZeroMode = tutorConfig.starting_mode === "start_from_zero";
    const isBaseMode = tutorConfig.starting_mode === "start_with_base";
    const isRunningMode = tutorConfig.starting_mode === "start_with_running";

    // Obter contas chave do fiduciaryMetrics
    const ca = fiduciaryMetrics.current_assets;
    const cl = fiduciaryMetrics.current_liabilities || 1;
    const tl = fiduciaryMetrics.total_liabilities || 1;
    const cash = tutorConfig.caixa_inicial;

    const workingCapital = ca - cl;
    const x1 = workingCapital / (totalAssets || 1);
    const x2 = isZeroMode ? 0.0 : isBaseMode ? 0.05 : 0.12;
    const x3 = 0.08; // Retorno do Ativo implícito histórico do P0
    const x4 = totalEquity / tl;

    // Altman Z''-score (fórmula armada de mercado emergente)
    const altmanVal =
      3.25 + 6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * Math.min(10, x4);
    const altman = parseFloat(altmanVal.toFixed(2));

    // Kanitz (Solvência Geral fiduciária)
    const kanitzVal = (ca / cl) * 0.8 + (totalEquity / tl) * 0.4;
    const kanitz = parseFloat(kanitzVal.toFixed(2));

    // Rating de Crédito dinâmico
    let rating = "BBB";
    if (altman >= 6.5 && cl > 0) rating = "AAA";
    else if (altman >= 4.5) rating = "AA";
    else if (altman >= 2.8) rating = "A";
    else if (altman >= 1.5) rating = "BBB";
    else rating = "BB";

    // Pilares de Integridade E-SDS (v19.23)
    // Pillar 1: Fluxo de Caixa Livre Operacional (FCF / FCO)
    let p1 = 100;
    if (isBaseMode) p1 = 82;
    if (isRunningMode) p1 = 61;
    if (cash < 200000) p1 = Math.max(15, p1 - 30);

    // Pillar 2: Crescimento Sustentável (Dívida / PL)
    const alavancagem = tl / totalEquity;
    let p2 = Math.max(10, Math.min(100, 100 - alavancagem * 85));

    // Pillar 3: DuPont & Margens
    let p3 = 75;
    if (isBaseMode) p3 = 85;
    if (isRunningMode) p3 = 94;
    const avgEfficiency =
      tutorConfig.machines.length > 0
        ? tutorConfig.machines.reduce((acc, m) => acc + m.efficiency, 0) /
          tutorConfig.machines.length
        : 1;
    p3 = Math.round(p3 * avgEfficiency);

    // Pillar 4: Cobertura de Giro e Dias de Caixa (Liquidez Corrente)
    const lc = ca / cl;
    let p4 = Math.max(10, Math.min(100, (lc / 3.0) * 100));

    // Pillar 5: Alavancagem e Concentração (Depreciação acumulada sobre imobilizado bruto)
    let p5 = 100;
    let machAcqu = 0;
    let machDeprec = 0;
    const actualMachines = isZeroMode ? [] : tutorConfig.machines;
    actualMachines.forEach((mac) => {
      const modelPrice =
        mac.model === "alpha"
          ? 500000
          : mac.model === "beta"
            ? 1500000
            : 3000000;
      machAcqu += modelPrice * mac.qty;
      machDeprec += modelPrice * mac.qty * mac.age * 0.1 * mac.efficiency;
    });
    if (machAcqu > 0) {
      const deprecRatio = machDeprec / machAcqu;
      p5 = Math.max(12, Math.min(100, 100 - deprecRatio * 150));
    }

    // Pillar 6: Volatilidade Cambial (risco macro / inadimplência)
    const macroDefault = roundRules[0]?.customer_default_rate ?? 3.5;
    let p6 = Math.max(10, Math.min(100, 100 - macroDefault * 9));

    // Média ponderada com pesos
    const scoreVal =
      (p1 * 0.22 + p2 * 0.15 + p3 * 0.15 + p4 * 0.2 + p5 * 0.14 + p6 * 0.14) /
      10;
    const score = parseFloat(scoreVal.toFixed(1));

    let zone: "Azul" | "Verde" | "Amarelo" | "Laranja" | "Vermelho" = "Verde";
    let insights = "";

    if (score >= 8.0) {
      zone = "Azul";
      insights =
        "Soberania patrimonial e fiduciária absoluta. Planta industrial e caixa perfeitamente calibrados.";
    } else if (score >= 5.5) {
      zone = "Verde";
      insights =
        "Ambiente de negócios sustentável. Níveis adequados de alavancagem e liquidez operacional.";
    } else if (score >= 3.0) {
      zone = "Amarelo";
      insights =
        "Sinal de Alerta Contábil. A empresa possui passivos pesados de fomento histórico exigindo calibração imediata.";
    } else if (score >= 1.5) {
      zone = "Laranja";
      insights =
        "Situação Crítica. Elevado endividamento, depreciação acelerada dos ativos e liquidez deteriorada.";
    } else {
      zone = "Vermelho";
      insights =
        "Alerta de Insolvência Imediata fiduciária. Recomenda-se capitalização urgente por parte dos sócios.";
    }

    return {
      score,
      zone,
      insights,
      altman,
      kanitz,
      rating,
      pillars: {
        p1: Math.round(p1),
        p2: Math.round(p2),
        p3: Math.round(p3),
        p4: Math.round(p4),
        p5: Math.round(p5),
        p6: Math.round(p6),
      },
    };
  }, [tutorConfig, totalAssets, totalEquity, roundRules, fiduciaryMetrics]);

  const rentAllocProd = tutorConfig.rent_allocation_productive ?? 70;
  const rentAllocAdm = tutorConfig.rent_allocation_administrative ?? 20;
  const rentAllocSales = tutorConfig.rent_allocation_sales ?? 10;
  const isRentSumValid =
    tutorConfig.building_mode !== "rented" ||
    (rentAllocProd + rentAllocAdm + rentAllocSales) === 100;
  const canGoNext = step !== 6 || isRentSumValid;

  return (
    <div
      id="trial_wizard_shell"
      className="wizard-shell bg-slate-950/95 relative"
    >
      <EmpireParticles />
      <header
        id="trial_wizard_header"
        className="shrink-0 bg-slate-900/95 backdrop-blur-3xl border-b border-white/10 z-[50] h-20 px-10 grid grid-cols-3 items-center w-full select-none"
      >
        {/* Coluna 1: Título & Logo à Esquerda */}
        <div className="flex items-center gap-4 justify-start">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] shrink-0">
            <Rocket size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">
              INITIAL TOURNAMENT SETUP
            </h2>
            <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.3em] mt-1 italic">
              v19.14 SAPPHIRE DIAMOND • MOEDA: {tutorConfig.currency}
            </p>
          </div>
        </div>

        {/* Coluna 2: Indicador de Step Centralizado e Imponente no Meio */}
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/25 to-orange-500/10 border border-orange-500/50 px-6 py-1.5 rounded-2xl flex items-center gap-3.5 shadow-[0_0_25px_rgba(249,115,22,0.15)] transition-all hover:scale-105 duration-300">
            <span className="text-[10px] font-sans font-black text-orange-500 uppercase tracking-[0.2em]">
              PAINEL ATIVO
            </span>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-lg font-black text-white font-mono tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {step} <span className="text-orange-500/60 font-sans">/</span> {stepsCount}
            </span>
          </div>

          {/* Indicadores de Progresso (Barrinhas) Centralizados logo abaixo do painel ativo */}
          <div className="flex gap-1.5 items-center justify-center">
            {Array.from({ length: stepsCount }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === i + 1
                    ? "w-10 bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_12px_#f97316]"
                    : step > i + 1
                    ? "w-5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                    : "w-5 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Coluna 3: Navegação de Passo Bem à Direita */}
        <div className="flex items-center justify-end gap-4 translate-x-5">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="w-10 h-10 bg-emerald-500 border border-emerald-400 text-white disabled:bg-slate-950 disabled:border-white/5 disabled:text-slate-500 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-orange-500 hover:border-orange-400 active:scale-95 transition-all duration-300 flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              title="Recuar Passo"
            >
              <ChevronLeft size={18} />
            </button>

            {step === stepsCount ? (
              <button
                onClick={handleLaunch}
                disabled={isSubmitting}
                className="px-6 h-10 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 disabled:opacity-50 transition-all border border-red-500/40 font-sans"
                title="Iniciar Competição Agora"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Play size={14} className="fill-white text-white" />
                )}
                <span className="font-sans">{isSubmitting ? "PROCESSANDO..." : "INICIAR ARENA"}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (canGoNext) {
                    setStep((s) => Math.min(stepsCount, s + 1));
                  }
                }}
                disabled={!canGoNext}
                title={
                  !canGoNext
                    ? "O rateio do aluguel deve somar exatamente 100% para prosseguir."
                    : "Avançar Passo"
                }
                className={`w-10 h-10 border transition-all duration-300 flex items-center justify-center active:scale-95 rounded-lg ${
                  !canGoNext
                    ? "bg-slate-950 border-white/5 text-slate-500 opacity-20 cursor-not-allowed"
                    : "bg-emerald-500 border-emerald-400 text-white hover:bg-orange-500 hover:border-orange-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="wizard-content custom-scrollbar">
        <div className="max-w-full">
          <AnimatePresence mode="wait">
            {/* STEP 2: IDENTIDADE DO TORNEIO */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 pb-20"
              >
                <WizardStepTitle
                  icon={<Globe size={32} />}
                  title="2. IDENTIDADE DA COMPETIÇÃO"
                  desc="Configurações globais de identidade pedagógica externa."
                />
                <div className="flex flex-col gap-8 text-left">
                  {/* LINHA 1: Tutor, Faculdade, Torneio com limite de 20 caracteres */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <WizardField
                      label="NOME DO TUTOR / COORDENADOR"
                      val={tutorConfig.tutorName}
                      maxLength={20}
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, tutorName: v })
                      }
                      placeholder="Ex: PROF. CLAUDIO TONELLI"
                    />
                    <WizardField
                      label="NOME DA FACULDADE / ENTIDADE"
                      val={tutorConfig.institutionName}
                      maxLength={20}
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, institutionName: v })
                      }
                      placeholder="Ex: FGV / FDC"
                    />
                    <WizardField
                      label="NOME DO TORNEIO / ARENA"
                      val={tutorConfig.tournamentName}
                      maxLength={20}
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, tournamentName: v })
                      }
                      placeholder="Ex: COPA GLOBAL"
                    />
                  </div>

                  {/* LINHA 2: Segmento de Atuação (máx 20 carac), Moeda, Governança Tática, Identidade Gazeta com larguras otimizadas e simétricas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-end">
                    <WizardField
                      label="SEGMENTO DE ATUAÇÃO"
                      val={tutorConfig.segmentName}
                      maxLength={20}
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, segmentName: v })
                      }
                      placeholder="Ex: SEMICONDUTORES"
                    />
                    <WizardSelect
                      label="MOEDA PADRÃO"
                      val={tutorConfig.currency}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          currency: v as CurrencyType,
                        })
                      }
                      options={[
                        { v: "BRL", l: "BRL (R$)" },
                        { v: "USD", l: "USD ($)" },
                        { v: "GBP", l: "GBP (£)" },
                        { v: "EUR", l: "EUR (€)" },
                        { v: "CNY", l: "CNY (¥)" },
                        { v: "BTC", l: "BTC (₿)" },
                      ]}
                    />
                    <WizardSelect
                      label="GOVERNANÇA TÁTICA"
                      val={tutorConfig.transparency_level}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          transparency_level: v as any,
                        })
                      }
                      options={[
                        { v: "low", l: "SIGILOSA" },
                        { v: "medium", l: "MÉDIA" },
                        { v: "high", l: "ALTA" },
                        { v: "full", l: "OPEN DATA" },
                      ]}
                    />
                    <WizardSelect
                      label="IDENTIDADE DAS EQUIPES"
                      val={tutorConfig.gazeta_mode}
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, gazeta_mode: v as any })
                      }
                      options={[
                        { v: "anonymous", l: "ANÔNIMA" },
                        { v: "identified", l: "REVELADA" },
                      ]}
                    />
                  </div>

                  {/* LINHA 3: Rounds, Tempo Round, Unidade Tempo, Modelo Contábil / Setorial */}
                  <div className="grid grid-cols-1 md:grid-cols-[120px_120px_220px_1fr] gap-6 md:gap-8">
                    <WizardField
                      label="ROUNDS"
                      type="number"
                      val={tutorConfig.total_rounds}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          total_rounds: Math.min(
                            12,
                            Math.max(1, parseInt(v) || 0),
                          ),
                        })
                      }
                    />
                    <WizardField
                      label="TEMPO ROUND"
                      type="number"
                      val={1}
                      isLocked={true}
                      onChange={() => {}}
                    />
                    <div className="space-y-1.5 text-left group">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 italic">
                        UNIDADE TEMPO
                      </label>
                      <input
                        className="w-full bg-slate-950/40 border-2 border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 outline-none cursor-not-allowed font-mono"
                        value="HORAS"
                        readOnly
                      />
                    </div>
                    <WizardSelect
                      label="MODELO CONTÁBIL / SETORIAL"
                      val={tutorConfig.accounting_template_id}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          accounting_template_id: v,
                        })
                      }
                      options={SUPPORTED_ACCOUNTING_MODELS.map((m) => ({
                        v: m.id,
                        l: `${m.name} (${m.version})`,
                      }))}
                    />
                  </div>
                </div>

                {/* Configuração de Equipes de Lançamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-slate-900/45 p-8 rounded-[3rem] border border-white/5 shadow-xl mt-8">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
                      <Users size={16} className="text-orange-500" /> Equipes
                      Humanas ({humanTeamsCount})
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Decida quantos times de alunos participarão ativamente
                      dessa simulação cooperativa.
                    </p>
                    <div className="mt-4 flex gap-4 items-center">
                      <button
                        onClick={() =>
                          setHumanTeamsCount((h) => Math.max(1, h - 1))
                        }
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserMinus size={16} />
                      </button>
                      <span className="text-2xl font-black font-mono text-white px-4">
                        {humanTeamsCount}
                      </span>
                      <button
                        onClick={() =>
                          setHumanTeamsCount((h) => Math.min(10, h + 1))
                        }
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {teamNames.map((name, idx) => (
                        <input
                          key={idx}
                          value={name}
                          maxLength={20}
                          onChange={(e) => {
                            const next = [...teamNames];
                            next[idx] = e.target.value.toUpperCase();
                            setTeamNames(next);
                          }}
                          className="w-full max-w-[240px] bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white uppercase font-mono transition-all focus:border-orange-500/50 outline-none"
                          placeholder={`NOME TIME ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
                      <Bot size={16} className="text-blue-500" /> Competidores
                      Virtuais ({botsCount})
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Configure robôs inteligentes autônomos para concorrer no
                      faturamento regional.
                    </p>
                    <div className="mt-4 flex gap-4 items-center">
                      <button
                        onClick={() => setBotsCount((b) => Math.max(0, b - 1))}
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserMinus size={16} />
                      </button>
                      <span className="text-2xl font-black font-mono text-white px-4">
                        {botsCount}
                      </span>
                      <button
                        onClick={() => setBotsCount((b) => Math.min(5, b + 1))}
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl mt-4 text-[11px] text-slate-400 font-medium">
                      Os robôs assumem estratégias variadas (Conservadora,
                      Agressiva, Equilibrada, etc.) utilizando inteligência
                      gerada por IA no round.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: MODO DE INÍCIO & TEMPLATE */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-12 pb-20"
              >
                <WizardStepTitle
                  icon={<Library size={32} />}
                  title="1. MODO DE INÍCIO DA ARENA & TEMPLATES"
                  desc="Selecione o modelo pedagógico de entrada e gerencie templates corporativos."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  {/* Modo 1: Start from Zero */}
                  <div
                    id="card_start_from_zero"
                    onClick={() => handleModeChange("start_from_zero")}
                    className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col justify-between min-h-[385px] hover:scale-[1.02] relative overflow-hidden group ${tutorConfig.starting_mode === "start_from_zero" ? "bg-orange-600/15 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.25)]" : "bg-slate-950/40 border-white/5 hover:border-white/10"}`}
                  >
                    <div className="absolute right-6 top-6 text-[8px] font-mono tracking-widest text-orange-600/40 font-black">
                      GREENFIELD INDUSTRIAL
                    </div>
                    <div>
                      <div className="w-14 h-14 bg-orange-600/20 text-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                        <Award size={24} />
                      </div>
                      <h4 className="text-xl font-black text-white italic leading-none">
                        START FROM ZERO
                      </h4>
                      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                        Competições avançadas. Equipes iniciam puramente com
                        Capital Social em Caixa. Parque industrial de máquinas e
                        estoques começam 100% vazios.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Complexidade:</span>
                        <span className="text-orange-500 font-bold">
                          ★ ★ ★ ★ ★ (Máxima)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Liquidez P00:</span>
                        <span className="text-orange-300">
                          $10.0M (100% Caixa)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frota Máquinas:</span>
                        <span className="text-slate-400 font-semibold">
                          0 (Zero Absoluto)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fluxo R01:</span>
                        <span className="text-slate-400 font-medium font-semibold">
                          Instalar tudo do zero
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modo 2: Start with Base */}
                  <div
                    id="card_start_with_base"
                    onClick={() => handleModeChange("start_with_base")}
                    className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col justify-between min-h-[385px] hover:scale-[1.02] relative overflow-hidden group ${tutorConfig.starting_mode === "start_with_base" ? "bg-blue-600/15 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.25)]" : "bg-slate-950/40 border-white/5 hover:border-white/10"}`}
                  >
                    <div className="absolute right-6 top-6 text-[8px] font-mono tracking-widest text-blue-500/40 font-black">
                      PME ESTÁVEL
                    </div>
                    <div>
                      <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                        <Factory size={24} />
                      </div>
                      <h4 className="text-xl font-black text-white italic leading-none">
                        START WITH BASE
                      </h4>
                      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                        Estrutura de abertura tradicional. As equipes iniciam
                        com parque industrial básico operando, alguns insumos de
                        matérias-primas e colaboradores.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Complexidade:</span>
                        <span className="text-blue-500 font-bold">
                          ★ ★ ★ ☆ ☆ (Média)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Liquidez P00:</span>
                        <span className="text-blue-300">
                          $1.5M Caixa • Balanceado
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frota Máquinas:</span>
                        <span className="text-slate-400 font-semibold">
                          3 Alfas, 2 Betas ($6.0M)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fluxo P01:</span>
                        <span className="text-slate-400 font-medium font-semibold">
                          Contas e estoques básicos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modo 3: Start with Running Company */}
                  <div
                    id="card_start_with_running"
                    onClick={() => handleModeChange("start_with_running")}
                    className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col justify-between min-h-[385px] hover:scale-[1.02] relative overflow-hidden group ${tutorConfig.starting_mode === "start_with_running" ? "bg-emerald-600/15 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.25)]" : "bg-slate-950/40 border-white/5 hover:border-white/10"}`}
                  >
                    <div className="absolute right-6 top-6 text-[8px] font-mono tracking-widest text-emerald-500/40 font-black">
                      CORPORATIVE S.A.
                    </div>
                    <div>
                      <div className="w-14 h-14 bg-emerald-600/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                        <Activity size={24} />
                      </div>
                      <h4 className="text-xl font-black text-white italic leading-none">
                        RUNNING COMPANY
                      </h4>
                      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                        Operação de mercado plena. As equipes herdam passivos
                        pesados, recebíveis pendentes, estoques prontos e frota
                        depreciando em larga escala.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Complexidade:</span>
                        <span className="text-emerald-500 font-bold">
                          ★ ★ ☆ ☆ ☆ (Fácil)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Liquidez P00:</span>
                        <span className="text-emerald-300">
                          $2.1M (Contas complexas)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frota Máquinas:</span>
                        <span className="text-slate-400 font-semibold">
                          3 Alfas, 2 Betas ($8.5M)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fluxo R01:</span>
                        <span className="text-slate-400 font-medium font-semibold">
                          Demanda alta de manutenção
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 shadow-2xl text-left space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                      <FolderOpen size={18} className="text-orange-500" />{" "}
                      Carregar Preset ou Template
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                      Carregue cenários calibrados de fábrica ou configurações
                      salvas por você para inicializar instantaneamente a
                      economia desta arena.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* COLUNA ESQUERDA: TEMPLATES DE FÁBRICA */}
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] block border-b border-white/5 pb-1 italic">
                        Templates de Fábrica (Preservados)
                      </span>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {OFFICIAL_PRESETS.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-sky-500/30 transition-all"
                          >
                            <div className="text-left w-2/3">
                              <span className="block text-xs font-bold text-white uppercase truncate">
                                {t.name}
                              </span>
                              <span className="block text-[10px] text-slate-400 truncate mt-1">
                                {t.description}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPreviewTemplate({
                                  ...t,
                                  isPreset: true,
                                });
                              }}
                              className="px-4 py-2 bg-sky-600/80 hover:bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase transition-colors shrink-0"
                            >
                              Carregar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* COLUNA DIREITA: TEMPLATES DO USUÁRIO */}
                    <div className="space-y-4 md:border-l md:border-white/5 md:pl-8">
                      <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] block border-b border-white/5 pb-1 italic">
                        Templates do Usuário (Sincronizado)
                      </span>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {tplLoading ? (
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 py-2">
                            <Loader2 className="animate-spin" size={14} />{" "}
                            Sincronizando...
                          </div>
                        ) : savedTemplates.length === 0 ? (
                          <div className="text-[10px] text-slate-600 italic py-2">
                            Sem templates personalizados nas nuvens. Salve os
                            ajustes configurados no Step 8 (Preview) para vê-los
                            listados aqui!
                          </div>
                        ) : (
                          savedTemplates.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between p-3 bg-slate-950/80 border border-white/5 rounded-2xl hover:border-orange-500/30 transition-all"
                            >
                              <div className="text-left w-7/12">
                                <span className="block text-xs font-bold text-white uppercase truncate">
                                  {t.name}
                                </span>
                                <span className="block text-[10px] text-slate-500 truncate mt-1">
                                  {t.description || "Sem descrição informada."}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setSelectedPreviewTemplate({
                                      ...t,
                                      isPreset: false,
                                    })
                                  }
                                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase transition-all shrink-0"
                                >
                                  Carregar
                                </button>
                                <button
                                  onClick={() => handleDeleteTpl(t.id)}
                                  className="p-2 bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shrink-0"
                                  title="Excluir das nuvens"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MODAL DE PREVIEW E AUDITORIA DE TEMPLATE ANTES DE CARREGAR v19.22 */}
                  <AnimatePresence>
                    {selectedPreviewTemplate && (
                      <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedPreviewTemplate(null)}
                          className="absolute inset-0 bg-black/80 backdrop-blur-md"
                          id="preview_template_backdrop"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar text-left z-[610] space-y-8"
                          id="preview_template_modal"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-start border-b border-white/5 pb-6">
                            <div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider leading-none ${selectedPreviewTemplate.isPreset ? "bg-sky-500/20 text-sky-400" : "bg-orange-500/20 text-orange-400"}`}
                                >
                                  {selectedPreviewTemplate.isPreset
                                    ? "Template de Fábrica"
                                    : "Template Personalizado"}
                                </span>
                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider leading-none bg-white/5 text-slate-400 font-mono">
                                  {selectedPreviewTemplate.config
                                    ?.starting_mode === "start_from_zero"
                                    ? "GREENFIELD"
                                    : selectedPreviewTemplate.config
                                          ?.starting_mode === "start_with_base"
                                      ? "PME BASE"
                                      : "RUNNING S.A."}
                                </span>
                              </div>
                              <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mt-3">
                                {selectedPreviewTemplate.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                {selectedPreviewTemplate.description ||
                                  "Nenhuma descrição fornecida."}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedPreviewTemplate(null)}
                              className="p-3 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-2xl transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Informações detalhadas */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Lado Contábil e Regras */}
                            <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 space-y-4 shadow-inner font-sans">
                              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-2 font-sans">
                                Regras Contábeis da Arena
                              </h4>
                              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                                <div className="flex justify-between">
                                  <span>Moeda Exibição:</span>
                                  <span className="font-bold text-white uppercase">
                                    {selectedPreviewTemplate.config?.currency}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total de Rounds:</span>
                                  <span className="font-bold text-white">
                                    {
                                      selectedPreviewTemplate.config
                                        ?.total_rounds
                                    }{" "}
                                    rounds
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Duração Rounds:</span>
                                  <span className="font-bold text-white">
                                    {
                                      selectedPreviewTemplate.config
                                        ?.round_duration
                                    }{" "}
                                    horas
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Nível Transparência:</span>
                                  <span className="font-bold text-white uppercase">
                                    {translateTransparency(
                                      selectedPreviewTemplate.config
                                        ?.transparency_level,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Caixa e Recursos Iniciais */}
                            <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 space-y-4 shadow-inner font-sans">
                              <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic border-b border-white/5 pb-2 font-sans">
                                Capitais de Abertura
                              </h4>
                              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                                <div className="flex justify-between">
                                  <span>Capital Social:</span>
                                  <span className="font-bold text-white">
                                    {formatCurrency(
                                      selectedPreviewTemplate.config
                                        ?.capital_social || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Caixa Inicial:</span>
                                  <span className="font-bold text-white">
                                    {formatCurrency(
                                      selectedPreviewTemplate.config
                                        ?.caixa_inicial || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Aplicações Financ.:</span>
                                  <span className="font-bold text-white">
                                    {formatCurrency(
                                      selectedPreviewTemplate.config
                                        ?.financial_investments || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Estrutura Imóvel:</span>
                                  <span className="font-bold text-sky-400 uppercase">
                                    {selectedPreviewTemplate.config
                                      ?.building_mode === "owned"
                                      ? "Próprio"
                                      : "Locado (Alugado)"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Parque Industrial */}
                            <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 space-y-4 shadow-inner font-sans">
                              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic border-b border-white/5 pb-2 font-sans">
                                Parque de Ativos Físicos
                              </h4>
                              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                                <div className="flex justify-between">
                                  <span>Máquinas ALFA:</span>
                                  <span className="font-bold text-white">
                                    {selectedPreviewTemplate.config
                                      ?.machines?.[0]?.qty || 0}{" "}
                                    un (Eficiência{" "}
                                    {Math.round(
                                      (selectedPreviewTemplate.config
                                        ?.machines?.[0]?.efficiency || 1) * 100,
                                    )}
                                    %)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Máquinas BETA:</span>
                                  <span className="font-bold text-white">
                                    {selectedPreviewTemplate.config
                                      ?.machines?.[1]?.qty || 0}{" "}
                                    un (Eficiência{" "}
                                    {Math.round(
                                      (selectedPreviewTemplate.config
                                        ?.machines?.[1]?.efficiency || 1) * 100,
                                    )}
                                    %)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Máquinas GAMMA:</span>
                                  <span className="font-bold text-white">
                                    {selectedPreviewTemplate.config
                                      ?.machines?.[2]?.qty || 0}{" "}
                                    un
                                  </span>
                                </div>
                                <div className="flex justify-between text-purple-400">
                                  <span>Salário Base Operador:</span>
                                  <span className="font-bold">
                                    {formatCurrency(
                                      selectedPreviewTemplate.config?.workforce
                                        ?.baseSalary || 2500,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Praças de Venda e Estoques */}
                            <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 space-y-4 shadow-inner font-sans">
                              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic border-b border-white/5 pb-2 font-sans">
                                Praças e Estoque MPA/MPB
                              </h4>
                              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                                <div className="flex justify-between">
                                  <span>Praças Comerciais:</span>
                                  <span className="font-bold text-white">
                                    {selectedPreviewTemplate.config?.regions
                                      ?.length || 0}{" "}
                                    regiões
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Estoque MP Alfa:</span>
                                  <span className="font-bold text-white">
                                    {(
                                      selectedPreviewTemplate.config
                                        ?.inventories?.mpa_qty || 0
                                    ).toLocaleString("pt-BR")}{" "}
                                    un
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Estoque MP Beta:</span>
                                  <span className="font-bold text-white">
                                    {(
                                      selectedPreviewTemplate.config
                                        ?.inventories?.mpb_qty || 0
                                    ).toLocaleString("pt-BR")}{" "}
                                    un
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Estoque Ready PA:</span>
                                  <span className="font-bold text-white">
                                    {(
                                      selectedPreviewTemplate.config
                                        ?.inventories?.finished_qty || 0
                                    ).toLocaleString("pt-BR")}{" "}
                                    un
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* PAINEL DE PREVIEW DE BALANÇO PROJETADO */}
                          {previewFinancials && (
                            <div className="p-6 bg-slate-950/90 rounded-[2rem] border-2 border-orange-500/20 space-y-4 font-sans">
                              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] italic border-b border-white/5 pb-2 flex items-center gap-2 font-sans">
                                <BarChart3
                                  size={14}
                                  className="text-orange-500 animate-pulse"
                                />{" "}
                                Balanço de Abertura Estimado (P00 Calculado)
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-slate-500 uppercase font-sans">
                                    ATIVO TOTAL
                                  </span>
                                  <span className="block text-xs font-black text-white mt-1">
                                    {formatCurrency(
                                      previewFinancials.balance_sheet?.find(
                                        (n: any) => n.id === "assets",
                                      )?.value || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-slate-500 uppercase font-sans">
                                    PATR. LÍQUIDO
                                  </span>
                                  <span className="block text-xs font-black text-emerald-400 mt-1">
                                    {formatCurrency(
                                      previewFinancials.balance_sheet?.find(
                                        (n: any) =>
                                          n.id === "equity" ||
                                          n.id === "equity_group",
                                      )?.value ||
                                        (previewFinancials.balance_sheet?.find(
                                          (n: any) => n.id === "assets",
                                        )?.value ?? 10000000) -
                                          (previewFinancials.balance_sheet?.find(
                                            (n: any) => n.id === "liabilities",
                                          )?.value ?? 0),
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-slate-500 uppercase font-sans">
                                    DISPONIBILIDADES
                                  </span>
                                  <span className="block text-xs font-black text-white mt-1">
                                    {formatCurrency(
                                      previewFinancials.balance_sheet?.find(
                                        (n: any) =>
                                          n.id === "assets.current.cash",
                                      )?.value || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                  <span className="text-[9px] text-slate-500 uppercase font-sans">
                                    IMOBILIZADO NET
                                  </span>
                                  <span className="block text-xs font-black text-pink-400 mt-1">
                                    {formatCurrency(
                                      previewFinancials.balance_sheet?.find(
                                        (n: any) =>
                                          n.id === "assets.noncurrent.fixed",
                                      )?.value || 0,
                                      selectedPreviewTemplate.config?.currency,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Dica Contábil do Modo */}
                          <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex items-center gap-4 text-xs text-slate-400 font-sans">
                            <Info
                              size={24}
                              className="text-orange-500 shrink-0"
                            />
                            <p>
                              {selectedPreviewTemplate.config?.starting_mode ===
                              "start_from_zero"
                                ? "Este cenário é do tipo Greenfield Purista (Começo do Zero). Ele exige dos times alto foco em investimentos de infraestrutura no primeiro round (compra de máquinas, contratação total de operadores, estruturação fabril)."
                                : selectedPreviewTemplate.config
                                      ?.starting_mode === "start_with_base"
                                  ? "Este cenário começa com infraestrutura de Base Ativa (PME). É recomendado para simulações acadêmicas clássicas onde o foco inicial é calibrar marketing, produção de matéria prima imediata e vendas nas praças."
                                  : "Cenário Running Company (Operação Plena). As empresas já iniciam maduras, de grande porte, contendo estoques elevados de produtos acabados, contas comerciais em andamento e obrigações passadas que precisarão ser liquidadas."}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button
                              onClick={() => setSelectedPreviewTemplate(null)}
                              className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all"
                            >
                              Cancelar Revisão
                            </button>
                            <button
                              onClick={() => {
                                const parsedConfig = JSON.parse(
                                  JSON.stringify(
                                    selectedPreviewTemplate.config,
                                  ),
                                );
                                setTutorConfig(parsedConfig);
                                if (parsedConfig) {
                                  const loadedChrono = parsedConfig.round_rules || parsedConfig.DEFAULT_INDUSTRIAL_CHRONOGRAM || DEFAULT_INDUSTRIAL_CHRONOGRAM;
                                  setRoundRules(loadedChrono);

                                  if (typeof parsedConfig.humanTeamsCount === 'number') {
                                    setHumanTeamsCount(parsedConfig.humanTeamsCount);
                                  }
                                  if (Array.isArray(parsedConfig.teamNames)) {
                                    setTeamNames(parsedConfig.teamNames);
                                  }
                                  if (typeof parsedConfig.botsCount === 'number') {
                                    setBotsCount(parsedConfig.botsCount);
                                  }
                                }
                                setSelectedPreviewTemplate(null);
                                alert(
                                  `Template "${selectedPreviewTemplate.name}" carregado com soberania contábil!`,
                                );
                              }}
                              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                            >
                              <FolderOpen size={12} /> Confirmar & Carregar
                              Template
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIGURAÇÃO DO PARQUE INDUSTRIAL */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 pb-20"
              >
                <WizardStepTitle
                  icon={<Cpu size={32} />}
                  title="3. PARQUE INDUSTRIAL & ENGENHARIA"
                  desc="Dimensione e configure a frota produtiva de máquinas e idade depreciativa."
                />

                {tutorConfig.starting_mode === "start_from_zero" && (
                  <div className="p-8 bg-orange-600/10 border border-orange-500/30 rounded-[3rem] flex items-center gap-6 shadow-2xl text-left">
                    <div className="w-16 h-16 bg-orange-600/20 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                      <Award size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic tracking-tight uppercase">
                        MODO GREENFIELD ATIVO — PLANTA INICIADA DO ABSOLUTO ZERO
                        ($0.00)
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 font-medium font-sans">
                        A simulação está configurada como{" "}
                        <strong>START FROM ZERO</strong>. A frota produtiva
                        inicia zerada no Round 0, impedindo custos de
                        depreciação ou manutenção inicial fantasmas. As
                        máquinas, idades e parâmetros de engenharia abaixo foram
                        desativados e travados fiduciariamente. Os
                        alunos/equipes deverão comprar, alavancar e instalar
                        suas próprias máquinas no <strong>Round 1</strong> como
                        primeira ação estrutural de fomento!
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-in fade-in slide-in-from-bottom-5 duration-300">
                  {/* Config Máquina Alpha */}
                  <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 space-y-8 hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center font-black text-lg text-white font-sans uppercase">
                        A
                      </span>
                      <div>
                        <h4 className="text-xl font-black text-white italic leading-none text-left">
                          MÁQUINA ALPHA
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono text-left block mt-1">
                          Acquisição: $500k • Cap: 2K un
                        </span>
                      </div>
                    </div>
                    <WizardField
                      label="QUANTIDADE INICIAL EM FROTA"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[0].qty
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].qty = Math.max(0, parseInt(v) || 0);
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="IDADE INICIAL (ANOS)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[0].age
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].age = Math.min(
                          25,
                          Math.max(0, parseInt(v) || 0),
                        );
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="EFICIÊNCIA MOTOR (%)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 100
                          : Math.round(tutorConfig.machines[0].efficiency * 100)
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].efficiency =
                          Math.min(100, Math.max(0, parseFloat(v) || 0)) / 100;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="INVESTIMENTO INSTALAÇÃO ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[0].installation_cost ?? 150000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].installation_cost = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="VALOR DA MÁQUINA ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[0].price ?? 500000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].price = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="CAPACIDADE PRODUTIVA A 100%"
                      type="number"
                      isLocked={false}
                      val={
                        tutorConfig.machines[0].capacity_at_100 ?? 2000
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[0].capacity_at_100 = parseInt(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                  </div>

                  {/* Config Máquina Beta */}
                  <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 space-y-8 hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg text-white font-sans uppercase">
                        B
                      </span>
                      <div>
                        <h4 className="text-xl font-black text-white italic leading-none text-left">
                          MÁQUINA BETA
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono text-left block mt-1">
                          Acquisição: $1.5M • Cap: 6K un
                        </span>
                      </div>
                    </div>
                    <WizardField
                      label="QUANTIDADE INICIAL EM FROTA"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[1].qty
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].qty = Math.max(0, parseInt(v) || 0);
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="IDADE INICIAL (ANOS)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[1].age
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].age = Math.min(
                          25,
                          Math.max(0, parseInt(v) || 0),
                        );
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="EFICIÊNCIA MOTOR (%)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 100
                          : Math.round(tutorConfig.machines[1].efficiency * 100)
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].efficiency =
                          Math.min(100, Math.max(0, parseFloat(v) || 0)) / 100;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="INVESTIMENTO INSTALAÇÃO ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[1].installation_cost ?? 600000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].installation_cost = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="VALOR DA MÁQUINA ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[1].price ?? 1500000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].price = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="CAPACIDADE PRODUTIVA A 100%"
                      type="number"
                      isLocked={false}
                      val={
                        tutorConfig.machines[1].capacity_at_100 ?? 7000
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[1].capacity_at_100 = parseInt(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                  </div>

                  {/* Config Máquina Gamma */}
                  <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 space-y-8 hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <span className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-lg text-white font-sans uppercase">
                        G
                      </span>
                      <div>
                        <h4 className="text-xl font-black text-white italic leading-none text-left">
                          MÁQUINA GAMMA
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono text-left block mt-1">
                          Acquisição: $3.0M • Cap: 12K un
                        </span>
                      </div>
                    </div>
                    <WizardField
                      label="QUANTIDADE INICIAL IN FROTA"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[2].qty
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].qty = Math.max(0, parseInt(v) || 0);
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="IDADE INICIAL (ANOS)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.machines[2].age
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].age = Math.min(
                          25,
                          Math.max(0, parseInt(v) || 0),
                        );
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="EFICIÊNCIA MOTOR (%)"
                      type="number"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 100
                          : Math.round(tutorConfig.machines[2].efficiency * 100)
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].efficiency =
                          Math.min(100, Math.max(0, parseFloat(v) || 0)) / 100;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="INVESTIMENTO INSTALAÇÃO ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[2].installation_cost ?? 1500000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].installation_cost = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="VALOR DA MÁQUINA ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      isLocked={false}
                      val={
                        tutorConfig.machines[2].price ?? 3000000.0
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].price = parseFloat(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                    <WizardField
                      label="CAPACIDADE PRODUTIVA A 100%"
                      type="number"
                      isLocked={false}
                      val={
                        tutorConfig.machines[2].capacity_at_100 ?? 15000
                      }
                      onChange={(v: any) => {
                        const mac = [...tutorConfig.machines];
                        mac[2].capacity_at_100 = parseInt(v) || 0;
                        setTutorConfig({ ...tutorConfig, machines: mac });
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: MÃO DE OBRA INICIAL (Passo 4 separado e expandido!) */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 pb-20"
              >
                <WizardStepTitle
                  icon={<Users size={32} />}
                  title="4. QUADRO DE COLABORADORES & RH"
                  desc="Ajuste o dimensionamento do quadro fabril e os fatores de retenção de talentos."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  <WizardField
                    label="OPERADORES POR MÁG. ALPHA"
                    type="number"
                    val={tutorConfig.workforce.operatorsPerAlpha}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          operatorsPerAlpha: parseInt(v) || 0,
                        },
                      })
                    }
                  />
                  <WizardField
                    label="OPERADORES POR MÁG. BETA"
                    type="number"
                    val={tutorConfig.workforce.operatorsPerBeta}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          operatorsPerBeta: parseInt(v) || 0,
                        },
                      })
                    }
                  />
                  <WizardField
                    label="OPERADORES POR MÁG. GAMMA"
                    type="number"
                    val={tutorConfig.workforce.operatorsPerGamma}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          operatorsPerGamma: parseInt(v) || 0,
                        },
                      })
                    }
                  />

                  <WizardField
                    label="SALÁRIO BASE RECRUTA ($)"
                    type="currency"
                    currency={tutorConfig.currency}
                    val={tutorConfig.workforce.baseSalary}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: { ...tutorConfig.workforce, baseSalary: v },
                      })
                    }
                  />
                  <WizardSelect
                    label="NÍVEL DE TREINAMENTO INICIAL"
                    val={tutorConfig.workforce.trainingLevel}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          trainingLevel: parseInt(v),
                        },
                      })
                    }
                    options={[
                      { v: "1", l: "NÍVEL 1 (BÁSICO)" },
                      { v: "2", l: "NÍVEL 2 (OPERACIONAL)" },
                      { v: "3", l: "NÍVEL 3 (ESPECIALIZADO)" },
                      { v: "4", l: "NÍVEL 4 (MASTER)" },
                      { v: "5", l: "NÍVEL 5 (ORACLE ENGINE)" },
                    ]}
                  />

                  <WizardField
                    label="JORNADA MOD / TURNO (EM HORAS POR ROUND JOGADO)"
                    type="number"
                    val={tutorConfig.workforce.production_hours_period ?? 176}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          production_hours_period: parseInt(v) || 0,
                        },
                      })
                    }
                  />
                  <WizardSelect
                    label="MÁXIMO DE TURNOS PERMITIDOS"
                    val={tutorConfig.workforce.max_shifts ?? 1}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          max_shifts: parseInt(v) || 1,
                        },
                      })
                    }
                    options={[
                      { v: "1", l: "1 TURNO (REGULAMENTO)" },
                      { v: "2", l: "MÁXIMO DE 2 TURNOS" },
                      { v: "3", l: "MÁXIMO DE 3 TURNOS" },
                    ]}
                  />

                  <WizardField
                    label="QTDE. COLABORADORES ADMINISTRAÇÃO"
                    type="number"
                    val={tutorConfig.workforce.admin_count ?? 10}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          admin_count: parseInt(v) || 0,
                        },
                      })
                    }
                  />
                  <WizardField
                    label="QTDE. COLABORADORES VENDAS"
                    type="number"
                    val={tutorConfig.workforce.sales_count ?? 10}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          sales_count: parseInt(v) || 0,
                        },
                      })
                    }
                  />
                  <WizardField
                    label="MULTIPLICADOR DO SALÁRIO-BASE"
                    type="number"
                    val={tutorConfig.workforce.salary_multiplier ?? 1.5}
                    onChange={(v: any) =>
                      setTutorConfig({
                        ...tutorConfig,
                        workforce: {
                          ...tutorConfig.workforce,
                          salary_multiplier: parseFloat(v) || 0,
                        },
                      })
                    }
                  />

                  {/* Resumos de RH */}
                  <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-center shadow-xl">
                    <span className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      Demanda Teórica do Turno
                    </span>
                    <span className="text-3xl font-mono font-black text-white mt-1">
                      {tutorConfig.machines[0].qty *
                        tutorConfig.workforce.operatorsPerAlpha +
                        tutorConfig.machines[1].qty *
                          tutorConfig.workforce.operatorsPerBeta +
                        tutorConfig.machines[2].qty *
                          tutorConfig.workforce.operatorsPerGamma}{" "}
                      Colaboradores
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: CONFIGURAÇÃO DE MERCADOS E REGIÕES */}
            {step === 5 && (
              <motion.div
                key="s5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 pb-20"
              >
                <WizardStepTitle
                  icon={<MapPin size={32} />}
                  title="5. MERCADOS COMERCIAIS E PREÇOS"
                  desc="Defina a segmentação de mercados, pricing base e custos logísticos de fretes."
                />
                <div className="space-y-10">
                  <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[3rem] border border-white/10 shadow-xl text-left">
                    <h4 className="text-xl font-black text-white uppercase italic">
                      Configuração de Regiões de Venda
                    </h4>
                    <button
                      onClick={() => {
                        const nextId = tutorConfig.regions.length + 1;
                        const reg = [
                          ...tutorConfig.regions,
                          {
                            id: nextId,
                            name: `Região 0${nextId}`,
                            currency: "BRL" as CurrencyType,
                            demand_weight: 15,
                            suggested_price: 425.0,
                            distribution_cost: 50.0,
                            marketing_cost: 10000.0,
                          },
                        ];
                        setTutorConfig({ ...tutorConfig, regions: reg });
                      }}
                      className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all flex items-center gap-2 shadow-xl active:scale-95 animate-pulse"
                    >
                      <Plus size={16} /> Adicionar Praça
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {tutorConfig.regions.map((r, i) => (
                      <div
                        key={i}
                        className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] space-y-6 group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden"
                      >
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">
                            Nome da Região Comercial
                          </label>
                          <input
                            value={r.name}
                            onChange={(e) => {
                              const reg = [...tutorConfig.regions];
                              reg[i].name = e.target.value.toUpperCase();
                              setTutorConfig({ ...tutorConfig, regions: reg });
                            }}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-black uppercase italic outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">
                              Moeda Transacional
                            </label>
                            <select
                              value={r.currency}
                              onChange={(e) => {
                                const reg = [...tutorConfig.regions];
                                reg[i].currency = e.target
                                  .value as CurrencyType;
                                setTutorConfig({
                                  ...tutorConfig,
                                  regions: reg,
                                });
                              }}
                              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-[10px] font-black text-white uppercase outline-none"
                            >
                              <option value="BRL">BRL</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="CNY">CNY</option>
                              <option value="BTC">BTC</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">
                              Peso Demanda (%)
                            </label>
                            <input
                              type="number"
                              value={r.demand_weight}
                              onChange={(e) => {
                                const reg = [...tutorConfig.regions];
                                reg[i].demand_weight =
                                  parseInt(e.target.value) || 0;
                                setTutorConfig({
                                  ...tutorConfig,
                                  regions: reg,
                                });
                              }}
                              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-center text-lg font-mono font-black text-orange-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/5">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-500 uppercase">
                              Preço Venda Sugerido
                            </label>
                            <input
                              type="number"
                              value={r.suggested_price}
                              onChange={(e) => {
                                const reg = [...tutorConfig.regions];
                                reg[i].suggested_price =
                                  parseFloat(e.target.value) || 0;
                                setTutorConfig({
                                  ...tutorConfig,
                                  regions: reg,
                                });
                              }}
                              className="w-full p-2 bg-slate-950 border border-white/5 rounded-xl text-center text-xs font-mono font-bold text-white hover:border-orange-500 focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-500 uppercase">
                              Frete Unitário ($)
                            </label>
                            <input
                              type="number"
                              value={r.distribution_cost}
                              onChange={(e) => {
                                const reg = [...tutorConfig.regions];
                                reg[i].distribution_cost =
                                  parseFloat(e.target.value) || 0;
                                setTutorConfig({
                                  ...tutorConfig,
                                  regions: reg,
                                });
                              }}
                              className="w-full p-2 bg-slate-950 border border-white/5 rounded-xl text-center text-xs font-mono font-bold text-white hover:border-orange-500 focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-500 uppercase">
                              Marketing ($/reg)
                            </label>
                            <input
                              type="number"
                              value={r.marketing_cost}
                              onChange={(e) => {
                                const reg = [...tutorConfig.regions];
                                reg[i].marketing_cost =
                                  parseFloat(e.target.value) || 0;
                                setTutorConfig({
                                  ...tutorConfig,
                                  regions: reg,
                                });
                              }}
                              className="w-full p-2 bg-slate-950 border border-white/5 rounded-xl text-center text-xs font-mono font-bold text-white hover:border-orange-500 focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>
                        {tutorConfig.regions.length > 1 && (
                          <button
                            onClick={() => {
                              const reg = tutorConfig.regions.filter(
                                (_, idx) => idx !== i,
                              );
                              setTutorConfig({ ...tutorConfig, regions: reg });
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-700 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: CONFIGURAÇÃO FINANCEIRA INICIAL */}
            {step === 6 && (
              <motion.div
                key="s5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12 pb-24"
              >
                <WizardStepTitle
                  icon={<Landmark size={32} />}
                  title="6. EQUILÍBRIO FINANCEIRO INICIAL"
                  desc="Regule as contas contábeis de liquidez e política de fomento à acionistas."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 text-left animate-in fade-in zoom-in-95 duration-200">
                  {/* LIQUIDEZ E CAPITAL */}
                  <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                      Capitalização de Entrada
                    </h4>
                    <WizardField
                      label="CAPITAL SOCIAL FIDUCIÁRIO ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      val={tutorConfig.capital_social}
                      onChange={(v: any) => {
                        const valNum = parseFloat(v) || 0;
                        if (tutorConfig.starting_mode === "start_from_zero") {
                          setTutorConfig({
                            ...tutorConfig,
                            capital_social: valNum,
                            caixa_inicial: valNum,
                          });
                        } else {
                          setTutorConfig({
                            ...tutorConfig,
                            capital_social: valNum,
                          });
                        }
                      }}
                    />
                    <WizardField
                      label="CAIXA / BANCO INICIAL ($)"
                      type="currency"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      currency={tutorConfig.currency}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? tutorConfig.capital_social
                          : tutorConfig.caixa_inicial
                      }
                      onChange={(v: any) =>
                        setTutorConfig({ ...tutorConfig, caixa_inicial: v })
                      }
                    />
                    <WizardField
                      label="APLICAÇÕES FINANCEIRAS ($)"
                      type="currency"
                      isLocked={tutorConfig.starting_mode === "start_from_zero"}
                      currency={tutorConfig.currency}
                      val={
                        tutorConfig.starting_mode === "start_from_zero"
                          ? 0
                          : tutorConfig.financial_investments
                      }
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          financial_investments: v,
                        })
                      }
                    />
                  </div>

                  {/* VALOR DE MATÉRIA PRIMA */}
                  <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                      Carga De Estoques P0
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="QTD MP-A"
                        type="number"
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                        val={
                          tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.mpa_qty
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              mpa_qty: parseInt(v) || 0,
                            },
                          })
                        }
                      />
                      <WizardField
                        label="PREÇO UN MPA"
                        type="number"
                        isLocked={false}
                        val={
                          tutorConfig.inventories.mpa_unit_val
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              mpa_unit_val: parseFloat(v) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="QTD MP-B"
                        type="number"
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                        val={
                          tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.mpb_qty
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              mpb_qty: parseInt(v) || 0,
                            },
                          })
                        }
                      />
                      <WizardField
                        label="PREÇO UN MPB"
                        type="number"
                        isLocked={false}
                        val={
                          tutorConfig.inventories.mpb_unit_val
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              mpb_unit_val: parseFloat(v) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="PA ACABADO"
                        type="number"
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                        val={
                          tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.finished_qty
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              finished_qty: parseInt(v) || 0,
                            },
                          })
                        }
                      />
                      <WizardField
                        label="CUSTO UN PA"
                        type="number"
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                        val={
                          tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.finished_unit_val
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            inventories: {
                              ...tutorConfig.inventories,
                              finished_unit_val: parseFloat(v) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* ACIONISTAS E TRIBUTÁRIOS */}
                  <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                      Acionistas & IPO
                    </h4>
                    <WizardField
                      label="PREÇO DA AÇÃO INICIAL ($)"
                      type="currency"
                      currency={tutorConfig.currency}
                      val={tutorConfig.share_price_initial}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          share_price_initial: v,
                        })
                      }
                    />
                    <WizardField
                      label="DISTRIBUIÇÃO DIVIDENDOS (%)"
                      type="number"
                      val={tutorConfig.dividend_percent}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          dividend_percent: parseFloat(v) || 0,
                        })
                      }
                    />
                    <WizardSelect
                      label="PAGAR DIVIDENDOS A CADA"
                      val={tutorConfig.dividend_frequency}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          dividend_frequency: parseInt(v),
                        })
                      }
                      options={[
                        { v: "1", l: "TODOS ROUNDS" },
                        { v: "2", l: "A CADA 2 ROUNDS" },
                        { v: "4", l: "A CADA 4 ROUNDS" },
                      ]}
                    />
                    <WizardSelect
                      label="INCORPORAR LUCRO/PREJUÍZO NO CAPITAL SOCIAL"
                      val={tutorConfig.profit_incorporation_frequency ?? 1}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          profit_incorporation_frequency: parseInt(v),
                        })
                      }
                      options={[
                        { v: "1", l: "TODOS ROUNDS" },
                        { v: "2", l: "A CADA 2 ROUNDS" },
                        { v: "4", l: "A CADA 4 ROUNDS" },
                      ]}
                    />
                    <WizardField
                      label="TAXA DEPRECIAÇÃO INSTALAÇÕES (% a.a.)"
                      type="number"
                      val={tutorConfig.buildings_depreciation_rate ?? 5}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          buildings_depreciation_rate: parseFloat(v) || 0,
                        })
                      }
                    />
                    <WizardField
                      label="TAXA DEPRECIAÇÃO IMÓVEL (% a.a.)"
                      type="number"
                      val={tutorConfig.property_depreciation_rate ?? 5}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          property_depreciation_rate: parseFloat(v) || 0,
                        })
                      }
                    />
                    <WizardField
                      label="TAXA DEPRECIAÇÃO MÁQUINAS (% a.a.)"
                      type="number"
                      val={tutorConfig.machines_depreciation_rate ?? 5}
                      onChange={(v: any) =>
                        setTutorConfig({
                          ...tutorConfig,
                          machines_depreciation_rate: parseFloat(v) || 0,
                        })
                      }
                    />
                  </div>

                  {/* CONTAS PATRIMONIAIS RETROATIVAS (CLIENTES, FORNECEDORES, WIP) */}
                  <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                    <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                      Ajustes Retroativos (Clientes/Fornecedores/WIP)
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="Clientes ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.clients_initial ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 300000.0
                              : 2092193.0)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            clients_initial: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                      <WizardField
                        label="PECLD ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.custom_pecld_val ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 4500.0
                              : 18529.46)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            custom_pecld_val: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="Fornecedores ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.suppliers_initial ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 100000.0
                              : 717605.0)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            suppliers_initial: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                      <WizardField
                        label="Impostos ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.taxes_initial ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 15000.0
                              : 14871.31)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            taxes_initial: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <WizardField
                        label="Dividendos ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.dividends_initial ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 5000.0
                              : 11153.49)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            dividends_initial: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                      <WizardField
                        label="Estoque WIP ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={
                          tutorConfig.wip_stock_value ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.starting_mode === "start_with_base"
                              ? 50000.0
                              : 500000.0)
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            wip_stock_value: parseFloat(v) || 0,
                          })
                        }
                        isLocked={
                          tutorConfig.starting_mode === "start_from_zero"
                        }
                      />
                    </div>
                  </div>

                  {/* SEÇÃO IMOBILIÁRIA E BENFEITORIAS DE SETUP (v19.16) */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl relative space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic">
                          Regime de Imobilizado & Benfeitorias
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure o espaço físico de abertura (Edifícios,
                          Terrenos, Benfeitorias e a estratégia de financiamento
                          contábil).
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400">
                          MODO ATUAL:
                        </span>
                        <span className="text-xs font-bold px-4 py-2 bg-white/5 text-white border border-white/10 rounded-full font-mono">
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? "START FROM ZERO"
                            : tutorConfig.starting_mode === "start_with_base"
                              ? "START WITH BASE"
                              : "RUNNING COMPANY"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <WizardSelect
                        label="Tipo de Estabelecimento (Prédio)"
                        val={
                          tutorConfig.building_mode ??
                          (tutorConfig.starting_mode === "start_from_zero"
                            ? "rented"
                            : "owned")
                        }
                        onChange={(v: any) =>
                          setTutorConfig({ ...tutorConfig, building_mode: v })
                        }
                        options={[
                          { v: "rented", l: "Locado (Alugado)" },
                          { v: "owned", l: "Próprio (Integralizado)" },
                        ]}
                      />

                      <WizardSelect
                        label="Método de Funding (Origem Contábil)"
                        val={
                          tutorConfig.real_estate_acquisition_funding ??
                          "capital"
                        }
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            real_estate_acquisition_funding: v,
                          })
                        }
                        options={[
                          {
                            v: "capital",
                            l: "Capital Próprio (Capital Social)",
                          },
                          { v: "debt", l: "Obrigações de Longo Prazo" },
                        ]}
                        isLocked={
                          (tutorConfig.building_mode ??
                            (tutorConfig.starting_mode === "start_from_zero"
                              ? "rented"
                              : "owned")) === "rented"
                        }
                      />

                      <WizardField
                        label="Instalações Admin/Vendas ($)"
                        type="currency"
                        currency={tutorConfig.currency}
                        val={tutorConfig.admin_sales_installations ?? 0}
                        onChange={(v: any) =>
                          setTutorConfig({
                            ...tutorConfig,
                            admin_sales_installations: parseFloat(v) || 0,
                          })
                        }
                      />

                      <WizardField
                        label="Instalações Industriais (Fábrica)"
                        type="currency"
                        currency={tutorConfig.currency}
                        isLocked={true}
                        val={fiduciaryMetrics.installationsMachinesVal}
                        onChange={() => {}}
                      />

                      {tutorConfig.building_mode === "owned" ? (
                        <>
                          <WizardField
                            label="Valor do Prédio ($)"
                            type="currency"
                            currency={tutorConfig.currency}
                            val={
                              tutorConfig.building_value ??
                              (tutorConfig.starting_mode === "start_from_zero"
                                ? 2000000.0
                                : tutorConfig.starting_mode ===
                                    "start_with_base"
                                  ? 2000000.0
                                  : 5440000.0)
                            }
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                building_value: v,
                              })
                            }
                          />
                          <WizardField
                            label="Valor do Terreno ($)"
                            type="currency"
                            currency={tutorConfig.currency}
                            val={
                              tutorConfig.land_value ??
                              (tutorConfig.starting_mode === "start_from_zero"
                                ? 10000000.0
                                : tutorConfig.starting_mode ===
                                    "start_with_base"
                                  ? 10000000.0
                                  : 1200000.0)
                            }
                            onChange={(v: any) =>
                              setTutorConfig({ ...tutorConfig, land_value: v })
                            }
                          />
                          <WizardField
                            label="Idade do Imóvel (Anos)"
                            type="number"
                            val={
                              tutorConfig.building_age ??
                              (tutorConfig.starting_mode === "start_from_zero"
                                ? 0
                                : tutorConfig.starting_mode ===
                                    "start_with_base"
                                  ? 2
                                  : 10)
                            }
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                building_age: parseInt(v) || 0,
                              })
                            }
                          />
                        </>
                      ) : (
                        <>
                          <WizardField
                            label="Aluguel Mensal ($)"
                            type="currency"
                            currency={tutorConfig.currency}
                            val={tutorConfig.monthly_rent_value ?? 50000.0}
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                monthly_rent_value: v,
                              })
                            }
                          />
                          <WizardField
                            label="Rateio Aluguel (CIF Produção) (%)"
                            type="number"
                            val={tutorConfig.rent_allocation_productive ?? 70}
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                rent_allocation_productive: parseInt(v) || 0,
                              })
                            }
                          />
                          <WizardField
                            label="Rateio Aluguel (Administração) (%)"
                            type="number"
                            val={
                              tutorConfig.rent_allocation_administrative ?? 20
                            }
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                rent_allocation_administrative:
                                  parseInt(v) || 0,
                              })
                            }
                          />
                          <WizardField
                            label="Rateio Aluguel (Vendas) (%)"
                            type="number"
                            val={tutorConfig.rent_allocation_sales ?? 10}
                            onChange={(v: any) =>
                              setTutorConfig({
                                ...tutorConfig,
                                rent_allocation_sales: parseInt(v) || 0,
                              })
                            }
                          />
                        </>
                      )}
                    </div>

                    {tutorConfig.building_mode === "rented" && (
                      <div
                        className={`mt-8 p-6 rounded-[2rem] border transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 ${
                          (tutorConfig.rent_allocation_productive ?? 70) +
                            (tutorConfig.rent_allocation_administrative ?? 20) +
                            (tutorConfig.rent_allocation_sales ?? 10) ===
                          100
                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)] text-emerald-300"
                            : "bg-rose-500/5 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.05)] text-rose-300 animate-pulse"
                        }`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div
                            className={`p-3 rounded-2xl ${
                              (tutorConfig.rent_allocation_productive ?? 70) +
                                (tutorConfig.rent_allocation_administrative ??
                                  20) +
                                (tutorConfig.rent_allocation_sales ?? 10) ===
                              100
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {(tutorConfig.rent_allocation_productive ?? 70) +
                              (tutorConfig.rent_allocation_administrative ??
                                20) +
                              (tutorConfig.rent_allocation_sales ?? 10) ===
                            100 ? (
                              <CheckCircle2 size={24} />
                            ) : (
                              <ShieldAlert size={24} />
                            )}
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                              Soma dos Percentuais de Custeio por Absorção
                            </span>
                            <span className="text-sm font-black text-white font-mono">
                              Produtivo:{" "}
                              <span className="text-emerald-400">
                                {tutorConfig.rent_allocation_productive ?? 70}%
                              </span>{" "}
                              + Adm:{" "}
                              <span className="text-sky-400">
                                {tutorConfig.rent_allocation_administrative ??
                                  20}
                                %
                              </span>{" "}
                              + Vendas:{" "}
                              <span className="text-indigo-400">
                                {tutorConfig.rent_allocation_sales ?? 10}%
                              </span>{" "}
                              ={" "}
                              <span
                                className={
                                  (tutorConfig.rent_allocation_productive ??
                                    70) +
                                    (tutorConfig.rent_allocation_administrative ??
                                      20) +
                                    (tutorConfig.rent_allocation_sales ??
                                      10) ===
                                  100
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }
                              >
                                {(tutorConfig.rent_allocation_productive ??
                                  70) +
                                  (tutorConfig.rent_allocation_administrative ??
                                    20) +
                                  (tutorConfig.rent_allocation_sales ?? 10)}
                                %
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 md:max-w-md text-left md:text-right">
                          {(tutorConfig.rent_allocation_productive ?? 70) +
                            (tutorConfig.rent_allocation_administrative ?? 20) +
                            (tutorConfig.rent_allocation_sales ?? 10) ===
                          100 ? (
                            <span className="text-emerald-400 font-bold">
                              ✓ Conformidade confirmada (Soma de 100%). O
                              progresso está desbloqueado para o passo seguinte.
                            </span>
                          ) : (
                            <span className="text-rose-400 font-extrabold font-mono">
                              ⚠ ERRO DE CONFORMIDADE: O rateio total deve ser
                              rigidamente igual a 100% para continuar
                              (Falta/Sobra de{" "}
                              {100 -
                                ((tutorConfig.rent_allocation_productive ??
                                  70) +
                                  (tutorConfig.rent_allocation_administrative ??
                                    20) +
                                  (tutorConfig.rent_allocation_sales ?? 10))}
                              %).
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 7: PARÂMETROS MACROECONÔMICOS DO P0 */}
            {step === 7 && (
              <motion.div
                key="s6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10 text-left"
              >
                <WizardStepTitle
                  icon={<BarChart3 size={32} />}
                  title="7. CRONOGRAMA MACROECONÔMICO"
                  desc="Variações conjunturais, taxas de compliance tributário, juros e câmbio."
                />

                <div className="rounded-[3rem] bg-slate-950/90 border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden h-[450px] flex flex-col relative group">
                  <div className="overflow-auto custom-scrollbar flex-1 relative">
                    <table className="w-full text-left border-separate border-spacing-0">
                      <thead className="sticky top-0 z-[100] bg-slate-900 shadow-xl">
                        <tr>
                          <th className="p-4 bg-slate-900 border-b-2 border-r-2 border-white/10 w-[280px] min-w-[280px]">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                              Indicadores e Ajustes
                            </span>
                          </th>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <th
                              key={i}
                              className={`p-4 bg-slate-900 border-b-2 border-r border-white/5 text-center min-w-[95px] ${i === 0 ? "bg-orange-600/10" : ""}`}
                            >
                              <span
                                className={`text-[12px] font-black uppercase tracking-widest ${i === 0 ? "text-white" : "text-orange-500"}`}
                              >
                                P{i < 10 ? `0${i}` : i}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ICE CRESC. ECONÔMICO (%)"
                          macroKey="ice"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Activity size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="VARIAÇÕES DE DEMANDA (%)"
                          macroKey="demand_variation"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Target size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ÍNDICE DE INFLAÇÃO (%)"
                          macroKey="inflation_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Flame size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ÍNDICE DE INADIMPLÊNCIA (%)"
                          macroKey="customer_default_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<ShieldAlert size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="JUROS BANCÁRIOS + TR (%)"
                          macroKey="interest_rate_tr"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Landmark size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="JUROS COMPRA A PRAZO (%)"
                          macroKey="supplier_interest"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Truck size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="RENDIMENTO APLICAÇÃO (%)"
                          macroKey="investment_return_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<TrendingUp size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="IVA SOBRE COMPRAS (%)"
                          macroKey="vat_purchases_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Scale size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="IVA SOBRE VENDAS (%)"
                          macroKey="vat_sales_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Scale size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="IMPOSTO DE RENDA (%)"
                          macroKey="tax_rate_ir"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Scale size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MULTA POR ATRASOS (%)"
                          macroKey="late_penalty_rate"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<ShieldAlert size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="DESÁGIO VENDA MÁQUINAS (%)"
                          macroKey="machine_sale_discount"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<TrendingUp size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ÁGIO COMPRAS ESPECIAIS (%)"
                          macroKey="special_purchase_premium"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Package size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ÁGIO EMPRÉSTIMO COMPULSÓRIO (%)"
                          macroKey="compulsory_loan_agio"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Landmark size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="ENCARGOS SOCIAIS (%)"
                          macroKey="social_charges"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Users size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MATÉRIA-PRIMA A (%)"
                          macroKey="raw_material_a_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MATÉRIA-PRIMA B (%)"
                          macroKey="raw_material_b_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MÁQUINA ALPHA (%)"
                          macroKey="machine_alpha_price_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MÁQUINA BETA (%)"
                          macroKey="machine_beta_price_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="MÁQUINA GAMA (%)"
                          macroKey="machine_gamma_price_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CAMPANHAS MARKETING (%)"
                          macroKey="marketing_campaign_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="DISTRIBUIÇÃO DE PRODUTOS (%)"
                          macroKey="distribution_cost_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="GASTOS COM ESTOCAGEM (%)"
                          macroKey="storage_cost_adjust"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO BRASIL (%)"
                          macroKey="import_tariff_brazil"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO EUA (%)"
                          macroKey="import_tariff_usa"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO EURO (%)"
                          macroKey="import_tariff_euro"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO REINO UNIDO (%)"
                          macroKey="import_tariff_uk"
                          rules={roundRules}
                          update={updateRoundMacro}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO CHINA (%)"
                          macroKey="import_tariff_china"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Globe size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="TARIFA IMPORTAÇÃO BLOCO BTC (%)"
                          macroKey="import_tariff_btc"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Bitcoin size={10} />}
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: REAL (BRL)"
                          macroKey="BRL"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Globe size={10} />}
                          isExchange
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: DÓLAR (USD)"
                          macroKey="USD"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<DollarSign size={10} />}
                          isExchange
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: EURO (EUR)"
                          macroKey="EUR"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Euro size={10} />}
                          isExchange
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: LIBRA (GBP)"
                          macroKey="GBP"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<PoundSterling size={10} />}
                          isExchange
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: YUAN (CNY)"
                          macroKey="CNY"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Globe size={10} />}
                          isExchange
                        />
                        <CompactMatrixRow
                          periods={totalPeriods}
                          label="CÂMBIO: BITCOIN (BTC)"
                          macroKey="BTC"
                          rules={roundRules}
                          update={updateRoundMacro}
                          icon={<Bitcoin size={10} />}
                          isExchange
                        />

                        <tr className="hover:bg-white/[0.03] transition-colors">
                          <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2">
                            <HardDrive size={10} /> LIBERAR COMPRA/VENDA
                            MÁQUINAS
                          </td>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <td
                              key={i}
                              className="p-2 border-r border-white/5 text-center"
                            >
                              <button
                                onClick={() =>
                                  updateRoundMacro(
                                    i,
                                    "allow_machine_sale",
                                    !(
                                      roundRules[i]?.allow_machine_sale ??
                                      DEFAULT_INDUSTRIAL_CHRONOGRAM[i]
                                        ?.allow_machine_sale
                                    ),
                                  )
                                }
                                className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" : "bg-rose-600/10 border-rose-500/30 text-rose-500 opacity-40"}`}
                              >
                                {(roundRules[i]?.allow_machine_sale ??
                                (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]
                                  ?.allow_machine_sale ||
                                  false))
                                  ? "SIM"
                                  : "NÃO"}
                              </button>
                            </td>
                          ))}
                        </tr>

                        <tr className="hover:bg-white/[0.03] transition-colors">
                          <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-blue-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2">
                            <ClipboardList size={10} /> APRESENTAR BUSINESS PLAN
                          </td>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <td
                              key={i}
                              className="p-2 border-r border-white/5 text-center"
                            >
                              <button
                                onClick={() =>
                                  updateRoundMacro(
                                    i,
                                    "require_business_plan",
                                    !(
                                      roundRules[i]?.require_business_plan ??
                                      DEFAULT_INDUSTRIAL_CHRONOGRAM[i]
                                        ?.require_business_plan
                                    ),
                                  )
                                }
                                className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-slate-900 border-white/10 text-slate-700 opacity-40"}`}
                              >
                                {(roundRules[i]?.require_business_plan ??
                                (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]
                                  ?.require_business_plan ||
                                  false))
                                  ? "SIM"
                                  : "NÃO"}
                              </button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 8: PREVIEW COMPLETO DO P0 + CONFIRMAÇÃO (Focado em Deploy) */}
            {step === 8 && (
              <motion.div
                key="s7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12 text-left"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                  <WizardStepTitle
                    icon={<Calculator size={32} />}
                    title="8. REAL-TIME AUDITOR & PREVIEW"
                    desc="Auditoria fiduciária e estruturação industrial final antes de salvar a arena."
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTemplateName("");
                        setTemplateDesc("");
                        setShowSaveTplModal(true);
                      }}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-white hover:text-emerald-950 transition-all flex items-center gap-2 shadow-2xl active:scale-95"
                    >
                      <Save size={16} /> Salvar como Template
                    </button>
                  </div>
                </div>

                {/* DASHBOARD DE AUDITORIA OPERACIONAL E KPIs DO P00 (v19.18) */}
                <div
                  id="p00_audit_dashboard_fiduciary_v18"
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative"
                >
                  <div className="lg:col-span-3 border-b border-white/5 pb-4 mb-2">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic leading-none mb-1 block">
                      DASHBOARD DE AUDITORIA OPERACIONAL & KPIs DO P00 (V19.23
                      REAL-TIME)
                    </span>
                    <h4 className="text-xl font-black text-white italic mt-1">
                      Soberania dos Indicadores Contábeis e Industriais
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Breakdown fiduciário analítico de liquidez, estrutura
                      predial, capacidades teóricas de faturamento e saúde
                      socioambiental recalculados dinamicamente.
                    </p>
                  </div>

                  {/* Bloco 1: Saúde Contábil Reativa */}
                  <div className="space-y-6 bg-slate-950/60 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                    <h5 className="text-[10px] font-black text-sky-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                      Saúde Contábil
                    </h5>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Liquidez Corrente:</span>
                        <span className="text-sm font-black text-white">
                          {fiduciaryMetrics.liquidity_current.toFixed(2)}x{" "}
                          <span className="text-[10px] text-slate-500">
                            (Giro/Passivo)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Solvência Geral (Kanitz):</span>
                        <span
                          className={`text-sm font-black ${estimatedESDS.kanitz >= 1.0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {estimatedESDS.kanitz.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Altman Z-Score:</span>
                        <span className="text-sm font-black text-white">
                          {estimatedESDS.altman.toFixed(2)}{" "}
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-black ${estimatedESDS.altman > 2.6 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                          >
                            {estimatedESDS.altman > 2.6
                              ? "Zona Segura"
                              : "Alerta"}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Rating de Crédito:</span>
                        <span
                          className={`text-lg font-black font-sans tracking-wide ${estimatedESDS.rating.startsWith("A") ? "text-emerald-400" : "text-sky-400"}`}
                        >
                          {estimatedESDS.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Parque Industrial Reativo */}
                  <div className="space-y-6 bg-slate-950/60 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                    <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                      Capacidade Produtiva
                    </h5>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Máquinas Físicas:</span>
                        <span className="text-sm font-black text-white">
                          {p0StatementsResult.machines.length} Unidades{" "}
                          <span className="text-[10px] text-slate-500">
                            (
                            {tutorConfig.starting_mode === "start_from_zero"
                              ? "Nenhuma"
                              : "Ativas"}
                            )
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Capacidade Máxima Teórica:</span>
                        <span className="text-sm font-black text-white">
                          {fiduciaryMetrics.capTotal.toLocaleString("pt-BR")}{" "}
                          <span className="text-[10px] text-slate-500 font-sans">
                            un/round
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Acumulado Depreciativo:</span>
                        <span className="text-sm font-black text-rose-400">
                          {formatCurrency(
                            p0StatementsResult.kpis.fixed_assets_depreciation ||
                              0,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                        <span>Imobilizado Net Total:</span>
                        <span className="text-sm font-black text-white">
                          {formatCurrency(
                            fiduciaryMetrics.imobilizado,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 3: Estoques Reais */}
                  <div className="space-y-6 bg-slate-950/60 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                      Estoques de Abertura
                    </h5>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Matéria Prima Alfa (MPA):</span>
                        <span className="text-sm font-black text-white">
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.mpa_qty}{" "}
                          un{" "}
                          <span className="text-[10px] text-slate-500">
                            (
                            {formatCurrency(
                              tutorConfig.starting_mode === "start_from_zero"
                                ? 0
                                : tutorConfig.inventories.mpa_unit_val,
                              tutorConfig.currency,
                            )}
                            /un)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                        <span>Matéria Prima Beta (MPB):</span>
                        <span className="text-sm font-black text-white">
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.mpb_qty}{" "}
                          un{" "}
                          <span className="text-[10px] text-slate-500">
                            (
                            {formatCurrency(
                              tutorConfig.starting_mode === "start_from_zero"
                                ? 0
                                : tutorConfig.inventories.mpb_unit_val,
                              tutorConfig.currency,
                            )}
                            /un)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                        <span>Produtos Acabados (PA):</span>
                        <span className="text-sm font-black text-white">
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.inventories.finished_qty}{" "}
                          un{" "}
                          <span className="text-[10px] text-slate-500">
                            (
                            {formatCurrency(
                              tutorConfig.starting_mode === "start_from_zero"
                                ? 0
                                : tutorConfig.inventories.finished_unit_val,
                              tutorConfig.currency,
                            )}
                            /un)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                        <span>Estoque em Processo (WIP):</span>
                        <span className="text-sm font-black text-yellow-400">
                          {formatCurrency(
                            tutorConfig.starting_mode === "start_from_zero"
                              ? 0
                              : (tutorConfig.wip_stock_value ??
                                  (tutorConfig.starting_mode ===
                                  "start_with_base"
                                    ? 50000
                                    : 500000)),
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPONENTE INTERATIVO DE ABAS DE AUDITORIA PATRIMONIAL DETALHADA v19.23 */}
                <div
                  id="p00_interactive_audi_ledger_tabs_v23"
                  className="space-y-6 bg-slate-900/20 border border-white/5 p-8 rounded-[3rem] shadow-xl text-left"
                >
                  {/* Linha das Abas */}
                  <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
                    <button
                      onClick={() => setActiveAuditTab("esds")}
                      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeAuditTab === "esds" ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"}`}
                    >
                      <Gauge size={12} /> E-SDS 6 Pilares
                    </button>
                    <button
                      id="btn-active-audit-tab-financials"
                      onClick={() => setActiveAuditTab("financials")}
                      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeAuditTab === "financials" ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"}`}
                    >
                      <Calculator size={12} /> Demonstrações (P0)
                    </button>
                    <button
                      onClick={() => setActiveAuditTab("liquidity")}
                      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeAuditTab === "liquidity" ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"}`}
                    >
                      <Landmark size={12} /> Sub-Contas & Liquidez
                    </button>
                    <button
                      onClick={() => setActiveAuditTab("assets")}
                      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeAuditTab === "assets" ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"}`}
                    >
                      <Cpu size={12} /> Laudo do Imobilizado
                    </button>
                    <button
                      onClick={() => setActiveAuditTab("governance")}
                      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeAuditTab === "governance" ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"}`}
                    >
                      <ShieldCheck size={12} /> Governança & Imutabilidade
                    </button>
                  </div>

                  {/* Conteúdo das Abas com Animação Fiduciária */}
                  <AnimatePresence mode="wait">
                    {activeAuditTab === "esds" && (
                      <motion.div
                        key="tab-esds"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                      >
                        <div className="md:col-span-2 space-y-4">
                          <h5 className="text-xs font-black text-white uppercase tracking-wider">
                            Métricas de Resiliência dos 6 Pilares E-SDS
                          </h5>
                          <div className="space-y-4 bg-slate-950/40 p-6 rounded-2xl border border-white/5">
                            {/* P1 */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P1. FLUXO DE CAIXA LIVRE OPERACIONAL (FCF)
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p1}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p1}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {/* P2 */}
                            <div className="space-y-1 border-t border-white/5 pt-2">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P2. CRESCIMENTO SUSTENTÁVEL (DÍVIDA / PL)
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p2}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p2}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {/* P3 */}
                            <div className="space-y-1 border-t border-white/5 pt-2">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P3. ANÁLISE DUPONT E MARGENS TÁTICAS
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p3}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p3}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {/* P4 */}
                            <div className="space-y-1 border-t border-white/5 pt-2">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P4. COBERTURA DE GIRO E DIAS DE CAIXA
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p4}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p4}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {/* P5 */}
                            <div className="space-y-1 border-t border-white/5 pt-2">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P5. ALAVANCAGEM & CONCENTRAÇÃO DE ATIVOS
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p5}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p5}%`,
                                  }}
                                />
                              </div>
                            </div>
                            {/* P6 */}
                            <div className="space-y-1 border-t border-white/5 pt-2">
                              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
                                <span>
                                  P6. ESTABILIDADE DE RECEITA & RISCO MACRO
                                </span>
                                <span className="font-black text-white">
                                  {estimatedESDS.pillars.p6}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 rounded-full"
                                  style={{
                                    width: `${estimatedESDS.pillars.p6}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Insights do Piloto */}
                        <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 p-6 rounded-2xl border border-indigo-500/10 flex flex-col justify-between text-left">
                          <div className="space-y-4">
                            <span className="text-[9px] font-black tracking-widest text-[#22c55e] uppercase">
                              Sonda de Solvência
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black text-white">
                                {estimatedESDS.score}
                              </span>
                              <span className="text-sm font-bold text-slate-400 font-semibold">
                                / 10.0
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-bold uppercase py-1 px-3 bg-white/5 text-slate-300 rounded-full">
                                Zona de Risco:
                              </span>
                              <span className="text-[10px] font-black uppercase py-1 px-3 bg-emerald-500/20 text-emerald-400 rounded-full">
                                {estimatedESDS.zone}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-white/5 font-sans font-medium">
                              {estimatedESDS.insights}
                            </p>
                          </div>
                          <span className="text-[9px] text-slate-600 font-mono italic block pt-6">
                            E-SDS v1.2 Ponderado Setorial
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeAuditTab === "financials" && (
                      <motion.div
                        key="tab-fin"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="text-left">
                          <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">
                            Demonstrações Financeiras Projetadas de Abertura
                            (Round 0)
                          </h5>
                          <p className="text-xs text-slate-500 mb-6">
                            Valores recalculados dinamicamente com base nas
                            escolhas do Tutor para a arena corrente.
                          </p>

                          <div className="flex gap-2 mb-6 bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 w-fit">
                            <button
                              type="button"
                              onClick={() => setSelectedFinancialTab("balance")}
                              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFinancialTab === "balance" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                              Balanço Patrimonial
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFinancialTab("dre")}
                              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFinancialTab === "dre" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                              DRE (Competência)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFinancialTab("cashflow")
                              }
                              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFinancialTab === "cashflow" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                              DFC (Regime Caixa)
                            </button>
                          </div>

                          <div className="bg-slate-950/80 border border-white/5 rounded-[2rem] overflow-hidden max-h-[550px] overflow-y-auto shadow-inner">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-900 border-b border-white/5 text-[9px] uppercase tracking-wider font-black text-slate-400">
                                  <th className="p-4">Conta Contábil / Item</th>
                                  <th className="p-4 text-right">
                                    Saldo Projetado (Round 0)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const renderFinancialRows = (
                                    nodes: any[],
                                    level = 0,
                                  ): React.ReactNode => {
                                    if (!nodes || !Array.isArray(nodes))
                                      return null;
                                    return nodes.map((node: any) => {
                                      const isTotalizer =
                                        node.type === "totalizer";
                                      return (
                                        <React.Fragment key={node.id}>
                                          <tr
                                            className={`border-b border-white/5 transition-all hover:bg-white/[0.03] group ${isTotalizer ? "bg-white/[0.02] font-black" : ""}`}
                                          >
                                            <td className="p-3">
                                              <div
                                                className="flex items-center gap-2"
                                                style={{
                                                  paddingLeft: `${level * 16}px`,
                                                }}
                                              >
                                                {level > 0 && (
                                                  <span className="text-slate-600 font-sans">
                                                    ↳
                                                  </span>
                                                )}
                                                <span
                                                  className={`text-[10px] uppercase tracking-wider transition-colors ${isTotalizer ? "text-white group-hover:text-orange-400 font-black" : "text-slate-400 group-hover:text-slate-200 font-medium"}`}
                                                >
                                                  {node.label}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="p-3 text-right font-mono text-xs">
                                              <span
                                                className={`tracking-tighter ${isTotalizer ? "font-black text-orange-400 text-sm" : "text-slate-300"}`}
                                              >
                                                {formatCurrency(
                                                  node.value || 0,
                                                  tutorConfig.currency,
                                                )}
                                              </span>
                                            </td>
                                          </tr>
                                          {node.children &&
                                            renderFinancialRows(
                                              node.children,
                                              level + 1,
                                            )}
                                        </React.Fragment>
                                      );
                                    });
                                  };

                                  return renderFinancialRows(
                                    selectedFinancialTab === "balance"
                                      ? editableFinancials.balance_sheet
                                      : selectedFinancialTab === "dre"
                                        ? editableFinancials.dre
                                        : editableFinancials.cash_flow,
                                  );
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeAuditTab === "liquidity" && (
                      <motion.div
                        key="tab-liq"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs text-left">
                          {/* Ativo Circulante */}
                          <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h5 className="text-[10px] font-black text-sky-400 uppercase tracking-widest font-sans border-b border-white/5 pb-2">
                              Ativo Circulante (Foco Liquidez)
                            </h5>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Caixa e Equivalentes de Caixa:
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.caixa_inicial,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500">
                                Aplicações Financeiras CP:
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.financial_investments || 0,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500">
                                Contas a Receber (Vendas):
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.starting_mode ===
                                    "start_from_zero"
                                    ? 0
                                    : (tutorConfig.clients_initial ?? 300000),
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 text-rose-400">
                              <span>(-) PECLD (iNADIMPLÊNCIA):</span>
                              <span className="font-bold font-mono">
                                -
                                {formatCurrency(
                                  tutorConfig.starting_mode ===
                                    "start_from_zero"
                                    ? 0
                                    : (tutorConfig.custom_pecld_val ?? 4500),
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Passivo Circulante e Dívida */}
                          <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-sans border-b border-white/5 pb-2">
                              Passivos Exigíveis e Financiamentos
                            </h5>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Fornecedores (Contas a Pagar):
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.starting_mode ===
                                    "start_from_zero"
                                    ? 0
                                    : (tutorConfig.suppliers_initial ?? 100000),
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500">
                                Impostos e Provisões Fiscais:
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.starting_mode ===
                                    "start_from_zero"
                                    ? 0
                                    : (tutorConfig.taxes_initial ?? 15000),
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 text-yellow-400 font-bold">
                              <span>Empréstimos Curto Prazo (ST):</span>
                              <span>
                                {formatCurrency(
                                  fiduciaryMetrics.current_liabilities > 0
                                    ? fiduciaryMetrics.current_liabilities -
                                        (tutorConfig.starting_mode ===
                                        "start_from_zero"
                                          ? 0
                                          : (tutorConfig.suppliers_initial ??
                                              100000) +
                                            (tutorConfig.taxes_initial ??
                                              15000) +
                                            (tutorConfig.dividends_initial ??
                                              5000))
                                    : 0,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 text-orange-500 font-bold">
                              <span>Obrigações Longo Prazo (LT):</span>
                              <span>
                                {formatCurrency(
                                  fiduciaryMetrics.total_liabilities -
                                    fiduciaryMetrics.current_liabilities,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl text-[11px] text-slate-300 flex items-center gap-3 font-sans font-medium text-left">
                          <Info
                            size={16}
                            className="text-orange-500 flex-shrink-0"
                          />
                          <span>
                            A PECLD (Perdas Estimadas com Créditos de Liquidação
                            Duvidosa) mitiga inadimplências do comércio regional
                            histórico, retendo{" "}
                            {(
                              ((tutorConfig.custom_pecld_val ?? 4500) /
                                ((tutorConfig.clients_initial ?? 300000) ||
                                  1)) *
                              100
                            ).toFixed(1)}
                            % do contas a receber bruto.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeAuditTab === "assets" && (
                      <motion.div
                        key="tab-assets"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 text-left"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono font-medium">
                          {/* Imobiliário */}
                          <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest font-sans border-b border-white/5 pb-2 font-semibold">
                              Imóvel & Espaço Físico (Prédio)
                            </h5>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Regime Imobiliário:
                              </span>
                              <span className="text-white font-bold uppercase">
                                {tutorConfig.building_mode === "rented"
                                  ? "LOCADO (ALUGADO)"
                                  : "PRÓPRIO (INTEGRALIZADO)"}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500">
                                Valor Imóvel (Prédio):
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.building_mode === "owned"
                                    ? (tutorConfig.building_value ?? 2000000)
                                    : 0,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500">
                                Valor do Terreno:
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  tutorConfig.building_mode === "owned"
                                    ? (tutorConfig.land_value ?? 10000000)
                                    : 0,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                              <span className="text-slate-500 font-sans">
                                Benfeitorias & Instalações:
                              </span>
                              <span className="text-white font-bold">
                                {formatCurrency(
                                  fiduciaryMetrics.installationsVal,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Maquinas */}
                          <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-sans border-b border-white/5 pb-2 font-semibold">
                              Frota de Máquinas e Modelos
                            </h5>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Máquina Alpha (2k capacidade):
                              </span>
                              <span className="text-white font-bold">
                                {tutorConfig.starting_mode === "start_from_zero"
                                  ? "0"
                                  : tutorConfig.machines[0]?.qty}{" "}
                                un{" "}
                                <span className="text-[9px] text-slate-500 font-sans font-semibold">
                                  ({tutorConfig.machines[0]?.age} anos,{" "}
                                  {Math.round(
                                    tutorConfig.machines[0]?.efficiency * 100,
                                  )}
                                  % ef)
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1">
                              <span className="text-slate-500">
                                Máquina Beta (7k capacidade):
                              </span>
                              <span className="text-white font-bold">
                                {tutorConfig.starting_mode === "start_from_zero"
                                  ? "0"
                                  : tutorConfig.machines[1]?.qty}{" "}
                                un{" "}
                                <span className="text-[9px] text-slate-500 font-sans font-semibold font-semibold">
                                  ({tutorConfig.machines[1]?.age} anos,{" "}
                                  {Math.round(
                                    tutorConfig.machines[1]?.efficiency * 100,
                                  )}
                                  % ef)
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1">
                              <span className="text-slate-500">
                                Máquina Gama (15k capacidade):
                              </span>
                              <span className="text-white font-bold">
                                {tutorConfig.starting_mode === "start_from_zero"
                                  ? "0"
                                  : tutorConfig.machines[2]?.qty}{" "}
                                un{" "}
                                <span className="text-[9px] text-slate-500 font-sans font-semibold">
                                  ({tutorConfig.machines[2]?.age} anos,{" "}
                                  {Math.round(
                                    tutorConfig.machines[2]?.efficiency * 100,
                                  )}
                                  % ef)
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 text-purple-400 font-bold">
                              <span className="font-sans">
                                Capacidade Agregada Total:
                              </span>
                              <span>
                                {fiduciaryMetrics.capTotal.toLocaleString(
                                  "pt-BR",
                                )}{" "}
                                un/round
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeAuditTab === "governance" && (
                      <motion.div
                        key="tab-gov"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="bg-slate-950/60 p-8 rounded-2xl border border-white/5 space-y-4">
                          <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 text-left text-orange-500 font-sans font-semibold">
                            <ShieldCheck size={16} /> Compromisso fiduciário de
                            imutabilidade do P00
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium text-left text-semibold">
                            Em conformidade rigorosa com os princípios do
                            **Empirion Cooperativo**, uma vez implantados esses
                            dados fiduciários, a simulação inicial (R-0 / Round
                            0) de cada competidor será congelada e persistida
                            permanently no banco de dados. Qualquer alteração ou
                            reinício no painel do Tutor só poderá ser disparado
                            via reset global da arena para preservar a igualdade
                            fiduciária.
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono font-bold text-left pt-4 border-t border-white/5">
                            <div>
                              <span className="block text-[8px] text-slate-500 font-sans">
                                NÍVEL DE GOVERNANÇA:
                              </span>
                              <span className="text-white uppercase">
                                {tutorConfig.transparency_level === "low"
                                  ? "SIGILOSA"
                                  : tutorConfig.transparency_level === "medium"
                                    ? "PADRÃO"
                                    : tutorConfig.transparency_level === "high"
                                      ? "TRANSPARENTE"
                                      : "OPEN DATA"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-500 font-sans">
                                MOEDA DE EXIBIÇÃO:
                              </span>
                              <span className="text-white">
                                {tutorConfig.currency}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-500 font-sans">
                                ROUNDS PROGRAMADOS:
                              </span>
                              <span className="text-white">
                                {tutorConfig.total_rounds}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-500 font-sans">
                                VERSÃO DO COMPILADOR:
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                v19.23 GOLDEN PATCH
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Top indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <SummaryCard
                    label="ATIVO TOTAL"
                    val={totalAssets}
                    currency={tutorConfig.currency}
                    icon={<PieChart size={20} />}
                    color="orange"
                  />
                  <SummaryCard
                    label="PATRIMÔNIO LÍQUIDO"
                    val={totalEquity}
                    currency={tutorConfig.currency}
                    icon={<BarChart size={20} />}
                    color="blue"
                  />

                  {/* E-SDS badge */}
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
                    <div className="p-4 rounded-2xl bg-emerald-600/20 text-emerald-400">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">
                        E-SDS INICIAL
                      </span>
                      <span className="text-xl font-black text-emerald-400 capitalize flex items-center gap-2">
                        {estimatedESDS.score} / 100
                        <span className="text-[9px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-500">
                          {estimatedESDS.zone}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Industrial summary */}
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
                    <div className="p-4 rounded-2xl bg-purple-600/20 text-purple-400">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">
                        MÁQUINAS / CAPACIDADE
                      </span>
                      <span className="text-lg font-mono font-black text-white">
                        {p0StatementsResult.machines.length} Unidades
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance validation indicator */}
                <div className="p-6 bg-emerald-950/40 border-2 border-emerald-500/30 rounded-[2rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    <div>
                      <span className="block text-xs font-black text-emerald-400 uppercase tracking-wider">
                        BALANÇO PATRIMONIAL CONCILIADO
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Os ativos batem 100% com o Passivo + Patrimônio Líquido
                        nesta simulação (
                        {formatCurrency(totalAssets, tutorConfig.currency)}).
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black text-emerald-500 uppercase">
                    Fechamento Líquido
                  </span>
                </div>

                {/* Configuração de Equipes de Lançamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 shadow-xl">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
                      <Users size={16} className="text-orange-500" /> Equipes
                      Humanas ({humanTeamsCount})
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Quantos times de alunos participarão dessa simulação
                      simulada.
                    </p>
                    <div className="mt-4 flex gap-4 items-center">
                      <button
                        onClick={() =>
                          setHumanTeamsCount((h) => Math.max(1, h - 1))
                        }
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserMinus size={16} />
                      </button>
                      <span className="text-2xl font-black font-mono text-white px-4">
                        {humanTeamsCount}
                      </span>
                      <button
                        onClick={() =>
                          setHumanTeamsCount((h) => Math.min(10, h + 1))
                        }
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {teamNames.map((name, idx) => (
                        <input
                          key={idx}
                          value={name}
                          onChange={(e) => {
                            const next = [...teamNames];
                            next[idx] = e.target.value.toUpperCase();
                            setTeamNames(next);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white uppercase font-mono"
                          placeholder={`NOME TIME ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
                      <Bot size={16} className="text-blue-500" /> Competidores
                      Virtuais ({botsCount})
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Configure robôs inteligentes autônomos para concorrer no
                      faturamento regional.
                    </p>
                    <div className="mt-4 flex gap-4 items-center">
                      <button
                        onClick={() => setBotsCount((b) => Math.max(0, b - 1))}
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserMinus size={16} />
                      </button>
                      <span className="text-2xl font-black font-mono text-white px-4">
                        {botsCount}
                      </span>
                      <button
                        onClick={() => setBotsCount((b) => Math.min(5, b + 1))}
                        className="p-3 bg-slate-950 border border-white/5 text-white rounded-xl hover:bg-slate-900"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl mt-4 text-[11px] text-slate-400 font-medium">
                      Os robôs assumem estratégias variadas (Conservadora,
                      Agressiva, Equilibrada, etc.) utilizando inteligência
                      gerada por IA no round.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTÃO FLUTUANTE DO MONITOR FIDUCIÁRIO REAL-TIME v19.21 (OBISIDIAN MASTERCLASS) */}
      <button
        onClick={() => setShowFiduciaryMonitor(true)}
        className="fixed right-0 top-[250px] z-[90] bg-orange-600 hover:bg-orange-500 text-white font-black font-sans text-[8px] tracking-[0.1em] py-4 px-1 uppercase rounded-l-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex flex-col items-center gap-2 hover:px-2.5 group w-8 hover:w-11 overflow-hidden"
        id="btn_floating_fiduciary_monitor"
      >
        <Activity
          size={12}
          className="animate-pulse text-white group-hover:scale-110 transition-transform"
        />
        <span 
          style={{ writingMode: "vertical-rl" }}
          className="uppercase tracking-widest font-mono text-center select-none whitespace-nowrap"
        >
          Monitor P0
        </span>
      </button>

      {/* DRAWER SLIDE-OVER DO MONITOR FIDUCIÁRIO REAL-TIME */}
      <AnimatePresence>
        {showFiduciaryMonitor && (
          <div className="fixed inset-0 z-[500] flex justify-end">
            {/* Backdrop com blur fiduciário */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiduciaryMonitor(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              id="fiduciary_monitor_backdrop"
            />

            {/* Corpo do Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl h-full bg-slate-900 border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col text-left overflow-hidden"
              id="fiduciary_monitor_drawer"
            >
              <div className="p-8 bg-slate-950 border-b border-white/5 flex items-center justify-between sticky top-0 z-[100]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600/20 text-orange-400 rounded-xl">
                    <Activity size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                      Real-Time Fiduciary Monitor
                    </h3>
                    <p className="text-[10px] text-orange-500 font-mono uppercase tracking-widest mt-1">
                      v19.21 • Simulação de Impacto Financeiro de P00 em Tempo
                      Real
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFiduciaryMonitor(false)}
                  className="p-3 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Banner Descritivo */}
                <div className="p-6 bg-orange-600/10 border-2 border-orange-500/25 rounded-2xl">
                  <p className="text-xs text-orange-200 leading-relaxed font-medium">
                    Excelente tutor! Este painel simula instantaneamente o
                    impacto contábil de cada ajuste feito em qualquer passo do
                    cronograma (máquinas, estoques, benfeitorias, capital e
                    passivos). Veja os demonstrativos se movimentando em
                    sintonia antes de abrir a arena.
                  </p>
                </div>

                {/* KPI Breakdown expandido com subnotas de auditoria e capacidades produtivas v19.22 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl" />
                    <div>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-2">
                        Audit Status & E-SDS
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-white">
                          {estimatedESDS.score}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          / 100
                        </span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-black font-mono leading-none">
                          {estimatedESDS.zone}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-3 font-medium leading-relaxed">
                        {estimatedESDS.insights ||
                          "Sólida solidez patrimonial."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-600/5 rounded-full blur-2xl" />
                    <div>
                      <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-1">
                        Métricas Fiduciárias
                      </span>
                      <div className="space-y-2 mt-3 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Liquidez Corrente:</span>
                          <span className="font-bold text-white">
                            {fiduciaryMetrics.liquidity_current.toFixed(2)}x
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                          <span>Endividamento:</span>
                          <span className="font-bold text-slate-300">
                            {(fiduciaryMetrics.leverage * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                          <span>Conciliação:</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <ShieldCheck size={10} /> 100% OK
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl" />
                    <div>
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">
                        Capacidade Produtiva
                      </span>
                      <div className="space-y-2 mt-3 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Capacidade Total:</span>
                          <span className="font-bold text-white">
                            {fiduciaryMetrics.capTotal.toLocaleString("pt-BR")}{" "}
                            un
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                          <span>Alfa, Beta, Gama:</span>
                          <span className="font-bold text-slate-400">
                            {tutorConfig.starting_mode === "start_from_zero"
                              ? "0"
                              : `${tutorConfig.machines[0]?.qty || 0}/${tutorConfig.machines[1]?.qty || 0}/${tutorConfig.machines[2]?.qty || 0}`}{" "}
                            un
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-1">
                          <span>Ativos Totais:</span>
                          <span className="font-bold text-sky-400">
                            {formatCurrency(totalAssets, tutorConfig.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subnotas Detalhadas de Custos Previstos, Ociosidades de P0 (v19.22) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] italic border-b border-white/5 pb-2">
                      Projeção Base de Gastos Fixos por Período
                    </h5>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">
                          Mão de Obra ({fiduciaryMetrics.total_operators} op.):
                        </span>
                        <span className="text-white font-bold">
                          {formatCurrency(
                            fiduciaryMetrics.payroll_round,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-slate-500 font-sans">
                          Depreciação Provisória (Total):
                        </span>
                        <span className="text-rose-400 font-bold">
                          {formatCurrency(
                            fiduciaryMetrics.total_deprec_round,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                      <div className="pl-4 flex justify-between items-center text-[11px] text-slate-500">
                        <span>└ Deprec. Máquinas:</span>
                        <span>
                          {formatCurrency(
                            fiduciaryMetrics.m_deprec_round,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                      <div className="pl-4 flex justify-between items-center text-[11px] text-slate-500">
                        <span>
                          └ Deprec. Instalações (
                          {fiduciaryMetrics.buildings_depreciation_rate_pct}%):
                        </span>
                        <span>
                          {formatCurrency(
                            fiduciaryMetrics.installations_deprec_only,
                            tutorConfig.currency,
                          )}
                        </span>
                      </div>
                      {tutorConfig.building_mode === "owned" && (
                        <div className="pl-4 flex justify-between items-center text-[11px] text-slate-500">
                          <span>
                            └ Deprec. Imóvel Próprio (
                            {fiduciaryMetrics.property_depreciation_rate_pct}%):
                          </span>
                          <span>
                            {formatCurrency(
                              fiduciaryMetrics.building_deprec_only,
                              tutorConfig.currency,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="hidden"></div>
                      <div className="flex flex-col border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-sans">
                            Aluguel / Manutenção Predial:
                          </span>
                          <span className="text-slate-300 font-bold flex items-center gap-2">
                            {tutorConfig.building_mode === "rented" ? (
                              <>
                                <span className="text-xs font-mono font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
                                  LOCADO
                                </span>
                                {formatCurrency(
                                  tutorConfig.monthly_rent_value ?? 50000.0,
                                  tutorConfig.currency,
                                )}
                              </>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                PRÓPRIO (ISENTO)
                              </span>
                            )}
                          </span>
                        </div>
                        {tutorConfig.building_mode === "rented" && (
                          <div className="mt-2 pl-4 border-l border-orange-500/20 space-y-1.5 text-[11px] text-slate-400">
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                ├── Aluguel Produtivo (CIF) (
                                {tutorConfig.rent_allocation_productive ?? 70}
                                %):
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {formatCurrency(
                                  ((tutorConfig.monthly_rent_value ?? 50000.0) *
                                    (tutorConfig.rent_allocation_productive ??
                                      70)) /
                                    100,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                └── Aluguel OPEX (Adm+Sales) (
                                {(tutorConfig.rent_allocation_administrative ??
                                  20) +
                                  (tutorConfig.rent_allocation_sales ?? 10)}
                                %):
                              </span>
                              <span className="text-sky-400 font-bold">
                                {formatCurrency(
                                  ((tutorConfig.monthly_rent_value ?? 50000.0) *
                                    ((tutorConfig.rent_allocation_administrative ??
                                      20) +
                                      (tutorConfig.rent_allocation_sales ??
                                        10))) /
                                    100,
                                  tutorConfig.currency,
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-l border-white/5 pl-6">
                    <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] italic border-b border-white/5 pb-2">
                      Capacidade Nominal por Modelo de Máquina
                    </h5>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">
                          Linha ALFA (
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.machines[0]?.qty || 0}{" "}
                          un):
                        </span>
                        <span className="text-white font-bold">
                          {fiduciaryMetrics.capAlpha.toLocaleString("pt-BR")}{" "}
                          un/round
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-slate-500 font-sans">
                          Linha BETA (
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.machines[1]?.qty || 0}{" "}
                          un):
                        </span>
                        <span className="text-white font-bold">
                          {fiduciaryMetrics.capBeta.toLocaleString("pt-BR")}{" "}
                          un/round
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-slate-500 font-sans">
                          Linha GAMA (
                          {tutorConfig.starting_mode === "start_from_zero"
                            ? 0
                            : tutorConfig.machines[2]?.qty || 0}{" "}
                          un):
                        </span>
                        <span className="text-white font-bold">
                          {fiduciaryMetrics.capGama.toLocaleString("pt-BR")}{" "}
                          un/round
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matriz interativa de demonstrações */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-white uppercase italic flex items-center gap-2">
                      <ClipboardList size={14} className="text-orange-500" />{" "}
                      Demonstrações Fiduciárias Dinâmicas
                    </h4>
                    <span className="text-[9px] font-black text-slate-500 font-mono uppercase bg-white/5 px-2.5 py-1 rounded-full">
                      Sincronizado
                    </span>
                  </div>
                  <FinancialStructureEditor
                    initialBalance={editableFinancials.balance_sheet}
                    initialDRE={editableFinancials.dre}
                    initialCashFlow={editableFinancials.cash_flow}
                    onChange={(u) => setEditableFinancials(u as any)}
                    currency={tutorConfig.currency}
                    readOnly
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 z-[100]">
                <button
                  onClick={() => {
                    handleRecalculate();
                    alert(
                      "Dados do P0 recalculados com sucesso das configurações fiduciárias!",
                    );
                  }}
                  className="px-6 py-3 bg-slate-900 border border-white/10 hover:border-orange-500/30 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                >
                  <Activity size={12} /> Forçar Recálculo
                </button>
                <button
                  onClick={() => setShowFiduciaryMonitor(false)}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  Continuar Configurando
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmação do salvar template */}
      <AnimatePresence>
        {showSaveTplModal && (
          <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-white/10 p-10 rounded-[3rem] max-w-lg w-full space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in duration-200 text-left">
              <h3 className="text-2xl font-black text-white uppercase italic">
                Salvar P0 como Template
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Nome do Template
                  </label>
                  <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Cenario Dificil Autopeças"
                    className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-black animate-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Descrição detalhada
                  </label>
                  <textarea
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    placeholder="Este modelo inicia as equipes com altos compromissos de endividamento..."
                    className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs h-24 font-medium animate-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowSaveTplModal(false)}
                  className="px-6 py-3 bg-slate-950 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTpl}
                  className="px-8 py-3 bg-emerald-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white hover:text-emerald-950 transition-colors"
                >
                  Gravar Template
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
    <div
      className={`p-4 rounded-2xl ${color === "orange" ? "bg-orange-600/20 text-orange-500" : "bg-blue-600/20 text-blue-500"}`}
    >
      {icon}
    </div>
    <div className="text-left">
      <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
        {label}
      </span>
      <span className="text-2xl font-black text-white font-mono italic">
        {formatCurrency(val, currency)}
      </span>
    </div>
  </div>
);

const CompactMatrixRow = ({
  label,
  macroKey,
  rules,
  update,
  icon,
  periods,
  isExchange,
  readOnly,
}: any) => (
  <tr className="hover:bg-white/[0.04] transition-colors group">
    <td className="p-3 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors w-[280px] min-w-[280px]">
      <div className="flex items-center gap-3">
        <div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">
          {icon || <Settings2 size={10} />}
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate">
          {label}
        </span>
      </div>
    </td>
    {Array.from({ length: periods }).map((_, i) => {
      const val =
        rules[i]?.[macroKey] ??
        DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ??
        0;
      return (
        <td
          key={i}
          className={`p-1 border-r border-white/5 ${i === 0 ? "bg-orange-600/5" : ""}`}
        >
          <input
            type="number"
            step={isExchange ? "0.000001" : "0.1"}
            value={val}
            readOnly={readOnly}
            onChange={(e) =>
              !readOnly && update(i, macroKey, parseFloat(e.target.value))
            }
            className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black outline-none transition-all shadow-inner ${readOnly ? "cursor-not-allowed opacity-60 text-slate-400" : "focus:border-orange-500 text-white"}`}
          />
        </td>
      );
    })}
  </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-6">
    <div className="p-4 bg-slate-900 border border-orange-500/30 rounded-2xl text-orange-500 shadow-2xl flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="text-left">
      <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
        {title}
      </h3>
      <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5 italic text-left">
        {desc}
      </p>
    </div>
  </div>
);

const WizardField = ({
  label,
  val,
  onChange,
  type = "text",
  placeholder,
  isCurrency,
  currency,
  isLocked,
  maxLength,
  className,
}: any) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (type === "currency" && typeof val === "number") {
      setDisplayValue(formatCurrency(val, currency, false));
    } else {
      setDisplayValue(String(val));
    }
  }, [val, type, currency]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    if (type === "currency") {
      const digits = rawText.replace(/\D/g, "");
      const numericValue = parseInt(digits || "0") / 100;
      onChange(numericValue);
    } else {
      onChange(rawText);
    }
  };

  return (
    <div className={`space-y-1.5 text-left group ${className || ""}`}>
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 group-focus-within:text-orange-500 transition-colors italic">
        {label}
      </label>
      <div className="relative font-sans">
        <input
          type={type === "currency" ? "text" : type}
          value={type === "currency" ? displayValue : val}
          readOnly={isLocked}
          onChange={handleTextChange}
          maxLength={maxLength}
          className={`w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none transition-all shadow-inner ${isLocked ? "opacity-40 cursor-not-allowed" : "focus:border-orange-500"} font-mono`}
          placeholder={placeholder}
        />
        {(isCurrency || type === "currency") && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600">
            {getCurrencySymbol(currency)}
          </span>
        )}
      </div>
    </div>
  );
};

const WizardSelect = ({ label, val, onChange, options, isLocked, className }: any) => (
  <div className={`space-y-1.5 text-left group ${className || ""}`}>
    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 group-focus-within:text-orange-500 transition-colors italic">
      {label}
    </label>
    <select
      value={val}
      disabled={isLocked}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-5 py-3 text-xs font-black text-white uppercase outline-none transition-all shadow-inner appearance-none ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer focus:border-orange-600"}`}
    >
      {options.map((o: any) => (
        <option key={o.v} value={o.v} className="bg-slate-900">
          {o.l}
        </option>
      ))}
    </select>
  </div>
);

export default TrialWizard;
