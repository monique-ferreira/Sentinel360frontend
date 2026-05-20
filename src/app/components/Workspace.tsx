import { useEffect, useState } from "react";
import {
  Building2, Users, CheckCircle2, XCircle, RefreshCw,
  AlertCircle, Loader2, ShieldAlert, FolderClock, HardDrive,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

export function Workspace() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [reqRes, wsRes] = await Promise.all([
        fetch(`${API_URL}/orgs/my/requests`, { headers: h }),
        fetch(`${API_URL}/workspace`, { headers: h }),
      ]);
      if (reqRes.status === 403 || wsRes.status === 403) {
        setError("Acesso restrito a administradores de organização.");
        return;
      }
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests ?? []);
      }
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setWorkspace(wsData);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar workspace.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRequest = async (username: string, action: "approve" | "reject") => {
    setActionLoading(username + action);
    try {
      const res = await fetch(`${API_URL}/orgs/my/requests/${username}/${action}`, {
        method: "POST",
        headers: h,
      });
      if (res.ok) {
        setRequests(r => r.filter(req => req.username !== username));
        setActionMsg(`${username} ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso.`);
        if (action === "approve") load(); // Reload workspace to show new member
      }
    } catch { /* ignore */ }
    finally { setActionLoading(null); setTimeout(() => setActionMsg(""), 3000); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Carregando workspace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive max-w-lg">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#bc8cff]" />
            Workspace
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerenciamento de membros e dados da organização
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {actionMsg}
        </div>
      )}

      {/* Pending requests */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-foreground">Solicitações pendentes</h3>
          </div>
          {requests.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
              {requests.length}
            </span>
          )}
        </div>
        {requests.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map(req => (
              <div key={req.username} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString("pt-BR") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRequest(req.username, "approve")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === req.username + "approve"
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRequest(req.username, "reject")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === req.username + "reject"
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <XCircle className="h-3.5 w-3.5" />}
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-foreground">Membros</h3>
          </div>
          {workspace?.total_members != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 font-medium">
              {workspace.total_members}
            </span>
          )}
        </div>
        {!workspace?.members?.length ? (
          <div className="py-10 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Papel</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex items-center justify-end gap-1"><FolderClock className="h-3.5 w-3.5" />Inativos</span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    <span className="flex items-center justify-end gap-1"><ShieldAlert className="h-3.5 w-3.5" />Riscos</span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    <span className="flex items-center justify-end gap-1"><HardDrive className="h-3.5 w-3.5" />Storage</span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workspace.members.map((m: any) => (
                  <tr key={m.username} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            {m.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.username}</p>
                          {m.full_name && <p className="text-xs text-muted-foreground">{m.full_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {m.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.org_role === "admin"
                          ? "bg-[#bc8cff]/10 text-[#bc8cff] border border-[#bc8cff]/20"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}>
                        {m.org_role === "admin" ? "Admin" : "Membro"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium ${m.inactive_files > 0 ? "text-[#d29922]" : "text-muted-foreground"}`}>
                        {m.inactive_files}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className={`text-xs font-medium ${m.risky_files > 0 ? "text-[#f85149]" : "text-muted-foreground"}`}>
                        {m.risky_files}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{m.storage_mb} MB</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-foreground">{m.total_files}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
