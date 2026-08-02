import React from 'react';
import { useSearchParams } from 'react-router';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { BankPage } from './BankPage';
import { CompaniesListPage } from './CompaniesListPage';
import { StockExchangePage } from './StockExchangePage';
import { CurrenciesPage } from './CurrenciesPage';
import { CardsPage } from './CardsPage';
import './EconomyHubPage.scss';

export type EconomyTabId = 'bank' | 'cards' | 'companies' | 'exchange' | 'currencies';

export const EconomyHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as EconomyTabId) || 'bank';

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
              <span>📈</span> Экономический Центр Сервера
            </h1>
            <p className="economy-hub__subtitle">
              Единая платформа управления финансовыми активами, банковскими счетами, 
              коммерческими предприятиями, национальной валютой и инвестициями на бирже.
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
                  <div className="card-title">Банки и Счета</div>
                  <div className="card-desc">
                    Личные счета, пластиковые карты, переводы и казначейства
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
                  <div className="card-title">Банковские Карты</div>
                  <div className="card-desc">
                    Пластиковые карты, реквизиты, блокировка и безопасность
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
                  <div className="card-title">Компании</div>
                  <div className="card-desc">
                    Реестр фирм, регистрация бизнеса и дивиденды
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
                  <div className="card-title">Фондовая Биржа</div>
                  <div className="card-desc">
                    Покупка и продажа акций публичных компаний сервера
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
                  <div className="card-title">Валютный Рынок</div>
                  <div className="card-desc">
                    Курсы национальных валют государств и эмиссия
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
          </div>
        </div>
      </main>
    </div>
  );
};
