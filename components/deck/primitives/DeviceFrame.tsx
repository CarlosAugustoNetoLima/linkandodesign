import type { ReactNode } from "react";
import { cx } from "@/components/deck/cx";

type Props = {
  kind: "browser" | "phone";
  url?: string;
  /** largura / altura do CONTEÚDO (a moldura não entra na conta) */
  aspect: number;
  className?: string;
  children: ReactNode;
};

const SHADOW = "0 28px 60px -28px rgba(23,23,26,.45)";

// Moldura de aparelho para as gravações: navegador ou celular.
// O pai define a largura; a altura vem do aspect do conteúdo.
export default function DeviceFrame({ kind, url, aspect, className, children }: Props) {
  if (kind === "phone") {
    return (
      <div
        className={cx("relative w-full rounded-[40px] p-[10px]", className)}
        style={{ background: "#0b0b0c", boxShadow: `0 0 0 1px rgba(23,23,26,.14), ${SHADOW}` }}
      >
        <div className="relative overflow-hidden rounded-[30px]" style={{ aspectRatio: aspect }}>
          {children}
          {/* ilha dinâmica, por cima do conteúdo */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[10px] z-10 h-5 -translate-x-1/2 rounded-full bg-black"
            style={{ width: "28%" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("w-full overflow-hidden rounded-[12px]", className)}
      style={{ background: "#0b0b0c", border: "1px solid var(--d-line)", boxShadow: SHADOW }}
    >
      <div className="relative flex h-[34px] items-center px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((d) => (
            <span key={d} className="h-2 w-2 rounded-full" style={{ background: "#4a4a50" }} />
          ))}
        </span>
        {url && (
          <span
            className="absolute left-1/2 top-1/2 max-w-[60%] -translate-x-1/2 -translate-y-1/2 truncate rounded-full px-3 py-0.5 text-[11px]"
            style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)" }}
          >
            {url}
          </span>
        )}
      </div>
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        {children}
      </div>
    </div>
  );
}
