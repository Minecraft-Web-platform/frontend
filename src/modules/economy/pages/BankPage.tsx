import React, { useEffect, useState } from 'react';
import {
  AccountType,
  IAccount,
  ICard,
  ICurrency,
  ITransfer,
} from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { AccountCard } from '../components/AccountCard';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { profileService } from '../../profile/services/profile.service';
import { statesService, IState, ICity } from '../../states';
import { TransactionReceiptModal } from '../components/transaction-receipt-modal/transaction-receipt.modal';
import '../economy-shared.scss';

export const BankPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [cards, setCards] = useState<ICard[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [statesList, setStatesList] = useState<IState[]>([]);
  const [myStateId, setMyStateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальные окна
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccType] = useState<AccountType>('personal');
  const [newAccCurrency, setNewAccCurrency] = useState('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferComment, setTransferComment] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<ITransfer | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [accRes, transRes, currRes, meRes, stRes, ctRes] =
        await Promise.all([
          economyService.getMyAccounts(),
          economyService.getMyTransfers(),
          economyService.getAllCurrencies(),
          profileService.getInfoAboutMe().catch(() => null),
          statesService.getStates().catch(() => [] as IState[]),
          statesService.getCities().catch(() => [] as ICity[]),
          economyService.getAllCompanies().catch(() => []),
        ]);
      setAccounts(accRes.accounts);
      setCards(accRes.cards);
      setTransfers(transRes);
      setCurrencies(currRes);
      setStatesList(stRes);
      // We don't use companies or myInfo anymore so we don't set them

      let userStateId = meRes?.stateId || null;
      if (!userStateId && meRes?.cityId) {
        const cObj = ctRes.find((c) => c.id === meRes.cityId);
        if (cObj?.stateId) userStateId = cObj.stateId;
      }
      setMyStateId(userStateId);

      if (accRes.accounts.length > 0 && !transferFrom) {
        setTransferFrom(accRes.accounts[0].accountNumber);
      }
      if (currRes.length > 0 && !newAccCurrency) {
        setNewAccCurrency(currRes[0].code);
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки банковских данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCurrency) {
      alert('Выберите валюту счета (на сервере должна быть хотя бы одна выпущенная валюта)');
      return;
    }
    try {
      await economyService.createAccount({
        type: newAccType,
        currencyCode: newAccCurrency,
      });
      setShowCreateAccount(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка создания счета');
    }
  };

  const handleCreateCard = async (accountId: string) => {
    try {
      await economyService.issueCard({ accountId });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка выпуска карты');
    }
  };

  const handleTransferClick = (fromNum: string) => {
    setTransferFrom(fromNum);
    setShowTransferModal(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!transferTo || !amountNum || amountNum <= 0) {
      alert('Пожалуйста, введите корректные данные для перевода');
      return;
    }
    try {
      await economyService.transferMoney({
        fromNumber: transferFrom,
        toNumber: transferTo,
        amount: amountNum,
        description: transferComment || undefined,
      });
      setShowTransferModal(false);
      setTransferTo('');
      setTransferAmount('');
      setTransferComment('');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка перевода средств');
    }
  };

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {/* Заголовок страницы или панель действий */}
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
              onClick={() => setShowTransferModal(true)}
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

      {error && (
        <div
          style={{
            marginBottom: '24px',
            padding: '14px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="economy-empty">
          Загрузка банковских данных...
        </div>
      ) : (
        <>
          {/* Список счетов */}
          <div className="economy-section">
            <div
              className="section-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Мои счета
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowTransferModal(true)}
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
            {accounts.length === 0 ? (
              <div className="economy-empty">
                У вас пока нет открытых счетов. Нажмите «+ Открыть счет» для
                начала.
              </div>
            ) : (
              <div className="economy-grid">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    cards={cards.filter((c) => c.accountId === account.id)}
                    onIssueCard={handleCreateCard}
                    onTransferClick={handleTransferClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* История переводов */}
          <div className="economy-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                История переводов и налогов
              </h2>
              {accounts.length > 0 && (
                <select 
                  className="economy-input" 
                  style={{ width: 'auto', padding: '8px 12px' }}
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                >
                  <option value="ALL">Все счета</option>
                  {accounts.map(a => (
                     <option key={a.id} value={a.accountNumber}>{a.title} ({a.accountNumber})</option>
                  ))}
                </select>
              )}
            </div>
            {(() => {
              const filteredTransfers = selectedAccountFilter === 'ALL' 
                ? transfers 
                : transfers.filter(t => t.fromAccountNumber === selectedAccountFilter || t.toAccountNumber === selectedAccountFilter);
              
              if (filteredTransfers.length === 0) {
                return (
                  <div className="economy-empty">
                    История транзакций пуста
                  </div>
                );
              }
              return (
              <div className="economy-table-container">
                <table className="economy-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Отправитель</th>
                      <th>Получатель</th>
                      <th>Описание</th>
                      <th style={{ textAlign: 'right' }}>Налог в казну</th>
                      <th style={{ textAlign: 'right' }}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((t) => (
                      <tr 
                        key={t.id} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedTransaction(t)}
                        title="Нажмите для просмотра чека"
                      >
                        <td style={{ color: '#9ca3af', fontSize: '13px' }}>
                          {new Date(t.createdAt).toLocaleString('ru-RU')}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {t.fromAccountNumber}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {t.toAccountNumber}
                        </td>
                        <td>{t.description || '—'}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#fbbf24',
                            fontFamily: 'monospace',
                          }}
                        >
                          {t.taxAmount > 0
                            ? `${t.taxAmount.toFixed(2)} ${t.currencyCode}`
                            : '0.00'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          }}
                        >
                          {t.amount.toLocaleString('ru-RU')}{' '}
                          <span style={{ color: '#fbbf24' }}>
                            {t.currencyCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              );
            })()}
          </div>
        </>
      )}

      {/* Модальное окно открытия счета */}
      {showCreateAccount && (
        <div className="economy-modal-overlay">
          <div className="economy-modal">
            <h3 className="modal-title">Открытие банковского счета</h3>
            <form onSubmit={handleCreateAccount} className="modal-form">
              <label>
                <span>Тип счета</span>
                <input
                  type="text"
                  value="Личный счет"
                  disabled
                  style={{ opacity: 0.8, cursor: 'not-allowed', backgroundColor: '#f1f5f9', color: '#475569' }}
                />
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>
                  ℹ️ Коммерческий счет создается автоматически при регистрации компании, а казначейский — при учреждении Нацбанка.
                </p>
              </label>

              <label>
                <span>Валюта счета</span>
                <select
                  value={newAccCurrency}
                  onChange={(e) => setNewAccCurrency(e.target.value)}
                  disabled={currencies.length === 0}
                >
                  {currencies.length === 0 && (
                    <option value="">-- Нет доступных валют --</option>
                  )}
                  {currencies.map((curr) => {
                    const st = statesList.find((s) => s.id === curr.stateId);
                    const stateName = st ? st.name : 'Общесерверная';
                    const isForeign = Boolean(
                      curr.stateId && curr.stateId !== myStateId,
                    );
                    return (
                      <option key={curr.id} value={curr.code}>
                        {curr.code} ({curr.name}) — {stateName}{' '}
                        {isForeign ? '[Другое гос-во]' : ''}
                      </option>
                    );
                  })}
                </select>
              </label>

              {(() => {
                const selectedCurrObj = currencies.find(
                  (c) => c.code === newAccCurrency,
                );
                if (!selectedCurrObj) return null;
                const selectedCurrState = statesList.find(
                  (s) => s.id === selectedCurrObj.stateId,
                );
                const isForeignCurrency = Boolean(
                  selectedCurrObj.stateId &&
                    selectedCurrObj.stateId !== myStateId,
                );
                return (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: isForeignCurrency ? '#eff6ff' : '#f8fafc',
                      border: isForeignCurrency
                        ? '1px solid #bfdbfe'
                        : '1px solid #e2e8f0',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '26px' }}>
                      {isForeignCurrency ? '🌐' : '🏛️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isForeignCurrency ? '#1e40af' : '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>
                          Юрисдикция:{' '}
                          {selectedCurrState
                            ? selectedCurrState.name
                            : 'Общесерверная валюта'}
                        </span>
                        {isForeignCurrency && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#3b82f6',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontWeight: 700,
                            }}
                          >
                            ДРУГОЕ ГОСУДАРСТВО
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: isForeignCurrency ? '#3b82f6' : '#64748b',
                          marginTop: '4px',
                          lineHeight: '1.4',
                        }}
                      >
                        {isForeignCurrency
                          ? 'Вы открываете счёт в иностранном государстве. Операции счёта и карты будут производиться в национальной валюте этой юрисдикции.'
                          : 'Вы открываете счёт в домашней юрисдикции.'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateAccount(false)}
                  className="economy-btn economy-btn--secondary"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="economy-btn economy-btn--primary"
                >
                  Открыть счет
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно перевода */}
      {showTransferModal && (
        <div className="economy-modal-overlay">
          <div className="economy-modal">
            <h3 className="modal-title">Новый перевод</h3>
            <form onSubmit={handleTransfer} className="modal-form">
              <label>
                <span>Счет отправителя</span>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.balance} {acc.currencyCode})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Номер получателя</span>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Сумма</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>

              <label>
                <span>Назначение платежа</span>
                <input
                  type="text"
                  value={transferComment}
                  onChange={(e) => setTransferComment(e.target.value)}
                  placeholder="Оплата товаров / Подарок..."
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="economy-btn economy-btn--secondary"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="economy-btn economy-btn--primary"
                >
                  Перевести
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <TransactionReceiptModal
          transaction={selectedTransaction}
          currencies={currencies}
          onClose={() => setSelectedTransaction(null)}
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
