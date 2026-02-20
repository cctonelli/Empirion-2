
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators, AnalysisSource, Branch, RegionType, BlackSwanEvent, TransparencyLevel, GazetaMode, StrategicProfile } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const auditBusinessPlan = async (section: string, contextJson: string, history: any[]) => {
  try {
    const ai = getClient();
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
    const ai = getClient();
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
    const ai = getClient();
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
  persistedProfile?: StrategicProfile
): Promise<DecisionData> => {
  try {
    const ai = getClient();
    
    const profiles: Record<StrategicProfile, string> = {
      "AGRESSIVO": "Foco total em conquistar Market Share, preços baixos, marketing massivo e expansão rápida de CAPEX.",
      "CONSERVADOR": "Foco em preservação de caixa, margens altas, preços premium e baixo endividamento.",
      "EFICIENTE": "Foco em otimização de custos de produção, nível de atividade equilibrado e gestão rigorosa de estoque.",
      "INOVADOR": "Foco em P&D, qualidade superior e diferenciação regional via marketing segmentado.",
      "EQUILIBRADO": "Abordagem moderada, balanceando crescimento e solvência sem riscos extremos."
    };
    
    const profile = persistedProfile || "EQUILIBRADO";
    const profileDesc = profiles[profile];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o CEO da empresa "${botName}" em uma simulação empresarial de alta fidelidade (${branch}).
      Estamos no Round ${round}.
      
      SEU PERFIL ESTRATÉGICO: ${profile} - ${profileDesc}
      
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
      - Não adicione explicações fora do JSON.`,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.8
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

export const createChatSession = () => {
  const ai = getClient();
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
    const ai = getClient();
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
    const ai = getClient();
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
    const ai = getClient();
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
