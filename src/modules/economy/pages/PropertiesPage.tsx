import React, { useEffect, useState } from 'react';
import { IProperty, PropertyCategory, PropertyOwnerType, ICompany, ICurrency } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { profileService } from '../../profile/services/profile.service';
import { statesService } from '../../states/services/states.service';
import { PropagateLoader } from 'react-spinners';
import './PropertiesPage.scss';

export const PropertiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'my'>('market');
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myUuid, setMyUuid] = useState<string | null>(null);
  const [myStateId, setMyStateId] = useState<string | null>(null);
  const [myStateCurrency, setMyStateCurrency] = useState<ICurrency | null>(null);
  const [myCompanies, setMyCompanies] = useState<ICompany[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  // States for creating a property
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    propertyCategory: 'real_estate' as PropertyCategory,
    type: 'land_plot',
    subType: '',
    cityId: '',
    stateId: '', // Ideally fetched from user's state, keeping it text for now
    ownerType: 'personal' as PropertyOwnerType,
    ownerId: '',
    centerCoordinates: '',
    photoUrlsText: '',
    parentPropertyId: '',
    streetId: '',
    houseNumber: '',
    area: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (myUuid) {
      loadProperties();
    }
  }, [activeTab, myUuid]);

  const loadUser = async () => {
    try {
      const data = await profileService.getInfoAboutMe();
      setMyUuid(data.uuid);
      if (data.stateId) {
        setMyStateId(data.stateId);
        setCreateForm(prev => ({ ...prev, stateId: data.stateId! }));

        // Fetch currency for calculation
        economyService.getAllCurrencies().then(currencies => {
          const stateCur = currencies.find(c => c.stateId === data.stateId);
          if (stateCur) setMyStateCurrency(stateCur);
        }).catch(console.error);

        // Fetch cities
        statesService.getCities(data.stateId).then(citiesData => {
          setCities(citiesData);
        }).catch(console.error);
      }
      if (data.username) {
        const companies = await economyService.getAllCompanies({ ownerUsername: data.username });
        setMyCompanies(companies);
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить профиль пользователя');
    }
  };

  useEffect(() => {
    if (createForm.cityId) {
      statesService.getStreets(createForm.cityId).then(streetsData => {
        setStreets(streetsData);
        setCreateForm(prev => ({ ...prev, streetId: '' }));
      }).catch(console.error);
    } else {
      setStreets([]);
      setCreateForm(prev => ({ ...prev, streetId: '' }));
    }
  }, [createForm.cityId]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'market') {
        // Fetch all market properties (can filter by stateId later)
        const res = await economyService.getMarketProperties();
        setProperties(res);
      } else {
        const res = await economyService.getMyProperties();
        setProperties(res);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки недвижимости');
    } finally {
      setLoading(false);
    }
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
      setLoading(true);
      const photoUrls = createForm.photoUrlsText.split('\n').map(u => u.trim()).filter(u => u.length > 0);

      await economyService.createProperty({
        ...createForm,
        ownerId: createForm.ownerId || finalOwnerId,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        parentPropertyId: createForm.parentPropertyId || undefined,
        streetId: createForm.streetId || undefined,
        houseNumber: createForm.houseNumber || undefined,
        area: createForm.area ? parseFloat(createForm.area) : undefined,
      });
      alert('Имущество успешно зарегистрировано!');
      setShowCreateModal(false);
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при создании имущества');
      setLoading(false);
    }
  };

  const handleBuy = async (propertyId: string) => {
    if (!myUuid) return;
    if (!confirm('Вы уверены, что хотите купить эту недвижимость? Будет списан налог.')) return;
    try {
      setLoading(true);
      await economyService.buyProperty(propertyId, {
        newOwnerId: myUuid,
        newOwnerType: 'personal',
      });
      alert('Покупка успешна!');
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при покупке');
      setLoading(false);
    }
  };

  const handleSell = async (propertyId: string) => {
    const priceStr = prompt('За какую цену вы хотите выставить имущество на продажу?');
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      alert('Неверная цена');
      return;
    }
    try {
      setLoading(true);
      await economyService.listPropertyForSale(propertyId, price);
      alert('Выставлено на продажу!');
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
      setLoading(false);
    }
  };

  const handleCancelSell = async (propertyId: string) => {
    try {
      setLoading(true);
      await economyService.cancelListing(propertyId);
      alert('Снято с продажи!');
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
      setLoading(false);
    }
  };

  if (loading && !properties.length) {
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
        <button className="button button--primary" onClick={() => setShowCreateModal(true)}>
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
        {properties.length === 0 && !loading && (
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
              </div>
              {p.isForSale && p.price && (
                <div className="price-tag">{p.price.toFixed(2)}</div>
              )}
            </div>

            <div className="card-body">
              {p.description && <div className="description">{p.description}</div>}

              <div className="details">
                <div className="detail-item">
                  <span>Тип</span>
                  <span>{p.type} {p.subType ? `(${p.subType})` : ''}</span>
                </div>
                <div className="detail-item">
                  <span>Государство (ID)</span>
                  <span>{p.stateId}</span>
                </div>
                {p.cityId && (
                  <div className="detail-item">
                    <span>Город (ID)</span>
                    <span>{p.cityId}</span>
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
              {activeTab === 'market' && p.ownerId !== myUuid && (
                <button className="button button--primary" onClick={() => handleBuy(p.id)}>
                  Купить
                </button>
              )}
              {activeTab === 'my' && !p.isForSale && (
                <button className="button button--outline" onClick={() => handleSell(p.id)}>
                  Продать
                </button>
              )}
              {activeTab === 'my' && p.isForSale && (
                <button className="button button--danger" onClick={() => handleCancelSell(p.id)}>
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
                <label>ID Государства</label>
                <input required disabled value={createForm.stateId} />
                {!myStateId && <small style={{ color: 'red' }}>Вы должны быть жителем государства!</small>}
              </div>

              <div className="form-group">
                <label>Координаты центра (Опционально)</label>
                <input
                  placeholder="X, Y, Z (например: 150, 64, -230)"
                  value={createForm.centerCoordinates}
                  onChange={e => setCreateForm({ ...createForm, centerCoordinates: e.target.value })}
                />
              </div>

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

              <div className="form-group">
                <label>Город (Опционально)</label>
                <select value={createForm.cityId} onChange={e => setCreateForm({ ...createForm, cityId: e.target.value })}>
                  <option value="">-- Без города (Вне города) --</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {createForm.cityId && (
                <div className="form-group">
                  <label>Улица (Опционально)</label>
                  <select value={createForm.streetId} onChange={e => setCreateForm({ ...createForm, streetId: e.target.value })}>
                    <option value="">-- Без улицы --</option>
                    {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
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
                <label>Площадь (Опционально)</label>
                <input
                  type="number"
                  placeholder="Площадь в кв.м."
                  value={createForm.area}
                  onChange={e => setCreateForm({ ...createForm, area: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Фотографии недвижимости (по одной ссылке на строку, до 10 фото)</label>
                <textarea
                  rows={4}
                  placeholder="https://example.com/photo1.png&#10;https://example.com/photo2.png"
                  value={createForm.photoUrlsText}
                  onChange={e => setCreateForm({ ...createForm, photoUrlsText: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="button button--outline" onClick={() => setShowCreateModal(false)}>Отмена</button>
                <button type="submit" className="button button--primary" disabled={loading || !myStateId || (createForm.ownerType === 'company' && !createForm.ownerId)}>Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
