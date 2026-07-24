import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CURRENT_USER_COOKIE } from "@/lib/types";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function setCurrentUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCurrentUser() {
  const cookieStore = await cookies();
  cookieStore.delete(CURRENT_USER_COOKIE);
}
