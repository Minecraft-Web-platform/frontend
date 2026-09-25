import React from 'react';
import { useTranslation } from 'react-i18next';
import { ICompany } from '../types/economy.types';
import { IState } from '../../states/types/states.types';
import { TradingChart } from './TradingChart';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';

interface MarketTabProps {
  companies: ICompany[];
  statesList: IState[];
  currentUsername: string;
  getCurrencyCode: (company?: { exchangeStateId?: string | null }) => string;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  setBuyCompanyId: (id: string | null) => void;
  setSellCompanyId: (id: string | null) => void;
  setChangePriceCompanyId: (id: string | null) => void;
  onBack?: () => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({
  companies,
  statesList,
  currentUsername,
  getCurrencyCode,
  selectedCompanyId,
  setSelectedCompanyId,
  setBuyCompanyId,
  setSellCompanyId,
  setChangePriceCompanyId,
  onBack,
}) => {
  const { t } = useTranslation('economy');
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {onBack && (
        <div style={{ alignSelf: 'flex-start' }}>
          <Button type="button" secondary={true} callback={onBack}>
            &larr; {t('exchange.backToList', 'Back to exchanges')}
          </Button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left column: Chart and actions */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedCompany ? (
            <>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-card)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-headings)' }}>{selectedCompany.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-headings)' }}>{selectedCompany.sharePrice} {getCurrencyCode(selectedCompany)}</span>
                  <div style={{ fontSize: '14px', color: selectedCompany.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                    {selectedCompany.priceChange24h >= 0 ? '+' : ''}{selectedCompany.priceChange24h.toFixed(2)}% {t('exchange.hours24')}
                  </div>
                </div>
              </h2>
              <TradingChart fetchHistory={() => economyService.getCompanySharePriceHistory(selectedCompany.id)} triggerRefetch={selectedCompany.sharePrice} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                type="button"
                callback={() => setBuyCompanyId(selectedCompany.id)}
                style={{ flex: 1, height: '48px', fontSize: '16px' }}
              >
                {t('exchange.buy.submit', 'Buy')}
              </Button>
              <Button
                type="button"
                secondary={true}
                callback={() => setSellCompanyId(selectedCompany.id)}
                style={{ flex: 1, height: '48px', fontSize: '16px' }}
              >
                {t('exchange.sell.submit', 'Sell')}
              </Button>
              
              {(() => {
                const state = statesList.find(s => s.id === selectedCompany.exchangeStateId);
                const isTreasurer = state?.treasurerUsername?.toLowerCase() === currentUsername;
                if (isTreasurer) {
                  return (
                    <Button
                      type="button"
                      callback={() => setChangePriceCompanyId(selectedCompany.id)}
                      secondary={true}
                      style={{ flex: 1, borderColor: '#8b5cf6', color: '#8b5cf6' }}
                    >
                      ⚙️ {t('exchange.changePrice', 'Change price')}
                    </Button>
                  );
                }
                return null;
              })()}
            </div>
          </>
        ) : (
          <div className="economy-empty" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '40px', color: 'var(--text-secondary)' }}>
            {companies.filter(c => c.isPublic).length === 0 
              ? t('exchange.noPublicCompanies', 'There are no public companies on this exchange yet.')
              : t('exchange.selectCompanyToView', 'Select a company from the list on the right to view quotes.')}
          </div>
        )}
      </div>

      {/* Right column: Shares list */}
      <div style={{ width: '320px', flexShrink: 0, background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', fontWeight: 600, fontSize: '16px', color: 'var(--text-headings)' }}>
          {t('exchange.sharesOnMarket', 'Shares on the market')}
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {companies.filter(c => c.isPublic).map(company => (
            <div 
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              style={{ 
                padding: '16px', 
                borderBottom: '1px solid var(--border-subtle)', 
                cursor: 'pointer',
                background: selectedCompanyId === company.id ? 'var(--bg-hover)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s',
                borderLeft: selectedCompanyId === company.id ? '4px solid var(--accent-emerald)' : '4px solid transparent'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-headings)' }}>{company.name}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{company.sharePrice}</div>
                <div style={{ fontSize: '12px', color: company.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                  {company.priceChange24h >= 0 ? '+' : ''}{company.priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};
