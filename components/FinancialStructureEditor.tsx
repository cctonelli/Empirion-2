
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, Calculator, CheckCircle2, 
  AlertTriangle, Info, X, DollarSign, Loader2
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
    <div className="space-y-10">
      <div className="flex flex-wrap gap-3 p-2 bg-slate-950 rounded-2xl w-fit border border-white/10 shadow-inner">
        <TabButton active={activeTab === 'balance'} onClick={() => setActiveTab('balance')} label="Balanço Patrimonial" color="orange" />
        <TabButton active={activeTab === 'dre'} onClick={() => setActiveTab('dre')} label="DRE Operacional" color="blue" />
        <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} label="Fluxo de Caixa" color="emerald" />
      </div>

      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
          {nodes.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
               {/* Fixed: Loader2 imported from lucide-react */}
               <Loader2 className="animate-spin" />
               <span className="text-xs font-black uppercase tracking-widest">Sincronizando Estrutura Contábil...</span>
            </div>
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

const TabButton = ({ active, onClick, label, color }: any) => {
  const colorClass = color === 'orange' ? 'bg-orange-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600';
  return (
    <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${active ? `${colorClass} text-white border-transparent shadow-lg scale-105` : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
      {label}
    </button>
  );
};

const TreeNode: React.FC<{ node: AccountNode, onUpdate: any, level?: number, readOnly: boolean, currency: CurrencyType }> = ({ node, onUpdate, level = 0, readOnly, currency }) => {
  const isParent = Array.isArray(node.children) && node.children.length > 0;
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Mantém o input sempre sincronizado com o valor real formatado (sem símbolo para facilitar edição)
    setDisplayValue(formatCurrency(node.value, currency, false));
  }, [node.value, currency]);

  const handleMaskedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || node.isReadOnly) return;
    const raw = e.target.value;
    // Protocolo Oracle: Higieniza apenas dígitos e trata como centavos
    const digits = raw.replace(/\D/g, '');
    const numeric = parseInt(digits || '0') / 100;
    onUpdate(node.id, { value: numeric });
  };

  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${
          isParent ? 'bg-slate-950/80 border-white/10 shadow-md group/parent' : 'bg-white/5 border-white/5 group/child hover:bg-white/10'
        }`}
        style={{ marginLeft: level * 32 }}
      >
        <div className="flex items-center gap-5">
           <div className={`p-2 rounded-lg transition-colors ${isParent ? 'bg-orange-600/20 text-orange-500' : 'bg-slate-800 text-slate-500 group-hover/child:text-white'}`}>
             {isParent ? <ChevronDown size={14} /> : <div className="w-3.5 h-3.5" />}
           </div>
           <span className={`font-black text-xs uppercase tracking-tight ${isParent ? 'text-white' : 'text-slate-400 group-hover/child:text-slate-100'}`}>
             {node.label}
           </span>
        </div>

        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all ${
          (node.isReadOnly || !node.isEditable || readOnly) 
            ? 'bg-slate-900 border-white/5' 
            : 'bg-slate-950 border-white/10 focus-within:border-orange-500/50 shadow-inner'
        }`}>
          <span className="text-[10px] font-black text-slate-600 font-mono">{getCurrencySymbol(currency)}</span>
          {(node.isReadOnly || !node.isEditable || readOnly) ? (
            <span className="font-mono font-black text-sm text-slate-400 min-w-[120px] text-right">
              {formatCurrency(node.value, currency, false)}
            </span>
          ) : (
            <input 
              type="text" 
              className="w-40 bg-transparent outline-none font-mono font-black text-sm text-white text-right placeholder:text-slate-800" 
              value={displayValue} 
              onChange={handleMaskedChange} 
              placeholder="0,00"
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
