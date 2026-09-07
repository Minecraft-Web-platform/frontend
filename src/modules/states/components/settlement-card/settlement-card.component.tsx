import { FC } from 'react';
import { useNavigate } from 'react-router';
import './settlement-card.component.scss';
import { ISettlement } from '../../types/states.types';
import { useTranslation } from 'react-i18next';

interface SettlementCardProps {
  settlement: ISettlement;
}

const SettlementCard: FC<SettlementCardProps> = ({ settlement }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('states');

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
              <span style={{marginLeft: '8px', fontSize: '10px', padding: '3px 8px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '12px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>{t('settlementCard.capital')}</span>
            )}
            {settlement.status === 'rural' && (
              <span style={{marginLeft: '8px', fontSize: '10px', padding: '3px 8px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '12px', verticalAlign: 'middle', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>{t('settlementCard.rural')}</span>
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
              <span>{t('settlementCard.noMayor')}</span>
            )}
          </span>
        </div>
      </div>

      {settlement.description ? (
        <p className="settlement-card__description">{settlement.description}</p>
      ) : (
        <p className="settlement-card__description settlement-card__description--empty">
          {t('settlementCard.noDesc')}
        </p>
      )}

      <div className="settlement-card__footer">
        <div className="settlement-card__stats-group">
          <span className="settlement-card__stat-pill">
            {t('settlementCard.residents', { count: residentsCount })}
          </span>
          <span
            className="settlement-card__stat-pill settlement-card__stat-pill--power"
            title={t('settlementCard.powerTitle')}
          >
            {t('settlementCard.powerValue', { count: residentsCount >= 1 ? '+100' : '0' })}
          </span>
        </div>
        <span className="settlement-card__more">{t('settlementCard.moreBtn')}</span>
      </div>
    </div>
  );
};

export default SettlementCard;
