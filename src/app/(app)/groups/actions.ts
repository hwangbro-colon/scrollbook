"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createGroup(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  let inviteCode = generateInviteCode();
  while (await prisma.group.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode();
  }

  const group = await prisma.group.create({
    data: {
      name,
      inviteCode,
      hostUserId: user.id,
      members: { create: [{ userId: user.id }] },
    },
  });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function joinGroup(formData: FormData) {
  const user = await requireUser();
  const code = String(formData.get("inviteCode") ?? "").trim().toUpperCase();
  if (!code) return;

  const group = await prisma.group.findUnique({ where: { inviteCode: code } });
  if (!group) return;

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
    create: { groupId: group.id, userId: user.id },
    update: {},
  });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function leaveGroup(groupId: string) {
  const user = await requireUser();
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.hostUserId === user.id) return;

  await prisma.groupMember.deleteMany({ where: { groupId, userId: user.id } });
  revalidatePath("/groups");
  redirect("/groups");
}
