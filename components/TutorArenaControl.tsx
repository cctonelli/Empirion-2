import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Globe, Shield, TrendingUp, Save, RefreshCw, 
  Plus, Trash2, LayoutGrid, Activity, Flame, Loader2, 
  Sparkles, Cpu, Package, Boxes, BrainCircuit, Target, Bird,
  UserPlus, UserMinus, ShoppingCart, Info, HardDrive,
  BarChart3, Landmark, Percent, Settings2, DollarSign,
  ShieldAlert, Users, CheckCircle2, ChevronRight, Scale, AlertCircle, Briefcase, Award, Eye, X,
  User, Calculator, Repeat, Coins
} from 'lucide-react';
import { EcosystemConfig, Championship, MacroIndicators, BlackSwanEvent, LaborAvailability, CurrencyType } from '../types';
import { updateEcosystem, supabase, mapChampionshipSynthetically } from '../services/supabase';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import ChampionshipTimer from './ChampionshipTimer';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const TutorArenaControl: React.FC<{ championship: Championship; onUpdate: (config: Partial<Championship>) => void }> = ({ championship, onUpdate }) => {
  const [currentChampionship, setCurrentChampionship] = useState<Championship>(championship);
  const [activeTab, setActiveTab] = useState<'conjuncture' | 'suppliers' | 'market' | 'staffing' | 'international' | 'awards' | 'observers'>('conjuncture');
  const [isSaving, setIsSaving] = useState(false);
  const [hasDecisions, setHasDecisions] = useState(false);
  const [newObserverId, setNewObserverId] = useState('');
  const [observersList, setObserversList] = useState<string[]>(championship.observers || []);

  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionCurrency, setNewRegionCurrency] = useState('BRL');
  const [newRegionWeight, setNewRegionWeight] = useState(25);
  const [newRegionSuggestedPrice, setNewRegionSuggestedPrice] = useState<number>(425.0);
  const [newRegionDistributionCost, setNewRegionDistributionCost] = useState<number>(50.0);
  const [newRegionMarketingCost, setNewRegionMarketingCost] = useState<number>(10000.0);

  const [nextRoundIdx, setNextRoundIdx] = useState<number>(() => (championship.current_round || 0) + 1);

  useEffect(() => {
    setNextRoundIdx((currentChampionship.current_round || 0) + 1);
  }, [currentChampionship.current_round]);

  // 1. Memorizar as regras herdadas com mesclagem profunda segura
  const inheritedRules = useMemo(() => {
     const rules = currentChampionship.round_rules?.[nextRoundIdx] || currentChampionship.config?.round_rules?.[nextRoundIdx] || {};
     const chronogramRules = currentChampionship.config?.round_rules?.[nextRoundIdx] || 
                             currentChampionship.config?.DEFAULT_INDUSTRIAL_CHRONOGRAM?.[nextRoundIdx] || 
                             DEFAULT_INDUSTRIAL_CHRONOGRAM[nextRoundIdx] || {};
     const baseIndicators = currentChampionship.market_indicators || {};

     const merged: MacroIndicators = {
        ...DEFAULT_MACRO,
        ...baseIndicators,
        ...chronogramRules,
        ...rules,
        
        prices: {
           ...DEFAULT_MACRO.prices,
           ...(baseIndicators.prices || {}),
           ...(chronogramRules.prices || {}),
           ...(rules.prices || {})
        },
        machinery_values: {
           ...DEFAULT_MACRO.machinery_values,
           ...(baseIndicators.machinery_values || {}),
           ...(chronogramRules.machinery_values || {}),
           ...(rules.machinery_values || {})
        },
        staffing: {
           ...DEFAULT_MACRO.staffing,
           ...(baseIndicators.staffing || {}),
           ...(chronogramRules.staffing || {}),
           ...(rules.staffing || {})
        },
        hr_base: {
           ...DEFAULT_MACRO.hr_base,
           ...(baseIndicators.hr_base || {}),
           ...(chronogramRules.hr_base || {}),
           ...(rules.hr_base || {})
        },
        award_values: {
           ...DEFAULT_MACRO.award_values,
           ...(baseIndicators.award_values || {}),
           ...(chronogramRules.award_values || {}),
           ...(rules.award_values || {})
        },
        exchange_rates: {
           ...DEFAULT_MACRO.exchange_rates,
           ...(baseIndicators.exchange_rates || {}),
           ...(chronogramRules.exchange_rates || {}),
           ...(rules.exchange_rates || {})
        },
        machine_specs: {
           ...DEFAULT_MACRO.machine_specs,
           ...(baseIndicators.machine_specs || {}),
           ...(chronogramRules.machine_specs || {}),
           ...(rules.machine_specs || {})
        }
     };

     return merged;
  }, [currentChampionship, nextRoundIdx]);

  const [macro, setMacro] = useState<MacroIndicators>(inheritedRules);

  const [calcValue, setCalcValue] = useState(100);
  const [calcFrom, setCalcFrom] = useState<string>('USD');
  const [calcTo, setCalcTo] = useState<string>(championship.currency || 'BRL');

  // Sincronização reativa e carga segura das regiões reais configuradas
  useEffect(() => {
    const fetchLatestChampionship = async () => {
      const table = championship.is_trial ? 'trial_championships' : 'championships';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', championship.id)
        .maybeSingle();
        
      if (data && !error) {
        const mapped = mapChampionshipSynthetically(data);
        setCurrentChampionship({ ...mapped, is_trial: !!championship.is_trial });
      }
    };
    fetchLatestChampionship();
  }, [championship.id, championship.is_trial]);

  useEffect(() => {
    setMacro(inheritedRules);
    setObserversList(currentChampionship.observers || []);

    const list = currentChampionship.round_rules?.[nextRoundIdx]?.regions || 
                 currentChampionship.round_rules?.[nextRoundIdx]?.region_configs ||
                 currentChampionship.config?.round_rules?.[nextRoundIdx]?.regions ||
                 currentChampionship.config?.round_rules?.[nextRoundIdx]?.region_configs ||
                 currentChampionship.config?.regions || 
                 currentChampionship.config?.region_configs || 
                 currentChampionship.region_configs || [];
    if (list.length > 0) {
       setRegionsList(list);
    } else {
       setRegionsList([
         { id: 1, name: "BRASIL (LOCAL)", currency: "BRL", demand_weight: 40, suggested_price: 425.0, distribution_cost: 50.0, marketing_cost: 10000.0 },
         { id: 2, name: "EUA (EXPORT)", currency: "USD", demand_weight: 20, suggested_price: 425.0, distribution_cost: 50.0, marketing_cost: 10000.0 },
         { id: 3, name: "EUROPA (EXPORT)", currency: "EUR", demand_weight: 20, suggested_price: 425.0, distribution_cost: 50.0, marketing_cost: 10000.0 },
         { id: 4, name: "CHINA (EXPORT)", currency: "CNY", demand_weight: 20, suggested_price: 425.0, distribution_cost: 50.0, marketing_cost: 10000.0 }
       ]);
    }

    const checkDecisions = async () => {
        const table = currentChampionship.is_trial ? 'trial_decisions' : 'current_decisions';
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('championship_id', currentChampionship.id).eq('round', nextRoundIdx);
        setHasDecisions((count || 0) > 0);
    };
    checkDecisions();
  }, [inheritedRules, currentChampionship.id, nextRoundIdx, currentChampionship.observers]);

  const handleAddRegion = () => {
    if (!newRegionName.trim()) {
      alert("Por favor, digite o nome da nova região comercial.");
      return;
    }
    const newId = regionsList.length > 0 ? Math.max(...regionsList.map(r => r.id)) + 1 : 1;
    const newReg = {
      id: newId,
      name: newRegionName.trim().toUpperCase(),
      currency: newRegionCurrency,
      demand_weight: newRegionWeight,
      suggested_price: newRegionSuggestedPrice,
      distribution_cost: newRegionDistributionCost,
      marketing_cost: newRegionMarketingCost,
      start_round: nextRoundIdx
    };
    setRegionsList([...regionsList, newReg]);
    setNewRegionName('');
    setNewRegionWeight(25);
    setNewRegionSuggestedPrice(425.0);
    setNewRegionDistributionCost(50.0);
    setNewRegionMarketingCost(10000.0);
  };

  const handleDeleteRegion = (id: number) => {
    if (regionsList.length <= 1) {
      alert("A arena de torneio precisa reter no mínimo 1 região comercial ativa.");
      return;
    }
    const targetReg = regionsList.find(r => r.id === id);
    if (confirm(`Remover Região '${targetReg?.name}'? Todas as decisões de marketing enviadas para esta região perderão as configurações associadas.`)) {
      setRegionsList(regionsList.filter(r => r.id !== id));
    }
  };

  const handleUpdateRegionField = (id: number, field: string, val: any) => {
    setRegionsList(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Assegura retrocompatibilidade injetando o primeiro registro de região na raiz das variáveis do macro global
    const primaryRegion = regionsList[0] || { suggested_price: 425.0, distribution_cost: 50.0, marketing_cost: 10000.0 };
    
    const finalMacro = {
      ...macro,
      avg_selling_price: primaryRegion.suggested_price,
      prices: {
        ...macro.prices,
        distribution_unit: primaryRegion.distribution_cost,
        marketing_campaign: primaryRegion.marketing_cost
      }
    };

    const payload = { 
      observers: observersList,
      config: {
        ...(currentChampionship.config || {}),
        // Removida a sobreposição imediata de regions e region_configs na raiz do config global
        // para impedir vazamento (leak) de pesos e novas regiões para o round em andamento (R-1) das equipes.
      },
      round_rules: {
        ...(currentChampionship.round_rules || {}),
        [nextRoundIdx]: {
           ...finalMacro,
           regions: regionsList,
           region_configs: regionsList.map(r => ({
              id: r.id,
              name: r.name,
              currency: r.currency,
              demand_weight: r.demand_weight,
              suggested_price: r.suggested_price,
              distribution_cost: r.distribution_cost,
              marketing_cost: r.marketing_cost
           }))
        }
      }
    };

    try {
      await updateEcosystem(currentChampionship.id, payload, !!currentChampionship.is_trial);
      onUpdate(payload);
      
      // Atualiza estado local de visualização reativa instantaneamente
      setCurrentChampionship(prev => ({
        ...prev,
        ...payload
      }));
      
      alert(`CONEXÃO ESTABELECIDA: Alterações no mercado e regiões do R-${nextRoundIdx} propagadas com sucesso.`);
    } catch (err: any) {
      alert(`Falha no salvamento: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddObserver = () => {
    if (!newObserverId.trim()) return;
    if (observersList.includes(newObserverId.trim())) {
      alert("Este observador já está registrado na arena.");
      return;
    }
    setObserversList([...observersList, newObserverId.trim()]);
    setNewObserverId('');
  };

  const handleRemoveObserver = (obs: string) => {
    setObserversList(observersList.filter(o => o !== obs));
  };

  const totalDemandWeights = regionsList.reduce((sum, r) => sum + (Number(r.demand_weight) || 0), 0);

  return (
    <div className="space-y-10">
       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-8 bg-slate-900/60 rounded-[3rem] border border-white/10 shadow-xl">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Canal de Intervenção Ativo</span>
             </div>
             <h2 className="text-3xl font-black text-white italic tracking-tight">{currentChampionship.name}</h2>
             <p className="text-xs text-slate-400 font-medium">Configure os indexadores macroeconômicos e simulações para o <strong className="text-orange-500 font-black">Round {nextRoundIdx}</strong>.</p>
             <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-xs text-slate-400 font-medium">Selecione a rodada para intervenção:</span>
                <select 
                   value={nextRoundIdx} 
                   onChange={e => setNextRoundIdx(Number(e.target.value))} 
                   className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-black focus:border-orange-500 outline-none cursor-pointer"
                >
                   {Array.from({ length: (currentChampionship.total_rounds || 6) }).map((_, idx) => {
                      const rNum = idx + 1;
                      return (
                         <option key={rNum} value={rNum}>
                            Round {rNum} {rNum === (currentChampionship.current_round || 0) + 1 ? '(Ativo/Em Decisão)' : rNum <= (currentChampionship.current_round || 0) ? '(Concluído)' : '(Futuro)'}
                         </option>
                      );
                   })}
                </select>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <ChampionshipTimer 
                roundStartedAt={currentChampionship.round_started_at}
                deadlineValue={currentChampionship.deadline_value}
                deadlineUnit={currentChampionship.deadline_unit}
                createdAt={currentChampionship.created_at}
                isPaused={currentChampionship.config?.is_paused}
                remainingMsAtPause={currentChampionship.config?.remaining_ms_at_pause}
                isTournamentFinished={(currentChampionship as any).status === 'finished'}
             />
          </div>
       </div>

       {hasDecisions && (
          <div className="flex items-center gap-4 p-6 bg-red-950/20 border border-red-500/20 text-red-400 rounded-3xl text-xs font-semibold">
             <AlertCircle size={18} />
             <span>Atenção: Já existem decisões enviadas por equipes de estudantes para esta rodada! Alterar as regras do mercado agora pode causar discrepâncias e divergências de cálculo na rodada corrente.</span>
          </div>
       )}

       {/* Menu de Abas de Intervenção */}
       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <TabBtn active={activeTab === 'conjuncture'} onClick={() => setActiveTab('conjuncture')} label="Conjuntura" icon={<TrendingUp size={12}/>} />
          <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} label="Insumos & CAPEX" icon={<Package size={12}/>} />
          <TabBtn active={activeTab === 'market'} onClick={() => setActiveTab('market')} label="Mercado & Regiões" icon={<ShoppingCart size={12}/>} />
          <TabBtn active={activeTab === 'staffing'} onClick={() => setActiveTab('staffing')} label="Staffing" icon={<Briefcase size={12}/>} />
          <TabBtn active={activeTab === 'international'} onClick={() => setActiveTab('international')} label="Câmbio Oracle" icon={<Coins size={12}/>} />
          <TabBtn active={activeTab === 'awards'} onClick={() => setActiveTab('awards')} label="Premiações" icon={<Award size={12}/>} />
          <TabBtn active={activeTab === 'observers'} onClick={() => setActiveTab('observers')} label="Observadores" icon={<Eye size={12}/>} />
       </div>

       <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.2 }}
             className="min-h-[400px]"
          >
             {activeTab === 'conjuncture' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><TrendingUp className="text-orange-500"/> Conjuntura Macroeconômica</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      <ParamCard label="Índice ICE (Confiança)" val={macro.ice} onChange={(v: number) => setMacro({...macro, ice: v})} suffix="pts" icon={<Activity size={16}/>} />
                      <ParamCard label="Taxa de Inflação" val={macro.inflation_rate} onChange={(v: number) => setMacro({...macro, inflation_rate: v})} suffix="%" icon={<Flame size={16}/>} />
                      <ParamCard label="Taxa Básica TR" val={macro.interest_rate_tr} onChange={(v: number) => setMacro({...macro, interest_rate_tr: v})} suffix="%" icon={<Landmark size={16}/>} />
                      <ParamCard label="Retorno dos Investimentos" val={macro.investment_return_rate} onChange={(v: number) => setMacro({...macro, investment_return_rate: v})} suffix="%" icon={<Percent size={16}/>} />
                      <ParamCard label="Produtividade Média Trab." val={macro.labor_productivity || 1.0} onChange={(v: number) => setMacro({...macro, labor_productivity: v})} suffix="x" icon={<Cpu size={16}/>} />
                      <ParamCard label="Encargos Sociais" val={macro.social_charges} onChange={(v: number) => setMacro({...macro, social_charges: v})} suffix="%" icon={<Scale size={16}/>} />
                   </div>
                </div>
             )}

             {activeTab === 'suppliers' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Package className="text-orange-500"/> Insumos & CAPEX Máquinas</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <MacroInput label="Preço Unit. MP-A ($)" val={macro.prices.mp_a} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, mp_a: v}})} />
                      <MacroInput label="Preço Unit. MP-B ($)" val={macro.prices.mp_b} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, mp_b: v}})} />
                      <MacroInput label="Compra Especial (%)" val={macro.special_purchase_premium} onChange={(v: number) => setMacro({...macro, special_purchase_premium: v})} />
                      <MacroInput label="Custo Unit. Estocagem MP ($)" val={macro.prices.storage_mp || 1.40} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, storage_mp: v}})} />
                      <MacroInput label="Custo Unit. Estocagem PA ($)" val={macro.prices.storage_finished || 20.00} onChange={(v: number) => setMacro({...macro, prices: {...macro.prices, storage_finished: v}})} />
                   </div>

                   <div className="pt-8 border-t border-white/5 space-y-6">
                      <h4 className="text-lg font-bold text-white uppercase tracking-wider">Investimento em Ativos Fixos (CAPEX Máquinas)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <MacroInput label="Preço Máquina Alpha ($)" val={macro.machinery_values.alpha} onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, alpha: v}})} />
                         <MacroInput label="Preço Máquina Beta ($)" val={macro.machinery_values.beta} onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, beta: v}})} />
                         <MacroInput label="Preço Máquina Gamma ($)" val={macro.machinery_values.gamma} onChange={(v: number) => setMacro({...macro, machinery_values: {...macro.machinery_values, gamma: v}})} />
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'market' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                         <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><ShoppingCart className="text-orange-500"/> Mercado e Operações Globais</h3>
                         <p className="text-xs text-slate-400">Configure os indexadores corporativos gerais de comercialização.</p>
                      </div>
                      <div className={`text-xs font-black px-4 py-2 rounded-full flex items-center gap-2 ${totalDemandWeights === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                         {totalDemandWeights === 100 ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                         Soma dos Pesos de Demanda: {totalDemandWeights}% {totalDemandWeights !== 100 && '(Sugerido: 100%)'}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-8 border-b border-white/5">
                      <MacroInput label="Juros Fornecedor (%)" val={macro.supplier_interest ?? 1.5} onChange={(v: number) => setMacro({...macro, supplier_interest: v})} />
                      <MacroInput label="Ágio Compulsório (%)" val={macro.compulsory_loan_agio || 3.0} onChange={(v: number) => setMacro({...macro, compulsory_loan_agio: v})} />
                      <MacroInput label="Variação Demanda Geral (%)" val={macro.demand_variation || 0} onChange={(v: number) => setMacro({...macro, demand_variation: v})} />
                      <MacroInput label="Multa Atraso Fornecedor (%)" val={macro.late_penalty_rate || 5.0} onChange={(v: number) => setMacro({...macro, late_penalty_rate: v})} />
                      <MacroInput label="Alíquota IRPJ (%)" val={macro.tax_rate_ir || 25.0} onChange={(v: number) => setMacro({...macro, tax_rate_ir: v})} />
                   </div>

                   {/* Lista de Regiões Comerciais */}
                   {totalDemandWeights !== 100 && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-6 rounded-[2.5rem] flex items-start gap-4 shadow-lg animate-fadeIn text-left mb-6">
                         <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 mt-1 flex-shrink-0">
                            <AlertCircle size={22} />
                         </div>
                         <div className="space-y-2">
                            <h5 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                               Alerta de Rebalanceamento Comercial: Peso de Demanda em {totalDemandWeights}%
                            </h5>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                               A soma atual dos pesos de demanda das regiões é de <strong className="text-amber-300 font-bold">{totalDemandWeights}%</strong> (diferente de 100%).
                               Quando a soma total difere de 100%, o mercado geral será proporcionalmente expandido ou contraído (ex: gerando <strong className="text-amber-300 font-bold">{totalDemandWeights}%</strong> do tamanho base de demanda padrão).
                            </p>
                            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/40 p-4 rounded-2xl border border-white/5 font-medium leading-normal">
                               <p className="flex items-center gap-2 text-emerald-400 font-bold">
                                  <span>✔️</span> Para uma divisão clássica balanceada, redistribua os pesos das regiões de modo que o somatório seja exatamente 100%.
                               </p>
                               <p className="flex items-center gap-2">
                                  <span>💡</span> Sobrecarga de demanda (ex: &gt; 100%) ou recessão forçada (ex: &lt; 100%) são ferramentas poderosas para desafiar as equipes a redesenhar suas estruturas produtivas e de pricing. O sistema suportará integralmente a sua decisão!
                                </p>
                            </div>
                         </div>
                      </div>
                   )}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2"><Globe size={18} className="text-orange-500"/> Rergiões Comerciais Ativas</h4>
                         <span className="text-xs font-mono text-slate-400">{regionsList.length} Regiões Ativas</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {regionsList.map((r) => (
                            <div key={r.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all">
                               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-600/10 to-transparent rounded-bl-full pointer-events-none" />
                               <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                     <span className="p-2 bg-white/5 rounded-xl text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all"><Globe size={18}/></span>
                                     <div>
                                        <span className="text-[9px] font-bold text-slate-500 block">ID: {r.id}</span>
                                        <span className="text-sm font-black text-white">{r.name}</span>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono font-bold rounded text-slate-400">{r.currency}</span>
                                     {regionsList.length > 1 && (
                                        <button onClick={() => handleDeleteRegion(r.id)} className="p-2 bg-red-950/40 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all" title="Remover Região">
                                           <Trash2 size={12}/>
                                        </button>
                                     )}
                                  </div>
                               </div>

                               <div className="space-y-4 pt-2">
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Preço Sugerido ($)</label>
                                     <input type="number" step="0.1" value={r.suggested_price ?? 425.0} onChange={e => handleUpdateRegionField(r.id, 'suggested_price', parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Custo Frete ($)</label>
                                     <input type="number" step="0.1" value={r.distribution_cost ?? 50.0} onChange={e => handleUpdateRegionField(r.id, 'distribution_cost', parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">MKT Base ($)</label>
                                     <input type="number" step="100" value={r.marketing_cost ?? 10000.0} onChange={e => handleUpdateRegionField(r.id, 'marketing_cost', parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Peso Demanda (%)</label>
                                     <input type="number" step="1" value={r.demand_weight ?? 25} onChange={e => handleUpdateRegionField(r.id, 'demand_weight', parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                               </div>
                            </div>
                         ))}

                         {/* Form de Expansão de Nova Região */}
                         <div className="bg-slate-950/40 p-6 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col justify-between hover:border-orange-500/30 transition-all space-y-4">
                            <div className="space-y-1">
                               <div className="text-orange-500 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                  <Plus size={14}/> EXPANSÃO GEOGRÁFICA
                               </div>
                               <h4 className="text-white text-sm font-bold">Criar Nova Região</h4>
                               <p className="text-[10px] text-slate-500">Insira uma nova reião de atuação para o próximo round.</p>
                            </div>
                            
                            <div className="space-y-3">
                               <div>
                                  <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Nome</label>
                                  <input type="text" placeholder="Ex: SUL, MÉXICO" value={newRegionName} onChange={e => setNewRegionName(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-black outline-none focus:border-orange-500" />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-2">
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Moeda</label>
                                     <select value={newRegionCurrency} onChange={e => setNewRegionCurrency(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-black outline-none focus:border-orange-500">
                                        <option value="BRL">BRL</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="CNY">CNY</option>
                                        <option value="BTC">BTC</option>
                                     </select>
                                  </div>
                                  <div>
                                     <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Peso (%)</label>
                                     <input type="number" value={newRegionWeight} onChange={e => setNewRegionWeight(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-orange-500" />
                                  </div>
                               </div>

                               <div className="grid grid-cols-3 gap-2">
                                  <div>
                                     <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">Preço Sugerido ($)</label>
                                     <input type="number" step="0.1" value={newRegionSuggestedPrice} onChange={e => setNewRegionSuggestedPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-[10px] font-mono font-bold text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                                  <div>
                                     <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">Custo Frete ($)</label>
                                     <input type="number" step="0.1" value={newRegionDistributionCost} onChange={e => setNewRegionDistributionCost(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-[10px] font-mono font-bold text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                                  <div>
                                     <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">Mkt Base ($)</label>
                                     <input type="number" step="100" value={newRegionMarketingCost} onChange={e => setNewRegionMarketingCost(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-[10px] font-mono font-bold text-white outline-none focus:border-orange-500 transition-colors" />
                                  </div>
                               </div>
                            </div>
                            
                            <button onClick={handleAddRegion} className="w-full py-2.5 bg-white hover:bg-orange-500 hover:text-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                               <Plus size={12}/> Anexar Região
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'staffing' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Briefcase className="text-orange-500"/> Força de Trabalho (Staffing)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <MacroInput label="Salário Base Operacional ($)" val={macro.hr_base.salary} onChange={(v: number) => setMacro({...macro, hr_base: {...macro.hr_base, salary: v}})} />
                      <MacroInput label="Máximo Turnos Permitidos" val={macro.max_shifts || 1} onChange={(v: number) => setMacro({...macro, max_shifts: v})} />
                   </div>

                   <div className="pt-8 border-t border-white/5 space-y-6">
                      <h4 className="text-lg font-bold text-white uppercase tracking-wider">Dimensionamento Base do Setor Administrativo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 space-y-2">
                            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Administrativo</span>
                            <div className="flex items-center gap-3">
                               <input type="number" value={macro.staffing.admin.count} onChange={e => setMacro({...macro, staffing: {...macro.staffing, admin: {...macro.staffing.admin, count: parseInt(e.target.value) || 0}}})} className="bg-transparent border-b border-white/10 text-xl font-mono font-black text-white outline-none w-20" />
                               <span className="text-xs text-slate-500">FTEs</span>
                            </div>
                         </div>
                         <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 space-y-2">
                            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Vendas</span>
                            <div className="flex items-center gap-3">
                               <input type="number" value={macro.staffing.sales.count} onChange={e => setMacro({...macro, staffing: {...macro.staffing, sales: {...macro.staffing.sales, count: parseInt(e.target.value) || 0}}})} className="bg-transparent border-b border-white/10 text-xl font-mono font-black text-white outline-none w-20" />
                               <span className="text-xs text-slate-500">FTEs</span>
                            </div>
                         </div>
                         <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 space-y-2">
                            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Produção</span>
                            <div className="flex items-center gap-3">
                               <input type="number" value={macro.staffing.production.count} onChange={e => setMacro({...macro, staffing: {...macro.staffing, production: {...macro.staffing.production, count: parseInt(e.target.value) || 0}}})} className="bg-transparent border-b border-white/10 text-xl font-mono font-black text-white outline-none w-20" />
                               <span className="text-xs text-slate-500">FTEs</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'international' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Coins className="text-orange-500"/> Paridade Cambial e Taxas de Câmbio</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      <ParamCard label="Taxa Câmbio USD" val={macro.exchange_rates.USD} onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, USD: v}})} suffix="BRL" icon={<Coins size={16}/>} />
                      <ParamCard label="Taxa Câmbio EUR" val={macro.exchange_rates.EUR} onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, EUR: v}})} suffix="BRL" icon={<Coins size={16}/>} />
                      <ParamCard label="Taxa Câmbio GBP" val={macro.exchange_rates.GBP} onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, GBP: v}})} suffix="BRL" icon={<Coins size={16}/>} />
                      <ParamCard label="Taxa Câmbio CNY" val={macro.exchange_rates.CNY} onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, CNY: v}})} suffix="BRL" icon={<Coins size={16}/>} />
                      <ParamCard label="Taxa Câmbio BTC" val={macro.exchange_rates.BTC} onChange={(v: number) => setMacro({...macro, exchange_rates: {...macro.exchange_rates, BTC: v}})} suffix="BRL" icon={<Coins size={16}/>} />
                   </div>

                   {/* Simulador Cross-Rate */}
                   <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 space-y-6">
                      <div className="flex items-center gap-3">
                         <span className="p-2 bg-orange-600/10 rounded-xl text-orange-500"><Calculator size={18}/></span>
                         <div>
                            <h4 className="text-base font-bold text-white uppercase">Simulador de Conversão Financeira (Cross-Rate)</h4>
                            <p className="text-[11px] text-slate-500">Calcule instantaneamente a paridade cruzada com base nos novos câmbios ajustados acima.</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                         <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 block mb-2">Montante</label>
                            <input type="number" value={calcValue} onChange={e => setCalcValue(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none" />
                         </div>
                         <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 block mb-2">De</label>
                            <select value={calcFrom} onChange={e => setCalcFrom(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none">
                               {Object.keys(macro.exchange_rates).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 block mb-2">Para</label>
                            <select value={calcTo} onChange={e => setCalcTo(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none">
                               {Object.keys(macro.exchange_rates).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                         <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-orange-400">Resultado</span>
                            <span className="text-base font-mono font-black text-white">
                               {calcFrom === calcTo ? calcValue.toFixed(2) : (calcValue * (macro.exchange_rates[calcFrom] || 1.0) / (macro.exchange_rates[calcTo] || 1.0)).toFixed(4)} {calcTo}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'awards' && (
                <div className="bg-orange-600/5 p-10 rounded-[4rem] border border-orange-500/20 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Award className="text-orange-500"/> Premiações por Precisão de Orçamento</h3>
                   <p className="text-xs text-slate-400 max-w-2xl">Os estudantes ganham bonificações corporativas adicionais em dinheiro caso a estimativa de custos, receitas e lucros coincidam dentro das margens de precisão configuradas abaixo.</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <MacroInput label="Prêmio Precisão Custo ($)" val={macro.award_values.cost_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, cost_precision: v}})} />
                      <MacroInput label="Prêmio Precisão Receita ($)" val={macro.award_values.revenue_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, revenue_precision: v}})} />
                      <MacroInput label="Prêmio Precisão Lucro ($)" val={macro.award_values.profit_precision} onChange={(v: number) => setMacro({...macro, award_values: {...macro.award_values, profit_precision: v}})} />
                   </div>
                </div>
             )}

             {activeTab === 'observers' && (
                <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                   <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Eye className="text-orange-500"/> Observadores Autorizados (Tutor/Avaliação)</h3>
                   <p className="text-xs text-slate-400">Insira as credenciais de usuários UUID para conceder acesso em modo somente leitura (auditoria acadêmica) para esta arena.</p>
                   
                   <div className="flex gap-4 max-w-xl">
                      <input type="text" placeholder="UUID do Usuário Observador" value={newObserverId} onChange={e => setNewObserverId(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500 transition-colors font-mono text-sm" />
                      <button onClick={handleAddObserver} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-500 transition-all flex items-center gap-2">
                         <UserPlus size={16}/> Adicionar
                      </button>
                   </div>

                   <div className="space-y-4 max-w-2xl">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lista de Observadores Vinculados</h4>
                      {observersList.length === 0 ? (
                         <div className="p-8 bg-slate-950/40 rounded-3xl text-center text-xs text-slate-500 border border-white/5 border-dashed">
                            Nenhum observador anexado a esta arena de torneio.
                         </div>
                      ) : (
                         <div className="divide-y divide-white/5 bg-slate-950 rounded-3xl border border-white/5 overflow-hidden">
                            {observersList.map(obs => (
                               <div key={obs} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                  <div className="flex items-center gap-3">
                                     <User size={14} className="text-slate-400"/>
                                     <span className="font-mono text-xs text-slate-300">{obs}</span>
                                  </div>
                                  <button onClick={() => handleRemoveObserver(obs)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all" title="Remover Acesso">
                                     <UserMinus size={14}/>
                                  </button>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
             )}

          </motion.div>
       </AnimatePresence>

       <div className="flex justify-end pt-12 border-t border-white/5">
          <button onClick={handleSave} disabled={isSaving} className="px-24 py-10 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-white hover:text-orange-950 transition-all shadow-[0_20px_80px_rgba(249,115,22,0.5)] flex items-center gap-10 active:scale-95 group border-4 border-orange-400/50">
             {isSaving ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} strokeWidth={2.5} /> Confirmar Intervenção no R-{nextRoundIdx}</>}
          </button>
       </div>
    </div>
  );
};

const ParamCard = ({ label, val, suffix, onChange, icon }: any) => (
  <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/5 flex flex-col gap-6 shadow-xl group hover:border-orange-500/30 transition-all">
     <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all w-fit">{icon}</div>
     <div>
        <label className="text-[10px] font-black text-slate-500 group-hover:text-orange-500 mb-4 block italic uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-3">
           <input type="number" step="0.0001" value={val} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="bg-transparent text-4xl font-black text-white italic outline-none w-32 border-b border-white/5 focus:border-orange-500 transition-all" />
           <span className="text-2xl font-black text-slate-700 italic">{suffix}</span>
        </div>
     </div>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border-2 active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
    {icon} {label}
  </button>
);

const MacroInput = ({ label, val, onChange, dark }: any) => (
  <div className="space-y-4 group">
     <label className={`text-[10px] font-black uppercase tracking-[0.2em] italic group-focus-within:text-orange-500 transition-colors ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
     <input type="number" step="0.1" value={val} onChange={e => onChange(Number(e.target.value) || 0)} className={`w-full border-2 rounded-[1.5rem] px-8 py-6 font-mono font-black text-3xl outline-none transition-all ${dark ? 'bg-slate-950 border-white/5 text-white focus:border-blue-600' : 'bg-slate-950 border-white/10 text-white focus:border-orange-600 shadow-inner'}`} />
  </div>
);

export default TutorArenaControl;
