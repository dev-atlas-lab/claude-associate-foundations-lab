import { Info, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type CalloutTone = "note" | "caution" | "unverified";

const icons = {
  note: Info,
  caution: TriangleAlert,
  unverified: ShieldAlert,
} as const;

export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children: ReactNode;
}) {
  const Icon = icons[tone];

  return (
    <div className={`callout callout--${tone}`}>
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
      <div className="callout-body">
        <p className="callout-title">{title}</p>
        <div className="callout-text">{children}</div>
      </div>
    </div>
  );
}
