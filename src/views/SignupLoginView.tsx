import { useState } from "react";
import { Logo } from "../components/common/Logo";
import { theme } from "../config/theme";
import { useOnboardingStore } from "../store/onboardingStore";

// Spec: "이메일/닉네임 입력 필드 + 로그인 버튼 (실제 인증 없이 다음 화면으로
// 이동)" — no validation beyond non-empty, no real backend. This isn't a
// route; App.tsx renders it directly while `loggedIn` is false, before the
// tab app ever mounts.
export function SignupLoginView() {
  const login = useOnboardingStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const canSubmit = email.trim() !== "" && nickname.trim() !== "";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-[var(--color-paper)] px-8">
      <div className="flex flex-col items-center gap-2">
        <Logo size={56} />
        <p className="text-lg font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {theme.appName}
        </p>
      </div>

      <form
        className="flex w-full max-w-xs flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) login();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-bold text-[var(--color-ink-soft)]">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-[1.5px] border-[var(--color-ink)] px-3 py-2.5 text-[13.5px] text-[var(--color-ink)] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-bold text-[var(--color-ink-soft)]">닉네임</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="북딱북딱"
            maxLength={16}
            className="border-[1.5px] border-[var(--color-ink)] px-3 py-2.5 text-[13.5px] text-[var(--color-ink)] outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 w-full py-3 text-[13.5px] font-extrabold text-white disabled:opacity-35"
          style={{ borderRadius: "var(--radius-btn)", background: "var(--color-ink)" }}
        >
          로그인
        </button>
        <p className="text-center text-[10.5px] text-[var(--color-ink-soft)]">
          프로토타입이라 실제 계정 인증은 없어요 — 아무 값이나 입력하고 로그인하면 됩니다
        </p>
      </form>
    </div>
  );
}
