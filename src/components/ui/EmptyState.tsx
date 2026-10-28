import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  children,
  actions,
  titleId,
  titleFocusable = false,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  /** Optional id so a caller can move focus to the state heading. */
  titleId?: string;
  titleFocusable?: boolean;
}) {
  return (
    <section className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <h2
        className="empty-title"
        id={titleId}
        tabIndex={titleFocusable ? -1 : undefined}
      >
        {title}
      </h2>
      <div className="empty-text">{children}</div>
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </section>
  );
}
