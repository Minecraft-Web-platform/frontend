import { FC, useEffect, useState } from 'react';
import './states-list.page.scss';
import { IState } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import StateCard from '../../components/state-card/state-card.component';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../../components/map-color-picker/MapColorPicker';
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
  const [coatOfArmsUrl, setCoatOfArmsUrl] = useState('');
  const [nationalityMale, setNationalityMale] = useState('');
  const [nationalityFemale, setNationalityFemale] = useState('');
  const [citizenshipName, setCitizenshipName] = useState('');
  const [color, setColor] = useState('');
  const [creating, setCreating] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const loadStates = async () => {
    setLoading(true);
    try {
      const data = await statesService.getStates();
      setStates(data);
    } catch (err: any) {
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
        coatOfArmsUrl: coatOfArmsUrl || undefined,
        nationalityMale: nationalityMale || undefined,
        nationalityFemale: nationalityFemale || undefined,
        citizenshipName: citizenshipName || undefined,
        color: color || undefined,
      });
      setName('');
      setDescription('');
      setFlagUrl('');
      setCoatOfArmsUrl('');
      setNationalityMale('');
      setNationalityFemale('');
      setCitizenshipName('');
      setColor('');
      setShowCreateModal(false);
      await loadStates();
    } catch (err: any) {
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
            <div className="states-list-page__hero-content">
              <div className="states-list-page__title-wrapper">
                <span className="states-list-page__title-icon">🏰</span>
                <h1 className="states-list-page__title">Государства сервера</h1>
              </div>
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
              {isAuthenticated && (
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
                <div className="states-list-page__modal-header">
                  <h3>🏰 Основание нового государства</h3>
                  <div className="states-list-page__tooltip-wrapper">
                    <span className="states-list-page__tooltip-icon">?</span>
                    <div className="states-list-page__tooltip-content">
                      Основание государства позволяет объединять города, 
                      устанавливать налоги и развивать общую экономику.
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateState}>
                  <div className="states-list-page__modal-columns">
                    {/* Left Column */}
                    <div className="states-list-page__modal-col">
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
                        style={{ flex: 1, minHeight: '200px' }}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="states-list-page__modal-col">
                      <div className="states-list-page__modal-images">
                        <div style={{ flex: 1 }}>
                          <ImageUploader 
                            folder="states/flags"
                            label="Флаг (опционально)"
                            value={flagUrl}
                            onChange={(url: any) => setFlagUrl(url as string)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <ImageUploader 
                            folder="states/coats"
                            label="Герб (опционально)"
                            value={coatOfArmsUrl}
                            onChange={(url: any) => setCoatOfArmsUrl(url as string)}
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#64748b', fontWeight: 'bold' }}>Цвет на карте:</label>
                        <MapColorPicker
                          color={color}
                          onChange={setColor}
                          mode="state"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Национальность (муж. род, напр. украинец)"
                        value={nationalityMale}
                        onChange={(e) => setNationalityMale(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Национальность (жен. род, напр. украинка)"
                        value={nationalityFemale}
                        onChange={(e) => setNationalityFemale(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Название гражданства (напр. украинское)"
                        value={citizenshipName}
                        onChange={(e) => setCitizenshipName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="states-list-page__modal-actions">
                    <button
                      type="button"
                      className="states-list-page__create-btn"
                      style={{
                        background: '#e2e8f0',
                        color: '#0f172a',
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
