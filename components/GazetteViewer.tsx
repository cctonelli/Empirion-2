import React, { useState, useMemo, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Newspaper, 
  X, User, Star, TrendingUp, Target, Activity, ShieldCheck, Loader2,
  Table as TableIcon, Info, Users, BarChart3, ChevronRight, MapPin, 
  ArrowUpRight, ArrowDownRight, Package, ShoppingCart, Sparkles, Monitor, Flame, 
  ShieldAlert, Coins, Truck, Scale, FileText, TrendingDown, BookOpen
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, Team, MacroIndicators } from '../types';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM, DEFAULT_MACRO, INITIAL_FINANCIAL_TREE } from '../constants';
import { generateDynamicMarketNews } from '../services/gemini';
import { supabase } from '../services/supabase';
import { getCumulativeAdjust, getAdjustedPrice } from '../services/simulation';
import { formatCurrency } from '../utils/formatters';

const translateTransparency = (level?: string) => {
  if (!level) return 'MÉDIA (PADRÃO)';
  switch (String(level || '').toLowerCase()) {
    case 'low': return 'BAIXA (SIGILOSA)';
    case 'medium': return 'MÉDIA (PADRÃO)';
    case 'high': return 'ALTA (TRANSPARENTE)';
    case 'full': return 'TOTAL (OPEN DATA)';
    default: return String(level || '').toUpperCase();
  }
};

const regionsTariffs = [
  { name: 'BRA', key: 'import_tariff_brazil' as const },
  { name: 'USA', key: 'import_tariff_usa' as const },
  { name: 'EUR', key: 'import_tariff_euro' as const },
  { name: 'UK', key: 'import_tariff_uk' as const },
  { name: 'CHN', key: 'import_tariff_china' as const },
  { name: 'BTC', key: 'import_tariff_btc' as const },
];

const getTariffHeatmapColor = (val: number) => {
  if (val >= 100) return 'bg-[#7f0000] text-red-100 border border-slate-900/40 text-[9px] font-mono';
  if (val >= 50) return 'bg-[#bf1a1a] text-red-50 border border-slate-900/40 text-[9px] font-mono';
  if (val >= 25) return 'bg-[#c19114] text-amber-50 border border-slate-900/40 text-[9px] font-mono';
  if (val >= 15) return 'bg-[#f59e0b] text-[#020617] border border-slate-900/30 text-[9px] font-bold font-mono';
  if (val >= 5) return 'bg-[#76b014] text-[#020617] border border-slate-900/30 text-[9px] font-bold font-mono';
  if (val >= 1) return 'bg-[#10b981] text-[#020617] border border-slate-900/30 text-[9px] font-bold font-mono';
  return 'bg-[#2e7d17] text-green-50 border border-slate-900/30 text-[9px] font-mono'; // 0
};

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  activeTeam?: Team | null;
  onClose: () => void;
}

