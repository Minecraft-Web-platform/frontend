import { FC, useState } from "react";
import { AxiosError } from "axios";
import Sidebar from "../../../../shared/ui/sidebar/sidebar.component";
import "./email-confirmation.page.scss";
import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth.service";
import useAuthStore from "../../../../store/auth.store";

import { useTranslation } from "react-i18next";
import { useShallow } from 'zustand/react/shallow';


const EmailConfirmationPage: FC = () => {
  const [step, setStep] = useState<
    "email-providing" | "code-providing" | "done"
  >("email-providing");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { accessToken } = useAuthStore(useShallow(state => ({ accessToken: state.accessToken })));
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const stepsDir = {
    "email-providing": t("email-confirmation-page.steps.email-providing"),
    "code-providing": t("email-confirmation-page.steps.code-providing"),
    done: t("email-confirmation-page.steps.done"),
  };

  const initEmailConfirmationFunc = () => {
    setErrorMessage(null);
    setIsLoading(true);
    authService
      .initEmailConfirmation({ email }, accessToken as string)
      .then(() => setStep("code-providing"))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (e instanceof AxiosError) {
          setErrorMessage(e.response?.data?.message || t("email-confirmation-page.errors.failedToSend"));
        } else {
          setErrorMessage(t("email-confirmation-page.errors.unknown"));
        }
      })
      .finally(() => setIsLoading(false));
  };

  const confirmEmailFunc = () => {
    setErrorMessage(null);
    setIsLoading(true);
    authService
      .confirmEmail({ confirmationCode: code }, accessToken as string)
      .then(() => setStep("done"))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (e instanceof AxiosError) {
          setErrorMessage(e.response?.data?.message || t("email-confirmation-page.errors.invalidCode"));
        } else {
          setErrorMessage(t("email-confirmation-page.errors.unknown"));
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="email-confirmation-page">
      <Sidebar />

      <main className="content">
        <div className="email-confirmation">
          <h1>{t("email-confirmation-page.title")}</h1>

          <p>{t("email-confirmation-page.description")}</p>

          <p className="step">{stepsDir[step]}</p>

          {errorMessage && <div className="auth-error-message" style={{ color: '#dc2626', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{errorMessage}</div>}

          <div className="forms">
            <div className="form">
              <Input
                value={email}
                setValue={setEmail}
                element="input"
                placeholder="example@mail.com"
                label={t("email-confirmation-page.inputs.emailLabel")}
                disabled={step !== "email-providing"}
              />

              <Button
                secondary={step !== "email-providing"}
                disabled={step !== "email-providing" || isLoading}
                callback={initEmailConfirmationFunc}
              >
                {t("email-confirmation-page.buttons.getCode")}
              </Button>
            </div>

            {step !== "email-providing" && (
              <div className="form">
                <Input
                  value={code}
                  setValue={setCode}
                  element="input"
                  placeholder="XXXXXX"
                  label={t("email-confirmation-page.inputs.codeLabel")}
                />

                <Button
                  secondary={step === "done"}
                  disabled={step === "done" || isLoading}
                  callback={confirmEmailFunc}
                >
                  {t("email-confirmation-page.buttons.confirm")}
                </Button>
              </div>
            )}

            {step === "done" && (
              <div className="form">
                <h3>{t("email-confirmation-page.success.title")}</h3>
                <p>{t("email-confirmation-page.success.description")}</p>

                <Button callback={() => navigate("/profile")}>{t("email-confirmation-page.buttons.profile")}</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmationPage;
