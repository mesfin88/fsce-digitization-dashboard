import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  Archive, ScanLine, FilePenLine, ClipboardCheck, Database, ShieldCheck,
  Users, ChartNoAxesCombined, LayoutDashboard, ChevronLeft, ChevronRight,
  Bell, Search, Scale, Menu, LogOut, Settings
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS, type Role } from "../types";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, roles: ["archive_staff","scanning_operator","scanning_supervisor","editing_operator","editing_supervisor","qc_officer","archive_head","ict_admin"] },
  { to: "/archive", label: "Archive & allocation", icon: Archive, roles: ["archive_staff","scanning_supervisor","archive_head","ict_admin"] },
  { to: "/scanning", label: "Scanning operations", icon: ScanLine, roles: ["scanning_operator","scanning_supervisor","archive_head","ict_admin"] },
  { to: "/editing", label: "Editing operations", icon: FilePenLine, roles: ["editing_operator","editing_supervisor","archive_head","ict_admin"] },
  { to: "/quality-control", label: "Quality control", icon: ClipboardCheck, roles: ["qc_officer","editing_supervisor","archive_head","ict_admin"] },
  { to: "/repository", label: "DSpace repository", icon: Database, roles: ["editing_supervisor","archive_head","ict_admin"] },
  { to: "/approval", label: "Final approval", icon: ShieldCheck, roles: ["archive_head","ict_admin"] },
  { to: "/reports", label: "Reports & audit", icon: ChartNoAxesCombined, roles: ["archive_staff","scanning_supervisor","editing_supervisor","qc_officer","archive_head","ict_admin"] },
  { to: "/users", label: "Users & permissions", icon: Users, roles: ["ict_admin"] },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, setRole, displayName } = useAuth();
  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Scale size={22}/></div>
        {!collapsed && <div className="brand-copy"><strong>Federal Supreme Court</strong><span>Case Digitization</span></div>}
      </div>
      <div className="nav-label">{!collapsed && "WORKSPACE"}</div>
      <nav className="nav-list">
        {nav.filter(item => item.roles.includes(role)).map(item => {
          const Icon = item.icon;
          return <NavLink key={item.to} to={item.to} end={item.to === "/"} title={collapsed ? item.label : undefined} className={({isActive}) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
            <Icon size={19}/>{!collapsed && <span>{item.label}</span>}
          </NavLink>;
        })}
      </nav>
      <div className="sidebar-bottom">
        {!collapsed && <div className="privacy-note"><ShieldCheck size={16}/><span>Restricted court records<br/><b>Authorized access only</b></span></div>}
        <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar">{collapsed ? <ChevronRight size={18}/> : <><ChevronLeft size={18}/><span>Collapse sidebar</span></>}</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(v => !v)} aria-label="Open menu"><Menu size={20}/></button>
        <div className="crumb"><span>Digitization</span><span className="crumb-sep">/</span><b>Workspace</b></div>
        <div className="top-actions">
          <div className="top-search"><Search size={16}/><input aria-label="Quick search" placeholder="Search case number…"/></div>
          <button className="icon-btn" title="Notifications"><Bell size={19}/><i className="notification-dot"/></button>
          <div className="user-chip"><div className="avatar">DU</div><div className="user-info"><b>{displayName}</b><span>{ROLE_LABELS[role]}</span></div></div>
        </div>
      </header>
      <div className="role-switch"><Settings size={14}/><span>Demo role preview</span><select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Preview role">{Object.entries(ROLE_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select><span className="demo-warning">Connect backend authentication before production.</span></div>
      <section className="page-content"><Outlet/></section>
      <footer className="footer"><span>Federal Supreme Court · Case Digitization Management System</span><span>Internal use · Workflow events should be audited</span></footer>
    </main>
  </div>;
}