
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Info, Users, RotateCcw, TrendingUp, 
  ShoppingCart, Factory, Tag, Megaphone, 
  Truck, Users2, Building2, Wallet, ChevronRight,
  ShieldCheck, AlertCircle, Settings, Loader2
} from 'lucide-react';
import { supabase, subscribeToDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData } from '../types';

const INITIAL_DECISIONS: DecisionData = {
  purchases: {
    materialA: { volume: 500, supplier: 'local', contract: 'spot' },
    materialB: { volume: 300, supplier: 'local', contract: 'spot' },
  },
  production: {
    line1: 1000,
    line2: 0,
    modernizationLevel: 0.1,
  },
  marketing: {
    branding: 5000,
    digital: 10000,
    traditional: 2000,
  },
  pricing: {
    productA: { price: 150, localAllocation: 0.8 },
    productB: { price: 200, localAllocation: 1.0 },
  },
  logistics: {
    shippingMode: 'land',
  },
  hr: {
    hiring: 5,
    trainingBudget: 2500,
    salaryMultiplier: 1.0,
  },
  finance: {
    dividends: 0,
    loansRequest: 0,
    sharesBuyback: 0,
  },
};

const DecisionForm: React.FC = () => {
  const [activeSection, setActiveSection] = useState('purchases');
  const [decisions, setDecisions] = useState<DecisionData>(INITIAL_DECISIONS);
  const [projections, setProjections] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [teamId] = useState('mock-team-123'); // Placeholder para o ID real do time

  // Sincronização Realtime
  useEffect(() => {
    const channel = subscribeToDecisions(teamId, (payload) => {
      if (payload.new && payload.new.data) {
        setDecisions(payload.new.data as DecisionData);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  // Projeções Locais (Matemática Bonopoly)
  useEffect(() => {
    const proj = calculateProjections(decisions, 'industrial');
    setProjections(proj);
  }, [decisions]);

  // Persistência das Decisões (Auto-save ou Manual)
  const saveDecisions = useCallback(async (data: DecisionData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('current_decisions')
        .upsert({
          team_id: teamId,
          championship_id: 'mock-champ-456', // Placeholder
          round: 4,
          data: data,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save decisions:", err);
    } finally {
      setTimeout(() => setIsSaving(false), 1000); // Feedback visual
    }
  }, [teamId]);

  const updateNested = (path: string, value: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      // Opcional: Trigger auto-save aqui com debounce
      return next;
    });
  };

  const sections = [
    { id: 'purchases', label: 'Procurement', icon: ShoppingCart },
    { id: 'production', label: 'Production', icon: Factory },
    { id: 'pricing', label: 'Pricing & Mix', icon: Tag },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'hr', label: 'Human Resources', icon: Users2 },
    { id: 'finance', label: 'Finance & CapEx', icon: Building2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-20">
      {/* Navigation Sidebar */}
      <aside className="w-full lg:w-72 space-y-2 shrink-0">
        <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Strategic Areas</h3>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group ${
              activeSection === s.id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <s.icon size={20} className={activeSection === s.id ? 'text-blue-400' : 'text-slate-300'} />
              <span className="font-black text-xs uppercase tracking-widest">{s.label}</span>
            </div>
            <ChevronRight size={16} className={activeSection === s.id ? 'opacity-100' : 'opacity-0'} />
          </button>
        ))}

        <div className="mt-12 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
          <TrendingUp className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" size={100} />
          <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-80">Projected Cash</h4>
          <span className="text-3xl font-black">R$ {projections?.projectedCash.toLocaleString() || '0'}</span>
          <p className="text-[10px] mt-4 font-bold text-blue-100 flex items-center gap-2 italic">
             <AlertCircle size={12} /> Simulations are estimates
          </p>
        </div>
      </aside>

      {/* Main Form Area */}
      <div className="flex-1 space-y-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeSection} Control</h2>
              <p className="text-slate-500 font-medium">Decisions for Round 4 | Collaborating in real-time</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white flex items-center justify-center text-xs font-black">AM</div>
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white flex items-center justify-center text-xs font-black">CS</div>
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-black">+2</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {activeSection === 'purchases' && (
              <>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material A (Primary)</h4>
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-700">Purchase Volume (Units)</label>
                    <input 
                      type="number"
                      value={decisions.purchases.materialA.volume}
                      onChange={(e) => updateNested('purchases.materialA.volume', parseInt(e.target.value) || 0)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-700">Contract Type</label>
                    <div className="flex gap-2">
                       {['spot', 'long'].map(t => (
                         <button 
                           key={t}
                           onClick={() => updateNested('purchases.materialA.contract', t)}
                           className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                             decisions.purchases.materialA.contract === t ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400'
                           }`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Context</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    "Material A prices are volatile this round. Spot prices are R$ 12/unit while Long-term contracts lock at R$ 14 but guarantee supply during shortages."
                  </p>
                </div>
              </>
            )}

            {activeSection === 'production' && (
              <>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                       Main Line Output
                       <span className="text-blue-600">{decisions.production.line1} u</span>
                    </label>
                    <input 
                      type="range" min="0" max="2500" step="50"
                      value={decisions.production.line1}
                      onChange={(e) => updateNested('production.line1', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                       <span>Efficiency: 88%</span>
                       <span>Max: 2500 u</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                     <div className="p-3 bg-white rounded-xl shadow-sm">
                       <TrendingUp className="text-emerald-500" size={20} />
                     </div>
                     <div>
                       <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest">Est. Unit Cost</span>
                       <span className="text-xl font-black text-slate-900">R$ {projections?.unitCost.toFixed(2) || '0.00'}</span>
                     </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'pricing' && (
              <div className="col-span-2 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product A Strategy</h4>
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700">Market Price (BRL)</label>
                        <input 
                          type="number"
                          value={decisions.pricing.productA.price}
                          onChange={(e) => updateNested('pricing.productA.price', parseInt(e.target.value) || 0)}
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-100 outline-none text-xl font-black"
                        />
                      </div>
                   </div>
                   <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Real-time Margin Analysis</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-400">Unit Price:</span>
                           <span className="font-bold">R$ {decisions.pricing.productA.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-400">Unit Cost (Est):</span>
                           <span className="font-bold text-red-400">R$ {projections?.unitCost.toFixed(2)}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between">
                           <span className="text-blue-400 font-black uppercase text-xs">Gross Margin:</span>
                           <span className="text-xl font-black text-emerald-400">
                             {(((decisions.pricing.productA.price - (projections?.unitCost || 0)) / decisions.pricing.productA.price) * 100).toFixed(1)}%
                           </span>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            )}
            
            {/* Catch-all for other sections placeholder */}
            {!['purchases', 'production', 'pricing'].includes(activeSection) && (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-300">
                 <Settings size={48} className="animate-spin-slow mb-4 opacity-10" />
                 <p className="font-black text-xs uppercase tracking-widest">Under Simulation Calibration</p>
              </div>
            )}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <Info size={18} className="text-blue-500" />
               <p className="text-xs font-medium text-slate-500">
                 Changes are shared with <span className="text-slate-900 font-bold">3 other members</span>. Click Finalize to lock.
               </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <button 
                onClick={() => setDecisions(INITIAL_DECISIONS)}
                className="flex-1 md:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                 <RotateCcw size={16} /> Reset Section
               </button>
               <button 
                onClick={() => saveDecisions(decisions)}
                disabled={isSaving}
                className="flex-1 md:flex-none px-12 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 min-w-[200px]"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Submit Round 4</>}
               </button>
            </div>
          </div>
        </div>

        {/* Real-time Presence / Activity Feed */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" /> Collaboration Feed
              </h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase text-slate-400">Live Connection</span>
              </div>
           </div>
           <div className="space-y-6">
              {[
                { user: 'Clarissa S.', action: 'Increased Digital Marketing by R$ 2,000', time: 'Just now', color: 'bg-emerald-500' },
                { user: 'Bruno M.', action: 'Modified Logistics to Shipping (Sea)', time: '5 mins ago', color: 'bg-blue-500' },
                { user: 'Admin', action: 'Round 4 initialized from previous data', time: '2 hours ago', color: 'bg-slate-900' },
              ].map((log, i) => (
                <div key={i} className="flex items-start justify-between group">
                   <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl ${log.color} text-white flex items-center justify-center font-black text-xs shadow-lg shadow-current/20 shrink-0`}>
                        {log.user[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{log.action}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black mt-1">{log.user}</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-300 italic group-hover:text-slate-400 transition-colors">{log.time}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
