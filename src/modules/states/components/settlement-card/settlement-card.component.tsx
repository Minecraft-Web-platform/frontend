import { FC } from 'react';
import { useNavigate } from 'react-router';
import './settlement-card.component.scss';
import { ISettlement } from '../../types/states.types';

interface SettlementCardProps {
  settlement: ISettlement;
}

const SettlementCard: FC<SettlementCardProps> = ({ settlement }) => {
  const navigate = useNavigate();

  const residentsCount = settlement.citizens?.length || 0;

  const handleClick = () => {
    navigate(`/settlements/${settlement.id}`);
  };

  return (
    <div className="settlement-card" onClick={handleClick}>
      <div className="settlement-card__header">
        {settlement.flagUrl ? (
          <img
            src={settlement.flagUrl}
            alt={`${settlement.name} flag`}
            className="settlement-card__flag"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="settlement-card__flag-placeholder">
            <span>🏛️</span>
          </div>
        )}
        <div className="settlement-card__info">
          <h3 className="settlement-card__title">
            {settlement.name}
            {settlement.status === 'capital' && (
              <span style={{marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: '#eab308', color: '#fff', borderRadius: '4px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>Столица</span>
            )}
            {settlement.status === 'rural' && (
              <span style={{marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: '#22c55e', color: '#fff', borderRadius: '4px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: 'bold'}}>Сельское пос.</span>
            )}
          </h3>
          <span className="settlement-card__mayor">
            {settlement.mayorUsername ? (
              <>
                <img
                  src={`https://minotar.net/helm/${settlement.mayorUsername}/24.png`}
                  alt="mayor"
                  className="settlement-card__mayor-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://minotar.net/helm/MHF_Steve/24.png';
                  }}
                />
                <span>🏛️ {settlement.mayorUsername}</span>
              </>
            ) : (
              <span>🏛️ Без мэра (Выборы)</span>
            )}
          </span>
        </div>
      </div>

      {settlement.description ? (
        <p className="settlement-card__description">{settlement.description}</p>
      ) : (
        <p className="settlement-card__description settlement-card__description--empty">
          Описание поселения пока не указано.
        </p>
      )}

      <div className="settlement-card__footer">
        <div className="settlement-card__stats-group">
          <span className="settlement-card__stat-pill">
            👥 {residentsCount} жит.
          </span>
          <span
            className="settlement-card__stat-pill settlement-card__stat-pill--power"
            title="Экономический вклад поселения в мощь государства"
          >
            ⚡ {residentsCount >= 1 ? '+100 ед.' : '0 ед.'}
          </span>
        </div>
        <span className="settlement-card__more">Подробнее →</span>
      </div>
    </div>
  );
};

export default SettlementCard;
