import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Check, Settings, Globe, Layers, Cpu, Zap, Leaf, FileText, Loader2,
  MapPin, TrendingUp, Package, Lock, Unlock, Info, BarChart3, Search, Filter, Building2,
  Landmark, Bot, Newspaper, ShieldCheck, Target, Sparkles, Gavel, ArrowLeft, Trash2, 
  DollarSign, Calculator, Activity
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS, MODALITY_INFO } from '../constants';
import { Branch, ChampionshipTemplate, ScenarioType, ModalityType, RegionConfig, MacroIndicators } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { supabase } from '../services/supabase';

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [financials, setFinancials] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(null);
  
  // State para Mercado Regional (Passo 4)
  const [regions, setRegions] = useState<RegionConfig[]>([
    { id: 1, name: 'Sudeste', demand: 5000000, initialShare: 25, suggestedPrice: 600 },
    { id: 2, name: 'Sul', demand: 3000000, initialShare: 25, suggestedPrice: 620 },
    { id: 3, name: 'Nordeste', demand: 2000000, initialShare: 25, suggestedPrice: 580 },
    { id: 4, name: 'Centro-Oeste', demand: 1500000, initialShare: 25, suggestedPrice: 590 }
  ]);

  // State para Indicadores Macro (Passo 4)
  const [macro, setMacro] = useState<MacroIndicators>({
    inflation_rate: 0.05,
    interest_rate_tr: 0.11,
    exchange_rate_usd_brl: 5.50,
    commodity_index: 100,
    average_salary: 5000
  });

  const [formData, setFormData] = useState({
    name: '',
    branch: 'industrial' as Branch,
    templateId: '',
    salesMode: 'internal',
    scenarioType: 'simulated' as ScenarioType,
    modalityType: 'standard' as ModalityType,
    transparency: 'medium',
    regionsCount: 4,
    currency: 'BRL',
    totalRounds: 12,
    roundFrequencyDays: 7,
    isPublic: false
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    if (formData.templateId && formData.templateId !== 'scratch') {
      const template = CHAMPIONSHIP_TEMPLATES.find(t => t.id === formData.templateId);
      if (template) {
        setSelectedTemplate(template);
        setFormData(prev => ({
          ...prev,
          branch: template.branch,
          regionsCount: template.config.regionsCount || 4,
          currency: template.config.currency,
          salesMode: template.config.sales_mode,
          scenarioType: template.config.scenario_type,
          modalityType: template.config.modalityType || 'standard'
        }));
        setFinancials(template.initial_financials);
      }
    }
  }, [formData.templateId]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        name: formData.name,
        branch: formData.branch,
        sales_mode: formData.salesMode,
        scenario_type: formData.scenarioType,
        status: 'active',
        tutor_id: user?.id,
        current_round: 0,
        total_rounds: formData.totalRounds,
        config: {
          regions: regions,
          macro: macro,
          transparency: formData.transparency,
          modalityType: formData.modalityType,
          roundFrequencyDays: formData.roundFrequencyDays
        },
        initial_financials: financials,
        market_indicators: { macro, regions }
      };

      const { error } = await supabase.from('championships').insert([payload]);
      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error("Launch Error:", error);
      alert("Falha ao inicializar arena. Verifique os logs da console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      {/* STEPPER HEADER */}
      <div className="flex items-center justify-between mb-16 relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-lg ${
              step >= s ? 'bg-orange-600 text-white ring-8 ring-orange-50' : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}>
              {step > s ? <Check size={20} /> : s}
            </div>
            <span className={`text-[9px] font-black uppercase mt-3 tracking-widest ${step >= s ? 'text-orange-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Identidade' : s === 2 ? 'Template' : s === 3 ? 'Balanço' : s === 4 ? 'Mercado' : 'Deploy'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex-1 p-12 md:p-16">
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Identidade da Arena</h2>
                  <p className="text-slate-500 font-medium">Defina as bases regulatórias e o nome do seu campeonato.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Arena</label>
                     <input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-900 focus:ring-8 focus:ring-orange-50 outline-none transition-all" 
                        placeholder="Ex: Torneio Industrial Bernard" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ramo de Atuação</label>
                     <select 
                        value={formData.branch} 
                        onChange={e => setFormData({...formData, branch: e.target.value as any})}
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-900 focus:ring-8 focus:ring-orange-50 outline-none transition-all"
                     >
                        {Object.keys(BRANCH_CONFIGS).map(b => (
                          <option key={b} value={b}>{BRANCH_CONFIGS[b].label}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rodadas Totais</label>
                     <input type="number" value={formData.totalRounds} onChange={e => setFormData({...formData, totalRounds: parseInt(e.target.value)})} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transparência (Oracle)</label>
                     <select value={formData.transparency} onChange={e => setFormData({...formData, transparency: e.target.value as any})} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold">
                        <option value="low">Baixa (Apenas TSR)</option>
                        <option value="medium">Média (TSR + Receita)</option>
                        <option value="high">Alta (DRE Público)</option>
                        <option value="full">Total (Balanço Aberto)</option>
                     </select>
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Seleção de Engine</h2>
                  <p className="text-slate-500 font-medium">Use um template pré-auditado ou crie um cenário Customizado.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setFormData({...formData, templateId: 'scratch'})}
                    className={`p-10 border-2 rounded-[3.5rem] text-left transition-all group ${formData.templateId === 'scratch' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                  >
                     <div className="p-4 bg-slate-900 text-white rounded-2xl w-fit mb-6 shadow-xl"><Plus size={24}/></div>
                     <h4 className="text-xl font-black text-slate-900 uppercase italic">Custom Scenary</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 leading-relaxed">Defina cada rubrica do balanço manualmente.</p>
                  </button>

                  {CHAMPIONSHIP_TEMPLATES.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setFormData({...formData, templateId: t.id})}
                      className={`p-10 border-2 rounded-[3.5rem] text-left transition-all relative overflow-hidden group ${formData.templateId === t.id ? 'border-orange-600 bg-orange-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                    >
                       <div className="p-4 bg-white rounded-2xl w-fit mb-6 shadow-sm text-2xl">{BRANCH_CONFIGS[t.branch].icon}</div>
                       <h4 className="text-xl font-black text-slate-900 uppercase italic leading-tight">{t.name}</h4>
                       <p className="text-[10px] text-slate-500 font-medium mt-4 line-clamp-2">{t.description}</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Financial Baseline</h2>
                  <p className="text-slate-500 font-medium">Os saldos iniciais que todas as equipes receberão na Rodada 0.</p>
               </div>
               <FinancialStructureEditor 
                 initialData={financials} 
                 onChange={setFinancials} 
               />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mercado & Macroeconomia</h2>
                  <p className="text-slate-500 font-medium">Distribua a demanda regional e ajuste os multiplicadores globais.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Macro Sliders */}
                  <div className="lg:col-span-4 space-y-8 bg-slate-900 p-10 rounded-[3rem] text-white">
                     <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-2"><Globe size={14}/> Indicadores Globais</h3>
                     
                     <MacroControl label="Inflação Setorial" val={`${(macro.inflation_rate * 100).toFixed(1)}%`} min={0} max={0.2} step={0.01} value={macro.inflation_rate} onChange={v => setMacro({...macro, inflation_rate: v})} />
                     <MacroControl label="Taxa TR Mensal" val={`${(macro.interest_rate_tr * 100).toFixed(1)}%`} min={0} max={0.3} step={0.01} value={macro.interest_rate_tr} onChange={v => setMacro({...macro, interest_rate_tr: v})} />
                     <MacroControl label="Câmbio (USD/BRL)" val={macro.exchange_rate_usd_brl.toFixed(2)} min={1} max={10} step={0.1} value={macro.exchange_rate_usd_brl} onChange={v => setMacro({...macro, exchange_rate_usd_brl: v})} />
                  </div>

                  {/* Regions Table */}
                  <div className="lg:col-span-8 space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest flex items-center gap-2"><MapPin size={16} className="text-orange-600"/> Demanda Regional (Round 0)</h3>
                        <button onClick={() => setRegions([...regions, { id: Date.now(), name: 'Nova Região', demand: 1000000, initialShare: 0, suggestedPrice: 500 }])} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Plus size={16}/></button>
                     </div>
                     <div className="overflow-x-auto bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                        <table className="w-full text-[10px]">
                           <thead className="bg-slate-100 text-slate-500 font-black uppercase border-b border-slate-200">
                              <tr>
                                 <th className="p-4 text-left">Região</th>
                                 <th className="p-4 text-right">Potencial Demanda</th>
                                 <th className="p-4 text-right">M. Share (%)</th>
                                 <th className="p-4 text-right">Preço Sug.</th>
                                 <th className="p-4 text-center">Ações</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200 font-bold">
                              {regions.map((reg, idx) => (
                                <tr key={reg.id} className="hover:bg-white transition-colors">
                                   <td className="p-4"><input className="bg-transparent border-b border-transparent focus:border-blue-400 outline-none w-24" value={reg.name} onChange={e => { const nr = [...regions]; nr[idx].name = e.target.value; setRegions(nr); }} /></td>
                                   <td className="p-4 text-right"><input type="number" className="bg-transparent text-right outline-none w-20" value={reg.demand} onChange={e => { const nr = [...regions]; nr[idx].demand = parseInt(e.target.value); setRegions(nr); }} /></td>
                                   <td className="p-4 text-right font-mono text-blue-600">{reg.initialShare}%</td>
                                   <td className="p-4 text-right"><input type="number" className="bg-transparent text-right outline-none w-16" value={reg.suggestedPrice} onChange={e => { const nr = [...regions]; nr[idx].suggestedPrice = parseFloat(e.target.value); setRegions(nr); }} /></td>
                                   <td className="p-4 text-center"><button onClick={() => setRegions(regions.filter(r => r.id !== reg.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                     <div className="flex justify-end pt-4">
                        <button onClick={() => setRegions(regions.map(r => ({ ...r, initialShare: 100 / regions.length })))} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-[8px] uppercase tracking-widest shadow-lg">Padronizar Market Share</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 py-10">
               <div className="relative inline-block">
                  <div className="w-32 h-32 bg-slate-900 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_30px_70px_rgba(0,0,0,0.3)] border border-white/10 relative z-10">
                     <ShieldCheck size={64} className="text-emerald-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-orange-600/20 blur-[60px] rounded-full"></div>
               </div>
               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Arena v6.0 Ready</h2>
                  <p className="text-slate-500 font-medium text-lg">Os protocolos foram validados. Inicie o seeding da arena global.</p>
               </div>
               <div className="max-w-md mx-auto p-10 bg-slate-50 rounded-[4rem] border border-slate-200 text-left space-y-6 shadow-inner">
                  <SummaryLine label="Modalidade" val={formData.modalityType.toUpperCase()} />
                  <SummaryLine label="Setor Principal" val={formData.branch.toUpperCase()} />
                  <SummaryLine label="Ativo Inicial" val={`$ ${(financials?.balance_sheet?.total_assets || 0).toLocaleString()}`} />
                  <SummaryLine label="Regiões Ativas" val={regions.length.toString()} />
               </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 p-10 flex justify-between items-center border-t border-slate-100">
           <button onClick={step === 1 ? onComplete : prevStep} className="px-10 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-950 transition-all flex items-center gap-3">
              <ArrowLeft size={16}/> {step === 1 ? 'Abortar' : 'Fase Anterior'}
           </button>
           <button 
             onClick={step === 5 ? handleLaunch : nextStep} 
             disabled={isSubmitting || (step === 1 && !formData.name)}
             className={`px-14 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-5 transition-all ${isSubmitting || (step === 1 && !formData.name) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-orange-600 hover:scale-105 active:scale-95'}`}
           >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : step === 5 ? 'Lançar Arena Master' : 'Seguinte'}
              {!isSubmitting && <ArrowRight size={18} />}
           </button>
        </div>
      </div>
    </div>
  );
};

const MacroControl = ({ label, val, min, max, step, value, onChange }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center text-[10px] font-black uppercase">
        <span className="text-slate-500">{label}</span>
        <span className="text-orange-400 font-mono">{val}</span>
     </div>
     <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500" />
  </div>
);

const SummaryLine = ({ label, val }: any) => (
  <div className="flex justify-between items-center border-b border-slate-200 pb-4 last:border-0 last:pb-0">
     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <span className="font-black text-slate-900 uppercase italic text-sm">{val}</span>
  </div>
);

export default ChampionshipWizard;