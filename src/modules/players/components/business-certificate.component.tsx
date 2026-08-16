import "./business-certificate.component.scss";
import { PlayerType } from "../types/player.type";

interface BusinessCertificateProps {
  player: PlayerType;
  companiesCount: number;
}

const normalizeDate = (dateToNormalize: string): string => {
  if (!dateToNormalize) return "-";
  const date = new Date(dateToNormalize);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
};

const BusinessCertificateComponent = ({ player, companiesCount }: BusinessCertificateProps) => {
  return (
    <div className="business-certificate">
      <div className="certificate-header">
        <div className="emblem">
           {player.stateCoatOfArmsUrl ? (
             <img src={player.stateCoatOfArmsUrl} alt="Coat of arms" />
           ) : (
             <div className="emblem-placeholder">⚖️</div>
           )}
        </div>
        <div className="header-text">
          <h3>Министерство Экономики</h3>
          <p>{player.stateName || "Государственный Реестр"}</p>
        </div>
      </div>

      <div className="certificate-body">
        <h2>СВИДЕТЕЛЬСТВО</h2>
        <p className="subtitle">О РЕГИСТРАЦИИ В КАЧЕСТВЕ ПРЕДПРИНИМАТЕЛЯ</p>

        <div className="info-row">
          <span className="label">Настоящее свидетельство подтверждает, что гражданин</span>
          <strong className="value highlighted">{player.username}</strong>
        </div>

        <div className="info-row">
          <span className="label">Идентификационный номер (UUID):</span>
          <span className="value monospace">{player.uuid}</span>
        </div>

        <div className="info-row">
          <span className="label">Зарегистрированных компаний:</span>
          <span className="value">{companiesCount}</span>
        </div>

        <div className="info-row">
          <span className="label">Дата первичной регистрации:</span>
          <span className="value">{normalizeDate(player.registrationDate)}</span>
        </div>

        <div className="seal-area">
          <div className="stamp">
            <div className="stamp-inner">ЗАРЕГИСТРИРОВАНО</div>
          </div>
          <div className="signature">
             <div className="line"></div>
             <span>Подпись регистратора</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCertificateComponent;
