
import React, { useState } from 'react';
import { 
  Plus, 
  ArrowRight, 
  Check, 
  Settings, 
  Globe, 
  Layers, 
  Cpu, 
  Zap,
  Leaf
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS } from '../constants';
import { Branch } from '../types';

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    branch: 'industrial' as Branch,
    templateId: '',
    salesMode: 'internal',
    scenarioType: 'simulated',
    transparency: 'medium'
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step > s ? <Check size={18} /> : s}
            </div>
            <span className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Template' : s === 2 ? 'Config' : 'Finalize'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Choose your scenario</h2>
              <p className="text-slate-500 mt-2">Select a predefined template or start from scratch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setFormData({...formData, templateId: 'scratch'})}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  formData.templateId === 'scratch' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4">
                   <Plus size={24} />
                </div>
                <h3 className="font-bold text-slate-900">Custom Scenario</h3>
                <p className="text-slate-500 text-sm mt-1">Configure every detail manually for total control.</p>
              </button>

              {CHAMPIONSHIP_TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFormData({...formData, templateId: t.id, branch: t.branch})}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                    formData.templateId === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl">{BRANCH_CONFIGS[t.branch].icon}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{BRANCH_CONFIGS[t.branch].icon}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-tighter">
                      {t.branch}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Configure Parameters</h2>
              <p className="text-slate-500 mt-2">Fine-tune the championship rules and mechanics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Championship Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ex: Winter Challenge 2026"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Business Branch</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BRANCH_CONFIGS) as Branch[]).map(b => (
                    <button
                      key={b}
                      onClick={() => setFormData({...formData, branch: b})}
                      className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        formData.branch === b ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      {BRANCH_CONFIGS[b].icon} {BRANCH_CONFIGS[b].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Scenario Type</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFormData({...formData, scenarioType: 'simulated'})}
                    className={`flex-1 p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      formData.scenarioType === 'simulated' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <Layers size={20} /> <span className="font-bold">Simulated</span>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, scenarioType: 'real'})}
                    className={`flex-1 p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      formData.scenarioType === 'real' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <Globe size={20} /> <span className="font-bold">Real Live</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Transparency Level</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  value={formData.transparency}
                  onChange={e => setFormData({...formData, transparency: e.target.value})}
                >
                  <option value="low">Low (Total Anonymity)</option>
                  <option value="medium" selected>Medium (Standard)</option>
                  <option value="high">High (Visible Competitor KPIs)</option>
                  <option value="full">Full (Open Data)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-8 py-10">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={40} className="fill-current" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">Ready to Launch?</h2>
            <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-4">
               <div className="flex justify-between">
                 <span className="text-slate-400 font-medium">Scenario:</span>
                 <span className="text-slate-900 font-bold">{formData.name || 'Untitled Championship'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400 font-medium">Branch:</span>
                 <span className="text-slate-900 font-bold capitalize">{formData.branch}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400 font-medium">Type:</span>
                 <span className="text-slate-900 font-bold capitalize">{formData.scenarioType}</span>
               </div>
               <div className="flex justify-between pt-4 border-t border-slate-200">
                 <span className="text-slate-400 font-medium">Initial Equity:</span>
                 <span className="text-emerald-600 font-bold">R$ 1,000,000.00</span>
               </div>
            </div>
            <p className="text-slate-500 max-w-sm mx-auto">Click "Launch Empire" to initialize the first round and notify all registered teams.</p>
          </div>
        )}

        <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
          <button 
            onClick={step === 1 ? onComplete : prevStep}
            className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button 
            onClick={step === 3 ? onComplete : nextStep}
            disabled={step === 2 && !formData.name}
            className={`px-10 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              step === 2 && !formData.name ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
            }`}
          >
            {step === 3 ? 'Launch Empire' : 'Continue'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipWizard;
