import React, { useState } from 'react';
import './EditCityModal.scss';
import { ICity } from '../../types/states.types';

interface EditCityModalProps {
  city: ICity;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; flagUrl?: string }) => Promise<void>;
}

export const EditCityModal: React.FC<EditCityModalProps> = ({ city, onClose, onSave }) => {
  const [name, setName] = useState(city.name);
  const [description, setDescription] = useState(city.description || '');
  const [flagUrl, setFlagUrl] = useState(city.flagUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ name, description, flagUrl });
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
            <label>URL флага/эмблемы:</label>
            <input
              type="url"
              value={flagUrl}
              onChange={(e) => setFlagUrl(e.target.value)}
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
