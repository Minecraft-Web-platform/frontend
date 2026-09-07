import {  } from 'axios';
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
import SettlementCard from '../../components/settlement-card/settlement-card.component';
import DecreesFeed from '../../components/decrees-feed/decrees-feed.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import DiplomacyBadge from '../../components/diplomacy-badge/diplomacy-badge.component';
import { TerritoriesList } from '../../components/territories-list/TerritoriesList';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import { ICurrency } from '../../../economy/types/economy.types';
import {
  MinecraftItemDropdown,
  MinecraftEnchantDropdown,
} from '../../../economy/components/MinecraftItemSelector';
import { ISettlementType } from '../../types/states.types';
import '../../../economy/economy-shared.scss';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';
import { EditStateModal } from '../../components/edit-state-modal/EditStateModal';
import { useTranslation } from 'react-i18next';

const formatAccountNumber = (treasuryAccount: any, t?: any) => {
  const accountId = treasuryAccount?.id;
  const acc = treasuryAccount;
  if (!accountId) return t('stateDetailMissed.noAccount');
  if (!acc) return t('stateDetailMissed.noAccount');
  return `${acc.balance.toLocaleString()} ${acc.currencyCode}`;
};

const StateDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('states');

  const [state, setState] = useState<IState | null>(null);
  const [decrees, setDecrees] = useState<IStateDecree[]>([]);
  const [diplomacy, setDiplomacy] = useState<IDiplomacy[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [treasury, setTreasury] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Модальные окна дашборда президента
  const [showCreateSettlementModal, setShowCreateSettlementModal] = useState(false);
  const [settlementName, setSettlementName] = useState('');
  const [settlementDesc, setSettlementDesc] = useState('');
  const [settlementStatus, setSettlementStatus] = useState<'capital' | 'settlement' | 'rural'>('settlement');
  const [settlementCenterX, setSettlementCenterX] = useState('');
  const [settlementCenterZ, setSettlementCenterZ] = useState('');
  const [settlementSubTypeId, setSettlementSubTypeId] = useState('');
  const [settlementTypes, setSettlementTypes] = useState<ISettlementType[]>([]);
  const [showProposeTypeModal, setShowProposeTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

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

  const [showEditStateModal, setShowEditStateModal] = useState(false);

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
        typesData,
      ] = await Promise.all([
        statesService.getStateById(id),
        statesService.getDecrees(id),
        statesService.getDiplomacy(id),
        statesService.getElections('state', id),
        economyService.getAllCurrencies(),
        statesService.getStateTreasury(id),
        statesService.getSettlementTypes(),
      ]);
      setState(stateData);
      setDecrees(decreesData);
      setDiplomacy(diplomacyData);
      setElections(electionsData);
      setTreasury(treasuryData);
      setSettlementTypes(typesData);
      setCurrencies(
        currenciesData.filter(
          (c) => !c.stateId || c.stateId === id,
        ),
      );
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
    if (!window.confirm(t('state-detail.alerts.resignConfirm'))) return;
    try {
      await statesService.resignPresident(id);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || t('state-detail.alerts.resignError'));
    }
  };

  const handleEditState = async (data: { name?: string; description?: string; flagUrl?: string; coatOfArmsUrl?: string }) => {
    if (!id) return;
    try {
      await statesService.updateState(id, data);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || t('state-detail.alerts.editError'));
    }
  };

  const handleDeleteState = async () => {
    if (!id) return;
    if (!window.confirm(t('state-detail.alerts.archiveConfirm'))) return;
    try {
      await statesService.deleteState(id);
      navigate('/states');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || t('state-detail.alerts.archiveError'));
    }
  };

  const handleDigitizeTreasury = async () => {
    if (!id || !canPublishDecree) return;
    try {
      setLoading(true);
      const res = await statesService.digitizeTreasury(id);
      alert(res.message || t('state-detail.alerts.digitizeSuccess'));
      loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('state-detail.alerts.digitizeError'));
      setLoading(false);
    }
  };


  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !settlementName.trim()) return;
    try {
      await statesService.createSettlement({
        stateId: id,
        name: settlementName,
        description: settlementDesc,
        status: settlementStatus,
        centerX: settlementCenterX ? parseInt(settlementCenterX, 10) : undefined,
        centerZ: settlementCenterZ ? parseInt(settlementCenterZ, 10) : undefined,
        ruralSubTypeId: settlementStatus === 'rural' ? settlementSubTypeId : undefined,
      });
      setShowCreateSettlementModal(false);
      setSettlementName('');
      setSettlementDesc('');
      setSettlementCenterX('');
      setSettlementCenterZ('');
      setSettlementStatus('settlement');
      setSettlementSubTypeId('');
      loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || t('state-detail.alerts.settlementError'));
    }
  };

  const handleProposeType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      await statesService.proposeSettlementType(newTypeName);
      alert(t('state-detail.alerts.proposeSuccess'));
      setShowProposeTypeModal(false);
      setNewTypeName('');
      // We could reload types here, but since it's not approved yet, it won't show up anyway.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || t('state-detail.alerts.proposeError'));
    }
  };

  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currCode.trim() || !currName.trim()) return;
    if (currItemId === currKopeckItemId) {
      alert(t('state-detail.alerts.currencySameError'));
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('state-detail.alerts.currencyError'));
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await economyService.createBank({
        name: bankName || t('stateDetailMissed.defaultBankName', { name: state?.name }),
        ownerType: 'state',
        ownerId: id,
        accountId: state?.treasuryAccountNumber
      });
      setShowCreateBankModal(false);
      setBankName('');
      alert(t('state-detail.alerts.bankSuccess'));
      loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('state-detail.alerts.bankError'));
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
        alert(t('state-detail.alerts.taxInvalid'));
        return;
      }
      await statesService.updateState(id, { 
        playerToPlayerTransferFee: p2p,
        playerToCompanyTransferFee: p2c,
        exchangeTradingFee: ex
      });
      setShowTaxModal(false);
      alert(t('state-detail.alerts.taxSuccess'));
      loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('state-detail.alerts.taxError'));
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
      alert(t('state-detail.alerts.rolesSuccess'));
      loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('state-detail.alerts.rolesError'));
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
          <div className="state-detail-page">{t('state-detail.loading')}</div>
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
            {t('state-detail.notFound')}{' '}
            <button
              className="state-detail-page__back"
              onClick={() => navigate('/states')}
            >
              {t('state-detail.backList')}
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
    const activeSettlements =
      state.settlements?.filter((c) => (c.citizens?.length || 0) >= 1).length || 0;
    const taxRate = state.playerToCompanyTransferFee || 5;
    let taxCoefficient = 1.0;
    if (taxRate <= 10) {
      taxCoefficient = 1.0;
    } else if (taxRate <= 25) {
      taxCoefficient = 0.95;
    } else {
      taxCoefficient = 0.85;
    }

    let basePower = citizensCount * 10 + activeSettlements * 100;

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
            {t('state-detail.backStates')}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <h1 className="state-detail-page__name" style={{ margin: 0, padding: 0 }}>
                      {state.name}
                    </h1>
                    {state.isArchived && (
                      <span style={{ fontSize: '0.6em', padding: '4px 8px', background: '#dc3545', color: '#fff', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('state-detail.archived')}</span>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                      <button 
                        className="btn-copy-id" 
                        title={t('stateDetailMissed.copyId')} 
                        onClick={() => {
                          navigator.clipboard.writeText(state.id);
                          alert(t('state-detail.alerts.idCopied'));
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                      {canPublishDecree && !state.isArchived && (
                        <>
                          <button 
                            className="state-detail__btn state-detail__btn--edit-icon"
                            title={t('stateDetailMissed.editState')} 
                            onClick={() => setShowEditStateModal(true)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                          <button 
                            className="state-detail__btn state-detail__btn--danger-icon"
                            title={t('stateDetailMissed.archiveState')} 
                            onClick={handleDeleteState}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="state-detail-page__desc">
                    {state.description || t('state-detail.descMissing')}
                  </p>
                </div>
              </div>

              <div className="state-detail-page__meta">
                {state.citizenshipName && (
                  <div className="state-detail-page__stat-pill">
                    <span>{t('state-detail.citizenship')}</span> <strong>{state.citizenshipName}</strong>
                  </div>
                )}
                <div className="state-detail-page__stat-pill">
                  <span>{t('state-detail.president')}</span>{' '}
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
                    <strong>{t('state-detail.presidentNone')}</strong>
                  )}
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>{t('state-detail.settlements')}</span> <strong>{state.settlements?.length || 0}</strong>
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>{t('state-detail.citizens')}</span> <strong>{state.citizens?.length || 0}</strong>
                </div>
                <div className="state-detail-page__stat-pill">
                  <span>{t('state-detail.taxes')}</span> <strong>{state.playerToPlayerTransferFee || 0}% / {state.playerToCompanyTransferFee || 5}%</strong>
                </div>
                <div className="stat-item" title={t('state-detail.powerTitle')}>
                  <span>{t('state-detail.power')}</span> <strong>{calculateStatePower()}{t('stateDetailMissed.powerUnit')}</strong>
                </div>
              </div>
            </div>

            <div className="state-detail-page__treasury-card">
              <div className="treasury-label">{t('state-detail.treasury.title')}</div>
              <div className="treasury-acc">
                {formatAccountNumber(state.treasuryAccountNumber, t)}
              </div>
              <div className="treasury-hint" style={{ marginBottom: (canPublishDecree || isTreasurer) ? '12px' : '0' }}>
                {state.treasuryAccountNumber ? t('state-detail.treasury.hintRegistered') : t('state-detail.treasury.hintUnregistered')}
              </div>
              {(canPublishDecree || isTreasurer) && (
                <button
                  className="economy-btn economy-btn--primary"
                  style={{ width: '100%', fontSize: '14px', padding: '8px 12px' }}
                  onClick={() => navigate(`/states/${id}/national-bank`)}
                >
                  {t('state-detail.treasury.btnBank')}
                </button>
              )}
            </div>
          </div>

          {/* Панель управления государством (Только для президента/лидера) */}
          {canPublishDecree && (
            <div className="state-dashboard">
              <h3 className="state-dashboard__title">
                {t('state-detail.dashboard.title')}
              </h3>
              <div className="state-dashboard__cards">
                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.settlements.title')}</div>
                    <div className="card-subtitle">
                      {t('state-detail.dashboard.settlements.founded')}{state.settlements?.length || 0}
                    </div>
                  </div>
                  <button
                    className="card-action"
                    onClick={() => setShowCreateSettlementModal(true)}
                  >
                    {t('state-detail.dashboard.settlements.btn')}
                  </button>
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.power.title')}</div>
                    <div className="card-subtitle">
                      {t('state-detail.dashboard.power.desc')}
                    </div>
                  </div>
                  <button
                    className="card-action"
                    style={{ background: '#fee2e2', color: '#b91c1c' }}
                    onClick={handleResignPresident}
                  >
                    {t('state-detail.dashboard.power.btn')}
                  </button>
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.bank.title')}</div>
                    <div className="card-subtitle">
                      {state.treasuryAccountNumber
                        ? t('state-detail.dashboard.bank.active', { account: state.treasuryAccountNumber })
                        : t('state-detail.dashboard.bank.inactive')}
                    </div>
                  </div>
                  {!state.treasuryAccountNumber ? (
                    <button
                      className="card-action"
                      onClick={() => setShowCreateBankModal(true)}
                    >
                      {t('state-detail.dashboard.bank.btn')}
                    </button>
                  ) : (
                    <div className="card-status-ok" style={{ color: '#10b981', fontWeight: 600 }}>
                      {t('state-detail.dashboard.bank.statusOk')}
                    </div>
                  )}
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.currency.title')}</div>
                    <div className="card-subtitle">
                      {!state.treasuryAccountNumber
                        ? t('state-detail.dashboard.currency.noBank')
                        : stateCurrency
                          ? t('state-detail.dashboard.currency.active', { name: stateCurrency.name, code: stateCurrency.code })
                          : t('state-detail.dashboard.currency.inactive')}
                    </div>
                  </div>
                  {!state.treasuryAccountNumber ? (
                    <button
                      className="card-action"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      {t('state-detail.dashboard.currency.btnBank')}
                    </button>
                  ) : !stateCurrency ? (
                    <button
                      className="card-action"
                      onClick={() => setShowCreateCurrencyModal(true)}
                    >
                      {t('state-detail.dashboard.currency.btnCurrency')}
                    </button>
                  ) : (
                    <div className="card-status-ok" style={{ color: '#10b981', fontWeight: 600 }}>
                      {t('state-detail.dashboard.currency.statusOk', { code: stateCurrency.code })}
                    </div>
                  )}
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.taxes.title')}</div>
                    <div className="card-subtitle">
                      {t('state-detail.dashboard.taxes.p2p')}{state.playerToPlayerTransferFee || 0}%<br/>
                      {t('state-detail.dashboard.taxes.p2c')}{state.playerToCompanyTransferFee || 5}%<br/>
                      {t('state-detail.dashboard.taxes.exchange')}{state.exchangeTradingFee || 2}%
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
                    {t('state-detail.dashboard.taxes.btn')}
                  </button>
                </div>

                <div className="state-dashboard__card">
                  <div>
                    <div className="card-title">{t('state-detail.dashboard.roles.title')}</div>
                    <div className="card-subtitle">
                      {t('state-detail.dashboard.roles.treasurer')}{state.treasurerUsername || t('state-detail.dashboard.roles.unassigned')}<br />
                      {t('state-detail.dashboard.roles.voivode')}{state.voivodeUsername || t('state-detail.dashboard.roles.unassigned')}
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
                    {t('state-detail.dashboard.roles.btn')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {diplomacy.length > 0 && (
            <>
              <h3 className="state-detail-page__section-title">
                {t('state-detail.diplomacyTitle')}
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
                {t('state-detail.electionsTitle')}
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
            <span>{t('state-detail.settlementsTitle')} ({state.settlements?.length || 0})</span>
            <button
              className="state-detail-page__btn"
              onClick={() => navigate(`/settlements?stateId=${state.id}`)}
            >
              {t('state-detail.allSettlementsBtn')}
            </button>
          </div>

          <div className="state-detail-page__settlements-grid">
            {state.settlements && state.settlements.length > 0 ? (
              state.settlements.map((settlement) => <SettlementCard key={settlement.id} settlement={settlement} />)
            ) : (
              <div className="state-detail-page__empty-card">
                <div className="empty-icon">🏙️</div>
                <div className="empty-text">
                  <strong>
                    {t('state-detail.settlementsEmpty.title')}
                  </strong>
                  <span>
                    {t('state-detail.settlementsEmpty.desc')}
                  </span>
                </div>
                {canPublishDecree && (
                  <button
                    className="empty-btn"
                    onClick={() => setShowCreateSettlementModal(true)}
                  >
                    {t('state-detail.settlementsEmpty.btn')}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>
              {t('state-detail.citizensTitle')} ({state.citizens?.length || 0})
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
                        {isMe && <span className="tag-me">{t('state-detail.citizensCard.me')}</span>}
                      </div>
                      <div
                        className={`state-citizen-card__role ${
                          isLeader ? 'state-citizen-card__role--leader' : ''
                        }`}
                      >
                        {isLeader ? t('state-detail.citizensCard.leader') : t('state-detail.citizensCard.citizen')}
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
                    {t('state-detail.citizensEmpty.title')}
                  </strong>
                  <span>
                    {t('state-detail.citizensEmpty.desc')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>
              {t('state-detail.goldReserve.title')}
            </span>
            {canPublishDecree && (
              <button
                className="state-detail-page__btn"
                onClick={handleDigitizeTreasury}
                style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff' }}
              >
                {t('state-detail.goldReserve.btn')}
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
                      <div className="treasury-count">{t('state-detail.goldReserve.count')}<strong>{item.quantity}{t('state-detail.goldReserve.pcs')}</strong></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="state-detail-page__empty-card" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-icon">📦</div>
                <div className="empty-text">
                  <strong>{t('state-detail.goldReserve.emptyTitle')}</strong>
                  <span>{t('state-detail.goldReserve.emptyDesc')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="state-detail-page__section-title">
            <span>{t('state-detail.currenciesTitle')} ({currencies.length})</span>
            <button
              className="state-detail-page__btn"
              onClick={() => navigate('/economy?tab=currencies')}
            >
              {t('state-detail.allCurrenciesBtn')}
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
                        <span>{t('state-detail.currencyCard.rate')}</span>
                        <strong>{t('stateDetailMissed.exchangeRateInfo', { code: curr.code, rate: Number(curr.exchangeRate || 1).toFixed(4) })}</strong>
                      </div>
                      <div>
                        <span>{t('state-detail.currencyCard.issued')}</span>
                        <strong>{Number(curr.totalIssued || 0).toLocaleString('ru-RU')} {curr.code}</strong>
                      </div>
                      <div className="state-detail__currency-stat">
                        <span>{t('state-detail.currency.support')}</span>
                        <strong>{calculateStatePower()}{t('stateDetailMissed.powerUnit')}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    className="state-currency-card__link-btn"
                    onClick={() => navigate('/economy?tab=currencies')}
                  >
                    {t('state-detail.currencyCard.btn')}
                  </button>
                </div>
              ))
            ) : (
              <div className="state-detail-page__empty-card">
                <div className="empty-icon">💰</div>
                <div className="empty-text">
                  <strong>{t('state-detail.currenciesEmpty.title')}</strong>
                  <span>
                    {t('state-detail.currenciesEmpty.desc')}
                  </span>
                </div>
                {canPublishDecree && (
                  <button
                    className="empty-btn"
                    onClick={() => setShowCreateCurrencyModal(true)}
                  >
                    {t('state-detail.currenciesEmpty.btn')}
                  </button>
                )}
              </div>
            )}
          </div>

          <h3 className="state-detail-page__section-title">
            {t('state-detail.decreesTitle')}
          </h3>
          <DecreesFeed
            decrees={decrees}
            canCreate={canPublishDecree}
            onCreateDecree={handleCreateDecree}
          />

          <div className="state-detail-page__section" style={{ marginTop: '30px' }}>
            <TerritoriesList ownerType="state" ownerId={state.id} />
          </div>

          {/* Модальное окно создания поселения */}
          {showCreateSettlementModal && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">{t('state-detail.modals.settlement.title')}</h3>
                <form onSubmit={handleCreateSettlement} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.settlement.nameLabel')}</span>
                    <input
                      type="text"
                      value={settlementName}
                      onChange={(e) => setSettlementName(e.target.value)}
                      placeholder={t('state-detail.modals.settlement.namePlaceholder')}
                      required
                    />
                  </label>
                  <label>
                    <span>{t('state-detail.modals.settlement.descLabel')}</span>
                    <input
                      type="text"
                      value={settlementDesc}
                      onChange={(e) => setSettlementDesc(e.target.value)}
                      placeholder={t('state-detail.modals.settlement.descPlaceholder')}
                    />
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1 }}>
                      <span>{t('state-detail.modals.settlement.xLabel')}</span>
                      <input
                        type="number"
                        value={settlementCenterX}
                        onChange={(e) => setSettlementCenterX(e.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label style={{ flex: 1 }}>
                      <span>{t('state-detail.modals.settlement.zLabel')}</span>
                      <input
                        type="number"
                        value={settlementCenterZ}
                        onChange={(e) => setSettlementCenterZ(e.target.value)}
                        placeholder="0"
                      />
                    </label>
                  </div>

                  <label>
                    <span>{t('state-detail.modals.settlement.statusLabel')}</span>
                    <select
                      value={settlementStatus}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setSettlementStatus(e.target.value as any)}
                      required
                    >
                      <option value="settlement">{t('state-detail.modals.settlement.statusOpts.settlement')}</option>
                      <option value="rural">{t('state-detail.modals.settlement.statusOpts.rural')}</option>
                    </select>
                  </label>

                  {settlementStatus === 'rural' && (
                    <label>
                      <span>{t('state-detail.modals.settlement.subTypeLabel')}</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                          value={settlementSubTypeId}
                          onChange={(e) => setSettlementSubTypeId(e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="">{t('state-detail.modals.settlement.subTypePlaceholder')}</option>
                          {settlementTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowProposeTypeModal(true)}
                          className="economy-btn economy-btn--secondary"
                          style={{ padding: '0 10px', whiteSpace: 'nowrap' }}
                        >
                          {t('state-detail.modals.settlement.proposeBtn')}
                        </button>
                      </div>
                    </label>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateSettlementModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      {t('state-detail.modals.settlement.cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      {t('state-detail.modals.settlement.submitBtn')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Модальное окно "Предложить подвид" */}
          {showProposeTypeModal && (
            <div className="economy-modal-overlay" style={{ zIndex: 1100 }}>
              <div className="economy-modal" style={{ maxWidth: '400px' }}>
                <h3 className="modal-title">{t('state-detail.modals.propose.title')}</h3>
                <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                  {t('state-detail.modals.propose.desc')}
                </p>
                <form onSubmit={handleProposeType} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.propose.nameLabel')}</span>
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder={t('state-detail.modals.propose.namePlaceholder')}
                      required
                      minLength={3}
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowProposeTypeModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      {t('state-detail.modals.propose.cancelBtn')}
                    </button>
                    <button type="submit" className="economy-btn economy-btn--primary">
                      {t('state-detail.modals.propose.submitBtn')}
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
                <h3 className="modal-title">{t('state-detail.modals.currency.title')}</h3>
                <form onSubmit={handleCreateCurrency} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.currency.codeLabel')}</span>
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
                    <span>{t('state-detail.modals.currency.nameLabel')}</span>
                    <input
                      type="text"
                      value={currName}
                      onChange={(e) => setCurrName(e.target.value)}
                      placeholder={t('state-detail.modals.currency.namePlaceholder')}
                      required
                    />
                  </label>
                  <MinecraftItemDropdown
                    label={t('state-detail.modals.currency.mainLabel')}
                    value={currItemId}
                    onChange={setCurrItemId}
                    required
                  />
                  <MinecraftItemDropdown
                    label={t('state-detail.modals.currency.kopeckLabel')}
                    value={currKopeckItemId}
                    onChange={setCurrKopeckItemId}
                    required
                  />
                  <MinecraftEnchantDropdown
                    label={t('state-detail.modals.currency.enchantLabel')}
                    value={currEnchantment}
                    onChange={setCurrEnchantment}
                  />
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>
                    {t('state-detail.modals.currency.info')}
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
                      {t('state-detail.modals.currency.error')}
                    </div>
                  )}
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateCurrencyModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      {t('state-detail.modals.currency.cancelBtn')}
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
                      {t('state-detail.modals.currency.submitBtn')}
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
                <h3 className="modal-title">{t('state-detail.modals.bank.title')}</h3>
                <form onSubmit={handleCreateBank} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.bank.nameLabel')}</span>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={t('state-detail.modals.bank.namePlaceholder', { name: state.name })}
                    />
                  </label>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>
                    {t('state-detail.modals.bank.info')}
                  </p>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateBankModal(false)}
                      className="economy-btn economy-btn--secondary"
                    >
                      {t('state-detail.modals.bank.cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      {t('state-detail.modals.bank.submitBtn')}
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
                <h3 className="modal-title">{t('state-detail.modals.tax.title')}</h3>
                <form onSubmit={handleUpdateTax} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.tax.p2pLabel')}</span>
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
                    <span>{t('state-detail.modals.tax.p2cLabel')}</span>
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
                    <span>{t('state-detail.modals.tax.exchangeLabel')}</span>
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
                      {t('state-detail.modals.tax.cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      {t('state-detail.modals.tax.submitBtn')}
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
                <h3 className="modal-title">{t('state-detail.modals.roles.title')}</h3>
                <form onSubmit={handleUpdateRoles} className="modal-form">
                  <label>
                    <span>{t('state-detail.modals.roles.treasurerLabel')}</span>
                    <select
                      value={newTreasurer}
                      onChange={(e) => setNewTreasurer(e.target.value)}
                    >
                      <option value="">{t('state-detail.modals.roles.unassign')}</option>
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
                    <span>{t('state-detail.modals.roles.voivodeLabel')}</span>
                    <select
                      value={newVoivode}
                      onChange={(e) => setNewVoivode(e.target.value)}
                    >
                      <option value="">{t('state-detail.modals.roles.unassign')}</option>
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
                      {t('state-detail.modals.roles.cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      {t('state-detail.modals.roles.submitBtn')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEditStateModal && (
            <EditStateModal
              state={state}
              onClose={() => setShowEditStateModal(false)}
              onSave={handleEditState}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default StateDetailPage;
