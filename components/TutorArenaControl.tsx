
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive,
  BarChart3, Landmark, Percent, Settings2, DollarSign,
  ShieldAlert, Users, CheckCircle2, ChevronRight, Scale, AlertCircle, Briefcase, Award, Eye
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability, CurrencyType } from '../types';
import { updateEcosystem, supabase } from '../services/supabase';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'conjuncture' | 'suppliers' | 'market' | 'staffing' | 'international' | 'awards'>('conjuncture');
  const [isSaving, setIsSaving] = useState(false);
  const [hasDecisions, setHasDecisions] = useState(false);
  
  const nextRoundIdx = championship.current_round + 1;
  const inheritedRules = useMemo(() => {
     const rules = championship.round_rules?.[nextRoundIdx] || DEFAULT_INDUSTRIAL_CHRONOGRAM[nextRoundIdx] || championship.market_indicators;
     return { ...championship.market_indicators, ...rules };
  }, [championship, nextRoundIdx]);

  const [macro, setMacro] = useState<MacroIndicators>(inheritedRules);

  useEffect(() => {
    setMacro(inheritedRules);
    // Verifica se já existem decisões para o round atual para contextualizar a intervenção
    const checkDecisions = async () => {
       const table = championship.is_trial ? 'trial_decisions' : 'current_decisions';
       const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('championship_id', championship.id).eq('round', nextRoundIdx);
       setHasDecisions((count || 0) > 0);
    };
    checkDecisions();
  }, [inheritedRules, championship.id, nextRoundIdx]);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { 
      market_indicators: macro,
      round_rules: {
        ...(championship.round_rules || {}),
        [nextRoundIdx]: macro
      }
    };
    await updateEcosystem(championship.id, payload);
    onUpdate(payload);
    setIsSaving(false);
    alert(`INTERVENÇÃO EXECUTADA: Cenário para P0${nextRoundIdx} selado.`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 relative z-10">
      
      {/* HEADER DE STATUS DE CONTEXTO */}
      <div className={`p-8 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between shadow-2xl transition-all gap-6 ${hasDecisions ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-900/40 border-white/5'}`}>
         <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${hasDecisions ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
               <BrainCircuit size={32}/>
            </div>
            <div>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tight">
                  {hasDecisions ? 'Intervenção Tática Ativa' : 'Aguardando Inteligência'}
               </h4>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic flex items-center gap-2">
                  {hasDecisions ? <><CheckCircle2 size={12} className="text-emerald-500" /> Equipes já operando. Choques econômicos afetarão o fechamento P0{nextRoundIdx}.</> : <><Info size={12} /> Dados sincronizados do Wizard. Nenhuma equipe enviou decisões ainda.</>}
               </p>
            </div>
         </div>
         <div className="flex flex-wrap gap-2">
            <TabBtn active={activeTab === 'conjuncture'} onClick={() => setActiveTab('conjuncture')} label="Conjuntura" icon={<TrendingUp size={14}/>} />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Insumos & CAPEX" icon={<Package size={14}/>} />
            <TabBtn active={activeTab === 'market'} onClick={() => setActiveTab('market')} label="Mercado" icon={<ShoppingCart size={14}/>} />
            <TabBtn active={activeTab === 'staffing'} onClick={() => setActiveTab('staffing')} label="Staffing" icon={<Briefcase size={14}/>} />
            <TabBtn active={activeTab === 'awards'} onClick={() => setActiveTab('awards')} label="Premiações" icon={<Award size={14}/>} />
            <TabBtn active={activeTab === 'international'} onClick={() => setActiveTab('international')} label="Câmbio" icon={<Globe size={14}/>} />
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
           
           {activeTab === 'conjuncture' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ParamCard label="ICE (Confiança)" val={macro.ice} suffix="%" onChange={(v: number) => setMacro({...macro, ice: v})} icon={<Target className="text-blue-400" />} />
                    <ParamCard label="Inflação" val={macro.inflation_rate} suffix="%" onChange={(v: number) => setMacro({...macro, inflation_rate: v})} icon={<Flame className="text-orange-500" />} />
                    <ParamCard label="Taxa TR" val={macro.interest_rate_tr} suffix="%" onChange={(v: number) => setMacro({...macro, interest_rate_tr: v})} icon={<Landmark className="text-emerald-500" />} />
                    <ParamCard label="Rendimento Aplicação" val={macro.investment_return_rate} suffix="%" onChange={(v: number) => setMacro({...macro, investment_return_rate: v})} icon={<TrendingUp className="text-amber-500" />} />
                 </div>
                 <div className="lg:col-span-4 bg-slate-900/50 p-10 rounded-[4rem] border border-white/10 shadow-2xl">
                    <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3"><Users size={20} className="text-indigo-400"/> Sensibilidade Humana</h3>
                    <MacroInput dark label="Produtividade Média" val={macro.labor_productivity} onChange={(v: number) => setMacro({...macro, labor_productivity: v})} />
                    <div className="mt-8 space-y-4">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Disponibilidade</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['BAIXA', 'MEDIA', 'ALTA'].map(lvl => (
                             <button key={lvl} onClick={() => setMacro({...macro, labor_availability: lvl as LaborAvailability})} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${macro.labor_availability === lvl ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>{lvl}</button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'suppliers' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                       <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Package className="text-orange-500"/> Insumos & Estocagem</h3>
                       <MacroInput label="MP-A Base ($)" val={macro.prices.mp_a} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                       <MacroInput label="MP-B Base ($)" val={macro.prices.mp_b} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                       <MacroInput label="Ágio Compras Esp. (%)" val={macro.special_purchase_premium} onChange={(v: number) => setMacro({...macro, special_purchase_premium: v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <MacroInput label="Estocagem MP ($)" val={macro.prices.storage_mp || 1.40} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, storage_mp: v}})} />
                          <MacroInput label="Estocagem PROD ($)" val={macro.prices.storage_finished || 20.00} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, storage_finished: v}})} />
                       </div>
                    </div>
                 </div>
                 <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                    <div className="flex justify-between items-center">
                       <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Cpu className="text-blue-500"/> Ativos de Capital</h3>
                       <button onClick={() => setMacro({...macro, allow_machine_sale: !macro.allow_machine_sale})} className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase italic transition-all ${macro.allow_machine_sale ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-600/10 border-rose-500/30 text-rose-500'}`}>
                          Venda de Máquinas: {macro.allow_machine_sale ? 'LIBERADA' : 'BLOQUEADA'}
                       </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <MacroInput label="Preço ALFA" val={macro.machinery_values.alfa} dark onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, alfa: v}})} />
                       <MacroInput label="Preço BETA" val={macro.machinery_values.beta} dark onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} />
                       <MacroInput label="Preço GAMA" val={macro.machinery_values.gama} dark onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, gama: v}})} />
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'market' && (
              <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                 <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><ShoppingCart className="text-orange-500"/> Mercado P00</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <MacroInput label="Preço Venda Médio ($)" val={macro.avg_selling_price || 340} onChange={(v: number) => setMacro({...macro, avg_selling_price: v})} />
                    <MacroInput label="Distribuição Unit. ($)" val={macro.prices.distribution_unit || 50} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, distribution_unit: v}})} />
                    <MacroInput label="Base Campanha MKT ($)" val={macro.prices.marketing_campaign || 10000} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, marketing_campaign: v}})} />
                 </div>
              </div>
           )}

           {activeTab === 'staffing' && (
              <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                 <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Briefcase className="text-indigo-400"/> Staffing P00</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <MacroInput label="Salário Base ($)" val={macro.hr_base.salary || 1300} onChange={(v: number) => setMacro({...macro, hr_base: {...macro.hr_base, salary: v}})} />
                    <div className="p-8 bg-slate-950/50 rounded-3xl border border-white/5 space-y-2">
                       <span className="block text-[8px] font-black text-slate-600 uppercase">Administração</span>
                       <span className="text-xl font-mono font-black text-white">{macro.staffing.admin.count} Units</span>
                    </div>
                    <div className="p-8 bg-slate-950/50 rounded-3xl border border-white/5 space-y-2">
                       <span className="block text-[8px] font-black text-slate-600 uppercase">Vendas</span>
                       <span className="text-xl font-mono font-black text-white">{macro.staffing.sales.count} Units</span>
                    </div>
                    <div className="p-8 bg-slate-950/50 rounded-3xl border border-white/5 space-y-2">
                       <span className="block text-[8px] font-black text-slate-600 uppercase">Produção</span>
                       <span className="text-xl font-mono font-black text-white">{macro.staffing.production.count} Units</span>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'awards' && (
              <div className="bg-orange-600/5 p-10 rounded-[4rem] border border-orange-500/20 shadow-2xl space-y-12">
                 <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Award className="text-orange-500"/> Premiações por Precisão</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <MacroInput label="Prêmio Custo ($)" val={macro.award_values.cost_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, cost_precision: v}})} />
                    <MacroInput label="Prêmio Receita ($)" val={macro.award_values.revenue_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, revenue_precision: v}})} />
                    <MacroInput label="Prêmio Lucro ($)" val={macro.award_values.profit_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, profit_precision: v}})} />
                 </div>
              </div>
           )}

           {activeTab === 'international' && (
              <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20"><Globe size={32}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Câmbio e Geopolítica</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Taxas de conversão para o Ciclo P0{nextRoundIdx}.</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ParamCard label="Dólar (USD)" val={macro.exchange_rates?.USD || 5.2} suffix="x" onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, USD: v}})} icon={<DollarSign className="text-emerald-500" />} />
                    <ParamCard label="Euro (EUR)" val={macro.exchange_rates?.EUR || 5.5} suffix="x" onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, EUR: v}})} icon={<EuroIcon className="text-blue-500" />} />
                 </div>
              </div>
           )}

        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end pt-12 border-t border-white/5">
         <button onClick={handleSave} disabled={isSaving} className="px-24 py-10 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-white hover:text-orange-950 transition-all shadow-[0_20px_80px_rgba(249,115,22,0.5)] flex items-center gap-10 active:scale-95 group border-4 border-orange-400/50">
            {isSaving ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} strokeWidth={2.5} /> Confirmar Planejamento P0{nextRoundIdx}</>}
         </button>
      </div>
    </div>
  );
};

