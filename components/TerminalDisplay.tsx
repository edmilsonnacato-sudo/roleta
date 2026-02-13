
import React from 'react';
import { AnalysisResult } from '../types';
import { Target, TrendingUp, PauseCircle } from 'lucide-react';

interface Props {
  result: AnalysisResult;
}

export const TerminalDisplay: React.FC<Props> = ({ result }) => {
  const isBetting = result.action === 'BET';

  return (
    <div className={`bg-slate-900 border-2 rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
      isBetting ? 'border-emerald-500/30' : 'border-amber-500/30'
    }`}>
      {/* Background Icon Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5">
        {isBetting ? <Target size={200} /> : <PauseCircle size={200} />}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Decisão do Sistema</h3>
          <div className={`text-2xl font-black flex items-center gap-2 ${isBetting ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isBetting ? (
              <><TrendingUp className="w-6 h-6" /> ENTRADA CONFIRMADA</>
            ) : (
              <><PauseCircle className="w-6 h-6" /> AGUARDE PRÓXIMA</>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1">Confiança</span>
          <span className="mono text-xl font-bold">{result.confidence}%</span>
        </div>
      </div>

      {isBetting ? (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm font-medium">Aposte em todos os números com finais:</p>
          <div className="grid grid-cols-3 gap-4">
            {result.terminals.map((term) => (
              <div key={term} className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center transform transition hover:scale-105">
                <span className="text-slate-500 text-[10px] font-bold uppercase mb-1">Terminal</span>
                <span className="mono text-4xl font-black text-emerald-400">{term}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
            <p className="text-emerald-400 text-xs font-bold tracking-tight">PROTEÇÃO NO ZERO RECOMENDADA</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <PauseCircle className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-center text-slate-400 text-sm max-w-[200px]">
            Sem padrão estável detectado no momento. Aguardando novo histórico.
          </p>
        </div>
      )}
    </div>
  );
};
