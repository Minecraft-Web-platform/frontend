import { useParams } from "react-router-dom";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import "./player-passport.page.scss";
import { useEffect, useState } from "react";
import { PlayerType } from "../types/player.type";
import { playersService } from "../services/players.service";

/**
 *
 * @description Normalizes date 2025-09-30T14:47:04.512Z into 30.09.2025
 * @returns
 */
const normalizeDate = (dateToNormalize: string): string => {
  const date = new Date(dateToNormalize);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const formatted = `${day}.${month}.${year}`;

  return formatted;
};

const PlayerPassport = () => {
  const { username } = useParams();
  const [player, setPlayer] = useState<PlayerType | null>(null);

  useEffect(() => {
    playersService
      .getByUsername(username as string)
      .then((res) => setPlayer(res));
  }, [username]);

  return (
    <div className="passport-page">
      <Sidebar />

      <main className="passport-wrapper content">
        <div className="passport">
          {player ? (
            <>
              <h2 className="passport__header">Мир Хроники Края</h2>

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
                    <span className="label">Никнейм:</span> {username}
                  </p>

                  <p>
                    <span className="label">UUID:</span> {player.uuid}
                  </p>
                  <p>
                    <span className="label">Гражданство:</span> -
                  </p>
                  <p>
                    <span className="label">Город:</span> -
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
            </>
          ) : (
            <p>Загрузка...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlayerPassport;
