import {  } from 'axios';
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './settlements-list.page.scss';
import { ISettlement, IState, ISettlementType } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import SettlementCard from '../../components/settlement-card/settlement-card.component';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../../components/map-color-picker/MapColorPicker';
import useAuthStore from '../../../../store/auth.store';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const SettlementsListPage: FC = () => {
  const [searchParams] = useSearchParams();
  const [settlements, setSettlements] = useState<ISettlement[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<string>(
    searchParams.get('stateId') || '',
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [flagUrl, setFlagUrl] = useState('');
  const [stateId, setStateId] = useState('');
  const [color, setColor] = useState('');
  const [status, setStatus] = useState<'settlement' | 'rural'>('settlement');
  const [ruralSubTypeId, setRuralSubTypeId] = useState('');
  const [settlementTypes, setSettlementTypes] = useState<ISettlementType[]>([]);
  const [creating, setCreating] = useState(false);

  const { isAdmin } = useAuthStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const [settlementsData, statesData, typesData] = await Promise.all([
        statesService.getSettlements(selectedStateId || undefined),
        statesService.getStates(),
        statesService.getSettlementTypes()
      ]);
      setSettlements(settlementsData);
      setStates(statesData);
      setSettlementTypes(typesData);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramStateId = searchParams.get('stateId');
    if (paramStateId !== null && paramStateId !== selectedStateId) {
      setSelectedStateId(paramStateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId]);

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await statesService.createSettlement({
        name,
        description,
        flagUrl: flagUrl || undefined,
        stateId: stateId || undefined,
        color: color || undefined,
        status,
        ruralSubTypeId: status === 'rural' ? ruralSubTypeId : undefined
      });
      setName('');
      setDescription('');
      setFlagUrl('');
      setStateId('');
      setColor('');
      setStatus('settlement');
      setRuralSubTypeId('');
      setShowCreateModal(false);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при создании поселения');
    } finally {
      setCreating(false);
    }
  };

  const filteredSettlements = settlements.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="settlements-list-page">
          <div className="settlements-list-page__hero">
            <div>
              <h1 className="settlements-list-page__title">🏙️ Поселения сервера</h1>
              <p className="settlements-list-page__subtitle">
                Столицы, мегаполисы и крепости, основанные гражданами
              </p>
            </div>

            <div className="settlements-list-page__controls">
              <input
                type="text"
                className="settlements-list-page__search"
                placeholder="🔍 Поиск поселения..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="settlements-list-page__select"
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
              >
                <option value="">Все государства</option>
                {states.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
              {isAdmin && (
                <button
                  className="settlements-list-page__create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Создать поселение
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="settlements-list-page__empty">Загрузка поселений...</div>
          ) : (
            <div className="settlements-list-page__grid">
              {filteredSettlements.length > 0 ? (
                filteredSettlements.map((settlement) => <SettlementCard key={settlement.id} settlement={settlement} />)
              ) : (
                <div className="settlements-list-page__empty">
                  Поселения не найдены. Создайте первый поселение на сервере!
                </div>
              )}
            </div>
          )}

          {showCreateModal && (
            <div
              className="settlements-list-page__modal-backdrop"
              onClick={() => setShowCreateModal(false)}
            >
              <div
                className="settlements-list-page__modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>🏙️ Основание нового поселения</h3>
                <form onSubmit={handleCreateSettlement}>
                  <input
                    type="text"
                    placeholder="Название поселения*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Описание поселения / архитектурный стиль..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div style={{ marginBottom: '15px' }}>
                    <ImageUploader 
                      folder="states/flags"
                      label="Эмблема/Флаг"
                      value={flagUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(url: any) => setFlagUrl(url as string)}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Цвет на карте:</label>
                    <MapColorPicker
                      color={color}
                      onChange={setColor}
                      mode="settlement"
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <select
                      value={status}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="settlement">Поселение</option>
                      <option value="rural">Сельское поселение</option>
                    </select>
                  </div>
                  {status === 'rural' && (
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={ruralSubTypeId}
                        onChange={(e) => setRuralSubTypeId(e.target.value)}
                        required={status === 'rural'}
                      >
                        <option value="">Выберите подвид...</option>
                        {settlementTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <select
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                  >
                    <option value="">Выбрать государство (опционально)</option>
                    {states.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>

                  <div className="settlements-list-page__modal-actions">
                    <button
                      type="button"
                      className="settlements-list-page__create-btn"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                      }}
                      onClick={() => setShowCreateModal(false)}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="settlements-list-page__create-btn"
                      disabled={creating}
                    >
                      {creating ? 'Основание...' : 'Основать'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettlementsListPage;
