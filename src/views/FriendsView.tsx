import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, MessageSquareHeart, UserPlus, Lock } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useEssayStore, ESSAY_HIGHLIGHT_LIKE_THRESHOLD } from "../store/essayStore";
import { useSimulatedAsync } from "../hooks/useSimulatedAsync";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { Avatar } from "../components/common/Avatar";
import { EssayRow } from "../components/common/EssayRow";
import { EmptyState } from "../components/common/EmptyState";
import { RowSkeleton, EssayRowSkeleton } from "../components/common/Skeleton";

// Mock community-wide progress toward the unlock threshold — no real
// nationwide user count exists in this prototype.
const COMMUNITY_CURRENT = 320;
const COMMUNITY_GOAL = 500;

function formatSchedule(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function FriendsView() {
  const clubs = useAppStore((s) => s.clubs);
  const toggleClub = useAppStore((s) => s.toggleClub);
  const setClubSchedule = useAppStore((s) => s.setClubSchedule);
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
  const essays = useEssayStore((s) => s.essays);
  const highlightedEssay = essays.find((e) => e.likes >= ESSAY_HIGHLIGHT_LIKE_THRESHOLD);

  const [scheduleDraft, setScheduleDraft] = useState<Record<string, string>>({});

  const clubsAsync = useSimulatedAsync({ delayMs: 650 });
  const essaysAsync = useSimulatedAsync({ delayMs: 700 });

  const communityPct = Math.min(100, Math.round((COMMUNITY_CURRENT / COMMUNITY_GOAL) * 100));

  return (
    <ScreenScroll>
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        그룹
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">소모임 · 커뮤니티 · 감상문공유 · 친구관리</p>

      <SectionHead first title="소모임" action="더보기" />
      {clubsAsync.status === "loading" && (
        <div>
          <RowSkeleton first />
          <RowSkeleton />
        </div>
      )}
      {clubsAsync.status === "success" &&
        (clubs.length === 0 ? (
          <EmptyState icon={Users} title="아직 가입한 소모임이 없어요" description="관심 있는 소모임에 가입해보세요" />
        ) : (
          <div>
            {clubs.map((club, i) => {
              const full = club.maxMembers !== undefined && (club.currentMembers ?? 0) >= club.maxMembers;
              return (
                <div key={club.id} className={`py-[11px] ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-[38px] w-[38px] flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper-dim)] text-[15px]"
                      style={{ borderRadius: "10px" }}
                    >
                      {club.emoji}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[12.5px] font-bold text-[var(--color-ink)]">{club.name}</h5>
                      <p className="mt-px text-[10.5px] text-[var(--color-ink-soft)]">
                        {club.caption}
                        {club.maxMembers !== undefined && ` · ${club.currentMembers ?? 0}/${club.maxMembers}명`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!club.joined && full}
                      onClick={() => toggleClub(club.id)}
                      className="flex-none border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[10.5px] font-bold disabled:cursor-not-allowed disabled:border-[var(--color-line)] disabled:text-[var(--color-ink-soft)]"
                      style={{
                        borderRadius: "var(--radius-btn)",
                        background: club.joined ? "var(--color-ink)" : "none",
                        color: club.joined ? "#fff" : !club.joined && full ? undefined : "var(--color-ink)",
                      }}
                    >
                      {club.joined ? "가입중" : full ? "정원마감" : "가입하기"}
                    </button>
                  </div>

                  {club.nextSchedule && (
                    <p className="ml-[48px] mt-1.5 text-[10.5px] font-bold text-[var(--color-accent)]">
                      📅 다음 낭독 일정: {formatSchedule(club.nextSchedule)}
                    </p>
                  )}
                  {club.isHost && (
                    <div className="ml-[48px] mt-1.5 flex gap-1.5">
                      <input
                        type="datetime-local"
                        value={scheduleDraft[club.id] ?? ""}
                        onChange={(e) => setScheduleDraft((prev) => ({ ...prev, [club.id]: e.target.value }))}
                        className="min-w-0 flex-1 border-[1.5px] border-[var(--color-line)] bg-[var(--color-paper)] px-2 py-1 text-[10.5px] text-[var(--color-ink)]"
                        style={{ borderRadius: "var(--radius-btn)" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const draft = scheduleDraft[club.id];
                          if (!draft) return;
                          setClubSchedule(club.id, new Date(draft).toISOString());
                        }}
                        className="flex-none border-[1.5px] border-[var(--color-ink)] px-2.5 text-[10.5px] font-bold text-[var(--color-ink)]"
                        style={{ borderRadius: "var(--radius-btn)" }}
                      >
                        일정 잡기
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

      <SectionHead title="커뮤니티" />
      <div className="bg-[var(--color-paper-dim)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="flex items-center justify-center gap-1.5">
          <Lock size={16} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
          <p className="text-xs font-bold text-[var(--color-ink-soft)]">사용자 {COMMUNITY_GOAL}명 넘으면 개방</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-line)" }}>
          <div className="h-full transition-all duration-500" style={{ width: `${communityPct}%`, background: "var(--color-accent)" }} />
        </div>
        <p className="mt-1.5 text-center text-[10.5px] font-bold text-[var(--color-ink-soft)]">
          {COMMUNITY_CURRENT} / {COMMUNITY_GOAL}명
        </p>
      </div>

      <SectionHead title="감상문 공유" action="더보기" />
      {essaysAsync.status === "loading" && <EssayRowSkeleton first />}
      {essaysAsync.status === "success" &&
        (highlightedEssay ? (
          <Link to={`/essay/${highlightedEssay.id}`}>
            <EssayRow first initial={highlightedEssay.initial} name={highlightedEssay.name} text={highlightedEssay.text} likes={highlightedEssay.likes} />
          </Link>
        ) : (
          <EmptyState icon={MessageSquareHeart} title="공유된 감상문이 없어요" />
        ))}

      <SectionHead title="친구관리" action="친구 추가" onAction={addFriend} />
      {friends.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="아직 친구가 없어요"
          description="친구를 추가하고 함께 읽어보세요"
          action={
            <button
              type="button"
              onClick={addFriend}
              className="mt-1 bg-[var(--color-ink)] px-3.5 py-2 text-xs font-bold text-white"
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              친구 추가
            </button>
          }
        />
      ) : (
        <div>
          {friends.map((f, i) => (
            <div key={f.id} className={`flex items-center gap-2.5 py-[9px] ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
              <Avatar letter={f.name.slice(0, 1)} size={34} ring={f.activeToday ? "active" : "inactive"} />
              <div className="flex-1">
                <b className="text-[12.5px] text-[var(--color-ink)]">{f.name}</b>
                <span className="block text-[10.5px] text-[var(--color-ink-soft)]">{f.streakLabel}</span>
              </div>
              <button
                type="button"
                className="flex-none border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-ink)]"
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                프로필
              </button>
            </div>
          ))}
        </div>
      )}
    </ScreenScroll>
  );
}
