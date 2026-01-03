
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Save, Factory, Users2, ChevronRight,
  Loader2, Megaphone, Zap, Cpu, Boxes, Info, Sparkles, DollarSign,
  TrendingUp, Activity, SlidersHorizontal, MapPin, Package,
  ShoppingCart, Briefcase, PlusCircle, MinusCircle, UserPlus
} from 'lucide-react';
import { saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, ModalityType } from '../types';

const createInitialDecisions = (regionsCount: number): DecisionData => {
  const regions: Record<number, any> = {};
  for (let i = 1; i <= regionsCount; i++) {
    const price = i === 8 ? 344 : i === 9 ? 399 : 372;
    regions[i] = { price: price, term: 1, marketing: 3 };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, others: 0, sales_staff_count: 50 },
    production: { 
      purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, extraProduction: 0, 
      rd_investment: 0, strategy: 'push_mrp', automation_level: 0, batch_size: 1000 
    },
    finance: { 
      loanRequest: 1090000, loanType: 2, application: 0, termSalesInterest: 2.0, 
      buyMachines: { alfa: 0, beta: 0, gama: 0 }, sellMachines: { alfa: 0, beta: 0, gama: 0 } 
    },
  };
};

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; modality?: ModalityType; userName?: string }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial', modality = 'standard', userName = 'Operator'
}) => {
  const [activeSection, setActiveSection] = useState('marketing');
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    const trialFlag = localStorage.getItem('is_trial_session') === 'true';
    setIsTrial(trialFlag);
  }, []);

  const projections = useMemo(() => 
    calculateProjections(decisions, branch as Branch, { modalityType: modality } as any), 
  [decisions, branch, modality]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 px-4">
      <aside className="w-full lg:w-80 flex flex-col gap-3">
        <div className="p-6 bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl mb-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 flex items-center gap-2"><Sparkles size={14}/> Bernard Legacy Engine</h3>
           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Período Ativo</span>
                 <span className="text-xl font-black text-white italic">RODADA 0{round}</span>
              </div>
           </div>
        </div>

        {[
          { id: 'marketing', label: 'Estratégia Regional', icon: Megaphone },
          { id: 'production', label: 'Fábrica & OEE', icon: Factory },
          { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
          { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] border transition-all ${activeSection === s.id ? 'bg-orange-600 border-white shadow-2xl text-white' : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10 hover:text-slate-300'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${activeSection === s.id ? 'bg-white text-orange-600' : 'bg-white/5'}`}><s.icon size={20} /></div>
              <span className={`font-black text-[10px] uppercase tracking-widest`}>{s.label}</span>
            </div>
            <ChevronRight size={14} className={activeSection === s.id ? 'text-white' : 'text-slate-700'} />
          </button>
        ))}

        <div className="mt-6 p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5 shadow-inner space-y-4">
           <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Oráculo de Projeção</h4>
           <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 font-bold uppercase">LUCRO EST.</span><span className={`font-black text-sm ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {projections.netProfit.toLocaleString()}</span></div>
           <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 font-bold uppercase">OEE FABRIL</span><span className="font-black text-sm text-white">{projections.oee.toFixed(1)}%</span></div>
        </div>
      </aside>

      <div className="flex-1 bg-slate-950 p-12 rounded-[4rem] shadow-2xl border border-white/5 flex flex-col relative overflow-hidden">
        <header className="flex justify-between items-center mb-12 pb-8 border-b border-white/5">
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Painel {activeSection.toUpperCase()}</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Bernard Fidelity v5.0 {isTrial && '(SANDBOX)'}</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          {activeSection === 'marketing' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(decisions.regions).map(([id, data]: [string, any]) => (
                    <div key={id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.08] transition-all">
                       <h4 className="text-lg font-black text-white uppercase italic border-b border-white/5 pb-4 flex justify-between items-center">Região {id} <MapPin size={14} className="text-orange-500"/></h4>
                       <div className="space-y-4">
                          <DecInput label="Preço ($)" val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                          <DecInput label="Propaganda (0-9)" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Prazo Pagamento</label>
                             <select value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-white/5 text-xs font-bold outline-none">
                                <option value={0}>0 - À Vista</option>
                                <option value={1}>1 - Período Seguinte</option>
                                <option value={2}>2 - Parcelado</option>
                             </select>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeSection === 'production' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Boxes size={16} /> Compras Matéria-Prima</h4>
                    <DecInput label="Qtde MP-A" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                    <DecInput label="Qtde MP-B" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase">Pagamento Fornecedor (0, 1 ou 2)</label>
                       <input type="number" value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', Number(e.target.value))} className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold" />
                    </div>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Factory size={16} /> Operação Fabril</h4>
                    <DecInput label="Nível Atividade (%)" val={decisions.production.activityLevel} onChange={v => updateDecision('production.activityLevel', v)} />
                    <DecInput label="Adicional de Produção" val={decisions.production.extraProduction || 0} onChange={v => updateDecision('production.extraProduction', v)} />
                    <DecInput label="Investimento em P&D ($)" val={decisions.production.rd_investment} onChange={v => updateDecision('production.rd_investment', v)} />
                  </div>
              </div>
            </div>
          )}

          {activeSection === 'hr' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><UserPlus size={16} /> Movimentação de Staff</h4>
                     <DecInput label="Contratar Pessoal" val={decisions.hr.hired} onChange={v => updateDecision('hr.hired', v)} />
                     <DecInput label="Demitir Pessoal" val={decisions.hr.fired} onChange={v => updateDecision('hr.fired', v)} />
                     <DecInput label="Equipe de Vendas" val={decisions.hr.sales_staff_count} onChange={v => updateDecision('hr.sales_staff_count', v)} />
                  </div>
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Sparkles size={16} /> Benefícios & Treino</h4>
                     <DecInput label="Salário Nominal ($)" val={decisions.hr.salary} onChange={v => updateDecision('hr.salary', v)} />
                     <DecInput label="Treinamento (%)" val={decisions.hr.trainingPercent} onChange={v => updateDecision('hr.trainingPercent', v)} />
                     <DecInput label="Participação nos Lucros (%)" val={decisions.hr.participationPercent} onChange={v => updateDecision('hr.participationPercent', v)} />
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'finance' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><DollarSign size={16}/> Gestão Financeira</h4>
                     <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                     <DecInput label="Aplicações ($)" val={decisions.finance.application || 0} onChange={v => updateDecision('finance.application', v)} />
                     <DecInput label="Prazo Venda (Interest %)" val={decisions.finance.termSalesInterest || 2.0} onChange={v => updateDecision('finance.termSalesInterest', v)} />
                  </div>
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Zap size={16}/> Comprar Máquinas</h4>
                     <div className="grid grid-cols-3 gap-4">
                        <DecInput label="Alfa" val={decisions.finance.buyMachines.alfa} onChange={v => updateDecision('finance.buyMachines.alfa', v)} />
                        <DecInput label="Beta" val={decisions.finance.buyMachines.beta} onChange={v => updateDecision('finance.buyMachines.beta', v)} />
                        <DecInput label="Gama" val={decisions.finance.buyMachines.gama} onChange={v => updateDecision('finance.buyMachines.gama', v)} />
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
           <button onClick={async () => { setIsSaving(true); try { await saveDecisions(teamId, champId!, round, decisions, isTrial); alert("COMANDO TRANSMITIDO COM SUCESSO."); } catch(e:any){ alert(e.message); } finally { setIsSaving(false); } }} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-xl flex items-center gap-4 active:scale-95">
             {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Transmitir Decisões</>}
           </button>
        </div>
      </div>
    </div>
  );
};

const DecInput = ({ label, val, onChange }: any) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 font-mono font-bold text-white outline-none focus:border-orange-500" />
  </div>
);

export default DecisionForm;
