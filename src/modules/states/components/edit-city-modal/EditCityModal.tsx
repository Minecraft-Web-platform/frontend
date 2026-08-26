import React, { useState } from 'react';
import './EditCityModal.scss';
import { ICity } from '../../types/states.types';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../map-color-picker/MapColorPicker';

interface EditCityModalProps {
  city: any; // ICity is imported, wait, let me just keep ICity
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; flagUrl?: string; images?: string[]; color?: string }) => Promise<void>;
}

export const EditCityModal: React.FC<EditCityModalProps> = ({ city, onClose, onSave }) => {
  const [name, setName] = useState(city.name);
  const [description, setDescription] = useState(city.description || '');
  const [flagUrl, setFlagUrl] = useState(city.flagUrl || '');
  const [images, setImages] = useState<string[]>(city.images || []);
  const [color, setColor] = useState<string>(city.color || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ name, description, flagUrl, images, color });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-city-modal-overlay">
      <div className="edit-city-modal">
        <h2>Редактирование города</h2>
        {error && <div className="edit-city-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="edit-city-modal__field">
            <label>Название города:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="edit-city-modal__field">
            <label>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="edit-city-modal__field">
            <ImageUploader 
              folder="states/flags"
              label="Флаг/Эмблема"
              value={flagUrl}
              onChange={(url: any) => setFlagUrl(url as string)}
            />
          </div>
          <div className="edit-city-modal__field">
            <label>Цвет территории на карте:</label>
            <MapColorPicker
              color={color}
              onChange={setColor}
              mode="city"
            />
          </div>
          <div className="edit-city-modal__field">
            <ImageUploader 
              folder="states/cities"
              label="Фотографии города (до 5 шт.)"
              multiple={true}
              maxFiles={5}
              value={images}
              onChange={(urls: any) => setImages(urls as string[])}
            />
          </div>
          <div className="edit-city-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
