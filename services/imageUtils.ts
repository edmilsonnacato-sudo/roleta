
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
