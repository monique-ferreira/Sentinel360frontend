import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Bell, CheckCircle2, RefreshCw, ShieldAlert, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
const RISK_STYLE: Record<string,string> = {
  critical:"border-l-red-500 bg-red-50/40",
  high: "border-l-amber-500 bg-amber-50/40",
  medium:"border-l-blue-500 bg-blue-50/40",
  low:  "border-l-green-500 bg-green-50/40",
};
const RISK_BADGE: Record<string,string> = {
  critical:"bg-red-100 text-red-800 border-red-300",
  high: "bg-amber-100 text-amber-800 border-amber-300",
  medium:"bg-blue-100 text-blue-800 border-blue-300",
  low:  "bg-green-100 text-green-800 border-green-300",
};

function timeSince(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s atras`;
  if (diff < 3600) return `${Math.floor(diff/60)}min atras`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h atras`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function ResultsTable() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [inactive, setInactive] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem("s360_token") ?? ""}` };
  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (filter !== "all") params.set("risk_level", filter);
    if (inactive) params.set("only_inactive", "true");
    try {
      const res = await fetch(`${API_URL}/results?${params}`, { headers });
      if (res.ok) setResults(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [filter, inactive]);
  useEffect(() => { fetchResults(); }, [fetchResults]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["all","critical","high","medium","low"].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-xs border ${filter===f?"bg-foreground text-background border-foreground":"border-border hover:bg-secondary"}`}>
            {f==="all"?"Todos":f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
        <button onClick={()=>setInactive(!inactive)} className={`px-3 py-1 rounded-full text-xs border ${inactive?"bg-amber-600 text-white border-amber-600":"border-border hover:bg-secondary"}`}>
          <Clock className="inline h-3 w-3 mr-1"/>Inativos
        </button>
        <button onClick={fetchResults} className="ml-auto p-1.5 rounded hover:bg-secondary">
          <RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/>
        </button>
      </div>
      {loading ? <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>
      : results.length===0 ? (
        <div className="py-12 text-center space-y-2"><CheckCircle2 className="h-8 w-8 text-green-500 mx-auto"/><p className="text-sm text-muted-foreground">Nenhum resultado.</p></div>
      ) : (
        <div className="space-y-1">
          {results.map(r=>(
            <div key={r._id} className={`border-l-4 rounded-r-lg border p-3 ${RISK_STYLE[r.risk_level]??""}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_BADGE[r.risk_level]??""}`}>{r.risk_level}</span>
                    {r.is_inactive && <span className="text-xs px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">inativo</span>}
                    {r.risks.map((rk:any)=>(<span key={rk.type} className="text-xs text-muted-foreground">{rk.type} {rk.detected_by==="claude_ai"?"🤖":""}</span>))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.path}</p>
                </div>
                <div className="text-right shrink-0"><p className="text-xs text-muted-foreground">{r.size_mb} MB</p><p className="text-xs text-muted-foreground">{timeSince(r.detected_at)}</p></div>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-right">{results.length} itens</p>
        </div>
      )}
    </div>
  );
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acking, setAcking] = useState<string|null>(null);
  const headers = { Authorization: `Bearer ${localStorage.getItem("s360_token") ?? ""}`, "Content-Type": "application/json" };
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/alerts?only_open=true`, { headers });
      if (r.ok) setAlerts(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  const acknowledge = async (id: string) => {
    setAcking(id);
    try {
      const r = await fetch(`${API_URL}/alerts/acknowledge`, { method: "POST", headers, body: JSON.stringify({ alert_id: id }) });
      if (r.ok) setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (e) { console.error(e); } finally { setAcking(null); }
  };
  const critical = alerts.filter(a => a.risk_level === "critical");
  const others = alerts.filter(a => a.risk_level !== "critical");
  return (
    <div className="space-y-3">
      {loading ? <div className="py-8 text-center text-muted-foreground text-sm">Carregando alertas...</div>
      : alerts.length===0 ? (
        <div className="py-12 text-center space-y-2"><CheckCircle2 className="h-size-8 w-8 text-green-500 mx-auto"/><p className="text-sm text-muted-foreground">Sem alertas abertos.</p></div>
      ) : (
        <>
          {critical.length>0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2 mb-2 text-red-700"><ShieldAlert className="h-4 w-4"/><span className="text-sm font-medium">{critical.length} alerta(s) critico(s)</span></div>
              <div className="space-y-2">
                {critical.map(a=>(
                  <div key={a._id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0"><p className="font-medium text-red-800">{a.title}</p><p className="text-xs text-red-600 truncate">{a.file_path}</p></div>
                    <button onClick={()=>acknowledge(a._id)} disabled={acking===a._id} className="shrink-0 h-7 text-xs px-2 border rounded-md hover:bg-secondary disabled:opacity-50">
                      {acking===a._id ? <RefreshCw className="h-3 w-3 animate-spin"/> : "Reconhecer"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {others.map(a=>(
            <div key={a._id} className={`border-l-4 rounded-r-lg border p-3 ${RISK_STYLE[a.risk_level]??""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium">{a.title}</span><span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_BADGE[a.risk_level]??""}`}>{a.risk_level}</span></div>
                  <p className="text-xs text-muted-foreground truncate">{a.file_path}</p>
                  <p className="text-xs text-muted-foreground">{timeSince(a.created_at)}</p>
                </div>
                <button onClick={()=>acknowledge(a._id)} disabled={acking===a._id} className="shrink-0 h-7 text-xs px-2 border rounded-md hover:bg-secondary disabled:opacity-50">
                  {acking===a._id ? <RefreshCw className="h-3 w-3 animate-spin"/> : <CheckCircle2 className="h-3 w-3"/>}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
      <button onClick={fetchAlerts} className="w-full text-xs flex items-center justify-center gap-1 py-2 hover:bg-secondary rounded-md text-muted-foreground"><RefreshCw className="h-3 w-3"/> Atualizar alertas</button>
    </div>
  );
}

export function AlertsPage() {
  const [tab, setTab] = useState<"alerts"|"results">("alerts");
  const tabCls = (t: string) => `px-4 py-2 text-sm border-b-2 ${tab===t?"border-foreground font-medium":"border-transparent text-muted-foreground"}`;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Riscos &amp; Alertas</h1>
        <p className="text-sm text-muted-foreground">Gerencie incidentes e revise todos os arquivos detectados.</p>
      </div>
      <div className="flex border-b border-border">
        <button className={tabCls("alerts")} onClick={()=>setTab("alerts")}><Bell className="inline h-4 w-4 mr-1"/> Alertas abertos</button>
        <button className={tabCls("results")} onClick={()=>setTab("results")}><AlertTriangle className="inline h-4 w-4 mr-1"/> Todos os resultados</button>
      </div>
      {tab==="alerts" && <AlertsPanel/>}
      {tab==="results" && <ResultsTable/>}
    </div>
  );
}
