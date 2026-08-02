import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './city-detail.page.scss';
import {
  ICitizenshipRequest,
  ICity,
  IElection,
} from '../../types/states.types';
import { statesService } from '../../services/states.service';
import CitizenshipRequestsModal from '../../components/citizenship-requests-modal/citizenship-requests-modal.component';
import ElectionsWidget from '../../components/elections-widget/elections-widget.component';
import useAuthStore from '../../../../store/auth.store';
import { profileService } from '../../../profile/services/profile.service';
import Sidebar from '../../../../shared/ui/sidebar/sidebar.component';

const CityDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [city, setCity] = useState<ICity | null>(null);
  const [requests, setRequests] = useState<ICitizenshipRequest[]>([]);
  const [elections, setElections] = useState<IElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const { isAuthenticated, isAdmin } = useAuthStore();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      profileService
        .getInfoAboutMe()
        .then((res) => setCurrentUsername(res.username))
        .catch(() => setCurrentUsername(null));
    } else {
      setCurrentUsername(null);
    }
  }, [isAuthenticated]);

  const isMayor =
    Boolean(city?.mayorUsername) &&
    Boolean(currentUsername) &&
    city?.mayorUsername?.toLowerCase() === currentUsername?.toLowerCase();

  const isMayorOrAdmin = Boolean(isMayor) || isAdmin;

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cityData, requestsData, electionsData] = await Promise.all([
        statesService.getCityById(id),
        statesService.getRequests(id),
        statesService.getElections('city', id),
      ]);
      setCity(cityData);
      setRequests(requestsData);
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

  const handleApplyForCitizenship = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await statesService.createRequest(id, { cityId: id });
      alert('Ваша заявка на заселение успешно отправлена мэру города!');
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert('Не удалось отправить заявку. Возможно, у вас уже есть активная заявка в этот город.');
    } finally {
      setApplying(false);
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!id) return;
    await statesService.reviewRequest(id, requestId, { status });
    await loadData();
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    await statesService.voteInElection(electionId, { candidateId });
    if (id) {
      const updated = await statesService.getElections('city', id);
      setElections(updated);
    }
  };

  const handleNominate = async (electionId: string, programText: string) => {
    await statesService.nominateCandidate(electionId, { programText });
    if (id) {
      const updated = await statesService.getElections('city', id);
      setElections(updated);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="city-detail-page">Загрузка паспорта города...</div>
        </main>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="city-detail-page">
            Город не найден.{' '}
            <button
              className="city-detail-page__back"
              onClick={() => navigate('/cities')}
            >
              ← Вернуться к списку
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="city-detail-page">
          <button
            className="city-detail-page__back"
            onClick={() => navigate('/cities')}
          >
            ← К списку городов
          </button>

          <div className="city-detail-page__hero">
            {city.flagUrl && (
              <img
                src={city.flagUrl}
                alt={`${city.name} flag`}
                className="city-detail-page__flag"
              />
            )}
            <div className="city-detail-page__info">
              <h1 className="city-detail-page__title">{city.name}</h1>
              <div className="city-detail-page__meta">
                <span className="city-detail-page__badge city-detail-page__badge--mayor">
                  🏛️ Мэр города: {city.mayorUsername || 'Вакантно (Выборы)'}
                </span>
                {city.state && (
                  <span
                    className="city-detail-page__badge city-detail-page__badge--state"
                    onClick={() => navigate(`/states/${city.state?.id}`)}
                  >
                    🏰 Государство: {city.state.name}
                  </span>
                )}
                <span className="city-detail-page__badge city-detail-page__badge--mayor">
                  👥 Жителей: {city.citizens?.length || 0}
                </span>
              </div>

              {city.description && (
                <p className="city-detail-page__desc">{city.description}</p>
              )}

              <div className="city-detail-page__actions">
                <button
                  className="city-detail-page__btn city-detail-page__btn--primary"
                  onClick={handleApplyForCitizenship}
                  disabled={applying}
                >
                  {applying ? 'Отправка...' : '🏠 Подать заявку на проживание'}
                </button>
                {isMayorOrAdmin && (
                  <button
                    className="city-detail-page__btn city-detail-page__btn--secondary"
                    onClick={() => setShowRequestsModal(true)}
                  >
                    📬 Заявки на заселение ({pendingCount})
                  </button>
                )}
              </div>
            </div>
          </div>

          {elections.length > 0 && (
            <>
              <h3 className="city-detail-page__section-title">
                🗳️ Выборы Мэра в городе
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

          <h3 className="city-detail-page__section-title">
            👥 Жители города ({city.citizens?.length || 0})
          </h3>
          <div className="city-detail-page__citizens-grid">
            {city.citizens && city.citizens.length > 0 ? (
              city.citizens.map((citizen) => (
                <div key={citizen.id} className="city-detail-page__citizen">
                  <div className="city-detail-page__citizen-avatar">👤</div>
                  <span>{citizen.username}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#a0aec0' }}>
                В этом городе пока нет официально зарегистрированных жителей.
              </p>
            )}
          </div>

          {showRequestsModal && (
            <CitizenshipRequestsModal
              requests={requests}
              onClose={() => setShowRequestsModal(false)}
              onReview={handleReviewRequest}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CityDetailPage;
