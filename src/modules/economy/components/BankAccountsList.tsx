import React, { useState } from 'react';
import { IAccount, ICard, ITransfer, ICurrency } from '../types/economy.types';
import { AccountCard } from './AccountCard';
import { TransactionReceiptModal } from './transaction-receipt-modal/transaction-receipt.modal';

interface BankAccountsListProps {
  accounts: IAccount[];
  cards: ICard[];
  transfers: ITransfer[];
  currencies: ICurrency[];
  onIssueCard: (accountId: string) => void;
  onTransferClick: (fromNum: string) => void;
  onOpenCreateAccount: () => void;
}

export const BankAccountsList: React.FC<BankAccountsListProps> = ({
  accounts,
  cards,
  transfers,
  currencies,
  onIssueCard,
  onTransferClick,
  onOpenCreateAccount,
}) => {
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<ITransfer | null>(null);

  const filteredTransfers = selectedAccountFilter === 'ALL' 
    ? transfers 
    : transfers.filter(t => t.fromAccountNumber === selectedAccountFilter || t.toAccountNumber === selectedAccountFilter);

  return (
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
              onClick={() => onTransferClick('')}
              className="economy-btn economy-btn--primary"
            >
              Новый перевод
            </button>
            <button
              onClick={onOpenCreateAccount}
              className="economy-btn economy-btn--secondary"
            >
              + Открыть счет
            </button>
          </div>
        </div>
        
        {accounts.length === 0 ? (
          <div className="economy-empty">
            У вас пока нет открытых счетов. Нажмите «+ Открыть счет» для начала.
          </div>
        ) : (
          <div className="economy-grid">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                cards={cards.filter((c) => c.accountId === account.id)}
                onIssueCard={onIssueCard}
                onTransferClick={onTransferClick}
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
        
        {filteredTransfers.length === 0 ? (
          <div className="economy-empty">
            История транзакций пуста
          </div>
        ) : (
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
        )}
      </div>
      
      {selectedTransaction && (
        <TransactionReceiptModal
          transaction={selectedTransaction}
          currencies={currencies}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
};
