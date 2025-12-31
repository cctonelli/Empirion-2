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
  PlayCircle,
  BarChart3,
  Globe,
  Cpu,
  Trophy,
  Check,
  Bot
} from 'lucide-react';

export const TutorGuide: React.FC = () => (
  <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
    <header className="text-center space-y-6">
      <div className="inline-flex p-4 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200">
        <ShieldCheck size={48} />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Command Master Protocol</h1>
        <p className="text-slate-500 font-medium text-lg">Guia de Orquestração para Administradores e Tutores Empirion.</p>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <GuideCard 
        icon={<Settings className="text-blue-600" />}
        title="Arena Setup"
        description="Defina o DNA da simulação. Escolha entre Industrial, Comercial ou Agro. O Wizard permite configurar o número de regiões e os ativos iniciais de cada empresa."
      />
      <GuideCard 
        icon={<Globe className="text-emerald-600" />}
        title="Macro Variables"
        description="Você controla o ecossistema. Ajuste Inflação, Juros e Demanda Global no Arena Command para simular ciclos econômicos reais ou crises induzidas."
      />
      <GuideCard 
        icon={<Users className="text-amber-600" />}
        title="Community Engagement"
        description="Ative o modo 'Public Arena' para permitir que observadores votem nas estratégias. Isso adiciona uma camada de 'Percepção de Mercado' ao Score final."
      />
    </div>

    <section className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
      <div className="relative z-10 space-y-10">
        <div className="flex items-center gap-4">
          <PlayCircle size={32} className="text-blue-400" />
          <h2 className="text-2xl font-black uppercase tracking-tight">O Fluxo da Rodada (The Cycle)</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Setup", desc: "Tutor abre a rodada e define os parâmetros macro." },
            { step: "02", title: "War Room", desc: "Equipes colaboram e inserem decisões em tempo real." },
            { step: "03", title: "Deadline", desc: "O timer encerra e o sistema congela as submissões." },
            { step: "04", title: "Consolidation", desc: "O engine processa os resultados e gera novos relatórios." }
          ].map((item, i) => (
            <div key={i} className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-4xl font-black text-blue-500/40">{item.step}</span>
              <h4 className="font-bold text-lg uppercase tracking-tight">{item.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
        <Cpu size={300} />
      </div>
    </section>

    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
         <Trophy className="text-amber-500" /> Critérios de Sucesso do Tutor
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ul className="space-y-6">
            <ListItem title="Monitoramento Real-time" desc="Use o Audit Log para identificar equipes inativas ou conflitos internos de decisão." />
            <ListItem title="Ajuste de Estrutura" desc="Personalize as contas do DRE para refletir a complexidade desejada do treinamento." />
          </ul>
          <ul className="space-y-6">
            <ListItem title="Feedback via IA" desc="Incentive o uso do Strategos para que as equipes aprendam conceitos contábeis de forma autônoma." />
            <ListItem title="Privacidade RLS" desc="Garanta que o invite_code seja compartilhado apenas com os participantes autorizados." />
          </ul>
       </div>
    </div>
  </div>
);

export const TeamGuide: React.FC = () => (
  <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
    <header className="text-center space-y-6">
      <div className="inline-flex p-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
        <Zap size={48} />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Strategist Field Manual</h1>
        <p className="text-slate-500 font-medium text-lg">Diretrizes de Operação para Equipes de Elite Empirion.</p>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <GuideCard 
        icon={<Zap className="text-blue-600" />}
        title="War Room"
        description="Você não está sozinho. Cada alteração no formulário de decisões é sincronizada instantaneamente. Coordene com seu time via Audit Log."
      />
      <GuideCard 
        icon={<BarChart3 className="text-emerald-600" />}
        title="Live Projections"
        description="A barra lateral de decisões mostra o impacto imediato das suas escolhas no Lucro Líquido e Margem EBITDA antes mesmo de salvar."
      />
      <GuideCard 
        icon={<Target className="text-amber-600" />}
        title="Intelligence Hub"
        description="Use a Grounded Search para pesquisar tendências reais. Se o preço do café subir no mundo real, isso pode afetar a simulação Agro."
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <FileText className="text-blue-600" /> Análise de Relatórios
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Os relatórios seguem o padrão Bernard de contabilidade gerencial. Foque no **Giro de Estoque** e no **Prazo Médio de Recebimento** para manter o fluxo de caixa saudável.
        </p>
        <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
           <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
              <span>Importância Analítica</span>
              <span>Prioridade</span>
           </div>
           <div className="space-y-2">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[90%]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>DRE & Margem Bruta</span>
                <span>Crítica</span>
              </div>
           </div>
        </div>
      </section>

      <section className="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-200 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <Bot className="text-blue-200" /> Consultoria Strategos
          </h3>
          <p className="text-sm text-blue-50 leading-relaxed italic">
            "Sempre que tiver dúvida sobre um termo como 'WACC' ou 'Depreciação', pergunte ao Strategos no chat global. Ele tem acesso aos manuais contábeis da plataforma."
          </p>
        </div>
        <div className="pt-8 border-t border-white/20 mt-8 flex items-center gap-4">
           <AlertCircle size={20} className="text-blue-200" />
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Dica: Salve suas decisões 5 min antes do deadline.</span>
        </div>
      </section>
    </div>
  </div>
);

const GuideCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 hover:translate-y-[-4px] transition-all">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

const ListItem = ({ title, desc }: { title: string, desc: string }) => (
  <li className="flex gap-4 items-start">
    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-1 shrink-0">
      <Check size={14} />
    </div>
    <div>
      <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{title}</h5>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </li>
);