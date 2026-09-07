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
import { useTranslation } from "react-i18next";

const Profile: FC = () => {
  const { accessToken, logout, setRoleInfo, setBanInfo } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation('profile');

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
            <h1>{t("profile-page.title")}</h1>
            <p>
              {t("profile-page.description")}
            </p>
            {info?.isBanned && (
              <div className="ban-banner">
                <h2>{t("profile-page.bannedTitle")}</h2>
                <p>{t("profile-page.banReason")} <strong>{info?.banReason || t("profile-page.banReasonNotSpecified")}</strong></p>
                <p>{t("profile-page.banDescription")}</p>
              </div>
            )}

            <div className="profile-content">
              <div className="left">
                <Input
                  value={info?.username || ""}
                  placeholder=""
                  label={t("profile-page.nickname")}
                  element="input"
                  disabled
                />

                <Input
                  value={info?.email || t("profile-page.emailPlaceholder")}
                  placeholder=""
                  label={`${t("profile-page.email")} | ${info?.emailIsConfirmed ? t("profile-page.emailConfirmed") : t("profile-page.emailNotConfirmed")}`}
                  element="input"
                  disabled
                />

                <Input
                  value={
                    info?.role === "admin"
                      ? t("profile-page.roleAdmin")
                      : info?.role === "economist"
                        ? t("profile-page.roleEconomist")
                        : t("profile-page.rolePlayer")
                  }
                  placeholder=""
                  label={t("profile-page.role")}
                  element="input"
                  disabled
                />

                {!info?.isBanned && (
                  <>
                    <Input
                      value={info?.citizenshipName || info?.stateName || t("profile-page.none")}
                      placeholder=""
                      label={t("profile-page.citizenship")}
                      element="input"
                      disabled
                    />

                    <Input
                      value={info?.settlementName || t("profile-page.none")}
                      placeholder=""
                      label={t("profile-page.settlement")}
                      element="input"
                      disabled
                    />
                  </>
                )}

                <Input
                  value={info?.lastIp || t("profile-page.neverPlayed")}
                  placeholder=""
                  label={t("profile-page.lastIp")}
                  element="input"
                  disabled
                />

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={info?.uuid?.toUpperCase() || ""}
                      placeholder=""
                      label={t("profile-page.uuid")}
                      element="input"
                      disabled
                    />
                  </div>
                  <Button
                    callback={() => {
                      navigator.clipboard.writeText(info?.uuid || "");
                      alert(t("profile-page.copied"));
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
                      alt={t("profile-page.avatar")}
                      style={{ width: "280px", height: "280px", borderRadius: "8px", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageUploader
                      label={t("profile-page.avatar")}
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
                  {t("profile-page.bindEmail")}
                </Button>
              )}

              <Button callback={() => logout()} secondary>
                {t("profile-page.logout")}
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
