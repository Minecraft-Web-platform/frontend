import { FC, useEffect, useState } from "react";
import "./download.page.scss";

import Sidebar from "../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../store/auth.store";
import { PropagateLoader } from "react-spinners";
import ModBuilder from "./components/mod-builder.component";

type LauncherMeta = {
  filename: string;
  size: number;
  sizeMB: number;
  version: string;
  url: string;
};

type LaunchersResponse = Record<string, LauncherMeta>;

const osList: { key: string; label: string; icon: string }[] = [
  { key: "windows", label: "Windows", icon: "/svg/windows.svg" },
  { key: "mac", label: "macOS", icon: "/svg/macos.svg" },
  { key: "ubuntu", label: "Ubuntu", icon: "/svg/linux-ubuntu.svg" },
];

const DownloadPage: FC = () => {
  const [launchers, setLaunchers] = useState<LaunchersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    fetch(import.meta.env.VITE_BACKEND_URL + "/launchers/meta", config)
      .then((res) => res.json())
      .then((data: LaunchersResponse) => {
        setLaunchers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="download-page">
      <Sidebar />

      <main className="download-wrapper content">
        <section className="download-launcher">
          <h1>Скачай лаунчер</h1>
          <p>
            С помощью Legacy Launcher ты сможешь скачать выбранную версию
            Minecraft, быстро открыть папку для модов и начать игру.
          </p>

          {loading && <PropagateLoader color="#000" />}

          {!loading && (
            <div className="download-launcher__files">
              {osList.map((os) => {
                const meta = launchers?.[os.key];

                if (!meta) {
                  return (
                    <p className="unavailable" key={os.key}>
                      Недоступно
                    </p>
                  );
                }

                return (
                  <a
                    className="download-launcher__os"
                    key={os.key}
                    href={meta.url}
                    download={meta.filename}
                  >
                    <span>{os.label}</span>
                    <img src={os.icon} alt={os.label} />
                    <span>{meta.sizeMB}MB</span>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <section className="download-mod-pack">
          <ModBuilder />
        </section>
      </main>
    </div>
  );
};

export default DownloadPage;
