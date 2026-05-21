import { useEffect, useState, useRef, forwardRef } from "react";
import {
  RefreshCw, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Shield, Users, Building2, Zap,
  Cloud, BarChart3, Download, UserCircle, LogIn, Clock, FileSearch,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
type SaveStatus = "idle" | "saving" | "ok" | "error";
type CloudPhase = "idle" | "scanning" | "done" | "error";
type Provider = "ms365" | "azure" | "personal";

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

const IntegrationCard = forwardRef<HTMLDivElement, {
  title: string; subtitle: string; icon: React.ReactNode; color: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}>(({ title, subtitle, icon, color, open, onToggle, children }, ref) => (
  <div ref={ref} className="rounded-xl border border-border bg-card overflow-hidden scroll-mt-4">
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
));

// Inline scan status shown inside the card that triggered the scan
function ScanStatus({
  phase, progress, processedFiles, etaSeconds, cloudMsg, files,
  filterDateFrom, onFilterDateChange, color,
}: {
  phase: CloudPhase; progress: number; processedFiles: number; etaSeconds: number;
  cloudMsg: string; files: any[]; filterDateFrom: string; onFilterDateChange: (v: string) => void;
  color: string;
}) {
  if (phase === "idle") return null;

  return (
    <div className="mt-4 border-t border-border pt-4 space-y-3">
      {phase === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{cloudMsg}
        </div>
      )}

      {(phase === "scanning" || phase === "done") && (
        <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color }}>
              {phase === "scanning"
                ? <><RefreshCw className="h-3 w-3 animate-spin" />Varrendo arquivos...</>
                : <><CheckCircle2 className="h-3 w-3" />Varredura concluída!</>}
            </span>
            <span className="text-muted-foreground tabular-nums font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(3, Math.min(progress, 100))}%`,
                background: color,
              }}
            />
          </div>
          {phase === "scanning" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileSearch className="h-3 w-3" />
                {processedFiles > 0 ? `${processedFiles} arquivo(s) analisado(s)` : "Iniciando varredura..."}
              </span>
              {etaSeconds > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{etaSeconds < 60 ? `${etaSeconds}s` : `${Math.ceil(etaSeconds / 60)}min`} restante(s)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <>
          {files.length > 0
            ? <CloudFileTable files={files} filterDateFrom={filterDateFrom} onFilterDateChange={onFilterDateChange} />
            : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Filtrar por data de scan:</span>
                  <input
                    type="date" value={filterDateFrom} onChange={e => onFilterDateChange(e.target.value)}
                    className="h-7 px-2 rounded border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  {filterDateFrom && (
                    <button onClick={() => onFilterDateChange("")} className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Nenhum arquivo sensível ou inativo encontrado.</p>
              </div>
            )
          }
        </>
      )}
    </div>
  );
}

