import { requireUser } from "@/lib/auth";
import { ReportView } from "@/components/app/ReportView";
import { PrintButton } from "@/components/app/PrintButton";

export default async function MyReportPage() {
  const user = await requireUser();

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-800">내 리포트</h1>
          <p className="text-stone-400 text-sm mt-0.5">{user.name}님의 낭독 활동 요약</p>
        </div>
        <PrintButton />
      </div>
      <ReportView userId={user.id} />
    </div>
  );
}
