"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setCurrentUser } from "@/lib/auth";

export async function loginAs(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  await setCurrentUser(user.id);
  redirect("/home");
}
