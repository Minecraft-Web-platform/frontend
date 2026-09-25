import { FC } from "react";
import "./agreement.page.scss";
import { useSmartBack } from "../../../../shared/hooks/use-smart-back.hook";
import Button from "../../../../shared/ui/button/button.component";
import { useTranslation } from "react-i18next";

const AgreementPage: FC = () => {
  const smartBackFn = useSmartBack();
  const { t } = useTranslation('auth');

  return (
    <main className="agreement-page">
      <section className="agreement-block">
        <header className="agreement-header">
          <div className="agreement-badge">{t("agreement-page.badge")}</div>
          <h1>{t("agreement-page.title")}</h1>
          <p className="agreement-subtitle">{t("agreement-page.subtitle")}</p>
        </header>

        <div className="agreement-sections">
          <section className="agreement-section-card">
            <div className="section-header">
              <span className="section-num">01</span>
              <h2>{t("agreement-page.sections.collectedData.title")}</h2>
            </div>

            <div className="agreement-grid">
              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.nickname.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.nickname.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.password.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.password.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.email.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.email.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.roleplay.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.roleplay.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.economy.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.economy.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.collectedData.items.oauth.tag")}</span>
                <p>{t("agreement-page.sections.collectedData.items.oauth.text")}</p>
              </div>
            </div>
          </section>

          <section className="agreement-section-card">
            <div className="section-header">
              <span className="section-num">02</span>
              <h2>{t("agreement-page.sections.storage.title")}</h2>
            </div>

            <div className="agreement-grid">
              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.storage.items.location.tag")}</span>
                <p>{t("agreement-page.sections.storage.items.location.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.storage.items.deletion.tag")}</span>
                <p>{t("agreement-page.sections.storage.items.deletion.text")}</p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">{t("agreement-page.sections.storage.items.softDelete.tag")}</span>
                <p>{t("agreement-page.sections.storage.items.softDelete.text")}</p>
              </div>
            </div>

            <div className="agreement-contact-box">
              <div className="contact-info">
                <h3>{t("agreement-page.contact.title")}</h3>
                <p>{t("agreement-page.contact.text")}</p>
              </div>
              <a
                className="contact-email-btn"
                href="mailto:oleksandr.shtonda.dev@gmail.com"
              >
                oleksandr.shtonda.dev@gmail.com
              </a>
            </div>
          </section>
        </div>

        <footer className="agreement-footer">
          <p className="agreement-date">{t("agreement-page.footer.revision")}</p>
          <div className="agreement-back-button">
            <Button callback={smartBackFn}>{t("agreement-page.footer.back")}</Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default AgreementPage;
