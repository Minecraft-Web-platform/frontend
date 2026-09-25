import {  } from 'axios';
import React, { useState } from 'react';
import './EditStateModal.scss';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../map-color-picker/MapColorPicker';
import { useTranslation } from 'react-i18next';

interface EditStateModalProps {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; flagUrl?: string; coatOfArmsUrl?: string; color?: string }) => Promise<void>;
}

export const EditStateModal: React.FC<EditStateModalProps> = ({ state, onClose, onSave }) => {
  const [name, setName] = useState(state.name);
  const [description, setDescription] = useState(state.description || '');
  const [flagUrl, setFlagUrl] = useState(state.flagUrl || '');
  const [coatOfArmsUrl, setCoatOfArmsUrl] = useState(state.coatOfArmsUrl || '');
  const [color, setColor] = useState<string>(state.color || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('states');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ name, description, flagUrl, coatOfArmsUrl, color });
      onClose();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || t('editState.errors.save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-state-modal-overlay">
      <div className="edit-state-modal">
        <h2>{t('editState.title')}</h2>
        {error && <div className="edit-state-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="edit-state-modal__field">
            <label>{t('editState.nameLabel')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="edit-state-modal__field">
            <label>{t('editState.descLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="edit-state-modal__field">
            <ImageUploader 
              folder="states/flags"
              label={t('editState.flagLabel')}
              value={flagUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(url: any) => setFlagUrl(url as string)}
            />
          </div>
          <div className="edit-state-modal__field">
            <ImageUploader 
              folder="states/flags"
              label={t('editState.emblemLabel')}
              value={coatOfArmsUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(url: any) => setCoatOfArmsUrl(url as string)}
            />
          </div>
          <div className="edit-state-modal__field">
            <label>{t('editState.colorLabel')}</label>
            <MapColorPicker
              color={color}
              onChange={setColor}
              mode="state"
            />
          </div>
          <div className="edit-state-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t('editState.cancelBtn')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('editState.loadingBtn') : t('editState.submitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
