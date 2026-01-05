import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  MapPin, Boxes, Cpu, Info, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  CheckCircle2, ShieldCheck, Flame, Zap, Landmark, Shield,
  Activity, HeartPulse, CreditCard, Banknote, AlertOctagon, HelpCircle,
  Clock, TrendingUp
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, MacroIndicators } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_MACRO } from '../constants';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
  { id: 'production', label: 'Produção & Fábrica', icon: Factory },
  { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
  { id: 'legal', label: 'Protocolo Jurídico', icon: Gavel },
  { id: 'review', label: 'Viabilidade & Selo', icon: ShieldCheck },
];

const createInitialDecisions = (): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; userName?: string; }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial', userName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions());
  const [isSaving, setIsSaving] = useState(false);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [masterKeyUnlocked, setMasterKeyUnlocked] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const { data: teamData } = await supabase.from('teams').select('master_key_enabled').eq('id', teamId).maybeSingle();
          if (teamData?.master_key_enabled) setMasterKeyUnlocked(true);
        }
      }
    };
    fetchContext();
  }, [champId, teamId]);

  const currentIndicators = useMemo(() => activeArena?.market_indicators || DEFAULT_MACRO, [activeArena]);
  const projections = useMemo(() => {
    const eco = activeArena?.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' };
    return calculateProjections(decisions, branch, eco, currentIndicators);
  }, [decisions, branch, activeArena, currentIndicators]);

  const isInsolvent = projections.totalOutflow > projections.totalLiquidity;
  const canSubmit = !isInsolvent || masterKeyUnlocked;

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  const handleRequestMasterKey = async () => {
    setHelpRequested(true);
    await supabase.from('help_requests').insert({
       team_id: teamId,
       team_name: userName || 'Unidade Alpha',
       championship_id: champId,
       deficit: projections.totalOutflow - projections.totalLiquidity,
       reason: 'Insolvência em rascunho de decisão',
       created_at: new Date().toISOString()
    });
    alert("NOTIFICAÇÃO ENVIADA: O sinal de socorro foi transmitido para o Command Center do Tutor.");
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-3 pb-32 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <MarketingHealthAlert cost={projections.totalMarketingCost || 0} revenue={projections.revenue} />
         <DebtHealthAlert ratio={projections.debtRatio || 0} />
      </div>

      <header className="bg-slate-900 border border-white/5 p-3 rounded-2xl shadow-2xl flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                <span className="font-black text-[10px]">{idx + 1}</span>
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-8 pr-6">
           <div className="text-right border-r border-white/10 pr-8">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">NODE CREDIT RATING</span>
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full animate-pulse ${projections.health.rating === 'D' ? 'bg-rose-600 shadow-[0_0_12px_#f43f5e]' : projections.debtRatio! > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 <span className={`text-sm font-black italic ${projections.health.rating === 'D' ? 'text-rose-500' : projections.debtRatio! < 40 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {projections.health.rating} STANDING
                 </span>
              </div>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">LUCRO PROJETADO P{(activeArena?.current_round || 0) + 1}</span>
              <span className={`text-lg font-black font-mono italic ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.netProfit.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-6 md:p-10 rounded-[3rem] border border-white/5 relative shadow-2xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {activeStep === 0 && (
              <div className="space-y-10">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Matriz Regional de Vendas</h3>
                    <div className="flex items-center gap-4">
                       <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Campanha:</span>
                          <span className="text-sm font-black text-blue-400 font-mono">$ {currentIndicators.base_marketing_cost?.toLocaleString() || '17.165'}</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {Object.entries(decisions.regions).map(([id, data]: [any, any]) => (
                     <div key={id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 hover:border-orange-500/40 transition-all shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                           <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">Região 0{id}</h4>
                           <MapPin size={14} className="text-orange-500" />
                        </div>
                        <DecInputCompact label="Preço Unid." val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                        <div className="space-y-1.5">
                           <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black text-slate-600 uppercase italic">Nível Mkt (0-9)</label>
                              <span className="text-[10px] font-black text-orange-500">{data.marketing}</span>
                           </div>
                           <input type="range" min="0" max="9" step="1" value={data.marketing} onChange={e => updateDecision(`regions.${id}.marketing`, Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                           {[0, 1, 2].map(t => (
                             <button key={t} onClick={() => updateDecision(`regions.${id}.term`, t)} className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${data.term === t ? 'bg-blue-600 border-white text-white shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                T+{t === 0 ? '0' : t === 1 ? '30' : '60'}
                             </button>
                           ))}
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto py-6">
                 <div className="space-y-8">
                    <div className={`p-10 rounded-[4rem] border-2 transition-all duration-500 ${isInsolvent ? 'bg-rose-950/20 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.2)]' : 'bg-slate-900 border-white/5 shadow-2xl'}`}>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                          {isInsolvent ? <AlertOctagon size={32} className="text-rose-500 animate-pulse" /> : <ShieldCheck size={32} className="text-emerald-500" />}
                          {isInsolvent ? 'Risco de Insolvência' : 'Viabilidade Orçamentária'}
                       </h3>
                       <div className="space-y-4 mb-10">
                          {projections.costBreakdown.map((item: any, i: number) => (
                             <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 group">
                                <div>
                                   <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                                   <span className="text-[8px] font-bold text-slate-600 uppercase italic">{item.impact}</span>
                                </div>
                                <span className="text-lg font-black text-white font-mono">$ {item.total.toLocaleString()}</span>
                             </div>
                          ))}
                          <div className="flex justify-between items-center py-6 bg-white/5 px-6 rounded-2xl border border-white/10 mt-6">
                             <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Total a Desembolsar</span>
                             <span className="text-2xl font-black text-white font-mono tracking-tighter italic">$ {projections.totalOutflow.toLocaleString()}</span>
                          </div>
                       </div>
                       <div className={`p-6 rounded-3xl space-y-4 ${isInsolvent ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase tracking-widest">Sua Liquidez (Caixa + Novos Créditos)</span>
                             <span className="text-lg font-black font-mono">$ {projections.totalLiquidity.toLocaleString()}</span>
                          </div>
                          {isInsolvent && (
                             <p className="text-xs font-bold uppercase tracking-tight italic animate-pulse">
                               ❌ SALDO INSUFICIENTE: Ajuste marketing ou produção para sincronizar.
                             </p>
                          )}
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col justify-between py-10 space-y-12">
                    <div className="text-center space-y-6">
                       <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Final Sync</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <SummaryNode label="Share Projetado" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="EBITDA Proj." val={`$ ${projections.ebitda.toLocaleString()}`} />
                       <SummaryNode label="Debt Ratio" val={`${projections.debtRatio?.toFixed(1)}%`} />
                       <SummaryNode label="Credit Standing" val={projections.health.rating} />
                    </div>
                    <div className="space-y-4">
                       <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, (activeArena?.current_round || 0) + 1, decisions); setIsSaving(false); alert("SINAL TRANSMITIDO."); }} disabled={isSaving || !canSubmit} className={`w-full py-8 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${canSubmit ? 'bg-orange-600 text-white hover:bg-white hover:text-orange-600' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                          {isSaving ? <Loader2 className="animate-spin" /> : masterKeyUnlocked && isInsolvent ? <><Shield size={20}/> Submeter via Master Key</> : "Sincronizar Decisão"}
                       </button>
                       {isInsolvent && !masterKeyUnlocked && (
                          <button onClick={handleRequestMasterKey} disabled={helpRequested} className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-white transition-colors py-4 border border-rose-500/20 rounded-2xl hover:bg-rose-600/10">
                             {helpRequested ? <><CheckCircle2 size={14}/> Sinal Enviado</> : <><HelpCircle size={14}/> Solicitar Master Key</>}
                          </button>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {activeStep === 3 && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10 shadow-inner">
                     <h4 className="text-sm font-black uppercase text-amber-500 flex items-center gap-3 italic border-b border-white/5 pb-6"><Landmark size={22} /> Estrutura de Capital</h4>
                     <DecInput icon={<DollarSign/>} label="Tomar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                     <DecInput icon={<TrendingUp/>} label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={v => updateDecision('finance.application', v)} />
                  </div>
                  <div className="space-y-8">
                     <div className="p-10 bg-slate-900/50 rounded-[3.5rem] border border-white/10 space-y-6">
                        <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Oracle Debt Insight</h5>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center py-3 border-b border-white/5">
                              <span className="text-xs font-bold text-slate-500 uppercase">Limite de Crédito</span>
                              <span className="text-lg font-black italic text-white">$ {projections.loanLimit.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center py-3 border-b border-white/5">
                              <span className="text-xs font-bold text-slate-500 uppercase">Endividamento</span>
                              <span className={`text-lg font-black italic ${projections.debtRatio! > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>{projections.debtRatio?.toFixed(1)}%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center px-6">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center gap-3"><ChevronLeft size={18} /> Voltar</button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-600 hover:text-white transition-all flex items-center gap-4">{activeStep === 5 ? 'Processar Fechamento' : 'Avançar'} <ChevronRight size={18} /></button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const MarketingHealthAlert = ({ cost, revenue }: { cost: number, revenue: number }) => {
  const percentage = revenue > 0 ? (cost / revenue) * 100 : 0;
  const config = useMemo(() => {
    if (percentage <= 15) return { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', msg: 'Investimento Saudável', icon: <HeartPulse size={16}/> };
    if (percentage <= 25) return { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', msg: 'Risco de Margem', icon: <Zap size={16}/> };
    return { color: 'bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse', msg: 'Burn Rate Excessivo!', icon: <Flame size={16}/> };
  }, [percentage]);
  return (<div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${config.color}`}><div className="flex items-center gap-3"><div className="p-2 bg-white/10 rounded-lg">{config.icon}</div><div><span className="block text-[8px] font-black uppercase tracking-widest opacity-70">Marketing vs Receita</span><span className="text-xs font-black uppercase">{config.msg}</span></div></div><div className="text-right"><span className="text-lg font-black font-mono italic">{percentage.toFixed(1)}%</span></div></div>);
};

const DebtHealthAlert = ({ ratio }: { ratio: number }) => {
  const config = useMemo(() => {
    if (ratio <= 40) return { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', msg: 'Grau de Investimento', icon: <ShieldCheck size={16}/> };
    if (ratio <= 60) return { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', msg: 'Alavancagem Elevada', icon: <Scale size={16}/> };
    return { color: 'bg-rose-500/20 text-rose-500 border-rose-500/30 animate-bounce', msg: 'Insolvência Crítica!', icon: <ShieldAlert size={16}/> };
  }, [ratio]);
  return (<div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${config.color}`}><div className="flex items-center gap-3"><div className="p-2 bg-white/10 rounded-lg">{config.icon}</div><div><span className="block text-[8px] font-black uppercase tracking-widest opacity-70">Endividamento</span><span className="text-xs font-black uppercase">{config.msg}</span></div></div><div className="text-right"><span className="text-lg font-black font-mono italic">{ratio.toFixed(1)}%</span></div></div>);
};

const DecInput = ({ label, val, onChange, icon }: any) => (
  <div className="space-y-4 flex-1 group"><div className="flex items-center gap-3"><div className="p-2 bg-white/5 text-slate-500 group-focus-within:text-orange-500 transition-colors">{icon}</div><label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">{label}</label></div><input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 font-mono font-bold text-white text-xl outline-none focus:border-orange-500 shadow-inner" /></div>
);

const DecInputCompact = ({ label, val, onChange }: any) => (
  <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-600 uppercase italic leading-none">{label}</label><input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 font-mono font-bold text-white text-sm outline-none focus:border-orange-500 transition-all" /></div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-2 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 group hover:bg-white/10 transition-all"><span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span><span className="text-2xl font-black italic text-white font-mono tracking-tighter">{val}</span></div>
);

export default DecisionForm;