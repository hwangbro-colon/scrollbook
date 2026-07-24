"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function addVocab(formData: FormData) {
  const user = await requireUser();
  const word = String(formData.get("word") ?? "").trim();
  const meaning = String(formData.get("meaning") ?? "").trim();
  if (!word || !meaning) return;

  await prisma.vocabEntry.create({
    data: { userId: user.id, word, meaning },
  });
  revalidatePath("/vocab");
}

export async function toggleMemorized(id: string, next: boolean) {
  const user = await requireUser();
  await prisma.vocabEntry.updateMany({
    where: { id, userId: user.id },
    data: { memorized: next },
  });
  revalidatePath("/vocab");
}

export async function updateVocab(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const word = String(formData.get("word") ?? "").trim();
  const meaning = String(formData.get("meaning") ?? "").trim();
  if (!id || !word || !meaning) return;

  await prisma.vocabEntry.updateMany({
    where: { id, userId: user.id },
    data: { word, meaning },
  });
  revalidatePath("/vocab");
  redirect("/vocab");
}

export async function deleteVocab(id: string) {
  const user = await requireUser();
  await prisma.vocabEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/vocab");
}
