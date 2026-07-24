import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "북북 (BookBook) — 함께 소리 내어 읽기",
  description: "청소년의 문해력을 낭독으로 키우는 에듀테크 플랫폼, 북북",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="w-full flex-1 flex flex-col sm:min-h-screen sm:flex-row sm:items-center sm:justify-center sm:bg-gradient-to-br sm:from-slate-950 sm:via-slate-900 sm:to-indigo-950 sm:py-10 sm:px-4">
          <div className="relative flex flex-col flex-1 w-full bg-[var(--background)] sm:flex-none sm:w-[390px] sm:h-[844px] sm:max-h-[92dvh] sm:rounded-[2.75rem] sm:border-[10px] sm:border-black sm:shadow-2xl sm:overflow-hidden">
            <div className="hidden sm:flex absolute top-0 inset-x-0 justify-center z-50 pointer-events-none">
              <div className="w-32 h-6 bg-black rounded-b-2xl" />
            </div>
            <div className="flex flex-col flex-1 sm:overflow-y-auto">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
