import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './city-detail.page.scss';
import {
  ICitizenshipRequest,
  ICity,
  IElection,
} from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CitizenshipRequestsModal from '../../components/citizenship-requests-modal/citizenship-requests-modal.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const CityDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [city, setCity] = useState<ICity | null>(null);
  const [requests, setRequests] = useState<ICitizenshipRequest[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const { isAuthenticated, isAdmin } = useAuthStore();
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

  const isMayor =
    Boolean(city?.mayorUsername) &&
    Boolean(currentUsername) &&
    city?.mayorUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const isMayorOrAdmin = Boolean(isMayor) || isAdmin;

  const isCitizenOfThisCity =
    Boolean(currentUsername) &&
    Boolean(
      city?.citizens?.some(
        (c) => c.username.toLowerCase() === currentUsername?.toLowerCase(),
      ),
    );

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cityData, requestsData, electionsData] = await Promise.all([
        statesService.getCityById(id),
        statesService.getRequests(id),
        statesService.getElections('city', id),
      ]);
      setCity(cityData);
      setRequests(requestsData);
      setElections(electionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApplyForCitizenship = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await statesService.createRequest(id, { cityId: id });
      alert('Ваша заявка на проживание / переезд успешно отправлена мэру города!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        'Не удалось отправить заявку. Возможно, у вас уже есть активная заявка.';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleLeaveCity = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите покинуть этот город?')) return;
    setApplying(true);
    try {
      await statesService.leaveCity(id);
      alert('Вы успешно покинули город!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        'Не удалось покинуть город.';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!id) return;
    await statesService.reviewRequest(id, requestId, { status });
    await loadData();
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    await statesService.voteInElection(electionId, { candidateId });
    if (id) {
      const updated = await statesService.getElections('city', id);
      setElections(updated);
    }
  };

  const handleNominate = async (electionId: string, programText: string) => {
    await statesService.nominateCandidate(electionId, { programText });
    if (id) {
      const updated = await statesService.getElections('city', id);
      setElections(updated);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="city-detail-page">Загрузка паспорта города...</div>
        </main>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="city-detail-page">
            Город не найден.{' '}
            <button
              className="city-detail-page__back"
              onClick={() => navigate('/cities')}
            >
              ← Вернуться к списку
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="city-detail-page">
          <button
            className="city-detail-page__back"
            onClick={() => {
              const targetStateId = city?.stateId || city?.state?.id;
              if (targetStateId) {
                navigate(`/cities?stateId=${targetStateId}`);
              } else {
                navigate('/cities');
              }
            }}
          >
            ← К списку городов {city?.state?.name ? `(${city.state.name})` : ''}
          </button>

          <div className="city-detail-page__hero">
            <div className="city-detail-page__hero-main">
              <div className="city-detail-page__header-row">
                <div className="city-detail-page__emblem-wrap">
                  {city.flagUrl ? (
                    <img
                      src={city.flagUrl}
                      alt={`${city.name} flag`}
                      className="city-detail-page__flag"
                    />
                  ) : (
                    <div className="city-detail-page__flag-placeholder">
                      <span>🏛️</span>
                    </div>
                  )}
                </div>

                <div className="city-detail-page__info">
                  <h1 className="city-detail-page__title">{city.name}</h1>
                  <p className="city-detail-page__desc">
                    {city.description || 'Описание города пока не указано.'}
                  </p>
                </div>
              </div>

              <div className="city-detail-page__meta">
                <div className="city-detail-page__stat-pill">
                  <span>🏛️ Мэр города:</span>{' '}
                  <strong>{city.mayorUsername || 'Вакантно (Выборы)'}</strong>
                </div>
                {city.state ? (
                  <div
                    className="city-detail-page__stat-pill city-detail-page__stat-pill--state"
                    onClick={() => navigate(`/states/${city.state?.id}`)}
                    title="Перейти к странице государства"
                  >
                    <span>🏰 Государство:</span>{' '}
                    <strong>{city.state.name} →</strong>
                  </div>
                ) : (
                  <div className="city-detail-page__stat-pill">
                    <span>🏰 Государство:</span> <strong>Независимый город</strong>
                  </div>
                )}
                <div className="city-detail-page__stat-pill">
                  <span>👥 Население:</span>{' '}
                  <strong>{city.citizens?.length || 0} жит.</strong>
                </div>
                <div
                  className="city-detail-page__stat-pill city-detail-page__stat-pill--power"
                  title="Экономический вклад города в мощь своего государства"
                >
                  <span>⚡ Вклад в мощь:</span>{' '}
                  <strong>
                    {(city.citizens?.length || 0) >= 1
                      ? '+100 ед.'
                      : '0 ед. (нет жителей)'}
                  </strong>
                </div>
              </div>

              <div className="city-detail-page__actions">
                {isCitizenOfThisCity ? (
                  <>
                    <button
                      className="city-detail-page__btn city-detail-page__btn--resident"
                      disabled
                    >
                      <span>🏠</span> Вы житель этого города
                    </button>
                    <button
                      className="city-detail-page__btn city-detail-page__btn--danger"
                      onClick={handleLeaveCity}
                      disabled={applying}
                    >
                      <span>🚪</span> Покинуть город
                    </button>
                  </>
                ) : (
                  <button
                    className="city-detail-page__btn city-detail-page__btn--primary"
                    onClick={handleApplyForCitizenship}
                    disabled={applying}
                  >
                    <span>🏠</span>{' '}
                    {applying
                      ? 'Отправка...'
                      : 'Подать заявку на проживание / переезд'}
                  </button>
                )}
                {isMayorOrAdmin && (
                  <button
                    className="city-detail-page__btn city-detail-page__btn--secondary"
                    onClick={() => setShowRequestsModal(true)}
                  >
                    <span>📬</span> Заявки на заселение ({pendingCount})
                  </button>
                )}
              </div>
            </div>

            <div className="city-detail-page__passport-card">
              <div className="passport-label">📜 Паспорт города</div>
              <div className="passport-status">
                {(city.citizens?.length || 0) >= 1 ? (
                  <span className="status-badge status-badge--active">
                    ● Активный город
                  </span>
                ) : (
                  <span className="status-badge status-badge--inactive">
                    ○ Малонаселённый
                  </span>
                )}
              </div>
              <div className="passport-date">
                Основан:{' '}
                {city.createdAt
                  ? new Date(city.createdAt).toLocaleDateString('ru-RU')
                  : 'Неизвестно'}
              </div>
            </div>
          </div>

          {elections.length > 0 && (
            <div className="city-detail-page__section">
              <h2 className="city-detail-page__section-title">
                🗳️ Выборы Мэра в городе
              </h2>
              <div className="city-detail-page__elections-list">
                {elections.map((el) => (
                  <ElectionsWidget
                    key={el.id}
                    election={el}
                    onVote={(candId) => handleVote(el.id, candId)}
                    onNominate={(progText) => handleNominate(el.id, progText)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="city-detail-page__section">
            <h2 className="city-detail-page__section-title">
              👥 Жители города ({city.citizens?.length || 0})
            </h2>
            <div className="city-detail-page__citizens-grid">
              {city.citizens && city.citizens.length > 0 ? (
                city.citizens.map((citizen) => {
                  const isThisMayor =
                    city.mayorUsername &&
                    citizen.username.toLowerCase() ===
                      city.mayorUsername.toLowerCase();
                  const isMe =
                    currentUsername &&
                    citizen.username.toLowerCase() ===
                      currentUsername.toLowerCase();

                  return (
                    <div
                      key={citizen.id}
                      className={`city-detail-page__citizen-card ${
                        isMe ? 'city-detail-page__citizen-card--me' : ''
                      }`}
                    >
                      <img
                        src={`https://minotar.net/helm/${citizen.username}/48.png`}
                        alt={citizen.username}
                        className="city-detail-page__citizen-card-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://minotar.net/helm/MHF_Steve/48.png';
                        }}
                      />
                      <div className="city-detail-page__citizen-card-info">
                        <div className="city-detail-page__citizen-card-name">
                          {citizen.username}{' '}
                          {isMe && (
                            <span className="citizen-tag-me">(Вы)</span>
                          )}
                        </div>
                        <div
                          className={`city-detail-page__citizen-card-role ${
                            isThisMayor
                              ? 'city-detail-page__citizen-card-role--mayor'
                              : ''
                          }`}
                        >
                          {isThisMayor ? '👑 Мэр города' : '👥 Житель'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="city-detail-page__empty-card">
                  <div className="empty-icon">🏙️</div>
                  <div className="empty-text">
                    <strong>
                      В этом городе пока нет официально зарегистрированных жителей
                    </strong>
                    <span>Подайте заявку первым и станьте жителем города!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showRequestsModal && (
            <CitizenshipRequestsModal
              requests={requests}
              onClose={() => setShowRequestsModal(false)}
              onReview={handleReviewRequest}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CityDetailPage;
