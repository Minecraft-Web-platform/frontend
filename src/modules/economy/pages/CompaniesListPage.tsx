import {  } from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanyCard } from '../components/CompanyCard';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import useAuthStore from '../../../store/auth.store';
import { profileService } from '../../profile/services/profile.service';
import { ISettlement } from '../../states';
import { useAllCompanies, useStates, useCurrencies } from '../hooks/useEconomyData';
import { statesService } from '../../states/services/states.service';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { IpoModal } from '../components/IpoModal';
import { DividendModal } from '../components/DividendModal';
import '../economy-shared.scss';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';


export const CompaniesListPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const { t } = useTranslation('economy');
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuthStore(useShallow(state => ({ isAuthenticated: state.isAuthenticated, accessToken: state.accessToken })));
  
  const { data: companies = [], isLoading: loadingCompanies, mutate: mutateCompanies } = useAllCompanies();
  const { data: statesList = [] } = useStates();
  const { data: currenciesList = [] } = useCurrencies();

  let currentUser = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      currentUser = payload.username_lower || '';
    } catch { /* empty */ }
  }

  // Create company modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [settlementsList, setSettlementsList] = useState<ISettlement[]>([]);
  const [myStateId, setMyStateId] = useState<string | null>(null);

  // IPO modal
  const [ipoCompanyId, setIpoCompanyId] = useState<string | null>(null);

  // Dividend modal
  const [divCompanyId, setDivCompanyId] = useState<string | null>(null);

  const handleOpenCreateModal = async () => {
    if (!isAuthenticated) {
      alert(t('companies.authRequired'));
      return;
    }
    try {
      const [me, ctRes] = await Promise.all([
        profileService.getInfoAboutMe(),
        statesService.getSettlements().catch(() => [] as ISettlement[]),
      ]);
      if (!me.emailIsConfirmed) {
        alert(t('companies.emailRequired'));
        return;
      }
      if (!me.settlementId && !me.stateId) {
        alert(t('companies.citizenshipRequired'));
        return;
      }
      let userStateId = me.stateId || '';
      if (!userStateId && me.settlementId) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mySettlement = ctRes.find((c: any) => c.id === me.settlementId);
        if (mySettlement?.stateId) {
          userStateId = mySettlement.stateId;
        }
      }
      setMyStateId(userStateId || null);
      setSettlementsList(ctRes);

      setShowCreateModal(true);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(t('companies.statusCheckError', { error: err?.message || '' }));
    }
  };

  const handleOpenIpoModal = (id: string) => {
    setIpoCompanyId(id);
  };

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {embedded ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={handleOpenCreateModal}
            className="economy-btn economy-btn--primary"
          >
            {t('companies.register')}
          </button>
        </div>
      ) : (
        <div className="economy-hero">
          <div>
            <h1 className="hero-title">
              {t('companies.heroTitle')}
            </h1>
            <p className="hero-subtitle">
              {t('companies.heroSubtitle')}
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenCreateModal}
              className="economy-btn economy-btn--primary"
            >
              {t('companies.register')}
            </button>
          </div>
        </div>
      )}

      {loadingCompanies ? (
        <div className="economy-empty">
          {t('companies.loading')}
        </div>
      ) : companies.length === 0 ? (
        <div className="economy-empty">
          {t('companies.empty')}
        </div>
      ) : (
        <div className="economy-grid">
          {companies.map((company) => {
            let currencyCode = t('companies.unit');
            if (company.isPublic && company.exchangeStateId) {
              const currency = currenciesList.find(c => c.stateId === company.exchangeStateId);
              if (currency) currencyCode = currency.code;
            }
            return (
              <CompanyCard
                key={company.id}
                company={company}
                isOwner={company.ownerUsername?.toLowerCase() === currentUser}
                currencyCode={currencyCode}
                onIpoClick={handleOpenIpoModal}
                onDividendsClick={(id) => setDivCompanyId(id)}
                onDetailsClick={(id) => navigate(`/companies/${id}`)}
              />
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateCompanyModal
          statesList={statesList}
          settlementsList={settlementsList}
          currenciesList={currenciesList}
          myStateId={myStateId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            mutateCompanies();
          }}
        />
      )}

      {ipoCompanyId && (
        <IpoModal
          companyId={ipoCompanyId}
          statesList={statesList}
          onClose={() => setIpoCompanyId(null)}
          onSuccess={() => {
            setIpoCompanyId(null);
            mutateCompanies();
          }}
        />
      )}

      {divCompanyId && (
        <DividendModal
          companyId={divCompanyId}
          onClose={() => setDivCompanyId(null)}
          onSuccess={() => {
            setDivCompanyId(null);
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
