import { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import './streets-manager.component.scss';
import { IStreet } from '../../types/states.types';
import { statesService } from '../../services/states.service';

interface StreetsManagerProps {
  settlementId: string;
  isMayorOrAdmin: boolean;
}

const StreetsManager: React.FC<StreetsManagerProps> = ({ settlementId, isMayorOrAdmin }) => {
  const [streets, setStreets] = useState<IStreet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStreetName, setNewStreetName] = useState('');
  const [editingStreetId, setEditingStreetId] = useState<string | null>(null);
  const [editStreetName, setEditStreetName] = useState('');

  const loadStreets = async () => {
    try {
      setLoading(true);
      const data = await statesService.getStreets(settlementId);
      setStreets(data || []);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load streets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (settlementId) {
      loadStreets();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settlementId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreetName.trim()) return;
    try {
      await statesService.createStreet(settlementId, newStreetName);
      setNewStreetName('');
      loadStreets();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || (err as Error).message || 'Ошибка создания улицы');
    }
  };

  const handleUpdate = async (streetId: string) => {
    if (!editStreetName.trim()) return;
    try {
      await statesService.updateStreet(settlementId, streetId, editStreetName);
      setEditingStreetId(null);
      setEditStreetName('');
      loadStreets();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || (err as Error).message || 'Ошибка обновления улицы');
    }
  };

  const handleDelete = async (streetId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту улицу? Вся недвижимость на ней может потерять привязку!')) return;
    try {
      await statesService.deleteStreet(settlementId, streetId);
      loadStreets();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert((err as AxiosError<{message?: string}>).response?.data?.message || (err as Error).message || 'Ошибка удаления улицы');
    }
  };

  if (loading) return <div className="streets-manager">Загрузка улиц...</div>;

  return (
    <div className="streets-manager">
      <h2 className="streets-manager__title">🛣️ Улицы поселения ({streets.length})</h2>
      
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
        <div className="streets-manager__empty">В этом поселении пока нет улиц</div>
      )}
    </div>
  );
};

export default StreetsManager;
