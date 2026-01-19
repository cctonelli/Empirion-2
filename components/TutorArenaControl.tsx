
import React, { useState } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive,
  BarChart3, Landmark, Percent, Settings2, DollarSign,
  ShieldAlert,
  // Added missing Users icon to fix the reference error on line 132
  Users
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability } from '../types';
import { updateEcosystem } from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { DEFAULT_MACRO } from '../constants';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'conjuncture' | 'suppliers'>('conjuncture');
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
      {/* HEADER LOCAL DE PLANEJAMENTO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5">
         <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl"><Settings2 size={24}/></div>
            <div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Parametrização Oracle</h3>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuração do motor de simulação para o Ciclo P0{championship.current_round + 1}</p>
            </div>
         </div>
         <div className="flex gap-3">
            <TabBtn active={activeTab === 'conjuncture'} onClick={() => setActiveTab('conjuncture')} label="Aba 1: Conjuntura Econômica" icon={<TrendingUp size={16}/>} />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Aba 2: Preço Fornecedores & Insumos" icon={<Package size={16}/>} />
         </div>
      </div>

      {activeTab === 'conjuncture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* INDICADORES BASE */}
           <div className="lg:col-span-8 bg-slate-900 p-12 rounded-[4rem] border-2 border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]"><Globe size={300} /></div>
              <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-4 relative z-10">
                 <TrendingUp className="text-indigo-400" size={28} /> Variáveis de Ecossistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <MacroInput label="ICE (Confiança do Consumidor %)" val={macro.ice} onChange={v => setMacro({...macro, ice: v})} desc="Impacta diretamente a curva de demanda em todas as regiões." icon={<Target size={14}/>} />
                 <MacroInput label="Inflação Round (%)" val={macro.inflation_rate} onChange={v => setMacro({...macro, inflation_rate: v})} desc="Reajuste automático de insumos e custos fixos." icon={<Flame size={14}/>} />
                 <MacroInput label="Taxa TR / Juros Base (%)" val={macro.interest_rate_tr} onChange={v => setMacro({...macro, interest_rate_tr: v})} desc="Custo de capital para empréstimos bancários (P1/P2)." icon={<Landmark size={14}/>} />
                 <MacroInput label="Taxa Inadimplência (%)" val={macro.customer_default_rate} onChange={v => setMacro({...macro, customer_default_rate: v})} desc="Percentual de perdas em vendas a prazo." icon={<ShieldAlert size={14}/>} />
              </div>
           </div>

           {/* SENSIGILIDADE E PERFORMANCE */}
           <div className="lg:col-span-4 bg-slate-950 p-12 rounded-[4rem] border-2 border-orange-500/20 shadow-2xl space-y-10">
              <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-4">
                 <Zap className="text-orange-500" size={24} /> Sensibilidade IA
              </h3>
              <div className="space-y-8">
                 <MacroInput dark label="Produtividade Média" val={macro.labor_productivity} onChange={v => setMacro({...macro, labor_productivity: v})} desc="Capacidade de produção por homem/máquina." />
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Disponibilidade Mão de Obra</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['BAIXA', 'MEDIA', 'ALTA'].map(lvl => (
                          <button 
                            key={lvl} 
                            onClick={() => setMacro({...macro, labor_availability: lvl as LaborAvailability})}
                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${macro.labor_availability === lvl ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                          >
                             {lvl}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* MATERIAIS E OPERAÇÃO */}
           <div className="lg:col-span-4 bg-slate-900 p-12 rounded-[4rem] border-2 border-white/5 shadow-2xl space-y-12">
              <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-4 border-b border-white/5 pb-6">
                 <Package className="text-orange-500" size={28} /> Insumos & Escala
              </h3>
              <div className="space-y-10">
                 <div className="space-y-6">
                    <MacroInput label="Preço P0 MP-A" val={macro.prices.mp_a} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                    <MacroInput label="Reajuste Ciclo MP-A (%)" val={macro.raw_material_a_adjust} onChange={v => setMacro({...macro, raw_material_a_adjust: v})} icon={<Percent size={14}/>} />
                 </div>
                 <div className="w-full h-px bg-white/5" />
                 <div className="space-y-6">
                    <MacroInput label="Preço P0 MP-B" val={macro.prices.mp_b} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                    <MacroInput label="Reajuste Ciclo MP-B (%)" val={macro.raw_material_b_adjust} onChange={v => setMacro({...macro, raw_material_b_adjust: v})} icon={<Percent size={14}/>} />
                 </div>
              </div>
           </div>
           
           {/* ASSETS / CAPEX */}
           <div className="lg:col-span-8 bg-slate-950 p-12 rounded-[4rem] border-2 border-indigo-500/20 shadow-2xl space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12"><Cpu size={300} /></div>
              <div className="flex justify-between items-center relative z-10">
                 <h3 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
                    <Cpu className="text-blue-500" size={36} /> Ativos de Capital (CapEx)
                 </h3>
                 <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-full border border-white/10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">Venda de Usados</span>
                    <button 
                       onClick={() => setMacro({...macro, allow_machine_sale: !macro.allow_machine_sale})}
                       className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${macro.allow_machine_sale ? 'bg-emerald-600 text-white border border-emerald-400' : 'bg-slate-800 text-slate-500 border border-white/5'}`}
                    >
                       {macro.allow_machine_sale ? 'Habilitada' : 'Bloqueada'}
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                 <MachineControl label="ALFA" price={macro.machinery_values.alfa} adjust={macro.machine_alpha_price_adjust} onPrice={v => setMacro({...macro, machinery_values: {...macro.machinery_values, alfa: v}})} onAdjust={v => setMacro({...macro, machine_alpha_price_adjust: v})} />
                 <MachineControl label="BETA" price={macro.machinery_values.beta} adjust={macro.machine_beta_price_adjust} onPrice={v => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} onAdjust={v => setMacro({...macro, machine_beta_price_adjust: v})} color="text-blue-500" />
                 <MachineControl label="GAMA" price={macro.machinery_values.gama} adjust={macro.machine_gamma_price_adjust} onPrice={v => setMacro({...macro, machinery_values: {...macro.machinery_values, gama: v}})} onAdjust={v => setMacro({...macro, machine_gamma_price_adjust: v})} color="text-emerald-500" />
              </div>
              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 {/* Fixed missing Users icon error here by ensuring it's in the imports */}
                 <MacroInput label="Reajuste Salarial Ciclo (%)" val={macro.salary_adjust} onChange={v => setMacro({...macro, salary_adjust: v})} icon={<Users size={14}/>} />
                 <MacroInput label="Reajuste Logística (%)" val={macro.distribution_cost_adjust} onChange={v => setMacro({...macro, distribution_cost_adjust: v})} icon={<Globe size={14}/>} />
              </div>
           </div>
        </div>
      )}

      {/* FOOTER CTA FIXO NO PLANEJAMENTO */}
      <div className="flex justify-end pt-12 border-t border-white/5">
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

const MachineControl = ({ label, price, adjust, onPrice, onAdjust, color = "text-orange-500" }: any) => (
  <div className="space-y-8 bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-all">
     <h4 className={`text-[11px] font-black uppercase ${color} tracking-widest italic`}>Modelo {label}</h4>
     <MacroInput label="Preço P0 ($)" val={price} dark onChange={onPrice} />
     <MacroInput label="Reajuste (%)" val={adjust} dark onChange={onAdjust} icon={<Percent size={12}/>} />
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap border-2 active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-xl' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
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
