
import React, { useState, useMemo } from 'react';
import { 
  Save, Factory, Users2, ChevronRight,
  Loader2, Megaphone, Zap, Cpu, Boxes, Info, Sparkles
} from 'lucide-react';
import { saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, ModalityType } from '../types';

const createInitialDecisions = (regionsCount: number): DecisionData => {
  const regions: Record<number, any> = {};
  for (let i = 1; i <= regionsCount; i++) {
    regions[i] = { price: 340, term: 1, marketing: 3 };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1300, trainingPercent: 5, participationPercent: 0, others: 0, sales_staff_count: 50 },
    production: { 
      purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, extraProduction: 0, 
      rd_investment: 10000, strategy: 'push_mrp', automation_level: 0, batch_size: 1000 
    },
    finance: { 
      loanRequest: 0, loanType: 1, application: 0, termSalesInterest: 1.5, 
      buyMachines: { alfa: 0, beta: 0, gama: 0 }, sellMachines: { alfa: 0, beta: 0, gama: 0 } 
    },
  };
};

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; modality?: ModalityType; userName?: string }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial', modality = 'standard', userName = 'Operator'
}) => {
  const [activeSection, setActiveSection] = useState('production');
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);

  // Projeções isoladas em memória, não persistidas no DOM global
  const projections = useMemo(() => 
    calculateProjections(decisions, branch as Branch, { modalityType: modality } as any), 
  [decisions, branch, modality]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions)); // Deep copy para evitar mutação lateral
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
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white mb-4 border border-white/5">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Doutrina Operacional</h3>
           <div className="space-y-2">
              <button 
                onClick={() => updateDecision('production.strategy', 'push_mrp')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'push_mrp' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}
              >
                MRP II (Push)
              </button>
              <button 
                onClick={() => updateDecision('production.strategy', 'pull_kanban')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'pull_kanban' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}
              >
                JIT (Pull)
              </button>
           </div>
        </div>

        {[
          { id: 'marketing', label: 'Marketing & Vendas', icon: Megaphone },
          { id: 'production', label: 'Operações & Fábrica', icon: Factory },
          { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${activeSection === s.id ? 'bg-white border-slate-900 shadow-xl' : 'bg-white/50 text-slate-500 border-transparent'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${activeSection === s.id ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}><s.icon size={20} /></div>
              <span className="font-black text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <ChevronRight size={14} />
          </button>
        ))}

        <div className="mt-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
           <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Oracle Simulation Results</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Net Profit (Est.)</span>
                <span className={`font-black text-sm ${projections.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${projections.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Efficiency Index</span>
                <span className="font-black text-sm text-blue-600">{projections.oee.toFixed(1)}%</span>
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 min-h-[700px] flex flex-col">
        <header className="flex justify-between items-center mb-12 pb-8 border-b border-slate-100">
           <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Arena {activeSection.toUpperCase()}</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Status: Sincronizando com Command Node</p>
           </div>
           <div className="px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Info className="text-blue-500" size={18} />
              <span className="text-[10px] font-black text-blue-900 uppercase">Sector: {branch?.toUpperCase()}</span>
           </div>
        </header>

        <div className="flex-1">
          {activeSection === 'production' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Boxes className="text-emerald-500" /> Matéria-Prima (A)</h4>
                    <input 
                      type="number" 
                      value={decisions.production.purchaseMPA} 
                      onChange={e => updateDecision('production.purchaseMPA', Number(e.target.value))} 
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-mono font-black text-2xl focus:ring-8 focus:ring-blue-50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Cpu className="text-blue-500" /> Automação</h4>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={decisions.production.automation_level} 
                      onChange={e => updateDecision('production.automation_level', parseFloat(e.target.value))} 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                        <span>Manual</span>
                        <span className="text-blue-600 font-black">Level {(decisions.production.automation_level! * 10).toFixed(0)}</span>
                        <span>Full AI</span>
                    </div>
                  </div>
              </div>

              <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden group shadow-2xl">
                  <Sparkles className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform" size={150} />
                  <h4 className="text-xl font-black uppercase tracking-tight italic">Operational Risk Report</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-500">Unit Cost Projected</span>
                        <div className="text-3xl font-black font-mono text-emerald-400">${projections.unitCost.toFixed(2)}</div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-500">Inventory Status</span>
                        <div className={`text-xl font-black uppercase italic ${projections.inventoryRisk === 'ESTÁVEL' ? 'text-blue-400' : 'text-rose-500 animate-pulse'}`}>{projections.inventoryRisk}</div>
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
           <button 
             onClick={async () => {
               setIsSaving(true);
               try {
                 await saveDecisions(teamId, champId, round, decisions, userName);
                 alert("TRANSMISSÃO CONCLUÍDA: Decisões seladas no banco de dados.");
               } catch (e: any) {
                 alert(`FALHA NA TRANSMISSÃO: ${e.message}`);
               } finally {
                 setIsSaving(false);
               }
             }}
             className="px-16 py-6 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
           >
             {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Selar Decisões na Arena</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
