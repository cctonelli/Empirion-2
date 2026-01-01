
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
  Unlock,
  Info,
  BarChart3,
  Search,
  Filter,
  Building2,
  Landmark,
  Bot,
  Newspaper
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS } from '../constants';
import { Branch, ChampionshipTemplate } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { supabase } from '../services/supabase';

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [financials, setFinancials] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(null);
  const [filterBranch, setFilterBranch] = useState<Branch | 'all'>('all');
  
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
    isPublic: false,
    aiOpponents: {
      enabled: true,
      count: 7,
      strategy: 'balanced' as 'aggressive' | 'conservative' | 'balanced'
    },
    gazetaConfig: {
      focus: ['análise da CVM', 'reajuste de insumos', 'liderança do setor'],
      style: 'analytical' as 'sensationalist' | 'analytical' | 'neutral'
    }
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    if (formData.templateId && formData.templateId !== 'scratch') {
      const template = CHAMPIONSHIP_TEMPLATES.find(t => t.id === formData.templateId);
      if (template) {
        setSelectedTemplate(template);
        setFormData(prev => ({
          ...prev,
          branch: template.branch,
          regionsCount: template.config.regionsCount || 9,
          initialStock: template.products[0]?.initial_stock || 0,
          initialPrice: template.products[0]?.suggested_price || 340,
          currency: template.config.currency,
          salesMode: template.config.sales_mode,
          scenarioType: template.config.scenario_type,
          transparency: template.config.transparency_level
        }));
        setFinancials(template.initial_financials);
      }
    } else if (formData.templateId === 'scratch') {
        setSelectedTemplate(null);
    }
  }, [formData.templateId]);

  const filteredTemplates = CHAMPIONSHIP_TEMPLATES.filter(t => 
    filterBranch === 'all' || t.branch === filterBranch
  );

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload: any = {
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
          initialPrice: formData.initialPrice,
          aiOpponents: formData.aiOpponents,
          gazetaConfig: formData.gazetaConfig
        },
        ecosystem_config: {
          inflationRate: 0.04,
          demandMultiplier: 1.0,
          interestRate: 0.12,
          marketVolatility: 0.2,
          esgPriority: 0.5,
          activeEvent: null,
          aiOpponents: formData.aiOpponents,
          gazetaConfig: formData.gazetaConfig
        },
        initial_financials: financials || selectedTemplate?.initial_financials || {}, 
        market_indicators: selectedTemplate?.market_indicators || {},
        resources: selectedTemplate?.resources || {},
        products: selectedTemplate?.products || []
      };

      const { error } = await supabase
        .from('championships')
        .insert([payload]);

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
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
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
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Scenario Selection (v5.0)</h2>
              <p className="text-slate-500 mt-2">12 curated templates across 6 strategic branches with AI Opponents support.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pb-4">
               <button 
                 onClick={() => setFilterBranch('all')}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterBranch === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                 All Branches
               </button>
               {(Object.keys(BRANCH_CONFIGS) as Branch[]).map(b => (
                 <button
                   key={b}
                   onClick={() => setFilterBranch(b)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterBranch === b ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   <span>{BRANCH_CONFIGS[b].icon}</span> {BRANCH_CONFIGS[b].label}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={() => setFormData({...formData, templateId: 'scratch'})}
                className={`p-6 rounded-[2.5rem] border-2 text-left transition-all flex flex-col justify-between min-h-[220px] ${
                  formData.templateId === 'scratch' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4">
                     <Plus size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Custom Build</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">Defina cada variável econômica e mapeamento de contas do zero para um cenário 100% autoral.</p>
                </div>
              </button>

              {filteredTemplates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFormData({...formData, templateId: t.id})}
                  className={`p-6 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group flex flex-col justify-between min-h-[220px] ${
                    formData.templateId === t.id ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30 shadow-sm'
                  }`}
                >
                  <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-9xl">{BRANCH_CONFIGS[t.branch].icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                        {BRANCH_CONFIGS[t.branch].icon}
                      </div>
                      <span className="px-2.5 py-1 bg-white text-[9px] font-black text-blue-600 rounded-full uppercase tracking-tighter border border-blue-50">
                        {t.branch}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">{t.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{t.sector}</p>
                    <p className="text-slate-500 text-xs mt-3 line-clamp-3 leading-relaxed font-medium">{t.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100/50 flex justify-between items-center opacity-60">
                     <span className="text-[10px] font-bold text-slate-400">{t.config.total_rounds} Cycles</span>
                     <span className="text-[10px] font-black text-slate-900 uppercase">{t.config.currency}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Market Foundations</h2>
              <p className="text-slate-500 mt-2">Personalize o alcance regional, bots IA e a Gazeta Industrial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Simulation Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-bold text-lg"
                  placeholder="Ex: Empirion Masters 2025"
                />
              </div>

              {/* AI Opponents Toggle */}
              <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="text-blue-600" size={24} />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">AI Opponents</label>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, aiOpponents: { ...formData.aiOpponents, enabled: !formData.aiOpponents.enabled }})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.aiOpponents.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.aiOpponents.enabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                {formData.aiOpponents.enabled && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Bot Count (Fill gap to 8)</span>
                      <span className="text-sm font-black text-blue-600">{formData.aiOpponents.count}</span>
                    </div>
                    <input 
                      type="range" min="0" max="11" step="1"
                      value={formData.aiOpponents.count}
                      onChange={e => setFormData({...formData, aiOpponents: { ...formData.aiOpponents, count: parseInt(e.target.value) }})}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <select 
                      value={formData.aiOpponents.strategy}
                      onChange={e => setFormData({...formData, aiOpponents: { ...formData.aiOpponents, strategy: e.target.value as any }})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none"
                    >
                      <option value="balanced">Balanced Strategy</option>
                      <option value="aggressive">Aggressive (Price War)</option>
                      <option value="conservative">Conservative (Safety First)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Gazeta IA Config */}
              <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <div className="flex items-center gap-3">
                  <Newspaper className="text-emerald-600" size={24} />
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Gazeta IA Settings</label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Focus Areas</span>
                    <div className="flex flex-wrap gap-2">
                      {['Macro', 'Competição', 'ESG', 'CVM', 'Insumos', 'Logística'].map(focus => {
                        const isSelected = formData.gazetaConfig.focus.includes(focus);
                        return (
                          <button
                            key={focus}
                            onClick={() => {
                              const newFocus = isSelected 
                                ? formData.gazetaConfig.focus.filter(f => f !== focus)
                                : [...formData.gazetaConfig.focus, focus];
                              setFormData({...formData, gazetaConfig: { ...formData.gazetaConfig, focus: newFocus }});
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                          >
                            {focus}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Editorial Style</span>
                    <select 
                      value={formData.gazetaConfig.style}
                      onChange={e => setFormData({...formData, gazetaConfig: { ...formData.gazetaConfig, style: e.target.value as any }})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none"
                    >
                      <option value="analytical">Analytical (Expert)</option>
                      <option value="sensationalist">Sensationalist (Hype)</option>
                      <option value="neutral">Neutral (Bureaucratic)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <MapPin size={14} className="text-blue-500" /> Market Channels (Regions)
                </label>
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                   <input 
                     type="range" min="1" max="15" step="1"
                     value={formData.regionsCount}
                     onChange={e => setFormData({...formData, regionsCount: parseInt(e.target.value)})}
                     className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                   <span className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-lg text-lg">
                     {formData.regionsCount}
                   </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Economic Blueprint</h2>
              <p className="text-slate-500 mt-2">Mapeie a estrutura de contas inicial para as empresas competidoras.</p>
            </div>
            
            {selectedTemplate && (
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-center gap-6 mb-8 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Landmark className="text-blue-600" size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Blueprint: {selectedTemplate.name}</p>
                  <p className="text-xs font-medium text-blue-700/80 mt-1">Dados auditados (v5.0) pré-carregados para o setor {selectedTemplate.sector}.</p>
                </div>
              </div>
            )}
            
            <FinancialStructureEditor 
                onChange={setFinancials} 
                initialData={selectedTemplate?.initial_financials} 
            />
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-10 py-12">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-slate-900 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative z-10">
                <Zap size={64} className="fill-current text-blue-500" />
              </div>
              <div className="absolute -inset-8 bg-blue-500/10 blur-[60px] rounded-full z-0 animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Initialize Arena</h2>
              <p className="text-slate-500 font-medium text-lg">Seu império comercial está pronto para o deployment.</p>
            </div>
            
            <div className="max-w-md mx-auto p-10 bg-white rounded-[3.5rem] border border-slate-100 text-left space-y-5 shadow-2xl">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scenario ID</span>
                 <span className="text-slate-900 font-bold">{formData.name || 'Empirion Alpha'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">AI Opponents</span>
                 <span className="text-blue-600 font-bold">{formData.aiOpponents.enabled ? `Active (${formData.aiOpponents.count} Bots)` : 'Disabled'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Gazeta IA</span>
                 <span className="text-emerald-600 font-bold uppercase text-[10px]">{formData.gazetaConfig.style}</span>
               </div>
               <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Valuation</span>
                 <span className="text-emerald-600 font-black text-2xl font-mono">
                    {formData.currency} {(financials?.balance_sheet?.total_assets || selectedTemplate?.initial_financials?.balance_sheet?.total_assets || 0).toLocaleString()}
                 </span>
               </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
               <Globe size={16} /> Global Market Sync Active
            </div>
          </div>
        )}

        <div className="mt-16 flex justify-between pt-10 border-t border-slate-100">
          <button 
            onClick={step === 1 ? onComplete : prevStep}
            disabled={isSubmitting}
            className="px-10 py-5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
          >
            {step === 1 ? 'Abort Operation' : 'Reverse Phase'}
          </button>
          <button 
            onClick={step === 4 ? handleLaunch : nextStep}
            disabled={(step === 2 && !formData.name) || isSubmitting}
            className={`px-14 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${
              (step === 2 && !formData.name) || isSubmitting ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105 shadow-2xl shadow-blue-200'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (step === 4 ? 'Deploy Simulation' : 'Next Phase')} 
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipWizard;
