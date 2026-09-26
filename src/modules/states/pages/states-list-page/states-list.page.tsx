import {  } from 'axios';
import { FC, useEffect, useState } from 'react';
import './states-list.page.scss';
import { IState } from '../../types/states.types';
import { statesService } from '../../services/states.service';
import StateCard from '../../components/state-card/state-card.component';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';
import { MapColorPicker } from '../../components/map-color-picker/MapColorPicker';
import useAuthStore from '../../../../store/auth.store';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';


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

  const { isAuthenticated } = useAuthStore(useShallow(state => ({ isAuthenticated: state.isAuthenticated })));
  const { t } = useTranslation('states');

  const loadStates = async () => {
    setLoading(true);
    try {
      const data = await statesService.getStates();
      setStates(data);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(t('states-list.createModal.error'));
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
                <h1 className="states-list-page__title">{t('states-list.hero.title')}</h1>
              </div>
              <p className="states-list-page__subtitle">
                {t('states-list.hero.subtitle')}
              </p>
            </div>

            <div className="states-list-page__controls">
              <input
                type="text"
                className="states-list-page__search"
                placeholder={t('states-list.controls.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isAuthenticated && (
                <button
                  className="states-list-page__create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  {t('states-list.controls.create')}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="states-list-page__empty states-list-page__empty--loading">
              <div className="states-list-page__empty-icon-wrap">
                <span className="states-list-page__empty-icon">⏳</span>
              </div>
              <h3 className="states-list-page__empty-title">{t('states-list.empty.loading')}</h3>
            </div>
          ) : (
            <div className="states-list-page__grid">
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <StateCard key={state.id} state={state} />
                ))
              ) : (
                <div className="states-list-page__empty">
                  <div className="states-list-page__empty-icon-wrap">
                    <span className="states-list-page__empty-icon">{search.trim() ? '🔍' : '🏰'}</span>
                  </div>
                  <h3 className="states-list-page__empty-title">
                    {search.trim()
                      ? t('states-list.empty.searchNotFound')
                      : t('states-list.empty.notFoundTitle')}
                  </h3>
                  <p className="states-list-page__empty-desc">
                    {search.trim()
                      ? t('states-list.empty.searchNotFoundDesc')
                      : t('states-list.empty.notFoundDesc')}
                  </p>
                  {search.trim() ? (
                    <button
                      type="button"
                      className="states-list-page__empty-action-btn states-list-page__empty-action-btn--secondary"
                      onClick={() => setSearch('')}
                    >
                      {t('states-list.empty.resetSearch')}
                    </button>
                  ) : isAuthenticated && (
                    <button
                      type="button"
                      className="states-list-page__empty-action-btn"
                      onClick={() => setShowCreateModal(true)}
                    >
                      {t('states-list.controls.create')}
                    </button>
                  )}
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
                  <h3>{t('states-list.createModal.title')}</h3>
                  <div className="states-list-page__tooltip-wrapper">
                    <span className="states-list-page__tooltip-icon">?</span>
                    <div className="states-list-page__tooltip-content">
                      {t('states-list.createModal.tooltip')}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateState}>
                  <div className="states-list-page__modal-columns">
                    {/* Left Column */}
                    <div className="states-list-page__modal-col">
                      <input
                        type="text"
                        placeholder={t('states-list.createModal.inputs.name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <textarea
                        placeholder={t('states-list.createModal.inputs.description')}
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
                            label={t('states-list.createModal.inputs.flag')}
                            value={flagUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(url: any) => setFlagUrl(url as string)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <ImageUploader 
                            folder="states/coats"
                            label={t('states-list.createModal.inputs.coat')}
                            value={coatOfArmsUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(url: any) => setCoatOfArmsUrl(url as string)}
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('states-list.createModal.inputs.color')}</label>
                        <MapColorPicker
                          color={color}
                          onChange={setColor}
                          mode="state"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder={t('states-list.createModal.inputs.nationalityMale')}
                        value={nationalityMale}
                        onChange={(e) => setNationalityMale(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder={t('states-list.createModal.inputs.nationalityFemale')}
                        value={nationalityFemale}
                        onChange={(e) => setNationalityFemale(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder={t('states-list.createModal.inputs.citizenshipName')}
                        value={citizenshipName}
                        onChange={(e) => setCitizenshipName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="states-list-page__modal-actions">
                    <button
                      type="button"
                      className="states-list-page__cancel-btn"
                      onClick={() => setShowCreateModal(false)}
                    >
                      {t('states-list.createModal.buttons.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="states-list-page__create-btn"
                      disabled={creating}
                    >
                      {creating ? t('states-list.createModal.buttons.creating') : t('states-list.createModal.buttons.submit')}
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
