import React from 'react';
import { ICompany, ICompanyShare } from '../types/economy.types';

interface PortfolioItemProps {
  share: ICompanyShare;
  company?: ICompany;
  onSellClick?: (companyId: string) => void;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({
  share,
  company,
  onSellClick,
}) => {
  const currentPrice = company?.sharePrice || share.boughtAtPrice;
  const currentValue = share.sharesCount * currentPrice;
  const investedValue = share.sharesCount * share.boughtAtPrice;
  const pnl = currentValue - investedValue;
  const pnlPercent =
    investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-600 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-sm text-purple-300">
          {company?.name ? company.name.slice(0, 2).toUpperCase() : 'CO'}
        </div>
        <div>
          <div className="text-sm font-bold text-white">
            {company?.name || `Компания #${share.companyId.slice(0, 8)}`}
          </div>
          <div className="text-xs text-slate-400">
            В портфеле: <span className="text-white font-mono">{share.sharesCount} шт.</span> | Ср. цена:{' '}
            <span className="font-mono">{share.boughtAtPrice.toFixed(2)} AR</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm font-bold text-white font-mono">
            {currentValue.toLocaleString('ru-RU')} AR
          </div>
          <div
            className={`text-xs font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {pnl.toFixed(2)} AR ({isPositive ? '+' : ''}
            {pnlPercent.toFixed(1)}%)
          </div>
        </div>

        {onSellClick && (
          <button
            onClick={() => onSellClick(share.companyId)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-all"
          >
            Продать
          </button>
        )}
      </div>
    </div>
  );
};
