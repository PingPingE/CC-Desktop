import { useLocale } from "../../i18n";

interface LoginStepProps {
  onNext: () => void;
}

export function LoginStep({ onNext }: LoginStepProps) {
  const { t } = useLocale();

  return (
    <div className="onboarding-wizard-step">
      <h2>{t("onboarding.login.title")}</h2>
      <p className="wizard-desc">
        {t("onboarding.login.desc")}
      </p>

      <div className="login-info-card">
        <div className="login-info-step">
          <div className="login-step-num">1</div>
          <p>{t("onboarding.login.step1")}</p>
        </div>
        <div className="login-info-step">
          <div className="login-step-num">2</div>
          <p>{t("onboarding.login.step2")}</p>
        </div>
        <div className="login-info-step">
          <div className="login-step-num">3</div>
          <p>{t("onboarding.login.step3")}</p>
        </div>
      </div>

      <div className="login-note">
        <strong>{t("onboarding.login.note")}</strong> {t("onboarding.login.noteText")}
        <br />
        <a
          href="https://claude.ai/settings/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          {t("onboarding.login.checkSubscription")}
        </a>
      </div>

      <button className="wizard-btn-primary" onClick={onNext}>
        {t("onboarding.login.next")}
      </button>
    </div>
  );
}
