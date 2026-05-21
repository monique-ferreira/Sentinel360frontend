import { useEffect, useState } from "react";
import {
  Building2, Users, CheckCircle2, XCircle, RefreshCw,
  AlertCircle, Loader2, ShieldAlert, FolderClock, HardDrive,
  Zap, Eye, ShieldCheck, Download,
} from "lucide-react";
import { useNavigate } from "react-router";
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

  const [scanning, setScanning] = useState<string | null>(null);
  const navigate = useNavigate();

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
        if (action === "approve") load();
      }
    } catch { /* ignore */ }
    finally { setActionLoading(null); setTimeout(() => setActionMsg(""), 3000); }
  };

  const handleScan = async (targetUsername: string) => {
    setScanning(targetUsername);
    setActionMsg("");
    try {
      const res = await fetch(`${API_URL}/workspace/member/${targetUsername}/scan`, {
        method: "POST",
        headers: h,
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message ?? `Scan iniciado para ${targetUsername}.`);
      } else {
        setActionMsg(data.detail ?? "Erro ao iniciar scan.");
      }
    } catch {
      setActionMsg("Erro ao iniciar scan.");
    } finally {
      setScanning(null);
      setTimeout(() => setActionMsg(""), 4000);
    }
  };

  const handlePromote = async (targetUsername: string) => {
    if (!confirm(`Promover ${targetUsername} a administrador?`)) return;
    setActionLoading("promote_" + targetUsername);
    try {
      const res = await fetch(`${API_URL}/orgs/members/${targetUsername}/promote`, {
        method: "POST",
        headers: h,
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message ?? `${targetUsername} promovido.`);
        load();
      } else {
        setActionMsg(data.detail ?? "Erro ao promover.");
      }
    } catch {
      setActionMsg("Erro ao promover.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMsg(""), 4000);
    }
  };

  const handleBiDownload = async (targetUsername?: string) => {
    const key = targetUsername ? "bi_" + targetUsername : "bi_geral";
    setActionLoading(key);
    try {
      const url = targetUsername
        ? `${API_URL}/workspace/bi-report?target_username=${encodeURIComponent(targetUsername)}`
        : `${API_URL}/workspace/bi-report`;
      const res = await fetch(url, { headers: h });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionMsg(data.detail ?? "Erro ao exportar BI.");
        setTimeout(() => setActionMsg(""), 4000);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `sentinel360_bi_${targetUsername ?? "geral"}.xlsx`;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      setActionMsg("Erro ao exportar BI.");
      setTimeout(() => setActionMsg(""), 4000);
    } finally {
      setActionLoading(null);
    }
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#bc8cff]" />
            Workspace
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerenciamento de membros e dados da organização
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleBiDownload()}
            disabled={actionLoading === "bi_geral"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-40 transition-colors"
          >
            {actionLoading === "bi_geral"
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Download className="h-3.5 w-3.5" />}
            Exportar BI Geral
          </button>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Scan */}
                        <button
                          onClick={() => handleScan(m.username)}
                          disabled={scanning === m.username}
                          title="Iniciar scan"
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
                        >
                          {scanning === m.username
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Zap className="h-3.5 w-3.5" />}
                        </button>
                        {/* Ver dados */}
                        <button
                          onClick={() => navigate(`/workspace/member/${m.username}`)}
                          title="Ver dados"
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {/* Promover admin */}
                        {m.org_role !== "admin" && (
                          <button
                            onClick={() => handlePromote(m.username)}
                            disabled={actionLoading === "promote_" + m.username}
                            title="Promover a admin"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === "promote_" + m.username
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <ShieldCheck className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {/* BI download */}
                        <button
                          onClick={() => handleBiDownload(m.username)}
                          disabled={actionLoading === "bi_" + m.username}
                          title="Exportar BI"
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === "bi_" + m.username
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />}
                        </button>
                      </div>
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
