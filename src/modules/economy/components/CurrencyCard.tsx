import React from 'react';
import { ICurrency } from '../types/economy.types';

interface CurrencyCardProps {
  currency: ICurrency;
  isRuler?: boolean;
  onIssueClick?: (currencyId: string) => void;
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  isRuler,
  onIssueClick,
}) => {
  const isPositive = currency.rateChange24h >= 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-xl text-cyan-400">
              {currency.code}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{currency.name}</h3>
              <div className="text-xs text-slate-400">
                Тикер: <span className="font-mono text-cyan-300">{currency.code}</span>
              </div>
            </div>
          </div>

          <div
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}
          >
            {isPositive ? '+' : ''}
            {currency.rateChange24h.toFixed(2)}% (24ч)
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Материальный носитель (Креатив)
          </div>
          <div className="text-xs text-slate-200 font-mono flex items-center justify-between">
            <span>Предмет: {currency.minecraftItemId}</span>
            <span className="text-amber-400 font-semibold">
              ✨ {currency.minecraftEnchantment}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <div className="text-xs text-slate-400">В обращении (Эмиссия)</div>
            <div className="text-lg font-bold text-white mt-1">
              {currency.totalIssued.toLocaleString('ru-RU')}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <div className="text-xs text-slate-400">Золотой резерв</div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              {currency.reserves.toLocaleString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Автоматический курс</div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              1 {currency.code} = {currency.exchangeRate.toFixed(4)} AR
            </div>
          </div>
          <div className="text-[11px] text-slate-400 max-w-[120px] text-right">
            Формула: (Резерв + Мощь) / Эмиссия
          </div>
        </div>
      </div>

      {isRuler && onIssueClick && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => onIssueClick(currency.id)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            Эмитировать валюту
          </button>
        </div>
      )}
    </div>
  );
};
