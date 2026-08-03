import { Users, MessageSquareHeart, UserPlus } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useSimulatedAsync } from "../hooks/useSimulatedAsync";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { Avatar } from "../components/common/Avatar";
import { EssayRow } from "../components/common/EssayRow";
import { EmptyState } from "../components/common/EmptyState";
import { RowSkeleton, EssayRowSkeleton } from "../components/common/Skeleton";
import { TOP_ESSAYS } from "../data/homeMock";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} stroke="var(--color-ink-soft)" fill="none" strokeWidth={1.8} className="mx-auto mb-2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

export function FriendsView() {
  const clubs = useAppStore((s) => s.clubs);
  const toggleClub = useAppStore((s) => s.toggleClub);
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
  const essay = TOP_ESSAYS[0] as (typeof TOP_ESSAYS)[number] | undefined;

  const clubsAsync = useSimulatedAsync({ delayMs: 650 });
  const essaysAsync = useSimulatedAsync({ delayMs: 700 });

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
            {clubs.map((club, i) => (
              <div key={club.id} className={`flex items-center gap-2.5 py-[11px] ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
                <div
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper-dim)] text-[15px]"
                  style={{ borderRadius: "10px" }}
                >
                  {club.emoji}
                </div>
                <div className="flex-1">
                  <h5 className="text-[12.5px] font-bold text-[var(--color-ink)]">{club.name}</h5>
                  <p className="mt-px text-[10.5px] text-[var(--color-ink-soft)]">{club.caption}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleClub(club.id)}
                  className="flex-none border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[10.5px] font-bold"
                  style={{
                    borderRadius: "var(--radius-btn)",
                    background: club.joined ? "var(--color-ink)" : "none",
                    color: club.joined ? "#fff" : "var(--color-ink)",
                  }}
                >
                  {club.joined ? "가입중" : "가입하기"}
                </button>
              </div>
            ))}
          </div>
        ))}

      <SectionHead title="커뮤니티" />
      <div className="bg-[var(--color-paper-dim)] p-4 text-center" style={{ borderRadius: "var(--radius-card)" }}>
        <LockIcon />
        <p className="text-xs font-bold text-[var(--color-ink-soft)]">아직 준비중이에요</p>
        <small className="mt-1 block text-[10.5px] text-[var(--color-ink-soft)] opacity-75">
          사용자 500명 넘으면 개방 예정
        </small>
      </div>

      <SectionHead title="감상문 공유" action="더보기" />
      {essaysAsync.status === "loading" && <EssayRowSkeleton first />}
      {essaysAsync.status === "success" &&
        (essay ? (
          <EssayRow first initial={essay.initial} name={essay.name} text={essay.text} likes={essay.likes} />
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
              <Avatar letter={f.name.slice(0, 1)} size={34} />
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
