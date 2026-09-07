import React from 'react';
import { useTranslation } from 'react-i18next';
import { ICompany, ICompanyShare } from '../types/economy.types';
import { PortfolioItem } from './PortfolioItem';

interface PortfolioTabProps {
  portfolio: ICompanyShare[];
  companies: ICompany[];
  buyerProfiles: { type: string; id: string; label: string }[];
  getCurrencyCode: (company?: { exchangeStateId?: string | null }) => string;
  setSellCompanyId: (id: string | null) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  portfolio,
  companies,
  buyerProfiles,
  getCurrencyCode,
  setSellCompanyId,
}) => {
  const { t } = useTranslation('economy');

  return (
    <div className="portfolio-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {portfolio.length > 0 ? (
        portfolio.map((item) => (
          <PortfolioItem
            key={item.id}
            share={item}
            company={companies.find((c) => c.id === item.companyId)!}
            ownerLabel={buyerProfiles.find(p => p.id === item.ownerId && p.type === item.ownerType)?.label || t('exchange.portfolio.unknownOwner')}
            currencyCode={getCurrencyCode(companies.find((c) => c.id === item.companyId))}
            onSellClick={(id) => setSellCompanyId(id)}
          />
        ))
      ) : (
        <div className="economy-empty">
          {t('exchange.portfolio.empty')}
        </div>
      )}
    </div>
  );
};
