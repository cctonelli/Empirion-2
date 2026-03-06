
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators, AnalysisSource, Branch, RegionType, BlackSwanEvent, TransparencyLevel, GazetaMode, StrategicProfile } from "../types";

let cachedApiKey: string | null = null;

export const getApiKey = async () => {
  if (cachedApiKey) return cachedApiKey;
  const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (envKey) {
    cachedApiKey = envKey;
    return cachedApiKey;
  }
  try {
    const { getSystemSecret } = await import('./supabase');
    cachedApiKey = await getSystemSecret('GEMINI_API_KEY') || '';
  } catch (e) {
    console.warn("Supabase Secret Fetch Failed:", e);
    cachedApiKey = '';
  }
  return cachedApiKey;
};

export const auditBusinessPlan = async (section: string, contextJson: string, history: any[]) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const context = JSON.parse(contextJson);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o Auditor Master do Empirion, especialista em Business Model Generation (metodologia Osterwalder).
      
      Seção Atual: ${section}
      Epicentro Declarado: ${context.epicenter}
      Canvas Completo: ${JSON.stringify(context.canvas)}
      Histórico de KPIs: ${JSON.stringify(history.map(h => ({ round: h.round, kpis: h.kpis })))}
      
      Sua Tarefa (Fidelidade v18.0):
      1. Verifique se existe COERÊNCIA entre a Proposta de Valor e os Segmentos de Clientes no Canvas.
      2. Critique se as Atividades Chave justificam a Estrutura de Custos.
      3. Analise se o KPI histórico (ex: ROI, Liquidez) reflecte a eficiência do modelo desenhado.
      4. Identifique contradições lógicas (ex: Modelo de baixo custo com marketing agressivo ou parceiros de luxo).
      
      Idioma: Português (Brasil). Máximo 150 palavras. Tom: Direto, Construtivo e Altamente Técnico.`,
      config: { 
        thinkingConfig: { thinkingBudget: 8192 },
        temperature: 0.4
      }
    });

    return response.text || "Auditoria neural interrompida.";
  } catch (error) {
    console.error("Audit error:", error);
    return "Falha no canal de análise estratégica.";
  }
};

export const generateBusinessPlanField = async (
  sectionTitle: string, 
  fieldLabel: string, 
  contextJson: string, 
  prompt: string, 
  branch: string
) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const context = JSON.parse(contextJson);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Strategos Business Architect. 
      Estou usando o framework de Business Model Generation.
      Setor: ${branch}. Seção: ${sectionTitle}.
      Prompt: ${prompt}
      Contexto dos Blocos: ${JSON.stringify(context.canvas)}
      Gere um insight estratégico que conecte a Proposta de Valor aos Recursos Chave. Seja técnico.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Insight indisponível.";
  } catch (error) { 
    console.error("Generator error:", error);
    return "Erro no núcleo cognitivo."; 
  }
};

export const generateDynamicMarketNews = async (
  arenaName: string,
  round: number,
  branch: Branch,
  teamsData: any[],
  macro: MacroIndicators,
  transparency: TransparencyLevel,
  gazetaMode: GazetaMode
) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const isAnonymous = gazetaMode === 'anonymous';
    
    const contextPrompt = `
      Você é o Editor-Chefe da Oracle Gazette, o jornal financeiro do ecossistema Empirion.
      Arena: ${arenaName} | Ciclo: 0${round} | Setor: ${branch}
      
      DADOS DO MERCADO (CRUZADOS):
      ${JSON.stringify(teamsData.map(t => ({
        alias: t.name,
        marketShare: t.market_share,
        equity: t.equity,
        rating: t.rating,
        profit: t.net_profit,
        roi: t.roi
      })))}
      
      CONJUNTURA ECONÔMICA:
      Inflação: ${macro.inflation_rate}% | Juros: ${macro.interest_rate_tr}% | ICE: ${macro.ice}
      ${macro.is_black_swan ? `EVENTO CISNE NEGRO ATIVO: ${macro.black_swan_title}. Descrição: ${macro.black_swan_description}.` : ""}
      
      DIRETRIZES DE PUBLICAÇÃO:
      1. Anonimato: ${isAnonymous ? "SIM. Use apelidos como 'Líder do Setor', 'Empresa A', 'Player Emergente'. NUNCA revele nomes reais." : "NÃO. Use os nomes reais das equipes."}
      2. Transparência: ${transparency}. (Low: foco apenas em macro; Medium: destaque para top 3 players; High/Full: análise detalhada de gaps).
      3. Tom: Profissional, alarmista se houver crise, e focado em métricas (TSR, Market Share).
      4. Idioma: Português (Brasil).
      5. Estrutura: Uma manchete impactante + 3 parágrafos curtos cobrindo: Ocorrências de Mercado, Desempenho do Líder e Alerta de Conjuntura.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: { 
        temperature: 0.8
      }
    });

    return response.text || "Os nodos de comunicação estão em manutenção.";
  } catch (error) {
    console.error("Gazette AI Error:", error);
    return "Falha na transmissão da Oracle Gazette.";
  }
};

