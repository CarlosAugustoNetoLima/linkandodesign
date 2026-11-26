import type { ReactNode } from "react";


export function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-line bg-surface shadow-card ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-ink/30" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
        </span>
        <span className="mx-auto truncate rounded-full bg-paper px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-ink/70">
          {url}
        </span>
      </div>
      {children}
    </figure>
  );
}

export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-[16px] border-[3px] border-ink bg-ink shadow-card sm:rounded-[20px] sm:border-4 ${className ?? ""}`}
    >
      {children}
    </figure>
  );
}
