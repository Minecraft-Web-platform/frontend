import {  } from 'axios';
import { FC } from 'react';
import './citizenship-requests-modal.component.scss';
import { ICitizenshipRequest } from '../../types/states.types';
import { useTranslation } from 'react-i18next';

interface CitizenshipRequestsModalProps {
  requests: ICitizenshipRequest[];
  onClose: () => void;
  onReview: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
}

const CitizenshipRequestsModal: FC<CitizenshipRequestsModalProps> = ({
  requests,
  onClose,
  onReview,
}) => {
  const { t } = useTranslation('states');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await onReview(requestId, status);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(t('citizenshipRequests.errors.status'));
    }
  };

  return (
    <div className="citizenship-modal" onClick={onClose}>
      <div className="citizenship-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="citizenship-modal__header">
          <h3>{t('citizenshipRequests.title')}</h3>
          <button className="citizenship-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="citizenship-modal__empty">
            {t('citizenshipRequests.empty')}
          </div>
        ) : (
          <div className="citizenship-modal__list">
            {pendingRequests.map((req) => (
              <div key={req.id} className="citizenship-modal__item">
                <span className="citizenship-modal__user">👤 {req.username}</span>
                <div className="citizenship-modal__actions">
                  <button
                    className="citizenship-modal__btn citizenship-modal__btn--approve"
                    onClick={() => handleAction(req.id, 'approved')}
                  >
                    {t('citizenshipRequests.approveBtn')}
                  </button>
                  <button
                    className="citizenship-modal__btn citizenship-modal__btn--reject"
                    onClick={() => handleAction(req.id, 'rejected')}
                  >
                    {t('citizenshipRequests.rejectBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenshipRequestsModal;
