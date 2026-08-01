import { FC } from 'react';
import { useNavigate } from 'react-router';
import './state-card.component.scss';
import { IState } from '../../types/states.types';

interface StateCardProps {
  state: IState;
}

const StateCard: FC<StateCardProps> = ({ state }) => {
  const navigate = useNavigate();

  const citiesCount = state.cities?.length || 0;
  const citizensCount = state.citizens?.length || 0;
  const firstLetter = state.name ? state.name.charAt(0).toUpperCase() : 'S';

  const handleClick = () => {
    navigate(`/states/${state.id}`);
  };

  return (
    <div className="state-card" onClick={handleClick}>
      <div className="state-card__header">
        {state.flagUrl ? (
          <img
            src={state.flagUrl}
            alt={`${state.name} flag`}
            className="state-card__flag"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="state-card__flag-placeholder">{firstLetter}</div>
        )}
        <div className="state-card__info">
          <h3 className="state-card__title">{state.name}</h3>
          <span className="state-card__leader">
            👑 {state.leaderUsername || 'Без лидера (Выборы)'}
          </span>
        </div>
      </div>

      {state.description && (
        <p className="state-card__description">{state.description}</p>
      )}

      <div className="state-card__footer">
        <div className="state-card__stats">
          <span className="state-card__stat">🏙️ Городов: {citiesCount}</span>
          <span className="state-card__stat">👥 Граждан: {citizensCount}</span>
        </div>
        <span>Подробнее →</span>
      </div>
    </div>
  );
};

export default StateCard;
