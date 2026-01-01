
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
  Newspaper,
  ShieldCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS } from '../constants';
import { Branch, ChampionshipTemplate, ScenarioType } from '../types';
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
    scenarioType: 'simulated' as ScenarioType,
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
    },
    realDataWeights: {
      inflation: 0.8,
      demand: 0.5,
      currency: 1.0
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
          scenarioType: formData.scenarioType,
          inflationRate: 0.04,
          demandMultiplier: 1.0,
          interestRate: 0.12,
          marketVolatility: 0.2,
          esgPriority: 0.5,
          activeEvent: null,
          aiOpponents: formData.aiOpponents,
          gazetaConfig: formData.gazetaConfig,
          realDataWeights: formData.realDataWeights
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
              {s === 1 ? 'Scenario Template' : s === 2 ? 'Ecosystem Hub' : s === 3 ? 'Account Structure' : 'Final Deploy'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Arena Selection (v5.0 GOLD)</h2>
              <p className="text-slate-500 mt-2">Escolha uma estrutura inicial pré-auditada ou crie um cenário autoral.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pb-4">
               <button 
                 onClick={() => setFilterBranch('all')}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterBranch === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                 All Sectors
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
                  <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tighter leading-none">Custom Build</h3>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">Crie cada rubrica contábil e variável de mercado do zero para uma simulação 100% personalizada.</p>
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
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{t.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{t.sector}</p>
                    <p className="text-slate-500 text-xs mt-3 line-clamp-3 leading-relaxed font-medium">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence & Scale Config</h2>
              <p className="text-slate-500 mt-2">Configure o alcance regional e a integração com dados reais de mercado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12 space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Arena Identifier (Name)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-bold text-lg"
                  placeholder="Ex: Campeonato Industrial Brasileiro 2026"
                />
              </div>

              {/* Scenario Type Selection (NEW) */}
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setFormData({...formData, scenarioType: 'simulated'})}
                  className={`p-8 rounded-[3rem] border-2 text-left transition-all relative ${
                    formData.scenarioType === 'simulated' ? 'border-blue-600 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${formData.scenarioType === 'simulated' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                      <Layers size={24} />
                    </div>
                    <h3 className={`text-xl font-black uppercase tracking-tighter ${formData.scenarioType === 'simulated' ? 'text-slate-900' : ''}`}>Scenario Simulado</h3>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">Controle total do tutor. Defina inflação, demanda e juros manualmente através de schedules e oscilações programadas.</p>
                </button>

                <button 
                  onClick={() => setFormData({...formData, scenarioType: 'real'})}
                  className={`p-8 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${
                    formData.scenarioType === 'real' ? 'border-emerald-600 bg-emerald-50/50 shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <Sparkles size={120} />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${formData.scenarioType === 'real' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                      <Globe size={24} />
                    </div>
                    <h3 className={`text-xl font-black uppercase tracking-tighter ${formData.scenarioType === 'real' ? 'text-slate-900' : ''}`}>Real-Time AI Grounding</h3>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">Fidelidade máxima. A IA busca dados reais de mercado (IPCA, Dólar, Commodities) e os utiliza para influenciar a economia da arena.</p>
                </button>
              </div>

              <div className="lg:col-span-6 space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="text-blue-600" size={24} />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Market Occupancy (Bots)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={formData.aiOpponents.enabled}
                      onChange={e => setFormData({...formData, aiOpponents: { ...formData.aiOpponents, enabled: e.target.checked }})}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span className="text-[10px] font-black uppercase text-slate-400">Active</span>
                  </div>
                </div>
                {formData.aiOpponents.enabled && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                      <span>Total AI Entities</span>
                      <span className="text-blue-600 font-bold">{formData.aiOpponents.count}</span>
                    </div>
                    <input 
                      type="range" min="0" max="11" step="1"
                      value={formData.aiOpponents.count}
                      onChange={e => setFormData({...formData, aiOpponents: { ...formData.aiOpponents, count: parseInt(e.target.value) }})}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-500" size={24} />
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Regional Scale</label>
                </div>
                <div className="flex items-center gap-6">
                   <input 
                     type="range" min="1" max="15" step="1"
                     value={formData.regionsCount}
                     onChange={e => setFormData({...formData, regionsCount: parseInt(e.target.value)})}
                     className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                   <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-xl text-xl">
                     {formData.regionsCount}
                   </div>
                </div>
              </div>

              {formData.scenarioType === 'real' && (
                <div className="lg:col-span-12 bg-emerald-900 p-10 rounded-[3rem] text-emerald-50 space-y-8 animate-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center gap-3">
                      <TrendingUp size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">AI Integration Weighting</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>Impacto Inflação</span><span>{(formData.realDataWeights.inflation * 100).toFixed(0)}%</span></div>
                         <input type="range" min="0" max="1" step="0.1" value={formData.realDataWeights.inflation} onChange={e => setFormData({...formData, realDataWeights: {...formData.realDataWeights, inflation: parseFloat(e.target.value)}})} className="w-full accent-emerald-400" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>Impacto Demanda</span><span>{(formData.realDataWeights.demand * 100).toFixed(0)}%</span></div>
                         <input type="range" min="0" max="1" step="0.1" value={formData.realDataWeights.demand} onChange={e => setFormData({...formData, realDataWeights: {...formData.realDataWeights, demand: parseFloat(e.target.value)}})} className="w-full accent-emerald-400" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>Peso Câmbio/USD</span><span>{(formData.realDataWeights.currency * 100).toFixed(0)}%</span></div>
                         <input type="range" min="0" max="1" step="0.1" value={formData.realDataWeights.currency} onChange={e => setFormData({...formData, realDataWeights: {...formData.realDataWeights, currency: parseFloat(e.target.value)}})} className="w-full accent-emerald-400" />
                      </div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                      <Info size={16} className="text-emerald-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pesos definem a influência dos dados externos vs. engine interno.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Economic Master Template</h2>
              <p className="text-slate-500 mt-2">Mapeie as rubricas contábeis iniciais que serão clonadas para todas as equipes.</p>
            </div>
            
            <FinancialStructureEditor 
                onChange={setFinancials} 
                initialData={selectedTemplate?.initial_financials} 
            />
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-12 py-10">
            <div className="relative inline-block">
               <div className="w-32 h-32 bg-slate-900 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative z-10">
                  <ShieldCheck size={64} className="text-emerald-400" />
               </div>
               <div className="absolute -inset-8 bg-blue-500/10 blur-[60px] rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-3">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Initialize Arena</h2>
               <p className="text-slate-500 font-medium text-lg">Protocolo Empirion v5.0 GOLD pronto para deployment imediato.</p>
            </div>
            
            <div className="max-w-md mx-auto p-10 bg-slate-50 rounded-[4rem] border border-slate-200 text-left space-y-6 shadow-inner">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scenario Mode</span>
                 <span className={`font-black uppercase text-xs ${formData.scenarioType === 'real' ? 'text-emerald-600' : 'text-blue-600'}`}>{formData.scenarioType} AI</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sectors Active</span>
                 <span className="text-slate-900 font-bold uppercase text-xs">{formData.branch}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Market Occupancy</span>
                 <span className="text-slate-900 font-bold uppercase text-xs">{formData.aiOpponents.enabled ? `${formData.aiOpponents.count} Bots` : 'Manual Players'}</span>
               </div>
               <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Initial Assets</span>
                 <span className="text-slate-900 font-black text-3xl font-mono">${(financials?.balance_sheet?.total_assets || selectedTemplate?.initial_financials?.balance_sheet?.total_assets || 0).toLocaleString()}</span>
               </div>
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
