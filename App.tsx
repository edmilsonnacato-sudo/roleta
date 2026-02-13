
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameStatus, AnalysisResult, BetHistory } from './types';
import { analyzeRouletteScreenshot } from './services/geminiService';
import { TerminalDisplay } from './components/TerminalDisplay';
import { HistoryList } from './components/HistoryList';
import { Camera, Upload, AlertCircle, Zap, ShieldCheck, History as HistoryIcon, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer logic for the 15s window
  useEffect(() => {
    let interval: any;
    if (status === GameStatus.SUCCESS && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status, timer]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(GameStatus.ANALYZING);
    setError(null);
    setTimer(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const result = await analyzeRouletteScreenshot(base64);
        
        setCurrentResult(result);
        setStatus(GameStatus.SUCCESS);
        setTimer(15); // Start 15s countdown

        const newHistoryItem: BetHistory = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          result: result,
          imageUrl: base64
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setError("Falha ao analisar a imagem. Certifique-se de que o histórico de números esteja visível.");
      setStatus(GameStatus.ERROR);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ROULETTE<span className="text-emerald-500">PRO</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              PADRÃO GALE 1 ATIVO
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6">
        {/* Action Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            {timer > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-2xl border border-amber-500/20 font-bold mono animate-pulse">
                <Clock className="w-4 h-4" />
                {timer}s RESTANTES
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Análise de IA em Tempo Real</h2>
              <p className="text-slate-400 text-sm">Envie um print do histórico para receber a estratégia</p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />

            <button 
              onClick={triggerFileInput}
              disabled={status === GameStatus.ANALYZING}
              className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
                status === GameStatus.ANALYZING 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {status === GameStatus.ANALYZING ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  PROCESSANDO...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 group-hover:bounce" />
                  ANALISAR PRINT
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {status === GameStatus.ERROR && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {currentResult && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TerminalDisplay result={currentResult} />
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Por que apostar?</h3>
                  <p className="text-slate-200 leading-relaxed italic font-medium">
                    "{currentResult.reasoning}"
                  </p>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Histórico Detectado</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentResult.detectedHistory.map((num, i) => (
                      <span key={i} className={`mono w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                        num === 0 ? 'bg-emerald-600 border-emerald-400' :
                        [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num) 
                          ? 'bg-red-600 border-red-400' 
                          : 'bg-slate-800 border-slate-600'
                      }`}>
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* History Section */}
        <section className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold">Análises Recentes</h3>
          </div>
          <HistoryList items={history} />
        </section>
      </main>

      <footer className="p-8 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
        © 2024 ROULETTE PRO ANALYZER • USE COM RESPONSABILIDADE
      </footer>
    </div>
  );
};

export default App;
