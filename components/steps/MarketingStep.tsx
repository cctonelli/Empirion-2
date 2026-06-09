import React from 'react';
import { Megaphone, Info, HelpCircle, RefreshCw, Globe } from 'lucide-react';
import { WizardStepHeader, CurrencyInput } from './shared';
import { DecisionData, Championship, Team } from '../../types';
import { supabase } from '../../services/supabase';
import { getAdjustedPrice } from '../../services/simulation';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../../constants';

interface MarketingStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  replicateInCluster: () => void;
  activeArena: Championship | null;
  activeTeam?: Team | null;
  isReadOnly: boolean;
}

export const MarketingStep: React.FC<MarketingStepProps> = ({
  decisions,
  updateDecision,
  replicateInCluster,
  activeArena,
  activeTeam,
  isReadOnly,
}) => {
  const [competitorsLog, setCompetitorsLog] = React.useState<any[]>([]);
  const [loadingIntel, setLoadingIntel] = React.useState(false);

  React.useEffect(() => {
    const fetchCompetitors = async () => {
      if (!activeArena) return;
      setLoadingIntel(true);
      try {
        const historyTable = activeArena.is_trial ? 'trial_companies' : 'companies';
        const targetRound = activeArena.current_round || 0;
        const { data, error } = await supabase
          .from(historyTable)
          .select('*')
          .eq('championship_id', activeArena.id)
          .eq('round', targetRound);
        
        if (error) {
          console.error("Error fetching competitor history:", error);
        } else if (data) {
          setCompetitorsLog(data);
        }
      } catch (err) {
        console.error("Intel fetch err:", err);
      } finally {
        setLoadingIntel(false);
      }
    };

    fetchCompetitors();
  }, [activeArena]);

  const getTeamCapacity = (c: any) => {
    const kpis = c.kpis || {};
    const machines = kpis.machines || [];
    const shifts = c.state?.production?.shifts || 1;
    let capMult = 1.0;
    if (shifts === 2) capMult = 1.7;
    else if (shifts === 3) capMult = 2.3;

    const specs = activeArena?.market_indicators?.machine_specs || {
      alpha: { production_capacity: 10000 },
      beta: { production_capacity: 18000 },
      gamma: { production_capacity: 30000 }
    };

    const baseCap = machines.reduce((acc: number, m: any) => {
      const model = m.model === 'alfa' ? 'alpha' : m.model === 'gama' ? 'gamma' : m.model;
      const modelKey = (model as string) === 'alpha' ? 'alpha' : (model as string) === 'beta' ? 'beta' : 'gamma';
      const cap = specs[modelKey]?.production_capacity || 0;
      return acc + cap;
    }, 0);

    const totalCap = (baseCap > 0 ? baseCap : 40000) * capMult;
    return totalCap;
  };

  const calculateRegionStats = (regionId: number) => {
    const rows = competitorsLog.length > 0 ? competitorsLog : (activeArena?.teams || []).map(t => ({
      team_id: t.id,
      state: (t as any).current_decision || {},
      kpis: t.kpis || {}
    }));

    // 1. Preço médio regiao anterior
    const prevPrices = rows
      .map(c => {
        const regDec = c.state?.regions?.[regionId] || c.state?.regions?.[String(regionId)];
        return regDec ? Number(regDec.price) : null;
      })
      .filter((p): p is number => p !== null && p > 0);
    const avgPriceRegion = prevPrices.length > 0
      ? prevPrices.reduce((sum, p) => sum + p, 0) / prevPrices.length
      : 0;

    // 2. Parâmetros de contexto
    const regionConf = activeArena?.config?.regions?.find((r: any) => r.id === regionId) || activeArena?.config?.region_configs?.find((r: any) => r.id === regionId);
    const baseSuggestedPrice = regionConf?.suggested_price !== undefined ? Number(regionConf.suggested_price) : (activeArena?.market_indicators?.avg_selling_price || 425);
    const demandVariation = activeArena?.market_indicators?.demand_variation || 0;

    const regionCount = Object.keys(decisions.regions).length || 1;

    let totalRegionDemand = 0;
    let totalRegionUnitsSold = 0;
    let activeTeamUnitsSold = 0;

    const storedTeamId = activeTeam?.id || localStorage.getItem('active_team_id');

    rows.forEach((c: any) => {
      const regDec = c.state?.regions?.[regionId] || c.state?.regions?.[String(regionId)];
      if (!regDec) return;

      const regPrice = Number(regDec.price) || baseSuggestedPrice;
      const regMarketing = Number(regDec.marketing) || 0;
      const regTerm = Number(regDec.term) || 0;
      const rjDemandPenalty = c.state?.judicial_recovery === true ? 0.85 : 1.0;

      const capacity = getTeamCapacity(c);
      const baseDemandPerRegion = (capacity * 0.8) / regionCount;

      const priceIndex = regPrice > 0 ? baseSuggestedPrice / regPrice : 1;
      const marketingIndex = 1 + (regMarketing * 0.08);
      const termIndex = 1 + (regTerm * 0.05);

      const regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (demandVariation / 100)) * rjDemandPenalty);
      
      const unitsProduced = Number(c.kpis?.statements?.dre?.find((item: any) => item.id === 'dre.cpv')?.quantity) || Number(c.kpis?.finished_goods_produced) || (capacity * 0.8);
      const prevStockQty = Number(c.kpis?.statements?.balance_sheet?.find((item: any) => item.id === 'assets.current.stock.pa')?.quantity) || Number(c.kpis?.stock_quantities?.finished_goods) || 0;
      const totalQtyPaForSale = prevStockQty + unitsProduced;

      const regUnitsSold = Math.min(regDemand, Math.floor(totalQtyPaForSale / regionCount));

      totalRegionDemand += regDemand;
      totalRegionUnitsSold += regUnitsSold;

      if (c.team_id === storedTeamId) {
        activeTeamUnitsSold = regUnitsSold;
      }
    });

    const activeWeight = regionConf?.demand_weight || 20;

    return {
      avgPriceRegion,
      totalRegionDemand,
      totalRegionUnitsSold,
      weight: activeWeight,
      relativeSalesShare: totalRegionUnitsSold > 0 ? (activeTeamUnitsSold / totalRegionUnitsSold) * 100 : 0
    };
  };
  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader
        icon={<Megaphone size={32} strokeWidth={2.5} />}
        title="Estratégia Comercial"
        desc="Configure preço, prazo e marketing por região. Decisões afetam demanda, margem e fluxo de caixa."
        help="Use o botão replicar para aplicar a Região 1 em todas as demais."
      />

      {/* Bloco único de explicações */}
      <div className="bg-slate-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
        <h5 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-6 flex items-center gap-3">
          <Info size={20} />
          Entenda o impacto de cada decisão comercial
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-sm">
          {/* Juros de venda a prazo */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Juros de Venda a Prazo (%)
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Taxa cobrada em vendas parceladas. Alto → mais receita financeira, mas menor atratividade e volume de vendas. Mantenha baixo (0.8–2.5%) em mercados competitivos.
            </p>
          </div>

          {/* Preço Unitário */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Preço Unitário
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Preço de venda na região. Alto → maior margem unitária, mas menor volume (elasticidade-preço). Baixo → ganha market share, mas comprime lucro. Alinhe com custo projetado + markup desejado.
            </p>
          </div>

          {/* Prazo de Recebimento */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Prazo de Recebimento
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Parcelamento oferecido. Prazo longo → mais vendas, mas fluxo de caixa piora e risco de inadimplência cresce. À vista → preserva liquidez, mas pode limitar volume em regiões sensíveis.
            </p>
          </div>

          {/* Campanhas de Marketing */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Campanhas de Marketing (0–9)
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Intensidade publicitária. Cada ponto aumenta demanda, mas consome verba fixa. Retorno decrescente: invista mais em regiões com alta elasticidade-preço. 0 = sem esforço, 9 = campanha agressiva.
            </p>
          </div>
        </div>
      </div>

      {/* Configuração global: Juros + Replicar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 bg-slate-900/60 p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="w-full lg:w-80 space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-3">
            Juros de Venda a Prazo (%)
            <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="20"
              disabled={isReadOnly}
              value={decisions.production.term_interest_rate}
              onChange={e => updateDecision('production.term_interest_rate', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-orange-400">%</span>
          </div>
        </div>

        <button
          onClick={replicateInCluster}
          disabled={isReadOnly || Object.keys(decisions.regions).length <= 1}
          className={`
            px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-3 shadow-xl
            ${Object.keys(decisions.regions).length <= 1 || isReadOnly
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border border-orange-400/30 active:scale-95'}
          `}
        >
          <RefreshCw size={16} />
          Replicar Região 1
        </button>
      </div>

      {/* Cards de regiões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {Object.entries(decisions.regions).map(([id, reg]: [string, any]) => {
          const regId = Number(id);
          const regionConf = activeArena?.config?.regions?.find((r: any) => r.id === regId) || activeArena?.config?.region_configs?.find((r: any) => r.id === regId);
          
          const sugPrice = regionConf?.suggested_price !== undefined ? Number(regionConf.suggested_price) : (activeArena?.market_indicators?.avg_selling_price || 425);
          const distCost = regionConf?.distribution_cost !== undefined ? Number(regionConf.distribution_cost) : (activeArena?.market_indicators?.prices?.distribution_unit || 50);
          const mktCost = regionConf?.marketing_cost !== undefined ? Number(regionConf.marketing_cost) : (activeArena?.market_indicators?.prices?.marketing_campaign || 10000);
          const currency = regionConf?.currency || activeArena?.currency || 'BRL';

          const round = (activeArena?.current_round || 0) + 1;
          const adjustedDistCost = getAdjustedPrice(distCost, 'distribution_cost_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM);
          const adjustedMktCost = getAdjustedPrice(mktCost, 'marketing_campaign_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM);
          const totalMktCost = reg.marketing * adjustedMktCost;
          const stats = calculateRegionStats(regId);

          return (
            <div
              key={id}
              className="bg-slate-900/70 backdrop-blur-sm p-5 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-black text-orange-400 uppercase italic tracking-tight font-sans">
                    {activeArena?.region_names?.[Number(id) - 1] || `Região ${id}`}
                  </h4>
                  <Globe size={18} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
                </div>

                <div className="space-y-4">
                  {/* Preço */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">Preço Unitário</label>
                    <CurrencyInput
                      value={reg.price}
                      onChange={v => updateDecision(`regions.${id}.price`, v)}
                      currency={currency}
                    />
                  </div>

                  {/* Prazo */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">Prazo de Recebimento</label>
                    <select
                      disabled={isReadOnly}
                      value={reg.term}
                      onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value={0}>A VISTA</option>
                      <option value={1}>A VISTA + 50%</option>
                      <option value={2}>A VISTA + 33% + 33%</option>
                    </select>
                  </div>

                  {/* Marketing */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">Marketing (0–9)</label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      disabled={isReadOnly}
                      value={reg.marketing}
                      onChange={e => {
                        const val = Math.min(9, Math.max(0, parseInt(e.target.value) || 0));
                        updateDecision(`regions.${id}.marketing`, val);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Informações fidedignas de parâmetros estipulados pelo Tutor */}
              <div className="mt-5 pt-3 border-t border-white/5 space-y-1.5 font-sans">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Preço Médio:</span>
                  <span className="text-amber-400 font-bold">{currency} {stats.avgPriceRegion.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Market Share Total (qtde):</span>
                  <span className="text-slate-300 font-semibold">{stats.totalRegionDemand.toLocaleString('pt-BR')} un</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Demanda Atingida Total:</span>
                  <span className="text-slate-300 font-semibold">{stats.totalRegionUnitsSold.toLocaleString('pt-BR')} un</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Peso Demanda Total (%):</span>
                  <span className="text-slate-300 font-semibold">{stats.weight}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Venda Relativa (%):</span>
                  <span className="text-emerald-400 font-bold">{stats.relativeSalesShare.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Custo unit. Logística:</span>
                  <span className="text-slate-400 font-semibold">{currency} {adjustedDistCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /un</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Custo unit. Campanha:</span>
                  <span className="text-slate-400 font-semibold">{currency} {adjustedMktCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-white/5 text-[10px] text-slate-400 uppercase tracking-wide font-mono leading-none">
                  <span>Valor Total Campanhas:</span>
                  <span className="text-orange-400 font-black">{currency} {totalMktCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-20 lg:h-28" />
    </div>
  );
};
