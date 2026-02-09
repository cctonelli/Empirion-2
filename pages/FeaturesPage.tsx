
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  BrainCircuit, Scale, Globe, Factory, Zap, Users, 
  ShieldCheck, BarChart3, Award, Trophy, Eye, 
  Terminal, Rocket, ChevronRight, Activity, Cpu, 
  Layers, Workflow, Sparkles, Box, Shield
} from 'lucide-react';
import { APP_VERSION } from '../constants';
import EmpireParticles from '../components/EmpireParticles';

// Mapeamento de cores para garantir a fidelidade do Tailwind v3 JIT
const colorMap: Record<string, { border: string, bg: string, text: string, shadow: string, glow: string }> = {
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-600/20', text: 'text-purple-400', shadow: 'shadow-purple-500/10', glow: 'group-hover:shadow-purple-500/30' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-600/20', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10', glow: 'group-hover:shadow-emerald-500/30' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-600/20', text: 'text-orange-400', shadow: 'shadow-orange-500/10', glow: 'group-hover:shadow-orange-500/30' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-600/20', text: 'text-amber-400', shadow: 'shadow-amber-500/10', glow: 'group-hover:shadow-amber-500/30' },
  red: { border: 'border-red-500/30', bg: 'bg-red-600/20', text: 'text-red-400', shadow: 'shadow-red-500/10', glow: 'group-hover:shadow-red-500/30' },
  blue: { border: 'border-blue-500/30', bg: 'bg-blue-600/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10', glow: 'group-hover:shadow-blue-500/30' },
  indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-600/20', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10', glow: 'group-hover:shadow-indigo-500/30' },
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-600/20', text: 'text-cyan-400', shadow: 'shadow-cyan-500/10', glow: 'group-hover:shadow-cyan-500/30' },
  yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-600/20', text: 'text-yellow-400', shadow: 'shadow-yellow-500/10', glow: 'group-hover:shadow-yellow-500/30' },
  slate: { border: 'border-slate-500/30', bg: 'bg-slate-600/20', text: 'text-slate-400', shadow: 'shadow-slate-500/10', glow: 'group-hover:shadow-slate-500/30' },
};

const FEATURES_DATA = [
  {
    title: "Orquestração via Gemini 3 Pro",
    description: "IA fornece raciocínio profundo e mentoria tática sobre balanços e estratégias. Análise preditiva, alertas de insolvência e Gazeta IA automática.",
    icon: BrainCircuit,
    link: "/features/ia-gemini",
    color: "purple",
  },
  {
    title: "Fidelidade Contábil 100%",
    description: "Integração real entre Balanço Patrimonial, DRE e Fluxo de Caixa com regime de competência e caixa. Depreciação linear e impairment integrados.",
    icon: Scale,
    link: "/features/contabilidade-real",
    color: "emerald",
  },
  {
    title: "Cenários Econômicos Dinâmicos",
    description: "Até 15 regiões configuráveis com câmbio flutuante (USD/EUR), demanda oscilante ±56% e tarifas alfandegárias parametrizáveis por round.",
    icon: Globe,
    link: "/features/cenarios-macroeconomicos",
    color: "orange",
  },
  {
    title: "Múltiplos Ramos (Multi-Sector)",
    description: "Suporte nativo a Industrial, Comercial, Serviços, Agronegócio, Financeiro e Construção Civil. Cenários customizados para cada ramo.",
    icon: Factory,
    link: "/features/multi-ramos",
    color: "amber",
  },
  {
    title: "Black Swan Events",
    description: "Eventos disruptivos gerados por IA Gemini: crises, booms e oportunidades inesperadas para testar a resiliência estratégica da sua equipe.",
    icon: Zap,
    link: "/features/black-swan",
    color: "red",
  },
  {
    title: "Realtime Colaboração",
    description: "Edição simultânea de decisões por toda a equipe com log auditado. Sincronização instantânea via Supabase Realtime v13.2.",
    icon: Users,
    link: "/features/realtime-colaboracao",
    color: "blue",
  },
  {
    title: "Segurança de Dados RLS",
    description: "Row Level Security garante isolamento total de dados entre arenas. Equipes veem apenas seus dados + relatórios públicos configuráveis.",
    icon: ShieldCheck,
    link: "/features/seguranca-rls",
    color: "indigo",
  },
  {
    title: "Comparativo de Recursos",
    description: "IA integrada e fidelidade contábil real vs. simuladores tradicionais com processamento em lotes e simplificações excessivas.",
    icon: BarChart3,
    link: "/features/comparativo",
    color: "cyan",
  },
  {
    title: "Vantagem Competitiva",
    description: "Supera as limitações de ferramentas legadas ao incluir IA preditiva, eventos aleatórios dinâmicos e expansão geopolítica real.",
    icon: Award,
    link: "/features/vantagem-competitiva",
    color: "orange",
  },
  {
    title: "Gamificação Empire Points",
    description: "Ranking por TSR (Total Shareholder Return). Badges auditados, pontos por indicação e Community Score para engajamento.",
    icon: Trophy,
    link: "/features/gamificacao-ranking",
    color: "yellow",
  },
  {
    title: "Observadores Nominados",
    description: "Tutores nomeiam observadores read-only. Votação comunitária adiciona uma camada de percepção externa às simulações.",
    icon: Eye,
    link: "/features/observadores-community",
    color: "slate",
  },
];