export function Integrations() {
  const { token } = useAuth();

  const [inactivityDays, setInactivityDays] = useState<number>(180);
  const [filterDateFrom, setFilterDateFrom] = useState("");

  // Card refs for scroll-into-view
  const personalCardRef = useRef<HTMLDivElement>(null);
  const ms365CardRef    = useRef<HTMLDivElement>(null);
  const azureCardRef    = useRef<HTMLDivElement>(null);

  // Conta pessoal Microsoft
  const [personalOpen, setPersonalOpen]           = useState(false);
  const [personalConnected, setPersonalConnected] = useState(false);
  const [personalEmail, setPersonalEmail]         = useState("");
  const [personalConnecting, setPersonalConnecting] = useState(false);

  // MS365
  const [ms365Open, setMs365Open]         = useState(false);
  const [ms365Tenant, setMs365Tenant]     = useState("");
  const [ms365Client, setMs365Client]     = useState("");
  const [ms365Secret, setMs365Secret]     = useState("");
  const [ms365Status, setMs365Status]     = useState<SaveStatus>("idle");
  const [ms365Msg, setMs365Msg]           = useState("");
  const [ms365Users, setMs365Users]       = useState<any[]>([]);
  const [loadingMs365, setLoadingMs365]   = useState(false);

  // Azure AD
  const [azureOpen, setAzureOpen]         = useState(false);
  const [azureTenant, setAzureTenant]     = useState("");
  const [azureClient, setAzureClient]     = useState("");
  const [azureSecret, setAzureSecret]     = useState("");
  const [azureStatus, setAzureStatus]     = useState<SaveStatus>("idle");
  const [azureMsg, setAzureMsg]           = useState("");
  const [azureUsers, setAzureUsers]       = useState<any[]>([]);
  const [loadingAzure, setLoadingAzure]   = useState(false);

  // Cloud scan — single active scan at a time
  const [cloudPhase, setCloudPhase]           = useState<CloudPhase>("idle");
  const [cloudProvider, setCloudProvider]     = useState<Provider>("personal");
  const [cloudProgress, setCloudProgress]     = useState(0);
  const [cloudMsg, setCloudMsg]               = useState("");
  const [cloudFiles, setCloudFiles]           = useState<any[]>([]);
  const [loadingCloudFiles, setLoadingCloudFiles] = useState(false);
  const [processedFiles, setProcessedFiles]   = useState(0);
  const [etaSeconds, setEtaSeconds]           = useState(-1);
  const cloudPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [biLoading, setBiLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const h = { Authorization: `Bearer ${token}` };

  const isCorporate = userProfile?.account_type === "corporate";
  const isMember    = isCorporate && userProfile?.org_role !== "admin";

  // Load inactivity_days + user profile on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/user/settings`, { headers: h }).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/user/me`, { headers: h }).then(r => r.ok ? r.json() : null),
    ]).then(([settings, profile]) => {
      if (settings?.inactivity_days) setInactivityDays(settings.inactivity_days);
      if (profile) setUserProfile(profile);
    }).catch(() => {});
  }, [token]);

  const saveInactivityDays = (val: number) => {
    setInactivityDays(val);
    fetch(`${API_URL}/user/settings`, {
      method: "PUT",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ inactivity_days: val }),
    }).catch(() => {});
  };

  const stopCloudPoll = () => {
    if (cloudPollRef.current) { clearInterval(cloudPollRef.current); cloudPollRef.current = null; }
  };

  // Detect OAuth callback code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const state  = params.get("state");

    if (code) {
      window.history.replaceState({}, "", window.location.pathname);
      setPersonalOpen(true);
      setPersonalConnecting(true);
      fetch(`${API_URL}/auth/microsoft/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({ code, state: state ?? "" }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.connected) {
            setPersonalConnected(true);
            setPersonalEmail(d.ms_email);
            localStorage.setItem("ms_personal_email", d.ms_email);
          }
        })
        .catch(() => {})
        .finally(() => setPersonalConnecting(false));
      return;
    }

    const saved = localStorage.getItem("ms_personal_email");
    if (saved) { setPersonalConnected(true); setPersonalEmail(saved); }

    fetch(`${API_URL}/auth/microsoft/status`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.connected) {
          setPersonalConnected(true);
          setPersonalEmail(d.ms_email);
          localStorage.setItem("ms_personal_email", d.ms_email);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => () => stopCloudPoll(), []);

  const connectPersonal = async () => {
    setPersonalConnecting(true);
    try {
      const res = await fetch(`${API_URL}/auth/microsoft/login`, { headers: h });
      if (!res.ok) { setPersonalConnecting(false); return; }
      const { auth_url } = await res.json();
      window.location.href = auth_url;
    } catch { setPersonalConnecting(false); }
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
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=${inactivityDays}`, { headers: h });
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
      const res = await fetch(`${API_URL}/integrations/azure/audit?inactive_days=${inactivityDays}`, { headers: h });
      if (!res.ok) { const d = await res.json(); setAzureMsg(d.detail ?? `Erro ${res.status}`); return; }
      const data = await res.json();
      setAzureUsers(data.inactive_users ?? []);
      if (!(data.inactive_users ?? []).length) setAzureMsg("Nenhum usuário inativo encontrado.");
    } catch { setAzureMsg("Servidor indisponível."); }
    finally { setLoadingAzure(false); }
  };

  const startCloudScan = async (provider: Provider) => {
    setCloudProvider(provider);
    setCloudPhase("scanning");
    setCloudProgress(0);
    setCloudMsg("");
    setCloudFiles([]);
    setProcessedFiles(0);
    setEtaSeconds(-1);
    setFilterDateFrom("");

    // Open and scroll to the card that triggered the scan
    if (provider === "personal") { setPersonalOpen(true); setTimeout(() => personalCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    if (provider === "ms365")    { setMs365Open(true);    setTimeout(() => ms365CardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    if (provider === "azure")    { setAzureOpen(true);    setTimeout(() => azureCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }

    const endpoint = provider === "ms365" ? "office365" : provider === "azure" ? "azure" : "personal";
    try {
      const res = await fetch(`${API_URL}/integrations/${endpoint}/scan-files?days=${inactivityDays}`, {
        method: "POST", headers: h,
      });
      if (!res.ok) {
        const d = await res.json();
        setCloudPhase("error");
        setCloudMsg(d.detail ?? `Erro ${res.status}`);
        return;
      }
      stopCloudPoll();
      cloudPollRef.current = setInterval(async () => {
        try {
          const s = await fetch(`${API_URL}/integrations/office365/scan-status`, { headers: h });
          if (!s.ok) return;
          const d = await s.json();
          setCloudProgress(d.progress ?? 0);
          setProcessedFiles(d.processed_files ?? 0);
          setEtaSeconds(d.eta_seconds ?? -1);
          if (d.error) { setCloudPhase("error"); setCloudMsg(d.error); stopCloudPoll(); return; }
          if (!d.is_scanning) {
            setCloudPhase("done");
            stopCloudPoll();
            // Load results
            setLoadingCloudFiles(true);
            const r = await fetch(`${API_URL}/integrations/${endpoint}/file-results`, { headers: h });
            if (r.ok) { const rd = await r.json(); setCloudFiles(rd.items ?? []); }
            setLoadingCloudFiles(false);
          }
        } catch { /* ignore */ }
      }, 2000);
    } catch { setCloudPhase("error"); setCloudMsg("Servidor indisponível."); }
  };

  const downloadBiReport = async () => {
    setBiLoading(true);
    try {
      const res = await fetch(`${API_URL}/report/bi`, { headers: h });
      if (!res.ok) { alert("Erro ao gerar relatório BI."); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `sentinel360_bi_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch { alert("Servidor indisponível."); }
    finally { setBiLoading(false); }
  };

  const btnCls = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";

  const scanStatusBase = {
    phase: cloudPhase, progress: cloudProgress, processedFiles,
    etaSeconds, cloudMsg, files: cloudFiles,
    filterDateFrom, onFilterDateChange: setFilterDateFrom,
  };

  return (
    <div className="space-y-5">
      {/* Header with inactivity threshold */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Painel de Controle
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie o motor de varredura e as integrações do Sentinel 360.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Inativo após</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inactivityDays}
            onChange={e => {
              const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
              const val = !isNaN(v) && v >= 1 ? v : 1;
              saveInactivityDays(val);
            }}
            className="w-14 h-7 px-2 rounded border border-border bg-secondary text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-muted-foreground">dias sem acesso</span>
        </div>
      </div>

      {/* Conta pessoal Microsoft — oculto para contas corporativas */}
      {!isCorporate && <IntegrationCard
        ref={personalCardRef}
        title="Conta Microsoft Pessoal"
        subtitle="OneDrive, arquivos e documentos pessoais"
        icon={<UserCircle className="w-4 h-4" />}
        color="#3fb950"
        open={personalOpen}
        onToggle={() => setPersonalOpen(v => !v)}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#3fb950]/8 border border-[#3fb950]/20 text-xs text-[#3fb950] space-y-1">
            <p className="font-semibold">Acesso via login Microsoft</p>
            <code className="block font-mono bg-black/20 rounded px-2 py-1">OneDrive · Arquivos · Documentos pessoais</code>
          </div>

          {personalConnected ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#3fb950]/8 border border-[#3fb950]/30">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950] shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Conta conectada</p>
                <p className="text-xs text-muted-foreground">{personalEmail}</p>
              </div>
            </div>
          ) : (
            <button onClick={connectPersonal} disabled={personalConnecting}
              className={`${btnCls} bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/20 w-full justify-center`}>
              {personalConnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrar com conta Microsoft
            </button>
          )}

          {personalConnected && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => startCloudScan("personal")}
                disabled={cloudPhase === "scanning"}
                className={`${btnCls} bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/20`}>
                {cloudPhase === "scanning" && cloudProvider === "personal"
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Cloud className="h-4 w-4" />}
                Varrer meu OneDrive
              </button>
              <button onClick={connectPersonal}
                className={`${btnCls} border border-border text-muted-foreground hover:text-foreground hover:bg-white/5`}>
                <RefreshCw className="h-3.5 w-3.5" />Reconectar
              </button>
            </div>
          )}

          {cloudProvider === "personal" && <ScanStatus {...scanStatusBase} color="#3fb950" />}
        </div>
      </IntegrationCard>}

      {/* MS365 */}
      <IntegrationCard
        ref={ms365CardRef}
        title="Microsoft 365"
        subtitle="Exchange, SharePoint, Teams"
        icon={<Building2 className="w-4 h-4" />}
        color="#58a6ff"
        open={ms365Open}
        onToggle={() => setMs365Open(v => !v)}
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
              <>
                <button onClick={auditMs365} disabled={loadingMs365}
                  className={`${btnCls} border border-border text-muted-foreground hover:text-foreground hover:bg-white/5`}>
                  {loadingMs365 ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Verificar usuários inativos
                </button>
                <button onClick={() => startCloudScan("ms365")} disabled={cloudPhase === "scanning"}
                  className={`${btnCls} bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] hover:bg-[#58a6ff]/20`}>
                  {cloudPhase === "scanning" && cloudProvider === "ms365"
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Cloud className="h-4 w-4" />}
                  Varrer arquivos SharePoint/OneDrive
                </button>
              </>
            )}
          </div>
          {ms365Users.length > 0 && <UserList users={ms365Users} label="Microsoft 365" />}

          {cloudProvider === "ms365" && <ScanStatus {...scanStatusBase} color="#58a6ff" />}
        </div>
      </IntegrationCard>

      {/* Azure AD */}
      <IntegrationCard
        ref={azureCardRef}
        title="Azure Active Directory"
        subtitle="Identidade, Usuários, Grupos"
        icon={<Users className="w-4 h-4" />}
        color="#bc8cff"
        open={azureOpen}
        onToggle={() => setAzureOpen(v => !v)}
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
              <>
                <button onClick={auditAzure} disabled={loadingAzure}
                  className={`${btnCls} border border-border text-muted-foreground hover:text-foreground hover:bg-white/5`}>
                  {loadingAzure ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Auditar contas inativas
                </button>
                <button onClick={() => startCloudScan("azure")} disabled={cloudPhase === "scanning"}
                  className={`${btnCls} bg-[#bc8cff]/10 border border-[#bc8cff]/30 text-[#bc8cff] hover:bg-[#bc8cff]/20`}>
                  {cloudPhase === "scanning" && cloudProvider === "azure"
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Cloud className="h-4 w-4" />}
                  Varrer arquivos OneDrive
                </button>
              </>
            )}
          </div>
          {azureUsers.length > 0 && <UserList users={azureUsers} label="Azure AD" />}

          {cloudProvider === "azure" && <ScanStatus {...scanStatusBase} color="#bc8cff" />}
        </div>
      </IntegrationCard>

      {/* BI Report */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#d29922]/10 border border-[#d29922]/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#d29922]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Relatório BI Consolidado</p>
            <p className="text-xs text-muted-foreground">Excel com abas de dados, gráficos e histórico — abrível no Power BI Desktop via "Obter Dados &gt; Excel"</p>
          </div>
        </div>
        {!isMember && (
          <button onClick={downloadBiReport} disabled={biLoading}
            className={`${btnCls} bg-[#d29922]/10 border border-[#d29922]/30 text-[#d29922] hover:bg-[#d29922]/20 shrink-0`}>
            {biLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar BI (.xlsx)
          </button>
        )}
      </div>
    </div>
  );
}

function CloudFileTable({ files, filterDateFrom, onFilterDateChange }: {
  files: any[];
  filterDateFrom: string;
  onFilterDateChange: (v: string) => void;
}) {
  const filtered = filterDateFrom
    ? files.filter(f => f.last_scan && f.last_scan >= filterDateFrom)
    : files;
  const risky = filtered.filter(f => f.riscos && f.riscos !== "NENHUM");
  const shown = filtered.slice(0, 200);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-secondary/40 flex flex-wrap items-center gap-3 justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {filtered.length} item(ns){filterDateFrom ? ` (filtrado de ${files.length})` : ""} — {risky.length} com risco
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtrar por data:</span>
          <input
            type="date" value={filterDateFrom} onChange={e => onFilterDateChange(e.target.value)}
            className="h-7 px-2 rounded border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {filterDateFrom && (
            <button onClick={() => onFilterDateChange("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1">✕</button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-secondary/30">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Nome</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Origem</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Riscos</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Inativo</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">MB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((f, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-3 py-2 text-foreground max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={f.caminho}>
                  {f.nome}
                </td>
                <td className="px-3 py-2 text-muted-foreground max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {f.origem || "—"}
                </td>
                <td className="px-3 py-2">
                  {f.riscos && f.riscos !== "NENHUM"
                    ? <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">{f.riscos}</span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.inativo === "SIM"
                    ? <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20">SIM</span>
                    : <span className="text-muted-foreground">NÃO</span>}
                </td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{f.tamanho_mb}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Mostrando 200 de {filtered.length} itens.
          </p>
        )}
      </div>
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
