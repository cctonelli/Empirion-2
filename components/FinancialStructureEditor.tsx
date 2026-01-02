
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, Info, GripVertical, CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
}

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance, initialDRE }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(initialBalance || []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(initialDRE || []);

  const calculateTotals = useCallback((list: AccountNode[]): AccountNode[] => {
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotals(node.children);
        const total = updatedChildren.reduce((sum, child) => {
          // No DRE, se for despesa subtraímos, se for receita somamos
          if (activeTab === 'dre') {
            return child.type === 'expense' ? sum - child.value : sum + child.value;
          }
          return sum + child.value;
        }, 0);
        return { ...node, children: updatedChildren, value: total };
      }
      return node;
    });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'balance') setBalanceNodes(prev => calculateTotals(prev));
    else setDRENodes(prev => calculateTotals(prev));
  }, [activeTab, calculateTotals]);

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    const edit = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };

    if (activeTab === 'balance') {
      const updated = calculateTotals(edit(balanceNodes));
      setBalanceNodes(updated);
      onChange?.({ balance_sheet: updated, dre: dreNodes });
    } else {
      const updated = calculateTotals(edit(dreNodes));
      setDRENodes(updated);
      onChange?.({ balance_sheet: balanceNodes, dre: updated });
    }
  };

  const addSubNode = (parentId: string) => {
    const add = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === parentId) {
          const newId = `${n.id}.${(n.children?.length || 0) + 1}`;
          const newNode: AccountNode = {
            id: newId,
            label: 'Nova Conta',
            value: 0,
            type: activeTab === 'balance' ? n.type : (parentId.includes('exp') ? 'expense' : 'revenue'),
            isEditable: true
          };
          return { ...n, children: [...(n.children || []), newNode] };
        }
        if (n.children) return { ...n, children: add(n.children) };
        return n;
      });
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotals(add(balanceNodes)));
    else setDRENodes(calculateTotals(add(dreNodes)));
  };

  const removeNode = (id: string) => {
    const remove = (list: AccountNode[]): AccountNode[] => {
      return list.filter(n => n.id !== id).map(n => ({
        ...n,
        children: n.children ? remove(n.children) : undefined
      }));
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotals(remove(balanceNodes)));
    else setDRENodes(calculateTotals(remove(dreNodes)));
  };

  const nodes = activeTab === 'balance' ? balanceNodes : dreNodes;
  const assets = balanceNodes.find(n => n.label.includes('ATIVO'))?.value || 0;
  const liabPL = balanceNodes.find(n => n.label.includes('PASSIVO'))?.value || 0;
  const isBalanced = Math.abs(assets - liabPL) < 0.01;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl w-fit border border-white/10">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Balance Structure
          </button>
          <button 
            onClick={() => setActiveTab('dre')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            DRE Config
          </button>
        </div>
        
        <div className="flex gap-4">
           <StatusBox label="Valuation Inicial" val={assets} color="blue" />
           {activeTab === 'balance' && (
             <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {isBalanced ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
                <span className="text-[10px] font-black uppercase tracking-tighter italic">
                  {isBalanced ? 'Equilíbrio OK' : `Desvio: $ ${(assets - liabPL).toLocaleString()}`}
                </span>
             </div>
           )}
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-10 space-y-3">
          {nodes.map((node) => (
            <TreeNode 
              key={node.id} 
              node={node} 
              onUpdate={updateNode} 
              onAdd={addSubNode} 
              onRemove={removeNode}
            />
          ))}
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
  const isParent = node.children && node.children.length > 0;
  const canAdd = !node.isReadOnly && (node.type === 'totalizer');
  const canDelete = node.isEditable;

  return (
    <div className="space-y-2">
      <div className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${isParent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-orange-100 shadow-sm'}`} style={{ marginLeft: level * 32 }}>
        <button onClick={() => setIsOpen(!isOpen)} className={`p-1 text-slate-400 ${!isParent && 'opacity-0'} transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}><ChevronDown size={18}/></button>
        <div className="flex-1 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3 flex-1">
              <input 
                readOnly={node.isReadOnly || !node.isEditable}
                className={`bg-transparent outline-none font-black text-sm flex-1 ${isParent ? 'text-slate-900 uppercase italic' : 'text-slate-600'}`} 
                value={node.label} 
                onChange={e => onUpdate(node.id, { label: e.target.value })} 
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                <span className="text-slate-300 text-[10px]">$</span>
                {isParent ? (
                  <span className="font-mono font-black text-slate-950 text-xs">{(node.value || 0).toLocaleString()}</span>
                ) : (
                  <input 
                    type="number" 
                    className="w-24 bg-transparent outline-none font-mono font-bold text-orange-600 text-xs" 
                    value={node.value} 
                    onChange={e => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })} 
                  />
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {canAdd && <button onClick={() => onAdd(node.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Plus size={14}/></button>}
                 {canDelete && <button onClick={() => onRemove(node.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>}
              </div>
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
  <div className={`p-4 rounded-2xl border shadow-sm min-w-[160px] ${color === 'blue' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
     <span className="block text-[8px] font-black uppercase opacity-60 tracking-widest mb-1">{label}</span>
     <span className="text-xl font-black italic">$ {val.toLocaleString()}</span>
  </div>
);

export default FinancialStructureEditor;
