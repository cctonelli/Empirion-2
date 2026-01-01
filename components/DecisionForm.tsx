
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Factory, Users2, Building2, ChevronRight,
  Shield, Loader2, Megaphone, Zap,
  TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle,
  Construction, Briefcase, Gavel, AlertTriangle, LayoutGrid, Cpu,
  UserPlus, UserMinus, PlusCircle, MinusCircle, CreditCard, PieChart, Sparkles, Sprout, Wind,
  Globe, ShoppingBag, Percent
} from 'lucide-react';
import { supabase, saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch } from '../types';

const createInitialDecisions = (regionsCount: number, branch: Branch): DecisionData => {
  const regions: Record<number, any> = {};
  for (let i = 1; i <= regionsCount; i++) {
    regions[i] = { 
      price: 340, term: 1, marketing: 3, 
      ecommerce_price: 320, ecommerce_marketing: 1 
    };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1300, trainingPercent: 5, participationPercent: 0, others: 0, overtimeHours: 0, sales_staff_count: 50, commission_percent: 1 },
    production: { purchaseMPA: 30900, purchaseMPB: 20600, paymentType: 1, activityLevel: 100, extraProduction: 0, rd_investment: 10000, agro_tech_investment: 5000, digital_exp_investment: 2000 },
    finance: { 
      loanRequest: 0, loanType: 1, application: 0, termSalesInterest: 1.5, 
      buyMachines: { alfa: 0, beta: 0, gama: 0 }, 
      sellMachines: { alfa: 0, beta: 0, gama: 0 },
      receivables_anticipation: 0, emergency_loan: 0
    },
  };
};

