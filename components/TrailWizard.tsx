
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, 
  Loader2, Info, CheckCircle2, Factory, 
  Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes, TrendingUp, Percent,
  ArrowUpCircle, ArrowDownCircle, HardDrive, LayoutGrid,
  Zap, Flame, ShieldAlert, BarChart3
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators } from '../types';

const TrailWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 1,
    botsCount: 2,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12, // Padrão
    roundTime: 24,
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType
  });

  // Cronograma de Índices
  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>(DEFAULT_INDUSTRIAL_CHRONOGRAM);

  // Estados para nomes customizados
  const [teamNames, setTeamNames] = useState<string[]>(['EQUIPE ALPHA']);
  const [regionNames, setRegionNames] = useState<string[]>(['SUDESTE', 'EUROPA', 'NORDESTE', 'SUL']);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  // Sincroniza tamanho dos arrays de nomes ao mudar contagem
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
    setRegionNames(prev => {
      const next = [...prev];
      if (next.length < formData.regionsCount) {
        for (let i = next.length; i < formData.regionsCount; i++) {
          next.push(`REGIÃO 0${i + 1}`);
        }
      }
      return next.slice(0, formData.regionsCount);
    });
  }, [formData.regionsCount]);

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
        name: formData.name || `TRIAL ARENA ${new Date().toLocaleDateString()}`,
        description: "Sandbox de experimentação estratégica Empirion.",
        branch: 'industrial',
        status: 'active',
        current_round: 0,
        total_rounds: formData.totalRounds,
        deadline_value: formData.roundTime,
        deadline_unit: formData.roundUnit,
        regions_count: formData.regionsCount,
        region_names: regionNames,
        initial_financials: financials,
        initial_share_price: formData.initialStockPrice,
        currency: formData.currency,
        sales_mode: formData.marketMode,
        scenario_type: 'simulated' as ScenarioType,
        is_trial: true,
        market_indicators: DEFAULT_MACRO,
        round_rules: roundRules,
        transparency_level: 'medium',
        gazeta_mode: 'anonymous',
        observers: []
      }, teamsToCreate, true);
      
      onComplete();
    } catch (e: any) {
      alert(`FALHA NA INICIALIZAÇÃO DO NODO: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        [key]: val
      }
    }));
  };

  const stepsCount = 6;

  return (
    <div className="relative w-full flex flex-col font-sans overflow-hidden bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
        <div className="max-w-[1600px] mx-auto pb-32">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="IDENTIDADE DA ARENA" desc="CONFIGURAÇÕES GLOBAIS DO AMBIENTE SANDBOX." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <WizardField label="NOME DA INSTÂNCIA TRIAL" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TESTE INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-6">
                       <WizardField label="TOTAL DE CICLOS" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: parseInt(v)})} />
                       <WizardField label="PREÇO AÇÃO P0 ($)" type="number" val={formData.initialStockPrice} onChange={(v:any)=>setFormData({...formData, initialStockPrice: parseFloat(v)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <WizardField label="TEMPO POR RODADA" type="number" val={formData.roundTime} onChange={(v:any)=>setFormData({...formData, roundTime: parseInt(v)})} />
                       <WizardSelect label="UNIDADE TEMPORAL" val={formData.roundUnit} onChange={(v:any)=>setFormData({...formData, roundUnit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                    <WizardSelect label="MOEDA DO NODO" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'}]} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Users size={32}/>} title="EQUIPES E BOTS" desc="DEFINA QUEM PARTICIPARÁ DA COMPETIÇÃO NO CLUSTER." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 bg-white/5 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Dimensionamento</h4>
                       <div className="grid grid-cols-2 gap-6">
                          <WizardField label="Equipes Humanas" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v))})} />
                          <WizardField label="Synthetic Bots (IA)" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-3"><CheckCircle2 size={16}/> Identificadores das Equipes</h4>
                       <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          {teamNames.map((n, i) => (
                             <input key={i} value={n} onChange={e => { const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next); }} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all shadow-inner" placeholder={`Nome da Equipe ${i+1}`} />
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="GEOPOLÍTICA REGIONAL" desc="CONFIGURE AS ÁREAS DE DISPUTA COMERCIAL." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-slate-900/60 p-8 rounded-[3.5rem] border border-white/10 space-y-10 shadow-2xl">
                       <WizardField label="Quantidade de Regiões" type="number" val={formData.regionsCount} onChange={(v:any)=>setFormData({...formData, regionsCount: Math.min(15, Math.max(1, parseInt(v)))})} />
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest italic flex items-center gap-3"><Boxes size={16}/> Nomenclatura dos Nodos</h4>
                       <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {regionNames.map((n, i) => (
                             <input key={i} value={n} onChange={e => { const next = [...regionNames]; next[i] = e.target.value; setRegionNames(next); }} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-[11px] font-black text-white uppercase outline-none focus:border-emerald-500 transition-all" placeholder={`Região ${i+1}`} />
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                 <WizardStepTitle icon={<BarChart3 size={32}/>} title="CRONOGRAMA ESTRATÉGICO" desc="PARAMETRIZE OS ÍNDICES VARIÁVEIS POR PERÍODO (PDF BUILD)." />
                 
                 <div className="matrix-container rounded-3xl bg-slate-950/60 border border-white/10 shadow-2xl overflow-hidden h-[600px] flex flex-col relative">
                    <div className="overflow-auto custom-scrollbar flex-1">
                       <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                             <tr className="z-30">
                                <th className="p-3 sticky left-0 top-0 bg-slate-900 z-40 border-b border-r border-white/10 w-[240px]">
                                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Índice / Período</span>
                                </th>
                                {Array.from({ length: formData.totalRounds }).map((_, i) => (
                                   <th key={i} className="p-3 sticky top-0 bg-slate-900 z-30 border-b border-white/10 text-center w-[100px]">
                                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">P0{i}</span>
                                   </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                             <MatrixRow periods={formData.totalRounds} label="ICE (Cresc. %)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Demanda Mercado (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Inflação (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Inadimplência (%)" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Juros (TR %)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Juros Fornecedores (%)" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Zap size={10}/>} />
                             <MatrixRow periods={formData.totalRounds} label="Juros Vendas (%)" macroKey="sales_interest_rate" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} />
                             
                             <tr className="bg-white/[0.02]">
                                <td className="p-3 sticky left-0 bg-[#0f172a] z-10 font-black text-[8px] text-emerald-400 uppercase tracking-widest border-r border-white/10">Venda Máquinas?</td>
                                {Array.from({ length: formData.totalRounds }).map((_, i) => (
                                   <td key={i} className="p-2 text-center">
                                      <button 
                                        onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? false))}
                                        className={`w-full py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${roundRules[i]?.allow_machine_sale ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-rose-600/10 border-rose-500/30 text-rose-500'}`}
                                      >
                                         {roundRules[i]?.allow_machine_sale ? 'SIM' : 'NÃO'}
                                      </button>
                                   </td>
                                ))}
                             </tr>

                             <MatrixRow periods={formData.totalRounds} label="Reaj. Matérias-Primas (%)" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Máquina ALFA (%)" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Máquina BETA (%)" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Máquina GAMA (%)" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Marketing (%)" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Distribuição (%)" macroKey="distribution_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             <MatrixRow periods={formData.totalRounds} label="Reaj. Estocagem (%)" macroKey="storage_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="ORACLE BASELINE" desc="EDITE OS BALANÇOS E DRES INICIAIS PARA O ROUND ZERO." />
                 <div className="bg-slate-950/60 p-2 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden">
                    <FinancialStructureEditor 
                       initialBalance={financials?.balance_sheet} 
                       initialDRE={financials?.dre} 
                       onChange={setFinancials} 
                    />
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-12">
                 <div className="w-32 h-32 bg-orange-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <ShieldCheck size={64} className="text-white" />
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter">Nodo Pronto</h1>
                    <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">
                       Sua Arena Trial foi orquestrada com parâmetros macro e financeiros auditados. Pronta para inicializar.
                    </p>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <footer className="shrink-0 h-28 bg-slate-950/90 backdrop-blur-3xl border-t border-white/5 px-10 flex items-center justify-between relative z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
         >
           <ArrowLeft size={16} /> Voltar
         </button>
         
         <div className="flex items-center gap-10">
            <div className="hidden md:flex flex-col items-end opacity-40">
               <span className="text-[7px] font-black text-white uppercase tracking-widest">Fase de Orquestração</span>
               <span className="text-[9px] font-black text-orange-500 italic uppercase">{step} de {stepsCount}</span>
            </div>
            <button 
              onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={18}/> Sincronizando...</>
               ) : step === stepsCount ? (
                 'Lançar Arena Trial'
               ) : (
                 <>Próxima Fase <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const MatrixRow = ({ label, macroKey, rules, update, icon, periods }: any) => (
   <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="p-3 sticky left-0 bg-[#020617] z-10 border-r border-white/10 group-hover:bg-slate-900 transition-colors">
         <div className="flex items-center gap-2">
            <div className="text-slate-600 group-hover:text-orange-500 transition-colors">{icon || <Settings size={10}/>}</div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic whitespace-nowrap overflow-hidden truncate">{label}</span>
         </div>
      </td>
      {Array.from({ length: periods }).map((_, i) => (
         <td key={i} className="p-1">
            <input 
               type="number" step="0.1"
               value={rules[i]?.[macroKey] ?? DEFAULT_MACRO[macroKey] ?? 0}
               onChange={e => update(i, macroKey, parseFloat(e.target.value))}
               className="w-full bg-slate-900 border border-white/5 rounded-lg px-2 py-2 text-center text-[10px] font-black text-white outline-none focus:border-orange-500 transition-all shadow-inner"
            />
         </td>
      ))}
   </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-6 border-b border-white/5 pb-8">
     <div className="p-4 bg-white/5 rounded-2xl text-orange-500 shadow-inner flex items-center justify-center border border-white/5">
        {icon}
     </div>
     <div>
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2 text-left group">
     <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input 
        type={type} 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-900 border border-white/10 rounded-xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800 font-mono" 
        placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-2 text-left group">
     <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-6 py-4 text-[9px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none shadow-inner"
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
           <Settings2 size={14} />
        </div>
     </div>
  </div>
);

export default TrailWizard;
