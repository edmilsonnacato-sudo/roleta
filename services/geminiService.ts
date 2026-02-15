
import { AnalysisResult } from "../types";

/**
 * Serviço de Análise via Google Gemini (Visão Computacional)
 * Substitui o OCR local (Tesseract) por uma IA de Nuvem muito mais poderosa.
 */
// Cache do modelo que funcionou (evita descoberta repetida - economiza 2-3s)
let cachedModel: string | null = null;

/**
 * Serviço de Análise via Google Gemini (Visão Computacional)
 * OTIMIZADO para velocidade máxima (usa cache de modelo).
 */
export const analyzeRouletteScreenshot = async (base64Image: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("Chave de API inválida. Configure nas opções.");
  }

  console.log("🔑 Usando API Key:", apiKey.substring(0, 5) + "...");

  try {
    // OTIMIZAÇÃO: Usar modelo em cache (economiza 2-3 segundos)
    if (cachedModel) {
      console.log(`⚡ Usando modelo em cache: ${cachedModel}`);
      try {
        const apiVersion = cachedModel.includes('exp') || cachedModel.includes('preview') ? 'v1beta' : 'v1';
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${cachedModel}:generateContent?key=${apiKey}`;
        return await executeGeminiRequest(url, base64Image);
      } catch (error) {
        console.warn("⚠️ Cache falhou, redescobrir...");
        cachedModel = null;
      }
    }

    // Descobrir modelos (só se necessário)
    console.log("🔍 Descobrindo modelos...");
    const availableModels = await discoverAvailableModels(apiKey);

    if (availableModels.length === 0) {
      throw new Error("Nenhum modelo de IA disponível.");
    }

    // Tentar modelos descobertos
    let lastError: Error | null = null;

    for (const modelName of availableModels) {
      try {
        console.log(`🤖 Tentando: ${modelName}`);
        const apiVersion = modelName.includes('exp') || modelName.includes('preview') ? 'v1beta' : 'v1';
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

        const result = await executeGeminiRequest(url, base64Image);

        // SUCESSO: Cachear modelo
        cachedModel = modelName;
        console.log(`✅ Modelo cacheado: ${modelName}`);
        return result;

      } catch (error: any) {
        console.warn(`⚠️ Falha em ${modelName}:`, error.message);
        lastError = error;

        // Se for erro de chave inválida, não adianta tentar outros modelos
        const msg = error.message || '';
        if (msg.includes('403') || msg.includes('KEY_INVALID') || msg.includes('API_KEY_INVALID')) {
          throw new Error(`Chave API inválida: ${msg}`);
        }
      }
    }

    // Se chegou aqui, todos falharam
    throw lastError || new Error("Todos os modelos falharam.");

  } catch (error: any) {
    console.error("❌ Erro fatal:", error);
    throw error;
  }
};

/**
 * Descobre os modelos disponíveis para a chave API
 */
async function discoverAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      console.error("Erro ao listar modelos:", response.status);
      // Fallback: usar modelos conhecidos
      return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    }

    const data = await response.json();
    const models = data.models || [];

    // Filtrar apenas modelos que suportam generateContent (visão/texto)
    const validModels = models
      .filter((m: any) => {
        const methods = m.supportedGenerationMethods || [];
        return methods.includes('generateContent');
      })
      .map((m: any) => m.name.replace('models/', '')) // Remover prefixo 'models/'
      .filter((name: string) =>
        // Priorizar modelos Gemini (não Imagen/Veo que são de imagem/vídeo)
        name.includes('gemini') || name.includes('gemma')
      );

    return validModels.length > 0 ? validModels : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

  } catch (error) {
    console.error("Erro ao descobrir modelos:", error);
    // Fallback em caso de erro de rede
    return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }
}

// Função auxiliar para fazer a requisição
async function executeGeminiRequest(url: string, base64Image: string): Promise<AnalysisResult> {
  const systemInstruction = `
SISTEMA DE VISÃO ROLETA - ANÁLISE RÁPIDA

OCR: Leia TODOS os números na barra de histórico (esquerda=recente, direita=antigo). Números 0-36.

ANÁLISE: Identifique padrões (terminais repetidos, sequências) e sugira:
- 3 terminais (0-9)
- 2 dúzias (1,2 ou 3)

FORMATO JSON:
{
  "detectedHistory": [20, 14, 2, ...],
  "terminals": [1, 2, 3],
  "dozens": [1, 2],
  "confidence": 90,
  "action": "BET",
  "reasoning": "Padrão identificado"
}
  `;

  try {
    // Limpar header do base64 se houver
    const cleanBase64 = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    const payload = {
      contents: [{
        parts: [
          { text: systemInstruction },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: cleanBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1 // Baixa criatividade (foco em exatidão)
        // response_mime_type removido (incompatível com v1 endpoint)
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Erro Gemini (${response.status}): ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) throw new Error("Sem resposta da IA.");

    // Limpar markdown code blocks (caso a IA envolva em ```json ... ```)
    textOutput = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(textOutput);

    // Validação básica do retorno
    return {
      terminals: result.terminals || [],
      dozens: result.dozens || [],
      confidence: result.confidence || 0,
      action: result.action || "WAIT",
      reasoning: result.reasoning || "Análise indisponível",
      detectedHistory: result.detectedHistory || []
    };

  } catch (error: any) {
    console.error("Erro Gemini:", error);
    // Retornamos um erro estruturado para o App tratar
    throw error;
  }
};
