
import React from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  ArrowRight, Landmark, DollarSign, Cpu, Boxes,
  Calendar, Info, ShieldAlert, Sparkles, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MacroIndicators, Championship } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  news: string;
  round: number;
  onClose: () => void;
}

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, onClose }) => {
  const macro: MacroIndicators = arena.market_indicators;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col h-[85vh] max-h-[900px] relative"
    >
      {/* HEADER DO JORNAL */}
      <header className="bg-slate-950 p-10 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Newspaper size={200} />
         </div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20">
               <Newspaper size={32} />
            </div>
            <div>
               <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Empirion <span className="text-orange-500">Street</span>
               </h1>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Edição Industrial v6.0</span>
                  <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Ciclo 0{round} • Oracle Data Sync</span>
               </div>
            </div>
         </div>
         <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90">
            <ChevronLeft size={24} />
         </button>
      </header>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-16">
         {/* SEÇÃO 1: MACROECONOMIA & TENDÊNCIAS */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Coluna de Análise IA */}
            <div className="lg:col-span-8 space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-3 text-orange-500">
                     <Sparkles size={20} />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Análise de Núcleo Strategos</span>
                  </div>
                  <h2 className="text-4xl font-black text-white italic leading-tight tracking-tight">
                     {news.split('\n')[0] || "Economia Aquecida: Projeção de Crescimento se Mantém em 3%."}
                  </h2>
                  <div className="flex gap-4">
                     <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-400 border border-white/5">Foco: Preço vs. Custo</span>
                     <span className="px-4 py-1.5 bg-blue-600/10 rounded-full text-[9px] font-black uppercase text-blue-400 border border-blue-500/20">Modo: Industrial Mastery</span>
                  </div>
               </div>
               
               <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-slate-400 leading-relaxed italic font-medium">
                     {news.substring(news.indexOf('\n') + 1) || "Aguardando transmissão detalhada do oráculo sobre os impactos da última rodada no Market Share global."}
                  </p>
               </div>

               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                     <Globe size={18} className="text-blue-500" /> Grounded Market Intelligence
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase italic">
                     "Dados verificados via Google Search: O setor de manufatura pesada apresenta sinais de saturação em regiões sul-alfa, exigindo readequação imediata do Mix de Marketing."
                  </p>
               </div>
            </div>

            {/* Coluna de Índices */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-inner">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 border-b border-white/5 pb-4">Indicadores de Ciclo</h3>
                  <div className="space-y-6">
                     <IndexRow label="Crescimento PIB" val={`${macro.growthRate}%`} trend="+0.2%" positive />
                     <IndexRow label="Inflação Período" val={`${macro.inflationRate}%`} trend="Estável" />
                     <IndexRow label="Taxa TR Mensal" val={`${macro.interestRateTR}%`} trend="+0.5%" positive={false} />
                     <IndexRow label="CVM (EMPR8)" val={`$ ${macro.stockMarketPrice}`} trend="-1.2%" positive={false} />
                  </div>
               </div>

               <div className="p-8 bg-rose-600/10 border border-rose-500/20 rounded-[3rem] space-y-6 animate-in zoom-in-95">
                  <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                     <ShieldAlert size={16} /> Regras de Governo
                  </h4>
                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-rose-200 uppercase leading-relaxed">
                        Multas de 5% + TR sobre atrasos fiscais. Imposto de Renda fixado em 15%. 
                     </p>
                     {round === 2 && (
                        <div className="p-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-tighter">
                           ALERTA: Compra de Máquinas Bloqueada neste Período.
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* SEÇÃO 2: TABELA DE FORNECEDORES (Empirion Fidelity) */}
         <div className="pt-16 border-t border-white/10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                     <Boxes size={24} className="text-blue-500" /> Tabela de Fornecedores & Logística
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preços válidos para o Ciclo Atual (P0{round})</p>
               </div>
               <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[9px] font-black uppercase">
                  Sincronizado via Empirion Engine
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
               <PriceCard label="Matéria-Prima A" val={`$ ${macro.providerPrices.mpA.toFixed(2)}`} desc="+2.0% Reajuste" icon={<Boxes />} />
               <PriceCard label="Matéria-Prima B" val={`$ ${macro.providerPrices.mpB.toFixed(2)}`} desc="+2.0% Reajuste" icon={<Boxes />} />
               <PriceCard label="Distribuição / Un." val={`$ ${macro.distributionCostUnit.toFixed(2)}`} desc="+3.0% Reajuste" icon={<Globe />} />
               <PriceCard label="Marketing (Base)" val={`$ ${macro.marketingExpenseBase.toLocaleString()}`} desc="+2.0% Reajuste" icon={<TrendingUp />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <PriceCard label="Máquina ALFA" val={`$ ${macro.machineryValues.alfa.toLocaleString()}`} desc="Cap: 1000/ciclo" icon={<Cpu />} color="blue" />
               <PriceCard label="Máquina BETA" val={`$ ${macro.machineryValues.beta.toLocaleString()}`} desc="Cap: 3000/ciclo" icon={<Cpu />} color="blue" />
               <PriceCard label="Máquina GAMA" val={`$ ${macro.machineryValues.gama.toLocaleString()}`} desc="Cap: 6000/ciclo" icon={<Cpu />} color="blue" />
            </div>
         </div>
      </main>

      {/* FOOTER DO JORNAL */}
      <footer className="p-8 bg-slate-950 border-t border-white/5 text-center">
         <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.6em] italic">
            EMPIRION STREET INDUSTRIAL • TODOS OS DIREITOS RESERVADOS • TRANSMISSÃO CRIPTOGRAFADA ORACLE NODE 08
         </p>
      </footer>
    </motion.div>
  );
};

const IndexRow = ({ label, val, trend, positive }: any) => (
  <div className="flex justify-between items-center group">
     <div className="space-y-1">
        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{label}</span>
        <span className="text-xl font-black text-white font-mono tracking-tighter">{val}</span>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {trend}
     </div>
  </div>
);

const PriceCard = ({ label, val, desc, icon, color }: any) => (
  <div className={`p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 hover:bg-white/5 transition-all group border-l-2 ${color === 'blue' ? 'hover:border-blue-500' : 'hover:border-orange-500'}`}>
     <div className={`p-3 rounded-xl w-fit ${color === 'blue' ? 'bg-blue-600/20 text-blue-500' : 'bg-orange-600/20 text-orange-500'} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 18 })}
     </div>
     <div>
        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-black text-white font-mono tracking-tighter italic">{val}</span>
        <span className="block text-[8px] font-bold text-slate-600 uppercase mt-1 tracking-widest">{desc}</span>
     </div>
  </div>
);

export default GazetteViewer;
