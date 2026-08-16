import { useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { useToastStore } from "../../store/toastStore";
import { theme } from "../../config/theme";

export type ShareCardTarget = {
  bookTitle: string;
  author: string;
  sentences: string[];
};

// 오프스크린으로 카드 하나를 실제로 그려두고 캡처만 하는 방식 — RN 버전의
// react-native-view-shot과 같은 접근. 마운트되자마자 두 번의 rAF 뒤 캡처(레이아웃/
// 폰트가 실제로 페인트될 시간을 줌) → Web Share API 지원 시 이미지 파일로 공유,
// 아니면 PNG 다운로드로 폴백. 끝나면 부모가 target을 null로 돌려서 언마운트.
export function ShareCardCapture({ target, onDone }: { target: ShareCardTarget; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(async () => {
        try {
          const node = ref.current;
          if (!node) return;
          const dataUrl = await toPng(node, { pixelRatio: 2 });
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "bookbook-card.png", { type: "image/png" });

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: theme.appName, text: `${target.bookTitle} · ${target.author}` });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bookbook-card.png";
            a.click();
            URL.revokeObjectURL(url);
            showToast("문장카드 이미지를 저장했어요");
          }
        } catch (err) {
          // Share cancelled by the user is expected, not an error.
          if ((err as { name?: string })?.name !== "AbortError") {
            console.warn("[share] 캡처/공유 실패", err);
            showToast("공유에 실패했어요");
          }
        } finally {
          onDone();
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: -9999, pointerEvents: "none" }} aria-hidden="true">
      <div
        ref={ref}
        style={{
          width: 360,
          padding: 32,
          background: theme.colors.ink,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <span style={{ fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 14, color: theme.colors.accent }}>{theme.appName}</span>
        <p style={{ fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 20, lineHeight: 1.6, wordBreak: "keep-all" }}>
          {target.sentences.join(" ")}
        </p>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700 }}>{target.bookTitle}</p>
          <p style={{ fontSize: 11, opacity: 0.6 }}>{target.author}</p>
        </div>
      </div>
    </div>
  );
}
