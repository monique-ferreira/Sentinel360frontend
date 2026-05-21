import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, ShieldAlert, Search, ShieldOff } from "lucide-react";
import { useAuth } from "../AuthContext";
import { FileViewerModal } from "./FileViewerModal";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

interface RiskConfig { color: string; bg: string; border: string; }
const RISK: Record<string, RiskConfig> = {
  "Credencial":      { color: "#f85149", bg: "#f85149", border: "#f85149" },
  "Token/Key":       { color: "#d29922", bg: "#d29922", border: "#d29922" },
  "CPF":             { color: "#f85149", bg: "#f85149", border: "#f85149" },
  "Chave Privada":   { color: "#bc8cff", bg: "#bc8cff", border: "#bc8cff" },
  "Email":           { color: "#58a6ff", bg: "#58a6ff", border: "#58a6ff" },
};
const getRisk = (r: string): RiskConfig =>
  Object.entries(RISK).find(([k]) => r.includes(k))?.[1] ?? { color: "#7d8590", bg: "#7d8590", border: "#7d8590" };

function RiskBadge({ risk }: { risk: string }) {
  const { color, bg } = getRisk(risk);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{ color, borderColor: bg + "40", background: bg + "18" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {risk}
    </span>
  );
}

export function SensitiveData() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);

  const h = { Authorization: `Bearer ${token}` };

  const isCorporate = userProfile?.account_type === "corporate";
  const isAdmin     = isCorporate && userProfile?.org_role === "admin";
  const canOpenFile = !isCorporate || isAdmin;

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [res, profileRes] = await Promise.all([
        fetch(`${API_URL}/results`, { headers: h }),
        fetch(`${API_URL}/user/me`, { headers: h }),
      ]);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const risky = (data.items ?? []).filter((i: any) => {
        const r = i.riscos || i.Riscos || "";
        return r && r !== "NENHUM" && r !== "Nenhum";
      });
      setItems(risky); setFiltered(risky);
      if (profileRes.ok) setUserProfile(await profileRes.json());
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Filter by risk type + search
  useEffect(() => {
    let result = items;
    if (activeFilter !== "Todos") result = result.filter(i => (i.riscos || i.Riscos || "").includes(activeFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        (i.nome || i.Arquivo || i.name || "").toLowerCase().includes(q) ||
        (i.caminho || i.Caminho || i.path || "").toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, items]);

  // Count by risk type for filter chips
  const riskCounts: Record<string, number> = { Todos: items.length };
  items.forEach(i => {
    const r = i.riscos || i.Riscos || "Outro";
    riskCounts[r] = (riskCounts[r] || 0) + 1;
  });
  const filters = ["Todos", ...Object.keys(riskCounts).filter(k => k !== "Todos")];

  return (
    <>
    <FileViewerModal item={viewItem} onClose={() => setViewItem(null)} />
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#f85149]" />
            Dados Sensíveis
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arquivos com credenciais, tokens e dados pessoais detectados
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          {/* Risk type filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => {
              const cfg = f === "Todos" ? null : getRisk(f);
              const active = activeFilter === f;
              return (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  style={active && cfg ? { borderColor: cfg.color + "40", background: cfg.bg + "18", color: cfg.color } : {}}>
                  {f !== "Todos" && cfg && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />}
                  {f} {riskCounts[f] ? <span className="opacity-60">({riskCounts[f]})</span> : null}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filtrar por nome ou caminho..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">✕</button>
            )}
          </div>
        </>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <ShieldOff className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            {search || activeFilter !== "Todos" ? "Nenhum resultado para o filtro aplicado" : "Nenhum dado sensível detectado"}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {!search && activeFilter === "Todos" && "Execute um scan para detectar arquivos sensíveis"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risco</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Caminho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Data</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tam.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item, i) => {
                const r = item.riscos || item.Riscos || "?";
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#f85149]/10 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#f85149]" />
                        </div>
                        {canOpenFile ? (
                          <button onClick={() => setViewItem(item)}
                            className="font-medium text-foreground truncate max-w-[160px] hover:text-primary transition-colors text-left">
                            {item.nome || item.Arquivo || item.name}
                          </button>
                        ) : (
                          <span className="font-medium text-foreground truncate max-w-[160px]">
                            {item.nome || item.Arquivo || item.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><RiskBadge risk={r} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[240px] hidden md:table-cell">
                      {item.caminho || item.Caminho || item.path}
                    </td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">
                      <span className="text-muted-foreground">{item.ultimo_acesso || "—"}</span>
                      {item.last_scan && (
                        <span className="block text-[10px] text-muted-foreground/50 mt-0.5">scan: {item.last_scan.slice(0, 10)}</span>
                      )}
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
            <span>{filtered.length} de {items.length} arquivo(s) com risco</span>
            {(search || activeFilter !== "Todos") && (
              <button onClick={() => { setSearch(""); setActiveFilter("Todos"); }} className="hover:text-foreground transition-colors">
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
