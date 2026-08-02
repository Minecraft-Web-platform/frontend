import { FC } from "react";
import "./agreement.page.scss";
import { useSmartBack } from "../../../../shared/hooks/use-smart-back.hook";
import Button from "../../../../shared/ui/button/button.component";

const AgreementPage: FC = () => {
  const smartBackFn = useSmartBack();

  return (
    <main className="agreement-page">
      <section className="agreement-block">
        <header className="agreement-header">
          <div className="agreement-badge">DOC-2026 // КОНФИДЕНЦИАЛЬНОСТЬ</div>
          <h1>Условия обработки данных</h1>
          <p className="agreement-subtitle">
            Официальное соглашение о сборе, хранении и защите персональной
            информации пользователей игрового проекта «Хроники Края»
          </p>
        </header>

        <div className="agreement-sections">
          <section className="agreement-section-card">
            <div className="section-header">
              <span className="section-num">01</span>
              <h2>Собираемые данные пользователя</h2>
            </div>

            <div className="agreement-grid">
              <div className="agreement-item">
                <span className="item-tag">НИКНЕЙМ И UUID</span>
                <p>
                  Используются для идентификации пользователя на веб-сайте, а
                  также для синхронизации аккаунта с игровым сервером Minecraft.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">ХЭШ ПАРОЛЯ</span>
                <p>
                  Пароль хранится исключительно в зашифрованном виде (хэш). Даже
                  в случае непредвиденной утечки базы данных никто не сможет
                  узнать ваш исходный пароль.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">ЭЛЕКТРОННАЯ ПОЧТА</span>
                <p>
                  Используется для защиты от ботов, сброса пароля и
                  подтверждения критически важных действий. Мы обязуемся{" "}
                  <strong>не отправлять</strong> маркетинговые письма, рекламу
                  или спам.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">РОЛЕВЫЕ (ROLE-PLAY) ДАННЫЕ</span>
                <p>
                  Информация о принадлежности к игровым городам и государствам,
                  участии в выборах, голосовании, а также игровая статистика
                  (дата регистрации, активность, IP-адрес сессии).
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">ЭКОНОМИКА НА САЙТЕ</span>
                <p>
                  Данные об игровых банковских счетах, балансах внутриигровых
                  валют, истории финансовых переводов, банковских картах и
                  владении акциями компаний на бирже.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">OAUTH (GOOGLE АВТОРИЗАЦИЯ)</span>
                <p>
                  При использовании входа через Google-аккаунт из вашего профиля
                  Google извлекается и сохраняется только адрес электронной
                  почты.
                </p>
              </div>
            </div>
          </section>

          <section className="agreement-section-card">
            <div className="section-header">
              <span className="section-num">02</span>
              <h2>Хранение и удаление данных</h2>
            </div>

            <div className="agreement-grid">
              <div className="agreement-item">
                <span className="item-tag">МЕСТОПОЛОЖЕНИЕ СЕРВЕРОВ</span>
                <p>
                  Все персональные данные пользователей хранятся на защищённых
                  серверах, расположенных на территории{" "}
                  <strong>Федеративной Республики Германии</strong>.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">УДАЛЕНИЕ УЧЁТНОЙ ЗАПИСИ</span>
                <p>
                  Вы имеете право удалить учетную запись с сайта в любой момент.
                  Это повлечет за собой «мягкое удаление» данных и безвозвратную
                  потерю игрового прогресса на сайте.
                </p>
              </div>

              <div className="agreement-item">
                <span className="item-tag">«МЯГКОЕ УДАЛЕНИЕ»</span>
                <p>
                  Специальная пометка данных в базе, делающая невозможным их
                  дальнейшее использование. Окончательное безвозвратное удаление
                  происходит автоматически через <strong>1 месяц</strong>.
                </p>
              </div>
            </div>

            <div className="agreement-contact-box">
              <div className="contact-info">
                <h3>Запрос немедленного удаления</h3>
                <p>
                  Пользователь имеет право запросить немедленное полное удаление
                  всех персональных данных в течение 2-х рабочих дней, направив
                  официальный запрос на нашу электронную почту:
                </p>
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
          <p className="agreement-date">
            Последняя редакция: <strong>1 августа 2026 года</strong> • Сервер
            «Хроники Края»
          </p>
          <div className="agreement-back-button">
            <Button callback={smartBackFn}>Назад</Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default AgreementPage;
