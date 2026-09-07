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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('states');

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
      alert(t('settlementDetail.alerts.applySuccess'));
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || t('settlementDetail.alerts.applyError');
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleLeaveSettlement = async () => {
    if (!id) return;
    if (!window.confirm(t('settlementDetail.alerts.confirmLeave'))) return;
    setApplying(true);
    try {
      await statesService.leaveSettlement(id);
      alert(t('settlementDetail.alerts.leaveSuccess'));
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || t('settlementDetail.alerts.leaveError');
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
    if (!window.confirm(t('settlementDetail.alerts.confirmDelete'))) return;
    try {
      await statesService.deleteSettlement(id);
      navigate('/states');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || t('settlementDetail.alerts.deleteError'));
    }
  };

  const handleResignMayor = async () => {
    if (!id) return;
    if (!window.confirm(t('settlementDetail.alerts.confirmResign'))) return;
    try {
      await statesService.resignMayor(id);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || t('settlementDetail.alerts.resignError'));
    }
  };

  const handleSetCapital = async () => {
    if (!id) return;
    if (!window.confirm(t('settlementDetail.alerts.confirmCapital'))) return;
    try {
      await statesService.setCapital(id);
      alert(t('settlementDetail.alerts.capitalSuccess'));
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || t('settlementDetail.alerts.capitalError'));
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
          <div className="settlement-detail-page">{t('settlementDetail.loading')}</div>
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
            {t('settlementDetail.notFound')}{' '}
            <button
              className="settlement-detail-page__back"
              onClick={() => navigate('/settlements')}
            >
              {t('settlementDetail.backToList')}
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
            {t('settlementDetail.backToStatesList')} {settlement?.state?.name ? `(${settlement.state.name})` : ''}
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
                      <span style={{marginLeft: '12px', fontSize: '14px', padding: '4px 8px', background: '#eab308', color: '#fff', borderRadius: '6px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>{t('settlementDetail.capitalBadge')}</span>
                    )}
                    {settlement.status === 'rural' && (
                      <span style={{marginLeft: '12px', fontSize: '14px', padding: '4px 8px', background: '#22c55e', color: '#fff', borderRadius: '6px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>{t('settlementDetail.ruralBadge')}</span>
                    )}
                  </h1>
                  <p className="settlement-detail-page__desc">
                    {settlement.description || t('settlementDetail.noDesc')}
                  </p>
                </div>
              </div>

              <div className="settlement-detail-page__meta">
                <div className="settlement-detail-page__stat-pill">
                  <span>{t('settlementDetail.mayor')}</span>{' '}
                  <strong>{settlement.mayorUsername || t('settlementDetail.vacant')}</strong>
                </div>
                {settlement.state ? (
                  <div
                    className="settlement-detail-page__stat-pill settlement-detail-page__stat-pill--state"
                    onClick={() => navigate(`/states/${settlement.state?.id}`)}
                  >
                    <span>{t('settlementDetail.state')}</span>{' '}
                    <strong>{settlement.state.name} →</strong>
                  </div>
                ) : (
                  <div className="settlement-detail-page__stat-pill">
                    <span>{t('settlementDetail.state')}</span> <strong>{t('settlementDetail.independent')}</strong>
                  </div>
                )}
                <div className="settlement-detail-page__stat-pill">
                  <span>{t('settlementDetail.population')}</span>{' '}
                  <strong>{t('settlementDetail.citizensCount', { count: settlement.citizens?.length || 0 })}</strong>
                </div>
                <div
                  className="settlement-detail-page__stat-pill settlement-detail-page__stat-pill--power"
                >
                  <span>{t('settlementDetail.powerContribution')}</span>{' '}
                  <strong>
                    {(settlement.citizens?.length || 0) >= 1
                      ? t('settlementDetail.powerValue')
                      : t('settlementDetail.zeroPower')}
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
                      {t('settlementDetail.buttons.isResident')}
                    </button>
                    {!isMayor ? (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        onClick={handleLeaveSettlement}
                        disabled={applying}
                      >
                        {t('settlementDetail.buttons.leave')}
                      </button>
                    ) : (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        disabled
                      >
                        {t('settlementDetail.buttons.leave')}
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
                      ? t('settlementDetail.buttons.applying')
                      : t('settlementDetail.buttons.apply')}
                  </button>
                )}
                {isMayorOrAdmin && (
                  <>
                    {currentUsername === settlement.mayorUsername?.toLowerCase() && (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                        onClick={handleResignMayor}
                      >
                        {t('settlementDetail.buttons.resignMayor')}
                      </button>
                    )}
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--primary"
                      onClick={() => setShowEditModal(true)}
                    >
                      {t('settlementDetail.buttons.edit')}
                    </button>
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--secondary"
                      onClick={() => setShowRequestsModal(true)}
                    >
                      {t('settlementDetail.buttons.requests', { count: pendingCount })}
                    </button>
                    {settlement.status !== 'capital' && (
                      <button
                        className="settlement-detail-page__btn settlement-detail-page__btn--primary"
                        onClick={handleSetCapital}
                      >
                        {t('settlementDetail.buttons.setCapital')}
                      </button>
                    )}
                    <button
                      className="settlement-detail-page__btn settlement-detail-page__btn--danger"
                      onClick={handleDeleteSettlement}
                    >
                      {t('settlementDetail.buttons.delete')}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="settlement-detail-page__passport-card">
              <div className="passport-label">{t('settlementDetail.passport.title')}</div>
              {settlement.status === 'capital' && (
                <div className="passport-capital-badge">
                  {t('settlementDetail.passport.capitalBadge')}
                </div>
              )}
              <div className="passport-status">
                {(settlement.citizens?.length || 0) >= 1 ? (
                  <span className="status-badge status-badge--active">
                    {t('settlementDetail.passport.active')}
                  </span>
                ) : (
                  <span className="status-badge status-badge--inactive">
                    {t('settlementDetail.passport.inactive')}
                  </span>
                )}
              </div>
              <div className="passport-date">
                {t('settlementDetail.passport.founded')}{' '}
                {settlement.createdAt
                  ? new Date(settlement.createdAt).toLocaleDateString('ru-RU')
                  : t('settlementDetail.passport.unknownDate')}
              </div>
            </div>
          </div>

          {/* Settlement Images */}
          <div className="settlement-detail-page__section">
            <div className="settlement-detail-page__section-header">
              <h2 className="settlement-detail-page__section-title">{t('settlementDetail.images.title')}</h2>
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
                    <strong>{t('settlementDetail.images.emptyTitle')}</strong>
                    <span>{t('settlementDetail.images.emptyDesc')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {elections.length > 0 && (
            <div className="settlement-detail-page__section">
              <h2 className="settlement-detail-page__section-title">
                {t('settlementDetail.elections.title')}
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
              {t('settlementDetail.citizens.title', { count: settlement.citizens?.length || 0 })}
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
                            <span className="citizen-tag-me">{t('settlementDetail.citizens.me')}</span>
                          )}
                        </div>
                        <div
                          className={`settlement-detail-page__citizen-card-role ${
                            isThisMayor
                              ? 'settlement-detail-page__citizen-card-role--mayor'
                              : ''
                          }`}
                        >
                          {isThisMayor ? t('settlementDetail.citizens.mayorRole') : t('settlementDetail.citizens.citizenRole')}
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
                      {t('settlementDetail.citizens.emptyTitle')}
                    </strong>
                    <span>{t('settlementDetail.citizens.emptyDesc')}</span>
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
