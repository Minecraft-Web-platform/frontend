import { FC } from "react";
import "./landing.page.scss";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const LandingPage: FC = () => {
  const { t } = useTranslation("landing-page");

  const copyIP = () => {
    navigator.clipboard.writeText("mc.khroniki-kraya.com");
    alert(t("footer.copied"));
  };

  return (
    <>
      <header className="header">
        <h1>{t("intro.title")}</h1>
        <p>{t("intro.subtitle")}</p>

        <Link className="header__link-to-auth" to="/registration">
          {t("intro.play")}
        </Link>

        <a
          className="header__link-to-online-map"
          href="http://5.83.140.252:25900/#world:1949:85:1568:0:-0.8:1.07:0:0:free"
          target="_blank"
          rel="noreferrer"
        >
          {t("intro.onlineMap")}
        </a>
      </header>

      <main className="main">
        <h1>{t("about.heading")}</h1>

        <section className="main__section">
          <img src="/png/creeper.png" className="img-small-left" alt="" />

          <p className="left">
            {t("about.building")}
          </p>

          <img
            src="/png/settlement.png"
            alt="Merida settlement"
            className="img-large-right"
          />
        </section>

        <section className="main__section">
          <img
            src="/png/factory.png"
            alt="factory SteelFactories"
            className="img-large-left"
          />

          <p className="right">
            {t("about.farmingTitle")}
            <br />
            <br />- {t("about.metals")}
            <br />
            <br />- {t("about.stones")}
            <br />
            <br />- {t("about.food")}
          </p>

          <img src="/png/island_1.png" className="img-small-right" alt="" />
        </section>

        <section className="main__section">
          <img src="/png/island_2.png" className="img-small-left" alt="" />

          <p className="left">{t("about.logistics")}</p>

          <img
            src="/png/train.png"
            alt="train station"
            className="img-large-right"
          />
        </section>

        <section className="main__section">
          <img src="/png/party.png" alt="party" className="img-large-left" />

          <p className="right">
            {t("about.frogs")}
          </p>

          <img src="/png/island_3.png" className="img-small-right" alt="" />
        </section>
      </main>

      <footer className="footer">
        <img src="/png/skeleton.png" alt="Skeleton" height={64} />

        <div className="footer__links">
          <span>
            {t("footer.discord")}
            <a href="https://discord.gg/4FZzbqXvZf" target="_blank" rel="noreferrer">
              {t("footer.join")}
            </a>
          </span>

          <span>
            {t("footer.onlineMap")}
            <a href="http://5.83.140.252:25900/#world:1949:85:1568:0:-0.8:1.07:0:0:free" target="_blank" rel="noreferrer">
              {t("footer.openMap")}
            </a>
          </span>

          <span>
            {t("footer.serverIp")}
            <button className="copy-btn" onClick={copyIP}>{t("footer.copy")}</button>
          </span>
        </div>

        <img src="/png/steve.png" alt="Steve" height={64} />
      </footer>
    </>
  );
};

export default LandingPage;
