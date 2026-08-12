import React, { useState, useEffect } from 'react';
import './streets-manager.component.scss';
import { IStreet } from '../../types/states.types';
import { statesService } from '../../services/states.service';

interface StreetsManagerProps {
  cityId: string;
  isMayorOrAdmin: boolean;
}

const StreetsManager: React.FC<StreetsManagerProps> = ({ cityId, isMayorOrAdmin }) => {
  const [streets, setStreets] = useState<IStreet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStreetName, setNewStreetName] = useState('');
  const [editingStreetId, setEditingStreetId] = useState<string | null>(null);
  const [editStreetName, setEditStreetName] = useState('');

  const loadStreets = async () => {
    try {
      setLoading(true);
      const data = await statesService.getStreets(cityId);
      setStreets(data);
    } catch (err) {
      console.error('Failed to load streets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityId) {
      loadStreets();
    }
  }, [cityId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreetName.trim()) return;
    try {
      await statesService.createStreet(cityId, newStreetName);
      setNewStreetName('');
      loadStreets();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Ошибка создания улицы');
    }
  };

  const handleUpdate = async (streetId: string) => {
    if (!editStreetName.trim()) return;
    try {
      await statesService.updateStreet(cityId, streetId, editStreetName);
      setEditingStreetId(null);
      setEditStreetName('');
      loadStreets();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Ошибка обновления улицы');
    }
  };

  const handleDelete = async (streetId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту улицу? Вся недвижимость на ней может потерять привязку!')) return;
    try {
      await statesService.deleteStreet(cityId, streetId);
      loadStreets();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Ошибка удаления улицы');
    }
  };

  if (loading) return <div className="streets-manager">Загрузка улиц...</div>;

  return (
    <div className="streets-manager">
      <h2 className="streets-manager__title">🛣️ Улицы города ({streets.length})</h2>
      
      {isMayorOrAdmin && (
        <form className="streets-manager__create-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Название новой улицы"
            value={newStreetName}
            onChange={(e) => setNewStreetName(e.target.value)}
            className="states-input"
            disabled={!isMayorOrAdmin}
          />
          <button type="submit" className="states-btn states-btn--primary">Создать</button>
        </form>
      )}

      {streets.length > 0 ? (
        <div className="streets-manager__list">
          {streets.map((street) => (
            <div key={street.id} className="streets-manager__item">
              {editingStreetId === street.id ? (
                <div className="streets-manager__edit-mode">
                  <input
                    type="text"
                    value={editStreetName}
                    onChange={(e) => setEditStreetName(e.target.value)}
                    className="states-input"
                    autoFocus
                  />
                  <button className="states-btn states-btn--primary" onClick={() => handleUpdate(street.id)}>Сохранить</button>
                  <button className="states-btn states-btn--secondary" onClick={() => setEditingStreetId(null)}>Отмена</button>
                </div>
              ) : (
                <>
                  <div className="streets-manager__item-name">{street.name}</div>
                  {isMayorOrAdmin && (
                    <div className="streets-manager__item-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditingStreetId(street.id);
                          setEditStreetName(street.name);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(street.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="streets-manager__empty">В этом городе пока нет улиц</div>
      )}
    </div>
  );
};

export default StreetsManager;
