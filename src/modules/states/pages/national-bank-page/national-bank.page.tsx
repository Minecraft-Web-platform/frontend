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

const NationalBankPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<IState | null>(null);
  const [treasuryAccount, setTreasuryAccount] = useState<IAccount | null>(null);
  const [ipoRequests, setIpoRequests] = useState<IIpoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuthStore();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

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

      if (!isPresident && !isTreasurer) {
        alert('У вас нет доступа к управлению Национальным Банком этого государства.');
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
      } catch (err: any) {
        console.error('Failed to load IPO requests', err);
      }
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
  }, [id, currentUsername]);

  const handleApproveIpo = async (reqId: string) => {
    try {
      await economyService.reviewIpoRequest(reqId, 'approved');
      setIpoRequests((prev) => prev.filter((r) => r.id !== reqId));
      loadData(); // reload treasury balance
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRejectIpo = async (reqId: string) => {
    try {
      await economyService.reviewIpoRequest(reqId, 'rejected');
      setIpoRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="economy-header">
            <h2>Национальный Банк</h2>
          </div>
          <div className="economy-container" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Сбор финансовых данных...</p>
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
          <div className="economy-hero">
            <div>
              <h2 className="hero-title">Национальный Банк {state?.name}</h2>
              <p className="hero-subtitle">Панель управления государственными финансами</p>
            </div>
          </div>

          <div className="economy-container national-bank-container">
          <div className="bank-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button className="economy-btn economy-btn--secondary" onClick={() => navigate(`/states/${id}`)}>
              Назад к государству
            </button>
            <button className="economy-btn economy-btn--primary" onClick={() => navigate('/economy')}>
              Перейти в раздел переводов
            </button>
          </div>

          {!state?.treasuryAccountNumber ? (
            <div className="empty-state">
              <div className="empty-state__icon">🏛️</div>
              <h3>Банк не учрежден</h3>
              <p>Президент должен учредить Национальный банк на странице государства.</p>
            </div>
          ) : !treasuryAccount ? (
            <div className="empty-state">
              <div className="empty-state__icon">💳</div>
              <h3>Счет не найден</h3>
              <p>Казначейский счет не найден. Возможно, валюта государства еще не выпущена.</p>
            </div>
          ) : (
            <div className="treasury-dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="treasury-card-section">
                <h3 className="economy-section-title" style={{ marginTop: 0 }}>Казначейский счет</h3>
                <AccountCard account={treasuryAccount} cards={[]} onTransferClick={() => navigate('/economy')} onIssueCard={() => navigate('/economy/cards')} />
              </div>

              <div className="treasury-stats-section">
                <h3 className="economy-section-title" style={{ marginTop: 0 }}>Настройки экономики и налогов</h3>
                <div className="stats-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Налог на переводы Игрок-Игрок (%)</label>
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
                  <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Налог на коммерческие переводы (%)</label>
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
                  <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Пошлина за IPO ({treasuryAccount.currencyCode})</label>
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
                  <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                     <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Комиссия с торгов (%)</label>
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
                  <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                    <div className="stat-label" style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Баланс казны</div>
                    <div className="stat-value" style={{ color: '#0f172a', fontSize: '24px', fontWeight: 'bold' }}>
                      {treasuryAccount.balance.toLocaleString()} {treasuryAccount.currencyCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ipoRequests.length > 0 && (
            <div className="ipo-requests-section" style={{ marginTop: '32px' }}>
              <h3 className="economy-section-title">Заявки на IPO ({ipoRequests.length})</h3>
              <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ipoRequests.map((req) => (
                  <div key={req.id} className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>{req.companyName}</h4>
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        Акции: {req.totalShares} шт. | Стартовая цена: {req.initialPrice.toFixed(2)} | Пошлина: {req.feeAmount.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="economy-btn economy-btn--primary" onClick={() => handleApproveIpo(req.id)}>Одобрить</button>
                      <button className="economy-btn economy-btn--secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleRejectIpo(req.id)}>Отклонить</button>
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
