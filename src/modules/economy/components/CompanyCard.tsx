import React from 'react';
import { ICompany } from '../types/economy.types';
import './CompanyCard.scss';

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
    <div className="company-card">
      <div>
        <div className="company-card__header">
          <div className="company-info">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="logo-img"
              />
            ) : (
              <div className="logo-fallback">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="title-box">
              <h3>{company.name}</h3>
              <div className="owner">
                Владелец: <strong>{company.ownerUsername}</strong>
              </div>
            </div>
          </div>

          <span
            className={`public-badge ${
              company.isPublic
                ? 'public-badge--public'
                : 'public-badge--private'
            }`}
          >
            {company.isPublic ? 'Торгуется на бирже' : 'Частная'}
          </span>
        </div>

        {company.description && (
          <p className="company-card__desc">
            {company.description}
          </p>
        )}

        <div className="company-card__stats">
          <div className="stat-box">
            <div className="stat-label">Цена акции</div>
            <div className="stat-value">
              <span>{company.sharePrice.toFixed(2)} ед.</span>
              <span
                className={`change-pill ${
                  isPositive ? 'change-pill--pos' : 'change-pill--neg'
                }`}
              >
                {isPositive ? '+' : ''}
                {company.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Капитализация</div>
            <div className="stat-value stat-value--gold">
              {marketCap.toLocaleString('ru-RU')} ед.
            </div>
          </div>
        </div>

        <div className="company-card__shares-bar">
          <span className="label">Доступно акций на бирже:</span>
          <span className="value">
            {company.availableShares} / {company.totalShares}
          </span>
        </div>
      </div>

      <div className="company-card__actions">
        {company.isPublic ? (
          <>
            {onBuyClick && (
              <button
                onClick={() => onBuyClick(company.id)}
                className="economy-btn economy-btn--primary"
                style={{ flex: 1 }}
              >
                Купить акции
              </button>
            )}
            {onSellClick && (
              <button
                onClick={() => onSellClick(company.id)}
                className="economy-btn economy-btn--secondary"
                style={{ flex: 1 }}
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
              className="economy-btn economy-btn--primary"
              style={{ width: '100%' }}
            >
              Провести IPO
            </button>
          )
        )}

        {isOwner && onDividendsClick && (
          <button
            onClick={() => onDividendsClick(company.id)}
            className="economy-btn economy-btn--success"
            style={{ width: '100%', marginTop: '4px' }}
          >
            Выплатить дивиденды
          </button>
        )}
      </div>
    </div>
  );
};

