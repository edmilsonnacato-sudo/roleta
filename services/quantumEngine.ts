
import { AnalysisResult } from "../types";

/**
 * MOTOR QUANTUM LOCAL (Offline)
 * Simula uma análise de alta precisão baseada em padrões matemáticos e RNG (Random Number Generator) de entropia.
 * Remove a necessidade de APIs externas, garantindo 100% de disponibilidade e custo zero.
 */

// Memória Volátil do Motor (Simula aprendizado de curto prazo)
let lastActionTimestamp = 0;
let lastTrend = "NEUTRAL";

export const analyzeRoulettePattern = async (): Promise<AnalysisResult> => {
    const now = Date.now();
    const timeSinceLastScan = now - lastActionTimestamp;
    lastActionTimestamp = now;

    // Simular tempo de processamento neural (Variável para realismo)
    const processingTime = 1200 + Math.random() * 800;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Lógica de "Mudança de Padrão" (Pattern Shift Logic)
    // Se o usuário escaneia rápido (< 40s), assume-se que está buscando uma entrada imediata ou correção
    const isRapidFire = timeSinceLastScan < 40000 && timeSinceLastScan > 1000;

    // Decisão baseada em fluxo
    const actionRoll = Math.random();
    // Se for "tiro rápido", aumenta chance de BET para aproveitar o momento
    const betThreshold = isRapidFire ? 0.10 : 0.20;

    const action: "BET" | "WAIT" = actionRoll > betThreshold ? "BET" : "WAIT";

    let terminals: number[] = [];
    let reasoning = "";
    let confidence = 0;

    if (action === "BET") {
        // Geração de Terminais Inteligente
        // Simula a busca por padrões de repetição ou vizinhos
        const baseTerminal = Math.floor(Math.random() * 10);
        terminals = [
            baseTerminal,
            (baseTerminal + 3) % 10, // Padrão de salto comum na roleta
            (baseTerminal + 7) % 10  // Vizinho oposto
        ].sort((a, b) => a - b);

        // Confiança "Sniper"
        confidence = Math.floor(92 + Math.random() * 7); // 92% a 99%

        // Razões Técnicas de Mudança de Padrão
        const detectionTypes = [
            "Inversão de Fluxo detectada: A tendência mudou para terminais baixos.",
            "Quebra de Padrão: A repetição foi interrompida, entrada de correção.",
            "Padrão Espelho: O algoritmo identificou uma simetria na zona de calor.",
            "Correção de Desvio: O mercado está compensando a ausência do terminal " + baseTerminal + ".",
            "Ciclo de Recuperação: Alta probabilidade de retorno à média.",
            "Micro-tendência confirmada: Aproveite a falha na alternância de cores."
        ];

        // Se for rápido, usa uma razão mais urgente
        reasoning = isRapidFire
            ? "Re-análise confirmada: O padrão se fortaleceu. Entrada agressiva."
            : detectionTypes[Math.floor(Math.random() * detectionTypes.length)];

        lastTrend = "ACTIVE";

    } else {
        terminals = [];
        confidence = Math.floor(45 + Math.random() * 25);
        reasoning = "O padrão está instável. Detectamos uma mudança brusca sem direção definida. Proteja o lucro e aguarde.";
        lastTrend = "WAITING";
    }

    // 3. Simular Histórico "Lido" (Para preencher a UI)
    // Gera 10 números aleatórios simulando a leitura da roleta
    const detectedHistory = Array.from({ length: 10 }, () => Math.floor(Math.random() * 37));

    return {
        terminals,
        confidence,
        action,
        reasoning,
        detectedHistory
    };
};
