import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Target, 
  Zap, 
  FileText, 
  TrendingUp, 
  Settings,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

export const TutorGuide: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
    <header className="text-center space-y-4">
      <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
        <ShieldCheck size={32} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Manual do Mestre (Tutor)</h1>
      <p className="text-slate-500 font-medium">Diretrizes para orquestração de ecossistemas e gestão de competidores.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-blue-600">
          <Settings size={20} />
          <h3 className="font-black uppercase text-xs tracking-widest">Configuração Inicial</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Utilize o **Wizard de Campeonato** para definir o setor (Agro, Indústria, etc). O editor de estrutura financeira permite que você mapeie contas contábeis específicas para seu caso de uso.
        </p>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-emerald-600">
          <TrendingUp size={20} />
          <h3 className="font-black uppercase text-xs tracking-widest">Controle Macroeconômico</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          No **Command Center**, você pode ajustar inflação e juros em tempo real. Isso afeta instantaneamente as projeções de todas as equipes, forçando adaptação estratégica.
        </p>
      </section>
    </div>

    <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6">
      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
        <PlayCircle className="text-blue-400" /> Fluxo da Rodada
      </h3>
      <ol className="space-y-4">
        <li className="flex gap-4">
          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
          <p className="text-sm text-slate-300">Monitore o **Audit Log** para garantir que todas as equipes estão ativas na "War Room".</p>
        </li>
        <li className="flex gap-4">
          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
          <p className="text-sm text-slate-300">Ao final do timer, o sistema congela as decisões automaticamente.</p>
        </li>
        <li className="flex gap-4">
          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
          <p className="text-sm text-slate-300">Acompanhe o **Community Score** se o campeonato for público; o voto popular impacta 30% do ranking.</p>
        </li>
      </ol>
    </div>
  </div>
);

export const TeamGuide: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
    <header className="text-center space-y-4">
      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
        <Users size={32} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Manual do Competidor</h1>
      <p className="text-slate-500 font-medium">Guia estratégico para colaboração em tempo real e análise de performance.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-blue-600">
          <Zap size={20} />
          <h3 className="font-black uppercase text-xs tracking-widest">War Room Collaboration</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Toda alteração de preço ou marketing é visível para seus colegas instantaneamente. Use o **Audit Log** para coordenar quem está ajustando cada região.
        </p>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-amber-600">
          <FileText size={20} />
          <h3 className="font-black uppercase text-xs tracking-widest">Análise Contábil</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Consulte o **Relatório Coletivo** para entender seu posicionamento de mercado frente aos concorrentes. O Balanço Patrimonial e DRE seguem o padrão Bernard.
        </p>
      </section>
    </div>

    <div className="bg-blue-600 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-blue-200">
      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
        <Target /> Dicas de Elite
      </h3>
      <ul className="space-y-4">
        <li className="flex items-start gap-4">
          <div className="p-1 bg-white/20 rounded-md mt-1"><AlertCircle size={14} /></div>
          <p className="text-sm text-blue-50">Não ignore o **Strategos Chatbot**. Ele pode explicar termos complexos como EBITDA e sugerir correções de rumo.</p>
        </li>
        <li className="flex items-start gap-4">
          <div className="p-1 bg-white/20 rounded-md mt-1"><AlertCircle size={14} /></div>
          <p className="text-sm text-blue-50">Fique atento ao **Timer**. Decisões não salvas antes do encerramento serão descartadas.</p>
        </li>
        <li className="flex items-start gap-4">
          <div className="p-1 bg-white/20 rounded-md mt-1"><AlertCircle size={14} /></div>
          <p className="text-sm text-blue-50">Use a **Grounded Search** na aba de inteligência para validar tendências reais de mercado (commodities, tecnologia).</p>
        </li>
      </ul>
    </div>
  </div>
);
