import {  } from 'axios';
import React, { useState } from 'react';
import { economyService } from '../services/economy.service';
import { IState } from '../../states';

interface IpoModalProps {
  companyId: string;
  statesList: IState[];
  onClose: () => void;
  onSuccess: () => void;
}

export const IpoModal: React.FC<IpoModalProps> = ({
  companyId,
  statesList,
  onClose,
  onSuccess,
}) => {
  const [totalShares, setTotalShares] = useState('1000');
  const [initialPrice, setInitialPrice] = useState('10.0');
  const [ipoExchangeStateId, setIpoExchangeStateId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIpoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipoExchangeStateId) {
      alert('Выберите биржу (государство) для листинга!');
      return;
    }
    try {
      setLoading(true);
      await economyService.conductIPO(companyId, {
        totalShares: parseInt(totalShares, 10),
        initialPrice: parseFloat(initialPrice),
        exchangeStateId: ipoExchangeStateId,
      });
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Ошибка вывода на биржу (IPO)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">Заявка на первичное публичное размещение (IPO)</h3>
        <form onSubmit={handleIpoSubmit} className="modal-form">
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
            После подачи заявки, казначей выбранного государства должен будет её одобрить.
            Пошлина будет списана с коммерческого счета фирмы только в момент одобрения.
          </p>
          <label>
            <span>Общее число выпускаемых акций</span>
            <input
              type="number"
              step="100"
              required
              value={totalShares}
              onChange={(e) => setTotalShares(e.target.value)}
              style={{ fontFamily: 'monospace' }}
              disabled={loading}
            />
          </label>

          <label>
            <span>Стартовая цена одной акции (в нац. валюте)</span>
            <input
              type="number"
              step="0.1"
              required
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              style={{ fontFamily: 'monospace' }}
              disabled={loading}
            />
          </label>

          <label>
            <span>Государство (Биржа)</span>
            <select
              value={ipoExchangeStateId}
              onChange={(e) => setIpoExchangeStateId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Выберите биржу --</option>
              {statesList.map((st) => (
                <option key={st.id} value={st.id}>
                  Биржа государства {st.name} (Пошлина: {st.ipoFee || 0})
                </option>
              ))}
            </select>
          </label>

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
              {loading ? 'Обработка...' : 'Подать заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
