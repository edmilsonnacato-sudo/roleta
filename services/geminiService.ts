
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRouletteScreenshot = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    Você é um analista especialista em Roleta Europeia. Sua tarefa é analisar o print de uma mesa de roleta, identificar o histórico de números sorteados e sugerir 3 "terminais" (dígito final do número) para apostar.
    
    Regras de Análise:
    1. Identifique os últimos números que saíram.
    2. Analise padrões de repetição ou ausência de terminais (ex: se saíram 4, 14, 24, o terminal 4 é forte).
    3. Se o padrão não estiver claro ou for muito aleatório, sugira "WAIT" (ESPERAR).
    4. Se o padrão for forte, sugira "BET" (APOSTAR) e forneça 3 terminais (0-9).
    5. Limite a análise para o padrão de no máximo duas rodadas (Gale 1).
    6. Seja extremamente rápido e preciso.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image.split(',')[1],
          },
        },
        { text: "Analise o print desta roleta e retorne o resultado no formato JSON especificado." }
      ],
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          terminals: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Os 3 terminais sugeridos para aposta (ex: [1, 4, 7])"
          },
          confidence: {
            type: Type.NUMBER,
            description: "Nível de confiança da análise de 0 a 100"
          },
          action: {
            type: Type.STRING,
            description: "Ação sugerida: 'BET' para apostar ou 'WAIT' para aguardar a próxima rodada"
          },
          reasoning: {
            type: Type.STRING,
            description: "Breve explicação da estratégia identificada"
          },
          detectedHistory: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Os últimos números detectados na imagem"
          }
        },
        required: ["terminals", "confidence", "action", "reasoning", "detectedHistory"]
      },
    },
  });

  const resultStr = response.text.trim();
  return JSON.parse(resultStr) as AnalysisResult;
};
