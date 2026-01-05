import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator,
  Eye, EyeOff, Flame, Leaf, Loader2, Bot, Newspaper, Layers, Sparkles,
  Search, ExternalLink, Info, Gavel, Cpu, DollarSign, Package,
  ShoppingCart, Landmark, ShieldAlert, Boxes, BrainCircuit, Target,
  Bird, Play
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent } from '../types';
import { updateEcosystem } from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { DEFAULT_MACRO } from '../constants';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'suppliers' | 'difficulty'>('suppliers');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    scenarioType: 'simulated', modalityType: 'standard', inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0.2
  });
  const [macro, setMacro] = useState<MacroIndicators>(championship.market_indicators || DEFAULT_MACRO);
  const [isSaving, setIsSaving] = useState(false);
  const [isSummoning, setIsSummoning] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<BlackSwanEvent | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { 
      ecosystemConfig: config,
      market_indicators: {
        ...macro,
        active_event: pendingEvent || macro.active_event
      }
    };
    await updateEcosystem(championship.id, payload);
    onUpdate(payload);
    setIsSaving(false);
    setPendingEvent(null);
    alert("PARÂMETROS DE MERCADO SINCRONIZADOS: Os reajustes e eventos serão aplicados no próximo período.");
  };

  const summonBlackSwan = async () => {
    setIsSummoning(true);
    try {
      const event = await generateBlackSwanEvent(championship.branch);
      if (event) setPendingEvent(event);
    } catch (e) {
      alert("Falha no link neural com o Oráculo.");
    } finally {
      setIsSummoning(false);
    }
  };

  const currentPriceSensitivity = macro.difficulty?.price_sensitivity ?? 2.0;
  const currentMarketingEffectiveness = macro.difficulty?.marketing_effectiveness ?? 1.0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Orquestração de Mercado</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Parametrização de Reajustes e Taxas (Período 0{championship.current_round + 1})</p>
         </div>
         <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Tabela Fornecedores" icon={<Package size={14}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Indicadores Macro" icon={<TrendingUp size={14}/>} />
            <TabBtn active={activeTab === 'difficulty'} onClick={() => setActiveTab('difficulty')} label="Sensibilidade" icon={<BrainCircuit size={14}/>} />
         </div>
      </div>

      {activeTab === 'difficulty' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg"><BrainCircuit size={24}/></div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Saltiness Controls</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajuste a agressividade do mercado e sensibilidade dos consumidores.</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Target size={16} /> Sensibilidade de Preço</label>
                       <span className="text-xl font-black text-slate-900">{currentPriceSensitivity.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5.0" step="0.1" 
                      value={currentPriceSensitivity} 
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setMacro(prev => ({
                          ...prev, 
                          difficulty: { 
                            ...prev.difficulty,
                            price_sensitivity: val,
                            marketing_effectiveness: currentMarketingEffectiveness 
                          }
                        }));
                      }} 
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" 
                    />
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Zap size={16} /> Eficácia de Marketing</label>
                       <span className="text-xl font-black text-slate-900">{currentMarketingEffectiveness.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="3.0" step="0.1" 
                      value={currentMarketingEffectiveness} 
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setMacro(prev => ({
                          ...prev, 
                          difficulty: { 
                            ...prev.difficulty,
                            marketing_effectiveness: val,
                            price_sensitivity: currentPriceSensitivity 
                          }
                        }));
                      }} 
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" 
                    />
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl space-y-10 relative overflow-hidden group border border-white/5">
              <Bird className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000" size={240} />
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Flame className="text-rose-500 animate-pulse" size={24} />
                    <h3 className="text-xl font-black uppercase italic leading-none">Black Swan Engine</h3>
                 </div>
                 <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase">Projete crises disruptivas via Gemini 3 para testar a resiliência das equipes.</p>
              </div>

              {!pendingEvent ? (
                <button 
                  onClick={summonBlackSwan}
                  disabled={isSummoning}
                  className="w-full py-6 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-rose-600 transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-4"
                >
                  {isSummoning ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> Invocar Cisne Negro</>}
                </button>
              ) : (
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
                   <div className="flex justify-between items-center">
                      <span className="text-rose-500 font-black text-[9px] uppercase tracking-widest">Evento Gerado</span>
                      <button onClick={() => setPendingEvent(null)} className="text-slate-500 hover:text-white"><Trash2 size={14}/></button>
                   </div>
                   <h4 className="text-lg font-black italic text-white leading-tight">{pendingEvent.title}</h4>
                   <p className="text-[9px] text-slate-400 leading-relaxed italic line-clamp-2">{pendingEvent.description}</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Boxes className="text-orange-500" /> Matérias-Primas e Logística</h3>
              <div className="space-y-8">
                 <MacroInput label="Preço Unitário MP-A ($)" val={macro.providerPrices.mpA} onChange={v => setMacro(prev => ({...prev, providerPrices: {...prev.providerPrices, mpA: v}}))} />
                 <MacroInput label="Preço Unitário MP-B ($)" val={macro.providerPrices.mpB} onChange={v => setMacro(prev => ({...prev, providerPrices: {...prev.providerPrices, mpB: v}}))} />
                 <MacroInput label="Custo Distribuição/Unidade ($)" val={macro.distributionCostUnit} onChange={v => setMacro(prev => ({...prev, distributionCostUnit: v}))} />
              </div>
           </div>
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Cpu className="text-blue-500" /> Ativos de Capital (Máquinas)</h3>
              <div className="space-y-8">
                 <MacroInput label="Máquina ALFA ($)" val={macro.machineryValues.alfa} onChange={v => setMacro(prev => ({...prev, machineryValues: {...prev.machineryValues, alfa: v}}))} />
                 <MacroInput label="Máquina BETA ($)" val={macro.machineryValues.beta} onChange={v => setMacro(prev => ({...prev, machineryValues: {...prev.machineryValues, beta: v}}))} />
                 <MacroInput label="Máquina GAMA ($)" val={macro.machineryValues.gama} onChange={v => setMacro(prev => ({...prev, machineryValues: {...prev.machineryValues, gama: v}}))} />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-900">
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><TrendingUp size={16} /> Taxa de Inflação Acumulada</label>
                    <span className="text-xl font-black text-slate-900">{(config.inflationRate * 100).toFixed(1)}%</span>
                 </div>
                 <input type="range" min="0" max="0.2" step="0.01" value={config.inflationRate} onChange={e => setConfig(prev => ({...prev, inflationRate: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Activity size={16} /> Volatilidade de Demanda</label>
                    <span className="text-xl font-black text-slate-900">{config.demandMultiplier.toFixed(1)}x</span>
                 </div>
                 <input type="range" min="0.5" max="2" step="0.1" value={config.demandMultiplier} onChange={e => setConfig(prev => ({...prev, demandMultiplier: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-end pt-10">
         <button onClick={handleSave} disabled={isSaving} className="px-20 py-8 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl flex items-center gap-6 active:scale-95 group">
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="group-hover:scale-110 transition-transform" /> Selar Parâmetros Período 0{championship.current_round + 1}</>}
         </button>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${active ? 'bg-orange-600 text-white shadow-md border border-orange-500' : 'text-slate-500 bg-slate-50 hover:bg-slate-200'}`}>{icon} {label}</button>
);

const MacroInput = ({ label, val, onChange, disabled }: any) => (
  <div className="space-y-3">
     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
     <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</div>
        <input 
           type="number" 
           value={val} 
           disabled={disabled}
           onChange={e => onChange(Number(e.target.value))} 
           className={`w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-4 font-mono font-bold text-slate-900 text-lg outline-none focus:border-orange-500 transition-all ${disabled ? 'opacity-50 grayscale' : ''}`} 
        />
     </div>
  </div>
);

export default TutorArenaControl;
