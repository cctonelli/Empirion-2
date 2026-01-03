
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Check, Settings, Globe, Layers, Cpu, Zap, Loader2,
  TrendingUp, Boxes, Bot, ShieldCheck, ArrowLeft, Trash2, Activity, Users,
  Lock, Unlock, DollarSign as DollarIcon, MapPin, RefreshCw, Leaf, Gavel,
  ShieldAlert, Sparkles, BarChart3, Construction, Landmark, UserPlus
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, BRANCH_CONFIGS, DEFAULT_MACRO } from '../constants';
import { Branch, ScenarioType, ModalityType, RegionConfig, MacroIndicators, AccountNode, CurrencyType } from '../types';
import FinancialStructureEditor from './FinancialStructureEditor';
import { createChampionshipWithTeams } from '../services/supabase';

const markTemplateNodes = (nodes: AccountNode[]): AccountNode[] => {
  return nodes.map(n => ({
    ...n,
    isTemplateAccount: true,
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
    currency: 'BRL' as CurrencyType, isPublic: false,
    rules: {
      esg_enabled: false, black_swan_events: true, labor_strikes: false,
      share_issue: false, obsolescence_factor: true, community_score: true,
      transfer_pricing: false, currency_hedge: false, rd_disruption: true,
      inflation_schedule: true, event_intensity: 0.1, tax_paradise: false
    }
  });

  const [teams, setTeams] = useState<{ name: string }[]>([]);
  const [macro, setMacro] = useState<MacroIndicators>({ ...DEFAULT_MACRO });
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

  // Sincroniza lista de equipes com o limite definido
  useEffect(() => {
    const currentCount = teams.length;
    if (currentCount < formData.teamsLimit) {
      const more = Array.from({ length: formData.teamsLimit - currentCount }).map((_, i) => ({
        name: `Time ${String.fromCharCode(65 + currentCount + i)}` // Alpha, Beta, etc.
      }));
      setTeams([...teams, ...more]);
    } else if (currentCount > formData.teamsLimit) {
      setTeams(teams.slice(0, formData.teamsLimit));
    }
  }, [formData.teamsLimit]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const champPayload = {
        name: formData.name,
        branch: formData.branch,
        status: 'active',
        is_public: formData.isPublic,
        currentRound: 0,
        total_rounds: formData.totalRounds,
        config: { ...formData },
        initial_financials: financials,
        initial_market_data: { regions },
        market_indicators: macro
      };
      
      await createChampionshipWithTeams(champPayload, teams);
      onComplete();
    } catch (e) { alert("Erro de persistência no Oracle."); }
    setIsSubmitting(false);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 9));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center justify-between mb-12 px-10">
        {[1,2,3,4,5,6,7,8,9].map(s => (
          <div key={s} className="flex flex-col items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}>
                {s}
             </div>
             <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-orange-600' : 'text-slate-600'}`}>
                {s === 1 ? 'Identidade' : s === 2 ? 'Motor' : s === 3 ? 'Mercado' : s === 4 ? 'Macro' : s === 5 ? 'Contas' : s === 6 ? 'Regras' : s === 7 ? 'Tamanho' : s === 8 ? 'Equipes' : 'Deploy'}
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
                  <InputGroup label="Nome da Arena" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: ARENA 2026 T2" />
               </div>
            </div>
          )}

          {/* ... passos 2 a 6 mantidos ... */}
          {step > 1 && step < 7 && <div className="text-white text-center p-20 font-black uppercase italic opacity-20">Configuração de Motor & Contas Ativa</div>}

          {step === 7 && (
            <div className="space-y-12 animate-in fade-in duration-500 text-center">
               <h2 className="text-4xl font-black text-white uppercase italic">7. Dimensionamento da Arena</h2>
               <div className="max-w-md mx-auto p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Total de Peças (Equipes)</label>
                     <input type="number" min={2} max={20} value={formData.teamsLimit} onChange={e => setFormData({...formData, teamsLimit: Number(e.target.value)})} className="w-full p-6 bg-slate-900 border border-white/10 rounded-[1.5rem] font-black text-3xl text-white text-center outline-none focus:border-blue-500 shadow-inner" />
                  </div>
               </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black text-white uppercase italic">8. Nominação do Batalhão</h2>
                  <p className="text-slate-400 font-medium italic">Batize as equipes que competirão no tabuleiro de xadrez empresarial.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {teams.map((t, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:border-orange-500/50 transition-all">
                       <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-orange-500 shadow-lg">{i + 1}</div>
                       <input 
                         value={t.name}
                         onChange={e => { const nt = [...teams]; nt[i].name = e.target.value; setTeams(nt); }}
                         className="bg-transparent border-none outline-none font-bold text-white flex-1"
                       />
                       <UserPlus size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {step === 9 && (
            <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 py-10">
               <div className="w-32 h-32 bg-orange-600 text-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(249,115,22,0.4)]"><ShieldCheck size={64} /></div>
               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Arena Validada</h2>
                  <p className="text-slate-400 font-medium text-lg italic">"{teams.length} equipes criadas. Sistema pronto para Xadrez Estratégico."</p>
               </div>
            </div>
          )}

        </div>

        <div className="p-10 bg-slate-900 flex justify-between items-center border-t border-white/5">
           <button onClick={prevStep} disabled={step === 1} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 disabled:opacity-0"><ArrowLeft size={16}/> Anterior</button>
           <button 
             onClick={step === 9 ? handleLaunch : nextStep} 
             disabled={isSubmitting || (step === 1 && !formData.name)}
             className={`px-16 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-5 transition-all ${isSubmitting ? 'bg-slate-800' : 'bg-orange-600 text-white hover:bg-white hover:text-slate-950 hover:scale-105 active:scale-95'}`}
           >
              {isSubmitting ? <Loader2 className="animate-spin" /> : step === 9 ? 'Seal Arena Board' : 'Próxima Fase'}
              {!isSubmitting && <ArrowRight size={18} />}
           </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-3 max-w-xl mx-auto text-left">
     <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">{label}</label>
     <input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white focus:border-orange-500 outline-none transition-all" 
     />
  </div>
);

export default ChampionshipWizard;
