
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Factory, Users2, Building2, ChevronRight,
  Shield, Loader2, Megaphone, Zap,
  TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle,
  Construction, Briefcase
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
      alert("Operação Sincronizada: Suas decisões foram transmitidas para o servidor de processamento.");
    } catch (e) {
      alert("Falha Crítica no Link: Verifique sua conexão e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 px-4 md:px-0">
      {/* Tactical Sidebar */}
      <aside className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
        {[
          { id: 'marketing', label: 'Canais de Venda (1-9)', icon: Megaphone, color: 'text-blue-500' },
          { id: 'production', label: 'Operações & Logística', icon: Factory, color: 'text-emerald-500' },
          { id: 'hr', label: 'Capital Humano', icon: Users2, color: 'text-amber-500' },
          { id: 'machines', label: 'Parque Industrial', icon: Zap, color: 'text-indigo-500' },
          { id: 'finance', label: 'Tesouraria & Crédito', icon: Building2, color: 'text-rose-500' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all border ${
              activeSection === s.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
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
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live War-Projections</span>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Net Profit (EST)</span>
                 <span className={`font-mono font-black text-sm ${projections.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${projections.netProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                 </span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Estimated Units</span>
                 <span className="text-slate-900 font-mono font-black text-sm">{projections.salesVolume.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                   <span>Margin</span>
                   <span>{(projections.margin * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, projections.margin * 300)}%` }}></div>
                </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Deployment Core */}
      <div className="flex-1 bg-white p-6 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[700px]">
        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeSection} Control</h2>
              <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">Protocolo de Operação Período {round}</p>
           </div>
           <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield size={18} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Node</span>
                <span className="text-[10px] font-black text-blue-900 font-mono">HASH: {round}X-99</span>
              </div>
           </div>
        </div>

        <div className="space-y-10">
          {activeSection === 'marketing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100">
                  <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                          <th className="p-6 text-left">Setor Geográfico</th>
                          <th className="p-6 text-center">Preço (BRL)</th>
                          <th className="p-6 text-center">Prazo Médio (0-2)</th>
                          <th className="p-6 text-center">Marketing (GRP 1-9)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {Object.keys(decisions.regions).map(id => (
                         <tr key={id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{id}</div>
                                  <span className="font-black text-slate-900 text-xs uppercase">Região 0{id}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <input type="number" value={decisions.regions[Number(id)].price} 
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], price: Number(e.target.value)}}})}
                                 className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                            </td>
                            <td className="p-6">
                               <input type="number" min="0" max="2" value={decisions.regions[Number(id)].term}
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], term: Number(e.target.value)}}})}
                                 className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                            </td>
                            <td className="p-6">
                               <input type="number" min="0" max="9" value={decisions.regions[Number(id)].marketing}
                                 onChange={e => setDecisions({...decisions, regions: {...decisions.regions, [Number(id)]: {...decisions.regions[Number(id)], marketing: Number(e.target.value)}}})}
                                 className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeSection === 'production' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Construction className="text-blue-600" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Suprimentos de Produção</h4>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compras Prog. Matéria-Prima A (Units)</label>
                        <input type="number" value={decisions.production.purchaseMPA} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: Number(e.target.value)}})} className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black font-mono text-lg shadow-sm" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compras Prog. Matéria-Prima B (Units)</label>
                        <input type="number" value={decisions.production.purchaseMPB} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: Number(e.target.value)}})} className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black font-mono text-lg shadow-sm" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prazo Pagamento Fornecedores (0-2)</label>
                        <input type="number" min="0" max="2" value={decisions.production.paymentType} onChange={e => setDecisions({...decisions, production: {...decisions.production, paymentType: Number(e.target.value) as any}})} className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black font-mono text-lg shadow-sm" />
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Zap className="text-emerald-600" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Capacidade Operacional</h4>
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-emerald-900 uppercase">Nível de Atividade</label>
                           <span className="text-lg font-black text-emerald-700">{decisions.production.activityLevel}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={decisions.production.activityLevel} onChange={e => setDecisions({...decisions, production: {...decisions.production, activityLevel: Number(e.target.value)}})} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-900 uppercase">Produção Extra Planejada (Units)</label>
                        <input type="number" value={decisions.production.extraProduction} onChange={e => setDecisions({...decisions, production: {...decisions.production, extraProduction: Number(e.target.value)}})} className="w-full p-5 bg-white border border-emerald-200 rounded-2xl font-black font-mono text-lg text-emerald-700 shadow-sm" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'hr' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <Briefcase className="text-amber-500" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Gestão de Pessoal</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Admitidos</label>
                        <input type="number" value={decisions.hr.hired} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, hired: Number(e.target.value)}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-center" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Demitidos</label>
                        <input type="number" value={decisions.hr.fired} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, fired: Number(e.target.value)}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-center" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase">Salário Proposto (Base 1300)</label>
                     <input type="number" value={decisions.hr.salary} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, salary: Number(e.target.value)}})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-blue-600" />
                  </div>
               </div>
               <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-8 shadow-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-blue-400" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">Incentivos & Treinamento</h4>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                           <span className="text-slate-400">Verba Treinamento</span>
                           <span className="text-blue-400">{decisions.hr.trainingPercent}%</span>
                        </div>
                        <input type="range" min="0" max="20" step="1" value={decisions.hr.trainingPercent} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, trainingPercent: Number(e.target.value)}})} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                           <span className="text-slate-400">Participação Lucros</span>
                           <span className="text-emerald-400">{decisions.hr.participationPercent}%</span>
                        </div>
                        <input type="range" min="0" max="15" step="1" value={decisions.hr.participationPercent} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, participationPercent: Number(e.target.value)}})} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Outros Custos RH ($)</label>
                        <input type="number" value={decisions.hr.others} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, others: Number(e.target.value)}})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-black text-white text-center" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'machines' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {['alfa', 'beta', 'gama'].map(type => (
                 <div key={type} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-6 group hover:border-blue-200 transition-all">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                       <Zap className={type === 'alfa' ? 'text-blue-500' : type === 'beta' ? 'text-amber-500' : 'text-indigo-500'} />
                    </div>
                    <div className="text-center">
                       <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">Machine {type.toUpperCase()}</h4>
                       <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Capacidade Unitária: {type === 'alfa' ? '2.000' : type === 'beta' ? '6.000' : '12.000'}</p>
                    </div>
                    <div className="w-full space-y-4">
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-emerald-600 uppercase flex items-center gap-1"><ArrowUpCircle size={10}/> Compra</span>
                          <input type="number" value={(decisions.finance.buyMachines as any)[type]} 
                            onChange={e => setDecisions({...decisions, finance: {...decisions.finance, buyMachines: {...decisions.finance.buyMachines, [type]: Number(e.target.value)}}})}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-center font-black font-mono text-sm shadow-sm" />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-rose-600 uppercase flex items-center gap-1"><ArrowDownCircle size={10}/> Venda</span>
                          <input type="number" value={(decisions.finance.sellMachines as any)[type]} 
                            onChange={e => setDecisions({...decisions, finance: {...decisions.finance, sellMachines: {...decisions.finance.sellMachines, [type]: Number(e.target.value)}}})}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-center font-black font-mono text-sm shadow-sm" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeSection === 'finance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-emerald-600" size={24} />
                    <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">Captação de Crédito</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor do Empréstimo ($)</label>
                        <input type="number" value={decisions.finance.loanRequest} onChange={e => setDecisions({...decisions, finance: {...decisions.finance, loanRequest: Number(e.target.value)}})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-emerald-600" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Crédito (1-Curto, 2-Longo)</label>
                        <div className="flex gap-4">
                           {[1, 2].map(type => (
                             <button key={type} onClick={() => setDecisions({...decisions, finance: {...decisions.finance, loanType: type as any}})} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${decisions.finance.loanType === type ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}>
                                {type === 1 ? 'Curto Prazo' : 'Longo Prazo'}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] space-y-8">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-indigo-600" size={24} />
                    <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">Mercado de Capitais</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aplicação Financeira ($)</label>
                        <input type="number" value={decisions.finance.application} onChange={e => setDecisions({...decisions, finance: {...decisions.finance, application: Number(e.target.value)}})} className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black text-xl text-indigo-600" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Juros s/ Venda a Prazo (%)</label>
                        <input type="number" step="0.1" value={decisions.finance.termSalesInterest} onChange={e => setDecisions({...decisions, finance: {...decisions.finance, termSalesInterest: Number(e.target.value)}})} className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black text-xl text-amber-600" />
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Global Save Trigger */}
        <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Ready for strategic deployment</span>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="w-full md:w-auto px-16 py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-blue-600 hover:scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-4"
           >
             {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={24} /> Transmitir Folha de Decisões</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
