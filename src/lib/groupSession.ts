import { prisma } from "@/lib/db";

export async function checkAndCompleteGroupSession(groupSessionId: string) {
  const group = await prisma.groupSession.findUnique({
    where: { id: groupSessionId },
    include: { participants: true, sessions: true },
  });
  if (!group || group.status === "ended") return;

  const doneUserIds = new Set(group.sessions.map((s) => s.userId));
  const allDone = group.participants.every((p) => doneUserIds.has(p.userId));
  if (allDone) {
    await prisma.groupSession.update({ where: { id: groupSessionId }, data: { status: "ended" } });
  }
}
