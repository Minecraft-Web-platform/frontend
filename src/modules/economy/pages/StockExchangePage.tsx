import React, { useEffect, useState } from 'react';
import { ICompany, ICompanyShare } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CompanyCard } from '../components/CompanyCard';
import { PortfolioItem } from '../components/PortfolioItem';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import '../economy-shared.scss';

export const StockExchangePage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [portfolio, setPortfolio] = useState<ICompanyShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальные окна покупки/продажи
  const [buyCompanyId, setBuyCompanyId] = useState<string | null>(null);
  const [sellCompanyId, setSellCompanyId] = useState<string | null>(null);
  const [sharesCount, setSharesCount] = useState('10');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [compRes, portRes] = await Promise.all([
        economyService.getPublicCompanies(),
        economyService.getMyPortfolio(),
      ]);
      setCompanies(compRes);
      setPortfolio(portRes);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки биржевых данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      await economyService.buyShares(buyCompanyId, {
        count: parseInt(sharesCount, 10),
      });
      setBuyCompanyId(null);
      setSharesCount('10');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка покупки акций');
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      await economyService.sellShares(sellCompanyId, {
        count: parseInt(sharesCount, 10),
      });
      setSellCompanyId(null);
      setSharesCount('10');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка продажи акций');
    }
  };

  // Расчет общей стоимости портфеля
  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    const comp = companies.find((c) => c.id === item.companyId);
    const price = comp?.sharePrice || item.boughtAtPrice;
    return acc + item.sharesCount * price;
  }, 0);

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {/* Заголовок или компактная плашка */}
      {embedded ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d2d2d8',
              borderRadius: '16px',
              padding: '12px 18px',
              textAlign: 'right',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#535353',
                marginBottom: '2px',
              }}
            >
              Стоимость портфеля
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#000000',
                fontFamily: 'monospace',
              }}
            >
              {totalPortfolioValue.toLocaleString('ru-RU')} ед.
            </div>
          </div>
        </div>
      ) : (
        <div className="economy-hero">
          <div>
            <h1 className="hero-title">
              <span>📈</span> Фондовая Биржа и Инвестиции
            </h1>
            <p className="hero-subtitle">
              Торговля акциями публичных компаний, котировки и выплата
              дивидендов
            </p>
          </div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d2d2d8',
              borderRadius: '16px',
              padding: '12px 18px',
              textAlign: 'right',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#535353',
                marginBottom: '2px',
              }}
            >
              Стоимость портфеля
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#000000',
                fontFamily: 'monospace',
              }}
            >
              {totalPortfolioValue.toLocaleString('ru-RU')} ед.
            </div>
          </div>
        </div>
      )}

          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Вкладки */}
          <div className="economy-tabs">
            <button
              onClick={() => setActiveTab('market')}
              className={`economy-tab ${
                activeTab === 'market' ? 'economy-tab--active' : ''
              }`}
            >
              Торговый зал (Рынок)
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`economy-tab ${
                activeTab === 'portfolio' ? 'economy-tab--active' : ''
              }`}
            >
              Мой портфель акционера ({portfolio.length})
            </button>
          </div>

          {loading ? (
            <div className="economy-empty">Загрузка котировок...</div>
          ) : activeTab === 'market' ? (
            <div>
              {companies.length === 0 ? (
                <div className="economy-empty">
                  На бирже пока нет публичных компаний. Владельцы фирм могут
                  провести IPO!
                </div>
              ) : (
                <div className="economy-grid">
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onBuyClick={(id) => setBuyCompanyId(id)}
                      onSellClick={(id) => setSellCompanyId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {portfolio.length === 0 ? (
                <div className="economy-empty">
                  Ваш инвестиционный портфель пуст. Купите акции на рынке, чтобы
                  получать дивиденды!
                </div>
              ) : (
                portfolio.map((item) => (
                  <PortfolioItem
                    key={item.id}
                    share={item}
                    company={companies.find((c) => c.id === item.companyId)}
                    onSellClick={(id) => setSellCompanyId(id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Модальное окно покупки акций */}
          {buyCompanyId && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Покупка акций</h3>
                <form onSubmit={handleBuySubmit} className="modal-form">
                  <label>
                    <span>Количество акций (шт.)</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={sharesCount}
                      onChange={(e) => setSharesCount(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '4px 0 0',
                    }}
                  >
                    При активной скупке акций курс компании на бирже автоматически
                    растет.
                  </p>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setBuyCompanyId(null)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--success"
                    >
                      Купить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно продажи акций */}
          {sellCompanyId && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Продажа акций с биржи</h3>
                <form onSubmit={handleSellSubmit} className="modal-form">
                  <label>
                    <span>Количество акций для продажи (шт.)</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={sharesCount}
                      onChange={(e) => setSharesCount(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '4px 0 0',
                    }}
                  >
                    Средства будут зачислены на ваш личный счет в национальной валюте.
                  </p>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setSellCompanyId(null)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--danger"
                    >
                      Продать
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );

  return embedded ? (
    content
  ) : (
    <div className="page">
      <Sidebar />
      <main className="content">{content}</main>
    </div>
  );
};
