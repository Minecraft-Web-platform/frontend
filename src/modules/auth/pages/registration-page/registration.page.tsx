import { FC, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MoonLoader } from "react-spinners";
import "./registration.page.scss";

import Button from "../../../../shared/ui/button/button.component";
import Input from "../../../../shared/ui/input/input.component";
import Checkbox from "../../../../shared/ui/checkbox/checkbox.component";

import { AxiosError } from "axios";
import { authService } from "../../services/auth.service";
import { validator } from "../../../../shared/utils/validator.util";

import { useTranslation } from "react-i18next";

// errorCodes logic handled in component

const RegistrationPage: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [isAcceptedAgreement, setIsAcceptedAgreement] =
    useState<boolean>(false);
  const [accountIsCreated, setAccountIsCreated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const buttonIsActive =
    username.length > 2 && password.length > 7 && isAcceptedAgreement;

  const showErrors = (errors: string[]) => {
    setErrorMessage(errors.join(".\n"));
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (e instanceof AxiosError) {
          const code = e.status || (e as AxiosError<{message?: string}>).response?.status;
          if (code === 409) {
            setErrorMessage(t("registration-page.errors.http.username-taken"));
          } else if (code === 400) {
            setErrorMessage(t("registration-page.errors.http.passwords-mismatch"));
          } else {
            setErrorMessage(t("registration-page.errors.http.failed-to-register"));
          }
        } else {
          setErrorMessage(t("registration-page.errors.http.unknown"));
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <main className="registration-page">
      {accountIsCreated ? (
        <div className="created">
          <h2>{t("registration-page.success.title")}</h2>

          <p>{t("registration-page.success.p1")}</p>

          <p>{t("registration-page.success.p2")}</p>
          <br />
          <p>{t("registration-page.success.p3")}</p>

          <Button callback={() => navigate("/login")}>{t("registration-page.success.login-btn")}</Button>
        </div>
      ) : (
        <form
          className="registration-form"
          onSubmit={e => e.preventDefault()}
        >
          <h1>{t("registration-page.html-elements.sign-up-heading")}</h1>

          {errorMessage && <div className="auth-error-message" style={{ color: '#dc2626', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'pre-line' }}>{errorMessage}</div>}

          <Input
            value={username}
            setValue={setUsername}
            placeholder=""
            label={t("registration-page.html-elements.username-input-label")}
            element="input"
          />

          <Input
            value={password}
            setValue={setPassword}
            placeholder=""
            type="password"
            label={t("registration-page.html-elements.password-input-label")}
            element="input"
          />

          <Input
            value={repeatPassword}
            setValue={setRepeatPassword}
            placeholder=""
            type="password"
            label={t("registration-page.html-elements.repeat-password-input-label")}
            element="input"
          />

          <div className="checkbox-area">
            <Checkbox
              checked={isAcceptedAgreement}
              onClickHandler={() => setIsAcceptedAgreement((prev) => !prev)}
            />

            <span>
              {t("registration-page.html-elements.acceptation-reguls-label")}{" "}
              <Link to="/agreement">{t("registration-page.html-elements.agreement-link")}</Link>
            </span>
          </div>

          <div className="buttons">
            <Button callback={() => onRegistrationHandler()} disabled={!buttonIsActive}>
              {isLoading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                t("registration-page.html-elements.sign-up-button")
              )}
            </Button>

            <Button callback={() => navigate("/login")} secondary={true}>
              {t("registration-page.html-elements.login-redirect-button")}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
};

export default RegistrationPage;
