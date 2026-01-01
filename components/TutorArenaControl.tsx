
import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator,
  Eye, EyeOff, Flame, Leaf, Loader2, Bot, Newspaper, Layers, Sparkles,
  Search, ExternalLink, Info, Gavel, Cpu
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria, BlackSwanEvent, ScenarioType, ModalityType } from '../types';
import { updateEcosystem } from '../services/supabase';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'modality' | 'events'>('modality');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    scenarioType: 'simulated', modalityType: 'standard', inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0.2
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateEcosystem(championship.id, { ecosystemConfig: config });
    onUpdate({ ecosystemConfig: config });
    setIsSaving(false);
    alert("Parâmetros Globais Sincronizados.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Arena Orchestration</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configuração de Regras de Negócio e Produção</p>
         </div>
         <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            {['macro', 'modality', 'events'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400'}`}>
                {t}
              </button>
            ))}
         </div>
      </div>

      {activeTab === 'modality' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <ModalityCard 
              active={config.modalityType === 'standard'} 
              onClick={() => setConfig({...config, modalityType: 'standard'})}
              icon={<Layers size={32} />}
              title="Arena Padrão"
              desc="Equilíbrio entre produção e comercial sem variáveis extremas."
           />
           <ModalityCard 
              active={config.modalityType === 'business_round'} 
              onClick={() => setConfig({...config, modalityType: 'business_round'})}
              icon={<Gavel size={32} />}
              title="Rodada de Negócios"
              desc="Foco em Guerra de Preços, Elasticidade-Demanda Alta e Inflação Composta."
           />
           <ModalityCard 
              active={config.modalityType === 'factory_efficiency'} 
              onClick={() => setConfig({...config, modalityType: 'factory_efficiency'})}
              icon={<Cpu size={32} />}
              title="Eficiência de Fábrica"
              desc="Foco em OEE, Lead Time, JIT/MRP e Níveis de Automação Industrial."
           />
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><TrendingUp size={16} /> Taxa de Inflação Acumulada</label>
                    <span className="text-xl font-black text-slate-900">{(config.inflationRate * 100).toFixed(1)}%</span>
                 </div>
                 <input type="range" min="0" max="0.2" step="0.01" value={config.inflationRate} onChange={e => setConfig({...config, inflationRate: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Activity size={16} /> Volatilidade de Demanda</label>
                    <span className="text-xl font-black text-slate-900">{config.demandMultiplier.toFixed(1)}x</span>
                 </div>
                 <input type="range" min="0.5" max="2" step="0.1" value={config.demandMultiplier} onChange={e => setConfig({...config, demandMultiplier: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-end pt-10">
         <button onClick={handleSave} disabled={isSaving} className="px-16 py-6 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-4">
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Aplicar Parâmetros à Arena</>}
         </button>
      </div>
    </div>
  );
};

const ModalityCard = ({ active, onClick, icon, title, desc }: any) => (
  <button onClick={onClick} className={`p-10 rounded-[3.5rem] border-2 text-left transition-all group ${active ? 'border-blue-600 bg-blue-50/50 shadow-2xl' : 'border-slate-100 bg-white opacity-60 grayscale'}`}>
     <div className={`p-4 rounded-[1.5rem] w-fit mb-6 transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
     <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3 italic">{title}</h4>
     <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
     {active && <div className="mt-6 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={14} /> Modalidade Ativa</div>}
  </button>
);

export default TutorArenaControl;
