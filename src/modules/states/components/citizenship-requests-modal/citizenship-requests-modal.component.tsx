import { FC } from 'react';
import './citizenship-requests-modal.component.scss';
import { ICitizenshipRequest } from '../../types/states.types';

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
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await onReview(requestId, status);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при изменении статуса заявки');
    }
  };

  return (
    <div className="citizenship-modal" onClick={onClose}>
      <div className="citizenship-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="citizenship-modal__header">
          <h3>📬 Заявки на заселение в город</h3>
          <button className="citizenship-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="citizenship-modal__empty">
            Нет активных входящих заявок на рассмотрении.
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
                    ✔ Одобрить
                  </button>
                  <button
                    className="citizenship-modal__btn citizenship-modal__btn--reject"
                    onClick={() => handleAction(req.id, 'rejected')}
                  >
                    ✖ Отклонить
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
