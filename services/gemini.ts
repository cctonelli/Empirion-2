
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType } from "../types";

/**
 * Generates market analysis with conditional grounding based on ScenarioType.
 */
export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string, scenarioType: ScenarioType = 'simulated') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const groundingPrompt = scenarioType === 'real' 
    ? "Utilize dados reais de mercado e notícias atuais (Google Search) para fundamentar as projeções." 
    : "Baseie-se exclusivamente nos parâmetros simulados fornecidos pelo tutor da arena.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Empirion Strategos AI. Forneça um briefing estratégico quantitativo para a Rodada ${round} do campeonato "${championshipName}" (${branch}). 
      ${groundingPrompt}
      Analise:
      1. Impactos da volatilidade econômica (TR e Inflação) na margem unitária.
      2. Pontos de sobrevivência competitiva (Preço vs. Custo).
      3. Um aviso específico de 'Cisne Negro' (Black Swan).
      Mantenha o tom executivo e técnico. Máximo 100 palavras. Idioma: Português (Brasil).`,
      config: {
        temperature: 0.6,
        tools: scenarioType === 'real' ? [{ googleSearch: {} }] : []
      }
    });

    return response.text || "Mercado estável. Custos unitários projetados dentro da margem de +/- 2%.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Link tático interrompido. Mantenha postura defensiva.";
  }
};

/**
 * Generates narrative headlines for Gazeta Industrial with ScenarioType awareness.
 */
export const generateGazetaNews = async (context: { 
  period: number, 
  leader?: string, 
  inflation?: string,
  focus?: string[],
  style?: 'sensationalist' | 'analytical' | 'neutral',
  scenarioType?: ScenarioType
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const focusAreas = context.focus?.join(", ") || "análise da CVM, reajuste de insumos, liderança do setor";
  const newsStyle = context.style || "analytical";
  const isReal = context.scenarioType === 'real';
  
  const groundingContext = isReal 
    ? "CORPO DE NOTÍCIA REAL: Pesquise notícias reais da última semana sobre economia e o setor industrial para mesclar com os resultados da simulação."
    : "MODO SIMULADO: Crie notícias puramente fictícias baseadas no comportamento das equipes e nos parâmetros do tutor.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 3 manchetes de impacto para o jornal financeiro "Gazeta Industrial". 
      Contexto: Fim do Período ${context.period}. Líder atual: ${context.leader || 'Empresa 8'}. Inflação: ${context.inflation || '1.0%'}.
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

    return response.text || "Mercado Industrial: Setor aguarda novas diretrizes da CVM para o próximo período.";
  } catch (error) {
    return "Gazeta em manutenção: Aguardando boletim oficial do Conselho de Regulação.";
  }
};

/**
 * Generates a "Black Swan" event for the simulation.
 */
export const generateBlackSwanEvent = async (branch: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um evento 'Cisne Negro' (Black Swan) para uma simulação empresarial do setor ${branch}. 
      O evento deve ser inesperado e ter consequências econômicas drásticas (Ex: Pandemia, Greve Geral, Quebra de Fornecedor Global).
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
                inflation: { type: Type.NUMBER, description: "Aumento na inflação (0.0 a 0.1)" },
                demand: { type: Type.NUMBER, description: "Impacto na demanda (-0.5 a 0.5)" },
                interest: { type: Type.NUMBER, description: "Aumento nos juros (0.0 a 0.1)" },
                productivity: { type: Type.NUMBER, description: "Impacto na produtividade (-0.3 a 0.3)" }
              },
              required: ["inflation", "demand", "interest", "productivity"]
            }
          },
          required: ["title", "description", "impact", "modifiers"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Black Swan Generation Error:", error);
    return null;
  }
};

/**
 * Performs a search-grounded query for real-world intelligence.
 */
export const performGroundedSearch = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise tendências reais de mercado relevantes para: ${query}. Sintetize para um estrategista empresarial. Cite fontes.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "Nenhuma inteligência de busca encontrada.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((chunk: any) => chunk.web?.uri).map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title || "Fonte de Informação"
    }));

    return { text, sources };
  } catch (error) {
    return { text: "Falha no módulo de busca em tempo real.", sources: [] };
  }
};

/**
 * Creates a high-reasoning chat session with Strategos.
 */
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o "Empirion Strategos", o assistente de IA mais avançado do mundo em simulações empresariais. 
      Sua especialidade é modelagem matemática, contabilidade gerencial (padrão Bernard Sistemas) e estratégia competitiva.
      Use o raciocínio profundo para ajudar os usuários a interpretar Balanços, DREs e tomar decisões de Marketing, RH e Produção.
      Sempre cite conceitos como elasticidade-preço, margem de contribuição e ponto de equilíbrio.`,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};
