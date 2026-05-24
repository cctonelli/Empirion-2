import React from 'react';
import { Factory, Zap, HelpCircle, Hammer, Cpu, AlertTriangle } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData, Championship } from '../../types';

interface FactoryStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  isReadOnly: boolean;
}

export const FactoryStep: React.FC<FactoryStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  isReadOnly,
}) => {
  return (
    <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader 
        icon={<Factory size={32} strokeWidth={2.5} />} 
        title="Chão de Fábrica & Operações" 
        desc="Configure o nível de utilização da capacidade instalada, turnos extras e investimento em P&D. Essas decisões definem o volume produzido, custos operacionais e ganhos de eficiência de longo prazo." 
        help="Atenção: Turno extra aumenta custos de mão de obra em 50%. P&D reduz custo unitário progressivamente."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* 1. Uso da Capacidade */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Uso da Capacidade Instalada
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Percentual de utilização das máquinas disponíveis. Valores acima de 90% podem gerar desgaste extra e custos de manutenção não planejados.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-600/10 group-hover:bg-orange-600/20 transition-colors shrink-0">
              <Zap size={28} className="text-orange-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Nível de Utilização
                <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <span className="text-2xl lg:text-3xl font-mono font-bold text-orange-400">
                {decisions.production.activityLevel}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={isReadOnly}
              value={decisions.production.activityLevel}
              onChange={e => updateDecision('production.activityLevel', parseInt(e.target.value) || 0)}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-orange-500 transition-all cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 font-sans">
              <div>Baixo: Menor custo, menor produção</div>
              <div className="text-right">Alto: Maior produção, risco de breakdown</div>
            </div>
          </div>
        </div>

        {/* 2. Turno Extra */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Turno Extra / Horas Adicionais
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Produção além da capacidade normal. Aumenta a folha de pagamento em 50% sobre as horas extras e pode gerar fadiga da equipe.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors shrink-0">
              <Hammer size={28} className="text-rose-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Percentual de Turno Extra
                <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <span className="text-2xl lg:text-3xl font-mono font-bold text-rose-400">
                {decisions.production.extraProductionPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="50"
              step="5"
              disabled={isReadOnly}
              value={decisions.production.extraProductionPercent}
              onChange={e => updateDecision('production.extraProductionPercent', parseInt(e.target.value) || 0)}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-rose-500 transition-all cursor-pointer"
            />

            <div className="text-xs text-rose-300 italic pt-2 font-sans">
              Custo adicional estimado: +50% sobre MOD das horas extras
            </div>
          </div>
        </div>

        {/* 3. Investimento em P&D */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Investimento em P&D
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Percentual do faturamento bruto alocado em pesquisa e desenvolvimento. Reduz custo unitário ao longo dos rounds e aumenta atratividade do produto.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors shrink-0">
              <Cpu size={28} className="text-blue-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Percentual do Faturamento Bruto
                <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <span className="text-2xl lg:text-3xl font-mono font-bold text-blue-400">
                {decisions.production.rd_investment}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              disabled={isReadOnly}
              value={decisions.production.rd_investment}
              onChange={e => updateDecision('production.rd_investment', parseFloat(e.target.value) || 0)}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-blue-500 transition-all cursor-pointer"
            />

            <div className="text-xs text-blue-300 italic pt-2 font-sans">
              Efeito cumulativo: redução de custo unitário ~0.5–1.5% por ponto investido (longo prazo)
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de alerta / resumo rápido */}
      <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-8 lg:p-10 max-w-4xl mx-auto text-center shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-6">
          <AlertTriangle size={24} className="text-yellow-400 animate-pulse" />
          <h6 className="text-lg font-black text-yellow-300 uppercase tracking-wide font-sans">
            Equilíbrio Operacional
          </h6>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
          Altos níveis de capacidade + turno extra aumentam produção imediata, mas elevam custos e riscos. Investimento contínuo em P&D é a chave para competitividade sustentável nos rounds finais.
        </p>
      </div>

      {/* Espaçamento final */}
      <div className="h-24 lg:h-32" />
    </div>
  );
};
