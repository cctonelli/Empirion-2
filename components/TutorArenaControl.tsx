
import React, { useState, useEffect } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive,
  BarChart3, Landmark, Percent, Settings2, DollarSign,
  ShieldAlert, Users, CheckCircle2, ChevronRight, Scale
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability } from '../types';
import { updateEcosystem } from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { DEFAULT_MACRO } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'conjuncture' | 'suppliers' | 'international'>('conjuncture');
  const [macro, setMacro] = useState<MacroIndicators>(championship.market_indicators || DEFAULT_MACRO);
  const [isSaving, setIsSaving] = useState(false);
  
  const isStartOfGame = championship.current_round === 0;

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { market_indicators: macro };
    await updateEcosystem(championship.id, payload);
    onUpdate(payload);
    setIsSaving(false);
    alert("MATRIZ DE IMPACTO ATUALIZADA: Parâmetros aplicados na Arena.");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 relative z-10">
      
      {/* STATUS DO HANDSHAKE WIZARD */}
      <div className={`p-8 rounded-[3rem] border flex items-center justify-between shadow-2xl transition-all ${isStartOfGame ? 'bg-emerald-600/5 border-emerald-500/20' : 'bg-orange-600/5 border-orange-500/20'}`}>
         <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isStartOfGame ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'}`}>
               {isStartOfGame ? <CheckCircle2 size={32}/> : <Activity size={32}/>}
            </div>
            <div>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tight">
                  {isStartOfGame ? 'Baseline Sincronizado do Wizard' : 'Ajustes Dinâmicos de Meio de Torneio'}
               </h4>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">
                  {isStartOfGame ? 'Parâmetros iniciais prontos. Clique em avançar rodada no Cockpit para iniciar.' : `Modificando cenário para o Ciclo P0${championship.current_round + 1}.`}
               </p>
            </div>
         </div>
         <div className="flex gap-4">
            <TabBtn active={activeTab === 'conjuncture'} onClick={() => setActiveTab('conjuncture')} label="Conjuntura" icon={<TrendingUp size={16}/>} />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Insumos" icon={<Package size={16}/>} />
            <TabBtn active={activeTab === 'international'} onClick={() => setActiveTab('international')} label="Câmbio & Geopolítica" icon={<Globe size={16}/>} />
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
           
           {activeTab === 'conjuncture' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ParamCard 
                       label="ICE (Confiança Consumidor)" val={macro.ice} suffix="%" 
                       onChange={v => setMacro({...macro, ice: v})}
                       desc="Determina o volume total de demanda global no cluster."
                       icon={<Target className="text-blue-400" />}
                       status={isStartOfGame ? 'Wizard Baseline' : 'Manual Override'}
                    />
                    <ParamCard 
                       label="Inflação do Round" val={macro.inflation_rate} suffix="%" 
                       onChange={v => setMacro({...macro, inflation_rate: v})}
                       desc="Aumenta custos de OPEX e preços de fornecedores automaticamente."
                       icon={<Flame className="text-orange-500" />}
                       status={isStartOfGame ? 'Wizard Baseline' : 'Manual Override'}
                    />
                    <ParamCard 
                       label="Taxa TR / SELIC" val={macro.interest_rate_tr} suffix="%" 
                       onChange={v => setMacro({...macro, interest_rate_tr: v})}
                       desc="Custo de capital para novos empréstimos no P1/P2."
                       icon={<Landmark className="text-emerald-500" />}
                       status={isStartOfGame ? 'Wizard Baseline' : 'Manual Override'}
                    />
                    <ParamCard 
                       label="Inadimplência Regional" val={macro.customer_default_rate} suffix="%" 
                       onChange={v => setMacro({...macro, customer_default_rate: v})}
                       desc="Perda estimada sobre vendas realizadas a prazo."
                       icon={<ShieldAlert className="text-rose-500" />}
                       status={isStartOfGame ? 'Wizard Baseline' : 'Manual Override'}
                    />
                 </div>
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                       <Zap className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 group-hover:scale-110 transition-transform" size={140} />
                       <h3 className="text-xl font-black text-white uppercase italic mb-8">Sensibilidade Humana</h3>
                       <MacroInput dark label="Produtividade Média" val={macro.labor_productivity} onChange={v => setMacro({...macro, labor_productivity: v})} />
                       <div className="mt-8 space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Disponibilidade de Mão de Obra</label>
                          <div className="grid grid-cols-3 gap-2">
                             {['BAIXA', 'MEDIA', 'ALTA'].map(lvl => (
                                <button key={lvl} onClick={() => setMacro({...macro, labor_availability: lvl as LaborAvailability})} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${macro.labor_availability === lvl ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{lvl}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'suppliers' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                       <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Package className="text-orange-500"/> Fornecedores</h3>
                       <MacroInput label="MP-A Base ($)" val={macro.prices.mp_a} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                       <MacroInput label="MP-B Base ($)" val={macro.prices.mp_b} onChange={v => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                       <MacroInput label="Logística Unit." val={macro.prices.distribution_unit} onChange={v => setMacro({...macro, prices: {...macro.prices, distribution_unit: v}})} />
                    </div>
                 </div>
                 <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                    <div className="flex justify-between items-center">
                       <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Cpu className="text-blue-500"/> Ativos de Capital</h3>
                       <div className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase italic ${macro.allow_machine_sale ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-600/10 border-rose-500/30 text-rose-500'}`}>
                          Venda de Máquinas: {macro.allow_machine_sale ? 'LIBERADA' : 'BLOQUEADA'}
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <MacroInput label="Preço ALFA" val={macro.machinery_values.alfa} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, alfa: v}})} />
                       <MacroInput label="Preço BETA" val={macro.machinery_values.beta} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} />
                       <MacroInput label="Preço GAMA" val={macro.machinery_values.gama} dark onChange={v => setMacro({...macro, machinery_values: {...macro.machinery_values, gama: v}})} />
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'international' && (
              <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20"><Globe size={32}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Câmbio e Geopolítica</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuração de moedas regionais e taxas de conversão.</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ParamCard 
                       label="Dólar Comercial (USD)" val={macro.exchange_rates?.USD || 5.2} suffix="x" 
                       onChange={v => setMacro({...macro, exchange_rates: {...macro.exchange_rates, USD: v}})}
                       desc="Taxa de conversão para vendas em USD para a moeda base."
                       icon={<DollarSign className="text-emerald-500" />}
                    />
                    <ParamCard 
                       label="Euro (EUR)" val={macro.exchange_rates?.EUR || 5.5} suffix="x" 
                       onChange={v => setMacro({...macro, exchange_rates: {...macro.exchange_rates, EUR: v}})}
                       desc="Taxa de conversão para vendas em EUR."
                       icon={<EuroIcon className="text-blue-500" />}
                    />
                    <div className="p-10 bg-white/5 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                       <Scale size={32} className="text-slate-700" />
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pesos Regionais definidos no Wizard.</p>
                       <button onClick={() => alert("Pesos de demanda podem ser visualizados na aba Equipes ou reconfigurados no Wizard (Modo Draft).")} className="text-[9px] font-black uppercase text-orange-500 hover:underline">Ver Mapa Global</button>
                    </div>
                 </div>
              </div>
           )}

        </motion.div>
      </AnimatePresence>

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

const ParamCard = ({ label, val, suffix, onChange, desc, icon, status }: any) => (
  <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-white/10 flex flex-col gap-6 shadow-xl group hover:border-orange-500/30 transition-all">
     <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
        {status && <span className="text-[7px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-600 italic">{status}</span>}
     </div>
     <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500 transition-colors mb-4 block italic">{label}</label>
        <div className="flex items-center gap-3">
           <input type="number" step="0.1" value={val} onChange={e => onChange(parseFloat(e.target.value))} className="bg-transparent text-4xl font-black text-white italic outline-none w-32 border-b border-white/5 focus:border-orange-500 transition-all" />
           <span className="text-2xl font-black text-slate-700 italic">{suffix}</span>
        </div>
        <p className="text-[9px] text-slate-600 font-bold uppercase mt-4 italic leading-relaxed">{desc}</p>
     </div>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap border-2 active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
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
           type="number" step="0.1"
           value={val} 
           onChange={e => onChange(Number(e.target.value))} 
           className={`w-full border-2 rounded-[1.5rem] px-8 py-6 font-mono font-black text-3xl outline-none transition-all ${dark ? 'bg-slate-950 border-white/5 text-white focus:border-blue-600' : 'bg-slate-950 border-white/10 text-white focus:border-orange-600 shadow-inner'}`} 
        />
     </div>
     {desc && <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight italic ml-2">{desc}</p>}
  </div>
);

const EuroIcon = ({ className, size }: any) => (
  <span className={`${className} font-black`} style={{fontSize: size}}>€</span>
);

export default TutorArenaControl;
