import { X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { navigation } from "../../config/navigation";
import type { RefObject } from "react";

export function Sidebar({
  onClose,
  onNavigate,
  closeButtonRef,
}: {
  onClose: () => void;
  onNavigate: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <aside className="app-sidebar" id="primary-navigation" aria-label="Primary">
      <div className="sidebar-top">
        <Link to="/" className="brand" onClick={onNavigate}>
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span className="brand-copy">
            <span className="brand-name">Claude Foundations</span>
            <span className="brand-sub">Learning lab</span>
          </span>
        </Link>
        <button
          ref={closeButtonRef}
          type="button"
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Sections">
        {navigation.map((group) => (
          <div className="nav-group" key={group.heading}>
            <p className="nav-heading">{group.heading}</p>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="nav-link"
                onClick={onNavigate}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-status">
          <span className="status-dot" aria-hidden="true" />
          Progress stays in this browser
        </p>
        <p className="sidebar-meta">Scaffold · curriculum pending verification</p>
      </div>
    </aside>
  );
}
