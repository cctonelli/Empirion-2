
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Globe, ShieldCheck, Zap } from 'lucide-react';
import EmpireParticles from '../components/EmpireParticles';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <div className="space-y-6">
                 <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Tactical <br/>
                    <span className="text-orange-500">Link</span>
                 </h1>
                 <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">
                    "Abra um canal direto com o Strategos Command para parcerias ou suporte."
                 </p>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white"><Mail /></div>
                    <div>
                       <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Comunicações</span>
                       <span className="text-xl font-bold text-white">command@empirion.ia</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <div className="p-4 bg-orange-600 rounded-2xl text-white"><Globe /></div>
                    <div>
                       <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Arena Global</span>
                       <span className="text-xl font-bold text-white">São Paulo, Brasil</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/80 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 relative overflow-hidden group">
              <Zap className="absolute -bottom-20 -right-20 opacity-5 text-white" size={300} />
              <div className="space-y-2">
                 <h3 className="text-4xl font-black text-white uppercase tracking-tight">Signal Message</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Protocolo de Criptografia Ativo</p>
              </div>

              <form className="space-y-6 relative z-10" onSubmit={e => e.preventDefault()}>
                 <input type="text" placeholder="Nome / Identidade" className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-blue-500 transition-all" />
                 <input type="email" placeholder="E-mail de Retorno" className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-blue-500 transition-all" />
                 <textarea placeholder="Sua Mensagem Estratégica..." rows={5} className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-blue-500 transition-all resize-none"></textarea>
                 <button className="w-full py-6 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-xl flex items-center justify-center gap-4">
                    Enviar Sinal <Send size={18} />
                 </button>
              </form>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
