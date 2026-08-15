import { FC, FormEvent, useState } from "react";
import "./login.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../../../shared/ui/button/button.component";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";
import { MoonLoader } from "react-spinners";
import { AxiosError } from "axios";

import { useTranslation } from "react-i18next";

const errorCodes: { [key: number]: string } = {
  401: "Никнейм либо пароль неверны. Попробуй еще раз :)",
};

const LoginPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authStore = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const body = {
      username,
      password,
    };

    try {
      const { accessToken, refreshToken } = await authService.login(body);

      authStore.login(accessToken, refreshToken);
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const code = e.status || e.response?.status;
        setErrorMessage(code && errorCodes[code] ? errorCodes[code] : "Не удалось войти. Проверьте данные.");
      } else {
        setErrorMessage("Произошла неизвестная ошибка.");
      }
    }

    setLoading(false);
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={(e) => onSubmitHandler(e)}>
        <h1>{t("login-page.html-elements.sign-in-heading")}</h1>

        {errorMessage && <div className="auth-error-message" style={{ color: '#dc2626', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{errorMessage}</div>}

        <Input
          value={username}
          setValue={setUsername}
          placeholder=""
          label={t("login-page.html-elements.username-input-label")}
          element="input"
        />

        <Input
          value={password}
          setValue={setPassword}
          placeholder=""
          type="password"
          label={t("login-page.html-elements.password-input-label")}
          element="input"
        />

        <div className="buttons">
          <Button disabled={loading}>
            {loading ? <MoonLoader size={20} color="#fff" /> : t("login-page.html-elements.sign-in-button")}
          </Button>

          <Button callback={() => navigate("/registration")} secondary={true}>
            {t("login-page.html-elements.registration-redirect-button")}
          </Button>
        </div>

        <Link to="/reset-password" style={{ display: "block", marginTop: "16px", textAlign: "center" }}>
          Забыли пароль?
        </Link>
      </form>
    </main>
  );
};

export default LoginPage;
