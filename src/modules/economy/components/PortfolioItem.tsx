import React from 'react';
import { ICompany, ICompanyShare } from '../types/economy.types';
import './PortfolioItem.scss';
import { useTranslation } from 'react-i18next';

interface PortfolioItemProps {
  share: ICompanyShare;
  company?: ICompany;
  onSellClick?: (companyId: string) => void;
  ownerLabel?: string;
  currencyCode?: string;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({
  share,
  company,
  onSellClick,
  ownerLabel,
  currencyCode,
}) => {
  const currentPrice = company?.sharePrice || share.boughtAtPrice;
  const currentValue = share.sharesCount * currentPrice;
  const investedValue = share.sharesCount * share.boughtAtPrice;
  const pnl = currentValue - investedValue;
  const pnlPercent =
    investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  const isPositive = pnl >= 0;
  const { t } = useTranslation('economy');

  return (
    <div className="portfolio-item">
      <div className="portfolio-item__left">
        <div className="portfolio-icon">
          {company?.name ? company.name.slice(0, 2).toUpperCase() : 'CO'}
        </div>
        <div>
          <div className="portfolio-name">
            {company?.name || `${t('portfolio.companyPrefix')}${share.companyId.slice(0, 8)}`}
          </div>
          <div className="portfolio-meta">
            {t('portfolio.inPortfolio')} <span>{share.sharesCount} {t('portfolio.pcs')}</span> | {t('portfolio.avgPrice')}{' '}
            <span>{share.boughtAtPrice.toFixed(2)} {currencyCode || t('exchange.unit')}</span>
          </div>
          {ownerLabel && (
            <div className="portfolio-meta" style={{ marginTop: '4px', color: '#8b5cf6' }}>
              {t('portfolio.owner')} <span>{ownerLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="portfolio-item__right">
        <div className="portfolio-pnl">
          <div className="current-val">
            {currentValue.toLocaleString('ru-RU')} {currencyCode || t('exchange.unit')}
          </div>
          <div
            className={`pnl-text ${
              isPositive ? 'pnl-text--pos' : 'pnl-text--neg'
            }`}
          >
            {isPositive ? '+' : ''}
            {pnl.toFixed(2)} {currencyCode || t('exchange.unit')} ({isPositive ? '+' : ''}
            {pnlPercent.toFixed(1)}%)
          </div>
        </div>

        {onSellClick && (
          <button
            onClick={() => onSellClick(share.companyId)}
            className="economy-btn economy-btn--secondary"
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            {t('portfolio.sell')}
          </button>
        )}
      </div>
    </div>
  );
};
