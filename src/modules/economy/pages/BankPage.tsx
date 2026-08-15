import React, { useState, useEffect } from 'react';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { economyService } from '../services/economy.service';
import { profileService } from '../../profile/services/profile.service';
import { useMyAccounts, useMyTransfers, useCurrencies, useStates } from '../hooks/useEconomyData';
import { BankAccountsList } from '../components/BankAccountsList';
import { TransferModal } from '../components/TransferModal';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { ICity } from '../../states';
import '../economy-shared.scss';

export const BankPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const { data: accountsData, isLoading: loadingAccounts, mutate: mutateAccounts } = useMyAccounts();
  const { data: transfers = [], isLoading: loadingTransfers, mutate: mutateTransfers } = useMyTransfers();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrencies();
  const { data: statesList = [], isLoading: loadingStates } = useStates();

  const [myStateId, setMyStateId] = useState<string | null>(null);

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');

  const loading = loadingAccounts || loadingTransfers || loadingCurrencies || loadingStates;
  
  useEffect(() => {
    // Fetch user state ID
    const fetchUserState = async () => {
      try {
        const [meRes, ctRes] = await Promise.all([
          profileService.getInfoAboutMe().catch(() => null),
          fetch('/api/states/cities').then(r => r.json()).catch(() => [] as ICity[]) // Assuming this exists or statesService.getCities()
        ]);
        let userStateId = meRes?.stateId || null;
        if (!userStateId && meRes?.cityId) {
          const cObj = ctRes.find((c: any) => c.id === meRes.cityId);
          if (cObj?.stateId) userStateId = cObj.stateId;
        }
        setMyStateId(userStateId);
      } catch (e) {
        console.error('Failed to fetch user state', e);
      }
    };
    fetchUserState();
  }, []);

  const handleCreateCard = async (accountId: string) => {
    try {
      await economyService.issueCard({ accountId });
      mutateAccounts();
    } catch (err: any) {
      alert(err?.message || 'Ошибка выпуска карты');
    }
  };

  const handleTransferClick = (fromNum: string) => {
    setTransferFrom(fromNum);
    setShowTransferModal(true);
  };

  const reloadData = () => {
    mutateAccounts();
    mutateTransfers();
  };

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {!embedded && (
        <div className="economy-hero">
          <div>
            <h1 className="hero-title">
              <span>🏦</span> Национальная Банковская Система
            </h1>
            <p className="hero-subtitle">
              Управление счетами, пластиковыми картами и международными
              переводами с учетом налоговых юрисдикций
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleTransferClick('')}
              className="economy-btn economy-btn--primary"
            >
              Новый перевод
            </button>
            <button
              onClick={() => setShowCreateAccount(true)}
              className="economy-btn economy-btn--secondary"
            >
              + Открыть счет
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="economy-empty">Загрузка банковских данных...</div>
      ) : (
        <BankAccountsList 
          accounts={accountsData?.accounts || []}
          cards={accountsData?.cards || []}
          transfers={transfers}
          currencies={currencies}
          onIssueCard={handleCreateCard}
          onTransferClick={handleTransferClick}
          onOpenCreateAccount={() => setShowCreateAccount(true)}
        />
      )}

      {showCreateAccount && (
        <CreateAccountModal
          currencies={currencies}
          statesList={statesList}
          myStateId={myStateId}
          onClose={() => setShowCreateAccount(false)}
          onSuccess={() => {
            setShowCreateAccount(false);
            reloadData();
          }}
        />
      )}

      {showTransferModal && (
        <TransferModal
          accounts={accountsData?.accounts || []}
          initialFromAccount={transferFrom}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            reloadData();
          }}
        />
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
