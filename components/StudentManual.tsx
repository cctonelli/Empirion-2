
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, Target, Megaphone, Users, Landmark, 
  ArrowRight, ShieldCheck, Zap, TrendingDown, BookOpen 
} from 'lucide-react';

export const StudentManual: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-20 pb-32 animate-in fade-in duration-1000">
      <header className="text-center space-y-8">
        <div className="inline-flex p-6 bg-slate-900 border border-orange-500/30 text-orange-500 rounded-[2.5rem] shadow-2xl">
          <BookOpen size={48} />
        </div>
        <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
          Guia de Comando <br/> <span className="text-orange-500">Oracle v12.8</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium italic max-w-3xl mx-auto">
          "O lucro é vaidade, o caixa é realidade, mas o Rating é a sua sobrevivência. Entenda as alavancas do seu império."
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <ManualSection 
          icon={<Factory />} 
          title="Módulo 1: Produção e CAPEX"
          desc="Gerencie sua infraestrutura. Máquinas aumentam capacidade, mas geram depreciação de 5% ao round."
          points={[
            { t: "Matéria-Prima", d: "Sem estoque, sua fábrica para. Excesso de estoque mata sua liquidez." },
            { t: "Nível de Atividade", d: "Operar em 100% exige manutenção alta. Em 20%, o custo fixo por unidade explode." }
          ]}
        />
        <ManualSection 
          icon={<Target />} 
          title="Módulo 2: Estratégia Comercial"
          desc="Converta produtos em valor real. O equilíbrio entre preço e marketing define sua fatia de mercado."
          points={[
            { t: "Elasticidade-Preço", d: "Preços altos geram margem mas afastam clientes. Preços baixos exigem escala massiva." },
            { t: "Prazo de Recebimento", d: "Vender a prazo atrai demanda, mas cria um 'buraco' no caixa imediato (Contas a Receber)." }
          ]}
        />
        <ManualSection 
          icon={<Landmark />} 
          title="Módulo 3: Gestão de Solvência"
          desc="O coração do Oracle v12.8. Seu Rating (AAA a D) dita o custo do seu capital."
          points={[
            { t: "Spread de Risco", d: "Ratings baixos (C/D) atraem juros de até 15% ao período. Saia da dívida rapidamente." },
            { t: "Patrimônio Líquido", d: "Se o seu lucro for menor que a depreciação das máquinas, sua empresa está morrendo por dentro." }
          ]}
        />
      </div>

      <footer className="bg-orange-600 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
         <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-black uppercase italic tracking-tight">Pronto para a Rodada?</h3>
            <p className="text-orange-100 font-bold uppercase text-[10px] tracking-widest">Recomenda-se manter o Rating acima de 'B' para estabilidade.</p>
         </div>
         <button className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all">
            Acessar Minha Unidade
         </button>
      </footer>
    </div>
  );
};

const ManualSection = ({ icon, title, desc, points }: any) => (
  <motion.div whileHover={{ x: 10 }} className="bg-slate-900/50 border border-white/5 p-12 rounded-[3.5rem] space-y-8 shadow-xl transition-all">
    <div className="flex items-center gap-6">
      <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-lg">{icon}</div>
      <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">{title}</h3>
    </div>
    <p className="text-lg text-slate-400 font-medium italic border-l-2 border-orange-500 pl-6">{desc}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {points.map((p: any, i: number) => (
        <div key={i} className="space-y-2">
          <h4 className="text-orange-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Zap size={14} /> {p.t}
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed font-bold">{p.d}</p>
        </div>
      ))}
    </div>
  </motion.div>
);
