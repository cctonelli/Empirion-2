import React, { useState, useMemo } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria } from '../types';
import { updateEcosystem } from '../services/supabase';
import { calculateProjections } from '../services/simulation';

interface TutorArenaControlProps {
  championship: Championship;
  onUpdate: (config: Partial<Championship>) => void;
}

const TutorArenaControl: React.FC<TutorArenaControlProps> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'community' | 'simulator'>('macro');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    inflationRate: 0.04,
    demandMultiplier: 1.0,
    interestRate: 0.12,
    marketVolatility: 0.2
  });
  
  const [isPublic, setIsPublic] = useState(championship.is_public);
  const [communityWeight, setCommunityWeight] = useState(championship.config?.communityWeight || 0.3);
  const [criteria, setCriteria] = useState<CommunityCriteria[]>(championship.config?.votingCriteria || [
    { id: 'innovation', label: 'Innovation', weight: 0.25 },
    { id: 'sustainability', label: 'Sustainability', weight: 0.25 }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Missing functions found during audit
  const addCriteria = () => {
    const newId = `crit-${Math.random().toString(36).substr(2, 5)}`;
    setCriteria(prev => [...prev, { id: newId, label: 'Nova Métrica', weight: 0.1 }]);
  };

  const removeCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  // PREVIEW SIMULATION FOR TUTOR (Market Equilibrium Check)
  // Calculates how a standard mid-market team would perform under these macro settings
  const simulationPreview = useMemo(() => {
    const mockDecisions: any = {
      regions: { 
        1: { price: championship.config?.initialPrice || 340, marketing: 5 }, 
        2: { price: championship.config?.initialPrice || 340, marketing: 5 } 
      },
      production: { activityLevel: 100, extraProduction: 0, purchaseMPA: 20000, purchaseMPB: 10000 },
      hr: { salary: 1300, hired: 0, trainingPercent: 5 },
      finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 }, sellMachines: { alfa: 0, beta: 0, gama: 0 } }
    };
    return calculateProjections(mockDecisions, championship.branch, config);
  }, [config, championship.branch, championship.config?.initialPrice]);

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
      setMessage({ type: 'success', text: 'Economic DNA synchronized. Market volatility adjusted.' });
    } catch (error) {
      console.error("Deploy Error:", error);
      setMessage({ type: 'error', text: 'Tactical link failure. Try refreshing the control node.' });
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
           <p className="text-slate-500 font-medium tracking-tight">Orquestração de variáveis macro para "{championship.name}"</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
           {[
             { id: 'macro', label: 'Macro' },
             { id: 'community', label: 'Community' },
             { id: 'simulator', label: 'Market Lab' }
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
            <div className="flex items-center gap-3 mb-4">
               <Globe className="text-blue-600" size={24} />
               <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Drivers Econômicos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <MacroSlider label="Taxa de Inflação" value={config.inflationRate} step={0.01} max={0.2} 
                onChange={v => setConfig({...config, inflationRate: v})} 
                format={v => `${(v * 100).toFixed(1)}%`} icon={<TrendingUp size={16} className="text-rose-500" />} />
              
              <MacroSlider label="Multiplicador de Demanda" value={config.demandMultiplier} step={0.1} min={0.5} max={3} 
                onChange={v => setConfig({...config, demandMultiplier: v})} 
                format={v => `${v.toFixed(1)}x`} icon={<Activity size={16} className="text-emerald-500" />} />

              <MacroSlider label="Juros de Crédito" value={config.interestRate} step={0.01} max={0.5} 
                onChange={v => setConfig({...config, interestRate: v})} 
                format={v => `${(v * 100).toFixed(1)}%`} icon={<Percent size={16} className="text-amber-500" />} />
              
              <MacroSlider label="Volatilidade de Mercado" value={config.marketVolatility} step={0.05} max={1} 
                onChange={v => setConfig({...config, marketVolatility: v})} 
                format={v => `${(v * 100).toFixed(0)}%`} icon={<Zap size={16} className="text-indigo-500" />} />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-slate-200">
             <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                 <Shield className="text-blue-400" /> Policy Lock
               </h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">Mudanças nestas variáveis reescrevem as projeções de todas as empresas instantaneamente. Use o Lab para testar antes.</p>
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
             >
               {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
               Publicar Parâmetros
             </button>
          </div>
        </div>
      )}

      {activeTab === 'simulator' && (
        <div className="px-4 space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-1 space-y-6">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit">
                    <Calculator size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Previsão Pro-Forma</h3>
                 <p className="text-sm text-slate-500 font-medium">Calcula o desempenho de uma "Empresa Padrão" com os parâmetros macro atuais.</p>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                 <PreviewStat label="Receita Estimada" value={`$ ${simulationPreview.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                 <PreviewStat label="Custo Unitário" value={`$ ${simulationPreview.unitCost.toFixed(2)}`} />
                 <PreviewStat label="Margem Líquida" value={`${(simulationPreview.margin * 100).toFixed(1)}%`} />
                 <PreviewStat label="Ponto de Equilíbrio" value={`${simulationPreview.breakEven.toFixed(0)} un`} />
              </div>
           </div>
           
           <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 flex items-center gap-6">
              <Activity className="text-emerald-600" size={32} />
              <div>
                 <h4 className="text-emerald-900 font-black uppercase text-sm tracking-tight">Análise de Viabilidade</h4>
                 <p className="text-emerald-700 text-xs font-medium">Com as macros atuais, uma empresa padrão precisa de {(simulationPreview.breakEven / 10000 * 100).toFixed(1)}% de atividade operacional para evitar prejuízo.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="px-4 animate-in fade-in duration-500">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <Star className="text-amber-500" size={24} />
                    <h3 className="text-lg font-black uppercase text-slate-900">Configuração de Voto Público</h3>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black uppercase text-slate-400">Peso no Score Final</span>
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
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Métricas de Avaliação</h4>
                    <button onClick={addCriteria} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg"><Plus size={16} /></button>
                 </div>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {criteria.map(c => (
                      <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl group transition-all hover:bg-white hover:border-blue-200">
                         <input 
                           value={c.label} 
                           onChange={e => setCriteria(criteria.map(x => x.id === c.id ? {...x, label: e.target.value} : x))}
                           className="bg-transparent font-bold text-slate-700 text-sm flex-1 outline-none"
                         />
                         <button onClick={() => removeCriteria(c.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                         </button>
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

const PreviewStat = ({ label, value }: any) => (
  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 group hover:bg-white hover:border-blue-100 transition-all">
     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <p className="text-xl font-black text-slate-900 font-mono truncate">{value}</p>
  </div>
);

export default TutorArenaControl;
