import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, ChevronDown, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, Info, GripVertical, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: any) => void;
  initialData?: any;
}

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialData }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre'>('balance');
  
  const [nodes, setNodes] = useState<AccountNode[]>([
    {
      id: 'root-assets',
      label: '1. ATIVO TOTAL',
      value: 0,
      type: 'asset',
      children: [
        { 
            id: 'current-assets', 
            label: '1.1 Ativo Circulante', 
            value: 0, 
            type: 'asset', 
            children: [
                { id: 'cash', label: '1.1.1 Caixa e Equivalentes', value: 1000000, type: 'asset', isEditable: true },
                { id: 'receivables', label: '1.1.2 Contas a Receber', value: 1823735, type: 'asset', isEditable: true },
                { id: 'inventory', label: '1.1.3 Estoques Finais', value: 3000000, type: 'asset', isEditable: true },
            ] 
        },
        { 
            id: 'non-current-assets', 
            label: '1.2 Ativo Não Circulante', 
            value: 0, 
            type: 'asset',
            children: [
                { id: 'machinery', label: '1.2.1 Máquinas e Equipamentos', value: 5153205, type: 'asset', isEditable: true },
                { id: 'land', label: '1.2.2 Terras e Imóveis', value: 1200000, type: 'asset', isEditable: true },
            ]
        }
      ]
    },
    {
      id: 'root-liabilities',
      label: '2. PASSIVO E PL',
      value: 0,
      type: 'liability',
      children: [
        {
          id: 'current-liabilities',
          label: '2.1 Passivo Circulante',
          value: 0,
          type: 'liability',
          children: [
            { id: 'payables', label: '2.1.1 Contas a Pagar', value: 1500000, type: 'liability', isEditable: true },
            { id: 'st-debt', label: '2.1.2 Empréstimos C.P.', value: 2000000, type: 'liability', isEditable: true },
          ]
        },
        {
          id: 'equity',
          label: '2.3 Patrimônio Líquido',
          value: 0,
          type: 'equity',
          children: [
            { id: 'capital', label: '2.3.1 Capital Social', value: 8000000, type: 'equity', isEditable: true },
            { id: 'retained', label: '2.3.2 Lucros Retidos', value: 676940, type: 'equity', isEditable: true },
          ]
        }
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
    setNodes(prev => calculateTotals(prev));
  }, [calculateTotals]);

  const updateNode = (id: string, updates: Partial<AccountNode>) => {
    const edit = (list: AccountNode[]): AccountNode[] => {
      return list.map(n => {
        if (n.id === id) return { ...n, ...updates };
        if (n.children) return { ...n, children: edit(n.children) };
        return n;
      });
    };
    const updated = calculateTotals(edit(nodes));
    setNodes(updated);
    
    if (onChange) {
      // Exportação simplificada para o motor
      const assets = updated.find(n => n.id === 'root-assets')?.value || 0;
      const liabilities = updated.find(n => n.id === 'root-liabilities')?.value || 0;
      onChange({ balance_sheet: { total_assets: assets, total_liabilities_equity: liabilities }, isBalanced: assets === liabilities });
    }
  };

  const assetsVal = nodes.find(n => n.id === 'root-assets')?.value || 0;
  const liabVal = nodes.find(n => n.id === 'root-liabilities')?.value || 0;
  const isBalanced = Math.abs(assetsVal - liabVal) < 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
          <button onClick={() => setActiveTab('balance')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Estrutura Balanço</button>
          <button onClick={() => setActiveTab('dre')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>DRE Incial (P1)</button>
        </div>
        
        <div className="flex gap-6">
           <StatusBox label="Ativo Total" val={assetsVal} color="blue" />
           <StatusBox label="Passivo + PL" val={liabVal} color={isBalanced ? 'emerald' : 'rose'} />
        </div>
      </div>

      {!isBalanced && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600 animate-pulse">
           <AlertTriangle size={24} />
           <p className="text-xs font-black uppercase tracking-widest">Atenção: O Balanço não fecha. Diferença de $ {(assetsVal - liabVal).toLocaleString()}</p>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 space-y-3">
          {nodes.map((node) => (
            <TreeNode key={node.id} node={node} onUpdate={updateNode} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ 
  node: AccountNode; 
  onUpdate: (id: string, updates: Partial<AccountNode>) => void;
  level?: number;
}> = ({ node, onUpdate, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isParent = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${isParent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-orange-100'}`} style={{ marginLeft: level * 32 }}>
        <button onClick={() => setIsOpen(!isOpen)} className={`p-1 text-slate-400 ${!isParent && 'opacity-0'} transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}><ChevronDown size={18}/></button>
        <div className="flex-1 flex items-center justify-between gap-4">
           <input className={`bg-transparent outline-none font-bold text-sm flex-1 ${isParent ? 'text-slate-900 uppercase' : 'text-slate-600'}`} value={node.label} onChange={e => onUpdate(node.id, { label: e.target.value })} />
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
              <DollarSign size={12} className="text-slate-300" />
              {isParent ? (
                <span className="font-mono font-black text-slate-950 text-xs">{(node.value || 0).toLocaleString()}</span>
              ) : (
                <input type="number" className="w-32 bg-transparent outline-none font-mono font-bold text-orange-600 text-xs" value={node.value} onChange={e => onUpdate(node.id, { value: parseFloat(e.target.value) || 0 })} />
              )}
           </div>
        </div>
      </div>
      {isOpen && isParent && (
        <div className="space-y-2">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} onUpdate={onUpdate} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBox = ({ label, val, color }: any) => (
  <div className={`p-5 rounded-[2rem] border shadow-sm min-w-[180px] ${color === 'blue' ? 'bg-blue-50 border-blue-100' : color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
     <span className="block text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{label}</span>
     <div className="flex items-center justify-between">
        <span className={`text-xl font-black italic ${color === 'blue' ? 'text-blue-700' : color === 'emerald' ? 'text-emerald-700' : 'text-rose-700'}`}>$ {val.toLocaleString()}</span>
        {color === 'emerald' && <CheckCircle2 size={16} className="text-emerald-500" />}
     </div>
  </div>
);

export default FinancialStructureEditor;