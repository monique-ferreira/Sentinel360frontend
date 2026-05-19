import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, FolderClock, Search, FolderOpen } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360-production.up.railway.app";

export function InactiveFiles() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const inactive = (data.items ?? []).filter(
        (i: any) => i.inativo === "SIM" || i.Inativo === "SIM" || i.is_inactive === true
      );
      setItems(inactive);
      setFiltered(inactive);
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(i => {
      const n = (i.nome || i.Arquivo || i.name || "").toLowerCase();
      const p = (i.caminho || i.Caminho || i.path || "").toLowerCase();
      return n.includes(q) || p.includes(q);
    }));
  }, [search, items]);

  const totalMB = items.reduce((s, i) => s + (parseFloat(i.tamanho_mb ?? i.Tamanho_MB ?? i.size_mb) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderClock className="h-5 w-5 text-[#d29922]" />
            Arquivos Inativos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arquivos sem acesso há mais de 180 dias
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Summary chips */}
      {!loading && items.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d29922]/10 border border-[#d29922]/20 text-xs text-[#d29922] font-medium">
            <FolderClock className="h-3.5 w-3.5" />
            {items.length} arquivo(s) inativo(s)
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/20 text-xs text-[#58a6ff] font-medium">
            {totalMB.toFixed(1)} MB ocupados
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Search */}
      {!loading && items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar por nome ou caminho..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              ✕
            </button>
          )}
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
            {search ? `Sem resultados para "${search}"` : "Nenhum arquivo inativo encontrado"}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {!search && "Execute um scan para detectar arquivos inativos"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Caminho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Último scan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamanho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item, i) => (
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
                    {item.caminho || item.Caminho || item.path}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {item.last_scan || item.Data || item.last_accessed || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-muted-foreground tabular-nums">
                    {item.tamanho_mb ?? item.Tamanho_MB ?? item.size_mb} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border bg-secondary/20 text-xs text-muted-foreground flex justify-between items-center">
            <span>{filtered.length} de {items.length} arquivo(s)</span>
            {search && <button onClick={() => setSearch("")} className="hover:text-foreground transition-colors">Limpar filtro</button>}
          </div>
        </div>
      )}
    </div>
  );
}
