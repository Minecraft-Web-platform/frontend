import { FC, useState } from "react";
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
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  const initEmailConfirmationFunc = () => {
    authService
      .initEmailConfirmation({ email }, accessToken as string)
      .then(() => setStep("code-providing"));
  };

  const confirmEmailFunc = () => {
    authService
      .confirmEmail({ confirmationCode: code }, accessToken as string)
      .then(() => setStep("done"));
  };

  return (
    <div className="email-confirmation-page">
      <Sidebar />

      <main className="content">
        <div className="email-confirmation">
          <h1>Привязка почты</h1>

          <p>По окончанию сия процесса ты станешь легализованным Барсиком </p>

          <p className="step">{stepsDir[step]}</p>

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
                disabled={step !== "email-providing"}
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
                  disabled={step === "done"}
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
