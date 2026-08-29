import {  } from 'axios';
import React, { useState } from 'react';
import { economyService } from '../services/economy.service';

interface DividendModalProps {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DividendModal: React.FC<DividendModalProps> = ({
  companyId,
  onClose,
  onSuccess,
}) => {
  const [divAmount, setDivAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDividendsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divAmount || parseFloat(divAmount) <= 0) return;
    try {
      setLoading(true);
      const res = await economyService.payDividends(companyId, {
        totalAmount: parseFloat(divAmount),
      });
      alert(`Дивиденды в размере ${res.distributed} ед. успешно распределены между ${res.shareholdersCount} акционерами!`);
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || 'Ошибка выплаты дивидендов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">Выплата дивидендов акционерам</h3>
        <form onSubmit={handleDividendsSubmit} className="modal-form">
          <label>
            <span>Общая сумма для распределения (в нац. валюте)</span>
            <input
              type="number"
              step="1"
              required
              value={divAmount}
              onChange={(e) => setDivAmount(e.target.value)}
              placeholder="500"
              style={{ fontFamily: 'monospace' }}
              disabled={loading}
            />
          </label>
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '4px 0 0',
            }}
          >
            Сумма будет списана со счета компании и разделена между всеми инвесторами пропорционально их доле акций.
          </p>

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
              className="economy-btn economy-btn--success"
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Выплатить дивиденды'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
