
import React, { useState, useEffect } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { History, User, Clock, Info, X, Shield, Activity, ChevronRight } from 'lucide-react';
import { getTeamAuditLog, getAllUsers } from '../services/supabase';
import { AuditLog, UserProfile } from '../types';

interface AuditLogViewerProps {
  teamId: string;
  round: number;
  onClose: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ teamId, round, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const [data, allUsers] = await Promise.all([
        getTeamAuditLog(teamId, round),
        getAllUsers()
      ]);
      
      const userMap: Record<string, string> = {};
      allUsers.forEach(u => userMap[u.supabase_user_id] = u.nickname || u.name);
      setUsers(userMap);
      setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [teamId, round]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-3xl w-full bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]"
    >
      <header className="p-8 bg-slate-950 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-600/20">
              <History size={24} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Histórico de Alterações</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Audit Log: Ciclo 0{round}</p>
           </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all">
           <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sincronizando rastro de auditoria...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/5 opacity-40">
             <Info size={40} className="mx-auto mb-4 text-slate-600" />
             <p className="text-xs font-black uppercase text-slate-500">Nenhuma alteração registrada neste ciclo.</p>
          </div>
        ) : (
          <div className="relative pl-8 border-l border-white/5 space-y-8">
            {logs.map((log, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-orange-600 shadow-[0_0_10px_#f97316]" />
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3 group hover:border-orange-500/30 transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-black text-white uppercase italic">{users[log.user_id] || 'Sincronizando...'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                         <Clock size={12} /> {new Date(log.changed_at).toLocaleTimeString()}
                      </div>
                   </div>
                   <div className="flex items-center gap-3 pl-11">
                      <span className="px-2 py-0.5 bg-orange-600/10 text-orange-500 rounded text-[8px] font-black uppercase tracking-widest">{log.field_path}</span>
                      <ChevronRight size={10} className="text-slate-700" />
                      <span className="text-[10px] font-bold text-slate-400 italic truncate max-w-[200px]">Alteração de snapshot estratégica</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60">
         <div className="flex items-center gap-2">
            <Shield size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo Auditado Oracle High Fidelity</span>
         </div>
         <span className="text-[8px] font-mono text-slate-600">SEQ_NODE_8_AUDIT</span>
      </footer>
    </motion.div>
  );
};

export default AuditLogViewer;
