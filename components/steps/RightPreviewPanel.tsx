import React, { useMemo, useState } from 'react';
import { 
  Activity, ChevronRight, ShieldCheck, Shield, Target, Warehouse, 
  BarChart3, AlertOctagon, TrendingUp, HelpCircle, Flame, Users, AlertTriangle, Briefcase, Info
} from 'lucide-react';
import { DecisionData, Championship, Team, CurrencyType } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RightPreviewPanelProps {
  decisions: DecisionData;
  projections: any;
  activeArena: Championship | null;
  activeTeam: Team | null;
  round: number;
  isRightPreviewCollapsed: boolean;
  setIsRightPreviewCollapsed: (collapsed: boolean) => void;
  projectedESDS: any;
  isCalculatingESDS: boolean;
  handleSimulateESDS: () => void;
}

// Sub-componente Sparkline SVG de alta performance e visual refinado
interface TrendSparklineProps {
  label: string;
  current: number;
  projected: number;
  currency: CurrencyType;
}

const TrendSparkline: React.FC<TrendSparklineProps> = ({ label, current, projected, currency }) => {
  const percentChange = current !== 0 ? ((projected - current) / Math.abs(current)) * 100 : 0;
  const isUp = projected >= current;
  const colorClass = isUp ? 'text-emerald-400' : 'text-rose-400';
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  
  // Normalização simplificada dos pontos do micro-gráfico (60px de largura x 24px de altura)
  const valMin = Math.min(current, projected);
  const valMax = Math.max(current, projected);
  const diff = valMax - valMin === 0 ? 1 : valMax - valMin;
  
  const y1 = 20 - ((current - valMin) / diff) * 16;
  const y2 = 20 - ((projected - valMin) / diff) * 16;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 shadow-inner transition-all hover:bg-slate-950/60 hover:border-white/10">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 font-sans">{label}</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-white text-xs font-black font-mono">
            {formatCurrency(projected, currency)}
          </span>
          {current !== 0 && (
            <span className={`text-[8px] font-mono font-black ${colorClass}`}>
              {isUp ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
            </span>
          )}
        </div>
        <span className="text-[8px] text-slate-500 font-mono mt-0.5">Atual: {formatCurrency(current, currency)}</span>
      </div>
      
      {/* Vetor Mini Sparkline SVG com Gradient de brilho */}
      <div className="w-16 h-8 flex items-center justify-end shrink-0 ml-2">
        <svg width="60" height="24" className="overflow-visible">
          <defs>
            <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.02" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 24 L 0 ${y1} L 60 ${y2} L 60 24 Z`}
            fill={`url(#grad-${label.replace(/\s+/g, '-')})`}
          />
          <line
            x1="0" y1={y1}
            x2="60" y2={y2}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="0" cy={y1} r="2.5" fill="#020617" stroke={strokeColor} strokeWidth="1" />
          <circle cx="60" cy={y2} r="3" fill={strokeColor} />
        </svg>
      </div>
    </div>
  );
};

