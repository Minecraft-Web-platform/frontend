import { FC, FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../../services/auth.service";
import Input from "../../../../shared/ui/input/input.component";
import Button from "../../../../shared/ui/button/button.component";
import { MoonLoader } from "react-spinners";
import { AxiosError } from "axios";

import "./reset-password.page.scss";
import { useTranslation } from "react-i18next";

type StepsOfResetting = "username-form" | "code-form" | "success";

const ResetPasswordPage: FC = () => {
  const [step, setStep] = useState<StepsOfResetting>("username-form");
  const [username, setUsername] = useState<string>("");
  const [confirmCode, setConfirmCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const submitUsernameFormHandler = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.initPasswordReset({ username: username.trim() });
      setStep("code-form");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e instanceof AxiosError) {
        const status = (e as AxiosError<{message?: string}>).response?.status;
        if (status === 404) {
          setErrorMsg(t("reset-password-page.errors.notFound"));
        } else if (status === 403) {
          setErrorMsg(t("reset-password-page.errors.emailNotConfirmed"));
        } else {
          setErrorMsg(t("reset-password-page.errors.failedToSend"));
        }
      } else {
        setErrorMsg(t("reset-password-page.errors.unknown"));
      }
    } finally {
      setLoading(false);
    }
  };

  const submitCodeFormHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmCode.trim() || !newPassword.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword({
        username: username.trim(),
        code: confirmCode.trim(),
        newPassword: newPassword,
      });
      setStep("success");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e instanceof AxiosError) {
        const status = (e as AxiosError<{message?: string}>).response?.status;
        const msg = (e as AxiosError<{message?: string}>).response?.data?.message;
        if (status === 400 && typeof msg === "string") {
          setErrorMsg(msg);
        } else if (status === 404) {
          setErrorMsg(t("reset-password-page.errors.notFound"));
        } else {
          setErrorMsg(t("reset-password-page.errors.invalidCode"));
        }
      } else {
        setErrorMsg(t("reset-password-page.errors.unknown"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      {step === "username-form" && (
        <form
          className="reset-password-form"
          onSubmit={(e) => submitUsernameFormHandler(e)}
        >
          <h1>{t("reset-password-page.usernameForm.title")}</h1>
          <p>
            {t("reset-password-page.usernameForm.description")}
          </p>

          <Input
            value={username}
            setValue={setUsername}
            label={t("reset-password-page.usernameForm.usernameLabel")}
            placeholder={t("reset-password-page.usernameForm.usernamePlaceholder")}
            element="input"
          />

          {errorMsg && (
            <p style={{ color: "#d9534f", margin: "12px 0 0" }}>{errorMsg}</p>
          )}

          <div className="buttons">
            <Button disabled={loading}>
              {loading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                t("reset-password-page.usernameForm.getCode")
              )}
            </Button>
            <Button
              callback={() => navigate("/login")}
              secondary={true}
              type="button"
            >
              {t("reset-password-page.usernameForm.remembered")}
            </Button>
          </div>
        </form>
      )}

      {step === "code-form" && (
        <form
          className="reset-password-form"
          onSubmit={(e) => submitCodeFormHandler(e)}
        >
          <h1>{t("reset-password-page.codeForm.title")}</h1>
          <p>
            {t("reset-password-page.codeForm.description", { username })}
          </p>

          <Input
            value={confirmCode}
            setValue={setConfirmCode}
            label={t("reset-password-page.codeForm.codeLabel")}
            placeholder={t("reset-password-page.codeForm.codePlaceholder")}
            element="input"
          />

          <Input
            value={newPassword}
            setValue={setNewPassword}
            label={t("reset-password-page.codeForm.passwordLabel")}
            placeholder={t("reset-password-page.codeForm.passwordPlaceholder")}
            type="password"
            element="input"
          />

          {errorMsg && (
            <p style={{ color: "#d9534f", margin: "12px 0 0" }}>{errorMsg}</p>
          )}

          <div className="buttons">
            <Button disabled={loading}>
              {loading ? (
                <MoonLoader size={20} color="#fff" />
              ) : (
                t("reset-password-page.codeForm.submit")
              )}
            </Button>
            <Button
              callback={() => navigate("/login")}
              secondary={true}
              type="button"
            >
              {t("reset-password-page.usernameForm.remembered")}
            </Button>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="reset-password-form">
          <h1>{t("reset-password-page.success.title")}</h1>
          <p>
            {t("reset-password-page.success.description")}
          </p>

          <div className="buttons">
            <Button callback={() => navigate("/login")} type="button">
              {t("reset-password-page.success.login")}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ResetPasswordPage;
