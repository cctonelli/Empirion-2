
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator,
  Trophy, Factory, ShoppingCart, Briefcase, Tractor,
  Gavel, Sparkles, Sliders, CheckCircle2, LayoutGrid
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode, ChampionshipTemplate } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0]);
  
  const [formData, setFormData] = useState({
    name: isTrial ? 'ARENA TESTE GRÁTIS' : '', 
    branch: 'industrial' as Branch,
    salesMode: 'hybrid' as SalesMode,
    scenarioType: 'simulated' as ScenarioType,
    modalityType: 'standard' as ModalityType,
    transparency: 'medium' as TransparencyLevel,
    totalRounds: 12,
    teamsLimit: 8,
    currency: 'BRL',
    roundFrequencyDays: 7
  });

  const [teams, setTeams] = useState<{ name: string }[]>([]);

  // Sincroniza dados do template selecionado
  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        branch: selectedTemplate.branch,
        modalityType: selectedTemplate.config.modalityType || 'standard',
        salesMode: selectedTemplate.config.salesMode || 'hybrid',
        scenarioType: selectedTemplate.config.scenarioType || 'simulated',
        transparency: selectedTemplate.config.transparencyLevel || 'medium',
        roundFrequencyDays: selectedTemplate.config.roundFrequencyDays || 7
      }));
    }
  }, [selectedTemplate]);

  // Gera lista de times padrão baseada no limite
  useEffect(() => {
    const currentCount = teams.length;
    if (currentCount !== formData.teamsLimit) {
      const newTeams = Array.from({ length: formData.teamsLimit }).map((_, i) => ({
        name: teams[i]?.name || `Equipe ${String.fromCharCode(65 + i)}` 
      }));
      setTeams(newTeams);
    }
  }, [formData.teamsLimit]);

  const handleLaunch = async () => {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    try {
      const champPayload: Partial<Championship> = {
        name: formData.name || (isTrial ? 'ARENA TESTE' : 'NOVA SIMULAÇÃO'),
        branch: formData.branch,
        status: 'active',
        is_public: true,
        current_round: 0,
        total_rounds: formData.totalRounds,
        sales_mode: formData.salesMode,
        scenario_type: formData.scenarioType,
        currency: formData.currency as any,
        round_frequency_days: formData.roundFrequencyDays,
        transparency_level: formData.transparency,
        config: {
           currency: formData.currency as any,
           roundFrequencyDays: formData.roundFrequencyDays,
           salesMode: formData.salesMode,
           scenarioType: formData.scenarioType,
           transparencyLevel: formData.transparency,
           modalityType: formData.modalityType,
           teamsLimit: formData.teamsLimit,
           botsCount: 0
        },
        initial_financials: selectedTemplate.initial_financials,
        market_indicators: selectedTemplate.market_indicators
      };
      
      await createChampionshipWithTeams(champPayload, teams, isTrial);
      onComplete();
    } catch (e) { 
      console.error("Deploy Failure:", e);
      alert("Falha técnica no deploy da arena. Verifique a conexão com o Oracle Node."); 
    }
    setIsSubmitting(false);
  };

  const getTemplateIcon = (branch: string) => {
    switch(branch) {
      case 'industrial': return <Factory size={24} />;
      case 'commercial': return <ShoppingCart size={24} />;
      case 'services': return <Briefcase size={24} />;
      case 'agribusiness': return <Tractor size={24} />;
      default: return <LayoutGrid size={24} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* HEADER DE STATUS */}
      <header className="p-10 border-b border-white/5 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
              <Sliders size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Orquestrador de Arena</h2>
              <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1 italic">
                 {isTrial ? 'Sandbox Deployment v6.0' : 'Oracle Production Node'}
              </p>
           </div>
        </div>
        <div className="flex gap-4">
           {[1, 2, 3, 4].map((s) => (
             <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div className="p-12 min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELEÇÃO DE TEMPLATE */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase italic">1. Selecionar Matriz Estratégica</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Escolha um template Bernard Legacy pré-configurado.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`p-8 rounded-[3rem] border transition-all text-left group relative overflow-hidden ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-orange-500/50'}`}
                    >
                       <div className="flex items-center justify-between mb-6">
                          <div className={`p-4 rounded-2xl transition-all ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-orange-500'}`}>
                             {getTemplateIcon(tpl.branch)}
                          </div>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={24} className="text-white animate-in zoom-in" />}
                       </div>
                       <h4 className={`text-xl font-black uppercase italic tracking-tight ${selectedTemplate?.id === tpl.id ? 'text-white' : 'text-slate-200'}`}>{tpl.name}</h4>
                       <p className={`text-xs font-medium leading-relaxed mt-3 italic ${selectedTemplate?.id === tpl.id ? 'text-orange-100' : 'text-slate-500'}`}>
                          {tpl.description}
                       </p>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {/* STEP 2: CONFIGURAÇÃO AVANÇADA */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase italic">2. Parametrização do Nodo</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ajuste as regras de negócio e limites da arena.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Nome da Arena</label>
                        <input 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="EX: COPA INDUSTRIAL ELITE"
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-orange-500 transition-all"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Total de Rodadas</label>
                           <input type="number" value={formData.totalRounds} onChange={e => setFormData({...formData, totalRounds: Number(e.target.value)})} className="w-full p-5 bg-slate-800 border border-white/10 rounded-2xl text-white font-bold outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Limite de Equipes</label>
                           <input type="number" value={formData.teamsLimit} onChange={e => setFormData({...formData, teamsLimit: Number(e.target.value)})} className="w-full p-5 bg-slate-800 border border-white/10 rounded-2xl text-white font-bold outline-none" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                        <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Protocolo de Vendas</h4>
                        <div className="flex gap-2">
                           {['internal', 'external', 'hybrid'].map(m => (
                             <button key={m} onClick={() => setFormData({...formData, salesMode: m as SalesMode})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${formData.salesMode === m ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                                {m}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                        <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Nível de Transparência</h4>
                        <div className="flex gap-2">
                           {['low', 'medium', 'high', 'full'].map(t => (
                             <button key={t} onClick={() => setFormData({...formData, transparency: t as TransparencyLevel})} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${formData.transparency === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                                {t}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* STEP 3: GESTÃO DE TIMES */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase italic">3. Identidade das Unidades</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Renomeie as equipes para personalização da arena.</p>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                  {teams.map((t, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] space-y-3 group hover:border-orange-500/40 transition-all">
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-slate-500 uppercase">Unit 0{i+1}</span>
                          <UserPlus size={12} className="text-orange-500" />
                       </div>
                       <input 
                         value={t.name}
                         onChange={e => {
                           const nt = [...teams];
                           nt[i].name = e.target.value;
                           setTeams(nt);
                         }}
                         className="w-full bg-transparent border-none outline-none text-white font-black uppercase text-xs tracking-tighter"
                       />
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {/* STEP 4: FINALIZAÇÃO */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-10">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-orange-600 blur-[60px] opacity-20 rounded-full animate-pulse" />
                  <div className="w-32 h-32 bg-orange-600 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative z-10 border-4 border-white/10">
                     <ShieldCheck size={64} />
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena Validada</h3>
                  <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto italic">
                    "O motor Industrial v6.0 está carregado com R$ 9.1M em ativos. Pronto para orquestração de rede."
                  </p>
               </div>
               <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Grounding Ativo</div>
                  <div className="flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> Gemini Intel</div>
                  <div className="flex items-center gap-2"><Calculator size={14} className="text-emerald-500" /> Math Engine OK</div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DE NAVEGAÇÃO */}
      <footer className="p-10 border-t border-white/5 bg-slate-950/50 flex justify-between items-center">
         <button 
           onClick={() => setStep(s => Math.max(1, s - 1))}
           disabled={step === 1 || isSubmitting}
           className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white disabled:opacity-0 transition-all flex items-center gap-3"
         >
            <ArrowLeft size={16} /> Voltar Protocolo
         </button>
         
         <button 
           onClick={step === 4 ? handleLaunch : () => setStep(s => s + 1)}
           disabled={isSubmitting || (step === 1 && !selectedTemplate)}
           className="px-14 py-5 bg-orange-600 text-white rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center gap-4 active:scale-95 disabled:opacity-50"
         >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Transmitindo...</>
            ) : step === 4 ? (
              'Finalizar Deploy Oracle'
            ) : (
              <><span className="hidden md:inline">Continuar</span> <ArrowRight size={18} /></>
            )}
         </button>
      </footer>
    </div>
  );
};

export default ChampionshipWizard;
