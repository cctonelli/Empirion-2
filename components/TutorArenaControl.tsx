
import React, { useState, useMemo } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator,
  Eye, EyeOff, Flame, Leaf, Loader2
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria, BlackSwanEvent } from '../types';
import { updateEcosystem } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { generateBlackSwanEvent } from '../services/gemini';

interface TutorArenaControlProps {
  championship: Championship;
  onUpdate: (config: Partial<Championship>) => void;
}

const TutorArenaControl: React.FC<TutorArenaControlProps> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'community' | 'events'>('macro');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    inflationRate: 0.04,
    demandMultiplier: 1.0,
    interestRate: 0.12,
    marketVolatility: 0.2,
    esgPriority: 0.5,
    activeEvent: null
  });
  
  const [isPublic, setIsPublic] = useState(championship.is_public);
  const [communityWeight, setCommunityWeight] = useState(championship.config?.communityWeight || 0.3);
  const [criteria, setCriteria] = useState<CommunityCriteria[]>(championship.config?.votingCriteria || [
    { id: 'innovation', label: 'Innovation', weight: 0.25 },
    { id: 'sustainability', label: 'Sustainability', weight: 0.25 }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleTriggerBlackSwan = async () => {
    setIsGeneratingEvent(true);
    try {
      const event = await generateBlackSwanEvent(championship.branch);
      if (event) {
        setConfig(prev => ({ ...prev, activeEvent: event }));
        setMessage({ type: 'success', text: `Evento Gerado: ${event.title}` });
      } else {
        throw new Error("Falha na geração");
      }
    } catch (e) {
      setMessage({ type: 'error', text: "Erro ao gerar evento via IA." });
    } finally {
      setIsGeneratingEvent(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = { 
        ecosystemConfig: config, 
        is_public: isPublic,
        config: {
          ...championship.config,
          communityWeight,
          votingCriteria: criteria
        }
      };
      
      await updateEcosystem(championship.id, updates);
      onUpdate(updates);
      setMessage({ type: 'success', text: 'Economic DNA synchronized. Parameters deployed.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Tactical link failure. Try refreshing.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
             <SlidersHorizontal className="text-blue-600" /> Arena Command
           </h2>
           <p className="text-slate-500 font-medium tracking-tight">Orquestração de v5.0 para "{championship.name}"</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
           {[
             { id: 'macro', label: 'Macro & ESG' },
             { id: 'community', label: 'Comunidade' },
             { id: 'events', label: 'Eventos IA' }
           ].map((t) => (
             <button 
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}
             >
               {t.label}
             </button>
           ))}
        </div>
      </div>

      {message && (
        <div className={`mx-4 p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold uppercase tracking-tight">{message.text}</span>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <MacroSlider label="Taxa de Inflação" value={config.inflationRate} step={0.01} max={0.2} 
                onChange={v => setConfig({...config, inflationRate: v})} 
                format={v => `${(v * 100).toFixed(1)}%`} icon={<TrendingUp size={16} className="text-rose-500" />} />
              
              <MacroSlider label="Multiplicador de Demanda" value={config.demandMultiplier} step={0.1} min={0.5} max={3} 
                onChange={v => setConfig({...config, demandMultiplier: v})} 
                format={v => `${v.toFixed(1)}x`} icon={<Activity size={16} className="text-emerald-500" />} />

              <MacroSlider label="Foco ESG / Sustentável" value={config.esgPriority || 0.5} step={0.1} max={1} 
                onChange={v => setConfig({...config, esgPriority: v})} 
                format={v => v > 0.7 ? 'Alta Prioridade' : v > 0.3 ? 'Equilibrado' : 'Foco em Custo'} icon={<Leaf size={16} className="text-emerald-500" />} />
              
              <MacroSlider label="Volatilidade de Mercado" value={config.marketVolatility} step={0.05} max={1} 
                onChange={v => setConfig({...config, marketVolatility: v})} 
                format={v => `${(v * 100).toFixed(0)}%`} icon={<Zap size={16} className="text-indigo-500" />} />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl">
             <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                 <Shield className="text-blue-400" /> Deployment Mode
               </h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">As variáveis de ESG impactam o market share relativo: empresas que investem em treinamento e salários ganham bônus de demanda em ambientes de alta prioridade ESG.</p>
               <button 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full justify-center ${isPublic ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                >
                  {isPublic ? <><Eye size={14} /> Arena Pública</> : <><EyeOff size={14} /> Arena Privada</>}
                </button>
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 mt-8 shadow-xl"
             >
               {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
               Salvar Parâmetros v5.0
             </button>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="px-4 space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl">
                       <Flame size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Black Swan Engine</h3>
                       <p className="text-slate-500 font-medium">Use a IA para gerar um evento aleatório que alterará os rumos da rodada.</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleTriggerBlackSwan}
                   disabled={isGeneratingEvent}
                   className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
                 >
                   {isGeneratingEvent ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                   Gerar Evento via Gemini
                 </button>
              </div>

              {config.activeEvent && (
                <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white space-y-8 animate-in zoom-in-95">
                   <div className="flex items-center justify-between border-b border-white/10 pb-6">
                      <h4 className="text-2xl font-black uppercase tracking-tight">{config.activeEvent.title}</h4>
                      <button onClick={() => setConfig({...config, activeEvent: null})} className="text-rose-400 hover:text-rose-300 font-black text-[10px] uppercase tracking-widest">Remover Evento</button>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Narrativa do Evento</span>
                         <p className="text-slate-100 font-medium leading-relaxed">{config.activeEvent.description}</p>
                         <p className="text-rose-400 text-xs font-black uppercase tracking-widest italic">{config.activeEvent.impact}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <EventMod label="Inflação" val={config.activeEvent.modifiers.inflation} />
                         <EventMod label="Demanda" val={config.activeEvent.modifiers.demand} />
                         <EventMod label="Juros" val={config.activeEvent.modifiers.interest} />
                         <EventMod label="Produtiv." val={config.activeEvent.modifiers.productivity} />
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="px-4 animate-in fade-in duration-500">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <Star className="text-amber-500" size={24} />
                    <h3 className="text-lg font-black uppercase text-slate-900">Voto Público</h3>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black uppercase text-slate-400">Peso no Score</span>
                       <span className="text-xl font-black text-slate-900">{Math.round(communityWeight * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.5" step="0.05"
                      value={communityWeight}
                      onChange={e => setCommunityWeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Métricas Ativas</h4>
                    <button className="p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all"><Plus size={16} /></button>
                 </div>
                 <div className="space-y-3">
                    {criteria.map(c => (
                      <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl group transition-all">
                         <span className="font-bold text-slate-700 text-sm flex-1">{c.label}</span>
                         <span className="text-xs font-black text-blue-600">{(c.weight * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const EventMod = ({ label, val }: { label: string, val: number }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
     <span className="text-[9px] font-black uppercase text-slate-500 mb-1">{label}</span>
     <span className={`text-lg font-black font-mono ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {val >= 0 ? '+' : ''}{(val * 100).toFixed(0)}%
     </span>
  </div>
);

const MacroSlider = ({ label, value, min = 0, max, step, onChange, format, icon }: any) => (
  <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
    <div className="flex justify-between items-center">
       <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
         {icon} {label}
       </label>
       <span className="text-lg font-black text-slate-900">{format(value)}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

export default TutorArenaControl;
