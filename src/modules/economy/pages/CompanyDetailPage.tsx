import {  } from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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
import { TerritoriesList } from '../../states/components/territories-list/TerritoriesList';
import './CompanyDetailPage.scss';
import { useShallow } from 'zustand/react/shallow';


export const CompanyDetailPage: React.FC = () => {
  const { t } = useTranslation('economy');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [services, setServices] = useState<ICompanyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'orders' | 'territories'>('overview');
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const { isAuthenticated } = useAuthStore(useShallow(state => ({ isAuthenticated: state.isAuthenticated })));
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const { data: currenciesList = [] } = useCurrencies();

  let currencyCode = t('companies.unit');
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || t('companies.detail.editError'));
    }
  };

  const handleArchiveCompany = async () => {
    if (!id) return;
    if (!window.confirm(t('companies.detail.archiveConfirm'))) return;
    try {
      await economyService.archiveCompany(id);
      navigate('/economy/companies');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || t('companies.detail.archiveError'));
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCompanyAndServices();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="company-detail-page">
            <div className="loading">{t('companies.detail.loading')}</div>
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
              <h2>{t('companies.detail.notFound')}</h2>
              <Button callback={() => navigate(-1)}>{t('companies.detail.back')}</Button>
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
              <Button callback={() => navigate(-1)} secondary>{t('companies.detail.backBtn')}</Button>
            </div>
            <div className="cdp-header-card__main">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="cdp-logo" />
              ) : (
                <div className="cdp-logo-placeholder">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="cdp-title-info" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h1 style={{ margin: 0, padding: 0 }}>{company.name}</h1>
                  {company.isArchived && (
                    <span className="cdp-badge" style={{ background: '#dc3545', color: '#fff' }}>{t('companies.detail.archivedBadge')}</span>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    {company.ownerUsername.toLowerCase() === currentUsername?.toLowerCase() && !company.isArchived && (
                      <>
                        <button 
                          title={t('companies.detail.edit')} 
                          onClick={() => setShowEditCompanyModal(true)}
                          className="action-icon-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button 
                          title={t('companies.detail.archive')} 
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
                  {company.isPublic ? t('companies.card.publicBadge') : t('companies.card.privateBadge')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="cdp-tabs">
            <button 
              className={`cdp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t('companies.detail.tabs.overview')}
            </button>
            <button 
              className={`cdp-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              {t('companies.detail.tabs.services')}
            </button>
            <button 
              className={`cdp-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              {t('companies.detail.tabs.orders')}
            </button>
            <button 
              className={`cdp-tab-btn ${activeTab === 'territories' ? 'active' : ''}`}
              onClick={() => setActiveTab('territories')}
            >
              {t('companies.detail.tabs.territories')}
            </button>
          </div>

          <div className="cdp-tab-content">
            {activeTab === 'overview' && (
              <div className="cdp-overview">
                <div className="cdp-info-card">
                  <h3>{t('companies.detail.about')}</h3>
                  <p>{company.description || t('companies.detail.noDescription')}</p>
                </div>
                
                <div className="cdp-stats-grid">
                  <div className="cdp-stat">
                    <span className="label">{t('companies.detail.owner')}</span>
                    <span className="value">{company.ownerUsername}</span>
                  </div>
                  <div className="cdp-stat">
                    <span className="label">{t('companies.detail.ipoStatus')}</span>
                    <span className="value">{company.isPublic ? t('companies.detail.ipoCompleted') : t('companies.detail.ipoPrivate')}</span>
                  </div>
                  {company.isPublic && (
                    <>
                      <div className="cdp-stat">
                        <span className="label">{t('companies.detail.sharePrice')}</span>
                        <span className="value">{company.sharePrice.toFixed(2)} {currencyCode}</span>
                      </div>
                      <div className="cdp-stat">
                        <span className="label">{t('companies.detail.marketCap')}</span>
                        <span className="value">
                          {(company.sharePrice * company.totalShares).toLocaleString('ru-RU')} {currencyCode}
                        </span>
                      </div>
                      <div className="cdp-stat">
                        <span className="label">{t('companies.detail.issuedShares')}</span>
                        <span className="value">{company.totalShares} {t('companies.detail.pcs')}</span>
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
            {activeTab === 'territories' && (
              <div style={{ marginTop: '20px' }}>
                <TerritoriesList ownerType="company" ownerId={company.id} />
              </div>
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
