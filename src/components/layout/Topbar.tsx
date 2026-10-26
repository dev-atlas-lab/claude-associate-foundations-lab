import { Menu } from "lucide-react";
import type { RefObject } from "react";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

export function Topbar({
  navOpen,
  onOpenNav,
  toggleButtonRef,
  sectionLabel,
}: {
  navOpen: boolean;
  onOpenNav: () => void;
  toggleButtonRef: RefObject<HTMLButtonElement | null>;
  sectionLabel: string;
}) {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          ref={toggleButtonRef}
          type="button"
          className="icon-button nav-toggle"
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          onClick={onOpenNav}
        >
          <Menu size={18} strokeWidth={1.9} aria-hidden="true" />
        </button>
        <p className="breadcrumb">
          <span className="breadcrumb-prefix">Claude Foundations</span>
          <span className="breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span className="breadcrumb-current">{sectionLabel}</span>
        </p>
      </div>
      <div className="topbar-end">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
