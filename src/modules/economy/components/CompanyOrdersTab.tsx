import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { ICompany, ICompanyOrder, CompanyOrderStatus } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import './CompanyOrdersTab.scss';

interface CompanyOrdersTabProps {
  company: ICompany;
}

export const CompanyOrdersTab: React.FC<CompanyOrdersTabProps> = ({ company }) => {
  const [orders, setOrders] = useState<ICompanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    economyService.getCompanyOrders(company.id)
      .then(res => setOrders(res))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_err => setError('Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: CompanyOrderStatus) => {
    let comment = '';
    if (newStatus === CompanyOrderStatus.CANCELLED) {
      const input = prompt('Укажите причину отмены заказа:');
      if (input === null) return;
      comment = input;
    }
    
    try {
      await economyService.updateOrderStatus(orderId, newStatus, comment);
      fetchOrders();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка обновления статуса');
    }
  };

  const handleEscalate = async (orderId: string) => {
    const reason = prompt('Укажите причину, по которой вы не согласны с решением президента (будет передано администрации):');
    if (reason) {
      try {
        await economyService.escalateOrder(orderId, reason);
        fetchOrders();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Не удалось эскалировать жалобу');
      }
    }
  };

  if (loading) return <div className="loading">Загрузка заказов...</div>;
  if (error) return <div className="error">{error}</div>;
  if (orders.length === 0) return <div className="empty-state">У компании пока нет заказов.</div>;

  return (
    <div className="company-orders-tab">
      <h2>Заказы фирмы</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Заказ #{order.id.slice(0, 8)}</span>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-details">
              <p>
                <strong>Клиент:</strong> {order.clientUsername}
                {order.payerType === 'company' && ' (Счет компании)'}
                {order.payerType === 'state' && ' (Государственная казна)'}
              </p>
              <p><strong>Услуга:</strong> {order.service?.name}</p>
              <p><strong>Итого:</strong> {order.totalPrice} монет</p>
              
              {order.items && order.items.length > 0 && (
                <div className="order-items">
                  <strong>Выбранные подуслуги:</strong>
                  <ul>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {order.items.map((item: any) => (
                      <li key={item.id}>{item.name} (+{item.price})</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {order.clientComment && (
                <div className="client-comment">
                  <strong>Комментарий клиента:</strong>
                  <p>{order.clientComment}</p>
                </div>
              )}
            </div>

            {order.status === CompanyOrderStatus.NEW && (
              <div className="order-actions">
                <Button secondary={true} callback={() => handleUpdateStatus(order.id, CompanyOrderStatus.CANCELLED)}>Отклонить</Button>
                <Button callback={() => handleUpdateStatus(order.id, CompanyOrderStatus.IN_PROGRESS)}>Принять в работу</Button>
              </div>
            )}
            
            {order.status === CompanyOrderStatus.IN_PROGRESS && (
              <div className="order-actions">
                <Button callback={() => handleUpdateStatus(order.id, CompanyOrderStatus.COMPLETED)}>Отметить как выполненный</Button>
              </div>
            )}

            {(order.status === CompanyOrderStatus.REFUNDED || order.status === CompanyOrderStatus.COMPLETED) && 
             order.statusHistory?.some(h => h.comment && h.comment.includes('[President Decision]')) && 
             !order.isEscalatedToAdmin && (
              <div className="order-actions" style={{ marginTop: '10px' }}>
                <Button style={{ backgroundColor: '#ef4444', color: 'white' }} callback={() => handleEscalate(order.id)}>Оспорить решение (Администрации)</Button>
              </div>
            )}
            
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="status-history">
                <details>
                  <summary>История статусов</summary>
                  <ul>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {order.statusHistory.map((h: any) => (
                      <li key={h.id}>
                        <span className="date">{new Date(h.createdAt).toLocaleString()}</span>
                        <span className="user">{h.changedByUsername}</span>
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
