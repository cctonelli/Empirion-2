import React from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { ShieldAlert, Megaphone, Users, TrendingDown, ArrowRight, X } from 'lucide-react';
import { CreditRating } from '../types';

interface InsolvencyAlertProps {
  rating: CreditRating;
  isOpen: boolean;
  onClose: () => void;
}

export const InsolvencyAlert: React.FC<InsolvencyAlertProps> = ({ rating, isOpen, onClose }) => {
  if ((rating !== 'C' && rating !== 'D') || !isOpen) return null;

  const isCritical = rating === 'D';

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border-2 border-rose-500/50 rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(244,63,94,0.3)]"
      >
        <div className={`p-10 ${isCritical ? 'bg-rose-600' : 'bg-orange-500'} text-white flex items-center gap-8`}>
          <div className="bg-white/20 p-5 rounded-[2rem] shadow-inner">
            <ShieldAlert size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              {isCritical ? 'Falência Técnica' : 'Risco de Insolvência'}
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] mt-2 opacity-80 italic">
              Oracle Alert Standing: {rating}
            </p>
          </div>
        </div>

        <div className="p-12 space-y-10">
          <p className="text-slate-300 text-xl font-medium leading-relaxed italic">
            "Sua estrutura de capital está colapsando. O lucro não é suficiente para cobrir a depreciação e o serviço da dívida. Ajuste sua rota imediatamente."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StrategyCard icon={<Megaphone className="text-orange-500" />} title="Reduzir Marketing" desc="Corte 40% das verbas de propaganda para preservar o caixa." />
            <StrategyCard icon={<Users className="text-blue-500" />} title="Ajustar Staff" desc="Demitir pessoal ocioso é vital para a sobrevivência do nodo." />
            <StrategyCard icon={<TrendingDown className="text-rose-500" />} title="Preço de Liquidação" desc="Baixe o preço para escoar estoque e gerar liquidez imediata." />
            <StrategyCard icon={<ArrowRight className="text-emerald-500" />} title="Pausar CAPEX" desc="Cancele a compra de máquinas até o Rating retornar a 'A'." />
          </div>

          <button 
            onClick={onClose}
            className="w-full py-8 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-rose-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
          >
            Entendido, vou revisar minhas decisões
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StrategyCard = ({ icon, title, desc }: any) => (
  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl space-y-2 hover:bg-white/10 transition-colors group">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
      <span className="font-black uppercase text-[10px] text-white tracking-widest">{title}</span>
    </div>
    <p className="text-[11px] text-slate-500 leading-tight font-bold italic">{desc}</p>
  </div>
);