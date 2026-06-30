import React from "react";
import {
  Megaphone,
  Info,
  HelpCircle,
  RefreshCw,
  Globe,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { WizardStepHeader, CurrencyInput } from "./shared";
import { DecisionData, Championship, Team } from "../../types";
import { supabase } from "../../services/supabase";
import {
  getAdjustedPrice,
  calculateProjections,
} from "../../services/simulation";
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from "../../constants";

interface MarketingStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  replicateInCluster: () => void;
  activeArena: Championship | null;
  activeTeam?: Team | null;
  isReadOnly: boolean;
  round?: number;
}

export const MarketingStep: React.FC<MarketingStepProps> = ({
  decisions,
  updateDecision,
  replicateInCluster,
  activeArena,
  activeTeam,
  isReadOnly,
  round,
}) => {
  const targetRound = round !== undefined ? round : ((activeArena?.current_round || 0) + 1);
  const [competitorsLog, setCompetitorsLog] = React.useState<any[]>([]);
  const [loadingIntel, setLoadingIntel] = React.useState(false);
  const [allRegionsExpanded, setAllRegionsExpanded] = React.useState(false);

  const toggleRegionProfitability = () => {
    setAllRegionsExpanded((prev) => !prev);
  };

  // Cálculo do Projeções em tempo real da equipe ativa com base nas decisões correntes
  const projection = React.useMemo(() => {
    if (!activeArena || !activeTeam) return null;
    try {
      const targetRound = round !== undefined ? round : ((activeArena.current_round || 0) + 1);
      const currentRules = activeArena.round_rules?.[targetRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[targetRound] || activeArena.general_settings || {};
      const indicatorsForRound = {
        ...(activeArena.general_settings || {}),
        ...currentRules
      };

      return calculateProjections(
        decisions,
        activeArena.branch,
        {
          ...(activeArena.config || {}),
          currency: activeArena.currency,
        } as any,
        indicatorsForRound,
        activeTeam,
        competitorsLog || [],
        targetRound,
        activeArena.round_rules,
      );
    } catch (err) {
      console.error("Error calculating active team projections: ", err);
      return null;
    }
  }, [decisions, activeArena, activeTeam, competitorsLog, round]);

  const getActiveTeamUnitCPV = () => {
    // 1. Prioriza custo de produção direto da projeção em tempo real ativa
    if (projection?.kpis?.cpv_details?.custoUnitarioProducao) {
      return projection.kpis.cpv_details.custoUnitarioProducao;
    }
    if (projection?.kpis?.kardex?.pa?.saldoFinalUnitario) {
      return projection.kpis.kardex.pa.saldoFinalUnitario;
    }
    if (projection?.kpis?.kardex?.pa?.saidasUnitario) {
      return projection.kpis.kardex.pa.saidasUnitario;
    }

    // 2. Fallback no histórico imediato (kpis do activeTeam)
    if (activeTeam?.kpis?.cpv_details?.custoUnitarioProducao) {
      return activeTeam.kpis.cpv_details.custoUnitarioProducao;
    }
    if (activeTeam?.kpis?.kardex?.pa?.saldoFinalUnitario) {
      return activeTeam.kpis.kardex.pa.saldoFinalUnitario;
    }
    if (activeTeam?.kpis?.kardex?.pa?.saidasUnitario) {
      return activeTeam.kpis.kardex.pa.saidasUnitario;
    }

    // 3. Fallback clássico a partir de declarações no DRE histórico
    const dre = activeTeam?.kpis?.statements?.dre;
    if (dre && Array.isArray(dre)) {
      const cpvItem = dre.find((item: any) => item.id === "cpv");
      if (cpvItem) {
        const value = Math.abs(Number(cpvItem.value) || 0);
        const qty = Number(activeTeam?.kpis?.finished_goods_produced) || 0;
        if (qty > 0) return value / qty;
      }
    }

    // 4. Parâmetros nominais de reajuste inicial
    const mpaPrice = activeArena?.general_settings?.prices?.mp_a || 20;
    const mpbPrice = activeArena?.general_settings?.prices?.mp_b || 40;
    const baseMPCost = 3 * mpaPrice + 2 * mpbPrice;
    const standardOverhead = 150;
    return baseMPCost + standardOverhead;
  };

  React.useEffect(() => {
    const fetchCompetitors = async () => {
      if (!activeArena) return;
      setLoadingIntel(true);
      try {
        const historyTable = activeArena.is_trial
          ? "trial_companies"
          : "companies";
        const targetRound = activeArena.current_round || 0;
        const { data, error } = await supabase
          .from(historyTable)
          .select("*")
          .eq("championship_id", activeArena.id)
          .eq("round", targetRound);

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
    if (shifts === 2)
      capMult = 1.8; // Match real backend multiplier 1.8
    else if (shifts === 3) capMult = 2.3;

    const specs = activeArena?.general_settings?.machine_specs || {
      alpha: { production_capacity: 10000 },
      beta: { production_capacity: 18000 },
      gamma: { production_capacity: 30000 },
    };

    // 1. Somar capacidade das máquinas instaladas fisicamente no ciclo anterior
    let baseCap = machines.reduce((acc: number, m: any) => {
      const model =
        m.model === "alfa" ? "alpha" : m.model === "gama" ? "gamma" : m.model;
      const modelKey =
        (model as string) === "alpha"
          ? "alpha"
          : (model as string) === "beta"
            ? "beta"
            : "gamma";
      const cap = specs[modelKey]?.production_capacity || 0;
      return acc + cap;
    }, 0);

    // 2. Somar decisões de compra de máquinas sob análise no ciclo ativo (CAPEX do round)
    const decideBuyAlpha = Number(
      c.state?.machinery?.buy?.alpha ?? c.state?.machinery?.buy?.alfa ?? 0,
    );
    const decideBuyBeta = Number(c.state?.machinery?.buy?.beta ?? 0);
    const decideBuyGamma = Number(
      c.state?.machinery?.buy?.gamma ?? c.state?.machinery?.buy?.gama ?? 0,
    );

    const capBuyAlpha =
      decideBuyAlpha * (specs.alpha?.production_capacity || 10000);
    const capBuyBeta =
      decideBuyBeta * (specs.beta?.production_capacity || 18000);
    const capBuyGamma =
      decideBuyGamma * (specs.gamma?.production_capacity || 30000);

    baseCap += capBuyAlpha + capBuyBeta + capBuyGamma;

    // Detecção segura do modo Start From Zero em todas as variações de payloads configurados
    const isZeroMode =
      activeArena?.starting_mode === "start_from_zero" ||
      activeArena?.config?.starting_mode === "start_from_zero" ||
      (activeArena as any)?.config?.startingMode === "start_from_zero" ||
      (activeArena as any)?.startingMode === "start_from_zero" ||
      (activeArena as any)?.mode === "start_from_zero";

    const defaultFallbackCap = isZeroMode ? 0 : 40000;
    const totalCap = (baseCap > 0 ? baseCap : defaultFallbackCap) * capMult;
    return totalCap;
  };

  const getHistoricalActiveTeamUnitCPV = (activeTeamRecord: any) => {
    if (!activeTeamRecord) return 0;

    // 1. Prioriza custo da empresa histórica
    if (activeTeamRecord.kpis?.cpv_details?.custoUnitarioProducao) {
      return activeTeamRecord.kpis.cpv_details.custoUnitarioProducao;
    }
    if (activeTeamRecord.kpis?.kardex?.pa?.saidasUnitario) {
      return activeTeamRecord.kpis.kardex.pa.saidasUnitario;
    }
    if (activeTeamRecord.kpis?.kardex?.pa?.saldoFinalUnitario) {
      return activeTeamRecord.kpis.kardex.pa.saldoFinalUnitario;
    }

    // 2. Fallback DRE histórico
    const dre = activeTeamRecord.kpis?.statements?.dre;
    if (dre && Array.isArray(dre)) {
      const cpvItem = dre.find((item: any) => item.id === "cpv");
      if (cpvItem) {
        const value = Math.abs(Number(cpvItem.value) || 0);
        const qty = Number(activeTeamRecord.kpis?.finished_goods_produced) || 0;
        if (qty > 0) return value / qty;
      }
    }

    // 3. Parâmetros nominais clássicos se nada houver
    const mpaPrice = activeArena?.general_settings?.prices?.mp_a || 20;
    const mpbPrice = activeArena?.general_settings?.prices?.mp_b || 40;
    return 3 * mpaPrice + 2 * mpbPrice + 40; // custo base mp + mod/cif
  };

  const calculateRegionStats = (
    regionId: number,
    useHistoricalOnly = false,
  ) => {
    const storedTeamId =
      activeTeam?.id || localStorage.getItem("active_team_id");
    const rows =
      competitorsLog.length > 0
        ? competitorsLog
        : (activeArena?.teams || []).map((t) => ({
            team_id: t.id,
            state: (t as any).current_decision || {},
            kpis: t.kpis || {},
          }));

    // 1. Preço médio regiao anterior
    const prevPrices = rows
      .map((c) => {
        const isCurrentActiveTeam = String(c.team_id) === String(storedTeamId);
        const stateToUse =
          isCurrentActiveTeam && !useHistoricalOnly ? decisions : c.state || {};
        const regDec =
          stateToUse?.regions?.[regionId] ||
          stateToUse?.regions?.[String(regionId)];
        return regDec ? Number(regDec.price) : null;
      })
      .filter((p): p is number => p !== null && p > 0);
    const avgPriceRegion =
      prevPrices.length > 0
        ? prevPrices.reduce((sum, p) => sum + p, 0) / prevPrices.length
        : 0;

    // 2. Parâmetros de contexto e regiões
    const regionConf =
      activeArena?.config?.regions?.find((r: any) => r.id === regionId) ||
      activeArena?.config?.region_configs?.find((r: any) => r.id === regionId) ||
      activeArena?.config?.regions?.[regionId - 1] ||
      activeArena?.config?.region_configs?.[regionId - 1];
    const baseSuggestedPrice =
      regionConf?.suggested_price !== undefined
        ? Number(regionConf.suggested_price)
        : activeArena?.general_settings?.avg_selling_price || 425;
    const demandVariation =
      activeArena?.general_settings?.demand_variation || 0;

    const targetRound = useHistoricalOnly 
      ? (activeArena?.current_round || 0) 
      : (round !== undefined ? round : ((activeArena?.current_round || 0) + 1));

    let regionConfigs: any[] =
      activeArena?.round_rules?.[targetRound]?.regions ||
      activeArena?.round_rules?.[targetRound]?.region_configs ||
      activeArena?.config?.regions ||
      activeArena?.config?.region_configs ||
      activeArena?.region_configs ||
      [];

    // Filtrar apenas as regiões vigentes na rodada correspondente (targetRound)
    regionConfigs = regionConfigs.filter((r: any) => !r.start_round || r.start_round <= targetRound);

    if (!regionConfigs || regionConfigs.length === 0) {
      const regCount =
        activeArena?.regions_count ||
        Object.keys(decisions.regions || {}).length ||
        1;
      regionConfigs = Array.from({ length: regCount }, (_, i) => ({
        id: i + 1,
        name: `Região ${i + 1}`,
        demand_weight: 100 / regCount,
        suggested_price: baseSuggestedPrice,
      }));
    }

    // 3. Capacidade Nominal a 100% e estoque de cada equipe concorrente
    const teamCapacities: Record<string, number> = {};
    const teamStockPA: Record<string, number> = {};

    rows.forEach((c: any) => {
      const isCurrentActiveTeam = String(c.team_id) === String(storedTeamId);
      const stateToUse =
        isCurrentActiveTeam && !useHistoricalOnly ? decisions : c.state || {};

      const capacity = getTeamCapacity({
        team_id: c.team_id,
        state: stateToUse,
        kpis: c.kpis,
      });
      teamCapacities[String(c.team_id)] = capacity;

      // Unidades disponíveis para venda com sincronização fiduciária reativa em tempo real
      let unitsProduced = 0;
      let prevStockQty = 0;

      if (isCurrentActiveTeam && !useHistoricalOnly) {
        unitsProduced = projection?.kpis?.finished_goods_produced ?? 0;
        prevStockQty =
          Number(activeTeam?.kpis?.stock_quantities?.finished_goods) || 0;
      } else {
        if (useHistoricalOnly) {
          // No histórico já finalizado e consolidado, o estoque de partida do ciclo é kpis.kardex.pa.saldoInicialQtd
          prevStockQty = Number(c.kpis?.kardex?.pa?.saldoInicialQtd ?? 0);
          unitsProduced = Number(
            c.kpis?.kardex?.pa?.entradasQtd ??
              c.kpis?.finished_goods_produced ??
              0,
          );
        } else {
          // Projeção futura para bots/concorrência na rodada de simulação atual
          unitsProduced =
            Number(c.kpis?.finished_goods_produced) || capacity * 0.8;
          // O estoque de partida para o ciclo futuro é o estoque final do ciclo que acabou de fechar
          prevStockQty = Number(c.kpis?.stock_quantities?.finished_goods) || 0;
        }
      }
      teamStockPA[String(c.team_id)] = prevStockQty + unitsProduced;
    });

    const isZeroMode =
      activeArena?.starting_mode === "start_from_zero" ||
      activeArena?.config?.starting_mode === "start_from_zero" ||
      (activeArena as any)?.config?.startingMode === "start_from_zero" ||
      (activeArena as any)?.startingMode === "start_from_zero" ||
      (activeArena as any)?.mode === "start_from_zero";
    const totalCapacityAllTeamsRaw = Object.values(teamCapacities).reduce(
      (sum, cap) => sum + cap,
      0,
    );
    const nominalTeamCapacity = 10000;
    // No modo START FROM ZERO, ignoramos o fallback da capacidade nominal de mercado quando as equipes
    // ainda não possuem máquinas ativas no Round 0, garantindo o dimensionamento rigoroso de mercado.
    const totalCapacityAllTeams = isZeroMode
      ? totalCapacityAllTeamsRaw
      : totalCapacityAllTeamsRaw > 0
        ? totalCapacityAllTeamsRaw
        : nominalTeamCapacity * (rows || []).length;

    // 4. Demanda de mercado da região (Market Size por Região)
    const regionalMarketSizes: Record<string, number> = {};
    regionConfigs.forEach((r: any, idx: number) => {
      const rIdStr = String(idx + 1);
      const rWeight = Number(
        r.demand_weight || r.weight || r.demand_percent || 0,
      );
      const baseRegDemand = totalCapacityAllTeams * (rWeight / 100);
      const regDemand = Math.floor(baseRegDemand * (1 + demandVariation / 100));
      regionalMarketSizes[rIdStr] = regDemand;
    });

    // 5. Pontuação competitiva das equipes regionais
    const teamRegionScores: Record<string, Record<string, number>> = {};
    rows.forEach((c: any) => {
      const isCurrentActiveTeam = String(c.team_id) === String(storedTeamId);
      const stateToUse =
        isCurrentActiveTeam && !useHistoricalOnly ? decisions : c.state || {};
      const tIdStr = String(c.team_id);
      teamRegionScores[tIdStr] = {};

      regionConfigs.forEach((r: any, idx: number) => {
        const rIdStr = String(idx + 1);
        const rDec =
          stateToUse?.regions?.[rIdStr] || stateToUse?.regions?.[r.id] || {};

        const rSuggestedPrice =
          r.suggested_price !== undefined
            ? Number(r.suggested_price)
            : baseSuggestedPrice;
        const regPrice = Number(rDec.price) || rSuggestedPrice;
        const regMarketing = Number(rDec.marketing) || 0;
        const regTerm = Number(rDec.term) || 0;
        const isRJ = stateToUse?.judicial_recovery === true;
        const rjDemandPenalty = isRJ ? 0.85 : 1.0;

        const priceIndex = regPrice > 0 ? rSuggestedPrice / regPrice : 1;
        const marketingIndex = 1 + regMarketing * 0.08;
        const termIndex = 1 + regTerm * 0.05;

        // Juros de Venda a Prazo: se houver venda parcelada (regTerm > 0), a taxa de juros praticada atua como diferencial competitivo.
        // Quanto mais baixa a taxa em relação a um referencial neutro de mercado (2.0%), maior a atratividade do prazo oferecido.
        let interestIndex = 1;
        if (regTerm > 0) {
          const termInterestRate = Number(stateToUse?.production?.term_interest_rate) ?? 0;
          const baseRate = 2.0;
          const diff = baseRate - termInterestRate;
          interestIndex = 1 + diff * 0.04 * (regTerm / 30);
          // Limitadores cautelares para manter a consistência matemática da simulação comercial
          interestIndex = Math.max(0.4, Math.min(1.3, interestIndex));
        }

        teamRegionScores[tIdStr][rIdStr] =
          priceIndex * marketingIndex * (termIndex * interestIndex) * rjDemandPenalty;
      });
    });

    // 6. Aloca a demanda para cada equipe (Market Share Concorrencial)
    const competitiveDemandsPerTeamReg: Record<
      string,
      Record<string, number>
    > = {};
    rows.forEach((c: any) => {
      competitiveDemandsPerTeamReg[String(c.team_id)] = {};
    });

    regionConfigs.forEach((r: any, idx: number) => {
      const rIdStr = String(idx + 1);
      const regDemand = regionalMarketSizes[rIdStr] || 0;

      const scoresWithTeams = rows.map((c: any) => ({
        teamId: String(c.team_id),
        score: teamRegionScores[String(c.team_id)]?.[rIdStr] ?? 0,
      }));

      const totalScoreReg = scoresWithTeams.reduce(
        (sum, item) => sum + item.score,
        0,
      );

      scoresWithTeams.forEach((item) => {
        const companyRecord = rows.find(
          (co: any) => String(co.team_id) === String(item.teamId),
        );
        let teamCapturedDemand = 0;
        if (
          useHistoricalOnly &&
          companyRecord?.kpis?.regional_demands?.[rIdStr] !== undefined
        ) {
          teamCapturedDemand = Number(
            companyRecord.kpis.regional_demands[rIdStr],
          );
        } else {
          const shareReg =
            totalScoreReg > 0 ? item.score / totalScoreReg : 1 / rows.length;
          teamCapturedDemand = Math.floor(regDemand * shareReg);
        }
        competitiveDemandsPerTeamReg[item.teamId][rIdStr] = teamCapturedDemand;
      });
    });

    // 7. Vender proporcionalmente ao estoque disponível de cada time
    const teamUnitsSoldPerReg: Record<string, Record<string, number>> = {};
    rows.forEach((c: any) => {
      const tIdStr = String(c.team_id);
      teamUnitsSoldPerReg[tIdStr] = {};

      const totalQtyForSale = teamStockPA[tIdStr] || 0;
      const demands = competitiveDemandsPerTeamReg[tIdStr] || {};
      const teamTotalDemand = Object.values(demands).reduce(
        (sz, val) => sz + val,
        0,
      );

      const teamStockRatio =
        teamTotalDemand > totalQtyForSale && teamTotalDemand > 0
          ? totalQtyForSale / teamTotalDemand
          : 1;

      let runningUnitsSold = 0;
      regionConfigs.forEach((r: any, idx: number) => {
        const rIdStr = String(idx + 1);
        const regDemand = demands[rIdStr] || 0;

        let regUnitsSold = 0;
        if (
          useHistoricalOnly &&
          c.kpis?.regional_units_sold?.[rIdStr] !== undefined
        ) {
          regUnitsSold = Number(c.kpis.regional_units_sold[rIdStr]);
        } else if (idx === regionConfigs.length - 1) {
          regUnitsSold = Math.min(
            totalQtyForSale,
            Math.min(teamTotalDemand, totalQtyForSale) - runningUnitsSold,
          );
        } else {
          regUnitsSold = Math.min(
            regDemand,
            Math.floor(regDemand * teamStockRatio),
          );
        }
        regUnitsSold = Math.max(0, regUnitsSold);
        teamUnitsSoldPerReg[tIdStr][rIdStr] = regUnitsSold;
        runningUnitsSold += regUnitsSold;
      });
    });

    // 8. Selecionar estatísticas para a região que está sendo consultada
    const rIdStr = String(regionId);
    const rMarketSizeVal = regionalMarketSizes[rIdStr] || 0;

    let totalRegionUnitsSold = 0;
    rows.forEach((c: any) => {
      totalRegionUnitsSold +=
        teamUnitsSoldPerReg[String(c.team_id)]?.[rIdStr] || 0;
    });

    const activeTeamUnitsSold =
      teamUnitsSoldPerReg[String(storedTeamId)]?.[rIdStr] || 0;
    const activeWeight = regionConf?.demand_weight || 20;

    return {
      avgPriceRegion,
      totalRegionDemand: rMarketSizeVal,
      totalRegionUnitsSold,
      activeTeamUnitsSold,
      weight: activeWeight,
      relativeSalesShare:
        rMarketSizeVal > 0
          ? (activeTeamUnitsSold / rMarketSizeVal) * 100
          : 0,
    };
  };

  const firstRegionName = React.useMemo(() => {
    const rRules = activeArena?.round_rules?.[targetRound] || {};
    const firstRegionConf =
      rRules.regions?.find((r: any) => Number(r.id) === 1) ||
      rRules.region_configs?.find((r: any) => Number(r.id) === 1) ||
      activeArena?.config?.regions?.find((r: any) => Number(r.id) === 1) ||
      activeArena?.config?.region_configs?.find((r: any) => Number(r.id) === 1) ||
      activeArena?.config?.regions?.[0] ||
      activeArena?.config?.region_configs?.[0];
    return firstRegionConf?.name || "Região 1";
  }, [activeArena, targetRound]);

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader
        icon={<Megaphone size={32} strokeWidth={2.5} />}
        title="Estratégia Comercial"
        desc="Configure preço, prazo e marketing por região. Decisões afetam demanda, margem e fluxo de caixa."
        help={`Use o botão replicar para aplicar as configurações de ${firstRegionName} em todas as demais.`}
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
              Taxa cobrada em vendas parceladas. Alto → mais receita financeira,
              mas menor atratividade e volume de vendas. Mantenha baixo
              (0.8–2.5%) em mercados competitivos.
            </p>
          </div>

          {/* Preço Unitário */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Preço Unitário
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Preço de venda na região. Alto → maior margem unitária, mas menor
              volume (elasticidade-preço). Baixo → ganha market share, mas
              comprime lucro. Alinhe com custo projetado + markup desejado.
            </p>
          </div>

          {/* Prazo de Recebimento */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Prazo de Recebimento
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Parcelamento oferecido. Prazo longo → mais vendas, mas fluxo de
              caixa piora e risco de inadimplência cresce. À vista → preserva
              liquidez, mas pode limitar volume em regiões sensíveis.
            </p>
          </div>

          {/* Campanhas de Marketing */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              Campanhas de Marketing (0–9)
              <HelpCircle size={14} className="text-slate-500" />
            </label>
            <p className="text-slate-400 leading-relaxed">
              Intensidade publicitária. Cada ponto aumenta demanda, mas consome
              verba fixa. Retorno decrescente: invista mais em regiões com alta
              elasticidade-preço. 0 = sem esforço, 9 = campanha agressiva.
            </p>
          </div>
        </div>
      </div>

      {/* Configuração global: Juros + Replicar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 bg-slate-900/60 p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="w-full lg:w-80 space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-3">
            Juros de Venda a Prazo (%)
            <HelpCircle
              size={16}
              className="text-slate-500 hover:text-orange-400 transition-colors cursor-help"
            />
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="20"
              disabled={isReadOnly}
              value={decisions.production.term_interest_rate}
              onChange={(e) =>
                updateDecision(
                  "production.term_interest_rate",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-orange-400">
              %
            </span>
          </div>
        </div>

        <button
          onClick={replicateInCluster}
          disabled={isReadOnly || Object.keys(decisions.regions).length <= 1}
          className={`
            px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-3 shadow-xl
            ${
              Object.keys(decisions.regions).length <= 1 || isReadOnly
                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border border-orange-400/30 active:scale-95"
            }
          `}
        >
          <RefreshCw size={16} />
          Replicar {firstRegionName}
        </button>
      </div>

      {/* Cards de regiões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
        {Object.entries(decisions.regions).map(([id, reg]: [string, any]) => {
          const regId = Number(id);
          const rRules = activeArena?.round_rules?.[targetRound] || {};
          const regionConf =
            rRules.regions?.find((r: any) => r.id === regId) ||
            rRules.region_configs?.find((r: any) => r.id === regId) ||
            activeArena?.config?.regions?.find((r: any) => r.id === regId) ||
            activeArena?.config?.region_configs?.find(
              (r: any) => r.id === regId,
            ) ||
            activeArena?.config?.regions?.[regId - 1] ||
            activeArena?.config?.region_configs?.[regId - 1];
          const demandWeight =
            regionConf?.demand_weight !== undefined
              ? Number(regionConf.demand_weight)
              : 100 / (activeArena?.regions_count || 1);

          const sugPrice =
            regionConf?.suggested_price !== undefined
              ? Number(regionConf.suggested_price)
              : activeArena?.general_settings?.avg_selling_price || 425;
          const distCost =
            regionConf?.distribution_cost !== undefined
              ? Number(regionConf.distribution_cost)
              : activeArena?.general_settings?.prices?.distribution_unit || 50;
          const mktCost =
            regionConf?.marketing_cost !== undefined
              ? Number(regionConf.marketing_cost)
              : activeArena?.general_settings?.prices?.marketing_campaign ||
                10000;
          const currency =
            regionConf?.currency || activeArena?.currency || "BRL";

          const round = (activeArena?.current_round || 0) + 1;
          const adjustedDistCost = getAdjustedPrice(
            distCost,
            "distribution_cost_adjust",
            round,
            activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM,
          );
          const adjustedMktCost = getAdjustedPrice(
            mktCost,
            "marketing_campaign_adjust",
            round,
            activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM,
          );
          const totalMktCost = reg.marketing * adjustedMktCost;

          // Estatísticas históricas (apuradas) da rodada fechada
          const stats = calculateRegionStats(regId, true);

          return (
            <div
              key={id}
              className="bg-slate-900/70 backdrop-blur-sm p-5 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-black text-orange-400 uppercase italic tracking-tight font-sans">
                    {regionConf?.name ||
                      activeArena?.region_names?.[Number(id) - 1] ||
                      `Região ${id}`}
                  </h4>
                  <Globe
                    size={18}
                    className="text-slate-600 group-hover:text-orange-400 transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  {/* Preço */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">
                      Preço Unitário - Round: {round}
                    </label>
                    <CurrencyInput
                      value={reg.price}
                      onChange={(v) => updateDecision(`regions.${id}.price`, v)}
                      currency={currency}
                    />
                  </div>

                  {/* Prazo */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">
                      Prazo de Recebimento
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={reg.term}
                      onChange={(e) =>
                        updateDecision(
                          `regions.${id}.term`,
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value={0}>A VISTA</option>
                      <option value={1}>A VISTA + 50%</option>
                      <option value={2}>A VISTA + 33% + 33%</option>
                    </select>
                  </div>

                  {/* Marketing */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide font-sans">
                      Marketing (0–9)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      disabled={isReadOnly}
                      value={reg.marketing}
                      onChange={(e) => {
                        const val = Math.min(
                          9,
                          Math.max(0, parseInt(e.target.value) || 0),
                        );
                        updateDecision(`regions.${id}.marketing`, val);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Informações fidedignas do Período Anterior Fechado */}
              <div className="mt-5 pt-3 border-t border-white/5 space-y-1.5 font-sans">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-sans flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                    ● Realizado Round {activeArena?.current_round}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">
                    APURADO
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Average Price:</span>
                  <span className="text-amber-400 font-bold">
                    {currency}{" "}
                    {stats.avgPriceRegion.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Market Size:</span>
                  <span className="text-slate-300 font-semibold">
                    {stats.totalRegionDemand.toLocaleString("pt-BR")} un
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Sales Volume:</span>
                  <span className="text-slate-300 font-bold">
                    {stats.activeTeamUnitsSold.toLocaleString("pt-BR")} un
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Market Demand:</span>
                  <span className="text-slate-300 font-semibold">
                    {demandWeight.toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Market Volume:</span>
                  <span className="text-purple-400 font-semibold">
                    {stats.totalRegionUnitsSold.toLocaleString("pt-BR")} un
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                  <span>Market Share:</span>
                  <span className="text-emerald-400 font-bold">
                    {stats.relativeSalesShare.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                    <span>Parâmetros Esperados Round {round}:</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                    <span>Logística ($):</span>
                    <span className="text-slate-400 font-semibold">
                      {currency}{" "}
                      {adjustedDistCost.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /un
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                    <span>Camp. Mkt ($):</span>
                    <span className="text-slate-400 font-semibold">
                      {currency}{" "}
                      {adjustedMktCost.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /un
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide font-mono leading-none">
                    <span>Mkt Proj. ($):</span>
                    <span className="text-orange-400 font-black">
                      {currency}{" "}
                      {totalMktCost.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Accordion de Lucratividade Regional Realizada */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={toggleRegionProfitability}
                    className="w-full flex justify-between items-center text-[10px] font-extrabold text-slate-400 hover:text-orange-400 uppercase tracking-wider transition-all focus:outline-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-emerald-400" />
                      DRE Histórico Realizado
                    </span>
                    {allRegionsExpanded ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>

                  {allRegionsExpanded && (
                    <div className="mt-3 space-y-2 bg-slate-950/50 p-3 rounded-2xl border border-white/5 text-[10px] font-mono leading-relaxed">
                      {(() => {
                        const activeTeamHist = competitorsLog.find(
                          (c) => String(c.team_id) === String(activeTeam?.id),
                        );

                        if (!activeArena || activeArena.current_round === 0) {
                          return (
                            <div className="text-center py-4 text-slate-500 font-sans text-xs leading-normal">
                              <p className="font-bold text-amber-500">
                                START FROM ZERO
                              </p>
                              <p className="text-[10px] mt-1 text-slate-600">
                                Sem faturamento apurado no round inicial
                                (Round 0).
                              </p>
                            </div>
                          );
                        }

                        // Use 100% historical statistics and decisions from closed round
                        const histStats = calculateRegionStats(regId, true);
                        const histReg =
                          activeTeamHist?.state?.regions?.[id] ||
                          activeTeamHist?.state?.regions?.[String(id)] ||
                          {};

                        const getExchangeRateForRoundLocal = (
                          curr: string | undefined,
                        ): number => {
                          if (!curr || curr === "BRL") return 1.0;

                          const closedRound = activeArena?.current_round || 0;
                          if (
                            activeArena?.round_rules?.[closedRound]?.[curr] !==
                            undefined
                          ) {
                            return Number(
                              activeArena.round_rules[closedRound][curr],
                            );
                          }

                          if (
                            activeArena?.general_settings?.exchange_rates?.[
                              curr
                            ] !== undefined
                          ) {
                            return Number(
                              activeArena.general_settings.exchange_rates[
                                curr
                              ],
                            );
                          }

                          if (
                            activeArena?.general_settings?.[curr] !== undefined
                          ) {
                            return Number(activeArena.general_settings[curr]);
                          }

                          switch (curr) {
                            case "USD":
                              return 5.25;
                            case "EUR":
                              return 5.6;
                            case "GBP":
                              return 6.5;
                            case "CNY":
                              return 0.72;
                            case "BTC":
                              return 0.00002;
                            default:
                              return 1.0;
                          }
                        };

                        const rate = getExchangeRateForRoundLocal(currency);
                        const unitCPV =
                          getHistoricalActiveTeamUnitCPV(activeTeamHist);
                        const soldQty = histStats.activeTeamUnitsSold;
                        const regionPrice = Number(histReg.price) || 0;
                        const grossRev = soldQty * regionPrice;

                        const vatSalesRate =
                          activeTeamHist?.kpis?.vat_sales_rate !== undefined
                            ? Number(activeTeamHist.kpis.vat_sales_rate)
                            : activeArena?.general_settings?.vat_sales_rate !==
                                undefined
                              ? Number(
                                  activeArena.general_settings.vat_sales_rate,
                                )
                              : 0;

                        const taxes = grossRev * (vatSalesRate / 100);
                        const netRev = grossRev - taxes;

                        const cpvAllocated = soldQty * (unitCPV / rate);
                        const grossProfitReg = netRev - cpvAllocated;

                        // Custos operacionais específicos da região na rodada fechada (realizado)
                        const histAdjustedDistCost = getAdjustedPrice(
                          distCost,
                          "distribution_cost_adjust",
                          activeArena.current_round,
                          activeArena.round_rules ||
                            DEFAULT_INDUSTRIAL_CHRONOGRAM,
                        );
                        const histAdjustedMktCost = getAdjustedPrice(
                          mktCost,
                          "marketing_campaign_adjust",
                          activeArena.current_round,
                          activeArena.round_rules ||
                            DEFAULT_INDUSTRIAL_CHRONOGRAM,
                        );

                        const mktAllocated =
                          (Number(histReg.marketing) || 0) *
                          histAdjustedMktCost;
                        const distAllocated = soldQty * histAdjustedDistCost;
                        const contributionProfitReg =
                          grossProfitReg - mktAllocated - distAllocated;

                        // Motor de Rateio Regional Fiduciário (FRAE v2) para reconciliamento integral com a Matriz
                        const dre = activeTeamHist?.kpis?.statements?.dre;
                        const findDREValue = (
                          nodes: any[] | null | undefined,
                          targetId: string,
                        ): number => {
                          if (!nodes || !Array.isArray(nodes)) return 0;
                          for (const node of nodes) {
                            if (node.id === targetId) return node.value || 0;
                            if (node.children && node.children.length > 0) {
                              const val = findDREValue(node.children, targetId);
                              if (val !== 0) return val;
                            }
                          }
                          return 0;
                        };

                        const companyNetProfit = findDREValue(
                          dre,
                          "final_profit",
                        );

                        // Para o rateio fiduciário das despesas corporativas não-alocáveis (irpj/csll, folha adm, inadimplência, juros, etc).
                        // Calculamos em tempo de execução a soma das margens de contribuição de todas as regiões operadas.
                        const rRules = activeArena?.round_rules?.[targetRound] || {};
                        const allRegions = rRules.regions ||
                          rRules.region_configs ||
                          activeArena?.config?.regions ||
                          activeArena?.config?.region_configs || [
                            { id: 1 },
                            { id: 2 },
                            { id: 3 },
                            { id: 4 },
                          ];

                        let totalCompanyNetRevBrl = 0;
                        let totalCompanyContributionProfitBrl = 0;

                        allRegions.forEach((r: any) => {
                          const rId = Number(r.id);
                          const rStats = calculateRegionStats(rId, true);
                          const rReg =
                            activeTeamHist?.state?.regions?.[rId] ||
                            activeTeamHist?.state?.regions?.[String(rId)] ||
                            {};

                          const rRegionConf =
                            rRules.regions?.find((x: any) => x.id === rId) ||
                            rRules.region_configs?.find((x: any) => x.id === rId) ||
                            activeArena?.config?.regions?.find(
                              (x: any) => x.id === rId,
                            ) ||
                            activeArena?.config?.region_configs?.find(
                              (x: any) => x.id === rId,
                            );
                          const rCurrency =
                            rRegionConf?.currency ||
                            activeArena?.currency ||
                            "BRL";
                          const rRate = getExchangeRateForRoundLocal(rCurrency);

                          const rSoldQty = rStats.activeTeamUnitsSold;
                          const rPrice = Number(rReg.price) || 0;
                          const rGrossRevLocal = rSoldQty * rPrice;
                          const rTaxesLocal =
                            rGrossRevLocal * (vatSalesRate / 100);
                          const rNetRevLocal = rGrossRevLocal - rTaxesLocal;
                          const rNetRevBrl = rNetRevLocal * rRate;

                          const rCpvAllocatedBrl = rSoldQty * unitCPV;

                          const rDistCostLocal =
                            rRegionConf?.distribution_cost !== undefined
                              ? Number(rRegionConf.distribution_cost)
                              : activeArena?.general_settings?.prices
                                  ?.distribution_unit || 50;
                          const rMktCostLocal =
                            rRegionConf?.marketing_cost !== undefined
                              ? Number(rRegionConf.marketing_cost)
                              : activeArena?.general_settings?.prices
                                  ?.marketing_campaign || 10000;

                          const rAdjustedDistCostLocal = getAdjustedPrice(
                            rDistCostLocal,
                            "distribution_cost_adjust",
                            activeArena.current_round,
                            activeArena.round_rules ||
                              DEFAULT_INDUSTRIAL_CHRONOGRAM,
                          );
                          const rAdjustedMktCostLocal = getAdjustedPrice(
                            rMktCostLocal,
                            "marketing_campaign_adjust",
                            activeArena.current_round,
                            activeArena.round_rules ||
                              DEFAULT_INDUSTRIAL_CHRONOGRAM,
                          );

                          const rMktAllocatedLocal =
                            (Number(rReg.marketing) || 0) *
                            rAdjustedMktCostLocal;
                          const rDistAllocatedLocal =
                            rSoldQty * rAdjustedDistCostLocal;

                          const rMktAllocatedBrl = rMktAllocatedLocal * rRate;
                          const rDistAllocatedBrl = rDistAllocatedLocal * rRate;

                          const rGrossProfitBrl = rNetRevBrl - rCpvAllocatedBrl;
                          const rContributionProfitBrl =
                            rGrossProfitBrl -
                            rMktAllocatedBrl -
                            rDistAllocatedBrl;

                          totalCompanyNetRevBrl += rNetRevBrl;
                          totalCompanyContributionProfitBrl +=
                            rContributionProfitBrl;
                        });

                        // Despesas corporativas indiretas da holding em BRL
                        const indirectCorporateExpensesBrl =
                          totalCompanyContributionProfitBrl - companyNetProfit;

                        let regionalCorporateShare = 0;
                        let netProfitRegion = 0;
                        const netRevBrl = netRev * rate;

                        if (totalCompanyNetRevBrl > 0) {
                          const regionalCorporateShareBrl =
                            indirectCorporateExpensesBrl *
                            (netRevBrl / totalCompanyNetRevBrl);
                          const grossProfitRegBrl =
                            netRevBrl - soldQty * unitCPV;
                          const contributionProfitRegBrl =
                            grossProfitRegBrl -
                            mktAllocated * rate -
                            distAllocated * rate;
                          const netProfitRegionBrl =
                            contributionProfitRegBrl -
                            regionalCorporateShareBrl;

                          regionalCorporateShare =
                            regionalCorporateShareBrl / rate;
                          netProfitRegion = netProfitRegionBrl / rate;
                        } else {
                          const totalRegionsCount = allRegions.length;
                          const regionalCorporateShareBrl =
                            totalRegionsCount > 0
                              ? indirectCorporateExpensesBrl / totalRegionsCount
                              : 0;
                          const netProfitRegionBrl =
                            totalRegionsCount > 0
                              ? companyNetProfit / totalRegionsCount
                              : 0;

                          regionalCorporateShare =
                            regionalCorporateShareBrl / rate;
                          netProfitRegion = netProfitRegionBrl / rate;
                        }

                        const profitMarginRegion =
                          netRev > 0 ? (netProfitRegion / netRev) * 100 : 0;

                        return (
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Receitas Brutas:
                              </span>
                              <span className="text-slate-300 font-bold">
                                {currency}{" "}
                                {grossRev.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Receitas Líquidas:
                              </span>
                              <span className="text-slate-300 font-bold">
                                {currency}{" "}
                                {netRev.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                CPV (WAC):
                              </span>
                              <span className="text-red-400/85 font-semibold">
                                -{currency}{" "}
                                {cpvAllocated.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Lucro Bruto:
                              </span>
                              <span className="text-amber-500 font-bold">
                                {currency}{" "}
                                {grossProfitReg.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Campanhas Marketing:
                              </span>
                              <span className="text-red-400/80">
                                -{currency}{" "}
                                {mktAllocated.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Custo Distribuição:
                              </span>
                              <span className="text-red-400/80">
                                -{currency}{" "}
                                {distAllocated.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 py-1 border-b border-white/5 font-extrabold bg-white/[0.02] px-1.5 rounded-lg">
                              <span className="text-[10px] uppercase font-sans text-orange-400">
                                Margem Contribuição:
                              </span>
                              <span className="text-orange-400">
                                {currency}{" "}
                                {contributionProfitReg.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 py-0.5 border-b border-white/5">
                              <span className="text-[10px] uppercase font-sans">
                                Desp. Operacionais:
                              </span>
                              <span className="text-red-400/70">
                                -{currency}{" "}
                                {regionalCorporateShare.toLocaleString(
                                  "pt-BR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </span>
                            </div>

                            <div
                              className={`flex justify-between items-center mt-2.5 pt-1.5 border-t border-dashed border-white/10 text-[10px] font-bold ${netProfitRegion >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400 text-[9px] font-sans">
                                {netProfitRegion >= 0 ? (
                                  <TrendingUp
                                    size={11}
                                    className="text-emerald-400"
                                  />
                                ) : (
                                  <TrendingDown
                                    size={11}
                                    className="text-red-400"
                                  />
                                )}
                                Lucro/Prejuízo Líquido:
                              </span>
                              <span className="font-extrabold">
                                {currency}{" "}
                                {netProfitRegion.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div
                              className={`flex justify-between items-center text-[10px] font-bold ${profitMarginRegion >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              <span className="uppercase tracking-wider text-slate-400 text-[9px] font-sans">
                                Margem Líquida:
                              </span>
                              <span className="font-extrabold">
                                {profitMarginRegion.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-[8.5px] text-slate-500 font-sans mt-3 text-center leading-relaxed uppercase">
                              (*) Rateio Fiduciário Integral (CPC/IFRS):
                              inclui dedução precisa de custos industriais e
                              comerciais locais, além de apropriação
                              proporcional de despesas comuns indiretas da
                              Matriz (Folha Geral, P&D, PECLD, Financeiro, IR).
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
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
