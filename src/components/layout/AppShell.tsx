import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { findNavItem } from "../../config/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function sectionLabelFor(pathname: string): string {
  if (pathname.startsWith("/learn/")) {
    return "Lesson";
  }

  return findNavItem(pathname)?.label ?? "Page not found";
}

export function AppShell() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);
  const isFirstRouteRef = useRef(true);

  useEffect(() => {
    if (!navOpen) {
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // Keep keyboard focus inside the open drawer: the rest of the shell is inert.
      const sidebar = document.getElementById("primary-navigation");
      const focusable = Array.from(
        sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !navOpen) {
      wasOpenRef.current = false;
      toggleButtonRef.current?.focus();
    }
  }, [navOpen]);

  // Start each new page at the top and move focus into the content region.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (isFirstRouteRef.current) {
      isFirstRouteRef.current = false;
      return;
    }

    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="app-shell" data-nav-open={navOpen ? "true" : "false"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Sidebar
        onClose={() => setNavOpen(false)}
        onNavigate={() => setNavOpen(false)}
        closeButtonRef={closeButtonRef}
      />

      {navOpen ? (
        <div className="nav-scrim" aria-hidden="true" onClick={() => setNavOpen(false)} />
      ) : null}

      <div className="app-main" inert={navOpen}>
        <Topbar
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
          toggleButtonRef={toggleButtonRef}
          sectionLabel={sectionLabelFor(location.pathname)}
        />
        <main id="main-content" className="main-content" tabIndex={-1} ref={mainRef}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
