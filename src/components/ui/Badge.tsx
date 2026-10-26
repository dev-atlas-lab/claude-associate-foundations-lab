import type { ReactNode } from "react";

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "info";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return <span className={`badge${tone === "neutral" ? "" : ` badge--${tone}`}`}>{children}</span>;
}
