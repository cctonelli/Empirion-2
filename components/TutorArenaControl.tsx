
import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive,
  BarChart3, Landmark, Percent
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability } from '../types';
import { updateEcosystem } from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { DEFAULT_MACRO } from '../constants';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'suppliers' | 'hr' | 'difficulty'>('suppliers');
  const [macro, setMacro] = useState<MacroIndicators>(championship.market_indicators || DEFAULT_MACRO);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { market_indicators: macro };
    await updateEcosystem(championship.id, payload);
    onUpdate(payload);
    setIsSaving(false);
    alert("MATRIZ DE IMPACTO ATUALIZADA: Parâmetros aplicados na Arena.");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-600/20"><Landmark size={32}/></div>
               <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Arena <span className="text-orange-500">Master</span></h2>
            </div>
            <p className="text-slate-500 font-black uppercase text-[11px] tracking-[0.5em] italic">Handshake: Rodada 0{championship.current_round + 1} • Estabilidade v13.2</p>
         </div>
         <div className="flex gap-3 p-2 bg-slate-900 border-2 border-white/5 rounded-3xl shadow-2xl overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Insumos & CAPEX" icon={<Boxes size={18}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Indicadores Macro" icon={<TrendingUp size={18}/>} />
            <TabBtn active={activeTab === 'hr'} onClick={() => setActiveTab('hr')} label="RH & Produtividade" icon={<HardDrive size={18}/>} />
            <TabBtn active={activeTab === 'difficulty'} onClick={() => setActiveTab('difficulty')} label="Sensibilidade" icon={<Zap size={18}/>} />
         </div>
      </div>

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* MP COLUMN */}
           <div className="lg:col-span-4 bg-slate-900 p-12 rounded-[4rem] border-2 border-white/5 shadow-2xl space-y-12">
              <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-4 border-b border-white/5 pb-6">
                 <Package className="text-orange-500" size={28} /> Matérias-Primas
              </h3>
              <div className="space-y-10">
                 <MacroInput label="Preço P0 MP-A" val={macro.prices.mp_a} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                 <MacroInput label="Reajuste Ciclo MP-A (%)" val={macro.raw_material_a_adjust} onChange={v => setMacro({...macro, raw_material_a_adjust: v})} icon={<Percent size={14}/>} />
                 <div className="w-full h-px bg-white/5" />
                 <MacroInput label="Preço P0 MP-B" val={macro.prices.mp_b} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                 <MacroInput label="Reajuste Ciclo MP-B (%)" val={macro.raw_material_b_adjust} onChange={v => setMacro({...macro, raw_material_b_adjust: v})} icon={<Percent size={14}/>} />
              </div>
           </div>
           
           {/* ASSETS COLUMN */}
           <div className="lg:col-span-8 bg-slate-950 p-12 rounded-[5rem] border-2 border-orange-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)] space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12"><Cpu size={300} /></div>
              <div className="flex justify-between items-center relative z-10">
                 <h3 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
                    <Cpu className="text-blue-500" size={36} /> Ativos de Capital (Máquinas)
                 </h3>
                 <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-full border border-white/10 shadow-lg">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">Protocolo de Venda</span>
                    <button 
                       onClick={() => setMacro({...macro, allow_machine_sale: !macro.allow_machine_sale})}
                       className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${macro.allow_machine_sale ? 'bg-emerald-600 text-white border border-emerald-400' : 'bg-slate-800 text-slate-500 border border-white/5'}`}
                    >
                       {macro.allow_machine_sale ? 'LIBERADA' : 'BLOQUEADA'}
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                 <div className="space-y-8 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Modelo ALFA</h4>
                    <MacroInput label="Preço P0" val={macro.machinery_values.alfa} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, alfa: v}})} />
                    <MacroInput label="Reajuste (%)" val={macro.machine_alpha_price_adjust} dark onChange={v => setMacro({...macro, machine_alpha_price_adjust: v})} />
                 </div>
                 <div className="space-y-8 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Modelo BETA</h4>
                    <MacroInput label="Preço P0" val={macro.machinery_values.beta} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} />
                    <MacroInput label="Reajuste (%)" val={macro.machine_beta_price_adjust} dark onChange={v => setMacro({...macro, machine_beta_price_adjust: v})} />
                 </div>
                 <div className="space-y-8 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Modelo GAMA</h4>
                    <MacroInput label="Preço P0" val={macro.machinery_values.gama} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, gama: v}})} />
                    <MacroInput label="Reajuste (%)" val={macro.machine_gamma_price_adjust} dark onChange={v => setMacro({...macro, machine_gamma_price_adjust: v})} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="bg-slate-900 p-16 rounded-[5rem] border-2 border-white/5 shadow-2xl space-y-16">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <MacroInput label="ICE (Confiança %)" val={macro.ice} onChange={v => setMacro({...macro, ice: v})} desc="Impacta a elasticidade da demanda." />
              <MacroInput label="Inflação Round (%)" val={macro.inflation_rate} onChange={v => setMacro({...macro, inflation_rate: v})} desc="Reajuste generalizado do ecossistema." />
              <MacroInput label="Taxa TR / Juros (%)" val={macro.interest_rate_tr} onChange={v => setMacro({...macro, interest_rate_tr: v})} desc="Custo base do capital bancário." />
              <MacroInput label="Inadimplência (%)" val={macro.customer_default_rate} onChange={v => setMacro({...macro, customer_default_rate: v})} />
              <MacroInput label="Juros Vendas (%)" val={macro.sales_interest_rate} onChange={v => setMacro({...macro, sales_interest_rate: v})} />
              <MacroInput label="Deságio Venda (%)" val={macro.machine_sale_discount} onChange={v => setMacro({...macro, machine_sale_discount: v})} />
           </div>
        </div>
      )}

      <div className="flex justify-end pt-12">
         <button 
           onClick={handleSave} 
           disabled={isSaving} 
           className="px-24 py-10 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-white hover:text-orange-950 transition-all shadow-[0_20px_80px_rgba(249,115,22,0.5)] flex items-center gap-10 active:scale-95 group border-4 border-orange-400/50"
         >
            {isSaving ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" /> Selar Parâmetros Oracle</>}
         </button>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap border-2 active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-xl' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white hover:border-white/20'}`}>
    {icon} {label}
  </button>
);

const MacroInput = ({ label, val, onChange, dark, icon, desc }: any) => (
  <div className="space-y-4 group">
     <div className="flex justify-between items-center">
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] italic group-focus-within:text-orange-500 transition-colors ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
        {icon && <div className="text-slate-700">{icon}</div>}
     </div>
     <div className="relative">
        <input 
           type="number" 
           value={val} 
           onChange={e => onChange(Number(e.target.value))} 
           className={`w-full border-2 rounded-[1.5rem] px-8 py-6 font-mono font-black text-3xl outline-none transition-all ${dark ? 'bg-slate-950 border-white/5 text-white focus:border-blue-600' : 'bg-slate-950 border-white/10 text-white focus:border-orange-600 shadow-inner'}`} 
        />
     </div>
     {desc && <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight italic ml-2">{desc}</p>}
  </div>
);

export default TutorArenaControl;
