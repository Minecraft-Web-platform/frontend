import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('economy');

  const filteredTransfers = selectedAccountFilter === 'ALL' 
    ? transfers 
    : transfers.filter(tr => tr.fromAccountNumber === selectedAccountFilter || tr.toAccountNumber === selectedAccountFilter);

  return (
    <>
      {/* Accounts list */}
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
            {t('bankAccounts.myAccounts')}
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onTransferClick('')}
              className="economy-btn economy-btn--primary"
            >
              {t('bankAccounts.newTransfer')}
            </button>
            <button
              onClick={onOpenCreateAccount}
              className="economy-btn economy-btn--secondary"
            >
              {t('bankAccounts.openAccount')}
            </button>
          </div>
        </div>
        
        {accounts.length === 0 ? (
          <div className="economy-empty">
            {t('bankAccounts.noAccounts')}
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

      {/* Transfers history */}
      <div className="economy-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            {t('bankAccounts.history')}
          </h2>
          {accounts.length > 0 && (
            <select 
              className="economy-input" 
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
            >
              <option value="ALL">{t('bankAccounts.allAccounts')}</option>
              {accounts.map(a => (
                 <option key={a.id} value={a.accountNumber}>{a.title} ({a.accountNumber})</option>
              ))}
            </select>
          )}
        </div>
        
        {filteredTransfers.length === 0 ? (
          <div className="economy-empty">
            {t('bankAccounts.noHistory')}
          </div>
        ) : (
          <div className="economy-table-container">
            <table className="economy-table">
              <thead>
                <tr>
                  <th>{t('bankAccounts.date')}</th>
                  <th>{t('bankAccounts.sender')}</th>
                  <th>{t('bankAccounts.receiver')}</th>
                  <th>{t('bankAccounts.description')}</th>
                  <th style={{ textAlign: 'right' }}>{t('bankAccounts.taxToTreasury')}</th>
                  <th style={{ textAlign: 'right' }}>{t('bankAccounts.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((tr) => (
                  <tr 
                    key={tr.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedTransaction(tr)}
                    title={t('bankAccounts.clickToViewReceipt')}
                  >
                    <td style={{ color: '#9ca3af', fontSize: '13px' }}>
                      {new Date(tr.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {tr.fromAccountNumber}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {tr.toAccountNumber}
                    </td>
                    <td>{tr.description || '—'}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        color: '#fbbf24',
                        fontFamily: 'monospace',
                      }}
                    >
                      {tr.taxAmount > 0
                        ? `${tr.taxAmount.toFixed(2)} ${tr.currencyCode}`
                        : '0.00'}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {tr.amount.toLocaleString('ru-RU')}{' '}
                      <span style={{ color: '#fbbf24' }}>
                        {tr.currencyCode}
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
