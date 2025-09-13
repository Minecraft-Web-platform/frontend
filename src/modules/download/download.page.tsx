import { FC } from "react";
import "./download.page.scss";

import ModBuilder from "./components/mod-builder.component";

const DownloadPage: FC = () => {
  return (
    <div className="download-page">
      <section className="download-launcher">
        <h1>Скачай лаунчер</h1>

        <div className="download-launcher__files">
          <div className="download-launcher__os">
            <span>Windows</span>

            <img src="/svg/windows.svg" />
          </div>

          <div className="download-launcher__os">
            <span>macOS</span>

            <img src="/svg/macos.svg" />
          </div>

          <div className="download-launcher__os">
            <span>Ubuntu</span>

            <img src="/svg/linux-ubuntu.svg" />
          </div>

          <div className="download-launcher__os">
            <span>Jar</span>

            <img src="/svg/java.svg" />
          </div>
        </div>
      </section>

      <section className="download-mod-pack">
        <ModBuilder />
      </section>
    </div>
  );
};

export default DownloadPage;
