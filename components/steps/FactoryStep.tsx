import React from 'react';
import { Factory, Zap, HelpCircle, Hammer, Cpu, AlertTriangle, ShieldAlert } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData, Championship, Team } from '../../types';

interface FactoryStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  activeTeam?: Team | null;
  currentMacro?: any;
  isReadOnly: boolean;
}

export const FactoryStep: React.FC<FactoryStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  activeTeam,
  currentMacro,
  isReadOnly,
}) => {
  const maxShifts = currentMacro?.max_shifts || 1;
  const selectedShifts = decisions.production?.shifts ?? 1;

  const kpis: any = activeTeam?.kpis || {};
  const strikeActivated = kpis.strike_activated || 'NÃO';
  const prodIndex = kpis.productivity_index !== undefined ? kpis.productivity_index : 100;

  return (
    <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader 
        icon={<Factory size={32} strokeWidth={2.5} />} 
        title="Chão de Fábrica & Operações" 
        desc="Configure o nível de utilização da capacidade instalada, turnos extras e investimento em P&D. Essas decisões definem o volume produzido, custos operacionais e ganhos de eficiência de longo prazo." 
        help="Atenção: Turnos extras multiplicam a capacidade operacional sem exigir investimentos adicionais em máquinas (CapEx), mas aumentam custos de mão de obra direta (OpEx) por conta de encargos noturnos."
      />

      {/* Alerta Crítico de Greve no Chão de Fábrica */}
      {strikeActivated === 'SIM' && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl p-8 flex items-start gap-5 max-w-4xl mx-auto shadow-xl shadow-rose-500/5">
          <ShieldAlert className="text-rose-500 shrink-0 mt-1 animate-bounce" size={32} />
          <div>
            <h6 className="font-extrabold text-rose-400 uppercase tracking-wider mb-2 font-sans text-lg">
              OPERÁRIOS EM GREVE (PRODUÇÃO RESTRITA EM 50%)
            </h6>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              O sindicato decretou **Greve Geral** devido ao clima organizacional desfavorável em dois períodos consecutivos. O Índice de Produtividade industrial está limitado a 50%, reduzindo a eficiência fabril drasticamente. Regularize o Piso Salarial e aumente a Participação nos Lucros (PPR) no painel de Clima/RH para retomar as operações normais.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* 1. Uso da Capacidade */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Uso da Capacidade Instalada
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Percentual de utilização das máquinas disponíveis. Valores acima de 100% podem gerar desgaste extra e custos de manutenção não planejados.
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

            <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-white/5 text-sm font-sans my-4">
              <span className="text-slate-400 font-medium">Produtividade Efetiva (P-1):</span>
              <span className={`font-black font-mono ${prodIndex >= 100 ? 'text-emerald-400' : prodIndex >= 85 ? 'text-blue-400' : 'text-rose-400'}`}>{prodIndex}%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 font-sans">
              <div>Baixo: Menor custo, menor produção</div>
              <div className="text-right">Alto: Maior produção, risco de breakdown</div>
            </div>
          </div>
        </div>

        {/* 2. Turnos de Operação */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Regime Operacional de Turnos
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Selecione o número de turnos ativos. Ativar turnos extras permite aumentar de forma massiva a sua capacidade de produção sem novos investimentos em máquinas (CapEx), mas eleva a folha de pagamento de MOD (OpEx) por conta de encargos noturnos.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors shrink-0">
              <Hammer size={28} className="text-rose-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Turnos Ativos Selecionados
                <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <span className="text-2xl lg:text-3xl font-mono font-bold text-rose-400">
                {selectedShifts} {selectedShifts === 1 ? 'Turno' : 'Turnos'}
              </span>
            </div>

            {maxShifts > 1 ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((num) => {
                  const isBlocked = num > maxShifts;
                  const isActive = selectedShifts === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isReadOnly || isBlocked}
                      onClick={() => updateDecision('production.shifts', num)}
                      className={`
                        py-3 px-1 rounded-xl text-xs font-black uppercase transition-all border flex flex-col items-center justify-center gap-1
                        ${isBlocked 
                          ? 'bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed opacity-30' 
                          : isActive 
                            ? 'bg-rose-600/20 border-rose-500 text-white font-black shadow-lg scale-[1.02]' 
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:border-rose-500/30 hover:text-white'}
                      `}
                    >
                      <span className="text-base font-mono">{num}T</span>
                      <span className="text-[9px] opacity-80">{num === 1 ? 'Regular' : num === 2 ? 'Dobrado' : 'Contínuo'}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-white/5 rounded-xl text-center text-xs font-medium text-slate-400 italic">
                Regime restrito pelo regulamento: Turno Único (1T) Obrigatório.
              </div>
            )}

            <div className="text-xs text-rose-300 space-y-1.5 pt-2 border-t border-white/5 font-sans">
              <div className="flex justify-between"><span>Capacidade Produtiva:</span> <strong className="font-mono text-white">{selectedShifts === 1 ? '100%' : selectedShifts === 2 ? '180% (+80%)' : '230% (+130%)'}</strong></div>
              <div className="flex justify-between"><span>Impacto do Custo MOD:</span> <strong className="font-mono text-white">{selectedShifts === 1 ? 'Base (1.0x)' : selectedShifts === 2 ? 'Acrescido (1.5x)' : 'Dobrado (2.0x)'}</strong></div>
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
