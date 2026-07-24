"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createMeetup(formData: FormData) {
  const user = await requireUser();
  const venueId = String(formData.get("venueId") ?? "");
  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  const capacity = Number(formData.get("capacity"));

  if (!venueId || !bookTitle || !scheduledAtRaw || !Number.isFinite(capacity) || capacity < 2) return;
  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) return;

  let book = await prisma.book.findFirst({ where: { title: bookTitle } });
  if (!book) {
    book = await prisma.book.create({ data: { title: bookTitle, author: "미상", totalPages: 200 } });
  }

  const meetup = await prisma.bookClubMeetup.create({
    data: {
      venueId,
      bookId: book.id,
      hostId: user.id,
      scheduledAt,
      capacity,
      status: "open",
      participants: { create: [{ userId: user.id }] },
    },
  });

  revalidatePath("/sessions/offline");
  redirect(`/sessions/offline/${meetup.id}`);
}

export async function joinMeetup(meetupId: string) {
  const user = await requireUser();
  const meetup = await prisma.bookClubMeetup.findUnique({
    where: { id: meetupId },
    include: { participants: true },
  });
  if (!meetup || meetup.status !== "open") return;
  if (meetup.participants.length >= meetup.capacity) return;
  if (meetup.participants.some((p) => p.userId === user.id)) return;

  await prisma.bookClubParticipant.create({ data: { meetupId, userId: user.id } });
  revalidatePath(`/sessions/offline/${meetupId}`);
  revalidatePath("/sessions/offline");
}

export async function leaveMeetup(meetupId: string) {
  const user = await requireUser();
  await prisma.bookClubParticipant.deleteMany({ where: { meetupId, userId: user.id } });
  revalidatePath(`/sessions/offline/${meetupId}`);
  revalidatePath("/sessions/offline");
}

export async function sendMeetupMessage(meetupId: string, formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await prisma.bookClubMessage.create({ data: { meetupId, userId: user.id, content } });
  revalidatePath(`/sessions/offline/${meetupId}`);
}

export async function checkInReading(meetupId: string, formData: FormData) {
  const user = await requireUser();
  const meetup = await prisma.bookClubMeetup.findUnique({ where: { id: meetupId } });
  if (!meetup) return;

  const startPage = Number(formData.get("startPage"));
  const endPage = Number(formData.get("endPage"));
  const durationMinutes = Number(formData.get("durationMinutes"));
  if (![startPage, endPage, durationMinutes].every(Number.isFinite) || endPage <= startPage) return;
  const durationSec = durationMinutes * 60;

  await prisma.readingSession.create({
    data: {
      userId: user.id,
      bookId: meetup.bookId,
      type: "offline",
      startPage,
      endPage,
      durationSec,
      date: meetup.scheduledAt,
      bookClubMeetupId: meetupId,
    },
  });
  revalidatePath(`/sessions/offline/${meetupId}`);
  revalidatePath("/history");
}

export async function submitRating(meetupId: string, formData: FormData) {
  const user = await requireUser();
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return;

  await prisma.bookClubRating.upsert({
    where: { meetupId_userId: { meetupId, userId: user.id } },
    create: { meetupId, userId: user.id, stars, comment: comment || null },
    update: { stars, comment: comment || null },
  });
  revalidatePath(`/sessions/offline/${meetupId}`);
}
