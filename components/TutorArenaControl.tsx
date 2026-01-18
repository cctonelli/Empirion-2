import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability } from '../types';
import { updateEcosystem } from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { DEFAULT_MACRO } from '../constants';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'macro' | 'suppliers' | 'hr' | 'difficulty'>('suppliers');
  const [config, setConfig] = useState<EcosystemConfig>(championship.ecosystemConfig || {
    scenario_type: 'simulated', 
    modality_type: 'standard', 
    inflation_rate: 0.04, 
    demand_multiplier: 1.0, 
    interest_rate: 0.12, 
    market_volatility: 0.2
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
    alert("PARÂMETROS SINCRONIZADOS: Índices aplicados para o Round " + (championship.current_round + 1));
  };

  const summonBlackSwan = async () => {
    setIsSummoning(true);
    try {
      const event = await generateBlackSwanEvent(championship.branch);
      if (event) setPendingEvent(event);
    } catch (e) { alert("Falha no link neural."); }
    finally { setIsSummoning(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Comando Oracle <span className="text-orange-600">v13.2</span></h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Orquestração Round {championship.current_round + 1}</p>
         </div>
         <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Insumos & Ativos" icon={<Boxes size={14}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Macroeconomia" icon={<TrendingUp size={14}/>} />
            <TabBtn active={activeTab === 'hr'} onClick={() => setActiveTab('hr')} label="RH & Produtividade" icon={<Users size={14}/>} />
            <TabBtn active={activeTab === 'difficulty'} onClick={() => setActiveTab('difficulty')} label="Sensibilidade" icon={<BrainCircuit size={14}/>} />
         </div>
      </div>

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 text-slate-900">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Boxes className="text-orange-500" /> Matérias-Primas</h3>
              <div className="space-y-8">
                 <MacroInput label="Preço P0 MP-A" val={macro.prices.mp_a} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                 <MacroInput label="Reajuste MP-A (%)" val={macro.raw_material_a_adjust} onChange={v => setMacro({...macro, raw_material_a_adjust: v})} />
                 <div className="w-full h-px bg-slate-100" />
                 <MacroInput label="Preço P0 MP-B" val={macro.prices.mp_b} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                 <MacroInput label="Reajuste MP-B (%)" val={macro.raw_material_b_adjust} onChange={v => setMacro({...macro, raw_material_b_adjust: v})} />
              </div>
           </div>
           
           <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 text-white">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Cpu className="text-blue-500" /> Ativos de Capital (Máquinas)</h3>
                 <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Venda de Ativos</span>
                    <button 
                       onClick={() => setMacro({...macro, allow_machine_sale: !macro.allow_machine_sale})}
                       className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${macro.allow_machine_sale ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                       {macro.allow_machine_sale ? 'LIBERADA' : 'BLOQUEADA'}
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-6">
                    <MacroInput label="Valor Alfa P0" val={macro.machinery_values.alfa} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, alfa: v}})} />
                    <MacroInput label="Reajuste Alfa (%)" val={macro.machine_alpha_price_adjust} dark onChange={v => setMacro({...macro, machine_alpha_price_adjust: v})} />
                 </div>
                 <div className="space-y-6">
                    <MacroInput label="Valor Beta P0" val={macro.machinery_values.beta} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} />
                    <MacroInput label="Reajuste Beta (%)" val={macro.machine_beta_price_adjust} dark onChange={v => setMacro({...macro, machine_beta_price_adjust: v})} />
                 </div>
                 <div className="space-y-6">
                    <MacroInput label="Valor Gama P0" val={macro.machinery_values.gama} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, gama: v}})} />
                    <MacroInput label="Reajuste Gama (%)" val={macro.machine_gamma_price_adjust} dark onChange={v => setMacro({...macro, machine_gamma_price_adjust: v})} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'hr' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 text-slate-900">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><HardDrive size={16} /> Produtividade Média/Homem</label>
                    <span className="text-xl font-black text-slate-900">{macro.labor_productivity.toFixed(1)}x</span>
                 </div>
                 <input type="range" min="0.5" max="2.0" step="0.1" value={macro.labor_productivity} onChange={e => setMacro({...macro, labor_productivity: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 <p className="text-[9px] text-slate-400 font-bold uppercase italic italic leading-relaxed">Fator multiplicador sobre o total produzido por ciclo.</p>
              </div>
              <div className="space-y-6">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Disponibilidade de Mão de Obra</label>
                 <div className="grid grid-cols-3 gap-4">
                    {(['BAIXA', 'MEDIA', 'ALTA'] as LaborAvailability[]).map(level => (
                      <button key={level} onClick={() => setMacro({...macro, labor_availability: level})} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${macro.labor_availability === level ? 'bg-orange-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}>{level}</button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'macro' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 text-slate-900">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <MacroInput label="ICE (Crescimento %)" val={macro.ice} onChange={v => setMacro({...macro, ice: v})} />
              <MacroInput label="Inflação Período (%)" val={macro.inflation_rate} onChange={v => setMacro({...macro, inflation_rate: v})} />
              <MacroInput label="Taxa TR / Selic (%)" val={macro.interest_rate_tr} onChange={v => setMacro({...macro, interest_rate_tr: v})} />
              <MacroInput label="Inadimplência (%)" val={macro.customer_default_rate} onChange={v => setMacro({...macro, customer_default_rate: v})} />
              <MacroInput label="Juros Vendas (%)" val={macro.sales_interest_rate} onChange={v => setMacro({...macro, sales_interest_rate: v})} />
              <MacroInput label="Deságio Venda Máquinas (%)" val={macro.machine_sale_discount} onChange={v => setMacro({...macro, machine_sale_discount: v})} />
           </div>
        </div>
      )}

      {/* difficulty tab permanece similar, mas ajustando para macro rule fields se necessário */}

      <div className="flex justify-end pt-10">
         <button onClick={handleSave} disabled={isSaving} className="px-20 py-8 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 transition-all shadow-2xl flex items-center gap-6 active:scale-95 group">
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="group-hover:scale-110 transition-transform" /> Selar Ciclo {championship.current_round + 1}</>}
         </button>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${active ? 'bg-orange-600 text-white shadow-md border border-orange-500' : 'text-slate-500 bg-white/5 border border-white/5 hover:bg-white/10'}`}>{icon} {label}</button>
);

const MacroInput = ({ label, val, onChange, dark }: any) => (
  <div className="space-y-3">
     <label className={`text-[9px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
     <div className="relative">
        <input 
           type="number" 
           value={val} 
           onChange={e => onChange(Number(e.target.value))} 
           className={`w-full border rounded-2xl px-6 py-4 font-mono font-black text-lg outline-none transition-all ${dark ? 'bg-slate-950 border-white/5 text-white focus:border-orange-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500'}`} 
        />
     </div>
  </div>
);

const Users = ({ size }: { size: number }) => <UsersIcon size={size} />;
import { Users as UsersIcon } from 'lucide-react';

export default TutorArenaControl;