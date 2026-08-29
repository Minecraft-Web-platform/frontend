import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, ShoppingCart, XCircle, MapPin, Square, Store } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useProperty, useCurrencies } from '../hooks/useEconomyData';
import { getMinecraftItemInfo } from '../constants/minecraft-items';
import { economyService } from '../services/economy.service';
import useAuthStore from '../../../store/auth.store';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { AxiosError } from 'axios';
import './PropertyDetailPage.scss';

const PROPERTY_TYPE_TRANSLATIONS: Record<string, string> = {
  land_plot: 'Земельный участок',
  residential: 'Жилое строение',
  public_building: 'Здание общего пользования',
  administrative: 'Административное здание',
  railway: 'Ж/Д вокзал',
  airfield: 'Аэродром',
  seaport: 'Морской порт',
  military: 'Военный объект'
};

const PROPERTY_SUBTYPE_TRANSLATIONS: Record<string, string> = {
  ihs: 'ИЖС (Дом, коммерция)',
  subsidiary: 'Подсобное хозяйство',
  agricultural: 'Сельхоз-нужды',
  industrial: 'Промышленный'
};

export const PropertyDetailPage: React.FC = () => {
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
                Назад
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Имущество не найдено.
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleBuy = async () => {
    if (!window.confirm(`Вы уверены, что хотите купить это имущество за ${property.price}?`)) return;
    try {
      setActionLoading(true);
      await economyService.buyProperty(property.id, {
        newOwnerType: 'personal', // Defaults to personal buy for now
        newOwnerId: myUuid, // For personal it's user's UUID
      });
      alert('Успешно куплено!');
      mutate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка при покупке');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSell = async () => {
    if (!window.confirm('Снять с продажи?')) return;
    try {
      setActionLoading(true);
      await economyService.cancelListing(property.id);
      alert('Снято с продажи!');
      mutate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка');
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = property.ownerId === myUuid;
  const typeText = `${PROPERTY_TYPE_TRANSLATIONS[property.type] || property.type} ${property.subType ? `(${PROPERTY_SUBTYPE_TRANSLATIONS[property.subType] || property.subType})` : ''}`;

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="property-detail-page">
          <div className="header-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Назад к списку
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
              <div>Нет фотографий</div>
            </div>
          )}
        </div>

        <div className="info-section">
          <div className="title-group">
            <h1>{property.name}</h1>
            <div className="badges">
              <span className="badge type">
                {property.propertyCategory === 'real_estate' ? 'Недвижимость' : 'Спецобъект'}
              </span>
              {property.isForSale && (
                <span className="badge sale">
                  В продаже
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
              <span className="label">Тип</span>
              <span className="value">{typeText}</span>
            </div>
            
            <div className="detail-row">
              <span className="label">Государство</span>
              <span className="value">{property.state?.name || property.stateId}</span>
            </div>

            {property.settlementId && (
              <div className="detail-row">
                <span className="label">Поселение</span>
                <span className="value">{property.settlement?.name || property.settlementId}</span>
              </div>
            )}

            {property.centerCoordinates && (
              <div className="detail-row">
                <span className="label">Координаты</span>
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
                <span className="label">Площадь</span>
                <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Square size={14} />
                  {property.area} кв.м.
                </span>
              </div>
            )}

            {(property.street || property.houseNumber) && (
              <div className="detail-row">
                <span className="label">Адрес</span>
                <span className="value">{property.street?.name || ''} {property.houseNumber || ''}</span>
              </div>
            )}

            {property.parentPropertyId && (
              <div className="detail-row">
                <span className="label">Участок (ID)</span>
                <span className="value">{property.parentPropertyId}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="label">Владелец</span>
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
                Снять с продажи
              </button>
            )}

            {!isOwner && property.isForSale && (!property.forSaleToId || property.forSaleToId === myUuid) && (
              <button 
                className="button" 
                onClick={handleBuy} 
                disabled={actionLoading}
              >
                <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                Купить
              </button>
            )}

            {isOwner && (
              <button className="button button--secondary" onClick={() => alert('Редактирование пока недоступно')}>
                <Edit2 size={18} style={{ marginRight: '8px' }} />
                Редактировать
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
