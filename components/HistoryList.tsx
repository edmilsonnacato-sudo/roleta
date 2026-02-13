
import React from 'react';
import { BetHistory } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  items: BetHistory[];
}

export const HistoryList: React.FC<Props> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
        <p className="text-slate-500 font-medium">Nenhuma análise realizada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group transition-all hover:bg-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
              <img src={item.imageUrl} alt="Print" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[8px] font-bold text-white uppercase">Ver</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  item.result.action === 'BET' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {item.result.action === 'BET' ? 'Entrada' : 'Espera'}
                </span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-slate-400 text-xs">
                  {format(item.timestamp, "HH:mm:ss", { locale: ptBR })}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                {item.result.terminals.map(t => (
                  <span key={t} className="mono text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    T{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Confiança</div>
              <div className="mono text-sm font-bold text-slate-300">{item.result.confidence}%</div>
            </div>
            <div className={`w-2 h-8 rounded-full ${
              item.result.action === 'BET' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
