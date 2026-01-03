
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, DEFAULT_MACRO } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    const currentCount = teams.length;
    if (currentCount < formData.teamsLimit) {
      const more = Array.from({ length: formData.teamsLimit - currentCount }).map((_, i) => ({
        name: `Time ${String.fromCharCode(65 + currentCount + i)}` 
      }));
      setTeams([...teams, ...more]);
    }
  }, [formData.teamsLimit]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const champPayload: Partial<Championship> = {
        name: formData.name,
        branch: formData.branch,
        status: 'active',
        is_public: true,
        current_round: 0,
        // Fix: Access correct property name from formData state (totalRounds)
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
        }
      };
      
      await createChampionshipWithTeams(champPayload, teams, isTrial);
      onComplete();
    } catch (e) { 
      alert("Erro ao orquestrar arena. Verifique se as tabelas trial_* existem no Supabase."); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-black text-white uppercase italic">Orquestrador de Arena {isTrial && '(Sandbox Mode)'}</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Protocolo de {isTrial ? 'Teste Grátis' : 'Deploy Oficial'}</p>
      </header>

      <div className="min-h-[300px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-orange-500">Nome da Simulação</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-orange-500">Ramo</label>
                   <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value as any})} className="w-full p-4 bg-slate-800 border border-white/10 rounded-xl text-white outline-none">
                      <option value="industrial">Industrial</option>
                      <option value="commercial">Comercial</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-orange-500">Total Rodadas</label>
                   <input type="number" value={formData.totalRounds} onChange={e => setFormData({...formData, totalRounds: Number(e.target.value)})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
             <h3 className="text-white font-bold uppercase text-sm">Configuração das Equipes ({formData.teamsLimit})</h3>
             <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {teams.map((t, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                     <UserPlus size={14} className="text-orange-500" />
                     <input 
                       value={t.name}
                       onChange={e => { const nt = [...teams]; nt[i].name = e.target.value; setTeams(nt); }}
                       className="bg-transparent border-none outline-none text-xs font-bold text-white w-full"
                     />
                  </div>
                ))}
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-6 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <ShieldCheck size={40} />
             </div>
             <h3 className="text-2xl font-black text-white uppercase italic">Protocolo Validado</h3>
             <p className="text-slate-400 text-sm italic">A arena será transmitida ao Nodo {isTrial ? 'Sandbox' : 'Oracle Network'}.</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-3 text-slate-500 font-bold uppercase text-[10px] hover:text-white disabled:opacity-0 flex items-center gap-2">
           <ArrowLeft size={14} /> Voltar
        </button>
        <button 
          onClick={step === 3 ? handleLaunch : () => setStep(s => s + 1)}
          disabled={isSubmitting}
          className="px-10 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3"
        >
           {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : step === 3 ? 'Finalizar Deploy' : 'Continuar'}
           {step < 3 && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
};

export default ChampionshipWizard;
