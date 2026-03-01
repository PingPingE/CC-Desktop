interface LoginStepProps {
  onNext: () => void;
}

export function LoginStep({ onNext }: LoginStepProps) {
  return (
    <div className="onboarding-wizard-step">
      <h2>Claude 계정 로그인</h2>
      <p className="wizard-desc">
        CC Desktop은 첫 사용 시 자동으로 브라우저를 열어 로그인을 진행합니다.
      </p>

      <div className="login-info-card">
        <div className="login-info-step">
          <div className="login-step-num">1</div>
          <p>첫 메시지를 보내면 브라우저가 열립니다</p>
        </div>
        <div className="login-info-step">
          <div className="login-step-num">2</div>
          <p>Claude 계정으로 로그인하세요</p>
        </div>
        <div className="login-info-step">
          <div className="login-step-num">3</div>
          <p>로그인 완료 후 CC Desktop으로 돌아옵니다</p>
        </div>
      </div>

      <div className="login-note">
        <strong>참고:</strong> Claude Pro, Max, 또는 Team 구독이 필요합니다.
        <br />
        <a
          href="https://claude.ai/settings/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          구독 확인하기
        </a>
      </div>

      <button className="wizard-btn-primary" onClick={onNext}>
        다음
      </button>
    </div>
  );
}
