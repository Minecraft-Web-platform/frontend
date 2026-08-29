import {  } from 'axios';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './settlement-detail.page.scss';
import {
  ICitizenshipRequest,
  ISettlement,
  IElection,
  ICreateSettlementRequest,
} from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CitizenshipRequestsModal from '../../components/citizenship-requests-modal/citizenship-requests-modal.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import { EditSettlementModal } from '../../components/edit-settlement-modal/EditSettlementModal';
import StreetsManager from '../../components/streets-manager/streets-manager.component';
import { TerritoriesList } from '../../components/territories-list/TerritoriesList';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const SettlementDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [settlement, setSettlement] = useState<ISettlement | null>(null);
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
    Boolean(settlement?.mayorUsername) &&
    Boolean(currentUsername) &&
    settlement?.mayorUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const isStatePresident =
    Boolean(settlement?.state?.leaderUsername) &&
    Boolean(currentUsername) &&
    settlement?.state?.leaderUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const isMayorOrAdmin = Boolean(isMayor) || isAdmin || isStatePresident;

  const isCitizenOfThisSettlement =
    Boolean(currentUsername) &&
    Boolean(
      settlement?.citizens?.some(
        (c) => c.username.toLowerCase() === currentUsername?.toLowerCase(),
      ),
    );

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [settlementData, requestsData, electionsData] = await Promise.all([
        statesService.getSettlementById(id),
        statesService.getRequests(id),
        statesService.getElections('settlement', id),
      ]);
      setSettlement(settlementData);
      setRequests(requestsData);
      setElections(electionsData);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApplyForCitizenship = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await statesService.createRequest(id, { settlementId: id });
      alert('Ваша заявка на проживание / переезд успешно отправлена мэру поселения!');
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleLeaveSettlement = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите выписаться из этого поселения?')) return;
    setApplying(true);
    try {
      await statesService.leaveSettlement(id);
      alert('Вы успешно выписались из поселения!');
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Не удалось выписаться из поселения.';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleEditSettlement = async (data: Partial<ICreateSettlementRequest> & { images?: string[] }) => {
    if (!id) return;
    try {
      await statesService.updateSettlement(id, data);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      throw err; // throw so the modal can handle it
    }
  };

  const handleDeleteSettlement = async () => {
    if (!id) return;
    if (!window.confirm('ВНИМАНИЕ! Это действие необратимо. Удалить поселение?')) return;
    try {
      await statesService.deleteSettlement(id);
      navigate('/states');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Ошибка удаления поселения');
    }
  };

  const handleResignMayor = async () => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите сложить полномочия мэра?')) return;
    try {
      await statesService.resignMayor(id);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Ошибка отставки');
    }
  };

  const handleSetCapital = async () => {
    if (!id) return;
    if (!window.confirm('Сделать этот поселение столицей государства?')) return;
    try {
      await statesService.setCapital(id);
      alert('Поселение успешно назначен столицей!');
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Не удалось назначить столицу');
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
      const updated = await statesService.getElections('settlement', id);
      setElections(updated);
    }
  };

  const handleNominate = async (electionId: string, programText: string) => {
    await statesService.nominateCandidate(electionId, { programText });
    if (id) {
      const updated = await statesService.getElections('settlement', id);
      setElections(updated);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="settlement-detail-page">Загрузка паспорта поселения...</div>
        </main>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="settlement-detail-page">
            Поселение не найден.{' '}
            <button
              className="settlement-detail-page__back"
              onClick={() => navigate('/settlements')}
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
        <div className="settlement-detail-page">
          <button
            className="settlement-detail-page__back"
            onClick={() => {
              const targetStateId = settlement?.stateId || settlement?.state?.id;
              if (targetStateId) {
                navigate(`/settlements?stateId=${targetStateId}`);
              } else {
                navigate('/settlements');
              }
            }}
          >
            ← К списку поселений {settlement?.state?.name ? `(${settlement.state.name})` : ''}
          </button>

          <div className="settlement-detail-page__hero">
            <div className="settlement-detail-page__hero-main">
              <div className="settlement-detail-page__header-row">
                <div className="settlement-detail-page__emblem-wrap">
                  {settlement.flagUrl ? (
                    <img
                      src={settlement.flagUrl}
                      alt={`${settlement.name} flag`}
                      className="settlement-detail-page__flag"
                    />
                  ) : (
                    <div className="settlement-detail-page__flag-placeholder">
                      <span>🏛️</span>
                    </div>
                  )}
                </div>

                <div className="settlement-detail-page__info">
                  <h1 className="settlement-detail-page__title">
                    {settlement.name}
                    {settlement.status === 'capital' && (
                      <span style={{marginLeft: '12px', fontSize: '14px', padding: '4px 8px', background: '#eab308', color: '#fff', borderRadius: '6px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>Столица</span>
                    )}
                    {settlement.status === 'rural' && (
                      <span style={{marginLeft: '12px', fontSize: '14px', padding: '4px 8px', background: '#22c55e', color: '#fff', borderRadius: '6px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>Сельское пос.</span>
                    )}
                  </h1>
                  <p className="settlement-detail-page__desc">
                    {settlement.description || 'Описание поселения пока не указано.'}
                  </p>
                </div>
              </div>

              <div className="settlement-detail-page__meta">
                <div className="settlement-detail-page__stat-pill">
                  <span>🏛️ Мэр поселения:</span>{' '}
                  <strong>{settlement.mayorUsername || 'Вакантно (Выборы)'}</strong>
                </div>
                {settlement.state ? (
                  <div
                    className="settlement-detail-page__stat-pill settlement-detail-page__stat-pill--state"
                    onClick={() => navigate(`/states/${settlement.state?.id}`)}
                    title="Перейти к странице государства"
                  >
                    <span>🏰 Государство:</span>{' '}
                    <strong>{settlement.state.name} →</strong>
                  </div>
                ) : (
                  <div className="settlement-detail-page__stat-pill">
                    <span>🏰 Государство:</span> <strong>Независимый поселение</strong>
                  </div>
                )}
                <div className="settlement-detail-page__stat-pill">
                  <span>👥 Население:</span>{' '}
                  <strong>{settlement.citizens?.length || 0} жит.</strong>
                </div>
                <div
                  className="settlement-detail-page__stat-pill settlement-detail-page__stat-pill--power"
                  title="Экономический вклад поселения в мощь своего государства"
                >
                  <span>⚡ Вклад в мощь:</span>{' '}
                  <strong>
                    {(settlement.citizens?.length || 0) >= 1
                      ? '+100 ед.'
                      : '0 ед. (нет жителей)'}
                  </strong>
                </div>
              </div>

              <div className="settlement-detail-page__actions">
                {isCitizenOfThisSettlement ? (
                  <>
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--resident"
                      disabled
                    >
                      <span>🏠</span> Вы житель этого поселения
                    </button>
                    {!isMayor ? (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        onClick={handleLeaveSettlement}
                        disabled={applying}
                      >
                        <span>🚪</span> Выписаться из поселения
                      </button>
                    ) : (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        disabled
                        title="Мэр не может выписаться из поселения. Сначала сложите полномочия."
                      >
                        <span>🚪</span> Выписаться из поселения
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="settlement-detail-page__btn settlement-detail-page__btn--primary"
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
                    {currentUsername === settlement.mayorUsername?.toLowerCase() && (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        onClick={handleResignMayor}
                      >
                        Сложить полномочия
                      </button>
                    )}
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--primary"
                      onClick={() => setShowEditModal(true)}
                    >
                      <span>✏️</span> Редактировать поселение
                    </button>
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--secondary"
                      onClick={() => setShowRequestsModal(true)}
                    >
                      <span>📬</span> Заявки на заселение ({pendingCount})
                    </button>
                    {settlement.status !== 'capital' && (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--primary"
                        onClick={handleSetCapital}
                      >
                        <span>🏛️</span> Сделать столицей
                      </button>
                    )}
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                      onClick={handleDeleteSettlement}
                    >
                      <span>🗑️</span> Удалить поселение
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="settlement-detail-page__passport-card">
              <div className="passport-label">📜 Паспорт поселения</div>
              {settlement.status === 'capital' && (
                <div className="passport-capital-badge">
                  ⭐ СТОЛИЦА ГОСУДАРСТВА
                </div>
              )}
              <div className="passport-status">
                {(settlement.citizens?.length || 0) >= 1 ? (
                  <span className="status-badge status-badge--active">
                    ● Активный поселение
                  </span>
                ) : (
                  <span className="status-badge status-badge--inactive">
                    ○ Малонаселённый
                  </span>
                )}
              </div>
              <div className="passport-date">
                Основан:{' '}
                {settlement.createdAt
                  ? new Date(settlement.createdAt).toLocaleDateString('ru-RU')
                  : 'Неизвестно'}
              </div>
            </div>
          </div>

          {/* Settlement Images */}
          <div className="settlement-detail-page__section">
            <div className="settlement-detail-page__section-header">
              <h2 className="settlement-detail-page__section-title">🖼️ Фотографии поселения</h2>
            </div>
            <div className="settlement-images-grid">
              {settlement.images && settlement.images.length > 0 ? (
                settlement.images.map((img, idx) => (
                  <div key={idx} className="settlement-image-card">
                    <img src={img} alt={`Settlement view ${idx + 1}`} />
                  </div>
                ))
              ) : (
                <div className="settlement-detail-page__empty-card">
                  <div className="empty-icon">📷</div>
                  <div className="empty-text">
                    <strong>Нет фотографий</strong>
                    <span>Мэр пока не загрузил фотографии этого поселения</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {elections.length > 0 && (
            <div className="settlement-detail-page__section">
              <h2 className="settlement-detail-page__section-title">
                🗳️ Выборы Мэра в поселении
              </h2>
              <div className="settlement-detail-page__elections-list">
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

          <div className="settlement-detail-page__section">
            <h2 className="settlement-detail-page__section-title">
              👥 Жители поселения ({settlement.citizens?.length || 0})
            </h2>
            <div className="settlement-detail-page__citizens-grid">
              {settlement.citizens && settlement.citizens.length > 0 ? (
                settlement.citizens.map((citizen) => {
                  const isThisMayor =
                    settlement.mayorUsername &&
                    citizen.username.toLowerCase() ===
                      settlement.mayorUsername.toLowerCase();
                  const isMe =
                    currentUsername &&
                    citizen.username.toLowerCase() ===
                      currentUsername.toLowerCase();

                  return (
                    <div
                      key={citizen.id}
                      className={`settlement-detail-page__citizen-card ${
                        isMe ? 'settlement-detail-page__citizen-card--me' : ''
                      }`}
                    >
                      <img
                        src={`https://minotar.net/helm/${citizen.username}/48.png`}
                        alt={citizen.username}
                        className="settlement-detail-page__citizen-card-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://minotar.net/helm/MHF_Steve/48.png';
                        }}
                      />
                      <div className="settlement-detail-page__citizen-card-info">
                        <div className="settlement-detail-page__citizen-card-name">
                          {citizen.username}{' '}
                          {isMe && (
                            <span className="citizen-tag-me">(Вы)</span>
                          )}
                        </div>
                        <div
                          className={`settlement-detail-page__citizen-card-role ${
                            isThisMayor
                              ? 'settlement-detail-page__citizen-card-role--mayor'
                              : ''
                          }`}
                        >
                          {isThisMayor ? '👑 Мэр поселения' : '👥 Житель'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="settlement-detail-page__empty-card">
                  <div className="empty-icon">🏙️</div>
                  <div className="empty-text">
                    <strong>
                      В этом поселении пока нет официально зарегистрированных жителей
                    </strong>
                    <span>Подайте заявку первым и станьте жителем поселения!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <StreetsManager settlementId={settlement.id} isMayorOrAdmin={isMayorOrAdmin} />

          <div className="settlement-detail-page__section">
            <TerritoriesList ownerType="settlement" ownerId={settlement.id} />
          </div>

          {showRequestsModal && (
            <CitizenshipRequestsModal
              requests={requests}
              onClose={() => setShowRequestsModal(false)}
              onReview={handleReviewRequest}
            />
          )}

          {showEditModal && (
            <EditSettlementModal
              settlement={settlement}
              onClose={() => setShowEditModal(false)}
              onSave={handleEditSettlement}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SettlementDetailPage;
