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
import { economyService } from '../../../economy/services/economy.service';
import { getMinecraftItemInfo } from '../../../economy/constants/minecraft-items';
import CityCard from '../../components/city-card/city-card.component';
import DecreesFeed from '../../components/decrees-feed/decrees-feed.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import DiplomacyBadge from '../../components/diplomacy-badge/diplomacy-badge.component';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import { ICurrency } from '../../../economy/types/economy.types';
import {
  MinecraftItemDropdown,
  MinecraftEnchantDropdown,
} from '../../../economy/components/MinecraftItemSelector';
import '../../../economy/economy-shared.scss';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const formatAccountNumber = (acc?: string) => {
  if (!acc) return 'Не учрежден';
  return '№' + acc.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const StateDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<IState | null>(null);
  const [decrees, setDecrees] = useState<IStateDecree[]>([]);
  const [diplomacy, setDiplomacy] = useState<IDiplomacy[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [treasury, setTreasury] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Модальные окна дашборда президента
  const [showCreateCityModal, setShowCreateCityModal] = useState(false);
  const [cityName, setCityName] = useState('');
  const [cityDesc, setCityDesc] = useState('');

  const [showCreateCurrencyModal, setShowCreateCurrencyModal] = useState(false);
  const [currCode, setCurrCode] = useState('');
  const [currName, setCurrName] = useState('');
  const [currItemId, setCurrItemId] = useState('createdeco:gold_coin');
  const [currKopeckItemId, setCurrKopeckItemId] = useState('createdeco:copper_coin');
  const [currEnchantment, setCurrEnchantment] = useState('unbreaking:3');

  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [bankName, setBankName] = useState('');

  const [showTaxModal, setShowTaxModal] = useState(false);
  const [newPlayerToPlayerTax, setNewPlayerToPlayerTax] = useState('0');
  const [newPlayerToCompanyTax, setNewPlayerToCompanyTax] = useState('5');
  const [newExchangeFee, setNewExchangeFee] = useState('2');

  const [showRolesModal, setShowRolesModal] = useState(false);
  const [newTreasurer, setNewTreasurer] = useState('');
  const [newVoivode, setNewVoivode] = useState('');

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
        treasuryData,
      ] = await Promise.all([
        statesService.getStateById(id),
        statesService.getDecrees(id),
        statesService.getDiplomacy(id),
        statesService.getElections('state', id),
        economyService.getAllCurrencies(),
        statesService.getStateTreasury(id),
      ]);
      setState(stateData);
      setDecrees(decreesData);
      setDiplomacy(diplomacyData);
      setElections(electionsData);
      setTreasury(treasuryData);
      setCurrencies(
        currenciesData.filter(
          (c) => !c.stateId || c.stateId === id,
        ),
      );
    } catch (err: any) {
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

  const isTreasurer = 
    Boolean(state?.treasurerUsername) &&
    Boolean(currentUsername) &&
    state?.treasurerUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const handleResignPresident = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите сложить полномочия президента?')) return;
    try {
      await statesService.resignPresident(id);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Ошибка отставки');
    }
  };

  const handleDigitizeTreasury = async () => {
    if (!id || !canPublishDecree) return;
    try {
      setLoading(true);
      const res = await statesService.digitizeTreasury(id);
      alert(res.message || 'Успешно оцифровано!');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при оцифровке казны');
      setLoading(false);
    }
  };

  const handleWithdrawTreasury = async (minecraftItemId: string) => {
    if (!id || !canPublishDecree) return;
    const qtyStr = prompt('Введите количество предметов для вывода в сейф:');
    if (!qtyStr) return;
    const quantity = parseInt(qtyStr, 10);
    if (isNaN(quantity) || quantity <= 0) return alert('Неверное количество');

    try {
      setLoading(true);
      const res = await statesService.withdrawTreasury(id, { minecraftItemId, quantity });
      alert(res.message || 'Предметы успешно выведены в сейф!');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при выводе из казны');
      setLoading(false);
    }
  };

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
    if (currItemId === currKopeckItemId) {
      alert('Ошибка: Основная и разменная монета не могут быть одинаковым предметом!');
      return;
    }
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
      const p2p = parseFloat(newPlayerToPlayerTax);
      const p2c = parseFloat(newPlayerToCompanyTax);
      const ex = parseFloat(newExchangeFee);
      if (isNaN(p2p) || p2p < 0 || p2p > 100 || isNaN(p2c) || p2c < 0 || p2c > 100 || isNaN(ex) || ex < 0 || ex > 100) {
        alert('Введите корректный процент налога от 0 до 100');
        return;
      }
      await statesService.updateState(id, { 
        playerToPlayerTransferFee: p2p,
        playerToCompanyTransferFee: p2c,
        exchangeTradingFee: ex
      });
      setShowTaxModal(false);
      alert('Налоги успешно обновлены');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при изменении ставки налога');
    }
  };

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await statesService.assignRoles(id, { 
        treasurerUsername: newTreasurer || undefined, 
        voivodeUsername: newVoivode || undefined 
      });
      setShowRolesModal(false);
      alert('Роли успешно обновлены');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при обновлении ролей');
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

  const calculateStatePower = () => {
    if (!state) return 0;
    const citizensCount = state.citizens?.length || 0;
    const activeCities =
      state.cities?.filter((c) => (c.citizens?.length || 0) >= 1).length || 0;
    const taxRate = state.playerToCompanyTransferFee || 5;
    let taxCoefficient = 1.0;
    if (taxRate <= 10) {
      taxCoefficient = 1.0;
    } else if (taxRate <= 25) {
      taxCoefficient = 0.95;
    } else {
      taxCoefficient = 0.85;
    }

    let basePower = citizensCount * 10 + activeCities * 100;

    const currencyCreatedAt = stateCurrency?.createdAt || state.createdAt;
    if (currencyCreatedAt) {
      const ageInDays =
        (Date.now() - new Date(currencyCreatedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      const ageWeeks = Math.floor(Math.max(0, ageInDays) / 7);
      basePower += ageWeeks * 50;
    }

    return Math.round(basePower * taxCoefficient);
  };

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
            <div className="state-detail-page__hero-main">
              <div className="state-detail-page__header-row">
                {state.flagUrl || state.coatOfArmsUrl ? (
                  <div className="state-detail-page__emblems">
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
                ) : (
                  <div className="state-detail-page__emblems">
                    <div className="state-detail-page__flag-placeholder">
                      <span>🏰</span>
                    </div>
                  </div>
                )}
                <div className="state-detail-page__info">
                  <h1 className="state-detail-page__name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {state.name}
                    <button 
                      title="Скопировать ID" 
                      onClick={() => {
                        navigator.clipboard.writeText(state.id);
                        alert('ID скопирован: ' + state.id);
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                    >
                      📋
                    </button>
                  </h1>
                  <p className="state-detail-page__desc">
                    {state.description || 'Описание отсутствует.'}
                  </p>
                </div>
              </div>

              <div className="state-detail-page__meta">
                {state.citizenshipName && (
                  <div className="state-detail-page__stat-pill">
                    <span>📜 Гражданство:</span> <strong>{state.citizenshipName}</strong>
                  </div>
                )}
                <div className="state-detail-page__stat-pill">
                  <span>👑 Президент:</span>{' '}
                  {state.leaderUsername ? (
                    <strong
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <img
                        src={`https://minotar.net/helm/${state.leaderUsername}/20.png`}
                        alt=""
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          imageRendering: 'pixelated',
                        }}
                      />
                      {state.leaderUsername}
                    </strong>
                  ) : (
                    <strong>Нет</strong>
                  )}
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>🏛️ Городов:</span> <strong>{state.cities?.length || 0}</strong>
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>👥 Граждан:</span> <strong>{state.citizens?.length || 0}</strong>
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>⚖️ Налоги:</span> <strong>{state.playerToPlayerTransferFee || 0}% / {state.playerToCompanyTransferFee || 5}%</strong>
                </div>
                <div
                  className="state-detail-page__stat-pill state-detail-page__stat-pill--power"
                  title="Экономическая мощь государства (влияет на курс валюты)"
                >
                  <span>⚡ Мощь:</span> <strong>{calculateStatePower()} ед.</strong>
                </div>
              </div>
            </div>

            <div className="state-detail-page__treasury-card">
              <div className="treasury-label">🏦 Государственная казна</div>
              <div className="treasury-acc">
                {formatAccountNumber(state.treasuryAccountNumber)}
              </div>
              <div className="treasury-hint" style={{ marginBottom: (canPublishDecree || isTreasurer) ? '12px' : '0' }}>
                {state.treasuryAccountNumber ? 'Счет в Национальном банке' : 'Требуется регистрация счёта'}
              </div>
              {(canPublishDecree || isTreasurer) && (
                <button
                  className="economy-btn economy-btn--primary"
                  style={{ width: '100%', fontSize: '14px', padding: '8px 12px' }}
                  onClick={() => navigate(`/states/${id}/national-bank`)}
                >
                  Управление Нацбанком
                </button>
              )}
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
                    <div className="card-title">🚪 Полномочия</div>
                    <div className="card-subtitle">
                      Вы можете сложить полномочия президента в любой момент.
                    </div>
                  </div>
                  <button
                    className="card-action"
                    style={{ background: '#fee2e2', color: '#b91c1c' }}
                    onClick={handleResignPresident}
                  >
                    Сложить полномочия
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
                      Переводы между игроками: {state.playerToPlayerTransferFee || 0}%<br/>
                      Коммерческие переводы: {state.playerToCompanyTransferFee || 5}%<br/>
                      Биржевой сбор: {state.exchangeTradingFee || 2}%
                    </div>
                  </div>
                  <button
                    className="card-action"
                    onClick={() => {
                      setNewPlayerToPlayerTax(String(state.playerToPlayerTransferFee || 0));
                      setNewPlayerToCompanyTax(String(state.playerToCompanyTransferFee || 5));
                      setNewExchangeFee(String(state.exchangeTradingFee || 2));
                      setShowTaxModal(true);
                    }}
                  >
                    Изменить налог
                  </button>
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">🎭 Должности</div>
                    <div className="card-subtitle">
                      Казначей: {state.treasurerUsername || 'Не назначен'}<br />
                      Воевода: {state.voivodeUsername || 'Не назначен'}
                    </div>
                  </div>
                  <button
                    className="card-action"
                    onClick={() => {
                      setNewTreasurer(state.treasurerUsername || '');
                      setNewVoivode(state.voivodeUsername || '');
                      setShowRolesModal(true);
                    }}
                  >
                    Управление должностями
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
            <span>🏙️ &nbsp;Города государства ({state.cities?.length || 0})</span>
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
              <div className="state-detail-page__empty-card">
                <div className="empty-icon">🏙️</div>
                <div className="empty-text">
                  <strong>
                    В этом государстве еще нет основанных городов
                  </strong>
                  <span>
                    Основывайте города для привлечения жителей и развития
                    экономики!
                  </span>
                </div>
                {canPublishDecree && (
                  <button
                    className="empty-btn"
                    onClick={() => setShowCreateCityModal(true)}
                  >
                    + Основать город
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>
              👥 &nbsp;Граждане государства ({state.citizens?.length || 0})
            </span>
          </div>

          <div className="state-detail-page__citizens-grid">
            {state.citizens && state.citizens.length > 0 ? (
              state.citizens.map((citizen) => {
                const isLeader =
                  state.leaderUsername &&
                  citizen.username.toLowerCase() ===
                    state.leaderUsername.toLowerCase();
                const isMe =
                  currentUsername &&
                  citizen.username.toLowerCase() ===
                    currentUsername.toLowerCase();

                return (
                  <div
                    key={citizen.id}
                    className={`state-citizen-card ${
                      isMe ? 'state-citizen-card--me' : ''
                    }`}
                  >
                    <img
                      src={`https://minotar.net/helm/${citizen.username}/48.png`}
                      alt={citizen.username}
                      className="state-citizen-card__avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://minotar.net/helm/MHF_Steve/48.png';
                      }}
                    />
                    <div className="state-citizen-card__info">
                      <div className="state-citizen-card__name">
                        {citizen.username}{' '}
                        {isMe && <span className="tag-me">(Вы)</span>}
                      </div>
                      <div
                        className={`state-citizen-card__role ${
                          isLeader ? 'state-citizen-card__role--leader' : ''
                        }`}
                      >
                        {isLeader ? '👑 Президент / Лидер' : '👥 Гражданин'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="state-detail-page__empty-card">
                <div className="empty-icon">👥</div>
                <div className="empty-text">
                  <strong>
                    В этом государстве пока нет зарегистрированных граждан
                  </strong>
                  <span>
                    Основывайте города и приглашайте игроков для заселения!
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>
              📦 &nbsp;Золотой резерв и казна государства
            </span>
            {canPublishDecree && (
              <button
                className="state-detail-page__btn"
                onClick={handleDigitizeTreasury}
                style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff' }}
              >
                📥 Оцифровать сейф
              </button>
            )}
          </div>
          <div className="state-detail-page__treasury-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {treasury.length > 0 ? (
              treasury.map((item) => {
                const info = getMinecraftItemInfo(item.minecraftItemId);
                return (
                  <div key={item.id} className="state-detail-page__treasury-item">
                    <div className="treasury-icon">{info ? info.icon : '📦'}</div>
                    <div className="treasury-info">
                      <div className="treasury-name">{info ? info.name : item.minecraftItemId}</div>
                      <div className="treasury-count">Количество: <strong>{item.quantity} шт.</strong></div>
                    </div>
                    {canPublishDecree && (
                      <button
                        className="treasury-btn"
                        onClick={() => handleWithdrawTreasury(item.minecraftItemId)}
                        title="Вывести в игру"
                      >
                        📤 Вывести
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="state-detail-page__empty-card" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-icon">📦</div>
                <div className="empty-text">
                  <strong>Казна пуста</strong>
                  <span>Государство еще не сформировало золотой резерв. Загрузка предметов происходит автоматически через игру.</span>
                </div>
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>💰 &nbsp;Валюты государства ({currencies.length})</span>
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
                      <div>
                        <span>Экон. мощь:</span>
                        <strong>{calculateStatePower()} ед.</strong>
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
              <div className="state-detail-page__empty-card">
                <div className="empty-icon">💰</div>
                <div className="empty-text">
                  <strong>Собственная валюта еще не выпущена</strong>
                  <span>
                    Учредите Национальный банк и создайте национальную валюту
                    для торговли!
                  </span>
                </div>
                {canPublishDecree && (
                  <button
                    className="empty-btn"
                    onClick={() => setShowCreateCurrencyModal(true)}
                  >
                    + Выпустить валюту
                  </button>
                )}
              </div>
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
                  {currItemId === currKopeckItemId && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        fontSize: '13px',
                        fontWeight: 500,
                        margin: '8px 0',
                      }}
                    >
                      ⚠️ Основная и разменная монета не могут быть одинаковым предметом!
                    </div>
                  )}
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
                      disabled={currItemId === currKopeckItemId}
                      style={{
                        opacity: currItemId === currKopeckItemId ? 0.5 : 1,
                        cursor: currItemId === currKopeckItemId ? 'not-allowed' : 'pointer',
                      }}
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
                    <span>Переводы игрок-игрок (%)</span>
                    <input
                      type="number"
                      value={newPlayerToPlayerTax}
                      onChange={(e) => setNewPlayerToPlayerTax(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </label>
                  <label>
                    <span>Коммерческие переводы (%)</span>
                    <input
                      type="number"
                      value={newPlayerToCompanyTax}
                      onChange={(e) => setNewPlayerToCompanyTax(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </label>
                  <label>
                    <span>Биржевой сбор со сделок (%)</span>
                    <input
                      type="number"
                      value={newExchangeFee}
                      onChange={(e) => setNewExchangeFee(e.target.value)}
                      placeholder="2"
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

          {/* Модальное окно управления должностями */}
          {showRolesModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Назначение должностных лиц</h3>
                <form onSubmit={handleUpdateRoles} className="modal-form">
                  <label>
                    <span>Казначей (гражданин)</span>
                    <select
                      value={newTreasurer}
                      onChange={(e) => setNewTreasurer(e.target.value)}
                    >
                      <option value="">-- Снять должность --</option>
                      {state?.citizens
                        ?.filter(c => c.username !== state.leaderUsername && (c.username === newTreasurer || c.username !== newVoivode))
                        .map(c => (
                        <option key={c.id} value={c.username}>
                          {c.username}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Воевода (гражданин)</span>
                    <select
                      value={newVoivode}
                      onChange={(e) => setNewVoivode(e.target.value)}
                    >
                      <option value="">-- Снять должность --</option>
                      {state?.citizens
                        ?.filter(c => c.username !== state.leaderUsername && (c.username === newVoivode || c.username !== newTreasurer))
                        .map(c => (
                        <option key={c.id} value={c.username}>
                          {c.username}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowRolesModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Сохранить должности
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
