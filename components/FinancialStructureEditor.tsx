
import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, ListTree, DollarSign } from 'lucide-react';

interface AccountNode {
  id: string;
  label: string;
  value: number;
  children?: AccountNode[];
  isEditable?: boolean;
}

const FinancialStructureEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dre' | 'balance'>('dre');
  const [nodes, setNodes] = useState<AccountNode[]>([
    {
      id: '1',
      label: 'Gross Revenue',
      value: 1000000,
      children: [
        { id: '1.1', label: 'Product Sales', value: 800000, isEditable: true },
        { id: '1.2', label: 'Service Fees', value: 200000, isEditable: true },
      ]
    },
    {
      id: '2',
      label: 'Direct Costs',
      value: 400000,
      children: [
        { id: '2.1', label: 'Raw Materials', value: 300000, isEditable: true },
        { id: '2.2', label: 'Direct Labor', value: 100000, isEditable: true },
      ]
    }
  ]);

  const addNode = (parentId?: string) => {
    const newNode = { id: Math.random().toString(36).substr(2, 9), label: 'New Sub-account', value: 0, isEditable: true };
    if (!parentId) {
      setNodes([...nodes, newNode]);
    } else {
      const updateChildren = (list: AccountNode[]): AccountNode[] => {
        return list.map(n => {
          if (n.id === parentId) {
            return { ...n, children: [...(n.children || []), newNode] };
          }
          if (n.children) return { ...n, children: updateChildren(n.children) };
          return n;
        });
      };
      setNodes(updateChildren(nodes));
    }
  };

  const deleteNode = (id: string) => {
    const filterNodes = (list: AccountNode[]): AccountNode[] => {
      return list.filter(n => n.id !== id).map(n => ({
        ...n,
        children: n.children ? filterNodes(n.children) : undefined
      }));
    };
    setNodes(filterNodes(nodes));
  };

  const updateLabel = (id: string, newLabel: string) => {
    const edit = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === id) return { ...n, label: newLabel };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };
    setNodes(edit(nodes));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-100 pb-4">
        <button 
          onClick={() => setActiveTab('dre')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'dre' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Income Statement (DRE)
        </button>
        <button 
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'balance' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Balance Sheet
        </button>
      </div>

      <div className="space-y-2">
        {nodes.map(node => (
          <TreeNode key={node.id} node={node} onAdd={addNode} onDelete={deleteNode} onUpdateLabel={updateLabel} />
        ))}
      </div>

      <button 
        onClick={() => addNode()}
        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all font-bold text-sm"
      >
        <Plus size={18} /> Add Main Account Group
      </button>
    </div>
  );
};

const TreeNode: React.FC<{ 
  node: AccountNode; 
  onAdd: (id: string) => void; 
  onDelete: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}> = ({ node, onAdd, onDelete, onUpdateLabel }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-2">
      <div className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-900">
          {node.children ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <ListTree size={16} className="opacity-20" />}
        </button>
        
        <input 
          value={node.label} 
          onChange={(e) => onUpdateLabel(node.id, e.target.value)}
          className={`bg-transparent outline-none flex-1 font-semibold ${node.children ? 'text-slate-900' : 'text-slate-600 font-medium'}`}
        />

        <div className="flex items-center gap-2 text-slate-400 font-mono text-sm mr-4">
          <DollarSign size={14} />
          {node.value.toLocaleString()}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={() => onAdd(node.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
            <Plus size={16} />
          </button>
          <button onClick={() => onDelete(node.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {isOpen && node.children && (
        <div className="pl-8 space-y-2 border-l-2 border-slate-50 ml-5">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onAdd={onAdd} onDelete={onDelete} onUpdateLabel={onUpdateLabel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialStructureEditor;
