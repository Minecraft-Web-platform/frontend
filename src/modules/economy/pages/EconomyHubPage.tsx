import React from 'react';
import { useSearchParams } from 'react-router';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { BankPage } from './BankPage';
import { CompaniesListPage } from './CompaniesListPage';
import { ClientOrdersList } from '../components/ClientOrdersList';
import { StockExchangePage } from './StockExchangePage';
import { CurrenciesPage } from './CurrenciesPage';
import { CardsPage } from './CardsPage';
import { PropertiesPage } from './PropertiesPage';
import { DisputedOrdersTab } from '../components/DisputedOrdersTab';
import './EconomyHubPage.scss';
import { useTranslation } from 'react-i18next';

export type EconomyTabId = 'bank' | 'cards' | 'companies' | 'exchange' | 'currencies' | 'properties' | 'orders' | 'arbitration';

export const EconomyHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as EconomyTabId) || 'bank';
  const { t } = useTranslation('economy');

  const handleSelectTab = (tab: EconomyTabId) => {
    setSearchParams({ tab });
  };

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="economy-hub">
          <div className="economy-hub__hero">
            <h1 className="economy-hub__title">
              {t('hub.title')}
            </h1>
            <p className="economy-hub__subtitle">
              {t('hub.subtitle')}
            </p>

            <div className="economy-hub__cards">
              <div
                className={`economy-hub__card ${
                  activeTab === 'bank' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('bank')}
              >
                <div className="card-icon">🏦</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.bank.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.bank.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'cards' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('cards')}
              >
                <div className="card-icon">💳</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.cards.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.cards.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'companies' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('companies')}
              >
                <div className="card-icon">🏢</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.companies.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.companies.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'orders' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('orders')}
              >
                <div className="card-icon">🛍️</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.orders.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.orders.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'arbitration' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('arbitration')}
              >
                <div className="card-icon">⚖️</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.arbitration.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.arbitration.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'exchange' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('exchange')}
              >
                <div className="card-icon">📈</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.exchange.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.exchange.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'currencies' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('currencies')}
              >
                <div className="card-icon">💰</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.currencies.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.currencies.desc')}
                  </div>
                </div>
              </div>

              <div
                className={`economy-hub__card ${
                  activeTab === 'properties' ? 'economy-hub__card--active' : ''
                }`}
                onClick={() => handleSelectTab('properties')}
              >
                <div className="card-icon">🏠</div>
                <div className="card-info">
                  <div className="card-title">{t('hub.cards.properties.title')}</div>
                  <div className="card-desc">
                    {t('hub.cards.properties.desc')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="economy-hub__content">
            {activeTab === 'bank' && <BankPage embedded={true} />}
            {activeTab === 'cards' && <CardsPage />}
            {activeTab === 'companies' && <CompaniesListPage embedded={true} />}
            {activeTab === 'exchange' && <StockExchangePage embedded={true} />}
            {activeTab === 'currencies' && <CurrenciesPage embedded={true} />}
            {activeTab === 'properties' && <PropertiesPage />}
            {activeTab === 'orders' && <ClientOrdersList />}
            {activeTab === 'arbitration' && <DisputedOrdersTab />}
          </div>
        </div>
      </main>
    </div>
  );
};
