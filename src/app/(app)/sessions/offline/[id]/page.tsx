import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/stats";
import { VENUE_CATEGORY_ICON, VENUE_CATEGORY_LABEL, avgStars } from "@/lib/venue";
import { Stars } from "@/components/app/Stars";
import { StarInput } from "@/components/app/StarInput";
import { ChatAutoRefresh } from "@/components/app/ChatAutoRefresh";
import { checkInReading, joinMeetup, leaveMeetup, sendMeetupMessage, submitRating } from "../actions";

export default async function MeetupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const meetup = await prisma.bookClubMeetup.findUnique({
    where: { id },
    include: {
      venue: true,
      book: true,
      host: true,
      participants: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      messages: { include: { user: true }, orderBy: { createdAt: "asc" } },
      ratings: { include: { user: true } },
      readingLogs: true,
    },
  });
  if (!meetup) notFound();

  const isParticipant = meetup.participants.some((p) => p.userId === user.id);
  const isFull = meetup.participants.length >= meetup.capacity;
  const hasHappened = meetup.scheduledAt <= new Date();

  const myReadingLog = meetup.readingLogs.find((r) => r.userId === user.id);
  const myRating = meetup.ratings.find((r) => r.userId === user.id);
  const rating = avgStars(meetup.ratings);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">{meetup.book.title}</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          {VENUE_CATEGORY_ICON[meetup.venue.category] ?? "📍"} {meetup.venue.name} · {VENUE_CATEGORY_LABEL[meetup.venue.category]}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-indigo-100 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-600">{format(meetup.scheduledAt, "M월 d일 (E) HH:mm", { locale: ko })}</span>
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
              meetup.status === "ended"
                ? "bg-emerald-50 text-emerald-600"
                : isFull
                  ? "bg-stone-100 text-stone-400"
                  : "bg-indigo-50 text-indigo-500"
            }`}
          >
            {meetup.status === "ended" ? "종료" : `${meetup.participants.length}/${meetup.capacity}${isFull ? " 마감" : ""}`}
          </span>
        </div>
        <p className="text-xs text-stone-400">{meetup.venue.address}</p>
        <p className="text-xs text-stone-400">주최 {meetup.host.name}</p>
        {rating !== null && (
          <p className="text-xs">
            <Stars value={rating} /> <span className="text-stone-400">{rating.toFixed(1)} ({meetup.ratings.length}명 평가)</span>
          </p>
        )}

        {meetup.status !== "ended" && (
          <div className="pt-2">
            {isParticipant ? (
              <form action={leaveMeetup.bind(null, meetup.id)}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-500 text-sm font-semibold hover:bg-stone-200 transition"
                >
                  참여 취소하기
                </button>
              </form>
            ) : (
              <form action={joinMeetup.bind(null, meetup.id)}>
                <button
                  type="submit"
                  disabled={isFull}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition disabled:bg-stone-200 disabled:cursor-not-allowed"
                >
                  {isFull ? "정원이 마감됐어요" : "참여하기"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-orange-100 p-4">
        <p className="text-xs font-bold text-stone-400 mb-2">참여자 {meetup.participants.length}명</p>
        <div className="flex flex-wrap gap-2">
          {meetup.participants.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 text-xs bg-stone-50 rounded-full px-2.5 py-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                {p.user.name[0]}
              </span>
              {p.user.name}
              {p.userId === meetup.hostId && <span className="text-indigo-400">(주최)</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-orange-100 p-4 flex flex-col gap-3">
        <p className="text-xs font-bold text-stone-400">채팅으로 문의하기</p>
        <ChatAutoRefresh />
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {meetup.messages.length === 0 && <p className="text-stone-300 text-xs py-4 text-center">아직 대화가 없어요.</p>}
          {meetup.messages.map((m) => {
            const mine = m.userId === user.id;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-stone-400 mb-0.5">{m.user.name}</span>
                <span
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-orange-400 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            );
          })}
        </div>
        <form action={sendMeetupMessage.bind(null, meetup.id)} className="flex gap-2">
          <input
            name="content"
            required
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-orange-400 text-white text-sm font-semibold hover:bg-orange-500 transition">
            전송
          </button>
        </form>
      </div>

      {hasHappened && isParticipant && (
        <div className="rounded-2xl bg-white border border-orange-100 p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-stone-400">낭독 인증</p>
          {myReadingLog ? (
            <p className="text-sm text-stone-600">
              ✅ {myReadingLog.startPage}~{myReadingLog.endPage}쪽 · {formatDuration(myReadingLog.durationSec)} 인증 완료
            </p>
          ) : (
            <form action={checkInReading.bind(null, meetup.id)} className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-[11px] text-stone-400">시작 페이지</span>
                  <input
                    type="number"
                    name="startPage"
                    required
                    min={0}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-stone-400">끝 페이지</span>
                  <input
                    type="number"
                    name="endPage"
                    required
                    min={0}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-stone-400">낭독 시간(분)</span>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min={1}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-orange-400 text-white text-sm font-semibold hover:bg-orange-500 transition"
              >
                인증하기
              </button>
            </form>
          )}
        </div>
      )}

      {hasHappened && isParticipant && (
        <div className="rounded-2xl bg-white border border-orange-100 p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-stone-400">{myRating ? "내 평가 수정하기" : "모임은 어땠나요?"}</p>
          <form action={submitRating.bind(null, meetup.id)} className="flex flex-col gap-2">
            <StarInput name="stars" defaultValue={myRating?.stars ?? 0} />
            <textarea
              name="comment"
              defaultValue={myRating?.comment ?? ""}
              placeholder="장소나 모임에 대한 한줄평을 남겨주세요 (선택)"
              rows={2}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="self-end px-4 py-2 rounded-xl bg-stone-800 text-white text-sm font-semibold hover:bg-stone-700 transition"
            >
              {myRating ? "수정하기" : "평가 남기기"}
            </button>
          </form>
        </div>
      )}

      {meetup.ratings.length > 0 && (
        <div className="rounded-2xl bg-white border border-orange-100 p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-stone-400">참여자 평가</p>
          <div className="flex flex-col gap-3">
            {meetup.ratings.map((r) => (
              <div key={r.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700">{r.user.name}</span>
                  <Stars value={r.stars} />
                </div>
                {r.comment && <p className="text-xs text-stone-500 mt-0.5">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
