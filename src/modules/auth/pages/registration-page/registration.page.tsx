import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MoonLoader } from "react-spinners";
import "./registration.page.scss";

import Button from "../../../../shared/ui/button/button.component";
import Input from "../../../../shared/ui/input/input.component";
import Checkbox from "../../../../shared/ui/checkbox/checkbox.component";

import { authService } from "../../services/auth.service";
import { validator } from "../../../../shared/utils/validator.util";

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

  const showErrors = (errors: string[]) => {
    alert(errors.join(".\n"));
  };

  const onRegistrationHandler = async () => {
    const usernameErrors = validator.validateUsernameErrors(username);
    const passwordErrors = validator.validatePasswordErrors(password);

    if (usernameErrors.length > 0) {
      showErrors(usernameErrors);
      setUsername("");

      return;
    }

    if (passwordErrors.length > 0) {
      showErrors(passwordErrors);
      setPassword("");
      setRepeatPassword("");

      return;
    }

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
          <h2>Регистрация удалась!</h2>

          <p>
            Твой аккаунт был создан и я сам в шоке, что ничего не отвалилось :)
          </p>

          <p>
            Сейчас, дружочек, ты должен залогиниться, чтобы войти в аккаунт и
            делать грязь с сайта
          </p>
          <br />
          <p>
            P.S. Можешь уже заходить на майнкрафт сервер и играть, впиши тот же
            никнейм что и тут
          </p>

          <Button callback={() => navigate("/login")}>Залогиниться</Button>
        </div>
      ) : (
        <form
          className="registration-form"
          onSubmit={e => e.preventDefault()}
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
            <Button callback={() => onRegistrationHandler()} disabled={!buttonIsActive}>
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
