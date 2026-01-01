
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Factory, Users2, Building2, ChevronRight,
  Shield, Loader2, Megaphone, Zap,
  TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle,
  Construction, Briefcase, Gavel, AlertTriangle, LayoutGrid, Cpu,
  UserPlus, UserMinus, PlusCircle, MinusCircle, CreditCard, PieChart, Sparkles, Sprout, Wind,
  Globe, ShoppingBag, Percent, GraduationCap, Award, FileCheck, Boxes, Info
} from 'lucide-react';
import { supabase, saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, ModalityType, ProductionStrategy } from '../types';

const createInitialDecisions = (regionsCount: number, branch: Branch): DecisionData => {
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

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; modality?: ModalityType }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial', modality = 'standard' 
}) => {
  const [activeSection, setActiveSection] = useState('production');
  // Fix: Cast branch as Branch to resolve string assignment error
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(9, branch as Branch));
  const [isSaving, setIsSaving] = useState(false);

  // Fix: Cast branch as Branch to resolve string assignment error
  const projections = useMemo(() => calculateProjections(decisions, branch as Branch, { modalityType: modality } as any), [decisions, branch, modality]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = { ...decisions };
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
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white mb-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Doutrina Operacional</h3>
           <div className="space-y-2">
              <button 
                onClick={() => updateDecision('production.strategy', 'push_mrp')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'push_mrp' ? 'bg-blue-600' : 'bg-white/5 text-slate-500'}`}
              >
                MRP II (Empurrada)
              </button>
              <button 
                onClick={() => updateDecision('production.strategy', 'pull_kanban')}
                className={`w-full p-4 rounded-2xl text-[10px] font-bold uppercase transition-all ${decisions.production.strategy === 'pull_kanban' ? 'bg-emerald-600' : 'bg-white/5 text-slate-500'}`}
              >
                JIT (Puxada)
              </button>
           </div>
           <p className="text-[9px] text-slate-500 mt-4 leading-relaxed">A estratégia define como o motor calcula o custo de posse e a agilidade de entrega.</p>
        </div>

        {[
          { id: 'marketing', label: 'Canais de Venda', icon: Megaphone, color: 'text-blue-500' },
          { id: 'production', label: 'Operações e Insumos', icon: Factory, color: 'text-emerald-500' },
          { id: 'hr', label: 'Recursos Humanos', icon: Users2, color: 'text-amber-500' },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border ${activeSection === s.id ? 'bg-white border-slate-900 shadow-xl' : 'bg-white/50 text-slate-500'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${activeSection === s.id ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}><s.icon size={20} /></div>
              <span className="font-black text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <ChevronRight size={14} />
          </button>
        ))}

        <div className="mt-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
           <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Calculadora de Impacto</h4>
           <div className="space-y-4">
              <div className="flex justify-between"><span className="text-[10px] text-slate-500 font-bold uppercase">ROI Projetado</span><span className="font-black text-sm text-emerald-600">{projections.netProfit > 0 ? '+' : ''}{projections.netProfit.toLocaleString()}$</span></div>
              <div className="flex justify-between"><span className="text-[10px] text-slate-500 font-bold uppercase">OEE Eficiência</span><span className="font-black text-sm text-blue-600">{projections.oee.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-[10px] text-slate-500 font-bold uppercase">Risco de Estoque</span><span className="font-black text-[9px] text-rose-600">{projections.inventoryRisk}</span></div>
           </div>
        </div>
      </aside>

      <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[700px]">
        <header className="flex justify-between items-center mb-12 pb-8 border-b border-slate-100">
           <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Comando {activeSection.toUpperCase()}</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Estratégia Ativa: {decisions.production.strategy?.toUpperCase()}</p>
           </div>
           <div className="px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Info className="text-blue-500" size={18} />
              <span className="text-[10px] font-black text-blue-900 uppercase">Modo {modality.toUpperCase()}</span>
           </div>
        </header>

        {activeSection === 'production' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Boxes className="text-emerald-500" /> Abastecimento MP-A</h4>
                   <input type="number" value={decisions.production.purchaseMPA} onChange={e => updateDecision('production.purchaseMPA', Number(e.target.value))} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-mono font-black text-2xl focus:ring-8 focus:ring-blue-50 outline-none transition-all" />
                </div>
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Cpu className="text-blue-500" /> Nível de Automação</h4>
                   <input type="range" min="0" max="1" step="0.1" value={decisions.production.automation_level} onChange={e => updateDecision('production.automation_level', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                      <span>Manual</span>
                      <span className="text-blue-600">{(decisions.production.automation_level! * 100).toFixed(0)}% Automação</span>
                      <span>Indústria 4.0</span>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden group">
                <Sparkles className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform" size={150} />
                <h4 className="text-xl font-black uppercase tracking-tight italic">Relatório de Impacto Operacional</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-500">Custo Unitário Projetado</span>
                      <div className="text-3xl font-black font-mono text-emerald-400">${projections.unitCost.toFixed(2)}</div>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-500">Lead Time de Produção</span>
                      <div className="text-3xl font-black font-mono text-blue-400">{(1.5 * (1 - (decisions.production.automation_level! * 0.4))).toFixed(1)} dias</div>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-500">Multa Prevista Ruptura</span>
                      <div className="text-3xl font-black font-mono text-rose-400">${decisions.production.strategy === 'pull_kanban' ? '2.5x' : '1.2x'}</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Outras seções permanecem mas com layout refinado v5 */}
        <div className="mt-auto pt-10 border-t border-slate-50 flex justify-end">
           <button 
             onClick={async () => {
               setIsSaving(true);
               await saveDecisions(teamId, champId, round, decisions, 'User');
               setIsSaving(false);
               alert("Decisões Transmitidas!");
             }}
             className="px-16 py-6 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-4"
           >
             {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Transmitir ao Command Node</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
