import React, { useEffect, useState } from 'react';
import { ICompany } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CompanyCard } from '../components/CompanyCard';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import useAuthStore from '../../../store/auth.store';
import { profileService } from '../../profile/services/profile.service';
import { statesService, IState, ICity } from '../../states';
import '../economy-shared.scss';

export const CompaniesListPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно создания компании
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [cityId, setCityId] = useState('');
  const [stateId, setStateId] = useState('');

  const [statesList, setStatesList] = useState<IState[]>([]);
  const [citiesList, setCitiesList] = useState<ICity[]>([]);

  // Модальное окно IPO
  const [ipoCompanyId, setIpoCompanyId] = useState<string | null>(null);
  const [totalShares, setTotalShares] = useState('1000');
  const [initialPrice, setInitialPrice] = useState('10.0');

  // Модальное окно дивидендов
  const [divCompanyId, setDivCompanyId] = useState<string | null>(null);
  const [divAmount, setDivAmount] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await economyService.getAllCompanies();
      setCompanies(res);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки фирм');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleOpenCreateModal = async () => {
    if (!isAuthenticated) {
      alert('Для регистрации фирмы необходимо авторизоваться');
      return;
    }
    try {
      const me = await profileService.getInfoAboutMe();
      if (!me.emailIsConfirmed) {
        alert('Регистрировать фирму может только игрок с подтвержденной почтой');
        return;
      }
      if (!me.cityId && !me.stateId) {
        alert(
          'Регистрировать фирму могут только граждане какого-либо государства или города',
        );
        return;
      }
      const [stRes, ctRes] = await Promise.all([
        statesService.getStates().catch(() => [] as IState[]),
        statesService.getCities().catch(() => [] as ICity[]),
      ]);
      setStatesList(stRes);
      setCitiesList(ctRes);
      setShowCreateModal(true);
    } catch (err: any) {
      alert(
        'Не удалось проверить статус аккаунта: ' +
          (err?.message || 'Ошибка загрузки профиля'),
      );
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Введите название компании');
      return;
    }
    try {
      await economyService.createCompany({
        name,
        description,
        logoUrl: logoUrl || undefined,
        cityId: cityId || undefined,
        stateId: stateId || undefined,
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setLogoUrl('');
      setCityId('');
      setStateId('');
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка регистрации компании');
    }
  };

  const handleIpoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipoCompanyId) return;
    try {
      await economyService.conductIPO(ipoCompanyId, {
        totalShares: parseInt(totalShares, 10),
        initialPrice: parseFloat(initialPrice),
      });
      setIpoCompanyId(null);
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка вывода на биржу (IPO)');
    }
  };

  const handleDividendsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divCompanyId || !divAmount || parseFloat(divAmount) <= 0) return;
    try {
      const res = await economyService.payDividends(divCompanyId, {
        totalAmount: parseFloat(divAmount),
      });
      alert(
        `Дивиденды в размере ${res.distributed} ед. успешно распределены между ${res.shareholdersCount} акционерами!`,
      );
      setDivCompanyId(null);
      setDivAmount('');
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка выплаты дивидендов');
    }
  };

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {/* Заголовок или панель действий */}
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

          {loading ? (
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
                  isOwner={true}
                  onIpoClick={(id) => setIpoCompanyId(id)}
                  onDividendsClick={(id) => setDivCompanyId(id)}
                />
              ))}
            </div>
          )}

          {/* Модальное окно регистрации фирмы */}
          {showCreateModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Регистрация новой фирмы</h3>
                <form onSubmit={handleCreateCompany} className="modal-form">
                  <label>
                    <span>Название фирмы</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Redstone Dynamics, Craft Corp..."
                    />
                  </label>

                  <label>
                    <span>Описание деятельности</span>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Добыча редстоуна и строительство автоматизированных ферм..."
                    />
                  </label>

                  {/* TODO: сделать загрузку лого компании на s3 хранилище, но пока что этого не будем делать. */}
                  <label>
                    <span>URL логотипа (опционально)</span>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </label>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}
                  >
                    <label>
                      <span>Государство <span style={{ color: '#e11d48' }}>*</span></span>
                      <select
                        value={stateId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStateId(val);
                          setCityId('');
                        }}
                        required
                      >
                        <option value="">-- Выберите государство --</option>
                        {statesList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Город</span>
                      <select
                        value={cityId}
                        onChange={(e) => setCityId(e.target.value)}
                        disabled={!stateId}
                        style={{
                          opacity: !stateId ? 0.6 : 1,
                          cursor: !stateId ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="">
                          {!stateId
                            ? '-- Сначала выберите государство --'
                            : '-- Не выбрано --'}
                        </option>
                        {citiesList
                          .filter((c) => c.stateId === stateId)
                          .map((ct) => (
                            <option key={ct.id} value={ct.id}>
                              {ct.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Зарегистрировать
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно IPO */}
          {ipoCompanyId && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">
                  Первичное публичное размещение (IPO)
                </h3>
                <form onSubmit={handleIpoSubmit} className="modal-form">
                  <label>
                    <span>Общее число выпускаемых акций</span>
                    <input
                      type="number"
                      step="100"
                      required
                      value={totalShares}
                      onChange={(e) => setTotalShares(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>

                  <label>
                    <span>Стартовая цена одной акции (в нац. валюте)</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={initialPrice}
                      onChange={(e) => setInitialPrice(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setIpoCompanyId(null)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Выпустить на биржу
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно выплаты дивидендов */}
          {divCompanyId && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">
                  Выплата дивидендов акционерам
                </h3>
                <form onSubmit={handleDividendsSubmit} className="modal-form">
                  <label>
                    <span>Общая сумма для распределения (в нац. валюте)</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={divAmount}
                      onChange={(e) => setDivAmount(e.target.value)}
                      placeholder="500"
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
                    Сумма будет списана со счета компании и разделена между всеми
                    инвесторами пропорционально их доле акций.
                  </p>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setDivCompanyId(null)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--success"
                    >
                      Выплатить дивиденды
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
