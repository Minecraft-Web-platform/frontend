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
  const firstLetter = city.name ? city.name.charAt(0).toUpperCase() : 'C';

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
          <div className="city-card__flag-placeholder">{firstLetter}</div>
        )}
        <div className="city-card__info">
          <h3 className="city-card__title">{city.name}</h3>
          <span className="city-card__mayor">
            🏛️ {city.mayorUsername || 'Без мэра (Выборы)'}
          </span>
        </div>
      </div>

      {city.description && (
        <p className="city-card__description">{city.description}</p>
      )}

      <div className="city-card__footer">
        <span className="city-card__stat">👥 Жителей: {residentsCount}</span>
        <span>Подробнее →</span>
      </div>
    </div>
  );
};

export default CityCard;
