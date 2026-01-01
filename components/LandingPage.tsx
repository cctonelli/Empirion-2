
import React from 'react';
import { 
  ArrowRight, Zap, Clock, Newspaper, BarChart3, Shield, 
  Globe, Brain, Users, Map, LogIn, ChevronRight, Sparkles, 
  TrendingUp, Leaf, Star, CheckCircle2, Factory, ShoppingCart, 
  Briefcase, Tractor, DollarSign, Hammer, Target, Trophy, Info
} from 'lucide-react';
import { LANDING_PAGE_DATA } from '../constants';

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { 
    hero, 
    menuItems, 
    features, 
    branchesOverview, 
    branchesDetailData, 
    iaFeatures, 
    community, 
    roadmap 
  } = LANDING_PAGE_DATA;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-[100] flex items-center justify-between px-8 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-xl font-black tracking-tight uppercase text-slate-900">EMPIRION</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => scrollToSection(item.id)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogin}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <LogIn size={14} /> Entrar / Registrar
        </button>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-40 pb-24 px-8 md:px-24 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-emerald-400/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 space-y-8 max-w-4xl">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full animate-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Kernel v5.5 GOLD Released</span>
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase animate-in slide-in-from-bottom-8 duration-700 delay-100">
              {hero.title}
           </h1>
           
           <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-200">
              {hero.subtitle}
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in slide-in-from-bottom-8 duration-700 delay-300">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:scale-105 transition-all shadow-2xl shadow-blue-200 flex items-center gap-4"
              >
                {hero.cta} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('branches')}
                className="w-full sm:w-auto px-10 py-6 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-4"
              >
                Setores Suportados
              </button>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 md:px-24 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Core Engine</h2>
             <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Funcionalidades de Elite</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={f.id} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group hover:-translate-y-2">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {getIcon(f.icon)}
                 </div>
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{f.title}</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Grid Section */}
      <section id="branches" className="py-24 px-8 md:px-24 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
              <div className="space-y-4">
                 <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Versatility</h2>
                 <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Setores Suportados</h3>
              </div>
              <p className="text-slate-500 font-medium max-w-md mx-auto md:mx-0">Clique em um setor para explorar os detalhes técnicos de cada módulo de simulação.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branchesOverview.map((b) => (
                <div 
                  key={b.id} 
                  onClick={() => scrollToSection(`detail-${b.slug}`)}
                  className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden relative"
                >
                   <div className={`w-16 h-16 ${b.bg} ${b.color} rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                      {getBranchIcon(b.icon)}
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">{b.name}</h4>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{b.description}</p>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                      {b.cta} <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Detailed Explanatory Sections */}
      <div className="space-y-12 pb-24">
        {Object.entries(branchesDetailData).map(([slug, data]) => (
          <section key={slug} id={`detail-${slug}`} className="py-24 px-8 md:px-24 odd:bg-white even:bg-slate-50 relative scroll-mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className={`px-4 py-1.5 rounded-full ${getBranchColor(slug)} bg-opacity-10 text-[10px] font-black uppercase tracking-widest w-fit inline-block`}>
                    Módulo de Simulação {data.title.split(' ')[2]}
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    {data.title}
                  </h3>
                  <p className="text-xl text-slate-500 font-medium italic">
                    {data.subtitle}
                  </p>
                </div>

                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {data.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Core Features
                      </h5>
                      <ul className="space-y-3">
                         {data.features.map((f, idx) => (
                           <li key={idx} className="text-sm font-bold text-slate-700 leading-snug flex items-start gap-3">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                             {f}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Target size={16} className="text-rose-500" /> KPIs de Gestão
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {data.kpis.map((k, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-600">
                            {k}
                          </span>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-slate-100">
                         <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Exemplo de Template</h5>
                         <p className="text-xs font-medium text-slate-500">{data.templateExample}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="relative group">
                 <div className="absolute -inset-4 bg-slate-200 rounded-[4rem] group-hover:rotate-3 transition-transform duration-500 opacity-20"></div>
                 <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-6">
                       <div className={`p-8 rounded-[3rem] ${getBranchColor(slug)} bg-opacity-5 mx-auto w-fit`}>
                          {getBranchIconLarge(slug)}
                       </div>
                       <button 
                         onClick={onLogin}
                         className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 mx-auto"
                       >
                         Lançar Arena {slug.toUpperCase()} <Trophy size={16} />
                       </button>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <BarChart3 size={150} />
                    </div>
                 </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* IA Section */}
      <section id="ia" className="py-24 px-8 md:px-24 bg-slate-900 text-white relative overflow-hidden rounded-[4rem] mx-4 md:mx-12 my-12">
        <Brain className="absolute top-0 right-0 p-20 text-blue-500/10 pointer-events-none" size={600} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
           <div className="space-y-10">
              <div className="space-y-4">
                 <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Intelligence</h2>
                 <h3 className="text-5xl font-black uppercase tracking-tight leading-none">{iaFeatures.title}</h3>
                 <p className="text-slate-400 text-lg font-medium">{iaFeatures.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {iaFeatures.items.map((item, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <h5 className="font-black uppercase tracking-widest text-xs text-white">{item.title}</h5>
                     </div>
                     <p className="text-slate-500 text-xs font-medium ml-7">{item.desc}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[4rem] space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Zap size={24} />
                 </div>
                 <span className="font-black uppercase tracking-[0.2em] text-[10px]">Real-time Decision Logic</span>
              </div>
              <div className="space-y-6">
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
                 </div>
                 <p className="text-[10px] font-mono text-blue-300 opacity-60">
                    // strategos-kernel process-data<br/>
                    [AI] Analyzing market elasticity in Region 04...<br/>
                    [AI] Recommended Price Point: $ 342.15<br/>
                    [AI] ROI Projection: +12.4% next period
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 px-8 md:px-24">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Network</h2>
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{community.title}</h3>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">{community.description}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {community.stats.map((s, i) => (
                <div key={i} className="text-center p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                   <span className="text-5xl font-black text-slate-900 tracking-tighter mb-2 block">{s.val}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 px-8 md:px-24 bg-slate-900 text-white rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="flex items-center gap-6">
              <Map size={32} className="text-blue-400" />
              <h3 className="text-4xl font-black uppercase tracking-tighter">Protocol Roadmap</h3>
           </div>

           <div className="relative">
              <div className="absolute top-0 left-8 md:left-1/2 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block"></div>
              
              <div className="space-y-12">
                 {roadmap.map((r, i) => (
                   <div key={i} className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="md:w-1/2 space-y-2 px-12">
                         <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{r.version}</div>
                         <h4 className="text-xl font-bold">{r.item}</h4>
                      </div>
                      <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-slate-900 -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      <div className="md:w-1/2"></div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-12 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
           <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-xl font-black tracking-tight uppercase text-white">EMPIRION</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm font-medium">A mais avançada plataforma de simulação empresarial do mercado, integrando IA de alta performance e colaboração em tempo real.</p>
           </div>
           <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Navigation</h5>
              <div className="flex flex-col gap-3">
                 {menuItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-left">{item.label}</button>)}
              </div>
           </div>
           <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Security</h5>
              <div className="flex flex-col gap-3">
                 <span className="text-xs font-bold text-slate-400">Privacy Protocol</span>
                 <span className="text-xs font-bold text-slate-400">Terms of Engagement</span>
                 <span className="text-xs font-bold text-slate-400">Fidelity Assurance</span>
              </div>
           </div>
        </div>
        <div className="text-center pt-8 border-t border-white/5">
           <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">
              © 2025 EMPIRION SYSTEMS INC. | SIAGRO/SIND FIDELITY PROTOCOL
           </p>
        </div>
      </footer>
    </div>
  );
};

const getIcon = (name: string) => {
  switch(name) {
    case 'Clock': return <Clock size={28} />;
    case 'Newspaper': return <Newspaper size={28} />;
    case 'BarChart3': return <BarChart3 size={28} />;
    case 'Shield': return <Shield size={28} />;
    default: return <Zap size={28} />;
  }
};

const getBranchIcon = (name: string) => {
  switch(name) {
    case 'Factory': return <Factory size={28} />;
    case 'ShoppingCart': return <ShoppingCart size={28} />;
    case 'Briefcase': return <Briefcase size={28} />;
    case 'Tractor': return <Tractor size={28} />;
    case 'DollarSign': return <DollarSign size={28} />;
    case 'Hammer': return <Hammer size={28} />;
    default: return <Shield size={28} />;
  }
};

const getBranchIconLarge = (slug: string) => {
  switch(slug) {
    case 'industrial': return <Factory size={64} className="text-blue-600" />;
    case 'commercial': return <ShoppingCart size={64} className="text-emerald-600" />;
    case 'services': return <Briefcase size={64} className="text-indigo-600" />;
    case 'agribusiness': return <Tractor size={64} className="text-amber-600" />;
    case 'finance': return <DollarSign size={64} className="text-rose-600" />;
    case 'construction': return <Hammer size={64} className="text-orange-600" />;
    default: return <Target size={64} className="text-slate-600" />;
  }
};

const getBranchColor = (slug: string) => {
  switch(slug) {
    case 'industrial': return 'text-blue-600';
    case 'commercial': return 'text-emerald-600';
    case 'services': return 'text-indigo-600';
    case 'agribusiness': return 'text-amber-600';
    case 'finance': return 'text-rose-600';
    case 'construction': return 'text-orange-600';
    default: return 'text-slate-600';
  }
};

export default LandingPage;
