import { useEffect, useState, useRef } from "react";
import {
  Play, RefreshCw, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Shield, Users, Building2, Zap,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
type ScanPhase = "idle" | "scanning" | "done" | "error";
type SaveStatus = "idle" | "saving" | "ok" | "error";

function Field({ label, value, onChange, type = "text", placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-colors"
      />
    </div>
  );
}

function IntegrationCard({
  title, subtitle, icon, color, open, onToggle, children,
}: {
  title: string; subtitle: string; icon: React.ReactNode; color: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: color + "18", border: `1px solid ${color}35` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

export function Integrations() {
  const { token } = useAuth();

  // Scan state
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

  const h = { Authorization: `Bearer ${token}` };

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/scan-status`, { headers: h });
        if (!res.ok) return;
        const d = await res.json();
        setProgress(d.progress ?? 0);
        setScanTotal(d.total ?? 0);
        setScanProcessed(d.processed ?? 0);
        if (!d.is_scanning) {
          setScanPhase("done");
          setScanMsg("Varredura concluída! Veja os resultados em Relatórios.");
          stopPolling();
        }
      } catch { /* ignore */ }
    }, 1500);
  };

  useEffect(() => {
    fetch(`${API_URL}/scan-status`, { headers: h })
      .then(r => r.json())
      .then(d => { if (d.is_scanning) { setScanPhase("scanning"); setProgress(d.progress ?? 0); startPolling(); } })
      .catch(() => {});
    return () => stopPolling();
  }, []);

  const handleStartScan = async () => {
    setScanPhase("scanning"); setProgress(0); setScanMsg(""); setScanTotal(0); setScanProcessed(0);
    try {
      const res = await fetch(`${API_URL}/scan?days=${days}`, { method: "POST", headers: h });
      if (!res.ok) { const d = await res.json(); setScanPhase("error"); setScanMsg(d.detail ?? "Erro ao iniciar scan."); return; }
      startPolling();
    } catch (e: any) {
      setScanPhase("error");
      setScanMsg(e.message?.includes("fetch") ? "Servidor indisponível. Aguarde 30s." : e.message);
    }
  };

  const saveMs365 = async () => {
    if (!ms365Tenant || !ms365Client || !ms365Secret) { setMs365Msg("Preencha todos os campos."); setMs365Status("error"); return; }
    setMs365Status("saving"); setMs365Msg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({ tenant_id: ms365Tenant, client_id: ms365Client, client_secret: ms365Secret }),
      });
      if (!res.ok) { const d = await res.json(); setMs365Status("error"); setMs365Msg(d.detail ?? `Erro ${res.status}`); return; }
      setMs365Status("ok"); setMs365Msg("Credenciais salvas com sucesso!");
    } catch { setMs365Status("error"); setMs365Msg("Servidor indisponível."); }
  };

  const saveAzure = async () => {
    if (!azureTenant || !azureClient || !azureSecret) { setAzureMsg("Preencha todos os campos."); setAzureStatus("error"); return; }
    setAzureStatus("saving"); setAzureMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/azure/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({ tenant_id: azureTenant, client_id: azureClient, client_secret: azureSecret }),
      });
      if (!res.ok) { const d = await res.json(); setAzureStatus("error"); setAzureMsg(d.detail ?? `Erro ${res.status}`); return; }
      setAzureStatus("ok"); setAzureMsg("Credenciais salvas com sucesso!");
    } catch { setAzureStatus("error"); setAzureMsg("Servidor indisponível."); }
  };

  const auditMs365 = async () => {
    setLoadingMs365(true); setMs365Msg("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=90`, { headers: h });
      if (!res.ok) { const d = await res.json(); setMs365Msg(d.detail ?? `Erro ${res.status}`); return; }
      const data = await res.json();
      setMs365Users(data.inactive_users ?? []);
      if (!(data.inactive_users ?? []).length) setMs365Msg("Nenhum usuário inativo encontrado.");
    } catch { setMs365Msg("Servidor indisponível."); }
    finally { setLoadingMs365(false); }
  };

  const auditAzure = async () => {
    setLoadingAzure(true); setAzureMsg("");
    try {
      const res = await fetch(`${API_URL}/integrations/azure/audit?inactive_days=90`, { headers: h });
      if (!res.ok) { const d = await res.json(); setAzureMsg(d.detail ?? `Erro ${res.status}`); return; }
      const data = await res.json();
      setAzureUsers(data.inactive_users ?? []);
      if (!(data.inactive_users ?? []).length) setAzureMsg("Nenhum usuário inativo encontrado.");
    } catch { setAzureMsg("Servidor indisponível."); }
    finally { setLoadingAzure(false); }
  };

  const btnCls = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Painel de Controle
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie o motor de varredura e as integrações do Sentinel 360.
        </p>
      </div>

      {/* Scan engine */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Motor de Varredura Local</p>
            <p className="text-xs text-muted-foreground">Análise de arquivos inativos e documentos sensíveis (LGPD)</p>
          </div>
          {scanPhase === "done" && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-[#3fb950] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />Concluído
            </span>
          )}
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Limiar de inatividade (dias)
              </label>
              <input
                type="number" min={1} max={3650} value={days}
                onChange={e => setDays(Number(e.target.value))}
                disabled={scanPhase === "scanning"}
                className="w-28 h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-colors"
              />
            </div>
            {scanPhase !== "scanning" ? (
              <button onClick={handleStartScan}
                className={`${btnCls} bg-primary text-primary-foreground hover:bg-primary/90`}>
                <Play className="h-4 w-4" />
                Iniciar Scan
              </button>
            ) : (
              <button disabled className={`${btnCls} bg-secondary text-muted-foreground cursor-not-allowed`}>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Varrendo...
              </button>
            )}
          </div>

          {scanPhase === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />{scanMsg}
            </div>
          )}

          {(scanPhase === "scanning" || scanPhase === "done") && (
            <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 font-medium ${scanPhase === "scanning" ? "text-[#58a6ff]" : "text-[#3fb950]"}`}>
                  {scanPhase === "scanning"
                    ? <><RefreshCw className="h-3 w-3 animate-spin" />Escaneando arquivos...</>
                    : <><CheckCircle2 className="h-3 w-3" />Varredura concluída</>}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {scanProcessed.toLocaleString("pt-BR")} / {scanTotal > 0 ? scanTotal.toLocaleString("pt-BR") : "?"} &nbsp;•&nbsp; {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${scanPhase === "done" ? "bg-[#3fb950]" : "bg-[#58a6ff]"}`}
                  style={{ width: `${Math.max(2, Math.min(progress, 100))}%` }}
                />
              </div>
              {scanPhase === "done" && <p className="text-xs text-[#3fb950]">{scanMsg}</p>}
            </div>
          )}

          {scanPhase === "idle" && (
            <div className="border border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
              Motor em espera. Clique em <strong className="text-foreground">Iniciar Scan</strong> para começar.
            </div>
          )}
        </div>
      </div>

      {/* MS365 */}
      <IntegrationCard
        title="Microsoft 365"
        subtitle="Exchange, SharePoint, Teams"
        icon={<Building2 className="w-4 h-4" />}
        color="#58a6ff"
        open={ms365Open}
        onToggle={() => setMs365Open(!ms365Open)}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#58a6ff]/8 border border-[#58a6ff]/20 text-xs text-[#58a6ff] space-y-1">
            <p className="font-semibold">Permissões necessárias no App Registration:</p>
            <code className="block font-mono bg-black/20 rounded px-2 py-1">Mail.Read · Sites.Read.All · Files.Read.All</code>
          </div>
          <div className="grid gap-3">
            <Field label="Directory (Tenant) ID" value={ms365Tenant} onChange={setMs365Tenant}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled={ms365Status === "saving"} />
            <Field label="Application (Client) ID" value={ms365Client} onChange={setMs365Client}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled={ms365Status === "saving"} />
            <Field label="Client Secret" type="password" value={ms365Secret} onChange={setMs365Secret}
              placeholder="••••••••••••••" disabled={ms365Status === "saving"} />
          </div>
          {ms365Msg && (
            <p className={`text-xs ${ms365Status === "ok" ? "text-[#3fb950]" : "text-destructive"}`}>{ms365Msg}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveMs365} disabled={ms365Status === "saving"}
              className={`${btnCls} bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] hover:bg-[#58a6ff]/20`}>
              {ms365Status === "saving" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Salvar credenciais M365
            </button>
            {ms365Status === "ok" && (
              <button onClick={auditMs365} disabled={loadingMs365}
                className={`${btnCls} border border-border text-muted-foreground hover:text-foreground hover:bg-white/5`}>
                {loadingMs365 ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Verificar usuários inativos
              </button>
            )}
          </div>
          {ms365Users.length > 0 && <UserList users={ms365Users} label="Microsoft 365" />}
        </div>
      </IntegrationCard>

      {/* Azure AD */}
      <IntegrationCard
        title="Azure Active Directory"
        subtitle="Identidade, Usuários, Grupos"
        icon={<Users className="w-4 h-4" />}
        color="#bc8cff"
        open={azureOpen}
        onToggle={() => setAzureOpen(!azureOpen)}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#bc8cff]/8 border border-[#bc8cff]/20 text-xs text-[#bc8cff] space-y-1">
            <p className="font-semibold">Permissões necessárias no App Registration:</p>
            <code className="block font-mono bg-black/20 rounded px-2 py-1">User.Read.All · Directory.Read.All · AuditLog.Read.All</code>
            <p className="mt-1 text-[#bc8cff]/70">Conceda <strong>admin consent</strong> para a organização após adicionar as permissões.</p>
          </div>
          <div className="grid gap-3">
            <Field label="Directory (Tenant) ID" value={azureTenant} onChange={setAzureTenant}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled={azureStatus === "saving"} />
            <Field label="Application (Client) ID" value={azureClient} onChange={setAzureClient}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" disabled={azureStatus === "saving"} />
            <Field label="Client Secret" type="password" value={azureSecret} onChange={setAzureSecret}
              placeholder="••••••••••••••" disabled={azureStatus === "saving"} />
          </div>
          {azureMsg && (
            <p className={`text-xs ${azureStatus === "ok" ? "text-[#3fb950]" : "text-destructive"}`}>{azureMsg}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveAzure} disabled={azureStatus === "saving"}
              className={`${btnCls} bg-[#bc8cff]/10 border border-[#bc8cff]/30 text-[#bc8cff] hover:bg-[#bc8cff]/20`}>
              {azureStatus === "saving" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Salvar credenciais Azure AD
            </button>
            {azureStatus === "ok" && (
              <button onClick={auditAzure} disabled={loadingAzure}
                className={`${btnCls} border border-border text-muted-foreground hover:text-foreground hover:bg-white/5`}>
                {loadingAzure ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Auditar contas inativas (90d)
              </button>
            )}
          </div>
          {azureUsers.length > 0 && <UserList users={azureUsers} label="Azure AD" />}
        </div>
      </IntegrationCard>
    </div>
  );
}

function UserList({ users, label }: { users: any[]; label: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-secondary/40 text-xs font-medium text-muted-foreground">
        {users.length} usuário(s) inativo(s) — {label}
      </div>
      <div className="divide-y divide-border max-h-52 overflow-y-auto">
        {users.map((u, i) => (
          <div key={i} className="px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{u.display_name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <span className="text-xs font-medium text-[#d29922]">
              {u.days_inactive >= 0 ? `${u.days_inactive}d inativo` : "nunca logou"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
