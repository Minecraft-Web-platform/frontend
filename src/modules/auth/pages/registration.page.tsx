import { FC, FormEvent, useState } from "react";
import Button from "../../../shared/ui/button/button.component";
import Input from "../../../shared/ui/input/input.component";

import { authService } from "../services/auth.service";

import "./registration.page.scss";
import { validator } from "../../../shared/utils/validator.util";
import { Link } from "react-router";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";

const RegistrationPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [isAcceptedAgreement, setIsAcceptedAgreement] =
    useState<boolean>(false);
  const [accountIsCreated, setAccountIsCreated] = useState<boolean>(false);

  const buttonIsActive =
    username.length > 2 &&
    validator.validatePasswordBoolean(password) &&
    validator.validatePasswordBoolean(repeatPassword) &&
    isAcceptedAgreement;

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      username,
      password,
      repeatPassword,
      isAcceptedAgreement,
    };

    authService.registrate(body).then(() => setAccountIsCreated(true));
  };

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
            placeholder="Никнейм"
            label="Желаемый никнейм"
          />

          <Input
            value={password}
            setValue={setPassword}
            placeholder="Пароль"
            label="Пароль"
          />

          <Input
            value={repeatPassword}
            setValue={setRepeatPassword}
            placeholder="Ещё раз пароль"
            label="Ещё раз пароль"
          />

          <div className="checkbox-area">
            <Checkbox
              checked={isAcceptedAgreement}
              onClickHandler={() => setIsAcceptedAgreement((prev) => !prev)}
            />

            <span>
              Я принимаю <Link to="/agreement">условия обработки данных</Link>
            </span>
          </div>

          <div className="buttons">
            <Button callback={() => {}} disabled={!buttonIsActive}>
              Создать аккаунт
            </Button>

            <Button callback={() => {}} secondary={true}>
              Уже есть аккаунт на сервере
            </Button>
          </div>
        </form>
      )}
    </main>
  );
};

export default RegistrationPage;
