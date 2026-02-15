
import Tesseract from 'tesseract.js';
import { preprocessImageForOCR } from './imageUtils';

export interface ExtractedData {
    numbers: number[];
    confidence: number;
}

/**
 * Serviço de OCR Local para Rouleta
 * Utiliza Tesseract.js para extrair os números do print.
 * Otimizado para identificar dígitos (0-9) e limpar ruídos.
 */
export const extractNumbersFromImage = async (imageFile: File | string): Promise<ExtractedData> => {
    let worker: Tesseract.Worker | null = null;
    try {
        worker = await Tesseract.createWorker('eng');

        // Configurar para buscar APENAS números
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
        });

        // 1. TENTATIVA COM FILTRO (Grayscale + Inversão)
        const processedImageBase64 = await preprocessImageForOCR(imageFile as File);
        const result1 = await worker.recognize(processedImageBase64);

        const text1 = result1.data.text;
        const confidence1 = result1.data.confidence;

        const numbers1 = parseNumbers(text1);

        // Se o filtro funcionou bem (3+ números), retorna
        if (numbers1.length >= 3) {
            return {
                numbers: numbers1.slice(0, 12),
                confidence: confidence1
            };
        }

        // 2. TENTATIVA COM IMAGEM ORIGINAL (Fallback)
        // Se o filtro falhou, usamos a imagem original ainda com o mesmo worker ativo
        console.warn("OCR: Filtro insuficiente, tentando imagem original...");
        const result2 = await worker.recognize(imageFile);
        const numbers2 = parseNumbers(result2.data.text);

        if (numbers2.length >= 3) {
            return {
                numbers: numbers2.slice(0, 12),
                confidence: 80 // Confiança estimada para fallback
            };
        }

        // Falha Total
        console.warn("OCR: Falha em ambas tentativas.");
        return { numbers: [], confidence: 0 };

    } catch (error) {
        console.error("Erro no OCR:", error);
        return { numbers: [], confidence: 0 };
    } finally {
        // SEMPRE encerrar o worker para liberar memória
        if (worker) {
            await worker.terminate();
        }
    }
};

// Helper para limpar e parsear números
const parseNumbers = (text: string): number[] => {
    return text.replace(/[^0-9\s]/g, ' ').trim()
        .split(/\s+/)
        .map(num => parseInt(num, 10))
        .filter(n => !isNaN(n) && n >= 0 && n <= 36);
};
