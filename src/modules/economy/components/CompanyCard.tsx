import React from 'react';
import { ICompany } from '../types/economy.types';
import Button from '../../../shared/ui/button/button.component';
import './CompanyCard.scss';

interface CompanyCardProps {
  company: ICompany;
  isOwner?: boolean;
  currencyCode?: string;
  onBuyClick?: (companyId: string) => void;
  onSellClick?: (companyId: string) => void;
  onIpoClick?: (companyId: string) => void;
  onDividendsClick?: (companyId: string) => void;
  onChartClick?: (companyId: string) => void;
  onChangePriceClick?: (companyId: string) => void;
  onDetailsClick?: (companyId: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isOwner,
  currencyCode = 'ед.',
  onBuyClick,
  onSellClick,
  onIpoClick,
  onDividendsClick,
  onChartClick,
  onChangePriceClick,
  onDetailsClick,
}) => {
  const isPositive = company.priceChange24h >= 0;
  const marketCap = company.totalShares * company.sharePrice;

  return (
    <div className="company-card">
      <div className="company-card__content">
        <div className="company-card__header">
          <div className="company-card__top-bar">
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
            <span
              className={`company-card__badge ${
                company.isPublic
                  ? 'company-card__badge--public'
                  : 'company-card__badge--private'
              }`}
            >
              {company.isPublic ? 'Торгуется на бирже' : 'Частная'}
            </span>
          </div>

          <div className="company-card__title-box">
            <h3 className="company-title">
              <span>{company.name}</span>
              <button
                className="copy-btn"
                title="Скопировать ID фирмы"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(company.id);
                  alert('ID фирмы скопирован: ' + company.id);
                }}
              >
                📋
              </button>
            </h3>
            <div className="owner">
              Владелец: <strong>{company.ownerUsername}</strong>
            </div>
          </div>
        </div>

        {company.description && (
          <p className="company-card__desc">{company.description}</p>
        )}

        {company.isPublic ? (
          <>
            <div className="company-card__stats">
              <div className="stat-box">
                <div className="stat-label">Цена акции</div>
                <div className="stat-value">
                  <span>{company.sharePrice.toFixed(2)} {currencyCode}</span>
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
                  {marketCap.toLocaleString('ru-RU')} {currencyCode}
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
          <div className="company-card__shares-bar company-card__shares-bar--unlisted">
            <span className="label">Компания еще не вышла на биржу</span>
          </div>
        )}
      </div>

      <div className="company-card__actions">
        {company.isPublic ? (
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            {onBuyClick && (
              <Button
                type="button"
                callback={() => onBuyClick(company.id)}
                style={{ flex: 1 }}
              >
                Купить акции
              </Button>
            )}
            {onSellClick && (
              <Button
                type="button"
                callback={() => onSellClick(company.id)}
                secondary={true}
                style={{ flex: 1 }}
              >
                Продать
              </Button>
            )}
          </div>
        ) : (
          isOwner &&
          onIpoClick && (
            <Button type="button" callback={() => onIpoClick(company.id)}>
              Подать заявку на IPO
            </Button>
          )
        )}

        {isOwner && company.isPublic && company.availableShares < company.totalShares && onDividendsClick && (
          <Button
            type="button"
            callback={() => onDividendsClick(company.id)}
            secondary={true}
          >
            Выплатить дивиденды
          </Button>
        )}

        {company.isPublic && onChartClick && (
          <Button
            type="button"
            callback={() => onChartClick(company.id)}
            secondary={true}
          >
            📈 График
          </Button>
        )}

        {company.isPublic && onChangePriceClick && (
          <Button
            type="button"
            callback={() => onChangePriceClick(company.id)}
            secondary={true}
            style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}
          >
            ⚙️ Изменить цену
          </Button>
        )}

        {onDetailsClick && (
          <Button
            type="button"
            callback={() => onDetailsClick(company.id)}
            secondary={true}
          >
            🏢 Подробнее о фирме
          </Button>
        )}
      </div>
    </div>
  );
};
