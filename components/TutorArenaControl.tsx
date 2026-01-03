
import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Percent, Users, Lock, Unlock, 
  Save, RefreshCw, AlertCircle, CheckCircle2, SlidersHorizontal, 
  Star, Plus, Trash2, LayoutGrid, Activity, Calculator,
  Eye, EyeOff, Flame, Leaf, Loader2, Bot, Newspaper, Layers, Sparkles,
  Search, ExternalLink, Info, Gavel, Cpu, DollarSign, Package,
  ShoppingCart, Landmark, ShieldAlert, Boxes
} from 'lucide-react';
import { EcosystemConfig, Championship, CommunityCriteria, BlackSwanEvent, ScenarioType, ModalityType, MacroIndicators } from '../types';
import { updateEcosystem } from '../services/supabase';
import { DEFAULT_MACRO } from '../constants';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'modality' | 'suppliers' | 'taxes'>('suppliers');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    scenarioType: 'simulated', modalityType: 'standard', inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0.2
  });
  const [macro, setMacro] = useState<MacroIndicators>(championship.market_indicators || DEFAULT_MACRO);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { 
      ecosystemConfig: config,
      market_indicators: macro
    };
    await updateEcosystem(championship.id, payload);
    onUpdate(payload);
    setIsSaving(false);
    alert("PARÂMETROS DE MERCADO SINCRONIZADOS: Os reajustes serão aplicados no processamento do próximo período.");
  };

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
            <TabBtn active={activeTab === 'taxes'} onClick={() => setActiveTab('taxes')} label="Taxas & Regras" icon={<Gavel size={14}/>} />
            <TabBtn active={activeTab === 'modality'} onClick={() => setActiveTab('modality')} label="Cenário" icon={<Layers size={14}/>} />
         </div>
      </div>

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Boxes className="text-orange-500" /> Matérias-Primas e Logística</h3>
              <div className="space-y-8">
                 <MacroInput label="Preço Unitário MP-A ($)" val={macro.providerPrices.mpA} onChange={v => setMacro({...macro, providerPrices: {...macro.providerPrices, mpA: v}})} />
                 <MacroInput label="Preço Unitário MP-B ($)" val={macro.providerPrices.mpB} onChange={v => setMacro({...macro, providerPrices: {...macro.providerPrices, mpB: v}})} />
                 <MacroInput label="Custo Distribuição/Unidade ($)" val={macro.distributionCostUnit} onChange={v => setMacro({...macro, distributionCostUnit: v})} />
              </div>
           </div>
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Cpu className="text-blue-500" /> Ativos de Capital (Máquinas)</h3>
              <div className="space-y-8">
                 <MacroInput label="Máquina ALFA ($)" val={macro.machineryValues.alfa} onChange={v => setMacro({...macro, machineryValues: {...macro.machineryValues, alfa: v}})} />
                 <MacroInput label="Máquina BETA ($)" val={macro.machineryValues.beta} onChange={v => setMacro({...macro, machineryValues: {...macro.machineryValues, beta: v}})} />
                 <MacroInput label="Máquina GAMA ($)" val={macro.machineryValues.gama} onChange={v => setMacro({...macro, machineryValues: {...macro.machineryValues, gama: v}})} />
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                 <Info size={20} className="text-blue-600" />
                 <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">Nota: Reajustes em máquinas afetam apenas novas aquisições.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
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
              <MacroInput label="Crescimento Econômico (%)" val={macro.growthRate} onChange={v => setMacro({...macro, growthRate: v})} />
              <MacroInput label="Taxa TR Mensal (%)" val={macro.interestRateTR} onChange={v => setMacro({...macro, interestRateTR: v})} />
           </div>
        </div>
      )}

      {activeTab === 'taxes' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <MacroInput label="Imposto de Renda (%)" val={15} onChange={() => {}} disabled />
              <MacroInput label="Juros Fornecedor (%)" val={macro.providerInterest} onChange={v => setMacro({...macro, providerInterest: v})} />
              <MacroInput label="Juros Venda a Prazo (%)" val={macro.salesAvgInterest} onChange={v => setMacro({...macro, salesAvgInterest: v})} />
              <MacroInput label="Salário Médio Setor ($)" val={macro.sectorAvgSalary} onChange={v => setMacro({...macro, sectorAvgSalary: v})} />
              <MacroInput label="Cotação Bolsa (EMPR8)" val={macro.stockMarketPrice} onChange={v => setMacro({...macro, stockMarketPrice: v})} />
              <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-200 flex flex-col justify-center gap-3">
                 <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Regras de Transmissão</h4>
                 <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase">Processamento Irrevogável: A Rodada 2 bloqueia a compra de novas máquinas ALFA por 1 ciclo.</p>
              </div>
           </div>
        </div>
      )}

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

      <div className="flex justify-end pt-10">
         <button onClick={handleSave} disabled={isSaving} className="px-20 py-8 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl flex items-center gap-6 active:scale-95 group">
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="group-hover:scale-110 transition-transform" /> Selar Parâmetros Período 0{championship.current_round + 1}</>}
         </button>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${active ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{icon} {label}</button>
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

const ModalityCard = ({ active, onClick, icon, title, desc }: any) => (
  <button onClick={onClick} className={`p-10 rounded-[3.5rem] border-2 text-left transition-all group ${active ? 'border-orange-600 bg-orange-50/50 shadow-2xl' : 'border-slate-100 bg-white opacity-60 grayscale'}`}>
     <div className={`p-4 rounded-[1.5rem] w-fit mb-6 transition-all ${active ? 'bg-orange-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>{icon}</div>
     <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3 italic">{title}</h4>
     <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
     {active && <div className="mt-6 flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={14} /> Modalidade Ativa</div>}
  </button>
);

export default TutorArenaControl;
