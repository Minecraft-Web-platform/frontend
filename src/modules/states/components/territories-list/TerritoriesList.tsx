import React, { useEffect, useState } from 'react';
import { statesService } from '../../services/states.service';

import { useTranslation } from 'react-i18next';
import './TerritoriesList.scss';

interface TerritoriesListProps {
  ownerType: 'player' | 'company' | 'settlement' | 'state';
  ownerId: string;
}

export const TerritoriesList: React.FC<TerritoriesListProps> = ({ ownerType, ownerId }) => {
  const [territories, setTerritories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('states');

  const fetchTerritories = async () => {
    setLoading(true);
    try {
      const allTerritories = await statesService.getTerritories();
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
    if (!window.confirm(t('territories.confirmDelete'))) return;
    try {
      await statesService.deleteTerritoryWeb(id);
      fetchTerritories();
    } catch (e) {
      alert(t('territories.errors.delete'));
      console.error(e);
    }
  };

  const handleToggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      await statesService.toggleTerritoryVisibility(id, !currentHidden);
      fetchTerritories();
    } catch (e) {
      alert(t('territories.errors.visibility'));
      console.error(e);
    }
  };

  if (loading) return <div>{t('territories.loading')}</div>;

  return (
    <div className="territories-list-container">
      <h2 className="territories-title">{t('territories.title')}</h2>
      {territories.length === 0 ? (
        <p className="no-territories">{t('territories.empty')}</p>
      ) : (
        <div className="territories-grid">
          {territories.map((tItem) => {
            const area = Math.abs(tItem.maxX - tItem.minX) * Math.abs(tItem.maxZ - tItem.minZ);
            return (
              <div key={tItem.id} className="territory-card">
                <div className="card-header">
                  <span className="card-id" title={tItem.id}>
                    ID: {tItem.id.split('-')[0]}
                  </span>
                  <button className="btn-delete" onClick={() => handleDelete(tItem.id)}>
                    {t('territories.deleteBtn')}
                  </button>
                </div>
                
                <div className="card-body">
                  <p><strong>{t('territories.coords')}:</strong> X: {tItem.minX}..{tItem.maxX} | Z: {tItem.minZ}..{tItem.maxZ}</p>
                  <p><strong>{t('territories.area')}:</strong> {area} {t('territories.blocks')}</p>
                </div>
                
                <div className="card-footer">
                  <label className="visibility-switch">
                    <input
                      type="checkbox"
                      checked={!tItem.isHiddenOnMap}
                      onChange={() => handleToggleVisibility(tItem.id, tItem.isHiddenOnMap)}
                    />
                    <span>{t('territories.displayOnMap')}</span>
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
