import React, { useState } from 'react';
import { CompanyCard } from '../components/CompanyCard';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import useAuthStore from '../../../store/auth.store';
import { profileService } from '../../profile/services/profile.service';
import { ICity } from '../../states';
import { useAllCompanies, useStates, useCurrencies } from '../hooks/useEconomyData';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { IpoModal } from '../components/IpoModal';
import { DividendModal } from '../components/DividendModal';
import '../economy-shared.scss';
import { useNavigate } from 'react-router-dom';

export const CompaniesListPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuthStore();
  
  const { data: companies = [], isLoading: loadingCompanies, mutate: mutateCompanies } = useAllCompanies();
  const { data: statesList = [] } = useStates();
  const { data: currenciesList = [] } = useCurrencies();

  let currentUser = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      currentUser = payload.username_lower || '';
    } catch (e: any) {}
  }

  // Модальное окно создания компании
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [citiesList, setCitiesList] = useState<ICity[]>([]);
  const [myStateId, setMyStateId] = useState<string | null>(null);

  // Модальное окно IPO
  const [ipoCompanyId, setIpoCompanyId] = useState<string | null>(null);

  // Модальное окно дивидендов
  const [divCompanyId, setDivCompanyId] = useState<string | null>(null);

  const handleOpenCreateModal = async () => {
    if (!isAuthenticated) {
      alert('Для регистрации фирмы необходимо авторизоваться');
      return;
    }
    try {
      const [me, ctRes] = await Promise.all([
        profileService.getInfoAboutMe(),
        fetch('/api/states/cities').then(res => res.json()).catch(() => [] as ICity[]), // assuming this is how cities are fetched, since there is no useCities hook
      ]);
      if (!me.emailIsConfirmed) {
        alert('Регистрировать фирму может только игрок с подтвержденной почтой');
        return;
      }
      if (!me.cityId && !me.stateId) {
        alert('Регистрировать фирму могут только граждане какого-либо государства или города');
        return;
      }
      let userStateId = me.stateId || '';
      if (!userStateId && me.cityId) {
        const myCity = ctRes.find((c: any) => c.id === me.cityId);
        if (myCity?.stateId) {
          userStateId = myCity.stateId;
        }
      }
      setMyStateId(userStateId || null);
      setCitiesList(ctRes);

      setShowCreateModal(true);
    } catch (err: any) {
      alert('Не удалось проверить статус аккаунта: ' + (err?.message || 'Ошибка загрузки профиля'));
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
            + Зарегистрировать фирму
          </button>
        </div>
      ) : (
        <div className="economy-hero">
          <div>
            <h1 className="hero-title">
              <span>🏢</span> Реестр Коммерческих Фирм
            </h1>
            <p className="hero-subtitle">
              Регистрация бизнеса с привязкой к юрисдикции городов/государств
              и коммерческим счетам
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenCreateModal}
              className="economy-btn economy-btn--primary"
            >
              + Зарегистрировать фирму
            </button>
          </div>
        </div>
      )}

      {loadingCompanies ? (
        <div className="economy-empty">
          Загрузка каталога компаний...
        </div>
      ) : companies.length === 0 ? (
        <div className="economy-empty">
          В реестре пока нет зарегистрированных фирм. Создайте первую!
        </div>
      ) : (
        <div className="economy-grid">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isOwner={company.ownerUsername?.toLowerCase() === currentUser}
              onIpoClick={handleOpenIpoModal}
              onDividendsClick={(id) => setDivCompanyId(id)}
              onDetailsClick={(id) => navigate(`/companies/${id}`)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCompanyModal
          statesList={statesList}
          citiesList={citiesList}
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
