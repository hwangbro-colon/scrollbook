import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SessionTabs } from "@/components/app/SessionTabs";
import { VenueMapClient } from "@/components/app/VenueMapClient";
import { Stars } from "@/components/app/Stars";
import { VENUE_CATEGORY_ICON, VENUE_CATEGORY_LABEL, avgStars } from "@/lib/venue";
import { createMeetup } from "./actions";

const MAP_CENTER: [number, number] = [37.4985, 127.0272];

export default async function OfflineClubPage() {
  await requireUser();

  const [venues, meetups] = await Promise.all([
    prisma.venue.findMany({
      include: { meetups: { include: { ratings: true } } },
    }),
    prisma.bookClubMeetup.findMany({
      include: {
        venue: true,
        book: true,
        host: true,
        participants: { include: { user: true } },
        ratings: true,
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const mapPoints = venues.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    lat: v.lat,
    lng: v.lng,
    category: v.category,
    avgRating: avgStars(v.meetups.flatMap((m) => m.ratings)),
    meetupCount: v.meetups.length,
  }));

  const upcoming = meetups.filter((m) => m.status === "open");
  const past = meetups.filter((m) => m.status === "ended");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">오프라인 북클럽</h1>
        <p className="text-stone-400 text-sm mt-0.5">근처 스터디카페·서점에서 직접 만나 낭독해요</p>
      </div>

      <SessionTabs active="offline" />

      <VenueMapClient venues={mapPoints} center={MAP_CENTER} />

      <details className="rounded-2xl bg-white border border-orange-100 p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-orange-500 list-none flex items-center justify-between">
          + 새 모임 만들기
          <span className="text-stone-300 group-open:rotate-180 transition">⌄</span>
        </summary>
        <form action={createMeetup} className="mt-4 flex flex-col gap-3">
          <label className="block">
            <span className="text-xs font-bold text-stone-400">장소</span>
            <select
              name="venueId"
              required
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="" disabled>
                장소를 선택하세요
              </option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {VENUE_CATEGORY_ICON[v.category] ?? "📍"} {v.name} · {VENUE_CATEGORY_LABEL[v.category]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-stone-400">책 제목</span>
            <input
              name="bookTitle"
              required
              placeholder="예: 아몬드"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-stone-400">일시</span>
              <input
                type="datetime-local"
                name="scheduledAt"
                required
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-stone-400">정원</span>
              <input
                type="number"
                name="capacity"
                min={2}
                max={20}
                required
                defaultValue={5}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-1 w-full py-3 rounded-2xl bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
          >
            모임 만들기
          </button>
        </form>
      </details>

      <section>
        <p className="text-xs font-bold text-stone-400 mb-2">다가오는 모임</p>
        {upcoming.length === 0 && <p className="text-stone-400 text-sm py-4">예정된 모임이 없어요.</p>}
        <div className="flex flex-col gap-2">
          {upcoming.map((m) => {
            const full = m.participants.length >= m.capacity;
            const venueRatings = m.venue ? venues.find((v) => v.id === m.venueId)?.meetups.flatMap((mm) => mm.ratings) ?? [] : [];
            const rating = avgStars(venueRatings);
            return (
              <Link
                key={m.id}
                href={`/sessions/offline/${m.id}`}
                className="block rounded-2xl bg-white border border-indigo-100 p-4 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800 text-sm">{m.book.title}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      full ? "bg-stone-100 text-stone-400" : "bg-indigo-50 text-indigo-500"
                    }`}
                  >
                    {m.participants.length}/{m.capacity}
                    {full ? " 마감" : ""}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {VENUE_CATEGORY_ICON[m.venue.category] ?? "📍"} {m.venue.name} · {format(m.scheduledAt, "M월 d일 (E) HH:mm", { locale: ko })}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  주최 {m.host.name}
                  {rating !== null && (
                    <span className="ml-2">
                      <Stars value={rating} /> <span className="text-stone-400">{rating.toFixed(1)}</span>
                    </span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <p className="text-xs font-bold text-stone-400 mb-2">지난 모임</p>
          <div className="flex flex-col gap-2">
            {past.map((m) => {
              const rating = avgStars(m.ratings);
              return (
                <Link
                  key={m.id}
                  href={`/sessions/offline/${m.id}`}
                  className="block rounded-2xl bg-white border border-orange-100 p-4 hover:border-orange-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-800 text-sm">{m.book.title}</p>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">종료</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {VENUE_CATEGORY_ICON[m.venue.category] ?? "📍"} {m.venue.name} · {format(m.scheduledAt, "M월 d일 (E)", { locale: ko })}
                  </p>
                  {rating !== null && (
                    <p className="text-xs mt-1">
                      <Stars value={rating} /> <span className="text-stone-400">{rating.toFixed(1)} ({m.ratings.length}명 평가)</span>
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
