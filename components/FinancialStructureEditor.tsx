import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, ListTree, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Target, Info, GripVertical
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (nodes: AccountNode[]) => void;
}

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState<'dre' | 'balance'>('dre');
  
  const [nodes, setNodes] = useState<AccountNode[]>([
    {
      id: 'root-revenue',
      label: 'RECEITA BRUTA',
      value: 1000000,
      type: 'credit',
      children: [
        { id: 'rev-domestic', label: 'Vendas Mercado Interno', value: 800000, type: 'credit', isEditable: true },
        { id: 'rev-export', label: 'Vendas Exportação', value: 200000, type: 'credit', isEditable: true },
      ]
    },
    {
      id: 'root-costs',
      label: 'CUSTOS OPERACIONAIS',
      value: 500000,
      type: 'debit',
      children: [
        { id: 'cost-raw', label: 'Matéria Prima', value: 300000, type: 'debit', isEditable: true },
        { id: 'cost-labor', label: 'Mão de Obra Direta', value: 200000, type: 'debit', isEditable: true },
      ]
    }
  ]);

  const calculateTotals = useCallback((list: AccountNode[]): AccountNode[] => {
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotals(node.children);
        const total = updatedChildren.reduce((sum, child) => sum + child.value, 0);
        return { ...node, children: updatedChildren, value: total };
      }
      return node;
    });
  }, []);

  useEffect(() => {
    if (onChange) onChange(nodes);
  }, [nodes, onChange]);

  const addNode = (parentId?: string) => {
    const newNode: AccountNode = { 
      id: Math.random().toString(36).substr(2, 9), 
      label: 'Nova Conta', 
      value: 0, 
      type: activeTab === 'dre' ? 'credit' : 'debit', 
      isEditable: true 
    };
    
    const update = (list: AccountNode[]): AccountNode[] => {
      if (!parentId) return [...list, newNode];
      return list.map(n => {
        if (n.id === parentId) return { ...n, children: [...(n.children || []), newNode] };
        if (n.children) return { ...n, children: update(n.children) };
        return n;
      });
    };
    setNodes(calculateTotals(update(nodes)));
  };

  const deleteNode = (id: string) => {
    const update = (list: AccountNode[]): AccountNode[] => {
      return list.filter(n => n.id !== id).map(n => ({
        ...n,
        children: n.children ? update(n.children) : undefined
      }));
    };
    setNodes(calculateTotals(update(nodes)));
  };

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    const edit = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };
    setNodes(calculateTotals(edit(nodes)));
  };

  const moveNode = (id: string, direction: 'up' | 'down') => {
    const update = (list: AccountNode[]): AccountNode[] => {
      const index = list.findIndex(n => n.id === id);
      if (index !== -1) {
        const newList = [...list];
        if (direction === 'up' && index > 0) {
          [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
        } else if (direction === 'down' && index < newList.length - 1) {
          [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        }
        return newList;
      }
      return list.map(n => n.children ? { ...n, children: update(n.children) } : n);
    };
    setNodes(update(nodes));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200">
          <button 
            onClick={() => setActiveTab('dre')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DRE Blueprint
          </button>
          <button 
            onClick={() => setActiveTab('balance')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Balance Structure
          </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Calculator size={18} className="text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Asset Valuation</span>
            <span className="font-mono font-black text-slate-900 text-xs">$ {nodes.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Layers size={18} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Account Hierarchy Editor</span>
          </div>
          <div className="flex items-center gap-4">
             <Info size={14} className="text-blue-500" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Values auto-sum to parents</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-3">
          {nodes.map((node, index) => (
            <TreeNode 
              key={node.id} 
              node={node} 
              isFirst={index === 0}
              isLast={index === nodes.length - 1}
              onAdd={addNode} 
              onDelete={deleteNode} 
              onUpdate={updateNode} 
              onMove={moveNode}
            />
          ))}
          
          <button 
            onClick={() => addNode()}
            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Plus size={24} />
            <span className="font-black text-[10px] uppercase tracking-widest">Initialize Root Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ 
  node: AccountNode; 
  isFirst: boolean;
  isLast: boolean;
  onAdd: (id: string) => void; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AccountNode>) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  level?: number;
}> = ({ node, onAdd, onDelete, onUpdate, onMove, isFirst, isLast, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = node.children && node.children.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${
        isParent 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'
      }`} style={{ marginLeft: level * 24 }}>
        
        <GripVertical size={16} className="text-slate-200 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`p-1 text-slate-400 hover:text-slate-900 transition-all ${isOpen ? 'rotate-0' : '-rotate-90'} ${!isParent && 'opacity-0 cursor-default'}`}
        >
          <ChevronDown size={18} />
        </button>
        
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <input 
            value={node.label} 
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className={`bg-transparent outline-none font-bold text-sm flex-1 truncate ${isParent ? 'text-slate-900' : 'text-slate-600'}`}
            placeholder="Account Label..."
          />
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <DollarSign size={12} className="text-slate-300" />
            {isParent ? (
              <span className="font-mono font-black text-slate-900 text-xs">{node.value.toLocaleString()}</span>
            ) : (
              <input 
                type="number"
                value={node.value}
                onChange={(e) => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })}
                className="w-24 bg-transparent outline-none font-mono font-bold text-blue-600 text-xs"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onMove(node.id, 'up')} disabled={isFirst} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ArrowUp size={16} /></button>
          <button onClick={() => onMove(node.id, 'down')} disabled={isLast} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ArrowDown size={16} /></button>
          <button onClick={() => onAdd(node.id)} className="p-2 text-slate-400 hover:text-emerald-600"><Plus size={16} /></button>
          <button onClick={() => onDelete(node.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      </div>
      
      {isOpen && isParent && (
        <div className="space-y-2 mt-2">
          {node.children!.map((child, index) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              isFirst={index === 0}
              isLast={index === node.children!.length - 1}
              onAdd={onAdd} 
              onDelete={onDelete} 
              onUpdate={onUpdate} 
              onMove={onMove}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialStructureEditor;
