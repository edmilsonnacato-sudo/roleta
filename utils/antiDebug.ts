/**
 * PROTEÇÃO ANTI-DEVTOOLS & ANTI-CÓPIA
 * Bloqueia ferramentas de desenvolvedor e tentativas de inspeção
 */

// Detecta se DevTools está aberto (baseado no tamanho da janela)
const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        // DevTools detectado
        document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #000;
        color: #ff0000;
        font-family: monospace;
        font-size: 24px;
        text-align: center;
      ">
        ⚠️ ACESSO NEGADO<br/>
        <small style="font-size: 14px; color: #999;">Sistema de proteção ativo</small>
      </div>
    `;
    }
};

// Bloqueia atalhos do teclado
const blockShortcuts = (e: KeyboardEvent) => {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }

    // Ctrl+S (Save)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
};

// Bloqueia botão direito
const blockRightClick = (e: MouseEvent) => {
    e.preventDefault();
    return false;
};

// Bloqueia seleção de texto (dificulta cópia)
const blockSelection = () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    // @ts-ignore
    document.body.style.msUserSelect = 'none';
    // @ts-ignore
    document.body.style.mozUserSelect = 'none';
};

// Limpa console periodicamente (dificulta análise)
const clearConsole = () => {
    setInterval(() => {
        console.clear();
    }, 2000);
};

// Inicializar proteções
export const initAntiDebug = () => {
    // Bloquear atalhos
    document.addEventListener('keydown', blockShortcuts);

    // Bloquear botão direito
    document.addEventListener('contextmenu', blockRightClick);

    // Bloquear seleção
    blockSelection();

    // Detectar DevTools (verificar a cada 500ms)
    setInterval(detectDevTools, 500);

    // Limpar console
    clearConsole();

    // Log de proteção
    console.log('%c🛡️ Sistema de Proteção Ativo', 'color: #00ff00; font-size: 20px; font-weight: bold;');
    console.log('%c⚠️ Acesso e cópia não autorizados são proibidos', 'color: #ff0000; font-size: 14px;');
};
