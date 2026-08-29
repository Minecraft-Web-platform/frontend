import { FC, FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth.service";
import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";
import { MoonLoader } from "react-spinners";
import { AxiosError } from "axios";

import "./reset-password.page.scss";

type StepsOfResetting = "username-form" | "code-form" | "success";

const ResetPasswordPage: FC = () => {
  const [step, setStep] = useState<StepsOfResetting>("username-form");
  const [username, setUsername] = useState<string>("");
  const [confirmCode, setConfirmCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const submitUsernameFormHandler = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.initPasswordReset({ username: username.trim() });
      setStep("code-form");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e instanceof AxiosError) {
        const status = (e as AxiosError<{message?: string}>).response?.status;
        if (status === 404) {
          setErrorMsg("Пользователь с таким никнеймом не найден");
        } else if (status === 403) {
          setErrorMsg("Сначала необходимо подтвердить почту аккаунта");
        } else {
          setErrorMsg("Ошибка при отправке кода. Попробуйте позже");
        }
      } else {
        setErrorMsg("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitCodeFormHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmCode.trim() || !newPassword.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword({
        username: username.trim(),
        code: confirmCode.trim(),
        newPassword: newPassword,
      });
      setStep("success");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e instanceof AxiosError) {
        const status = (e as AxiosError<{message?: string}>).response?.status;
        const msg = (e as AxiosError<{message?: string}>).response?.data?.message;
        if (status === 400 && typeof msg === "string") {
          setErrorMsg(msg);
        } else if (status === 404) {
          setErrorMsg("Пользователь не найден");
        } else {
          setErrorMsg("Неверный код или некорректный пароль (мин. 8 символов)");
        }
      } else {
        setErrorMsg("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      {step === "username-form" && (
        <form
          className="reset-password-form"
          onSubmit={(e) => submitUsernameFormHandler(e)}
        >
          <h1>Сброс пароля</h1>
          <p>
            Введи свой никнейм на сервере. Код подтверждения для сброса пароля
            будет отправлен на почту, привязанную к аккаунту.
          </p>

          <Input
            value={username}
            setValue={setUsername}
            label="Никнейм"
            placeholder="Steve"
            element="input"
          />

          {errorMsg && (
            <p style={{ color: "#d9534f", margin: "12px 0 0" }}>{errorMsg}</p>
          )}

          <div className="buttons">
            <Button disabled={loading}>
              {loading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                "Получить код"
              )}
            </Button>
            <Button
              callback={() => navigate("/login")}
              secondary={true}
              type="button"
            >
              Вспомнил пароль? :D
            </Button>
          </div>
        </form>
      )}

      {step === "code-form" && (
        <form
          className="reset-password-form"
          onSubmit={(e) => submitCodeFormHandler(e)}
        >
          <h1>Сброс пароля</h1>
          <p>
            Код был выслан на почту аккаунта пользователя <b>{username}</b>.
            Введи полученный шестизначный код и новый пароль.
          </p>

          <Input
            value={confirmCode}
            setValue={setConfirmCode}
            label="Код подтверждения"
            placeholder="xxxxxx"
            element="input"
          />

          <Input
            value={newPassword}
            setValue={setNewPassword}
            label="Новый пароль"
            placeholder="Минимум 8 символов"
            type="password"
            element="input"
          />

          {errorMsg && (
            <p style={{ color: "#d9534f", margin: "12px 0 0" }}>{errorMsg}</p>
          )}

          <div className="buttons">
            <Button disabled={loading}>
              {loading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                "Сменить пароль"
              )}
            </Button>
            <Button
              callback={() => navigate("/login")}
              secondary={true}
              type="button"
            >
              Вспомнил пароль? :D
            </Button>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="reset-password-form">
          <h1>Пароль изменен!</h1>
          <p>
            Твой пароль был успешно обновлен. Теперь ты можешь войти в свой
            аккаунт, используя новый пароль.
          </p>

          <div className="buttons">
            <Button callback={() => navigate("/login")} type="button">
              Войти в аккаунт
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ResetPasswordPage;
