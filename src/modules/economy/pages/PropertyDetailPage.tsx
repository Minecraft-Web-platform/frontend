import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, ShoppingCart, XCircle, MapPin, Square, Store } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useProperty, useCurrencies } from '../hooks/useEconomyData';
import { getMinecraftItemInfo } from '../constants/minecraft-items';
import { economyService } from '../services/economy.service';
import useAuthStore from '../../../store/auth.store';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { AxiosError } from 'axios';
import './PropertyDetailPage.scss';

export const PropertyDetailPage: React.FC = () => {
  const { t } = useTranslation('economy');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading, mutate } = useProperty(id);
  const { data: allCurrencies = [] } = useCurrencies();
  
  const { accessToken } = useAuthStore();
  let myUuid = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      myUuid = payload.uuid || '';
    } catch { /* empty */ }
  }

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="property-detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <PropagateLoader color="#4caf50" />
          </div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="property-detail-page">
            <div className="header-actions">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                {t('properties.backBtn')}
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              {t('properties.notFound')}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleBuy = async () => {
    if (!window.confirm(t('properties.confirmBuy', { price: property.price }))) return;
    try {
      setActionLoading(true);
      await economyService.buyProperty(property.id, {
        newOwnerType: 'personal', // Defaults to personal buy for now
        newOwnerId: myUuid, // For personal it's user's UUID
      });
      alert(t('properties.buySuccess'));
      mutate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.createModal.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSell = async () => {
    if (!window.confirm(t('properties.confirmDelist'))) return;
    try {
      setActionLoading(true);
      await economyService.cancelListing(property.id);
      alert(t('properties.delistSuccess'));
      mutate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.delistError'));
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = property.ownerId === myUuid;
  const translatedType = t(`properties.types.${property.type}`, property.type);
  const translatedSubtype = property.subType ? t(`properties.subtypes.${property.subType}`, property.subType) : '';
  const typeText = `${translatedType} ${translatedSubtype ? `(${translatedSubtype})` : ''}`;

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="property-detail-page">
          <div className="header-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          {t('properties.backToList')}
        </button>
      </div>

      <div className="property-content">
        <div className="gallery-section">
          {property.photoUrls && property.photoUrls.length > 0 ? (
            <>
              <img 
                src={property.photoUrls[activePhotoIndex]} 
                alt="Property main" 
                className="main-image"
              />
              {property.photoUrls.length > 1 && (
                <div className="thumbnail-list">
                  {property.photoUrls.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt={`Thumb ${idx}`}
                      className={idx === activePhotoIndex ? 'active' : ''}
                      onClick={() => setActivePhotoIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-photos">
              <Store size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <div>{t('properties.noPhotos')}</div>
            </div>
          )}
        </div>

        <div className="info-section">
          <div className="title-group">
            <h1>{property.name}</h1>
            <div className="badges">
              <span className="badge type">
                {property.propertyCategory === 'real_estate' ? t('properties.realEstate') : t('properties.specialObject')}
              </span>
              {property.isForSale && (
                <span className="badge sale">
                  {t('properties.forSale')}
                </span>
              )}
            </div>
          </div>

          {property.description && (
            <div className="description">
              {property.description}
            </div>
          )}

          <div className="details-grid">
            <div className="detail-row">
              <span className="label">{t('properties.labels.type')}</span>
              <span className="value">{typeText}</span>
            </div>
            
            <div className="detail-row">
              <span className="label">{t('properties.labels.state')}</span>
              <span className="value">{property.state?.name || property.stateId}</span>
            </div>

            {property.settlementId && (
              <div className="detail-row">
                <span className="label">{t('properties.labels.settlement')}</span>
                <span className="value">{property.settlement?.name || property.settlementId}</span>
              </div>
            )}

            {property.centerCoordinates && (
              <div className="detail-row">
                <span className="label">{t('properties.labels.coords')}</span>
                <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  {(() => {
                    const parts = property.centerCoordinates.split(',').map(s => s.trim());
                    if (parts.length === 3) {
                      const hash = `#world:${parts[0]}:${parts[1]}:${parts[2]}:30:0:0:0:0:perspective`;
                      return (
                        <Link 
                          to={`/map${hash}`} 
                          style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                        >
                          {property.centerCoordinates}
                        </Link>
                      );
                    }
                    return property.centerCoordinates;
                  })()}
                </span>
              </div>
            )}

            {property.area != null && (
              <div className="detail-row">
                <span className="label">{t('properties.labels.area')}</span>
                <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Square size={14} />
                  {property.area} {t('properties.units.sqm')}
                </span>
              </div>
            )}

            {(property.street || property.houseNumber) && (
              <div className="detail-row">
                <span className="label">{t('properties.labels.address')}</span>
                <span className="value">{property.street?.name || ''} {property.houseNumber || ''}</span>
              </div>
            )}

            {property.parentPropertyId && (
              <div className="detail-row">
                <span className="label">{t('properties.labels.parentPlot')}</span>
                <span className="value">{property.parentPropertyId}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="label">{t('properties.labels.owner')}</span>
              <span className="value" style={{ fontSize: '14px', fontWeight: 600 }}>{property.ownerName || property.ownerId}</span>
            </div>
          </div>

          <div className="actions">
            {property.isForSale && property.price != null && (() => {
              const currency = allCurrencies.find(c => c.stateId === property.stateId);
              const currencyIcon = currency ? getMinecraftItemInfo(currency.minecraftItemId)?.icon : '';
              return (
                <div className="price-tag" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', position: 'relative' }}>
                  {property.price.toFixed(2)}
                  {currencyIcon && <span>{currencyIcon}</span>}
                  {currency && (
                    <span style={{ marginLeft: '4px' }}>
                      {currency.name}
                    </span>
                  )}
                </div>
              );
            })()}

            {isOwner && property.isForSale && (
              <button 
                className="button button--secondary" 
                onClick={handleCancelSell} 
                disabled={actionLoading}
              >
                <XCircle size={18} style={{ marginRight: '8px' }} />
                {t('properties.delistBtn')}
              </button>
            )}

            {!isOwner && property.isForSale && (!property.forSaleToId || property.forSaleToId === myUuid) && (
              <button 
                className="button" 
                onClick={handleBuy} 
                disabled={actionLoading}
              >
                <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                {t('properties.buyBtn')}
              </button>
            )}

            {isOwner && (
              <button className="button button--secondary" onClick={() => alert(t('properties.editUnavailable'))}>
                <Edit2 size={18} style={{ marginRight: '8px' }} />
                {t('properties.editBtn')}
              </button>
            )}
          </div>
        </div>
          </div>
        </div>
      </main>
    </div>
  );
};
