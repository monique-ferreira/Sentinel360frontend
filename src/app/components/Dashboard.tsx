import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, FileX, AlertTriangle, HardDrive, RefreshCw, Wifi, WifiOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

function StatCard({ title, value, subtitle, icon, color = "default" }: any) {
  const bg: Record<string,string> = { default:"bg-card", danger:"bg-red-50 dark:bg-red-950/20", warning:"bg-amber-50 dark:bg-amber-950/20", info:"bg-blue-50 dark:bg-blue-950/20" };
  const tx: Record<string,string> = { default:"text-foreground", danger:"text-red-600", warning:"text-amber-600", info:"text-blue-600" };
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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponiavel. O Render pode estar iniciando (aguarde 30s)." : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const total = items.length;
  const inativos = items.filter(i => i.Inativo === "SIM" || i.is_inactive).length;
  const riscos = items.filter(i => i.Riscos && i.Riscos !== "Nenhum" && i.risk_level !== "none").length;
  const totalMB = items.reduce((s, i) => s + (parseFloat(i.Tamanho_MB) || parseFloat(i.size_mb) || 0), 0);
  const topRiscos = items.filter(i => i.Riscos && i.Riscos0!== "Nenhum").slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {lastUpdate && <p className="text-xs text-muted-foreground">Atualizado: {lastUpdate}</p>}
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-secondary disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          <WifiOff className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!error && !loading && total === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <Wifi className="h-size-4 w-4 shrink-0" /> Nenhum scan realizado ainda. Execute o agente na maquina alvo para popular os dados.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Arquivos monitorados" value={loading ? "—" : total.toLocaleString("pt-BR")} subtitle="total detectado" icon={<HardDrive className="h-5 w-5"/>} />
        <StatCard title="Arquivos inativos" value={loading ? "—" : inativos.toLocaleString("pt-BR")} subtitle="+180 dias sem acesso" icon={<FileX className="h-5 w-5"/>} color="warning" />
        <StatCard title="Com riscos" value={loading ? "—" : riscos.toLocaleString("pt-BR")} subtitle="credenciais / tokens" icon={<ShieldAlert className="h-size-5 w-5"/>} color="danger" />
        <StatCard title="Storage total" value={loading ? "—" : `${totalMB.toFixed(1)} MB`} subtitle="em arquivos detectados" icon={<AlertTriangle className="h-5 w-5"/>} color="info" />
      </div>

      {topRiscos.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Arquivos com maior risco</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topRiscos.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.Arquivo || item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.Caminho || item.path}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{item.Riscos || item.risk_level}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.Tamanho_MB || item.size_mb} MB</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Conectando ao servidor...
        </div>
      )}
    </div>
  );
}
