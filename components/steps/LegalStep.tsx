import React from 'react';
import { Gavel, ShieldCheck, AlertOctagon, Scale, AlertTriangle } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData } from '../../types';
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;

interface LegalStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  isReadOnly: boolean;
}

export const LegalStep: React.FC<LegalStepProps> = ({
  decisions,
  updateDecision,
  isReadOnly,
}) => {
  return (
    <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho */}
      <WizardStepHeader
        icon={<Gavel size={32} strokeWidth={2.5} />}
        title="Status Jurídico & Solvência"
        desc="Defina o regime jurídica da empresa para este ciclo. A escolha impacta diretamente acesso a crédito, capacidade de investimento, percepção de mercado e risco de intervenção do Oracle."
        help="Recuperação Judicial é uma medida extrema. Use apenas quando o caixa e a estrutura financeira estão insustentáveis sem reestruturação forçada."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Operação Normal */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => updateDecision('judicial_recovery', false)}
          disabled={isReadOnly}
          className={`
            relative p-8 lg:p-10 rounded-3xl border-2 text-left transition-all duration-300 group cursor-pointer
            ${!decisions.judicial_recovery
              ? 'bg-slate-900 border-emerald-500 shadow-2xl ring-2 ring-emerald-500/40'
              : 'bg-slate-950/60 border-slate-700/50 opacity-65 hover:opacity-90 hover:border-emerald-500/40'}
          `}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="max-w-[75%]">
              <h5 className="text-2xl font-black text-emerald-400 uppercase tracking-tight mb-4 font-sans">
                Operação Normal
              </h5>
              <p className="text-base text-slate-300 leading-relaxed mb-6 font-sans">
                Empresa opera em plena conformidade jurídica e financeira. Acesso irrestrito a linhas de crédito, CapEx, emissão de ações e fornecedores sem restrições.
              </p>
              <ul className="space-y-3 text-sm text-emerald-200/90 font-sans">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="shrink-0 mt-1" />
                  Crédito disponível na taxa base do mercado
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="shrink-0 mt-1" />
                  Investimentos e expansão sem limitações regulatórias
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="shrink-0 mt-1" />
                  Percepção positiva no mercado → menor custo de capital implícito
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors shrink-0">
              <ShieldCheck size={40} className="text-emerald-400" />
            </div>
          </div>

          <div className="absolute bottom-6 right-6">
            <span className="text-lg font-black text-emerald-500/90 uppercase tracking-widest font-sans">
              Recomendado
            </span>
          </div>
        </motion.button>

        {/* Recuperação Judicial */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => updateDecision('judicial_recovery', true)}
          disabled={isReadOnly}
          className={`
            relative p-8 lg:p-10 rounded-3xl border-2 text-left transition-all duration-300 group cursor-pointer
            ${decisions.judicial_recovery
              ? 'bg-slate-900 border-rose-500 shadow-2xl ring-2 ring-rose-500/40'
              : 'bg-slate-950/60 border-slate-700/50 opacity-65 hover:opacity-90 hover:border-rose-500/40'}
          `}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="max-w-[75%]">
              <h5 className="text-2xl font-black text-rose-400 uppercase tracking-tight mb-4 font-sans">
                Protocolo de Recuperação Judicial (RJ)
              </h5>
              <p className="text-base text-slate-300 leading-relaxed mb-6 font-sans">
                Ativa regime especial de proteção contra credores. Permite reestruturação forçada, mas impõe restrições severas por vários rounds.
              </p>

              <div className="space-y-5 mt-6">
                <h6 className="text-sm font-semibold text-rose-300 uppercase tracking-wide font-sans">
                  Consequências principais (no contexto da simulação):
                </h6>
                <ul className="space-y-3 text-sm text-rose-200/90 font-sans">
                  <li className="flex items-start gap-3 flex-wrap">
                    <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                    Novo crédito bloqueado ou com spread altíssimo (taxa + 4–8%)
                  </li>
                  <li className="flex items-start gap-3 flex-wrap">
                    <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                    CapEx e compra de máquinas limitado a ~40% do valor normal
                  </li>
                  <li className="flex items-start gap-3 flex-wrap">
                    <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                    Dívidas existentes congeladas + correção monetária (inflação aplicada)
                  </li>
                  <li className="flex items-start gap-3 flex-wrap">
                    <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                    Percepção de risco elevada → demanda pode cair 10–30% por rounds
                  </li>
                  <li className="flex items-start gap-3 flex-wrap">
                    <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                    Duração típica: 4–8 rounds até aprovação do plano de recuperação
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-600/20 group-hover:bg-rose-600/30 transition-colors shrink-0">
              <AlertOctagon size={40} className="text-rose-400 animate-pulse" />
            </div>
          </div>

          <div className="absolute bottom-6 right-6 font-sans">
            <span className="text-lg font-black text-rose-500/90 uppercase tracking-widest">
              Último recurso
            </span>
          </div>
        </motion.button>
      </div>

      {/* Caixa de recomendação estratégica */}
      <div className="bg-slate-950/70 border border-slate-700/50 rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto text-center shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Scale size={28} className="text-yellow-400" />
          <h6 className="text-xl font-black text-yellow-300 uppercase tracking-wide font-sans">
            Quando realmente vale acionar RJ?
          </h6>
        </div>
        <p className="text-base text-slate-300 leading-relaxed mb-8 font-sans">
          RJ é ferramenta de <strong>sobrevivência</strong>, não de crescimento. Considere apenas se:
        </p>
        <ul className="text-left max-w-3xl mx-auto space-y-4 text-sm text-slate-300 font-sans">
          <li className="flex items-start gap-4">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1 animate-pulse" />
            Caixa projetado negativo por 2+ rounds consecutivos sem solução viável
          </li>
          <li className="flex items-start gap-4">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1 animate-pulse" />
            Dívidas vencidas {' > '} 45–60% do patrimônio líquido atual
          </li>
          <li className="flex items-start gap-4">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1 animate-pulse" />
            Sem acesso realista a empréstimos normais ou vendas de ativos para cobrir rombo
          </li>
        </ul>
        <p className="mt-10 text-lg font-medium text-emerald-300 italic font-sans">
          Na maioria dos campeonatos competitivos, ajuste agressivo de custos + gestão de caixa é muito mais vantajoso do que entrar em RJ.
        </p>
      </div>

      <div className="h-24 lg:h-32" />
    </div>
  );
};
