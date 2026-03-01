import { useState } from "react";
import { WelcomeStep } from "./WelcomeStep";
import { ClaudeCodeStep } from "./ClaudeCodeStep";
import { LoginStep } from "./LoginStep";
import { ProjectStep } from "./ProjectStep";
import { useLocale } from "../../i18n";

interface OnboardingWizardProps {
  onComplete: (projectPath: string, projectName: string) => void;
}

type Step = "welcome" | "claude-code" | "login" | "project";

const STEPS: Step[] = ["welcome", "claude-code", "login", "project"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");

  const currentIndex = STEPS.indexOf(currentStep);

  function goNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  }

  function goBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  }

  function handleProjectComplete(path: string, name: string) {
    localStorage.setItem("onboarding_completed", "true");
    onComplete(path, name);
  }

  return (
    <div className="onboarding-wizard">
      <div className="wizard-nav-row">
        {currentIndex > 0 && (
          <button className="wizard-back" onClick={goBack}>
            &larr; {t("onboarding.back")}
          </button>
        )}
        <div className="wizard-progress">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`wizard-progress-dot ${i <= currentIndex ? "wizard-progress-active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="wizard-content">
        {currentStep === "welcome" && <WelcomeStep onNext={goNext} />}
        {currentStep === "claude-code" && <ClaudeCodeStep onNext={goNext} />}
        {currentStep === "login" && <LoginStep onNext={goNext} />}
        {currentStep === "project" && <ProjectStep onComplete={handleProjectComplete} />}
      </div>

      {currentStep !== "welcome" && currentStep !== "project" && (
        <button
          className="wizard-skip"
          onClick={goNext}
        >
          {t("onboarding.skip")}
        </button>
      )}
    </div>
  );
}
