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
import { EditCityModal } from '../../components/edit-city-modal/EditCityModal';
import StreetsManager from '../../components/streets-manager/streets-manager.component';
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
  const [showEditModal, setShowEditModal] = useState(false);
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

  const isStatePresident =
    Boolean(city?.state?.leaderUsername) &&
    Boolean(currentUsername) &&
    city?.state?.leaderUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const isMayorOrAdmin = Boolean(isMayor) || isAdmin || isStatePresident;

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
    } catch (err: any) {
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
    if (!window.confirm('Вы уверены, что хотите выписаться из этого города?')) return;
    setApplying(true);
    try {
      await statesService.leaveCity(id);
      alert('Вы успешно выписались из города!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Не удалось выписаться из города.';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleEditCity = async (data: { name?: string; description?: string; flagUrl?: string }) => {
    if (!id) return;
    try {
      await statesService.updateCity(id, data);
      await loadData();
    } catch (err: any) {
      console.error(err);
      throw err; // throw so the modal can handle it
    }
  };

  const handleDeleteCity = async () => {
    if (!id) return;
    if (!window.confirm('ВНИМАНИЕ! Это действие необратимо. Удалить город?')) return;
    try {
      await statesService.deleteCity(id);
      navigate('/states');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Ошибка удаления города');
    }
  };

  const handleResignMayor = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите сложить полномочия мэра?')) return;
    try {
      await statesService.resignMayor(id);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Ошибка отставки');
    }
  };

  const handleSetCapital = async () => {
    if (!id) return;
    if (!window.confirm('Сделать этот город столицей государства?')) return;
    try {
      await statesService.setCapital(id);
      alert('Город успешно назначен столицей!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Не удалось назначить столицу');
    }
  };

  const handleAddImage = async () => {
    if (!id) return;
    const url = window.prompt('Введите URL картинки города:');
    if (!url) return;
    try {
      await statesService.addCityImage(id, url);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Не удалось добавить картинку');
    }
  };

  const handleRemoveImage = async (url: string) => {
    if (!id) return;
    if (!window.confirm('Удалить эту картинку?')) return;
    try {
      await statesService.removeCityImage(id, url);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Не удалось удалить картинку');
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
                    {!isMayor ? (
                      <button
                        className="city-detail-page__btn city-detail-page__btn--danger"
                        onClick={handleLeaveCity}
                        disabled={applying}
                      >
                        <span>🚪</span> Выписаться из города
                      </button>
                    ) : (
                      <button
                        className="city-detail-page__btn city-detail-page__btn--danger"
                        disabled
                        title="Мэр не может выписаться из города. Сначала сложите полномочия."
                      >
                        <span>🚪</span> Выписаться из города
                      </button>
                    )}
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
                  <>
                    {currentUsername === city.mayorUsername?.toLowerCase() && (
                      <button
                        className="city-detail-page__btn city-detail-page__btn--danger"
                        onClick={handleResignMayor}
                      >
                        Сложить полномочия
                      </button>
                    )}
                    <button
                      className="city-detail-page__btn city-detail-page__btn--primary"
                      onClick={() => setShowEditModal(true)}
                    >
                      <span>✏️</span> Редактировать город
                    </button>
                    <button
                      className="city-detail-page__btn city-detail-page__btn--secondary"
                      onClick={() => setShowRequestsModal(true)}
                    >
                      <span>📬</span> Заявки на заселение ({pendingCount})
                    </button>
                    {!city.isCapital && (
                      <button
                        className="city-detail-page__btn city-detail-page__btn--primary"
                        onClick={handleSetCapital}
                      >
                        <span>🏛️</span> Сделать столицей
                      </button>
                    )}
                    <button
                      className="city-detail-page__btn city-detail-page__btn--danger"
                      onClick={handleDeleteCity}
                    >
                      <span>🗑️</span> Удалить город
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="city-detail-page__passport-card">
              <div className="passport-label">📜 Паспорт города</div>
              {city.isCapital && (
                <div className="passport-capital-badge">
                  ⭐ СТОЛИЦА ГОСУДАРСТВА
                </div>
              )}
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

          {/* City Images */}
          <div className="city-detail-page__section">
            <div className="city-detail-page__section-header">
              <h2 className="city-detail-page__section-title">🖼️ Фотографии города</h2>
              {isMayorOrAdmin && (
                <button className="city-detail-page__btn city-detail-page__btn--secondary" onClick={handleAddImage}>
                  Добавить фото
                </button>
              )}
            </div>
            <div className="city-images-grid">
              {city.images && city.images.length > 0 ? (
                city.images.map((img, idx) => (
                  <div key={idx} className="city-image-card">
                    <img src={img} alt={`City view ${idx + 1}`} />
                    {isMayorOrAdmin && (
                      <button className="city-image-delete" onClick={() => handleRemoveImage(img)}>×</button>
                    )}
                  </div>
                ))
              ) : (
                <div className="city-detail-page__empty-card">
                  <div className="empty-icon">📷</div>
                  <div className="empty-text">
                    <strong>Нет фотографий</strong>
                    <span>Мэр пока не загрузил фотографии этого города</span>
                  </div>
                </div>
              )}
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

          <StreetsManager cityId={city.id} isMayorOrAdmin={isMayorOrAdmin} />

          {showRequestsModal && (
            <CitizenshipRequestsModal
              requests={requests}
              onClose={() => setShowRequestsModal(false)}
              onReview={handleReviewRequest}
            />
          )}

          {showEditModal && (
            <EditCityModal
              city={city}
              onClose={() => setShowEditModal(false)}
              onSave={handleEditCity}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CityDetailPage;
