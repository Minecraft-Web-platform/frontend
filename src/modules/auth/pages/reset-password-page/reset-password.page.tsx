import { FC, FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth.service";

import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";

import "./reset-password.page.scss";

type StepsOfResetting =
  | "email-form"
  | "code-form"
  | "new-password-form"
  | "success";

const ResetPasswordPage: FC = () => {
  const [step, setStep] = useState<StepsOfResetting>("email-form");

  const [email, setEmail] = useState<string>("");
  const [confirmCode, setConfirmCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const navigate = useNavigate();

  const submitEmailFormHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // change to endpoint of initiaing password changing
    authService
      .initConfirmation({ email: email })
      .then(() => setStep("code-form"));
  };
  const submitCodeFormHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // change to endpoint of confirming code of password changing
    // await authService.confirm({ confirmationCode: confirmCode });
  };

  return (
    <main className="reset-password-page">
      {step === "email-form" && (
        <form
          className="reset-password-form-email"
          onSubmit={(e) => submitEmailFormHandler(e)}
        >
          <h1>Сброс пароля</h1>
          <p>Введи свою почту от аккаунта</p>

          <Input
            value={email}
            setValue={setEmail}
            label="Почта"
            placeholder=""
            element="input"
          />

          <Button>Получить код</Button>
          <Button callback={() => navigate("/login")} secondary={true}>
            Вспомнил пароль? :D
          </Button>
        </form>
      )}

      {step === "code-form" && (
        <form
          className="reset-password-form-code"
          onSubmit={(e) => submitCodeFormHandler(e)}
        >
          <h1>Сброс пароля</h1>
          <p>Код был выслан на почту {email}, введи шестизначный код</p>

          <Input
            value={confirmCode}
            setValue={setConfirmCode}
            label="Код подтверждения"
            placeholder="xxxxxx"
            element="input"
          />

          <Button>Подтвердить</Button>
          <Button callback={() => navigate("/login")} secondary={true}>
            Вспомнил пароль? :D
          </Button>
        </form>
      )}

      {step === "new-password-form" && (
        // add handler
        <form className="reset-password-form-code" onSubmit={(e) => e}>
          <h1>Сброс пароля</h1>
          <p>Введён правильный код, теперь введи новый пароль</p>

          <Input
            value={newPassword}
            setValue={setNewPassword}
            label="Новый пароль"
            placeholder=""
            element="input"
          />

          <Button>Сменить</Button>
        </form>
      )}
    </main>
  );
};

export default ResetPasswordPage;
