
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators, AnalysisSource, Branch, RegionType, BlackSwanEvent } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditBusinessPlan = async (section: string, text: string, financialContext: any) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o Auditor Master do Empirion, com expertise em Venture Capital e Consultoria Estratégica. 
      Analise a viabilidade comercial desta seção do Plano de Negócios.
      
      Seção Atual: ${section}
      Conteúdo Fornecido: "${text}"
      Contexto da Unidade (Simulação): ${JSON.stringify(financialContext)}
      
      Sua tarefa:
      1. Critique de forma construtiva a lógica estratégica (Tom: Direto, Executivo).
      2. Se houver dados financeiros (como ROI ou Break-Even), valide se fazem sentido para o setor.
      3. Aponte 2 falhas críticas que poderiam afastar investidores.
      4. Dê uma nota de 1 a 10 para o "Market Fit" desta seção.
      
      Idioma: Português (Brasil). Máximo 150 palavras.`,
      config: { 
        thinkingConfig: { thinkingBudget: 4096 },
        temperature: 0.5
      }
    });

    return response.text || "Auditoria indisponível no momento.";
  } catch (error) {
    console.error("Audit error:", error);
    return "Erro no link de auditoria neural.";
  }
};

export const getLiveDecisionAdvice = async (decisions: DecisionData, branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estas decisões de simulação empresarial (${branch}): ${JSON.stringify(decisions)}.
      Identifique erros fatais como:
      - Preço muito acima da média histórica (~$370).
      - Investimento em máquinas sem caixa suficiente.
      - Marketing regional fora da escala padrão (0 a 9).
      Seja curto e use tom de alerta tático.`,
      config: { temperature: 0.5 }
    });
    return response.text;
  } catch (err) { 
    console.error("Advice error:", err);
    return null; 
  }
};

/**
 * Geração de Decisão Tática para Competidores Sintéticos (Bots)
 */
