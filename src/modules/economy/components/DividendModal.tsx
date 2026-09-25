import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('economy');
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
      alert(t('exchangeModals.dividends.success', {
        amount: res.distributed,
        count: res.shareholdersCount,
      }));
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('exchangeModals.dividends.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">{t('exchangeModals.dividends.title')}</h3>
        <form onSubmit={handleDividendsSubmit} className="modal-form">
          <label>
            <span>{t('exchangeModals.dividends.amount')}</span>
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
            {t('exchangeModals.dividends.hint')}
          </p>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="economy-btn economy-btn--secondary"
              disabled={loading}
            >
              {t('exchangeModals.dividends.cancel')}
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--success"
              disabled={loading}
            >
              {loading ? t('exchangeModals.dividends.processing') : t('exchangeModals.dividends.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
