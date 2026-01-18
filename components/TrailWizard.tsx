import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, 
  Loader2, Info, CheckCircle2, Factory, 
  Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators } from '../types';

const TrailWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 1,
    botsCount: 2,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12,
    roundTime: 24,
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType
  });

  // Estados para nomes customizados
  const [teamNames, setTeamNames] = useState<string[]>(['ALPHA UNIT']);
  const [regionNames, setRegionNames] = useState<string[]>(['SUDESTE', 'EUROPA', 'NORDESTE', 'SUL']);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  // Sincroniza tamanho dos arrays de nomes ao mudar contagem
  useEffect(() => {
    setTeamNames(prev => {
      const next = [...prev];
      if (next.length < formData.humanTeamsCount) {
        for (let i = next.length; i < formData.humanTeamsCount; i++) {
          next.push(`UNIDADE TRIAL 0${i + 1}`);
        }
      }
      return next.slice(0, formData.humanTeamsCount);
    });
  }, [formData.humanTeamsCount]);

  useEffect(() => {
    setRegionNames(prev => {
      const next = [...prev];
      if (next.length < formData.regionsCount) {
        for (let i = next.length; i < formData.regionsCount; i++) {
          next.push(`REGIÃO 0${i + 1}`);
        }
      }
      return next.slice(0, formData.regionsCount);
    });
  }, [formData.regionsCount]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const teamsToCreate = [
        ...teamNames.map(n => ({ name: n, is_bot: false })),
        ...Array.from({ length: formData.botsCount }, (_, i) => ({ name: `SYNTH NODE 0${i+1}`, is_bot: true }))
      ];

      await createChampionshipWithTeams({
        name: formData.name || `TRIAL ARENA ${new Date().toLocaleDateString()}`,
        description: "Sandbox de experimentação estratégica Empirion.",
        branch: 'industrial',
        status: 'active',
        current_round: 0,
        // Fix: Changed total_rounds to totalRounds to match formData definition
        total_rounds: formData.totalRounds,
        deadline_value: formData.roundTime,
        deadline_unit: formData.roundUnit,
        regions_count: formData.regionsCount,
        region_names: regionNames,
        initial_financials: financials,
        initial_share_price: formData.initialStockPrice,
        currency: formData.currency,
        sales_mode: formData.marketMode,
        scenario_type: 'simulated' as ScenarioType,
        is_trial: true,
        market_indicators: DEFAULT_MACRO,
        transparency_level: 'medium',
        gazeta_mode: 'anonymous',
        observers: []
      }, teamsToCreate, true);
      
      onComplete();
    } catch (e: any) {
      alert(`FALHA NA INICIALIZAÇÃO DO NODO: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsCount = 5;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col font-sans overflow-hidden">
      <EmpireParticles />
      
      <header className="shrink-0 h-24 bg-slate-900/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-10 relative z-50">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
              <Rocket size={28} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Trial Master Wizard</h2>
              <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-80">Protocolo de Simulação Efêmera</p>
           </div>
        </div>
        <div className="flex gap-3">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i+1 ? 'w-16 bg-orange-600 shadow-[0_0_15px_#f97316]' : step > i+1 ? 'w-8 bg-emerald-500' : 'w-8 bg-white/10'}`} />
           ))}
        </div>
        <button onClick={() => window.history.back()} className="p-4 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24}/></button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-20 relative z-10">
        <div className="max-w-6xl mx-auto pb-32">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="Identidade da Arena" desc="Configurações globais do ambiente sandbox." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <WizardField label="Nome da Instância Trial" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TESTE INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-6">
                       {/* Fix: Changed total_rounds to totalRounds to match formData definition */}
                       <WizardField label="Total de Ciclos" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: parseInt(v)})} />
                       <WizardField label="Preço Ação P0 ($)" type="number" val={formData.initialStockPrice} onChange={(v:any)=>setFormData({...formData, initialStockPrice: parseFloat(v)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <WizardField label="Tempo por Rodada" type="number" val={formData.roundTime} onChange={(v:any)=>setFormData({...formData, roundTime: parseInt(v)})} />
                       <WizardSelect label="Unidade Temporal" val={formData.roundUnit} onChange={(v:any)=>setFormData({...formData, roundUnit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                    <WizardSelect label="Moeda do Nodo" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'}]} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Users size={32}/>} title="Unidades e Bots" desc="Defina quem participará da competição no cluster." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8 bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Dimensionamento</h4>
                       <div className="grid grid-cols-2 gap-6">
                          <WizardField label="Unidades Humanas" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v))})} />
                          <WizardField label="Synthetic Bots (IA)" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
                       </div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">"Bots utilizam o Gemini 3 Flash para tomar decisões táticas competitivas baseadas no cenário macro."</p>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-3"><CheckCircle2 size={16}/> Identificadores das Unidades</h4>
                       <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                          {teamNames.map((n, i) => (
                             <input key={i} value={n} onChange={e => { const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next); }} className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all shadow-inner" placeholder={`Nome da Unidade ${i+1}`} />
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="Geopolítica Regional" desc="Configure as áreas de disputa comercial." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/10 space-y-10 shadow-2xl">
                       <WizardField label="Quantidade de Regiões" type="number" val={formData.regionsCount} onChange={(v:any)=>setFormData({...formData, regionsCount: Math.min(15, Math.max(1, parseInt(v)))})} />
                       <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-3xl flex gap-6 items-center">
                          <Info size={32} className="text-orange-500" />
                          <p className="text-xs text-slate-300 font-medium leading-relaxed italic">Recomenda-se 4 a 9 regiões para torneios curtos de até 12 ciclos.</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest italic flex items-center gap-3"><Boxes size={16}/> Nomenclatura dos Nodos</h4>
                       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                          {regionNames.map((n, i) => (
                             <input key={i} value={n} onChange={e => { const next = [...regionNames]; next[i] = e.target.value; setRegionNames(next); }} className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-xs font-black text-white uppercase outline-none focus:border-emerald-500 transition-all" placeholder={`Região ${i+1}`} />
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="Oracle Baseline" desc="Edite os balanços e DREs iniciais para o Round Zero." />
                 <div className="bg-slate-950/60 p-2 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden">
                    <FinancialStructureEditor 
                       initialBalance={financials?.balance_sheet} 
                       initialDRE={financials?.dre} 
                       onChange={setFinancials} 
                    />
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-12">
                 <div className="w-32 h-32 bg-orange-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <ShieldCheck size={64} className="text-white" />
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter">Nodo Pronto</h1>
                    <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">
                       Sua Arena Trial com {formData.humanTeamsCount} unidades e {formData.regionsCount} regiões está pronta para inicializar o cluster.
                    </p>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] max-w-lg mx-auto inline-block">
                    <div className="flex items-center gap-4 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                       <Sparkles size={16} /> Alta Fidelidade Oracle v13.2 Ativa
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <footer className="shrink-0 h-28 bg-slate-950/90 backdrop-blur-3xl border-t border-white/5 px-12 flex items-center justify-between relative z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
         >
           <ArrowLeft size={20} /> Voltar
         </button>
         
         <div className="flex items-center gap-12">
            <div className="hidden md:flex flex-col items-end opacity-40">
               <span className="text-[8px] font-black text-white uppercase tracking-widest">Fase de Orquestração</span>
               <span className="text-[10px] font-black text-orange-500 italic uppercase">{step} de {stepsCount}</span>
            </div>
            <button 
              onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-20 py-7 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={20}/> Sincronizando Cluster...</>
               ) : step === stepsCount ? (
                 'Lançar Arena Trial'
               ) : (
                 <>Próxima Fase <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-6 bg-white/5 rounded-[2rem] text-orange-500 shadow-inner flex items-center justify-center border border-white/5">
        {icon}
     </div>
     <div>
        <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input 
        type={type} 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800 font-mono" 
        placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none shadow-inner"
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
           <Settings2 size={16} />
        </div>
     </div>
  </div>
);

export default TrailWizard;