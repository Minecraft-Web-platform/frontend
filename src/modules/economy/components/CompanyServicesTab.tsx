import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICompany, ICompanyService } from '../types/economy.types';
import Button from '../../../shared/ui/button/button.component';
import { CreateServiceModal } from './CreateServiceModal';
import { OrderServiceModal } from './OrderServiceModal';
import './CompanyServicesTab.scss';
import useAuthStore from '../../../store/auth.store';

interface CompanyServicesTabProps {
  company: ICompany;
  services: ICompanyService[];
  onRefresh: () => void;
}

export const CompanyServicesTab: React.FC<CompanyServicesTabProps> = ({ company, services, onRefresh }) => {
  const { t } = useTranslation('economy');
  const { accessToken } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ICompanyService | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<ICompanyService | null>(null);

  let username = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      username = payload.username || payload.username_lower || '';
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      // ignore
    }
  }

  const isOwner = username.toLowerCase() === company.ownerUsername.toLowerCase();

  return (
    <div className="company-services-tab">
      <div className="tab-header">
        <h2>{t('companies.services.title')}</h2>
        {isOwner && (
          <Button callback={() => setIsCreateModalOpen(true)}>{t('companies.services.create')}</Button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="empty-state">{t('companies.services.empty')}</div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card" onClick={() => setSelectedService(service)}>
              {isOwner && (
                <button 
                  className="edit-service-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setServiceToEdit(service);
                  }}
                  title={t('companies.services.edit')}
                >
                  ✎
                </button>
              )}
              {service.photoUrls && service.photoUrls.length > 0 && (
                <div className="service-image" style={{ backgroundImage: `url(${service.photoUrls[0]})` }} />
              )}
              <div className="service-info">
                <h3>{service.name}</h3>
                {service.description && <p className="description">{service.description}</p>}
                <div className="service-meta">
                  <span className="price">
                    {service.isComposite
                      ? t('companies.services.fromPrice', { price: service.price })
                      : t('companies.services.fixedPrice', { price: service.price })}
                  </span>
                  <span className="type">{service.isComposite ? t('companies.services.composite') : t('companies.services.single')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateServiceModal 
          companyId={company.id} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            onRefresh();
          }} 
        />
      )}

      {serviceToEdit && (
        <CreateServiceModal 
          companyId={company.id} 
          editService={serviceToEdit}
          onClose={() => setServiceToEdit(null)} 
          onSuccess={() => {
            setServiceToEdit(null);
            onRefresh();
          }} 
        />
      )}

      {selectedService && (
        <OrderServiceModal 
          companyId={company.id}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            setSelectedService(null);
            // optionally refresh or show toast
          }}
        />
      )}
    </div>
  );
};
