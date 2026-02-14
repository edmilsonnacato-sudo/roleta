
import { AnalysisResult } from "../types";

// Configuração segura da API Key com suporte a variáveis de ambiente antigas (Vite define)
// @ts-ignore
const GENAI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';

if (!GENAI_API_KEY) {
  console.error("ERRO CRÍTICO: Chave da API Gemini não encontrada! Verifique o arquivo .env");
}

export const analyzeRouletteScreenshot = async (base64Image: string): Promise<AnalysisResult> => {
  // Verificação explícita da chave antes da requisição
  if (!GENAI_API_KEY || GENAI_API_KEY.length < 10) {
    throw new Error("Chave de API ausente ou inválida. Verifique o arquivo .env.");
  }

  // Modelo Estável: Gemini 1.5 Flash (Mais robusto que o experimental 2.0)
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GENAI_API_KEY}`;

  const systemInstruction = `
    ATUE COMO UM ALGORITMO DE PREVISÃO DE ROLETA DE ALTA PERFORMANCE.
    Sua missão: Identificar o padrão ATUAL da roleta e sugerir 3 terminais IMEDIATAMENTE para a próxima jogada.
    
    Regras Críticas:
    1.  **Velocidade**: Analise em milissegundos.
    2.  **Assertividade**: Identifique padrões de repetição, vizinhos ou quebras de sequência.
    3.  **Ação**: Priorize "BET". Só use "WAIT" se o histórico for ilegível.
    4.  **Terminais**: Escolha 3 dígitos finais (0-9) com maior probabilidade estatística baseada no histórico visível.
    5.  **Formato**: Retorne JSON estrito.
  `;

  try {
    // Remover cabeçalho data:image/... se existir
    const cleanBase64 = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstruction },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: cleanBase64
              }
            },
            { text: "Analise o histórico AGORA. Retorne JSON." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json",
        response_schema: {
          type: "OBJECT",
          properties: {
            terminals: {
              type: "ARRAY",
              items: { type: "INTEGER" }
            },
            confidence: { type: "NUMBER" },
            action: {
              type: "STRING",
              enum: ["BET", "WAIT"]
            },
            reasoning: { type: "STRING" },
            detectedHistory: {
              type: "ARRAY",
              items: { type: "INTEGER" }
            }
          },
          required: ["terminals", "confidence", "action", "reasoning", "detectedHistory"]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Tentar ler o erro detalhado da API
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro da API Gemini:", errorData);

      if (response.status === 400) {
        throw new Error(`Imagem rejeitada pela IA ou Chave Inválida. Detalhes: ${JSON.stringify(errorData)}`);
      }
      if (response.status === 403) throw new Error("Chave de API inválida ou sem permissão.");
      if (response.status === 429) throw new Error("Limite de requisições excedido. Aguarde.");
      if (response.status === 503) throw new Error("Serviço Gemini temporariamente indisponível.");

      throw new Error(`Erro na API (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extrair o JSON da resposta
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("A IA não retornou nenhuma previsão válida.");
    }

    const parsed = JSON.parse(textOutput);

    // Validação de segurança
    if (!parsed.terminals || !Array.isArray(parsed.terminals)) {
      throw new Error("Formato de resposta inválido da IA.");
    }

    return parsed as AnalysisResult;

  } catch (error: any) {
    console.error("Falha no Gemini Service:", error);
    throw new Error(error.message || "Erro de conexão com a IA.");
  }
};
