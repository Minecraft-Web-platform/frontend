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
  onChartClick?: (companyId: string) => void;
  onChangePriceClick?: (companyId: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isOwner,
  onBuyClick,
  onSellClick,
  onIpoClick,
  onDividendsClick,
  onChartClick,
  onChangePriceClick,
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
              <h3 className="company-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {company.name}
                <button
                  title="Скопировать ID фирмы"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(company.id);
                    alert('ID фирмы скопирован: ' + company.id);
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1rem' }}
                >
                  📋
                </button>
              </h3>
              <div className="owner">
                Владелец: <strong>{company.ownerUsername}</strong>
              </div>
            </div>
          </div>

          <span
            className={`company-card__badge ${company.isPublic
              ? 'company-card__badge--public'
              : 'company-card__badge--private'
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

        {company.isPublic ? (
          <>
            <div className="company-card__stats">
              <div className="stat-box">
                <div className="stat-label">Цена акции</div>
                <div className="stat-value">
                  <span>{company.sharePrice.toFixed(2)} ед.</span>
                  <span
                    className={`change-pill ${isPositive ? 'change-pill--pos' : 'change-pill--neg'
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
          </>
        ) : (
          <div className="company-card__shares-bar" style={{ justifyContent: 'center', opacity: 0.7 }}>
            <span className="label">Компания еще не вышла на биржу</span>
          </div>
        )}
      </div>

      <div className="company-card__actions" style={{ flexDirection: 'column' }}>
        {company.isPublic ? (
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
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
          </div>
        ) : (
          isOwner &&
          onIpoClick && (
            <button
              onClick={() => onIpoClick(company.id)}
              className="economy-btn economy-btn--primary"
              style={{ width: '100%' }}
            >
              Подать заявку на IPO
            </button>
          )
        )}

        {isOwner && onDividendsClick && (
          <button
            onClick={() => onDividendsClick(company.id)}
            className="economy-btn economy-btn--secondary"
            style={{ width: '100%' }}
          >
            Выплатить дивиденды {isOwner ? '1' : '0'}
          </button>
        )}

        {company.isPublic && onChartClick && (
          <button
            onClick={() => onChartClick(company.id)}
            className="economy-btn economy-btn--secondary"
            style={{ width: '100%' }}
          >
            📈 График
          </button>
        )}

        {company.isPublic && onChangePriceClick && (
          <button
            onClick={() => onChangePriceClick(company.id)}
            className="economy-btn economy-btn--secondary"
            style={{ width: '100%', color: '#8b5cf6', borderColor: '#8b5cf6' }}
          >
            ⚙️ Изменить цену
          </button>
        )}
      </div>
    </div>
  );
};
