import { useState } from "react";
import { Building2, Users, ShieldOff, RefreshCw, CheckCircle2, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

function daysSince(iso: string | null): string {
  if (!iso) return "nunca";
  return `${Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)}d`;
}

function ConfigForm({ onSaved }: { onSaved: () => void }) {
  const [tenant, setTenant] = useState("");
  const [clientId, setClientId] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const save = async () => {
    if (!tenant||!clientId||!secret) { setError("Preencha todos os campos."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("s360_token") ?? ""}` },
        body: JSON.stringify({ tenant_id: tenant, client_id: clientId, client_secret: secret }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? "Erro");
      setOk(true); setTimeout(onSaved, 1000);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-medium mb-1">Como configurar:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Acesse portal.azure.com &rarr; App registrations &rarr; New registration</li>
          <li>Anote o Application (Client) ID e o Directory (Tenant) ID</li>
          <li>Crie um Client Secret em Certificates and secrets</li>
          <li>Adicione permissoes: User.Read.All, Directory.Read.All</li>
          <li>Conceda admin consent para a organizacao</li>
        </ol>
      </div>
      <div><label className="text-xs font-medium">Directory (Tenant) ID</label>
        <input className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={tenant} onChange={e=>setTenant(e.target.value)}/></div>
      <div><label className="text-xs font-medium">Application (Client) ID</label>
        <input className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={clientId} onChange={e=>setClientId(e.target.value)}/></div>
      <div><label className="text-xs font-medium">Client Secret</label>
        <input type="password" className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" placeholder="••••••••••••••••" value={secret} onChange={e=>setSecret(e.target.value)}/></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Configurado!</p>}
      <button onClick={save} disabled={loading} className="w-full py-2 text-sm bg-foreground text-background rounded-md hover:oropacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Lock className="h-4 w-4"/>} Salvar credenciais
      </button>
    </div>
  );
}

function AuditResults() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(90);
  const headers = { Authorization: `Bearer ${localStorage.getItem("s360_token") ?? ""}` };
  const run = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/integrations/office365/audit?inactive_days=${days}`, { headers });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? "Erro na auditoria"); }
      setData(await res.json());
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium">Dias de inatividade</label>
          <input type="number" min={7} max={365} value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"/>
        </div>
        <div className="pt-5">
          <button onClick={run} disabled={loading} className="px-4 py-2 text-sm bg-foreground text-background rounded-md hover:oropacity-90 disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Users className="h-4 w-4"/>} Auditar AD
          </button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.includes("nao configurado") ? "Configure as credenciais do Azure AD acima primeiro." : error}</div>}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-secondary p-3 text-center"><p className="text-2xl font-medium">{data.total_users}</p><p className="text-xs text-muted-foreground">usuarios totais</p></div>
            <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-2xl font-medium text-amber-700">{data.inactive_count}</p><p className="text-xs text-muted-foreground">inativos (+{days}d)</p></div>
            <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-2xl font-medium text-green-700">{data.total_users-data.inactive_count}</p><p className="text-xs text-muted-foreground">ativos</p></div>
          </div>
          {data.inactive_users?.length>0 && (
            <div><p className="text-sm font-medium mb-2 flex items-center gap-2"><ShieldOff className="h-4 w-4 text-amber-500"/> Usuarios inativos ({data.inactive_users.length})</p>
              <div className="divide-y divide-border border rounded-lg overflow-hidden">
                {data.inactive_users.map((u:any)=>(
                  <div key={u.id} className="flex items-center justify-between px-3 py-2.5">
                    <div className="min-w-0"><p className="text-sm font-medium truncate">{u.display_name}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                    <div className="text-right shrink-0 ml-2"><p className="text-xs font-medium text-amber-600">{u.days_inactive>=0?`${u.days_inactive}d inativo`:"nunca logou"}</p><p className="text-xs text-muted-foreground">{daysSince(u.last_signin)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.inactive_users?.length===0 && <div className="py-6 text-center text-sm text-muted-foreground"><CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2"/> Nenhum usuario inativo encontrado.</div>}
        </div>
      )}
    </div>
  );
}

export function Office365Page() {
  const [tab, setTab] = useState<"audit"|"config">("audit");
  const tabCls = (t: string) => `px-4 py-2 text-sm border-b-2 transition-colors ${tab===t?"border-foreground font-medium":"border-transparent text-muted-foreground"}`;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight flex items-center gap-2"><Building2 className="h-6 w-6"/> Office 365 / Azure AD</h1>
        <p className="text-sm text-muted-foreground">Audite usuarios inativos, contas sem MFA e arquivos compartilhados.</p>
      </div>
      <div className="flex border-b border-border">
        <button className={tabCls("audit")} onClick={()=>setTab("audit")}><Users className="inline h-4 w-4 mr-1"/> Auditoria AD</button>
        <button className={tabCls("config")} onClick={()=>setTab("config")}><Lock className="inline h-4 w-4 mr-1"/> Configurar integracao</button>
      </div>
      <div className="bg-background border rounded-lg p-6">
        {tab==="config" && <ConfigForm onSaved={()=>setTab("audit")}/>}
        {tab==="audit" && <AuditResults/>}
      </div>
    </div>
  );
}
