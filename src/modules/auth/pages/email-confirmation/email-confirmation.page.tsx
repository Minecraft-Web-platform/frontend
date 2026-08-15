import { FC, useState } from "react";
import { AxiosError } from "axios";
import Sidebar from "../../../../shared/ui/sidebar/sidebar.component";
import "./email-confirmation.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";

const stepsDir = {
  "email-providing": "Шаг первый",
  "code-providing": "Шаг второй",
  done: "Конец!",
};

const EmailConfirmationPage: FC = () => {
  const [step, setStep] = useState<
    "email-providing" | "code-providing" | "done"
  >("email-providing");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  const initEmailConfirmationFunc = () => {
    setErrorMessage(null);
    setIsLoading(true);
    authService
      .initEmailConfirmation({ email }, accessToken as string)
      .then(() => setStep("code-providing"))
      .catch((e: unknown) => {
        if (e instanceof AxiosError) {
          setErrorMessage(e.response?.data?.message || "Не удалось отправить код. Проверьте почту.");
        } else {
          setErrorMessage("Произошла неизвестная ошибка.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const confirmEmailFunc = () => {
    setErrorMessage(null);
    setIsLoading(true);
    authService
      .confirmEmail({ confirmationCode: code }, accessToken as string)
      .then(() => setStep("done"))
      .catch((e: unknown) => {
        if (e instanceof AxiosError) {
          setErrorMessage(e.response?.data?.message || "Неверный код или срок его действия истёк.");
        } else {
          setErrorMessage("Произошла неизвестная ошибка.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="email-confirmation-page">
      <Sidebar />

      <main className="content">
        <div className="email-confirmation">
          <h1>Привязка почты</h1>

          <p>По окончанию сия процесса ты станешь легализованным Барсиком </p>

          <p className="step">{stepsDir[step]}</p>

          {errorMessage && <div className="auth-error-message" style={{ color: '#dc2626', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{errorMessage}</div>}

          <div className="forms">
            <div className="form">
              <Input
                value={email}
                setValue={setEmail}
                element="input"
                placeholder="example@mail.com"
                label="Почта"
                disabled={step !== "email-providing"}
              />

              <Button
                secondary={step !== "email-providing"}
                disabled={step !== "email-providing" || isLoading}
                callback={initEmailConfirmationFunc}
              >
                Получить код
              </Button>
            </div>

            {step !== "email-providing" && (
              <div className="form">
                <Input
                  value={code}
                  setValue={setCode}
                  element="input"
                  placeholder="XXXXXX"
                  label="Код подтверждения"
                />

                <Button
                  secondary={step === "done"}
                  disabled={step === "done" || isLoading}
                  callback={confirmEmailFunc}
                >
                  Подтвердить
                </Button>
              </div>
            )}

            {step === "done" && (
              <div className="form">
                <h3>Почта подтверждена!</h3>
                <p>Красава! Теперь можешь использовать сайт на полную!</p>

                <Button callback={() => navigate("/profile")}>Профиль</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmationPage;
