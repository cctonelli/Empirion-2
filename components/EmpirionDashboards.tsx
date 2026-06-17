import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
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
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Indica se a barra deve ser mostrada como expandida (por toggle manual ou mouse hover)
  const isVisuallyExpanded = !isSidebarCollapsed || isSidebarHovered;

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
        onMouseEnter={() => { if (isSidebarCollapsed) setIsSidebarHovered(true); }}
        onMouseLeave={() => setIsSidebarHovered(false)}
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
                  <span className="text-[7px] font-bold uppercase tracking-widest text-[#FFFFB5]">Oracle Dashboards</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg mx-auto">E</div>
            )}
          </div>

          {/* Toggle Switch Lateral de Colapso (Apenas Tooltip "Menu Compacto", sem texto no layout) */}
          <div className="px-3 flex items-center justify-center mx-2 p-2 bg-white/5 rounded-2xl border border-white/5">
            <button
              role="switch"
              aria-checked={!isSidebarCollapsed}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mx-auto ${
                !isSidebarCollapsed ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
              title="Menu Compacto"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  !isSidebarCollapsed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Informações da Competição / Arena */}
          <div className="px-3">
            {isVisuallyExpanded ? (
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
            ) : (
              <div className="flex flex-col items-center gap-2 py-2 bg-[#0E1726]/40 rounded-xl border border-white/5 mx-1" title={`${activeArena?.name || "Trial Industrial"} | ${formatTeamName(activeTeam?.name, 0)}`}>
                <span className="text-[9px] font-black text-amber-300">R0{currentRound}</span>
                <div className="w-4 h-px bg-white/10" />
                <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-wider text-center">
                  EQP
                </span>
              </div>
            )}
          </div>

          {/* Filtros de Governança Integrados no Sidebar */}
          <div className="px-3 py-4 border-y border-white/5 space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                <Sliders size={10} className="text-amber-500" />
                {isVisuallyExpanded && "Governança Tática"}
              </label>
              {isVisuallyExpanded ? (
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
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1E1E2F] flex items-center justify-center text-slate-400" title="Governança">
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} className="text-[#00FFFF]" />
                {isVisuallyExpanded && "Identidade das Marcas"}
              </label>
              {isVisuallyExpanded ? (
                <select 
                  value={teamIdentity}
                  onChange={(e: any) => setTeamIdentity(e.target.value)}
                  className="w-full bg-[#1E1E2F] border border-white/5 rounded-xl px-2.5 py-1 text-[10px] font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="identificada">Identificada</option>
                  <option value="anonima">Anônima (Mascarada)</option>
                </select>
              ) : (
                <button 
                  onClick={() => setTeamIdentity(teamIdentity === 'identificada' ? 'anonima' : 'identificada')}
                  className="w-8 h-8 rounded-full bg-[#1E1E2F] flex items-center justify-center text-[#00FFFF]" 
                  title="Mudar Identidade"
                >
                  {teamIdentity === 'identificada' ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
            </div>
          </div>

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
                  className={`w-full py-3 px-3 rounded-xl flex items-center gap-3 transition-all ${
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

        {/* Rodapé do Menu Lateral - Voltar ao Cockpit */}
        <div className="p-3 border-t border-white/5 flex flex-col gap-2">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
            title="Voltar ao Cockpit"
          >
            <ChevronLeft size={16} />
            {isVisuallyExpanded && "Voltar ao Cockpit"}
          </button>
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
                    <Coins size={14} className="text-amber-400" /> Variação Cambial de Moedas do Torneio (BRL vs USD / EUR / GBP / CNY / BTC)
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
                            data: [
                              { x: 'Round 1', y: [5.20, 5.28, 5.15, 5.25] },
                              { x: 'Round 2', y: [5.25, 5.35, 5.20, 5.31] },
                              { x: 'Round 3', y: [5.31, 5.42, 5.28, 5.39] },
                              { x: 'Round 4', y: [5.39, 5.49, 5.35, 5.44] },
                              { x: 'Round 5', y: [5.44, 5.58, 5.40, 5.52] },
                              { x: 'Round 6', y: [5.52, 5.65, 5.48, 5.60] }
                            ]
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
                      name: 'Câmbio USD',
                      data: computedHistory.map((h, idx) => ({
                        x: `R-0${h.round}`,
                        y: [
                          5.0 + (idx * 0.08), 
                          5.15 + (idx * 0.08), 
                          4.95 + (idx * 0.08), 
                          5.10 + (idx * 0.08)
                        ]
                      }))
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
                            { name: 'ICE', data: computedHistory.map(h => 100 + (h.round * 5)) },
                            { name: 'Inflação', data: computedHistory.map(h => 4.5 + (h.round * 0.2)) },
                            { name: 'Demanda', data: computedHistory.map(h => h.round * 3) }
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
                        { name: 'ICE (%)', data: computedHistory.map(h => 2.5 + (h.round * 0.5)) },
                        { name: 'Inf (%)', data: computedHistory.map(h => 4.2 + (h.round * 0.15)) },
                        { name: 'Dem (%)', data: computedHistory.map(h => 1.5 + (h.round * 0.8)) }
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
                            { name: 'IVA Compras', data: [12, 12, 12, 14, 14, 14] },
                            { name: 'IVA Vendas', data: [18, 18, 18, 18, 18, 18] }
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
                        { name: 'IVA Compras', data: computedHistory.map(h => 12 + (h.round * 0.2)) },
                        { name: 'IVA Vendas', data: computedHistory.map(h => 18) }
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
                        {[
                          { name: 'Brasil', rates: ['0%', '0%', '0%', '0%', '0%'], bg: 'bg-[#00FFEF]/10 text-[#00FFEF]' },
                          { name: 'EUA', rates: ['12%', '12%', '14%', '15%', '15%'], bg: 'bg-[#FF5F1F]/10 text-[#FF5F1F]' },
                          { name: 'Euro', rates: ['8%', '10%', '10%', '12%', '12%'], bg: 'bg-[#9D00FF]/10 text-[#9D00FF]' },
                          { name: 'UK', rates: ['5%', '5%', '5%', '8%', '8%'], bg: 'bg-[#0FF0FC]/10 text-[#0FF0FC]' },
                          { name: 'China', rates: ['15%', '15%', '18%', '20%', '20%'], bg: 'bg-red-500/10 text-red-400' }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-1.5 font-bold text-white text-[8px] uppercase italic">{row.name}</td>
                            {row.rates.map((rate, rIdx) => (
                              <td key={rIdx} className="text-center py-1.5">
                                <span className={`px-1.5 py-0.5 rounded ${row.bg} text-[8px] font-bold`}>{rate}</span>
                              </td>
                            ))}
                          </tr>
                        ))}
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
                    <h5 className="text-[10px] font-black text-white uppercase italic">Juros vs Endividamento</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'juros',
                          title: 'Juros x Endividamento Realizado',
                          options: getBaseChartOptions('Endividamento'),
                          series: [
                            { name: 'Taxa Juros (%)', data: computedHistory.map(h => 12.5 - h.round * 0.5) },
                            { name: 'Endividamento LP', data: computedHistory.map(h => 400000 + h.round * 50000) }
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
                        { name: 'Juros (%)', type: 'line', data: computedHistory.map(h => 13.5 - (h.round * 0.4)) },
                        { name: 'Endividamento', type: 'column', data: computedHistory.map(h => h.liabilities / 2) }
                      ]}
                      type="line"
                      height={180}
                    />
                  </div>
                </div>

                {/* PIB Regional - Solução para o espaço vazio do rodapé central */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <span className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest italic font-bold">PIB NACIONAL (ÁREA DE EXPANSÃO)</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Evolução do PIB Econômico</h5>
                    <div className="text-[#39FF14] cursor-pointer" title="Taxa acumulada de crescimento do PIB nominal do mercado">
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
                        data: computedHistory.map(h => 1.8 + (h.round * 0.3) + Math.sin(h.round) * 0.5)
                      }]}
                      type="area"
                      height={180}
                    />
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col relative justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estratégias de Repasse</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Inflação vs Preço Médio</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'infl',
                          title: 'Inflação vs Preço Praticado',
                          options: getBaseChartOptions('Ajuste de Preços'),
                          series: [
                            { name: 'Inflação (%)', data: computedHistory.map(h => 4.5) },
                            { name: 'Preço Médio da Equipe', data: computedHistory.map(h => 1.35 + h.round * 0.08) }
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
                        { name: 'Inflação Acc', data: computedHistory.map(h => 4.2 + (h.round * 0.2)) },
                        { name: 'Preço Médio', data: computedHistory.map(h => 1.25 + (h.round * 0.05)) }
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
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Matriz de Monitoramento</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Heatmap Contábil fiduciário</h5>
                    <Info size={11} className="text-amber-400" />
                  </div>
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="py-2 text-left">Indicador</th>
                          {roundsCategories.slice(0, 5).map(c => <th className="py-2" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Liquidez Corrente', vals: [1.75, 1.80, 1.62, 1.80, 2.62], safe: [1.6, 2.2] },
                          { name: 'Endividamento LP', vals: [1.4, 1.15, 1.83, 1.15, 1.54], safe: [1.2, 1.6] },
                          { name: 'Margem ROE', vals: [38.5, 22.9, 12.8, 19.5, 8.6], safe: [15, 24] },
                          { name: 'Margem Líquida', vals: [14.3, 11.5, 11.12, 11.8, 15.3], safe: [10, 15] },
                          { name: 'Giro do Ativo', vals: [1.0, 1.0, 1.9, 1.01, 1.25], safe: [1.0, 1.5] }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-1.5 text-left font-bold text-white text-[8px] uppercase italic">{row.name}</td>
                            {row.vals.map((val, rIdx) => {
                              // Gradiente para heatmap
                              let cellClass = "bg-[#FF5F1F]/10 text-[#FF5F1F]"; // Risco
                              if (val >= row.safe[1]) {
                                cellClass = "bg-emerald-500/10 text-[#39FF14]"; // Seguro
                              } else if (val >= row.safe[0]) {
                                cellClass = "bg-amber-500/10 text-amber-300"; // Intermediário
                              }
                              return (
                                <td key={rIdx} className="py-1.5">
                                  <span className={`px-2 py-0.5 rounded ${cellClass} text-[9px] font-black font-mono`}>
                                    {row.name.includes('ROE') || row.name.includes('Margem') ? `${val.toFixed(1)}%` : val.toFixed(2)}
                                  </span>
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
              
              {/* Fileira Superior Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                
                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">MARKET SHARE ATIVO</span>
                    <h4 className="text-lg font-black text-[#00FFEF] italic leading-none mt-2">16.3%</h4>
                    <span className="text-[8px] font-bold text-rose-500 mt-2 flex items-center gap-0.5 leading-none">
                      <TrendingDown size={8} /> -20.1% comparado ao rascunho
                    </span>
                  </div>
                  <div className="w-[80px] h-[80px]">
                    <Chart 
                      options={{
                        chart: { type: 'radialBar', sparkline: { enabled: true } },
                        colors: ['#00FFEF'],
                        plotOptions: { radialBar: { hollow: { size: '60%' }, dataLabels: { show: false } } }
                      }}
                      series={[16.3]}
                      type="radialBar"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>

                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">TOTAL PRODUTO VENDIDO</span>
                  <h4 className="text-2xl font-black text-white italic leading-none my-auto">39.000 un</h4>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">META CONSOLIDADA EM ARENA</span>
                </div>

                <div className="bg-[#1E1E2F] p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">PREÇO MÉDIO GERAL</span>
                    <h4 className="text-lg font-black text-[#FFD700] italic leading-none mt-2">{formatValue(1.40)}</h4>
                    <span className="text-[8px] font-bold text-emerald-400 mt-2 flex items-center gap-0.5 leading-none">
                      <TrendingUp size={9} /> Estável
                    </span>
                  </div>
                  <div className="w-[80px] h-[80px]">
                    <Chart 
                      options={{
                        chart: { type: 'pie', sparkline: { enabled: true } },
                        colors: ['#FF2400', '#CCFF00', '#0FF0FC'],
                        labels: ['Baixo', 'Normal', 'Premium']
                      }}
                      series={[25, 45, 30]}
                      type="pie"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>

              </div>

              {/* Linha Central (Market Share by Team Donut & Vendas em Barras Empilhadas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[320px] min-h-[290px] h-auto shrink-0">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Market Share por Equipe (R-0{currentRound})</h5>
                    <Info size={11} className="text-[#00FFFF]" />
                  </div>
                  <div className="flex-1 flex items-center w-full min-h-0">
                    <div className="w-1/2 h-[220px]">
                      <Chart 
                        options={{
                          chart: { type: 'donut', background: 'transparent' },
                          colors: ['#39FF14', '#00FFFF', '#FF00FF', '#FFFF33'],
                          labels: competitorsList.map((t: any, idx: number) => formatTeamName(t.name, idx)),
                          legend: { show: false },
                          dataLabels: { enabled: false },
                          plotOptions: { pie: { donut: { size: '65%' } } }
                        }}
                        series={[28, 25, 32, 15]}
                        type="donut"
                        height={220}
                      />
                    </div>
                    
                    {/* Linha Textual Legenda Estruturada */}
                    <div className="w-1/2 pl-4 text-[9px] font-mono flex flex-col justify-center gap-1.5 border-l border-white/5">
                      {[
                        { name: competitorsList[0]?.name, pct: '28%', color: 'border-[#39FF14] text-[#39FF14]' },
                        { name: competitorsList[1]?.name, pct: '25%', color: 'border-[#00FFFF] text-[#00FFFF]' },
                        { name: competitorsList[2]?.name, pct: '32%', color: 'border-[#FF00FF] text-[#FF00FF]' },
                        { name: competitorsList[3]?.name, pct: '15%', color: 'border-[#FFFF33] text-[#FFFF33]' }
                      ].map((t, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-1 rounded border-l-2 gap-2">
                          <span className="truncate text-white font-bold">{formatTeamName(t.name || '', i)}</span>
                          <span className="font-bold">{t.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic">Vendas por Equipe e Período</h5>
                    <button 
                      onClick={() => {
                        setExpandedChart({
                          id: 'vendas_periodo',
                          title: 'Vendas por Equipes (Histórico)',
                          options: getBaseChartOptions('Séries de Vendas'),
                          series: [
                            { name: formatTeamName(competitorsList[0]?.name || '', 0), data: [12000, 15000, 11000, 16000, 18000] },
                            { name: formatTeamName(competitorsList[1]?.name || '', 1), data: [9000, 11000, 13000, 14000, 15000] }
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
                        colors: ['#39FF14', '#00FFFF', '#FF00FF', '#FFFF33'],
                        plotOptions: { bar: { columnWidth: '50%' } },
                        annotations: {
                          yaxis: [{
                            y: 40005,
                            borderColor: '#FF5F1F',
                            label: { text: 'Meta Demanda', style: { color: '#fff', background: '#FF5F1F', fontSize: '8px' } }
                          }]
                        },
                        xaxis: { categories: roundsCategories, labels: { style: { colors: '#94a3b8', fontSize: '8px' } } }
                      }}
                      series={[
                        { name: formatTeamName(competitorsList[0]?.name || '', 0), data: computedHistory.map((_, idx) => 12000 + (idx * 500)) },
                        { name: formatTeamName(competitorsList[1]?.name || '', 1), data: computedHistory.map((_, idx) => 9000 + (idx * 300)) },
                        { name: formatTeamName(competitorsList[2]?.name || '', 2), data: computedHistory.map((_, idx) => 11000 + (idx * 400)) },
                        { name: formatTeamName(competitorsList[3]?.name || '', 3), data: computedHistory.map((_, idx) => 8000 + (idx * 200)) }
                      ]}
                      type="bar"
                      height={240}
                    />
                  </div>
                </div>

              </div>

              {/* Linha Inferior (Scatter Venda vs Preço & Matrix Crescimento Share) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[260px] min-h-[220px] h-auto shrink-0">
                
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Elasticidade Regional</span>
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="text-[10px] font-black text-white uppercase italic leading-none">Preço vs Volume Vendido</h5>
                  </div>
                  <div className="flex-1 min-h-0 w-full font-mono">
                    <Chart 
                      options={{
                        ...getBaseChartOptions(''),
                        colors: ['#00FFFF', '#FF00FF'],
                        chart: { type: 'scatter', toolbar: { show: false } },
                        markers: { size: 6 },
                        xaxis: { 
                          title: { text: 'Preço (R$)', style: { color: '#64748b', fontSize: '8px' } },
                          labels: { formatter: (v: any) => `${v}` }
                        }
                      }}
                      series={[
                        {
                          name: 'Competidor Ativo',
                          data: [
                            [1.20, 12000], [1.30, 11000], [1.40, 9500], [1.50, 8000]
                          ]
                        },
                        {
                          name: 'Setor Concorrentes',
                          data: [
                            [1.15, 14000], [1.35, 10500], [1.45, 9000], [1.55, 7500]
                          ]
                        }
                      ]}
                      type="scatter"
                      height={180}
                    />
                  </div>
                </div>

                {/* Tabela de Crescimento de Market Share (%) por Rodada */}
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest leading-none">Auditoria Competitiva</span>
                  <h5 className="text-[10px] font-black text-white uppercase italic leading-none mb-1">Gradiente de Crescimento de Share (R-0{currentRound})</h5>
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="py-2 text-left">Marca</th>
                          {roundsCategories.slice(0, 5).map(c => <th className="py-2" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: competitorsList[0]?.name, growth: ['+1.01%', '+2.00%', '+1.01%', '+2.01%', '+1.20%'], up: true },
                          { name: competitorsList[1]?.name, growth: ['+0.50%', '-0.10%', '+0.80%', '+1.10%', '+0.90%'], up: true },
                          { name: competitorsList[2]?.name, growth: ['-1.50%', '+2.00%', '-1.20%', '+0.60%', '+1.50%'], up: false },
                          { name: competitorsList[3]?.name, growth: ['+0.80%', '+1.10%', '+0.50%', '-0.10%', '+0.30%'], up: true }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-1.5 text-left font-bold text-white text-[8px] uppercase italic">{formatTeamName(row.name || '', i)}</td>
                            {row.growth.map((g, idx) => {
                              const isNegative = g.startsWith('-');
                              const cellClass = isNegative ? 'bg-rose-500/10 text-[#FF5252]' : 'bg-[#CCFF00]/10 text-[#CCFF00]';
                              return (
                                <td key={idx} className="py-1.5">
                                  <span className={`px-2 py-0.5 rounded ${cellClass} text-[9px] font-black`}>{g}</span>
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
                <div className="bg-[#0E1726]/80 p-3 rounded-[2rem] border border-white/5 flex flex-col justify-between overflow-hidden">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Matriz de Insumos</span>
                  <h5 className="text-[10px] font-black text-white uppercase italic leading-none mb-1">Giro de Estoque & Segurança</h5>
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-center text-[9px] font-mono leading-none border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 text-[8px] uppercase tracking-widest">
                          <th className="py-2 text-left">Insumo</th>
                          {roundsCategories.slice(0, 5).map(c => <th className="py-2" key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Matéria-Prima A', vals: [5.2, 5.2, 16.3, 2.6, 4.7], target: 'Dias Giro' },
                          { name: 'Matéria-Prima B', vals: [6.7, 5.1, 4.7, 5.2, 4.8], target: 'Dias Giro' },
                          { name: 'Produto Acabado', vals: [12, 10.2, 10.2, 15.3, 10.7], target: 'Giro Físico' },
                          { name: 'Compras Especiais', vals: [0, 0, 1.2, 0, 0], target: 'Alerta Risco' }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-1.5 text-left font-bold text-white text-[8px] uppercase italic">{row.name}</td>
                            {row.vals.map((v, rIdx) => {
                              const cellClass = v > 10 ? 'bg-rose-500/10 text-[#FF5252]' : 'bg-[#CCFF00]/10 text-[#CCFF00]';
                              return (
                                <td key={rIdx} className="py-1.5">
                                  <span className={`px-2 py-0.5 rounded ${cellClass} text-[9px] font-black`}>{v.toFixed(1)}</span>
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
