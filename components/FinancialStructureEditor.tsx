import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, ListTree, DollarSign, Calculator, Layers, Save } from 'lucide-react';
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

  // Totaling logic: Sums children to update parent values recursively
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('dre')}
            className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DRE (Income)
          </button>
          <button 
            onClick={() => setActiveTab('balance')}
            className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Balanço (Balance)
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-400">Totalized Value</span>
          <div className="px-5 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold text-sm">
            $ {nodes.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-4">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Layers size={18} className="text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Plan of Accounts Editor</h3>
        </div>

        <div className="space-y-3">
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
            className="group w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Plus size={14} />
            </div>
            Adicionar Grupo Principal
          </button>
        </div>
      </div>

      <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
          <Calculator size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 uppercase">Motor de Consolidação</h4>
          <p className="text-xs text-blue-700/70 font-medium">As subcontas são somadas automaticamente aos seus pais. O equilíbrio patrimonial é garantido via lançamento jsonb.</p>
        </div>
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
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={`group flex items-center gap-4 p-5 rounded-2xl transition-all border ${isParent ? 'bg-slate-50/50 border-slate-100 shadow-sm' : 'bg-white border-transparent hover:border-slate-200'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`text-slate-400 hover:text-slate-900 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'} ${!isParent && 'opacity-0 cursor-default'}`}
        >
          <ChevronDown size={18} />
        </button>
        
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className={`p-2 rounded-xl ${isParent ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
            <ListTree size={16} />
          </div>
          <input 
            value={node.label} 
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className={`bg-transparent outline-none flex-1 font-bold truncate tracking-tight ${isParent ? 'text-slate-900' : 'text-slate-600'}`}
            placeholder="Nome da Conta"
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200/60 rounded-xl min-w-[160px] shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <DollarSign size={14} className="text-slate-300" />
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

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
          <button 
            onClick={() => onAdd(node.id)} 
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Adicionar Subconta"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={() => onDelete(node.id)} 
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Remover Conta"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {isOpen && isParent && (
        <div className="pl-12 space-y-3 mt-3 border-l-2 border-slate-100 ml-7 py-1">
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onAdd={onAdd} 
              onDelete={onDelete} 
              onUpdate={onUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialStructureEditor;