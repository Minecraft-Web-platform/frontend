import React, { useEffect, useState } from 'react';
import { statesService } from '../../services/states.service';
import './TerritoriesList.scss';

interface Territory {
  id: string;
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  ownerType: string;
  ownerId: string;
  isHiddenOnMap: boolean;
}

interface TerritoriesListProps {
  ownerType: 'player' | 'company' | 'settlement' | 'state';
  ownerId: string;
}

export const TerritoriesList: React.FC<TerritoriesListProps> = ({ ownerType, ownerId }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTerritories = async () => {
    setLoading(true);
    try {
      const allTerritories = await statesService.getTerritories();
      // Filter territories by owner on the frontend for now
      const filtered = allTerritories.filter(
        (t) => t.ownerType === ownerType && String(t.ownerId) === String(ownerId)
      );
      setTerritories(filtered);
    } catch (e) {
      console.error('Failed to fetch territories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerritories();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, ownerId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите безвозвратно удалить этот приват?')) return;
    try {
      await statesService.deleteTerritoryWeb(id);
      fetchTerritories();
    } catch (e) {
      alert('Ошибка при удалении привата');
      console.error(e);
    }
  };

  const handleToggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      await statesService.toggleTerritoryVisibility(id, !currentHidden);
      fetchTerritories();
    } catch (e) {
      alert('Ошибка при изменении видимости');
      console.error(e);
    }
  };

  if (loading) return <div>Загрузка территорий...</div>;

  return (
    <div className="territories-list-container">
      <h2 className="territories-title">Управление территориями (Приваты)</h2>
      {territories.length === 0 ? (
        <p className="no-territories">У вас пока нет зарегистрированных приватов.</p>
      ) : (
        <div className="territories-grid">
          {territories.map((t) => {
            const area = Math.abs(t.maxX - t.minX) * Math.abs(t.maxZ - t.minZ);
            return (
              <div key={t.id} className="territory-card">
                <div className="card-header">
                  <span className="card-id" title={t.id}>
                    ID: {t.id.split('-')[0]}
                  </span>
                  <button className="btn-delete" onClick={() => handleDelete(t.id)}>
                    Удалить
                  </button>
                </div>
                
                <div className="card-body">
                  <p><strong>Координаты:</strong> X: {t.minX}..{t.maxX} | Z: {t.minZ}..{t.maxZ}</p>
                  <p><strong>Площадь:</strong> {area} блоков²</p>
                </div>
                
                <div className="card-footer">
                  <label className="visibility-switch">
                    <input
                      type="checkbox"
                      checked={!t.isHiddenOnMap}
                      onChange={() => handleToggleVisibility(t.id, t.isHiddenOnMap)}
                    />
                    <span>Отображать на карте</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
