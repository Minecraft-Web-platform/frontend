import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICompany } from '../types/economy.types';
import { economyService } from '../services/economy.service';

interface ChangePriceModalProps {
  company: ICompany;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePriceModal: React.FC<ChangePriceModalProps> = ({ company, onClose, onSuccess }) => {
  const { t } = useTranslation('economy');
  const [newPrice, setNewPrice] = useState(company.sharePrice.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert(t('exchangeModals.changePrice.invalidPrice'));
      return;
    }
    setLoading(true);
    try {
      await economyService.changeCompanySharePrice(company.id, parsedPrice);
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as Error).message || t('exchangeModals.changePrice.error'));
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">
          {t('exchangeModals.changePrice.title', { company: company.name })}
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            <span>{t('exchangeModals.changePrice.newPrice')}</span>
            <input
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="economy-btn economy-btn--secondary">
              {t('exchangeModals.changePrice.cancel')}
            </button>
            <button type="submit" disabled={loading} className="economy-btn economy-btn--primary">
              {loading ? t('exchangeModals.changePrice.saving') : t('exchangeModals.changePrice.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
