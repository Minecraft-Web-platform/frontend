import {  } from 'axios';
import React, { useState } from 'react';
import './EditSettlementModal.scss';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../map-color-picker/MapColorPicker';

import { useEffect } from 'react';
import { statesService } from '../../services/states.service';
import { ISettlementType } from '../../types/states.types';
import { useTranslation } from 'react-i18next';

interface EditSettlementModalProps {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  settlement: any;
  onClose: () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => Promise<void>;
}

export const EditSettlementModal: React.FC<EditSettlementModalProps> = ({ settlement, onClose, onSave }) => {
  const [name, setName] = useState(settlement.name);
  const [description, setDescription] = useState(settlement.description || '');
  const [flagUrl, setFlagUrl] = useState(settlement.flagUrl || '');
  const [images, setImages] = useState<string[]>(settlement.images || []);
  const [color, setColor] = useState<string>(settlement.color || '');
  const [centerX, setCenterX] = useState<string>(settlement.centerX?.toString() || '');
  const [centerZ, setCenterZ] = useState<string>(settlement.centerZ?.toString() || '');
  const [status, setStatus] = useState<'capital' | 'settlement' | 'rural'>(settlement.status || 'settlement');
  const [ruralSubTypeId, setRuralSubTypeId] = useState<string>(settlement.ruralSubTypeId || '');
  const [settlementTypes, setSettlementTypes] = useState<ISettlementType[]>([]);
  const [showProposeTypeModal, setShowProposeTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('states');

  useEffect(() => {
    statesService.getSettlementTypes().then(setSettlementTypes).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ 
        name, description, flagUrl, images, color,
        centerX: centerX ? parseInt(centerX, 10) : undefined,
        centerZ: centerZ ? parseInt(centerZ, 10) : undefined,
        status,
        ruralSubTypeId: status === 'rural' ? ruralSubTypeId : undefined
      });
      onClose();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || t('editSettlement.errors.save'));
    } finally {
      setLoading(false);
    }
  };

  const handleProposeType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      await statesService.proposeSettlementType(newTypeName);
      alert(t('editSettlement.errors.proposeSuccess'));
      setShowProposeTypeModal(false);
      setNewTypeName('');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || t('editSettlement.errors.proposeError'));
    }
  };

  return (
    <div className="edit-settlement-modal-overlay">
      <div className="edit-settlement-modal">
        <h2>{t('editSettlement.title')}</h2>
        {error && <div className="edit-settlement-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="edit-settlement-modal__field">
            <label>{t('editSettlement.nameLabel')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="edit-settlement-modal__field">
            <label>{t('editSettlement.descLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="edit-settlement-modal__field">
            <ImageUploader 
              folder="states/flags"
              label={t('editSettlement.flagLabel')}
              value={flagUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(url: any) => setFlagUrl(url as string)}
            />
          </div>
          <div className="edit-settlement-modal__field">
            <label>{t('editSettlement.colorLabel')}</label>
            <MapColorPicker
              color={color}
              onChange={setColor}
              mode="settlement"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }} className="edit-settlement-modal__field">
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span>{t('editSettlement.xLabel')}</span>
              <input
                type="number"
                value={centerX}
                onChange={(e) => setCenterX(e.target.value)}
                placeholder="0"
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span>{t('editSettlement.zLabel')}</span>
              <input
                type="number"
                value={centerZ}
                onChange={(e) => setCenterZ(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <div className="edit-settlement-modal__field">
            <label>{t('editSettlement.statusLabel')}</label>
            <select
              value={status}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => setStatus(e.target.value as any)}
              required
            >
              <option value="settlement">{t('editSettlement.statusOpts.settlement')}</option>
              <option value="capital">{t('editSettlement.statusOpts.capital')}</option>
              <option value="rural">{t('editSettlement.statusOpts.rural')}</option>
            </select>
          </div>

          {status === 'rural' && (
            <div className="edit-settlement-modal__field">
              <label>{t('editSettlement.subTypeLabel')}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={ruralSubTypeId}
                  onChange={(e) => setRuralSubTypeId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">{t('editSettlement.subTypePlaceholder')}</option>
                  {settlementTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowProposeTypeModal(true)}
                  style={{ padding: '0 10px', whiteSpace: 'nowrap' }}
                >
                  {t('editSettlement.proposeBtn')}
                </button>
              </div>
            </div>
          )}

          <div className="edit-settlement-modal__field">
            <ImageUploader 
              folder="states/settlements"
              label={t('editSettlement.photosLabel')}
              multiple={true}
              maxFiles={5}
              value={images}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(urls: any) => setImages(urls as string[])}
            />
          </div>
          <div className="edit-settlement-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t('editSettlement.cancelBtn')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('editSettlement.loadingBtn') : t('editSettlement.submitBtn')}
            </button>
          </div>
        </form>
      </div>

      {showProposeTypeModal && (
        <div className="edit-settlement-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="edit-settlement-modal" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>{t('editSettlement.proposeModal.title')}</h3>
            <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
              {t('editSettlement.proposeModal.desc')}
            </p>
            <form onSubmit={handleProposeType}>
              <div className="edit-settlement-modal__field">
                <label>{t('editSettlement.proposeModal.nameLabel')}</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t('editSettlement.proposeModal.namePlaceholder')}
                  required
                  minLength={3}
                />
              </div>
              <div className="edit-settlement-modal__actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowProposeTypeModal(false)}
                >
                  {t('editSettlement.proposeModal.cancelBtn')}
                </button>
                <button type="submit" className="btn-save">
                  {t('editSettlement.proposeModal.submitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
