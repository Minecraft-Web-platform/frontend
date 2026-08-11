import React, { useEffect, useState } from 'react';
import { ICompany, ICurrency } from '../types/economy.types';
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
  const [currenciesList, setCurrenciesList] = useState<ICurrency[]>([]);
  const [myStateId, setMyStateId] = useState<string | null>(null);
  const [showNoBankModal, setShowNoBankModal] = useState(false);

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
      const [me, stRes, ctRes, curRes] = await Promise.all([
        profileService.getInfoAboutMe(),
        statesService.getStates().catch(() => [] as IState[]),
        statesService.getCities().catch(() => [] as ICity[]),
        economyService.getAllCurrencies().catch(() => [] as ICurrency[]),
      ]);
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
      let userStateId = me.stateId || '';
      if (!userStateId && me.cityId) {
        const myCity = ctRes.find((c) => c.id === me.cityId);
        if (myCity?.stateId) {
          userStateId = myCity.stateId;
        }
      }
      setMyStateId(userStateId || null);
      setStatesList(stRes);
      setCitiesList(ctRes);
      setCurrenciesList(curRes);

      if (userStateId) setStateId(userStateId);
      if (me.cityId) setCityId(me.cityId);
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
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Ошибка регистрации компании';
      alert(msg);
    }
  };

  const [ipoExchangeStateId, setIpoExchangeStateId] = useState('');

  const handleOpenIpoModal = async (id: string) => {
    try {
      setIpoCompanyId(id);
      const stRes = await statesService.getStates();
      setStatesList(stRes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIpoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipoCompanyId || !ipoExchangeStateId) {
      alert('Выберите биржу (государство) для листинга!');
      return;
    }
    try {
      await economyService.conductIPO(ipoCompanyId, {
        totalShares: parseInt(totalShares, 10),
        initialPrice: parseFloat(initialPrice),
        exchangeStateId: ipoExchangeStateId,
      });
      setIpoCompanyId(null);
      setIpoExchangeStateId('');
      loadCompanies();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Ошибка вывода на биржу (IPO)');
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

  const selectedStateHasBank =
    !stateId ||
    currenciesList.some(
      (cur) => cur.stateId === stateId || cur.stateId === null,
    );

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
                    onIpoClick={handleOpenIpoModal}
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
                        {statesList.map((st) => {
                          const isForeign = Boolean(
                            myStateId && st.id !== myStateId,
                          );
                          return (
                            <option key={st.id} value={st.id}>
                              {st.name} {isForeign ? '[Другое гос-во]' : ''}
                            </option>
                          );
                        })}
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

                  {stateId && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor:
                          stateId !== myStateId ? '#eff6ff' : '#f8fafc',
                        border:
                          stateId !== myStateId
                            ? '1px solid #bfdbfe'
                            : '1px solid #e2e8f0',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '26px' }}>
                        {stateId !== myStateId ? '🌐' : '🏛️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color:
                              stateId !== myStateId ? '#1e40af' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>
                            Юрисдикция:{' '}
                            {statesList.find((s) => s.id === stateId)?.name ||
                              'Не выбрано'}
                          </span>
                          {stateId !== myStateId && (
                            <span
                              style={{
                                fontSize: '11px',
                                backgroundColor: '#3b82f6',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontWeight: 700,
                              }}
                            >
                              ДРУГОЕ ГОСУДАРСТВО
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color:
                              stateId !== myStateId ? '#3b82f6' : '#64748b',
                            marginTop: '4px',
                            lineHeight: '1.4',
                          }}
                        >
                          {stateId !== myStateId
                            ? 'Вы регистрируете фирму в иностранной юрисдикции. Коммерческий счёт компании будет автоматически открыт в банке и валюте этого государства.'
                            : 'Вы регистрируете фирму в домашней юрисдикции.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedStateHasBank && (
                    <div
                      style={{
                        padding: '14px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        color: '#991b1b',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <div>
                        <strong>В выбранном государстве нет Национального банка</strong>
                        <div style={{ marginTop: '4px', color: '#b91c1c', fontSize: '13px' }}>
                          Регистрация фирмы невозможна: без банка нельзя автоматически открыть коммерческий счёт. В государстве должна быть выпущена национальная валюта.
                        </div>
                      </div>
                    </div>
                  )}

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
                      disabled={!selectedStateHasBank}
                      style={{
                        opacity: !selectedStateHasBank ? 0.6 : 1,
                        cursor: !selectedStateHasBank ? 'not-allowed' : 'pointer',
                      }}
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

                  <label>
                    <span>Государство (Биржа)</span>
                    <select
                      value={ipoExchangeStateId}
                      onChange={(e) => setIpoExchangeStateId(e.target.value)}
                      required
                    >
                      <option value="">-- Выберите биржу --</option>
                      {statesList.map((st) => (
                        <option key={st.id} value={st.id}>
                          Биржа государства {st.name} (Пошлина: {st.ipoFee || 0})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setIpoCompanyId(null);
                        setIpoExchangeStateId('');
                      }}
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

          {/* Модальное окно: Отсутствует Национальный Банк */}
          {showNoBankModal && (
            <div className="economy-modal-overlay" onClick={() => setShowNoBankModal(false)}>
              <div
                className="economy-modal"
                style={{ maxWidth: '440px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div>
                  <h3 className="modal-title" style={{ margin: 0 }}>
                    Отсутствует Национальный Банк
                  </h3>
                </div>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#334155',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                  }}
                >
                  <p style={{ margin: '0 0 12px 0' }}>
                    В вашем государстве ещё не учреждён <strong>Национальный банк</strong> и не выпущена валюта.
                  </p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                    При регистрации фирмы для неё автоматически создаётся коммерческий банковский счёт. Без функционирующего банка открыть счёт и зарегистрировать компанию невозможно.
                  </p>
                </div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="economy-btn economy-btn--primary"
                    onClick={() => setShowNoBankModal(false)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Понятно
                  </button>
                </div>
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
