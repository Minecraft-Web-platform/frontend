import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ICompany, ICompanyService } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import { CompanyServicesTab } from '../components/CompanyServicesTab';
import { CompanyOrdersTab } from '../components/CompanyOrdersTab';
import { useCurrencies } from '../hooks/useEconomyData';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import useAuthStore from '../../../store/auth.store';
import { profileService } from '../../profile/services/profile.service';
import { EditCompanyModal } from '../components/edit-company-modal/EditCompanyModal';
import './CompanyDetailPage.scss';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [services, setServices] = useState<ICompanyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'orders'>('overview');
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const { data: currenciesList = [] } = useCurrencies();

  let currencyCode = 'ед.';
  if (company?.isPublic && company.exchangeStateId) {
    const currency = currenciesList.find(c => c.stateId === company.exchangeStateId);
    if (currency) currencyCode = currency.code;
  }

  useEffect(() => {
    if (isAuthenticated) {
      profileService
        .getInfoAboutMe()
        .then((res) => setCurrentUsername(res.username))
        .catch(() => setCurrentUsername(null));
    } else {
      setCurrentUsername(null);
    }
  }, [isAuthenticated]);

  const fetchCompanyAndServices = () => {
    setLoading(true);
    Promise.all([
      economyService.getCompanyById(id as string),
      economyService.getCompanyServices(id as string)
    ]).then(([companyRes, servicesRes]) => {
      setCompany(companyRes);
      setServices(servicesRes);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleEditCompany = async (data: { name?: string; description?: string; logoUrl?: string }) => {
    if (!id) return;
    try {
      await economyService.updateCompany(id, data);
      fetchCompanyAndServices();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Ошибка при редактировании компании');
    }
  };

  const handleArchiveCompany = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите закрыть (архивировать) компанию? Эта операция безвозвратна, счет будет удален.')) return;
    try {
      await economyService.archiveCompany(id);
      navigate('/economy/companies');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Ошибка при закрытии компании');
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCompanyAndServices();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="company-detail-page">
            <div className="loading">Загрузка данных о компании...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="company-detail-page">
            <div className="not-found">
              <h2>Компания не найдена</h2>
              <Button callback={() => navigate(-1)}>Вернуться назад</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="company-detail-page">
          
          <div className="cdp-header-card">
            <div className="cdp-header-card__top">
              <Button callback={() => navigate(-1)} secondary>← Назад</Button>
            </div>
            <div className="cdp-header-card__main">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="Логотип" className="cdp-logo" />
              ) : (
                <div className="cdp-logo-placeholder">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="cdp-title-info" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h1 style={{ margin: 0, padding: 0 }}>{company.name}</h1>
                  {company.isArchived && (
                    <span className="cdp-badge" style={{ background: '#dc3545', color: '#fff' }}>Закрыта (Архив)</span>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    {company.ownerUsername.toLowerCase() === currentUsername?.toLowerCase() && !company.isArchived && (
                      <>
                        <button 
                          title="Редактировать компанию" 
                          onClick={() => setShowEditCompanyModal(true)}
                          className="action-icon-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button 
                          title="Закрыть компанию" 
                          onClick={handleArchiveCompany}
                          className="action-icon-btn action-icon-btn--danger"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <span className={`cdp-badge ${company.isPublic ? 'public' : 'private'}`}>
                  {company.isPublic ? 'Торгуется на бирже' : 'Частная компания'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="cdp-tabs">
            <button 
              className={`cdp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Обзор и Информация
            </button>
            <button 
              className={`cdp-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Услуги фирмы
            </button>
            <button 
              className={`cdp-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Заказы
            </button>
          </div>

          <div className="cdp-tab-content">
            {activeTab === 'overview' && (
              <div className="cdp-overview">
                <div className="cdp-info-card">
                  <h3>О компании</h3>
                  <p>{company.description || 'Владелец пока не добавил описание для своей компании.'}</p>
                </div>
                
                <div className="cdp-stats-grid">
                  <div className="cdp-stat">
                    <span className="label">Владелец</span>
                    <span className="value">{company.ownerUsername}</span>
                  </div>
                  <div className="cdp-stat">
                    <span className="label">Статус IPO</span>
                    <span className="value">{company.isPublic ? 'Проведено' : 'Не публичная'}</span>
                  </div>
                  {company.isPublic && (
                    <>
                      <div className="cdp-stat">
                        <span className="label">Цена акции</span>
                        <span className="value">{company.sharePrice.toFixed(2)} {currencyCode}</span>
                      </div>
                      <div className="cdp-stat">
                        <span className="label">Капитализация</span>
                        <span className="value">
                          {(company.sharePrice * company.totalShares).toLocaleString('ru-RU')} {currencyCode}
                        </span>
                      </div>
                      <div className="cdp-stat">
                        <span className="label">Выпущено акций</span>
                        <span className="value">{company.totalShares} шт.</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'services' && (
              <CompanyServicesTab company={company} services={services} onRefresh={fetchCompanyAndServices} />
            )}
            {activeTab === 'orders' && (
              <CompanyOrdersTab company={company} />
            )}
          </div>

          {showEditCompanyModal && (
            <EditCompanyModal
              company={company}
              onClose={() => setShowEditCompanyModal(false)}
              onSave={handleEditCompany}
            />
          )}

        </div>
      </main>
    </div>
  );
};
