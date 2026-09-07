import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import "./not-found.page.scss";
import Button from "../../../shared/ui/button/button.component";

let timerId: number = 0;

const NotFoundPage: FC = () => {
  const { t, i18n } = useTranslation("errors");
  const [seconds, setSeconds] = useState<number>(10);
  const navigate = useNavigate();

  const getSecondsWord = (sec: number) => {
    if (i18n.language === 'en') {
      return sec === 1 ? t("notFound.seconds_one") : t("notFound.seconds_many");
    }
    if (sec % 10 === 1 && sec % 100 !== 11) {
      return t("notFound.seconds_one");
    }
    if ([2, 3, 4].includes(sec % 10) && ![12, 13, 14].includes(sec % 100)) {
      return t("notFound.seconds_few");
    }
    return t("notFound.seconds_many");
  };

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
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <main className="not-found-page">
      <div className="info-block">
        <h1>{t("notFound.title")}</h1>

        <p>
          {t("notFound.description", { seconds, unit: getSecondsWord(seconds) })}
        </p>

        <Button callback={() => navigate("/profile")}>
          {t("notFound.cantWait")}
        </Button>
      </div>
    </main>
  );
};

export default NotFoundPage;