export const generateBotDecision = async (
  branch: Branch, 
  round: number, 
  regionCount: number,
  macro: MacroIndicators
): Promise<DecisionData> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o CEO de uma empresa concorrente em uma simulação de ${branch}. 
      Você precisa tomar decisões para o Ciclo ${round}.
      Regiões em disputa: ${regionCount}.
      Cenário Macro: Inflação ${macro.inflation_rate}%, TR ${macro.interest_rate_tr}%.
      
      Gere um objeto JSON de decisões equilibrado mas competitivo. 
      Foque em preço médio de mercado de $370.
      O marketing regional DEVE estar entre 0 e 9.
      Defina uma meta de lucro líquido realista entre 5% e 15%.
      Não seja conservador demais.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  regionId: { type: Type.NUMBER, description: "ID da região de 1 a N" },
                  price: { type: Type.NUMBER, description: "Preço de venda" },
                  term: { type: Type.NUMBER, description: "Prazo médio de recebimento" },
                  marketing: { type: Type.NUMBER, description: "Investimento em marketing de 0 a 9" }
                },
                required: ["regionId", "price", "term", "marketing"]
              }
            },
            hr: {
              type: Type.OBJECT,
              properties: {
                hired: { type: Type.NUMBER },
                fired: { type: Type.NUMBER },
                salary: { type: Type.NUMBER },
                trainingPercent: { type: Type.NUMBER },
                participationPercent: { type: Type.NUMBER },
                sales_staff_count: { type: Type.NUMBER }
              }
            },
            production: {
              type: Type.OBJECT,
              properties: {
                purchaseMPA: { type: Type.NUMBER },
                purchaseMPB: { type: Type.NUMBER },
                paymentType: { type: Type.NUMBER },
                activityLevel: { type: Type.NUMBER },
                rd_investment: { type: Type.NUMBER },
                net_profit_target_percent: { type: Type.NUMBER },
                term_interest_rate: { type: Type.NUMBER }
              }
            },
            finance: {
              type: Type.OBJECT,
              properties: {
                loanRequest: { type: Type.NUMBER },
                loanTerm: { type: Type.NUMBER, description: "Prazo de amortização: 0, 1 ou 2" },
                application: { type: Type.NUMBER },
                buyMachines: {
                  type: Type.OBJECT,
                  properties: {
                    alfa: { type: Type.NUMBER },
                    beta: { type: Type.NUMBER },
                    gama: { type: Type.NUMBER }
                  }
                }
              }
            },
            legal: {
              type: Type.OBJECT,
              properties: {
                recovery_mode: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const cleanedRegions: Record<number, any> = {};
    if (Array.isArray(parsed.regions)) {
        parsed.regions.forEach((r: any) => {
            if (r.regionId) {
                cleanedRegions[r.regionId] = { 
                    price: r.price || 375, 
                    term: r.term || 1, 
                    marketing: Math.min(9, Math.max(0, r.marketing || 0)) // Limita 0-9
                };
            }
        });
    }
    for (let i = 1; i <= regionCount; i++) {
        if (!cleanedRegions[i]) {
            cleanedRegions[i] = { price: 375, term: 1, marketing: 0 };
        }
    }
    
    return {
      judicial_recovery: parsed.legal?.recovery_mode === 'judicial',
      regions: cleanedRegions,
      hr: {
        hired: parsed.hr?.hired || 0,
        fired: parsed.hr?.fired || 0,
        salary: parsed.hr?.salary || 1313,
        trainingPercent: parsed.hr?.trainingPercent || 5,
        participationPercent: parsed.hr?.participationPercent || 2,
        sales_staff_count: parsed.hr?.sales_staff_count || 50,
        misc: 0
      },
      production: {
        purchaseMPA: parsed.production?.purchaseMPA || 15000,
        purchaseMPB: parsed.production?.purchaseMPB || 10000,
        paymentType: parsed.production?.paymentType || 1,
        activityLevel: parsed.production?.activityLevel || 80,
        rd_investment: parsed.production?.rd_investment || 5000,
        extraProductionPercent: 0,
        net_profit_target_percent: parsed.production?.net_profit_target_percent || 10.0,
        term_interest_rate: parsed.production?.term_interest_rate || 1.5
      },
      machinery: {
        buy: parsed.finance?.buyMachines || { alfa: 0, beta: 0, gama: 0 },
        sell: { alfa: 0, beta: 0, gama: 0 }
      },
      finance: {
        loanRequest: parsed.finance?.loanRequest || 0,
        loanTerm: parsed.finance?.loanTerm || 1,
        application: parsed.finance?.application || 0
      },
      estimates: {
        forecasted_revenue: 0,
        forecasted_unit_cost: 0,
        forecasted_net_profit: 0
      }
    };
  } catch (error) {
    console.error("Bot Decision Error:", error);
    return {
      judicial_recovery: false,
      regions: Object.fromEntries(Array.from({ length: regionCount }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 0 }])),
      hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50, misc: 0 },
      production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0, extraProductionPercent: 0, net_profit_target_percent: 10.0, term_interest_rate: 1.5 },
      machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
      finance: { loanRequest: 0, loanTerm: 1, application: 0 },
      estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 }
    };
  }
};

/**
 * Geração de Evento "Cisne Negro" para instabilidade de arena
 * Fix: Implemented missing exported member required by AdminCommandCenter
 */
export const generateBlackSwanEvent = async (branch: Branch): Promise<BlackSwanEvent> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um evento tático do tipo "Cisne Negro" (inesperado e de alto impacto) para uma simulação empresarial de ${branch}.
      O evento deve impactar variáveis macroeconômicas como inflação, demanda ou taxas de juros.
      Retorne obrigatoriamente um JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título curto do evento" },
            description: { type: Type.STRING, description: "O que aconteceu no mundo simulado" },
            impact: { type: Type.STRING, description: "Consequência para as empresas" },
            modifiers: {
              type: Type.OBJECT,
              properties: {
                inflation: { type: Type.NUMBER, description: "Ajuste na inflação (ex: 0.8 para +0.8%)" },
                demand: { type: Type.NUMBER, description: "Ajuste na demanda (ex: -15 para -15%)" },
                interest: { type: Type.NUMBER, description: "Ajuste na taxa TR (ex: 1.5 para +1.5%)" },
                productivity: { type: Type.NUMBER, description: "Ajuste na produtividade (ex: -0.05 para -5%)" }
              },
              required: ["inflation", "demand", "interest", "productivity"]
            }
          },
          required: ["title", "description", "impact", "modifiers"]
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Black Swan Generation error:", error);
    return {
      title: "Instabilidade Logística Global",
      description: "Um bloqueio imprevisto em rotas comerciais principais causou atrasos massivos.",
      impact: "Aumento de custos e redução temporária de demanda.",
      modifiers: {
        inflation: 0.5,
        demand: -10,
        interest: 0,
        productivity: -0.02
      }
    };
  }
};

