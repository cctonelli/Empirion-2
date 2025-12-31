
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
  Leaf,
  FileText
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS } from '../constants';
import { Branch } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';

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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step > s ? <Check size={18} /> : s}
            </div>
            <span className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Template' : s === 2 ? 'Config' : s === 3 ? 'Structure' : 'Launch'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose your scenario</h2>
              <p className="text-slate-500 mt-2">Select a predefined template or start from scratch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setFormData({...formData, templateId: 'scratch'})}
                className={`p-8 rounded-[2rem] border-2 text-left transition-all ${
                  formData.templateId === 'scratch' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4">
                   <Plus size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Custom Scenario</h3>
                <p className="text-slate-500 text-sm mt-1">Configure every detail manually for total control over accounts and products.</p>
              </button>

              {CHAMPIONSHIP_TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFormData({...formData, templateId: t.id, branch: t.branch})}
                  className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                    formData.templateId === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl">{BRANCH_CONFIGS[t.branch].icon}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{BRANCH_CONFIGS[t.branch].icon}</span>
                    <span className="px-3 py-1 bg-white text-[10px] font-black text-slate-500 rounded-full uppercase tracking-tighter border border-slate-100">
                      {t.branch}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{t.name}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">General Parameters</h2>
              <p className="text-slate-500 mt-2">Fine-tune the championship rules and basic identity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Championship Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-semibold"
                  placeholder="Ex: Brazilian Agro Cup 2026"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Business Branch</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(BRANCH_CONFIGS) as Branch[]).map(b => (
                    <button
                      key={b}
                      onClick={() => setFormData({...formData, branch: b})}
                      className={`p-4 rounded-2xl border-2 text-xs font-black transition-all flex items-center gap-2 ${
                        formData.branch === b ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-500 bg-slate-50/50'
                      }`}
                    >
                      <span>{BRANCH_CONFIGS[b].icon}</span> {BRANCH_CONFIGS[b].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Scenario Engine</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFormData({...formData, scenarioType: 'simulated'})}
                    className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.scenarioType === 'simulated' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <Layers size={24} /> <span className="font-bold">Simulated</span>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, scenarioType: 'real'})}
                    className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.scenarioType === 'real' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <Globe size={24} /> <span className="font-bold">Real Live</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Transparency</label>
                <select 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold cursor-pointer focus:ring-4 focus:ring-blue-100"
                  value={formData.transparency}
                  onChange={e => setFormData({...formData, transparency: e.target.value as any})}
                >
                  <option value="low">Low (Total Anonymity)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Visible Competitor KPIs)</option>
                  <option value="full">Full (Open Financial Data)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Blueprint</h2>
              <p className="text-slate-500 mt-2">Customize the Plano de Contas and sub-accounts for this simulation.</p>
            </div>
            
            <FinancialStructureEditor />
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-8 py-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-300 relative z-10">
                <Zap size={48} className="fill-current" />
              </div>
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full z-0 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ignite the Empire!</h2>
            
            <div className="max-w-md mx-auto p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left space-y-4 shadow-inner">
               <div className="flex justify-between">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Campaign:</span>
                 <span className="text-slate-900 font-bold">{formData.name || 'Untitled'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Market Branch:</span>
                 <span className="text-slate-900 font-bold flex items-center gap-2">
                   {BRANCH_CONFIGS[formData.branch].icon} {BRANCH_CONFIGS[formData.branch].label}
                 </span>
               </div>
               <div className="flex justify-between pt-6 border-t border-slate-200">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Initial Assets:</span>
                 <span className="text-emerald-600 font-black text-lg">R$ 1,250,000</span>
               </div>
            </div>
            <div className="flex items-center gap-3 justify-center text-slate-400 text-sm">
              <FileText size={18} />
              <span>Initial Executive Report will be generated by Gemini AI</span>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between pt-10 border-t border-slate-100">
          <button 
            onClick={step === 1 ? onComplete : prevStep}
            className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
          >
            {step === 1 ? 'Discard' : 'Go Back'}
          </button>
          <button 
            onClick={step === 4 ? onComplete : nextStep}
            disabled={step === 2 && !formData.name}
            className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
              step === 2 && !formData.name ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105 shadow-xl shadow-slate-200'
            }`}
          >
            {step === 4 ? 'Launch Simulation' : 'Next Stage'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipWizard;
