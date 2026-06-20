import React from 'react';
import { Landmark, AlertTriangle, DollarSign, Activity, Target, Scale, HelpCircle } from 'lucide-react';
import { WizardStepHeader, CurrencyInput } from './shared';
import { DecisionData, Championship } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface FinanceStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  currentMacro: any;
  isReadOnly: boolean;
}

export const FinanceStep: React.FC<FinanceStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  currentMacro,
  isReadOnly,
}) => {
  return (
    <div className="space-y-16 lg:space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader 
        icon={<Landmark size={32} strokeWidth={2.5} />} 
        title="Finanças & Mercado de Capitais" 
        desc="Gerencie liquidez, alavancagem e aplicações financeiras. Decisões aqui definem a saúde de caixa, custo de capital e capacidade de investimento nos próximos rounds. Equilíbrio entre endividamento e aplicações é chave para evitar crises ou perda de oportunidade." 
        help="Limites Bancários ocorrem automaticamente se o caixa fechar negativo (com ágio maior). Aplicações rendem no próximo período."
      />

      {/* Seção 1: Mercado de Capitais – Empréstimo + Aplicação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Empréstimo */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-12 rounded-3xl border border-white/10 shadow-xl hover:border-rose-500/30 hover:shadow-rose-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-10">
            <div className="max-w-[75%]">
              <h5 className="text-2xl font-black text-rose-400 uppercase tracking-tight mb-3 font-sans">
                Contratar Empréstimo
              </h5>
              <p className="text-base text-slate-300 leading-relaxed mb-6 font-sans">
                Solicitação de novo capital via financiamento bancário. Taxa base: {currentMacro?.interest_rate_tr || 2}% ao período. Prazo escolhido afeta o fluxo de amortização.
              </p>
              <div className="flex items-center gap-3 text-sm text-rose-300 italic font-sans animate-pulse">
                <AlertTriangle size={18} />
                Caso o caixa feche negativo, o Oracle aplica o uso do Empréstimo Compulsório com spread de {currentMacro?.compulsory_loan_agio || 4}% sobre a taxa base.
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors shrink-0">
              <DollarSign size={32} className="text-rose-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Valor Solicitado
                <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
              </label>
              <CurrencyInput
                value={decisions.finance.loanRequest}
                onChange={v => updateDecision('finance.loanRequest', v)}
                currency={activeArena?.currency || 'BRL'}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Prazo de Amortização
                <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
              </label>
              <select
                disabled={isReadOnly}
                value={decisions.finance.loanTerm}
                onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-xl font-semibold text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value={0}>Curto – Quitação no próximo round</option>
                <option value={1}>Médio – À vista + 50% no próximo</option>
                <option value={2}>Longo – Parcelado em 3x (33% cada)</option>
              </select>
            </div>

            <div className="pt-4 text-sm text-rose-300 italic font-sans">
              Custo financeiro estimado aproximado: {formatCurrency(((decisions.finance.loanRequest || 0) * ((currentMacro?.interest_rate_tr || 2.0) / 100) * (decisions.finance.loanTerm + 2)) / 2, activeArena?.currency || 'BRL')}
            </div>
          </div>
        </div>

        {/* Aplicação Financeira */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-12 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-10">
            <div className="max-w-[75%]">
              <h5 className="text-2xl font-black text-emerald-400 uppercase tracking-tight mb-3 font-sans">
                Aplicação Financeira
              </h5>
              <p className="text-base text-slate-300 leading-relaxed mb-6 font-sans">
                Valor aplicado em títulos de renda fixa. Sai do caixa imediatamente e retorna no próximo round acrescido de rendimento ({currentMacro?.investment_return_rate || 1.8}% estimado).
              </p>
              <div className="text-sm text-emerald-300 italic font-sans">
                Ideal para excesso de caixa temporário ou estratégia conservadora de preservação de valor.
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-600/10 group-hover:bg-emerald-600/20 transition-colors shrink-0">
              <Activity size={32} className="text-emerald-400" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Valor a Aplicar
                <HelpCircle size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors cursor-help" />
              </label>
              <CurrencyInput
                value={decisions.finance.application}
                onChange={v => updateDecision('finance.application', v)}
                currency={activeArena?.currency || 'BRL'}
              />
            </div>

            <div className="pt-4 text-sm text-emerald-300 italic font-sans">
              Rendimento projetado no próximo round: ~{formatCurrency((decisions.finance.application || 0) * ((currentMacro?.investment_return_rate || 1.8) / 100), activeArena?.currency || 'BRL')}
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Projeções e Metas Oracle */}
      <div className="space-y-12 pt-16 border-t border-white/10">
        <h4 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-4 font-sans">
          <Target size={32} className="text-yellow-400 animate-pulse" />
          Previsões para Premiação Oracle
        </h4>
        <p className="text-base text-slate-300 max-w-3xl font-sans">
          Preencha com o máximo de precisão possível. As premiações de auditoria dependem da proximidade entre previsão e resultado real (dentro da tolerância definida pelo macro).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Previsão Custo Unitário */}
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group">
            <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4 font-sans">
              Previsão Custo Unitário (CPP)
            </h5>
            <p className="text-sm text-slate-400 mb-6 font-sans">
              Estimativa do custo médio ponderado de produção. Tolerância Oracle: ±{currentMacro?.award_values?.cost_precision || 'BRL 5,00'}.
            </p>
            <CurrencyInput
              value={decisions.estimates.forecasted_unit_cost}
              onChange={v => updateDecision('estimates.forecasted_unit_cost', v)}
              currency={activeArena?.currency || 'BRL'}
            />
          </div>

          {/* Previsão Faturamento */}
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group">
            <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4 font-sans">
              Previsão Faturamento Bruto
            </h5>
            <p className="text-sm text-slate-400 mb-6 font-sans">
              Estimativa de receita total. Tolerância Oracle: ±{currentMacro?.award_values?.revenue_precision || 'BRL 50.000'}.
            </p>
            <CurrencyInput
              value={decisions.estimates.forecasted_revenue}
              onChange={v => updateDecision('estimates.forecasted_revenue', v)}
              currency={activeArena?.currency || 'BRL'}
            />
          </div>

          {/* Previsão Lucro Líquido */}
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group font-sans">
            <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4">
              Previsão Lucro Líquido
            </h5>
            <p className="text-sm text-slate-400 mb-6">
              Estimativa do resultado líquido final. Tolerância Oracle: ±{currentMacro?.award_values?.profit_precision || 'BRL 20.000'}.
            </p>
            <CurrencyInput
              value={decisions.estimates.forecasted_net_profit}
              onChange={v => updateDecision('estimates.forecasted_net_profit', v)}
              currency={activeArena?.currency || 'BRL'}
            />
          </div>
        </div>
      </div>

      {/* Resumo de trade-offs financeiros */}
      <div className="bg-slate-950/70 border border-white/5 rounded-3xl p-10 lg:p-12 max-w-4xl mx-auto text-center mt-16 shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Scale size={28} className="text-yellow-400" />
          <h6 className="text-xl font-black text-yellow-300 uppercase tracking-wide font-sans">
            Equilíbrio Financeiro Estratégico
          </h6>
        </div>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl mx-auto font-sans">
          Endividamento excessivo aumenta risco de compulsório caro. Aplicações protegem caixa, mas reduzem liquidez imediata para CapEx ou suprimentos. As previsões precisas geram premiações Oracle significativas — use as projeções do header para calibrar.
        </p>
      </div>

      {/* Espaçamento final */}
      <div className="h-32 lg:h-40" />
    </div>
  );
};
