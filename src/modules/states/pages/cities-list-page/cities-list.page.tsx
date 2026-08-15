import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './cities-list.page.scss';
import { ICity, IState } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CityCard from '../../components/city-card/city-card.component';
import useAuthStore from '../../../../store/auth.store';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const CitiesListPage: FC = () => {
  const [searchParams] = useSearchParams();
  const [cities, setCities] = useState<ICity[]>([]);
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
  const [creating, setCreating] = useState(false);

  const { isAdmin } = useAuthStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const [citiesData, statesData] = await Promise.all([
        statesService.getCities(selectedStateId || undefined),
        statesService.getStates(),
      ]);
      setCities(citiesData);
      setStates(statesData);
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
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [selectedStateId]);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await statesService.createCity({
        name,
        description,
        flagUrl: flagUrl || undefined,
        stateId: stateId || undefined,
      });
      setName('');
      setDescription('');
      setFlagUrl('');
      setStateId('');
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при создании города');
    } finally {
      setCreating(false);
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="cities-list-page">
          <div className="cities-list-page__hero">
            <div>
              <h1 className="cities-list-page__title">🏙️ Города сервера</h1>
              <p className="cities-list-page__subtitle">
                Столицы, мегаполисы и крепости, основанные гражданами
              </p>
            </div>

            <div className="cities-list-page__controls">
              <input
                type="text"
                className="cities-list-page__search"
                placeholder="🔍 Поиск города..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="cities-list-page__select"
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
                  className="cities-list-page__create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Создать город
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="cities-list-page__empty">Загрузка городов...</div>
          ) : (
            <div className="cities-list-page__grid">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => <CityCard key={city.id} city={city} />)
              ) : (
                <div className="cities-list-page__empty">
                  Города не найдены. Создайте первый город на сервере!
                </div>
              )}
            </div>
          )}

          {showCreateModal && (
            <div
              className="cities-list-page__modal-backdrop"
              onClick={() => setShowCreateModal(false)}
            >
              <div
                className="cities-list-page__modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>🏙️ Основание нового города</h3>
                <form onSubmit={handleCreateCity}>
                  <input
                    type="text"
                    placeholder="Название города*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Описание города / архитектурный стиль..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="Ссылка на герб (URL)"
                    value={flagUrl}
                    onChange={(e) => setFlagUrl(e.target.value)}
                  />
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

                  <div className="cities-list-page__modal-actions">
                    <button
                      type="button"
                      className="cities-list-page__create-btn"
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
                      className="cities-list-page__create-btn"
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

export default CitiesListPage;
