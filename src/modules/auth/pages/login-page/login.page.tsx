import { FC, FormEvent, useEffect, useState } from "react";
import "./login.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import { useNavigate } from "react-router-dom";
import Button from "../../../../shared/ui/button/button.component";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";
import { MoonLoader } from "react-spinners";
import { AxiosError } from "axios";

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
    error && alert(errorCodes[error]);

    setError(0);
  }, [error]);

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={(e) => onSubmitHandler(e)}>
        <h1>Вход</h1>

        <Input
          value={username}
          setValue={setUsername}
          placeholder=""
          label="Никнейм"
          element="input"
        />

        <Input
          value={password}
          setValue={setPassword}
          placeholder=""
          type="password"
          label="Пароль"
          element="input"
        />

        <div className="buttons">
          <Button disabled={loading}>
            {loading ? <MoonLoader size={20} color="#fff" /> : "Войти"}
          </Button>

          <Button callback={() => navigate("/registration")} secondary={true}>
            Еще нет аккаунта?
          </Button>
        </div>

        {/* <Link to={"/"}>Забыли пароль?</Link> */}
      </form>
    </main>
  );
};

export default LoginPage;
