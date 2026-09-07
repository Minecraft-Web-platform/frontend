import { serverService } from "../../../shared/services/server.service";
import { FC, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profileService } from "../../profile/services/profile.service";
import "./tech-support.page.scss";

import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import Input from "../../../shared/ui/input/input.component";
import Button from "../../../shared/ui/button/button.component";
import { techSupportService } from "../services/tech-support.service";
import { PropagateLoader } from "react-spinners";
import { statesService } from "../../states/services/states.service";
import { ISettlementType } from "../../states/types/states.types";
import { useTranslation } from "react-i18next";

// faqs will be loaded from i18n


const TechSupportPage: FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailIsConfirmed, setEmailIsConfirmed] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [pendingTypes, setPendingTypes] = useState<ISettlementType[]>([]);
  const { t } = useTranslation("tech-support-page");
  
  const faqs = t("faqItems", { returnObjects: true }) as { q: string; a: string }[];

  const loadPendingTypes = () => {
    statesService.getSettlementTypes(true)
      .then(types => setPendingTypes(types.filter(t => !t.isApproved)))
      .catch(console.error);
  };

  useEffect(() => {
    profileService
      .getInfoAboutMe()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        setUsername(res.username);
        setEmail(res.email);
        setEmailIsConfirmed(res.emailIsConfirmed);
        if (res.role === 'admin' || res.isAdmin) {
          setIsAdmin(true);
          loadPendingTypes();
        }
      })
      .finally(() => setIsLoading(false));

    serverService.getPing()
      .then((res) => setIsOnline(res.running))
      .catch(() => setIsOnline(false));
  }, []);

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setIsError(false);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("topic", topic);
    formData.append("content", content);
    
    files.forEach((file) => {
      formData.append("files", file);
    });

    techSupportService
      .send(formData)
      .then(() => {
        setIsSuccess(true);
        setTopic("");
        setContent("");
        setFiles([]);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsSubmitting(false));
  };

  const handleModerateType = async (id: string, isApproved: boolean) => {
    try {
      await statesService.moderateSettlementType(id, isApproved);
      alert(isApproved ? t("alerts.approved") : t("alerts.rejected"));
      loadPendingTypes();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || t("alerts.errorModeration"));
    }
  };

  return (
    <div className="tech-support-page">
      <Sidebar />

      <main className="tech-support-main content">
        <div className="tech-support-header">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>

        <div className="server-status-banner" style={{ display: 'flex', alignItems: 'center', background: isOnline === true ? 'rgba(34, 197, 94, 0.1)' : isOnline === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(150,150,150,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${isOnline === true ? 'rgba(34, 197, 94, 0.3)' : isOnline === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(150,150,150,0.3)'}` }}>
          <div style={{ marginRight: '16px', display: 'flex' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isOnline === true ? '#22c55e' : isOnline === false ? '#ef4444' : '#888', boxShadow: isOnline === true ? '0 0 10px rgba(34, 197, 94, 0.5)' : isOnline === false ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none' }}></div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{isOnline === true ? t("serverStatus.online") : isOnline === false ? t("serverStatus.offline") : t("serverStatus.loading")}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>{isOnline === true ? t("serverStatus.onlineDesc") : isOnline === false ? t("serverStatus.offlineDesc") : t("serverStatus.loadingDesc")}</p>
          </div>
        </div>

        <div className="tech-support-banner">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="banner-content">
            <h3>{t("launcherInfo.title")}</h3>
            <p>{t("launcherInfo.desc")}</p>
          </div>
          <div className="banner-action">
            <Button callback={() => navigate("/download")}>{t("launcherInfo.btn")}</Button>
          </div>
        </div>

        <div className="tech-support-grid">
          <div className="support-form-card">
            <h2>{t("form.title")}</h2>
            
            {isLoading ? (
              <div className="loader-container">
                <PropagateLoader color="#111827" />
              </div>
            ) : isSuccess ? (
              <div className="success-state">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>{t("form.successTitle")}</h3>
                <p dangerouslySetInnerHTML={{ __html: t("form.successDesc", { email }) }}></p>
                <Button callback={() => setIsSuccess(false)} secondary>{t("form.writeMoreBtn")}</Button>
              </div>
            ) : !email || !emailIsConfirmed ? (
              <div className="email-warning-state">
                <div className="warning-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3>{t("form.emailRequiredTitle")}</h3>
                <p>{t("form.emailRequiredDesc")}</p>
                <Button callback={() => navigate("/profile")}>{t("form.goToProfileBtn")}</Button>
              </div>
            ) : (
              <form onSubmit={onSubmitHandler}>
                {isError && (
                  <div className="error-message">
                    {t("form.errorSubmit")}
                  </div>
                )}
                <div className="form-group">
                  <Input
                    value={username}
                    placeholder=""
                    element="input"
                    label={t("form.nicknameLabel")}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <Input
                    value={topic}
                    setValue={setTopic}
                    placeholder={t("form.topicPlaceholder")}
                    element="input"
                    label={t("form.topicLabel")}
                  />
                </div>
                <div className="form-group">
                  <Input
                    value={content}
                    setValue={setContent}
                    placeholder={t("form.textPlaceholder")}
                    element="textarea"
                    label={t("form.textLabel")}
                  />
                </div>
                <div className="form-group">
                  <div className="file-upload-wrapper">
                    <label className="file-upload-label">
                      {t("form.attachFilesLabel")}
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        const validFiles = selectedFiles.filter(f => f.size <= 5 * 1024 * 1024);
                        if (validFiles.length < selectedFiles.length) {
                          alert(t("alerts.fileSizeExceeded"));
                        }
                        setFiles(validFiles.slice(0, 3));
                      }}
                    />
                    {files.length > 0 && (
                      <div className="selected-files">
                        {files.map((f, i) => (
                          <div key={i} className="file-item">
                            📎 {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button disabled={isSubmitting || !topic.trim() || !content.trim()}>
                  {isSubmitting ? t("form.submittingBtn") : t("form.submitBtn")}
                </Button>
              </form>
            )}
          </div>

          {isAdmin && (
            <div className="support-faq-card" style={{ marginTop: '20px' }}>
              <h2>{t("moderation.title")}</h2>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                {t("moderation.desc")}
              </p>
              {pendingTypes.length === 0 ? (
                <p>{t("moderation.empty")}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingTypes.map((type) => (
                    <div key={type.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <div>
                        <strong>{type.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>{t("moderation.proposedBy", { username: type.proposedByUsername || t("moderation.unknown") })}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button callback={() => handleModerateType(type.id, true)} style={{ padding: '5px 15px', fontSize: '14px', background: '#22c55e' }}>{t("moderation.approveBtn")}</Button>
                        <Button callback={() => handleModerateType(type.id, false)} secondary style={{ padding: '5px 15px', fontSize: '14px', color: '#ef4444', borderColor: '#ef4444' }}>{t("moderation.rejectBtn")}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="support-faq-card" style={{ marginTop: isAdmin ? '20px' : '0' }}>
            <h2>{t("faqTitle")}</h2>
            <div className="faq-list">
              {faqs.map((faq, idx) => (
                <details key={idx} className="faq-item">
                  <summary className="faq-question">
                    {faq.q}
                    <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechSupportPage;
