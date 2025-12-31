import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  Globe, 
  Shield, 
  ShieldOff, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Users, 
  Lock, 
  Unlock,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Star,
  Plus,
  Trash2
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria } from '../types';
import { updateEcosystem } from '../services/supabase';

interface TutorArenaControlProps {
  championship: Championship;
  onUpdate: (config: Partial<Championship>) => void;
}

const TutorArenaControl: React.FC<TutorArenaControlProps> = ({ championship, onUpdate }) => {
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
      setMessage({ type: 'success', text: 'Ecosystem parameters synchronized successfully.' });
    } catch (error) {
      console.error("Deploy Error:", error);
      setMessage({ type: 'error', text: 'Failed to deploy ecosystem changes.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addCriteria = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setCriteria(prev => [...prev, { id, label: 'New Metric', weight: 0.1 }]);
  };

  const removeCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
             <SlidersHorizontal className="text-blue-600" /> Arena Command
           </h2>
           <p className="text-slate-500 font-medium">Global macro-variable orchestration for "{championship.name}"</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
             Deploy Changes
           </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
           {/* Access & Visibility */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-slate-900 text-white rounded-2xl">
                    <Shield size={20} />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Access Protocol</h3>
              </div>

              <div 
                onClick={() => setIsPublic(!isPublic)}
                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  isPublic ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50'
                }`}
              >
                 <div className="flex items-center gap-4">
                    {isPublic ? <Unlock className="text-blue-600" /> : <Lock className="text-slate-400" />}
                    <div>
                       <span className="block font-black text-xs uppercase tracking-widest text-slate-900">Public Arena</span>
                       <span className="text-[10px] text-slate-500 font-bold">Open for Community Voting</span>
                    </div>
                 </div>
                 <div className={`w-12 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'right-1' : 'left-1'}`}></div>
                 </div>
              </div>
           </div>

           {/* Community Score Configuration */}
           <div className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8 transition-opacity ${!isPublic && 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-amber-500 text-white rounded-2xl">
                    <Star size={20} />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Community Impact</h3>
              </div>

              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400">Score Weight</span>
                       <span className="text-sm font-black text-slate-900">{Math.round(communityWeight * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.5" step="0.05"
                      value={communityWeight}
                      onChange={e => setCommunityWeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-slate-400">Evaluation Metrics</span>
                       <button onClick={addCriteria} className="p-1.5 bg-slate-100 rounded-lg text-slate-900 hover:bg-blue-600 hover:text-white transition-all"><Plus size={14}/></button>
                    </div>
                    <div className="space-y-3">
                       {criteria.map(c => (
                         <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <input 
                              type="text" value={c.label} 
                              onChange={e => setCriteria(criteria.map(x => x.id === c.id ? {...x, label: e.target.value} : x))}
                              className="bg-transparent font-bold text-xs flex-1 outline-none"
                            />
                            <button onClick={() => removeCriteria(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Macro Sliders */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-600 text-white rounded-2xl">
                    <Globe size={20} />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Economic Ecosystem</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                       <TrendingUp size={14} className="text-rose-500" /> Inflation Rate
                    </label>
                    <span className="text-sm font-black text-slate-900">{(config.inflationRate * 100).toFixed(1)}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="0.30" step="0.001"
                   value={config.inflationRate}
                   onChange={e => setConfig({...config, inflationRate: parseFloat(e.target.value)})}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                 />
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                       <Users size={14} className="text-emerald-500" /> Market Demand
                    </label>
                    <span className="text-sm font-black text-slate-900">{config.demandMultiplier.toFixed(2)}x</span>
                 </div>
                 <input 
                   type="range" min="0.5" max="2.0" step="0.05"
                   value={config.demandMultiplier}
                   onChange={e => setConfig({...config, demandMultiplier: parseFloat(e.target.value)})}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                 />
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                       <Percent size={14} className="text-amber-500" /> Interest & Credit
                    </label>
                    <span className="text-sm font-black text-slate-900">{(config.interestRate * 100).toFixed(1)}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="0.50" step="0.005"
                   value={config.interestRate}
                   onChange={e => setConfig({...config, interestRate: parseFloat(e.target.value)})}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                 />
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                       <Zap size={14} className="text-indigo-500" /> Market Volatility
                    </label>
                    <span className="text-sm font-black text-slate-900">{(config.marketVolatility * 100).toFixed(0)}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="1.0" step="0.1"
                   value={config.marketVolatility}
                   onChange={e => setConfig({...config, marketVolatility: parseFloat(e.target.value)})}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
              </div>
           </div>

           <div className="mt-12 pt-10 border-t border-slate-50 flex items-center gap-4 text-amber-600 bg-amber-50 p-6 rounded-3xl border border-amber-100">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold leading-relaxed">Changes to the ecosystem affect the projections for all teams instantly.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TutorArenaControl;
