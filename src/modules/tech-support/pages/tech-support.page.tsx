import { FC, FormEvent, useEffect, useState } from "react";
import { profileService } from "../../profile/services/profile.service";
import "./tech-support.page.scss";

import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import Input from "../../../shared/ui/input/input.component";
import Button from "../../../shared/ui/button/button.component";
import { techSupportService } from "../services/tech-support.service";
import { Ticket } from "../types/ticket.type";
import { PropagateLoader } from "react-spinners";

const TechSupportPage: FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    profileService
      .getInfoAboutMe()
      .then((res) => {
        setUsername(res.username);
        // TODO: remove it after test
        setEmail("oleksandrshtonda@gmail.com");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data: Ticket = {
      username,
      email,
      topic,
      content,
    };

    techSupportService
      .send(data)
      .catch(() => setStatus("Что-то пошло не так :/"))
      .finally(() => {
        setTopic("");
        setContent("");
        setStatus("");
      });
  };

  return (
    <div className="tech-support-page">
      <Sidebar />

      <main className="tech-support-main content">
        <h1>Техподдержка</h1>
        <p>{status}</p>
        <p>Контактная форма для связи с техническим администратором</p>

        {isLoading ? (
          <PropagateLoader
            style={{ display: "block", marginTop: 20 }}
            color="#000"
          />
        ) : (
          <form onSubmit={(e) => onSubmitHandler(e)}>
            <Input
              value={username}
              placeholder=""
              element="input"
              label="Никнейм"
              disabled={true}
            />

            <Input
              value={topic}
              setValue={setTopic}
              placeholder=""
              element="input"
              label="Тема обращения"
            />

            <Input
              value={content}
              setValue={setContent}
              placeholder=""
              element="textarea"
              label="Обращение"
            />

            {email ? (
              <Button>Отправить</Button>
            ) : (
              <Button disabled={true} secondary={true}>
                Ты должен привязать почту чтобы тут что-то делать
              </Button>
            )}
          </form>
        )}
      </main>
    </div>
  );
};

export default TechSupportPage;
