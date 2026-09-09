import { AxiosError } from 'axios';
import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { IState } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import { economyService } from '../../../economy/services/economy.service';
import { IAccount, IIpoRequest } from '../../../economy/types/economy.types';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';
import { AccountCard } from '../../../economy/components/AccountCard';
import '../../../economy/economy-shared.scss';
import './national-bank.page.scss';
import { useTranslation } from 'react-i18next';
import { PropagateLoader } from 'react-spinners';
import Button from '../../../../shared/ui/button/button.component';

const NationalBankPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<IState | null>(null);
  const [treasuryAccount, setTreasuryAccount] = useState<IAccount | null>(null);
  const [ipoRequests, setIpoRequests] = useState<IIpoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, isAdmin } = useAuthStore();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const { t } = useTranslation('states');

  useEffect(() => {
    if (isAuthenticated) {
      profileService
        .getInfoAboutMe()
        .then((res) => setCurrentUsername(res.username))
        .catch(() => setCurrentUsername(null));
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!id || !currentUsername) return;
    try {
      setLoading(true);
      const stateData = await statesService.getStateById(id);
      setState(stateData);

      const isPresident = stateData.leaderUsername?.toLowerCase() === currentUsername.toLowerCase();
      const isTreasurer = stateData.treasurerUsername?.toLowerCase() === currentUsername.toLowerCase();

      if (!isPresident && !isTreasurer && !isAdmin) {
        alert(t('nationalBank.accessDenied'));
        navigate(`/states/${id}`);
        return;
      }

      const allCurrencies = await economyService.getAllCurrencies();
      const stateCurr = allCurrencies.find((c) => c.stateId === stateData.id);

      if (stateCurr && stateData.treasuryAccountNumber) {
        const { accounts } = await economyService.getMyAccounts();
        const treasury = accounts.find((acc) => acc.accountNumber === stateData.treasuryAccountNumber);
        if (treasury) {
          setTreasuryAccount(treasury);
        }
      }

      try {
        const reqs = await economyService.getIpoRequests(stateData.id);
        setIpoRequests(reqs);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to load IPO requests', err);
      }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUsername) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUsername]);

  const handleApproveIpo = async (reqId: string) => {
    try {
      await economyService.reviewIpoRequest(reqId, 'approved');
      setIpoRequests((prev) => prev.filter((r) => r.id !== reqId));
      loadData(); // reload treasury balance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || (err as Error).message);
    }
  };

  const handleRejectIpo = async (reqId: string) => {
    try {
      await economyService.reviewIpoRequest(reqId, 'rejected');
      setIpoRequests((prev) => prev.filter((r) => r.id !== reqId));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="page economy-page">
        <Sidebar />
        <main className="content">
          <div className="economy-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
            <PropagateLoader color="#eab308" />
            <h2>{t('nationalBank.title')}</h2>
            <p style={{ marginTop: '16px', color: '#64748b' }}>{t('nationalBank.gatheringData')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="economy-page">
          <div className="economy-container">
            <div className="economy-hero" style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }}>
              <div className="hero-icon">🏦</div>
              <h2 className="hero-title">{t('nationalBank.heroTitle', { name: state?.name })}</h2>
              <p className="hero-subtitle">{t('nationalBank.heroSubtitle')}</p>
            </div>
          </div>

          <div className="economy-container national-bank-container">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <Button callback={() => navigate(`/states/${id}`)} secondary={true}>
                {t('nationalBank.backToState')}
              </Button>
              <Button callback={() => navigate('/economy?tab=transfers')}>
                {t('nationalBank.goToTransfers')}
              </Button>
            </div>

            {!state?.treasuryAccountNumber ? (
              <div className="economy-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
                <h3>{t('nationalBank.notEstablished')}</h3>
                <p>{t('nationalBank.notEstablishedDesc')}</p>
              </div>
            ) : !treasuryAccount ? (
              <div className="economy-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <h3>{t('nationalBank.accountNotFound')}</h3>
                <p>{t('nationalBank.accountNotFoundDesc')}</p>
              </div>
            ) : (
              <div className="treasury-dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="economy-card">
                  <h3 className="economy-section-title" style={{ marginTop: 0 }}>{t('nationalBank.treasuryAccount')}</h3>
                  <AccountCard account={treasuryAccount} cards={[]} onTransferClick={() => navigate('/economy')} onIssueCard={() => navigate('/economy/cards')} />
                </div>

                <div className="economy-card">
                  <h3 className="economy-section-title" style={{ marginTop: 0 }}>{t('nationalBank.economySettings')}</h3>
                  <div className="stats-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('nationalBank.transfersTax')}</label>
                      <input
                        type="number"
                        className="economy-input"
                        value={state.playerToPlayerTransferFee || 0}
                        onChange={async (e) => {
                          const val = Number(e.target.value);
                          const updated = await statesService.updateState(state.id, { playerToPlayerTransferFee: val });
                          setState(updated);
                        }}
                     />
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('nationalBank.commercialTax')}</label>
                     <input
                        type="number"
                        className="economy-input"
                        value={state.playerToCompanyTransferFee || 0}
                        onChange={async (e) => {
                          const val = Number(e.target.value);
                          const updated = await statesService.updateState(state.id, { playerToCompanyTransferFee: val });
                          setState(updated);
                        }}
                     />
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('nationalBank.ipoFee', { currency: treasuryAccount.currencyCode })}</label>
                     <input
                        type="number"
                        className="economy-input"
                        value={state.ipoFee || 0}
                        onChange={async (e) => {
                          const val = Number(e.target.value);
                          const updated = await statesService.updateState(state.id, { ipoFee: val });
                          setState(updated);
                        }}
                     />
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('nationalBank.tradingFee')}</label>
                     <input
                        type="number"
                        className="economy-input"
                        value={state.exchangeTradingFee || 0}
                        onChange={async (e) => {
                          const val = Number(e.target.value);
                          const updated = await statesService.updateState(state.id, { exchangeTradingFee: val });
                          setState(updated);
                        }}
                     />
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                    <div className="stat-label" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{t('nationalBank.treasuryBalance')}</div>
                    <div className="stat-value" style={{ color: 'var(--text-headings)', fontSize: '24px', fontWeight: 'bold' }}>
                      {treasuryAccount.balance.toLocaleString()} {treasuryAccount.currencyCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ipoRequests.length > 0 && (
            <div className="ipo-requests-section" style={{ marginTop: '32px' }}>
              <h3 className="economy-section-title">{t('nationalBank.ipoRequestsTitle', { count: ipoRequests.length })}</h3>
              <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ipoRequests.map((req) => (
                  <div key={req.id} className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-headings)' }}>{req.companyName}</h4>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {t('nationalBank.ipoRequestInfo', { shares: req.totalShares, price: req.initialPrice.toFixed(2), fee: req.feeAmount.toFixed(2) })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="economy-btn economy-btn--primary" onClick={() => handleApproveIpo(req.id)}>{t('nationalBank.approveBtn')}</button>
                      <button className="economy-btn economy-btn--secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleRejectIpo(req.id)}>{t('nationalBank.rejectBtn')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default NationalBankPage;
