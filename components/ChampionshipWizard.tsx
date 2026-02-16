
import React, { useState, useEffect } from 'react';
import { 
  Plus, Globe, Loader2, Calculator, Sliders, CheckCircle2, 
  LayoutGrid, Hourglass, Scale, Sparkles, X, Settings2, 
  Users, DollarSign, Package, Cpu, Factory, ChevronLeft, 
  ChevronRight, FileJson, Target, Flame, Landmark, Activity,
  Truck, ShieldAlert, BarChart3, MapPin, Gauge, ClipboardList, HardDrive, Coins, TrendingUp
} from 'lucide-react';
import { INITIAL_FINANCIAL_TREE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { Branch, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, TransparencyLevel, GazetaMode } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import FinancialStructureEditor from './FinancialStructureEditor';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    total_rounds: 12,
    regions_count: 4, 
    teams_count: 5,
    bots_count: 3,
    currency: 'BRL' as CurrencyType,
    deadline_value: 7,
    deadline_unit: 'days' as DeadlineUnit,
    branch: 'industrial' as Branch,
    transparency: 'medium' as TransparencyLevel,
    gazetaMode: 'anonymous' as GazetaMode,
    initialStockPrice: 100.00,
    dividend_percent: 25.0
  });

  const [regionNames, setRegionNames] = useState<string[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [marketIndicators, setMarketIndicators] = useState<MacroIndicators>(DEFAULT_MACRO);
  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>(DEFAULT_INDUSTRIAL_CHRONOGRAM);
  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }>(INITIAL_FINANCIAL_TREE as any);

  useEffect(() => {
    setRegionNames(prev => Array.from({ length: formData.regions_count }, (_, i) => prev[i] || `Região ${i+1}`));
    setTeamNames(prev => Array.from({ length: formData.teams_count }, (_, i) => prev[i] || `Equipe ${i+1}`));
  }, [formData.regions_count, formData.teams_count]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const teamsToCreate = [
      ...teamNames.map(n => ({ name: n, is_bot: false })),
      ...Array.from({ length: formData.bots_count }, (_, i) => ({ name: `BOT Oracle 0${i+1}`, is_bot: true }))
    ];
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        region_names: regionNames,
        initial_financials: financials,
        market_indicators: marketIndicators,
        round_rules: roundRules,
      }, teamsToCreate, isTrial);
      onComplete();
    } catch (e: any) { alert(`FALHA: ${e.message}`); }
    finally { setIsSubmitting(false); }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({ ...prev, [round]: { ...(prev[round] || {}), [key]: val } }));
  };

  const stepsCount = 7; 
  const totalPeriods = formData.total_rounds + 1;

  return (
    <div className="wizard-shell bg-slate-950/90 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl"><Sliders size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Strategos Creator</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Nova Arena • Nodo {formData.currency}</p>
           </div>
        </div>
        <div className="flex gap-4">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div className="wizard-content custom-scrollbar p-12 md:p-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto">
               <WizardStepTitle icon={<Globe size={48}/>} title="Identidade Sistêmica" desc="Configurações globais e governança da arena." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2"><WizardField label="Nome da Arena" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="EX: TORNEIO NACIONAL MASTER" /></div>
                  <WizardSelect label="Moeda Base" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
                  
                  <WizardField label="Rounds" type="number" val={formData.total_rounds} onChange={(v:any)=>setFormData({...formData, total_rounds: parseInt(v)})} />
                  <WizardField label="Regiões" type="number" val={formData.regions_count} onChange={(v:any)=>setFormData({...formData, regions_count: parseInt(v)})} />
                  
                  <div className="grid grid-cols-2 gap-4">
                     <WizardField label="Tempo" type="number" val={formData.deadline_value} onChange={(v:any)=>setFormData({...formData, deadline_value: parseInt(v)})} />
                     <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={(v:any)=>setFormData({...formData, deadline_unit: v})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                  </div>

                  <WizardSelect label="Governança" val={formData.transparency} onChange={(v:any)=>setFormData({...formData, transparency: v})} options={[{v:'low',l:'BAIXA'},{v:'medium',l:'MÉDIA'},{v:'high',l:'ALTA'}]} />
                  <WizardSelect label="Gazeta" val={formData.gazetaMode} onChange={(v:any)=>setFormData({...formData, gazetaMode: v})} options={[{v:'anonymous',l:'ANÔNIMA'},{v:'identified',l:'IDENTIFICADA'}]} />
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-6xl mx-auto">
               <WizardStepTitle icon={<MapPin size={48}/>} title="Nodos Regionais" desc="Identifique as regiões geográficas de consumo." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regionNames.map((n, i) => (
                     <WizardField key={i} label={`Nome Região ${i+1}`} val={n} onChange={(v:any)=> {
                        const copy = [...regionNames]; copy[i] = v; setRegionNames(copy);
                     }} />
                  ))}
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto">
               <WizardStepTitle icon={<Users size={48}/>} title="Unidades Strategos" desc="Defina o grid de equipes e bots." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <WizardField label="Equipes Humanas" type="number" val={formData.teams_count} onChange={(v:any)=>setFormData({...formData, teams_count: parseInt(v)})} />
                  <WizardField label="Equipes Bots" type="number" val={formData.bots_count} onChange={(v:any)=>setFormData({...formData, bots_count: parseInt(v)})} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {teamNames.map((n, i) => (
                     <WizardField key={i} label={`Equipe ${i+1}`} val={n} onChange={(v:any)=> {
                        const copy = [...teamNames]; copy[i] = v; setTeamNames(copy);
                     }} />
                  ))}
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto">
               <WizardStepTitle icon={<Settings2 size={48}/>} title="Custos Base" desc="Parametrize preços iniciais de insumos e ativos." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <h4 className="text-[10px] font-black text-orange-500 uppercase italic border-b border-white/5 pb-4">Insumos ({getCurrencySymbol(formData.currency)})</h4>
                     <WizardField label="MP-A Base" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} isCurrency currency={formData.currency} />
                     <WizardField label="MP-B Base" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} isCurrency currency={formData.currency} />
                  </div>
                  <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <h4 className="text-[10px] font-black text-blue-500 uppercase italic border-b border-white/5 pb-4">Maquinário ({getCurrencySymbol(formData.currency)})</h4>
                     <WizardField label="Preço Alfa" type="number" val={marketIndicators.machinery_values.alfa} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: parseFloat(v)}})} isCurrency currency={formData.currency} />
                     <WizardField label="Preço Beta" type="number" val={marketIndicators.machinery_values.beta} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: parseFloat(v)}})} isCurrency currency={formData.currency} />
                  </div>
                  <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <h4 className="text-[10px] font-black text-emerald-500 uppercase italic border-b border-white/5 pb-4">Staffing ({getCurrencySymbol(formData.currency)})</h4>
                     <WizardField label="Salário Base" type="number" val={marketIndicators.hr_base.salary} onChange={(v:any)=>setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: parseFloat(v)}})} isCurrency currency={formData.currency} />
                  </div>
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
               <WizardStepTitle icon={<BarChart3 size={48}/>} title="Matriz de Rounds" desc="Planejamento temporal da economia (P01-P12)." />
               <div className="matrix-container h-[580px] bg-slate-950/80 border-2 border-white/10 rounded-[3rem] overflow-hidden group">
                  <div className="overflow-auto h-full custom-scrollbar">
                     <table className="w-full text-left border-collapse font-mono">
                        <thead className="sticky top-0 bg-slate-900 z-50">
                           <tr className="text-[9px] font-black uppercase text-slate-500 border-b border-white/10">
                              <th className="p-4 bg-slate-900 sticky left-0 min-w-[280px] border-r border-white/10">Indicador Oracle</th>
                              {Array.from({ length: totalPeriods }).map((_, i) => (
                                 <th key={i} className={`p-4 text-center min-w-[100px] border-r border-white/5 text-orange-500 ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                    P{i < 10 ? `0${i}` : i}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <CompactMatrixRow periods={totalPeriods} label="ICE CRESCIMENTO (%)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="VARIAÇÕES DEMANDA (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="INFLAÇÃO (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="INADIMPLÊNCIA (%)" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="TAXA TR (%)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="JUROS FORNECEDOR (%)" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Truck size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="RENDIMENTO APLIC. (%)" macroKey="investment_return_rate" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="IVA COMPRAS (%)" macroKey="vat_purchases_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="IVA VENDAS (%)" macroKey="vat_sales_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="IMP. RENDA (%)" macroKey="tax_rate_ir" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="MULTA ATRASO (%)" macroKey="late_penalty_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                           <CompactMatrixRow periods={totalPeriods} label="DÓLAR (USD)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} isExchange />
                           <CompactMatrixRow periods={totalPeriods} label="EURO (EUR)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} isExchange />
                           
                           {/* Toggles de Governança */}
                           <tr className="hover:bg-white/[0.03] transition-colors border-t-2 border-white/10">
                              <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2"><HardDrive size={10}/> LIBERAR COMPRA/VENDA MÁQUINAS</td>
                              {Array.from({ length: totalPeriods }).map((_, i) => (
                                 <td key={i} className="p-2 border-r border-white/5 text-center">
                                    <button 
                                      onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale))}
                                      className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${ (roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-rose-600/10 border-rose-500/30 text-rose-500 opacity-40'}`}
                                    >
                                       {(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'SIM' : 'NÃO'}
                                    </button>
                                 </td>
                              ))}
                           </tr>
                           <tr className="hover:bg-white/[0.03] transition-colors">
                              <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-blue-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2"><ClipboardList size={10}/> APRESENTAR BUSINESS PLAN</td>
                              {Array.from({ length: totalPeriods }).map((_, i) => (
                                 <td key={i} className="p-2 border-r border-white/5 text-center">
                                    <button 
                                      onClick={() => updateRoundMacro(i, 'require_business_plan', !(roundRules[i]?.require_business_plan ?? DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan))}
                                      className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${ (roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-700 opacity-40'}`}
                                    >
                                       {(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'SIM' : 'NÃO'}
                                    </button>
                                 </td>
                              ))}
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 6 && (
             <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <WizardStepTitle icon={<Calculator size={48}/>} title="Baselines Contábeis" desc="Estrutura de contas do Round Zero." />
                <FinancialStructureEditor 
                   initialBalance={financials.balance_sheet} 
                   initialDRE={financials.dre} 
                   initialCashFlow={financials.cash_flow} 
                   onChange={(u) => setFinancials(u as any)}
                   currency={formData.currency}
                />
             </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 text-center py-20">
               <div className="w-40 h-40 bg-orange-600 rounded-[4rem] flex items-center justify-center mx-auto shadow-[0_20px_80px_rgba(249,115,22,0.4)] animate-wow"><CheckCircle2 size={80} className="text-white" /></div>
               <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">Protocolo Pronto</h2>
               <p className="text-slate-500 text-2xl font-medium max-w-2xl mx-auto italic">Tudo pronto para inicializar o cluster de simulação em {formData.currency}.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="floating-nav-btn left-10"><ChevronLeft size={32} /></button>
      {step === stepsCount ? (
        <button onClick={handleLaunch} disabled={isSubmitting} className="floating-nav-btn-primary">
          {isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Lançando...</> : 'LANÇAR ARENA MASTER'}
        </button>
      ) : (
        <button onClick={() => setStep(s => s + 1)} className="floating-nav-btn right-10"><ChevronRight size={32} /></button>
      )}
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-10 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border border-orange-500/30 rounded-[2.5rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div>
        <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder, isCurrency, currency }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <input type={type} value={val} step="0.01" onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-inner" placeholder={placeholder} />
        {isCurrency && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-[12px] font-black text-white uppercase outline-none focus:border-orange-600 transition-all cursor-pointer shadow-inner appearance-none">
       {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange, readOnly }: any) => (
   <tr className="hover:bg-white/[0.04] transition-colors group border-b border-white/5">
      <td className="p-4 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 min-w-[280px]">
         <div className="flex items-center gap-3">
            {/* Fix: Changed Settings to Settings2 to match the imported name from lucide-react */}
            <div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings2 size={10}/>}</div>
            <span className="text-[10px] font-black text-slate-300 uppercase italic truncate">{label}</span>
         </div>
      </td>
      {Array.from({ length: periods }).map((_, i) => {
         const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ?? 0);
         return (
            <td key={i} className={`p-2 border-r border-white/5 ${i === 0 ? 'bg-orange-600/5' : ''}`}>
              <input 
                type="number" 
                step={isExchange ? "0.0001" : "0.1"} 
                value={val} 
                readOnly={readOnly}
                onChange={e => !readOnly && update(i, macroKey, parseFloat(e.target.value))} 
                className={`w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-3 text-center text-xs font-black outline-none transition-all ${readOnly ? 'cursor-not-allowed opacity-60 text-slate-400' : 'focus:border-orange-500 text-white'}`} 
              />
            </td>
         );
      })}
   </tr>
);

export default ChampionshipWizard;