export const RightPreviewPanel: React.FC<RightPreviewPanelProps> = ({
  decisions,
  projections,
  activeArena,
  activeTeam,
  round,
  isRightPreviewCollapsed,
  setIsRightPreviewCollapsed,
  projectedESDS,
  isCalculatingESDS,
  handleSimulateESDS,
}) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'risks' | 'kardex'>('finance');

  // Reconciliação Z-Guard (Auditoria)
  const validation = useMemo(() => {
    let isValid = true;
    let errors: string[] = [];
    if (projections?.kpis?.validation) {
      isValid = projections.kpis.validation.isValid;
      errors = projections.kpis.validation.errors || [];
    }
    return { isValid, errors };
  }, [projections]);

  // Solvência E-SDS
  const esds = useMemo(() => {
    const esdsVal = projections?.kpis?.esds?.esds_display ?? 0;
    const esdsZone = projections?.kpis?.esds?.zone ?? 'Verde';
    const esdsGargalos = projections?.kpis?.esds?.top_gargalos ?? [];
    
    let bgHex = 'bg-emerald-500';
    let textHex = 'text-emerald-400';
    let borderHex = 'border-emerald-500/20';
    let zoneColor = 'green';
    
    if (esdsZone === 'Azul') { 
      bgHex = 'bg-blue-500'; 
      textHex = 'text-blue-400'; 
      borderHex = 'border-blue-500/20';
      zoneColor = 'blue';
    } else if (esdsZone === 'Amarelo') { 
      bgHex = 'bg-yellow-500'; 
      textHex = 'text-yellow-400'; 
      borderHex = 'border-yellow-500/20';
      zoneColor = 'yellow';
    } else if (esdsZone === 'Laranja') { 
      bgHex = 'bg-orange-500'; 
      textHex = 'text-orange-400'; 
      borderHex = 'border-orange-500/20';
      zoneColor = 'orange';
    } else if (esdsZone === 'Vermelho') { 
      bgHex = 'bg-rose-500'; 
      textHex = 'text-rose-400'; 
      borderHex = 'border-rose-500/20';
      zoneColor = 'rose';
    }

    return { val: esdsVal, zone: esdsZone, gargalos: esdsGargalos, bgHex, textHex, borderHex, zoneColor };
  }, [projections]);

  // Kardex Físico & Estoque MP
  const kardex = useMemo(() => {
    const mpaInput = decisions.production.purchaseMPA ?? 0;
    const mpbInput = decisions.production.purchaseMPB ?? 0;
    
    const initialA = activeTeam?.kpis?.stock_quantities?.mp_a ?? 30150;
    const estProd = Math.floor((activeTeam?.kpis?.production_capacity || 0) * (decisions.production.activityLevel / 100));
    const extraP = decisions.production.extraProductionPercent || 0;
    const totalP = estProd + Math.floor(estProd * (extraP / 100));
    
    const consA = totalP * 3;
    const finalA = Math.max(0, initialA + mpaInput - consA);
    const emergA = consA > (initialA + mpaInput) ? consA - (initialA + mpaInput) : 0;
    
    const initialB = activeTeam?.kpis?.stock_quantities?.mp_b ?? 20100;
    const consB = totalP * 2;
    const finalB = Math.max(0, initialB + mpbInput - consB);
    const emergB = consB > (initialB + mpbInput) ? consB - (initialB + mpbInput) : 0;

    return { initialA, consA, finalA, emergA, initialB, consB, finalB, emergB, totalP };
  }, [decisions, activeTeam]);

  // Finanças Projetadas T+1
  const finance = useMemo(() => {
    const dre = projections?.kpis?.statements?.income_statement || [];
    const dfc = projections?.kpis?.statements?.cash_flow || [];
    
    const receita = dre.find((n: any) => n.id === 'is.revenue')?.value || 0;
    const ebitda = projections?.kpis?.ebitda || 0;
    const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;
    const lucroLiq = dre.find((n: any) => n.id === 'is.net_profit')?.value || 0;
    const cashFinal = dfc.find((n: any) => n.id === 'cf.final')?.value || 0;

    return { receita, ebitda, margemEbitda, lucroLiq, cashFinal };
  }, [projections, activeArena]);

  // Finanças Atuais do Round Corrente (para o Sparkline)
  const currentFinance = useMemo(() => {
    if (!activeTeam) return { receita: 0, ebitda: 0, margemEbitda: 0, lucroLiq: 0, cashFinal: 0 };
    const dre = activeTeam.kpis?.statements?.income_statement || [];
    const dfc = activeTeam.kpis?.statements?.cash_flow || [];
    
    const receita = dre.find((n: any) => n.id === 'is.revenue')?.value || activeTeam.kpis?.revenue || 0;
    const ebitda = activeTeam.kpis?.ebitda || 0;
    const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;
    const lucroLiq = dre.find((n: any) => n.id === 'is.net_profit')?.value || 0;
    const cashFinal = activeTeam.kpis?.current_cash || dfc.find((n: any) => n.id === 'cf.final')?.value || 0;

    return { receita, ebitda, margemEbitda, lucroLiq, cashFinal };
  }, [activeTeam]);

  // GERAÇÃO DOS SINAIS DE ALERTA DE RISCO (METRIC COCKPIT)
  const alerts = useMemo(() => {
    const list = [];

    // Alerta Caixa Negativo
    if (finance.cashFinal < 0) {
      list.push({
        type: 'critical',
        title: 'Caixa Insolvente (Caixa Final < 0)',
        desc: `Risco de Empréstimo Compulsório com ágio agressivo no processamento do Oráculo.`,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        icon: <AlertOctagon size={16} />
      });
    } else if (finance.cashFinal < 20000) {
      list.push({
        type: 'warning',
        title: 'Liquidez Estressada',
        desc: 'Saldo final abaixo da reserva de capital prudencial sugerida.',
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        icon: <AlertTriangle size={16} />
      });
    }

    // Alerta Ruptura de Estoque
    if (kardex.emergA > 0 || kardex.emergB > 0) {
      list.push({
        type: 'critical',
        title: 'Ruptura de Estoque Iminente',
        desc: `Necessidade de compras automáticas de emergência com sobrecusto de urgência.`,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        icon: <Warehouse size={16} />
      });
    }

    // Alerta Fadiga Operacional
    if (decisions.production.extraProductionPercent > 30 && decisions.hr.productivityBonusPercent < 5) {
      list.push({
        type: 'warning',
        title: 'Estresse de Pessoal / Fadiga',
        desc: 'Utilização elevada de turno extra (+30%) sem compensação equivalente de bônus, elevando turnover.',
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        icon: <Flame size={16} />
      });
    }

    // Alerta de Salário Abaixo do Mínimo Regional
    const minSal = activeArena?.market_indicators?.min_salary || 2000;
    if (decisions.hr.salary < minSal) {
      list.push({
        type: 'critical',
        title: 'Salário Base Abaixo do Piso',
        desc: `Piso salarial está abaixo de ${formatCurrency(minSal, 'BRL')}. Altíssimo risco de greve geral.`,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        icon: <AlertTriangle size={16} />
      });
    }

    // Se RJ estiver ativa
    if (decisions.judicial_recovery) {
      list.push({
        type: 'info',
        title: 'Operação em Recuperação Judicial',
        desc: 'Regime legal restritivo ativo. Custos com capis adicionais e amortização forçada.',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        icon: <Briefcase size={16} />
      });
    }

    return list;
  }, [finance, kardex, decisions, activeArena]);

  if (isRightPreviewCollapsed) return null;

  return (
    <div className="w-full bg-[#030712]/95 border-t lg:border-t-0 lg:border-l border-white/5 shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out lg:w-[410px] shadow-[0_0_80px_rgba(0,0,0,0.5)] z-40 relative">
      {/* Header do Preview */}
      <div className="p-4 bg-[#090d16] border-b border-white/10 shrink-0 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Activity size={16} className="text-orange-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-mono truncate">Piloto Imperial (T+1)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono font-bold text-emerald-400 uppercase rounded-full flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> REAL-TIME
          </div>
          <button 
            type="button"
            onClick={() => setIsRightPreviewCollapsed(true)} 
            className="hidden lg:block p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Ocultar painel de simulação"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CONTROLE DE ABAS (TABS CONTROLLER) - EVITA SOBRECARGA VERTICAL */}
      <div className="p-3 bg-slate-950/40 border-b border-white/5 shrink-0">
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 gap-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Finanças
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risks')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === 'risks'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Riscos
            {alerts.length > 0 && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kardex')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'kardex'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Kardex/MP
          </button>
        </div>
      </div>

      {/* Área dos Conteúdos das Abas com scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        
        {/* ABA: FINANÇAS */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* WIDGET SOLVÊNCIA E-SDS */}
            <div className="p-4 rounded-2xl border bg-slate-900 border-[#f97316]/10 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-sans">
                  <Target size={14} className="text-orange-500 animate-pulse" />
                  Solvência Corporativa E-SDS
                </span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${esds.borderHex} ${esds.textHex} font-mono uppercase bg-slate-950/40 shadow-inner`}>
                  Zona {esds.zone}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-black italic tracking-tighter text-white font-mono">
                    {esds.val.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Meta Mínima: 2.00</div>
                </div>
                
                <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner flex items-center">
                  <div className={`h-full ${esds.bgHex} transition-all duration-500 rounded-full`} style={{ width: `${Math.min(100, Math.max(5, esds.val * 10))}%` }} />
                  {/* Marcador de limite 2.0 */}
                  <div className="absolute left-[20%] top-0 bottom-0 w-0.5 bg-white/30" title="Limite de Alerta Geral" />
                </div>
              </div>

              {/* MINI-ESDS-CHART: ANALISE EXECUTIVA DE IMPACTOS */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Análise Dinâmica de Atratividades</span>
                <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-300 font-sans">
                  <div className="flex justify-between items-center bg-slate-950/40 px-2 py-1.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[8px] uppercase">Rendimento CapEx</span>
                    <span className="font-mono font-bold text-orange-400">+{(kardex.totalP > 0 ? (kardex.totalP / 1000).toFixed(1) : "0.0")}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 px-2 py-1.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[8px] uppercase">Margem EBITDA</span>
                    <span className="font-mono font-bold text-orange-400">{finance.margemEbitda.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {esds.gargalos.length > 0 ? (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 font-sans">Gargalos Ativos E-SDS:</span>
                  <div className="flex flex-wrap gap-1">
                    {esds.gargalos.map((g: any, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-black rounded uppercase border border-rose-500/20 font-sans">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[8px] text-emerald-400 font-semibold italic flex items-center gap-1 font-sans">✓ Nenhum gargalo grave detectado nesta projeção.</span>
                </div>
              )}
            </div>

            {/* SEÇÃO PRINCIPAL DE SPARKLINE DE PROJEÇÃO FINANCEIRA */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-sans">
                <BarChart3 size={14} className="text-orange-500" />
                Vetor de Tendências Financeiras (T → T+1)
              </span>
              
              <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-xl">
                <TrendSparkline 
                  label="Faturamento Bruto" 
                  current={currentFinance.receita} 
                  projected={finance.receita} 
                  currency={activeArena?.currency || 'BRL'} 
                />
                
                <TrendSparkline 
                  label="EBITDA Ajustado" 
                  current={currentFinance.ebitda} 
                  projected={finance.ebitda} 
                  currency={activeArena?.currency || 'BRL'} 
                />
                
                <TrendSparkline 
                  label="Lucro Líquido" 
                  current={currentFinance.lucroLiq} 
                  projected={finance.lucroLiq} 
                  currency={activeArena?.currency || 'BRL'} 
                />
                
                <TrendSparkline 
                  label="Caixa Final Estimado" 
                  current={currentFinance.cashFinal} 
                  projected={finance.cashFinal} 
                  currency={activeArena?.currency || 'BRL'} 
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA: RISCOS */}
        {activeTab === 'risks' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* WIDGET Z-GUARD: AUDITORIA CONTÁBIL */}
            <div className={`p-4 rounded-2xl border transition-all shadow-lg ${validation.isValid ? 'bg-emerald-950/10 border-emerald-500/15' : 'bg-rose-950/10 border-rose-500/15'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5">
                  {validation.isValid ? <ShieldCheck size={16} className="text-emerald-400" /> : <Shield size={16} className="text-rose-400" />}
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 font-sans">Reconciliação Contábil Z-Guard</span>
                </div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono border ${validation.isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-500/10 text-rose-400 border-rose-400/20 animate-pulse'}`}>
                  {validation.isValid ? 'CONSISTENTE' : 'DISPARIDADE'}
                </span>
              </div>
              {validation.isValid ? (
                <p className="text-[9px] text-emerald-400/80 italic font-sansClassName">Integridade contábil ativa entre DRE, DFC e Balanço Patrimonial (Z-Guard).</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-[9px] text-rose-200 italic font-bold font-sans">Identificadas rupturas de integridade contábil:</p>
                  {validation.errors.map((err, i) => (
                    <p key={i} className="text-[8px] text-rose-300 font-mono leading-tight flex items-start gap-1">
                      <span>•</span> {err}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* PAINEL DE RISCOS OPERACIONAIS */}
            <div className="p-4 rounded-2xl border bg-slate-900 border-white/5 space-y-3 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-sans">
                <AlertOctagon size={14} className="text-orange-500 animate-pulse" />
                Cockpit de Riscos Ativos
              </span>

              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center py-4">
                    <ShieldCheck className="mx-auto text-emerald-400 mb-2 animate-bounce" size={24} />
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide font-sans">Operação Totalmente Segura</p>
                    <p className="text-[8px] text-slate-400 mt-1 font-sans">Nenhum risco regulatório, operacional ou financeiro detectado.</p>
                  </div>
                ) : (
                  alerts.map((al, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex gap-2.5 items-start ${al.color} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className="shrink-0 mt-0.5">{al.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wide font-sans truncate">{al.title}</p>
                        <p className="text-[8px] text-slate-300 mt-0.5 leading-relaxed font-sans">{al.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: KARDEX */}
        {activeTab === 'kardex' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* WIDGET KARDEX & ESTOQUE */}
            <div className="p-4 rounded-2xl border bg-slate-900 border-white/5 space-y-4 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-sans">
                <Warehouse size={14} className="text-orange-500" />
                Kardex Físico & Estoque MP
              </span>

              {/* MATÉRIA-PRIMA A */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-sans">
                  <span className="font-bold text-slate-300">MATÉRIA-PRIMA A (Silício)</span>
                  {kardex.emergA > 0 ? (
                    <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse font-mono">
                      EMERGÊNCIA (+{kardex.emergA})
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      SALDO OK (+{kardex.finalA})
                    </span>
                  )}
                </div>
                <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${kardex.emergA > 0 ? 'bg-rose-600' : 'bg-orange-500'} transition-all duration-300 rounded-full`} style={{ width: `${Math.min(100, Math.max(5, (kardex.finalA / Math.max(1, kardex.initialA)) * 100))}%` }} />
                </div>
                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono leading-none pt-0.5">
                  <span>Inic: {kardex.initialA}</span>
                  <span>Cons: {kardex.consA}</span>
                  <span>Fin: {kardex.finalA}</span>
                </div>
              </div>

              {/* MATÉRIA-PRIMA B */}
              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-sans">
                  <span className="font-bold text-slate-300">MATÉRIA-PRIMA B (Germânio)</span>
                  {kardex.emergB > 0 ? (
                    <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse font-mono">
                      EMERGÊNCIA (+{kardex.emergB})
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      SALDO OK (+{kardex.finalB})
                    </span>
                  )}
                </div>
                <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${kardex.emergB > 0 ? 'bg-rose-600' : 'bg-orange-500'} transition-all duration-300 rounded-full`} style={{ width: `${Math.min(100, Math.max(5, (kardex.finalB / Math.max(1, kardex.initialB)) * 100))}%` }} />
                </div>
                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono leading-none pt-0.5">
                  <span>Inic: {kardex.initialB}</span>
                  <span>Cons: {kardex.consB}</span>
                  <span>Fin: {kardex.finalB}</span>
                </div>
              </div>
            </div>

            {/* CARD EXPLICATIVO DE CONSUMO INDUSTRIAL */}
            <div className="p-4 bg bg-slate-900 rounded-2xl border border-white/5 text-[10px] text-slate-400 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold mb-1">
                <Info size={12} className="text-orange-500" />
                <span>Régula Fiscal do Consumo</span>
              </div>
              <p>Cada unidade acabada exige proporcionalmente <strong>3 unidades de MP A</strong> e <strong>2 de MP B</strong>.</p>
              <p>Se as compras programadas somadas ao saldo em mãos forem inadequadas, aciona-se automaticamente a <strong>Compra de Emergência com sobrecusto</strong>.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
