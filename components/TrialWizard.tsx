
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, Loader2, Info, 
  CheckCircle2, Factory, Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes, TrendingUp, Percent, ChevronLeft, ChevronRight,
  PieChart, BarChart, Activity, Flame, Package, Award, MapPin, Gauge, BarChart3,
  Scale, Truck, UserPlus, UserMinus, Hammer, ShoppingCart, Briefcase, Tractor,
  Coins, ClipboardList, HardDrive, ShieldAlert
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, RegionConfig, TransparencyLevel, GazetaMode } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const TrialWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 1,
    botsCount: 2,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12, 
    roundTime: 1, 
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType,
    transparency: 'medium' as TransparencyLevel,
    gazetaMode: 'anonymous' as GazetaMode,
    dividend_percent: 25.0,
    branch: 'industrial' as Branch
  });

  const [marketIndicators, setMarketIndicators] = useState<MacroIndicators>({
    ...DEFAULT_MACRO,
    ...DEFAULT_INDUSTRIAL_CHRONOGRAM[0] as MacroIndicators
  });

  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>(DEFAULT_INDUSTRIAL_CHRONOGRAM);
  const [teamNames, setTeamNames] = useState<string[]>(['EQUIPE ALPHA']);
  const [regionConfigs, setRegionConfigs] = useState<RegionConfig[]>([]);

  useEffect(() => {
    setTeamNames(prev => {
      const next = [...prev];
      if (next.length < formData.humanTeamsCount) {
        for (let i = next.length; i < formData.humanTeamsCount; i++) {
          next.push(`EQUIPE TRIAL 0${i + 1}`);
        }
      }
      return next.slice(0, formData.humanTeamsCount);
    });
  }, [formData.humanTeamsCount]);

  useEffect(() => {
    if (regionConfigs.length === 0) {
      setRegionConfigs([
        { id: 1, name: 'BRASIL (LOCAL)', currency: 'BRL', demand_weight: 40 },
        { id: 2, name: 'EUA (EXPORT)', currency: 'USD', demand_weight: 20 },
        { id: 3, name: 'EUROPA (EXPORT)', currency: 'EUR', demand_weight: 20 },
        { id: 4, name: 'CHINA (EXPORT)', currency: 'CNY', demand_weight: 20 },
      ]);
    }
  }, []);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }>(INITIAL_FINANCIAL_TREE as any);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const teamsToCreate = [
        ...teamNames.map(n => ({ name: n, is_bot: false })),
        ...Array.from({ length: formData.botsCount }, (_, i) => ({ name: `SYNTH NODE 0${i+1}`, is_bot: true }))
      ];
      await createChampionshipWithTeams({
        ...formData,
        region_names: regionConfigs.map(r => r.name), 
        region_configs: regionConfigs, 
        initial_financials: financials,
        is_trial: true, 
        market_indicators: { ...marketIndicators, dividend_percent: formData.dividend_percent, region_configs: regionConfigs },
        round_rules: roundRules, 
      }, teamsToCreate, true);
      onComplete();
    } catch (e: any) { alert(`FALHA NA ARENA: ${e.message}`); } finally { setIsSubmitting(false); }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({ ...prev, [round]: { ...(prev[round] || {}), [key]: val } }));
  };

  const stepsCount = 7;
  const totalPeriods = formData.totalRounds + 1;
  const totalAssets = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalEquity = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 7252171.74;

  return (
    <div className="wizard-shell bg-slate-950/95 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
      <EmpireParticles />
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl"><Rocket size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Sandbox Trial Setup</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Nova Arena • Nodo {formData.currency}</p>
           </div>
        </div>
        <div className="flex gap-4">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div ref={scrollRef} className="wizard-content custom-scrollbar">
        <div className="max-w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
                 <WizardStepTitle icon={<Globe size={32}/>} title="Identidade Sandbox" desc="Defina as configurações globais da arena trial." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><WizardField label="NOME DO TORNEIO" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TORNEIO TRIAL ALPHA" /></div>
                    <WizardSelect label="MOEDA BASE" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
                    <WizardField label="ROUNDS" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: parseInt(v)})} />
                    <WizardField label="DIVIDENDOS (%)" type="number" val={formData.dividend_percent} onChange={(v:any)=>setFormData({...formData, dividend_percent: parseFloat(v)})} />
                    <WizardSelect label="GOVERNANÇA" val={formData.transparency} onChange={(v:any)=>setFormData({...formData, transparency: v})} options={[{v:'low',l:'BAIXA'},{v:'medium',l:'MÉDIA'},{v:'high',l:'ALTA'}]} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
               <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <WizardStepTitle icon={<Users size={32}/>} title="Unidades Strategos" desc="Configuração de equipes e bots de IA." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <WizardField label="EQUIPES HUMANAS" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: parseInt(v)})} />
                     <WizardField label="BOTS ORACLE" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
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

            {step === 3 && (
               <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <WizardStepTitle icon={<MapPin size={32}/>} title="Nodos Regionais" desc="Mapeie os mercados locais de demanda." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {regionConfigs.map((r, i) => (
                        <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] space-y-6 group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Nomenclatura do Nodo</label>
                              <input value={r.name} onChange={e => { const next = [...regionConfigs]; next[i].name = e.target.value; setRegionConfigs(next); }} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-black uppercase italic outline-none focus:border-orange-500" />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Moeda</label>
                                 <select value={r.currency} onChange={e => { const next = [...regionConfigs]; next[i].currency = e.target.value as CurrencyType; setRegionConfigs(next); }} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-[10px] font-black text-white uppercase outline-none">
                                    <option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="BTC">BTC</option>
                                 </select>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Peso Demanda (%)</label>
                                 <input type="number" value={r.demand_weight} onChange={e => { const next = [...regionConfigs]; next[i].demand_weight = parseInt(e.target.value) || 0; setRegionConfigs(next); }} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-center text-lg font-mono font-black text-orange-500 outline-none" />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                 <WizardStepTitle icon={<Settings size={32}/>} title="Custos Base" desc="Ajuste os preços base de insumos e ativos." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase italic border-b border-white/5 pb-4">Insumos ({getCurrencySymbol(formData.currency)})</h4>
                       <WizardField label="MP-A Base" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} isCurrency currency={formData.currency} />
                       <WizardField label="MP-B Base" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} isCurrency currency={formData.currency} />
                    </div>
                    <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-blue-500 uppercase italic border-b border-white/5 pb-4">CAPEX Base ({getCurrencySymbol(formData.currency)})</h4>
                       <WizardField label="Máquina Alfa" type="number" val={marketIndicators.machinery_values.alfa} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: parseFloat(v)}})} isCurrency currency={formData.currency} />
                       <WizardField label="Máquina Beta" type="number" val={marketIndicators.machinery_values.beta} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: parseFloat(v)}})} isCurrency currency={formData.currency} />
                    </div>
                    <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-emerald-500 uppercase italic border-b border-white/5 pb-4">Metas Oracle ({getCurrencySymbol(formData.currency)})</h4>
                       <WizardField label="Prêmio Lucro" type="number" val={marketIndicators.award_values.profit_precision} onChange={(v:any)=>setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, profit_precision: parseFloat(v)}})} isCurrency currency={formData.currency} />
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                 <WizardStepTitle icon={<BarChart3 size={32}/>} title="Matriz Econômica" desc="Chronogram Master v18.0 Oracle (P01-P12)." />
                 <div className="rounded-[3rem] bg-slate-950/90 border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden h-[620px] flex flex-col relative group">
                    <div className="overflow-auto custom-scrollbar flex-1 relative">
                       <table className="w-full text-left border-separate border-spacing-0">
                          <thead className="sticky top-0 z-[100] bg-slate-900 shadow-xl">
                             <tr>
                                <th className="p-4 bg-slate-900 border-b-2 border-r-2 border-white/10 w-[280px] min-w-[280px]">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Indicadores e Ajustes</span>
                                </th>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <th key={i} className={`p-4 bg-slate-900 border-b-2 border-r border-white/5 text-center min-w-[95px] ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                      <span className={`text-[12px] font-black uppercase tracking-widest ${i === 0 ? 'text-white' : 'text-orange-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                                   </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                             <CompactMatrixRow periods={totalPeriods} label="ICE CRESC. ECONÔMICO (%)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="VARIAÇÕES DE DEMANDA (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INFLAÇÃO (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INADIMPLÊNCIA (%)" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS BANCÁRIOS + TR (%)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS DE FORNECEDORES (%)" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Truck size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="RENDIMENTO APLICAÇÃO (%)" macroKey="investment_return_rate" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE COMPRAS (%)" macroKey="vat_purchases_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE VENDAS (%)" macroKey="vat_sales_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />							 
                             <CompactMatrixRow periods={totalPeriods} label="IMPOSTO DE RENDA (%)" macroKey="tax_rate_ir" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="MULTA POR ATRASOS (%)" macroKey="late_penalty_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="DESÁGIO VENDA MÁQUINAS (%)" macroKey="machine_sale_discount" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÁGIO COMPRAS ESPECIAIS (%)" macroKey="special_purchase_premium" rules={roundRules} update={updateRoundMacro} icon={<Package size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÁGIO EMPRÉSTIMO COMPULSÓRIO (%)" macroKey="compulsory_loan_agio" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ENCARGOS SOCIAIS (%)" macroKey="social_charges" rules={roundRules} update={updateRoundMacro} icon={<Users size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="MATÉRIAS-PRIMAS (%)" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA ALFA (%)" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA BETA (%)" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA GAMA (%)" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="CAMPANHAS MARKETING (%)" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="DISTRIBUIÇÃO DE PRODUTOS (%)" macroKey="distribution_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="GASTOS COM ESTOCAGEM (%)" macroKey="storage_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORTAÇÃO EUA (%)" macroKey="export_tariff_usa" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORTAÇÃO EURO (%)" macroKey="export_tariff_euro" rules={roundRules} update={updateRoundMacro} />							 
                             <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORT CHINA" macroKey="export_tariff_china" rules={roundRules} update={updateRoundMacro} icon={<Globe size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORT BTC" macroKey="export_tariff_btc" rules={roundRules} update={updateRoundMacro} icon={<Coins size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: DÓLAR (USD)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} isExchange />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: EURO (EUR)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} isExchange />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: YUAN (CNY)" macroKey="CNY" rules={roundRules} update={updateRoundMacro} icon={<Globe size={10}/>} isExchange />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: BITCOIN (BTC)" macroKey="BTC" rules={roundRules} update={updateRoundMacro} icon={<Coins size={10}/>} isExchange />
                             
                             <tr className="hover:bg-white/[0.03] transition-colors">
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
                    <motion.div animate={{ left: ['-1%', '101%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-px bg-orange-500/20 shadow-[0_0_15px_#f97316] z-[110] pointer-events-none" />
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="Oracle Baselines" desc="Dados contábeis iniciais do Round Zero." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <SummaryCard label="ATIVO TOTAL" val={totalAssets} currency={formData.currency} icon={<PieChart size={20}/>} color="orange" />
                    <SummaryCard label="PATRIMÔNIO LÍQUIDO" val={totalEquity} currency={formData.currency} icon={<BarChart size={20}/>} color="blue" />
                 </div>
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
                  <CheckCircle2 size={120} className="text-emerald-500 mx-auto animate-pulse" />
                  <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">Arena Trial Pronta</h2>
                  <p className="text-slate-500 text-2xl font-medium max-w-2xl mx-auto italic">Protocolo Oracle v18.0 Gold sincronizado com o cluster temporário.</p>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="floating-nav-btn left-10"><ChevronLeft size={15} /></button>
      {step === stepsCount ? (
        <button onClick={handleLaunch} disabled={isSubmitting} className="floating-nav-btn-primary">
          {isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Sincronizando...</> : 'LANÇAR SANDBOX'}
        </button>
      ) : (
        <button onClick={() => setStep(s => s + 1)} className="floating-nav-btn right-10"><ChevronRight size={15} /></button>
      )}
    </div>
  );
};

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
     <div className={`p-4 rounded-2xl ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : 'bg-blue-600/20 text-blue-500'}`}>{icon}</div>
     <div>
       <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
       <span className="text-3xl font-black text-white font-mono italic">{formatCurrency(val, currency)}</span>
     </div>
  </div>
);

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange, readOnly }: any) => (
   <tr className="hover:bg-white/[0.04] transition-colors group">
      <td className="p-3 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors w-[280px] min-w-[280px]"><div className="flex items-center gap-3"><div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings size={10}/>}</div><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate">{label}</span></div></td>
      {Array.from({ length: periods }).map((_, i) => {
         const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ?? 0);
         return (
            <td key={i} className={`p-1 border-r border-white/5 ${i === 0 ? 'bg-orange-600/5' : ''}`}>
              <input 
                type="number" 
                step={isExchange ? "0.000001" : "0.1"} 
                value={val} 
                readOnly={readOnly}
                onChange={e => !readOnly && update(i, macroKey, parseFloat(e.target.value))} 
                className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black outline-none transition-all shadow-inner ${readOnly ? 'cursor-not-allowed opacity-60 text-slate-400' : 'focus:border-orange-500 text-white'}`} 
              />
            </td>
         );
      })}
   </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-8">
     <div className="p-6 bg-slate-900 border border-orange-500/30 rounded-[2.5rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div><h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3><p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">{desc}</p></div>
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

export default TrialWizard;
