
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { 
  BrainCircuit, Scale, Globe, Factory, Zap, Users, 
  ShieldCheck, BarChart3, Award, Trophy, Eye, 
  Terminal, Rocket, ChevronRight, Activity, Cpu, 
  Layers, Workflow, Sparkles, Box, Shield,
  Network, Radio, MousePointer2, Check, X,
  ShoppingCart, Tractor, DollarSign, Hammer, Landmark,
  ShieldAlert, Building2, Server,
  // Added missing Settings and Bird imports
  Settings, Bird
} from 'lucide-react';
import { APP_VERSION } from '../constants';
import EmpireParticles from '../components/EmpireParticles';

const FeaturesPage: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative bg-[#F1F5F9] text-slate-900 font-sans overflow-x-hidden selection:bg-orange-500/30">
      
      {/* BACKGROUND IMAGE OVERLAY - LOCAL PATH */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <img 
            src="/images/background/neural-overlay-bg.jpg" 
            className="w-full h-full object-cover grayscale brightness-50" 
            alt="Neural Network Background" 
            onError={(e: any) => {
               // Fallback silencioso se a imagem ainda não existir
               e.target.style.display = 'none';
            }}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-[#F1F5F9] via-transparent to-[#F1F5F9]" />
      </div>

      <div className="container mx-auto px-4 md:px-10 relative z-10 pt-32 pb-24">
        
        {/* HEADER PRINCIPAL (Fiel à imagem) */}
        <header className="text-center mb-20 space-y-4">
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Empirion: A Nova Era da <span className="text-orange-600">Simulação Empresarial com IA</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-600 font-medium max-w-4xl mx-auto leading-relaxed">
              O Empirion é um ecossistema de simulação multiplayer onde equipes gerenciam impérios empresariais em cenários econômicos dinâmicos.
           </p>
        </header>

        {/* LAYOUT DO INFOGRÁFICO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* COLUNA ESQUERDA: DIFERENCIAIS TECNOLÓGICOS */}
           <div className="lg:col-span-3 space-y-12 pt-10">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-4 border-orange-500 w-fit pb-2 mb-10 italic">
                 Diferenciais Tecnológicos e IA
              </h2>
              
              <FeatureBlock 
                id="gemini"
                title="Orquestração via Gemini 3 Pro"
                desc="IA fornece raciocínio profundo sobre balanços e mentoria tática para as equipes."
                icon={<BrainCircuit size={32} />}
                color="blue"
                align="right"
                onHover={setHoveredNode}
              />

              <FeatureBlock 
                id="contabil"
                title="Fidelidade Contábil de 100%"
                desc="Integração real entre Balanço, DRE e Fluxo de Caixa com regime de competência."
                icon={<Scale size={32} />}
                color="emerald"
                align="right"
                onHover={setHoveredNode}
              />

              <FeatureBlock 
                id="rls"
                title="Segurança de Dados RLS"
                desc="O protocolo Row Level Security garante isolamento total de dados entre arenas competitivas."
                icon={<ShieldCheck size={32} />}
                color="orange"
                align="right"
                onHover={setHoveredNode}
              />
           </div>

           {/* COLUNA CENTRAL: ECOSSISTEMA E TABELA */}
           <div className="lg:col-span-6 flex flex-col items-center">
              
              {/* ILUSTRAÇÃO CENTRAL ESTILIZADA (SIMULANDO A CIDADE IA) */}
              <div className="relative w-full aspect-square max-w-[500px] mb-10 flex items-center justify-center">
                 {/* Conexões SVG Dinâmicas */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 500 500">
                    <defs>
                       <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                       </linearGradient>
                       <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                       </linearGradient>
                    </defs>
                    {/* Linhas de Fluxo Estilo Pipeline */}
                    <motion.path d="M 50 150 L 200 250" stroke="url(#gradBlue)" strokeWidth="4" fill="none" strokeDasharray="10,5" animate={{ strokeDashoffset: [0, -50] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M 50 300 L 200 250" stroke="url(#gradBlue)" strokeWidth="4" fill="none" strokeDasharray="10,5" animate={{ strokeDashoffset: [0, -50] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M 450 150 L 300 250" stroke="url(#gradOrange)" strokeWidth="4" fill="none" strokeDasharray="10,5" animate={{ strokeDashoffset: [0, 50] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M 450 300 L 300 250" stroke="url(#gradOrange)" strokeWidth="4" fill="none" strokeDasharray="10,5" animate={{ strokeDashoffset: [0, 50] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
                 </svg>

                 {/* O NÚCLEO (Representação Visual do Ecossistema) */}
                 <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-3xl animate-pulse" />
                    <div className="bg-white p-1 rounded-full shadow-2xl border-4 border-slate-100 relative">
                       <div className="bg-gradient-to-tr from-slate-100 to-white rounded-full p-12 flex items-center justify-center shadow-inner">
                          <div className="relative">
                             <Server size={120} className="text-slate-300" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_#f97316]">AI</div>
                          </div>
                       </div>
                    </div>

                    {/* Rótulos Flutuantes ao Redor do Núcleo */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-white px-5 py-2 rounded-xl shadow-lg border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-800">Ecossistema de Simulação Multiplayer</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 bg-white px-5 py-2 rounded-xl shadow-lg border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-800">Cenários Econômicos Dinâmicos</div>
                 </div>
              </div>

              {/* TABELA COMPARATIVA (Fiel à imagem) */}
              <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mt-10">
                 <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-6">
                    <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       Comparativo Rápido de Recursos
                    </div>
                    <div className="col-span-4 flex justify-center">
                       <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg shadow-blue-200 italic">
                          <Check size={14} /> Empirion
                       </div>
                    </div>
                    <div className="col-span-4 flex justify-center">
                       <div className="flex items-center gap-2 bg-slate-200 text-slate-500 px-6 py-2 rounded-full font-black text-[10px] uppercase italic">
                          <X size={14} /> Simuladores Tradicionais
                       </div>
                    </div>
                 </div>

                 <div className="divide-y divide-slate-50">
                    <ComparisonRow label="Inteligência Artificial" empirion="Gemini 3 Integrada" trad="Manual ou Inexistente" icon={<BrainCircuit size={16}/>} />
                    <ComparisonRow label="Fidelidade Contábil" empirion="100% (Real)" trad="Simplificada / Estática" icon={<Scale size={16}/>} />
                    <ComparisonRow label="Colaboração" empirion="Realtime Multiplayer" trad="Processamento em Lotes" icon={<Users size={16}/>} />
                 </div>
              </div>

              {/* RODAPÉ DO CENTRO: CONCORRENTES */}
              <div className="mt-12 flex items-center justify-between w-full max-w-lg opacity-40">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Concorrentes</span>
                 <div className="flex gap-4">
                    <Cpu size={24} />
                    {/* Fixed missing Settings icon error */}
                    <Settings size={24} />
                 </div>
              </div>
           </div>

           {/* COLUNA DIREITA: VERSATILIDADE E MERCADO */}
           <div className="lg:col-span-3 space-y-12 pt-10">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-4 border-blue-500 w-fit pb-2 mb-10 italic">
                 Versatilidade e Mercado
              </h2>

              <FeatureBlock 
                id="multi"
                title="Simulador Multisetorial"
                desc="Cenários específicos para Indústria, Varejo, Agronegócio, Mercado Financeiro e Construção Civil."
                icon={
                  <div className="grid grid-cols-2 gap-1 scale-[0.6]">
                    <Factory size={24}/> <ShoppingCart size={24}/> <Tractor size={24}/> <Hammer size={24}/>
                  </div>
                }
                color="orange"
                align="left"
                onHover={setHoveredNode}
              />

              <FeatureBlock 
                id="geo"
                title="Expansão Geopolítica de 15+ Regiões"
                desc="Suporte multi-moeda com taxas de câmbio dinâmicas e demanda oscilante de até 56%."
                icon={<Globe size={32} />}
                color="blue"
                align="left"
                onHover={setHoveredNode}
              />

              <FeatureBlock 
                id="concurrence"
                title="Vantagem Sobre Concorrentes"
                desc="Supera simuladores como Capsim e BSG ao incluir IA preditiva e eventos Black Swan."
                icon={
                  <div className="relative">
                    {/* Fixed missing Bird icon error */}
                    <Bird size={32} className="text-slate-800" />
                    <div className="absolute -top-1 -right-1"><Zap size={14} className="text-orange-500 fill-current" /></div>
                  </div>
                }
                color="slate"
                align="left"
                onHover={setHoveredNode}
              />
           </div>

        </div>

        {/* CTA FINAL (FORA DO INFOGRÁFICO MAS ESSENCIAL PARA UX) */}
        <section className="mt-32 p-16 bg-slate-900 rounded-[4rem] text-center space-y-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform"><Trophy size={400} className="text-white"/></div>
           <div className="space-y-4 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Assuma o Comando do Seu Império</h2>
              <p className="text-xl text-slate-400 font-medium italic">Valide sua senioridade estratégica agora na arena mais avançada do planeta.</p>
           </div>
           <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link to="/auth" className="px-16 py-7 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:bg-white hover:text-slate-950 transition-all active:scale-95 flex items-center justify-center gap-4 group">
                 Iniciar Batalha <Rocket size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/solutions/simulators" className="px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all backdrop-blur-xl">
                 Ver Soluções
              </Link>
           </div>
        </section>

      </div>

      <footer className="py-12 border-t border-slate-200 text-center opacity-40">
         <p className="text-[9px] font-black uppercase tracking-[0.8em] text-slate-500 italic">EMPIRION ECOSYSTEM • COPYRIGHT 2026</p>
      </footer>
    </div>
  );
};

/* COMPONENTE DE BLOCO DE FUNCIONALIDADE (Fiel ao estilo da imagem) */
const FeatureBlock = ({ id, title, desc, icon, color, align, onHover }: any) => {
  const isRight = align === 'right';
  const accentClass = color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : color === 'orange' ? 'bg-orange-600' : 'bg-slate-800';
  const shadowClass = color === 'blue' ? 'shadow-blue-200' : color === 'emerald' ? 'shadow-emerald-200' : color === 'orange' ? 'shadow-orange-200' : 'shadow-slate-200';

  return (
    <motion.div 
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-8 ${isRight ? 'flex-row' : 'flex-row-reverse'} group`}
    >
       <div className={`shrink-0 w-24 h-24 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white ${accentClass} ${shadowClass} transition-transform duration-500 group-hover:scale-110`}>
          {icon}
       </div>
       <div className={isRight ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-orange-600 transition-colors">
             {title}
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed opacity-80 italic">
             {desc}
          </p>
       </div>
    </motion.div>
  );
};

/* LINHA DA TABELA COMPARATIVA */
const ComparisonRow = ({ label, empirion, trad, icon }: any) => (
  <div className="grid grid-cols-12 p-6 hover:bg-slate-50/50 transition-colors">
     <div className="col-span-4 flex items-center gap-4">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">{icon}</div>
        <span className="text-xs font-black text-slate-700 uppercase italic">{label}</span>
     </div>
     <div className="col-span-4 flex justify-center items-center">
        <div className="flex items-center gap-3 text-blue-600">
           <div className="p-1 bg-blue-100 rounded-full"><Check size={12}/></div>
           <span className="text-sm font-black italic">{empirion}</span>
        </div>
     </div>
     <div className="col-span-4 flex justify-center items-center opacity-60">
        <div className="flex items-center gap-3 text-slate-500">
           <div className="p-1 bg-slate-200 rounded-full"><X size={12}/></div>
           <span className="text-xs font-bold uppercase italic">{trad}</span>
        </div>
     </div>
  </div>
);

export default FeaturesPage;
