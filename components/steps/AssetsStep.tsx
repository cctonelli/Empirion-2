import React from 'react';
import { Cpu, Info, Warehouse, Settings2, Plus, Users, Zap, Wrench } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData, Championship, Team, MachineInstance } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../../constants';
import { getAdjustedPrice } from '../../services/simulation';

interface AssetsStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  activeTeam: Team | null;
  round: number;
  currentMacro: any;
  isReadOnly: boolean;
}

const AssetCard = ({ model, val, onChange, price, currency, spec, disabled, installationCost }: any) => (
  <div className={`bg-slate-900/80 p-3 rounded-xl border transition-all shadow-xl ${disabled ? 'opacity-40 grayscale pointer-events-none border-white/5' : 'border-white/5 group hover:border-blue-500/30'}`}>
     <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-black text-white uppercase italic tracking-tight font-sans">Machine {model.toUpperCase()}</h4>
        <Cpu size={16} className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
     </div>
     <div className="space-y-2">
        <div className="space-y-0.5">
           <span className="text-[8px] font-black text-slate-500 uppercase">Preço Unitário Oracle</span>
           <div className="text-lg font-black text-blue-400 font-mono">{formatCurrency(price, currency)}</div>
        </div>
        
        {spec && (
           <div className="grid grid-cols-1 gap-1 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                 <Wrench size={10} className="text-amber-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invest. em instalação: <span className="text-amber-400 font-mono">{formatCurrency(installationCost, currency)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                 <Users size={10} className="text-slate-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.operators_required} operadores necessários</span>
              </div>
              <div className="flex items-center gap-2">
                 <Zap size={10} className="text-slate-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.production_capacity} unid. a 100% de capacidade</span>
              </div>
           </div>
        )}
     </div>
     <div className="pt-3 space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">COMPRAR (Qtd)</label>
        <input 
          type="number" 
          min="0" 
          disabled={disabled}
          value={val} 
          onChange={e => onChange(parseInt(e.target.value) || 0)} 
          className="w-full bg-slate-950 border-2 border-white/5 rounded-xl p-2 text-lg font-mono font-black text-white outline-none focus:border-blue-600 shadow-inner disabled:opacity-50" 
        />
     </div>
  </div>
);

export const AssetsStep: React.FC<AssetsStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  activeTeam,
  round,
  currentMacro,
  isReadOnly,
}) => {
  const isZeroMode = activeArena?.config?.starting_mode === 'start_from_zero' || activeArena?.starting_mode === 'start_from_zero';
  const isRoundZeroAndZeroMode = isZeroMode && round === 0;
  const isAllowedToBuy = currentMacro?.allow_machine_sale && !isRoundZeroAndZeroMode;
  const machinesList = (isZeroMode && (round === 0 || round === 1)) ? [] : (activeTeam?.kpis?.machines || []);

  const getInstallationCost = (modelName: string) => {
    const ecoConfig = activeArena?.config || (activeArena as any)?.ecosystem_config || {};
    const machines = ecoConfig.machines || [];
    const found = machines.find((m: any) => m.model === modelName);
    if (found && found.installation_cost !== undefined) {
      return found.installation_cost;
    }
    if (modelName === 'alpha') return 150000;
    if (modelName === 'beta') return 600000;
    if (modelName === 'gamma') return 1500000;
    return 0;
  };

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader
        icon={<Cpu size={32} strokeWidth={2.5} />}
        title="Gestão de Ativos & CapEx"
        desc="Analise o parque atual e decida sobre expansão (compra) ou desinvestimento (venda). Cada máquina nova exige operadores, treinamento e pode ter reajustes progressivos."
        help="Venda gera caixa imediato (com deságio), mas reduz capacidade. Compra nova pode ser financiada via BDI com carência."
      />

      {/* Ajuda tática */}
      <div className="bg-slate-900/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
        <h5 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-6 flex items-center gap-3">
          <Info size={20} /> Informações essenciais para decisões de CapEx
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <span className="font-semibold text-emerald-300">Financiamento BDI (novas máquinas)</span>
            <p className="leading-relaxed">
              Carência de 4 rounds (paga apenas juros) + 4 rounds amortizando principal + juros. Taxa definida no período. Ideal para expansão sem comprometer caixa imediato.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-emerald-300">Operadores necessários</span>
            <p className="leading-relaxed">
              Cada máquina nova exige um número específico de operadores por unidade. Verifique saldo de RH → pode exigir contratações ou demissões.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-emerald-300">Treinamento obrigatório</span>
            <p className="leading-relaxed">
              Máquina de modelo novo → equipe precisa de treinamento (investimento em % da folha de pagamento da fábrica). Sem treinamento → produtividade inicial reduzida em 20–40%.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-rose-300">Deságio na venda</span>
            <p className="leading-relaxed">
              Definido pelo tutor: <strong>{currentMacro?.machine_sale_discount || 0}%</strong> ({currentMacro?.machine_sale_discount_label || 'DESÁGIO VENDA MÁQUINAS'}). Valor líquido recebido = valor contábil × (1 - deságio).
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-orange-300">Reajustes de preço</span>
            <p className="leading-relaxed">
              Máquinas novas sofrem reajuste acumulado por round. Varia por modelo (ver valores abaixo). Ajuste é cumulativo desde o round inicial.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-300">Disponibilidade</span>
            <p className="leading-relaxed">
              Nem todo round permite compra. Status atual: <strong>{isAllowedToBuy ? 'Disponível' : 'Bloqueado neste round'}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Seção 1: Parque Atual */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4 font-sans">
            <Warehouse size={28} className="text-blue-400" />
            Parque Operacional Atual (P-{round})
          </h4>
          <span className="text-sm font-medium text-slate-400 italic">
            {machinesList.length} unidades instaladas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {machinesList.length === 0 ? (
            <div className="col-span-full bg-slate-900/40 border border-white/5 p-10 rounded-[2rem] text-center space-y-4">
              <Warehouse size={40} className="text-slate-600 mx-auto animate-bounce" />
              <p className="text-sm text-slate-400 font-medium italic">Nenhuma máquina instalada no seu parque operacional ainda. Como você está iniciando no modo Greenfield (Começo do Zero), adquira novas unidades abaixo para iniciar a sua linha de produção no Ciclo 1.</p>
            </div>
          ) : (
            machinesList.map((m: MachineInstance, idx: number) => {
              const isSold = decisions.machinery.sell_ids?.includes(m.id);
              const currentValue = Math.max(0, m.acquisition_value - m.accumulated_depreciation);
              const desagio = currentMacro?.machine_sale_discount || 0;
              const valorVendaLiquida = currentValue * (1 - desagio / 100);

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`
                    bg-slate-900/70 backdrop-blur-sm p-6 rounded-3xl border transition-all duration-300
                    ${isSold 
                      ? 'border-rose-500/50 bg-rose-950/20' 
                      : 'border-white/10 hover:border-blue-500/30'}
                  `}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">
                        Unidade #{m.id}
                      </span>
                      <h5 className="text-lg font-black text-white uppercase tracking-tight font-sans">
                        {m.model.toUpperCase()}
                      </h5>
                      <span className="text-sm text-slate-400 italic">
                        Idade: {m.age + 1} round{m.age + 1 !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl ${isSold ? 'bg-rose-600/20' : 'bg-blue-600/10'}`}>
                      <Settings2 size={24} className={isSold ? 'text-rose-400' : 'text-blue-400'} />
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-t border-white/5 pt-3">
                      <span className="text-slate-300 font-medium">Valor Contábil Residual</span>
                      <span className={`font-mono font-bold ${isSold ? 'text-rose-400 line-through opacity-70' : 'text-emerald-400'}`}>
                        {formatCurrency(currentValue, activeArena?.currency || 'BRL')}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Valor Líquido Após Deságio ({desagio}%)</span>
                      <span className={`font-bold font-mono ${isSold ? 'text-rose-400 font-extrabold' : 'text-orange-400'}`}>
                        {formatCurrency(valorVendaLiquida, activeArena?.currency || 'BRL')}
                      </span>
                    </div>

                    <label className="flex items-center justify-end gap-3 cursor-pointer group pt-2 select-none">
                      <span className={`text-sm font-semibold uppercase transition-colors ${isSold ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'}`}>
                        {isSold ? 'Marcada para Venda' : 'Marcar para Venda'}
                      </span>
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={isSold}
                        onChange={(e) => {
                          const ids = [...(decisions.machinery.sell_ids || [])];
                          if (e.target.checked) {
                            if (!ids.includes(m.id)) ids.push(m.id);
                          } else {
                            const index = ids.indexOf(m.id);
                            if (index > -1) ids.splice(index, 1);
                          }
                          updateDecision('machinery.sell_ids', ids);
                        }}
                        className="w-5 h-5 rounded border-2 border-slate-600 accent-rose-600 bg-slate-950 cursor-pointer"
                      />
                    </label>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Seção 2: Novas Ordens de Compra */}
      <div className="space-y-8 pt-10 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4 font-sans">
            <Plus size={28} className="text-emerald-400" />
            Novas Ordens de Compra
          </h4>
          {isAllowedToBuy ? (
            <span className="px-5 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-sm font-semibold text-emerald-300 font-sans">
              Mercado Aberto
            </span>
          ) : (
            <span className="px-5 py-2 bg-rose-600/20 border border-rose-500/30 rounded-xl text-sm font-semibold text-rose-300 font-sans">
              {isRoundZeroAndZeroMode ? 'Estágio de Planejamento (Apenas P-0)' : 'Compras Bloqueadas neste Round'}
            </span>
          )}
        </div>

        {/* Exibição dos reajustes atuais por modelo */}
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 text-sm">
          <h6 className="text-orange-400 font-semibold mb-4 font-sans">Reajustes acumulados atuais (para novas compras):</h6>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400">Alpha:</span>{' '}
              <span className="font-mono text-orange-300 font-bold">
                +{((getAdjustedPrice(1, 'machine_alpha_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM) - 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Beta:</span>{' '}
              <span className="font-mono text-orange-300 font-bold">
                +{((getAdjustedPrice(1, 'machine_beta_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM) - 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Gamma:</span>{' '}
              <span className="font-mono text-orange-300 font-bold">
                +{((getAdjustedPrice(1, 'machine_gamma_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM) - 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <AssetCard
            model="alpha"
            val={decisions.machinery.buy.alfa}
            onChange={(v: number) => updateDecision('machinery.buy.alfa', v)}
            price={getAdjustedPrice(currentMacro?.machinery_values?.alfa || 215000, 'machine_alpha_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)}
            currency={activeArena?.currency || 'BRL'}
            spec={currentMacro?.machine_specs?.alfa}
            disabled={isReadOnly || !isAllowedToBuy}
            installationCost={getInstallationCost('alpha')}
          />
          <AssetCard
            model="beta"
            val={decisions.machinery.buy.beta}
            onChange={(v: number) => updateDecision('machinery.buy.beta', v)}
            price={getAdjustedPrice(currentMacro?.machinery_values?.beta || 310000, 'machine_beta_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)}
            currency={activeArena?.currency || 'BRL'}
            spec={currentMacro?.machine_specs?.beta}
            disabled={isReadOnly || !isAllowedToBuy}
            installationCost={getInstallationCost('beta')}
          />
          <AssetCard
            model="gamma"
            val={decisions.machinery.buy.gama}
            onChange={(v: number) => updateDecision('machinery.buy.gama', v)}
            price={getAdjustedPrice(currentMacro?.machinery_values?.gama || 480000, 'machine_gamma_price_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM)}
            currency={activeArena?.currency || 'BRL'}
            spec={currentMacro?.machine_specs?.gama}
            disabled={isReadOnly || !isAllowedToBuy}
            installationCost={getInstallationCost('gamma')}
          />
        </div>
      </div>

      <div className="h-20 lg:h-28" />
    </div>
  );
};
