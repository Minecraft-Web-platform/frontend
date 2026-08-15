import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ICompany, ICompanyService } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import { CompanyServicesTab } from '../components/CompanyServicesTab';
import { CompanyOrdersTab } from '../components/CompanyOrdersTab';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import './CompanyDetailPage.scss';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [services, setServices] = useState<ICompanyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'orders'>('overview');

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
              <div className="cdp-title-info">
                <h1>{company.name}</h1>
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
                        <span className="value">{company.sharePrice.toFixed(2)} ед.</span>
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

        </div>
      </main>
    </div>
  );
};
