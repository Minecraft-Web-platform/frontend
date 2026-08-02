import React from 'react';
import { ICurrency } from '../types/economy.types';
import './CurrencyCard.scss';

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
    <div className="currency-card">
      <div>
        <div className="currency-card__header">
          <div className="code-box">
            <div className="icon-box">
              {currency.code}
            </div>
            <div className="title-box">
              <h3>{currency.name}</h3>
              <div className="ticker">
                Тикер: <strong>{currency.code}</strong>
              </div>
            </div>
          </div>

          <div
            className={`change-badge ${
              isPositive
                ? 'change-badge--positive'
                : 'change-badge--negative'
            }`}
          >
            {isPositive ? '+' : ''}
            {currency.rateChange24h.toFixed(2)}% (24ч)
          </div>
        </div>

        <div className="currency-card__creative-info">
          <div className="label">
            Материальный носитель (1 ед. = 100 коп.)
          </div>
          <div className="item-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>Основная монета: <strong>{currency.minecraftItemId}</strong></span>
            {currency.kopeckItemId && (
              <span>Разменная монета: <strong>{currency.kopeckItemId}</strong></span>
            )}
            <span className="enchant">
              ✨ Чары: {currency.minecraftEnchantment || 'Без чар'}
            </span>
          </div>
        </div>

        <div className="currency-card__stats">
          <div className="stat-box">
            <div className="stat-label">В обращении (Эмиссия)</div>
            <div className="stat-value">
              {currency.totalIssued.toLocaleString('ru-RU')}
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Золотой резерв</div>
            <div className="stat-value stat-value--gold">
              {currency.reserves.toLocaleString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="currency-card__rate-box">
          <div>
            <div className="rate-label">Автоматический курс</div>
            <div className="rate-val">
              1 {currency.code} = {currency.exchangeRate.toFixed(4)} ед. эталона
            </div>
          </div>
          <div className="rate-hint">
            Формула: (Резерв + Мощь) / Эмиссия
          </div>
        </div>
      </div>

      {isRuler && onIssueClick && (
        <div className="currency-card__footer">
          <button
            onClick={() => onIssueClick(currency.id)}
            className="economy-btn economy-btn--primary"
            style={{ width: '100%' }}
          >
            Эмитировать валюту
          </button>
        </div>
      )}
    </div>
  );
};

