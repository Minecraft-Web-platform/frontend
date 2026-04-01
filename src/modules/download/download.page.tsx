import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./download.page.scss";

import Sidebar from "../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../store/auth.store";
import { PropagateLoader } from "react-spinners";
import ModBuilder from "./components/mod-builder.component";
import LangChanger from "../../shared/ui/lang-changer/lang-changer.component";

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
  const { t } = useTranslation('download-page');

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
  }, [accessToken]);

  return (
    <div className="download-page">
      <Sidebar />

      <main className="download-wrapper content">
        <section className="download-launcher">
          <h1>{t('html-elements.download-heading')}</h1>
          <p>
            {t('html-elements.page-description')}
          </p>

          {loading && <PropagateLoader color="#000" />}

          {!loading && (
            <div className="download-launcher__files">
              {osList.map((os) => {
                const meta = launchers?.[os.key];

                if (!meta) {
                  return (
                    <p className="unavailable" key={os.key}>
                      {t('html-elements.unavailable')}
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

       <LangChanger />
    </div>
  );
};

export default DownloadPage;
