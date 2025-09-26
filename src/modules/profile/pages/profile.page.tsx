import { FC, useEffect, useState } from "react";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { profileService } from "../services/profile.service";
import { GetInfoAboutMeRespone } from "../types/get-info-about-me.response";
import useAuthStore from "../../../store/auth.store";
import "./profile.page.scss";
import { PropagateLoader } from "react-spinners";

const Profile: FC = () => {
  const [info, setInfo] = useState<GetInfoAboutMeRespone | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await profileService.getInfoAboutMe();

        if (!cancelled) {
          setInfo(data);
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
          <h1>Профиль {info?.username}</h1>

          <p>UUID: {info?.uuid.toUpperCase()}</p>
          <p>Почта: {info?.email || "привяжи-почту@почта.ком"}</p>
          <p>
            {info?.emailIsConfirmed
              ? "Почта подтверждена"
              : "Почта не подтверждена"}
          </p>
          <p>Последний айпи: {info?.lastIp || "Никогда не играл(а)"}</p>
          <p onClick={() => logout()}>Logout</p>
        </main>
      )}
    </div>
  );
};

export default Profile;
