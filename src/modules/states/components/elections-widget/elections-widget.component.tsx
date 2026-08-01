import { FC, useState } from 'react';
import './elections-widget.component.scss';
import { IElection } from '../../types/states.types';

interface ElectionsWidgetProps {
  election: IElection;
  onVote: (candidateId: string) => Promise<void>;
  onNominate: (programText: string) => Promise<void>;
}

const ElectionsWidget: FC<ElectionsWidgetProps> = ({
  election,
  onVote,
  onNominate,
}) => {
  const [showNominateForm, setShowNominateForm] = useState(false);
  const [programText, setProgramText] = useState('');
  const [loading, setLoading] = useState(false);

  const candidates = election.candidates || [];
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);

  const handleNominateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onNominate(programText);
      setProgramText('');
      setShowNominateForm(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка при выдвижении кандидатуры. Возможно, вы уже выдвинуты.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    try {
      await onVote(candidateId);
    } catch (err) {
      console.error(err);
      alert('Ошибка при голосовании. Возможно, вы уже проголосовали.');
    }
  };

  const getStatusLabel = () => {
    switch (election.status) {
      case 'nomination':
        return { label: 'Этап регистрации кандидатов', className: 'elections-widget__status--nomination' };
      case 'voting':
        return { label: 'Идет голосование', className: 'elections-widget__status--voting' };
      case 'completed':
      default:
        return { label: 'Выборы завершены', className: 'elections-widget__status--completed' };
    }
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="elections-widget">
      <h3 className="elections-widget__title">🗳️ Выборы в органы управления</h3>
      <div className={`elections-widget__status ${statusInfo.className}`}>
        {statusInfo.label}
      </div>
      <p className="elections-widget__subtitle">
        Завершение: {new Date(election.endsAt).toLocaleDateString()}
      </p>

      {candidates.length === 0 ? (
        <p style={{ color: '#a0aec0' }}>Кандидаты еще не выдвинуты.</p>
      ) : (
        <div className="elections-widget__candidates">
          {candidates.map((cand) => {
            const percent = totalVotes > 0 ? Math.round((cand.votesCount / totalVotes) * 100) : 0;
            return (
              <div key={cand.id} className="elections-widget__candidate">
                <div className="elections-widget__candidate-header">
                  <span className="elections-widget__candidate-name">👤 {cand.username}</span>
                  <span className="elections-widget__candidate-votes">
                    {cand.votesCount} голосов ({percent}%)
                  </span>
                </div>
                {cand.programText && (
                  <p className="elections-widget__program">{cand.programText}</p>
                )}
                <div className="elections-widget__bar">
                  <div
                    className="elections-widget__bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {election.status === 'voting' && (
                  <div className="elections-widget__actions">
                    <button
                      className="elections-widget__btn elections-widget__btn--vote"
                      onClick={() => handleVote(cand.id)}
                    >
                      Голосовать за кандидата
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {election.status === 'nomination' && !showNominateForm && (
        <div className="elections-widget__actions">
          <button
            className="elections-widget__btn elections-widget__btn--nominate"
            onClick={() => setShowNominateForm(true)}
          >
            ⭐ Выдвинуть свою кандидатуру
          </button>
        </div>
      )}

      {showNominateForm && (
        <form onSubmit={handleNominateSubmit} style={{ marginTop: 16 }}>
          <textarea
            placeholder="Ваша программа кандидата (почему нужно голосовать за вас)..."
            value={programText}
            onChange={(e) => setProgramText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 80,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: 10,
              color: '#fff',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="elections-widget__btn"
              onClick={() => setShowNominateForm(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="elections-widget__btn elections-widget__btn--nominate"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ElectionsWidget;
