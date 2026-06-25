import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Gavel, Megaphone, Factory, Coins, Users2, Landmark, HelpCircle } from 'lucide-react';
import { DecisionData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ReviewStepProps {
  decisions: DecisionData;
  round: number;
  projections?: any;
  currentMacro?: any;
  activeArena?: any;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ decisions, round, projections, currentMacro, activeArena }) => {
  // Region Calculations
  const regionEntries = Object.entries(decisions.regions);
  const avgPrice = regionEntries.length > 0 
    ? regionEntries.reduce((a, [_, r]: any) => a + (r.price || 0), 0) / regionEntries.length
    : 0;
  const totalMkt = regionEntries.reduce((a, [_, r]: any) => a + (r.marketing || 0), 0);

  // Machinery Capital Expenditures
  const buyAlpha = decisions.machinery?.buy?.alpha ?? decisions.machinery?.buy?.alfa ?? 0;
  const buyBeta = decisions.machinery?.buy?.beta ?? 0;
  const buyGamma = decisions.machinery?.buy?.gamma ?? decisions.machinery?.buy?.gama ?? 0;
  const totalBuy = buyAlpha + buyBeta + buyGamma;

  const sellAlpha = decisions.machinery?.sell?.alpha ?? decisions.machinery?.sell?.alfa ?? 0;
  const sellBeta = decisions.machinery?.sell?.beta ?? 0;
  const sellGamma = decisions.machinery?.sell?.gamma ?? decisions.machinery?.sell?.gama ?? 0;
  const totalSell = sellAlpha + sellBeta + sellGamma;

  // Active workforce calculations to identify bottlenecks
  const machines = projections?.kpis?.machines || [];
  const operatorsRequired = machines.reduce((acc: number, m: any) => {
    const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
    const sReq = currentMacro?.machine_specs?.[normModel]?.operators_required ?? (normModel === 'alpha' ? 94 : normModel === 'beta' ? 235 : 445);
    return acc + sReq;
  }, 0);
  const operatorsAvailable = projections?.kpis?.staffing?.production || 0;
  const showWorkforceAlert = operatorsRequired > 0 && operatorsAvailable < operatorsRequired;

  // Helper translations for payment terms & shifts
  const getPaymentTermLabel = (term: number) => {
    if (term === 0) return 'À Vista';
    if (term === 1) return '30 Dias (1T)';
    if (term === 2) return '60 Dias (2T)';
    return `${term} Turnos`;
  };

  const getShiftsLabel = (shifts: number) => {
    if (shifts === 1) return '1 Turno (Regular)';
    if (shifts === 2) return '2 Turnos (Dobrado)';
    if (shifts === 3) return '3 Turnos (Contínuo)';
    return `${shifts} Turno(s)`;
  };

  const getSupplierPaymentLabel = (type: number) => {
    if (type === 0) return 'À Vista (Desconto)';
    if (type === 1) return '30 Dias (Sem Juros)';
    if (type === 2) return '60 Dias (Com Financiamento)';
    return `T-Type ${type}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO GRÁFICO E PREVENTIVO */}
      <div className="text-center space-y-4">
        {showWorkforceAlert ? (
          <div className="w-20 h-20 bg-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-pulse mb-6 animate-bounce">
            <AlertTriangle size={42} />
          </div>
        ) : (
          <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse mb-6">
            <ShieldCheck size={42} />
          </div>
        )}
        
        <h2 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter font-sans">
          {showWorkforceAlert ? 'Restrição Crítica Industrial' : 'Consistência de Decisões Prontinha'}
        </h2>
        <p className="text-slate-400 font-medium text-sm italic font-sans max-w-2xl mx-auto leading-relaxed">
          {showWorkforceAlert 
            ? '"O Oráculo detectou inconsistências severas no planejamento do chão de fábrica que provocarão ociosidade ou paralisação."'
            : '"Revise a súmula integrada das decisões tomadas para todas as divisões operacionais antes de selar o ciclo P-' + round + '."'
          }
        </p>
      </div>

      {/* PAINEL DE ALERTA DE ZERO OPERADORES / INDUSTRIAL GARNET */}
      {showWorkforceAlert && (
        <div id="oraculo_workforce_critical_alert" className="max-w-4xl mx-auto p-6 bg-rose-950/40 border-2 border-rose-500/30 rounded-3xl text-left space-y-3.5 shadow-xl">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="animate-pulse shrink-0" size={26} />
            <h4 className="text-lg font-black uppercase tracking-tight font-sans">
              Gargalo Físico do Parque Fabril Detectado!
            </h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            A sua fábrica tem atualmente <strong>{machines.length} máquinas operacionais</strong>, as quais exigem um número ideal de <strong>{operatorsRequired} operários</strong> para rodar a linha produtiva sem gargalos. No entanto, as contratações e demissões inseridas resultam em uma força ativa de apenas <strong>{operatorsAvailable} operários</strong>.
          </p>
          {operatorsAvailable === 0 ? (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
              <strong className="text-xs text-rose-400 uppercase tracking-wider font-sans block">❌ PRODUÇÃO ZERADA DESTE ROUND:</strong>
              <p className="text-xs text-rose-300 leading-relaxed font-sans">
                Como a equipe possui <strong>ZERO operadores</strong> ativos decididos, nenhuma máquina Alpha, Beta ou Gamma funcionará. Você desperdiçará matéria-prima estocada, não gerará unidades produzidas e não terá **NENHUM FATURAMENTO**, contraindo despesas e levando a empresa a um prejuízo líquido severo no encerramento!
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-1">
              <strong className="text-xs text-orange-400 uppercase tracking-wider font-sans block">⚠️ GARGALO CORPORATIVO ATIVO:</strong>
              <p className="text-xs text-orange-300 leading-relaxed font-sans">
                A capacidade do seu parque fabril será reduzida severamente operando a apenas <strong>{Math.floor((operatorsAvailable / operatorsRequired) * 100)}% de eficiência máxima</strong>. Suas máquinas ficarão ociosas por falta de mão de obra direta para operá-las.
              </p>
            </div>
          )}
        </div>
      )}

      {/* GRADE GERAL RESUMO - TODAS AS DECISÕES DA EQUIPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto text-left">
        
        {/* 1. JURÍDICO */}
        <div id="review_legal_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-violet-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Gavel size={16} className="text-violet-400" />
            <h4 className="text-[10px] font-black tracking-widest text-violet-400 uppercase font-sans">1. Divisão Jurídica</h4>
          </div>
          <div className="space-y-2 text-xs">
            <SummaryRow label="Recuperação Judicial" val={decisions.judicial_recovery ? 'ATIVA (Protocolo Ativo)' : 'Inativa'} highlight={decisions.judicial_recovery} highlightColor="text-rose-400" />
          </div>
        </div>

        {/* 2. COMERCIAL / REGIONAL */}
        <div id="review_commercial_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-emerald-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Megaphone size={16} className="text-emerald-400" />
            <h4 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-sans">2. Divisão Comercial</h4>
          </div>
          <div className="space-y-3 text-xs max-h-48 overflow-y-auto no-scrollbar">
            {regionEntries.length === 0 ? (
              <p className="text-slate-500 italic">Nenhuma decisão de marketing ou preço inserida.</p>
            ) : (
              regionEntries.map(([id, reg]: [string, any]) => {
                const regId = Number(id);
                const rRules = activeArena?.round_rules?.[round] || {};
                const regionConf = 
                  rRules.regions?.find((r: any) => r.id === regId) ||
                  rRules.region_configs?.find((r: any) => r.id === regId) ||
                  activeArena?.config?.regions?.find((r: any) => r.id === regId) ||
                  activeArena?.config?.region_configs?.find((r: any) => r.id === regId) ||
                  activeArena?.config?.regions?.[regId - 1] ||
                  activeArena?.config?.region_configs?.[regId - 1] ||
                  { name: `Região ${regId}` };
                return (
                  <div key={id} className="p-2 border border-white/5 rounded-xl bg-slate-950/20 space-y-1.5">
                    <span className="text-[10px] font-black text-slate-300 font-sans block truncate uppercase tracking-wider">
                      📍 {regionConf.name}
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                      <div>
                        <span className="text-[9px] text-slate-500 block leading-tight font-sans">Preço</span>
                        <strong className="text-white font-mono">{formatCurrency(reg.price, 'BRL')}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block leading-tight font-sans">Mark. (P&D)</span>
                        <strong className="text-emerald-400 font-mono">+{reg.marketing} un</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block leading-tight font-sans">Prazo</span>
                        <strong className="text-blue-400 text-[10px] leading-tight font-sans">{getPaymentTermLabel(reg.term)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div className="pt-1 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div>Preço Médio: <strong className="text-white font-mono">{formatCurrency(avgPrice, 'BRL')}</strong></div>
              <div>Marketing Total: <strong className="text-emerald-400 font-mono">+{totalMkt} un</strong></div>
            </div>
          </div>
        </div>

        {/* 3. CAPEX & ATIVOS */}
        <div id="review_assets_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-amber-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Factory size={16} className="text-amber-400" />
            <h4 className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-sans">3. Ativos & Investimentos</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl border border-white/5 bg-emerald-500/5 space-y-1">
              <span className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">Aquisições (CAPEX):</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div><span className="text-slate-500 text-[9px] font-sans">Alpha</span> <span className="font-bold text-white block">+{buyAlpha}</span></div>
                <div><span className="text-slate-500 text-[9px] font-sans">Beta</span> <span className="font-bold text-white block">+{buyBeta}</span></div>
                <div><span className="text-slate-500 text-[9px] font-sans">Gamma</span> <span className="font-bold text-white block">+{buyGamma}</span></div>
              </div>
            </div>
            
            <div className="p-2 rounded-xl border border-white/5 bg-rose-500/5 space-y-1">
              <span className="text-[9px] text-rose-400 font-black tracking-widest uppercase">Alienações (Venda Ativos):</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div><span className="text-slate-500 text-[9px] font-sans">Alpha</span> <span className="font-bold text-white block">-{sellAlpha}</span></div>
                <div><span className="text-slate-500 text-[9px] font-sans">Beta</span> <span className="font-bold text-white block">-{sellBeta}</span></div>
                <div><span className="text-slate-500 text-[9px] font-sans">Gamma</span> <span className="font-bold text-white block">-{sellGamma}</span></div>
              </div>
            </div>
            
            <SummaryRow label="Total Compra Máquinas" val={`${totalBuy} unidades`} highlight={totalBuy > 0} highlightColor="text-emerald-400" />
            <SummaryRow label="Total Venda Máquinas" val={`${totalSell} unidades`} highlight={totalSell > 0} highlightColor="text-rose-400" />
          </div>
        </div>

        {/* 4. SUPRIMENTOS (MPA e MPB) */}
        <div id="review_supplies_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-blue-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Coins size={16} className="text-blue-400" />
            <h4 className="text-[10px] font-black tracking-widest text-blue-400 uppercase font-sans">4. Suprimentos & MP</h4>
          </div>
          <div className="space-y-2 text-xs">
            <SummaryRow label="Compra Matéria-Prima A" val={`${decisions.production.purchaseMPA?.toLocaleString('pt-BR') || 0} un`} highlight={(decisions.production.purchaseMPA || 0) > 0} highlightColor="text-emerald-400" />
            <SummaryRow label="Compra Matéria-Prima B" val={`${decisions.production.purchaseMPB?.toLocaleString('pt-BR') || 0} un`} highlight={(decisions.production.purchaseMPB || 0) > 0} highlightColor="text-emerald-400" />
            <SummaryRow label="Tipo de Prazo Fornecedor" val={getSupplierPaymentLabel(decisions.production.paymentType || 0)} />
          </div>
        </div>

        {/* 5. INDÚSTRIA & CHÃO DE FÁBRICA */}
        <div id="review_factory_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-orange-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Factory size={16} className="text-orange-400" />
            <h4 className="text-[10px] font-black tracking-widest text-orange-400 uppercase font-sans">5. Divisão Industrial</h4>
          </div>
          <div className="space-y-2 text-xs">
            <SummaryRow label="Regime Operacional de Turnos" val={getShiftsLabel(decisions.production.shifts || 1)} highlight={(decisions.production.shifts || 1) > 1} highlightColor="text-orange-400" />
            <SummaryRow label="Nivel de Atividade Produtiva" val={`${decisions.production.activityLevel || 100}%`} highlight={(decisions.production.activityLevel || 100) < 100} highlightColor="text-rose-400" />
            <SummaryRow label="Teto de Horas Extras Autorizadas" val={`${decisions.production.extraProductionPercent || 0}%`} highlight={(decisions.production.extraProductionPercent || 0) > 0} highlightColor="text-amber-400" />
            <SummaryRow label="Verba de P&D (Aperfeiçoamento)" val={`${decisions.production.rd_investment || 0}%`} highlight={(decisions.production.rd_investment || 0) > 0} highlightColor="text-emerald-400" />
          </div>
        </div>

        {/* 6. GESTÃO DE PESSOAS / TALENTOS */}
        <div id="review_hr_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-teal-500/15 duration-300 shadow-md">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Users2 size={16} className="text-teal-400" />
            <h4 className="text-[10px] font-black tracking-widest text-teal-400 uppercase font-sans">6. Recursos Humanos (SGB)</h4>
          </div>
          <div className="space-y-2 text-xs">
            <SummaryRow label="Contratações de Operários" val={`+${decisions.hr.hired} colaboradores`} highlight={decisions.hr.hired > 0} highlightColor="text-emerald-400" />
            <SummaryRow label="Demissões de Operários" val={`-${decisions.hr.fired} colaboradores`} highlight={decisions.hr.fired > 0} highlightColor="text-rose-400" />
            <SummaryRow label="Salário Base Mensal" val={formatCurrency(decisions.hr.salary || 2500, 'BRL')} />
            <SummaryRow label="Taxa de Treinamento Técnico" val={`${decisions.hr.trainingPercent || 0}%`} highlight={(decisions.hr.trainingPercent || 0) > 0} highlightColor="text-teal-400" />
            <SummaryRow label="Taxa Fin. PPR (Distribuição)" val={`${decisions.hr.participationPercent || 0}%`} highlight={(decisions.hr.participationPercent || 0) > 0} highlightColor="text-teal-400" />
            <SummaryRow label="Bônus de Produtividade Base" val={`${decisions.hr.productivityBonusPercent || 0}%`} highlight={(decisions.hr.productivityBonusPercent || 0) > 0} highlightColor="text-emerald-400" />
          </div>
        </div>

        {/* 7. FINANÇAS & MERCADO DE CRÉDITO */}
        <div id="review_finance_box" className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5 hover:border-yellow-500/15 duration-300 shadow-md md:col-span-2 xl:col-span-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Landmark size={16} className="text-yellow-400" />
            <h4 className="text-[10px] font-black tracking-widest text-yellow-400 uppercase font-sans">7. Tesouraria & Mercado de Capitais</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-sans mb-1">Aplicações Financeiras</span>
              <strong className="text-2xl font-mono font-black text-emerald-400">
                {formatCurrency(decisions.finance.application || 0, 'BRL')}
              </strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-sans mb-1">Tomada de Empréstimo</span>
              <strong className="text-2xl font-mono font-black text-rose-400">
                {formatCurrency(decisions.finance.loanRequest || 0, 'BRL')}
              </strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-sans mb-1">Prazo Financiamento (T-Loan)</span>
              <strong className="text-xl font-sans font-black text-white">
                {decisions.finance.loanTerm === 0 ? 'Sem Empréstimo' : `${decisions.finance.loanTerm} Período(s)`}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* CLÁUSULAS DE SEGURANÇA OPERACIONAL */}
      <div className="max-w-4xl mx-auto p-5 bg-slate-900/30 border border-white/5 rounded-2xl space-y-3 text-center">
        <div className="flex items-center gap-2 text-emerald-400 justify-center">
          <ShieldCheck size={18} className="shrink-0" />
          <h5 className="font-sans font-black uppercase italic text-xs tracking-wider">Avisos de Governança Fiduciária de Risco</h5>
        </div>
        <p className="text-[10px] font-semibold text-slate-400 leading-relaxed italic max-w-2xl mx-auto font-sans">
          "As decisões transmitidas podem ser amplamente reimplementadas e ajustadas sem limites corporativos, desde que ocorram dentro do tempo estabelecido do ciclo. Caso as decisões fiquem pendentes ou não salvas até o vencimento do cronograma, o motor de Turnover executará a transmissão padrão das marcas rascunhadas."
        </p>
      </div>

    </div>
  );
};

interface SummaryRowProps {
  label: string;
  val: string;
  highlight?: boolean;
  highlightColor?: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, val, highlight = false, highlightColor = "text-white" }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs font-sans">
    <span className="text-slate-400">{label}</span>
    <span className={`font-bold font-mono ${highlight ? highlightColor : 'text-white'}`}>{val}</span>
  </div>
);
