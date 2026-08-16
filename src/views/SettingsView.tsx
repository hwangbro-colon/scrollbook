import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, Mail, ExternalLink } from "lucide-react";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";

const APP_VERSION = "v0.1.0 (프로토타입)";
const CONTACT_EMAIL = "hello@bookbook.app";
const INSTAGRAM_URL = "https://instagram.com/bookbook.app";

export function SettingsView() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.show);
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <ScreenScroll>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
        className="mb-4 flex h-8 w-8 items-center justify-center border-[1.5px] border-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-avatar)" }}
      >
        <ChevronLeft size={16} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
      </button>

      <div className="text-xl font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        설정
      </div>

      <SectionHead title="알림설정" />
      <div className="flex items-center justify-between border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="flex items-center gap-3">
          <Bell size={18} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          <span className="text-[12.5px] font-bold text-[var(--color-ink)]">알림 받기</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notificationsOn}
          onClick={() => {
            setNotificationsOn((v) => !v);
            showToast(notificationsOn ? "알림을 껐어요" : "알림을 켰어요");
          }}
          className="relative h-6 w-11 flex-none transition-colors"
          style={{ borderRadius: "var(--radius-chip)", background: notificationsOn ? "var(--color-accent)" : "var(--color-line)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 bg-white transition-all"
            style={{ borderRadius: "5px", left: notificationsOn ? "22px" : "2px" }}
          />
        </button>
      </div>

      <SectionHead title="정보" />
      <div className="flex flex-col divide-y divide-[var(--color-line)] border-[1.5px] border-[var(--color-ink)]" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="flex items-center justify-between p-4">
          <span className="text-[12.5px] font-bold text-[var(--color-ink)]">버전</span>
          <span className="text-[11.5px] text-[var(--color-ink-soft)]">{APP_VERSION}</span>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 p-4">
          <Mail size={16} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[12.5px] font-bold text-[var(--color-ink)]">문의</p>
            <p className="text-[11px] text-[var(--color-ink-soft)]">{CONTACT_EMAIL}</p>
          </div>
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4">
          <ExternalLink size={16} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[12.5px] font-bold text-[var(--color-ink)]">인스타그램</p>
            <p className="text-[11px] text-[var(--color-ink-soft)]">@bookbook.app</p>
          </div>
        </a>
      </div>
    </ScreenScroll>
  );
}
