import React, { useEffect, useState } from 'react';
import { ICompanyOrder } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import { PropagateLoader } from 'react-spinners';
import './DisputedOrdersTab.scss';

export const DisputedOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<ICompanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [arbitrationComment, setArbitrationComment] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await economyService.getDisputedOrders();
      setOrders(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки жалоб');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArbitrate = async (orderId: string, decision: 'REFUND' | 'REJECT') => {
    const comment = arbitrationComment[orderId] || '';
    if (!comment.trim()) {
      alert('Пожалуйста, оставьте комментарий с обоснованием решения.');
      return;
    }

    try {
      await economyService.arbitrateOrder(orderId, { decision, comment });
      alert('Вердикт успешно вынесен');
      setArbitrationComment(prev => ({ ...prev, [orderId]: '' }));
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при вынесении вердикта');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <PropagateLoader color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message" style={{ color: '#ef4444', padding: '20px' }}>{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders-message" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        <h3>Нет активных жалоб 🎉</h3>
        <p>В вашей юрисдикции в данный момент нет ни одного спорного заказа.</p>
      </div>
    );
  }

  return (
    <div className="disputed-orders-tab">
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className={`order-card ${order.isEscalatedToAdmin ? 'escalated' : ''}`}>
            <div className="order-header">
              <span className="order-id">Жалоба #{order.id.slice(0, 8)}</span>
              <span className={`status-badge status-${order.status.toLowerCase()} ${order.isEscalatedToAdmin ? 'status-escalated' : ''}`}>
                {order.isEscalatedToAdmin ? 'ESCALATED' : order.status}
              </span>
            </div>

            <div className="order-details">
              <p><strong>Компания:</strong> {order.company?.name}</p>
              <div className="detail-item">
                <span className="label">Клиент:</span>
                <span className="value">
                  {order.clientUsername}
                  {order.payerType === 'company' && ' (Счет компании)'}
                  {order.payerType === 'state' && ' (Государственная казна)'}
                </span>
              </div>
              <p><strong>Услуга:</strong> {order.service?.name}</p>
              <p><strong>Сумма спора:</strong> {order.totalPrice} монет</p>

              {order.clientComment && (
                <div className="client-comment">
                  <strong>Комментарий при заказе:</strong>
                  <p>{order.clientComment}</p>
                </div>
              )}
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="status-history">
                <details open>
                  <summary>История и суть жалобы</summary>
                  <ul>
                    {order.statusHistory.map((h: any) => (
                      <li key={h.id}>
                        <span className="date">{new Date(h.createdAt).toLocaleString()}</span>
                        <span className="user">{h.changedByUsername}</span>
                        <span className="status">{h.status}</span>
                        {h.comment && <span className="comment" style={{ whiteSpace: 'pre-wrap' }}>{h.comment}</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}

            <div className="arbitration-section">
              <h4>Вынести вердикт</h4>
              <textarea
                placeholder="Обоснование решения (сохраняет переносы строк)..."
                value={arbitrationComment[order.id] || ''}
                onChange={(e) => setArbitrationComment(prev => ({ ...prev, [order.id]: e.target.value }))}
                rows={4}
              />
              <div className="actions-row">
                <Button callback={() => handleArbitrate(order.id, 'REFUND')} style={{ backgroundColor: '#ef4444', color: 'white' }}>Возврат средств</Button>
                <Button callback={() => handleArbitrate(order.id, 'REJECT')} secondary={true}>Отклонить жалобу</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
