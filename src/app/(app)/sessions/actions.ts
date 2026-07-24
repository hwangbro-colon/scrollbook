"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAndCompleteGroupSession } from "@/lib/groupSession";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createGroupSession(formData: FormData) {
  const user = await requireUser();
  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const startPage = Number(formData.get("startPage"));
  const endPage = Number(formData.get("endPage"));
  const participantIds = formData.getAll("participantIds").map(String);

  if (!bookTitle || !Number.isFinite(startPage) || !Number.isFinite(endPage) || endPage <= startPage) return;

  const orderedParticipantIds = Array.from(new Set([user.id, ...participantIds]));

  let book = await prisma.book.findFirst({ where: { title: bookTitle } });
  if (!book) {
    book = await prisma.book.create({ data: { title: bookTitle, author: "미상", totalPages: Math.max(endPage, 100) } });
  }

  const group = await prisma.groupSession.create({
    data: {
      bookId: book.id,
      hostUserId: user.id,
      schedule: new Date(),
      status: "active",
      planStartPage: startPage,
      planEndPage: endPage,
      participants: {
        create: orderedParticipantIds.map((userId, idx) => ({ userId, turnOrder: idx + 1 })),
      },
    },
  });

  revalidatePath("/sessions");
  redirect(`/sessions/${group.id}`);
}

export async function startSession(groupSessionId: string) {
  await requireUser();
  await prisma.groupSession.update({ where: { id: groupSessionId }, data: { status: "active" } });
  revalidatePath("/sessions");
  revalidatePath(`/sessions/${groupSessionId}`);
}

export async function simulateTurn(
  groupSessionId: string,
  participantUserId: string,
  bookId: string,
  startPage: number,
  endPage: number,
) {
  await requireUser();
  await prisma.readingSession.create({
    data: {
      userId: participantUserId,
      bookId,
      type: "online",
      startPage,
      endPage,
      durationSec: randomInt(120, 360),
      groupSessionId,
    },
  });
  await checkAndCompleteGroupSession(groupSessionId);
  revalidatePath(`/sessions/${groupSessionId}`);
  revalidatePath("/sessions");
}
