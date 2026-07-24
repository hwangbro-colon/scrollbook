import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportView } from "@/components/app/ReportView";
import { PrintButton } from "@/components/app/PrintButton";

export default async function GroupMemberReportPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = await params;
  const viewer = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });
  if (!group) notFound();
  if (group.hostUserId !== viewer.id) notFound();

  const member = group.members.find((m) => m.userId === userId);
  if (!member) notFound();

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-4">
        <Link href={`/groups/${group.id}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← {group.name}
        </Link>
        <PrintButton />
      </div>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-stone-800">{member.user.name}님의 리포트</h1>
        <p className="text-stone-400 text-sm mt-0.5">{group.name} 그룹 방장 전용 열람</p>
      </div>
      <ReportView userId={member.userId} />
    </div>
  );
}
