
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Check, Settings, Globe, Layers, Cpu, Zap, Loader2,
  TrendingUp, Boxes, Bot, ShieldCheck, ArrowLeft, Trash2, Activity, Users,
  Lock, Unlock, DollarSign as DollarIcon, MapPin, RefreshCw
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS, DEFAULT_MACRO } from '../constants';
import { Branch, ScenarioType, ModalityType, RegionConfig, MacroIndicators, AccountNode, CurrencyType } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { supabase } from '../services/supabase';

// Helper para proteção de estrutura de template
const markTemplateNodes = (nodes: AccountNode[]): AccountNode[] => {
  return nodes.map(n => ({
    ...n,
    isTemplateAccount: true, // Bloqueia exclusão no editor
    children: n.children ? markTemplateNodes(n.children) : undefined
  }));
};

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', branch: 'industrial' as Branch, templateId: '', salesMode: 'hybrid',
    scenarioType: 'simulated' as ScenarioType, modalityType: 'standard' as ModalityType,
    transparency: 'medium', totalRounds: 12, teamsLimit: 8, botsCount: 0, 
    currency: 'BRL' as CurrencyType, isPublic: false
  });

  const [macro, setMacro] = useState<MacroIndicators>({
    ...DEFAULT_MACRO
  });

  const [regions, setRegions] = useState<RegionConfig[]>([
    { id: 'r1', name: 'Região 1', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r2', name: 'Região 2', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r3', name: 'Região 3', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r4', name: 'Região 4', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r5', name: 'Região 5', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r6', name: 'Região 6', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r7', name: 'Região 7', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 372 },
    { id: 'r8', name: 'Região 8', demandTotal: 8392, initialMarketShare: 12.5, initialPrice: 344 },
    { id: 'r9', name: 'Região 9', demandTotal: 12592, initialMarketShare: 12.5, initialPrice: 399 }
  ]);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(null);

  useEffect(() => {
    if (formData.templateId && formData.templateId !== 'custom') {
      const template = CHAMPIONSHIP_TEMPLATES.find(t => t.id === formData.templateId);
      if (template) {
        const clonedFinancials = JSON.parse(JSON.stringify(template.initial_financials));
        setMacro({ ...template.market_indicators });
        setFinancials({
          balance_sheet: markTemplateNodes(clonedFinancials.balance_sheet),
          dre: markTemplateNodes(clonedFinancials.dre)
        });
        setFormData(prev => ({ ...prev, ...template.config, branch: template.branch }));
      }
    }
  }, [formData.templateId]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        branch: formData.branch,
        status: 'active',
        is_public: formData.isPublic,
        current_round: 0,
        total_rounds: formData.totalRounds,
        config: { ...formData },
        initial_financials: financials,
        initial_market_data: { regions },
        market_indicators: macro
      };
      await supabase.from('championships').insert([payload]);
      onComplete();
    } catch (e) { alert("Erro fatal no nodo central."); }
    setIsSubmitting(false);
  };

  const redistributeMarketShare = () => {
    const share = Number((100 / formData.teamsLimit).toFixed(2));
    setRegions(regions.map(r => ({ ...r, initialMarketShare: share })));
  };

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center justify-between mb-12 px-10">
        {[1,2,3,4,5,6,7,8].map(s => (
          <div key={s} className="flex flex-col items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}>
                {s}
             </div>
             <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-orange-600' : 'text-slate-600'}`}>
                {s === 1 ? 'Identidade' : s === 2 ? 'Motor' : s === 3 ? 'Mercado' : s === 4 ? 'Macro' : s === 5 ? 'Contas' : s === 6 ? 'Regras' : s === 7 ? 'Grid' : 'Deploy'}
             </span>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden min-h-[750px] flex flex-col transition-all">
        <div className="flex-1 p-12 md:p-16 overflow-y-auto custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500 text-center">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">1. Identidade do Ecossistema</h2>
                  <p className="text-slate-400 font-medium italic">Configure as bases fundamentais da sua arena "Empirion Street".</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                  <InputGroup label="Nome da Arena" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: Master Cup Industrial 2026" />
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Ramo Operacional</label>
                     <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-orange-500 transition-all" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value as any})}>
                        {Object.entries(BRANCH_CONFIGS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Moeda Local</label>
                       <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-orange-500" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as any})}>
                          <option value="BRL" className="bg-slate-900">BRL (R$)</option>
                          <option value="USD" className="bg-slate-900">USD ($)</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Valor Máquina Alfa ($)</label>
                       <div className="relative">
                          <DollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input type="number" className="w-full pl-12 pr-4 py-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-orange-500" value={macro.machineryValues.alfa} onChange={e => setMacro({...macro, machineryValues: {...macro.machineryValues, alfa: Number(e.target.value)}})} />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Visibilidade</label>
                     <div className="flex gap-4">
                        <button onClick={() => setFormData({...formData, isPublic: true})} className={`flex-1 p-6 rounded-[1.5rem] border-2 flex items-center justify-center gap-3 transition-all ${formData.isPublic ? 'bg-orange-600/10 border-orange-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>
                           <Unlock size={18} /> <span className="font-black text-[10px] uppercase">Pública</span>
                        </button>
                        <button onClick={() => setFormData({...formData, isPublic: false})} className={`flex-1 p-6 rounded-[1.5rem] border-2 flex items-center justify-center gap-3 transition-all ${!formData.isPublic ? 'bg-blue-600/10 border-blue-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>
                           <Lock size={18} /> <span className="font-black text-[10px] uppercase">Privada</span>
                        </button>
                     </div>
                  </div>

                  <InputGroup label="Ciclos (Rodadas)" value={formData.totalRounds} onChange={v => setFormData({...formData, totalRounds: Number(v)})} type="number" />
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">2. Seleção do Nodo Central (Motor)</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {CHAMPIONSHIP_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setFormData({...formData, templateId: t.id})} className={`p-10 border-2 rounded-[3.5rem] text-left transition-all group ${formData.templateId === t.id ? 'border-orange-600 bg-orange-600/10 shadow-2xl' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                       <div className="p-4 bg-slate-900 rounded-2xl w-fit mb-6 shadow-sm text-2xl border border-white/10">{BRANCH_CONFIGS[t.branch].icon}</div>
                       <h4 className="text-xl font-black uppercase italic text-white">{t.name}</h4>
                       <p className="text-[10px] text-slate-500 font-medium mt-4 uppercase tracking-widest leading-relaxed italic">{t.description}</p>
                    </button>
                  ))}
                  <button onClick={() => setFormData({...formData, templateId: 'custom'})} className={`p-10 border-2 border-dashed rounded-[3.5rem] text-center transition-all ${formData.templateId === 'custom' ? 'border-orange-600 bg-orange-600/10' : 'border-white/10 hover:bg-white/5'}`}>
                     <div className="p-5 bg-white text-slate-950 rounded-full w-fit mx-auto mb-6"><Plus size={32}/></div>
                     <h4 className="text-xl font-black uppercase italic text-white">Manual Config</h4>
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-3xl font-black text-white uppercase italic">3. Tabela Regional (9 Nodos)</h2>
                  <div className="flex gap-4">
                    <button onClick={redistributeMarketShare} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg flex items-center gap-2"><RefreshCw size={14}/> Equilibrar Share Inic.</button>
                    <button onClick={() => setRegions([...regions, { id: Date.now().toString(), name: `Região ${regions.length + 1}`, demandTotal: 8000, initialMarketShare: 0, initialPrice: 372 }])} className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-lg flex items-center gap-2"><Plus size={14}/> Add Nodo</button>
                  </div>
               </div>
               <div className="overflow-hidden border border-white/10 rounded-[3rem] shadow-2xl bg-slate-900/50">
                  <table className="w-full text-[11px] text-left">
                     <thead className="bg-slate-900 text-orange-500 font-black uppercase tracking-widest border-b border-white/5">
                        <tr>
                           <th className="p-6">Nome Região</th>
                           <th className="p-6">Demanda Inicial (Qtde)</th>
                           <th className="p-6">Share Inic. (%)</th>
                           <th className="p-6">Preço Base ($)</th>
                           <th className="p-6"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {regions.map((reg, idx) => (
                          <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                             <td className="p-6 font-black uppercase italic text-white">
                               <input className="bg-transparent border-b border-transparent focus:border-orange-500 outline-none w-full text-white" value={reg.name} onChange={e => { const nr = [...regions]; nr[idx].name = e.target.value; setRegions(nr); }} />
                             </td>
                             <td className="p-6">
                               <input type="number" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg w-32 outline-none focus:border-orange-500 font-mono" value={reg.demandTotal} onChange={e => { const nr = [...regions]; nr[idx].demandTotal = Number(e.target.value); setRegions(nr); }} />
                             </td>
                             <td className="p-6 font-mono text-blue-400 font-black">
                               <input type="number" step="0.1" className="bg-transparent text-blue-400 font-mono w-20 outline-none" value={reg.initialMarketShare} onChange={e => { const nr = [...regions]; nr[idx].initialMarketShare = Number(e.target.value); setRegions(nr); }} />%
                             </td>
                             <td className="p-6">
                               <input type="number" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg w-24 outline-none focus:border-orange-500 font-mono" value={reg.initialPrice} onChange={e => { const nr = [...regions]; nr[idx].initialPrice = Number(e.target.value); setRegions(nr); }} />
                             </td>
                             <td className="p-6"><button onClick={() => setRegions(regions.filter(r => r.id !== reg.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"><Trash2 size={16}/></button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">4. Conjuntura Econômica</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MacroSlider label="Inflação Período (%)" value={macro.inflationRate} onChange={v => setMacro({...macro, inflationRate: v})} min={0} max={10} step={0.1} />
                  <MacroSlider label="Taxa TR Mensal (%)" value={macro.interestRateTR} onChange={v => setMacro({...macro, interestRateTR: v})} min={0} max={15} step={0.25} />
                  <MacroSlider label="Crescimento PIB (%)" value={macro.growthRate} onChange={v => setMacro({...macro, growthRate: v})} min={-5} max={10} step={0.1} />
                  <InputGroup label="Salário Médio Setor ($)" value={macro.sectorAvgSalary} onChange={v => setMacro({...macro, sectorAvgSalary: Number(v)})} type="number" />
                  <InputGroup label="Distribuição / Unid ($)" value={macro.distributionCostUnit} onChange={v => setMacro({...macro, distributionCostUnit: Number(v)})} type="number" />
                  <InputGroup label="Marketing Base Arena ($)" value={macro.marketingExpenseBase} onChange={v => setMacro({...macro, marketingExpenseBase: Number(v)})} type="number" />
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">5. Matriz Contábil (Auditada)</h2>
               <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-white/5">
                 <FinancialStructureEditor 
                    initialBalance={financials?.balance_sheet} 
                    initialDRE={financials?.dre} 
                    onChange={setFinancials} 
                 />
               </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-12 animate-in fade-in duration-500 text-center">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white uppercase italic">7. Dimensionamento da Arena</h2>
                  <p className="text-slate-400 font-medium italic">Configure o número de estrategistas competindo.</p>
               </div>
               <div className="max-w-md mx-auto space-y-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-10 shadow-xl">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Users size={16}/> Total de Equipes</label>
                        <input type="number" value={formData.teamsLimit} onChange={e => { const v = Number(e.target.value); setFormData({...formData, teamsLimit: v, botsCount: Math.min(formData.botsCount, v)}); }} className="w-full p-6 bg-slate-900 border border-white/10 rounded-[1.5rem] font-black text-3xl text-white text-center outline-none focus:border-blue-500 shadow-inner" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2"><Bot size={16}/> Unidades BOT</label>
                           <span className="text-xl font-black text-white">{formData.botsCount}</span>
                        </div>
                        <input type="range" min={0} max={formData.teamsLimit} value={formData.botsCount} onChange={e => setFormData({...formData, botsCount: Number(e.target.value)})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {step === 8 && (
            <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 py-10">
               <div className="relative inline-block">
                  <div className="w-32 h-32 bg-orange-600 text-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(249,115,22,0.4)] relative z-10">
                     <ShieldCheck size={64} className="text-white" />
                  </div>
                  <div className="absolute inset-0 bg-orange-600/40 blur-[60px] rounded-full"></div>
               </div>
               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Deploy Validated</h2>
                  <p className="text-slate-400 font-medium text-lg italic">"A arena Empirion Street está pronta para o Round Inicial."</p>
               </div>
               <div className="max-w-lg mx-auto bg-slate-900/80 backdrop-blur-xl p-10 rounded-[4rem] text-left space-y-6 shadow-2xl border border-white/5">
                  <SummaryLine label="Arena" val={formData.name} />
                  <SummaryLine label="Empresas" val={`${formData.teamsLimit} Units`} />
                  <SummaryLine label="Nodos (Regiões)" val={`${regions.length} Regiões`} />
                  <SummaryLine label="Ativo Inicial" val={`R$ 9.176.940`} />
               </div>
            </div>
          )}

        </div>

        <div className="p-10 bg-slate-900 flex justify-between items-center border-t border-white/5">
           <button onClick={prevStep} disabled={step === 1} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 disabled:opacity-0"><ArrowLeft size={16}/> Anterior</button>
           <button 
             onClick={step === 8 ? handleLaunch : nextStep} 
             disabled={isSubmitting || (step === 1 && !formData.name)}
             className={`px-16 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-5 transition-all ${isSubmitting ? 'bg-slate-800' : 'bg-orange-600 text-white hover:bg-white hover:text-slate-950 hover:scale-105 active:scale-95'}`}
           >
              {isSubmitting ? <Loader2 className="animate-spin" /> : step === 8 ? 'Seal Arena Node' : 'Próxima Fase'}
              {!isSubmitting && <ArrowRight size={18} />}
           </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-3">
     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">{label}</label>
     <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-700 font-mono" 
     />
  </div>
);

const MacroSlider = ({ label, value, onChange, min, max, step }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4 shadow-inner">
     <div className="flex justify-between items-center">
        <label className="text-[9px] font-black uppercase text-orange-500 tracking-widest">{label}</label>
        <span className="text-sm font-black text-white font-mono">{value.toFixed(2)}%</span>
     </div>
     <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
  </div>
);

const SummaryLine = ({ label, val }: any) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-4">
     <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{label}</span>
     <span className="font-black text-white uppercase italic text-sm">{val}</span>
  </div>
);

export default ChampionshipWizard;
