import React from 'react';
import { ICurrency } from '../types/economy.types';
import {
  getMinecraftItemInfo,
  getMinecraftEnchantInfo,
} from '../constants/minecraft-items';
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
          <div className="item-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(() => {
              const mainInfo = getMinecraftItemInfo(currency.minecraftItemId);
              return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Основная монета:</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {mainInfo ? mainInfo.icon : null}
                    <span>{mainInfo ? mainInfo.name : currency.minecraftItemId}</span>
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                    ({currency.minecraftItemId})
                  </span>
                </span>
              );
            })()}

            {currency.kopeckItemId &&
              (() => {
                const kopInfo = getMinecraftItemInfo(currency.kopeckItemId);
                return (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>Разменная монета:</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {kopInfo ? kopInfo.icon : null}
                      <span>{kopInfo ? kopInfo.name : currency.kopeckItemId}</span>
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      ({currency.kopeckItemId})
                    </span>
                  </span>
                );
              })()}

            <span className="enchant" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {(() => {
                const enchInfo = currency.minecraftEnchantment
                  ? getMinecraftEnchantInfo(currency.minecraftEnchantment)
                  : null;
                return (
                  <>
                    <span>✨ Чары:</span>
                    <strong>
                      {enchInfo
                        ? enchInfo.name
                        : currency.minecraftEnchantment || 'Не указано'}
                    </strong>
                    {currency.minecraftEnchantment && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                        ({currency.minecraftEnchantment})
                      </span>
                    )}
                  </>
                );
              })()}
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

