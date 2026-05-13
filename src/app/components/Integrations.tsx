import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Play, Square, RefreshCw, CheckCircle2, WifiOff, Building2, Shield, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

export function Integrations() {
  // ── Scan state ──
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanProcessed, setScanProcessed] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [scanError, setScanError] = useState("");
  const [days, setDays] = useState(180);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── MS365 state ──
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [ms365Status, setMs365Status] = useState<"idle"|"saving"|"ok"|"error">("idle");
  const [ms365Error, setMs365Error] = useState("");
  const [ms365Users, setMs365Users] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Poll scan status
  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/scan-status`);
        if (!res.ok) return;
        const data = await res.json();
        setProgress(data.progress ?? 0);
        setScanTotal(data.total ?? 0);
        setScanProcessed(data.processed ?? 0);
        if (!data.is_scanning) {
          setIsScanning(false);
          setScanDone(true);
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      } catch (e) { /* ignore */ }
    }, 1500);
  };

  useEffect(() => {
    // Check if already scanning on mount
    fetch(`${API_URL}/scan-status`).then(r=>r.json()).then(d=>{
      if (d.is_scanning) {
        setIsScanning(true);
        setProgress(d.progress??0);
        setScanTotal(d.total??0);
        setScanProcessed(d.processed??0);
        startPolling();
      }
    }).catch(()=>{});
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleStartScan = async () => {
    setScanError(""); setScanDone(false); setProgress(0);
    try {
      const res = await fetch(`${API_URL}/scan?days=${days}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setScanError(data.detail ?? "Erro ao iniciar scan."); return; }
      setIsScanning(true);
      startPolling();
    } catch (e: any) {
      setScanError(e.message?.includes("fetch") ? "Servidor indisponivel. Aguarde o Render iniciar (30s)." : e.message);
    }
  };

  const handleSaveMs365 = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setMs365Error("Preencha todos os campos."); return;
    }
    setMs365Status("saving"); setMs365Error("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, client_id: clientId, client_secret: clientSecret }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMs365Status("error");
        setMs365Error(d.detail ?? `Erro ${res.status}`);
        return;
      }
      setMs365Status("ok");
    } catch (e: any) {
      setMs365Status("error");
      setMs365Error(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message);
    }
  };

  const handleLoadUsers = async () => {
    setLoadingUsers(true); setMs365Error("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=90`);
      if (!res.ok) {
        const d = await res.json();
        setMs365Error(d.detail ?? `Erro ${res.status}`);
        return;
      }
      const data = await res.json();
      setMs365Users(data.inactive_users ?? []);
    } catch (e: any) {
      setMs365Error(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message);
    } finally { setLoadingUsers(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel de Controle</h1>
        <p className="text-muted-foreground text-sm">Gerencie o motor de busca e integracoes do Sentinel 360.</p>
      </div>

      {/* ── Motor de Varredura ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500"/>
            Motor de Varredura Local
          </CardTitle>
          <p className="text-sm text-muted-foreground">Analise profunda de arquivos inativos e documentos sensiveis (LGPD).</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Threshold de inatividade (dias)</label>
              <Input
                type="number" min={1} max={3650}
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="mt-1 w-40"
                disabled={isScanning}
              />
            </div>
            <div className="pt-5">
              {!isScanning ? (
                <Button onClick={handleStartScan} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Play className="h-4 w-4"/> Iniciar Scan Real
                </Button>
              ) : (
                <Button variant="destructive" disabled className="flex items-center gap-2">
                  <Square className="h-4 w-4"/> Varrendo...
                </Button>
              )}
            </div>
          </div>

          {scanError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0"/>{scanError}
            </div>
          )}

          {/* Progress */}
          {(isScanning || scanDone) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isScanning ? "Varrendo..." : "Concluido!"}</span>
                <span>{scanProcessed.toLocaleString("pt-BR")} / {scanTotal > 0 ? scanTotal.toLocaleString("pt-BR") : "?"} arquivos &bull; {progress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${scanDone ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {scanDone && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4"/> Varredura concluida! Acesse Relatorios para ver os resultados.
                </p>
              )}
            </div>
          )}

          {!isScanning && !scanDone && !scanError && (
            <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
              O motor esta em espera. Clique no botao acima para iniciar a varredura no servidor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Microsoft 365 ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500"/>
            Microsoft 365 / Azure AD
          </CardTitle>
          <p className="text-sm text-muted-foreground">Integre com o Azure AD para auditar usuarios inativos e contas sem MFA.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 space-y-1">
            <p className="font-medium">Como configurar:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Acesse portal.azure.com → App registrations → New registration</li>
              <li>Anote o <strong>Application (Client) ID</strong> e o <strong>Directory (Tenant) ID</strong></li>
              <li>Crie um Client Secret em <em>Certificates &amp; secrets</em></li>
              <li>Adicione permissoes: <code>User.Read.All</code>, <code>Directory.Read.All</code></li>
              <li>Conceda admin consent para a organizacao</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium">Directory (Tenant) ID</label>
              <Input className="mt-1" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={tenantId} onChange={e=>setTenantId(e.target.value)} disabled={ms365Status==="saving"}/>
            </div>
            <div>
              <label className="text-xs font-medium">Application (Client) ID</label>
              <Input className="mt-1" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={clientId} onChange={e=>setClientId(e.target.value)} disabled={ms365Status==="saving"}/>
            </div>
            <div>
              <label className="text-xs font-medium">Client Secret</label>
              <Input type="password" className="mt-1" placeholder="••••••••••••••••" value={clientSecret} onChange={e=>setClientSecret(e.target.value)} disabled={ms365Status==="saving"}/>
            </div>
          </div>

          {ms365Error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0"/>{ms365Error}
            </div>
          )}
          {ms365Status === "ok" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4"/> Credenciais salvas com sucesso!
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSaveMs365} disabled={ms365Status==="saving"} className="flex items-center gap-2">
              {ms365Status==="saving" ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Shield className="h-4 w-4"/>}
              Salvar credenciais
            </Button>
            {ms365Status==="ok" && (
              <Button variant="outline" onClick={handleLoadUsers} disabled={loadingUsers} className="flex items-center gap-2">
                {loadingUsers ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Building2 className="h-4 w-4"/>}
                Auditar usuarios inativos (90d)
              </Button>
            )}
          </div>

          {ms365Users.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-secondary text-xs font-medium">{ms365Users.length} usuario(s) inativo(s) encontrado(s)</div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {ms365Users.map((u, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{u.display_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">{u.days_inactive >= 0 ? `${u.days_inactive}d inativo` : "nunca logou"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}