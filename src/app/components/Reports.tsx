import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, FileBarChart2, Search, Trash2, CheckCircle2, Calendar } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

const RISK_CFG: Record<string, { color: string }> = {
  "Credencial":      { color: "#f85149" },
  "Token/Key":       { color: "#d29922" },
  "CPF":             { color: "#f85149" },
  "Chave Privada":   { color: "#bc8cff" },
  "Email":           { color: "#58a6ff" },
};
const getRiskColor = (r: string) => Object.entries(RISK_CFG).find(([k]) => r.includes(k))?.[1].color ?? "#7d8590";

export function Reports() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [riskFilter, setRiskFilter] = useState<"todos" | "com_risco" | "sem_risco">("todos");
  const [threshold, setThreshold] = useState(180);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const h = { Authorization: `Bearer ${token}` };

  const checkInactive = (i: any, thr: number) => {
    const days = parseInt(i.dias_sem_acesso ?? "-1", 10);
    if (days >= 0) return days >= thr;
    return i.inativo === "SIM" || i.Inativo === "SIM" || i.is_inactive;
  };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [resultsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/results`, { headers: h }),
        fetch(`${API_URL}/user/settings`, { headers: h }),
      ]);
      if (!resultsRes.ok) throw new Error(`Erro ${resultsRes.status}`);
      const data = await resultsRes.json();
      const all = (data.items ?? []).filter((i: any) => !deleted.includes(i.caminho || i.Caminho || i.path));
      let thr = threshold;
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        if (s?.inactivity_days) { thr = s.inactivity_days; setThreshold(thr); }
      }
      setItems(all); setFiltered(all);
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponível. Aguarde o servidor iniciar (30s)." : e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = items;
    if (statusFilter === "ativo")   result = result.filter(i => !checkInactive(i, threshold));
    if (statusFilter === "inativo") result = result.filter(i =>  checkInactive(i, threshold));
    if (riskFilter === "com_risco") result = result.filter(i => { const r = i.riscos || i.Riscos || ""; return r && r !== "NENHUM" && r !== "Nenhum"; });
    if (riskFilter === "sem_risco") result = result.filter(i => { const r = i.riscos || i.Riscos || ""; return !r || r === "NENHUM" || r === "Nenhum"; });
    if (dateFrom) result = result.filter(i => {
      const d = (i.ultimo_acesso || i.last_scan || "").slice(0, 10);
      return d >= dateFrom;
    });
    if (dateTo) result = result.filter(i => {
      const d = (i.ultimo_acesso || i.last_scan || "").slice(0, 10);
      return d <= dateTo;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        (i.nome || i.Arquivo || i.name || "").toLowerCase().includes(q) ||
        (i.caminho || i.Caminho || i.path || "").toLowerCase().includes(q) ||
        (i.riscos || i.Riscos || "").toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, riskFilter, items, threshold, dateFrom, dateTo]);

  const handleDelete = async (item: any) => {
    const path = item.caminho || item.Caminho || item.path;
    const nome = item.nome || item.Arquivo || item.name || path;
    if (!window.confirm(`Excluir "${nome}" do Sentinel360 e do OneDrive?`)) return;
    setDeleting(path);
    try {
      const res = await fetch(
        `${API_URL}/delete-item?path=${encodeURIComponent(path)}&from_cloud=true`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail ?? `Erro ${res.status} ao excluir.`);
        return;
      }
      setDeleted(p => [...p, path]);
      setItems(p => p.filter(i => (i.caminho || i.Caminho || i.path) !== path));
    } catch { alert("Erro de conexão ao tentar excluir."); }
    finally { setDeleting(null); }
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("todos"); setRiskFilter("todos"); setDateFrom(""); setDateTo(""); };
  const hasFilters = search || statusFilter !== "todos" || riskFilter !== "todos" || dateFrom || dateTo;

  const chipBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
      active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5"
    }`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileBarChart2 className="h-5 w-5 text-[#58a6ff]" />
            Relatórios
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todos os arquivos detectados no último scan
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Sincronizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {!loading && items.length > 0 && (
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

          {/* Filters row */}
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

          {/* Date range filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Último acesso:</span>
            <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card">
              <input
                type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="h-full bg-transparent text-xs text-foreground focus:outline-none"
                title="De"
              />
            </div>
            <span className="text-xs text-muted-foreground">até</span>
            <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card">
              <input
                type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="h-full bg-transparent text-xs text-foreground focus:outline-none"
                title="Até"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-muted-foreground hover:text-foreground px-1">✕ limpar datas</button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          {hasFilters ? (
            <>
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">Nenhum resultado para os filtros aplicados</p>
              <button onClick={clearFilters} className="mt-3 text-sm text-primary hover:underline">Limpar filtros</button>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-[#3fb950]/40" />
              <p className="font-medium text-muted-foreground">Nenhum arquivo detectado ainda</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Vá em Integrações e inicie um scan</p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risco</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Data scan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tam.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item, i) => {
                const risco = item.riscos || item.Riscos || "";
                const inativo = checkInactive(item, threshold);
                const hasRisk = risco && risco !== "NENHUM" && risco !== "Nenhum";
                const path = item.caminho || item.Caminho || item.path;
                const nome = item.nome || item.Arquivo || item.name;
                const rColor = hasRisk ? getRiskColor(risco) : undefined;
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground truncate block max-w-[180px]" title={nome}>{nome}</span>
                      <span className="text-xs text-muted-foreground truncate block max-w-[180px]">{item.caminho || item.Caminho || item.path}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        inativo
                          ? "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/10"
                          : "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inativo ? "bg-[#d29922]" : "bg-[#3fb950]"}`} />
                        {inativo ? "Inativo" : "Ativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasRisk && rColor ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{ color: rColor, borderColor: rColor + "40", background: rColor + "18" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: rColor }} />
                          {risco}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {item.last_scan || item.Data || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                      {item.tamanho_mb ?? item.Tamanho_MB ?? item.size_mb} MB
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(item)} disabled={deleting === path}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors mx-auto"
                        title="Excluir">
                        {deleting === path
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border bg-secondary/20 text-xs text-muted-foreground flex justify-between items-center">
            <span>{filtered.length} de {items.length} arquivo(s)</span>
            {hasFilters && (
              <button onClick={clearFilters} className="hover:text-foreground transition-colors">Limpar filtros</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
