
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ArrowRight, ArrowLeft, ShieldCheck, Activity, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  TrendingUp, Landmark, Cloud, HardDrive, AlertCircle, 
  ShieldAlert, Gavel, Trash2, ShoppingCart, Info, Award,
  Zap, HelpCircle, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig, MachineModel } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const STEPS = [
  { id: 'legal', label: 'Legal', icon: Gavel },
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'production', label: 'Operações', icon: Factory },
  { id: 'hr', label: 'Talentos', icon: Users2 },
  { id: 'assets', label: 'Ativos', icon: Cpu },
  { id: 'finance', label: 'Finanças', icon: Landmark },
  { id: 'review', label: 'Sincronizar', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 1, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanType: 1, application: 0 },
    estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          for (let i = 1; i <= (found.regions_count || 9); i++) {
            initialRegions[i] = { price: 372, term: 1, marketing: 0 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      }
    };
    fetchContext();
  }, [champId]);

  const activeTeamName = useMemo(() => {
    return activeArena?.teams?.find(t => t.id === teamId)?.name || 'ALPHA';
  }, [activeArena, teamId]);

  // CÁLCULO DE PREÇOS ATUALIZADOS (REAJUSTE ACUMULADO)
  const machinePrices = useMemo(() => {
    if (!activeArena) return { alfa: 0, beta: 0, gama: 0, desagio: 0 };
    const macro = activeArena.market_indicators;
    
    const getAdjusted = (model: MachineModel, base: number) => {
      let adj = 1.0;
      // Simula reajuste acumulado até o round atual
      const rate = macro[`machine_${model}_price_adjust`] || 0;
      for (let i = 0; i < round; i++) adj *= (1 + rate / 100);
      return base * adj;
    };

    return {
      alfa: getAdjusted('alfa', macro.machinery_values.alfa),
      beta: getAdjusted('beta', macro.machinery_values.beta),
      gama: getAdjusted('gama', macro.machinery_values.gama),
      desagio: macro.machine_sale_discount || 0
    };
  }, [activeArena, round]);

  const projections: ProjectionResult | null = useMemo(() => {
    if (!activeArena) return null;
    const eco = (activeArena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }) as EcosystemConfig;
    return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators);
  }, [decisions, activeArena]);

  const rating = projections?.health?.rating || 'AAA';

  const updateDecision = (path: string, val: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleTransmit = async () => {
    setIsSaving(true);
    try {
      const result = await saveDecisions(teamId!, champId!, round, decisions);
      if (result.success) alert("TRANSMISSÃO CONCLUÍDA: Protocolo selado.");
    } catch (e: any) { alert(`ERRO: ${e.message}`); }
    setIsSaving(false);
  };

  if (!teamId || !champId) return <div className="h-full flex items-center justify-center text-slate-500 font-black uppercase text-xs">Handshake...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-[2rem] border border-white/5 overflow-hidden">
      
      {/* 1. SLIM STATUS BAR */}
      <div className="bg-slate-950/60 px-6 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
         <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${decisions.judicial_recovery ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Equipe: <span className="text-white">{activeTeamName}</span></span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-1 rounded-full border border-white/10">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Projection:</span>
               <span className={`text-[10px] font-black ${rating === 'D' ? 'text-rose-500' : 'text-orange-500'}`}>{rating}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Ciclo 0{round}</span>
         </div>
      </div>

      {/* 2. COMPACT STEP NAV */}
      <nav className="flex p-1 gap-1 bg-slate-900/40 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
         {STEPS.map((s, idx) => (
           <button 
            key={s.id} 
            onClick={() => setActiveStep(idx)} 
            className={`flex-1 min-w-[90px] py-3 px-2 rounded-xl transition-all flex flex-col items-center gap-1 ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
           >
              <s.icon size={14} />
              <span className="text-[8px] font-black uppercase tracking-tighter text-center whitespace-nowrap">{s.label}</span>
           </button>
         ))}
      </nav>

      {/* 3. OPTIMIZED CONTENT AREA */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/20">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
               
               {activeStep === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
                     <div className={`p-6 rounded-[2rem] border-2 shadow-2xl transition-all ${decisions.judicial_recovery ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}><Gavel size={40} /></div>
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Protocolo de Recuperação</h2>
                        <p className="text-slate-400 text-sm italic">"O status de Recuperação Judicial (RJ) preserva ativos mas impede novos empréstimos bancários."</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`flex-1 px-8 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>Operação Padrão</button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`flex-1 px-8 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${decisions.judicial_recovery ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>Solicitar RJ</button>
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="space-y-8 h-full flex flex-col">
                     <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                        {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                           <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all whitespace-nowrap border ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-900 text-slate-500 border-white/5'}`}>R{i+1}</button>
                        ))}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputCard label="Preço Unitário ($)" val={decisions.regions[activeRegion]?.price || 372} onChange={(v: number) => updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={16}/>} />
                        <SelectCard 
                           label="Condição Prazo" 
                           val={decisions.regions[activeRegion]?.term || 1} 
                           onChange={(v: number) => updateDecision(`regions.${activeRegion}.term`, v)} 
                           options={[
                              {v:0,l:'À VISTA (MESMO PERÍODO)'},
                              {v:1,l:'50/50 (VISTA + P1 + JUROS)'},
                              {v:2,l:'33/33/33 (VISTA + P1 + P2 + JUROS)'}
                           ]} 
                           icon={<Landmark size={16} />} 
                        />
                        <InputCard label="Promoção Regional" desc="(0 a 9)" val={decisions.regions[activeRegion]?.marketing || 0} onChange={(v: number) => updateDecision(`regions.${activeRegion}.marketing`, v)} icon={<Sparkles size={16}/>} />
                     </div>
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputCard label="Matéria-Prima A (QTDE)" val={decisions.production.purchaseMPA} onChange={(v: number) => updateDecision('production.purchaseMPA', v)} icon={<Package size={16}/>} />
                     <InputCard label="Matéria-Prima B (QTDE)" val={decisions.production.purchaseMPB} onChange={(v: number) => updateDecision('production.purchaseMPB', v)} icon={<Package size={16}/>} />
                     <SelectCard 
                        label="Tipo Pagamento Fornecedor" 
                        val={decisions.production.paymentType} 
                        onChange={(v: number) => updateDecision('production.paymentType', v)} 
                        options={[
                           {v:0,l:'À VISTA (MESMO PERÍODO)'},
                           {v:1,l:'50/50 (VISTA + P1 + JUROS)'},
                           {v:2,l:'33/33/33 (VISTA + P1 + P2 + JUROS)'}
                        ]} 
                        icon={<DollarSign size={16}/>} 
                     />
                     <InputCard label="Nível Utilização Fábrica %" val={decisions.production.activityLevel} onChange={(v: number) => updateDecision('production.activityLevel', v)} icon={<Activity size={16}/>} />
                     <InputCard label="Capacidade Extra %" val={decisions.production.extraProductionPercent} onChange={(v: number) => updateDecision('production.extraProductionPercent', v)} icon={<Zap size={16}/>} />
                     <InputCard label="Verba P&D e Qualidade" val={decisions.production.rd_investment} onChange={(v: number) => updateDecision('production.rd_investment', v)} icon={<Cpu size={16}/>} />
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputCard label="Novas Admissões" val={decisions.hr.hired} onChange={(v: number) => updateDecision('hr.hired', v)} icon={<Users2 size={16}/>} />
                     <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v: number) => updateDecision('hr.fired', v)} icon={<Users2 size={16}/>} />
                     <InputCard label="Salário Base Equipe ($)" val={decisions.hr.salary} onChange={(v: number) => updateDecision('hr.salary', v)} icon={<DollarSign size={16}/>} />
                     <InputCard label="Invest. Treinamento %" val={decisions.hr.trainingPercent} onChange={(v: number) => updateDecision('hr.trainingPercent', v)} icon={<Target size={16}/>} />
                     <InputCard label="PLR (Lucros) %" val={decisions.hr.participationPercent} onChange={(v: number) => updateDecision('hr.participationPercent', v)} icon={<Award size={16}/>} />
                     <InputCard label="Encargos Diversos ($)" val={decisions.hr.misc} onChange={(v: number) => updateDecision('hr.misc', v)} icon={<Info size={16}/>} />
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="space-y-6">
                     <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex gap-4 items-center">
                        <Info size={24} className="text-blue-400 shrink-0" />
                        <p className="text-[9px] font-medium text-blue-100 italic leading-relaxed">
                           "Protocolo BDI: 60% Financiado / 40% À Vista. Carência de 4 períodos (apenas juros TR). Amortização em 4x a partir do 5º período. Máquinas iniciam produção no ato, depreciação inicia no próximo ciclo."
                        </p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                           <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><ShoppingCart size={14}/> Investimento CapEx (Novo)</h4>
                           <PriceInput label="Compra ALFA" val={decisions.machinery.buy.alfa} price={machinePrices.alfa} onChange={(v: number) => updateDecision('machinery.buy.alfa', v)} />
                           <PriceInput label="Compra BETA" val={decisions.machinery.buy.beta} price={machinePrices.beta} onChange={(v: number) => updateDecision('machinery.buy.beta', v)} />
                           <PriceInput label="Compra GAMA" val={decisions.machinery.buy.gama} price={machinePrices.gama} onChange={(v: number) => updateDecision('machinery.buy.gama', v)} />
                        </div>
                        <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                           <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2"><Trash2 size={14}/> Desinvestimento (Usado)</h4>
                           <PriceInput label="Venda ALFA" val={decisions.machinery.sell.alfa} price={machinePrices.alfa * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.alfa', v)} />
                           <PriceInput label="Venda BETA" val={decisions.machinery.sell.beta} price={machinePrices.beta * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.beta', v)} />
                           <PriceInput label="Venda GAMA" val={decisions.machinery.sell.gama} price={machinePrices.gama * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.gama', v)} />
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="space-y-8">
                     <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex gap-4 items-center">
                        <HelpCircle size={24} className="text-orange-400 shrink-0" />
                        <p className="text-[9px] font-medium text-orange-100 italic leading-relaxed">
                           "Protocolo Bancário: Empréstimos possuem prazo (0-1-2). Juros TR acoplados mesmo no prazo 0. A mutação do Balanço converte a próxima parcela a vencer em Curto Prazo automaticamente."
                        </p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputCard label="Empréstimo Requisitado ($)" val={decisions.finance.loanRequest} onChange={(v: number) => updateDecision('finance.loanRequest', v)} icon={<Landmark size={16}/>} />
                        <SelectCard label="Condição Prazo" val={decisions.finance.loanType} onChange={(v: number) => updateDecision('finance.loanType', v)} options={[{v:1,l:'À VISTA (PERÍODO ATUAL)'},{v:2,l:'CURTO (DIVIDIDO P1)'},{v:3,l:'MÉDIO (P1 + P2)'}]} icon={<ShieldAlert size={16}/>} />
                        <InputCard label="Aplicação Liquidez ($)" val={decisions.finance.application} onChange={(v: number) => updateDecision('finance.application', v)} icon={<TrendingUp size={16}/>} />
                     </div>
                  </div>
               )}

               {activeStep === 6 && (
                  <div className="space-y-8 h-full flex flex-col justify-center">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputCard label="Faturamento Estimado" val={decisions.estimates.forecasted_revenue} onChange={(v: number) => updateDecision('estimates.forecasted_revenue', v)} icon={<Activity size={16}/>} />
                        <InputCard label="Custo Unitário Alvo" val={decisions.estimates.forecasted_unit_cost} onChange={(v: number) => updateDecision('estimates.forecasted_unit_cost', v)} icon={<Zap size={16}/>} />
                        <InputCard label="Lucro Alvo Estimado" val={decisions.estimates.forecasted_net_profit} onChange={(v: number) => updateDecision('estimates.forecasted_net_profit', v)} icon={<Target size={16}/>} />
                     </div>
                     <div className="p-8 bg-orange-600/5 rounded-3xl border border-orange-500/20 text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto"><ShieldCheck size={24}/></div>
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Sincronização Pronta</h4>
                        <p className="text-slate-500 font-bold uppercase text-[8px] tracking-[0.2em]">Todas as telemetrias da Equipe foram auditadas para o turnover do Ciclo.</p>
                     </div>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>
      </div>

      {/* 4. SLIM FOOTER DOCK */}
      <footer className="shrink-0 bg-slate-950 border-t border-white/10 px-8 py-4 flex justify-between items-center shadow-2xl">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className={`text-slate-500 hover:text-white transition-all flex items-center gap-2 ${activeStep === 0 ? 'opacity-0' : ''}`}>
            <ArrowLeft size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Voltar</span>
         </button>
         
         <div className="flex items-center gap-8">
            <div className="hidden sm:flex flex-col items-end opacity-40">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocolo Oracle Gold</span>
               <span className="text-[9px] font-black text-orange-500 uppercase">Fase {activeStep + 1} / {STEPS.length}</span>
            </div>
            {activeStep === STEPS.length - 1 ? (
              <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="px-10 py-4 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-white hover:text-orange-950 transition-all flex items-center gap-3 active:scale-95">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Selar Ciclo
              </button>
            ) : (
              <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="px-10 py-4 bg-white text-slate-950 hover:bg-orange-600 hover:text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 active:scale-95 group">
                Avançar <ArrowRight size={14} />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const InputCard = ({ label, desc, val, icon, onChange, placeholder }: any) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 group hover:bg-white/[0.06] transition-all">
     <div className="flex items-center gap-2">
        <div className="text-slate-500 group-hover:text-orange-500 transition-colors">{icon || <Info size={14}/>}</div>
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
     </div>
     <input 
        type="number" 
        value={val} 
        placeholder={placeholder} 
        onChange={e => onChange?.(Number(e.target.value))} 
        className="w-full bg-slate-950/60 border-none rounded-xl px-4 py-3 text-white font-mono font-black text-xl outline-none focus:ring-1 focus:ring-orange-600 transition-all shadow-inner" 
     />
     {desc && <span className="text-[7px] font-bold text-slate-600 uppercase italic ml-1">{desc}</span>}
  </div>
);

const PriceInput = ({ label, val, price, isSell, desagio, onChange }: any) => {
  const upfront = isSell ? price : price * 0.4;
  const financed = isSell ? 0 : price * 0.6;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:bg-white/[0.06] transition-all">
       <div className="flex justify-between items-start">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
          <div className="text-right">
             <span className="block text-[7px] font-bold text-slate-400 uppercase italic">Preço Un. {isSell ? 'c/ Deságio' : 'Ajustado'}</span>
             <span className="text-xs font-mono font-black text-white">$ {price.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
       </div>
       <div className="flex items-center gap-3">
          <input 
             type="number" 
             value={val} 
             onChange={e => onChange?.(Number(e.target.value))} 
             className="w-20 bg-slate-950/60 border-none rounded-lg px-2 py-2 text-white font-mono font-black text-lg outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-inner" 
          />
          <div className="flex-1 space-y-1">
             <div className="flex justify-between text-[7px] font-black uppercase">
                <span className="text-slate-500 flex items-center gap-1"><ArrowUpCircle size={8}/> {isSell ? 'Crédito Caixa' : 'Entrada (40%)'}</span>
                <span className="text-emerald-500">$ {(upfront * val).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
             </div>
             {!isSell && (
               <div className="flex justify-between text-[7px] font-black uppercase">
                  <span className="text-slate-500 flex items-center gap-1"><ArrowDownCircle size={8}/> BDI Fin. (60%)</span>
                  <span className="text-orange-500">$ {(financed * val).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
               </div>
             )}
             {isSell && (
                <div className="flex justify-between text-[7px] font-black uppercase">
                   <span className="text-rose-500">Deságio: {desagio}%</span>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const SelectCard = ({ label, val, options, icon, onChange }: any) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 group hover:bg-white/[0.06] transition-all">
     <div className="flex items-center gap-2">
        <div className="text-slate-500 group-hover:text-blue-500 transition-colors">{icon}</div>
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
     </div>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => onChange?.(Number(e.target.value))} 
          className="w-full bg-slate-950/60 border-none rounded-xl px-4 py-3 text-white font-black text-[10px] uppercase outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-inner appearance-none cursor-pointer"
        >
           {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 rotate-90" />
     </div>
  </div>
);

export default DecisionForm;
