import { useEffect, useState } from "react";
import {
  HardDrive, FolderClock, ShieldAlert, Database,
  RefreshCw, WifiOff, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

const RISK_COLORS: Record<string, string> = {
  Credencial:      "#f85149",
  "Token/Key":     "#d29922",
  CPF:             "#f85149",
  "Chave Privada": "#bc8cff",
  Email:           "#58a6ff",
  NENHUM:          "#3fb950",
  Nenhum:          "#3fb950",
};

function StatCard({
  title, value, sub, icon, color,
}: { title: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 relative overflow-hidden`}>
      <div className={`absolute inset-0 opacity-[0.04] ${color}`} style={{ background: "currentColor" }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
            <div className="opacity-70">{icon}</div>
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#161b22", border: "1px solid rgba(240,246,252,0.1)", borderRadius: "8px", fontSize: "12px" },
  labelStyle: { color: "#e6edf3" },
  itemStyle: { color: "#7d8590" },
};

export function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [threshold, setThreshold] = useState(180);
  const [isPending, setIsPending] = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [resultsRes, settingsRes, meRes] = await Promise.all([
        fetch(`${API_URL}/results`, { headers: h }),
        fetch(`${API_URL}/user/settings`, { headers: h }),
        fetch(`${API_URL}/user/me`, { headers: h }),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.account_type === "corporate" && me?.org_status === "pending") {
          setIsPending(true);
          setLoading(false);
          return;
        }
      }
      if (!resultsRes.ok) throw new Error(`Erro ${resultsRes.status}`);
      const data = await resultsRes.json();
      setItems(data.items ?? []);
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        if (s?.inactivity_days) setThreshold(s.inactivity_days);
      }
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponível. Aguarde 30s e tente novamente." : e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const isInactive = (i: any) => {
    const days = parseInt(i.dias_sem_acesso ?? "-1", 10);
    if (days >= 0) return days >= threshold;
    return i.inativo === "SIM" || i.Inativo === "SIM" || i.is_inactive;
  };

  const total   = items.length;
  const inactive = items.filter(isInactive).length;
  const atRisk  = items.filter(i => { const r = i.riscos || i.Riscos || ""; return r && r !== "NENHUM" && r !== "Nenhum"; }).length;
  const totalMB = items.reduce((s, i) => s + (parseFloat(i.tamanho_mb ?? i.Tamanho_MB ?? i.size_mb) || 0), 0);

  // Risk distribution for pie chart
  const riskMap: Record<string, number> = {};
  items.forEach(i => {
    const r = i.riscos || i.Riscos || "Nenhum";
    riskMap[r] = (riskMap[r] || 0) + 1;
  });
  const pieData = Object.entries(riskMap).map(([name, value]) => ({ name, value }));

  // Top directories bar chart (top 6 paths)
  const dirMap: Record<string, number> = {};
  items.forEach(i => {
    const path = (i.caminho || i.Caminho || i.path || "").split(/[\\/]/);
    const dir = path.slice(0, -1).slice(-2).join("/") || "raiz";
    dirMap[dir] = (dirMap[dir] || 0) + 1;
  });
  const barData = Object.entries(dirMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 20 ? "…" + name.slice(-18) : name, count }));

  // Top risk files
  const topRisk = items
    .filter(i => { const r = i.riscos || i.Riscos || ""; return r && r !== "NENHUM" && r !== "Nenhum"; })
    .slice(0, 6);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <HardDrive className="w-7 h-7 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Aguardando aprovação</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua solicitação de entrada na organização está sendo analisada pelo administrador.
            Você terá acesso completo ao Sentinel360 assim que for aprovado.
          </p>
        </div>
        <div className="w-full p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400/80 text-left space-y-1">
          <p className="font-medium text-yellow-400">O que acontece depois?</p>
          <p>• O administrador receberá sua solicitação no Workspace.</p>
          <p>• Ao ser aprovado, você terá acesso às integrações e relatórios da organização.</p>
          <p>• Você pode fechar essa janela — seu status é atualizado automaticamente.</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Verificar status
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {lastUpdate ? `Atualizado às ${lastUpdate}` : "Carregando dados..."}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {!error && !loading && total === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary/80">
          <TrendingUp className="h-4 w-4 shrink-0" />
          Nenhum scan realizado ainda. Vá em <strong className="text-primary mx-1">Integrações</strong> e inicie um scan.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total de arquivos"   value={loading ? "—" : total.toLocaleString("pt-BR")}  sub="monitorados"            icon={<HardDrive  className="w-4 h-4" />} color="text-[#58a6ff]" />
        <StatCard title="Arquivos inativos"   value={loading ? "—" : inactive.toLocaleString("pt-BR")} sub={`+${threshold} dias sem acesso`}  icon={<FolderClock className="w-4 h-4" />} color="text-[#d29922]" />
        <StatCard title="Com riscos"          value={loading ? "—" : atRisk.toLocaleString("pt-BR")}  sub="credenciais / tokens"   icon={<ShieldAlert className="w-4 h-4" />} color="text-[#f85149]" />
        <StatCard title="Storage detectado"   value={loading ? "—" : `${totalMB.toFixed(1)} MB`}     sub="em arquivos scaneados"  icon={<Database    className="w-4 h-4" />} color="text-[#3fb950]" />
      </div>

      {/* Charts row */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Bar chart */}
          <Section title="Arquivos por diretório (top 6)">
            <div className="p-5 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,246,252,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7d8590" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7d8590" }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#3fb950" radius={[4, 4, 0, 0]} name="Arquivos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Pie chart */}
          <div className="lg:col-span-2">
            <Section title="Distribuição de riscos">
              <div className="p-5 h-52 flex items-center gap-4">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                        paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={RISK_COLORS[entry.name] ?? "#7d8590"} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 min-w-0 flex-shrink-0">
                  {pieData.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: RISK_COLORS[d.name] ?? "#7d8590" }} />
                      <span className="text-xs text-muted-foreground truncate max-w-[90px]">{d.name}</span>
                      <span className="text-xs font-medium text-foreground ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* Top risk files */}
      {topRisk.length > 0 && (
        <Section title="Arquivos com maior risco">
          <div className="divide-y divide-border">
            {topRisk.map((item, i) => {
              const r = item.riscos || item.Riscos || "?";
              const color = RISK_COLORS[r] ?? "#7d8590";
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#f85149]/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-[#f85149]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.nome || item.Arquivo || item.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.caminho || item.Caminho || item.path}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                      style={{ color, borderColor: color + "40", background: color + "15" }}>
                      {r}
                    </span>
                    <span className="text-xs text-muted-foreground w-14 text-right">
                      {item.tamanho_mb ?? item.Tamanho_MB ?? item.size_mb} MB
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2.5">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Conectando ao servidor...</span>
        </div>
      )}
    </div>
  );
}
