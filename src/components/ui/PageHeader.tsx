import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({ eyebrow, title, lede, actions, meta }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {lede ? <p className="page-lede">{lede}</p> : null}
        {meta ? <div className="meta-row">{meta}</div> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
