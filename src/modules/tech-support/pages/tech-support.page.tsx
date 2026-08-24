import { FC, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profileService } from "../../profile/services/profile.service";
import "./tech-support.page.scss";

import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import Input from "../../../shared/ui/input/input.component";
import Button from "../../../shared/ui/button/button.component";
import { techSupportService } from "../services/tech-support.service";
import { Ticket } from "../types/ticket.type";
import { PropagateLoader } from "react-spinners";

const faqs = [
  {
    q: "Как работает суд?",
    a: "Судебная система позволяет оспорить некачественно оказанные услуги компаниями. В случае спора по заказу, вы можете подать жалобу. Президент государства или Администратор рассмотрит ее и может оформить принудительный возврат средств."
  },
  {
    q: "Меня забанили, что делать?",
    a: "Вы можете подать апелляцию в техподдержку. В теме письма так и укажите — «Апелляция», а в тексте подробно опишите ситуацию. Апелляции рассматриваются техническим администратором в приоритетном порядке."
  },
  {
    q: "Как стать гражданином?",
    a: "Для получения гражданства вам необходимо обратиться к мэру любого города или напрямую к президенту государства. Найти список государств и их лидеров можно на вкладке «Государства» в левом меню."
  },
  {
    q: "Как работает национальная валюта?",
    a: "Национальная валюта выпускается Национальными Банками государств. Каждая валюта имеет свой физический эквивалент — монеты из мода Create Deco (медные, цинковые, золотые). Курс валюты является плавающим и зависит от реального обеспечения ресурсами (алмазами, незеритом) в государственной казне."
  },
  {
    q: "Какой функционал мода Treasury?",
    a: "Мод Treasury — это наша собственная разработка для глубокой интеграции экономики сервера с сайтом. Он добавляет специальные блоки Казны и Банкоматов, через которые игроки могут безопасно «оцифровывать» свои ресурсы (алмазы, золото, незерит и чеканные монеты), моментально зачисляя их на банковский счет на сайте, а также выводить виртуальные средства обратно в игру."
  },
  {
    q: "Как открыть свою компанию?",
    a: "Перейдите во вкладку «Экономика» -> «Компании». Регистрация компании стоит определенную сумму (комиссию) в валюте выбранной юрисдикции. После регистрации вы сможете предоставлять услуги игрокам, получать заказы, а в будущем — выйти на IPO и продавать акции."
  },
  {
    q: "Как купить акции компаний?",
    a: "Перейдите во вкладку «Биржа» (раздел Экономика). Там вы увидите список публичных компаний, которые вышли на IPO. Вы можете покупать и продавать их акции за государственную валюту, а также получать дивиденды от их прибыли."
  },
  {
    q: "Как создать свое государство?",
    a: "Перейдите во вкладку «Государства» и нажмите кнопку создания. Просто заполните форму, придумайте название, выберите флаг и ваше государство будет моментально создано на сайте!"
  },
  {
    q: "Что делать, если я забыл пароль?",
    a: "Перейдите на страницу авторизации и нажмите «Забыли пароль?». На вашу привязанную почту придет ссылка для сброса. Если вы не привязали почту в профиле заранее, восстановить доступ к аккаунту будет практически невозможно."
  },
  {
    q: "Самое главное",
    a: "Весь функционал на сайте создан для удобства и способствует RolePlay-отыгрышу, но он ни в коем случае не запрещает вам придумывать свой собственный RP! Например, судебное дело о неоказании услуг можно полноценно отыграть в игре с судьей и адвокатами, а президент затем просто технически нажмет кнопку на сайте и прикрепит протокол заседания. Пробуйте, балуйтесь и создавайте свою уникальную историю!"
  },
  {
    q: "Я нашел баг или уязвимость (дюп)",
    a: "Ни в коем случае не используйте баги в корыстных целях! Пожалуйста, подробно опишите уязвимость в форме обращения. За репорт критических багов и дюпов предусмотрены эксклюзивные внутриигровые награды и достижения."
  }
];

const TechSupportPage: FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailIsConfirmed, setEmailIsConfirmed] = useState<boolean>(false);
  
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    profileService
      .getInfoAboutMe()
      .then((res) => {
        setUsername(res.username);
        setEmail(res.email);
        setEmailIsConfirmed(res.emailIsConfirmed);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setIsError(false);

    const data: Ticket = {
      username,
      email,
      topic,
      content,
    };

    techSupportService
      .send(data)
      .then(() => {
        setIsSuccess(true);
        setTopic("");
        setContent("");
      })
      .catch(() => setIsError(true))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="tech-support-page">
      <Sidebar />

      <main className="tech-support-main content">
        <div className="tech-support-header">
          <h1>Техническая поддержка</h1>
          <p>Служба помощи и решения проблем сервера "Хроники Края 2.0"</p>
        </div>

        <div className="tech-support-banner">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="banner-content">
            <h3>Проблемы со входом?</h3>
            <p>Убедитесь, что у вас установлена актуальная версия сборки модов.</p>
          </div>
          <div className="banner-action">
            <Button callback={() => navigate("/download")}>Скачать сборку</Button>
          </div>
        </div>

        <div className="tech-support-grid">
          <div className="support-form-card">
            <h2>Отправить обращение</h2>
            
            {isLoading ? (
              <div className="loader-container">
                <PropagateLoader color="#111827" />
              </div>
            ) : isSuccess ? (
              <div className="success-state">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Обращение отправлено!</h3>
                <p>Мы получили ваш тикет. Ответ поступит на привязанную почту <b>{email}</b> в ближайшее время.</p>
                <Button callback={() => setIsSuccess(false)} secondary>Написать еще</Button>
              </div>
            ) : !email || !emailIsConfirmed ? (
              <div className="email-warning-state">
                <div className="warning-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3>Требуется привязка почты</h3>
                <p>Для создания обращений в техподдержку необходимо привязать и подтвердить email адрес, чтобы мы могли отправить вам ответ.</p>
                <Button callback={() => navigate("/profile")}>Перейти в Профиль</Button>
              </div>
            ) : (
              <form onSubmit={onSubmitHandler}>
                {isError && (
                  <div className="error-message">
                    Произошла ошибка при отправке. Попробуйте позже.
                  </div>
                )}
                <div className="form-group">
                  <Input
                    value={username}
                    placeholder=""
                    element="input"
                    label="Ваш никнейм"
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <Input
                    value={topic}
                    setValue={setTopic}
                    placeholder="Например: Проблема с оплатой"
                    element="input"
                    label="Тема обращения"
                  />
                </div>
                <div className="form-group">
                  <Input
                    value={content}
                    setValue={setContent}
                    placeholder="Подробно опишите вашу проблему..."
                    element="textarea"
                    label="Текст обращения"
                  />
                </div>
                <Button disabled={isSubmitting || !topic.trim() || !content.trim()}>
                  {isSubmitting ? "Отправка..." : "Отправить"}
                </Button>
              </form>
            )}
          </div>

          <div className="support-faq-card">
            <h2>Частые вопросы</h2>
            <div className="faq-list">
              {faqs.map((faq, idx) => (
                <details key={idx} className="faq-item">
                  <summary className="faq-question">
                    {faq.q}
                    <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechSupportPage;
