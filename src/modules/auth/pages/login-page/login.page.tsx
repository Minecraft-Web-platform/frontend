import { FC, FormEvent, useState } from "react";
import "./login.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import { useNavigate } from "react-router-dom";
import Button from "../../../../shared/ui/button/button.component";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";

const LoginPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const authStore = useAuthStore();
  const navigate = useNavigate();

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      username,
      password,
    };

    const { accessToken, refreshToken } = await authService.login(body);
    authStore.login(accessToken, refreshToken);
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={(e) => onSubmitHandler(e)}>
        <h1>Вход</h1>

        <Input
          value={username}
          setValue={setUsername}
          placeholder=""
          label="Никнейм"
        />

        <Input
          value={password}
          setValue={setPassword}
          placeholder=""
          type="password"
          label="Пароль"
        />

        <div className="buttons">
          <Button callback={() => {}}>Войти</Button>

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
