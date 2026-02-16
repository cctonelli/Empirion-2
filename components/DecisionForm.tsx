
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, Activity, Receipt, Coins, Trash2, Box, Award, 
  PlusCircle, MinusCircle, AlertCircle, RefreshCw, UserPlus, UserMinus, Globe,
  Rocket, BarChart3, Scale, Eye, Info
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { DecisionData, Branch, Championship, Team, CurrencyType } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'production', label: '3. OPERAÇÕES', icon: Factory },
  { id: 'hr', label: '4. TALENTOS', icon: Users2 },
  { id: 'assets', label: '5. ATIVOS', icon: Cpu },
  { id: 'finance', label: '6. FINANÇAS', icon: Landmark },
  { id: 'goals', label: '7. METAS', icon: Target },
  { id: 'review', label: '8. FINALIZAR', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 0, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (!champId || !teamId) return;
      setIsLoadingDraft(true);
      try {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (!found) return;
        setActiveArena(found);

        const table = found.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table).select('data').eq('championship_id', champId).eq('team_id', teamId).eq('round', round).maybeSingle();

        const initialRegions: any = {};
        for (let i = 1; i <= (found.regions_count || 1); i++) {
          initialRegions[i] = { price: 0, term: 0, marketing: 0 };
        }

        if (draft?.data) {
          setDecisions({ 
             ...draft.data, 
             regions: { ...initialRegions, ...(draft.data.regions || {}) },
             machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 }, ...(draft.data.machinery || {}) }
          });
        } else {
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      } catch (err) { console.error("Hydration Error:", err); } 
      finally { setIsLoadingDraft(false); }
    };
    initializeForm();
  }, [champId, teamId, round]);

  const currency = activeArena?.currency || 'BRL';

  const updateDecision = (path: string, val: any) => {
    if (isReadOnly) return;
    const keys = path.split('.');
    setDecisions(prev => {
      const next = JSON.parse(JSON.stringify(prev)); // Deep copy safely
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions);
      if (res.success) alert("TRANSMISSÃO CONCLUÍDA AO ORÁCULO.");
      else throw new Error(res.error);
    } catch (err: any) { alert(`FALHA NA TRANSMISSÃO: ${err.message}`); } 
    finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 py-20">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Estabelecendo Link Tático...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <nav className="flex p-1.5 gap-1 bg-slate-900 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-xl z-20">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[130px] py-4 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-lg scale-[1.02]' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>
              <s.icon size={16} strokeWidth={2.5} />
              <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-40">
               
               {activeStep === 0 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Gavel />} title="Status Jurídico" desc="Defina o regime legal da operação para o ciclo atual." />
                     <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                        <label className="flex items-center gap-6 cursor-pointer group p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all">
                           <input type="checkbox" checked={decisions.judicial_recovery} onChange={e => updateDecision('judicial_recovery', e.target.checked)} className="w-8 h-8 rounded-xl bg-slate-950 border-white/10 text-orange-600 focus:ring-orange-600" />
                           <div>
                              <span className="text-2xl font-black text-white uppercase italic group-hover:text-orange-500 transition-colors">Solicitar Recuperação Judicial</span>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Status Ativo impede novos investimentos em CAPEX.</p>
                           </div>
                        </label>
                        <div className="p-8 bg-rose-600/10 border border-rose-500/20 rounded-3xl flex gap-6">
                           <ShieldAlert size={32} className="text-rose-500 shrink-0" />
                           <p className="text-xs text-slate-400 italic leading-relaxed font-medium">Atenção: A RJ suspende pagamentos de dívidas de rounds anteriores, mas seu rating é fixado em "D" pela auditoria central.</p>
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="space-y-12">
                     <WizardStepHeader icon={<Megaphone />} title="Estratégia Regional" desc="Mapeamento de demanda por nodo geográfico." />
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                           <div key={id} className="bg-slate-900/40 p-10 rounded-[3.5rem] border border-white/5 space-y-10 hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform"><Globe size={100}/></div>
                              <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                                 <span className="text-sm font-black text-orange-500 uppercase italic">Nodo Regional 0{id}</span>
                                 <span className="text-[10px] font-black text-slate-600">{currency}</span>
                              </div>
                              <div className="space-y-6 relative z-10">
                                 <WizardField label={`Preço Unitário (${getCurrencySymbol(currency)})`} val={reg.price} type="number" onChange={(v:any)=>updateDecision(`regions.${id}.price`, v)} isCurrency currency={currency} />
                                 <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Prazo de Recebimento</label>
                                    <select value={reg.term} onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))} className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600">
                                       <option value={0}>A VISTA</option>
                                       <option value={1}>PARCELADO (50/50)</option>
                                       <option value={2}>LONGO PRAZO (33/33/33)</option>
                                    </select>
                                 </div>
                                 <WizardField label="Verba Marketing (Campanhas)" val={reg.marketing} type="number" onChange={(v:any)=>updateDecision(`regions.${id}.marketing`, v)} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Factory />} title="Operações Industriais" desc="Gestão de estoque e produtividade fabril." />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <InputCard label="COMPRA MP-A (UNID)" val={decisions.production.purchaseMPA} icon={<Package/>} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} />
                        <InputCard label="COMPRA MP-B (UNID)" val={decisions.production.purchaseMPB} icon={<Package/>} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} />
                        <InputCard label="ATIVIDADE FÁBRICA (%)" val={decisions.production.activityLevel} icon={<Activity/>} onChange={(v:any)=>updateDecision('production.activityLevel', v)} />
                        <InputCard label="PESQUISA & DESENVOLV. ($)" val={decisions.production.rd_investment} icon={<Sparkles/>} onChange={(v:any)=>updateDecision('production.rd_investment', v)} isCurrency currency={currency} />
                        <InputCard label="TURNO EXTRA (%)" val={decisions.production.extraProductionPercent} icon={<Zap/>} onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} />
                        <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center space-y-4">
                           <span className="text-[10px] font-black text-slate-500 uppercase italic">Modalidade Pagto</span>
                           <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', parseInt(e.target.value))} className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600 shadow-inner">
                              <option value={0}>A VISTA (SEM JUROS)</option>
                              <option value={1}>30 DIAS (JUROS MP)</option>
                           </select>
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Users2 />} title="Recursos Humanos" desc="Gestão de headcount e remuneração." />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <InputCard label="CONTRATAÇÕES" val={decisions.hr.hired} icon={<UserPlus/>} onChange={(v:any)=>updateDecision('hr.hired', v)} />
                        <InputCard label="DEMISSÕES" val={decisions.hr.fired} icon={<UserMinus/>} onChange={(v:any)=>updateDecision('hr.fired', v)} />
                        <InputCard label={`PISO SALARIAL (${getCurrencySymbol(currency)})`} val={decisions.hr.salary} icon={<DollarSign/>} onChange={(v:any)=>updateDecision('hr.salary', v)} isCurrency currency={currency} />
                        <InputCard label="TREINAMENTO (%)" val={decisions.hr.trainingPercent} icon={<Award/>} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} />
                     </div>
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Cpu />} title="Ativos de Capital" desc="Gestão de expansão ou liquidação de ativos fixos." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><PlusCircle className="text-blue-500"/> Ordem de Compra</h4>
                           <div className="grid grid-cols-3 gap-6">
                              <InputCard label="ALFA" val={decisions.machinery.buy.alfa} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} />
                              <InputCard label="BETA" val={decisions.machinery.buy.beta} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} />
                              <InputCard label="GAMA" val={decisions.machinery.buy.gama} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} />
                           </div>
                        </div>
                        <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><MinusCircle className="text-rose-500"/> Ordem de Venda</h4>
                           <div className="grid grid-cols-3 gap-6">
                              <InputCard label="ALFA" val={decisions.machinery.sell.alfa} onChange={(v:any)=>updateDecision('machinery.sell.alfa', v)} />
                              <InputCard label="BETA" val={decisions.machinery.sell.beta} onChange={(v:any)=>updateDecision('machinery.sell.beta', v)} />
                              <InputCard label="GAMA" val={decisions.machinery.sell.gama} onChange={(v:any)=>updateDecision('machinery.sell.gama', v)} />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Landmark />} title="Mercado Financeiro" desc="Gestão de liquidez e alavancagem." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Coins className="text-orange-500"/> Requisitar Crédito</h4>
                           <InputCard label={`VALOR EMPRÉSTIMO (${getCurrencySymbol(currency)})`} val={decisions.finance.loanRequest} icon={<Landmark/>} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} isCurrency currency={currency} />
                           <WizardField label="Prazo (Meses)" val={decisions.finance.loanTerm} type="number" onChange={(v:any)=>updateDecision('finance.loanTerm', v)} />
                        </div>
                        <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 flex flex-col justify-between">
                           <div>
                              <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><TrendingUp className="text-emerald-500"/> Aplicação Liquidez</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Excesso de caixa gera rendimentos conforme TR.</p>
                           </div>
                           <InputCard label={`APLICAR VALOR (${getCurrencySymbol(currency)})`} val={decisions.finance.application} icon={<Activity/>} onChange={(v:any)=>updateDecision('finance.application', v)} isCurrency currency={currency} />
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 6 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Target />} title="Metas & Auditoria" desc="Defina seus objetivos para o prêmio de precisão Oracle." />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <InputCard label="PREVISÃO CUSTO UNIT." val={decisions.estimates.forecasted_unit_cost} icon={<Box/>} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} isCurrency currency={currency} />
                        <InputCard label="PREVISÃO RECEITA" val={decisions.estimates.forecasted_revenue} icon={<BarChart3/>} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} isCurrency currency={currency} />
                        <InputCard label="PREVISÃO LUCRO LÍQ." val={decisions.estimates.forecasted_net_profit} icon={<Scale/>} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 7 && (
                  <div className="max-w-4xl mx-auto space-y-12 text-center py-10">
                     <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse">
                        <ShieldCheck size={56} />
                     </div>
                     <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Pronto para Sincronizar</h2>
                     <p className="text-slate-400 text-lg font-medium italic">Seus dados foram verificados e estão prontos para transmissão ao motor Oracle v18.0.</p>
                     <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-left space-y-6">
                        <div className="flex items-center gap-4 text-emerald-500">
                           <CheckCircle2 size={24}/>
                           <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Integridade Validado</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed italic">"O envio selará suas decisões para este ciclo. Mudanças posteriores exigirão re-abertura pelo Tutor se o turnover não houver ocorrido."</p>
                     </div>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>

         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8 active:scale-90 shadow-2xl transition-all"><ChevronLeft size={32} strokeWidth={2.5}/></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary shadow-3xl">
              {isSaving ? <Loader2 size={32} className="animate-spin" /> : <Rocket size={32} strokeWidth={2.5} />} TRANSMITIR PROTOCOLO
           </button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8 active:scale-90 shadow-2xl transition-all"><ChevronRight size={32} strokeWidth={2.5}/></button>
         )}
      </div>
    </div>
  );
};

