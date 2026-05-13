import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Play, Square, RefreshCw, CheckCircle2, WifiOff,
  Building2, Users, Shield, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

type ScanPhase = "idle" | "scanning" | "done" | "error";

export function Integrations() {
  // ── Scan ──
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanProcessed, setScanProcessed] = useState(0);
  const [days, setDays] = useState(180);
  const [scanMsg, setScanMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── MS365 (Exchange / SharePoint) ──
  const [ms365Open, setMs365Open] = useState(false);
  const [ms365Tenant, setMs365Tenant] = useState("");
  const [ms365Client, setMs365Client] = useState("");
  const [ms365Secret, setMs365Secret] = useState("");
  const [ms365Status, setMs365Status] = useState<"idle"|"saving"|"ok"|"error">("idle");
  const [ms365Msg, setMs365Msg] = useState("");
  const [ms365Users, setMs365Users] = useState<any[]>([]);
  const [loadingMs365, setLoadingMs365] = useState(false);

  // ── Azure AD (Identity / Usuarios) ──
  const [azureOpen, setAzureOpen] = useState(false);
  const [azureTenant, setAzureTenant] = useState("");
  const [azureClient, setAzureClient] = useState("");
  const [azureSecret, setAzureSecret] = useState("");
  const [azureStatus, setAzureStatus] = useState<"idle"|"saving"|"ok"|"error">("idle");
  const [azureMsg, setAzureMsg] = useState("");
  const [azureUsers, setAzureUsers] = useState<any[]>([]);
  const [loadingAzure, setLoadingAzure] = useState(false);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/scan-status`);
        if (!res.ok) return;
        const d = await res.json();
        setProgress(d.progress ?? 0);
        setScanTotal(d.total ?? 0);
        setScanProcessed(d.processed ?? 0);
        if (!d.is_scanning) {
          setScanPhase("done");
          setScanMsg("Varredura concluida! Va em Relatorios para ver os resultados.");
          stopPolling();
        }
      } catch(e) {}
    }, 1500);
  };

  useEffect(() => {
    fetch(`${API_URL}/scan-status`).then(r=>r.json()).then(d=>{
      if (d.is_scanning) { setScanPhase("scanning"); setProgress(d.progress??0); startPolling(); }
    }).catch(()=>{});
    return () => stopPolling();
  }, []);

  const handleStartScan = async () => {
    setScanPhase("scanning"); setProgress(0); setScanMsg(""); setScanTotal(0); setScanProcessed(0);
    try {
      const res = await fetch(`${API_URL}/scan?days=${days}`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        setScanPhase("error"); setScanMsg(d.detail ?? "Erro ao iniciar scan."); return;
      }
      startPolling();
    } catch (e: any) {
      setScanPhase("error");
      setScanMsg(e.message?.includes("fetch") ? "Servidor indisponivel. Aguarde 30s e tente novamente." : e.message);
    }
  };

  const saveConfig = async (
    tenant: string, client: string, secret: string,
    setStatus: any, setMsg: any
  ) => {
    if (!tenant || !client || !secret) { setMsg("Preencha todos os campos."); setStatus("error"); return; }
    setStatus("saving"); setMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/configure`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ tenant_id: tenant, client_id: client, client_secret: secret }),
      });
      if (!res.ok) { const d=await res.json(); setStatus("error"); setMsg(d.detail??`Erro ${res.status}`); return; }
      setStatus("ok"); setMsg("Credenciais salvas!");
    } catch (e: any) {
      setStatus("error"); setMsg(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message);
    }
  };

  const auditUsers = async (setLoading: any, setUsers: any, setMsg: any, inactiveDays=90) => {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=${inactiveDays}`);
      if (!res.ok) { const d=await res.json(); setMsg(d.detail??`Erro ${res.status}`); return; }
      const data = await res.json();
      setUsers(data.inactive_users ?? []);
      if ((data.inactive_users??[]).length===0) setMsg("Nenhum usuario inativo encontrado.");
    } catch (e: any) {
      setMsg(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message);
    } finally { setLoading(false); }
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
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Inatividade (dias)</label>
              <Input type="number" min={1} max={3650} value={days} onChange={e=>setDays(Number(e.target.value))} className="w-32" disabled={scanPhase==="scanning"}/>
            </div>
            {scanPhase !== "scanning" ? (
              <Button onClick={handleStartScan} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Play className="h-4 w-4"/> Iniciar Scan Real
              </Button>
            ) : (
              <Button disabled variant="secondary" className="flex items-center gap-2 cursor-not-allowed">
                <RefreshCw className="h-4 w-4 animate-spin"/> Varrendo arquivos...
              </Button>
            )}
          </div>

          {/* Scan error */}
          {scanPhase === "error" && scanMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0"/>{scanMsg}
            </div>
          )}

          {/* Progress bar — only when scanning or done */}
          {(scanPhase === "scanning" || scanPhase === "done") && (
            <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
              <div className="flex justify-between text-xs font-medium">
                <span className={`flex items-center gap-1 ${scanPhase==="scanning" ? "text-blue-600" : "text-green-600"}`}>
                  {scanPhase==="scanning" ? <><RefreshCw className="h-3 w-3 animate-spin"/>Varrendo em andamento...</> : <><CheckCircle2 className="h-3 w-3"/>Concluido!</>}
                </span>
                <span className="text-muted-foreground">
                  {scanProcessed.toLocaleString("pt-BR")} / {scanTotal > 0 ? scanTotal.toLocaleString("pt-BR") : "?"} arquivos &nbsp;•&nbsp; {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden border">
                <div
                  className={`h-4 rounded-full transition-all duration-700 ${scanPhase==="done" ? "bg-green-500" : "bg-blue-500 animate-pulse"}`}
                  style={{ width: `${Math.max(2, Math.min(progress, 100))}%` }}
                />
              </div>
              {scanPhase==="done" && (
                <p className="text-sm text-green-700 mt-1">{scanMsg}</p>
              )}
            </div>
          )}

          {/* Idle state */}
          {scanPhase === "idle" && (
            <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
              O motor esta em espera. Clique em <strong>Iniciar Scan Real</strong> para comecar a varredura.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Microsoft 365 ── */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setMs365Open(!ms365Open)}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500"/>
              Microsoft 365
              <span className="text-xs font-normal text-muted-foreground ml-1">(Exchange, SharePoint, Teams)</span>
            </span>
            {ms365Open ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Audite emails, arquivos do SharePoint e arquivos compartilhados externamente.</p>
        </CardHeader>
        {ms365Open && (
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 space-y-1">
              <p className="font-medium">Permissoes necessarias no App Registration:</p>
              <code className="block bg-white/60 rounded px-2 py-1">Mail.Read, Sites.Read.All, Files.Read.All</code>
            </div>
            <div className="grid gap-3">
              <div><label className="text-xs font-medium block mb-1">Directory (Tenant) ID</label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={ms365Tenant} onChange={e=>setMs365Tenant(e.target.value)} disabled={ms365Status==="saving"}/></div>
              <div><label className="text-xs font-medium block mb-1">Application (Client) ID</label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={ms365Client} onChange={e=>setMs365Client(e.target.value)} disabled={ms365Status==="saving"}/></div>
              <div><label className="text-xs font-medium block mb-1">Client Secret</label>
                <Input type="password" placeholder="••••••••••••••" value={ms365Secret} onChange={e=>setMs365Secret(e.target.value)} disabled={ms365Status==="saving"}/></div>
            </div>
            {ms365Msg && <p className={`text-sm ${ms365Status==="ok"?"text-green-700":"text-red-700"}`}>{ms365Msg}</p>}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={()=>saveConfig(ms365Tenant,ms365Client,ms365Secret,setMs365Status,setMs365Msg)} disabled={ms365Status==="saving"} className="flex items-center gap-2">
                {ms365Status==="saving"?<RefreshCw className="h-4 w-4 animate-spin"/>:<Shield className="h-4 w-4"/>}
                Salvar credenciais M365
              </Button>
              {ms365Status==="ok" && (
                <Button variant="outline" onClick={()=>auditUsers(setLoadingMs365,setMs365Users,setMs365Msg)} disabled={loadingMs365} className="flex items-center gap-2">
                  {loadingMs365?<RefreshCw className="h-4 w-4 animate-spin"/>:<Users className="h-4 w-4"/>}
                  Verificar usuarios inativos
                </Button>
              )}
            </div>
            {ms365Users.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-secondary text-xs font-medium">{ms365Users.length} usuario(s) inativo(s) — Microsoft 365</div>
                <div className="divide-y divide-border max-h-56 overflow-y-auto">
                  {ms365Users.map((u,i)=>(
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div><p className="font-medium">{u.display_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      <span className="text-xs text-amber-600 font-medium">{u.days_inactive>=0?`${u.days_inactive}d inativo`:"nunca logou"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── Azure AD ── */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setAzureOpen(!azureOpen)}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500"/>
              Azure Active Directory
              <span className="text-xs font-normal text-muted-foreground ml-1">(Identidade, Usuarios, Grupos)</span>
            </span>
            {azureOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Audite contas de usuario, grupos de seguranca e contas sem MFA ativado.</p>
        </CardHeader>
        {azureOpen && (
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-700 space-y-1">
              <p className="font-medium">Permissoes necessarias no App Registration:</p>
              <code className="block bg-white/60 rounded px-2 py-1">User.Read.All, Directory.Read.All, AuditLog.Read.All</code>
              <p className="mt-1">Conceda <strong>admin consent</strong> para a organizacao apos adicionar as permissoes.</p>
            </div>
            <div className="grid gap-3">
              <div><label className="text-xs font-medium block mb-1">Directory (Tenant) ID</label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={azureTenant} onChange={e=>setAzureTenant(e.target.value)} disabled={azureStatus==="saving"}/></div>
              <div><label className="text-xs font-medium block mb-1">Application (Client) ID</label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={azureClient} onChange={e=>setAzureClient(e.target.value)} disabled={azureStatus==="saving"}/></div>
              <div><label className="text-xs font-medium block mb-1">Client Secret</label>
                <Input type="password" placeholder="••••••••••••••" value={azureSecret} onChange={e=>setAzureSecret(e.target.value)} disabled={azureStatus==="saving"}/></div>
            </div>
            {azureMsg && <p className={`text-sm ${azureStatus==="ok"?"text-green-700":"text-red-700"}`}>{azureMsg}</p>}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={()=>saveConfig(azureTenant,azureClient,azureSecret,setAzureStatus,setAzureMsg)} disabled={azureStatus==="saving"} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                {azureStatus==="saving"?<RefreshCw className="h-4 w-4 animate-spin"/>:<Shield className="h-4 w-4"/>}
                Salvar credenciais Azure AD
              </Button>
              {azureStatus==="ok" && (
                <Button variant="outline" onClick={()=>auditUsers(setLoadingAzure,setAzureUsers,setAzureMsg,90)} disabled={loadingAzure} className="flex items-center gap-2">
                  {loadingAzure?<RefreshCw className="h-4 w-4 animate-spin"/>:<Users className="h-4 w-4"/>}
                  Auditar contas inativas (90d)
                </Button>
              )}
            </div>
            {azureUsers.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-secondary text-xs font-medium">{azureUsers.length} conta(s) inativa(s) — Azure AD</div>
                <div className="divide-y divide-border max-h-56 overflow-y-auto">
                  {azureUsers.map((u,i)=>(
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div><p className="font-medium">{u.display_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      <span className="text-xs text-amber-600 font-medium">{u.days_inactive>=0?`${u.days_inactive}d inativo`:"nunca logou"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}