import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Loader2, Database, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const OracleHealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'issue'>('checking');
  const [details, setDetails] = useState<string>('Auditando nodos de dados...');

  const performAudit = async () => {
    setStatus('checking');
    try {
      // Verifica se a tabela teams tem a coluna kpis
      const { data, error } = await supabase.from('teams').select('kpis').limit(1);
      
      if (error) {
        if (error.code === '42703') {
          setStatus('issue');
          setDetails('Coluna "kpis" ausente na tabela teams. Execute o script v12.8.2 GOLD.');
        } else {
          throw error;
        }
      } else {
        setStatus('healthy');
        setDetails('Sincronização Atômica v12.8.2 Validada.');
      }
    } catch (e: any) {
      setStatus('issue');
      setDetails(`Erro de Conexão: ${e.message}`);
    }
  };

  useEffect(() => {
    performAudit();
  }, []);

  return (
    <div className={`p-8 rounded-[3rem] border transition-all duration-700 flex items-center justify-between ${
      status === 'healthy' ? 'bg-emerald-500/5 border-emerald-500/20' : 
      status === 'issue' ? 'bg-rose-500/10 border-rose-500/30' : 
      'bg-slate-900 border-white/5'
    }`}>
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
          status === 'healthy' ? 'bg-emerald-500 text-white' : 
          status === 'issue' ? 'bg-rose-600 text-white animate-pulse' : 
          'bg-white/5 text-slate-500'
        }`}>
          {status === 'checking' ? <Loader2 className="animate-spin" /> : 
           status === 'healthy' ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
        </div>
        <div>
           <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Oracle Health Audit</span>
           <h4 className={`text-xl font-black uppercase italic ${status === 'issue' ? 'text-rose-500' : 'text-white'}`}>
             {status === 'checking' ? 'Analisando Nodos...' : 
              status === 'healthy' ? 'Sincronização OK' : 'Falha Detectada'}
           </h4>
           <p className="text-xs font-bold text-slate-400 mt-1">{details}</p>
        </div>
      </div>
      
      {status !== 'checking' && (
        <button 
          onClick={performAudit}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all border border-white/5"
        >
          Re-Audit Core
        </button>
      )}
    </div>
  );
};

export default OracleHealthCheck;