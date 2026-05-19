import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Play,
  RefreshCw,
  CheckCircle2,
  WifiOff,
  Building2,
  Users,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

type ScanPhase = "idle" | "scanning" | "done" | "error";
type SaveStatus = "idle" | "saving" | "ok" | "error";

export function Integrations() {
  const { token } = useAuth();

  // Scan
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanProcessed, setScanProcessed] = useState(0);
  const [days, setDays] = useState(180);
  const [scanMsg, setScanMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // MS365
  const [ms365Open, setMs365Open] = useState(false);
  const [ms365Tenant, setMs365Tenant] = useState("");
  const [ms365Client, setMs365Client] = useState("");
  const [ms365Secret, setMs365Secret] = useState("");
  const [ms365Status, setMs365Status] = useState<SaveStatus>("idle");
  const [ms365Msg, setMs365Msg] = useState("");
  const [ms365Users, setMs365Users] = useState<any[]>([]);
  const [loadingMs365, setLoadingMs365] = useState(false);

  // Azure AD
  const [azureOpen, setAzureOpen] = useState(false);
  const [azureTenant, setAzureTenant] = useState("");
  const [azureClient, setAzureClient] = useState("");
  const [azureSecret, setAzureSecret] = useState("");
  const [azureStatus, setAzureStatus] = useState<SaveStatus>("idle");
  const [azureMsg, setAzureMsg] = useState("");
  const [azureUsers, setAzureUsers] = useState<any[]>([]);
  const [loadingAzure, setLoadingAzure] = useState(false);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/scan-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const d = await res.json();
        setProgress(d.progress ?? 0);
        setScanTotal(d.total ?? 0);
        setScanProcessed(d.processed ?? 0);
        if (!d.is_scanning) {
          setScanPhase("done");
          setScanMsg("Varredura concluída! Vá em Relatórios para ver os resultados.");
          stopPolling();
        }
      } catch { /* ignore poll errors */ }
    }, 1500);
  };

  useEffect(() => {
    fetch(`${API_URL}/scan-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.is_scanning) {
          setScanPhase("scanning");
          setProgress(d.progress ?? 0);
          startPolling();
        }
      })
      .catch(() => {});
    return () => stopPolling();
  }, []);

  const handleStartScan = async () => {
    setScanPhase("scanning"); setProgress(0); setScanMsg(""); setScanTotal(0); setScanProcessed(0);
    try {
      const res = await fetch(`${API_URL}/scan?days=${days}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        setScanPhase("error");
        setScanMsg(d.detail ?? "Erro ao iniciar scan.");
        return;
      }
      startPolling();
    } catch (e: any) {
      setScanPhase("error");
      setScanMsg(
        e.message?.includes("fetch")
          ? "Servidor indisponível. Aguarde 30s e tente novamente."
          : e.message
      );
    }
  };

  const saveMs365Config = async () => {
    if (!ms365Tenant || !ms365Client || !ms365Secret) {
      setMs365Msg("Preencha todos os campos."); setMs365Status("error"); return;
    }
    setMs365Status("saving"); setMs365Msg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tenant_id: ms365Tenant, client_id: ms365Client, client_secret: ms365Secret }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMs365Status("error"); setMs365Msg(d.detail ?? `Erro ${res.status}`); return;
      }
      setMs365Status("ok"); setMs365Msg("Credenciais salvas com sucesso!");
    } catch (e: any) {
      setMs365Status("error");
      setMs365Msg(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    }
  };

  const saveAzureConfig = async () => {
    if (!azureTenant || !azureClient || !azureSecret) {
      setAzureMsg("Preencha todos os campos."); setAzureStatus("error"); return;
    }
    setAzureStatus("saving"); setAzureMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/azure/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tenant_id: azureTenant, client_id: azureClient, client_secret: azureSecret }),
      });
      if (!res.ok) {
        const d = await res.json();
        setAzureStatus("error"); setAzureMsg(d.detail ?? `Erro ${res.status}`); return;
      }
      setAzureStatus("ok"); setAzureMsg("Credenciais salvas com sucesso!");
    } catch (e: any) {
      setAzureStatus("error");
      setAzureMsg(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    }
  };

  const auditMs365Users = async () => {
    setLoadingMs365(true); setMs365Msg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=90`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); setMs365Msg(d.detail ?? `Erro ${res.status}`); return; }
      const data = await res.json();
      setMs365Users(data.inactive_users ?? []);
      if ((data.inactive_users ?? []).length === 0) setMs365Msg("Nenhum usuário inativo encontrado.");
    } catch (e: any) {
      setMs365Msg(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    } finally { setLoadingMs365(false); }
  };

  const auditAzureUsers = async () => {
    setLoadingAzure(true); setAzureMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/azure/audit?inactive_days=90`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); setAzureMsg(d.detail ?? `Erro ${res.status}`); return; }
      const data = await res.json();
      setAzureUsers(data.inactive_users ?? []);
      if ((data.inactive_users ?? []).length === 0) setAzureMsg("Nenhum usuário inativo encontrado.");
    } catch (e: any) {
      setAzureMsg(e.message?.includes("fetch") ? "Servidor indisponível." : e.message);
    } finally { setLoadingAzure(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel de Controle</h1>
        <p className="text-muted-foreground text-sm">Gerencie o motor de busca e integrações do Sentinel 360.</p>
      </div>

      {/* Motor de Varredura */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Motor de Varredura Local
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análise profunda de arquivos inativos e documentos sensíveis (LGPD).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Inatividade (dias)</label>
              <Input
                type="number"
                min={1}
                max={3650}
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-32"
                disabled={scanPhase === "scanning"}
              />
            </div>
            {scanPhase !== "scanning" ? (
              <Button
                onClick={handleStartScan}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Play className="h-4 w-4" /> Iniciar Scan
              </Button>
            ) : (
              <Button disabled variant="secondary" className="flex items-center gap-2 cursor-not-allowed">
                <RefreshCw className="h-4 w-4 animate-spin" /> Varrendo arquivos...
              </Button>
            )}
          </div>

          {scanPhase === "error" && scanMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />{scanMsg}
            </div>
          )}

          {(scanPhase === "scanning" || scanPhase === "done") && (
            <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
              <div className="flex justify-between text-xs font-medium">
                <span className={`flex items-center gap-1 ${scanPhase === "scanning" ? "text-blue-600" : "text-green-600"}`}>
                  {scanPhase === "scanning" ? (
                    <><RefreshCw className="h-3 w-3 animate-spin" />Varredura em andamento...</>
                  ) : (
                    <><CheckCircle2 className="h-3 w-3" />Concluído!</>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {scanProcessed.toLocaleString("pt-BR")} / {scanTotal > 0 ? scanTotal.toLocaleString("pt-BR") : "?"} arquivos &nbsp;•&nbsp; {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden border">
                <div
                  className={`h-4 rounded-full transition-all duration-700 ${
                    scanPhase === "done" ? "bg-green-500" : "bg-blue-500 animate-pulse"
                  }`}
                  style={{ width: `${Math.max(2, Math.min(progress, 100))}%` }}
                />
              </div>
              {scanPhase === "done" && (
                <p className="text-sm text-green-700 mt-1">{scanMsg}</p>
              )}
            </div>
          )}

          {scanPhase === "idle" && (
            <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
              O motor está em espera. Clique em <strong>Iniciar Scan</strong> para começar a varredura.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Microsoft 365 */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setMs365Open(!ms365Open)}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Microsoft 365
              <span className="text-xs font-normal text-muted-foreground ml-1">(Exchange, SharePoint, Teams)</span>
            </span>
            {ms365Open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Audite emails, arquivos do SharePoint e arquivos compartilhados externamente.
          </p>
        </CardHeader>
        {ms365Open && (
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 space-y-1">
              <p className="font-medium">Permissões necessárias no App Registration:</p>
              <code className="block bg-white/60 rounded px-2 py-1">Mail.Read, Sites.Read.All, Files.Read.All</code>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Directory (Tenant) ID</label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={ms365Tenant}
                  onChange={e => setMs365Tenant(e.target.value)}
                  disabled={ms365Status === "saving"}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Application (Client) ID</label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={ms365Client}
                  onChange={e => setMs365Client(e.target.value)}
                  disabled={ms365Status === "saving"}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Client Secret</label>
                <Input
                  type="password"
                  placeholder="••••••••••••••"
                  value={ms365Secret}
                  onChange={e => setMs365Secret(e.target.value)}
                  disabled={ms365Status === "saving"}
                />
              </div>
            </div>
            {ms365Msg && (
              <p className={`text-sm ${ms365Status === "ok" ? "text-green-700" : "text-red-700"}`}>{ms365Msg}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={saveMs365Config}
                disabled={ms365Status === "saving"}
                className="flex items-center gap-2"
              >
                {ms365Status === "saving" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Salvar credenciais M365
              </Button>
              {ms365Status === "ok" && (
                <Button
                  variant="outline"
                  onClick={auditMs365Users}
                  disabled={loadingMs365}
                  className="flex items-center gap-2"
                >
                  {loadingMs365 ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Verificar usuários inativos
                </Button>
              )}
            </div>
            {ms365Users.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-secondary text-xs font-medium">
                  {ms365Users.length} usuário(s) inativo(s) — Microsoft 365
                </div>
                <div className="divide-y divide-border max-h-56 overflow-y-auto">
                  {ms365Users.map((u, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{u.display_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="text-xs text-amber-600 font-medium">
                        {u.days_inactive >= 0 ? `${u.days_inactive}d inativo` : "nunca logou"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Azure AD */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setAzureOpen(!azureOpen)}>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Azure Active Directory
              <span className="text-xs font-normal text-muted-foreground ml-1">(Identidade, Usuários, Grupos)</span>
            </span>
            {azureOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Audite contas de usuário, grupos de segurança e contas sem MFA ativado.
          </p>
        </CardHeader>
        {azureOpen && (
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-700 space-y-1">
              <p className="font-medium">Permissões necessárias no App Registration:</p>
              <code className="block bg-white/60 rounded px-2 py-1">
                User.Read.All, Directory.Read.All, AuditLog.Read.All
              </code>
              <p className="mt-1">
                Conceda <strong>admin consent</strong> para a organização após adicionar as permissões.
              </p>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Directory (Tenant) ID</label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={azureTenant}
                  onChange={e => setAzureTenant(e.target.value)}
                  disabled={azureStatus === "saving"}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Application (Client) ID</label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={azureClient}
                  onChange={e => setAzureClient(e.target.value)}
                  disabled={azureStatus === "saving"}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Client Secret</label>
                <Input
                  type="password"
                  placeholder="••••••••••••••"
                  value={azureSecret}
                  onChange={e => setAzureSecret(e.target.value)}
                  disabled={azureStatus === "saving"}
                />
              </div>
            </div>
            {azureMsg && (
              <p className={`text-sm ${azureStatus === "ok" ? "text-green-700" : "text-red-700"}`}>{azureMsg}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={saveAzureConfig}
                disabled={azureStatus === "saving"}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {azureStatus === "saving" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Salvar credenciais Azure AD
              </Button>
              {azureStatus === "ok" && (
                <Button
                  variant="outline"
                  onClick={auditAzureUsers}
                  disabled={loadingAzure}
                  className="flex items-center gap-2"
                >
                  {loadingAzure ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Auditar contas inativas (90d)
                </Button>
              )}
            </div>
            {azureUsers.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-secondary text-xs font-medium">
                  {azureUsers.length} conta(s) inativa(s) — Azure AD
                </div>
                <div className="divide-y divide-border max-h-56 overflow-y-auto">
                  {azureUsers.map((u, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{u.display_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="text-xs text-amber-600 font-medium">
                        {u.days_inactive >= 0 ? `${u.days_inactive}d inativo` : "nunca logou"}
                      </span>
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
