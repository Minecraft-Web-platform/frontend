import { FC, useState } from "react";
import Button from "../../../shared/ui/button/button.component";
import Input from "../../../shared/ui/input/input.component";

import { authService } from "../services/auth.service";

import "./registration.page.scss";
import { validator } from "../../../shared/utils/validator.util";

const RegistrationPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [isAcceptedAgreement, setIsAcceptedAgreement] =
    useState<boolean>(false);

  const buttonIsActive =
    username.length > 2 &&
    validator.validatePasswordBoolean(password) &&
    validator.validatePasswordBoolean(repeatPassword);

  const onSubmitHandler = async () => {
    const body = {
      username,
      password,
      repeatPassword,
      isAcceptedAgreement,
    };

    const res = await authService.registrate(body);
  };

  return (
    <main className="registration-page">
      <form className="registration-form">
        <Input
          value={username}
          setValue={setUsername}
          placeholder="Никнейм"
          label="Никнейм"
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

        <input
          type="checkbox"
          checked={isAcceptedAgreement}
          onChange={() => setIsAcceptedAgreement((prev) => !prev)}
        />

        <Button callback={() => {}} disabled={!buttonIsActive}>
          Создать аккаунт
        </Button>
      </form>
    </main>
  );
};

export default RegistrationPage;
