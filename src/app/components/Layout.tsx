import { useState } from "react";
import { Outlet, NavLink } from "react-router";
import { 
  LayoutDashboard, 
  FolderClock, 
  ShieldAlert, 
  Cloud, 
  FileText,
  Search,
  Bell,
  Settings,
  User
} from "lucide-react";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white text-neutral-800 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-neutral-100 flex flex-col transition-all duration-300 relative z-20`}
      >
        <div className="p-4 h-16 flex items-center shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 overflow-hidden focus:outline-none w-full text-left group"
            title="Recolher/Expandir menu"
          >
            <div className="w-10 h-10 min-w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <ShieldAlert className="w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap flex-1">
                <h1 className="font-bold text-lg text-neutral-900 leading-tight">Sentinel360</h1>
                <p className="text-[10px] text-neutral-500 font-medium tracking-wide uppercase">File Management</p>
              </div>
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            <NavLink 
              to="/" 
              end
              title="Dashboard"
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 min-w-5" />
              {isSidebarOpen && <span>Dashboard</span>}
            </NavLink>

            <NavLink 
              to="/inactive-files"
              title="Arquivos Inativos"
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`
              }
            >
              <FolderClock className="w-5 h-5 min-w-5" />
              {isSidebarOpen && <span>Arquivos Inativos</span>}
            </NavLink>

            <NavLink 
              to="/sensitive-data"
              title="Dados Sensíveis"
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`
              }
            >
              <ShieldAlert className="w-5 h-5 min-w-5" />
              {isSidebarOpen && <span>Dados Sensíveis</span>}
            </NavLink>

            <NavLink 
              to="/integrations"
              title="Integrações"
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`
              }
            >
              <Cloud className="w-5 h-5 min-w-5" />
              {isSidebarOpen && <span>Integrações</span>}
            </NavLink>

            <NavLink 
              to="/reports"
              title="Relatórios"
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`
              }
            >
              <FileText className="w-5 h-5 min-w-5" />
              {isSidebarOpen && <span>Relatórios</span>}
            </NavLink>
          </div>
        </nav>

        <div className="p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 min-w-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-500">
              <User className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-neutral-900 truncate">Admin User</p>
                <p className="text-xs text-neutral-400 truncate">admin@company.com</p>
              </div>
            )}
            {isSidebarOpen && (
              <Settings className="w-5 h-5 text-neutral-400 cursor-pointer hover:text-emerald-600 transition-colors" />
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Header */}
        <header className="h-16 flex items-center px-4 md:px-8 shrink-0 relative z-10">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="max-w-xl w-full">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Buscar arquivos, pastas ou relatórios..."
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-neutral-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button className="relative p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:px-8 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