const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-100 font-sans">
      <EmpireParticles />
      
      {/* BACKGROUND EFFECTS - ORANGE CLOUDS */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], rotate: [0, 90, 0] }} transition={{ duration: 30, repeat: Infinity }} className="absolute -top-[10%] -left-[5%] w-[1000px] h-[1000px] bg-orange-600/20 blur-[200px] rounded-full" />
         <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 25, repeat: Infinity, delay: 5 }} className="absolute bottom-[0%] -right-[10%] w-[800px] h-[800px] bg-blue-600/10 blur-[180px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 pt-40 pb-32">
        
        {/* HEADER SECTION */}
        <header className="text-center space-y-10 max-w-5xl mx-auto mb-32">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }} 
             animate={{ opacity: 1, scale: 1 }} 
             className="inline-flex items-center gap-4 px-6 py-2.5 bg-orange-600/10 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 backdrop-blur-xl shadow-2xl"
           >
              <Terminal size={14} className="animate-pulse" /> Core Infrastructure v{APP_VERSION.split('-')[0]}
           </motion.div>
           
           <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl">
                 Nova Era da <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400 pr-2">Simulação IA</span>
              </h1>
              <p className="text-xl md:text-3xl text-slate-400 font-medium italic leading-relaxed max-w-4xl mx-auto opacity-80">
                 "O Empirion transcende planilhas estáticas, entregando um ecossistema vivo orquestrado por modelos de linguagem de larga escala."
              </p>
           </div>
        </header>

        {/* INFOGRAPHIC GRID CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {FEATURES_DATA.map((feature, index) => {
            const styles = colorMap[feature.color] || colorMap.slate;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className={`group relative bg-slate-900/60 backdrop-blur-2xl border ${styles.border} rounded-[3rem] p-10 flex flex-col justify-between h-full transition-all duration-500 shadow-2xl ${styles.shadow} ${styles.glow}`}
              >
                {/* Ícone com Efeito Pulsante no Hover */}
                <div className="space-y-8 relative z-10">
                  <div className={`w-20 h-20 rounded-[1.5rem] ${styles.bg} ${styles.text} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl border border-white/5`}>
                    <feature.icon size={40} strokeWidth={1.5} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl lg:text-3xl font-black uppercase italic text-white leading-tight group-hover:text-orange-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm lg:text-base leading-relaxed font-medium italic opacity-90">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                   <Link 
                     to={feature.link}
                     className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 group/btn"
                   >
                     Explorar Detalhes <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                   </Link>
                   <div className="flex gap-1">
                      <div className={`w-1 h-1 rounded-full ${styles.bg} animate-pulse`} />
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                   </div>
                </div>

                {/* Abstract Background Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none rotate-12 group-hover:scale-125 transition-transform duration-1000">
                   <feature.icon size={200} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FINAL CALL TO ACTION */}
        <section className="mt-48 bg-slate-900/40 border border-white/5 rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/5 to-transparent pointer-events-none" />
           <Sparkles className="absolute top-10 right-10 text-orange-500 opacity-20 animate-pulse" size={64} />
           
           <div className="space-y-4 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Pronto para a Liderança?</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium italic opacity-80">
                Inicie sua jornada no Empirion e valide sua senioridade estratégica em cenários competitivos globais.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
              <Link 
                to="/auth" 
                className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 group active:scale-95 border-4 border-orange-400/50"
              >
                Lançar Primeiro Nodo <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/solutions/simulators" 
                className="px-14 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all backdrop-blur-xl"
              >
                Simuladores Ativos
              </Link>
           </div>
        </section>

      </div>

      <footer className="py-24 border-t border-white/5 text-center bg-[#020617] relative z-20">
         <div className="container mx-auto px-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 italic">FIDELIDADE INDUSTRIAL • CONTABILIDADE REAL • IA ESTRATÉGICA</p>
         </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
