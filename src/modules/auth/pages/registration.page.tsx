import { FC, useState } from "react";
import Button from "../../../shared/ui/button/button.component";
import Input from "../../../shared/ui/input/input.component";

import "./registration.page.scss";
import { validator } from "../../../shared/utils/validator.util";

const RegistrationPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const buttonIsActive =
    username.length > 2 &&
    validator.validatePasswordBoolean(password) &&
    validator.validatePasswordBoolean(repeatPassword);

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

        <Button callback={() => {}} disabled={!buttonIsActive}>
          Создать аккаунт
        </Button>
      </form>
    </main>
  );
};

export default RegistrationPage;
