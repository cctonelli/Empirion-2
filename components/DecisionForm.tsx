
import React, { useState } from 'react';
import { Save, Info, Users, RotateCcw } from 'lucide-react';

const DecisionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    price: 150,
    marketing: 5000,
    production: 1000,
    rd: 2500,
    training: 1500
  });

  const handleChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Decision Entry - Round 4</h2>
            <p className="text-slate-500">Collaborative edits are saved in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {String.fromCharCode(64 + i)}
                    </div>
                ))}
             </div>
             <span className="text-xs font-medium text-slate-400">3 Members Editing</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Core Operations</h3>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Unit Price (BRL)
                <span className="text-blue-600">R$ {formData.price}</span>
              </label>
              <input 
                type="range" min="50" max="500" step="5"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min: R$ 50</span>
                <span>Max: R$ 500</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Production Quantity
                <span className="text-blue-600">{formData.production} units</span>
              </label>
              <input 
                type="number"
                value={formData.production}
                onChange={(e) => handleChange('production', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Growth & Development</h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                Marketing Budget
                <span className="text-blue-600">R$ {formData.marketing.toLocaleString()}</span>
              </label>
              <input 
                type="number"
                value={formData.marketing}
                onChange={(e) => handleChange('marketing', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                R&D Investment
                <span className="text-blue-600">R$ {formData.rd.toLocaleString()}</span>
              </label>
              <input 
                type="number"
                value={formData.rd}
                onChange={(e) => handleChange('rd', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3 text-slate-600">
             <Info size={18} className="text-blue-500" />
             <p className="text-sm">Total estimated expenditure for this round: <span className="font-bold">R$ {(formData.marketing + formData.rd + formData.training).toLocaleString()}</span></p>
           </div>
           <div className="flex gap-4">
             <button className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
               <RotateCcw size={18} /> Reset
             </button>
             <button className="px-8 py-2.5 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
               <Save size={18} /> Finalize Decisions
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Users size={20} className="text-slate-400" /> Decision Audit Log
        </h3>
        <div className="space-y-4">
          {[
            { user: 'Bruno M.', action: 'Updated Price to R$ 155', time: '2 mins ago' },
            { user: 'Clarissa S.', action: 'Increased Production by 200 units', time: '15 mins ago' },
            { user: 'Admin', action: 'Round 4 initialized', time: '2 hours ago' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{log.user[0]}</div>
                 <div>
                   <p className="text-sm font-medium text-slate-800">{log.action}</p>
                   <p className="text-xs text-slate-400">{log.user}</p>
                 </div>
               </div>
               <span className="text-xs text-slate-400 italic">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
