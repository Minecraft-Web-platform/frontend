import React, { useState, useMemo, useEffect } from 'react';
import { ICompanyService, IOrderIdentity } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import './OrderServiceModal.scss';

interface OrderServiceModalProps {
  companyId: string;
  service: ICompanyService;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderServiceModal: React.FC<OrderServiceModalProps> = ({ companyId, service, onClose, onSuccess }) => {
  const [clientComment, setClientComment] = useState('');
  const [selectedSubItemIds, setSelectedSubItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [identities, setIdentities] = useState<IOrderIdentity[]>([]);
  const [selectedIdentityId, setSelectedIdentityId] = useState<string>('');
  
  useEffect(() => {
    economyService.getMyIdentities()
      .then(data => {
        setIdentities(data);
        if (data.length > 0) {
          setSelectedIdentityId(data[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to load identities', err);
      });
  }, []);

  const handleSubItemToggle = (subItemId: string) => {
    const newSet = new Set(selectedSubItemIds);
    if (newSet.has(subItemId)) {
      newSet.delete(subItemId);
    } else {
      newSet.add(subItemId);
    }
    setSelectedSubItemIds(newSet);
  };

  const totalPrice = useMemo(() => {
    let total = service.price; // Base price or single service price
    if (service.isComposite && service.subItems) {
      service.subItems.forEach((item: any) => {
        if (selectedSubItemIds.has(item.id)) {
          total += item.price;
        }
      });
    }
    return total;
  }, [service, selectedSubItemIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (service.isComposite && selectedSubItemIds.size === 0) {
      setError('Выберите хотя бы одну подуслугу');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const selectedIdentity = identities.find(i => i.id === selectedIdentityId);

      await economyService.createCompanyOrder({
        companyId,
        serviceId: service.id,
        clientComment,
        subItemIds: service.isComposite ? Array.from(selectedSubItemIds) : undefined,
        payerType: selectedIdentity?.type,
        payerCompanyId: selectedIdentity?.type === 'company' ? selectedIdentity.id : undefined,
        payerStateId: selectedIdentity?.type === 'state' ? selectedIdentity.id : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="order-service-modal">
        <h2>Оформление заказа: {service.name}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="service-details">
          {service.description && <p>{service.description}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {service.isComposite && service.subItems && service.subItems.length > 0 && (
            <div className="sub-items-selection">
              <h3>Выберите подуслуги (Базовая стоимость: {service.price})</h3>
              {service.subItems.map((item: any) => (
                <label key={item.id} className="sub-item-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedSubItemIds.has(item.id)}
                    onChange={() => handleSubItemToggle(item.id)}
                  />
                  <div className="sub-item-info">
                    <span className="name">{item.name}</span>
                    {item.description && <span className="desc">{item.description}</span>}
                  </div>
                  <span className="price">+{item.price}</span>
                </label>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Комментарий к заказу (адрес доставки, пожелания и т.д.)</label>
            <textarea 
              value={clientComment} 
              onChange={e => setClientComment(e.target.value)} 
              rows={4}
              placeholder="Опишите детали заказа..."
            />
          </div>

          {identities.length > 1 && (
            <div className="form-group">
              <label>Оформить от лица:</label>
              <select 
                value={selectedIdentityId} 
                onChange={e => setSelectedIdentityId(e.target.value)}
              >
                {identities.map(id => (
                  <option key={id.id} value={id.id}>{id.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="order-summary">
            Итоговая стоимость: <span className="total-price">{totalPrice} монет</span>
          </div>

          <div className="modal-actions">
            <Button type="button" callback={onClose} secondary={true}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Оформление...' : 'Оформить заказ'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
