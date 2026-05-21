import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, RefreshCw, Search, Download, Zap,
  ShieldAlert, FolderClock, HardDrive, WifiOff,
  Calendar, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
const PAGE_SIZE = 50;

const RISK_CFG: Record<string, string> = {
  "Credencial":    "#f85149",
  "Token/Key":     "#d29922",
  "CPF":           "#f85149",
  "Chave Privada": "#bc8cff",
  "Email":         "#58a6ff",
};
const getRiskColor = (r: string) =>
  Object.entries(RISK_CFG).find(([k]) => r.includes(k))?.[1] ?? "#7d8590";

export function MemberData() {
  const { username: targetUsername } = useParams<{ username: string }>();
  const navigate  = useNavigate();
  const { token } = useAuth();

  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [threshold, setThreshold] = useState(180);

  // filters
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos"|"ativo"|"inativo">("todos");
  const [riskFilter, setRiskFilter]   = useState<"todos"|"com_risco"|"sem_risco">("todos");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");

  // pagination
  const [page, setPage] = useState(1);

  // actions
  const [scanning, setScanning]       = useState(false);
  const [scanMsg, setScanMsg]         = useState("");
  const [biLoading, setBiLoading]     = useState(false);

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [resultsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/workspace/member/${targetUsername}/results`, { headers: h }),
        fetch(`${API_URL}/user/settings`, { headers: h }),
      ]);
      if (!resultsRes.ok) throw new Error(`Erro ${resultsRes.status}`);
      const data = await resultsRes.json();
      setItems(data.items ?? []);
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        if (s?.inactivity_days) setThreshold(s.inactivity_days);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar dados.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [targetUsername]);
  useEffect(() => { setPage(1); }, [search, statusFilter, riskFilter, dateFrom, dateTo]);

  const isInactive = (i: any) => {
    const days = parseInt(i.dias_sem_acesso ?? "-1", 10);
    if (days >= 0) return days >= threshold;
    return i.inativo === "SIM" || i.Inativo === "SIM";
  };

  const filtered = useMemo(() => {
    let r = items;
    if (statusFilter === "ativo")    r = r.filter(i => !isInactive(i));
    if (statusFilter === "inativo")  r = r.filter(i =>  isInactive(i));
    if (riskFilter === "com_risco")  r = r.filter(i => { const v = i.riscos||""; return v && v !== "NENHUM"; });
    if (riskFilter === "sem_risco")  r = r.filter(i => { const v = i.riscos||""; return !v || v === "NENHUM"; });
    if (dateFrom) r = r.filter(i => (i.ultimo_acesso||i.last_scan||"").slice(0,10) >= dateFrom);
    if (dateTo)   r = r.filter(i => (i.ultimo_acesso||i.last_scan||"").slice(0,10) <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        (i.nome||i.name||"").toLowerCase().includes(q) ||
        (i.caminho||i.path||"").toLowerCase().includes(q) ||
        (i.riscos||"").toLowerCase().includes(q)
      );
    }
    return r;
  }, [items, statusFilter, riskFilter, dateFrom, dateTo, search, threshold]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // summary stats
  const totalFiles  = items.length;
  const inactiveCount = items.filter(isInactive).length;
  const riskyCount  = items.filter(i => i.riscos && i.riscos !== "NENHUM").length;
  const storageMB   = items.reduce((s, i) => s + (parseFloat(i.tamanho_mb)||0), 0);

  const handleScan = async () => {
    setScanning(true); setScanMsg("");
    try {
      const res = await fetch(`${API_URL}/workspace/member/${targetUsername}/scan`, { method: "POST", headers: h });
      const data = await res.json();
      setScanMsg(res.ok ? (data.message ?? "Scan iniciado.") : (data.detail ?? "Erro ao iniciar scan."));
    } catch { setScanMsg("Erro de conexão."); }
    finally { setScanning(false); setTimeout(() => setScanMsg(""), 5000); }
  };

  const handleBi = async () => {
    setBiLoading(true);
    try {
      const res = await fetch(`${API_URL}/workspace/bi-report?target_username=${encodeURIComponent(targetUsername!)}`, { headers: h });
      if (!res.ok) { setBiLoading(false); return; }
      const blob = await res.blob();
      const match = (res.headers.get("Content-Disposition")||"").match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `sentinel360_bi_${targetUsername}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    finally { setBiLoading(false); }
  };

  const chipBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
      active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5"
    }`;

  const clearFilters = () => { setSearch(""); setStatusFilter("todos"); setRiskFilter("todos"); setDateFrom(""); setDateTo(""); };
  const hasFilters = search || statusFilter !== "todos" || riskFilter !== "todos" || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/workspace")}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#bc8cff]/10 border border-[#bc8cff]/20 flex items-center justify-center text-xs font-semibold text-[#bc8cff]">
                {targetUsername?.[0]?.toUpperCase()}
              </span>
              {targetUsername}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Dados de varredura do membro</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleScan} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#58a6ff]/30 text-[#58a6ff] hover:bg-[#58a6ff]/10 disabled:opacity-40 transition-colors">
            {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {scanning ? "Iniciando scan..." : "Iniciar scan"}
          </button>
          <button onClick={handleBi} disabled={biLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-40 transition-colors">
            {biLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Exportar BI
          </button>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {scanMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" /> {scanMsg}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Summary chips */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: totalFiles, icon: HardDrive, color: "#58a6ff" },
            { label: "Inativos", value: inactiveCount, icon: FolderClock, color: "#d29922" },
            { label: "Com risco", value: riskyCount, icon: ShieldAlert, color: "#f85149" },
            { label: "Storage", value: `${storageMB.toFixed(1)} MB`, icon: HardDrive, color: "#3fb950" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "18", border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-bold text-foreground tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, caminho ou tipo de risco..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
            {search && <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">✕</button>}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            <button onClick={() => setStatusFilter("todos")}   className={chipBtn(statusFilter === "todos")}>Todos</button>
            <button onClick={() => setStatusFilter("ativo")}   className={chipBtn(statusFilter === "ativo")}>Ativos</button>
            <button onClick={() => setStatusFilter("inativo")} className={chipBtn(statusFilter === "inativo")}>Inativos</button>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-xs text-muted-foreground mr-1">Risco:</span>
            <button onClick={() => setRiskFilter("todos")}     className={chipBtn(riskFilter === "todos")}>Todos</button>
            <button onClick={() => setRiskFilter("com_risco")} className={chipBtn(riskFilter === "com_risco")}>Com risco</button>
            <button onClick={() => setRiskFilter("sem_risco")} className={chipBtn(riskFilter === "sem_risco")}>Sem risco</button>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Último acesso:</span>
            <div className="flex items-center h-8 px-3 rounded-lg border border-border bg-card">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="h-full bg-transparent text-xs text-foreground focus:outline-none" />
            </div>
            <span className="text-xs text-muted-foreground">até</span>
            <div className="flex items-center h-8 px-3 rounded-lg border border-border bg-card">
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="h-full bg-transparent text-xs text-foreground focus:outline-none" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-muted-foreground hover:text-foreground px-1">✕ limpar datas</button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risco</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Último acesso</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tam.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((item, i) => {
                  const risco   = item.riscos || "";
                  const inativo = isInactive(item);
                  const hasRisk = risco && risco !== "NENHUM";
                  const rColor  = hasRisk ? getRiskColor(risco) : undefined;
                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <a href={item.caminho || item.path || "#"} target="_blank" rel="noreferrer"
                          className="font-medium text-foreground break-words whitespace-normal hover:text-primary transition-colors block max-w-[280px]"
                          title={item.nome || item.name}>{item.nome || item.name}</a>
                        <span className="text-xs text-muted-foreground break-all whitespace-normal block max-w-[280px] mt-0.5">{item.caminho || item.path}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          inativo ? "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/10" : "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/10"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inativo ? "bg-[#d29922]" : "bg-[#3fb950]"}`} />
                          {inativo ? "Inativo" : "Ativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasRisk && rColor ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{ color: rColor, borderColor: rColor + "40", background: rColor + "18" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: rColor }} />{risco}
                          </span>
                        ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {item.ultimo_acesso || item.last_scan || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                        {item.tamanho_mb} MB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer: count + pagination */}
            <div className="px-4 py-2.5 border-t border-border bg-secondary/20 flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                {filtered.length} arquivo(s){hasFilters ? ` (filtrado de ${items.length})` : ""}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="tabular-nums">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {hasFilters && (
                    <button onClick={clearFilters} className="ml-2 hover:text-foreground transition-colors">Limpar filtros</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <HardDrive className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Nenhum dado encontrado para {targetUsername}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Inicie um scan para detectar arquivos</p>
          <button onClick={handleScan} disabled={scanning}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-[#58a6ff]/30 text-[#58a6ff] text-sm hover:bg-[#58a6ff]/10 disabled:opacity-40 transition-colors mx-auto">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Iniciar scan
          </button>
        </div>
      )}
    </div>
  );
}
