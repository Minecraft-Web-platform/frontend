import { FC, useState } from "react";
import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";
import { useNavigate } from "react-router";
import "./reset-password.page.scss";

const ResetPasswordPage: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);
  const [confirmCode, setConfirmCode] = useState<string>("");
  const navigate = useNavigate();

  const onClickHandler = () => {};

  return (
    <main className="reset-password-page">
      {isCodeSent ? (
        <form className="reset-password-form-code"></form>
      ) : (
        <form className="reset-password-form-email">
          <h1>Сброс пароля</h1>
          <p>Введи свою почту от аккаунта</p>

          <Input
            value={email}
            setValue={setEmail}
            label="Почта"
            placeholder=""
          />

          <Button callback={onClickHandler}>Получить код</Button>
          <Button callback={() => navigate("/login")} secondary={true}>
            Вспомнил пароль? :D
          </Button>
        </form>
      )}
    </main>
  );
};

export default ResetPasswordPage;
