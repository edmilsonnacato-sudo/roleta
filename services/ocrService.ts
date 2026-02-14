
import Tesseract from 'tesseract.js';

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
    try {
        // Pré-processamento: O Tesseract funciona melhor com imagens em preto e branco de alto contraste.
        // Como estamos no navegador, vamos assumir que a imagem comprimida já ajuda, 
        // mas podemos configurar o Tesseract para whitelist de números.

        const worker = await Tesseract.createWorker('eng'); // 'eng' é mais rápido para dígitos

        // Configurar para buscar APENAS números
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
        });

        const { data: { text, confidence } } = await worker.recognize(imageFile);

        await worker.terminate();

        // Processar o texto bruto para extrair números
        // Muitas vezes o OCR retorna linhas quebradas ou caracteres estranhos
        const cleanedText = text.replace(/[^0-9\s]/g, ' ').trim();

        // Converter para array de números
        // Filtra números válidos de roleta (0-36)
        const numbers = cleanedText
            .split(/\s+/)
            .map(num => parseInt(num, 10))
            .filter(n => !isNaN(n) && n >= 0 && n <= 36);

        // Se encontrou poucos números, pode ser erro de leitura
        if (numbers.length < 3) {
            console.warn("OCR: Poucos números encontrados", numbers);
            // Retorna array vazio para indicar falha na extração significativa
            return { numbers: [], confidence: 0 };
        }

        return {
            numbers: numbers.slice(0, 12), // Pegar os últimos 10-12 números (histórico recente)
            confidence: confidence
        };

    } catch (error) {
        console.error("Erro no OCR:", error);
        return { numbers: [], confidence: 0 };
    }
};
