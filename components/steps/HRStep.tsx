import React from 'react';
import { Users2, UserPlus, UserMinus, DollarSign, Coins, TrendingUp, HeartPulse, HelpCircle, Zap, ShieldAlert, CheckCircle2, AlertTriangle, Smile } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData, Championship, Team } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface HRStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  activeTeam?: Team | null;
  currentMacro: any;
  isReadOnly: boolean;
}

export const HRStep: React.FC<HRStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  activeTeam,
  currentMacro,
  isReadOnly,
}) => {
  const kpis: any = activeTeam?.kpis || {};
  
  // Extração amigável dos novos KPIs de Clima e Greve (v19.5 Sapphire)
  const currentMotivationIndex = kpis.motivation_index !== undefined ? kpis.motivation_index : 1.00;
  const currentMotivationLevel = kpis.motivation_level || 'REGULAR';
  const strikeActivated = kpis.strike_activated || 'NÃO';
  const strikeAlert = kpis.strike_alert_active || false;
  
  const tf = kpis.training_factor !== undefined ? kpis.training_factor : 1.00;
  const mf = kpis.motivation_factor !== undefined ? kpis.motivation_factor : 1.00;
  const ff = kpis.fatigue_factor !== undefined ? kpis.fatigue_factor : 1.00;
  const dif = kpis.demission_insecurity_factor !== undefined ? kpis.demission_insecurity_factor : 1.00;
  const maf = kpis.machine_age_factor !== undefined ? kpis.machine_age_factor : 1.00;
  const prodIndex = kpis.productivity_index !== undefined ? kpis.productivity_index : 100;

  // Helpers para estilização das bolhas de clima
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ALTO': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'BOM': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'REGULAR': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'RUIM': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader 
        icon={<Users2 size={32} strokeWidth={2.5} />} 
        title="Gestão de Talentos & Clima" 
        desc="Defina contratações, demissões, piso salarial e incentivos. Essas decisões afetam diretamente a produtividade, motivação da equipe, custos fixos e risco de greves ou turnover elevado." 
        help="Salário baixo + pouca coordenação pode gerar queda de produtividade e eventos negativos. Treinamento e bônus são investimentos de retorno médio/longo prazo."
      />

      {/* PAINEL AVANÇADO DE CLIMA ORGANIZACIONAL (Oracle Accounting Strategos) */}
      <div className="bg-slate-950/80 border-2 border-slate-800/80 p-8 lg:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Smile size={120} className="text-slate-100" />
        </div>
        
        <h4 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
          <HeartPulse className="text-rose-500 animate-pulse" size={28} />
          Oráculo de Clima Organizacional & Sindicato (Período Anterior)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          {/* Índice de Motivação */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Índice de Motivação
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl lg:text-4xl font-mono font-black text-white">
                {currentMotivationIndex.toFixed(2)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase ${getLevelColor(currentMotivationLevel)}`}>
                {currentMotivationLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Score baseado em salário de mercado e PPR.
            </p>
          </div>

          {/* Índice de Produtividade */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Rendimento de Produtividade
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl lg:text-4xl font-mono font-black text-emerald-400">
                {prodIndex}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Multiplicador das horas produtivas das máquinas.
            </p>
          </div>

          {/* Ativação de Greve */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Ativação de Greve
            </span>
            <div className="flex items-center gap-3 my-2">
              {strikeActivated === 'SIM' ? (
                <>
                  <ShieldAlert size={28} className="text-rose-500 animate-bounce" />
                  <span className="text-2xl font-black text-rose-500 uppercase tracking-wider font-mono">
                    SIM
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={28} className="text-emerald-400" />
                  <span className="text-2xl font-black text-emerald-400 uppercase tracking-wider font-mono">
                    NÃO
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Dois rounds consecutivos em 'RUIM' ou com demissões operacionais ativam greve.
            </p>
          </div>

          {/* Eventos da Rodada */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Risco Sindical
            </span>
            <div className="my-2">
              {strikeAlert ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle size={24} className="animate-pulse" />
                  <span className="text-sm font-extrabold uppercase font-sans tracking-tight">
                    ALERTA DE GREVE!
                  </span>
                </div>
              ) : strikeActivated === 'SIM' ? (
                <div className="flex items-center gap-2 text-rose-500">
                  <ShieldAlert size={24} className="animate-pulse" />
                  <span className="text-sm font-extrabold uppercase font-sans tracking-tight">
                    EM PARALISAÇÃO!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-sm font-medium font-sans">Sindicato sob Controle</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Controle o clima de trabalho.
            </p>
          </div>
        </div>

        {/* Fatores Detalhados */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h5 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
            Auditoria de Fatores da Equação de Produtividade (%)
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
              <span className="text-xxs text-slate-400 uppercase block font-sans mb-1">Treinamento</span>
              <span className="text-lg font-bold font-mono text-blue-400">x{tf.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
              <span className="text-xxs text-slate-400 uppercase block font-sans mb-1">Salário & Bônus</span>
              <span className="text-lg font-bold font-mono text-emerald-400">x{mf.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
              <span className="text-xxs text-slate-400 uppercase block font-sans mb-1">Fadiga (Horas)</span>
              <span className="text-lg font-bold font-mono text-amber-500">x{ff.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
              <span className="text-xxs text-slate-400 uppercase block font-sans mb-1">Insegurança</span>
              <span className="text-lg font-bold font-mono text-rose-400">x{dif.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 col-span-2 md:col-span-1">
              <span className="text-xxs text-slate-400 uppercase block font-sans mb-1">Idade Máquinas</span>
              <span className="text-lg font-bold font-mono text-purple-400">x{maf.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* 1. Novas Admissões */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-emerald-400 uppercase tracking-tight mb-2 font-sans">
                Novas Admissões
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Quantidade de novos colaboradores contratados neste round. Aumenta a capacidade produtiva (operadores por máquina), mas gera custo imediato de integração e folha.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-600/10 group-hover:bg-emerald-600/20 transition-colors shrink-0">
              <UserPlus size={28} className="text-emerald-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Número de Contratações
                <HelpCircle size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors cursor-help" />
              </label>
              <span className="text-1.5xl lg:text-2xl font-mono font-bold text-emerald-400">
                +{decisions.hr.hired}
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="5"
              disabled={isReadOnly}
              value={decisions.hr.hired}
              onChange={e => updateDecision('hr.hired', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
              placeholder="0"
            />

            <p className="text-xs text-emerald-300 italic font-sans">
              Impacto: +{Math.round((decisions.hr.hired || 0) * (currentMacro?.operators_per_machine || 1.8))} operadores efetivos (estimado)
            </p>
          </div>
        </div>

        {/* 2. Desligamentos */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-rose-500/30 hover:shadow-rose-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-rose-400 uppercase tracking-tight mb-2 font-sans">
                Desligamentos
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Número de funcionários demitidos. Reduz folha salarial, mas, além do salário do período, gera multa rescisória de 1 salário + encargos sociais sobre a multa e perda imediata de capacidade produtiva.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors shrink-0">
              <UserMinus size={28} className="text-rose-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Número de Demissões
                <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
              </label>
              <span className="text-1.5xl lg:text-2xl font-mono font-bold text-rose-400 font-mono">
                -{decisions.hr.fired}
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="5"
              disabled={isReadOnly}
              value={decisions.hr.fired}
              onChange={e => updateDecision('hr.fired', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all font-mono"
              placeholder="0"
            />

            <p className="text-xs text-rose-300 italic font-sans">
              Custo estimado de rescisão: ~{formatCurrency((decisions.hr.fired || 0) * (decisions.hr.salary || 2500) * 1.5, 'BRL')}
            </p>
          </div>
        </div>

        {/* 3. Piso Salarial */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2 font-sans">
                Piso Salarial Base
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Salário mensal base por colaborador. Valores baixos reduzem custos fixos, mas impactam negativamente motivação, produtividade e atratividade para novas contratações.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-600/10 group-hover:bg-orange-600/20 transition-colors shrink-0">
              <DollarSign size={28} className="text-orange-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans select-none">
                Salário Mensal Base
                <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <span className="text-1.5xl lg:text-2xl font-mono font-bold text-orange-400">
                {formatCurrency(decisions.hr.salary, 'BRL')}
              </span>
            </div>

            <input
              type="number"
              min="1000"
              step="100"
              disabled={isReadOnly}
              value={decisions.hr.salary}
              onChange={e => updateDecision('hr.salary', parseInt(e.target.value) || 2500)}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all font-mono"
              placeholder="2500"
            />

            <p className="text-xs text-orange-300 italic font-sans">
              Mínimo regional sugerido: R$ {currentMacro?.min_salary || 2500}
            </p>
          </div>
        </div>
      </div>

      {/* Incentivos variáveis – segunda linha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-8 border-t border-white/10">
        {/* Treinamento */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all duration-300 group">
          <h5 className="text-xl font-black text-blue-400 uppercase tracking-tight mb-4 flex items-center gap-3 font-sans">
            <Zap size={24} /> Treinamento (% da folha)
          </h5>
          <p className="text-sm text-slate-400 mb-6 font-sans">
            Percentual investido em capacitação: Aumenta produtividade por homem-hora e reduz risco de obsolescência técnica. Novas contratações ou novos modelos de máquinas exigem treinamento de equipe. 
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300 font-sans">{decisions.hr.trainingPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            disabled={isReadOnly}
            value={decisions.hr.trainingPercent}
            onChange={e => updateDecision('hr.trainingPercent', parseFloat(e.target.value) || 0)}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:accent-blue-500"
          />
        </div>

        {/* Participação nos Lucros */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
          <h5 className="text-xl font-black text-emerald-400 uppercase tracking-tight mb-4 flex items-center gap-3 font-sans">
            <Coins size={24} /> Participação nos Lucros (PPR %)
          </h5>
          <p className="text-sm text-slate-400 mb-6 font-sans">
            Percentual do lucro líquido distribuído como bônus. Motiva alinhamento com resultados da empresa, mas só pago se houver lucro.
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300 font-sans">{decisions.hr.participationPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            disabled={isReadOnly}
            value={decisions.hr.participationPercent}
            onChange={e => updateDecision('hr.participationPercent', parseFloat(e.target.value) || 0)}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 hover:accent-emerald-500"
          />
        </div>

        {/* Prêmio Produtividade */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
          <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-4 flex items-center gap-3 font-sans">
            <TrendingUp size={24} /> Prêmio por Produtividade (%)
          </h5>
          <p className="text-sm text-slate-400 mb-6 font-sans">
            Bônus imediato baseado no atingimento de metas de produção. Aumenta motivação no curto prazo e produtividade efetiva.
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300 font-sans">{decisions.hr.productivityBonusPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            disabled={isReadOnly}
            value={decisions.hr.productivityBonusPercent}
            onChange={e => updateDecision('hr.productivityBonusPercent', parseFloat(e.target.value) || 0)}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 hover:accent-orange-500 font-sans"
          />
        </div>
      </div>

      {/* Resumo de trade-offs */}
      <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-8 lg:p-10 max-w-4xl mx-auto text-center mt-12 shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-6">
          <HeartPulse size={24} className="text-yellow-400 animate-pulse" />
          <h6 className="text-lg font-black text-yellow-300 uppercase tracking-wide font-sans">
            Equilíbrio de Pessoal
          </h6>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto font-sans">
          Folha alta + incentivos fortes = equipe motivada e produtiva, mas margem pressionada. Demissões excessivas ou salários baixos podem gerar eventos negativos (greves, baixa qualidade). O ideal é equilíbrio entre custo e motivação para sustentabilidade de longo prazo.
        </p>
      </div>

      {/* Espaçamento final */}
      <div className="h-24 lg:h-32" />
    </div>
  );
};
