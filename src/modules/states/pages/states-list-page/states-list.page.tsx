import { FC, useEffect, useState } from 'react';
import './states-list.page.scss';
import { IState } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import StateCard from '../../components/state-card/state-card.component';
import useAuthStore from '../../../../store/auth.store';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const StatesListPage: FC = () => {
  const [states, setStates] = useState<IState[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [flagUrl, setFlagUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const { isAdmin } = useAuthStore();

  const loadStates = async () => {
    setLoading(true);
    try {
      const data = await statesService.getStates();
      setStates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await statesService.createState({
        name,
        description,
        flagUrl: flagUrl || undefined,
      });
      setName('');
      setDescription('');
      setFlagUrl('');
      setShowCreateModal(false);
      await loadStates();
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании государства');
    } finally {
      setCreating(false);
    }
  };

  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="states-list-page">
          <div className="states-list-page__hero">
            <div>
              <h1 className="states-list-page__title">🏰 Государства сервера</h1>
              <p className="states-list-page__subtitle">
                Альянсы, королевства и республики, управляемые игроками
              </p>
            </div>

            <div className="states-list-page__controls">
              <input
                type="text"
                className="states-list-page__search"
                placeholder="🔍 Поиск государства..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isAdmin && (
                <button
                  className="states-list-page__create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Создать государство
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="states-list-page__empty">Загрузка государств...</div>
          ) : (
            <div className="states-list-page__grid">
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <StateCard key={state.id} state={state} />
                ))
              ) : (
                <div className="states-list-page__empty">
                  Государства не найдены. Будьте первым, кто оснует великую империю!
                </div>
              )}
            </div>
          )}

          {showCreateModal && (
            <div
              className="states-list-page__modal-backdrop"
              onClick={() => setShowCreateModal(false)}
            >
              <div
                className="states-list-page__modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>🏰 Основание нового государства</h3>
                <form onSubmit={handleCreateState}>
                  <input
                    type="text"
                    placeholder="Название государства*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Описание / история государства..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="Ссылка на герб/флаг (URL)"
                    value={flagUrl}
                    onChange={(e) => setFlagUrl(e.target.value)}
                  />

                  <div className="states-list-page__modal-actions">
                    <button
                      type="button"
                      className="states-list-page__create-btn"
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
                      className="states-list-page__create-btn"
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

export default StatesListPage;
