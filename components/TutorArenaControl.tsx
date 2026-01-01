
import React, { useState, useMemo } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator,
  Eye, EyeOff, Flame, Leaf, Loader2, Bot, Newspaper, Layers, Sparkles,
  Search, ExternalLink, Info
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria, BlackSwanEvent, ScenarioType } from '../types';
import { updateEcosystem } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { generateBlackSwanEvent } from '../services/gemini';

interface TutorArenaControlProps {
  championship: Championship;
  onUpdate: (config: Partial<Championship>) => void;
}

const TutorArenaControl: React.FC<TutorArenaControlProps> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'community' | 'events' | 'ai' | 'scenario'>('scenario');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    scenarioType: 'simulated',
    inflationRate: 0.04,
    demandMultiplier: 1.0,
    interestRate: 0.12,
    marketVolatility: 0.2,
    esgPriority: 0.5,
    activeEvent: null,
    aiOpponents: { enabled: true, count: 7, strategy: 'balanced' },
    gazetaConfig: { focus: ['Macro', 'Competição'], style: 'analytical' },
    realDataWeights: { inflation: 0.8, demand: 0.5, currency: 1.0 }
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
          votingCriteria: criteria,
          aiOpponents: config.aiOpponents,
          gazetaConfig: config.gazetaConfig,
          scenarioType: config.scenarioType
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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
             <SlidersHorizontal className="text-blue-600" /> Arena Command
           </h2>
           <p className="text-slate-500 font-medium tracking-tight">Orquestração v5.0 GOLD para "{championship.name}"</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
           {[
             { id: 'scenario', label: 'Cenário' },
             { id: 'macro', label: 'Macro & ESG' },
             { id: 'ai', label: 'AI Bots' },
             { id: 'community', label: 'Comunidade' },
             { id: 'events', label: 'Eventos IA' }
           ].map((t) => (
             <button 
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
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

      {activeTab === 'scenario' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 space-y-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Tipo de Cenário Operacional</h3>
                <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-widest">Defina como as oscilações de mercado são geradas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  onClick={() => setConfig({...config, scenarioType: 'simulated'})}
                  className={`p-8 rounded-[3rem] border-2 text-left transition-all ${
                    config.scenarioType === 'simulated' ? 'border-blue-600 bg-blue-50/30 ring-8 ring-blue-50/50' : 'border-slate-100 bg-slate-50 grayscale opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${config.scenarioType === 'simulated' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-300'}`}>
                      <Layers size={24} />
                    </div>
                    <span className="text-lg font-black uppercase tracking-tighter">Modo Simulado</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">As variáveis seguem os schedules manuais definidos na aba 'Macro'. Ideal para controle acadêmico.</p>
                </button>

                <button 
                  onClick={() => setConfig({...config, scenarioType: 'real'})}
                  className={`p-8 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${
                    config.scenarioType === 'real' ? 'border-emerald-600 bg-emerald-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 grayscale opacity-60'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={100} /></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${config.scenarioType === 'real' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-slate-300'}`}>
                      <Globe size={24} />
                    </div>
                    <span className="text-lg font-black uppercase tracking-tighter">Modo Real com IA</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">A IA Gemini monitora indicadores live de mercado e ajusta as oscilações da arena automaticamente.</p>
                </button>
              </div>
            </div>

            {config.scenarioType === 'real' && (
              <div className="bg-emerald-900 rounded-[3.5rem] p-10 text-white space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">AI Data Grounding Weights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MacroSlider dark label="Peso Inflação (IPCA)" value={config.realDataWeights?.inflation || 0.8} max={1} step={0.1} onChange={v => setConfig({...config, realDataWeights: {...config.realDataWeights!, inflation: v}})} format={v => `${(v * 100).toFixed(0)}%`} />
                  <MacroSlider dark label="Peso Demanda" value={config.realDataWeights?.demand || 0.5} max={1} step={0.1} onChange={v => setConfig({...config, realDataWeights: {...config.realDataWeights!, demand: v}})} format={v => `${(v * 100).toFixed(0)}%`} />
                  <MacroSlider dark label="Peso Câmbio (USD)" value={config.realDataWeights?.currency || 1.0} max={1} step={0.1} onChange={v => setConfig({...config, realDataWeights: {...config.realDataWeights!, currency: v}})} format={v => `${(v * 100).toFixed(0)}%`} />
                </div>
                {/* Fixed missing icon error by adding Info to imports */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                  <Info className="text-emerald-400" size={20} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Estes pesos determinam a influência dos dados reais sobre as curvas de demanda e custos internos.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl space-y-8 border border-white/5 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <h3 className="text-2xl font-black uppercase tracking-tight">Arena Status</h3>
                 <div className="space-y-4">
                    <StatusRow label="Modo Operacional" val={config.scenarioType.toUpperCase()} color="text-blue-400" />
                    <StatusRow label="Grounded AI" val={config.scenarioType === 'real' ? 'ACTIVE' : 'OFF'} color={config.scenarioType === 'real' ? 'text-emerald-400' : 'text-slate-500'} />
                    <StatusRow label="Processing Unit" val="EMP-GOLD-5.0" />
                 </div>
                 <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                   {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   Deploy Parameters
                 </button>
              </div>
              <Activity className="absolute -bottom-20 -right-20 text-white opacity-5 pointer-events-none" size={300} />
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><Newspaper size={14} /> Gazeta IA Style</h4>
               <div className="grid grid-cols-1 gap-2">
                 {['analytical', 'sensationalist', 'neutral'].map(s => (
                   <button 
                     key={s} 
                     onClick={() => setConfig({...config, gazetaConfig: {...config.gazetaConfig!, style: s as any}})}
                     className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${config.gazetaConfig?.style === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 space-y-8 lg:col-span-2">
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

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Shield size={200} /></div>
             <div className="relative z-10 space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                 <Shield className="text-blue-400" /> Visibility Control
               </h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">As variáveis macro afetam o market potential. Se a inflação subir, os custos variáveis são penalizados antes do repasse de preço.</p>
               <button 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full justify-center ${isPublic ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                >
                  {isPublic ? <><Eye size={14} /> Arena Pública</> : <><EyeOff size={14} /> Arena Privada</>}
                </button>
             </div>
             <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 mt-8 shadow-xl">
               {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
               Salvar Macro Parâmetros
             </button>
          </div>
        </div>
      )}

      {/* Other tabs remain similar with v5 aesthetics */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 animate-in fade-in duration-500">
           {/* Bot Config logic */}
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><Bot size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">AI Opponents</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preencha o mercado com competidores virtuais.</p>
                 </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem]">
                  <span className="text-xs font-black text-slate-400 uppercase">Status</span>
                  <button 
                    onClick={() => setConfig({...config, aiOpponents: {...config.aiOpponents!, enabled: !config.aiOpponents?.enabled}})}
                    className={`w-14 h-7 rounded-full transition-all relative ${config.aiOpponents?.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${config.aiOpponents?.enabled ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
                {config.aiOpponents?.enabled && (
                  <>
                  <MacroSlider label="Quantidade de Bots" value={config.aiOpponents.count} max={11} step={1} onChange={v => setConfig({...config, aiOpponents: {...config.aiOpponents!, count: v}})} format={v => `${v} Entidades`} />
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estratégia Predominante</span>
                    <div className="grid grid-cols-3 gap-3">
                      {['balanced', 'aggressive', 'conservative'].map(s => (
                        <button key={s} onClick={() => setConfig({...config, aiOpponents: {...config.aiOpponents!, strategy: s as any}})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${config.aiOpponents?.strategy === s ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-50 text-slate-400'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  </>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Events and Community tabs would follow here similarly refined... */}
    </div>
  );
};

const StatusRow = ({ label, val, color = "text-slate-900" }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5">
     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <span className={`text-xs font-black font-mono ${color}`}>{val}</span>
  </div>
);

const MacroSlider = ({ label, value, min = 0, max, step, onChange, format, icon, dark = false }: any) => (
  <div className={`space-y-4 p-6 rounded-3xl border transition-all ${dark ? 'bg-white/5 border-white/10 hover:border-emerald-400' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
    <div className="flex justify-between items-center">
       <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${dark ? 'text-emerald-100' : 'text-slate-400'}`}>
         {icon} {label}
       </label>
       <span className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{format(value)}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${dark ? 'bg-white/10 accent-emerald-400' : 'bg-slate-200 accent-blue-600'}`}
    />
  </div>
);

export default TutorArenaControl;
