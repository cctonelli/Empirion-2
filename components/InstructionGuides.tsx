
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Users, Target, Zap, FileText, TrendingUp, Settings,
  AlertCircle, PlayCircle, BarChart3, Globe, Cpu, Trophy, Check, Bot, ChevronDown,
  Landmark, Coins
} from 'lucide-react';
import { StudentManual } from './StudentManual';

export const TutorGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'credit' | 'rj' | 'valuation' | 'solvency'>('credit');

  return (
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
            <h2 className="text-2xl font-black uppercase tracking-tight">O Fluxo do Round (The Cycle)</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Setup", desc: "Tutor abre o round e define os parâmetros macro." },
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

      {/* Caderno Técnico: Solvência, Crédito e Liquidação (v2026.170) */}
      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
         <div>
           <div className="flex items-center gap-3">
             <Landmark className="text-orange-500" size={32} />
             <h3 className="text-2xl font-black uppercase tracking-tight italic">
               Caderno Técnico do Tutor: <span className="text-orange-500">Manual de Solvência & Crédito</span>
             </h3>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-2">
             Diretrizes de Controle de Risco Contábil e Regras de Negócio do Motor (Padronização IFRS / CPC)
           </p>
         </div>

         {/* Tabs Header */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-white/10 pb-4">
           {[
             { id: 'credit', label: 'Crédito & Compulsório', desc: 'Análise de limites e taxas' },
             { id: 'rj', label: 'Recuperação & Falência', desc: 'Regras de RJ e quebra técnica' },
             { id: 'valuation', label: 'Valuation com Piso', desc: 'Regulação de perpetuidade e ativos' },
             { id: 'solvency', label: 'Tríplice de Solvência', desc: 'E-SDS vs Altman vs Kanitz' }
           ].map(tab => (
             <button
               key={tab.id}
               type="button"
               onClick={() => setActiveTab(tab.id as any)}
               className={`p-4 rounded-2xl text-left transition-all ${activeTab === tab.id ? 'bg-orange-600 shadow-lg text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
             >
               <h4 className="text-xs font-black uppercase tracking-tight">{tab.label}</h4>
               <p className="text-[9px] font-medium opacity-80 mt-1">{tab.desc}</p>
             </button>
           ))}
         </div>

         {/* Tabs Content */}
         <div className="animate-in fade-in duration-300 min-h-[220px]">
           {activeTab === 'credit' && (
             <div className="space-y-6">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-orange-600/20 text-orange-500 rounded-xl shrink-0">
                   <Coins size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2">Liberação Automática e Limites de Crédito</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     No <strong>EMPIRION ORACLE</strong>, as equipes têm liberdade para solicitar empréstimos manuais no menu financeiro de acordo com a sua necessidade (sujeito ao spread do seu Rating corrente).
                     No entanto, caso a empresa projete ou feche um round com <strong>Saldo de Caixa Negativo</strong> (insuficiência de tesouraria), o motor ativa o mecanismo de <strong>Empréstimo Compulsório com ágio e juros</strong> de forma automática.
                   </p>
                 </div>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Taxa Punitiva Total</span>
                   <p className="text-xl font-black mt-1">TR + Ágio + Spread + 5.0%</p>
                   <p className="text-[10px] text-slate-500 mt-1">Somas cumulativas do BDI de mercado, risco de rating e multa penalizadora de emergência financeira.</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Amortização Rígida</span>
                   <p className="text-xl font-black mt-1">Imediata (1 período)</p>
                   <p className="text-[10px] text-slate-500 mt-1">O capital principal e os juros punitivos são deduzidos integralmente no próximo fechamento da equipe.</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Capitulação de Rating</span>
                   <p className="text-xl font-black mt-1">Rebaixamento para "Rating D"</p>
                   <p className="text-[10px] text-slate-500 mt-1">A insolvência e default momentâneos de tesouraria rebaixam de imediato o rating corporativo das equipes.</p>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'rj' && (
             <div className="space-y-6">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-red-600/20 text-red-500 rounded-xl shrink-0">
                   <AlertCircle size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2">Recuperação Judicial (RJ) e Insolvência Severa</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     Quando a solvência ou a liquidez corporativa despencam para patamares críticos (indicados por pontuações negativas persistentes no Kanitz/Altman), as empresas podem ativar a <strong>Recuperação Judicial (RJ)</strong> no menu estratégico. Este é o último refúgio antes da <strong>Falência Técnica</strong>.
                   </p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                   <h5 className="font-black text-xs text-red-400 uppercase tracking-wider">🚫 Restrições Administrativas Rigorosas</h5>
                   <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-bold">
                     <li><strong>Estigma Comercial:</strong> Redução sistemática de <strong>15% na Demanda Global</strong> de todas as regiões de atuação da equipe.</li>
                     <li><strong>Investimento Bloqueado:</strong> CAPEX de Matéria-Prima e Máquinas restrito a <strong>40% do solicitado</strong> pelo comitê.</li>
                     <li><strong>Crédito de Longo Prazo Suspenso:</strong> Bloqueio absoluto do Financiamento BDI para aquisição de novas máquinas.</li>
                   </ul>
                 </div>
                 <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                   <h5 className="font-black text-xs text-emerald-400 uppercase tracking-wider">🛡️ Proteções e Juros em RJ</h5>
                   <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-bold">
                     <li><strong>Escudo Contra Compulsório:</strong> Impede o bloqueio e liquidação de caixa predatória imediata via uso de Empréstimo Compulsório novo.</li>
                     <li><strong>Prêmio de Sobrecusto:</strong> O spread de juros de fornecedores e carências acumuladas aumentam em <strong>1.5x (50% de ágio)</strong> devido ao perigo de crédito.</li>
                     <li><strong>Declaração de Falência:</strong> Caso o patrimônio líquido (`equity`) da empresa permaneça negativo de forma acumulada e o caixa operacional seja nulo consecutivamente, a empresa entra em liquidação insolvente (Falência).</li>
                   </ul>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'valuation' && (
             <div className="space-y-6">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-emerald-600/20 text-emerald-500 rounded-xl shrink-0">
                   <TrendingUp size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2">Avaliação de Mercado DCF com Piso Técnico IFRS</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     A mensuração do valor da empresa (Valuation) adota o Fluxo de Caixa Descontado (DCF) simplificado com base na projeção do EBITDA operacional ajustado capitalizado sob uma taxa WACC de 12%. 
                     Historicamente, empresas com EBITDA operacional nulo ou negativo em ciclos de alta depreciação ficavam com Valuation zerado (0.0M), gerando distorções de análise. 
                   </p>
                 </div>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                 <p className="text-sm text-slate-300 font-medium">
                   Para alinhar com as melhores práticas de auditoria do <strong>CPC / IFRS</strong>, o motor estabelece um <strong>Piso de Ativo Líquido Real Ajustado</strong> de <strong>1.1x do Patrimônio Líquido Acumulado</strong>.
                 </p>
                 <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-orange-400 flex items-center justify-between">
                   <span>Fórmula IFRS:</span>
                   <span>dcfValuation = EBITDA &gt; 0 ? (EBITDA / WACC) : Math.max(1M, (Patrimônio Líquido * 1.1))</span>
                 </div>
                 <p className="text-xs text-slate-500">
                   Dessa forma, mesmo que a empresa invista em P&amp;D e marketing massivo gerando EBITDA neutro na largada, seu Valuation reflete o valor estritamente justo do parque fabril e tesouraria integralizada, eliminando os erráticos valuations nulos.
                 </p>
               </div>
             </div>
           )}

           {activeTab === 'solvency' && (
             <div className="space-y-6">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl shrink-0">
                   <ShieldCheck size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2">Tríplice de Solvência Contábil: Kanitz, Altman e E-SDS</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     O EMPIRION orquestra simultaneamente três índices contábeis para mensurar a saúde corporativa. Cada indicador de risco atende a uma frente analítica e didática complementar.
                   </p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                     <h5 className="font-black text-xs uppercase tracking-wider text-slate-200">Termômetro de Kanitz</h5>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-bold">
                     Índice clássico brasileiro focado em 5 variáveis de balanço (Liquidez Geral, Seca, Corrente, Endividamento e Rentabilidade). Avalia solvência fiscal.
                   </p>
                   <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                     <strong>Fórmula:</strong> Kanitz = 0.05*X1 + 1.65*X2 + ...<br />
                     <strong>Insolvência:</strong> Score nulo/negativo (&lt; 0.0)
                   </div>
                 </div>

                 <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                     <h5 className="font-black text-xs uppercase tracking-wider text-slate-200">Altman Z"-Score</h5>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-bold">
                     Variável adaptada para manufaturas em países emergentes. Focada no risco probabilístico de falência em curtos períodos temporais.
                   </p>
                   <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                     <strong>Escala:</strong> Seguro (&gt; 2.6), Alerta (1.1 a 2.6), Crítico (&lt; 1.1)<br />
                     <strong>Foco:</strong> Risco probabilístico de quebra.
                   </div>
                 </div>

                 <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                     <h5 className="font-black text-xs uppercase tracking-wider text-slate-200">E-SDS (Empirion Score)</h5>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-bold">
                     Algorítimo analítico do Oracle focado na resiliência de rodadas. Ele pondera a consistência operacional, volatilidade de caixa e estresse inflacionário.
                   </p>
                   <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                     <strong>Escala:</strong> 0 a 10 (Zonas Azul, Verde, Amarela, Laranja, Vermelha). Incorpora consistência estratégica em tempo real.
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>
      </div>

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
};

export const TeamGuide: React.FC = () => {
  const [activeManual, setActiveManual] = useState<'pocket' | 'field'>('field');

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      <div className="flex justify-center gap-4">
         <button 
           onClick={() => setActiveManual('field')}
           className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeManual === 'field' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-500'}`}
         >
           Field Manual (Operacional)
         </button>
         <button 
           onClick={() => setActiveManual('pocket')}
           className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeManual === 'pocket' ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/20' : 'bg-slate-100 text-slate-500'}`}
         >
           Manual de Bolso (Estratégico)
         </button>
      </div>

      {activeManual === 'pocket' ? (
        <StudentManual />
      ) : (
        <>
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
                Os relatórios seguem o padrão Empirion de contabilidade gerencial. Foque no **Giro de Estoque** e no **Prazo Médio de Recebimento** para manter o fluxo de caixa saudável.
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
        </>
      )}
    </div>
  );
};

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
