
import "./player-passport.component.scss";
import { PlayerType } from "../types/player.type";
import { useTranslation } from "react-i18next";

interface PlayerPassportProps {
  player: PlayerType;
}



const PlayerPassportComponent = ({ player }: PlayerPassportProps) => {
  const { t } = useTranslation("players");
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
      <div className="passport__header">
        {player.stateName || t("players.passport.defaultState")}
      </div>
      <div className="passport__content">
        <div className="passport__photo">
          {player.avatar_img ? (
            <img src={player.avatar_img} alt={player.username} />
          ) : (
            <span>{t("players.passport.noPhoto")}</span>
          )}
        </div>

        <div className="passport__info">
          <div className="detail-row">
            <span className="label">{t("players.passport.nickname")}</span> {player.username}
          </div>
          <div className="detail-row">
            <span className="label">{t("players.passport.role")}</span>{" "}
            {player.role === "admin" ? t("players.passport.roleAdmin") : t("players.passport.rolePlayer")}
          </div>

          <div className="detail-row">
            <span className="label">{t("players.passport.citizenship")}</span>{" "}
            {player.stateName || "-"}
          </div>
          <div className="detail-row">
            <span className="label">{t("players.passport.settlement")}</span>{" "}
            {player.settlementName || "-"}
          </div>
          <div className="detail-row">
            <span className="label">{t("players.passport.street")}</span> -
          </div>
          <div className="detail-row">
            <span className="label">{t("players.passport.house")}</span> -
          </div>
          <div className="detail-row" style={{ marginTop: "10px" }}>
            <span className="label">{t("players.passport.issued")}</span>{" "}
            {new Date().toLocaleDateString('ru-RU')}
          </div>
          <div className="detail-row">
            <span className="label">{t("players.passport.validUntil")}</span> 01.10.2028
          </div>
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