const WizardStepHeader = ({ icon, title, desc }: any) => (
   <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl flex items-center gap-10">
      <div className="p-6 bg-orange-600 rounded-[2rem] text-white shadow-xl">{React.cloneElement(icon, { size: 36, strokeWidth: 2.5 })}</div>
      <div>
         <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
         <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">{desc}</p>
      </div>
   </div>
);

const WizardField = ({ label, val, onChange, type = 'text', isCurrency, currency }: any) => (
  <div className="space-y-4 group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic ml-2">{label}</label>
     <div className="relative">
       <input type={type} value={val} step="0.01" onChange={e => onChange(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/10 rounded-3xl p-8 text-2xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-inner font-mono" />
       {isCurrency && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

const InputCard = ({ label, val, icon, onChange, isCurrency, currency }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[3rem] p-10 flex flex-col gap-6 hover:border-orange-500/30 transition-all group shadow-2xl overflow-hidden relative">
     <div className="flex items-center gap-4 relative z-10">
        <div className="p-4 bg-white/5 rounded-2xl text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-lg">{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-tight">{label}</label>
     </div>
     <div className="relative z-10">
       <input type="number" step={isCurrency ? "0.01" : "1"} value={val} onChange={e => onChange?.(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl px-6 py-6 text-white font-mono font-black text-2xl outline-none focus:border-orange-600 shadow-inner" />
       {isCurrency && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

export default DecisionForm;
