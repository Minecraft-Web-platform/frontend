import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ICurrency } from '../types/economy.types';
import {
  getMinecraftItemInfo,
  getMinecraftEnchantInfo,
} from '../constants/minecraft-items';
import { economyService } from '../services/economy.service';
import { MiniHistoryChart } from './MiniHistoryChart';
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
  const { t } = useTranslation('economy');
  const navigate = useNavigate();
  const isPositive = currency.rateChange24h >= 0;

  return (
    <div className="currency-card">
      <div>
        <div className="currency-card__header">
          <div className="code-box">
            <div className="icon-box" style={currency.stateFlagUrl ? { padding: 0, overflow: 'hidden' } : {}}>
              {currency.stateFlagUrl ? (
                <img 
                  src={currency.stateFlagUrl} 
                  alt={currency.code}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                currency.code
              )}
            </div>
            <div className="title-box">
              <h3>{currency.name}</h3>
              <div className="ticker">
                {t('currencies.ticker', { code: currency.code })}
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
            {t('currencies.rateChange24h', {
              change: `${isPositive ? '+' : ''}${currency.rateChange24h.toFixed(2)}`
            })}
          </div>
        </div>

        <div className="currency-card__creative-info">
          <div className="label">
            {t('currencies.backingTitle')}
          </div>
          <div className="item-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(() => {
              const mainInfo = getMinecraftItemInfo(currency.minecraftItemId);
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span className="item-label" style={{ fontSize: '13px' }}>{t('currencies.baseItem')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mainInfo ? mainInfo.icon : null}
                    <span>{mainInfo ? t(`minecraftItems.${mainInfo.id}`, mainInfo.name) : currency.minecraftItemId}</span>
                  </span>
                </div>
              );
            })()}

            {currency.kopeckItemId &&
              (() => {
                const kopInfo = getMinecraftItemInfo(currency.kopeckItemId);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span className="item-label" style={{ fontSize: '13px' }}>{t('currencies.changeItem')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {kopInfo ? kopInfo.icon : null}
                      <span>{kopInfo ? t(`minecraftItems.${kopInfo.id}`, kopInfo.name) : currency.kopeckItemId}</span>
                    </span>
                  </div>
                );
              })()}

            {currency.minecraftEnchantment &&
              (() => {
                const enchInfo = getMinecraftEnchantInfo(currency.minecraftEnchantment);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px', borderTop: '1px dashed var(--border-color, #e2e8f0)' }}>
                    <span className="item-label" style={{ fontSize: '13px' }}>{t('currencies.protectionCharm')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#7c3aed' }}>
                      <span>{enchInfo ? enchInfo.icon : '✨'}</span>
                      <span>{enchInfo ? t(`minecraftEnchants.${enchInfo.id}`, enchInfo.name) : currency.minecraftEnchantment}</span>
                    </span>
                  </div>
                );
              })()}
          </div>
        </div>

        <div className="currency-card__stats">
          <div className="stat-box">
            <div className="stat-label">{t('currencies.inCirculation')}</div>
            <div className="stat-value">
              {currency.totalIssued.toLocaleString()}
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-label">{t('currencies.goldReserve')}</div>
            <div className="stat-value stat-value--gold">
              {currency.reserves.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="currency-card__rate-box">
          <div>
            <div className="rate-label">{t('currencies.autoRate')}</div>
            <div className="rate-val">
              {t('currencies.rateFormula', { code: currency.code, rate: currency.exchangeRate.toFixed(4) })}
            </div>
          </div>
          <div className="rate-hint">
            {t('currencies.formulaHint')}
          </div>
        </div>
        <MiniHistoryChart 
          fetchHistory={() => economyService.getCurrencyRateHistory(currency.id)} 
          triggerRefetch={currency.exchangeRate} 
        />
        
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => navigate(`/economy/currency/${currency.id}`)}
            className="economy-btn economy-btn--outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {t('currencies.historyBtn')}
          </button>
        </div>
      </div>

      {isRuler && onIssueClick && (
        <div className="currency-card__footer">
          <button
            onClick={() => onIssueClick(currency.id)}
            className="economy-btn economy-btn--primary"
            style={{ width: '100%' }}
          >
            {t('currencies.emitBtn')}
          </button>
        </div>
      )}
    </div>
  );
};

