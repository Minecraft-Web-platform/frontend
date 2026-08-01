import React from 'react';
import { ICompany } from '../types/economy.types';

interface CompanyCardProps {
  company: ICompany;
  isOwner?: boolean;
  onBuyClick?: (companyId: string) => void;
  onSellClick?: (companyId: string) => void;
  onIpoClick?: (companyId: string) => void;
  onDividendsClick?: (companyId: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isOwner,
  onBuyClick,
  onSellClick,
  onIpoClick,
  onDividendsClick,
}) => {
  const isPositive = company.priceChange24h >= 0;
  const marketCap = company.totalShares * company.sharePrice;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xl text-purple-400">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white">{company.name}</h3>
              <div className="text-xs text-slate-400">
                Владелец: <span className="text-purple-300">{company.ownerUsername}</span>
              </div>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium border ${
              company.isPublic
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-slate-700/40 text-slate-400 border-slate-700'
            }`}
          >
            {company.isPublic ? 'Торгуется на бирже' : 'Частная'}
          </span>
        </div>

        {company.description && (
          <p className="text-xs text-slate-300 mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <div className="text-xs text-slate-400">Цена акции</div>
            <div className="text-lg font-bold text-white mt-1 flex items-baseline justify-between">
              <span>{company.sharePrice.toFixed(2)} AR</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isPositive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {isPositive ? '+' : ''}
                {company.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <div className="text-xs text-slate-400">Капитализация</div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              {marketCap.toLocaleString('ru-RU')} AR
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Доступно акций на бирже:</span>
          <span className="text-white font-mono font-bold">
            {company.availableShares} / {company.totalShares}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
        {company.isPublic ? (
          <>
            {onBuyClick && (
              <button
                onClick={() => onBuyClick(company.id)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/20"
              >
                Купить акции
              </button>
            )}
            {onSellClick && (
              <button
                onClick={() => onSellClick(company.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-xl text-xs transition-all border border-slate-700"
              >
                Продать
              </button>
            )}
          </>
        ) : (
          isOwner &&
          onIpoClick && (
            <button
              onClick={() => onIpoClick(company.id)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all"
            >
              Провести IPO
            </button>
          )
        )}

        {isOwner && onDividendsClick && (
          <button
            onClick={() => onDividendsClick(company.id)}
            className="w-full mt-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold py-2 px-4 rounded-xl text-xs transition-all"
          >
            Выплатить дивиденды
          </button>
        )}
      </div>
    </div>
  );
};
