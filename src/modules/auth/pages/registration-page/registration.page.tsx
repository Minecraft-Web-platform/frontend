import { FC, FormEvent, useEffect, useState } from "react";
import Button from "../../../../shared/ui/button/button.component";
import Input from "../../../../shared/ui/input/input.component";

import { authService } from "../../services/auth.service";

import "./registration.page.scss";
import { Link, useNavigate } from "react-router";
import Checkbox from "../../../../shared/ui/checkbox/checkbox.component";
import { MoonLoader } from "react-spinners";

const errorCodes: { [key: number]: string } = {
  409: "Этот никнейм уже занят. Придумай себе другой.",
  400: "Пароли не одинаковые. Проверь еще раз.",
};

const RegistrationPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [isAcceptedAgreement, setIsAcceptedAgreement] =
    useState<boolean>(false);
  const [accountIsCreated, setAccountIsCreated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<number>();

  const navigate = useNavigate();

  const buttonIsActive =
    username.length > 2 && password.length > 7 && isAcceptedAgreement;

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const body = {
      username,
      password,
      repeatPassword,
      isAcceptedAgreement,
    };

    authService
      .registrate(body)
      .then(() => setAccountIsCreated(true))
      .catch((e) => setError(e.status));
    setIsLoading(false);
  };

  useEffect(() => {
    error && alert(errorCodes[error]);

    setError(0);
  }, [error]);

  return (
    <main className="registration-page">
      {accountIsCreated ? (
        <div className="created">
          <h2>
            Твой аккаунт был создан и я сам в шоке, что ничего не отвалилось :)
          </h2>

          <p>
            Сейчас, дружочек, ты должен залогиниться, чтобы войти в аккаунт и
            делать грязь с сайта
          </p>

          <p>
            P.S. Можешь уже заходить на майнкрафт сервер и играть, впиши тот же
            никнейм что и тут
          </p>
        </div>
      ) : (
        <form
          className="registration-form"
          onSubmit={(e) => onSubmitHandler(e)}
        >
          <h1>Регистрация</h1>

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

          <Input
            value={repeatPassword}
            setValue={setRepeatPassword}
            placeholder=""
            type="password"
            label="Ещё раз пароль"
            element="input"
          />

          <div className="checkbox-area">
            <Checkbox
              checked={isAcceptedAgreement}
              onClickHandler={() => setIsAcceptedAgreement((prev) => !prev)}
            />

            <span>
              Принимаю{" "}
              <Link to="/agreement">условия обработки Моих данных</Link>
            </span>
          </div>

          <div className="buttons">
            <Button callback={() => {}} disabled={!buttonIsActive}>
              {isLoading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                "Зарегистрироваться"
              )}
            </Button>

            <Button callback={() => navigate("/login")} secondary={true}>
              Уже есть аккаунт?
            </Button>
          </div>
        </form>
      )}
    </main>
  );
};

export default RegistrationPage;
