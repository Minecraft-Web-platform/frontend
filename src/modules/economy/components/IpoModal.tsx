import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('economy');
  const [totalShares, setTotalShares] = useState('1000');
  const [initialPrice, setInitialPrice] = useState('10.0');
  const [ipoExchangeStateId, setIpoExchangeStateId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIpoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipoExchangeStateId) {
      alert(t('exchangeModals.ipo.selectExchangeAlert'));
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
      alert(err?.response?.data?.message || err?.message || t('exchangeModals.ipo.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">{t('exchangeModals.ipo.title')}</h3>
        <form onSubmit={handleIpoSubmit} className="modal-form">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {t('exchangeModals.ipo.hint1')}{' '}
            {t('exchangeModals.ipo.hint2')}
          </p>
          <label>
            <span>{t('exchangeModals.ipo.sharesCount')}</span>
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
            <span>{t('exchangeModals.ipo.startPrice')}</span>
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
            <span>{t('exchangeModals.ipo.exchangeState')}</span>
            <select
              value={ipoExchangeStateId}
              onChange={(e) => setIpoExchangeStateId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">{t('exchangeModals.ipo.selectExchange')}</option>
              {statesList.map((st) => (
                <option key={st.id} value={st.id}>
                  {t('exchangeModals.ipo.exchangeOption', { state: st.name, fee: st.ipoFee || 0 })}
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
              {t('exchangeModals.ipo.cancel')}
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--primary"
              disabled={loading}
            >
              {loading ? t('exchangeModals.ipo.processing') : t('exchangeModals.ipo.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
