import { FC } from "react";
import useSWR from "swr";
import { TerritoriesList } from "../../states/components/territories-list/TerritoriesList";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { profileService } from "../services/profile.service";
import useAuthStore from "../../../store/auth.store";
import "./profile.page.scss";
import { PropagateLoader } from "react-spinners";
import Input from "../../../shared/ui/input/input.component";
import Button from "../../../shared/ui/button/button.component";
import { ImageUploader } from "../../../shared/ui/image-uploader/ImageUploader";
import { useNavigate } from "react-router";
import AchievementsBlock from "../components/achievements-block/achievements-block.component";
import { achievementsService } from "../../achievements/services/achievements.service";

const Profile: FC = () => {
  const { accessToken, logout, setRoleInfo, setBanInfo } = useAuthStore();
  const navigate = useNavigate();

  const { data: info, isLoading: loading, mutate } = useSWR(
    "profile/me",
    () => profileService.getInfoAboutMe(),
    {
      onSuccess: (data) => {
        if (data.role) {
          setRoleInfo(
            data.role,
            data.role === "admin" || data.isAdmin === true,
            data.role === "economist" ||
            data.role === "admin" ||
            data.isEconomist === true
          );
        }
        setBanInfo(data.isBanned || false, data.banReason || null);
      },
    }
  );

  const { data: achievements } = useSWR(
    info?.username ? `achievements/user/${info.username}` : null,
    () => achievementsService.getUserAchievements(info!.username)
  );

  return (
    <div className="profile-page">
      <Sidebar />

      {loading ? (
        <main className="profile content">
          <PropagateLoader color="#000" />
        </main>
      ) : (
        <main className="profile content">
          <div className="profile-with-data">
            <h1>Профиль</h1>
            <p>
              Твой личный уголок. Со временем появится больше данных здесь, а
              пока что режим аскета - любуемся, чем можно.
            </p>
            {info?.isBanned && (
              <div className="ban-banner">
                <h2>Ваш аккаунт заблокирован!</h2>
                <p>Причина: <strong>{info?.banReason || "Не указана"}</strong></p>
                <p>Ваш доступ к функциям сайта ограничен.</p>
              </div>
            )}

            <div className="profile-content">
              <div className="left">
                <Input
                  value={info?.username || ""}
                  placeholder=""
                  label="Никнейм"
                  element="input"
                  disabled
                />

                <Input
                  value={info?.email || "привяжи-почту@почта.ком"}
                  placeholder=""
                  label={`Почта | ${info?.emailIsConfirmed ? "Подтверждена" : "Не подтверждена"
                    }`}
                  element="input"
                  disabled
                />

                <Input
                  value={
                    info?.role === "admin"
                      ? "Администратор"
                      : info?.role === "economist"
                        ? "Экономист"
                        : "Игрок"
                  }
                  placeholder=""
                  label="Роль на проекте"
                  element="input"
                  disabled
                />

                {!info?.isBanned && (
                  <>
                    <Input
                      value={info?.citizenshipName || info?.stateName || "Нет"}
                      placeholder=""
                      label="Гражданство"
                      element="input"
                      disabled
                    />

                    <Input
                      value={info?.settlementName || "Нет"}
                      placeholder=""
                      label="Поселение"
                      element="input"
                      disabled
                    />
                  </>
                )}

                <Input
                  value={info?.lastIp || "Никогда не играл(а)"}
                  placeholder=""
                  label="Последний айпи"
                  element="input"
                  disabled
                />

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={info?.uuid?.toUpperCase() || ""}
                      placeholder=""
                      label="UUID (игрока)"
                      element="input"
                      disabled
                    />
                  </div>
                  <Button
                    callback={() => {
                      navigator.clipboard.writeText(info?.uuid || "");
                      alert("Скопировано!");
                    }}
                    style={{ width: "48px", height: "48px", minWidth: "48px" }}
                  >
                    📋
                  </Button>
                </div>

              </div>

              <div className="right">
                <div className="avatar">
                  {info?.isBanned ? (
                    <img 
                      src={info?.avatar_img ? `${info.avatar_img}?t=${Date.now()}` : "/png/steve-head.png"} 
                      alt="Аватар профиля"
                      style={{ width: "280px", height: "280px", borderRadius: "8px", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageUploader
                      label="Аватар профиля"
                      enableCrop
                      aspect={1}
                      value={info?.avatar_img ? `${info.avatar_img}?t=${Date.now()}` : "/png/steve-head.png"}
                      onChange={(url) => mutate({ ...info!, avatar_img: url as string }, false)}
                      customUploadFn={async (file) => {
                        const { avatarUrl } = await profileService.uploadAvatar(file, accessToken as string);
                        return avatarUrl;
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {!info?.isBanned && (
              <>
                <AchievementsBlock achievements={achievements || []} />

                {info?.uuid && (
                  <TerritoriesList ownerType="player" ownerId={info.uuid} />
                )}
              </>
            )}

            <div className="buttons">
              {!info?.emailIsConfirmed && (
                <Button callback={() => navigate("/email-confirmation")}>
                  Привязать почту
                </Button>
              )}

              <Button callback={() => logout()} secondary>
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
