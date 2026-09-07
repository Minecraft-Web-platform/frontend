import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICompanyOrder } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import { PropagateLoader } from 'react-spinners';
import './DisputedOrdersTab.scss';

export const DisputedOrdersTab: React.FC = () => {
  const { t } = useTranslation('economy');
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError((err as AxiosError<{message?: string}>).response?.data?.message || t('companies.disputes.errorLoading'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArbitrate = async (orderId: string, decision: 'REFUND' | 'REJECT') => {
    const comment = arbitrationComment[orderId] || '';
    if (!comment.trim()) {
      alert(t('companies.disputes.verdictCommentPrompt'));
      return;
    }

    try {
      await economyService.arbitrateOrder(orderId, { decision, comment });
      alert(t('companies.disputes.verdictSuccess'));
      setArbitrationComment(prev => ({ ...prev, [orderId]: '' }));
      fetchOrders();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('companies.disputes.errorVerdict'));
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
        <h3>{t('companies.disputes.emptyTitle')}</h3>
        <p>{t('companies.disputes.emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="disputed-orders-tab">
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className={`order-card ${order.isEscalatedToAdmin ? 'escalated' : ''}`}>
            <div className="order-header">
              <span className="order-id">{t('companies.disputes.complaintNumber', { id: order.id.slice(0, 8) })}</span>
              <span className={`status-badge status-${order.status.toLowerCase()} ${order.isEscalatedToAdmin ? 'status-escalated' : ''}`}>
                {order.isEscalatedToAdmin ? 'ESCALATED' : order.status}
              </span>
            </div>

            <div className="order-details">
              <p><strong>{t('companies.disputes.company')}</strong> {order.company?.name}</p>
              <div className="detail-item">
                <span className="label">{t('companies.disputes.client')}</span>
                <span className="value">
                  {order.clientUsername}
                  {order.payerType === 'company' && ` ${t('companies.disputes.companyAccount')}`}
                  {order.payerType === 'state' && ` ${t('companies.disputes.stateTreasury')}`}
                </span>
              </div>
              <p><strong>{t('companies.disputes.service')}</strong> {order.service?.name}</p>
              <p>{t('companies.disputes.disputeAmount', { price: order.totalPrice })}</p>

              {order.clientComment && (
                <div className="client-comment">
                  <strong>{t('companies.disputes.clientComment')}</strong>
                  <p>{order.clientComment}</p>
                </div>
              )}
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="status-history">
                <details open>
                  <summary>{t('companies.disputes.historyTitle')}</summary>
                  <ul>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
              <h4>{t('companies.disputes.issueVerdict')}</h4>
              <textarea
                placeholder={t('companies.disputes.verdictPlaceholder')}
                value={arbitrationComment[order.id] || ''}
                onChange={(e) => setArbitrationComment(prev => ({ ...prev, [order.id]: e.target.value }))}
                rows={4}
              />
              <div className="actions-row">
                <Button callback={() => handleArbitrate(order.id, 'REFUND')} style={{ backgroundColor: '#ef4444', color: 'white' }}>{t('companies.disputes.refund')}</Button>
                <Button callback={() => handleArbitrate(order.id, 'REJECT')} secondary={true}>{t('companies.disputes.rejectComplaint')}</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
