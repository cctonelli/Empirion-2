
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Factory, Users2, Building2, ChevronRight,
  Shield, Loader2, Megaphone, Plus, Trash2, Zap,
  TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { supabase, saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData } from '../types';

const createInitialDecisions = (regionsCount: number): DecisionData => {
  const regions: Record<number, any> = {};
  for (let i = 1; i <= regionsCount; i++) {
    regions[i] = { price: 340, term: 1, marketing: 3 };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1300, trainingPercent: 5, participationPercent: 0, others: 0 },
    production: { purchaseMPA: 30900, purchaseMPB: 20600, paymentType: 1, activityLevel: 100, extraProduction: 0 },
    finance: { 
      loanRequest: 0, loanType: 0, application: 0, termSalesInterest: 1.5, 
      buyMachines: { alfa: 0, beta: 0, gama: 0 }, 
      sellMachines: { alfa: 0, beta: 0, gama: 0 } 
    },
  };
};

const DecisionForm: React.FC<{ regionsCount?: number; teamId?: string; champId?: string; round?: number }> = ({ 
  regionsCount = 9, 
  teamId = 'team-alpha',
  champId = 'c1',
  round = 1
}) => {
  const [activeSection, setActiveSection] = useState('marketing');
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(regionsCount));
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('Strategist');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.email?.split('@')[0] || 'Strategist');
    };
    getUser();
  }, []);

  const projections = useMemo(() => calculateProjections(decisions, 'industrial'), [decisions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDecisions(teamId!, champId!, round!, decisions, userName);
      alert("Decisões sincronizadas no Terminal Principal.");
    } catch (e) {
      alert("Erro de link tático. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        {[
          { id: 'marketing', label: 'Marketing & Vendas', icon: Megaphone },
          { id: 'production', label: 'Produção & MP', icon: Factory },
          { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
          { id: 'machines', label: 'Maquinário (CapEx)', icon: Zap },
          { id: 'finance', label: 'Finanças & Tesouraria', icon: Building2 },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${
              activeSection === s.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <s.icon size={18} />
              <span className="font-black text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <ChevronRight size={14} className={activeSection === s.id ? 'opacity-100' : 'opacity-20'} />
          </button>
        ))}

        <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
           <span className="text-[8px] font-black uppercase text-blue-400 tracking-[0.2em]">Live Projections</span>
           <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase">Net Profit</span>
                 <span className={`font-mono font-black ${projections.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${projections.netProfit.toLocaleString()}
                 </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-400 font-bold uppercase">Unit Cost</span>
                 <span className="text-slate-100 font-mono">${projections.unitCost.toFixed(2)}</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Form Area */}
      <div className="flex-1 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeSection} Control</h2>
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Shield size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auth Code: {round}-SEC</span>
           </div>
        </div>

        <div className="min-h-[450px]">
          {activeSection === 'marketing' && (
            <div className="grid grid-cols-1 gap-6">
               <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 text-center">
                          <th className="p-4 text-left">Região</th>
                          <th className="p-4">Preço (BRL)</th>
                          <th className="p-4">Prazo (0-2)</th>
                          <th className="p-4">Marketing (0-9)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {Object.keys(decisions.regions).map(id => (
                         <tr key={id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-black text-slate-900 text-xs">Node 0{id}</td>
                            <td className="p-4">
                               <input type="number" value={decisions.regions[Number(id)].price} 
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], price: Number(e.target.value)}}})}
                                 className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs" />
                            </td>
                            <td className="p-4">
                               <input type="number" min="0" max="2" value={decisions.regions[Number(id)].term}
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], term: Number(e.target.value)}}})}
                                 className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs" />
                            </td>
                            <td className="p-4">
                               <input type="number" min="0" max="9" value={decisions.regions[Number(id)].marketing}
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], marketing: Number(e.target.value)}}})}
                                 className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs" />
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeSection === 'production' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Compras Programadas</h4>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Matéria-Prima A (Units)</label>
                        <input type="number" value={decisions.production.purchaseMPA} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: Number(e.target.value)}})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-black font-mono" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Matéria-Prima B (Units)</label>
                        <input type="number" value={decisions.production.purchaseMPB} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: Number(e.target.value)}})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-black font-mono" />
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Nível Operacional</h4>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-600 uppercase">Nível de Atividade (%)</label>
                        <input type="range" min="0" max="100" value={decisions.production.activityLevel} onChange={e => setDecisions({...decisions, production: {...decisions.production, activityLevel: Number(e.target.value)}})} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                        <div className="text-right font-black text-emerald-700">{decisions.production.activityLevel}%</div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-600 uppercase">Produção Extra (Units)</label>
                        <input type="number" value={decisions.production.extraProduction} onChange={e => setDecisions({...decisions, production: {...decisions.production, extraProduction: Number(e.target.value)}})} className="w-full p-4 bg-white border border-emerald-200 rounded-xl font-black font-mono text-emerald-700" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'machines' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {['alfa', 'beta', 'gama'].map(type => (
                 <div key={type} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                       <Zap className="text-blue-500" />
                    </div>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">Machine {type}</h4>
                    <div className="w-full space-y-4">
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-emerald-600 uppercase flex items-center gap-1"><ArrowUpCircle size={10}/> Compra</span>
                          <input type="number" value={(decisions.finance.buyMachines as any)[type]} 
                            onChange={e => setDecisions({...decisions, finance: {...decisions.finance, buyMachines: {...decisions.finance.buyMachines, [type]: Number(e.target.value)}}})}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-xs" />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-rose-600 uppercase flex items-center gap-1"><ArrowDownCircle size={10}/> Venda</span>
                          <input type="number" value={(decisions.finance.sellMachines as any)[type]} 
                            onChange={e => setDecisions({...decisions, finance: {...decisions.finance, sellMachines: {...decisions.finance.sellMachines, [type]: Number(e.target.value)}}})}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-xs" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* ... HR e Finance similares ao v4.2 mas com campos participação, treinamento etc ... */}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-12 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 shadow-xl shadow-slate-100 transition-all flex items-center gap-4"
           >
             {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Deploy Strategic Vector</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
