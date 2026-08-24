import React, { useEffect, useState } from 'react';
import { economyService } from '../services/economy.service';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import useAuthStore from '../../../store/auth.store';
import { ChangePriceModal } from '../components/ChangePriceModal';
import { MarketTab } from '../components/MarketTab';
import { PortfolioTab } from '../components/PortfolioTab';
import Button from '../../../shared/ui/button/button.component';
import '../economy-shared.scss';

import { usePublicCompanies, useMyPortfolio, useStates, useMyCompanies, useCurrencies } from '../hooks/useEconomyData';

export const StockExchangePage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');

  // Модальные окна покупки/продажи
  const [buyCompanyId, setBuyCompanyId] = useState<string | null>(null);
  const [sellCompanyId, setSellCompanyId] = useState<string | null>(null);
  const [sharesCount, setSharesCount] = useState('10');

  // Новые состояния для торгового терминала
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [changePriceCompanyId, setChangePriceCompanyId] = useState<string | null>(null);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);

  const { accessToken } = useAuthStore();
  let currentUsername = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      currentUsername = payload.username_lower || '';
    } catch (e: any) {
      console.error('Failed to get user identities', e);
    }
  }

  const { data: companies = [], isLoading: loadingCompanies, error: compError, mutate: mutateCompanies } = usePublicCompanies();
  const { data: portfolio = [], isLoading: loadingPortfolio, mutate: mutatePortfolio } = useMyPortfolio();
  const { data: statesList = [] } = useStates();
  const { data: myCompanies = [] } = useMyCompanies();
  const { data: currencies = [] } = useCurrencies();
  
  const loading = loadingCompanies || loadingPortfolio;
  const error = compError ? compError.message : null;

  const reloadData = () => {
    mutateCompanies();
    mutatePortfolio();
  };

  // Автовыбор первой компании
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId && selectedExchangeId) {
      const publicCompanies = companies.filter(c => c.isPublic && c.exchangeStateId === selectedExchangeId);
      if (publicCompanies.length > 0) {
        setSelectedCompanyId(publicCompanies[0].id);
      }
    }
  }, [companies, selectedCompanyId, selectedExchangeId]);

  const buyerProfiles = [
    { type: 'player', id: currentUsername, label: 'Личный счет' }
  ];

  statesList.forEach(st => {
    const isTreasurer = st.treasurerUsername?.toLowerCase() === currentUsername?.toLowerCase();
    const isLeader = st.leaderUsername?.toLowerCase() === currentUsername?.toLowerCase();
    if (isTreasurer || isLeader) {
      buyerProfiles.push({ type: 'state', id: st.id, label: `Казна государства ${st.name}` });
    }
  });

  myCompanies.forEach(comp => {
    if (comp.ownerUsername?.toLowerCase() === currentUsername?.toLowerCase()) {
      buyerProfiles.push({ type: 'company', id: comp.id, label: `Счет компании ${comp.name}` });
    }
  });

  const [selectedBuyerProfile, setSelectedBuyerProfile] = useState<string>(`player:${currentUsername}`);
  const [selectedSellerProfile, setSelectedSellerProfile] = useState<string>(`player:${currentUsername}`);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      const sep = selectedBuyerProfile.indexOf(':');
      const type = selectedBuyerProfile.slice(0, sep);
      const id = selectedBuyerProfile.slice(sep + 1);

      await economyService.buyShares(buyCompanyId, {
        count: parseInt(sharesCount, 10),
        buyerType: type as any,
        buyerId: id,
      });
      setBuyCompanyId(null);
      setSharesCount('10');
      reloadData();
    } catch (err: any) {
      alert((err as any).response?.data?.message || (err as any).message || 'Ошибка покупки акций');
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      const sep = selectedSellerProfile.indexOf(':');
      const type = selectedSellerProfile.slice(0, sep);
      const id = selectedSellerProfile.slice(sep + 1);

      await economyService.sellShares(sellCompanyId, {
        count: parseInt(sharesCount, 10),
        sellerType: type as any,
        sellerId: id,
      });
      setSellCompanyId(null);
      setSharesCount('10');
      reloadData();
    } catch (err: any) {
      alert((err as any).response?.data?.message || (err as any).message || 'Ошибка продажи акций');
    }
  };

  const getCurrencyCode = (company?: { exchangeStateId?: string | null }) => {
    if (!company?.exchangeStateId) return 'ед.';
    return currencies.find(curr => curr.stateId === company.exchangeStateId)?.code || 'ед.';
  };

  // Расчет стоимости портфеля по валютам
  const portfolioValuesByCurrency = portfolio.reduce((acc, item) => {
    const comp = companies.find((c) => c.id === item.companyId);
    const price = comp?.sharePrice || item.boughtAtPrice;
    const currency = getCurrencyCode(comp);
    acc[currency] = (acc[currency] || 0) + (item.sharesCount * price);
    return acc;
  }, {} as Record<string, number>);

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
            <div className="value-label">Стоимость портфеля</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#000000',
                fontFamily: 'monospace',
              }}
            >
              {Object.keys(portfolioValuesByCurrency).length > 0 ? (
                Object.entries(portfolioValuesByCurrency).map(([curr, val]) => (
                  <div key={curr}>
                    {val.toLocaleString('ru-RU')} {curr}
                  </div>
                ))
              ) : (
                <div>0 ед.</div>
              )}
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
            <div className="value-label">Стоимость портфеля</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#000000',
                fontFamily: 'monospace',
              }}
            >
              {Object.keys(portfolioValuesByCurrency).length > 0 ? (
                Object.entries(portfolioValuesByCurrency).map(([curr, val]) => (
                  <div key={curr}>
                    {val.toLocaleString('ru-RU')} {curr}
                  </div>
                ))
              ) : (
                <div>0 ед.</div>
              )}
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
        selectedExchangeId ? (
          <MarketTab 
            companies={companies.filter(c => c.exchangeStateId === selectedExchangeId)}
            statesList={statesList}
            currentUsername={currentUsername}
            getCurrencyCode={getCurrencyCode}
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
            setBuyCompanyId={setBuyCompanyId}
            setSellCompanyId={setSellCompanyId}
            setChangePriceCompanyId={setChangePriceCompanyId}
            onBack={() => {
              setSelectedExchangeId(null);
              setSelectedCompanyId(null);
            }}
          />
        ) : (
          <div className="economy-grid">
            {statesList.filter(s => companies.some(c => c.isPublic && c.exchangeStateId === s.id)).map(state => {
              const stateCompanies = companies.filter(c => c.isPublic && c.exchangeStateId === state.id);
              return (
                <div 
                  key={state.id} 
                  className="company-card"
                  onClick={() => setSelectedExchangeId(state.id)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="company-card__content">
                    <div className="company-card__header">
                      <div className="company-card__top-bar">
                        {state.flagUrl ? (
                          <img src={state.flagUrl} alt={state.name} className="logo-img" />
                        ) : (
                          <div className="logo-fallback">{state.name.slice(0, 2).toUpperCase()}</div>
                        )}
                        <span className="company-card__badge company-card__badge--public">
                          Фондовая Биржа
                        </span>
                      </div>
                      <div className="company-card__title-box">
                        <h3 className="company-title">Биржа: {state.name}</h3>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div className="stat-label" style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Компании на бирже ({stateCompanies.length})
                      </div>
                      <div className="marquee-container" style={{ paddingBottom: '8px' }}>
                        {(() => {
                          const needsMarquee = stateCompanies.length > 5;
                          const displayItems = needsMarquee ? [...stateCompanies, ...stateCompanies] : stateCompanies;
                          
                          return (
                            <div className={`marquee-content ${needsMarquee ? 'marquee-content--animate' : ''}`}>
                              {displayItems.map((c, i) => (
                                <div 
                                  key={`${c.id}-${i}`} 
                                  title={c.name}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    flexShrink: 0,
                                    borderRadius: '8px',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  {c.logoUrl ? (
                                    <img src={c.logoUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                                      {c.name.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="company-card__actions">
                    <Button type="button" callback={() => setSelectedExchangeId(state.id)}>
                      Войти в торговый терминал
                    </Button>
                  </div>
                </div>
              );
            })}
            {statesList.filter(s => companies.some(c => c.isPublic && c.exchangeStateId === s.id)).length === 0 && (
              <div className="economy-empty" style={{ gridColumn: '1 / -1' }}>
                В данный момент ни на одной бирже не торгуются акции компаний.
              </div>
            )}
          </div>
        )
      ) : (
        <PortfolioTab 
          portfolio={portfolio}
          companies={companies}
          buyerProfiles={buyerProfiles}
          getCurrencyCode={getCurrencyCode}
          setSellCompanyId={setSellCompanyId}
        />
      )}

      {/* Модальное окно покупки акций */}
      {buyCompanyId && (
        <div className="economy-modal-overlay">
          <div className="economy-modal">
            <h3 className="modal-title">Покупка акций</h3>
            <form onSubmit={handleBuySubmit} className="modal-form">
              <label>
                <span>От чьего лица купить:</span>
                <select
                  value={selectedBuyerProfile}
                  onChange={(e) => setSelectedBuyerProfile(e.target.value)}
                >
                  {buyerProfiles.map(p => (
                    <option key={`${p.type}:${p.id}`} value={`${p.type}:${p.id}`}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
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
              
              {buyCompanyId && sharesCount && !isNaN(parseInt(sharesCount, 10)) && (() => {
                const count = parseInt(sharesCount, 10);
                const company = companies.find(c => c.id === buyCompanyId);
                if (!company || count <= 0) return null;
                const oldPrice = company.sharePrice;
                const priceMultiplier = 1 + (count / company.totalShares) * 0.4;
                const newPrice = oldPrice * priceMultiplier;
                const executionPrice = (oldPrice + newPrice) / 2;
                const total = count * executionPrice;
                const companyCurrency = getCurrencyCode(company);
                return (
                  <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                    Сумма сделки: {total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} {companyCurrency}
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                      Ср. цена исполнения: {executionPrice.toFixed(2)} {companyCurrency}
                    </div>
                  </div>
                );
              })()}

              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: '12px 0 0',
                }}
              >
                При активной скупке акций курс компании на бирже автоматически
                растет.
              </p>

              <div className="modal-actions">
                <Button
                  type="button"
                  callback={() => setBuyCompanyId(null)}
                  secondary={true}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  Купить
                </Button>
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
                <span>От чьего лица продать:</span>
                <select
                  value={selectedSellerProfile}
                  onChange={(e) => setSelectedSellerProfile(e.target.value)}
                >
                  {buyerProfiles.map(p => (
                    <option key={`${p.type}:${p.id}`} value={`${p.type}:${p.id}`}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Количество акций для продажи (шт.)</span>
                {(() => {
                  const sep = selectedSellerProfile.indexOf(':');
                  const type = selectedSellerProfile.slice(0, sep);
                  const id = selectedSellerProfile.slice(sep + 1);
                  const sh = portfolio.find(p => p.companyId === sellCompanyId && p.ownerType === type && p.ownerId === id);
                  const max = sh?.sharesCount || 0;
                  return (
                    <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>
                      В наличии: {max} шт.
                    </div>
                  );
                })()}
                <input
                  type="number"
                  step="1"
                  required
                  value={sharesCount}
                  onChange={(e) => setSharesCount(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </label>
              
              {sellCompanyId && sharesCount && !isNaN(parseInt(sharesCount, 10)) && (() => {
                const count = parseInt(sharesCount, 10);
                const company = companies.find(c => c.id === sellCompanyId);
                if (!company || count <= 0) return null;
                const oldPrice = company.sharePrice;
                const priceMultiplier = Math.max(1 - (count / company.totalShares) * 0.4, 0.1);
                const newPrice = oldPrice * priceMultiplier;
                const executionPrice = (oldPrice + newPrice) / 2;
                const total = count * executionPrice;
                const companyCurrency = getCurrencyCode(company);
                return (
                  <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                    Сумма сделки: {total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} {companyCurrency}
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                      Ср. цена исполнения: {executionPrice.toFixed(2)} {companyCurrency}
                    </div>
                  </div>
                );
              })()}

              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: '12px 0 0',
                }}
              >
                Средства будут зачислены на ваш личный счет в национальной валюте.
              </p>

              <div className="modal-actions">
                <Button
                  type="button"
                  callback={() => setSellCompanyId(null)}
                  secondary={true}
                >
                  Отмена
                </Button>
                <Button type="submit" secondary={true}>
                  Продать
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {changePriceCompanyId && (
        <ChangePriceModal
          company={companies.find(c => c.id === changePriceCompanyId)!}
          onClose={() => setChangePriceCompanyId(null)}
          onSuccess={() => {
            setChangePriceCompanyId(null);
            reloadData();
          }}
        />
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
