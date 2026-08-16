import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Camera, Check, X, Settings } from "lucide-react";
import { useProfileStore, COMPLETED_STATS_MOCK, type StatsPeriod } from "../store/profileStore";
import { useToastStore } from "../store/toastStore";
import { useBook } from "../hooks/useBook";
import { COMPLETED_BOOKS_MOCK } from "../data/completedBooksMock";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { MaskedField } from "../components/common/MaskedField";
import { theme } from "../config/theme";

const PERIOD_LABEL: Record<StatsPeriod, string> = { month: "이번 달", year: "최근 1년", all: "전체" };

function CompletedBookRow({ bookId, completedAt }: { bookId: string; completedAt: string }) {
  const book = useBook(bookId);
  if (!book) return null;
  const dateLabel = new Date(completedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="flex items-center gap-3 border-t border-[var(--color-line)] py-3 first:border-t-0">
      <div className="h-11 w-8 flex-none" style={{ borderRadius: "4px", background: book.coverColor }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-bold text-[var(--color-ink)]">{book.title}</p>
        <p className="text-[10.5px] text-[var(--color-ink-soft)]">{dateLabel} 완독</p>
      </div>
    </div>
  );
}

export function ProfileView() {
  const { nickname, avatarUrl, bio, setNickname, setAvatarUrl, setBio } = useProfileStore();
  const showToast = useToastStore((s) => s.show);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(nickname);
  const [period, setPeriod] = useState<StatsPeriod>("month");

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Dummy upload — object URL only, nothing actually leaves the device.
    setAvatarUrl(URL.createObjectURL(file));
    showToast("프로필 사진을 변경했어요");
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      showToast("닉네임을 입력해 주세요");
      return;
    }
    setNickname(trimmed);
    setEditingName(false);
    showToast("닉네임을 변경했어요");
  };

  return (
    <ScreenScroll>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[16px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {theme.appName}
        </span>
        <Link
          to="/settings"
          aria-label="설정"
          className="flex h-8 w-8 items-center justify-center border-[1.5px] border-[var(--color-ink)]"
          style={{ borderRadius: "var(--radius-avatar)" }}
        >
          <Settings size={15} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-col items-center">
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="프로필 사진 변경" className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)] text-[28px] font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {nickname.slice(0, 1)}
            </div>
          )}
          <span
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-ink)]"
            aria-hidden="true"
          >
            <Camera size={12} strokeWidth={2} color="#fff" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />

        {editingName ? (
          <div className="mt-3 flex items-center gap-1.5">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={16}
              autoFocus
              className="w-32 border-0 border-b-[1.5px] border-[var(--color-ink)] bg-transparent px-1 py-0.5 text-center text-[15px] font-bold text-[var(--color-ink)] outline-none"
            />
            <button type="button" onClick={saveName} aria-label="저장">
              <Check size={17} strokeWidth={2} color="var(--color-accent)" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setNameDraft(nickname);
                setEditingName(false);
              }}
              aria-label="취소"
            >
              <X size={17} strokeWidth={2} color="var(--color-ink-soft)" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5">
            <h1 className="text-[16px] font-bold text-[var(--color-ink)]">{nickname}</h1>
            <button
              type="button"
              onClick={() => {
                setNameDraft(nickname);
                setEditingName(true);
              }}
              aria-label="닉네임 수정"
            >
              <Pencil size={13} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => showToast(`지금까지 ${COMPLETED_BOOKS_MOCK.length}권 스크롤 완독했어요 🎉`)}
          className="mt-3 px-4 py-2 text-[12px] font-extrabold text-white"
          style={{ borderRadius: "var(--radius-btn)", background: "var(--color-accent)" }}
        >
          {COMPLETED_BOOKS_MOCK.length}권 스크롤
        </button>
      </div>

      <SectionHead title="자기소개 / 목표" />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={80}
        placeholder="한 줄로 목표나 소개를 적어보세요 (예: 이번 달 3권 완독하기)"
        rows={3}
        className="w-full resize-none border-[1.5px] border-[var(--color-ink)] p-3 text-[12.5px] text-[var(--color-ink)] outline-none"
      />

      <SectionHead title="완독 통계" />
      <div className="flex p-[3px]" style={{ background: "var(--color-paper-dim)", borderRadius: "var(--radius-btn)" }}>
        {(Object.keys(PERIOD_LABEL) as StatsPeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 text-[11.5px] font-bold ${period === p ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"}`}
            style={{ borderRadius: "var(--radius-chip)" }}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>
      <div
        className="mt-3 flex flex-col items-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-accent-tint)] py-6"
        style={{ borderRadius: "14px" }}
      >
        <p className="text-xs font-bold text-[var(--color-accent)]">{PERIOD_LABEL[period]} 완독</p>
        <p className="mt-1 text-[32px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {COMPLETED_STATS_MOCK[period]}
          <span className="ml-1 text-lg">권</span>
        </p>
      </div>

      <SectionHead title="개인정보" />
      <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
        <MaskedField label="이메일" value="bukttak@example.com" mode="partial" />
        <MaskedField label="전화번호" value="010-1234-5678" mode="partial" />
      </div>
      <p className="mt-2 text-[10.5px] text-[var(--color-ink-soft)]">탭하면 전체 값을 확인할 수 있어요</p>

      <SectionHead title="총 기록" />
      {COMPLETED_BOOKS_MOCK.length === 0 ? (
        <p className="text-[12px] text-[var(--color-ink-soft)]">아직 완독한 책이 없어요.</p>
      ) : (
        <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
          {COMPLETED_BOOKS_MOCK.map((entry) => (
            <CompletedBookRow key={entry.bookId} bookId={entry.bookId} completedAt={entry.completedAt} />
          ))}
        </div>
      )}
    </ScreenScroll>
  );
}
