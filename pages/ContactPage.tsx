
import React, { useState } from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { 
  Mail, MessageSquare, Send, Globe, ShieldCheck, 
  Zap, Terminal, Radio, ShieldAlert, Cpu, 
  ArrowRight, Phone, MapPin, Loader2, CheckCircle2
} from 'lucide-react';
import EmpireParticles from '../components/EmpireParticles';

const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'transmitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('transmitting');
    setTimeout(() => setStatus('success'), 2500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-24">
        
        {/* HEADER - TACTICAL LINK */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-blue-500/20">
                    <Radio size={14} className="animate-pulse" /> Signal Established
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] drop-shadow-2xl">
                       Tactical <br/>
                       <span className="text-blue-500">Link</span>
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-400 font-medium italic leading-relaxed">
                       "Abra um canal direto com o Strategos Command para parcerias, suporte técnico ou acesso elite."
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ContactDetail icon={<Mail />} label="Sinal Primário" value="command@empirion.ia" />
                    <ContactDetail icon={<Globe />} label="Arena Global" value="São Paulo, BR" />
                    <ContactDetail icon={<Phone />} label="Comunicação" value="+55 (11) 4004-EMP" />
                    <ContactDetail icon={<MapPin />} label="Node Local" value="Strategic Hub 08" />
                 </div>
              </motion.div>
           </div>

           {/* TERMINAL FORM */}
           <div className="relative group">
              <div className="absolute -inset-10 bg-blue-600/10 blur-[120px] rounded-full animate-pulse z-0" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950/80 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] space-y-10 relative z-10 overflow-hidden border-t-blue-500/40 border-t-2"
              >
                 <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 italic">
                          <Terminal size={24} className="text-blue-500" /> Transmit Signal
                       </h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Protocolo de Criptografia: AES-256 GCM</p>
                    </div>
                    <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-red-500/20" />
                       <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                       <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                 </div>

                 <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div 
                         key="success"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="py-20 text-center space-y-6"
                      >
                         <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="text-3xl font-black text-white uppercase tracking-tight italic">Transmissão Concluída</h4>
                         <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">Seu sinal foi recebido pelo Command Node. Aguarde resposta.</p>
                         <button onClick={() => setStatus('idle')} className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] hover:text-white transition-colors">Novo Envio</button>
                      </motion.div>
                    ) : (
                      <motion.form 
                         key="form"
                         onSubmit={handleSubmit} 
                         className="space-y-6"
                         exit={{ opacity: 0, scale: 0.95 }}
                      >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input required type="text" placeholder="Nome / Identidade" className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600" />
                            <input required type="email" placeholder="E-mail de Operador" className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600" />
                         </div>
                         <div className="relative">
                            <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-black text-white outline-none appearance-none cursor-pointer focus:border-blue-500 transition-all text-xs uppercase tracking-widest">
                               <option className="bg-slate-900">Assunto: Suporte Técnico</option>
                               <option className="bg-slate-900">Assunto: Arena Corporativa</option>
                               <option className="bg-slate-900">Assunto: Parceria Estratégica</option>
                            </select>
                         </div>
                         <textarea required placeholder="Sua Mensagem Estratégica..." rows={5} className="w-full p-10 bg-white/5 border border-white/10 rounded-[2.5rem] font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all resize-none placeholder:text-slate-600 shadow-inner"></textarea>
                         <button 
                           disabled={status === 'transmitting'}
                           className="w-full py-8 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-slate-950 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center gap-6 active:scale-95 disabled:opacity-50"
                         >
                            {status === 'transmitting' ? (
                               <><Loader2 className="animate-spin" size={20} /> Transmitindo Sinal...</>
                            ) : (
                               <><Send size={20} /> Enviar Sinal para o Nodo</>
                            )}
                         </button>
                      </motion.form>
                    )}
                 </AnimatePresence>
                 
                 <div className="pt-6 flex justify-between items-center opacity-40">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sincronização Ativa</span>
                    </div>
                    <ShieldCheck size={16} className="text-emerald-500" />
                 </div>
              </motion.div>
           </div>
        </section>
      </div>
    </div>
  );
};

const ContactDetail = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-6 p-8 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 group hover:bg-white/[0.08] transition-all hover:-translate-y-1">
     <div className="p-4 bg-white/5 text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">{icon}</div>
     <div>
        <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-slate-400">{label}</span>
        <span className="text-lg font-bold text-white tracking-tight">{value}</span>
     </div>
  </div>
);

export default ContactPage;