type GazetteTab = 'editorial' | 'market' | 'macro' | 'audit';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, activeTeam: initialActiveTeam, userRole, onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('editorial');
  const [dynamicNews, setDynamicNews] = useState<string>('');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialActiveTeam?.id || null);

  // Monitor de Equipe Selecionada
  const activeTeam = useMemo(() => {
    if (selectedTeamId) {
      const comp = competitors.find(c => c.team_id === selectedTeamId);
      if (comp) {
        return {
          id: comp.team_id,
          name: comp.team?.name || 'Unidade',
          equity: comp.equity,
          kpis: comp.kpis
        } as Team;
      }
    }
    return initialActiveTeam;
  }, [selectedTeamId, competitors, initialActiveTeam]);
  
  // Captura dos parâmetros macroeconômicos dinâmicos do round
  const currentMacro = useMemo((): MacroIndicators => {
    const rules = arena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    const baseSettings = arena.general_settings || {};
    const maxShifts = rules.max_shifts ?? rules.workforce?.max_shifts ?? baseSettings.max_shifts ?? baseSettings.workforce?.max_shifts ?? DEFAULT_MACRO.max_shifts;
    const prodHours = rules.production_hours_period ?? rules.workforce?.production_hours_period ?? baseSettings.production_hours_period ?? baseSettings.workforce?.production_hours_period ?? DEFAULT_MACRO.production_hours_period;
    
    return { 
      ...DEFAULT_MACRO, 
      ...baseSettings, 
      ...rules,
      max_shifts: Number(maxShifts),
      production_hours_period: Number(prodHours)
    } as MacroIndicators;
  }, [arena, round]);

  const chronogramHistory = useMemo(() => {
    const list = [];
    const totalMax = 12;
    for (let r = 0; r <= totalMax; r++) {
      const rules = arena.round_rules?.[r] || DEFAULT_INDUSTRIAL_CHRONOGRAM[r] || {};
      const baseSettings = arena.general_settings || {};
      const maxShifts = rules.max_shifts ?? rules.workforce?.max_shifts ?? baseSettings.max_shifts ?? baseSettings.workforce?.max_shifts ?? DEFAULT_MACRO.max_shifts;
      const prodHours = rules.production_hours_period ?? rules.workforce?.production_hours_period ?? baseSettings.production_hours_period ?? baseSettings.workforce?.production_hours_period ?? DEFAULT_MACRO.production_hours_period;
      
      const activeMacro = { 
        ...DEFAULT_MACRO, 
        ...baseSettings, 
        ...rules,
        max_shifts: Number(maxShifts),
        production_hours_period: Number(prodHours)
      };
      list.push({
        round: r,
        BRL: activeMacro.BRL ?? 1.0,
        USD: activeMacro.USD ?? 5.25,
        EUR: activeMacro.EUR ?? 5.60,
        GBP: activeMacro.GBP ?? 6.50,
        CNY: activeMacro.CNY ?? 0.72,
        BTC: activeMacro.BTC ?? 0.00002,
      });
    }
    return list;
  }, [arena]);

  const lineSeries = useMemo(() => {
    const roundsList = chronogramHistory;
    return [
      { name: 'BRL', data: roundsList.map(v => Number(v.BRL)) },
      { name: 'USD', data: roundsList.map(v => Number(v.USD)) },
      { name: 'EUR', data: roundsList.map(v => Number(v.EUR)) },
      { name: 'GBP', data: roundsList.map(v => Number(v.GBP)) },
      { name: 'CNY', data: roundsList.map(v => Number(v.CNY)) },
      { name: 'BTC', data: roundsList.map(v => Number(v.BTC)) },
    ];
  }, [chronogramHistory]);

  const lineOptions = useMemo(() => ({
    chart: {
      type: 'line' as const,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false }
    },
    colors: ['#3b82f6', '#10b981', '#f97316', '#06b6d4', '#ec4899', '#8b5cf6'],
    stroke: { curve: 'smooth' as const, width: 2.5 },
    grid: { borderColor: '#1e293b' },
    xaxis: {
      categories: chronogramHistory.map(v => `R${v.round}`),
      labels: { style: { colors: '#94a3b8', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' },
        formatter: (val: number) => val >= 1 ? val.toFixed(1) : val.toFixed(5)
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, { seriesIndex }: any) => {
          return seriesIndex === 5 ? val.toFixed(6) : val.toFixed(3);
        }
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'center' as const,
      labels: { colors: '#cbd5e1' },
      fontSize: '10px',
      fontFamily: 'Inter, sans-serif'
    }
  }), [chronogramHistory]);

  // Carrega inteligência competitiva
  const fetchMarketIntelligence = async () => {
     if (round === 0) return;
     setLoadingCompetitors(true);
     try {
        const historyTable = arena.is_trial ? 'trial_companies' : 'companies';
        const teamsTable = arena.is_trial ? 'trial_teams' : 'teams';
        const targetRound = round - 1;
        let { data } = await supabase
           .from(historyTable)
           .select(`*, team:${teamsTable}(name)`)
           .eq('championship_id', arena.id)
           .eq('round', targetRound);
        
        // Fallback local caso a persistência transacional de encerramento do round esteja operante
        if ((!data || data.length === 0) && targetRound === 0) {
           const { data: teamsWithKpis } = await supabase
              .from(teamsTable)
              .select('*')
              .eq('championship_id', arena.id);
           
           if (teamsWithKpis && teamsWithKpis.length > 0) {
              data = teamsWithKpis.map((t: any) => ({
                 team_id: t.id,
                 championship_id: arena.id,
                 round: 0,
                 equity: t.equity || t.kpis?.equity || (arena.starting_mode === 'start_from_zero' ? (arena.config?.caixa_inicial ?? 111163.54) : 7252171.74),
                 team: { name: t.name },
                 kpis: t.kpis || {
                    market_share: 100 / teamsWithKpis.length,
                    statements: INITIAL_FINANCIAL_TREE,
                    share_price: (t.equity || (arena.starting_mode === 'start_from_zero' ? (arena.config?.caixa_inicial ?? 111163.54) : 7252171.74)) / 72000,
                    rating: 'AAA'
                 }
              }));
           }
        }
        
        if (data) setCompetitors(data);
     } catch (err) { console.error("Erro ao coletar dados competitivos:", err); }
     finally { setLoadingCompetitors(false); }
  };

  useEffect(() => {
    if (activeTab === 'market' || activeTab === 'audit') fetchMarketIntelligence();
  }, [activeTab, round]);

  // Geração / Goleada de notícias por inteligência artificial do Oráculo
  useEffect(() => {
    const fetchNews = async () => {
      if (round === 0) { 
        setDynamicNews("**BENVINDO AO SETOR INDUSTRIAL**\n\nNenhuma transmissão de mercado foi inicializada para o Ciclo de Diagnóstico P0. Todas as equipes operam sob condições idênticas de baseline para a construção do plano de negócios estratégico. Os relatórios de performance, análise concorrencial e flutuações macroeconômicas detalhadas serão inaugurados a partir do encerramento desta rodada de transição."); 
        return; 
      }
      setIsGeneratingNews(true);
      try {
        const historyTable = arena.is_trial ? 'trial_companies' : 'companies';
        const teamsTable = arena.is_trial ? 'trial_teams' : 'teams';
        const targetRound = round - 1;
        let { data: teamsData } = await supabase
          .from(historyTable)
          .select(`*, team:${teamsTable}(name)`)
          .eq('championship_id', arena.id)
          .eq('round', targetRound);

        if ((!teamsData || teamsData.length === 0) && targetRound === 0) {
          const defaultEquity = arena.starting_mode === 'start_from_zero' ? (arena.config?.caixa_inicial ?? 111163.54) : 7252171.74;
          const { data: teamsWithKpis } = await supabase
             .from(teamsTable)
             .select('*')
             .eq('championship_id', arena.id);
          
          if (teamsWithKpis && teamsWithKpis.length > 0) {
             teamsData = teamsWithKpis.map((t: any) => ({
                team_id: t.id,
                championship_id: arena.id,
                round: 0,
                equity: t.equity || t.kpis?.equity || defaultEquity,
                team: { name: t.name },
                kpis: t.kpis || {
                   market_share: 100 / teamsWithKpis.length,
                   statements: INITIAL_FINANCIAL_TREE,
                   share_price: (t.equity || t.kpis?.equity || defaultEquity) / 72000,
                   rating: 'AAA'
                }
             }));
          }
        }

        if (teamsData && teamsData.length > 0) {
          const news = await generateDynamicMarketNews(
            arena.name, round, arena.branch, 
            teamsData.map(t => ({ name: t.team?.name, market_share: t.kpis?.market_share, equity: t.equity, rating: t.kpis?.rating })),
            currentMacro, arena.transparency_level || 'medium', arena.gazeta_mode || 'anonymous'
          );
          setDynamicNews(news);
        } else {
          setDynamicNews("Nenhuma atividade comercial registrada na auditoria do round anterior.");
        }
      } catch (err) { 
        setDynamicNews("Instabilidade temporária identificada na frequência de rádio da Oracle Gazette. Os dados estruturados macroeconômicos e o radar concorrencial permanecem plenamente operacionais nas abas ao lado."); 
      }
      finally { setIsGeneratingNews(false); }
    };
    if (activeTab === 'editorial' && !dynamicNews) fetchNews();
  }, [activeTab, round]);

  const isFullTransparency = arena.transparency_level === 'full';
  const isIdentified = arena.gazeta_mode === 'identified';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 bg-[#060b13] flex flex-col h-screen w-screen z-[5000] overflow-hidden text-slate-100 font-sans"
    >
      {/* HEADER DE PATAMAR EDITORIAL GLOBAl (Double Border Estilo Wall Street Journal) */}
      <header className="bg-[#020617] border-b-4 border-double border-slate-800 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 z-10 w-full shadow-lg">
         <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left w-full lg:w-auto">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-xl border border-amber-400/30 shrink-0 select-none">
              <Newspaper size={26} className="text-[#020617]" />
            </div>
            <div>
               <h1 className="text-3xl lg:text-4xl font-black text-amber-500 uppercase font-serif tracking-tighter leading-none italic">
                  ORACLE GAZETTE
               </h1>
               <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                  <span className="text-[9px] font-bold text-amber-600/90 tracking-[0.25em] uppercase italic bg-amber-500/10 px-2 py-0.5 rounded">
                     EDITION R-{round}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">|</span>
                  <span className="text-[10px] text-slate-400 font-normal tracking-wide flex items-center gap-1">
                     <Globe size={11} className="text-slate-500" /> Notícias de Negócios Empresariais
                  </span>
               </div>
            </div>
         </div>

         {/* MENU EDITORIAL DE NAVEGAÇÃO INTERNA */}
         <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-center lg:justify-end">
            <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
               <SectionTab active={activeTab === 'editorial'} onClick={() => setActiveTab('editorial')} icon={<BookOpen size={13} />} label="Caderno Principal" />
               <SectionTab active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<BarChart3 size={13} />} label="Radar Concorrencial" />
               <SectionTab active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Zap size={13} />} label="Macroeconomia & Setorial" />
               <SectionTab active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<User size={13} />} label="Relatório de Governança" />
            </nav>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-rose-600/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
              title="Fechar Gazette"
            >
              <X size={18} />
            </button>
         </div>
      </header>

      {/* PAINEL INFORMATIVO DA EDIÇÃO (Data, Tipo de Mercado e Transparência) */}
      <div className="bg-[#0b1320] border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-slate-500">IND-VOL. {round} (2026/Q2)</span>
          <span>•</span>
          <span className="uppercase text-[11px] font-semibold text-amber-500 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">Simulação Ativa: {arena.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Transparência: <span className="text-sky-400 font-bold">{translateTransparency(arena.transparency_level)}</span></span>
          <span className="text-slate-700">|</span>
          <span>Identificação: <span className="text-indigo-400 font-bold">{(arena.gazeta_mode || 'anonymous').toUpperCase()}</span></span>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DOS CADERNOS DE NOTÍCIAS */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-gradient-to-b from-[#080d16] to-[#04070c] w-full">
         <AnimatePresence mode="wait">
            {activeTab === 'editorial' && (
              <motion.div key="editorial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto space-y-6 w-full">
                 
                 {/* Alerta de Custo Extraordinário ou Cisne Negro na capa */}
                 {currentMacro.is_black_swan && (
                    <div className="p-6 bg-red-950/25 border-y-2 lg:border-2 border-red-500/40 rounded-xl relative overflow-hidden group shadow-lg">
                       <div className="absolute -right-8 -top-8 opacity-5 group-hover:rotate-12 transition-transform text-red-500"><AlertTriangle size={140} /></div>
                       <div className="relative z-10 space-y-2">
                          <div className="flex items-center gap-2.5 text-red-400 font-mono text-xs tracking-wider">
                             <ShieldAlert size={16} />
                             <span className="font-extrabold uppercase animate-pulse">SUPLEMENTO DE URGÊNCIA • EXTRA EDIÇÃO</span>
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-extrabold text-white uppercase font-serif tracking-tight">{currentMacro.black_swan_title}</h3>
                          <p className="text-red-100 text-xs lg:text-sm leading-relaxed max-w-5xl italic">{currentMacro.black_swan_description}</p>
                       </div>
                    </div>
                 )}

                 {/* Layout Editorial de Páginas com colunas integradas */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    
                    {/* COLUNA PRINCIPAL: TEXTO EDITORIAL DA IA ORÁCULO */}
                    <div className="lg:col-span-8 bg-slate-950/45 border border-slate-800/80 rounded-2xl p-6 lg:p-8 shadow-inner relative overflow-hidden min-h-[500px]">
                      <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
                         <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest italic flex items-center gap-2"><Sparkles size={12} /> Editorial Strategos</span>
                         <span className="text-[10px] text-slate-500 font-mono">Ciclagem de Mercado</span>
                      </div>
                      
                      {isGeneratingNews ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24">
                          <Loader2 className="animate-spin text-amber-500" size={36} />
                          <div className="text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Transmissão em processamento...</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">Auditando balancetes e ajustando indexadores setoriais</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <article className="prose prose-invert max-w-none">
                              {/* Texto do Editorial */}
                              <div className="text-slate-300 text-sm lg:text-base leading-relaxed tracking-wide italic font-serif whitespace-pre-line border-l-4 border-amber-600 pl-6 border-double">
                                  {dynamicNews}
                              </div>
                           </article>
                           <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-[11px] text-slate-600 font-mono italic">
                              <span>© Strategos AI Reporter Platform.</span>
                              <span>Frequência Segura de Transmissão</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* COLUNA LATERAL: SIDEBAR COM SUMÁRIO DE MERCADO E INDICADORES RÁPIDOS */}
                    <div className="lg:col-span-4 space-y-6">
                       
                       {/* Bloco de Lotação Industrial do Período */}
                       <div className="bg-[#020617] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
                             <TrendingUp size={13} className="text-emerald-400" /> Tópicos de Maior Impacto
                          </h4>
                          
                          <div className="space-y-3.5">
                             <MarketBriefItem 
                               title="Índice de Confiança Empresarial" 
                               desc={`O ICE está operando em ${currentMacro.ice}%, definindo o teto do consumo.`}
                               status={currentMacro.ice > 0 ? 'up' : 'down'}
                             />
                             <MarketBriefItem 
                               title="Tendência Geral de Inflação" 
                               desc={`Inflação setorial de ${currentMacro.inflation_rate}% impactando reajustes contratuais.`}
                               status={currentMacro.inflation_rate > 3.5 ? 'up' : 'stable'}
                             />
                             <MarketBriefItem 
                               title="Tendência de Demanda no Setor" 
                               desc={`A demanda registrada no último período de ${currentMacro.demand_variation}% exigindo melhores estratégias comerciais.`}
                               status={currentMacro.inflation_rate > 3.5 ? 'up' : 'stable'}
                             />
                             <MarketBriefItem 
                               title="Capacidade das Plantações MP" 
                               desc="Ajustes em matéria-prima determinam novas estratégias de lote de compra."
                               status="stable"
                             />
                          </div>
                       </div>

                       {/* Gráfico de Múltiplas Linhas para Cotações de Moedas */}
                       <div className="bg-[#020617] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                          <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
                             <Coins size={13} className="text-sky-400" /> Cotações Cambiais (vs. Moeda-Padrão)
                          </h5>
                          <div className="h-[210px] w-full">
                             <Chart
                                options={lineOptions}
                                series={lineSeries}
                                type="line"
                                height="100%"
                                width="100%"
                             />
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                             Evolução cambial do campeonato para BRL (azul), USD (verde), EUR (laranja), GBP (turquesa), CNY (rosa) e BTC (roxo).
                          </p>
                       </div>

                       {/* Heatmap de Tarifas de Exportação por Rounds */}
                       <div className="bg-[#020617] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                             <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
                                <LayoutGrid size={13} className="text-amber-400" /> Tarifas de Exportação (%)
                             </h5>
                             <span className="text-[9px] text-[#10b981] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900 font-black">Heatmap</span>
                          </div>

                          <div className="overflow-x-auto custom-scrollbar border border-slate-800/80 rounded-xl bg-slate-950/40">
                             <table className="w-full border-collapse">
                                <thead>
                                   <tr className="bg-slate-900/90 text-slate-400 font-mono text-[9px] uppercase border-b border-slate-800">
                                      <th className="p-2 text-left sticky left-0 bg-slate-900 z-10 border-r border-slate-800/60 font-black">Mkt</th>
                                      {Array.from({ length: 13 }).map((_, r) => (
                                         <th key={r} className={`p-2 text-center text-slate-300 min-w-[34px] font-bold text-[9px] ${r === round ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : ''}`}>
                                            R{r}
                                         </th>
                                      ))}
                                   </tr>
                                </thead>
                                <tbody>
                                   {regionsTariffs.map((region, i) => (
                                      <tr key={i} className="border-b border-slate-900/50 hover:bg-slate-900/10 border-collapse">
                                         <td className="p-2 text-left sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 text-[9.5px] font-extrabold text-slate-300 font-mono uppercase">
                                            {region.name}
                                         </td>
                                         {Array.from({ length: 13 }).map((_, r) => {
                                            const rules = arena.round_rules?.[r] || DEFAULT_INDUSTRIAL_CHRONOGRAM[r] || {};
                                            const activeMacro = { ...DEFAULT_MACRO, ...arena.general_settings, ...rules };
                                            const val = Number(activeMacro[region.key] ?? 0);
                                            return (
                                               <td
                                                  key={r}
                                                  className={`p-2 text-center text-[10px] font-mono leading-none transition-all ${getTariffHeatmapColor(val)} ${r === round ? 'ring-2 ring-amber-500 ring-inset font-black bg-opacity-90' : ''}`}
                                                  title={`${region.name} R${r}: ${val}%`}
                                               >
                                                  {val}%
                                               </td>
                                            );
                                         })}
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1 border-t border-slate-900/80 text-[8px] font-mono">
                             <span className="text-slate-400 uppercase tracking-wider block w-full mb-0.5">Legenda Tarifária:</span>
                             <div className="flex flex-wrap gap-1 w-full">
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#2e7d17]"></span> 0%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#10b981]"></span> 1%-4%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#76b014]"></span> 5%-14%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#f59e0b]"></span> 15%-24%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#c19114]"></span> 25%-49%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#bf1a1a]"></span> 50%-99%</span>
                                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#7f0000]"></span> 100%+</span>
                             </div>
                          </div>
                       </div>

                       {/* Alerta de Caixa Emergencial para o Round */}
                       {round <= 1 && (
                          <div className="bg-amber-950/15 border border-amber-500/25 p-5 rounded-2xl space-y-3 shadow-md">
                             <div className="flex items-center gap-2 text-amber-400 mb-1">
                                <AlertTriangle size={18} />
                                <h5 className="font-bold text-xs uppercase tracking-wider font-mono">Nota de Orientação P0</h5>
                             </div>
                             <p className="text-slate-300 text-[11.5px] leading-relaxed">
                                Todas as corporações iniciaram com um uso de Empréstimo Compulsório transitório no Ciclo P0 de modo a sustentar a governança primária e liquidez dos caixas das unidades industriais. Realize projeções financeiras rutilantes para solvência imediata.
                             </p>
                          </div>
                       )}

                    </div>
                 </div>

              </motion.div>
            )}

            {activeTab === 'market' && (
               <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 w-full max-w-7xl mx-auto font-sans">
                  
                  {/* Cartão Informativo de Governança Concorrencial */}
                  <div className="bg-indigo-950/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
                     <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-xl lg:text-2xl font-bold font-serif text-white tracking-tight">Monitor de Unidades Compartilhadas</h3>
                        <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest font-mono">
                           Nível de Segurança de Dados: {translateTransparency(arena.transparency_level)} (Nível {arena.transparency_level || 'Médio'})
                        </p>
                     </div>
                     <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0"><Monitor size={22}/></div>
                  </div>

                  {/* Tabela de Inteligência Competitiva */}
                  <div className="border border-slate-800 rounded-2xl bg-[#020617]/90 overflow-x-auto shadow-2xl w-full">
                     <table className="w-full text-left min-w-[900px] border-collapse">
                        <thead>
                           <tr className="text-[9px] font-bold uppercase text-slate-400 tracking-wider bg-slate-900 border-b border-slate-800 select-none">
                              <th className="p-4 border-r border-slate-800/60 font-mono">Unidade Industriais (Strategos Competitors)</th>
                              <th className="p-4 text-center font-mono">Market Share (%)</th>
                              <th className="p-4 text-center font-mono">Patrimônio Líquido (Equity)</th>
                              <th className="p-4 text-center font-mono">Receita Líquida (DRE)</th>
                              <th className="p-4 text-center font-mono">Lucro Líquido (Consolidação)</th>
                              <th className="p-4 text-center font-mono">Valor de Ação</th>
                              <th className="p-4 text-center font-mono">Rating de Crédito</th>
                              {isFullTransparency && <th className="p-4 text-center font-mono">Preço Praticado</th>}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 font-mono text-xs">
                           {loadingCompetitors ? (
                             <tr>
                                <td colSpan={isFullTransparency ? 8 : 7} className="p-16 text-center text-slate-500 italic uppercase font-bold text-xs">
                                   <Loader2 className="animate-spin mx-auto mb-3 text-amber-500" size={24} /> Sincronizando dados competitivos e indexadores...
                                </td>
                             </tr>
                           ) : competitors.length === 0 ? (
                             <tr>
                                <td colSpan={isFullTransparency ? 8 : 7} className="p-16 text-center text-slate-500 italic uppercase">
                                   Aguardando encerramento de rodada competitiva para consolidação dos balancetes de mercado.
                                </td>
                             </tr>
                           ) : competitors.map((t, i) => (
                             <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-4 border-r border-slate-800/60">
                                   <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-slate-400 font-extrabold text-xs font-mono">{i+1}</div>
                                      <span className="text-sm font-bold text-slate-200 uppercase tracking-tight">
                                         {isIdentified || userRole === 'tutor' ? t.team?.name : `Unidade Alpha-${t.team_id.slice(0, 4)}`}
                                      </span>
                                   </div>
                                </td>
                                <td className="p-4 text-center text-amber-500 font-extrabold text-lg">{(t.kpis?.market_share || 0).toFixed(1)}%</td>
                                <td className="p-4 text-center text-slate-300 font-semibold">$ {t.equity.toLocaleString()}</td>
                                <td className="p-4 text-center text-emerald-400 font-semibold">$ {(t.kpis?.statements?.dre?.revenue || 0).toLocaleString()}</td>
                                <td className="p-4 text-center text-sky-400 font-semibold">$ {(t.kpis?.statements?.dre?.net_profit || 0).toLocaleString()}</td>
                                <td className="p-4 text-center text-amber-400 font-bold text-base">$ {(t.kpis?.share_price || (t.equity / 72000)).toFixed(2)}</td>
                                <td className="p-4 text-center">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelColor(t.kpis?.rating)}`}>
                                      {t.kpis?.rating || 'N/A'}
                                   </span>
                                </td>
                                {isFullTransparency && (
                                   <td className="p-4 text-center">
                                      <span className="text-xs font-semibold text-blue-400">
                                         $ {t.kpis?.average_price_sold ? t.kpis.average_price_sold.toFixed(2) : 'N/A'}
                                      </span>
                                   </td>
                                )}
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 w-full max-w-7xl mx-auto">
                  
                  {/* Seção de Indicadores Macroeconômicos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                     <MacroLedgerBox label="ICE (Confiança Empresarial)" val={`${currentMacro.ice}%`} icon={<Activity size={18} className="text-emerald-400" />} desc="Como o setor vê o mercado" />
                     <MacroLedgerBox label="Inflação Setorial" val={`${currentMacro.inflation_rate}%`} icon={<Flame size={18} className="text-red-400" />} desc="Flutuação geral de preços" />
                     <MacroLedgerBox label="Juros/Spread Bancários" val={`${currentMacro.interest_rate_tr}%`} icon={<Landmark size={18} className="text-blue-400" />} desc="Financiamentos e Crédito" />
                     <MacroLedgerBox label="Inadimplência (PECLD)" val={`${currentMacro.customer_default_rate}%`} icon={<ShieldAlert size={18} className="text-orange-400" />} desc="Risco de venda a prazo" />
                     <MacroLedgerBox label="Juros s/ Empréstimo Compulsório" val={`${currentMacro.compulsory_loan_agio}%`} icon={<ShieldAlert size={18} className="text-red-400" />} desc="Risco de falta de Liquidez" />
                     <MacroLedgerBox label="Ágio s/ Compras Extras" val={`${currentMacro.special_purchase_premium}%`} icon={<ShieldAlert size={18} className="text-orange-400" />} desc="Risco de compra errada" />
                     <MacroLedgerBox label="Juros Fornecedor" val={`${currentMacro.supplier_interest}%`} icon={<Truck size={18} className="text-amber-400" />} desc="Acréscimos em compra prazo" />
                     <MacroLedgerBox label="Rendimento de Aplicação" val={`${currentMacro.investment_return_rate}%`} icon={<TrendingUp size={18} className="text-indigo-400" />} desc="Rendimento do caixa parado" />
                     <MacroLedgerBox label="IVA s/ Compras" val={`${currentMacro.vat_purchases_rate}%`} icon={<Scale size={18} className="text-teal-400" />} desc="Imposto recuperável de MP" />
                     <MacroLedgerBox label="IVA s/ Vendas" val={`${currentMacro.vat_sales_rate}%`} icon={<Scale size={18} className="text-rose-400" />} desc="Imposto sobre faturamento" />
                     <MacroLedgerBox label="Imposto Renda (IR)" val={`${currentMacro.tax_rate_ir}%`} icon={<FileText size={18} className="text-amber-500" />} desc="Tributação sobre lucro operacional" />
                     <MacroLedgerBox label="Encargos Sociais" val={`${currentMacro.social_charges}%`} icon={<Users size={18} className="text-slate-400" />} desc="Adicional ao salário fabril" />
                  </div>

                  {/* Seção de custos para Matéria-prima de Atração de Volume */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 w-full">
                     <div className="bg-[#020617] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
                           <Coins className="text-amber-500" size={18} />
                           <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">Preço Base e Reajustes de Insumos</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                           <CostLedgerItem 
                              label="Matéria-Prima A" 
                              val={getAdjustedPrice(currentMacro.prices.mp_a, 'raw_material_a_adjust', round, arena.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)} 
                              icon={<Package className="text-blue-400" size={14} />} 
                              currency={arena.currency || '$'} 
                           />
                           <CostLedgerItem 
                              label="Matéria-Prima B" 
                              val={getAdjustedPrice(currentMacro.prices.mp_b, 'raw_material_b_adjust', round, arena.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)} 
                              icon={<Package className="text-indigo-400" size={14} />} 
                              currency={arena.currency || '$'} 
                           />
                        </div>
                     </div>

                     <div className="bg-[#020617] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
                           <Package className="text-sky-500" size={18} />
                           <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">Despesas Setoriais de Estocagem (unidade/período)</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                           <CostLedgerItem 
                              label="Armazenagem MP" 
                              val={getAdjustedPrice(currentMacro.prices.storage_mp, 'storage_cost_adjust', round, arena.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)} 
                              icon={<Coins className="text-slate-400" size={14} />} 
                              currency={arena.currency || '$'} 
                           />
                           <CostLedgerItem 
                              label="Estoque Produto Acabado PA" 
                              val={getAdjustedPrice(currentMacro.prices.storage_finished, 'storage_cost_adjust', round, arena.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)} 
                              icon={<Coins className="text-slate-400" size={14} />} 
                              currency={arena.currency || '$'} 
                           />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'audit' && (
               <motion.div key="audit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 w-full max-w-7xl mx-auto font-sans">
                  
                  {/* Dashboard de Auditoria Individual de Unidade */}
                  <div className="bg-[#020617] p-6 lg:p-8 rounded-2xl border border-slate-800 shadow-xl text-center space-y-6">
                     
                     {/* Carrossel Interno para Seleção de Corporações */}
                     <div className="space-y-2">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center text-amber-500 mx-auto transition-all shadow-inner"><User size={22} /></div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Conselho de Administração Fiscal</span>
                     </div>

                     {(userRole === 'tutor' || isFullTransparency) && competitors.length > 0 ? (
                       <div className="border border-slate-900 bg-slate-950 p-4 rounded-xl max-w-3xl mx-auto space-y-3">
                          <span className="text-[10px] text-slate-400 font-extrabold font-mono uppercase block">Selecione uma de suas concorrentes para o dossiê:</span>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {competitors.map(c => (
                              <button 
                                key={c.team_id}
                                onClick={() => setSelectedTeamId(c.team_id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedTeamId === c.team_id ? 'bg-amber-600 border-amber-400 text-[#020617] shadow-lg font-extrabold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                              >
                                {isIdentified || userRole === 'tutor' ? c.team?.name : `Alpha-${c.team_id.slice(0, 4)}`}
                              </button>
                            ))}
                          </div>
                       </div>
                     ) : !isFullTransparency && userRole !== 'tutor' && (
                       <div className="text-[10px] text-slate-500 font-mono italic max-w-lg mx-auto bg-slate-950/40 p-3 rounded border border-slate-900/60 leading-relaxed">
                          *Apenas o seu próprio log corporativo está exposto devido à lei de sigilo concorrencial ativa para este campeonato.
                       </div>
                     )}

                     {/* Visualização de Auditoria Consolidada da Equipe */}
                     {activeTeam ? (
                       <div className="space-y-6">
                          <div className="space-y-1">
                             <h3 className="text-2xl lg:text-3xl font-extrabold font-serif text-white uppercase italic tracking-tight">RELATÓRIO: {activeTeam.name}</h3>
                             <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Compilação Oficial Fiscal Referente ao Ciclo P-{round - 1}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                             <RelatoryKpiCard label="Valor da Ação" val={`$ ${(activeTeam.kpis?.share_price || (activeTeam.equity / 72000)).toFixed(2)}`} icon={<Coins className="text-amber-400" size={16} />} />
                             <RelatoryKpiCard label="Patrimônio Líquido" val={`$ ${activeTeam.equity.toLocaleString()}`} icon={<ShieldCheck className="text-emerald-500" size={16} />} />
                             <RelatoryKpiCard label="Market Share" val={`${(activeTeam.kpis?.market_share || 0).toFixed(1)}%`} icon={<Target className="text-orange-500" size={16} />} />
                             <RelatoryKpiCard label="Rating de Crédito" val={activeTeam.kpis?.rating || 'AAA'} icon={<Star className="text-amber-400" size={16} />} />
                          </div>
                       </div>
                     ) : (
                       <div className="py-20 text-slate-500 text-xs font-mono font-bold uppercase italic tracking-widest">
                          Selecione um painel de unidade industrial ativo de modo a visualizar as balanças fiscais consolidadas.
                       </div>
                     )}

                     {/* Informativo de Solvência R1 */}
                     {round <= 1 && (
                        <div className="mt-8 p-6 bg-red-950/20 border border-red-500/20 rounded-xl text-left space-y-3">
                           <div className="flex items-center gap-2 text-red-400">
                              <AlertTriangle size={18} />
                              <h4 className="text-xs font-bold uppercase font-mono tracking-wider">Anotação da Mesa de Auditoria (Strategos Fiscal Board)</h4>
                           </div>
                           <p className="text-slate-300 text-xs leading-relaxed font-serif italic">
                              Ao iniciar a rodada R1, todas as corporações registraram o recebimento de **$ 1.372.362,00** à título de **Uso de Empréstimo Compulsório** no fechamento do P0. Isso evitou a insolvência imediata, sendo necessário quitá-lo integralmente no encerramento do Ciclo R1. Lembre-se que incidem encargos de comissão setorial.
                           </p>
                        </div>
                     )}

                  </div>

               </motion.div>
            )}
         </AnimatePresence>
      </main>

      {/* FOOTER PREMIUM DE IMPRENSA */}
      <footer className="px-6 py-3.5 bg-[#020617] border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center opacity-75 shrink-0 w-full text-[10px] font-mono text-slate-500 gap-4">
         <span className="tracking-[0.4em] uppercase font-bold text-center sm:text-left text-[9px]">
            © Strategos News Network Co. • Protocolo Oracle v18.1 Gold High Fidelity
         </span>
         {activeTeam && (
           <span className="text-amber-600 font-bold uppercase tracking-wider italic">
              Sincronizado: {activeTeam.name}
           </span>
         )}
      </footer>
    </motion.div>
  );
};

// COMPONENTES AUXILIARES INTERNOS DE DESIGN E LAYOUT EDITORIAL

interface SectionTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SectionTab: React.FC<SectionTabProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-transparent italic whitespace-nowrap font-mono active:scale-[0.98] ${
      active 
        ? 'bg-amber-600 text-[#020617] border-amber-400 font-black shadow-md' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent'
    }`}
  >
    {icon} 
    <span>{label}</span>
  </button>
);

interface MarketBriefItemProps {
  title: string;
  desc: string;
  status: 'up' | 'down' | 'stable';
}

const MarketBriefItem: React.FC<MarketBriefItemProps> = ({ title, desc, status }) => (
  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-slate-800 transition-colors flex gap-3 text-left">
     <div className="shrink-0 mt-0.5">
        {status === 'up' && <ArrowUpRight className="text-emerald-500" size={16} />}
        {status === 'down' && <ArrowDownRight className="text-red-500" size={16} />}
        {status === 'stable' && <ChevronRight className="text-slate-500" size={16} />}
     </div>
     <div className="space-y-0.5">
        <h5 className="text-[11.5px] font-bold text-slate-200 uppercase tracking-tight">{title}</h5>
        <p className="text-[10px] text-slate-500 leading-normal">{desc}</p>
     </div>
  </div>
);

interface MacroLedgerBoxProps {
  label: string;
  val: string;
  icon: React.ReactNode;
  desc: string;
}

const MacroLedgerBox: React.FC<MacroLedgerBoxProps> = ({ label, val, icon, desc }) => (
   <div className="bg-[#020617] border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2 shadow-lg hover:border-slate-700/80 transition-colors">
      <div className="flex items-center justify-between w-full">
         <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-widest italic font-mono">{label}</span>
         <div className="p-1 bg-slate-900 rounded border border-slate-800 text-slate-400">{icon}</div>
      </div>
      <div>
         <span className="text-xl lg:text-2xl font-black text-amber-500 italic tracking-tight font-sans leading-none">{val}</span>
         <span className="block text-[9px] text-slate-500 mt-1 leading-tight font-mono">{desc}</span>
      </div>
   </div>
);

interface CostLedgerItemProps {
  label: string;
  val: number;
  icon: React.ReactNode;
  currency: any;
}

const CostLedgerItem: React.FC<CostLedgerItemProps> = ({ label, val, icon, currency }) => (
   <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 flex flex-col items-center gap-1 hover:border-slate-800 transition-all shadow-inner w-full text-center">
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-1.5">
         {icon} {label}
      </span>
      <span className="text-sm font-bold text-slate-100 font-mono mt-0.5">
         {formatCurrency(val, currency, true, 4)}
      </span>
   </div>
);

interface RelatoryKpiCardProps {
  label: string;
  val: string;
  icon: React.ReactNode;
}

const RelatoryKpiCard: React.FC<RelatoryKpiCardProps> = ({ label, val, icon }) => (
  <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 flex flex-col items-center gap-2 hover:border-amber-500/25 transition-all text-center">
     <div className="p-2 bg-slate-900 rounded-lg text-slate-300 shadow-inner">{icon}</div>
     <div>
        <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 font-mono">{label}</span>
        <span className="text-base font-black text-white italic">{val}</span>
     </div>
  </div>
);

// Auxiliar para a cor de rating de crédito
const getLevelColor = (rating?: string) => {
  switch (rating) {
     case 'AAA': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
     case 'AA':  return 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500';
     case 'A':   return 'bg-teal-500/15 border-teal-500/30 text-teal-400';
     case 'BBB': return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
     case 'BB':  return 'bg-blue-600/10 border-blue-500/20 text-blue-500';
     case 'B':   return 'bg-amber-600/15 border-amber-500/30 text-amber-500';
     case 'CCC': return 'bg-orange-500/15 border-orange-500/30 text-orange-400';
     case 'D':   return 'bg-red-500/15 border-red-500/30 text-red-500';
     default:    return 'bg-slate-900 border-slate-800 text-slate-400';
  }
};

export default GazetteViewer;
