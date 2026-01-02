
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Trash2, ChevronDown, DollarSign, Calculator, 
  Layers, ArrowUp, ArrowDown, Info, GripVertical, CheckCircle2, AlertTriangle, ChevronRight, X, Delete
} from 'lucide-react';
import { AccountNode } from '../types';

interface FinancialStructureEditorProps {
  onChange?: (data: { balance_sheet: AccountNode[], dre: AccountNode[] }) => void;
  initialBalance?: AccountNode[];
  initialDRE?: AccountNode[];
}

// MÁSCARA PARA INTEIROS (Bernard Fidelity Standard)
const formatInt = (val: number): string => {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(abs);
  return val < 0 ? `-${formatted}` : formatted;
};

const FinancialStructureEditor: React.FC<FinancialStructureEditorProps> = ({ onChange, initialBalance, initialDRE }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'dre'>('balance');
  const [balanceNodes, setBalanceNodes] = useState<AccountNode[]>(initialBalance || []);
  const [dreNodes, setDRENodes] = useState<AccountNode[]>(initialDRE || []);

  const calculateTotalsRecursive = useCallback((list: AccountNode[], tabType: 'balance' | 'dre'): AccountNode[] => {
    return list.map(node => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = calculateTotalsRecursive(node.children, tabType);
        const total = updatedChildren.reduce((sum, child) => {
          // No DRE, despesas (expense) sempre subtraem algebricamente
          if (tabType === 'dre') {
            return child.type === 'expense' ? sum - Math.abs(child.value) : sum + child.value;
          }
          // No Balanço, soma algébrica pura (permite negativos tipo depreciação)
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
      return list.map(n => {
        if (n.id === parentId) {
          const newId = `${n.id}.${(n.children?.length || 0) + 1}`;
          const newNode: AccountNode = {
            id: newId,
            label: 'Nova Conta Custom',
            value: 0,
            type: activeTab === 'balance' ? n.type : (parentId.includes('exp') ? 'expense' : 'revenue'),
            isEditable: true,
            isTemplateAccount: false // Contas novas podem ser excluídas
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
      return list.filter(n => n.id !== id).map(n => ({
        ...n,
        children: n.children ? remove(n.children) : undefined
      }));
    };
    if (activeTab === 'balance') setBalanceNodes(calculateTotalsRecursive(remove(balanceNodes), 'balance'));
    else setDRENodes(calculateTotalsRecursive(remove(dreNodes), 'dre'));
  };

  const nodes = activeTab === 'balance' ? balanceNodes : dreNodes;
  const assets = balanceNodes.find(n => n.label.includes('ATIVO'))?.value || 0;
  const liabPL = balanceNodes.find(n => n.label.includes('PASSIVO'))?.value || 0;
  const isBalanced = Math.abs(assets - liabPL) < 1; // Tolerância para arredondamento de float

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
  const canDelete = node.isEditable && !node.isTemplateAccount; // PROTEÇÃO: Não exclui contas do template original
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
                  <span className={`font-mono font-black text-xs ${isNegative ? 'text-rose-400' : 'text-white'}`}>{formatInt(node.value)}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      className={`w-32 bg-transparent outline-none font-mono font-bold text-xs ${isNegative ? 'text-rose-400' : 'text-white'}`} 
                      value={formatInt(node.value)} 
                      onChange={e => {
                        // Permite apenas dígitos e sinal de menos
                        const raw = e.target.value.replace(/[^-0-9]/g, '');
                        if (raw === '-' || raw === '') {
                           onUpdate(node.id, { value: 0 });
                           return;
                        }
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

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity min-w-[60px]">
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

// CALCULADORA AVANÇADA COM BACKSPACE E SUPORTE A TECLADO
const MiniCalc: React.FC<{ initialValue: number, onApply: (v: number) => void, onClose: () => void }> = ({ initialValue, onApply, onClose }) => {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<number | null>(null);
  
  const evaluate = useCallback(() => {
    try {
      // Sanitização básica da expressão
      const sanitized = expr.replace(/[^-+*/.0-9]/g, '');
      if (!sanitized) return;
      const res = eval(sanitized);
      if (typeof res === 'number' && isFinite(res)) {
        setResult(res);
      }
    } catch (e) {
      setResult(null);
    }
  }, [expr]);

  useEffect(() => {
    evaluate();
  }, [expr, evaluate]);

  const handleKey = (key: string) => {
    if (key === '=') {
      evaluate();
    } else if (key === 'C') {
      setExpr('');
      setResult(null);
    } else if (key === 'back') {
      setExpr(prev => prev.slice(0, -1));
    } else {
      setExpr(prev => prev + key);
    }
  };

  // Suporte a teclado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
       if (e.key >= '0' && e.key <= '9') handleKey(e.key);
       if (['+', '-', '*', '/'].includes(e.key)) handleKey(e.key);
       if (e.key === 'Backspace') handleKey('back');
       if (e.key === 'Enter') handleKey('=');
       if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl w-56 space-y-4">
       <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Calculadora Expert</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={12}/></button>
       </div>
       <div className="space-y-1">
          <div className="bg-slate-950 p-2 rounded-lg text-right font-mono text-white text-xs overflow-hidden truncate h-8 border border-white/5 opacity-60">
             {expr || '0'}
          </div>
          <div className="bg-slate-950 p-2 rounded-lg text-right font-mono text-orange-500 text-lg font-black overflow-hidden truncate h-10 border border-white/10 shadow-inner">
             {result !== null ? formatInt(result) : formatInt(initialValue)}
          </div>
       </div>
       <div className="grid grid-cols-4 gap-1.5">
          {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(k => (
            <button 
              key={k} 
              onClick={() => handleKey(k)}
              className={`p-3 rounded-lg text-[11px] font-black transition-all ${
                k === '=' ? 'bg-orange-600 text-white shadow-lg' : 
                k === 'C' ? 'bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white' :
                ['+','-','*','/'].includes(k) ? 'bg-white/10 text-orange-500' : 
                'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {k}
            </button>
          ))}
          <button 
            onClick={() => handleKey('back')}
            className="col-span-4 py-2 bg-white/5 text-slate-500 rounded-lg flex items-center justify-center hover:text-white transition-all"
          >
            <Delete size={14} />
          </button>
       </div>
       <button 
         onClick={() => onApply(result !== null ? result : initialValue)}
         className="w-full py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20"
       >
         Aplicar Soma Final
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
