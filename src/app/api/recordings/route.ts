import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAndCompleteGroupSession } from "@/lib/groupSession";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await request.formData();
  const audio = form.get("audio");
  const bookTitle = String(form.get("bookTitle") ?? "").trim();
  const startPage = Number(form.get("startPage"));
  const endPage = Number(form.get("endPage"));
  const durationSec = Number(form.get("durationSec"));
  const groupSessionId = form.get("groupSessionId") ? String(form.get("groupSessionId")) : null;
  const type = groupSessionId ? "online" : "solo";

  if (!bookTitle || !Number.isFinite(startPage) || !Number.isFinite(endPage) || !Number.isFinite(durationSec)) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  let book = await prisma.book.findFirst({ where: { title: bookTitle } });
  if (!book) {
    book = await prisma.book.create({
      data: { title: bookTitle, author: "미상", totalPages: Math.max(endPage, 100) },
    });
  }

  const id = randomUUID();
  let audioUrl: string | null = null;
  if (audio instanceof File && audio.size > 0) {
    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });
    const filename = `${id}.webm`;
    const buffer = Buffer.from(await audio.arrayBuffer());
    await writeFile(path.join(audioDir, filename), buffer);
    audioUrl = `/audio/${filename}`;
  }

  const session = await prisma.readingSession.create({
    data: {
      id,
      userId: user.id,
      bookId: book.id,
      type,
      startPage,
      endPage,
      durationSec,
      audioUrl,
      groupSessionId,
    },
    include: { book: true },
  });

  if (groupSessionId) {
    await checkAndCompleteGroupSession(groupSessionId);
  }

  return NextResponse.json({ session });
}
