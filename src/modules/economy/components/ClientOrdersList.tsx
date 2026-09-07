import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICompanyOrder, CompanyOrderStatus } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import './ClientOrdersList.scss';

export const ClientOrdersList: React.FC = () => {
  const { t } = useTranslation('economy');
  const [orders, setOrders] = useState<ICompanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    economyService.getClientOrders()
      .then(res => setOrders(res))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_err => setError(t('companies.clientOrders.errorLoading')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDispute = async (orderId: string) => {
    const comment = prompt(t('companies.clientOrders.disputePrompt'));
    if (comment === null) return;
    
    try {
      await economyService.updateOrderStatus(orderId, CompanyOrderStatus.DISPUTED, comment);
      fetchOrders();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('companies.clientOrders.errorDisputing'));
    }
  };

  const handleEscalate = async (orderId: string) => {
    const reason = prompt(t('companies.clientOrders.escalatePrompt'));
    if (reason) {
      try {
        await economyService.escalateOrder(orderId, reason);
        fetchOrders();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        alert((err as AxiosError<{message?: string}>).response?.data?.message || t('companies.clientOrders.errorEscalating'));
      }
    }
  };

  if (loading) return <div className="loading">{t('companies.clientOrders.loading')}</div>;
  if (error) return <div className="error">{error}</div>;
  if (orders.length === 0) return <div className="empty-state">{t('companies.clientOrders.empty')}</div>;

  return (
    <div className="client-orders-list">
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="company-info">
                {order.company?.logoUrl && <img src={order.company.logoUrl} alt="logo" />}
                <span className="company-name">{order.company?.name || t('companies.clientOrders.companyFallback')}</span>
              </div>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-details">
              <p><strong>{t('companies.clientOrders.service')}</strong> {order.service?.name || t('companies.clientOrders.unknownService')}</p>
              <p>{t('companies.clientOrders.paid', { price: order.totalPrice })}</p>
              
              {order.items && order.items.length > 0 && (
                <div className="order-items">
                  <strong>{t('companies.clientOrders.selectedSubItems')}</strong>
                  <ul>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.items.map((item: any) => (
                      <li key={item.id}>{item.name} (+{item.price})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {order.status === CompanyOrderStatus.COMPLETED && (
              <div className="order-actions">
                <Button secondary={true} callback={() => handleDispute(order.id)}>{t('companies.clientOrders.disputeToPresident')}</Button>
              </div>
            )}

            {(order.status === CompanyOrderStatus.REFUNDED || order.status === CompanyOrderStatus.COMPLETED) && 
             order.statusHistory?.some(h => h.comment && h.comment.includes('[President Decision]')) && 
             !order.isEscalatedToAdmin && (
              <div className="order-actions" style={{ marginTop: '10px' }}>
                <Button style={{ backgroundColor: '#ef4444', color: 'white' }} callback={() => handleEscalate(order.id)}>{t('companies.clientOrders.disputeToAdmin')}</Button>
              </div>
            )}
            
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="status-history">
                <details>
                  <summary>{t('companies.ordersTab.statusHistory')}</summary>
                  <ul>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.statusHistory.map((h: any) => (
                      <li key={h.id}>
                        <span className="date">{new Date(h.createdAt).toLocaleString()}</span>
                        <span className="status">{h.status}</span>
                        {h.comment && <span className="comment" style={{ whiteSpace: 'pre-wrap' }}>"{h.comment}"</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
