
import React, { useState, useRef, useEffect } from 'react';
import { GameStatus, AnalysisResult, BetHistory } from './types';
import { extractNumbersFromImage } from './services/ocrService';
import { analyzeRealHistory } from './services/realAnalysisService';
import { compressImage } from './services/imageUtils';
import { HistoryList } from './components/HistoryList';
import { Upload, AlertOctagon, Aperture, Activity, Wifi, ShieldCheck, Clock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if ((status === GameStatus.SUCCESS || currentResult) && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status, timer, currentResult]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(GameStatus.ANALYZING);
    setIsProcessing(true);
    setError(null);
    setTimer(0);
    setCurrentResult(null);

    try {
      // 1. Processamento Visual para Display
      const compressedBase64 = await compressImage(file, 1000, 0.7);

      // 2. OCR Local (Extração REAL dos números)
      // Pode demorar um pouco mais (2-4s), mas é real
      const extractedData = await extractNumbersFromImage(file);

      // 3. Análise Lógica Real
      const result = analyzeRealHistory(extractedData.numbers);

      setCurrentResult(result);
      setStatus(GameStatus.SUCCESS);
      setIsProcessing(false);
      setTimer(15);

      // Adicionar ao histórico visual
      const newHistoryItem: BetHistory = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        result: result,
        imageUrl: compressedBase64
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 15));

    } catch (err: any) {
      console.error(err);
      setError("Falha na leitura óptica. Verifique se a imagem está nítida.");
      setStatus(GameStatus.ERROR);
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-100 font-sans tracking-tight overflow-x-hidden selection:bg-emerald-500/30 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2600&auto=format&fit=crop')`
      }}
    >

      {/* VIVID GLASS HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] ring-1 ring-white/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]"></div>
              <Aperture className="w-5 h-5 text-white animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h1 className="font-display font-black text-base tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-500 leading-none drop-shadow-md">
                QUANTUM
              </h1>
              <span className="text-[10px] font-mono text-yellow-400 tracking-[0.25em] font-bold block mt-0.5 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                CASINO ELITE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-black/80 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse"></div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">SYSTEM ON</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-5 max-w-md mx-auto space-y-8">

        {/* GLASS SCANNER BUTTON */}
        <div className="relative group perspective-1000">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={status === GameStatus.ANALYZING}
            className={`
              w-full relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 ease-out transform backdrop-blur-xl shadow-2xl
              ${status === GameStatus.ANALYZING
                ? 'bg-black/70 border-yellow-500/50 h-72 shadow-[inset_0_0_50px_rgba(234,179,8,0.2)]'
                : 'bg-gradient-to-br from-black/50 via-black/70 to-black/50 border-white/20 hover:border-yellow-400 hover:shadow-[0_0_60px_rgba(234,179,8,0.3)] h-72 active:scale-[0.98]'
              }
            `}
          >
            {status === GameStatus.ANALYZING ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute inset-0 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wifi className="w-10 h-10 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-yellow-400 font-display text-sm font-bold tracking-[0.2em] uppercase animate-pulse drop-shadow-lg">Decodificando</span>
                  <span className="text-white/50 text-[10px] uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">Algoritmo Neural v2.0</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6 transition-all duration-300 group-hover:-translate-y-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm relative z-10 group-hover:border-yellow-400/50 transition-colors">
                    <Upload className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" strokeWidth={2} />
                  </div>
                </div>

                <div className="text-center space-y-2 z-10">
                  <h3 className="font-display text-white text-2xl font-black tracking-wide drop-shadow-md">ESCANEAR AGORA</h3>
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold tracking-wider shadow-black drop-shadow-sm">IA CONECTADA</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tech Guidelines */}
            <div className="absolute top-6 left-6 w-2 h-2 bg-white/30 rounded-full"></div>
            <div className="absolute top-6 right-6 w-2 h-2 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-2 h-2 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/30 rounded-full"></div>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="p-3 bg-red-500/20 rounded-xl shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-red-400 font-black text-sm uppercase tracking-wider">Erro de Leitura</span>
              <span className="text-red-200 text-xs font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* High Voltage Results */}
        {currentResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">

            {/* MASSIVE DECISION CARD */}
            <div className={`
              relative overflow-hidden rounded-[2.5rem] border-[3px] p-8 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 backdrop-blur-xl
              ${currentResult.action === 'BET'
                ? 'bg-green-950/70 border-emerald-400 shadow-[0_0_100px_rgba(16,185,129,0.4)]'
                : 'bg-amber-950/70 border-amber-500 shadow-[0_0_100px_rgba(245,158,11,0.4)]'}
            `}>

              <div className="relative z-10 flex flex-col items-center gap-6 w-full">

                {/* Confidence Badge */}
                <div className={`
                  px-5 py-2 rounded-full border-2 text-xs font-black tracking-[0.3em] uppercase backdrop-blur-md shadow-lg
                  ${currentResult.action === 'BET' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/30' : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/30'}
                `}>
                  {currentResult.action === 'BET' ? 'OPORTUNIDADE ALTA' : 'ALTA VOLATILIDADE'}
                </div>

                {/* MAIN ACTION TEXT */}
                <div className="flex items-center justify-center gap-2 w-full scale-110">
                  <span className={`
                     font-display text-[4rem] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b drop-shadow-2xl
                     ${currentResult.action === 'BET'
                      ? 'from-white via-emerald-200 to-emerald-600 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]'
                      : 'from-white via-amber-200 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]'}
                   `}>
                    {currentResult.action === 'BET' ? 'ENTRAR' : 'ESPERAR'}
                  </span>
                </div>

                {/* VIVID TIMER (If Bet) */}
                {currentResult.action === 'BET' && (
                  <div className="w-full space-y-3">
                    <div className="w-full bg-black/40 h-14 rounded-2xl border-2 border-emerald-500/30 flex items-center px-5 relative overflow-hidden shadow-inner">
                      <div className="flex items-center gap-3 z-10 w-full justify-between">
                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">Tempo de Aposta</span>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                          <Clock className={`w-4 h-4 ${timer < 5 ? 'text-red-500 animate-ping' : 'text-white'}`} />
                          <span className="font-mono text-xl font-bold text-white tracking-widest">{timer.toString().padStart(2, '0')}s</span>
                        </div>
                      </div>
                      <div
                        className="absolute left-0 bottom-0 top-0 bg-gradient-to-r from-emerald-600/50 to-emerald-400/50 transition-all duration-1000 ease-linear"
                        style={{ width: `${(timer / 15) * 100}%` }}
                      ></div>
                    </div>

                    {/* Validade do Sinal */}
                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-slate-400 bg-black/20 py-1.5 rounded-lg border border-white/5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>SINAL VÁLIDO POR: <span className="text-white">3 RODADAS</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* NEON TERMINALS */}
            <div className={`transition-all duration-500 ${currentResult.action === 'BET' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-md">Terminais Alvo</span>
                  </div>
                  <span className="text-[10px] font-mono text-black font-bold bg-emerald-400 px-2 py-1 rounded shadow-[0_0_10px_rgba(52,211,153,0.8)]">{currentResult.confidence}% PRECISAO</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {currentResult.terminals.map((terminal, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-black border-2 border-white/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-yellow-400 hover:scale-105 transition-all duration-200 shadow-xl">
                      <span className="font-display text-5xl text-white font-black group-hover:text-yellow-400 transition-colors z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{terminal}</span>
                      <span className="text-[9px] font-mono text-slate-500 mt-2 z-10 font-bold uppercase tracking-widest group-hover:text-yellow-500">Terminal</span>
                      {/* Inner Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-xs text-slate-300 leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-yellow-400 font-bold uppercase tracking-wide text-[10px] block mb-1">Motivo da Entrada:</span>
                    {currentResult.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Glass History Strip */}
            <div className="overflow-x-auto pb-4 scrollbar-hide pt-2">
              <div className="flex gap-2 px-1 justify-center">
                {currentResult.detectedHistory.map((num, i) => (
                  <div key={i} className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono border-2 backdrop-blur-md shadow-lg
                      ${num === 0 ? 'bg-emerald-600/80 border-emerald-400 text-white shadow-emerald-500/30' : 'bg-black/60 border-white/10 text-slate-300'}
                      ${i === 0 ? 'border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-110 z-10' : ''}
                   `}>
                    {num}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* History List */}
        <section className="pt-6 border-t border-white/10">
          <HistoryList items={history} />
        </section>

      </main>
    </div>
  );
};

export default App;
