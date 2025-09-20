// import { Check } from "lucide-react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import "./player-passport.page.scss";
import { useState } from "react";

interface PlayerPassportProps {
  nickname: string;
  name: string;
  surname: string;
  uuid: string;
  email: string;
  citizenship: string;
  city: string;
  avatarUrl?: string;
}

const PlayerPassport = ({
  nickname,
  name,
  surname,
  uuid,
  email,
  citizenship,
  city,
  avatarUrl,
}: PlayerPassportProps) => {
  const { username } = useParams();
  const [player, setPlayer] = useState();

  return (
    <div className="passport-page">
      <Sidebar />

      <main className="passport">
        <h2 className="passport__header">КНЯЖЕСТВО ФРАТЕРА</h2>

        <div className="passport__content">
          <div className="passport__photo">
            {avatarUrl ? (
              <img src={avatarUrl} alt={nickname} />
            ) : (
              <span>Нет фото</span>
            )}
          </div>

          <div className="passport__info">
            <p>
              <span className="label">Никнейм:</span> {username}
            </p>
            <p>
              <span className="label">Имя:</span> {name}
            </p>
            <p>
              <span className="label">Фамилия:</span> {surname}
            </p>
            <p>
              <span className="label">UUID:</span> {uuid}
            </p>
            <p className="passport__email">
              <span className="label">Email:</span> {email}
              <span className="passport__verified">
                {/* <Check size={12} /> */}
              </span>
            </p>
            <p>
              <span className="label">Гражданство:</span> {citizenship}
            </p>
            <p>
              <span className="label">Город:</span> {city}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerPassport;
