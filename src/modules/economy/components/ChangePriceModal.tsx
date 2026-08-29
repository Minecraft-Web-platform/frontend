import {  } from 'axios';
import React, { useState } from 'react';
import { ICompany } from '../types/economy.types';
import { economyService } from '../services/economy.service';

interface ChangePriceModalProps {
  company: ICompany;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePriceModal: React.FC<ChangePriceModalProps> = ({ company, onClose, onSuccess }) => {
  const [newPrice, setNewPrice] = useState(company.sharePrice.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Введите корректную цену больше 0');
      return;
    }
    setLoading(true);
    try {
      await economyService.changeCompanySharePrice(company.id, parsedPrice);
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as Error).message || 'Ошибка при изменении цены');
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal">
      <div className="economy-modal__content">
        <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>
          Изменить цену акций: {company.name}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>Новая цена за 1 акцию:</span>
            <input
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="economy-input"
              required
            />
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="economy-btn economy-btn--secondary">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="economy-btn economy-btn--primary">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
