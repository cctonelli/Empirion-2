
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, Calculator, CheckCircle2, 
  AlertTriangle, Info, X
} from 'lucide-react';
import { AccountNode, CurrencyType } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
  initialCashFlow?: AccountNode[];
  readOnly?: boolean;
  currency?: CurrencyType;
}

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ 
  onChange, 
  initialBalance = [], 
  initialDRE = [], 
  initialCashFlow = [], 
  readOnly = false,
  currency = 'BRL'
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre' | 'cashflow'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(initialBalance);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(initialDRE);
  const [cashFlowNodes, setCashFlowNodes] = useState<AccountNode[]>(initialCashFlow);

  // Sincronizar estado se os props mudarem (essencial para o wizard do Tutor)
  useEffect(() => {
    if (initialBalance?.length) setBalanceNodes(initialBalance);
    if (initialDRE?.length) setDRENodes(initialDRE);
    if (initialCashFlow?.length) setCashFlowNodes(initialCashFlow);
  }, [initialBalance, initialDRE, initialCashFlow]);

  const calculateTotalsRecursive = useCallback((list: AccountNode[], tabType: 'balance' | 'dre' | 'cashflow'): AccountNode[] => {
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

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    if (readOnly) return;
    const edit = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };

    let newBalance = balanceNodes;
    let newDRE = dreNodes;
    let newCashFlow = cashFlowNodes;

    if (activeTab === 'balance') {
      newBalance = calculateTotalsRecursive(edit(balanceNodes), 'balance');
      setBalanceNodes(newBalance);
    } else if (activeTab === 'dre') {
      newDRE = calculateTotalsRecursive(edit(dreNodes), 'dre');
      setDRENodes(newDRE);
    } else {
      newCashFlow = calculateTotalsRecursive(edit(cashFlowNodes), 'cashflow');
      setCashFlowNodes(newCashFlow);
    }
    
    onChange?.({ balance_sheet: newBalance, dre: newDRE, cash_flow: newCashFlow });
  };

  const nodes = activeTab === 'balance' ? balanceNodes : activeTab === 'dre' ? dreNodes : cashFlowNodes;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-[1.5rem] w-fit border border-white/5">
        <button onClick={() => setActiveTab('balance')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Balanço</button>
        <button onClick={() => setActiveTab('dre')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>DRE</button>
        <button onClick={() => setActiveTab('cashflow')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cashflow' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Fluxo</button>
      </div>

      <div className="matrix-container p-4 bg-slate-900/40 rounded-[2rem] border border-white/5">
        <div className="space-y-3 min-w-[800px]">
          {nodes.length === 0 ? (
            <div className="py-10 text-center opacity-20 italic text-sm">Carregando estrutura...</div>
          ) : (
            nodes.map(node => (
              <TreeNode key={node.id} node={node} onUpdate={updateNode} readOnly={readOnly} currency={currency} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ node: AccountNode, onUpdate: any, level?: number, readOnly: boolean, currency: CurrencyType }> = ({ node, onUpdate, level = 0, readOnly, currency }) => {
  const isParent = Array.isArray(node.children) && node.children.length > 0;
  return (
    <div className="space-y-2">
      <div className={`flex items-center justify-between p-4 rounded-2xl border ${isParent ? 'bg-slate-950/80 border-white/10 shadow-md' : 'bg-white/5 border-white/5'}`} style={{ marginLeft: level * 24 }}>
        <div className="flex items-center gap-4">
           {isParent && <ChevronDown size={14} className="text-slate-600" />}
           <span className={`font-black text-xs uppercase tracking-tight ${isParent ? 'text-orange-500' : 'text-slate-300'}`}>{node.label}</span>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-white/5">
          <span className="text-[10px] font-black text-slate-600">{getCurrencySymbol(currency)}</span>
          {(node.isReadOnly || !node.isEditable || readOnly) ? (
            <span className="font-mono font-black text-sm text-white">{formatCurrency(node.value, currency, false)}</span>
          ) : (
            <input 
              type="number" 
              step="0.01"
              className="w-32 bg-transparent outline-none font-mono font-bold text-sm text-white" 
              value={node.value} 
              onChange={e => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })} 
            />
          )}
        </div>
      </div>
      {isParent && node.children?.map(child => (
        <TreeNode key={child.id} node={child} onUpdate={onUpdate} level={level + 1} readOnly={readOnly} currency={currency} />
      ))}
    </div>
  );
};

export default FinancialStructureEditor;
