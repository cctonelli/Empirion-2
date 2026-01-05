
import React from 'react';
import { ShieldCheck, Award, TrendingUp, Landmark, FileText, ChevronRight } from 'lucide-react';

interface FinalReportProps {
  championship: any;
  rankings: any[];
}

export const FinalAuditReport: React.FC<FinalReportProps> = ({ championship, rankings }) => {
  return (
    <div className="bg-white text-slate-900 p-16 font-sans min-h-screen border-[20px] border-slate-950 shadow-2xl print:m-0 print:border-0">
      <header className="flex justify-between items-end border-b-4 border-slate-950 pb-10 mb-16">
        <div>
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic">E</div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic">Audit <span className="text-orange-600">Outcome</span></h1>
           </div>
           <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Empirion Oracle System • Certificação de Gestão v12.8</p>
        </div>
        <div className="text-right space-y-1">
           <p className="font-black text-sm uppercase">Arena: {championship.name}</p>
           <p className="text-[10px] text-slate-400 font-mono">NODE_UID: {championship.id}</p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-12 mb-20">
         <ReportKPI label="Rounds Processados" val={championship.total_rounds} icon={<FileText size={20}/>} />
         <ReportKPI label="Setor Dominante" val={championship.branch.toUpperCase()} icon={<Landmark size={20}/>} />
         <ReportKPI label="Média de Rating" val="AAA" icon={<Award size={20}/>} />
      </section>

      <table className="w-full mb-20 text-left">
        <thead className="border-b-2 border-slate-900">
           <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="py-6">Ranking</th>
              <th className="py-6">Unidade Strategos</th>
              <th className="py-6 text-center">Rating Final</th>
              <th className="py-6 text-center">Patrimônio Líquido</th>
              <th className="py-6 text-right">Status Auditado</th>
           </tr>
        </thead>
        <tbody>
           {rankings.map((team, idx) => (
             <tr key={team.id} className="border-b border-slate-100 group">
                <td className="py-8 font-mono font-bold text-slate-300">#0{idx + 1}</td>
                <td className="py-8">
                   <span className="text-2xl font-black uppercase tracking-tight italic">{team.name}</span>
                </td>
                <td className="py-8 text-center">
                   <span className={`px-5 py-2 rounded-xl font-black text-sm border-2 ${team.rating === 'AAA' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      {team.rating}
                   </span>
                </td>
                <td className="py-8 text-center font-mono font-bold text-lg">
                   $ {team.equity.toLocaleString()}
                </td>
                <td className="py-8 text-right">
                   {team.rating === 'AAA' ? (
                     <span className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                        <ShieldCheck size={14}/> Certified Strategos
                     </span>
                   ) : (
                     <span className="text-[10px] font-bold uppercase text-slate-300 italic">Auditado v12.8</span>
                   )}
                </td>
             </tr>
           ))}
        </tbody>
      </table>

      <footer className="mt-auto grid grid-cols-2 gap-24 pt-20 border-t border-slate-100 opacity-60">
         <div className="space-y-4">
            <p className="text-[9px] font-bold uppercase text-slate-500 leading-relaxed">
               Este documento atesta a capacidade gerencial das unidades acima sob os protocolos do motor Empirion Oracle, validando competências em alocação de CAPEX, gestão de fluxos de caixa e resposta a eventos de mercado.
            </p>
         </div>
         <div className="text-center space-y-4 border-t-2 border-slate-950 pt-6">
            <p className="font-black uppercase tracking-[0.2em] text-xs">Oráculo Strategos • Auditor Central</p>
            <p className="text-[8px] font-mono font-black text-slate-400">SIGNATURE_PROTO_SHA256_V12.8_GOLD</p>
         </div>
      </footer>
    </div>
  );
};

const ReportKPI = ({ label, val, icon }: any) => (
  <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] space-y-4 flex flex-col items-center text-center shadow-sm">
     <div className="p-4 bg-white rounded-2xl shadow-md text-slate-900">{icon}</div>
     <div>
        <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">{val}</span>
     </div>
  </div>
);