const ParamCard = ({ label, val, suffix, onChange, icon }: any) => (
  <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-white/10 flex flex-col gap-6 shadow-xl group hover:border-orange-500/30 transition-all">
     <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all w-fit">{icon}</div>
     <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500 mb-4 block italic">{label}</label>
        <div className="flex items-center gap-3">
           <input type="number" step="0.1" value={val} onChange={e => onChange(parseFloat(e.target.value))} className="bg-transparent text-4xl font-black text-white italic outline-none w-32 border-b border-white/5 focus:border-orange-500 transition-all" />
           <span className="text-2xl font-black text-slate-700 italic">{suffix}</span>
        </div>
     </div>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border-2 active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
    {icon} {label}
  </button>
);

const MacroInput = ({ label, val, onChange, dark }: any) => (
  <div className="space-y-4 group">
     <label className={`text-[10px] font-black uppercase tracking-[0.2em] italic group-focus-within:text-orange-500 transition-colors ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
     <input type="number" step="0.1" value={val} onChange={e => onChange(Number(e.target.value))} className={`w-full border-2 rounded-[1.5rem] px-8 py-6 font-mono font-black text-3xl outline-none transition-all ${dark ? 'bg-slate-950 border-white/5 text-white focus:border-blue-600' : 'bg-slate-950 border-white/10 text-white focus:border-orange-600 shadow-inner'}`} />
  </div>
);

const EuroIcon = ({ className, size }: any) => <span className={`${className} font-black`} style={{fontSize: size}}>€</span>;

export default TutorArenaControl;
