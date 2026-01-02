
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Trash2, ChevronDown, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, Info, GripVertical, CheckCircle2, AlertTriangle, ChevronRight, X
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
}

// MÁSCARA PARA INTEIROS (Bernard Fidelity Standard)
const formatInt = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(val);
};

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance, initialDRE }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(initialBalance || []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(initialDRE || []);

  const calculateTotals = useCallback((list: AccountNode[]): AccountNode[] => {
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotals(node.children);
        const total = updatedChildren.reduce((sum, child) => {
          // No DRE, despesas subtraem, receitas somam
          if (activeTab === 'dre') {
            return child.type === 'expense' ? sum - Math.abs(child.value) : sum + child.value;
          }
          // No Balanço, negativos somam algebricamente (ex: -depreciação)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/80 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balance' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Balance Structure
          </button>
          <button 
            onClick={() => setActiveTab('dre')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            DRE Config
          </button>
        </div>
        
        <div className="flex gap-4">
           <StatusBox label="Valuation Inicial" val={assets} color="orange" />
           {activeTab === 'balance' && (
             <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {isBalanced ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
                <span className="text-[10px] font-black uppercase tracking-tighter italic">
                  {isBalanced ? 'Equilíbrio OK' : `Desvio: $ ${formatInt(assets - liabPL)}`}
                </span>
             </div>
           )}
        </div>
      </div>

      <div className="bg-slate-950 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
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
  const [showCalc, setShowCalc] = useState(false);
  const isParent = node.children && node.children.length > 0;
  const canAdd = !node.isReadOnly && (node.type === 'totalizer');
  const canDelete = node.isEditable;
  const isNegative = node.value < 0;

  return (
    <div className="space-y-2">
      <div className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${isParent ? 'bg-slate-900 border-white/10 shadow-lg' : 'bg-white/5 border-white/5 hover:border-orange-500/30'}`} style={{ marginLeft: level * 32 }}>
        <button onClick={() => setIsOpen(!isOpen)} className={`p-1 text-slate-600 ${!isParent && 'opacity-0'} transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}><ChevronDown size={18}/></button>
        <div className="flex-1 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3 flex-1">
              <input 
                readOnly={node.isReadOnly || !node.isEditable}
                className={`bg-transparent outline-none font-black text-sm flex-1 ${isParent ? 'text-orange-500 uppercase italic' : 'text-slate-300'}`} 
                value={node.label} 
                onChange={e => onUpdate(node.id, { label: e.target.value })} 
              />
           </div>
           <div className="flex items-center gap-4 relative">
              <div className={`flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-white/10 shadow-inner ${isNegative ? 'ring-1 ring-rose-500/40' : ''}`}>
                <span className={`text-[10px] font-black ${isNegative ? 'text-rose-500' : 'text-slate-600'}`}>{isNegative ? '(-)' : '$'}</span>
                {isParent ? (
                  <span className={`font-mono font-black text-xs ${isNegative ? 'text-rose-400' : 'text-white'}`}>{formatInt(Math.abs(node.value))}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      className={`w-32 bg-transparent outline-none font-mono font-bold text-xs ${isNegative ? 'text-rose-400' : 'text-white'}`} 
                      value={node.value === 0 ? '' : node.value} 
                      placeholder="0"
                      onChange={e => {
                        const raw = e.target.value.replace(/[^\d-]/g, '');
                        onUpdate(node.id, { value: parseInt(raw) || 0 });
                      }} 
                    />
                    <button 
                      onClick={() => setShowCalc(!showCalc)}
                      className="text-slate-500 hover:text-orange-500 transition-colors"
                    >
                      <Calculator size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              {showCalc && !isParent && (
                <div className="absolute top-full mt-2 right-0 z-[100] animate-in zoom-in-95 duration-200">
                   <MiniCalc 
                     initialValue={node.value} 
                     onApply={(v) => { onUpdate(node.id, { value: v }); setShowCalc(false); }}
                     onClose={() => setShowCalc(false)}
                   />
                </div>
              )}

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {canAdd && <button onClick={() => onAdd(node.id)} className="p-2 text-blue-400 hover:bg-white/5 rounded-lg"><Plus size={14}/></button>}
                 {canDelete && <button onClick={() => onRemove(node.id)} className="p-2 text-rose-500 hover:bg-white/5 rounded-lg"><Trash2 size={14}/></button>}
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

const MiniCalc: React.FC<{ initialValue: number, onApply: (v: number) => void, onClose: () => void }> = ({ initialValue, onApply, onClose }) => {
  const [expr, setExpr] = useState(initialValue.toString());
  
  const handleKey = (key: string) => {
    if (key === '=') {
      try {
        // Simple evaluator (security handled by manual input restriction)
        const result = eval(expr.replace(/[^-+*/\d]/g, ''));
        setExpr(result.toString());
      } catch (e) { setExpr('Error'); }
    } else if (key === 'C') {
      setExpr('');
    } else {
      setExpr(prev => prev + key);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl w-48 space-y-3">
       <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Calculadora</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={12}/></button>
       </div>
       <div className="bg-slate-950 p-2 rounded-lg text-right font-mono text-white text-sm overflow-hidden truncate h-8 border border-white/5">
          {expr || '0'}
       </div>
       <div className="grid grid-cols-4 gap-1.5">
          {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(k => (
            <button 
              key={k} 
              onClick={() => handleKey(k)}
              className={`p-2 rounded-lg text-[10px] font-black transition-all ${
                k === '=' ? 'bg-orange-600 text-white col-span-1' : 
                ['+','-','*','/'].includes(k) ? 'bg-white/10 text-orange-500' : 
                'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {k}
            </button>
          ))}
       </div>
       <button 
         onClick={() => onApply(parseInt(expr) || 0)}
         className="w-full py-2 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-500"
       >
         Aplicar Valor
       </button>
    </div>
  );
};

const StatusBox = ({ label, val, color }: any) => (
  <div className={`p-4 rounded-2xl border shadow-xl min-w-[160px] ${color === 'orange' ? 'bg-orange-600 text-white border-orange-500' : 'bg-blue-600 text-white border-blue-500'}`}>
     <span className="block text-[8px] font-black uppercase opacity-70 tracking-widest mb-1">{label}</span>
     <span className="text-xl font-black italic font-mono">$ {formatInt(val)}</span>
  </div>
);

export default FinancialStructureEditor;
