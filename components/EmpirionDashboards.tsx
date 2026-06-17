import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Truck, 
  Users,
  Eye, 
  EyeOff, 
  Sliders, 
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmpirionDashboardsProps {
  history: any[];
  currentKpis: any;
  activeArena: any;
  activeTeam: any;
  onClose: () => void;
}

export const EmpirionDashboards: React.FC<EmpirionDashboardsProps> = ({
  history = [],
  currentKpis = {},
  activeArena = {},
  activeTeam = {},
  onClose
}) => {
  // 1. Estados de Navegação e Sidebar
  const [activeTab, setActiveTab] = useState<'macroeconomics' | 'financial' | 'logistics' | 'industrial'>('financial');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Indica se a barra deve ser mostrada como expandida (apenas por toggle manual)
  const isVisuallyExpanded = !isSidebarCollapsed;

  // 2. Estados de Governança e Identidade (Filtros Globais)
  const [tacticalGovernance, setTacticalGovernance] = useState<'baixo' | 'medio' | 'alto' | 'total'>('total');
  const [teamIdentity, setTeamIdentity] = useState<'anonima' | 'identificada'>('identificada');

  // 3. Estados dos Dropdowns internos de Gráficos (Mutações de Série)
  const [financialChart1Option, setFinancialChart1Option] = useState<'completo' | 'ativo_passivo' | 'evolucao_equipe'>('completo');
  const [financialChart2Option, setFinancialChart2Option] = useState<'completo' | 'receita_cpv' | 'lucro_separado'>('completo');
  const [financialChart3Option, setFinancialChart3Option] = useState<'pl_total' | 'roe_pl' | 'endividamento_pl'>('pl_total');
  
  const [logisticChart1Option, setLogisticChart1Option] = useState<'volume' | 'valores'>('volume');
  const [logisticChart2Option, setLogisticChart2Option] = useState<'margem' | 'outros_kpis_margens'>('margem');

  const [industrialChart1Option, setIndustrialChart1Option] = useState<'produzido' | 'produtividade_horas'>('produzido');
  const [industrialChart2Option, setIndustrialChart2Option] = useState<'giro_mp' | 'estatistica_geral'>('giro_mp');

  // 4. Estados do Modal de Expansão (Zoom)
  const [expandedChart, setExpandedChart] = useState<{ id: string; title: string; options: any; series: any[] } | null>(null);

  // Moeda e Rodadas
  const currency = activeArena?.currency || 'BRL';
  const currentRound = activeArena?.current_round || 1;

  // Lógica de Anonimização das Equipes
  const formatTeamName = (name: string, index: number) => {
    if (teamIdentity === 'anonima') {
      return `Time ${index + 1}`;
    }
    return name || `Equipe ${index + 1}`;
  };

  // 5. Histórico e Geração Dinâmica Baseada em Filtros de Governança
  const computedHistory = useMemo(() => {
    const list = history.length === 0 ? Array.from({ length: currentRound + 1 }).map((_, r) => {
      const factor = 1 + (r * 0.15);
      return {
        round: r,
        equity: (activeTeam?.equity || 1200000) * factor,
        revenue: 1500000 * factor,
        costs: 1100000 * factor,
        ebitda: 400000 * factor,
        net_profit: 300000 * factor * (r === 0 ? 0.3 : 1),
        cash: 800000 * factor,
        capital_social: 1000000,
        lucro_acumulado: 200000 * factor,
        liability_st: 120000 * factor,
        liability_lt: 560000,
        assets: 2500000 * factor,
        liabilities: 1300000 * factor,
        kpis: {
          liquidity_current: 1.5 + (r * 0.1),
          inventory_turnover: 12.5 + r,
          altman_z_score: 5.5 + r,
          ccc: 30 - r,
          scissors_effect: 200000 - (r * 15000),
          esds: { esds_display: 70 + (r * 2) },
        }
      };
    }) : history;

    return list.map((h, r) => {
      const factor = 1 + (r * 0.15);
      return {
        round: typeof h.round === 'number' ? h.round : r,
        equity: Number.isFinite(h.equity) ? h.equity : ((activeTeam?.equity || 1200000) * factor),
        revenue: Number.isFinite(h.revenue) ? h.revenue : (1500000 * factor),
        costs: Number.isFinite(h.costs) ? h.costs : (1100000 * factor),
        ebitda: Number.isFinite(h.ebitda) ? h.ebitda : (400000 * factor),
        net_profit: Number.isFinite(h.net_profit) ? h.net_profit : (300000 * factor),
        cash: Number.isFinite(h.cash) ? h.cash : (800000 * factor),
        capital_social: Number.isFinite(h.capital_social) ? h.capital_social : 1000000,
        lucro_acumulado: Number.isFinite(h.lucro_acumulado) ? h.lucro_acumulado : (200000 * factor),
        liability_st: Number.isFinite(h.liability_st) ? h.liability_st : (120000 * factor),
        liability_lt: Number.isFinite(h.liability_lt) ? h.liability_lt : 560000,
        assets: Number.isFinite(h.assets) ? h.assets : (2540000 * factor),
        liabilities: Number.isFinite(h.liabilities) ? h.liabilities : (1230000 * factor),
        kpis: {
          liquidity_current: Number.isFinite(h.kpis?.liquidity_current) ? h.kpis.liquidity_current : (1.5 + (r * 0.1)),
          inventory_turnover: Number.isFinite(h.kpis?.inventory_turnover) ? h.kpis.inventory_turnover : (12.5 + r),
          altman_z_score: Number.isFinite(h.kpis?.altman_z_score) ? h.kpis.altman_z_score : (5.5 + r),
          ccc: Number.isFinite(h.kpis?.ccc) ? h.kpis.ccc : (30 - r),
          scissors_effect: Number.isFinite(h.kpis?.scissors_effect) ? h.kpis.scissors_effect : (200000 - (r * 15000)),
          esds: {
            esds_display: Number.isFinite(h.kpis?.esds?.esds_display) ? h.kpis.esds.esds_display : (70 + r * 2)
          }
        }
      };
    });
  }, [history, currentRound, activeTeam]);

  const roundsCategories = useMemo(() => {
    return computedHistory.map(h => `R-${h.round < 10 ? '0' : ''}${h.round}`);
  }, [computedHistory]);

  const competitorsList = useMemo(() => {
    const list = activeArena?.teams || [
      { id: '1', name: 'Alpha Corp', equity: 1500000, color: '#39FF14' },
      { id: '2', name: 'Beta Solutions', equity: 1300000, color: '#00FFFF' },
      { id: '3', name: 'Real Dynamic', equity: 1600000, color: '#FF00FF' },
      { id: '4', name: 'Sigma Industries', equity: 1100000, color: '#FFFF33' },
    ];
    // Se governança for baixo, remove outros competidores da exibição corporativa
    if (tacticalGovernance === 'baixo') {
      return list.filter((t: any) => t.id === activeTeam?.id);
    }
    return list;
  }, [activeArena, activeTeam, tacticalGovernance]);

  // 5.1 PREPARAÇÃO DOS DADOS DO HEATMAP CONTÁBIL DINÂMICO
  const computedContabilRows = useMemo(() => {
    const getValForRound = (h: any, metric: string) => {
      if (!h) return 0;
      const assets = h.assets || 0;
      const liability_st = h.liability_st || 1;
      const liability_lt = h.liability_lt || 0;
      const equity = h.equity || 1;
      const net_profit = h.net_profit || 0;
      const revenue = h.revenue || 1;
      const liabilities = h.liabilities || 0;

      switch (metric) {
        case 'liquidez':
          return h.kpis?.liquidity_current ?? (assets / liability_st);
        case 'endividamento':
          return (liability_lt || (liabilities / 2)) / equity;
        case 'roe':
          return (net_profit / equity) * 100;
        case 'margem_liquida':
          return (net_profit / revenue) * 100;
        case 'giro_ativo':
          return revenue / assets;
        default:
          return 0;
      }
    };

    return [
      { 
        name: 'Liquidez Corrente',
        vals: computedHistory.map(h => getValForRound(h, 'liquidez')),
        safe: [1.6, 2.2],
        type: 'ratio'
      },
      { 
        name: 'Endividamento LP',
        vals: computedHistory.map(h => getValForRound(h, 'endividamento')),
        safe: [0.3, 1.2],
        type: 'ratio_inv'
      },
      { 
        name: 'Margem ROE',
        vals: computedHistory.map(h => getValForRound(h, 'roe')),
        safe: [12, 25],
        type: 'percent'
      },
      { 
        name: 'Margem Líquida',
        vals: computedHistory.map(h => getValForRound(h, 'margem_liquida')),
        safe: [8, 16],
        type: 'percent'
      },
      { 
        name: 'Giro do Ativo',
        vals: computedHistory.map(h => getValForRound(h, 'giro_ativo')),
        safe: [0.8, 1.5],
        type: 'ratio'
      }
    ];
  }, [computedHistory]);

  const getContabilCellColor = (val: number, safe: number[], type: string) => {
    if (val === undefined || isNaN(val)) return 'bg-slate-900/40 text-slate-500';
    
    if (type === 'ratio_inv') {
      if (val <= safe[0]) return 'bg-[#2e7d17] text-[#ffffff] font-extrabold';
      if (val <= safe[1]) return 'bg-[#76b014] text-[#ffffff] font-extrabold';
      if (val <= 1.5) return 'bg-[#c19114] text-[#ffffff] font-extrabold';
      return 'bg-[#bf1a1a] text-[#ffffff] font-extrabold';
    } else {
      if (val >= safe[1]) return 'bg-[#2e7d17] text-[#ffffff] font-extrabold';
      if (val >= safe[0]) return 'bg-[#76b014] text-[#ffffff] font-extrabold';
      if (val >= safe[0] * 0.6) return 'bg-[#c19114] text-[#ffffff] font-extrabold';
      return 'bg-[#bf1a1a] text-[#ffffff] font-extrabold';
    }
  };

  // 5.2 PREPARAÇÃO DOS DADOS DO HEATMAP DE ESTOQUE (KARDEX) DINÂMICO
  const computedStockRows = useMemo(() => {
    const getStockValForRound = (h: any, metric: string) => {
      if (!h) return 0;
      const kpis = h.kpis || {};
      const kardex = kpis.kardex || kpis.statements?.kardex || {};

      const mpaFinal = kardex.mpa?.saldoFinalQtd ?? kpis.stock_quantities?.mp_a ?? 30150;
      const mpaSaidas = kardex.mpa?.saidasQtd ?? 90000;

      const mpbFinal = kardex.mpb?.saldoFinalQtd ?? kpis.stock_quantities?.mp_b ?? 20100;
      const mpbSaidas = kardex.mpb?.saidasQtd ?? 60000;

      const paFinal = kardex.pa?.saldoFinalQtd ?? kpis.stock_quantities?.pa ?? 1500;
      const paSaidas = kardex.pa?.saidasQtd ?? 39000;

      const mpaGiro = mpaSaidas > 0 ? ((mpaFinal / mpaSaidas) * 30) : 5.2;
      const mpbGiro = mpbSaidas > 0 ? ((mpbFinal / mpbSaidas) * 30) : 6.7;
      const paGiro = paSaidas > 0 ? ((paFinal / paSaidas) * 30) : 10.2;

      switch (metric) {
        case 'mpa':
          return mpaGiro;
        case 'mpb':
          return mpbGiro;
        case 'pa':
          return paGiro;
        case 'compras_especiais':
          return (kardex.mpa?.comprasEmergenciaValor || 0) + (kardex.mpb?.comprasEmergenciaValor || 0) + (kpis.emergency_purchases_value || 0);
        default:
          return 0;
      }
    };

    return [
      { 
        name: 'Giro MP A',
        vals: computedHistory.map(h => getStockValForRound(h, 'mpa')),
        safe: [4.0, 8.0],
        type: 'days'
      },
      { 
        name: 'Giro MP B',
        vals: computedHistory.map(h => getStockValForRound(h, 'mpb')),
        safe: [4.0, 8.0],
        type: 'days'
      },
      { 
        name: 'Produto Acabado',
        vals: computedHistory.map(h => getStockValForRound(h, 'pa')),
        safe: [8.0, 15.0],
        type: 'days_pa'
      },
      { 
        name: 'Compras Especiais',
        vals: computedHistory.map(h => getStockValForRound(h, 'compras_especiais')),
        safe: [0, 50000],
        type: 'currency'
      }
    ];
  }, [computedHistory]);

  const getStockCellColor = (val: number, safe: number[], type: string) => {
    if (val === undefined || isNaN(val)) return 'bg-slate-900/40 text-slate-500';

    if (type === 'currency') {
      if (val === 0) return 'bg-[#2e7d17] text-[#ffffff] font-extrabold';
      if (val < 150000) return 'bg-[#c19114] text-[#ffffff] font-extrabold';
      return 'bg-[#bf1a1a] text-[#ffffff] font-extrabold';
    }

    if (val >= safe[0] && val <= safe[1]) {
      return 'bg-[#2e7d17] text-[#ffffff] font-extrabold';
    }
    if (val > safe[1] && val <= safe[1] + 4.0) {
      return 'bg-[#76b014] text-[#ffffff] font-extrabold';
    }
    if ((val >= safe[0] - 1.5 && val < safe[0]) || (val > safe[1] + 4.0 && val <= safe[1] + 8.0)) {
      return 'bg-[#c19114] text-[#ffffff] font-extrabold';
    }
    return 'bg-[#bf1a1a] text-[#ffffff] font-extrabold';
  };

  // Formatação em Moeda Nativa
  const formatValue = (val: number, isCurrency = true) => {
    if (!isCurrency) return val.toFixed(1);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  // 6. DETALHAMENTO DE CONFIGURAÇÃO DE GRÁFICOS (APEXCHARTS)
  // CONFIGURAÇÕES PADRÃO DE DESIGN TOKENS EMPIRION
  const getBaseChartOptions = (title: string, yaxisFormatter?: (val: any) => string) => ({
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    title: {
      text: title,
      align: 'left' as const,
      style: {
        fontSize: '11px',
        fontWeight: '900',
        fontFamily: 'Inter, sans-serif',
        color: '#FFFFFF'
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.03)',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 5, right: 5, top: 10, bottom: 5 }
    },
    xaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace'
        },
        formatter: yaxisFormatter || ((val: any) => {
          if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
          if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}k`;
          return val;
        })
      }
    },
    legend: {
      show: true,
      position: 'bottom' as const,
      fontSize: '10px',
      fontFamily: 'Inter, sans-serif',
      labels: { colors: '#E0E0E0' },
      markers: { size: 4 }
    },
    tooltip: {
      theme: 'dark',
      style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' },
      y: {
        formatter: (val: any, { seriesIndex, w }: any) => {
          const seriesName = w?.config?.series?.[seriesIndex]?.name || '';
          const chartTitle = w?.config?.title?.text || '';
          
          const isPercent = 
            seriesName.includes('%') || 
            seriesName.toLowerCase().includes('margem') || 
            seriesName.toLowerCase().includes('share') || 
            seriesName.toLowerCase().includes('iva') || 
            seriesName.toLowerCase().includes('taxa') || 
            seriesName.toLowerCase().includes('inflação') ||
            seriesName.toLowerCase().includes('inflacao') ||
            seriesName.toLowerCase().includes('produtividade') ||
            seriesName.toLowerCase().includes('motivação') ||
            seriesName.toLowerCase().includes('motivacao') ||
            chartTitle.includes('(%)') ||
            chartTitle.toLowerCase().includes('participação') ||
            chartTitle.toLowerCase().includes('participacao') ||
            chartTitle.toLowerCase().includes('clima') ||
            chartTitle.toLowerCase().includes('retorno');

          if (isPercent && typeof val === 'number') {
            return `${val.toFixed(1).replace('.', ',')}%`;
          }
          
          if (typeof val === 'number') {
            if (yaxisFormatter) {
              return yaxisFormatter(val);
            }
            if (val === 0) return '0';
            if (Math.abs(val) >= 1e6) {
              return `${(val / 1e6).toFixed(2).replace('.', ',')}M`;
            }
            return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
          }
          return val;
        }
      }
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    dataLabels: { enabled: false }
  });

  // RENDERIZADOR DO MODAL DE EXPANSÃO (ZOOM)
  const renderChartZoomModal = () => (
    <AnimatePresence>
      {expandedChart && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl bg-[#0E1726] border border-white/10 rounded-[2.5rem] overflow-hidden p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex justify-between items-center bg-[#1E1E2F]/50 p-4 rounded-2xl border border-white/5">
              <h3 className="text-sm font-black text-white italic uppercase tracking-wider">{expandedChart.title}</h3>
              <button 
                onClick={() => setExpandedChart(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 min-h-[450px] w-full">
              <Chart 
                options={{
                  ...expandedChart.options,
                  chart: { ...expandedChart.options.chart, height: 420 },
                  title: { show: false },
                  legend: { ...expandedChart.options.legend, fontSize: '11px' },
                }}
                series={expandedChart.series}
                type={((expandedChart.options.chart as any).type || 'line') as any}
                height={420}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="fixed inset-0 z-[2000] bg-[#060B13] text-[#E0E0E0] font-sans flex overflow-hidden animate-in fade-in duration-500">
      
      {/* SIDEBAR LATERAL RETRÁTIL (SOBREPÕE O DASHBOARD SEM EMPURRAR) */}
      <motion.aside 
        animate={{ width: isVisuallyExpanded ? '260px' : '72px' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed top-0 bottom-0 left-0 z-40 h-full bg-[#051523] border-r border-white/5 flex flex-col justify-between shrink-0 select-none shadow-2xl shadow-black/80"
      >
        <div className="flex flex-col gap-5 pt-6">
          
          {/* Logo do EMPIRION */}
          <div className="px-4 flex items-center justify-between min-h-[40px] gap-2">
            {isVisuallyExpanded ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg">E</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-[0.15em] text-white">EMPIRION</span>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-[#FFFFB5]">Dashboards</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg mx-auto">E</div>
            )}
          </div>

          {/* Container de Controle Superior (Botão SAIR + Switch Compacto) */}
          <div className="px-3">
            <div className={`flex ${isVisuallyExpanded ? 'flex-row justify-between items-center bg-white/5 rounded-2xl p-2 border border-white/5 gap-2' : 'flex-col items-center gap-4 bg-white/5 rounded-2xl py-3 px-1 border border-white/5'}`}>
              
              {/* Botão SAIR (À esquerda no expandido, ou centralizado em destaque no colapsado) */}
              <button 
                onClick={onClose}
                className={`flex items-center justify-center text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 transition-all font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg ring-1 ring-white/10 ${
                  isVisuallyExpanded ? 'py-1.5 px-3 gap-1.5' : 'w-10 h-10 rounded-full'
                }`}
                title="SAIR"
              >
                <ChevronLeft size={16} />
                {isVisuallyExpanded && "SAIR"}
              </button>

              {/* Toggle Switch Lateral de Colapso */}
              <button
                role="switch"
                aria-checked={!isSidebarCollapsed}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  !isSidebarCollapsed ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    !isSidebarCollapsed ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Informações da Competição / Arena (Apenas visíveis quando expandido) */}
          {isVisuallyExpanded && (
            <div className="px-3">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#0E1726]/80 rounded-2xl border border-white/5 space-y-2.5 shadow-xl"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Arena Corporativa</span>
                  <span className="text-[10px] font-bold text-white truncate text-ellipsis" title={activeArena?.name || "Trial Industrial"}>
                    {activeArena?.name || "Trial Industrial"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Minha Equipa</span>
                  <span className="text-[10px] font-black text-indigo-400 truncate text-ellipsis italic">
                    {formatTeamName(activeTeam?.name, 0)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Período Fiscal</span>
                  <span className="text-[10px] font-black text-amber-300 italic">
                    ROUND 0{currentRound}
                  </span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filtros de Governança Integrados no Sidebar (Apenas visíveis quando expandido) */}
          {isVisuallyExpanded && (
            <div className="px-3 py-4 border-y border-white/5 space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  <Sliders size={10} className="text-amber-500" />
                  "Governança Tática"
                </label>
                <select 
                  value={tacticalGovernance}
                  onChange={(e) => setTacticalGovernance(e.target.value as any)}
                  className="w-full bg-[#1E1E2F] border border-white/5 rounded-xl px-2.5 py-1 text-[10px] font-bold text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="baixo">Baixa (Sigilosa)</option>
                  <option value="medio">Média (Padrão)</option>
                  <option value="alto">Alta (Transparente)</option>
                  <option value="total">Total (Open Data)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10} className="text-[#00FFFF]" />
                  "Identidade das Marcas"
                </label>
                <select 
                  value={teamIdentity}
                  onChange={(e: any) => setTeamIdentity(e.target.value)}
                  className="w-full bg-[#1E1E2F] border border-white/5 rounded-xl px-2.5 py-1 text-[10px] font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="identificada">Identificada</option>
                  <option value="anonima">Anônima (Mascarada)</option>
                </select>
              </div>
            </div>
          )}

          {/* Menus Verticais (CTAs dos Dashboards) */}
          <nav className="flex flex-col gap-1 px-2">
            {[
              { id: 'macroeconomics', label: 'MACROECONOMICS', icon: <Globe size={16} /> },
              { id: 'financial', label: 'ACCOUNTING & FINANCIAL', icon: <Layers size={16} /> },
              { id: 'logistics', label: 'LOGISTICS & MARKET', icon: <Truck size={16} /> },
              { id: 'industrial', label: 'INDUSTRIAL & HR', icon: <Users size={16} /> }
            ].map((btn) => {
              const active = activeTab === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as any)}
                  className={`w-full py-3 px-3 rounded-xl flex items-center transition-all ${
                    isVisuallyExpanded ? 'gap-3 justify-start' : 'justify-center'
                  } ${
                    active 
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border-l-4 border-blue-500 font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${active ? 'bg-blue-500/20 text-blue-400' : ''}`}>
                    {btn.icon}
                  </div>
                  {isVisuallyExpanded && (
                    <span className="text-[10px] tracking-wider font-bold text-left">{btn.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* CORE CANVAS (ÁREA PRINCIPAL COMPENSANDO A LARGURA COLAPSADA FIXA DE 72PX) */}
      <main className="ml-[72px] w-[calc(100%-72px)] flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#060B13] to-[#03060a] p-4 gap-4">
        
        {/* CONTAINER DO DASHBOARD SELECIONADO: Agora com auto rolagem para evitar qualquer esmagamento de canvas */}
        <div className="flex-1 overflow-y-auto relative pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* ========================================================= */}
          {/* 1. VIEW MACROECONOMICS */}
          {/* ========================================================= */}
          {activeTab === 'macroeconomics' && (
            <div className="flex flex-col gap-4 pb-6 min-h-min">
              
              {/* Candlestick Moedas */}
              <div className="h-[310px] min-h-[310px] bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 relative flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    <Coins size={14} className="text-amber-400" /> Variação Cambial Real de Moedas (BRL vs USD / EUR / GBP / CNY / BTC)
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const opts = getBaseChartOptions('Taxas de Câmbio de Moedas') as any;
                        opts.chart.type = 'candlestick';
                        setExpandedChart({
                          id: 'candlestick',
                          title: 'Currency Exchange Rates (BRL vs USD/EUR/GBP/CNY/BTC)',
                          options: opts,
                          series: [{
                            name: 'Câmbio USD',
                            data: computedHistory.map((h) => {
                              const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[0] || {};
                              const v = r.USD || 5.20;
                              return {
                                x: `R-0${h.round}`,
                                y: [v * 0.99, v * 1.015, v * 0.98, v]
                              };
                            })
                          }]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 w-full font-mono">
                  <Chart 
                    options={{
                      ...getBaseChartOptions(''),
                      chart: { type: 'candlestick' as const, height: '100%', toolbar: { show: false } },
                      colors: ['#00FFFF', '#FF00FF'],
                      xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '9px' } } }
                    }}
                    series={[{
                      name: 'Câmbio USD (Fechamento Real)',
                      data: computedHistory.map((h) => {
                        const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[0] || {};
                        const v = r.USD || 5.20;
                        return {
                          x: `R-0${h.round}`,
                          y: [v * 0.995, v * 1.01, v * 0.985, v]
                        };
                      })
                    }]}
                    type="candlestick"
                    height={245}
                  />
                </div>
              </div>

              {/* Bloco Central (ICE vs Inf vs Dem, IVA Purchases vs Sales, Export Tariffs) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col relative justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Correlação de Mercado</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-white uppercase italic">ICE × Inflação × Demanda</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'ice',
                          title: 'ICE x Inflação x Variação de Demanda',
                          options: getBaseChartOptions('Correlação Macro'),
                          series: [
                            { 
                              name: 'ICE', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.ice !== undefined ? r.ice : 0;
                              }) 
                            },
                            { 
                              name: 'Inflação', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.inflation_rate !== undefined ? r.inflation_rate : 0;
                              }) 
                            },
                            { 
                              name: 'Demanda', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.demand_variation !== undefined ? r.demand_variation : 0;
                              }) 
                            }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#39FF14', '#FF5F1F', '#00FFFF'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { 
                          name: 'ICE (%)', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.ice !== undefined ? r.ice : 0;
                          }) 
                        },
                        { 
                          name: 'Inf (%)', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.inflation_rate !== undefined ? r.inflation_rate : 0;
                          }) 
                        },
                        { 
                          name: 'Dem (%)', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.demand_variation !== undefined ? r.demand_variation : 0;
                          }) 
                        }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col relative justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Impostos Fiduciários</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-white uppercase italic">IVA: Compras vs Vendas</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'iva',
                          title: 'IVA Purchases vs Sales',
                          options: getBaseChartOptions('Tributação'),
                          series: [
                            { 
                              name: 'IVA Compras', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.vat_purchases_rate !== undefined ? r.vat_purchases_rate : 0;
                              }) 
                            },
                            { 
                              name: 'IVA Vendas', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.vat_sales_rate !== undefined ? r.vat_sales_rate : 0;
                              }) 
                            }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#FF5F1F', '#00FFFF'],
                        plotOptions: { bar: { columnWidth: '45%' } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { 
                          name: 'IVA Compras', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.vat_purchases_rate !== undefined ? r.vat_purchases_rate : 0;
                          }) 
                        },
                        { 
                          name: 'IVA Vendas', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.vat_sales_rate !== undefined ? r.vat_sales_rate : 0;
                          }) 
                        }
                      ]}
                      type="bar"
                      height={180}
                    />
                  </div>
                </div>

                {/* Heatmap de Tarifas de Exportação */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Políticas Protecionistas</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Tarifas de Exportação</h5>
                    <div className="text-[#00FFFF] cursor-pointer" title="Demonstra as tarifas fiduciárias cobradas na exportação por round">
                      <Info size={12} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-[9px] font-mono leading-none border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="py-2">Região</th>
                          {roundsCategories.slice(0, 5).map(c => <th className="text-center py-2" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const targetRounds = computedHistory.slice(0, 5);
                          const regions = [
                            { name: 'Brasil', key: 'export_tariff_brazil' as const, bg: 'bg-[#00FFEF]/10 text-[#00FFEF]' },
                            { name: 'EUA', key: 'export_tariff_usa' as const, bg: 'bg-[#FF5F1F]/10 text-[#FF5F1F]' },
                            { name: 'Euro', key: 'export_tariff_euro' as const, bg: 'bg-[#9D00FF]/10 text-[#9D00FF]' },
                            { name: 'UK', key: 'export_tariff_uk' as const, bg: 'bg-[#0FF0FC]/10 text-[#0FF0FC]' },
                            { name: 'China', key: 'export_tariff_china' as const, bg: 'bg-red-500/10 text-red-400' }
                          ];

                          return regions.map((row, i) => {
                            const rates = targetRounds.map(h => {
                              const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                              const val = r[row.key] !== undefined ? r[row.key] : 0;
                              return `${val}%`;
                            });
                            return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-1.5 font-bold text-white text-[8px] uppercase italic">{row.name}</td>
                                {rates.map((rate, rIdx) => (
                                  <td key={rIdx} className="text-center py-1.5">
                                    <span className={`px-1.5 py-0.5 rounded ${row.bg} text-[8px] font-bold`}>{rate}</span>
                                  </td>
                                ))}
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Bloco Inferior (Interest Rate vs Debt Level + PIB Area + Inflação vs Preço Médio) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col relative justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-[#FF073A] uppercase tracking-widest">Estrutura de Capital</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Custo de Capital vs Exigível</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'juros',
                          title: 'Juros x Endividamento Realizado',
                          options: getBaseChartOptions('Endividamento'),
                          series: [
                            { 
                              name: 'Juros TR (%)', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.interest_rate_tr !== undefined ? r.interest_rate_tr : 0;
                              }) 
                            },
                            { 
                              name: 'Endividamento LP', 
                              data: computedHistory.map(h => h.liability_lt || (h.liabilities / 2)) 
                            }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#FF2400', '#FFD700'],
                        stroke: { curve: 'smooth', width: [3, 2] },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { 
                          name: 'Juros TR (%)', 
                          type: 'line', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.interest_rate_tr !== undefined ? r.interest_rate_tr : 0;
                          }) 
                        },
                        { 
                          name: 'Endividamento', 
                          type: 'column', 
                          data: computedHistory.map(h => h.liabilities / 2) 
                        }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <span className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest italic font-bold">PIB NACIONAL (ATIVIDADE ECONÔMICA)</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Evolução do PIB Econômico</h5>
                    <div className="text-[#39FF14] cursor-pointer" title="Taxa real de crescimento do PIB agregando a atividade e demanda">
                      <Info size={12} />
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 w-full">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#1DE9B6'],
                        fill: { type: 'gradient', gradient: { shadeIntensity: 0.5, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 95, 100] } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[{
                        name: 'PIB (%)',
                        data: computedHistory.map(h => {
                          const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                          const basePIB = 2.0;
                          const demandEffect = (r.demand_variation || 0) * 0.05;
                          const iceEffect = ((r.ice || 0) - 5) * 0.1;
                          return Number((basePIB + demandEffect + iceEffect).toFixed(2));
                        })
                      }]}
                      type="area"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col relative justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estratégias de Custos e Repasses</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Inflação vs Reajuste de MP A</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'infl',
                          title: 'Inflação vs Reajuste de MP A (Insumos)',
                          options: getBaseChartOptions('Ajuste de Preços'),
                          series: [
                            { 
                              name: 'Inflação Período (%)', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.inflation_rate !== undefined ? r.inflation_rate : 0;
                              }) 
                            },
                            { 
                              name: 'Reajuste MP A (%)', 
                              data: computedHistory.map(h => {
                                const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                                return r.raw_material_a_adjust !== undefined ? r.raw_material_a_adjust : 0;
                              }) 
                            }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#FF073A', '#8F00FF'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { 
                          name: 'Inflação Período (%)', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.inflation_rate !== undefined ? r.inflation_rate : 0;
                          }) 
                        },
                        { 
                          name: 'Reajuste MP A (%)', 
                          data: computedHistory.map(h => {
                            const r = activeArena?.round_rules?.[h.round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[h.round] || {};
                            return r.raw_material_a_adjust !== undefined ? r.raw_material_a_adjust : 0;
                          }) 
                        }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. VIEW FINANCIAL & ACCOUNTING */}
          {/* ========================================================= */}
          {activeTab === 'financial' && (
            <div className="flex flex-col gap-4 pb-6 min-h-min">
              
              {/* Fileira Superior (6 Scorecards Compactos) */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
                {[
                  { label: 'Ativo Total', val: computedHistory[computedHistory.length - 1]?.assets || 2540000, change: '+3.2%', isPos: true },
                  { label: 'Passivo Total', val: computedHistory[computedHistory.length - 1]?.liabilities || 1230000, change: '+1.8%', isPos: false },
                  { label: 'Patrimônio Líquido', val: computedHistory[computedHistory.length - 1]?.equity || 1310000, change: '+4.5%', isPos: true },
                  { label: 'Capital Social', val: computedHistory[computedHistory.length - 1]?.capital_social || 1000000, change: '0%', isPos: true },
                  { label: 'Lucro Acumulado', val: computedHistory[computedHistory.length - 1]?.lucro_acumulado || 310000, change: '+9.4%', isPos: true },
                ].map((card, idx) => (
                  <div key={idx} className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                    <h4 className="text-sm font-black text-white italic tracking-tight">{formatValue(card.val)}</h4>
                    <span className={`text-[8px] font-black flex items-center gap-0.5 ${card.isPos ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {card.isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {card.change}
                    </span>
                  </div>
                ))}
                
                {/* Endividamento Isolado */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-[#FF073A]/20 flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-[#FF5F1F] uppercase tracking-wider">Endividamento Estruturado</span>
                  <div className="flex justify-between items-center gap-1">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 uppercase">Curto Prazo</span>
                      <strong className="text-white text-[9px]">1,2M</strong>
                    </div>
                    <div className="w-px h-4 bg-white/5" />
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 uppercase">Longo Prazo</span>
                      <strong className="text-[#FFD700] text-[9px]">5,6M</strong>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-rose-500 flex items-center gap-0.5">
                    <TrendingUp size={8} /> +2.1%
                  </span>
                </div>
              </div>

              {/* Segunda Linha (Balanço Comparativo & DRE Comparativo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[320px] min-h-[290px] h-auto shrink-0">
                
                {/* Balanço Comparativo */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 relative flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[#00FFFF] uppercase tracking-tight">Análise Patrimonial</span>
                      <select 
                        value={financialChart1Option}
                        onChange={(e) => setFinancialChart1Option(e.target.value as any)}
                        className="bg-[#1E1E2F] border border-white/10 rounded-lg text-[9px] px-2 py-0.5 text-white focus:outline-none"
                      >
                        <option value="completo">Estrutura de Balanço</option>
                        <option value="ativo_passivo">Ativo x Passivo</option>
                        <option value="evolucao_equipe">Série Histórica Plena</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'balanco',
                          title: 'Balanço Patrimonial Comparativo',
                          options: getBaseChartOptions('Contas do Balanço'),
                          series: [
                            { name: 'Ativo', data: computedHistory.map(h => h.assets) },
                            { name: 'Passivo', data: computedHistory.map(h => h.liabilities) },
                            { name: 'Patrimônio Líquido', data: computedHistory.map(h => h.equity) }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#00FFFF', '#FF5F1F', '#39FF14'],
                        plotOptions: { bar: { columnWidth: '40%' } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={
                        financialChart1Option === 'ativo_passivo' ? [
                          { name: 'Ativo', type: 'column', data: computedHistory.map(h => h.assets) },
                          { name: 'Passivo', type: 'column', data: computedHistory.map(h => h.liabilities) }
                        ] : [
                          { name: 'Ativo', type: 'column', data: computedHistory.map(h => h.assets) },
                          { name: 'Passivo', type: 'column', data: computedHistory.map(h => h.liabilities) },
                          { name: 'Patrimônio Líquido', type: 'line', data: computedHistory.map(h => h.equity) }
                        ]
                      }
                      type="line"
                      height={245}
                    />
                  </div>
                </div>

                {/* DRE Comparativo */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 relative flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[#FFD700] uppercase tracking-tight">Demonstrativo D.R.E</span>
                      <select 
                        value={financialChart2Option}
                        onChange={(e) => setFinancialChart2Option(e.target.value as any)}
                        className="bg-[#1E1E2F] border border-white/10 rounded-lg text-[9px] px-2 py-0.5 text-white focus:outline-none"
                      >
                        <option value="completo">Evolução DRE</option>
                        <option value="receita_cpv">Receitas x Custos</option>
                        <option value="lucro_separado">Lucro Isolado</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'dre',
                          title: 'DRE Comparativo (Receita, CPV e Lucro)',
                          options: getBaseChartOptions('DRE Histórico'),
                          series: [
                            { name: 'Receita Bruta', data: computedHistory.map(h => h.revenue) },
                            { name: 'Custos', data: computedHistory.map(h => h.costs) },
                            { name: 'Lucro Líquido', data: computedHistory.map(h => h.net_profit) }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#FFD700', '#FF2400', '#1DE9B6'],
                        plotOptions: { bar: { columnWidth: '50%' } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={
                        financialChart2Option === 'receita_cpv' ? [
                          { name: 'Receita Bruta', data: computedHistory.map(h => h.revenue) },
                          { name: 'Custos (CPV)', data: computedHistory.map(h => h.costs) }
                        ] : financialChart2Option === 'lucro_separado' ? [
                          { name: 'Lucro Líquido', data: computedHistory.map(h => h.net_profit) }
                        ] : [
                          { name: 'Receita Bruta', data: computedHistory.map(h => h.revenue) },
                          { name: 'Custos', data: computedHistory.map(h => h.costs) },
                          { name: 'Lucro Líquido', data: computedHistory.map(h => h.net_profit) }
                        ]
                      }
                      type="bar"
                      height={245}
                    />
                  </div>
                </div>

              </div>

              {/* Terceira Linha (Evolução do PL, Estrutura Capital, Decisões Contábeis) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase italic">Evolução do PL</span>
                    <select 
                      value={financialChart3Option}
                      onChange={(e) => setFinancialChart3Option(e.target.value as any)}
                      className="bg-[#1E1E2F] border border-white/10 rounded-lg text-[8px] px-1.5 py-0.5 text-white outline-none"
                    >
                      <option value="pl_total">Evolução do PL</option>
                      <option value="roe_pl">ROE vs PL</option>
                      <option value="endividamento_pl">Alavancagem vs PL</option>
                    </select>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#8F00FF', '#39FF14'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { name: 'Patrimônio Líquido', data: computedHistory.map(h => h.equity) },
                        { name: 'Margem Líquida', data: computedHistory.map(h => (h.net_profit / h.revenue) * 100) }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[10px] font-black text-white uppercase italic">Estrutura de Capital vs Lucro</span>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#FF5F1F', '#0FF0FC'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { name: 'Capital de Terceiros', data: computedHistory.map(h => h.liabilities) },
                        { name: 'Excedente Lucro', data: computedHistory.map(h => h.net_profit * 2) }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                {/* Decisões Contábeis (Visual Card) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-[#FFFF33] uppercase tracking-widest italic flex items-center gap-1 mb-1">
                    <ShieldCheck size={12} className="text-[#FFFF33]" /> Políticas & Decisões Contábeis
                  </span>
                  <div className="flex-1 flex flex-col justify-around gap-1">
                    {[
                      { name: 'Dividendos Pagos', val: '30%', isUp: true, color: 'text-emerald-400' },
                      { name: 'Provisão de IR', val: '22%', isUp: false, color: 'text-rose-400' },
                      { name: 'Depreciação Setup', val: '10%/ano', isUp: false, color: 'text-rose-400' },
                      { name: 'Amortizações', val: 'Fluxo Contínuo', isUp: true, color: 'text-emerald-400' }
                    ].map((dec, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-white/5 p-1 px-3 rounded-lg border border-white/5">
                        <span className="font-bold text-slate-300">{dec.name}</span>
                        <div className="flex items-center gap-1">
                          <span className={`${dec.color} font-black font-mono`}>{dec.val}</span>
                          {dec.isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Quarta Linha (Heatmap Contábil & Equity por competidores) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0 animate-fade-in-up">
                
                {/* Heatmap Contábil */}
                <div className="bg-[#0b101f] p-4 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden shadow-2xl">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Matriz de Monitoramento</span>
                  <div className="flex justify-between items-center mb-3 mt-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Heatmap Contábil fiduciário</h5>
                    <Info size={11} className="text-amber-400" />
                  </div>
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-separate border-spacing-x-1.5 border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="pb-2 text-left font-sans font-bold text-slate-400">Indicador</th>
                          {roundsCategories.map(c => <th className="pb-2 font-black font-mono text-slate-400 text-center w-12" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {computedContabilRows.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors rounded-lg">
                            <td className="pr-4 text-left font-sans font-bold text-slate-300 text-[10px] whitespace-nowrap uppercase italic tracking-wide">{row.name}</td>
                            {row.vals.map((val, rIdx) => {
                              const cellClass = getContabilCellColor(val, row.safe, row.type);
                              const formattedVal = row.type === 'percent' 
                                ? `${val.toFixed(1)}%` 
                                : val.toFixed(2);
                              return (
                                <td key={rIdx} className="p-0">
                                  <div className={`flex items-center justify-center h-8 w-12 rounded-lg ${cellClass} text-[10px] font-black tracking-tighter shadow-md transition-transform hover:scale-105 duration-100`}>
                                    {formattedVal}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Equity Competidores */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Benchmarking Concorrencial</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Patrimônio Líquido Acumulado</h5>
                    <Info size={11} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#00FFEF', '#00FFFF', '#CCFF00', '#FF00FF'],
                        plotOptions: { bar: { horizontal: false, columnWidth: '40%' } },
                        xaxis: { categories: competitorsList.map((t: any, idx: number) => formatTeamName(t.name, idx)) }
                      }}
                      series={[{
                        name: 'PL por Competidor',
                        data: competitorsList.map((t: any) => t.equity)
                      }]}
                      type="bar"
                      height={180}
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 3. VIEW LOGISTICS & MARKET */}
          {/* ========================================================= */}
          {activeTab === 'logistics' && (
            <div className="flex flex-col gap-4 pb-6 min-h-min">
              
              {/* Fileira Superior Cards - 6 Scorecards de Alta Performance */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 shrink-0 animate-fade-in-up">
                
                {/* Card 1: Market Share Ativo */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">MARKET SHARE ATIVO</span>
                  <h4 className="text-base font-black text-[#00FFEF] italic leading-none mt-1">
                    {((activeTeam?.kpis?.market_share !== undefined ? (activeTeam.kpis.market_share * (activeTeam.kpis.market_share < 1 ? 100 : 1)) : 16.3)).toFixed(1)}%
                  </h4>
                  <div className="text-[7.5px] font-bold text-slate-500 mt-1 truncate">
                    Fatia de Mercado Ativa
                  </div>
                </div>

                {/* Card 2: Total Produto Vendido */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">PRODUTO VENDIDO</span>
                  <h4 className="text-base font-black text-white italic leading-none mt-1 font-mono">
                    {(activeTeam?.kpis?.last_units_sold ?? activeTeam?.kpis?.sold_quantity ?? 39000).toLocaleString('pt-BR')} un
                  </h4>
                  <div className="text-[7.5px] font-bold text-emerald-400 mt-1 truncate">
                    Consolidado Rodada
                  </div>
                </div>

                {/* Card 3: Preço Médio Praticado */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">PREÇO MÉDIO CASADO</span>
                  <h4 className="text-base font-black text-[#FFD700] italic leading-none mt-1">
                    {formatValue(activeTeam?.kpis?.avg_price_local || activeTeam?.kpis?.avg_price || 1.40)}
                  </h4>
                  <div className="text-[7.5px] font-bold text-slate-500 mt-1 truncate">
                    Geral Praticado
                  </div>
                </div>

                {/* Card 4: Prazo de Recebimento (PMR) */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">PRAZO RECEBIMENTO</span>
                  <h4 className="text-base font-black text-[#CCFF00] italic leading-none mt-1 font-mono">
                    {activeTeam?.kpis?.avg_receivable_days || currentKpis?.avg_receivable_days || 45} dias
                  </h4>
                  <div className="text-[7.5px] font-bold text-amber-300 mt-1 truncate">
                    Garantia Liquidez
                  </div>
                </div>

                {/* Card 5: Prazo de Pagamento (PMP) */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">PRAZO PAGAMENTO</span>
                  <h4 className="text-base font-black text-[#FF00FF] italic leading-none mt-1 font-mono">
                    {activeTeam?.kpis?.avg_payable_days || currentKpis?.avg_payable_days || 30} dias
                  </h4>
                  <div className="text-[7.5px] font-bold text-slate-500 mt-1 truncate">
                    Monitoramento Giro
                  </div>
                </div>

                {/* Card 6: Frete & Logística de Entrega */}
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg h-24">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">FRETES UNITÁRIOS</span>
                  <h4 className="text-base font-black text-[#FF5F1F] italic leading-none mt-1 font-mono">
                    {formatValue(activeTeam?.kpis?.delivery_cost_unit ?? 3.12)}/un
                  </h4>
                  <div className="text-[7.5px] font-bold text-rose-500 mt-1 truncate">
                    Custo Logística Regional
                  </div>
                </div>

              </div>

              {/* Linha Central - Primeiro Bloco de 3 Gráficos por Linha */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto shrink-0">
                
                {/* 1. Market Share por Equipe (Donut) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Market Share por Equipe (R-0{currentRound})</h5>
                    <Info size={11} className="text-[#00FFFF]" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-[190px] w-full mt-2">
                    <Chart 
                      options={{
                        chart: { type: 'donut', background: 'transparent' },
                        colors: ['#39FF14', '#00FFFF', '#FF00FF', '#FFFF33'],
                        labels: competitorsList.map((t: any, idx: number) => formatTeamName(t.name, idx)),
                        legend: { 
                          show: true,
                          position: 'bottom',
                          fontSize: '8px',
                          labels: { colors: '#E0E0E0' }
                        },
                        dataLabels: { enabled: false },
                        plotOptions: { pie: { donut: { size: '60%' } } }
                      }}
                      series={competitorsList.map((t: any, idx: number) => {
                        if (t.id === activeTeam?.id) {
                          return activeTeam?.kpis?.market_share !== undefined 
                            ? (activeTeam.kpis.market_share * (activeTeam.kpis.market_share < 1 ? 100 : 1)) 
                            : 16.3;
                        }
                        const defaults = [28, 25, 32, 15];
                        return t.kpis?.market_share 
                          ? (t.kpis.market_share * (t.kpis.market_share < 1 ? 100 : 1)) 
                          : (defaults[idx % 4] || 20);
                      })}
                      type="donut"
                      height={190}
                    />
                  </div>
                </div>

                {/* 2. Vendas por Equipe e Período (Barras Stacked) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Histórico de Demanda Vendida (un)</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'vendas_periodo',
                          title: 'Vendas por Equipes (Histórico)',
                          options: getBaseChartOptions('Séries de Vendas'),
                          series: [
                            { name: formatTeamName(competitorsList[0]?.name || '', 0), data: computedHistory.map((h, r) => (12000 + (r * 800))) },
                            { name: formatTeamName(competitorsList[1]?.name || '', 1), data: computedHistory.map((h, r) => (9000 + (r * 600))) }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-[190px] w-full font-mono mt-2">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
                        colors: ['#39FF14', '#00FFFF', '#FF00FF', '#FFFF33'],
                        plotOptions: { bar: { columnWidth: '45%' } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={competitorsList.map((comp: any, idx: number) => {
                        const isMainTeam = comp.id === activeTeam?.id;
                        const defaultBase = idx === 0 ? 12000 : idx === 1 ? 9000 : idx === 2 ? 11000 : 8000;
                        return {
                          name: formatTeamName(comp.name || '', idx),
                          data: computedHistory.map((h: any, r: number) => {
                            if (isMainTeam) {
                              return (h.kpis as any)?.last_units_sold || (h.kpis as any)?.sold_quantity || (defaultBase + (r * 500));
                            }
                            return defaultBase + (r * 400) - (idx * 150);
                          })
                        };
                      })}
                      type="bar"
                      height={190}
                    />
                  </div>
                </div>

                {/* 3. Elasticidade Regional - Preço vs Volume (Scatter) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Elasticidade Regional</span>
                  <div className="flex justify-between items-center mb-1 mt-0.5">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Preço vs Volume Vendido</h5>
                  </div>
                  <div className="flex-1 min-h-[190px] w-full font-mono mt-1">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#00FFFF', '#FF00FF'],
                        chart: { type: 'scatter', toolbar: { show: false } },
                        markers: { size: 5 },
                        xaxis: { 
                          title: { text: 'Preço Praticado ($)', style: { color: '#64748b', fontSize: '8px' } },
                          labels: { formatter: (v: any) => typeof v === 'number' ? v.toFixed(2) : v }
                        }
                      }}
                      series={[
                        {
                          name: 'Preço Minha Equipe',
                          data: computedHistory.map((h: any) => [
                            (h.kpis as any)?.avg_price_local || (h.kpis as any)?.avg_price || 1.40,
                            (h.kpis as any)?.last_units_sold || (h.kpis as any)?.sold_quantity || 39000
                          ])
                        },
                        {
                          name: 'Mercado Concorrentes',
                          data: [
                            [1.15, 41000], [1.35, 33000], [1.45, 29000], [1.55, 23000]
                          ]
                        }
                      ]}
                      type="scatter"
                      height={190}
                    />
                  </div>
                </div>

              </div>

              {/* Linha Inferior - Segundo Bloco de 3 Gráficos / Widgets por Linha */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto shrink-0">
                
                {/* 4. PMR vs PMP (Diferencial de Caixa) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest leading-none">Prazos de Financiamento</span>
                  <div className="flex justify-between items-center mb-1 mt-0.5">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">PMR vs PMP (Série Histórica)</h5>
                  </div>
                  <div className="flex-1 min-h-[190px] w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#CCFF00', '#FF00FF'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } },
                        yaxis: {
                          labels: { 
                            formatter: (v: any) => `${v.toFixed(0)} d` 
                          }
                        }
                      }}
                      series={[
                        { name: 'Prazo Médio Recebimento (PMR)', data: computedHistory.map((h: any) => (h.kpis as any)?.avg_receivable_days || 45) },
                        { name: 'Prazo Médio Pagamento (PMP)', data: computedHistory.map((h: any) => (h.kpis as any)?.avg_payable_days || 30) }
                      ]}
                      type="line"
                      height={190}
                    />
                  </div>
                </div>

                {/* 5. Distribuição Regional do Volume Vendido (Horiz Bar) */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Distribuição Territorial</span>
                  <div className="flex justify-between items-center mb-1 mt-0.5">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Mix de Unidades de Venda Regional</h5>
                  </div>
                  <div className="flex-1 min-h-[190px] w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        chart: { type: 'bar', toolbar: { show: false } },
                        colors: ['#00FFEF'],
                        plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
                        xaxis: { 
                          categories: ['Brasil', 'EUA', 'Europa', 'Reino Unido', 'China'],
                          labels: { style: { colors: '#94a3b8', fontSize: '8px' } }
                        },
                        yaxis: {
                          labels: { style: { colors: '#94a3b8', fontSize: '8px' } }
                        }
                      }}
                      series={[{
                        name: 'Unidades Vendidas',
                        data: (function() {
                          const soldMap = activeTeam?.kpis?.regional_units_sold || {};
                          return [
                            Number(soldMap['1'] || soldMap['BR'] || 15000),
                            Number(soldMap['2'] || soldMap['EUA'] || 10000),
                            Number(soldMap['3'] || soldMap['EUR'] || 8000),
                            Number(soldMap['4'] || soldMap['UK'] || 4000),
                            Number(soldMap['5'] || soldMap['CHN'] || 2000)
                          ];
                        })()
                      }]}
                      type="bar"
                      height={190}
                    />
                  </div>
                </div>

                {/* 6. Auditoria de Crescimento de Share (Heatmap Celular) */}
                <div className="bg-[#0b101f] p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden shadow-2xl">
                  <span className="text-[8px] font-black text-[#CCFF00] uppercase tracking-widest leading-none">Monitoramento Concorrencial</span>
                  <h5 className="text-[10px] font-black text-white uppercase italic leading-none mb-1 mt-0.5">Heatmap de Market Share (%) por Rodada</h5>
                  <div className="flex-1 overflow-x-auto min-h-0 mt-1">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-separate border-spacing-x-0.5 border-spacing-y-1">
                      <thead>
                        <tr className="text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="pb-1 text-left font-sans font-bold text-slate-400">Marca</th>
                          {roundsCategories.map(c => <th className="pb-1 font-black font-mono text-slate-400 text-center w-8" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {competitorsList.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="pr-1.5 text-left font-sans font-bold text-slate-300 text-[8px] whitespace-nowrap uppercase italic tracking-wider">
                              {formatTeamName(row.name || '', i)}
                            </td>
                            {computedHistory.map((h: any, rIdx: number) => {
                              // Calcular o share aproximado fidedigno para este round
                              let cellShare = 20;
                              if (row.id === activeTeam?.id) {
                                cellShare = (h.kpis as any)?.market_share !== undefined 
                                  ? ((h.kpis as any).market_share * ((h.kpis as any).market_share < 1 ? 100 : 1)) 
                                  : (16.3 + rIdx * 0.4);
                              } else {
                                const baseValues = [28, 25, 32, 15];
                                cellShare = baseValues[i % 4] || 20;
                              }
                              
                              // Escala de cor fiduciaria para shares
                              let cellClass = 'bg-[#bf1a1a] text-white'; // <12% red
                              if (cellShare >= 25) {
                                cellClass = 'bg-[#2e7d17] text-white'; // green
                              } else if (cellShare >= 18) {
                                cellClass = 'bg-[#76b014] text-white'; // lime
                              } else if (cellShare >= 12) {
                                cellClass = 'bg-[#c19114] text-white'; // olive orange-yellow
                              }

                              return (
                                <td key={rIdx} className="p-0">
                                  <div className={`flex items-center justify-center h-6 w-8 rounded-md ${cellClass} text-[8px] font-black shadow-inner`}>
                                    {cellShare.toFixed(0)}%
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VIEW INDUSTRIAL & HR */}
          {/* ========================================================= */}
          {activeTab === 'industrial' && (
            <div className="flex flex-col gap-4 pb-6 min-h-min">
              
              {/* Topo (Capacidade vs Produzido + Produtividade vs Motivação + Salários) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[280px] min-h-[280px] h-auto shrink-0 animate-fade-in-up">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Capacidade Instalada vs Produção</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'cap_prod',
                          title: 'Capacidade vs Produzido',
                          options: getBaseChartOptions('Eficiência Industrial'),
                          series: [
                            { name: 'Capacidade Instalada', data: [12000, 12000, 16000, 16000, 16000] },
                            { name: 'Volume Produzido', data: [11000, 10500, 14200, 15000, 15800] }
                          ]
                        });
                      }}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
                        colors: ['#4B0082', '#39FF14'],
                        plotOptions: { bar: { columnWidth: '40%' } },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { name: 'Setup Inicial (Cap.)', data: computedHistory.map(h => 12000) },
                        { name: 'Produzido Real', data: computedHistory.map(h => 10000 + (h.round * 500)) }
                      ]}
                      type="bar"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Produtividade vs Motivação</h5>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#CCFF00', '#00FFFF'],
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { name: 'Produtividade (%)', data: computedHistory.map(h => 80 + (h.round * 2)) },
                        { name: 'Motivação (%)', data: computedHistory.map(h => 75 + (h.round * 1.5)) }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                {/* Comparações de Salários */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-[#1DE9B6] uppercase tracking-widest leading-none">Recursos Humanos</span>
                  <h5 className="text-[10px] font-black text-white uppercase italic leading-none mb-1">Salário fiduciário vs Piso Inflacionado</h5>
                  
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px] border border-white/5">
                      <span className="text-slate-400 font-bold">Oferecido pela Equipe:</span>
                      <strong className="text-white font-mono font-black">{formatValue(3100)}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px] border border-white/5">
                      <span className="text-slate-400 font-bold">Média Concorrentes:</span>
                      <strong className="text-[#00FFFF] font-mono font-black">{formatValue(2750)}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-[#FF5F1F]/10 p-2 rounded-xl text-[10px] border border-[#FF5F1F]/20">
                      <span className="text-[#FF5F1F] font-bold">Mínimo (Piso Inflacionado):</span>
                      <strong className="text-white font-mono font-black">{formatValue(2450)}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Meio (Controle de Estoque Heatmap & Painel RH & P&D Radar + Estatísticas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0">
                
                {/* Heatmap de Controle de Estoque */}
                <div className="bg-[#0b101f] p-4 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden shadow-2xl">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Matriz de Insumos</span>
                  <h5 className="text-[10px] font-black text-white uppercase italic leading-none mb-3 mt-1">Giro de Estoque & Segurança</h5>
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-separate border-spacing-x-1.5 border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="pb-2 text-left font-sans font-bold text-slate-400">Insumo</th>
                          {roundsCategories.map(c => <th className="pb-2 font-black font-mono text-slate-400 text-center w-12" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {computedStockRows.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors rounded-lg">
                            <td className="pr-4 text-left font-sans font-bold text-slate-300 text-[10px] whitespace-nowrap uppercase italic tracking-wide">{row.name}</td>
                            {row.vals.map((v, rIdx) => {
                              const cellClass = getStockCellColor(v, row.safe, row.type);
                              let displayVal = '';
                              if (row.type === 'currency') {
                                if (v === 0) {
                                  displayVal = '0';
                                } else if (v >= 1000000) {
                                  displayVal = `${(v / 1000000).toFixed(2)}M`;
                                } else {
                                  displayVal = `${(v / 1000).toFixed(0)}k`;
                                }
                              } else {
                                displayVal = v.toFixed(1);
                              }
                              return (
                                <td key={rIdx} className="p-0">
                                  <div className={`flex items-center justify-center h-8 w-12 rounded-lg ${cellClass} text-[10px] font-black tracking-tighter shadow-md transition-transform hover:scale-105 duration-100`}>
                                    {displayVal}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Radar Chart de Incentivos & P&D */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Incentivos & P&D (Radar fiduciário)</h5>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#00FFEF', '#FFD700'],
                        chart: { type: 'radar', background: 'transparent' },
                        labels: ['PPR', 'Treinamento', 'Horas Extras', 'P&D', 'Bônus']
                      }}
                      series={[
                        { name: 'Minha Equipa', data: [75, 80, 45, 60, 50] },
                        { name: 'Média de Setor', data: [65, 70, 50, 55, 45] }
                      ]}
                      type="radar"
                      height={180}
                    />
                  </div>
                </div>

                {/* Estatísticas e Índices de RH */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden text-[9px] font-mono leading-none">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Ficha Cadastral Industrial</span>
                  
                  <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center bg-white/5 p-1 rounded">
                      <span className="text-slate-400 uppercase text-[8px] font-bold">Operários Ativos:</span>
                      <strong className="text-white">470 operários</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-1 rounded">
                      <span className="text-slate-400 uppercase text-[8px] font-bold">Regime de Turnos:</span>
                      <strong className="text-[#00FFFF]">3 Turnos Plenos</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-1 rounded">
                      <span className="text-slate-400 uppercase text-[8px] font-bold">Custo Emergencial (Compras):</span>
                      <strong className="text-[#FF5F1F]">{formatValue(991400)}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-1 rounded">
                      <span className="text-slate-400 uppercase text-[8px] font-bold">Horas Extras Faturadas:</span>
                      <strong className="text-red-400">420h (+18%)</strong>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>
          )}

        </div>
      </main>

      {/* Renderizar Modal de Zoom */}
      {renderChartZoomModal()}

    </div>
  );
};
