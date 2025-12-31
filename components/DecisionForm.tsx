import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Info, TrendingUp, 
  ShoppingCart, Factory, Tag, Megaphone, 
  Truck, Users2, Building2, ChevronRight,
  ShieldCheck, AlertCircle, Settings, Loader2,
  BarChart3, Target, Wallet, Globe, History, User
} from 'lucide-react';
import { supabase, subscribeToDecisionAudit } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, RegionalDecision } from '../types';

const INITIAL_REGIONAL: RegionalDecision = { price: 340, term: 1, marketing: 3 };

const createInitialDecisions = (regionsCount: number): DecisionData => {
  const regions: Record<number, RegionalDecision> = {};
  for (let i = 1; i <= regionsCount; i++) {
    regions[i] = { ...INITIAL_REGIONAL };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1300, trainingPercent: 5, participationPercent: 0, others: 0 },
    production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, extraProduction: 0 },
    finance: { loanRequest: 0, loanType: 0, application: 0, termSalesInterest: 1.5, buyMachines: { alfa: 0, beta: 0, gama: 0 }, sellMachines: { alfa: 0, beta: 0, gama: 0 } },
  };
};

const DecisionForm: React.FC<{ regionsCount?: number; teamId?: string }> = ({ regionsCount = 9, teamId = 'team-alpha' }) => {
  const [activeSection, setActiveSection] = useState('marketing');
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(regionsCount));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    setDecisions(createInitialDecisions(regionsCount));
    
    // Subscribe to Realtime Audit Logs
    const subscription = subscribeToDecisionAudit(teamId, (payload) => {
      const newLog = payload.new;
      setAuditLogs(prev => [newLog, ...prev].slice(0, 5));
      setLastSync(new Date());
      
      // Optionally toast notification
      console.log(`Update from ${newLog.user_name}: ${newLog.action}`);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [regionsCount, teamId]);

  const projections = useMemo(() => {
    return calculateProjections(decisions, 'industrial');
  }, [decisions]);

  const updateRegional = (regionId: number, field: keyof RegionalDecision, value: number) => {
    setDecisions(prev => ({
      ...prev,
      regions: {
        ...prev.regions,
        [regionId]: { ...prev.regions[regionId], [field]: value }
      }
    }));
  };

  const sections = [
    { id: 'marketing', label: 'Regional Market', icon: Megaphone },
    { id: 'production', label: 'Production & MP', icon: Factory },
    { id: 'hr', label: 'Human Resources', icon: Users2 },
    { id: 'finance', label: 'Financial Strategy', icon: Building2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Dynamic Projections & Audit Sidebar */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 opacity-60">
                   <Target size={16} className="text-blue-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Live Projections</span>
                </div>
                {lastSync && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black uppercase text-emerald-400">Synced</span>
                  </div>
                )}
             </div>
             <div className="space-y-6">
                <div>
                   <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Revenue</span>
                   <span className="text-3xl font-black text-white font-mono">$ {projections.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                   <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Net Profit</span>
                      <span className={`text-xl font-black font-mono ${projections.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {projections.netProfit >= 0 ? '+' : ''}{projections.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Margin</span>
                      <span className="text-xs font-black text-blue-400">
                        {((projections.ebitda / (projections.revenue || 1)) * 100).toFixed(1)}%
                      </span>
                   </div>
                </div>
             </div>
          </div>
          <div className="absolute -bottom-6 -right-6 text-white/5 pointer-events-none">
             <BarChart3 size={120} />
          </div>
        </div>

        {/* Real-time Collaboration Feed */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Activity</h4>
              <History size={14} className="text-slate-300" />
           </div>
           <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-300 uppercase">Awaiting input...</p>
                </div>
              ) : (
                auditLogs.map((log, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-900 truncate uppercase">{log.user_name || 'Collaborator'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{log.action || 'Updated decision'}</p>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Navigation</h4>
           {sections.map(s => (
             <button
               key={s.id}
               onClick={() => setActiveSection(s.id)}
               className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                 activeSection === s.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
               <div className="flex items-center gap-3">
                 <s.icon size={18} />
                 <span className="font-bold text-xs uppercase tracking-widest">{s.label}</span>
               </div>
               <ChevronRight size={14} className={activeSection === s.id ? 'opacity-100' : 'opacity-0'} />
             </button>
           ))}
        </div>
      </aside>

      {/* Main Form Area */}
      <div className="flex-1 space-y-8 order-1 lg:order-2">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeSection} Control</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 font-medium">Empirion Deployment Interface | Round 4</p>
                {lastSync && (
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    • Live
                  </span>
                )}
              </div>
            </div>
            {activeSection === 'marketing' && (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                 <Globe size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{regionsCount} Dynamic Channels</span>
              </div>
            )}
          </div>

          <div className="min-h-[400px]">
            {activeSection === 'marketing' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-50">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                      <th className="p-5 text-left">Regional Node</th>
                      <th className="p-5 text-center">Price Optimization</th>
                      <th className="p-5 text-center">Payment Term</th>
                      <th className="p-5 text-center">Marketing GRP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(Object.entries(decisions.regions) as [string, RegionalDecision][]).map(([id, data]) => (
                      <tr key={id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-5 font-bold text-slate-900">Region 0{id}</td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                             <span className="text-xs font-bold text-slate-400">$</span>
                             <input 
                               type="number" 
                               value={data.price} 
                               onChange={e => updateRegional(Number(id), 'price', Number(e.target.value))}
                               className="w-24 p-3 border border-slate-200 rounded-xl text-center font-mono font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                             />
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex justify-center">
                            <select 
                              value={data.term}
                              onChange={e => updateRegional(Number(id), 'term', Number(e.target.value) as any)}
                              className="p-3 border border-slate-200 rounded-xl text-center font-bold text-xs focus:ring-4 focus:ring-blue-100 outline-none"
                            >
                              <option value={0}>Cash (0d)</option>
                              <option value={1}>30 Days</option>
                              <option value={2}>60 Days</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-4">
                             <input 
                               type="range" min="0" max="9"
                               value={data.marketing}
                               onChange={e => updateRegional(Number(id), 'marketing', Number(e.target.value))}
                               className="w-32 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                             />
                             <span className="w-8 font-black text-blue-600 text-sm">{data.marketing}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'hr' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                         <Wallet size={14} className="text-blue-500" /> Compensation Strategy
                      </label>
                      <div className="relative">
                         <input 
                           type="number" value={decisions.hr.salary} 
                           onChange={e => setDecisions({...decisions, hr: {...decisions.hr, salary: Number(e.target.value)}})}
                           className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-4xl text-slate-900 focus:ring-8 focus:ring-blue-50 outline-none transition-all"
                         />
                         <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">BRL</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Market Salary: $1,300</p>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                         <span className="block text-[10px] font-black text-slate-400 uppercase">New Hires</span>
                         <input type="number" value={decisions.hr.hired} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, hired: Number(e.target.value)}})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-center" />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                         <span className="block text-[10px] font-black text-slate-400 uppercase">Terminations</span>
                         <input type="number" value={decisions.hr.fired} onChange={e => setDecisions({...decisions, hr: {...decisions.hr, fired: Number(e.target.value)}})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-center" />
                      </div>
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white shadow-xl shadow-blue-200 space-y-6">
                      <h4 className="text-lg font-black tracking-tight">Productivity Analysis</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-blue-200">Current Yield</span>
                            <span className="text-2xl font-black">97.4%</span>
                         </div>
                         <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full w-[97.4%]"></div>
                         </div>
                      </div>
                      <p className="text-xs text-blue-100 leading-relaxed italic">
                        "Your current training investment of {decisions.hr.trainingPercent}% is yielding a stable performance. Competitive firms are at 12%."
                      </p>
                   </div>
                </div>
              </div>
            )}

            {activeSection === 'production' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Global Logistics</h4>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                              <span className="text-sm font-bold">MPA Supply Node</span>
                              <input type="number" value={decisions.production.purchaseMPA} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: Number(e.target.value)}})} className="w-32 p-3 bg-white border border-slate-200 rounded-xl text-right font-mono font-bold" />
                           </div>
                           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                              <span className="text-sm font-bold">MPB Supply Node</span>
                              <input type="number" value={decisions.production.purchaseMPB} onChange={e => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: Number(e.target.value)}})} className="w-32 p-3 bg-white border border-slate-200 rounded-xl text-right font-mono font-bold" />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-10">
                     <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Assembly Intensity</h4>
                        <div className="space-y-4">
                           <input type="range" min="0" max="100" value={decisions.production.activityLevel} onChange={e => setDecisions({...decisions, production: {...decisions.production, activityLevel: Number(e.target.value)}})} className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-300">Minimum Node</span>
                              <span className="text-3xl font-black text-slate-900">{decisions.production.activityLevel}%</span>
                              <span className="text-[10px] font-black text-slate-300">Max Capacity</span>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-500">Unit Cost Projection</span>
                              <span className="font-black text-emerald-600 font-mono">${projections.unitCost.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeSection === 'finance' && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                 <ShieldCheck size={64} className="mb-6 opacity-10" />
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Financial Vault</h3>
                 <p className="max-w-xs text-center text-sm font-medium text-slate-400">CapEx and Treasury modules are currently calibrating based on initial balance structure.</p>
              </div>
            )}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Settings size={18} className="text-blue-500" />
                <span className="text-xs font-medium text-slate-500">Decisions are synchronized via Supabase Realtime</span>
             </div>
             <button 
               onClick={() => setIsSaving(true)}
               className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-blue-600 hover:scale-105 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3"
             >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Lock Round Decisions</>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
