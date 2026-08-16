import "./player-passport.component.scss";
import { PlayerType } from "../types/player.type";

interface PlayerPassportProps {
  player: PlayerType;
}

const normalizeDate = (dateToNormalize: string): string => {
  const date = new Date(dateToNormalize);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const formatted = `${day}.${month}.${year}`;

  return formatted;
};

const PlayerPassportComponent = ({ player }: PlayerPassportProps) => {
  return (
    <div
      className={`passport ${
        player.stateFlagUrl ? "passport--with-flag" : ""
      }`}
    >
      {player.stateFlagUrl && (
        <div
          className="passport__bg-flag"
          style={{
            backgroundImage: `url(${player.stateFlagUrl})`,
          }}
        />
      )}
      <h2 className="passport__header">
        {player.stateName || "Мир Хроники Края"}
      </h2>

      <div className="passport__content">
        <div className="passport__photo">
          {player.avatar_img ? (
            <img src={player.avatar_img} alt={player.username} />
          ) : (
            <span>Нет фото</span>
          )}
        </div>

        <div className="passport__info">
          <p>
            <span className="label">Никнейм:</span> {player.username}
          </p>

          <p>
            <span className="label">Роль:</span>{" "}
            {player.role === "admin" ? "Администратор" : "Игрок"}
          </p>

          <p>
            <span className="label">UUID:</span> {player.uuid}
          </p>
          <p>
            <span className="label">Гражданство:</span>{" "}
            {player.citizenshipName || player.stateName || "-"}
          </p>
          <p>
            <span className="label">Город:</span>{" "}
            {player.cityName || "-"}
          </p>
          <p>
            <span className="label">Улица:</span> -
          </p>
          <p>
            <span className="label">Дом:</span> -
          </p>
          <p>
            <span className="label">Выдано:</span>{" "}
            {normalizeDate(player.registrationDate)}
          </p>
          <p>
            <span className="label">Действителен до:</span> 01.10.2028
          </p>
        </div>
      </div>

      <div className="passport__emblem">
        {player.stateCoatOfArmsUrl ? (
          <img
            src={player.stateCoatOfArmsUrl}
            alt={player.stateName || "Coat of arms"}
          />
        ) : player.stateFlagUrl ? (
          <img
            src={player.stateFlagUrl}
            alt={player.stateName || "Flag"}
          />
        ) : null}
      </div>
    </div>
  );
};

export default PlayerPassportComponent;
