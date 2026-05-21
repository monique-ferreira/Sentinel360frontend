import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FolderClock, ShieldAlert,
  Zap, FileBarChart2, LogOut, User,
  ChevronLeft, ChevronRight, Bell, Shield, Building2,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

const BASE_NAV = [
  { to: "/",               icon: LayoutDashboard, label: "Dashboard",         end: true  },
  { to: "/inactive-files", icon: FolderClock,     label: "Arquivos Inativos", end: false },
  { to: "/sensitive-data", icon: ShieldAlert,     label: "Dados Sensíveis",   end: false },
  { to: "/integrations",   icon: Zap,             label: "Integrações",       end: false },
  { to: "/reports",        icon: FileBarChart2,   label: "Relatórios",        end: false },
  { to: "/profile",        icon: User,            label: "Perfil",            end: false },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, token } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUserProfile(d); })
      .catch(() => {});
  }, [token]);

  const isAdmin = userProfile?.org_role === "admin" && userProfile?.account_type === "corporate";
  const isMember = userProfile?.account_type === "corporate" && userProfile?.org_role !== "admin" && userProfile?.org_status === "approved";

  const NAV = (() => {
    let nav = isAdmin
      ? [...BASE_NAV, { to: "/workspace", icon: Building2, label: "Workspace", end: false }]
      : BASE_NAV;
    if (isMember) {
      nav = nav.filter(n => n.to !== "/reports" && n.to !== "/sensitive-data");
    }
    return nav;
  })();

  useEffect(() => {
    if (isMember && (location.pathname === "/reports" || location.pathname === "/sensitive-data")) {
      navigate("/");
    }
  }, [isMember, location.pathname]);

  const pageTitle = NAV.find(n =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )?.label ?? "Sentinel360";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-56"} flex flex-col bg-[#080d14] border-r border-border transition-all duration-200 shrink-0 relative z-20`}>

        {/* Logo */}
        <div className={`h-14 flex items-center shrink-0 border-b border-border ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-none">Sentinel360</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">Cyber Defense</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors ${collapsed ? "justify-center" : ""} ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[3.25rem] w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-30"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* User / logout */}
        <div className={`p-2 border-t border-border ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button onClick={logout} title="Sair"
              className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 group">
              <button
                onClick={() => navigate("/profile")}
                title="Ver perfil"
                className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 hover:border-primary/40 transition-colors"
              >
                {userProfile?.username
                  ? <span className="text-xs font-medium text-muted-foreground">{userProfile.username[0]?.toUpperCase()}</span>
                  : <User className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <button onClick={() => navigate("/profile")} className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate">
                  {userProfile?.username ?? "Usuário"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {userProfile?.account_type === "corporate"
                    ? (userProfile?.org_name ?? "Corporativo")
                    : "Pessoal"}
                </p>
              </button>
              <button onClick={logout} title="Sair"
                className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground">Sentinel360 — Cyber Defense Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
