import React, { useState } from 'react';
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
  const [newAccType] = useState<AccountType>('personal');
  const [newAccCurrency, setNewAccCurrency] = useState(currencies.length > 0 ? currencies[0].code : '');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCurrency) {
      alert('Выберите валюту счета (на сервере должна быть хотя бы одна выпущенная валюта)');
      return;
    }
    try {
      setLoading(true);
      await economyService.createAccount({
        type: newAccType,
        currencyCode: newAccCurrency,
      });
      onSuccess();
    } catch (err: any) {
      alert(err?.message || 'Ошибка создания счета');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              disabled={currencies.length === 0 || loading}
            >
              {currencies.length === 0 && (
                <option value="">-- Нет доступных валют --</option>
              )}
              {currencies.map((curr) => {
                const st = statesList.find((s) => s.id === curr.stateId);
                const stateName = st ? st.name : 'Общесерверная';
                const isForeign = Boolean(curr.stateId && curr.stateId !== myStateId);
                return (
                  <option key={curr.id} value={curr.code}>
                    {curr.code} ({curr.name}) — {stateName} {isForeign ? '[Другое гос-во]' : ''}
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
                  backgroundColor: isForeignCurrency ? '#eff6ff' : '#f8fafc',
                  border: isForeignCurrency ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
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
                      color: isForeignCurrency ? '#1e40af' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      Юрисдикция: {selectedCurrState ? selectedCurrState.name : 'Общесерверная валюта'}
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
              onClick={onClose}
              className="economy-btn economy-btn--secondary"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--primary"
              disabled={loading}
            >
              {loading ? 'Открытие...' : 'Открыть счет'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
