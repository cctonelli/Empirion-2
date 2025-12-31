
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, ListTree, DollarSign, Calculator } from 'lucide-react';

interface AccountNode {
  id: string;
  label: string;
  value: number;
  children?: AccountNode[];
  isEditable?: boolean;
}

const FinancialStructureEditor: React.FC<{ onChange?: (nodes: AccountNode[]) => void }> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState<'dre' | 'balance'>('dre');
  const [nodes, setNodes] = useState<AccountNode[]>([
    {
      id: '1',
      label: 'Gross Revenue',
      value: 1000000,
      children: [
        { id: '1.1', label: 'Domestic Sales', value: 800000, isEditable: true },
        { id: '1.2', label: 'Export Revenue', value: 200000, isEditable: true },
      ]
    },
    {
      id: '2',
      label: 'Operational Costs',
      value: 500000,
      children: [
        { id: '2.1', label: 'Raw Materials', value: 300000, isEditable: true },
        { id: '2.2', label: 'Labor Force', value: 200000, isEditable: true },
      ]
    }
  ]);

  useEffect(() => {
    if (onChange) onChange(nodes);
  }, [nodes]);

  // Recalculate totals whenever nodes change
  const calculateTotals = (list: AccountNode[]): AccountNode[] => {
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotals(node.children);
        const total = updatedChildren.reduce((sum, child) => sum + child.value, 0);
        return { ...node, children: updatedChildren, value: total };
      }
      return node;
    });
  };

  const addNode = (parentId?: string) => {
    const newNode = { id: Math.random().toString(36).substr(2, 9), label: 'New Line Item', value: 0, isEditable: true };
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

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('dre')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Income Statement
        </button>
        <button 
          onClick={() => setActiveTab('balance')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Balance Sheet
        </button>
      </div>

      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
        {nodes.map(node => (
          <TreeNode 
            key={node.id} 
            node={node} 
            onAdd={addNode} 
            onDelete={deleteNode} 
            onUpdate={updateNode} 
          />
        ))}
        
        <button 
          onClick={() => addNode()}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <Plus size={16} /> Add Primary Group
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
        <Calculator size={20} />
        <span className="text-sm font-semibold">Total Net Equity will be automatically derived from these values.</span>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ 
  node: AccountNode; 
  onAdd: (id: string) => void; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AccountNode>) => void;
}> = ({ node, onAdd, onDelete, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div className="group flex items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-900 transition-colors">
          {isParent ? (isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : <ListTree size={16} className="opacity-20" />}
        </button>
        
        <input 
          value={node.label} 
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className={`bg-transparent outline-none flex-1 font-bold ${isParent ? 'text-slate-900' : 'text-slate-600 font-medium'}`}
          placeholder="Account Title"
        />

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 min-w-[140px]">
          <DollarSign size={14} className="text-slate-400" />
          {isParent ? (
            <span className="font-black text-slate-900 font-mono text-sm">{node.value.toLocaleString()}</span>
          ) : (
            <input 
              type="number"
              value={node.value}
              onChange={(e) => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })}
              className="w-full bg-transparent outline-none font-bold text-blue-600 font-mono text-sm"
            />
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={() => onAdd(node.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Plus size={18} />
          </button>
          <button onClick={() => onDelete(node.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {isOpen && isParent && (
        <div className="pl-8 space-y-2 border-l-2 border-slate-100 ml-6 py-1">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} onAdd={onAdd} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialStructureEditor;
