import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './state-detail.page.scss';
import {
  IDiplomacy,
  IElection,
  IState,
  IStateDecree,
} from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CityCard from '../../components/city-card/city-card.component';
import DecreesFeed from '../../components/decrees-feed/decrees-feed.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import DiplomacyBadge from '../../components/diplomacy-badge/diplomacy-badge.component';
import useAuthStore from '../../../../store/auth.store';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const StateDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<IState | null>(null);
  const [decrees, setDecrees] = useState<IStateDecree[]>([]);
  const [diplomacy, setDiplomacy] = useState<IDiplomacy[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAuthStore();
  const canPublishDecree = isAdmin || true; // Allow testing

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [stateData, decreesData, diplomacyData, electionsData] =
        await Promise.all([
          statesService.getStateById(id),
          statesService.getDecrees(id),
          statesService.getDiplomacy(id),
          statesService.getElections('state', id),
        ]);
      setState(stateData);
      setDecrees(decreesData);
      setDiplomacy(diplomacyData);
      setElections(electionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateDecree = async (title: string, content: string) => {
    if (!id) return;
    await statesService.createDecree(id, { title, content });
    const updated = await statesService.getDecrees(id);
    setDecrees(updated);
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    await statesService.voteInElection(electionId, { candidateId });
    if (id) {
      const updated = await statesService.getElections('state', id);
      setElections(updated);
    }
  };

  const handleNominate = async (electionId: string, programText: string) => {
    await statesService.nominateCandidate(electionId, { programText });
    if (id) {
      const updated = await statesService.getElections('state', id);
      setElections(updated);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="state-detail-page">Загрузка паспорта государства...</div>
        </main>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="state-detail-page">
            Государство не найдено.{' '}
            <button
              className="state-detail-page__back"
              onClick={() => navigate('/states')}
            >
              ← Вернуться к списку
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="state-detail-page">
          <button
            className="state-detail-page__back"
            onClick={() => navigate('/states')}
          >
            ← К списку государств
          </button>

          <div className="state-detail-page__hero">
            {state.flagUrl && (
              <img
                src={state.flagUrl}
                alt={`${state.name} flag`}
                className="state-detail-page__flag"
              />
            )}
            <div className="state-detail-page__info">
              <h1 className="state-detail-page__title">{state.name}</h1>
              <div className="state-detail-page__meta">
                <span className="state-detail-page__badge state-detail-page__badge--leader">
                  👑 Правитель: {state.leaderUsername || 'Вакантно (Выборы)'}
                </span>
                <span className="state-detail-page__badge state-detail-page__badge--capital">
                  🏙️ Городов: {state.cities?.length || 0}
                </span>
                <span className="state-detail-page__badge state-detail-page__badge--capital">
                  👥 Граждан: {state.citizens?.length || 0}
                </span>
              </div>
              {state.description && (
                <p className="state-detail-page__desc">{state.description}</p>
              )}
            </div>
          </div>

          {diplomacy.length > 0 && (
            <>
              <h3 className="state-detail-page__section-title">
                🤝 Дипломатические отношения
              </h3>
              <div className="state-detail-page__diplomacy-grid">
                {diplomacy.map((d) => (
                  <div key={d.id} className="state-detail-page__diplomacy-item">
                    <DiplomacyBadge status={d.status} />
                  </div>
                ))}
              </div>
            </>
          )}

          {elections.length > 0 && (
            <>
              <h3 className="state-detail-page__section-title">
                🗳️ Выборы в государстве
              </h3>
              {elections.map((el) => (
                <ElectionsWidget
                  key={el.id}
                  election={el}
                  onVote={(candId) => handleVote(el.id, candId)}
                  onNominate={(progText) => handleNominate(el.id, progText)}
                />
              ))}
            </>
          )}

          <div className="state-detail-page__section-title">
            <span>🏙️ Города государства ({state.cities?.length || 0})</span>
            <button
              className="state-detail-page__btn"
              onClick={() => navigate('/cities')}
            >
              Все города →
            </button>
          </div>

          <div className="state-detail-page__cities-grid">
            {state.cities && state.cities.length > 0 ? (
              state.cities.map((city) => <CityCard key={city.id} city={city} />)
            ) : (
              <p style={{ color: '#a0aec0' }}>
                В этом государстве еще нет основанных городов.
              </p>
            )}
          </div>

          <h3 className="state-detail-page__section-title">
            📜 Официальные указы и новости
          </h3>
          <DecreesFeed
            decrees={decrees}
            canCreate={canPublishDecree}
            onCreateDecree={handleCreateDecree}
          />
        </div>
      </main>
    </div>
  );
};

export default StateDetailPage;
