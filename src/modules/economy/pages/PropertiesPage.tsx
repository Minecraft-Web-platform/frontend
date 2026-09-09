import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyCategory, PropertyOwnerType, ICompany, ICurrency } from '../types/economy.types';
import { getMinecraftItemInfo } from '../constants/minecraft-items';
import { economyService } from '../services/economy.service';
import { profileService } from '../../profile/services/profile.service';
import { statesService } from '../../states/services/states.service';
import { useMyProperties, useMarketProperties } from '../hooks/useEconomyData';
import { PropagateLoader } from 'react-spinners';
import { ImageUploader } from '../../../shared/ui/image-uploader/ImageUploader';
import './PropertiesPage.scss';

export const PropertiesPage: React.FC = () => {
  const { t } = useTranslation('economy');
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
  const [allCurrencies, setAllCurrencies] = useState<ICurrency[]>([]);

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
      setError(t('properties.profileLoadError'));
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
      alert(t('properties.createModal.success'));
      setShowCreateModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.createModal.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (p: import("../types/economy.types").IProperty) => {
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
      alert(t('properties.editModal.success'));
      setShowEditModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.editModal.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuy = async (propertyId: string) => {
    if (!myUuid) return;
    if (!confirm(t('properties.confirmBuy', { price: '' }))) return;
    try {
      setActionLoading(true);
      await economyService.buyProperty(propertyId, {
        newOwnerId: myUuid,
        newOwnerType: 'personal',
      });
      alert(t('properties.buySuccess'));
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.buyError'));
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
      alert(t('properties.sellModal.invalidPrice'));
      return;
    }
    const targetId = sellType === 'direct' && forSaleToId ? forSaleToId : undefined;
    try {
      setActionLoading(true);
      await economyService.listPropertyForSale(sellPropertyId, price, targetId);
      alert(t('properties.sellModal.success'));
      setShowSellModal(false);
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.sellModal.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSell = async (propertyId: string) => {
    try {
      setActionLoading(true);
      await economyService.cancelListing(propertyId);
      alert(t('properties.delistSuccess'));
      reloadProperties();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || t('properties.delistError'));
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
          <h2>{t('properties.heroTitle')}</h2>
          <p>{t('properties.heroSubtitle')}</p>
        </div>
        <button className="button" onClick={() => setShowCreateModal(true)}>
          {t('properties.registerBtn')}
        </button>
      </div>

      <div className="properties-page__tabs">
        <button
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          {t('properties.marketTab')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          {t('properties.myPropertiesTab')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="properties-page__list">
        {properties.length === 0 && !isLoading && (
          <div className="empty-state">{t('properties.empty')}</div>
        )}

        {properties.map(p => (
          <div className="properties-page__card" key={p.id}>
            <div className="card-header">
              <div className="title">
                <h3>{p.name}</h3>
                <span className={`category-badge ${p.propertyCategory}`}>
                  {p.propertyCategory === 'real_estate' ? t('properties.realEstate') : t('properties.specialObject')}
                </span>
                {p.forSaleToId && p.forSaleToId === myUuid && (
                  <span className="category-badge" style={{ background: '#4caf50', color: 'white', marginLeft: '8px' }}>{t('properties.forYouBadge')}</span>
                )}
                {p.forSaleToId && p.forSaleToId !== myUuid && (
                  <span className="category-badge" style={{ background: '#f44336', color: 'white', marginLeft: '8px' }}>{t('properties.targetedBadge')}</span>
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
                  <span>{t('properties.labels.type')}</span>
                  <span>{t(`properties.types.${p.type}`, { defaultValue: p.type })} {p.subType ? `(${t(`properties.subtypes.${p.subType}`, { defaultValue: p.subType })})` : ''}</span>
                </div>
                <div className="detail-item">
                  <span>{t('properties.labels.state')}</span>
                  <span>{p.state?.name || p.stateId}</span>
                </div>
                {p.settlementId && (
                  <div className="detail-item">
                    <span>{t('properties.labels.settlement')}</span>
                    <span>{p.settlement?.name || p.settlementId}</span>
                  </div>
                )}
                {p.centerCoordinates && (
                  <div className="detail-item">
                    <span>{t('properties.labels.coords')}</span>
                    <span>{p.centerCoordinates}</span>
                  </div>
                )}
                {p.photoUrls && p.photoUrls.length > 0 && (
                  <div className="detail-item">
                    <span>{t('properties.labels.photos')}</span>
                    <span>{p.photoUrls.length} {t('properties.units.pcs')}</span>
                  </div>
                )}
                {p.parentPropertyId && (
                  <div className="detail-item">
                    <span>{t('properties.labels.parentPlot')}</span>
                    <span>{p.parentPropertyId}</span>
                  </div>
                )}
                {(p.street || p.houseNumber) && (
                  <div className="detail-item">
                    <span>{t('properties.labels.address')}</span>
                    <span>{p.street?.name || ''} {p.houseNumber || ''}</span>
                  </div>
                )}
                {p.area != null && (
                  <div className="detail-item">
                    <span>{t('properties.labels.area')}</span>
                    <span>{p.area} {t('properties.units.sqm')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="button button--secondary" 
                onClick={() => navigate(`/economy/property/${p.id}`)}
              >
                {t('properties.detailsBtn')}
              </button>
              {activeTab === 'market' && p.ownerId !== myUuid && (!p.forSaleToId || p.forSaleToId === myUuid) && (
                <button 
                  className="button" 
                  onClick={() => handleBuy(p.id)}
                >
                  {t('properties.buyBtn')}
                </button>
              )}
              {activeTab === 'my' && !p.isForSale && (
                <button className="button button--secondary" onClick={() => handleSellClick(p.id)}>
                  {t('properties.sellBtn')}
                </button>
              )}
              {activeTab === 'my' && (
                <button className="button" onClick={() => handleEditClick(p)}>
                  {t('properties.editBtn')}
                </button>
              )}
              {activeTab === 'my' && p.isForSale && (
                <button className="button button--secondary" onClick={() => handleCancelSell(p.id)}>
                  {t('properties.delistBtn')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{t('properties.createModal.title')}</h3>
            {createForm.ownerType === 'government' ? (
              <p className="modal-subtitle">
                {t('properties.createModal.taxZero')}
              </p>
            ) : myStateCurrency ? (
              <p className="modal-subtitle">
                {t('properties.createModal.taxAmount', {
                  amount: (myStateCurrency.totalIssued / (myStateCurrency.propertyCreationFeeRate || 500)).toFixed(2),
                  code: myStateCurrency.code
                })}
              </p>
            ) : (
              <p className="modal-subtitle">
                {t('properties.createModal.taxFormula')}
              </p>
            )}
            <form onSubmit={handleCreateProperty}>
              <div className="form-group">
                <label>{t('properties.createModal.name')}</label>
                <input required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>{t('properties.createModal.ownerType')}</label>
                <select value={createForm.ownerType} onChange={e => {
                  const val = e.target.value as PropertyOwnerType;
                  setCreateForm({ ...createForm, ownerType: val, ownerId: val === 'personal' ? myUuid! : val === 'government' ? createForm.stateId : '' });
                }}>
                  <option value="personal">{t('properties.ownerTypes.personal')}</option>
                  <option value="company">{t('properties.ownerTypes.company')}</option>
                  <option value="government">{t('properties.ownerTypes.government')}</option>
                </select>
              </div>

              {createForm.ownerType === 'company' && (
                <div className="form-group">
                  <label>{t('properties.createModal.selectCompany')}</label>
                  <select required value={createForm.ownerId} onChange={e => setCreateForm({ ...createForm, ownerId: e.target.value })}>
                    <option value="" disabled>{t('properties.createModal.selectCompanyPlaceholder')}</option>
                    {myCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t('properties.createModal.category')}</label>
                <select value={createForm.propertyCategory} onChange={e => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cat = e.target.value as any;
                  setCreateForm({
                    ...createForm,
                    propertyCategory: cat,
                    type: cat === 'real_estate' ? 'land_plot' : 'railway'
                  });
                }}>
                  <option value="real_estate">{t('properties.categories.real_estate')}</option>
                  <option value="special_object">{t('properties.categories.special_object')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('properties.createModal.type')}</label>
                {createForm.propertyCategory === 'real_estate' ? (
                  <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                    <option value="land_plot">{t('properties.types.land_plot')}</option>
                    <option value="residential">{t('properties.types.residential')}</option>
                    <option value="public_building">{t('properties.types.public_building')}</option>
                    <option value="administrative">{t('properties.types.administrative')}</option>
                  </select>
                ) : (
                  <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                    <option value="railway">{t('properties.types.railway')}</option>
                    <option value="airfield">{t('properties.types.airfield')}</option>
                    <option value="seaport">{t('properties.types.seaport')}</option>
                    <option value="military">{t('properties.types.military')}</option>
                  </select>
                )}
              </div>

              {createForm.type === 'land_plot' && (
                <div className="form-group">
                  <label>{t('properties.createModal.subtype')}</label>
                  <select value={createForm.subType} onChange={e => setCreateForm({ ...createForm, subType: e.target.value })}>
                    <option value="">{t('properties.subtypes.none')}</option>
                    <option value="ihs">{t('properties.subtypes.ihs')}</option>
                    <option value="subsidiary">{t('properties.subtypes.subsidiary')}</option>
                    <option value="agricultural">{t('properties.subtypes.agricultural')}</option>
                    <option value="industrial">{t('properties.subtypes.industrial')}</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t('properties.createModal.claim')}</label>
                <select value={createForm.territoryId} onChange={e => setCreateForm({ ...createForm, territoryId: e.target.value })}>
                  <option value="">{t('properties.createModal.noClaim')}</option>
                  {availableTerritories.map(tItem => (
                    <option key={tItem.id} value={tItem.id}>
                      {tItem.settlement 
                        ? t('properties.createModal.claimInSettlement', { settlement: tItem.settlement.name, id: `${tItem.minX}, ${tItem.minZ} - ${tItem.maxX}, ${tItem.maxZ}` })
                        : t('properties.createModal.claimStandalone', { id: `${tItem.minX}, ${tItem.minZ} - ${tItem.maxX}, ${tItem.maxZ}` })}
                    </option>
                  ))}
                </select>
                <small>{t('properties.createModal.claimHint')}</small>
              </div>

              <div className="form-group">
                <label>{t('properties.createModal.stateId')}</label>
                <input required disabled value={createForm.stateId} />
                {!myStateId && <small style={{ color: 'red' }}>{t('properties.createModal.mustBeCitizen')}</small>}
              </div>

              {!createForm.territoryId && (
                <div className="form-group">
                  <label>{t('properties.createModal.coords')}</label>
                  <input
                    placeholder={t('properties.createModal.coordsPlaceholder')}
                    value={createForm.centerCoordinates}
                    onChange={e => setCreateForm({ ...createForm, centerCoordinates: e.target.value })}
                  />
                  <small>{t('properties.createModal.coordsHint')}</small>
                </div>
              )}

              {createForm.propertyCategory === 'real_estate' && createForm.type !== 'land_plot' && (
                <div className="form-group">
                  <label>{t('properties.createModal.parentPlot')}</label>
                  <input
                    placeholder={t('properties.createModal.parentPlotPlaceholder')}
                    value={createForm.parentPropertyId}
                    onChange={e => setCreateForm({ ...createForm, parentPropertyId: e.target.value })}
                  />
                </div>
              )}

              {!createForm.territoryId && (
                <>
                  <div className="form-group">
                    <label>{t('properties.createModal.settlement')}</label>
                    <select value={createForm.settlementId} onChange={e => setCreateForm({ ...createForm, settlementId: e.target.value })}>
                      <option value="">{t('properties.createModal.outsideSettlement')}</option>
                      {settlements.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <small>{t('properties.createModal.settlementHint')}</small>
                  </div>

                  {createForm.settlementId && (
                    <div className="form-group">
                      <label>{t('properties.createModal.street')}</label>
                      <select value={createForm.streetId} onChange={e => setCreateForm({ ...createForm, streetId: e.target.value })}>
                        <option value="">{t('properties.createModal.noStreet')}</option>
                        {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>{t('properties.createModal.area')}</label>
                    <input
                      type="number"
                      placeholder={t('properties.createModal.areaPlaceholder')}
                      value={createForm.area}
                      onChange={e => setCreateForm({ ...createForm, area: e.target.value })}
                    />
                    <small>{t('properties.createModal.areaHint')}</small>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>{t('properties.createModal.houseNumber')}</label>
                <input
                  placeholder={t('properties.createModal.houseNumberPlaceholder')}
                  value={createForm.houseNumber}
                  onChange={e => setCreateForm({ ...createForm, houseNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <ImageUploader 
                  label={t('properties.createModal.photos')}
                  multiple={true}
                  maxFiles={10}
                  folder="properties"
                  value={createForm.photoUrls}
                  onChange={(urls) => setCreateForm({ ...createForm, photoUrls: Array.isArray(urls) ? urls : [urls] })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowCreateModal(false)}>{t('properties.createModal.cancel')}</button>
                <button type="submit" className="button" disabled={actionLoading || !myStateId || (createForm.ownerType === 'company' && !createForm.ownerId)}>{t('properties.createModal.submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{t('properties.editModal.title')}</h3>
            <form onSubmit={handleUpdateProperty}>
              <div className="form-group">
                <label>{t('properties.editModal.name')}</label>
                <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>{t('properties.editModal.desc')}</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('properties.editModal.claim')}</label>
                <select value={editForm.territoryId} onChange={e => setEditForm({ ...editForm, territoryId: e.target.value })}>
                  <option value="">{t('properties.editModal.noClaim')}</option>
                  {availableEditTerritories.map(tItem => (
                    <option key={tItem.id} value={tItem.id}>
                      {tItem.settlement 
                        ? t('properties.createModal.claimInSettlement', { settlement: tItem.settlement.name, id: `${tItem.minX}, ${tItem.minZ} - ${tItem.maxX}, ${tItem.maxZ}` })
                        : t('properties.createModal.claimStandalone', { id: `${tItem.minX}, ${tItem.minZ} - ${tItem.maxX}, ${tItem.maxZ}` })}
                    </option>
                  ))}
                </select>
                <small>{t('properties.editModal.claimHint')}</small>
              </div>

              <div className="form-group">
                <ImageUploader 
                  label={t('properties.editModal.photos')}
                  multiple={true}
                  maxFiles={10}
                  folder="properties"
                  value={editForm.photoUrls}
                  onChange={(urls) => setEditForm({ ...editForm, photoUrls: Array.isArray(urls) ? urls : [urls] })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowEditModal(false)}>
                  {t('properties.editModal.cancel')}
                </button>
                <button type="submit" className="button" disabled={actionLoading}>
                  {actionLoading ? t('properties.editModal.saving') : t('properties.editModal.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('properties.sellModal.title')}</h3>
            <p className="modal-subtitle" style={{ background: '#f3f4f6', color: '#111827' }}>{t('properties.sellModal.subtitle')}</p>
            <form onSubmit={handleConfirmSell}>
              <div className="form-group">
                <label>{t('properties.sellModal.method')}</label>
                <select value={sellType} onChange={e => setSellType(e.target.value as 'market' | 'direct')} required>
                  <option value="market">{t('properties.sellModal.market')}</option>
                  <option value="direct">{t('properties.sellModal.direct')}</option>
                </select>
              </div>

              {sellType === 'direct' && (
                <div className="form-group">
                  <label>{t('properties.sellModal.selectBuyer')}</label>
                  <select value={forSaleToId} onChange={e => setForSaleToId(e.target.value)} required={sellType === 'direct'}>
                    <option value="">{t('properties.sellModal.selectBuyerPlaceholder')}</option>
                    {eligibleBuyers.map(b => (
                      <option key={b.uuid} value={b.uuid}>{b.username}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t('properties.sellModal.price')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder={t('properties.sellModal.pricePlaceholder')}
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="button button--secondary" onClick={() => setShowSellModal(false)}>
                  {t('properties.sellModal.cancel')}
                </button>
                <button type="submit" className="button" disabled={actionLoading}>
                  {actionLoading ? t('properties.sellModal.listing') : t('properties.sellModal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
