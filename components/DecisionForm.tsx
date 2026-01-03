
import React, { useState, useMemo } from 'react';
import { 
  Save, Factory, Users2, ChevronRight,
  Loader2, Megaphone, Zap, Cpu, Boxes, Info, Sparkles, DollarSign,
  TrendingUp, Activity, SlidersHorizontal, MapPin
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
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white mb-4 border border-white/5 shadow-2xl">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4">Estratégia Industrial</h3>
           <div className="space-y-2">
              <button 
                onClick={() => updateDecision('production.strategy', 'push_mrp')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'push_mrp' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
              >
                Planejamento Empurrado
              </button>
              <button 
                onClick={() => updateDecision('production.strategy', 'pull_kanban')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'pull_kanban' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
              >
                Just-in-Time (Puxado)
              </button>
           </div>
        </div>

        {[
          { id: 'marketing', label: 'Estratégia Regional', icon: Megaphone },
          { id: 'production', label: 'Fábrica & Insumos', icon: Factory },
          { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
          { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${activeSection === s.id ? 'bg-slate-900 border-white/10 shadow-2xl text-white' : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10 hover:text-slate-300'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${activeSection === s.id ? 'bg-orange-600 text-white' : 'bg-white/5'}`}><s.icon size={20} /></div>
              <span className={`font-black text-[10px] uppercase tracking-widest ${activeSection === s.id ? 'text-orange-500' : ''}`}>{s.label}</span>
            </div>
            <ChevronRight size={14} className={activeSection === s.id ? 'text-orange-500' : ''} />
          </button>
        ))}

        <div className="mt-6 p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5 shadow-inner">
           <h4 className="text-[10px] font-black uppercase text-orange-500 mb-4 tracking-widest">Oráculo de Projeção</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">LUCRO EST.</span>
                <span className={`font-black text-sm ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {projections.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">OEE PROJETADO</span>
                <span className="font-black text-sm text-white">{projections.oee.toFixed(1)}%</span>
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 bg-slate-950 p-12 rounded-[4rem] shadow-2xl border border-white/5 min-h-[700px] flex flex-col relative overflow-hidden">
        <header className="flex justify-between items-center mb-12 pb-8 border-b border-white/5 relative z-10">
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Painel {activeSection.toUpperCase()}</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Sincronização em Tempo Real v5.0</p>
           </div>
           <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <Info className="text-orange-500" size={18} />
              <span className="text-[10px] font-black text-orange-500 uppercase">Arena: EMPIRION STREET</span>
           </div>
        </header>

        <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-4">
          {activeSection === 'marketing' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(decisions.regions).map(([id, data]) => (
                    <div key={id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.08] transition-all group">
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <h4 className="text-lg font-black text-white uppercase italic">Região {id}</h4>
                          <MapPin size={16} className="text-orange-500" />
                       </div>
                       <div className="space-y-4">
                          <DecInput label="Preço ($)" val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                          <DecInput label="Marketing (0-9)" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
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
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Boxes className="text-white" size={16} /> Compras Matéria-Prima</h4>
                    <div className="space-y-6">
                       <DecInput label="Qtde MP-A" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                       <DecInput label="Qtde MP-B" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                    </div>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Factory className="text-white" size={16} /> Operação Fabril</h4>
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase">Nível de Atividade (%)</label>
                          <input type="range" min="0" max="100" step="5" value={decisions.production.activityLevel} onChange={e => updateDecision('production.activityLevel', Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                          <div className="flex justify-between text-white font-black text-xs uppercase italic"><span>0%</span> <span>{decisions.production.activityLevel}%</span> <span>100%</span></div>
                       </div>
                       <DecInput label="Investimento em P&D ($)" val={decisions.production.rd_investment} onChange={v => updateDecision('production.rd_investment', v)} />
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeSection === 'finance' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><DollarSign size={16} className="text-white"/> Captação de Recursos</h4>
                     <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Tipo de Empréstimo</label>
                        <select value={decisions.finance.loanType} onChange={e => updateDecision('finance.loanType', Number(e.target.value))} className="w-full bg-slate-900 text-white p-4 rounded-xl border border-white/5 text-xs font-bold">
                           <option value={1}>1 - Bancário Normal</option>
                           <option value={2}>2 - Bancário Especial</option>
                        </select>
                     </div>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Zap size={16} className="text-white"/> Investimento em Máquinas</h4>
                     <div className="grid grid-cols-3 gap-4">
                        <DecInput label="Máq. Alfa" val={decisions.finance.buyMachines.alfa} onChange={v => updateDecision('finance.buyMachines.alfa', v)} />
                        <DecInput label="Máq. Beta" val={decisions.finance.buyMachines.beta} onChange={v => updateDecision('finance.buyMachines.beta', v)} />
                        <DecInput label="Máq. Gama" val={decisions.finance.buyMachines.gama} onChange={v => updateDecision('finance.buyMachines.gama', v)} />
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-end relative z-10">
           <button 
             onClick={async () => {
               setIsSaving(true);
               try {
                 await saveDecisions(teamId, champId, round, decisions, userName);
                 alert("COMANDO SELADO: Decisões transmitidas para o Oracle Node.");
               } catch (e: any) {
                 alert(`FALHA NA TRANSMISSÃO: ${e.message}`);
               } finally {
                 setIsSaving(false);
               }
             }}
             className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.4)] flex items-center gap-4 active:scale-95"
           >
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
