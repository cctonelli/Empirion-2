import React from 'react';
import { Package, Warehouse, Boxes, Landmark, HelpCircle, Activity } from 'lucide-react';
import { WizardStepHeader } from './shared';
import { DecisionData, Championship, Team } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../../constants';
import { getAdjustedPrice } from '../../services/simulation';

interface SupplyStepProps {
  decisions: DecisionData;
  updateDecision: (path: string, val: any) => void;
  activeArena: Championship | null;
  activeTeam: Team | null;
  round: number;
  currentMacro: any;
  isReadOnly: boolean;
}

export const SupplyStep: React.FC<SupplyStepProps> = ({
  decisions,
  updateDecision,
  activeArena,
  activeTeam,
  round,
  currentMacro,
  isReadOnly,
}) => {
  return (
    <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho do passo */}
      <WizardStepHeader 
        icon={<Package size={32} strokeWidth={2.5} />} 
        title="Cadeia de Suprimentos" 
        desc="Defina as quantidades de matéria-prima a serem adquiridas e as condições de pagamento aos fornecedores. Decisões críticas para evitar rupturas de estoque ou excesso de capital parado." 
        help="Lembre-se: Produto Acabado consome 3 MP-A e 2 MP-B por unidade produzida."
      />

      {/* Seção: Saldos e Custos de Armazenagem */}
      <div className="bg-slate-900/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
        <h5 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-6 flex items-center gap-3 font-sans">
          <Warehouse size={20} /> Saldos Atuais e Custos de Armazenagem
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(() => {
            const storageAdjust = getAdjustedPrice(1, 'storage_cost_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM);
            const unitStoragePA = (currentMacro?.prices?.storage_finished || 5) * storageAdjust;
            const unitStorageMP = (currentMacro?.prices?.storage_mp || 2) * storageAdjust;
            
            const stockPA = activeTeam?.kpis?.stock_quantities?.finished_goods || 0;
            const stockMPA = activeTeam?.kpis?.stock_quantities?.mp_a || 0;
            const stockMPB = activeTeam?.kpis?.stock_quantities?.mp_b || 0;

            return (
              <>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-mono">Estoque Prod. Acabados</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-mono font-bold text-white">{stockPA} un</span>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-sans">Custo Armaz.</span>
                      <span className="text-xs font-mono text-rose-400">
                        {formatCurrency(stockPA * unitStoragePA, activeArena?.currency || 'BRL')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-mono">Estoque MP-A</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-mono font-bold text-white">{stockMPA} un</span>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-sans">Custo Armaz.</span>
                      <span className="text-xs font-mono text-rose-400">
                        {formatCurrency(stockMPA * unitStorageMP, activeArena?.currency || 'BRL')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-mono">Estoque MP-B</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-mono font-bold text-white">{stockMPB} un</span>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-sans">Custo Armaz.</span>
                      <span className="text-xs font-mono text-rose-400">
                        {formatCurrency(stockMPB * unitStorageMP, activeArena?.currency || 'BRL')}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Seção: Compras de Matéria-Prima */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4 font-sans">
            <Boxes size={28} className="text-orange-400" />
            Aquisição de Insumos
          </h4>
          <span className="text-sm font-medium text-slate-400 italic font-sans animate-fade">
            Para produção do próximo período
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* MP-A */}
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-1 font-sans">
                  Matéria-Prima A
                </h5>
                <p className="text-sm text-slate-400 italic">
                  Consumo: 3 unidades por produto acabado
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-600/10">
                <Package size={28} className="text-orange-400" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans mb-1 select-none">
                Quantidade a Comprar (unidades)
                <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <input
                type="number"
                min="0"
                step="100"
                disabled={isReadOnly}
                value={decisions.production.purchaseMPA}
                onChange={e => updateDecision('production.purchaseMPA', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                placeholder="0"
              />
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-500 italic">
                  Preço Unit. (ajustado): <span className="text-orange-400 font-bold">{formatCurrency(getAdjustedPrice(currentMacro?.prices?.mp_a || 15, 'raw_material_a_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM), activeArena?.currency || 'BRL', true, 4)}</span>
                </div>
                <div className="text-xs text-slate-500 italic">
                  Total: <span className="text-orange-400 font-bold">{formatCurrency((decisions.production.purchaseMPA || 0) * getAdjustedPrice(currentMacro?.prices?.mp_a || 15, 'raw_material_a_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM), activeArena?.currency || 'BRL')}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic pt-2">
                Sugestão baseada em capacidade atual: {Math.round((activeTeam?.kpis?.production_capacity || 0) * 3 * 1.1 / 100)} – {Math.round((activeTeam?.kpis?.production_capacity || 0) * 3 * 1.3 / 100)} unidades
              </p>
            </div>
          </div>

          {/* MP-B */}
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-1 font-sans">
                  Matéria-Prima B
                </h5>
                <p className="text-sm text-slate-400 italic">
                  Consumo: 2 unidades por produto acabado
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-600/10">
                <Package size={28} className="text-orange-400" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2 font-sans mb-1 select-none">
                Quantidade a Comprar (unidades)
                <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
              </label>
              <input
                type="number"
                min="0"
                step="100"
                disabled={isReadOnly}
                value={decisions.production.purchaseMPB}
                onChange={e => updateDecision('production.purchaseMPB', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                placeholder="0"
              />
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-500 italic">
                  Preço Unit. (ajustado): <span className="text-orange-400 font-bold">{formatCurrency(getAdjustedPrice(currentMacro?.prices?.mp_b || 25, 'raw_material_b_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM), activeArena?.currency || 'BRL', true, 4)}</span>
                </div>
                <div className="text-xs text-slate-500 italic">
                  Total: <span className="text-orange-400 font-bold">{formatCurrency((decisions.production.purchaseMPB || 0) * getAdjustedPrice(currentMacro?.prices?.mp_b || 25, 'raw_material_b_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM), activeArena?.currency || 'BRL')}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic pt-2">
                Sugestão baseada em capacidade atual: {Math.round((activeTeam?.kpis?.production_capacity || 0) * 2 * 1.1 / 100)} – {Math.round((activeTeam?.kpis?.production_capacity || 0) * 2 * 1.3 / 100)} unidades
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projeção Dinâmica do Kardex de Suprimentos & Simulação */}
      <div className="mt-8 p-6 lg:p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2 font-sans">
              <Activity size={18} className="text-amber-500 animate-bounce" />
              Simulação em Tempo Real do Kardex de Suprimentos (WAC & Z-Guard)
            </h4>
            <p className="text-xs text-slate-400 italic mt-1 font-sans">
              Projeta em tempo real os fluxos físicos e avalia a iminência de Cisnes de Estoque (compras de emergência) baseando-se no plano de produção e estoque disponível.
            </p>
          </div>
          <div className="px-4 py-1.5 bg-slate-950 rounded-full border border-slate-800 text-[10px] font-mono font-semibold text-slate-400">
            Produção Projetada: <span className="text-amber-500 font-bold">{(() => {
              const estProd = Math.floor((activeTeam?.kpis?.production_capacity || 0) * (decisions.production.activityLevel / 100));
              const extraP = decisions.production.extraProductionPercent || 0;
              return estProd + Math.floor(estProd * (extraP / 100));
            })()} un</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kardex MP-A */}
          {(() => {
            const initialA = activeTeam?.kpis?.stock_quantities?.mp_a ?? 30150;
            const pA = decisions.production.purchaseMPA ?? 0;
            const estProd = Math.floor((activeTeam?.kpis?.production_capacity || 0) * (decisions.production.activityLevel / 100));
            const extraP = decisions.production.extraProductionPercent || 0;
            const totalP = estProd + Math.floor(estProd * (extraP / 100));
            const consA = totalP * 3;
            const totalAvailA = initialA + pA;
            const emergA = consA > totalAvailA ? consA - totalAvailA : 0;
            const finalA = Math.max(0, totalAvailA + emergA - consA);

            return (
              <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider font-sans">Matéria-Prima A</span>
                  {emergA > 0 ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1 animate-pulse font-sans">
                      ● Compra de Emergência Ativada (+{emergA})
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-sans">
                      ● Estoque Seguro (+{finalA})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="block text-slate-500">Saldo Inicial</span>
                    <span className="font-mono font-bold text-slate-300">{initialA} un</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="block text-slate-500">Entrada (Plan)</span>
                    <span className="font-mono font-bold text-orange-400">+{pA} un</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="block text-slate-500">Consumo (Est)</span>
                    <span className="font-mono font-bold text-red-400">-{consA} un</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500 font-sans">Saldo Final Projetado:</span>
                  <span className="font-mono font-black text-white">{finalA} un</span>
                </div>
              </div>
            );
          })()}

          {/* Kardex MP-B */}
          {(() => {
            const initialB = activeTeam?.kpis?.stock_quantities?.mp_b ?? 20100;
            const pB = decisions.production.purchaseMPB ?? 0;
            const estProd = Math.floor((activeTeam?.kpis?.production_capacity || 0) * (decisions.production.activityLevel / 100));
            const extraP = decisions.production.extraProductionPercent || 0;
            const totalP = estProd + Math.floor(estProd * (extraP / 100));
            const consB = totalP * 2;
            const totalAvailB = initialB + pB;
            const emergB = consB > totalAvailB ? consB - totalAvailB : 0;
            const finalB = Math.max(0, totalAvailB + emergB - consB);

            return (
              <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider font-sans">Matéria-Prima B</span>
                  {emergB > 0 ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1 animate-pulse font-sans">
                      ● Compra de Emergência Ativada (+{emergB})
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-sans">
                      ● Estoque Seguro (+{finalB})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="block text-slate-500">Saldo Inicial</span>
                    <span className="font-mono font-bold text-slate-300">{initialB} un</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="block text-slate-500">Entrada (Plan)</span>
                    <span className="font-mono font-bold text-orange-400">+{pB} un</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="block text-slate-500">Consumo (Est)</span>
                    <span className="font-mono font-bold text-red-400">-{consB} un</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500 font-sans">Saldo Final Projetado:</span>
                  <span className="font-mono font-black text-white">{finalB} un</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Seção: Condições de Pagamento */}
      <div className="space-y-10 pt-12 border-t border-white/10">
        <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4 font-sans">
          <Landmark size={28} className="text-emerald-400" />
          Forma de Pagamento aos Fornecedores
        </h4>

        <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl max-w-2xl mx-auto">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-3 font-sans mb-6 select-none animate-bounce-slow">
            Condições de Pagamento
            <HelpCircle size={18} className="text-slate-500 hover:text-emerald-400 transition-colors cursor-help" />
          </label>

          <select
            disabled={isReadOnly}
            value={decisions.production.paymentType}
            onChange={e => updateDecision('production.paymentType', parseInt(e.target.value))}
            className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-lg lg:text-xl font-semibold text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
          >
            <option value={0}>À vista (vence neste período)</option>
            <option value={1}>À vista + 50% no próximo período</option>
            <option value={2}>Parcelado: à vista + 33% + 33%</option>
          </select>

          {/* Detalhamento das Parcelas */}
          <div className="mt-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3">
            <h6 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">Cronograma de Desembolso Estimado (com juros)</h6>
            {(() => {
              const priceA = getAdjustedPrice(currentMacro?.prices?.mp_a || 15, 'raw_material_a_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM);
              const priceB = getAdjustedPrice(currentMacro?.prices?.mp_b || 25, 'raw_material_b_adjust', round, activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM);
              const total = ((decisions.production.purchaseMPA || 0) * priceA) + ((decisions.production.purchaseMPB || 0) * priceB);
              const interest = (currentMacro?.interest_rate_tr || 2.0) / 100;

              if (decisions.production.paymentType === 0) {
                return (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 italic">Parcela Única (T+0)</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(total, activeArena?.currency || 'BRL')}</span>
                  </div>
                );
              } else if (decisions.production.paymentType === 1) {
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 italic">Entrada (T+0) - 50%</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(total * 0.5, activeArena?.currency || 'BRL')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 italic">Parcela 2 (T+1) - 50% + Juros</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(total * 0.5 * (1 + interest), activeArena?.currency || 'BRL')}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 italic">Entrada (T+0) - 34%</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(total * 0.34, activeArena?.currency || 'BRL')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 italic">Parcela 2 (T+1) - 33% + Juros</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(total * 0.33 * (1 + interest), activeArena?.currency || 'BRL')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 italic">Parcela 3 (T+2) - 33% + Juros Acum.</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(total * 0.33 * (1 + interest * 2), activeArena?.currency || 'BRL')}</span>
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          <div className="mt-8 p-6 bg-slate-950/60 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed font-sans">
            <p className="font-medium mb-3">Impactos esperados:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>À vista → Melhor gestão de passivos, exige caixa imediato</li>
              <li>Parcelado → Preserva liquidez no curto prazo, aumenta o PMP</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="h-24 lg:h-32" />
    </div>
  );
};
