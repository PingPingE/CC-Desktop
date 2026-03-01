interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="onboarding-wizard-step">
      <div className="wizard-logo">CC</div>
      <h1>CC Desktop</h1>
      <p className="wizard-subtitle">
        Claude Code를 터미널 없이 사용하세요
      </p>
      <p className="wizard-desc">
        코딩, 파일 편집, 프로젝트 관리를 대화형으로 — 개발 경험이 없어도 괜찮습니다.
      </p>
      <button className="wizard-btn-primary" onClick={onNext}>
        시작하기
      </button>
    </div>
  );
}
