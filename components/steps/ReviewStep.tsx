import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Users } from 'lucide-react';
import { DecisionData } from '../../types';

interface ReviewStepProps {
  decisions: DecisionData;
  round: number;
  projections?: any;
  currentMacro?: any;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ decisions, round, projections, currentMacro }) => {
  const avgPrice = Object.values(decisions.regions).reduce((a: any, b: any) => a + (b.price || 0), 0) / Math.max(1, Object.keys(decisions.regions).length);
  const totalMkt = Object.values(decisions.regions).reduce((a: any, b: any) => a + (b.marketing || 0), 0);
  const totalBuy = (decisions.machinery?.buy?.alpha ?? decisions.machinery?.buy?.alfa ?? 0) + 
                   (decisions.machinery?.buy?.beta || 0) + 
                   (decisions.machinery?.buy?.gamma ?? decisions.machinery?.buy?.gama ?? 0);

  // Análise crítica de mão de obra para prevenir paralisação
  const machines = projections?.kpis?.machines || [];
  const operatorsRequired = machines.reduce((acc: number, m: any) => {
    const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
    const sReq = currentMacro?.machine_specs?.[normModel]?.operators_required ?? (normModel === 'alpha' ? 94 : normModel === 'beta' ? 235 : 445);
    return acc + sReq;
  }, 0);
  const operatorsAvailable = projections?.kpis?.staffing?.production || 0;
  const showWorkforceAlert = operatorsRequired > 0 && operatorsAvailable < operatorsRequired;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      {showWorkforceAlert ? (
        <div className="w-24 h-24 bg-rose-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-pulse mb-8 animate-bounce">
          <AlertTriangle size={48} />
        </div>
      ) : (
        <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse mb-8">
          <ShieldCheck size={48} />
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter font-sans">
          {showWorkforceAlert ? 'Aviso Crítico de Operação' : 'Pronto para Transmissão Oracle'}
        </h2>
        <p className="text-slate-400 font-medium italic font-sans">
          {showWorkforceAlert 
            ? '"Seu planejamento tático possui um gargalo físico severo detectado pelo Oracle Shield."'
            : '"Revise seu protocolo tático antes de selar o ciclo P-' + round + '."'
          }
        </p>
      </div>

      {showWorkforceAlert && (
        <div className="max-w-4xl mx-auto p-8 bg-rose-950/40 border-2 border-rose-500/40 rounded-3xl text-left space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="animate-pulse shrink-0" size={32} />
            <h4 className="text-xl font-black uppercase tracking-tight font-sans">
              Paralisia Industrial Detectada! (ZERO ou Insuficiência de MOD)
            </h4>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            Atenção equipe! Você possui <strong>{machines.length} máquinas</strong> ativas que requerem <strong>{operatorsRequired} operários de produção</strong> para operar em plenitude. 
            No entanto, as suas decisões combinadas de RH resultam em apenas <strong>{operatorsAvailable} operários disponíveis</strong> para esta rodada.
          </p>
          {operatorsAvailable === 0 ? (
            <p className="text-sm text-rose-300 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl font-sans">
              ⚠️ Alerta Máximo: Como você tem zero operadores de produção, sua capacidade fabril nesta rodada será literalmente ZERO. Nenhuma matéria-prima será processada, nenhum produto acabado será produzido e, por consequência, o seu faturamento de vendas será ZERO! Por favor, acesse a aba "Recursos Humanos" e contrate operários de fábrica.
            </p>
          ) : (
            <p className="text-sm text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl font-sans">
              ⚠️ Alerta de Gargalo: A sua equipe contará com apenas {Math.min(100, Math.floor((operatorsAvailable / operatorsRequired) * 100))}% de eficiência fabril. Parte considerável do seu parque industrial ficará ocioso e as vendas planejadas serão restringidas pela defasagem de pessoal. Recomenda-se elevar a contratação de pessoal na aba "Recursos Humanos".
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-6xl mx-auto pt-4">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg hover:border-orange-500/20 transition-all">
          <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic mb-4 font-sans">
            Resumo Comercial
          </h4>
          <SummaryLine label="Preço Médio" val={`$ ${avgPrice.toFixed(2)}`} />
          <SummaryLine label="Total Marketing" val={`${totalMkt} unidades`} />
        </div>
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg hover:border-blue-500/20 transition-all">
          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest italic mb-4 font-sans">
            Resumo Industrial
          </h4>
          <SummaryLine label="Uso Capacidade" val={`${decisions.production.activityLevel}%`} />
          <SummaryLine label="Operários Planejados" val={`${operatorsAvailable} de ${operatorsRequired} un`} />
          <SummaryLine label="Novos Ativos" val={`${totalBuy} unidades`} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8 bg-slate-900/40 border border-white/5 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-3 text-emerald-400 justify-center">
          <AlertOctagon size={24} className="shrink-0" />
          <h5 className="font-sans font-black uppercase italic text-sm">Avisos de Governança</h5>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic font-sans">
          "As decisões podem ser alteradas livremente até o vencimento do TIMER DE ROUND. Decisões não seladas (em rascunho) serão ignoradas pelo motor Oracle no momento do Turnover, resultando em dados zerados para sua unidade."
        </p>
      </div>
    </div>
  );
};

interface SummaryLineProps {
  label: string;
  val: string;
}

const SummaryLine: React.FC<SummaryLineProps> = ({ label, val }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
    <span className="text-slate-300 font-sans">{label}</span>
    <span className="font-bold text-white font-mono">{val}</span>
  </div>
);

