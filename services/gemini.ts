
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators } from "../types";

/**
 * Obtém uma nova instância do cliente GenAI.
 * Necessário instanciar por chamada conforme diretrizes de runtime em browser.
 */
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * STRATEGOS BP AUDITOR
 * Evaluates the coherence between user-written text and the company's financial reality.
 */
export const auditBusinessPlan = async (section: string, text: string, financialContext: any) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o Auditor Master do Empirion. Analise a coerência desta seção do Plano de Negócios.
      Seção: ${section}
      Texto do Usuário: "${text}"
      Contexto Financeiro (Round Atual): ${JSON.stringify(financialContext)}
      
      Sua tarefa:
      1. Dê uma nota de 1 a 10 para a viabilidade técnica.
      2. Aponte 2 riscos baseados nos números reais da empresa.
      3. Sugira 1 ajuste imediato.
      Idioma: Português (Brasil). Tom: Executivo e direto.`,
      config: { 
        thinkingConfig: { thinkingBudget: 2048 },
        temperature: 0.4
      }
    });

    return response.text || "Auditoria indisponível no momento.";
  } catch (error) {
    console.error("Audit error:", error);
    return "Erro no link de auditoria neural.";
  }
};

/**
 * DECISION COACH
 * Analyzes unsaved decisions and warns about tactical disasters.
 */
export const getLiveDecisionAdvice = async (decisions: DecisionData, branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estas decisões de simulação empresarial (${branch}): ${JSON.stringify(decisions)}.
      Identifique erros fatais como:
      - Preço muito acima da média histórica (~$370).
      - Investimento em máquinas sem caixa suficiente.
      - Marketing insuficiente para o nível de produção.
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
 * TUTOR OUTLOOK
 * Predicts the butterfly effect of changing macro variables.
 */
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

export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string, scenarioType: ScenarioType = 'simulated') => {
  const isReal = scenarioType === 'real';
  const groundingPrompt = isReal 
    ? "Utilize dados reais de mercado e notícias atuais (Google Search) para fundamentar as projeções." 
    : "Baseie-se exclusivamente nos parâmetros simulados fornecidos pelo motor de inteligência Empirion.";

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Empirion Strategos AI. Forneça um briefing estratégico quantitativo para a Rodada ${round} do campeonato "${championshipName}" (${branch}). 
      ${groundingPrompt}
      Analise:
      1. Impactos da volatilidade econômica na margem unitária.
      2. Pontos de sobrevivência competitiva (Preço vs. Custo).
      3. Um aviso específico de 'Cisne Negro' (Black Swan).
      Mantenha o tom executivo e técnico. Máximo 100 palavras. Idioma: Português (Brasil).`,
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

export const generateGazetaNews = async (context: { 
  period: number, 
  leader?: string, 
  inflation?: string,
  focus?: string[],
  style?: 'sensationalist' | 'analytical' | 'neutral',
  scenarioType?: ScenarioType
}) => {
  const focusAreas = context.focus?.join(", ") || "reajuste de insumos, liderança do setor, novos mercados";
  const newsStyle = context.style || "analytical";
  const isReal = context.scenarioType === 'real';
  
  const groundingContext = isReal 
    ? "CORPO DE NOTÍCIA REAL: Pesquise notícias reais da última semana sobre economia e o setor de atuaçao para mesclar com os resultados da simulação."
    : "MODO SIMULADO: Crie notícias puramente fictícias baseadas no comportamento das equipes e nos parâmetros do motor Empirion.";

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 3 manchetes de impacto para o jornal "Gazeta Empirion". 
      Contexto: Fim do Período ${context.period}. Líder atual: ${context.leader || 'Equipe Alpha'}. Inflação: ${context.inflation || '1.0%'}.
      Áreas de Foco definidas pelo Tutor: ${focusAreas}.
      Estilo de Escrita: ${newsStyle}. 
      ${groundingContext}
      
      Instruções:
      1. Crie notícias que reflitam diretamente as áreas de foco.
      2. Mantenha o tom de acordo com o estilo solicitado (${newsStyle}). 
      3. Relacione os eventos à liderança do setor e à estabilidade econômica.
      Idioma: Português (Brasil).`,
      config: { 
        temperature: 0.8,
        tools: isReal ? [{ googleSearch: {} }] : []
      }
    });

    return response.text || "Gazeta em manutenção.";
  } catch (error) { 
    console.error("Gazeta error:", error);
    return "Gazeta offline."; 
  }
};

export const generateBlackSwanEvent = async (branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um evento 'Cisne Negro' (Black Swan) para uma simulação empresarial do setor ${branch}. 
      Forneça Título, Descrição, Impacto Narrativo e Modificadores numéricos.
      Idioma: Português (Brasil).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING },
            modifiers: {
              type: Type.OBJECT,
              properties: {
                inflation: { type: Type.NUMBER },
                demand: { type: Type.NUMBER },
                interest: { type: Type.NUMBER },
                productivity: { type: Type.NUMBER }
              },
              required: ["inflation", "demand", "interest", "productivity"]
            }
          },
          required: ["title", "description", "impact", "modifiers"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) { 
    console.error("Event error:", error);
    return null; 
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
