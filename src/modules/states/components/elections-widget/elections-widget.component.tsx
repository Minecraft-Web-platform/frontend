import {  } from 'axios';
import { FC, useState } from 'react';
import './elections-widget.component.scss';
import { IElection } from '../../types/states.types';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('states');

  const candidates = election.candidates || [];
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);

  const handleNominateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onNominate(programText);
      setProgramText('');
      setShowNominateForm(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(t('elections.errors.nominate'));
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    try {
      await onVote(candidateId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(t('elections.errors.vote'));
    }
  };

  const getStatusLabel = () => {
    switch (election.status) {
      case 'nomination':
        return { label: t('elections.statuses.nomination'), className: 'elections-widget__status--nomination' };
      case 'voting':
        return { label: t('elections.statuses.voting'), className: 'elections-widget__status--voting' };
      case 'completed':
      default:
        return { label: t('elections.statuses.completed'), className: 'elections-widget__status--completed' };
    }
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="elections-widget">
      <h3 className="elections-widget__title">{t('elections.title')}</h3>
      <div className={`elections-widget__status ${statusInfo.className}`}>
        {statusInfo.label}
      </div>
      <p className="elections-widget__subtitle">
        {t('elections.endsAt')} {new Date(election.endsAt).toLocaleDateString()}
      </p>

      {candidates.length === 0 ? (
        <p style={{ color: '#718096', fontStyle: 'italic', padding: '10px 0' }}>{t('elections.noCandidates')}</p>
      ) : (
        <div className="elections-widget__candidates">
          {candidates.map((cand) => {
            const percent = totalVotes > 0 ? Math.round((cand.votesCount / totalVotes) * 100) : 0;
            return (
              <div key={cand.id} className="elections-widget__candidate">
                <div className="elections-widget__candidate-header">
                  <span className="elections-widget__candidate-name">👤 {cand.username}</span>
                  <span className="elections-widget__candidate-votes">
                    {cand.votesCount}{t('elections.votes')}{percent}{t('elections.percent')}
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
                <div className="elections-widget__actions">
                  {election.status === 'voting' ? (
                    <button
                      className="elections-widget__btn elections-widget__btn--vote"
                      onClick={() => handleVote(cand.id)}
                    >
                      {t('elections.voteBtn')}
                    </button>
                  ) : election.status === 'nomination' ? (
                    <button
                      className="elections-widget__btn"
                      style={{ background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                      disabled
                      title={t('elections.unavailableTitle')}
                    >
                      {t('elections.unavailableBtn')}
                    </button>
                  ) : null}
                </div>
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
            {t('elections.nominateTitle')}
          </button>
        </div>
      )}

      {showNominateForm && (
        <form onSubmit={handleNominateSubmit} className="elections-widget__form">
          <textarea
            className="elections-widget__textarea"
            placeholder={t('elections.programPlaceholder')}
            value={programText}
            onChange={(e) => setProgramText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="elections-widget__btn elections-widget__btn--cancel"
              onClick={() => setShowNominateForm(false)}
            >
              {t('elections.cancelBtn')}
            </button>
            <button
              type="submit"
              className="elections-widget__btn elections-widget__btn--nominate"
              disabled={loading}
            >
              {loading ? t('elections.loadingBtn') : t('elections.submitBtn')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ElectionsWidget;
