import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, 
  Loader2, Info, CheckCircle2, Factory, 
  Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType } from '../types';

const TrailWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 2,
    botsCount: 1,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12,
    roundTime: 24,
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE * 60.09,
    currency: 'BRL' as CurrencyType
  });

  // Estados para nomes customizados
  const [teamNames, setTeamNames] = useState<string[]>(['EQUIPE ALPHA', 'EQUIPE BETA']);
  const [regionNames, setRegionNames] = useState<string[]>(['SUDESTE', 'EUROPA', 'NORDESTE', 'REGIÃO 04']);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  // Sincroniza tamanho dos arrays de nomes ao mudar contagem no Step 2
  useEffect(() => {
    setTeamNames(prev => {
      const next = [...prev];
      if (next.length < formData.humanTeamsCount) {
        for (let i = next.length; i < formData.humanTeamsCount; i++) {
          next.push(`EQUIPE TRIAL 0${i + 1}`);
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

  const handleLauch = async () => {
    setIsSubmitting(true);
    try {
      const teams = [
        ...teamNames.map((name, i) => ({ name: name.toUpperCase() || `EQUIPE TRIAL 0${i + 1}`, is_bot: false })),
        ...Array.from({ length: formData.botsCount }).map((_, i) => ({ name: `BOT 0${i + 1}`, is_bot: true }))
      ];

      await createChampionshipWithTeams({
        name: formData.name.toUpperCase() || 'INDUSTRIAL TRIAL ARENA',
        branch: 'industrial' as Branch,
        status: 'active',
        total_rounds: formData.totalRounds,
        regions_count: formData.regionsCount,
        deadline_value: formData.roundTime,
        deadline_unit: formData.roundUnit,
        initial_financials: financials,
        is_trial: true,
        is_public: true,
        currency: formData.currency,
        sales_mode: formData.marketMode,
        initial_share_price: formData.initialStockPrice,
        // Persiste nomes das regiões no config
        config: { 
          region_names: regionNames.map(r => r.toUpperCase()),
          initial_share_price: formData.initialStockPrice
        }
      }, teams, true);

      onComplete();
    } catch (e: any) { alert(`ERRO NA SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const stepsCount = 7;

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col font-sans selection:bg-orange-500 overflow-hidden relative">
      <EmpireParticles />
      
      <header className="h-20 bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 px-10 flex items-center justify-between z-[200]">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">E</div>
            <div>
               <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Trial Master Wizard</h1>
               <p className="text-[8px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-60">Protocolo Industrial v13.2</p>
            </div>
         </div>
         <div className="flex gap-2">
            {Array.from({ length: stepsCount }).map((_, i) => (
               <div key={i} className={`h-1 rounded-full transition-all duration-700 ${step === i + 1 ? 'w-10 bg-orange-600 shadow-[0_0_15px_#f97316]' : step > i + 1 ? 'w-4 bg-orange-600/40' : 'w-4 bg-white/5'}`} />
            ))}
         </div>
         <button className="p-3 text-slate-500 hover:text-white transition-colors"><Info size={20}/></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-6xl mx-auto w-full px-6 py-20">
            <AnimatePresence mode="wait">
               
               {step === 1 && (
                 <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 text-center max-w-4xl mx-auto py-10">
                    <div className="w-24 h-24 bg-orange-600/10 rounded-[2.5rem] flex items-center justify-center text-orange-500 mx-auto shadow-2xl border border-orange-500/20"><Rocket size={48}/></div>
                    <div className="space-y-6">
                       <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Bem-vindo ao <br/><span className="text-orange-600">Trial Master</span></h2>
                       <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">
                          "Aqui você experimenta um campeonato industrial completo de forma gratuita. Todas as equipes iniciam com as mesmas condições, mas só as melhores estratégias elevam o Stock Price."
                       </p>
                    </div>
                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-left grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FeatureItem icon={<Cpu size={16}/>} label="Fidelidade Engine v6.0" desc="Simulação de balanços reais com precisão matemática v13.2." />
                       <FeatureItem icon={<Sparkles size={16}/>} label="Assistência Gemini 3" desc="IA profunda para análise de decisões e geração de Gazeta." />
                       <FeatureItem icon={<Target size={16}/>} label="Stock Price Emergente" desc="O valor da ação é definido pelo seu TSR e lucratividade." />
                       <FeatureItem icon={<Globe size={16}/>} label="Ambiente Público" desc="Acesse arenas globais e valide sua estratégia solo ou em massa." />
                    </div>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-4xl mx-auto">
                    <StepHeader icon={<Settings size={28}/>} title="Configuração da Arena" desc="Parametrize o ecossistema do torneio trial." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputGroup label="Nome do Torneio" placeholder="Ex: ARENA ALPHA INDUSTRIAL" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <InputGroup type="number" label="Equipes Humanas" value={formData.humanTeamsCount} onChange={(v: string) => setFormData({...formData, humanTeamsCount: Math.max(1, Number(v))})} />
                          <InputGroup type="number" label="Bots (IA)" value={formData.botsCount} onChange={(v: string) => setFormData({...formData, botsCount: Math.max(0, Number(v))})} />
                       </div>
                       <SelectGroup label="Mercado Principal" value={formData.marketMode} onChange={(v: string) => setFormData({...formData, marketMode: v as SalesMode})} options={[{v:'internal',l:'NACIONAL (BRL)'},{v:'external',l:'INTERNACIONAL (USD)'},{v:'hybrid',l:'HÍBRIDO (MIXED)'}]} />
                       <InputGroup type="number" label="Número de Regiões" value={formData.regionsCount} onChange={(v: string) => setFormData({...formData, regionsCount: Math.max(1, Number(v))})} />
                       <InputGroup type="number" label="Rodadas Totais" value={formData.totalRounds} onChange={(v: string) => setFormData({...formData, totalRounds: Math.max(3, Number(v))})} />
                       <div className="grid grid-cols-2 gap-4">
                          <InputGroup type="number" label="Tempo/Rodada" value={formData.roundTime} onChange={(v: string) => setFormData({...formData, roundTime: Number(v)})} />
                          <SelectGroup label="Unidade" value={formData.roundUnit} onChange={(v: string) => setFormData({...formData, roundUnit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                       </div>
                    </div>
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-4xl mx-auto">
                    <StepHeader icon={<Users size={28}/>} title="Unidades e Regiões" desc="Nomeie as entidades do seu ecossistema industrial." />
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-inner">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Nodos Estratégicos (Equipes)</span>
                             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                {Array.from({ length: formData.humanTeamsCount }).map((_, i) => (
                                   <div key={i} className="flex gap-4 items-center">
                                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black">0{i+1}</div>
                                      <input 
                                        className="flex-1 bg-slate-950 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors" 
                                        value={teamNames[i] || ''}
                                        onChange={e => {
                                          const next = [...teamNames];
                                          next[i] = e.target.value;
                                          setTeamNames(next);
                                        }}
                                        placeholder={`Nome da Equipe 0${i+1}`}
                                      />
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-6">
                             <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Macro Regiões</span>
                             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                {Array.from({ length: formData.regionsCount }).map((_, i) => (
                                   <div key={i} className="flex gap-4 items-center">
                                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black"><Globe size={14}/></div>
                                      <input 
                                        className="flex-1 bg-slate-950 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors" 
                                        value={regionNames[i] || ''}
                                        onChange={e => {
                                          const next = [...regionNames];
                                          next[i] = e.target.value;
                                          setRegionNames(next);
                                        }}
                                        placeholder={`Nome da Região 0${i+1}`}
                                      />
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {step === 4 && (
                 <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <StepHeader icon={<Calculator size={28}/>} title="Estrutura Financeira P0" desc="Ajuste o capital inicial das empresas para este ciclo." />
                    <div className="bg-slate-950/60 p-4 rounded-[4rem] border border-white/5">
                       <FinancialStructureEditor 
                         initialBalance={financials?.balance_sheet} 
                         initialDRE={financials?.dre} 
                         onChange={setFinancials} 
                       />
                    </div>
                 </motion.div>
               )}

               {step === 5 && (
                 <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-4xl mx-auto">
                    <StepHeader icon={<Target size={28}/>} title="Demanda e Vendas Iniciais" desc="Defina o ponto de partida do market share." />
                    <div className="p-16 bg-slate-900 border border-white/10 rounded-[5rem] text-center space-y-8 relative overflow-hidden group shadow-2xl">
                       <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                       <Landmark size={80} className="text-blue-500 mx-auto animate-pulse" />
                       <div className="space-y-4 relative z-10">
                          <h3 className="text-4xl font-black text-white uppercase italic leading-none">Market Equilibrium Node</h3>
                          <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">
                            "Todas as unidades iniciam com participação de mercado de {(100 / (formData.humanTeamsCount + formData.botsCount)).toFixed(1)}% distribuídas nas {formData.regionsCount} regiões."
                          </p>
                       </div>
                       <div className="flex items-center justify-center gap-4 text-emerald-500 font-black text-[11px] uppercase tracking-[0.5em] relative z-10 pt-6">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Sincronização Baseline Validada
                       </div>
                    </div>
                 </motion.div>
               )}

               {step === 6 && (
                 <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-3xl mx-auto text-center">
                    <StepHeader icon={<DollarSign size={28}/>} title="Valor da Ação Inicial" desc="Stock Price do Período 0." />
                    <div className="bg-white/5 border border-white/10 p-20 rounded-[5rem] space-y-8 shadow-2xl">
                       <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Standard Industrial Node Price</span>
                       <div className="text-9xl font-black text-white italic tracking-tighter drop-shadow-2xl">$ 60,09</div>
                       <p className="text-lg text-slate-400 font-medium italic max-w-md mx-auto">
                          "Todas equipes começam com o mesmo valor. A performance do Ciclo 1 redefinirá o ranking global."
                       </p>
                    </div>
                 </motion.div>
               )}

               {step === 7 && (
                 <motion.div key="s7" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-4xl mx-auto text-center py-20">
                    <div className="w-32 h-32 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(16,185,129,0.3)] animate-pulse">
                       <ShieldCheck size={64} />
                    </div>
                    <div className="space-y-6">
                       <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Protocolo Pronto</h2>
                       <p className="text-2xl text-slate-400 font-medium italic">
                          "Arena Trial {formData.name || 'Master'} mapeada. O engine de turnover está em standby para o Período 1."
                       </p>
                    </div>
                    <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] text-left grid grid-cols-2 md:grid-cols-4 gap-6">
                       <SummaryItem label="Unidade" val={formData.humanTeamsCount} />
                       <SummaryItem label="Bots" val={formData.botsCount} />
                       <SummaryItem label="Regiões" val={formData.regionsCount} />
                       <SummaryItem label="Ciclos" val={formData.totalRounds} />
                    </div>
                 </motion.div>
               )}

            </AnimatePresence>
         </div>
      </div>

      {/* FOOTER NAV - FIXED */}
      <footer className="shrink-0 h-32 bg-slate-950 border-t border-white/10 px-10 md:px-20 flex items-center justify-between z-[100] shadow-[0_-30px_60px_rgba(0,0,0,0.5)]">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1}
           className={`flex items-center gap-4 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
         >
            <ArrowLeft size={20} /> Voltar
         </button>
         
         <div className="flex items-center gap-10">
            <div className="hidden md:flex flex-col items-end opacity-50">
               <span className="text-[9px] font-black text-white uppercase tracking-widest">Fase {step} de {stepsCount}</span>
               <span className="text-[10px] font-bold text-orange-500 uppercase italic">Orquestração Alpha Master</span>
            </div>
            {step === stepsCount ? (
              <button 
                onClick={handleLauch}
                disabled={isSubmitting}
                className="px-20 py-7 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center justify-center gap-6 active:scale-95 group"
              >
                 {isSubmitting ? <Loader2 className="animate-spin" /> : <><Rocket size={20} /> Lançar Torneio Trial</>}
              </button>
            ) : (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="px-16 py-7 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl flex items-center gap-6 active:scale-95 group"
              >
                 Avançar <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, label, desc }: any) => (
  <div className="flex gap-5 items-start group">
     <div className="p-3 bg-white/5 text-orange-500 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-lg border border-white/5">{icon}</div>
     <div>
        <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">{label}</h5>
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">{desc}</p>
     </div>
  </div>
);

const StepHeader = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-6 bg-white/5 rounded-[2rem] text-orange-500 shadow-inner flex items-center justify-center border border-white/5">{icon}</div>
     <div>
        <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4">{desc}</p>
     </div>
  </div>
);

const InputGroup = ({ label, placeholder, value, onChange, type = 'text' }: any) => (
  <div className="space-y-3 text-left">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">{label}</label>
     <input 
       type={type} value={value} onChange={e => onChange(e.target.value)}
       placeholder={placeholder} 
       className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800" 
     />
  </div>
);

const SelectGroup = ({ label, value, onChange, options }: any) => (
  <div className="space-y-3 text-left">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">{label}</label>
     <select 
       value={value} onChange={e => onChange(e.target.value)}
       className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none"
     >
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

const SummaryItem = ({ label, val }: any) => (
  <div className="text-center space-y-2">
     <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className="text-2xl font-black text-white italic">{val}</span>
  </div>
);

export default TrailWizard;