import React, { useState, useEffect } from 'react';
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
  FileText,
  Loader2,
  MapPin,
  TrendingUp,
  Package,
  Lock,
  Unlock
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS } from '../constants';
import { Branch } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { supabase } from '../services/supabase';

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [financials, setFinancials] = useState<any>(null); // State for the structure editor
  const [formData, setFormData] = useState({
    name: '',
    branch: 'industrial' as Branch,
    templateId: '',
    salesMode: 'internal',
    scenarioType: 'simulated',
    transparency: 'medium',
    regionsCount: 9,
    initialStock: 30000,
    initialPrice: 340,
    currency: 'BRL',
    isPublic: false
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    if (formData.templateId && formData.templateId !== 'scratch') {
      const template = CHAMPIONSHIP_TEMPLATES.find(t => t.id === formData.templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          branch: template.branch,
          regionsCount: template.config.regionsCount,
          initialStock: template.config.initialStock,
          initialPrice: template.config.initialPrice,
          currency: template.config.currency
        }));
      }
    }
  }, [formData.templateId]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('championships')
        .insert([{
          name: formData.name,
          branch: formData.branch,
          sales_mode: formData.salesMode,
          scenario_type: formData.scenarioType,
          transparency_level: formData.transparency,
          currency: formData.currency,
          is_public: formData.isPublic,
          status: 'active',
          tutor_id: user?.id,
          config: {
            regionsCount: formData.regionsCount,
            initialStock: formData.initialStock,
            initialPrice: formData.initialPrice
          },
          initial_financials: financials || {}, 
          products: [] 
        }]);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error("Error launching championship:", error);
      alert("Failed to launch championship. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
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
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Scenario Selection</h2>
              <p className="text-slate-500 mt-2">Base your championship on a proven model or start fresh.</p>
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
                <h3 className="font-bold text-slate-900 text-lg">Custom Build</h3>
                <p className="text-slate-500 text-sm mt-1">Full control over every economic variable and account mapping.</p>
              </button>

              {CHAMPIONSHIP_TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFormData({...formData, templateId: t.id})}
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
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Market Foundations</h2>
              <p className="text-slate-500 mt-2">Define regional reach and starting equilibrium.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Simulation Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-semibold"
                  placeholder="Ex: Industrial Masters 2025"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Unlock size={14} className="text-blue-500" /> Visibility
                </label>
                <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                   <button 
                     onClick={() => setFormData({...formData, isPublic: false})}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${!formData.isPublic ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                   >
                     <Lock size={14} /> Private
                   </button>
                   <button 
                     onClick={() => setFormData({...formData, isPublic: true})}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formData.isPublic ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                   >
                     <Unlock size={14} /> Public
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <MapPin size={14} className="text-blue-500" /> Active Regions (N)
                </label>
                <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                   <input 
                     type="range" min="1" max="15" step="1"
                     value={formData.regionsCount}
                     onChange={e => setFormData({...formData, regionsCount: parseInt(e.target.value)})}
                     className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                   <span className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-sm">
                     {formData.regionsCount}
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Package size={14} className="text-emerald-500" /> Initial Inventory Units
                </label>
                <input 
                  type="number"
                  value={formData.initialStock}
                  onChange={e => setFormData({...formData, initialStock: parseInt(e.target.value) || 0})}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 font-mono font-bold"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <TrendingUp size={14} className="text-amber-500" /> Starting Market Price
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                  <span className="p-5 font-black text-slate-400 bg-slate-100/50 border-r border-slate-200">{formData.currency}</span>
                  <input 
                    type="number"
                    value={formData.initialPrice}
                    onChange={e => setFormData({...formData, initialPrice: parseFloat(e.target.value) || 0})}
                    className="flex-1 p-5 bg-transparent outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Industry Segment</label>
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
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Economic Blueprint</h2>
              <p className="text-slate-500 mt-2">Map the opening balance and income structure for all competing firms.</p>
            </div>
            
            <FinancialStructureEditor onChange={setFinancials} />
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
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Deploy to Market</h2>
            
            <div className="max-w-md mx-auto p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left space-y-4 shadow-inner">
               <div className="flex justify-between">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scenario:</span>
                 <span className="text-slate-900 font-bold">{formData.name || 'Untitled'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Regional Nodes:</span>
                 <span className="text-slate-900 font-bold">{formData.regionsCount} Regions</span>
               </div>
               <div className="flex justify-between pt-6 border-t border-slate-200">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Initial Assets:</span>
                 <span className="text-emerald-600 font-black text-lg">{formData.currency} 1,250,000</span>
               </div>
            </div>
            <div className="flex items-center gap-3 justify-center text-slate-400 text-sm">
              <FileText size={18} />
              <span>Gemini AI will finalize the Economic Prospectus</span>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between pt-10 border-t border-slate-100">
          <button 
            onClick={step === 1 ? onComplete : prevStep}
            disabled={isSubmitting}
            className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
          >
            {step === 1 ? 'Abort' : 'Previous Step'}
          </button>
          <button 
            onClick={step === 4 ? handleLaunch : nextStep}
            disabled={(step === 2 && !formData.name) || isSubmitting}
            className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
              (step === 2 && !formData.name) || isSubmitting ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105 shadow-xl shadow-slate-200'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (step === 4 ? 'Launch Simulation' : 'Continue')} 
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipWizard;