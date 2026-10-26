import { BookOpen, BrainCircuit, ChartNoAxesCombined, Compass, House, Settings2 } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: House, end: true },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: BrainCircuit },
  { to: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { to: "/glossary", label: "Glossary", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell() {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">C</span>
          <span>
            <strong>Claude Foundations</strong>
            <small>LEARNING LAB</small>
          </span>
        </NavLink>
        <div className="nav-label">LEARNING SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          <span>Local learning profile</span>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <span className="breadcrumb">FOUNDATIONS <span>/</span> ASSOCIATE</span>
          <span className="topbar-note">A study space built for understanding</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
