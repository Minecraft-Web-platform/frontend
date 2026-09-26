import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./download.page.scss";

import Sidebar from "../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../store/auth.store";
import { PropagateLoader } from "react-spinners";
import ModBuilder from "./components/mod-builder.component";
import { useShallow } from 'zustand/react/shallow';

type LauncherMeta = {
  filename: string;
  size: number;
  sizeMB: number;
  version: string;
  url: string;
};

type LaunchersResponse = Record<string, LauncherMeta>;

const osList: { key: string; label: string; icon: string; ext: string }[] = [
  { key: "windows", label: "Windows", icon: "/svg/windows.svg", ext: ".exe" },
  { key: "mac", label: "macOS", icon: "/svg/macos.svg", ext: ".dmg / .zip" },
  { key: "ubuntu", label: "Ubuntu / Linux", icon: "/svg/linux-ubuntu.svg", ext: ".deb / .jar" },
];

const DownloadPage: FC = () => {
  const [launchers, setLaunchers] = useState<LaunchersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore(useShallow(state => ({ accessToken: state.accessToken })));
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
        {/* Step 1: Launcher Card */}
        <section className="download-launcher">
          <div className="download-launcher__badge">
            🚀 {t('html-elements.step-launcher')}
          </div>
          <h1 className="download-launcher__title">
            {t('html-elements.download-heading')}
          </h1>
          <p className="download-launcher__desc">
            {t('html-elements.page-description')}
          </p>

          {loading ? (
            <div className="download-page__loader">
              <PropagateLoader color="#10b981" />
            </div>
          ) : (
            <div className="download-launcher__files">
              {osList.map((os) => {
                const meta = launchers?.[os.key];

                if (!meta) {
                  return (
                    <div className="download-launcher__os download-launcher__os--disabled" key={os.key}>
                      <img src={os.icon} alt={os.label} className="os-icon" />
                      <div className="download-launcher__os-info">
                        <span className="os-name">{os.label}</span>
                        <span className="os-status">{t('html-elements.unavailable')}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    className="download-launcher__os"
                    key={os.key}
                    href={meta.url}
                    download={meta.filename}
                  >
                    <img src={os.icon} alt={os.label} className="os-icon" />
                    <div className="download-launcher__os-info">
                      <span className="os-name">{os.label}</span>
                      <span className="os-details">
                        {meta.sizeMB ? `${meta.sizeMB} MB` : os.ext}
                      </span>
                    </div>
                    <svg className="download-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 2: Mod Builder Card */}
        <section className="download-mod-pack">
          <ModBuilder />
        </section>
      </main>
    </div>
  );
};

export default DownloadPage;
