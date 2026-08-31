import { httpFactoryService } from "../../../shared/services/http-factory.service";
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
import { statesService } from "../../states/services/states.service";
import { ISettlementType } from "../../states/types/states.types";

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
    a: "Для получения гражданства вам необходимо обратиться к мэру любого поселения или напрямую к президенту государства. Найти список государств и их лидеров можно на вкладке «Государства» в левом меню."
  },
  {
    q: "Как работает национальная валюта?",
    a: "Национальная валюта выпускается Национальными Банками государств. Каждая валюта имеет свой физический эквивалент — монеты из мода Create Deco (медные, цинковые, золотые). Курс валюты является плавающим и зависит от реального обеспечения ресурсами (алмазами, незеритом) в государственной казне."
  },
  {
    q: "Как создать свою компанию?",
    a: "Перейдите в раздел «Экономика», откройте вкладку со списком компаний и нажмите «Создать компанию». Заполните форму, указав название, юридический адрес (ваше государство) и первоначальный бюджет."
  },
  {
    q: "Как торговать акциями на бирже?",
    a: "Каждая публичная компания выпускает акции. Вы можете покупать их в разделе «Фондовая биржа», отслеживая графики изменения цен. Акции можно перепродавать другим игрокам или получать по ним дивиденды, если компания решит их выплатить."
  },
  {
    q: "Зачем нужны достижения?",
    a: "Достижения (ачивки) выдаются за вашу активность на сервере и на сайте. Они отображаются в вашем публичном профиле и повышают ваш престиж в глазах других игроков. Некоторые редкие достижения могут давать уникальные статусы."
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
  },
  {
    q: "В чем разница между городом, столицей и сельским поселением?",
    a: "Столица — главный населенный пункт государства, в котором расположена резиденция президента (в государстве может быть только одна столица). Город — крупный самостоятельный населенный пункт. Сельское поселение — небольшое поселение (деревня, хутор и т.д.), для которого при основании можно выбрать специальный подвид."
  },
  {
    q: "Как изменить статус поселения на Столицу?",
    a: "Назначить столицу может только лидер (президент) государства. Для этого перейдите на страницу нужного города или сельского поселения в вашем государстве и нажмите кнопку «Сделать столицей»."
  },
  {
    q: "Как добавить свой подвид сельского поселения?",
    a: "Если при основании сельского поселения вы не нашли подходящего подвида в списке (например, вы строите «Аул» или «Форт»), нажмите кнопку «+ Предложить свой». Напишите название, и оно отправится на модерацию. Как только администратор одобрит вашу заявку, этот подвид станет доступен всем игрокам сервера!"
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
  
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [pendingTypes, setPendingTypes] = useState<ISettlementType[]>([]);

  const loadPendingTypes = () => {
    statesService.getSettlementTypes(true)
      .then(types => setPendingTypes(types.filter(t => !t.isApproved)))
      .catch(console.error);
  };

  useEffect(() => {
    profileService
      .getInfoAboutMe()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        setUsername(res.username);
        setEmail(res.email);
        setEmailIsConfirmed(res.emailIsConfirmed);
        if (res.role === 'admin' || res.isAdmin) {
          setIsAdmin(true);
          loadPendingTypes();
        }
      })
      .finally(() => setIsLoading(false));

    httpFactoryService.createHttpService().get('/server/ping')
      .then((res: any) => setIsOnline(res.running))
      .catch(() => setIsOnline(false));
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

  const handleModerateType = async (id: string, isApproved: boolean) => {
    try {
      await statesService.moderateSettlementType(id, isApproved);
      alert(`Подвид успешно ${isApproved ? 'одобрен' : 'отклонен'}!`);
      loadPendingTypes();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Ошибка модерации');
    }
  };

  return (
    <div className="tech-support-page">
      <Sidebar />

      <main className="tech-support-main content">
        <div className="tech-support-header">
          <h1>Техническая поддержка</h1>
          <p>Служба помощи и решения проблем сервера "Хроники Края 2.0"</p>
        </div>

        <div className="server-status-banner" style={{ display: 'flex', alignItems: 'center', background: isOnline === true ? 'rgba(34, 197, 94, 0.1)' : isOnline === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(150,150,150,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${isOnline === true ? 'rgba(34, 197, 94, 0.3)' : isOnline === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(150,150,150,0.3)'}` }}>
          <div style={{ marginRight: '16px', display: 'flex' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isOnline === true ? '#22c55e' : isOnline === false ? '#ef4444' : '#888', boxShadow: isOnline === true ? '0 0 10px rgba(34, 197, 94, 0.5)' : isOnline === false ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none' }}></div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Статус сервера: {isOnline === true ? 'Онлайн' : isOnline === false ? 'Оффлайн' : 'Загрузка...'}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>{isOnline === true ? 'Сервер работает стабильно, вы можете зайти и играть.' : isOnline === false ? 'Сервер в данный момент недоступен. Возможны технические работы.' : 'Проверка состояния сервера...'}</p>
          </div>
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

          {isAdmin && (
            <div className="support-faq-card" style={{ marginTop: '20px' }}>
              <h2>Модерация типов поселений</h2>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Пользователи могут предлагать новые подвиды сельских поселений. Здесь вы можете их одобрить или отклонить.
              </p>
              {pendingTypes.length === 0 ? (
                <p>Нет ожидающих модерации подвидов.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingTypes.map((type) => (
                    <div key={type.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <div>
                        <strong>{type.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>Предложил: {type.proposedByUsername || 'Неизвестно'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button callback={() => handleModerateType(type.id, true)} style={{ padding: '5px 15px', fontSize: '14px', background: '#22c55e' }}>Одобрить</Button>
                        <Button callback={() => handleModerateType(type.id, false)} secondary style={{ padding: '5px 15px', fontSize: '14px', color: '#ef4444', borderColor: '#ef4444' }}>Отклонить</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="support-faq-card" style={{ marginTop: isAdmin ? '20px' : '0' }}>
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
