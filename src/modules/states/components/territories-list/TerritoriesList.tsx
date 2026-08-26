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
  ownerType: 'player' | 'company' | 'city' | 'state';
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
        (t) => t.ownerType === ownerType && t.ownerId === ownerId
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
    <div className="territories-list">
      <h3>Управление территориями (Приваты)</h3>
      {territories.length === 0 ? (
        <p className="no-territories">У вас пока нет приватов.</p>
      ) : (
        <table className="territories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Координаты</th>
              <th>Площадь</th>
              <th>Отображение на карте</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {territories.map((t) => {
              const area = Math.abs(t.maxX - t.minX) * Math.abs(t.maxZ - t.minZ);
              return (
                <tr key={t.id}>
                  <td>
                    <span className="territory-id" title={t.id}>
                      {t.id.split('-')[0]}...
                    </span>
                  </td>
                  <td>
                    X: {t.minX}..{t.maxX} | Z: {t.minZ}..{t.maxZ}
                  </td>
                  <td>{area} блоков²</td>
                  <td>
                    <label className="visibility-switch">
                      <input
                        type="checkbox"
                        checked={!t.isHiddenOnMap}
                        onChange={() => handleToggleVisibility(t.id, t.isHiddenOnMap)}
                      />
                      <span>Видимый</span>
                    </label>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(t.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