export const getTutorOutlook = async (macro: MacroIndicators, teamsData: any[]) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Como a alteração para estes indicadores afetará a arena: ${JSON.stringify(macro)}?
      Considere que existem ${teamsData.length} equipes.
      Analise o impacto na taxa de falência e na competitividade geral.`,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (err) { 
    console.error("Outlook error:", err);
    return "Outlook em manutenção."; 
  }
};

export const generateBusinessPlanField = async (
  sectionTitle: string, 
  fieldLabel: string, 
  userContext: string, 
  prompt: string, 
  branch: string
) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Strategos Business Architect do Empirion. 
      Estou elaborando um Plano de Negócios estruturado para uma empresa do setor ${branch}.
      Seção Atual: ${sectionTitle}.
      Campo a preencher: ${fieldLabel}.
      Contexto já fornecido pelo usuário: "${userContext}".
      Sua Tarefa: ${prompt}
      Forneça um texto profissional, detalhado e adequado ao mercado empresarial de elite. Max 200 words.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Não consegui gerar este insight.";
  } catch (error) { 
    console.error("Generator error:", error);
    return "Erro na arquitetura cognitiva."; 
  }
};

export const generateMarketAnalysis = async (
  championshipName: string, 
  round: number, 
  branch: string, 
  analysisSource: AnalysisSource = 'parameterized',
  macroIndicators?: MacroIndicators
) => {
  const isReal = analysisSource === 'ai_real_world';
  
  const groundingPrompt = isReal 
    ? `Utilize o Google Search para buscar dados REAIS atuais do setor de ${branch}. Foque em preços de insumos, tendências de demanda e cenários macroeconômicos reais que afetariam um gestor hoje. Se o setor for Industrial, fale sobre aço e energia.` 
    : `Você deve interpretar os seguintes parâmetros de mercado definidos pelo Tutor: ${JSON.stringify(macroIndicators)}. Analise como a Inflação de ${macroIndicators?.inflation_rate}%, a Variação de Demanda de ${macroIndicators?.demand_variation}% e a TR de ${macroIndicators?.interest_rate_tr}% impactarão o custo operacional e a elasticidade-preço neste ciclo.`;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Oráculo Empirion. Forneça um briefing tático para a Rodada ${round} da arena "${championshipName}".
      Contexto do Setor: ${branch}.
      Fonte da Inteligência: ${analysisSource}.
      
      Diretriz:
      ${groundingPrompt}
      
      Sua tarefa:
      1. Explique o impacto na margem de lucro.
      2. Dê uma recomendação tática sobre precificação.
      3. Cite um "Cisne Negro" (evento inesperado) coerente com o cenário.
      
      Máximo 120 palavras. Idioma: Português (Brasil). Tom: Técnico e Executivo.`,
      config: {
        temperature: 0.6,
        tools: isReal ? [{ googleSearch: {} }] : []
      }
    });

    return response.text || "Mercado estável.";
  } catch (error) { 
    console.error("Market error:", error);
    return "Link tático interrompido."; 
  }
};

export const performGroundedSearch = async (query: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise tendências reais de mercado relevantes para: ${query}. Sintetize para um estrategista empresarial Empirion. Cite fontes.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "Nenhuma inteligência encontrada.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((chunk: any) => chunk.web?.uri).map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title || "Fonte"
    }));

    return { text, sources };
  } catch (error) { 
    console.error("Search error:", error);
    return { text: "Falha na busca.", sources: [] }; 
  }
};

export const createChatSession = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o "Empirion Strategos", mentor de elite em simulações empresariais. 
      Use raciocínio profundo. Ajude com Balanços, DREs, Marketing e RH. Cite conceitos técnicos.`,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};
