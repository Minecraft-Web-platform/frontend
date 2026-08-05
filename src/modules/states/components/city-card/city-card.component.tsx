import { FC } from 'react';
import { useNavigate } from 'react-router';
import './city-card.component.scss';
import { ICity } from '../../types/states.types';

interface CityCardProps {
  city: ICity;
}

const CityCard: FC<CityCardProps> = ({ city }) => {
  const navigate = useNavigate();

  const residentsCount = city.citizens?.length || 0;

  const handleClick = () => {
    navigate(`/cities/${city.id}`);
  };

  return (
    <div className="city-card" onClick={handleClick}>
      <div className="city-card__header">
        {city.flagUrl ? (
          <img
            src={city.flagUrl}
            alt={`${city.name} flag`}
            className="city-card__flag"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="city-card__flag-placeholder">
            <span>🏛️</span>
          </div>
        )}
        <div className="city-card__info">
          <h3 className="city-card__title">{city.name}</h3>
          <span className="city-card__mayor">
            {city.mayorUsername ? (
              <>
                <img
                  src={`https://minotar.net/helm/${city.mayorUsername}/24.png`}
                  alt="mayor"
                  className="city-card__mayor-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://minotar.net/helm/MHF_Steve/24.png';
                  }}
                />
                <span>🏛️ {city.mayorUsername}</span>
              </>
            ) : (
              <span>🏛️ Без мэра (Выборы)</span>
            )}
          </span>
        </div>
      </div>

      {city.description ? (
        <p className="city-card__description">{city.description}</p>
      ) : (
        <p className="city-card__description city-card__description--empty">
          Описание города пока не указано.
        </p>
      )}

      <div className="city-card__footer">
        <div className="city-card__stats-group">
          <span className="city-card__stat-pill">
            👥 {residentsCount} жит.
          </span>
          <span
            className="city-card__stat-pill city-card__stat-pill--power"
            title="Экономический вклад города в мощь государства"
          >
            ⚡ {residentsCount >= 1 ? '+100 ед.' : '0 ед.'}
          </span>
        </div>
        <span className="city-card__more">Подробнее →</span>
      </div>
    </div>
  );
};

export default CityCard;
