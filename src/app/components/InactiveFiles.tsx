import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, FolderClock, Search, FolderOpen, Clock } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

const getStoredDays = () => {
  const s = localStorage.getItem("sentinel360_inactivity_days");
  return s ? parseInt(s, 10) : 180;
};

export function InactiveFiles() {
  const { token } = useAuth();
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [threshold, setThreshold] = useState<number>(getStoredDays);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setAllItems(data.items ?? []);
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveThreshold = (v: number) => {
    setThreshold(v);
    localStorage.setItem("sentinel360_inactivity_days", String(v));
  };

  // Apply threshold + search + date filters
  const inactive = allItems.filter(i => {
    const days = parseInt(i.dias_sem_acesso ?? "-1", 10);
    // If dias_sem_acesso available, use it; otherwise fall back to inativo flag
    if (days >= 0) return days >= threshold;
    return i.inativo === "SIM" || i.Inativo === "SIM";
  });

  const filtered = inactive.filter(i => {
    const name  = (i.nome || i.Arquivo || i.name || "").toLowerCase();
    const path  = (i.caminho || i.Caminho || i.path || "").toLowerCase();
    const q     = search.toLowerCase();
    const matchSearch = !search.trim() || name.includes(q) || path.includes(q);
    const matchDate   = !dateFrom || (i.last_scan && i.last_scan >= dateFrom);
    return matchSearch && matchDate;
  });

  const totalMB = inactive.reduce(
    (s, i) => s + (parseFloat(i.tamanho_mb ?? i.Tamanho_MB ?? i.size_mb) || 0), 0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderClock className="h-5 w-5 text-[#d29922]" />
            Arquivos Inativos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arquivos sem acesso há mais de {threshold} dias
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Threshold input */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Inativo após</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={threshold}
              onChange={e => {
                const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                saveThreshold(!isNaN(v) && v >= 1 ? v : 1);
              }}
              className="w-12 h-7 px-1 rounded border border-border bg-secondary text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-xs text-muted-foreground">dias</span>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Summary chips */}
      {!loading && inactive.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d29922]/10 border border-[#d29922]/20 text-xs text-[#d29922] font-medium">
            <FolderClock className="h-3.5 w-3.5" />
            {inactive.length} arquivo(s) inativo(s)
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/20 text-xs text-[#58a6ff] font-medium">
            {totalMB.toFixed(1)} MB ocupados
          </div>
          {(search || dateFrom) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-muted-foreground">
              {filtered.length} de {inactive.length} exibido(s) após filtro
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Filters row */}
      {!loading && allItems.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filtrar por nome ou caminho..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">✕</button>
            )}
          </div>
          {/* Date filter */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Scan desde</span>
            <input
              type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-7 bg-transparent text-xs text-foreground focus:outline-none"
            />
            {dateFrom && (
              <button onClick={() => setDateFrom("")}
                className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            {search || dateFrom
              ? "Sem resultados para os filtros aplicados"
              : `Nenhum arquivo inativo (>${threshold} dias) encontrado`}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {!search && !dateFrom && "Execute um scan para detectar arquivos inativos"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Caminho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Dias sem acesso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Último scan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamanho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item, i) => {
                const days = parseInt(item.dias_sem_acesso ?? "-1", 10);
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#d29922]/10 flex items-center justify-center shrink-0">
                          <FolderClock className="w-3.5 h-3.5 text-[#d29922]" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[180px]">
                          {item.nome || item.Arquivo || item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[260px] hidden md:table-cell">
                      <a href={item.caminho || item.Caminho || "#"} target="_blank" rel="noreferrer"
                        className="hover:text-foreground transition-colors truncate block max-w-[260px]"
                        title={item.caminho || item.Caminho}>
                        {item.caminho || item.Caminho || item.path}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">
                      {days >= 0
                        ? <span className="text-[#d29922] font-medium">{days}d</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {item.last_scan || item.Data || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-muted-foreground tabular-nums">
                      {item.tamanho_mb ?? item.Tamanho_MB ?? item.size_mb} MB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border bg-secondary/20 text-xs text-muted-foreground flex justify-between items-center">
            <span>{filtered.length} de {inactive.length} arquivo(s)</span>
            {(search || dateFrom) && (
              <button onClick={() => { setSearch(""); setDateFrom(""); }}
                className="hover:text-foreground transition-colors">Limpar filtros</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
