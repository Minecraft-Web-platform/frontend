import React from 'react';
import { ICompany } from '../types/economy.types';
import { IState } from '../../states/types/states.types';
import { TradingChart } from './TradingChart';
import Button from '../../../shared/ui/button/button.component';

interface MarketTabProps {
  companies: ICompany[];
  statesList: IState[];
  currentUsername: string;
  mainCurrencyCode: string;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  setBuyCompanyId: (id: string | null) => void;
  setSellCompanyId: (id: string | null) => void;
  setChangePriceCompanyId: (id: string | null) => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({
  companies,
  statesList,
  currentUsername,
  mainCurrencyCode,
  selectedCompanyId,
  setSelectedCompanyId,
  setBuyCompanyId,
  setSellCompanyId,
  setChangePriceCompanyId,
}) => {
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Левая колонка: График и действия */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {selectedCompany ? (
          <>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #d2d2d8', padding: '24px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
              <h2 style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 600 }}>{selectedCompany.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{selectedCompany.sharePrice} {mainCurrencyCode}</span>
                  <div style={{ fontSize: '14px', color: selectedCompany.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                    {selectedCompany.priceChange24h >= 0 ? '+' : ''}{selectedCompany.priceChange24h.toFixed(2)}% (24ч)
                  </div>
                </div>
              </h2>
              <TradingChart company={selectedCompany} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                type="button"
                callback={() => setBuyCompanyId(selectedCompany.id)}
                style={{ flex: 1 }}
              >
                Купить акции
              </Button>
              <Button
                type="button"
                callback={() => setSellCompanyId(selectedCompany.id)}
                secondary={true}
                style={{ flex: 1 }}
              >
                Продать акции
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
                      ⚙️ Изменить цену
                    </Button>
                  );
                }
                return null;
              })()}
            </div>
          </>
        ) : (
          <div className="economy-empty" style={{ background: '#fff', border: '1px solid #d2d2d8', borderRadius: '16px', padding: '40px' }}>
            {companies.filter(c => c.isPublic).length === 0 
              ? "На бирже пока нет публичных компаний. Владельцы фирм могут провести IPO!"
              : "Выберите компанию в списке справа для просмотра котировок."}
          </div>
        )}
      </div>

      {/* Правая колонка: Список акций */}
      <div style={{ width: '320px', flexShrink: 0, background: '#fff', borderRadius: '16px', border: '1px solid #d2d2d8', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, fontSize: '16px' }}>
          Акции на рынке
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {companies.filter(c => c.isPublic).map(company => (
            <div 
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              style={{ 
                padding: '16px', 
                borderBottom: '1px solid #f1f5f9', 
                cursor: 'pointer',
                background: selectedCompanyId === company.id ? '#f0f4ff' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s',
                borderLeft: selectedCompanyId === company.id ? '4px solid #3b82f6' : '4px solid transparent'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{company.name}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{company.sharePrice}</div>
                <div style={{ fontSize: '12px', color: company.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                  {company.priceChange24h >= 0 ? '+' : ''}{company.priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
