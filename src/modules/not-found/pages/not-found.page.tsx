import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./not-found.page.scss";
import Button from "../../../shared/ui/button/button.component";

let timerId: number = 0;

const NotFoundPage: FC = () => {
  const [seconds, setSeconds] = useState<number>(10);
  const secondsWord =
    seconds === 1
      ? "секунду"
      : seconds >= 2 && seconds <= 4
        ? "секунды"
        : "секунд";
  const navigate = useNavigate();

  function timer() {
    return setInterval(() => setSeconds((prev) => prev - 1), 1000);
  }

  useEffect(() => {
    timerId = timer();

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      navigate("/profile");
    }
  }, [seconds]);

  return (
    <main className="not-found-page">
      <div className="info-block">
        <h1>404</h1>

        <p>
          Ой... Ты забрёл куда-то не туда... Не переживай, ты будешь
          перенаправлен на свой профиль через {seconds} {secondsWord} :)
        </p>

        <Button callback={() => navigate("/profile")}>Не могу ждать!</Button>
      </div>
    </main>
  );
};

export default NotFoundPage;
