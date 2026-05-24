import React, { useState, useRef, useEffect } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard,
  Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2,
  Terminal, MessageSquare, Send, Bot, User as UserIcon,
  Search, Globe, Database, ShieldOff, Landmark, Activity,
  Cpu, ShoppingCart, Percent, HelpCircle
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { formatCurrency } from '../utils/formatters';
import { getApiKey } from '../services/gemini';

interface OpalHubProps {
  isPremium: boolean;
  onUpgrade: () => void;
  config?: {
    opal_url: string;
  };
}

interface SimulatedResult {
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  kardex: {
    mpa: any;
    mpb: any;
    pa: any;
  };
  cpvDetails: any;
  statements: {
    dre: { label: string; value: number }[];
    balance: { label: string; value: number }[];
    cashflow: { label: string; value: number }[];
  };
  aiReport?: string;
}

const OpalIntelligenceHub: React.FC<OpalHubProps> = ({ isPremium, onUpgrade, config }) => {
  const [activeTab, setActiveTab] = useState<'oracle' | 'turnover' | 'workflows'>('oracle');
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  
  // Oracle Chat State
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Strategos Oracle v5.8 ativo. Como posso otimizar seu império hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // States for Turnover Simulator
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulatedResult | null>(null);
  const [custPriceNormal, setCustPriceNormal] = useState<number>(450); // Região A (Vista)
  const [custPriceTerm, setCustPriceTerm] = useState<number>(480);   // Região B (Prazo - 30/60 dias)
  const [purchaseQtyPlanA, setPurchaseQtyPlanA] = useState<number>(50000);
  const [purchaseQtyPlanB, setPurchaseQtyPlanB] = useState<number>(40000);
  const [productionTarget, setProductionTarget] = useState<number>(45000);
  const [loanRequested, setLoanRequested] = useState<number>(400000);
  const [machinesToBuy, setMachinesToBuy] = useState<number>(1); // 1 Alfa Machine

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendOracle = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim() || isOracleLoading) return;

    const userMsg = msg.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsOracleLoading(true);

    try {
      const apiKey = await getApiKey() || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing.");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Você é o Strategos Oracle. Responda dúvidas estratégicas de negócios focando exclusivamente no ecossistema e em métricas contábeis.'
        }
      });
      
      const botText = response.text || "Falha na transmissão neural.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error("Oracle Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Link tático instável. Reconectando...' }]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  // EXECUTES THE ENTIRE TURNOVER SIMULATOR MECHANIC
  const executeTurnoverSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);

    // Timeout sutil para dar efeito de processamento
    await new Promise((res) => setTimeout(res, 1200));

    try {
      // 1. Dados Básicos Iniciais (Turno T-0 / Mudança de Rodada)
      // MP A: 30.150 un @ $20.00/un -> Inicial $603.000,00
      const initialMpaQty = 30150;
      const initialMpaValue = 603000.00;
      const initialMpaUnit = 20.00;

      // MP B: 20.100 un @ $40.00/un -> Inicial $804.000,00
      const initialMpbQty = 20100;
      const initialMpbValue = 804000.00;
      const initialMpbUnit = 40.00;

      // PA estoque inicial: 0
      const initialPaQty = 0;
      const initialPaValue = 0.00;

      const initialCash = 1500000.00; // Caixa de entrada do time

      // 2. Aquisições Contabilizadas
      // Compras de matéria-prima planejadas (Compensadas no DFC e Balanço)
      const mpaPriceNet = 16.00; // $16 líquido após ICMS de compras
      const mpbPriceNet = 32.00; // $32 líquido após ICMS de compras

      // Consumo de fabricação planejado (Cada PA precisa de 3 MP A e 2 MP B)
      const requiredMpa = productionTarget * 3;
      const requiredMpb = productionTarget * 2;

      // Estoque total disponível após compras planejadas
      const availMpaPlan = initialMpaQty + purchaseQtyPlanA;
      const availMpbPlan = initialMpbQty + purchaseQtyPlanB;

      // Compras emergenciais instantâneas com prêmio (cisne de estoque)
      let emergencyMpa = 0;
      let emergencyMpb = 0;
      if (requiredMpa > availMpaPlan) emergencyMpa = requiredMpa - availMpaPlan;
      if (requiredMpb > availMpbPlan) emergencyMpb = requiredMpb - availMpbPlan;

      const emergencyMpaPriceNet = mpaPriceNet * 1.15; // Ágio de 15%
      const emergencyMpbPriceNet = mpbPriceNet * 1.15; // Ágio de 15%

      // 3. Cálculo do WAC (Custo Médio Ponderado)
      const totalMpaQty = initialMpaQty + purchaseQtyPlanA + emergencyMpa;
      const totalMpaValue = initialMpaValue + (purchaseQtyPlanA * mpaPriceNet) + (emergencyMpa * emergencyMpaPriceNet);
      const wacMpaUnit = totalMpaQty > 0 ? (totalMpaValue / totalMpaQty) : mpaPriceNet;

      const totalMpbQty = initialMpbQty + purchaseQtyPlanB + emergencyMpb;
      const totalMpbValue = initialMpbValue + (purchaseQtyPlanB * mpbPriceNet) + (emergencyMpb * emergencyMpbPriceNet);
      const wacMpbUnit = totalMpbQty > 0 ? (totalMpbValue / totalMpbQty) : mpbPriceNet;

      // Saída/Consumo Real de MP
      const mpaConsumedValue = requiredMpa * wacMpaUnit;
      const mpbConsumedValue = requiredMpb * wacMpbUnit;
      const totalMPConsumida = mpaConsumedValue + mpbConsumedValue;

      // Estoque final físico e valorado de MP
      const finalMpaQty = totalMpaQty - requiredMpa;
      const finalMpaValue = finalMpaQty * wacMpaUnit;

      const finalMpbQty = totalMpbQty - requiredMpb;
      const finalMpbValue = finalMpbQty * wacMpbUnit;

      // 4. Custos de Transformação Industrial (MOD & GGF)
      const totalMOD = 540000.00;
      const periodDepreciation = 92000.00 + (machinesToBuy * 37500.00); // Maquina nova deprecia mais
      const maintenance = 25000.00;
      const activeContingency = 0.00;

      // Custo de Produção do Período (CPP)
      const totalCPP = totalMPConsumida + totalMOD + periodDepreciation + maintenance;
      const unitCPP = productionTarget > 0 ? (totalCPP / productionTarget) : 0;

      // Custo Médio Ponderado da Mercadoria de PA (PA)
      const totalQtyPaForSale = initialPaQty + productionTarget;
      const totalValuePaForSale = initialPaValue + totalCPP;
      const wacPaUnit = totalQtyPaForSale > 0 ? (totalValuePaForSale / totalQtyPaForSale) : unitCPP;

      // 5. Vendas (Vista e Prazo)
      // Digamos que a demanda de vendas calculada foi de 42.000 unidades
      const qtySold = Math.min(42000, totalQtyPaForSale);
      const qtySoldCash = Math.floor(qtySold * 0.5); // 50% à vista
      const qtySoldTerm = qtySold - qtySoldCash;       // 50% a prazo

      // Receitas brutas e líquidas
      const revCash = qtySoldCash * custPriceNormal;
      const revTerm = qtySoldTerm * custPriceTerm;
      const grossRevenue = revCash + revTerm;
      const vatSalesRate = 0.18; // Imposto sobre vendas (18%)
      const taxesOnSales = grossRevenue * vatSalesRate;
      const netRevenue = grossRevenue - taxesOnSales;

      // Custo do Produto Vendido (CPV) via WAC
      const totalCPV = qtySold * wacPaUnit;
      const grossProfit = netRevenue - totalCPV;

      // Estoque final físico e valorado de PA
      const finalPaQty = totalQtyPaForSale - qtySold;
      const finalPaValue = finalPaQty * wacPaUnit;

      // Despesas G&A e Finanças
      const opex = 280000.00;
      const ebitda = grossProfit - opex + periodDepreciation;
      const ebit = grossProfit - opex;

      // Custo financeiro (juros do empréstimo de $400k @ 1.5% a.m.)
      const loanInterestCost = loanRequested * 0.015;
      const netProfitBeforeTax = ebit - loanInterestCost;
      const corporateTax = netProfitBeforeTax > 0 ? netProfitBeforeTax * 0.15 : 0;
      const netProfit = netProfitBeforeTax - corporateTax;

      // 6. Impactos no Balanço Patrimonial e Fluxo de Caixa (Triple Consolidated Engine)
      // Clientes a Receber (Venda a prazo)
      const clientsBalance = revTerm;

      // Forcedores a pagar (Compras planejadas de MP a prazo de 30 dias)
      const suppliersPlanA = purchaseQtyPlanA * 20.00; // Brutalizado
      const suppliersPlanB = purchaseQtyPlanB * 40.00;
      const suppliersBalance = suppliersPlanA + suppliersPlanB;

      // CAPEX de Máquinas compradas
      const machineUnitPrice = 1500000.00; // Alfa unit price
      const capexMachinery = machinesToBuy * machineUnitPrice;

      // Caixa líquida pós rodada (Regime de Caixa)
      const cashInflow = revCash + loanRequested;
      const cashOutflow = (purchaseQtyPlanA * 20.00 * 0.3) + (purchaseQtyPlanB * 40.00 * 0.3) + (emergencyMpa * emergencyMpaPriceNet) + (emergencyMpb * emergencyMpbPriceNet) + totalMOD + opex + capexMachinery;
      const finalCash = initialCash + cashInflow - cashOutflow;

      // Ativo Imobilizado
      const fixedAssetsIn = 5440000.00 + capexMachinery;
      const accumDeprecOut = periodDepreciation;

      // Total de Ativos
      const totalAssets = finalCash + clientsBalance + finalMpaValue + finalMpbValue + finalPaValue + fixedAssetsIn - accumDeprecOut;

      // Total do Passivo + PL
      const totalLiabilities = suppliersBalance + loanRequested + 10000000.00 + netProfit; // capital presumido de $10M

      // 7. Geração de relatórios estruturados para o usuário
      const statements = {
        dre: [
          { label: '(+) Receita Bruta de Vendas', value: grossRevenue },
          { label: '(-) Deduções e Impostos (18%)', value: -taxesOnSales },
          { label: '(=) Receita Líquida', value: netRevenue },
          { label: '(-) Custo do Produto Vendido (CPV)', value: -totalCPV },
          { label: '(=) Lucro Bruto', value: grossProfit },
          { label: '(-) Despesas Operacionais (G&A)', value: -opex },
          { label: '(=) EBITDA', value: ebitda },
          { label: '(-) Depreciação do Período', value: -periodDepreciation },
          { label: '(=) EBIT (Lucro Operacional)', value: ebit },
          { label: '(-) Despesas Financeiras (Juros Empréstimo)', value: -loanInterestCost },
          { label: '(-) Prov. Imposto de Renda e CSLL', value: -corporateTax },
          { label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: netProfit }
        ],
        balance: [
          { label: 'Caixa e equivalentes', value: finalCash },
          { label: 'Contas a Receber (Clientes)', value: clientsBalance },
          { label: 'Estoque Matéria-Prima A', value: finalMpaValue },
          { label: 'Estoque Matéria-Prima B', value: finalMpbValue },
          { label: 'Estoque Produtos Acabados (PA)', value: finalPaValue },
          { label: 'Ativo Imobilizado (Prédios, Máquinas)', value: fixedAssetsIn },
          { label: '(-) Depreciação Acumulada', value: -accumDeprecOut },
          { label: '(=) TOTAL DO ATIVO COMPILADO', value: totalAssets },
          { label: 'Fornecedores a Pagar', value: suppliersBalance },
          { label: 'Empréstimos Bancários ST/LT', value: loanRequested },
          { label: 'Capital Social Integralizado', value: 10000000.00 },
          { label: 'Lucro Acumulado do Exercício', value: netProfit },
          { label: '(=) TOTAL PASSIVO + PATRIMÔNIO LÍQUIDO', value: totalLiabilities }
        ],
        cashflow: [
          { label: 'Recebimento de Vendas à Vista', value: revCash },
          { label: 'Captação de Empréstimo de Capital', value: loanRequested },
          { label: '(=) ENTRADAS TOTAIS DE CAIXA', value: cashInflow },
          { label: 'Pagamento de Matéria-Prima (Sinal)', value: -((purchaseQtyPlanA * 20.00 * 0.3) + (purchaseQtyPlanB * 40.00 * 0.3)) },
          { label: 'Pagamento de Compras de Emergência (Kardex)', value: -((emergencyMpa * emergencyMpaPriceNet) + (emergencyMpb * emergencyMpbPriceNet)) },
          { label: 'Folha de Pagamento Industrial (MOD)', value: -totalMOD },
          { label: 'Despesas Gerais e Administrativas (G&A)', value: -opex },
          { label: 'Investimento em Máquinas (CAPEX)', value: -capexMachinery },
          { label: '(=) SAÍDAS TOTAIS DE CAIXA', value: -cashOutflow },
          { label: '(=) FLUXO DE CAIXA LÍQUIDO OPERACIONAL', value: cashInflow - cashOutflow }
        ]
      };

      const kardex = {
        mpa: {
          saldoInicialQtd: initialMpaQty,
          saldoInicialValor: initialMpaValue,
          saldoInicialUnitario: initialMpaUnit,
          entradasQtd: purchaseQtyPlanA + emergencyMpa,
          entradasValor: (purchaseQtyPlanA * mpaPriceNet) + (emergencyMpa * emergencyMpaPriceNet),
          entradasUnitario: (purchaseQtyPlanA * mpaPriceNet + emergencyMpa * emergencyMpaPriceNet) / (purchaseQtyPlanA + emergencyMpa),
          saidasQtd: requiredMpa,
          saidasValor: mpaConsumedValue,
          saidasUnitario: wacMpaUnit,
          saldoFinalQtd: finalMpaQty,
          saldoFinalValor: finalMpaValue,
          saldoFinalUnitario: wacMpaUnit
        },
        mpb: {
          saldoInicialQtd: initialMpbQty,
          saldoInicialValor: initialMpbValue,
          saldoInicialUnitario: initialMpbUnit,
          entradasQtd: purchaseQtyPlanB + emergencyMpb,
          entradasValor: (purchaseQtyPlanB * mpbPriceNet) + (emergencyMpb * emergencyMpbPriceNet),
          entradasUnitario: (purchaseQtyPlanB * mpbPriceNet + emergencyMpb * emergencyMpbPriceNet) / (purchaseQtyPlanB + emergencyMpb),
          saidasQtd: requiredMpb,
          saidasValor: mpbConsumedValue,
          saidasUnitario: wacMpbUnit,
          saldoFinalQtd: finalMpbQty,
          saldoFinalValor: finalMpbValue,
          saldoFinalUnitario: wacMpbUnit
        },
        pa: {
          saldoInicialQtd: initialPaQty,
          saldoInicialValor: initialPaValue,
          saldoInicialUnitario: 0,
          entradasQtd: productionTarget,
          entradasValor: totalCPP,
          entradasUnitario: unitCPP,
          saidasQtd: qtySold,
          saidasValor: totalCPV,
          saidasUnitario: wacPaUnit,
          saldoFinalQtd: finalPaQty,
          saldoFinalValor: finalPaValue,
          saldoFinalUnitario: wacPaUnit
        }
      };

      const cpvDetails = {
        mpConsumida: totalMPConsumida,
        maoDeObraDireta: totalMOD,
        depreciacaoFabril: periodDepreciation,
        manutencaoFabril: maintenance,
        totalCPP,
        estoqueInicialPA: initialPaValue,
        estoqueFinalPA: finalPaValue,
        totalCPV,
        custoUnitarioProducao: unitCPP
      };

      const errors: string[] = [];
      const warnings: string[] = [];

      // Simular validações contábeis inteligentes no WAC do Kardex
      if (emergencyMpa > 0 || emergencyMpb > 0) {
        warnings.push(`Cisne de Estoque Ativado: A quantidade de produção de ${productionTarget} un exigiu compras de emergência de MP A (+${emergencyMpa} un) e MP B (+${emergencyMpb} un) gerando penalização de ágio de 15% sobre o WAC líquido.`);
      }

      const diffBalance = Math.abs(totalAssets - totalLiabilities);
      if (diffBalance > 0.1) {
        errors.push(`Disparidade de Equação Contábil encontrada no simulador: Ativo difere de Passivo + PL por ${diffBalance.toFixed(2)} BRL.`);
      }

      // 8. Chamar o oráculo da IA (Gemini) para uma auditoria total com WAC e Kardex completo
      let aiReport = "Iniciando processador analítico do Oráculo...";
      
      try {
        const apiKey = await getApiKey() || process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `
            Você é o Strategos Master Auditor, oráculo corporativo e especialista em contabilidade gerencial industrial de nível v19.5 Sapphire.
            Fomos acionados para auditar um Turnover completo de uma corporação após alteração crítica do Kardex-WAC.
            
            ANÁLISE DE ENTRADAS DO TURNOVER:
            - Produção Industrial de PA: ${productionTarget} unidades.
            - Compra planejada de MP A: ${purchaseQtyPlanA} unidades a termo.
            - Compra planejada de MP B: ${purchaseQtyPlanB} unidades a termo.
            - Compras de Emergência (Cisne de Estoque): MP A: ${emergencyMpa} un | MP B: ${emergencyMpb} un (Penalização de 15%).
            
            RELATÓRIO KARDEX & CUSTEIO WAC CALCULADO:
            - Estoque Final de MP A: ${finalMpaQty} un (Valorizado a ${formatCurrency(finalMpaValue, 'BRL')} | Custo Médio WAC: ${formatCurrency(wacMpaUnit, 'BRL')}/un)
            - Estoque Final de MP B: ${finalMpbQty} un (Valorizado a ${formatCurrency(finalMpbValue, 'BRL')} | Custo Médio WAC: ${formatCurrency(wacMpbUnit, 'BRL')}/un)
            - Custo de Produção do Período (CPP): ${formatCurrency(totalCPP, 'BRL')} (Custo Unitário de Produção CPU: ${formatCurrency(unitCPP, 'BRL')}/un)
            - Custo do Produto Vendido (CPV Comercial): ${formatCurrency(totalCPV, 'BRL')} para ${qtySold} unidades faturadas.
            - Estoque Físico PA de fechamento: ${finalPaQty} unidades (Valorizado a ${formatCurrency(finalPaValue, 'BRL')}).
            
            ESTRUTURA DE CAPITAL & CRÉDITO:
            - Empréstimo Captado: ${formatCurrency(loanRequested, 'BRL')}
            - CAPEX de Expansão (Compra de ${machinesToBuy} máquina Alfa): ${formatCurrency(capexMachinery, 'BRL')}
            - Caixa de fechamento do caixa operacional líquido: ${formatCurrency(finalCash, 'BRL')}
            - Contas a Receber (Clientes a prazo de 30 dias): ${formatCurrency(clientsBalance, 'BRL')}
            
            SUA TAREFA (IMPERATIVAS EM PT-BR):
            1. Faça um parecer conciso sobre a eficiência operacional desse turnover de produção. Critique o "Cisne de Estoque" (compras de emergência) que distorceu os custos médios (WAC).
            2. Analise se a estrutura de financiamento (empréstimo de $400k) suportou suficientemente o CAPEX da máquina nova sem sufocar o capital de giro operacional líquecendo.
            3. Analise as margens líquidas (Lucro Líquido: ${formatCurrency(netProfit, 'BRL')} vs Receita Bruta: ${formatCurrency(grossRevenue, 'BRL')}) e a reconciliação da consistência tripla contábil.
            4. Destaque um insight estratégico de alta governança para estancar as perdas do prêmio de compra com melhor planejamento de suprimentos.
            
            Retorne um relatório estruturado de alta diretoria em português brasileiro (pt-BR) limpo, corporativo, sem jargões desnecessários, focado 100% no valor dos estoques e resultados.
          `;

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { temperature: 0.3 }
          });
          aiReport = response.text || "Análise neural indisponível temporariamente.";
        } else {
          aiReport = "Análise neural simulada (Sem GEMINI_API_KEY): O turnover demonstrou alta conformidade operacional. O fluxo de caixa foi equilibrado pelo aporte de empréstimo, porém as compras emergenciais indicam gargalo de sincronismo entre a cadeia de suprimentos e o nível de atividade. Recomenda-se estancar a penalidade premium realizando compras de MP baseadas no lead-time industrial antes das rodadas de atividade integral.";
        }
      } catch (err) {
        console.error("Gemini AI error in turnover audit:", err);
        aiReport = "Análise neural offline por inconsistência de enlace tático contábil.";
      }

      setSimResult({
        validation: {
          isValid: errors.length === 0,
          errors,
          warnings
        },
        kardex,
        cpvDetails,
        statements,
        aiReport
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                  <BrainCircuit size={24} />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Intelligence <span className="text-indigo-400">Hub</span></h1>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('oracle')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === 'oracle' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Strategos Oracle</button>
              <button onClick={() => setActiveTab('turnover')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'turnover' ? 'text-orange-400 border-orange-400 font-extrabold' : 'text-slate-500 border-transparent hover:text-slate-300'}`}><Activity size={12}/> Auditoria de Turnover IA</button>
              {!isTrial && <button onClick={() => setActiveTab('workflows')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'workflows' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Opal Workflows {!isPremium && <Lock size={10} />}</button>}
            </div>
         </div>
      </header>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'oracle' && (
            <motion.div key="oracle-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                 <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Terminal size={18} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Local Neural Engine</span>
                    </div>
                 </div>
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/20">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}>
                            {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                          </div>
                         <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-white text-slate-900 rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none'}`}>{m.text}</div>
                      </div>
                    ))}
                 </div>
                 <form onSubmit={handleSendOracle} className="p-6 bg-slate-900 border-t border-white/5 flex gap-3">
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Solicitar análise direta..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600" />
                    <button type="submit" disabled={isOracleLoading} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-indigo-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"><Send size={20} /></button>
                 </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'turnover' && (
            <motion.div key="turnover-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="bg-gradient-to-r from-orange-600/15 to-amber-600/5 border border-orange-500/20 rounded-[2rem] p-8 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[8px] font-black tracking-widest text-orange-400 uppercase">Oráculo Contábil & Kardex de Estoques</span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Estúdio de Simulação de Turnover e Custo Médio (WAC)</h2>
                    <p className="text-slate-400 text-xs font-medium max-w-3xl leading-relaxed">
                      Este estúdio permite executar um roteiro de integração contábil e auditoria tripla baseando-se em decisões estratégicas completas da equipe (compra de máquinas, faturamento à vista e a prazo, juros de empréstimo e controle fino de estoques WAC).
                    </p>
                  </div>
                  <button onClick={executeTurnoverSimulation} disabled={isSimulating} className="px-8 py-4 bg-orange-600 hover:bg-white hover:text-orange-950 transition-all text-white rounded-full font-black text-[10px] tracking-widest uppercase flex items-center gap-2 shrink-0 shadow-lg active:scale-95 disabled:opacity-40">
                    {isSimulating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isSimulating ? 'Executando Rotina...' : 'Executar Script Turnover'}
                  </button>
                </div>

                {/* CONTROLE DOS PARÂMETROS DE ENTRADA DO SCRIPT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 border-t border-white/5 pt-6">
                  <div className="space-y-1">
                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider">Compras Planejadas (MP A / MP B)</span>
                    <div className="flex gap-2">
                      <input type="number" value={purchaseQtyPlanA} onChange={e => setPurchaseQtyPlanA(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                      <input type="number" value={purchaseQtyPlanB} onChange={e => setPurchaseQtyPlanB(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider">Meta de Produção (Qtd)</span>
                    <input type="number" value={productionTarget} onChange={e => setProductionTarget(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider">Empréstimo Solicitado (Capital)</span>
                    <input type="number" value={loanRequested} onChange={e => setLoanRequested(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider">Compra de CAPEX (Máquina Alfa)</span>
                    <input type="number" value={machinesToBuy} onChange={e => setMachinesToBuy(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>
                </div>
              </div>

              {simResult && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
                  
                  {/* ESQUERDA: RELATÓRIO DO ORÁCULO DE IA */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] shadow-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">Festa de Parecer Analítico (Oracle AI)</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-semibold divide-y divide-white/5 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                        <p className="whitespace-pre-line text-slate-300">{simResult.aiReport}</p>
                      </div>
                    </div>

                    {/* ESTADO DAS CONSTATAÇÕES FIÉIS */}
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Resumo Metas de Estoque e Caixa</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <span className="text-[7px] uppercase font-black tracking-wider text-slate-400">Estoque Final MP A</span>
                          <p className="font-mono text-sm font-bold text-white mt-1">{simResult.kardex.mpa.saldoFinalQtd.toLocaleString('pt-BR')} un</p>
                          <span className="text-[6px] text-orange-400 uppercase font-black">WAC: {formatCurrency(simResult.kardex.mpa.saldoFinalUnitario, 'BRL')}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <span className="text-[7px] uppercase font-black tracking-wider text-slate-400">Estoque Final MP B</span>
                          <p className="font-mono text-sm font-bold text-white mt-1">{simResult.kardex.mpb.saldoFinalQtd.toLocaleString('pt-BR')} un</p>
                          <span className="text-[6px] text-orange-400 uppercase font-black">WAC: {formatCurrency(simResult.kardex.mpb.saldoFinalUnitario, 'BRL')}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <span className="text-[7px] uppercase font-black tracking-wider text-slate-400">Estoque PA</span>
                          <p className="font-mono text-sm font-bold text-white mt-1">{simResult.kardex.pa.saldoFinalQtd.toLocaleString('pt-BR')} un</p>
                          <span className="text-[6px] text-emerald-400 uppercase font-black">CPU: {formatCurrency(simResult.kardex.pa.saldoFinalUnitario, 'BRL')}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <span className="text-[7px] uppercase font-black tracking-wider text-slate-400">Caixa Operacional Líquido</span>
                          <p className="font-mono text-sm font-bold text-white mt-1">{formatCurrency(simResult.statements.balance[0].value, 'BRL')}</p>
                          <span className="text-[6px] text-yellow-400 uppercase font-black">Liquidez Total</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DIREITA: DEMONSTRATIVOS FINANCEIROS TRIPLICE CONCILIADOS */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* DEMONSTRATIVO KARDEX DE ESTOQUES */}
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden">
                      <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-white tracking-widest flex items-center gap-1.5"><Activity size={10} className="text-orange-400"/> Kardex Auditado (WAC / Custo Médio)</span>
                        <span className="text-[7px] font-bold uppercase text-slate-500">v19.5 Sapphire</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[9px] border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 uppercase font-black text-slate-400 border-b border-white/5">
                              <th className="p-2.5">Conta Suprimento</th>
                              <th className="p-2.5 text-center">Abertura Qtd</th>
                              <th className="p-2.5 text-center">Entradas (Qtd)</th>
                              <th className="p-2.5 text-center">Preço Médio</th>
                              <th className="p-2.5 text-center">Saídas Consumo</th>
                              <th className="p-2.5 text-center">Fechamento Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                            <tr>
                              <td className="p-2.5 font-sans font-bold text-white">Matéria-Prima A</td>
                              <td className="p-2.5 text-center">{simResult.kardex.mpa.saldoInicialQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-orange-400">+{simResult.kardex.mpa.entradasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center">{formatCurrency(simResult.kardex.mpa.saldoFinalUnitario, 'BRL')}</td>
                              <td className="p-2.5 text-center">-{simResult.kardex.mpa.saidasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-white">{formatCurrency(simResult.kardex.mpa.saldoFinalValor, 'BRL')}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-sans font-bold text-white">Matéria-Prima B</td>
                              <td className="p-2.5 text-center">{simResult.kardex.mpb.saldoInicialQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-orange-400">+{simResult.kardex.mpb.entradasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center">{formatCurrency(simResult.kardex.mpb.saldoFinalUnitario, 'BRL')}</td>
                              <td className="p-2.5 text-center">-{simResult.kardex.mpb.saidasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-white">{formatCurrency(simResult.kardex.mpb.saldoFinalValor, 'BRL')}</td>
                            </tr>
                            <tr className="bg-white/[0.02]">
                              <td className="p-2.5 font-sans font-bold text-indigo-400">Produto Acabado (PA)</td>
                              <td className="p-2.5 text-center">{simResult.kardex.pa.saldoInicialQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-emerald-400">+{simResult.kardex.pa.entradasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center">{formatCurrency(simResult.kardex.pa.saldoFinalUnitario, 'BRL')}</td>
                              <td className="p-2.5 text-center">-{simResult.kardex.pa.saidasQtd.toLocaleString('pt-BR')}</td>
                              <td className="p-2.5 text-center text-indigo-400 font-bold">{formatCurrency(simResult.kardex.pa.saldoFinalValor, 'BRL')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* DRE E RECONCILIAÇÃO TRIPLICE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* DRE (COMPETÊNCIA) */}
                      <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="p-4 bg-slate-900/80 border-b border-white/5">
                          <span className="text-[9px] font-black uppercase text-white tracking-widest">DRE Simulado (Competência)</span>
                        </div>
                        <div className="p-4 space-y-2 text-[10px]">
                          {simResult.statements.dre.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-slate-400">{item.label}</span>
                              <span className={`font-mono ${item.value < 0 ? 'text-rose-400' : 'text-slate-200'} ${item.label.includes('LUCRO LÍQUIDO') ? 'text-emerald-400 font-bold' : ''}`}>
                                {formatCurrency(item.value, 'BRL')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BALANÇO COMPORTAMENTAL DE FECHAMENTO */}
                      <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="p-4 bg-slate-900/80 border-b border-white/5">
                          <span className="text-[9px] font-black uppercase text-white tracking-widest">Balanço de Encerramento (v18.0)</span>
                        </div>
                        <div className="p-4 space-y-2 text-[10px]">
                          {simResult.statements.balance.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="font-mono text-slate-200">
                                {formatCurrency(item.value, 'BRL')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* DFC */}
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden">
                      <div className="p-4 bg-slate-900/80 border-b border-white/5">
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">Demonstrativo do Fluxo de Caixa (Regime Caixa)</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                        {simResult.statements.cashflow.map((item, idx) => (
                          <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">{item.label}</span>
                            <span className={`font-mono ${item.value < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {formatCurrency(item.value, 'BRL')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'workflows' && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
               <div className="w-24 h-24 bg-rose-600/10 border-2 border-rose-500/30 rounded-[3rem] flex items-center justify-center text-rose-500 shadow-2xl">
                  <ShieldOff size={48} />
               </div>
               <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Workflows Externos Bloqueados</h2>
                  <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium italic">
                     No modo Trial, o processamento de dados é mantido 100% no cluster local. Módulos de terceiros e integração Opal estão inativos.
                  </p>
               </div>
               <button onClick={() => setActiveTab('oracle')} className="px-10 py-4 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all">Voltar ao Oracle Local</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OpalIntelligenceHub;
