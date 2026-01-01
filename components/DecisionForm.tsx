
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Factory, Users2, Building2, ChevronRight,
  Shield, Loader2, Megaphone, Zap,
  TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle,
  Construction, Briefcase, Gavel, AlertTriangle, LayoutGrid, Cpu
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
      loanRequest: 0, loanType: 1, application: 0, termSalesInterest: 1.5, 
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
  const [inBankruptcy, setInBankruptcy] = useState(false);
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
      await saveDecisions(teamId!, champId!, round!, { ...decisions, inBankruptcy } as any, userName);
      alert("Decisões sincronizadas com o servidor Bernard Legacy.");
    } catch (e) {
      alert("Erro na transmissão. Verifique conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 px-4 md:px-0">
      <aside className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
        {[
          { id: 'marketing', label: 'Canais (1-9)', icon: Megaphone, color: 'text-blue-500' },
          { id: 'production', label: 'Produção & MP', icon: Factory, color: 'text-emerald-500' },
          { id: 'hr', label: 'Pessoal & RH', icon: Users2, color: 'text-amber-500' },
          { id: 'machines', label: 'Máquinas', icon: Zap, color: 'text-indigo-500' },
          { id: 'finance', label: 'Finanças', icon: Building2, color: 'text-rose-500' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all border ${
              activeSection === s.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${activeSection === s.id ? 'bg-white/10' : 'bg-slate-50'} ${s.color}`}>
                <s.icon size={20} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <ChevronRight size={14} className={activeSection === s.id ? 'opacity-100' : 'opacity-20'} />
          </button>
        ))}

        <div className="mt-6 p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bernard Projections</span>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Resultado Líquido</span>
                 <span className={`font-mono font-black text-sm ${projections.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${projections.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                 </span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Vendas</span>
                 <span className="text-slate-900 font-mono font-black text-sm">{projections.salesVolume.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                   <span>Margem Líquida</span>
                   <span>{(projections.margin * 100).toFixed(1)}%</span>
                </div>
              </div>
           </div>
        </div>

        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[1.5rem] mt-4 flex items-center gap-4 group cursor-pointer" onClick={() => setInBankruptcy(!inBankruptcy)}>
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${inBankruptcy ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-rose-300'}`}>
              <Gavel size={20} />
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-rose-900 uppercase">Status CVM</span>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">{inBankruptcy ? 'Em Concordata' : 'Empresa Ativa'}</span>
           </div>
        </div>
      </aside>

      <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[700px]">
        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeSection} Panel</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Folha de Decisões v4.9 - Período {round}</p>
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Cpu size={18} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Processing Node</span>
                <span className="text-[10px] font-black text-blue-900 font-mono">HASH: {round}X-99</span>
              </div>
           </div>
        </div>

        <div className="space-y-10">
          {activeSection === 'marketing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 overflow-x-auto bg-white rounded-3xl border border-slate-100">
              <table className="w-full">
                <thead>
                   <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                      <th className="p-6 text-left">Região</th>
                      <th className="p-6 text-center">Preço (BRL)</th>
                      <th className="p-6 text-center">Prazo (0-2)</th>
                      <th className="p-6 text-center">Marketing (GRP)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {Object.keys(decisions.regions).map(id => (
                     <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 font-black text-slate-900 text-xs">RE 0{id}</td>
                        <td className="p-6">
                           <input type="number" value={decisions.regions[Number(id)].price} 
                             onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], price: Number(e.target.value)}}})}
                             className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm focus:ring-4 focus:ring-blue-100" />
                        </td>
                        <td className="p-6 text-center">
                           <input type="number" min="0" max="2" value={decisions.regions[Number(id)].term}
                             onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], term: Number(e.target.value)}}})}
                             className="w-16 p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm" />
                        </td>
                        <td className="p-6 text-center">
                           <input type="number" min="0" max="9" value={decisions.regions[Number(id)].marketing}
                             onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], marketing: Number(e.target.value)}}})}
                             className="w-16 p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm" />
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'production' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><Construction className="text-blue-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Suprimentos MP</h4></div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Compra MP A (Unid)</label>
                        <input type="number" value={decisions.production.purchaseMPA} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: Number(e.target.value)}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black font-mono" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Compra MP B (Unid)</label>
                        <input type="number" value={decisions.production.purchaseMPB} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: Number(e.target.value)}})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black font-mono" />
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><Zap className="text-emerald-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Operações</h4></div>
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-emerald-900 uppercase">Nível de Atividade</label>
                           <span className="text-lg font-black text-emerald-700">{decisions.production.activityLevel}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={decisions.production.activityLevel} onChange={e => setDecisions({...decisions, production: {...decisions.production, activityLevel: Number(e.target.value)}})} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                     </div>
                  </div>
               </div>
            </div>
          )}
          
          {/* Outras seções RH/Machines/Finance simplificadas seguindo o mesmo padrão UI v4.9 */}
          {activeSection === 'hr' && <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest text-center animate-in fade-in">Human Capital Node Active</div>}
          {activeSection === 'machines' && <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest text-center animate-in fade-in">Industrial Park Node Active</div>}
          {activeSection === 'finance' && <div className="p-10 bg-slate-50 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest text-center animate-in fade-in">Capital Markets Node Active</div>}
        </div>

        <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Ready for strategic deployment</span>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="w-full md:w-auto px-16 py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
           >
             {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={24} /> Transmitir Decisões P{round}</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
