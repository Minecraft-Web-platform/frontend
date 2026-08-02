import React from 'react';
import { ICompany, ICompanyShare } from '../types/economy.types';
import './PortfolioItem.scss';

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
    <div className="portfolio-item">
      <div className="portfolio-item__left">
        <div className="portfolio-icon">
          {company?.name ? company.name.slice(0, 2).toUpperCase() : 'CO'}
        </div>
        <div>
          <div className="portfolio-name">
            {company?.name || `Компания #${share.companyId.slice(0, 8)}`}
          </div>
          <div className="portfolio-meta">
            В портфеле: <span>{share.sharesCount} шт.</span> | Ср. цена:{' '}
            <span>{share.boughtAtPrice.toFixed(2)} ед.</span>
          </div>
        </div>
      </div>

      <div className="portfolio-item__right">
        <div className="portfolio-pnl">
          <div className="current-val">
            {currentValue.toLocaleString('ru-RU')} ед.
          </div>
          <div
            className={`pnl-text ${
              isPositive ? 'pnl-text--pos' : 'pnl-text--neg'
            }`}
          >
            {isPositive ? '+' : ''}
            {pnl.toFixed(2)} ед. ({isPositive ? '+' : ''}
            {pnlPercent.toFixed(1)}%)
          </div>
        </div>

        {onSellClick && (
          <button
            onClick={() => onSellClick(share.companyId)}
            className="economy-btn economy-btn--secondary"
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            Продать
          </button>
        )}
      </div>
    </div>
  );
};

