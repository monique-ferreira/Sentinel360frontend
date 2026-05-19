import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ShieldAlert, FileX, AlertTriangle, HardDrive, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

function StatCard({ title, value, subtitle, icon, color = "default" }: {
  title: string; value: string; subtitle?: string; icon: React.ReactNode; color?: string;
}) {
  const bg: Record<string, string> = {
    default: "bg-card",
    danger: "bg-red-50",
    warning: "bg-amber-50",
    info: "bg-blue-50",
  };
  const tx: Record<string, string> = {
    default: "text-foreground",
    danger: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };
  return (
    <Card className={bg[color]}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <span className={`${tx[color]} opacity-70`}>{icon}</span>
        </div>
        <p className={`text-3xl font-semibold ${tx[color]}`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    } catch (e: any) {
      setError(
        e.message?.includes("fetch")
          ? "Servidor indisponível. Aguarde o servidor iniciar (30s)."
          : e.message
      );
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const total = items.length;
  const inativos = items.filter(i => i.inativo === "SIM" || i.Inativo === "SIM" || i.is_inactive).length;
  const comRiscos = items.filter(i => {
    const r = i.riscos || i.Riscos || "";
    return r && r !== "NENHUM" && r !== "Nenhum";
  }).length;
  const totalMB = items.reduce(
    (s, i) => s + (parseFloat(i.tamanho_mb ?? i.Tamanho_MB ?? i.size_mb) || 0),
    0
  );
  const topRiscos = items
    .filter(i => {
      const r = i.riscos || i.Riscos || "";
      return r && r !== "NENHUM" && r !== "Nenhum";
    })
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {lastUpdate && <p className="text-xs text-muted-foreground">Atualizado: {lastUpdate}</p>}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          <WifiOff className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {!error && !loading && total === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <Wifi className="h-4 w-4 shrink-0" />
          Nenhum scan realizado ainda. Vá em <strong className="mx-1">Integrações</strong> e clique em Iniciar Scan.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Arquivos monitorados"
          value={loading ? "—" : total.toLocaleString("pt-BR")}
          subtitle="total detectado"
          icon={<HardDrive className="h-5 w-5" />}
        />
        <StatCard
          title="Arquivos inativos"
          value={loading ? "—" : inativos.toLocaleString("pt-BR")}
          subtitle="+180 dias sem acesso"
          icon={<FileX className="h-5 w-5" />}
          color="warning"
        />
        <StatCard
          title="Com riscos"
          value={loading ? "—" : comRiscos.toLocaleString("pt-BR")}
          subtitle="credenciais / tokens"
          icon={<ShieldAlert className="h-5 w-5" />}
          color="danger"
        />
        <StatCard
          title="Storage total"
          value={loading ? "—" : `${totalMB.toFixed(1)} MB`}
          subtitle="em arquivos detectados"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="info"
        />
      </div>

      {topRiscos.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Arquivos com maior risco</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topRiscos.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.nome || item.Arquivo || item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.caminho || item.Caminho || item.path}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      {item.riscos || item.Riscos || item.risk_level}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.tamanho_mb ?? item.Tamanho_MB ?? item.size_mb} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />Conectando ao servidor...
        </div>
      )}
    </div>
  );
}
