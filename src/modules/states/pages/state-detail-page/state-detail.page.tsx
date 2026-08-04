import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './state-detail.page.scss';
import {
  IDiplomacy,
  IElection,
  IState,
  IStateDecree,
} from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CityCard from '../../components/city-card/city-card.component';
import DecreesFeed from '../../components/decrees-feed/decrees-feed.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import DiplomacyBadge from '../../components/diplomacy-badge/diplomacy-badge.component';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import { economyService } from '../../../economy/services/economy.service';
import { ICurrency } from '../../../economy/types/economy.types';
import {
  MinecraftItemDropdown,
  MinecraftEnchantDropdown,
} from '../../../economy/components/MinecraftItemSelector';
import '../../../economy/economy-shared.scss';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const StateDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<IState | null>(null);
  const [decrees, setDecrees] = useState<IStateDecree[]>([]);
  const [diplomacy, setDiplomacy] = useState<IDiplomacy[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [loading, setLoading] = useState(true);

  // Модальные окна дашборда президента
  const [showCreateCityModal, setShowCreateCityModal] = useState(false);
  const [cityName, setCityName] = useState('');
  const [cityDesc, setCityDesc] = useState('');

  const [showCreateCurrencyModal, setShowCreateCurrencyModal] = useState(false);
  const [currCode, setCurrCode] = useState('');
  const [currName, setCurrName] = useState('');
  const [currItemId, setCurrItemId] = useState('minecraft:gold_ingot');
  const [currKopeckItemId, setCurrKopeckItemId] = useState('minecraft:gold_nugget');
  const [currEnchantment, setCurrEnchantment] = useState('unbreaking:3');

  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [bankName, setBankName] = useState('');

  const [showTaxModal, setShowTaxModal] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState('5');

  const { isAuthenticated } = useAuthStore();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

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

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [
        stateData,
        decreesData,
        diplomacyData,
        electionsData,
        currenciesData,
      ] = await Promise.all([
        statesService.getStateById(id),
        statesService.getDecrees(id),
        statesService.getDiplomacy(id),
        statesService.getElections('state', id),
        economyService.getAllCurrencies(),
      ]);
      setState(stateData);
      setDecrees(decreesData);
      setDiplomacy(diplomacyData);
      setElections(electionsData);
      setCurrencies(
        currenciesData.filter(
          (c) => !c.stateId || c.stateId === id,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canPublishDecree =
    Boolean(state?.leaderUsername) &&
    Boolean(currentUsername) &&
    state?.leaderUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !cityName.trim()) return;
    try {
      await statesService.createCity({
        stateId: id,
        name: cityName,
        description: cityDesc,
      });
      setShowCreateCityModal(false);
      setCityName('');
      setCityDesc('');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при основании города');
    }
  };

  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currCode.trim() || !currName.trim()) return;
    try {
      await economyService.createCurrency({
        stateId: id,
        code: currCode.toUpperCase(),
        name: currName,
        minecraftItemId: currItemId,
        kopeckItemId: currKopeckItemId,
        minecraftEnchantment: currEnchantment,
      });
      setShowCreateCurrencyModal(false);
      setCurrCode('');
      setCurrName('');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при выпуске валюты');
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await statesService.createNationalBank(id, {
        name: bankName || `Национальный Банк ${state?.name}`,
      });
      setShowCreateBankModal(false);
      setBankName('');
      alert('Национальный банк успешно учрежден!');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при учреждении банка');
    }
  };

  const handleUpdateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const rate = parseFloat(newTaxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        alert('Введите корректный процент налога от 0 до 100');
        return;
      }
      await statesService.updateState(id, { taxRate: rate });
      setShowTaxModal(false);
      alert('Процент налоговой ставки успешно обновлен');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при изменении ставки налога');
    }
  };

  const handleCreateDecree = async (title: string, content: string) => {
    if (!id) return;
    await statesService.createDecree(id, { title, content });
    const updated = await statesService.getDecrees(id);
    setDecrees(updated);
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    await statesService.voteInElection(electionId, { candidateId });
    if (id) {
      const updated = await statesService.getElections('state', id);
      setElections(updated);
    }
  };

  const handleNominate = async (electionId: string, programText: string) => {
    await statesService.nominateCandidate(electionId, { programText });
    if (id) {
      const updated = await statesService.getElections('state', id);
      setElections(updated);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="state-detail-page">Загрузка паспорта государства...</div>
        </main>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="state-detail-page">
            Государство не найдено.{' '}
            <button
              className="state-detail-page__back"
              onClick={() => navigate('/states')}
            >
              ← Вернуться к списку
            </button>
          </div>
        </main>
      </div>
    );
  }

  const stateCurrency = currencies.find((c) => c.stateId === state?.id);

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="state-detail-page">
          <button
            className="state-detail-page__back"
            onClick={() => navigate('/states')}
          >
            ← К списку государств
          </button>

          <div className="state-detail-page__hero">
            {(state.flagUrl || state.coatOfArmsUrl) && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {state.flagUrl && (
                  <img
                    src={state.flagUrl}
                    alt={`${state.name} flag`}
                    className="state-detail-page__flag"
                  />
                )}
                {state.coatOfArmsUrl && (
                  <img
                    src={state.coatOfArmsUrl}
                    alt={`${state.name} coat of arms`}
                    className="state-detail-page__flag"
                  />
                )}
              </div>
            )}
            <div>
              <h1 className="state-detail-page__name">{state.name}</h1>
              <p className="state-detail-page__desc">
                {state.description || 'Описание отсутствует.'}
              </p>
              <div className="state-detail-page__meta">
                {state.citizenshipName && (
                  <span>
                    📜 Гражданство: <strong>{state.citizenshipName}</strong>
                  </span>
                )}
                <span>
                  👑 Президент: <strong>{state.leaderUsername || 'Нет'}</strong>
                </span>
                <span>
                  🏛️ Городов: <strong>{state.cities?.length || 0}</strong>
                </span>
                <span>
                  👥 Граждан: <strong>{state.citizens?.length || 0}</strong>
                </span>
                <span>
                  ⚖️ Налог: <strong>{state.taxRate || 5}%</strong>
                </span>
                <span>
                  🏦 Казна: <strong>{state.treasuryAccountNumber ? `№${state.treasuryAccountNumber}` : 'Не учрежден'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Панель управления государством (Только для президента/лидера) */}
          {canPublishDecree && (
            <div className="state-dashboard">
              <h3 className="state-dashboard__title">
                ⚙️ Панель управления государством (Президент)
              </h3>
              <div className="state-dashboard__cards">
                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">🏙️ Города государства</div>
                    <div className="card-subtitle">
                      Основано городов: {state.cities?.length || 0}
                    </div>
                  </div>
                  <button
                    className="card-action"
                    onClick={() => setShowCreateCityModal(true)}
                  >
                    + Основать город
                  </button>
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">🏦 Национальный банк</div>
                    <div className="card-subtitle">
                      {state.treasuryAccountNumber
                        ? `✅ Учрежден (счет №${state.treasuryAccountNumber})`
                        : '⚠️ Не учрежден. Требуется создать до выпуска валюты.'}
                    </div>
                  </div>
                  {!state.treasuryAccountNumber ? (
                    <button
                      className="card-action"
                      onClick={() => setShowCreateBankModal(true)}
                    >
                      + Учредить банк
                    </button>
                  ) : (
                    <div className="card-status-ok" style={{ color: '#10b981', fontWeight: 600 }}>
                      Банк активен
                    </div>
                  )}
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">💰 Национальная валюта</div>
                    <div className="card-subtitle">
                      {!state.treasuryAccountNumber
                        ? '🔒 Сначала учредите Национальный Банк'
                        : stateCurrency
                        ? `✅ Выпущена: ${stateCurrency.name} (${stateCurrency.code})`
                        : '⚠️ Не выпущена. Без валюты граждане не могут создавать фирмы и счета!'}
                    </div>
                  </div>
                  {!state.treasuryAccountNumber ? (
                    <button
                      className="card-action"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      Сначала банк
                    </button>
                  ) : !stateCurrency ? (
                    <button
                      className="card-action"
                      onClick={() => setShowCreateCurrencyModal(true)}
                    >
                      + Выпустить валюту
                    </button>
                  ) : (
                    <div className="card-status-ok" style={{ color: '#10b981', fontWeight: 600 }}>
                      1 {stateCurrency.code} = 100 коп.
                    </div>
                  )}
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">⚙️ Налоги и казна</div>
                    <div className="card-subtitle">
                      Текущая ставка: {state.taxRate || 5}%
                    </div>
                  </div>
                  <button
                    className="card-action"
                    onClick={() => {
                      setNewTaxRate(String(state.taxRate || 5));
                      setShowTaxModal(true);
                    }}
                  >
                    Изменить налог
                  </button>
                </div>
              </div>
            </div>
          )}

          {diplomacy.length > 0 && (
            <>
              <h3 className="state-detail-page__section-title">
                🤝 Дипломатические отношения
              </h3>
              <div className="state-detail-page__diplomacy-grid">
                {diplomacy.map((d) => (
                  <div key={d.id} className="state-detail-page__diplomacy-item">
                    <DiplomacyBadge status={d.status} />
                  </div>
                ))}
              </div>
            </>
          )}

          {elections.length > 0 && (
            <>
              <h3 className="state-detail-page__section-title">
                🗳️ Выборы в государстве
              </h3>
              {elections.map((el) => (
                <ElectionsWidget
                  key={el.id}
                  election={el}
                  onVote={(candId) => handleVote(el.id, candId)}
                  onNominate={(progText) => handleNominate(el.id, progText)}
                />
              ))}
            </>
          )}

          <div className="state-detail-page__section-title">
            <span>🏙️ Города государства ({state.cities?.length || 0})</span>
            <button
              className="state-detail-page__btn"
              onClick={() => navigate(`/cities?stateId=${state.id}`)}
            >
              Все города →
            </button>
          </div>

          <div className="state-detail-page__cities-grid">
            {state.cities && state.cities.length > 0 ? (
              state.cities.map((city) => <CityCard key={city.id} city={city} />)
            ) : (
              <p style={{ color: '#a0aec0' }}>
                В этом государстве еще нет основанных городов.
              </p>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>💰 Валюты государства ({currencies.length})</span>
            <button
              className="state-detail-page__btn"
              onClick={() => navigate('/economy?tab=currencies')}
            >
              Все валюты →
            </button>
          </div>

          <div className="state-detail-page__currencies-grid">
            {currencies.length > 0 ? (
              currencies.map((curr) => (
                <div key={curr.id} className="state-currency-card">
                  <div>
                    <div className="state-currency-card__header">
                      <span className="code">{curr.code}</span>
                      <span className="name">{curr.name}</span>
                    </div>
                    <div className="state-currency-card__meta">
                      <div>
                        <span>Авт. курс:</span>
                        <strong>1 {curr.code} = {Number(curr.exchangeRate || 1).toFixed(4)} ед.</strong>
                      </div>
                      <div>
                        <span>В обращении:</span>
                        <strong>{Number(curr.totalIssued || 0).toLocaleString('ru-RU')} {curr.code}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    className="state-currency-card__link-btn"
                    onClick={() => navigate('/economy?tab=currencies')}
                  >
                    Открыть страницу валюты →
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#a0aec0' }}>
                В этом государстве еще нет собственной национальной валюты.
              </p>
            )}
          </div>

          <h3 className="state-detail-page__section-title">
            📜 Официальные указы и новости
          </h3>
          <DecreesFeed
            decrees={decrees}
            canCreate={canPublishDecree}
            onCreateDecree={handleCreateDecree}
          />

          {/* Модальное окно создания города */}
          {showCreateCityModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Основание города</h3>
                <form onSubmit={handleCreateCity} className="modal-form">
                  <label>
                    <span>Название города</span>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="Например, Столица"
                      required
                    />
                  </label>
                  <label>
                    <span>Описание города</span>
                    <input
                      type="text"
                      value={cityDesc}
                      onChange={(e) => setCityDesc(e.target.value)}
                      placeholder="Краткое описание"
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateCityModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Основать город
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно выпуска валюты */}
          {showCreateCurrencyModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Выпуск национальной валюты</h3>
                <form onSubmit={handleCreateCurrency} className="modal-form">
                  <label>
                    <span>Код валюты (2-5 букв)</span>
                    <input
                      type="text"
                      value={currCode}
                      onChange={(e) => setCurrCode(e.target.value.toUpperCase())}
                      placeholder="REL"
                      required
                      maxLength={5}
                    />
                  </label>
                  <label>
                    <span>Название валюты</span>
                    <input
                      type="text"
                      value={currName}
                      onChange={(e) => setCurrName(e.target.value)}
                      placeholder="Релантийский Рубль"
                      required
                    />
                  </label>
                  <MinecraftItemDropdown
                    label="Предмет основной монеты (1 ед. валюты)"
                    value={currItemId}
                    onChange={setCurrItemId}
                    required
                  />
                  <MinecraftItemDropdown
                    label="Предмет разменной монеты / копейки (0.01 ед. валюты)"
                    value={currKopeckItemId}
                    onChange={setCurrKopeckItemId}
                    required
                  />
                  <MinecraftEnchantDropdown
                    label="Чары для защиты (применятся на оба предмета)"
                    value={currEnchantment}
                    onChange={setCurrEnchantment}
                  />
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>
                    ℹ️ 1 единица валюты всегда равна 100 копейкам.
                  </p>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateCurrencyModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Выпустить валюту
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно учреждения государственного банка */}
          {showCreateBankModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Учреждение Национального Банка</h3>
                <form onSubmit={handleCreateBank} className="modal-form">
                  <label>
                    <span>Название банка</span>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={`Национальный Банк ${state.name}`}
                    />
                  </label>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>
                    ℹ️ Национальный банк создаст казенный счет №40817..., который станет эмиссионным центром вашей валюты.
                  </p>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateBankModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Учредить банк
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно изменения налогов */}
          {showTaxModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Настройка налоговой ставки</h3>
                <form onSubmit={handleUpdateTax} className="modal-form">
                  <label>
                    <span>Ставка налога в % (от 0 до 100)</span>
                    <input
                      type="number"
                      value={newTaxRate}
                      onChange={(e) => setNewTaxRate(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowTaxModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Сохранить налог
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StateDetailPage;