export const generateBotDecision = async (
  branch: Branch, 
  round: number, 
  regionCount: number, 
  macro: MacroIndicators,
  botName: string,
  persistedProfile?: StrategicProfile,
  currentKpis?: any
): Promise<DecisionData> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    
    const profiles: Record<StrategicProfile, string> = {
      "AGRESSIVO": "Foco total em conquistar Market Share, preços baixos, marketing massivo e expansão rápida de CAPEX.",
      "CONSERVADOR": "Foco em preservação de caixa, margens altas, preços premium e baixo endividamento.",
      "EFICIENTE": "Foco em otimização de custos de produção, nível de atividade equilibrado e gestão rigorosa de estoque.",
      "INOVADOR": "Foco em P&D, qualidade superior e diferenciação regional via marketing segmentado.",
      "EQUILIBRADO": "Abordagem moderada, balanceando crescimento e solvência sem riscos extremos."
    };
    
    const profile = persistedProfile || "EQUILIBRADO";
    const profileDesc = profiles[profile];
    const randomSeed = Math.random().toString(36).substring(7);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o CEO da empresa "${botName}" em uma simulação empresarial de alta fidelidade (${branch}).
      Estamos no Round ${round}.
      
      SEU PERFIL ESTRATÉGICO: ${profile} - ${profileDesc}
      ID ÚNICO DE SESSÃO (SEED): ${randomSeed}
      
      SUA SITUAÇÃO FINANCEIRA ATUAL (KPIs):
      ${currentKpis ? JSON.stringify(currentKpis) : "Início de operação (Round 0)"}
      
      CENÁRIO MACRO ATUAL:
      ${JSON.stringify(macro)}
      
      INSTRUÇÕES DE DECISÃO:
      1. Defina preços e marketing para ${regionCount} regiões (ID 1 a ${regionCount}).
      2. Decida compras de matéria-prima MPA e MPB (considere que 1 PA = 1 MPA + 1 MPB).
      3. Defina nível de atividade da fábrica (0-100%) e investimento em P&D.
      4. Decida compra de máquinas Alfa, Beta ou Gama se necessário para seu perfil.
      5. Estime seus resultados (Forecast).
      
      REGRAS RÍGIDAS:
      - O campo "regions" deve ser um objeto onde as chaves são números de 1 a ${regionCount}.
      - Retorne APENAS o JSON puro, seguindo exatamente a interface DecisionData.
      - Não adicione explicações fora do JSON.
      - Suas decisões devem ser ÚNICAS e baseadas estritamente no seu perfil e situação financeira atual.`,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.9 // Aumentado para maior variabilidade
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error(`Falha ao gerar decisão para BOT ${botName}:`, error);
    return { 
      judicial_recovery: false, 
      regions: { 1: { price: 425, marketing: 1, term: 0 } }, 
      hr: { hired: 0, fired: 0, salary: 2000 }, 
      production: { purchaseMPA: 5000, purchaseMPB: 5000, activityLevel: 100 }, 
      machinery: { buy: { alfa: 0, beta: 0, gama: 0 } }, 
      finance: { loanRequest: 0 }, 
      estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 } 
    } as any;
  }
};

export const createChatSession = async () => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Gemini API Key missing.");
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Você é o Empirion Strategos, mentor tático assistido por IA. Analise as dúvidas do usuário com foco em TSR, EBITDA e Solvência.',
      thinkingConfig: { thinkingBudget: 8192 }
    },
  });
};

// Fix: Added generateMarketAnalysis as requested by MarketAnalysis.tsx
export const generateMarketAnalysis = async (arenaName: string, round: number, branch: Branch) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o cenário estratégico para a arena de simulação "${arenaName}" no round ${round}. O setor de atuação é ${branch}. 
      Forneça uma previsão tática curta e impactante para o conselho administrativo.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Análise indisponível no momento.";
  } catch (error) {
    console.error("Market Analysis error:", error);
    return "Falha na conexão com o terminal de inteligência.";
  }
};

// Fix: Added performGroundedSearch as requested by MarketAnalysis.tsx
export const performGroundedSearch = async (query: string) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Realize uma pesquisa fundamentada sobre: ${query}. Relacione os dados com tendências de mercado industrial e econômico real.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      })) || [];

    return {
      text: response.text || "Nenhuma informação estratégica encontrada para esta query.",
      sources: sources,
    };
  } catch (error) {
    console.error("Grounded Search error:", error);
    return { text: "Erro no processamento da busca fundamentada.", sources: [] };
  }
};

// Fix: Added generateBlackSwanEvent as requested by AdminCommandCenter.tsx
export const generateBlackSwanEvent = async (branch: Branch): Promise<BlackSwanEvent> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um evento econômico "Cisne Negro" (inesperado, raro e de impacto sistêmico) para uma simulação empresarial no ramo de ${branch}.
      O evento deve trazer desafios reais que exijam pivotagem estratégica das equipes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título impactante do evento" },
            description: { type: Type.STRING, description: "Contexto narrativo do evento" },
            impact: { type: Type.STRING, description: "Resumo técnico do impacto nos mercados" },
            modifiers: {
              type: Type.OBJECT,
              properties: {
                inflation: { type: Type.NUMBER, description: "Variação na inflação (ex: 0.5 para +0.5%)" },
                demand: { type: Type.NUMBER, description: "Variação na demanda global (ex: -15 para -15%)" },
                interest: { type: Type.NUMBER, description: "Variação na taxa de juros (ex: 1.0 para +1.0%)" },
                productivity: { type: Type.NUMBER, description: "Impacto na produtividade (ex: -0.2 para -20%)" }
              },
              required: ["inflation", "demand", "interest", "productivity"]
            }
          },
          required: ["title", "description", "impact", "modifiers"]
        },
        temperature: 0.9,
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Black Swan Generation error:", error);
    return {
      title: "Instabilidade Sistêmica",
      description: "Um evento geopolítico não mapeado causou volatilidade extrema nos nodos econômicos.",
      impact: "Redução generalizada de demanda e aumento nos custos de capital.",
      modifiers: { inflation: 0.2, demand: -10, interest: 1.5, productivity: -0.05 }
    };
  }
};

export const calculateESDS = async (
  currentRound: number,
  branch: Branch,
  currentState: any,
  previousRounds: any[]
) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");
    const ai = new GoogleGenAI({ apiKey });

    const inputData = {
      round: currentRound,
      branch: branch,
      state: currentState,
      previous_rounds: previousRounds
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o motor de diagnóstico financeiro do Empirion. Calcule e interprete o E-SDS v1.1 (Empirion Solvency Dynamics Score versão 1.1), modelo proprietário de solvência dinâmica focado em fluxo de caixa real, dinâmica de rodadas e diferenciação entre estratégia e erro.

Fórmula base (score bruto, sem clip inicial):
E-SDS_raw = (4.0 × Pilar1) + (3.0 × Pilar2_refinado) + (2.0 × Pilar3) + (1.5 × Pilar4) – (2.5 × Pilar5) – (1.0 × Pilar6)

Cálculos usam média móvel das últimas 3 rodadas (ou as disponíveis se menos de 3).

Pilares refinados v1.1:

1. Geração de Caixa Operacional Líquida (Peso 4.0)  
   FCO_Livre / (Passivo_Circulante + Despesas_Operacionais_Projetadas_Proxima_Rodada)  
   - FCO_Livre = Caixa_Operacional - CapEx_Manutenção - Juros_Pagos - Impostos_Pagos  
   - CapEx total = CapEx_Manutenção (obrigatório para operações) + CapEx_Estratégico/Expansão (flag no state ou decisão da equipe).  
   - NÃO deduzir CapEx_Estratégico se for >30% do total e houver indicação de investimento estratégico.  
   - Se FCO_Livre negativo majoritariamente por CapEx_Estratégico, marcar como "investimento fase" no output (não punir como prejuízo operacional).

2. Sustentabilidade do Crescimento Alavancado (Peso 3.0)  
   (Δ_Receita_Líquida_% média 3 rodadas) / (Custo_Médio_Dívida × Alavancagem_Efetiva)  
   - Alavancagem_Efetiva = Dívida_Líquida / max(EBITDA, 0.01)
   - Se PL ≤ 0, use fallback: Dívida_Total / max(abs(PL), 0.01) e adicione warning "Equity wipeout detectado – risco crítico".

3. Margem de Segurança Bruta + Recorrência (Peso 2.0)  
   (EBITDA + Receita_Recorrente_Projetada) / Receita_Total  
   - Threshold ideal: >0.25.

4. Eficiência de Giro de Caixa – Dias de Caixa Operacional (Peso 1.5)  
   Dias_Caixa = (Caixa + Aplicações) / (Despesas_Operacionais_Diárias)  
   - Score normalizado: 10 × (1 - exp(-Dias_Caixa / 60))

5. Penalizador de Alavancagem Excessiva (Peso -2.5)  
   max(0, (Passivo_Total / max(PL, 1)) - 3.0) × (1 + %_Dívida_Curto_Prazo)  
   - Se PL ≤ 0, multiplicar penalidade por 1.5.

6. Penalizador de Volatilidade de Caixa (Peso -1.0)  
   Coeficiente_Variação_FCO (std dev / média das últimas 4 rodadas) × 0.5

Classificação Semáforo:
- Azul: ≥8.0 → Resiliência Elite
- Verde: 5.5–7.9 → Saudável
- Amarelo: 3.0–5.4 → Estresse
- Laranja: 1.5–2.9 → Perigo Iminente
- Vermelho: <1.5 → Insolvência Provável

Identifique o gargalo_principal (o pilar com maior contribuição negativa ou menor contribuição positiva relativa ao peso) e mapeie para uma das categorias: 'Operacional', 'Financeiro', 'Estrutural', 'Estratégico'.

Input de dados:
${JSON.stringify(inputData)}

Output obrigatório em formato JSON:
{
  "esds_raw": number,
  "esds_display": number (clip 0-10 para UI),
  "zone": "Azul/Verde/Amarelo/Laranja/Vermelho",
  "main_drivers": ["string"],
  "gargalo_principal": "Operacional/Financeiro/Estrutural/Estratégico",
  "warnings": ["string"],
  "gemini_insights": "string"
} (Retorne APENAS o JSON)`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      raw: result.esds_raw,
      display: result.esds_display,
      zone: result.zone,
      main_drivers: result.main_drivers,
      gargalo_principal: result.gargalo_principal,
      warnings: result.warnings,
      gemini_insights: result.gemini_insights
    };
  } catch (error) {
    console.error("ESDS Calculation error:", error);
    return null;
  }
};
