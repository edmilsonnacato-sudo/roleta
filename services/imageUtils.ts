
/**
 * Utilitário para processamento e compressão de imagens no cliente.
 * Foco em velocidade extrema e redução de tamanho para envio rápido à API.
 */
export const compressImage = (file: File, maxWidth: number = 1000, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Validação básica de tipo
        if (!file.type.match(/image.*/)) {
            reject(new Error("O arquivo selecionado não é uma imagem válida."));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar mantendo proporção apenas se for maior que o limite
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Falha crítica ao processar imagem no navegador.'));
                    return;
                }

                // Preencher fundo branco para imagens transparentes (PNG) sendo convertidas para JPEG
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);

                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Sempre exportar como JPEG processado para garantir compatibilidade com a IA
                // A IA processa JPEGs de forma muito eficiente e remove a complexidade do canal alfa
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            img.onerror = () => reject(new Error("Falha ao decodificar os dados da imagem. O arquivo pode estar corrompido."));
        };

        reader.onerror = () => reject(new Error("Falha na leitura do arquivo local."));
    });
};

/**
 * Pré-processamento dedicado para OCR.
 * Converte para escala de cinza e aumenta drasticamente o contraste.
 * Essencial para ler prints de roleta com fundo colorido/escuro.
 */
export const preprocessImageForOCR = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context error');

                // OTIMIZAÇÃO DE TAMANHO (Smart Scale)
                // Tesseract prefere caracteres com ~30-50px de altura.
                // Vamos forçar a altura da imagem para 90px (seguro para leitura).
                // Isso padroniza o tempo de processamento, evitando imagens gigantes ou minúsculas.
                const targetHeight = 90;
                const scaleFactor = targetHeight / img.height;

                let w = img.width * scaleFactor;
                let h = targetHeight;

                // Limite de largura para não explodir a memória
                if (w > 1500) {
                    const ratio = 1500 / w;
                    w = 1500;
                    h = h * ratio;
                }

                canvas.width = w;
                canvas.height = h;

                // Smoothing 'high' ajuda a alisar serrilhados antes do threshold
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Algoritmo: High-Pass Filter (Otimizado)
                // Algoritmo: High-Contrast RGB Filter (Universal)
                // Focado em extrair APENAS os números (Branco, Vermelho, Verde) e ignorar todo o resto (Caixas, Fundo).

                // Algoritmo: Luminância (Brilho Percebido) - "Catch-All"
                // A maneira mais segura de separar "Coisas Brilhantes" (Texto Branco, Vermelho, Verde)
                // de "Coisas Escuras" (Fundo Preto, Caixas Cinza Escuro).

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Algoritmo: Inversão Suave + Contraste (Sem Threshold Duro)
                    // O ERRO ANTERIOR: Ao forçar Preto (0) ou Branco (255), destruímos as bordas suaves (anti-aliasing) das letras.
                    // O Tesseract PRECISA desses tons de cinza para saber as formas das letras.
                    // SOLUÇÃO: Apenas inverter (Fundo Escuro -> Claro) e aumentar o contraste proporcionalmente.

                    // 1. Converter para Cinza (Média simples funciona bem aqui)
                    const avg = (r + g + b) / 3;

                    // 2. Inverter: Escuro (Fundo) vira Claro (Papel). Claro (Texto) vira Escuro (Tinta).
                    let inverted = 255 - avg;

                    // 3. Aumentar Contraste (Stretch)
                    // Empurrar os cinzas escuros para preto e cinzas claros para branco, mas MANTENDO o degradê.
                    // Fórmula: (Valor - 50) * 1.5 -> Ajuste fino para "acender" o texto.
                    inverted = (inverted - 30) * 1.4;

                    // Clampar entre 0 e 255
                    if (inverted < 0) inverted = 0;
                    if (inverted > 255) inverted = 255;

                    data[i] = inverted;     // R
                    data[i + 1] = inverted; // G
                    data[i + 2] = inverted; // B
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 1.0)); // Qualidade máxima
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
