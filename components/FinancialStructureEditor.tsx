import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, Calculator, 
  CheckCircle2, AlertTriangle, Boxes, X, Delete
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
}

const formatInt = (val: number): string => {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(abs);
  return val < 0 ? `-${formatted}` : formatted;
};

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance = [], initialDRE = [] }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(Array.isArray(initialBalance) ? initialBalance : []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(Array.isArray(initialDRE) ? initialDRE : []);

  const calculateTotalsRecursive = useCallback((list: AccountNode[], tabType: 'balance' | 'dre'): AccountNode[] => {
    if (!Array.isArray(list)) return [];
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotalsRecursive(node.children, tabType);
        const total = updatedChildren.reduce((sum, child) => {
          if (tabType === 'dre') {
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
    else setDRENodes(prev => calculateTotalsRecursive(prev, 'dre'));
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
      onChange?.({ balance_sheet: updated, dre: dreNodes });
    } else {
      const edited = edit(dreNodes);
      const updated = calculateTotalsRecursive(edited, 'dre');
      setDRENodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: updated });
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
            type: activeTab === 'balance' ? n.type : (parentId.includes('exp') ? 'expense' : 'revenue'),
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
    else setDRENodes(calculateTotalsRecursive(add(dreNodes), 'dre'));
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
    else setDRENodes(calculateTotalsRecursive(remove(dreNodes), 'dre'));
  };

  const nodes = activeTab === 'balance' ? balanceNodes : dreNodes;
  const assetsNode = Array.isArray(balanceNodes) ? balanceNodes.find(n => n.id === 'assets' || n.label.includes('ATIVO')) : null;
  const assets = assetsNode?.value || 0;
  const liabPLNode = Array.isArray(balanceNodes) ? balanceNodes.find(n => n.id === 'liabilities' || n.label.includes('PASSIVO')) : null;
  const liabPL = liabPLNode?.value || 0;
  const isBalanced = Math.abs(assets - liabPL) < 1; 

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Balanço Patrimonial
          </button>
          <button 
            onClick={() => setActiveTab('dre')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            DRE Tático
          </button>
        </div>
        
        <div className="flex gap-4">
           <StatusBox label="Ativo Total" val={assets} color="orange" />
           {activeTab === 'balance' && (
             <div className={`px-6 rounded-2xl border flex items-center gap-3 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                {isBalanced ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
                <span className="text-[10px] font-black uppercase italic tracking-widest">
                  {isBalanced ? 'Audit Passed' : `Deviation: $ ${formatInt(assets - liabPL)}`}
                </span>
             </div>
           )}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-6">
        <div className="space-y-3 min-w-[800px]">
          {Array.isArray(nodes) && nodes.length > 0 ? nodes.map((node) => (
            <TreeNode 
              key={node.id} 
              node={node} 
              onUpdate={updateNode} 
              onAdd={addSubNode} 
              onRemove={removeNode}
            />
          )) : (
            <div className="py-32 text-center bg-slate-900/40 rounded-[3rem] border border-dashed border-white/5 text-slate-500 uppercase font-black text-xs tracking-[0.4em]">
              Waiting for Oracle Master Node Initialization...
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
}> = ({ node, onUpdate, onAdd, onRemove, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = Array.isArray(node.children) && node.children.length > 0;
  const canAdd = !node.isReadOnly && (node.type === 'totalizer');
  const canDelete = node.isEditable && !node.isTemplateAccount; 
  const isNegative = node.value < 0;

  return (
    <div className="space-y-2">
      <div className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${isParent ? 'bg-slate-900 border-white/10' : 'bg-white/5 border-white/5 hover:border-orange-500/30'}`} style={{ marginLeft: level * 32 }}>
        <button onClick={() => setIsOpen(!isOpen)} className={`p-1.5 text-slate-600 ${!isParent && 'opacity-0'} transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}><ChevronDown size={16}/></button>
        <div className="flex-1 flex items-center justify-between gap-6">
           <input 
             readOnly={node.isReadOnly || !node.isEditable}
             className={`bg-transparent outline-none font-black text-sm flex-1 ${isParent ? 'text-orange-500 uppercase italic' : 'text-slate-300'}`} 
             value={node.label} 
             onChange={e => onUpdate(node.id, { label: e.target.value })} 
           />
           <div className={`flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner`}>
             <span className={`text-[10px] font-black ${isNegative ? 'text-rose-500' : 'text-slate-600'}`}>{isNegative ? '(-)' : '$'}</span>
             {isParent ? (
               <span className={`font-mono font-black text-sm ${isNegative ? 'text-rose-400' : 'text-white'}`}>{formatInt(node.value)}</span>
             ) : (
               <input 
                 type="text" 
                 className={`w-32 bg-transparent outline-none font-mono font-bold text-sm ${isNegative ? 'text-rose-400' : 'text-white'}`} 
                 value={formatInt(node.value)} 
                 onChange={e => {
                   const raw = e.target.value.replace(/[^-0-9]/g, '');
                   onUpdate(node.id, { value: parseInt(raw) || 0 });
                 }} 
               />
             )}
           </div>
           
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {canAdd && <button onClick={() => onAdd(node.id)} className="p-2 text-blue-400 hover:bg-white/10 rounded-xl transition-all"><Plus size={16}/></button>}
              {canDelete && <button onClick={() => onRemove(node.id)} className="p-2 text-rose-500 hover:bg-white/10 rounded-xl transition-all"><Trash2 size={16}/></button>}
           </div>
        </div>
      </div>
      {isOpen && isParent && (
        <div className="space-y-2">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBox = ({ label, val, color }: any) => (
  <div className={`p-4 px-8 rounded-2xl border shadow-xl ${color === 'orange' ? 'bg-orange-600 text-white border-orange-500' : 'bg-blue-600 text-white border-blue-500'}`}>
     <span className="block text-[8px] font-black uppercase opacity-80 tracking-[0.25em] mb-1">{label}</span>
     <span className="text-xl font-black font-mono italic leading-none">$ {formatInt(val)}</span>
  </div>
);

export default FinancialStructureEditor;