const DecisionForm: React.FC<{ regionsCount?: number; teamId?: string; champId?: string; round?: number; branch?: Branch }> = ({ 
  regionsCount = 9, 
  teamId = 'team-alpha',
  champId = 'c1',
  round = 1,
  branch = 'industrial' as Branch
}) => {
  const [activeSection, setActiveSection] = useState('marketing');
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(regionsCount, branch));
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

  const projections = useMemo(() => calculateProjections(decisions, branch as Branch), [decisions, branch]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDecisions(teamId!, champId!, round!, { ...decisions, inBankruptcy } as any, userName);
      alert(`Decisões sincronizadas com o servidor ${branch === 'agribusiness' ? 'SIAGRO' : branch === 'commercial' ? 'SIMCO' : 'SIND'} Legacy.`);
    } catch (e) {
      alert("Erro na transmissão. Verifique conexão.");
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="flex flex-col lg:flex-row gap-8 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
      <aside className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
        {[
          { id: 'marketing', label: branch === 'commercial' ? 'Canais Híbridos' : 'Canais de Venda', icon: Megaphone, color: 'text-blue-500' },
          { id: 'production', label: branch === 'agribusiness' ? 'Safra & Insumos' : branch === 'commercial' ? 'Estoques & Digital' : 'Produção & MP', icon: Factory, color: 'text-emerald-500' },
          { id: 'hr', label: branch === 'commercial' ? 'Força de Vendas' : 'Equipe & RH', icon: Users2, color: 'text-amber-500' },
          { id: 'machines', label: 'Ativos Fixos', icon: Zap, color: 'text-indigo-500' },
          { id: 'finance', label: 'Gestão Financeira', icon: Building2, color: 'text-rose-500' },
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
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{branch === 'agribusiness' ? 'SIAGRO' : branch === 'commercial' ? 'SIMCO' : 'Bernard'} Projections</span>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Resultado Líquido</span>
                 <span className={`font-mono font-black text-sm ${projections.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${projections.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                 </span>
              </div>
              {branch === 'commercial' && (
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">Satisfação Cliente</span>
                   <span className="text-blue-600 font-mono font-black text-sm">{projections.consumerSatisfaction?.toFixed(1)}%</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Total</span>
                 <span className="text-slate-900 font-mono font-black text-sm">{projections.salesVolume.toLocaleString()} un</span>
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[700px]">
        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeSection} Panel</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                Arena {branch.toUpperCase()} v5.4 GOLD - Período {round}
              </p>
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Cpu size={18} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Engine</span>
                <span className="text-[10px] font-black text-blue-900 font-mono uppercase">{branch === 'commercial' ? 'SIMCO' : branch === 'agribusiness' ? 'SIAGRO' : 'SIND'}</span>
              </div>
           </div>
        </div>

        <div className="space-y-10">
          {activeSection === 'marketing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 overflow-x-auto bg-white rounded-3xl border border-slate-100">
              <table className="w-full">
                <thead>
                   <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                      <th className="p-6 text-left">Canal / Região</th>
                      <th className="p-6 text-center">Preço Trad.</th>
                      <th className="p-6 text-center">Marketing Trad.</th>
                      {branch === 'commercial' && (
                        <>
                          <th className="p-6 text-center bg-blue-50/50">Preço E-com</th>
                          <th className="p-6 text-center bg-blue-50/50">Invest. Digital</th>
                        </>
                      )}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {Object.keys(decisions.regions).map(id => (
                     <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 font-black text-slate-900 text-xs">RE 0{id}</td>
                        <td className="p-6">
                           <input type="number" value={decisions.regions[Number(id)].price} 
                             onChange={e => updateDecision(`regions.${id}.price`, Number(e.target.value))}
                             className="w-20 p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-xs" />
                        </td>
                        <td className="p-6 text-center">
                           <input type="number" min="0" max="9" value={decisions.regions[Number(id)].marketing}
                             onChange={e => updateDecision(`regions.${id}.marketing`, Number(e.target.value))}
                             className="w-16 p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-xs" />
                        </td>
                        {branch === 'commercial' && (
                          <>
                            <td className="p-6 bg-blue-50/20">
                               <input type="number" value={decisions.regions[Number(id)].ecommerce_price || 0} 
                                 onChange={e => updateDecision(`regions.${id}.ecommerce_price`, Number(e.target.value))}
                                 className="w-20 p-3 bg-white border border-blue-100 rounded-xl text-center font-mono font-black text-xs" />
                            </td>
                            <td className="p-6 text-center bg-blue-50/20">
                               <input type="number" min="0" max="9" value={decisions.regions[Number(id)].ecommerce_marketing || 0}
                                 onChange={e => updateDecision(`regions.${id}.ecommerce_marketing`, Number(e.target.value))}
                                 className="w-16 p-3 bg-white border border-blue-100 rounded-xl text-center font-mono font-black text-xs" />
                            </td>
                          </>
                        )}
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'production' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><ShoppingBag className="text-emerald-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">{branch === 'commercial' ? 'Operação Digital' : 'Suprimentos'}</h4></div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Sparkles size={12} className="text-amber-500" /> {branch === 'commercial' ? 'UI/UX (Invest. Satisfação)' : 'Investimento P&D'}
                        </label>
                        <input type="number" value={branch === 'commercial' ? decisions.production.digital_exp_investment : decisions.production.rd_investment} onChange={e => updateDecision(branch === 'commercial' ? 'production.digital_exp_investment' : 'production.rd_investment', Number(e.target.value))} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black font-mono shadow-sm text-blue-600" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compra de Estoque (Lote)</label>
                        <input type="number" value={decisions.production.purchaseMPA} onChange={e => updateDecision('production.purchaseMPA', Number(e.target.value))} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black font-mono shadow-sm" />
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><LayoutGrid className="text-blue-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Capacidade de Lojas</h4></div>
                  <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-blue-900 uppercase">Ocupação de Gôndola</label>
                           <span className="text-lg font-black text-blue-700">{decisions.production.activityLevel}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={decisions.production.activityLevel} onChange={e => updateDecision('production.activityLevel', Number(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'hr' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-3"><Users2 className="text-amber-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Força de Vendas</h4></div>
                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Total Vendedores</label>
                      <input type="number" value={decisions.hr.sales_staff_count || 0} onChange={e => updateDecision('hr.sales_staff_count', Number(e.target.value))} className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-black font-mono shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Contratar (Extra)</label>
                      <input type="number" value={decisions.hr.hired} onChange={e => updateDecision('hr.hired', Number(e.target.value))} className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-black font-mono shadow-sm" />
                    </div>
                  </div>
                  {branch === 'commercial' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                         <Percent size={12} /> Comissão sobre Vendas (%)
                       </label>
                       <input type="number" step="0.1" value={decisions.hr.commission_percent || 0} onChange={e => updateDecision('hr.commission_percent', Number(e.target.value))} className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-black font-mono shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3"><Briefcase className="text-amber-700" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Remuneração</h4></div>
                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Salário Base ($)</label>
                    <input type="number" value={decisions.hr.salary} onChange={e => updateDecision('hr.salary', Number(e.target.value))} className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-black font-mono shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Treinamento Varejo (%)</label>
                    <input type="number" value={decisions.hr.trainingPercent} onChange={e => updateDecision('hr.trainingPercent', Number(e.target.value))} className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-black font-mono shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'finance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><Wallet className="text-rose-600" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Fluxo & Antecipação</h4></div>
                  <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Empréstimo Planejado ($)</label>
                        <input type="number" value={decisions.finance.loanRequest} onChange={e => updateDecision('finance.loanRequest', Number(e.target.value))} className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black font-mono shadow-sm" />
                     </div>
                     {branch === 'commercial' && (
                       <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                               <CreditCard size={12} /> Antecipação Cartão/Recebíveis ($)
                            </label>
                            <input type="number" value={decisions.finance.receivables_anticipation || 0} onChange={e => updateDecision('finance.receivables_anticipation', Number(e.target.value))} className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black font-mono shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                               <AlertTriangle size={12} className="text-rose-600" /> Empréstimo Especial (Emergência)
                            </label>
                            <input type="number" value={decisions.finance.emergency_loan || 0} onChange={e => updateDecision('finance.emergency_loan', Number(e.target.value))} className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black font-mono shadow-sm border-rose-200" />
                          </div>
                       </div>
                     )}
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-3"><PieChart className="text-rose-700" size={20} /><h4 className="text-[11px] font-black uppercase text-slate-900">Liquidez</h4></div>
                  <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Reserva Disponível ($)</label>
                        <input type="number" value={decisions.finance.application} onChange={e => updateDecision('finance.application', Number(e.target.value))} className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black font-mono shadow-sm" />
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado com SIMCO v5.4</span>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="w-full md:w-auto px-16 py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-brand-600 transition-all flex items-center justify-center gap-4 shadow-xl"
           >
             {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={24} /> Transmitir Decisões P{round}</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
