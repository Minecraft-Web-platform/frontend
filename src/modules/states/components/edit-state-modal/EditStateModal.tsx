import React, { useState } from 'react';
import './EditStateModal.scss';
import { IState } from '../../types/states.types';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';

interface EditStateModalProps {
  state: IState;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; flagUrl?: string; coatOfArmsUrl?: string }) => Promise<void>;
}

export const EditStateModal: React.FC<EditStateModalProps> = ({ state, onClose, onSave }) => {
  const [name, setName] = useState(state.name);
  const [description, setDescription] = useState(state.description || '');
  const [flagUrl, setFlagUrl] = useState(state.flagUrl || '');
  const [coatOfArmsUrl, setCoatOfArmsUrl] = useState(state.coatOfArmsUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ name, description, flagUrl, coatOfArmsUrl });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-state-modal-overlay">
      <div className="edit-state-modal">
        <h2>Редактирование государства</h2>
        {error && <div className="edit-state-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="edit-state-modal__field">
            <label>Название государства:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="edit-state-modal__field">
            <label>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="edit-state-modal__field">
            <ImageUploader 
              folder="states/flags"
              label="Флаг"
              value={flagUrl}
              onChange={(url: any) => setFlagUrl(url as string)}
            />
          </div>
          <div className="edit-state-modal__field">
            <ImageUploader 
              folder="states/flags"
              label="Герб (если есть)"
              value={coatOfArmsUrl}
              onChange={(url: any) => setCoatOfArmsUrl(url as string)}
            />
          </div>
          <div className="edit-state-modal__actions">
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
