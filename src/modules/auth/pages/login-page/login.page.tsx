import { FC, FormEvent, useEffect, useState } from "react";
import "./login.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import { useNavigate } from "react-router-dom";
import Button from "../../../../shared/ui/button/button.component";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";
import { MoonLoader } from "react-spinners";
import { AxiosError } from "axios";

import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n/i18n";

const errorCodes: { [key: number]: string } = {
  401: "Никнейм либо пароль неверны. Попробуй еще раз :)",
};

const LoginPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<number>();

  const authStore = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      username,
      password,
    };

    try {
      const { accessToken, refreshToken } = await authService.login(body);

      authStore.login(accessToken, refreshToken);
    } catch (e) {
      if (e instanceof AxiosError) setError(e.status);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (error) {
      alert(errorCodes[error]);
    }

    setError(0);
  }, [error]);

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={(e) => onSubmitHandler(e)}>
        <h1>{t("login-page.html-elements.sign-in-heading")}</h1>

        <Input
          value={username}
          setValue={setUsername}
          placeholder=""
          label={t("login-page.html-elements.username-input-label")}
          element="input"
        />

        <button onClick={(e) => {e.preventDefault(); i18n.changeLanguage('pl')}}>pl</button>
        <button onClick={(e) => {e.preventDefault(); i18n.changeLanguage('en')}}>en</button>
        <button onClick={(e) => {e.preventDefault(); i18n.changeLanguage('ua')}}>ua</button>
        <button onClick={(e) => {e.preventDefault(); i18n.changeLanguage('ru')}}>ru</button>

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

        {/* <Link to={"/"}>Забыли пароль?</Link> */}
      </form>
    </main>
  );
};

export default LoginPage;
