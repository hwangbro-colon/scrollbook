import { useNavigate } from "react-router-dom";
import { ChevronLeft, Flame, Heart, Ticket, CalendarClock, Bell } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useMileageStore, COUPON_CATALOG } from "../store/mileageStore";
import { useEssayStore } from "../store/essayStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { EmptyState } from "../components/common/EmptyState";

function formatSchedule(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Every row here is derived from real store state (no separate notification
// log exists in this prototype) so what's shown always matches what the
// rest of the app is doing — a stale/duplicate mock feed would be worse
// than a short, honest list.
export function AlarmView() {
  const navigate = useNavigate();
  const dailyChallengeDone = useAppStore((s) => s.dailyChallengeDone);
  const clubs = useAppStore((s) => s.clubs);
  const balance = useMileageStore((s) => s.balance);
  const essays = useEssayStore((s) => s.essays);
  const myEssay = essays.find((e) => e.name === "나");

  const affordableCoupon = COUPON_CATALOG.filter((c) => c.cost <= balance).sort((a, b) => b.cost - a.cost)[0];
  const upcomingClub = clubs.filter((c) => c.joined && c.nextSchedule).sort((a, b) => new Date(a.nextSchedule!).getTime() - new Date(b.nextSchedule!).getTime())[0];

  const items = [
    !dailyChallengeDone && {
      icon: Flame,
      title: "오늘의 5분 챌린지를 아직 안 하셨어요",
      desc: "지금 시작하면 스트릭이 유지돼요",
    },
    upcomingClub && {
      icon: CalendarClock,
      title: `${upcomingClub.name} 다음 낭독 일정`,
      desc: formatSchedule(upcomingClub.nextSchedule) ?? "",
    },
    myEssay && {
      icon: Heart,
      title: "누군가 회원님의 감상문에 공감했어요",
      desc: `"${myEssay.text.slice(0, 24)}${myEssay.text.length > 24 ? "…" : ""}"`,
    },
    affordableCoupon && {
      icon: Ticket,
      title: "교환 가능한 쿠폰이 있어요",
      desc: `${affordableCoupon.title} · ${affordableCoupon.cost.toLocaleString()}P`,
    },
  ].filter((v): v is { icon: typeof Flame; title: string; desc: string } => !!v);

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

      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        알림
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">최근 알림을 모아봤어요</p>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="새 알림이 없어요" />
      ) : (
        <div>
          {items.map((item, i) => (
            <div key={item.title} className={`flex items-start gap-3 py-3 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
              <div
                className="flex h-9 w-9 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper-dim)]"
                style={{ borderRadius: "10px" }}
              >
                <item.icon size={16} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenScroll>
  );
}
