import { FC, useEffect, useState } from "react";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { profileService } from "../services/profile.service";
import { GetInfoAboutMeRespone } from "../types/get-info-about-me.response";
import useAuthStore from "../../../store/auth.store";
import "./profile.page.scss";
import { PropagateLoader } from "react-spinners";
import Input from "../../../shared/ui/input/input.component";
import Button from "../../../shared/ui/button/button.component";
import { useNavigate } from "react-router";

const Profile: FC = () => {
  const [info, setInfo] = useState<GetInfoAboutMeRespone | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { accessToken, logout, setRoleInfo } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await profileService.getInfoAboutMe();

        if (!cancelled) {
          setInfo(data);
          if (data.role) {
            setRoleInfo(
              data.role,
              data.role === "admin" || data.isAdmin === true,
              data.role === "economist" ||
                data.role === "admin" ||
                data.isEconomist === true
            );
          }
        }
      } catch {
        //
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
                  label={`Почта | ${
                    info?.emailIsConfirmed ? "Подтверждена" : "Не подтверждена"
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

                <Input
                  value={info?.citizenshipName || info?.stateName || "Нет"}
                  placeholder=""
                  label="Гражданство"
                  element="input"
                  disabled
                />

                <Input
                  value={info?.cityName || "Нет"}
                  placeholder=""
                  label="Город"
                  element="input"
                  disabled
                />

                <Input
                  value={info?.lastIp || "Никогда не играл(а)"}
                  placeholder=""
                  label="Последний айпи"
                  element="input"
                  disabled
                />

                <Input
                  value={info?.uuid.toUpperCase() as string}
                  placeholder=""
                  label="UUID"
                  element="input"
                  disabled
                />
              </div>

              <div className="right">
                <div className="avatar">
                  <label htmlFor="avatar-upload">
                    <img
                      src={
                        info?.avatar_img
                          ? `${info.avatar_img}?t=${Date.now()}`
                          : "/png/steve-head.png"
                      }
                      alt="avatar"
                      title="Нажми, чтобы изменить аватар"
                      style={{ cursor: "pointer" }}
                    />
                  </label>

                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setLoading(true);
                        const { avatarUrl } = await profileService.uploadAvatar(
                          file,
                          accessToken as string
                        );
                        setInfo((prev) =>
                          prev ? { ...prev, avatarUrl } : prev
                        );
                      } catch (err) {
                        alert("Ошибка загрузки аватара 😢");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

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
