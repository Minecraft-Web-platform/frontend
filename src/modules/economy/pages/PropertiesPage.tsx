import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyCategory, PropertyOwnerType, ICompany, ICurrency } from '../types/economy.types';
import { getMinecraftItemInfo } from '../constants/minecraft-items';
import { economyService } from '../services/economy.service';
import { profileService } from '../../profile/services/profile.service';
import { statesService } from '../../states/services/states.service';
import { useMyProperties, useMarketProperties } from '../hooks/useEconomyData';
import { PropagateLoader } from 'react-spinners';
import { ImageUploader } from '../../../shared/ui/image-uploader/ImageUploader';
import './PropertiesPage.scss';

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

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'market' | 'my'>('market');
  
  const { data: marketProperties = [], isLoading: loadingMarket, mutate: mutateMarket } = useMarketProperties();
  const { data: myProperties = [], isLoading: loadingMy, mutate: mutateMy } = useMyProperties();
  
  const properties = activeTab === 'market' ? marketProperties : myProperties;
  const isLoading = activeTab === 'market' ? loadingMarket : loadingMy;

  const [error, setError] = useState<string | null>(null);
  const [myUuid, setMyUuid] = useState<string | null>(null);
  const [myStateId, setMyStateId] = useState<string | null>(null);
  const [myStateCurrency, setMyStateCurrency] = useState<ICurrency | null>(null);
  const [myCompanies, setMyCompanies] = useState<ICompany[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settlements, setSettlements] = useState<any[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [streets, setStreets] = useState<any[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [territories, setTerritories] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // States for creating a property
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    propertyCategory: 'real_estate' as PropertyCategory,
    type: 'land_plot',
    subType: '',
    settlementId: '',
    stateId: '', // Ideally fetched from user's state, keeping it text for now
    ownerType: 'personal' as PropertyOwnerType,
    ownerId: '',
    centerCoordinates: '',
    photoUrls: [] as string[],
    parentPropertyId: '',
    streetId: '',
    houseNumber: '',
    area: '',
    territoryId: '',
  });

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);
  const [editOwnerType, setEditOwnerType] = useState<PropertyOwnerType>('personal');
  const [editOwnerId, setEditOwnerId] = useState<string>('');
  const [editStateId, setEditStateId] = useState<string>('');
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    photoUrls: [] as string[],
    territoryId: '',
  });

  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [sellPropertyId, setSellPropertyId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState<string>('');
  const [sellType, setSellType] = useState<'market' | 'direct'>('market');
  const [eligibleBuyers, setEligibleBuyers] = useState<{uuid: string, username: string}[]>([]);
  const [forSaleToId, setForSaleToId] = useState<string>('');
  const [allCurrencies, setAllCurrencies] = useState<any[]>([]);

  const availableTerritories = React.useMemo(() => {
    const expectedTerritoryType = createForm.ownerType === 'personal' ? 'player' : (createForm.ownerType === 'company' ? 'company' : undefined);
    const ownerIdToCheck = createForm.ownerType === 'personal' ? myUuid : (createForm.ownerType === 'company' ? createForm.ownerId : undefined);
    
    return territories.filter(t => {
      if (t.property) return false;
      if (expectedTerritoryType) {
        return t.ownerType === expectedTerritoryType && t.ownerId === ownerIdToCheck;
      }
      if (createForm.ownerType === 'government') {
        return (t.ownerType === 'state' || t.ownerType === 'settlement') && (t.ownerId === createForm.stateId || (t.settlement && t.settlement.state?.id === createForm.stateId));
      }
      return false;
    });
  }, [territories, createForm.ownerType, createForm.ownerId, myUuid, createForm.stateId]);

  const availableEditTerritories = React.useMemo(() => {
    if (!editPropertyId) return [];
    const expectedTerritoryType = editOwnerType === 'personal' ? 'player' : (editOwnerType === 'company' ? 'company' : undefined);
    const ownerIdToCheck = editOwnerType === 'personal' ? myUuid : (editOwnerType === 'company' ? editOwnerId : undefined);
    
    return territories.filter(t => {
      // Allowed if it's already bound to THIS property, or if it has NO property
      if (t.property && t.property.id !== editPropertyId) return false;
      
      if (expectedTerritoryType) {
        return t.ownerType === expectedTerritoryType && t.ownerId === ownerIdToCheck;
      }
      if (editOwnerType === 'government') {
        return (t.ownerType === 'state' || t.ownerType === 'settlement') && (t.ownerId === editStateId || (t.settlement && t.settlement.state?.id === editStateId));
      }
      return false;
    });
  }, [territories, editOwnerType, editOwnerId, myUuid, editStateId, editPropertyId]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await profileService.getInfoAboutMe();
      setMyUuid(data.uuid);
      if (data.stateId) {
        setMyStateId(data.stateId);
        setCreateForm(prev => ({ ...prev, stateId: data.stateId! }));

        // Fetch settlements
        statesService.getSettlements(data.stateId).then(settlementsData => {
          setSettlements(settlementsData);
        }).catch(console.error);
      }

      // Fetch currency for calculation and display
      economyService.getAllCurrencies().then(currencies => {
        setAllCurrencies(currencies);
        if (data.stateId) {
          const stateCur = currencies.find(c => c.stateId === data.stateId);
          if (stateCur) setMyStateCurrency(stateCur);
        }
      }).catch(console.error);

      if (data.username) {
        const companies = await economyService.getAllCompanies({ ownerUsername: data.username });
        setMyCompanies(companies);
      }
      
      statesService.getTerritories().then(data => setTerritories(data)).catch(console.error);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError('Не удалось загрузить профиль пользователя');
    }
  };

  useEffect(() => {
    if (createForm.settlementId) {
      statesService.getStreets(createForm.settlementId).then(streetsData => {
        setStreets(streetsData);
        setCreateForm(prev => ({ ...prev, streetId: '' }));
      }).catch(console.error);
    } else {
      setStreets([]);
      setCreateForm(prev => ({ ...prev, streetId: '' }));
    }
  }, [createForm.settlementId]);

  const reloadProperties = () => {
    mutateMarket();
    mutateMy();
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myUuid) return;

    // Determine exact ownerId based on ownerType selection
    let finalOwnerId = myUuid;
    if (createForm.ownerType === 'company') {
      // Need a company selection, falling back to myUuid if something goes wrong
      // Wait, we need a separate field for selectedCompanyId
    } else if (createForm.ownerType === 'government') {
      finalOwnerId = createForm.stateId;
    }

    try {
      setActionLoading(true);

      await economyService.createProperty({
        ...createForm,
        ownerId: createForm.ownerId || finalOwnerId,
        photoUrls: createForm.photoUrls.length > 0 ? createForm.photoUrls : undefined,
        parentPropertyId: createForm.parentPropertyId || undefined,
        streetId: createForm.streetId || undefined,
        houseNumber: createForm.houseNumber || undefined,
        area: createForm.area ? parseFloat(createForm.area) : undefined,
        territoryId: createForm.territoryId || undefined,
      });
      alert('Имущество успешно зарегистрировано!');
      setShowCreateModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка при создании имущества');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (p: any) => {
    setEditPropertyId(p.id);
    setEditOwnerType(p.ownerType);
    setEditOwnerId(p.ownerId);
    setEditStateId(p.stateId);
    setEditForm({
      name: p.name,
      description: p.description || '',
      photoUrls: p.photoUrls || [],
      territoryId: p.territoryId || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPropertyId) return;
    try {
      setActionLoading(true);
      
      await economyService.updateProperty(editPropertyId, {
        name: editForm.name,
        description: editForm.description || undefined,
        photoUrls: editForm.photoUrls.length > 0 ? editForm.photoUrls : undefined,
        territoryId: editForm.territoryId || '', // we send empty string to untie it, but wait, the backend expects empty string to mean "unbind"
      });
      alert('Имущество успешно обновлено!');
      setShowEditModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка при обновлении имущества');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuy = async (propertyId: string) => {
    if (!myUuid) return;
    if (!confirm('Вы уверены, что хотите купить эту недвижимость? Будет списан налог.')) return;
    try {
      setActionLoading(true);
      await economyService.buyProperty(propertyId, {
        newOwnerId: myUuid,
        newOwnerType: 'personal',
      });
      alert('Покупка успешна!');
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка при покупке');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellClick = async (propertyId: string) => {
    setSellPropertyId(propertyId);
    setSellPrice('');
    setSellType('market');
    setForSaleToId('');
    setShowSellModal(true);
    
    try {
      const buyers = await economyService.getEligibleBuyers(propertyId);
      setEligibleBuyers(buyers.filter(b => b.uuid !== myUuid));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellPropertyId) return;
    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) {
      alert('Неверная цена');
      return;
    }
    const targetId = sellType === 'direct' && forSaleToId ? forSaleToId : undefined;
    try {
      setActionLoading(true);
      await economyService.listPropertyForSale(sellPropertyId, price, targetId);
      alert('Выставлено на продажу!');
      setShowSellModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSell = async (propertyId: string) => {
    try {
      setActionLoading(true);
      await economyService.cancelListing(propertyId);
      alert('Снято с продажи!');
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || 'Ошибка');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && !properties.length) {
    return (
      <div className="properties-page" style={{ alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <PropagateLoader color="#4caf50" />
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="properties-page__header">
        <div className="header-info">
          <h2>🏠 Недвижимость и Имущество</h2>
          <p>Покупка, продажа и управление вашим имуществом</p>
        </div>
        <button className="button" onClick={() => setShowCreateModal(true)}>
          Зарегистрировать имущество
        </button>
      </div>

      <div className="properties-page__tabs">
        <button
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          Рынок Недвижимости
        </button>
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Мое Имущество
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="properties-page__list">
        {properties.length === 0 && !isLoading && (
          <div className="empty-state">Нет данных для отображения</div>
        )}

        {properties.map(p => (
          <div className="properties-page__card" key={p.id}>
            <div className="card-header">
              <div className="title">
                <h3>{p.name}</h3>
                <span className={`category-badge ${p.propertyCategory}`}>
                  {p.propertyCategory === 'real_estate' ? 'Недвижимость' : 'Спецобъект'}
                </span>
                {p.forSaleToId && p.forSaleToId === myUuid && (
                  <span className="category-badge" style={{ background: '#4caf50', color: 'white', marginLeft: '8px' }}>Вам</span>
                )}
                {p.forSaleToId && p.forSaleToId !== myUuid && (
                  <span className="category-badge" style={{ background: '#f44336', color: 'white', marginLeft: '8px' }}>Адресное</span>
                )}
              </div>
              {p.isForSale && p.price && (() => {
                const currency = allCurrencies.find(c => c.stateId === p.stateId);
                const currencyIcon = currency ? getMinecraftItemInfo(currency.minecraftItemId)?.icon : '';
                return (
                  <div className="price-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                    {p.price.toFixed(2)}
                    {currencyIcon && <span>{currencyIcon}</span>}
                    {currency && (
                      <span className="custom-tooltip">{currency.name} ({currency.code})</span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="card-body">
              {p.description && <div className="description">{p.description}</div>}

              <div className="details">
                <div className="detail-item">
                  <span>Тип</span>
                  <span>{PROPERTY_TYPE_TRANSLATIONS[p.type] || p.type} {p.subType ? `(${PROPERTY_SUBTYPE_TRANSLATIONS[p.subType] || p.subType})` : ''}</span>
                </div>
                <div className="detail-item">
                  <span>Государство</span>
                  <span>{p.state?.name || p.stateId}</span>
                </div>
                {p.settlementId && (
                  <div className="detail-item">
                    <span>Поселение</span>
                    <span>{p.settlement?.name || p.settlementId}</span>
                  </div>
                )}
                {p.centerCoordinates && (
                  <div className="detail-item">
                    <span>Координаты</span>
                    <span>{p.centerCoordinates}</span>
                  </div>
                )}
                {p.photoUrls && p.photoUrls.length > 0 && (
                  <div className="detail-item">
                    <span>Фото</span>
                    <span>{p.photoUrls.length} шт.</span>
                  </div>
                )}
                {p.parentPropertyId && (
                  <div className="detail-item">
                    <span>На участке (ID)</span>
                    <span>{p.parentPropertyId}</span>
                  </div>
                )}
                {(p.street || p.houseNumber) && (
                  <div className="detail-item">
                    <span>Адрес</span>
                    <span>{p.street?.name || ''} {p.houseNumber || ''}</span>
                  </div>
                )}
                {p.area != null && (
                  <div className="detail-item">
                    <span>Площадь</span>
                    <span>{p.area} кв.м.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="button button--secondary" 
                onClick={() => navigate(`/economy/property/${p.id}`)}
              >
                Подробнее
              </button>
              {activeTab === 'market' && p.ownerId !== myUuid && (!p.forSaleToId || p.forSaleToId === myUuid) && (
                <button 
                  className="button" 
                  onClick={() => handleBuy(p.id)}
                >
                  Купить
                </button>
              )}
              {activeTab === 'my' && !p.isForSale && (
                <button className="button button--secondary" onClick={() => handleSellClick(p.id)}>
                  Продать
                </button>
              )}
              {activeTab === 'my' && (
                <button className="button" onClick={() => handleEditClick(p)}>
                  Редактировать
                </button>
              )}
              {activeTab === 'my' && p.isForSale && (
                <button className="button button--secondary" onClick={() => handleCancelSell(p.id)}>
                  Снять с продажи
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Регистрация имущества</h3>
            {createForm.ownerType === 'government' ? (
              <p className="modal-subtitle">
                Внимание: Для государства налог на создание равен 0.
              </p>
            ) : myStateCurrency ? (
              <p className="modal-subtitle">
                Внимание: За создание будет списан налог {(myStateCurrency.totalIssued / (myStateCurrency.propertyCreationFeeRate || 500)).toFixed(2)} {myStateCurrency.code}.
              </p>
            ) : (
              <p className="modal-subtitle">
                Внимание: За создание будет списан налог 1/500 от эмиссии валюты выбранного государства.
              </p>
            )}
            <form onSubmit={handleCreateProperty}>
              <div className="form-group">
                <label>Название</label>
                <input required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>От чьего лица оформляется</label>
                <select value={createForm.ownerType} onChange={e => {
                  const val = e.target.value as PropertyOwnerType;
                  setCreateForm({ ...createForm, ownerType: val, ownerId: val === 'personal' ? myUuid! : val === 'government' ? createForm.stateId : '' });
                }}>
                  <option value="personal">Физлицо (Личное)</option>
                  <option value="company">Компания</option>
                  <option value="government">Государство (Казна)</option>
                </select>
              </div>

              {createForm.ownerType === 'company' && (
                <div className="form-group">
                  <label>Выберите компанию</label>
                  <select required value={createForm.ownerId} onChange={e => setCreateForm({ ...createForm, ownerId: e.target.value })}>
                    <option value="" disabled>-- Выберите компанию --</option>
                    {myCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Категория</label>
                <select value={createForm.propertyCategory} onChange={e => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cat = e.target.value as any;
                  setCreateForm({
                    ...createForm,
                    propertyCategory: cat,
                    type: cat === 'real_estate' ? 'land_plot' : 'railway'
                  });
                }}>
                  <option value="real_estate">Недвижимость</option>
                  <option value="special_object">Спецобъект</option>
                </select>
              </div>

              <div className="form-group">
                <label>Тип</label>
                {createForm.propertyCategory === 'real_estate' ? (
                  <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                    <option value="land_plot">Земельный участок</option>
                    <option value="residential">Жилое строение</option>
                    <option value="public_building">Здание общего пользования</option>
                    <option value="administrative">Административное здание</option>
                  </select>
                ) : (
                  <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                    <option value="railway">Ж/Д вокзал</option>
                    <option value="airfield">Аэродром</option>
                    <option value="seaport">Морской порт</option>
                    <option value="military">Военный объект</option>
                  </select>
                )}
              </div>

              {createForm.type === 'land_plot' && (
                <div className="form-group">
                  <label>Подвид (Опционально)</label>
                  <select value={createForm.subType} onChange={e => setCreateForm({ ...createForm, subType: e.target.value })}>
                    <option value="">-- Без подвида --</option>
                    <option value="ihs">ИЖС (Дом, коммерция)</option>
                    <option value="subsidiary">Подсобное хозяйство</option>
                    <option value="agricultural">Сельхоз-нужды</option>
                    <option value="industrial">Промышленный</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Приват (Опционально)</label>
                <select value={createForm.territoryId} onChange={e => setCreateForm({ ...createForm, territoryId: e.target.value })}>
                  <option value="">-- Без привата --</option>
                  {availableTerritories.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.settlement ? `Приват в ${t.settlement.name} ` : 'Приват '}
                      ({t.minX}, {t.minZ} - {t.maxX}, {t.maxZ})
                    </option>
                  ))}
                </select>
                <small>Можно привязать только свободный приват, который принадлежит вам (или вашей компании/государству).</small>
              </div>

              <div className="form-group">
                <label>ID Государства</label>
                <input required disabled value={createForm.stateId} />
                {!myStateId && <small style={{ color: 'red' }}>Вы должны быть жителем государства!</small>}
              </div>

              {!createForm.territoryId && (
                <div className="form-group">
                  <label>Координаты центра (Опционально)</label>
                  <input
                    placeholder="X, Y, Z (например: 150, 64, -230)"
                    value={createForm.centerCoordinates}
                    onChange={e => setCreateForm({ ...createForm, centerCoordinates: e.target.value })}
                  />
                  <small>Будут определены автоматически, если выбран приват.</small>
                </div>
              )}

              {createForm.propertyCategory === 'real_estate' && createForm.type !== 'land_plot' && (
                <div className="form-group">
                  <label>ID родительского земельного участка (Опционально)</label>
                  <input
                    placeholder="Укажите ID участка, на котором находится строение"
                    value={createForm.parentPropertyId}
                    onChange={e => setCreateForm({ ...createForm, parentPropertyId: e.target.value })}
                  />
                </div>
              )}

              {!createForm.territoryId && (
                <>
                  <div className="form-group">
                    <label>Поселение (Опционально)</label>
                    <select value={createForm.settlementId} onChange={e => setCreateForm({ ...createForm, settlementId: e.target.value })}>
                      <option value="">-- Без поселения (Вне поселения) --</option>
                      {settlements.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <small>Если выбран приват, поселение и государство будут подтянуты автоматически.</small>
                  </div>

                  {createForm.settlementId && (
                    <div className="form-group">
                      <label>Улица (Опционально)</label>
                      <select value={createForm.streetId} onChange={e => setCreateForm({ ...createForm, streetId: e.target.value })}>
                        <option value="">-- Без улицы --</option>
                        {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>Площадь (Опционально)</label>
                    <input
                      type="number"
                      placeholder="Площадь в кв.м."
                      value={createForm.area}
                      onChange={e => setCreateForm({ ...createForm, area: e.target.value })}
                    />
                    <small>Площадь рассчитывается автоматически при выборе привата.</small>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Номер дома/строения (Опционально)</label>
                <input
                  placeholder="Например: 12Б"
                  value={createForm.houseNumber}
                  onChange={e => setCreateForm({ ...createForm, houseNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <ImageUploader 
                  label="Фотографии недвижимости (до 10 фото)"
                  multiple={true}
                  maxFiles={10}
                  folder="properties"
                  value={createForm.photoUrls}
                  onChange={(urls) => setCreateForm({ ...createForm, photoUrls: Array.isArray(urls) ? urls : [urls] })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowCreateModal(false)}>Отмена</button>
                <button type="submit" className="button" disabled={actionLoading || !myStateId || (createForm.ownerType === 'company' && !createForm.ownerId)}>Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Редактирование имущества</h3>
            <form onSubmit={handleUpdateProperty}>
              <div className="form-group">
                <label>Название</label>
                <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Описание (Опционально)</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Приват (Опционально)</label>
                <select value={editForm.territoryId} onChange={e => setEditForm({ ...editForm, territoryId: e.target.value })}>
                  <option value="">-- Без привата --</option>
                  {availableEditTerritories.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.settlement ? `Приват в ${t.settlement.name} ` : 'Приват '}
                      ({t.minX}, {t.minZ} - {t.maxX}, {t.maxZ})
                    </option>
                  ))}
                </select>
                <small>Можно привязать только свободный приват (или текущий), который принадлежит вам (или вашей компании/государству).</small>
              </div>

              <div className="form-group">
                <ImageUploader 
                  label="Фотографии недвижимости (до 10 фото)"
                  multiple={true}
                  maxFiles={10}
                  folder="properties"
                  value={editForm.photoUrls}
                  onChange={(urls) => setEditForm({ ...editForm, photoUrls: Array.isArray(urls) ? urls : [urls] })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowEditModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="button" disabled={actionLoading}>
                  {actionLoading ? 'Загрузка...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Продажа имущества</h3>
            <p className="modal-subtitle" style={{ background: '#f3f4f6', color: '#111827' }}>За какую цену вы хотите выставить имущество на продажу?</p>
            <form onSubmit={handleConfirmSell}>
              <div className="form-group">
                <label>Способ продажи</label>
                <select value={sellType} onChange={e => setSellType(e.target.value as 'market' | 'direct')} required>
                  <option value="market">На открытый рынок</option>
                  <option value="direct">Прямое предложение игроку</option>
                </select>
              </div>

              {sellType === 'direct' && (
                <div className="form-group">
                  <label>Выберите покупателя (только игроки со счетом в валюте)</label>
                  <select value={forSaleToId} onChange={e => setForSaleToId(e.target.value)} required={sellType === 'direct'}>
                    <option value="">-- Выберите игрока --</option>
                    {eligibleBuyers.map(b => (
                      <option key={b.uuid} value={b.uuid}>{b.username}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Цена</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Например: 500"
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowSellModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="button" disabled={actionLoading}>
                  {actionLoading ? 'Загрузка...' : 'Выставить на продажу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
