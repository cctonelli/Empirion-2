import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, ListTree, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, GRP,
  Target, Info
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
      type: 'credit', 
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

  const indentNode = (id: string, direction: 'in' | 'out') => {
    const findAndManipulate = (list: AccountNode[], parent?: AccountNode): AccountNode[] => {
      const index = list.findIndex(n => n.id === id);
      
      if (index !== -1) {
        const node = list[index];
        if (direction === 'in' && index > 0) {
          // Move as child of previous sibling
          const prevSibling = list[index - 1];
          const newList = list.filter(n => n.id !== id);
          const updatedPrevSibling = {
            ...prevSibling,
            children: [...(prevSibling.children || []), node]
          };
          newList[index - 1] = updatedPrevSibling;
          return newList;
        } else if (direction === 'out' && parent) {
          // This manipulation happens in the parent's mapping
          return list; // Marker for parent to handle
        }
      }

      return list.map(n => {
        if (n.children) {
          const indexInChild = n.children.findIndex(c => c.id === id);
          if (direction === 'out' && indexInChild !== -1) {
            // Found it inside this node's children, move it out to same level as n
            // Handled by parent of n (the recursive caller)
          }
          // Out logic is complex recursively, simplified for MVP:
          return { ...n, children: findAndManipulate(n.children, n) };
        }
        return n;
      });
    };

    // Note: Recursive "outdent" across arbitrary depths is non-trivial in immutable state without flat maps.
    // For MVP, we provide robust Add/Delete/Move/Totalize.
    setNodes(calculateTotals(findAndManipulate(nodes)));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
          <button 
            onClick={() => setActiveTab('dre')}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DRE Structure
          </button>
          <button 
            onClick={() => setActiveTab('balance')}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Balance Sheet
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <Calculator size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Consolidated Valuation</span>
            <span className="font-mono font-black text-slate-900 text-sm">$ {nodes.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-1 rounded-[3rem] border border-slate-100 premium-shadow overflow-hidden">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Blueprint Architect</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hierarchical Account Mapping</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
             <Info size={14} className="text-blue-500" />
             <span className="text-[10px] font-bold text-slate-500 uppercase">Parent accounts sum children automatically</span>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-4">
          <div className="space-y-3">
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
                onIndent={indentNode}
              />
            ))}
            
            <button 
              onClick={() => addNode()}
              className="group w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Plus size={16} />
              </div>
              Define New Root Group
            </button>
          </div>
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
  onIndent: (id: string, direction: 'in' | 'out') => void;
  level?: number;
}> = ({ node, onAdd, onDelete, onUpdate, onMove, onIndent, isFirst, isLast, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = node.children && node.children.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-3xl transition-all border ${
        isParent 
          ? 'bg-slate-50/80 border-slate-200 shadow-sm' 
          : 'bg-white border-slate-100 hover:border-blue-200'
      }`} style={{ marginLeft: level * 24 }}>
        
        <div className="flex items-center gap-3 flex-1 w-full min-w-0">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`p-1.5 text-slate-400 hover:text-slate-900 transition-all ${isOpen ? 'rotate-0' : '-rotate-90'} ${!isParent && 'opacity-0 cursor-default'}`}
          >
            <ChevronDown size={18} />
          </button>
          
          <div className={`p-2 rounded-xl shrink-0 ${isParent ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
            <ListTree size={16} />
          </div>
          
          <input 
            value={node.label} 
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className={`bg-transparent outline-none flex-1 font-extrabold truncate tracking-tight text-sm ${isParent ? 'text-slate-900' : 'text-slate-600'}`}
            placeholder="Account Label"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl flex-1 sm:min-w-[140px] shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <DollarSign size={14} className="text-slate-300" />
            {isParent ? (
              <span className="font-black text-slate-900 font-mono text-xs">{node.value.toLocaleString()}</span>
            ) : (
              <input 
                type="number"
                value={node.value}
                onChange={(e) => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent outline-none font-bold text-blue-600 font-mono text-xs"
              />
            )}
          </div>

          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all bg-white sm:bg-transparent p-1 rounded-xl sm:p-0 border sm:border-0 border-slate-100 shadow-sm sm:shadow-none">
            <button onClick={() => onMove(node.id, 'up')} disabled={isFirst} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ArrowUp size={16} /></button>
            <button onClick={() => onMove(node.id, 'down')} disabled={isLast} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ArrowDown size={16} /></button>
            <button onClick={() => onIndent(node.id, 'in')} className="p-2 text-slate-400 hover:text-blue-600"><ChevronRight size={16} /></button>
            <button onClick={() => onAdd(node.id)} className="p-2 text-slate-400 hover:text-emerald-600" title="Add Child"><Plus size={16} /></button>
            <button onClick={() => onDelete(node.id)} className="p-2 text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
      
      {isOpen && isParent && (
        <div className="space-y-3 mt-3 relative">
          <div className="absolute left-[26px] top-0 bottom-6 w-0.5 bg-slate-100 rounded-full" style={{ marginLeft: level * 24 }}></div>
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
              onIndent={onIndent}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialStructureEditor;
