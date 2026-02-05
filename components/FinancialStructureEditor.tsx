
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
  readOnly?: boolean;
}

const formatMoney = (val: number): string => {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
  return val < 0 ? `-${formatted}` : formatted;
};

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance = [], initialDRE = [], initialCashFlow = [], readOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre' | 'cashflow'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(Array.isArray(initialBalance) ? initialBalance : []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(Array.isArray(initialDRE) ? initialDRE : []);
  const [cashFlowNodes, setCashFlowNodes] = useState<AccountNode[]>(Array.isArray(initialCashFlow) ? initialCashFlow : []);

  const calculateTotalsRecursive = useCallback((list: AccountNode[], tabType: 'balance' | 'dre' | 'cashflow'): AccountNode[] => {
    if (!Array.isArray(list)) return [];
    return list.map(node => {
      if (tabType === 'cashflow' && node.id === 'cf.final') {
        const start = list.find(n => n.id === 'cf.start')?.value || 0;
        const inflow = list.find(n => n.id === 'cf.inflow')?.value || 0;
        const outflow = list.find(n => n.id === 'cf.outflow')?.value || 0;
        return { ...node, value: start + inflow + outflow };
      }
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotalsRecursive(node.children, tabType);
        const total = updatedChildren.reduce((sum, child) => {
          if (tabType === 'dre' || tabType === 'cashflow') return child.type === 'expense' ? sum - Math.abs(child.value) : sum + child.value;
          return sum + child.value;
        }, 0);
        return { ...node, children: updatedChildren, value: total };
      }
      return node;
    });
  }, []);

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    if (readOnly) return;
    const edit = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };
    if (activeTab === 'balance') {
      const updated = calculateTotalsRecursive(edit(balanceNodes), 'balance');
      setBalanceNodes(updated);
      onChange?.({ balance_sheet: updated, dre: dreNodes, cash_flow: cashFlowNodes });
    } else if (activeTab === 'dre') {
      const updated = calculateTotalsRecursive(edit(dreNodes), 'dre');
      setDRENodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: updated, cash_flow: cashFlowNodes });
    } else {
      const updated = calculateTotalsRecursive(edit(cashFlowNodes), 'cashflow');
      setCashFlowNodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: dreNodes, cash_flow: updated });
    }
  };

  const addSubNode = (parentId: string) => {
    if (readOnly) return;
    const add = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.map(n => {
        if (n.id === parentId) {
          const newNode: AccountNode = { id: `${n.id}.${(n.children?.length || 0) + 1}`, label: 'Nova Subconta', value: 0, type: n.type, isEditable: true };
          return { ...n, children: [...(n.children || []), newNode] };
        }
        if (n.children) return { ...n, children: add(n.children) };
        return n;
      });
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotalsRecursive(add(balanceNodes), 'balance'));
  };

  const removeNode = (id: string) => {
    if (readOnly) return;
    const remove = (list: AccountNode[]): AccountNode[] => {
      if (!Array.isArray(list)) return [];
      return list.filter(n => n.id !== id).map(n => ({ ...n, children: n.children ? remove(n.children) : undefined }));
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotalsRecursive(remove(balanceNodes), 'balance'));
  };

  const nodes = activeTab === 'balance' ? balanceNodes : activeTab === 'dre' ? dreNodes : cashFlowNodes;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-[1.75rem] w-fit border border-white/5 shadow-inner">
        <button onClick={() => setActiveTab('balance')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Balanço</button>
        <button onClick={() => setActiveTab('dre')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>DRE</button>
        <button onClick={() => setActiveTab('cashflow')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'cashflow' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Fluxo</button>
      </div>

      <div className="matrix-container p-6">
        <div className="space-y-4 min-w-[900px]">
          {nodes.map(node => <TreeNode key={node.id} node={node} onUpdate={updateNode} onAdd={addSubNode} onRemove={removeNode} readOnly={readOnly} />)}
        </div>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ node: AccountNode, onUpdate: any, onAdd: any, onRemove: any, level?: number, readOnly: boolean }> = ({ node, onUpdate, onAdd, onRemove, level = 0, readOnly }) => {
  const isParent = Array.isArray(node.children) && node.children.length > 0;
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-5 p-4 rounded-2xl border ${isParent ? 'bg-slate-900/80 border-white/10 shadow-lg' : 'bg-white/5 border-white/5'}`} style={{ marginLeft: level * 32 }}>
        <div className="flex-1 flex items-center justify-between gap-10">
           <span className={`font-black text-sm uppercase italic tracking-tight ${isParent ? 'text-orange-500' : 'text-slate-300'}`}>{node.label}</span>
           <div className="flex items-center gap-4 bg-slate-950 px-6 py-2.5 rounded-xl border border-white/5 shadow-inner">
             {(!node.isEditable || readOnly) ? <span className="font-mono font-black text-sm text-white italic">{formatMoney(node.value)}</span> : <input type="number" className="w-36 bg-transparent outline-none font-mono font-bold text-sm text-white" value={node.value} onChange={e => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })} />}
           </div>
        </div>
      </div>
      {isParent && <div className="space-y-3">{node.children!.map(child => <TreeNode key={child.id} node={child} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} level={level + 1} readOnly={readOnly} />)}</div>}
    </div>
  );
};

export default FinancialStructureEditor;
