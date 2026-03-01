import { useLocale } from "../../i18n";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="onboarding-wizard-step">
      <div className="wizard-logo">CC</div>
      <h1>{t("onboarding.welcome.title")}</h1>
      <p className="wizard-subtitle">
        {t("onboarding.welcome.subtitle")}
      </p>
      <p className="wizard-desc">
        {t("onboarding.welcome.desc")}
      </p>

      <div className="wizard-lang-selector">
        <span className="wizard-lang-label">{t("onboarding.welcome.langLabel")}</span>
        <div className="wizard-lang-options">
          <button
            className={`wizard-lang-btn ${locale === "ko" ? "wizard-lang-active" : ""}`}
            onClick={() => setLocale("ko")}
          >
            한국어
          </button>
          <button
            className={`wizard-lang-btn ${locale === "en" ? "wizard-lang-active" : ""}`}
            onClick={() => setLocale("en")}
          >
            English
          </button>
        </div>
      </div>

      <button className="wizard-btn-primary" onClick={onNext}>
        {t("onboarding.welcome.start")}
      </button>
    </div>
  );
}
