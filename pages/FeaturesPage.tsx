
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { 
  BrainCircuit, Scale, Globe, Factory, Zap, Users, 
  ShieldCheck, BarChart3, Award, Trophy, Eye, 
  Terminal, Rocket, ChevronRight, Activity, Cpu, 
  Layers, Workflow, Sparkles, Box, Shield,
  Network, Radio, MousePointer2
} from 'lucide-react';
import { APP_VERSION } from '../constants';
import EmpireParticles from '../components/EmpireParticles';

interface FeatureNode {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  color: string;
  pos: { x: string, y: string }; // Posição relativa no desktop
  mobileOrder: number;
}

const colorStyles: Record<string, { ring: string, text: string, bg: string, glow: string }> = {
  purple: { ring: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-600/10', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]' },
  emerald: { ring: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-600/10', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]' },
  orange: { ring: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-600/10', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]' },
  amber: { ring: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-600/10', glow: 'shadow-[0_0_30_rgba(245,158,11,0.4)]' },
  red: { ring: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-600/10', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]' },
  blue: { ring: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-600/10', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]' },
  indigo: { ring: 'border-indigo-500/50', text: 'text-indigo-400', bg: 'bg-indigo-600/10', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]' },
  cyan: { ring: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-600/10', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]' },
  yellow: { ring: 'border-yellow-500/50', text: 'text-yellow-400', bg: 'bg-yellow-600/10', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]' },
  slate: { ring: 'border-slate-500/50', text: 'text-slate-400', bg: 'bg-slate-600/10', glow: 'shadow-[0_0_30px_rgba(100,116,139,0.4)]' },
};

const FEATURES: FeatureNode[] = [
  { id: '1', title: "Fidelidade Contábil", description: "Balanço, DRE e Fluxo de Caixa integrados.", icon: Scale, link: "/features/contabilidade-real", color: "emerald", pos: { x: '18%', y: '25%' }, mobileOrder: 1 },
  { id: '2', title: "Expansão Global", description: "Até 15 regiões com câmbio dinâmico.", icon: Globe, link: "/features/cenarios-macroeconomicos", color: "blue", pos: { x: '82%', y: '25%' }, mobileOrder: 2 },
  { id: '3', title: "Multi-ramos", description: "Indústria, Varejo, Agro e muito mais.", icon: Factory, link: "/features/multi-ramos", color: "amber", pos: { x: '12%', y: '50%' }, mobileOrder: 3 },
  { id: '4', title: "Black Swans", description: "Eventos caóticos gerados por IA.", icon: Zap, link: "/features/black-swan", color: "red", pos: { x: '88%', y: '50%' }, mobileOrder: 4 },
  { id: '5', title: "Realtime Sync", description: "Colaboração massiva via Supabase.", icon: Users, link: "/features/realtime-colaboracao", color: "cyan", pos: { x: '18%', y: '75%' }, mobileOrder: 5 },
  { id: '6', title: "Segurança RLS", description: "Isolamento total de dados entre arenas.", icon: ShieldCheck, link: "/features/seguranca-rls", color: "indigo", pos: { x: '82%', y: '75%' }, mobileOrder: 6 },
  { id: '7', title: "Gamificação", description: "Empire Points e Badges auditados.", icon: Trophy, link: "/features/gamificacao-ranking", color: "yellow", pos: { x: '50%', y: '12%' }, mobileOrder: 7 },
  { id: '8', title: "Observadores", description: "Acesso read-only para tutores externos.", icon: Eye, link: "/features/observadores-community", color: "slate", pos: { x: '50%', y: '88%' }, mobileOrder: 8 },
];

const FeaturesPage: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative bg-[#020617] overflow-hidden">
      <EmpireParticles />
      
      {/* BACKGROUND IMAGE OVERLAY */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale brightness-50" 
            alt="Neural Network Background" 
         />
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      {/* ORANGE CLOUDS DYNAMICS */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-[20%] left-[20%] w-[800px] h-[800px] bg-orange-600/20 blur-[200px] rounded-full" />
         <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 25, repeat: Infinity, delay: 5 }} className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-32 pb-20">
        
        {/* HEADER */}
        <header className="text-center mb-20 max-w-4xl mx-auto">
           <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-orange-600/10 border border-orange-500/30 rounded-full text-[9px] font-black uppercase tracking-[0.5em] text-orange-500 mb-6 backdrop-blur-xl"
           >
              <Network size={14} className="animate-pulse" /> Infrastructure Ecosystem v{APP_VERSION.split('-')[0]}
           </motion.div>
           <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-2xl">
              Arquitetura de <span className="text-orange-500">Comando</span>
           </h1>
           <p className="text-slate-400 font-medium italic text-lg md:text-xl mt-4 opacity-80">
              "Um organismo vivo de dados, onde cada conexão neural expande as possibilidades do seu império."
           </p>
        </header>

        {/* INFOGRAPHIC CONTAINER (DESKTOP CONSTELATION) */}
        <div className="relative w-full h-[800px] hidden lg:block">
           
           {/* CONEXÕES SVG */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                 <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                    <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                 </linearGradient>
              </defs>
              {FEATURES.map(f => (
                 <motion.path 
                    key={`line-${f.id}`}
                    d={`M 50% 50% L ${f.pos.x} ${f.pos.y}`}
                    stroke="url(#lineGrad)"
                    strokeWidth={hoveredNode === f.id ? "3" : "1"}
                    strokeDasharray="10,10"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                       pathLength: 1,
                       strokeOpacity: hoveredNode === f.id ? 1 : 0.2,
                       stroke: hoveredNode === f.id ? "#f97316" : "rgba(255,255,255,0.1)"
                    }}
                    transition={{ duration: 1 }}
                 />
              ))}
           </svg>

           {/* NÚCLEO CENTRAL (GEMINI) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group">
              <motion.div 
                 animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: hoveredNode ? "0 0 100px rgba(249,115,22,0.4)" : "0 0 60px rgba(249,115,22,0.2)"
                 }} 
                 transition={{ duration: 3, repeat: Infinity }}
                 className="w-56 h-56 bg-slate-900 border-4 border-orange-600 rounded-[4rem] flex flex-col items-center justify-center text-center p-6 relative"
              >
                 <div className="absolute -inset-4 bg-orange-600/20 blur-3xl rounded-full animate-pulse" />
                 <BrainCircuit size={80} className="text-orange-500 mb-4 group-hover:rotate-12 transition-transform duration-700" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] leading-none">Oracle</span>
                 <h2 className="text-2xl font-black text-orange-500 uppercase italic tracking-tighter">Gemini 3 Pro</h2>
                 
                 {/* Decorative Rings */}
                 <div className="absolute -inset-8 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                 <div className="absolute -inset-16 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              </motion.div>
           </div>

           {/* NODOS SATÉLITES */}
           {FEATURES.map((node) => (
             <motion.div 
               key={node.id}
               style={{ left: node.pos.x, top: node.pos.y }}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: parseInt(node.id) * 0.1 }}
               onMouseEnter={() => setHoveredNode(node.id)}
               onMouseLeave={() => setHoveredNode(null)}
               className="absolute -translate-x-1/2 -translate-y-1/2 z-40"
             >
                <Link to={node.link} className="block relative group">
                   {/* NODE INDICATOR (CIRCLE) */}
                   <div className={`w-16 h-16 rounded-3xl bg-slate-950 border-2 ${colorStyles[node.color].ring} flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-orange-600 group-hover:border-white shadow-2xl relative z-20`}>
                      <node.icon size={28} strokeWidth={2} />
                      {/* Pulsante de Fundo */}
                      <div className={`absolute inset-0 rounded-3xl border-2 ${colorStyles[node.color].ring} animate-ping opacity-0 group-hover:opacity-40`} />
                   </div>

                   {/* TOOLTIP/DETALHES EXPANSÍVEL */}
                   <div className={`absolute left-1/2 -translate-x-1/2 mt-4 w-64 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 z-50`}>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${colorStyles[node.color].text} mb-1`}>Feature Protocol</div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">{node.title}</h4>
                      <p className="text-slate-400 text-xs font-bold leading-relaxed">{node.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-white uppercase bg-orange-600/20 px-3 py-1.5 rounded-full w-fit group/btn">
                         Sincronizar Nodo <ChevronRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                   </div>
                </Link>
             </motion.div>
           ))}
        </div>

        {/* MOBILE LAYOUT (VERTICAL CIRCUIT) */}
        <div className="lg:hidden space-y-10">
           <div className="bg-slate-900 border-2 border-orange-600 p-10 rounded-[3rem] text-center space-y-4 shadow-2xl">
              <BrainCircuit size={56} className="text-orange-500 mx-auto" />
              <h2 className="text-2xl font-black text-white uppercase italic">Núcleo Gemini 3 Pro</h2>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-[0.2em]">O Cérebro da Simulação</p>
           </div>
           <div className="grid grid-cols-1 gap-6">
              {FEATURES.sort((a,b) => a.mobileOrder - b.mobileOrder).map((node) => (
                <Link key={node.id} to={node.link} className="flex items-center gap-6 p-6 bg-slate-900/60 border border-white/5 rounded-[2.5rem] hover:border-orange-500/40 transition-all">
                   <div className={`w-16 h-16 rounded-2xl bg-slate-950 border-2 ${colorStyles[node.color].ring} flex items-center justify-center ${colorStyles[node.color].text} shrink-0`}>
                      <node.icon size={28} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-lg font-black text-white uppercase italic">{node.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{node.description}</p>
                   </div>
                   <ChevronRight size={20} className="ml-auto text-slate-700" />
                </Link>
              ))}
           </div>
        </div>

        {/* FOOTER CALL TO ACTION */}
        <section className="mt-32 relative z-20">
           <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 md:p-20 text-center space-y-12 shadow-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-45 pointer-events-none">
                 <Rocket size={400} />
              </div>
              <div className="space-y-4 relative z-10">
                 <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Pronto para a Implementação?</h2>
                 <p className="text-lg md:text-2xl text-slate-400 font-medium italic opacity-80 max-w-3xl mx-auto">
                    "A inteligência estratégica é o único ativo que não deprecia. Valide sua capacidade de comando agora."
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                 <Link 
                   to="/auth" 
                   className="px-16 py-7 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:scale-110 hover:bg-white hover:text-orange-950 transition-all flex items-center gap-5 group active:scale-95 border-4 border-orange-400/50"
                 >
                   Inicializar Protocolo <Rocket size={22} className="group-hover:translate-x-2 transition-transform" />
                 </Link>
                 <Link 
                   to="/solutions/simulators" 
                   className="px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all backdrop-blur-xl"
                 >
                   Simuladores Ativos
                 </Link>
              </div>
           </div>
        </section>

      </div>

      <footer className="py-20 border-t border-white/5 text-center bg-[#020617] relative z-20">
         <div className="container mx-auto px-8 opacity-40">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 italic">CORE INFRASTRUCTURE • NEURAL MAPPING • EMPIRION 2026</p>
         </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
