import React from 'react';
import { ShieldCheck, AlertOctagon } from 'lucide-react';
import { DecisionData } from '../../types';

interface ReviewStepProps {
  decisions: DecisionData;
  round: number;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ decisions, round }) => {
  const avgPrice = Object.values(decisions.regions).reduce((a: any, b: any) => a + (b.price || 0), 0) / Math.max(1, Object.keys(decisions.regions).length);
  const totalMkt = Object.values(decisions.regions).reduce((a: any, b: any) => a + (b.marketing || 0), 0);
  const totalBuy = (decisions.machinery?.buy?.alpha ?? decisions.machinery?.buy?.alfa ?? 0) + 
                   (decisions.machinery?.buy?.beta || 0) + 
                   (decisions.machinery?.buy?.gamma ?? decisions.machinery?.buy?.gama ?? 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse mb-8">
        <ShieldCheck size={48} />
      </div>
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter font-sans">
          Ready for Oracle Transmit
        </h2>
        <p className="text-slate-400 font-medium italic font-sans">
          "Revise seu protocolo tático antes de selar o ciclo P-{round}."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-6xl mx-auto pt-12">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg hover:border-orange-500/20 transition-all">
          <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic mb-4 font-sans">
            Resumo Comercial
          </h4>
          <SummaryLine label="Preço Médio" val={`$ ${avgPrice.toFixed(2)}`} />
          <SummaryLine label="Total Marketing" val={`${totalMkt} units`} />
        </div>
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg hover:border-blue-500/20 transition-all">
          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest italic mb-4 font-sans">
            Resumo Industrial
          </h4>
          <SummaryLine label="Uso Capacidade" val={`${decisions.production.activityLevel}%`} />
          <SummaryLine label="Turno Extra" val={`${decisions.production.extraProductionPercent}%`} />
          <SummaryLine label="Novos Ativos" val={`${totalBuy} unidades`} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8 bg-rose-600/10 border border-rose-500/20 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-3 text-rose-500 justify-center">
          <AlertOctagon size={24} className="animate-bounce shrink-0" />
          <h5 className="font-sans font-black uppercase italic text-sm">Aviso de Governança</h5>
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
