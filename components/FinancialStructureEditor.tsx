
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, Calculator, 
  CheckCircle2, AlertTriangle, Boxes, X, 
  TrendingUp, Landmark, ShieldCheck, Zap, Activity
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
  initialCashFlow?: AccountNode[];
}

const formatInt = (val: number): string => {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(abs);
  return val < 0 ? `-${formatted}` : formatted;
};

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance = [], initialDRE = [], initialCashFlow = [] }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre' | 'cashflow'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(Array.isArray(initialBalance) ? initialBalance : []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(Array.isArray(initialDRE) ? initialDRE : []);
  const [cashFlowNodes, setCashFlowNodes] = useState<AccountNode[]>(Array.isArray(initialCashFlow) ? initialCashFlow : []);

  const calculateTotalsRecursive = useCallback((list: AccountNode[], tabType: 'balance' | 'dre' | 'cashflow'): AccountNode[] => {
    if (!Array.isArray(list)) return [];
    return list.map(node => {
      // Regra especial para Saldo Final de Caixa
      if (tabType === 'cashflow' && node.id === 'cf.final') {
        const start = list.find(n => n.id === 'cf.start')?.value || 0;
        const inflow = list.find(n => n.id === 'cf.inflow')?.value || 0;
        const outflow = list.find(n => n.id === 'cf.outflow')?.value || 0;
        return { ...node, value: start + inflow + outflow };
      }

      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotalsRecursive(node.children, tabType);
        const total = updatedChildren.reduce((sum, child) => {
          if (tabType === 'dre' || tabType === 'cashflow') {
            return child.type === 'expense' ? sum - Math.abs(child.value) : sum + child.value;
          }
          return sum + child.value;
        }, 0);
        return { ...node, children: updatedChildren, value: total };
      }
      return node;
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'balance') setBalanceNodes(prev => calculateTotalsRecursive(prev, 'balance'));
    else if (activeTab === 'dre') setDRENodes(prev => calculateTotalsRecursive(prev, 'dre'));
    else setCashFlowNodes(prev => calculateTotalsRecursive(prev, 'cashflow'));
  }, [activeTab, calculateTotalsRecursive]);

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    const edit = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };

    if (activeTab === 'balance') {
      const edited = edit(balanceNodes);
      const updated = calculateTotalsRecursive(edited, 'balance');
      setBalanceNodes(updated);
      onChange?.({ balance_sheet: updated, dre: dreNodes, cash_flow: cashFlowNodes });
    } else if (activeTab === 'dre') {
      const edited = edit(dreNodes);
      const updated = calculateTotalsRecursive(edited, 'dre');
      setDRENodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: updated, cash_flow: cashFlowNodes });
    } else {
      const edited = edit(cashFlowNodes);
      const updated = calculateTotalsRecursive(edited, 'cashflow');
      setCashFlowNodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: dreNodes, cash_flow: updated });
    }
  };

  const addSubNode = (parentId: string) => {
    const add = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.map(n => {
        if (n.id === parentId) {
          const newId = `${n.id}.${(n.children?.length || 0) + 1}`;
          const newNode: AccountNode = {
            id: newId,
            label: 'Nova Subconta',
            value: 0,
            type: (activeTab === 'dre' || activeTab === 'cashflow') 
              ? (parentId.includes('exp') || parentId.includes('out') ? 'expense' : 'revenue')
              : n.type,
            isEditable: true,
            isTemplateAccount: false 
          };
          return { ...n, children: [...(n.children || []), newNode] };
        }
        if (n.children) return { ...n, children: add(n.children) };
        return n;
      });
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotalsRecursive(add(balanceNodes), 'balance'));
    else if (activeTab === 'dre') setDRENodes(calculateTotalsRecursive(add(dreNodes), 'dre'));
    else setCashFlowNodes(calculateTotalsRecursive(add(cashFlowNodes), 'cashflow'));
  };

  const removeNode = (id: string) => {
    const remove = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.filter(n => n.id !== id).map(n => ({
        ...n,
        children: n.children ? remove(n.children) : undefined
      }));
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotalsRecursive(remove(balanceNodes), 'balance'));
    else if (activeTab === 'dre') setDRENodes(calculateTotalsRecursive(remove(dreNodes), 'dre'));
    else setCashFlowNodes(calculateTotalsRecursive(remove(cashFlowNodes), 'cashflow'));
  };

  const nodes = activeTab === 'balance' ? balanceNodes : activeTab === 'dre' ? dreNodes : cashFlowNodes;
  const assetsNode = Array.isArray(balanceNodes) ? balanceNodes.find(n => n.id === 'assets' || n.label.includes('ATIVO')) : null;
  const assets = assetsNode?.value || 0;
  const liabPLNode = Array.isArray(balanceNodes) ? balanceNodes.find(n => n.id === 'liabilities_pl' || n.label.includes('PASSIVO')) : null;
  const liabPL = liabPLNode?.value || 0;
  const isBalanced = Math.abs(assets - liabPL) < 1; 

  const netProfit = dreNodes.find(n => n.id === 'final_profit')?.value || 0;
  const finalCash = cashFlowNodes.find(n => n.id === 'cf.final')?.value || 0;

  return (
    <div className="space-y-10">
      {/* HEADER LOCAL - TABS E STATUS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-[1.75rem] w-fit border border-white/5 shadow-inner">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'balance' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Landmark size={14} /> Balanço Patrimonial
          </button>
          <button 
            onClick={() => setActiveTab('dre')} 
            className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'dre' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp size={14} /> DRE Tático
          </button>
          <button 
            onClick={() => setActiveTab('cashflow')} 
            className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'cashflow' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Activity size={14} /> Fluxo de Caixa
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
           <StatusBox label="Vulnerabilidade (Ativo)" val={assets} color="orange" />
           <StatusBox label="Resultado Líquido" val={netProfit} color="blue" />
           <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 transition-all duration-700 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}>
              {isBalanced ? <ShieldCheck size={20}/> : <AlertTriangle size={20}/>}
              <span className="text-[9px] font-black uppercase italic tracking-[0.2em]">
                {isBalanced ? 'Audit Balanced' : `Divergência: $ ${formatInt(assets - liabPL)}`}
              </span>
           </div>
        </div>
      </div>

      {/* TREE CONTENT - DENSE VIEW */}
      <div className="matrix-container p-6 md:p-10">
        <div className="space-y-4 min-w-[900px]">
          {Array.isArray(nodes) && nodes.length > 0 ? nodes.map((node) => (
            <TreeNode 
              key={node.id} 
              node={node} 
              onUpdate={updateNode} 
              onAdd={addSubNode} 
              onRemove={removeNode}
              tabType={activeTab}
            />
          )) : (
            <div className="py-32 text-center bg-slate-900/40 rounded-[3.5rem] border border-dashed border-white/5 text-slate-500 uppercase font-black text-[10px] tracking-[0.5em]">
              Sincronizando Módulos Oracle Master...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ 
  node: AccountNode; 
  onUpdate: (id: string, updates: Partial<AccountNode>) => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  level?: number;
  tabType: string;
}> = ({ node, onUpdate, onAdd, onRemove, level = 0, tabType }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = Array.isArray(node.children) && node.children.length > 0;
  const canAdd = !node.isReadOnly && (node.type === 'totalizer');
  const canDelete = node.isEditable && !node.isTemplateAccount; 
  const isNegative = node.value < 0;

  return (
    <div className="space-y-3">
      <div className={`group flex items-center gap-5 p-4 rounded-2xl transition-all border ${isParent ? 'bg-slate-900/80 border-white/10 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20'}`} style={{ marginLeft: level * 32 }}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`p-2 text-slate-600 hover:text-white transition-all ${!isParent && 'opacity-0 pointer-events-none'} ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        >
          <ChevronDown size={18}/>
        </button>
        
        <div className="flex-1 flex items-center justify-between gap-10">
           <div className="flex-1 flex items-center gap-3">
              <input 
                readOnly={node.isReadOnly || !node.isEditable}
                className={`bg-transparent outline-none font-black text-sm flex-1 transition-colors ${isParent ? (tabType === 'dre' ? 'text-blue-400' : tabType === 'cashflow' ? 'text-emerald-400' : 'text-orange-500') + ' uppercase italic tracking-tight' : 'text-slate-300'}`} 
                value={node.label} 
                onChange={e => onUpdate(node.id, { label: e.target.value })} 
              />
              {node.isReadOnly && <ShieldCheck size={12} className="text-slate-700" />}
           </div>

           <div className={`flex items-center gap-4 bg-slate-950 px-6 py-2.5 rounded-xl border border-white/5 shadow-inner transition-all group-hover:border-orange-500/30`}>
             <span className={`text-[10px] font-black ${isNegative ? 'text-rose-500' : 'text-slate-700'}`}>{isNegative ? '(-)' : '$'}</span>
             {(isParent || node.isReadOnly) ? (
               <span className={`font-mono font-black text-sm ${isNegative ? 'text-rose-400' : 'text-white'} italic`}>{formatInt(node.value)}</span>
             ) : (
               <input 
                 type="text" 
                 className={`w-36 bg-transparent outline-none font-mono font-bold text-sm ${isNegative ? 'text-rose-400' : 'text-white'}`} 
                 value={formatInt(node.value)} 
                 onChange={e => {
                   const raw = e.target.value.replace(/[^-0-9]/g, '');
                   onUpdate(node.id, { value: parseInt(raw) || 0 });
                 }} 
               />
             )}
           </div>
           
           <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {canAdd && (
                <button onClick={() => onAdd(node.id)} className="p-2.5 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                  <Plus size={16}/>
                </button>
              )}
              {canDelete && (
                <button onClick={() => onRemove(node.id)} className="p-2.5 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                  <Trash2 size={16}/>
                </button>
              )}
           </div>
        </div>
      </div>

      {isOpen && isParent && (
        <div className="space-y-3 relative">
          <div className="absolute left-[24px] top-0 bottom-0 w-px bg-white/5" />
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} level={level + 1} tabType={tabType} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBox = ({ label, val, color }: any) => (
  <div className={`p-4 px-10 rounded-[2rem] border shadow-2xl transition-all hover:scale-105 ${color === 'orange' ? 'bg-orange-600 text-white border-orange-500 shadow-orange-600/10' : 'bg-blue-600 text-white border-blue-500 shadow-blue-600/10'}`}>
     <span className="block text-[9px] font-black uppercase opacity-70 tracking-[0.4em] mb-1">{label}</span>
     <span className="text-2xl font-black font-mono italic leading-none">$ {formatInt(val)}</span>
  </div>
);

export default FinancialStructureEditor;
