import {  } from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountType, ICurrency } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { IState } from '../../states';

interface CreateAccountModalProps {
  currencies: ICurrency[];
  statesList: IState[];
  myStateId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  currencies,
  statesList,
  myStateId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('economy');
  const [newAccType] = useState<AccountType>('personal');
  const [newAccCurrency, setNewAccCurrency] = useState(currencies.length > 0 ? currencies[0].code : '');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCurrency) {
      alert(t('createAccountModal.selectCurrencyAlert'));
      return;
    }
    try {
      setLoading(true);
      await economyService.createAccount({
        type: newAccType,
        currencyCode: newAccCurrency,
      });
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('createAccountModal.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">{t('createAccountModal.title')}</h3>
        <form onSubmit={handleCreateAccount} className="modal-form">
          <label>
            <span>{t('createAccountModal.accountType')}</span>
            <input
              type="text"
              value={t('createAccountModal.personalAccount')}
              disabled
              style={{ opacity: 0.8, cursor: 'not-allowed', backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>
              {t('createAccountModal.commercialHint')}
            </p>
          </label>

          <label>
            <span>{t('createAccountModal.currency')}</span>
            <select
              value={newAccCurrency}
              onChange={(e) => setNewAccCurrency(e.target.value)}
              disabled={currencies.length === 0 || loading}
            >
              {currencies.length === 0 && (
                <option value="">{t('createAccountModal.noCurrencies')}</option>
              )}
              {currencies.map((curr) => {
                const st = statesList.find((s) => s.id === curr.stateId);
                const stateName = st ? st.name : t('createAccountModal.serverWide');
                const isForeign = Boolean(curr.stateId && curr.stateId !== myStateId);
                return (
                  <option key={curr.id} value={curr.code}>
                    {curr.code} ({curr.name}) — {stateName} {isForeign ? t('createAccountModal.foreignState') : ''}
                  </option>
                );
              })}
            </select>
          </label>

          {(() => {
            const selectedCurrObj = currencies.find((c) => c.code === newAccCurrency);
            if (!selectedCurrObj) return null;
            const selectedCurrState = statesList.find((s) => s.id === selectedCurrObj.stateId);
            const isForeignCurrency = Boolean(selectedCurrObj.stateId && selectedCurrObj.stateId !== myStateId);
            
            return (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: isForeignCurrency ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-surface)',
                  border: isForeignCurrency ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '26px' }}>{isForeignCurrency ? '🌐' : '🏛️'}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isForeignCurrency ? '#60a5fa' : 'var(--text-headings)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      {t('createAccountModal.jurisdiction', { name: selectedCurrState ? selectedCurrState.name : t('createAccountModal.serverWideCurrency') })}
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
                        {t('createAccountModal.foreignBadge')}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: isForeignCurrency ? '#93c5fd' : 'var(--text-secondary)',
                      marginTop: '4px',
                      lineHeight: '1.4',
                    }}
                  >
                    {isForeignCurrency
                      ? t('createAccountModal.foreignNotice')
                      : t('createAccountModal.domesticNotice')}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="economy-btn economy-btn--secondary"
              disabled={loading}
            >
              {t('createAccountModal.cancel')}
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--primary"
              disabled={loading}
            >
              {loading ? t('createAccountModal.opening') : t('createAccountModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
