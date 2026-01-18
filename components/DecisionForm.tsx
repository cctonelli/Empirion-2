import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ArrowRight, ArrowLeft, ShieldCheck, Activity, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  TrendingUp, Landmark, Cloud, HardDrive, AlertCircle, 
  ShieldAlert, Gavel, Trash2, ShoppingCart, Info, Award,
  Zap // Fix: Added missing Zap icon import
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig } from '../types';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const STEPS = [
  { id: 'legal', label: 'Protocolo Legal', icon: Gavel },
  { id: 'marketing', label: 'Estratégia Comercial', icon: Megaphone },
  { id: 'production', label: 'Operações & Fábrica', icon: Factory },
  { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
  { id: 'assets', label: 'Bens de Capital', icon: Cpu },
  { id: 'finance', label: 'Finanças & CapEx', icon: Landmark },
  { id: 'review', label: 'Sincronizar Ciclo', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 1, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanType: 1, application: 0 },
    estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeStep]);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          for (let i = 1; i <= (found.regions_count || 9); i++) {
            initialRegions[i] = { price: 372, term: 1, marketing: 0 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      }
    };
    fetchContext();
  }, [champId]);

  const projections: ProjectionResult | null = useMemo(() => {
    if (!activeArena) return null;
    const eco = (activeArena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }) as EcosystemConfig;
    return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators);
  }, [decisions, activeArena]);

  const rating = projections?.health?.rating || 'AAA';

  const updateDecision = (path: string, val: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleTransmit = async () => {
    setIsSaving(true);
    try {
      const result = await saveDecisions(teamId!, champId!, round, decisions);
      if (result.success) alert("TRANSMISSÃO CONCLUÍDA: Protocolo selado.");
    } catch (e: any) { alert(`ERRO: ${e.message}`); }
    setIsSaving(false);
  };

  if (!teamId || !champId) return <div className="h-full flex items-center justify-center text-slate-500 font-black uppercase text-xs">Aguardando Conexão...</div>;

  return (
    <div className="wizard-shell">
      <div className="absolute top-4 right-8 z-[60] flex items-center gap-3 bg-slate-950/80 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 shadow-2xl pointer-events-none">
         <div className={`w-2 h-2 rounded-full animate-pulse ${decisions.judicial_recovery ? 'bg-rose-500' : 'bg-orange-500'}`} />
         <span className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase">Oracle Projection: {rating} {decisions.judicial_recovery && '• RJ'}</span>
      </div>

      <nav className="wizard-header-fixed flex p-2.5 shrink-0 gap-1.5 overflow-x-auto no-scrollbar">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[100px] py-3 transition-all rounded-2xl flex flex-col items-center gap-1.5 ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <s.icon size={16} />
              <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
           </button>
         ))}
      </nav>

      <div ref={scrollContainerRef} className="wizard-content">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-10">
               
               {activeStep === 0 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-12 py-10">
                     <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border shadow-2xl transition-colors duration-700 ${decisions.judicial_recovery ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}><Gavel size={48} /></div>
                     <div className="space-y-4 max-w-xl">
                        <h2 className="text-4xl font-black text-white uppercase italic">Protocolo de Recuperação</h2>
                        <p className="text-slate-400 font-medium leading-relaxed italic">"Deseja declarar Recuperação Judicial para este ciclo? Isso impõe restrições de crédito mas congela dívidas passíveis."</p>
                     </div>
                     <div className="flex gap-6">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>Manter Fluxo Normal</button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${decisions.judicial_recovery ? 'bg-rose-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>Solicitar RJ</button>
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="space-y-12">
                     <div className="matrix-container p-4">
                        <div className="flex gap-2">
                           {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                             <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 text-slate-500 border-white/5'}`}>Região 0{i+1}</button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Preço de Venda ($)" val={decisions.regions[activeRegion]?.price || 372} onChange={(v: number) => updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={18}/>} />
                        <SelectCard label="Prazo de Venda" val={decisions.regions[activeRegion]?.term || 1} onChange={(v: number) => updateDecision(`regions.${activeRegion}.term`, v)} options={[{v:0,l:'À VISTA'},{v:1,l:'PROX. PERÍODO'},{v:2,l:'PROX + 1 (50/50)'}]} icon={<TimerCardIcon />} />
                        <InputCard label="Marketing Local" desc="(0 a 9)" val={decisions.regions[activeRegion]?.marketing || 0} onChange={(v: number) => updateDecision(`regions.${activeRegion}.marketing`, v)} icon={<Sparkles size={18}/>} />
                     </div>
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Compra MP-A (QTDE)" val={decisions.production.purchaseMPA} onChange={(v: number) => updateDecision('production.purchaseMPA', v)} icon={<Package size={18}/>} />
                     <InputCard label="Compra MP-B (QTDE)" val={decisions.production.purchaseMPB} onChange={(v: number) => updateDecision('production.purchaseMPB', v)} icon={<Package size={18}/>} />
                     <SelectCard label="Pagamento MP" val={decisions.production.paymentType} onChange={(v: number) => updateDecision('production.paymentType', v)} options={[{v:0,l:'À VISTA'},{v:1,l:'PROX. PERÍODO'},{v:2,l:'PROX + 1 (50/50)'}]} icon={<DollarSign size={18}/>} />
                     <InputCard label="Nível Atividade %" val={decisions.production.activityLevel} onChange={(v: number) => updateDecision('production.activityLevel', v)} icon={<Activity size={18}/>} />
                     <InputCard label="Produção Extra %" val={decisions.production.extraProductionPercent} onChange={(v: number) => updateDecision('production.extraProductionPercent', v)} icon={<Zap size={18}/>} />
                     <InputCard label="Investimento P&D" val={decisions.production.rd_investment} onChange={(v: number) => updateDecision('production.rd_investment', v)} icon={<Cpu size={18}/>} />
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Admitidos (QTDE)" val={decisions.hr.hired} onChange={(v: number) => updateDecision('hr.hired', v)} icon={<Users2 size={18}/>} />
                     <InputCard label="Demitidos (QTDE)" val={decisions.hr.fired} onChange={(v: number) => updateDecision('hr.fired', v)} icon={<Users2 size={18}/>} />
                     <InputCard label="Salário Base ($)" val={decisions.hr.salary} onChange={(v: number) => updateDecision('hr.salary', v)} icon={<DollarSign size={18}/>} />
                     <InputCard label="Treinamento %" val={decisions.hr.trainingPercent} onChange={(v: number) => updateDecision('hr.trainingPercent', v)} icon={<Target size={18}/>} />
                     <InputCard label="Participação Lucros %" val={decisions.hr.participationPercent} onChange={(v: number) => updateDecision('hr.participationPercent', v)} icon={<ShieldCheck size={18}/>} />
                     <InputCard label="Diversos ($)" val={decisions.hr.misc} onChange={(v: number) => updateDecision('hr.misc', v)} icon={<DollarSign size={18}/>} />
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><ShoppingCart size={14}/> Aquisição de Máquinas</h4>
                           <InputCard label="Compra ALFA" val={decisions.machinery.buy.alfa} onChange={(v: number) => updateDecision('machinery.buy.alfa', v)} />
                           <InputCard label="Compra BETA" val={decisions.machinery.buy.beta} onChange={(v: number) => updateDecision('machinery.buy.beta', v)} />
                           <InputCard label="Compra GAMA" val={decisions.machinery.buy.gama} onChange={(v: number) => updateDecision('machinery.buy.gama', v)} />
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2"><Trash2 size={14}/> Venda de Ativos</h4>
                           <InputCard label="Venda ALFA" val={decisions.machinery.sell.alfa} onChange={(v: number) => updateDecision('machinery.sell.alfa', v)} />
                           <InputCard label="Venda BETA" val={decisions.machinery.sell.beta} onChange={(v: number) => updateDecision('machinery.sell.beta', v)} />
                           <InputCard label="Venda GAMA" val={decisions.machinery.sell.gama} onChange={(v: number) => updateDecision('machinery.sell.gama', v)} />
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <InputCard label="Tomada Empréstimo ($)" val={decisions.finance.loanRequest} onChange={(v: number) => updateDecision('finance.loanRequest', v)} icon={<Landmark size={18}/>} />
                     <SelectCard label="Tipo de Empréstimo" val={decisions.finance.loanType} onChange={(v: number) => updateDecision('finance.loanType', v)} options={[{v:1,l:'CURTO PRAZO'},{v:2,l:'MEDIO (50/50)'},{v:3,l:'LONGO (33/33/33)'}]} icon={<ShieldAlert size={18}/>} />
                     <InputCard label="Aplicação Fin. ($)" val={decisions.finance.application} onChange={(v: number) => updateDecision('finance.application', v)} icon={<TrendingUp size={18}/>} />
                  </div>
               )}

               {activeStep === 6 && (
                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Faturamento Previsto ($)" val={decisions.estimates.forecasted_revenue} onChange={(v: number) => updateDecision('estimates.forecasted_revenue', v)} icon={<Award size={18}/>} placeholder="Opcional para Premiação" />
                        <InputCard label="Custo Médio Previsto ($)" val={decisions.estimates.forecasted_unit_cost} onChange={(v: number) => updateDecision('estimates.forecasted_unit_cost', v)} icon={<Award size={18}/>} />
                        <InputCard label="Lucro Líquido Previsto ($)" val={decisions.estimates.forecasted_net_profit} onChange={(v: number) => updateDecision('estimates.forecasted_net_profit', v)} icon={<Award size={18}/>} />
                     </div>
                     <div className="p-10 bg-slate-900/60 rounded-[3rem] border border-white/5 text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-pulse"><ShieldCheck size={32}/></div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Ready for Sincronização</h4>
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em]">Protocolo v13.6 Industrial. Todas as métricas estão prontas para turnover.</p>
                     </div>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className={`px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-3 active:scale-95 ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}>
            <ArrowLeft size={18} /> Voltar
         </button>
         <div className="flex items-center gap-10">
            <div className="hidden sm:flex flex-col items-end opacity-40"><span className="text-[8px] font-black text-white uppercase tracking-widest">Protocolo Oracle</span><span className="text-[10px] font-black text-orange-500 italic uppercase">Fase {activeStep + 1} de {STEPS.length}</span></div>
            {activeStep === STEPS.length - 1 ? (
              <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-4 active:scale-95 group">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Selar e Transmitir Ciclo
              </button>
            ) : (
              <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="px-16 py-6 bg-white text-slate-950 hover:bg-orange-600 hover:text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 active:scale-95 group">
                Avançar Protocolo <ArrowRight size={18} />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const InputCard = ({ label, desc, val, icon, onChange, placeholder }: any) => (
  <div className="glass-card p-8 space-y-6 group text-left">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors border border-white/5">{icon || <Info size={18}/>}</div>
        <div>
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</label>
           {desc && <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5">{desc}</p>}
        </div>
     </div>
     <input type="number" value={val} placeholder={placeholder} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950/60 border-none rounded-2xl px-6 py-5 text-white font-mono font-black text-3xl outline-none focus:ring-2 focus:ring-orange-600 transition-all shadow-inner" />
  </div>
);

const SelectCard = ({ label, val, options, icon, onChange }: any) => (
  <div className="glass-card p-8 space-y-6 group text-left">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-blue-500 transition-colors border border-white/5">{icon}</div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</label>
     </div>
     <div className="relative">
        <select value={val} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950/60 border-none rounded-2xl px-6 py-5 text-white font-black text-sm uppercase outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner appearance-none cursor-pointer">
           {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 rotate-90" />
     </div>
  </div>
);

const TimerCardIcon = () => <Activity size={18} />;

export default DecisionForm;