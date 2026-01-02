
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Check, Settings, Globe, Layers, Cpu, Zap, Loader2,
  TrendingUp, Boxes, Bot, ShieldCheck, ArrowLeft, Trash2, Activity, Users
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS, DEFAULT_MACRO } from '../constants';
import { Branch, ScenarioType, ModalityType, RegionConfig, MacroIndicators, AccountNode } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { supabase } from '../services/supabase';

const ChampionshipWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', branch: 'industrial' as Branch, templateId: '', salesMode: 'hybrid',
    scenarioType: 'simulated' as ScenarioType, modalityType: 'standard' as ModalityType,
    transparency: 'medium', totalRounds: 12, teamsLimit: 8, botsCount: 4, currency: 'BRL'
  });

  const [macro, setMacro] = useState<MacroIndicators>(DEFAULT_MACRO);
  const [regions, setRegions] = useState<RegionConfig[]>([
    { id: 'reg1', name: 'Sudeste', demandTotal: 500000, initialMarketShare: 20, initialPrice: 1200 },
    { id: 'reg2', name: 'Sul', demandTotal: 300000, initialMarketShare: 20, initialPrice: 1200 },
    { id: 'reg3', name: 'Nordeste', demandTotal: 200000, initialMarketShare: 20, initialPrice: 1200 },
    { id: 'reg4', name: 'Centro-Oeste', demandTotal: 150000, initialMarketShare: 20, initialPrice: 1200 },
    { id: 'reg5', name: 'Exportação', demandTotal: 400000, initialMarketShare: 20, initialPrice: 1500 }
  ]);

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(null);

  useEffect(() => {
    if (formData.templateId) {
      const template = CHAMPIONSHIP_TEMPLATES.find(t => t.id === formData.templateId);
      if (template) {
        setMacro(template.market_indicators);
        setFinancials(template.initial_financials);
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
        current_round: 0,
        total_rounds: formData.totalRounds,
        config: { ...formData, transparency: formData.transparency },
        initial_financials: financials,
        initial_market_data: { regions },
        market_indicators: macro
      };
      await supabase.from('championships').insert([payload]);
      onComplete();
    } catch (e) { alert("Erro fatal no nodo central."); }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      {/* 8-Step Tracker */}
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

      <div className="bg-slate-950 rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden min-h-[750px] flex flex-col">
        <div className="flex-1 p-12 md:p-16 overflow-y-auto custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500 text-center">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">1. Identidade do Ecossistema</h2>
                  <p className="text-slate-400 font-medium">Nomeie sua arena e defina o horizonte temporal.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                  <InputGroup label="Nome da Arena" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: Master Cup Industrial 2026" />
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Ramo Operacional</label>
                     <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-orange-500 transition-all" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value as any})}>
                        {Object.entries(BRANCH_CONFIGS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
                     </select>
                  </div>
                  <InputGroup label="Ciclos (Rodadas)" value={formData.totalRounds} onChange={v => setFormData({...formData, totalRounds: Number(v)})} type="number" />
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Transparência Oracle</label>
                     <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-orange-500 transition-all" value={formData.transparency} onChange={e => setFormData({...formData, transparency: e.target.value as any})}>
                        <option value="low" className="bg-slate-900">Baixa (TSR apenas)</option>
                        <option value="medium" className="bg-slate-900">Média (TSR + Vendas)</option>
                        <option value="high" className="bg-slate-900">Alta (DRE Público)</option>
                        <option value="full" className="bg-slate-900">Auditada (Balanço Aberto)</option>
                     </select>
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">2. Seleção de Motor Engine</h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {CHAMPIONSHIP_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setFormData({...formData, templateId: t.id})} className={`p-10 border-2 rounded-[3.5rem] text-left transition-all group ${formData.templateId === t.id ? 'border-orange-600 bg-orange-600/10 shadow-2xl' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                       <div className="p-4 bg-slate-900 rounded-2xl w-fit mb-6 shadow-sm text-2xl border border-white/10">{BRANCH_CONFIGS[t.branch].icon}</div>
                       <h4 className="text-xl font-black uppercase italic text-white">{t.name}</h4>
                       <p className="text-[10px] text-slate-500 font-medium mt-4 uppercase tracking-widest">{t.description}</p>
                    </button>
                  ))}
                  <button onClick={() => setFormData({...formData, templateId: 'custom'})} className={`p-10 border-2 border-dashed rounded-[3.5rem] text-center transition-all ${formData.templateId === 'custom' ? 'border-orange-600 bg-orange-600/10' : 'border-white/10 hover:bg-white/5'}`}>
                     <div className="p-5 bg-white text-slate-950 rounded-full w-fit mx-auto mb-6"><Plus size={32}/></div>
                     <h4 className="text-xl font-black uppercase italic text-white">Configuração do Zero</h4>
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">3. Tabela Regional de Demanda</h2>
               <div className="overflow-hidden border border-white/10 rounded-[3rem] shadow-xl bg-slate-900/50">
                  <table className="w-full text-[11px] text-left">
                     <thead className="bg-slate-900 text-orange-500 font-black uppercase tracking-widest border-b border-white/5">
                        <tr>
                           <th className="p-6">Região</th>
                           <th className="p-6">Demanda (Unid)</th>
                           <th className="p-6">Market Share Inic. (%)</th>
                           <th className="p-6">Preço Base ($)</th>
                           <th className="p-6"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {regions.map((reg, idx) => (
                          <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                             <td className="p-6 font-black uppercase italic text-white">
                               <input className="bg-transparent border-b border-transparent focus:border-orange-500 outline-none w-full text-white" value={reg.name} onChange={e => { const nr = [...regions]; nr[idx].name = e.target.value; setRegions(nr); }} />
                             </td>
                             <td className="p-6">
                               <input type="number" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg w-24 outline-none focus:border-orange-500" value={reg.demandTotal} onChange={e => { const nr = [...regions]; nr[idx].demandTotal = Number(e.target.value); setRegions(nr); }} />
                             </td>
                             <td className="p-6 font-mono text-blue-400 font-black">{reg.initialMarketShare}%</td>
                             <td className="p-6">
                               <input type="number" className="bg-white/5 border border-white/10 text-white p-2 rounded-lg w-24 outline-none focus:border-orange-500" value={reg.initialPrice} onChange={e => { const nr = [...regions]; nr[idx].initialPrice = Number(e.target.value); setRegions(nr); }} />
                             </td>
                             <td className="p-6"><button onClick={() => setRegions(regions.filter(r => r.id !== reg.id))} className="text-rose-500 hover:text-rose-400 transition-colors"><Trash2 size={16}/></button></td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="flex justify-between items-center">
                  <button onClick={() => setRegions([...regions, { id: Date.now().toString(), name: 'Nova Região', demandTotal: 100000, initialMarketShare: 0, initialPrice: 1000 }])} className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all"><Plus size={16}/> Adicionar Região</button>
                  <button onClick={() => setRegions(regions.map(r => ({ ...r, initialMarketShare: Number((100 / regions.length).toFixed(2)) })))} className="px-8 py-3 border border-white/10 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all">Equilibrar Vendas Relativas (%)</button>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">4. Indicadores Macroeconômicos</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MacroSlider label="Inflação Anual (%)" value={macro.inflationRate} onChange={v => setMacro({...macro, inflationRate: v})} min={0} max={20} step={0.1} />
                  <MacroSlider label="Crescimento PIB (%)" value={macro.growthRate} onChange={v => setMacro({...macro, growthRate: v})} min={-5} max={10} step={0.1} />
                  <MacroSlider label="Taxa TR (Juros %)" value={macro.interestRateTR} onChange={v => setMacro({...macro, interestRateTR: v})} min={0} max={25} step={0.25} />
                  <InputGroup label="Custo Distr./Unid ($)" value={macro.distributionCostUnit} onChange={v => setMacro({...macro, distributionCostUnit: Number(v)})} type="number" />
                  <InputGroup label="Salário Médio Setor ($)" value={macro.sectorAvgSalary} onChange={v => setMacro({...macro, sectorAvgSalary: Number(v)})} type="number" />
                  <InputGroup label="Cotação Bolsa Inicial ($)" value={macro.stockMarketPrice} onChange={v => setMacro({...macro, stockMarketPrice: Number(v)})} type="number" />
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <h2 className="text-3xl font-black text-white text-center uppercase italic">5. Hierarquia Contábil</h2>
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
                  <h2 className="text-4xl font-black text-white uppercase italic">7. Grid de Competidores</h2>
                  <p className="text-slate-400 font-medium">Quantas empresas e bots lutarão nesta arena?</p>
               </div>
               <div className="max-w-md mx-auto space-y-10">
                  <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-8">
                     <InputGroup label="Total de Equipes (Grid)" value={formData.teamsLimit} onChange={v => setFormData({...formData, teamsLimit: Number(v)})} type="number" />
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-2"><Bot size={16}/> Quantos BOTS?</label>
                           <span className="text-xl font-black text-white">{formData.botsCount}</span>
                        </div>
                        <input type="range" min={0} max={formData.teamsLimit} value={formData.botsCount} onChange={e => setFormData({...formData, botsCount: Number(e.target.value)})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {step === 8 && (
            <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 py-10">
               <div className="relative inline-block">
                  <div className="w-32 h-32 bg-orange-600 text-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl relative z-10">
                     <ShieldCheck size={64} className="text-white" />
                  </div>
                  <div className="absolute inset-0 bg-orange-600/40 blur-[60px] rounded-full"></div>
               </div>
               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white uppercase italic">Deploy Ready</h2>
                  <p className="text-slate-400 font-medium text-lg">Ecossistema validado pelo Oracle Audit Node.</p>
               </div>
               <div className="max-w-lg mx-auto bg-slate-900 p-10 rounded-[4rem] text-left space-y-6 shadow-2xl border border-white/5">
                  <SummaryLine label="Arena" val={formData.name} />
                  <SummaryLine label="Bots" val={`${formData.botsCount} ativos`} />
                  <SummaryLine label="Regiões" val={regions.length.toString()} />
               </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-10 bg-slate-900 flex justify-between items-center border-t border-white/5">
           <button onClick={prevStep} disabled={step === 1} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 disabled:opacity-0"><ArrowLeft size={16}/> Anterior</button>
           <button 
             onClick={step === 8 ? handleLaunch : nextStep} 
             disabled={isSubmitting || (step === 1 && !formData.name)}
             className={`px-16 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-5 transition-all ${isSubmitting ? 'bg-slate-800' : 'bg-orange-600 text-white hover:bg-white hover:text-slate-950 hover:scale-105 active:scale-95'}`}
           >
              {isSubmitting ? <Loader2 className="animate-spin" /> : step === 8 ? 'Lançar Arena' : 'Próxima Fase'}
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
        className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-700" 
     />
  </div>
);

const MacroSlider = ({ label, value, onChange, min, max, step }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
     <div className="flex justify-between items-center">
        <label className="text-[9px] font-black uppercase text-orange-500 tracking-widest">{label}</label>
        <span className="text-sm font-black text-white font-mono">{value}%</span>
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
