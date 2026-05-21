import { useEffect, useState } from "react";
import {
  User, Building2, CheckCircle2, Clock, Loader2, AlertCircle,
  Save, Mail, Shield, Users, CalendarClock,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { NavLink } from "react-router";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

type SaveStatus = "idle" | "saving" | "ok" | "error";

export function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [inactivityDays, setInactivityDays] = useState(180);
  const [autoScanInterval, setAutoScanInterval] = useState("never");
  const [autoScanHour, setAutoScanHour] = useState(6);
  const [autoScanMinute, setAutoScanMinute] = useState(0);
  const [autoScanDay, setAutoScanDay] = useState(1);
  const [lastAutoScan, setLastAutoScan] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/user/me`, { headers: h });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setProfile(data);
      setFullName(data.full_name ?? "");
      setEmail(data.email ?? "");
      setInactivityDays(data.inactivity_days ?? 180);
      setAutoScanInterval(data.auto_scan_interval ?? "never");
      setAutoScanHour(data.auto_scan_hour ?? 6);
      setAutoScanMinute(data.auto_scan_minute ?? 0);
      setAutoScanDay(data.auto_scan_day ?? 1);
      setLastAutoScan(data.last_auto_scan ?? null);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar perfil.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving"); setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        method: "PUT",
        headers: h,
        body: JSON.stringify({
          full_name:           fullName.trim() || undefined,
          email:               email.trim() || undefined,
          inactivity_days:     inactivityDays,
          auto_scan_interval:  autoScanInterval,
          auto_scan_hour:      autoScanHour,
          auto_scan_minute:    autoScanMinute,
          auto_scan_day:       autoScanDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus("error");
        setSaveMsg(data?.detail ?? "Erro ao salvar.");
        return;
      }
      setSaveStatus("ok");
      setSaveMsg("Perfil atualizado com sucesso.");
      setProfile((p: any) => ({ ...p, full_name: fullName, email, inactivity_days: inactivityDays, auto_scan_interval: autoScanInterval }));
    } catch {
      setSaveStatus("error");
      setSaveMsg("Erro de conexão.");
    }
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const inputCls = "w-full h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors disabled:opacity-50";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Carregando perfil...</span>
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

  const isPersonal  = profile?.account_type === "personal" || !profile?.account_type;
  const isCorporate = profile?.account_type === "corporate";
  const isAdmin     = profile?.org_role === "admin";
  const isPending   = profile?.org_status === "pending";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-[#58a6ff]" />
          Meu Perfil
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {/* Account type badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCorporate ? "bg-[#58a6ff]/10 border border-[#58a6ff]/20" : "bg-primary/10 border border-primary/20"
        }`}>
          {isCorporate
            ? <Building2 className="w-5 h-5 text-[#58a6ff]" />
            : <User className="w-5 h-5 text-primary" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{profile?.username}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isCorporate
                ? "bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}>
              {isCorporate ? "Corporativo" : "Pessoal"}
            </span>
            {isCorporate && isAdmin && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#bc8cff]/10 text-[#bc8cff] border border-[#bc8cff]/20">
                Admin
              </span>
            )}
            {isCorporate && isPending && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Aguardando aprovação
              </span>
            )}
            {isCorporate && profile?.org_status === "approved" && !isAdmin && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                Membro ativo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Org info (corporate) */}
      {isCorporate && profile?.org_name && (
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-[#58a6ff]" />
            {profile.org_name}
          </div>
          {isAdmin && profile?.org_member_count != null && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {profile.org_member_count} membro(s)
              </div>
              <NavLink to="/workspace"
                className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Ver workspace
              </NavLink>
            </div>
          )}
          {isPending && (
            <p className="text-xs text-yellow-400">
              Sua solicitação está sendo analisada pelo administrador.
            </p>
          )}
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Editar informações</h3>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome completo</label>
          <input
            type="text" className={inputCls}
            placeholder="Seu nome"
            value={fullName} onChange={e => setFullName(e.target.value)}
            disabled={saveStatus === "saving"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span>
          </label>
          <input
            type="email" className={inputCls}
            placeholder="voce@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            disabled={saveStatus === "saving"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Limiar de inatividade (dias)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              className="w-24 h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors"
              value={inactivityDays}
              onChange={e => {
                const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                if (!isNaN(v) && v >= 1) setInactivityDays(v);
              }}
              disabled={saveStatus === "saving"}
            />
            <span className="text-xs text-muted-foreground">dias sem acesso = arquivo inativo</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Varredura automática</span>
          </label>

          {/* Frequency */}
          <select
            className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors disabled:opacity-50"
            value={autoScanInterval}
            onChange={e => setAutoScanInterval(e.target.value)}
            disabled={saveStatus === "saving"}
          >
            <option value="never">Desativada</option>
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>

          {/* Day + hour selectors */}
          {autoScanInterval !== "never" && (
            <div className="flex flex-wrap gap-3 items-end">
              {/* Day of week (weekly only) */}
              {autoScanInterval === "weekly" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Dia da semana</label>
                  <select
                    className="h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    value={autoScanDay}
                    onChange={e => setAutoScanDay(Number(e.target.value))}
                    disabled={saveStatus === "saving"}
                  >
                    {["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"].map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day of month (monthly only) */}
              {autoScanInterval === "monthly" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Dia do mês</label>
                  <select
                    className="h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    value={autoScanDay}
                    onChange={e => setAutoScanDay(Number(e.target.value))}
                    disabled={saveStatus === "saving"}
                  >
                    {Array.from({length: 28}, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>Dia {d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hour */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Horário</label>
                <input
                  type="time"
                  className="h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  value={`${String(autoScanHour).padStart(2,"0")}:${String(autoScanMinute).padStart(2,"0")}`}
                  onChange={e => {
                    const [h, m] = e.target.value.split(":");
                    setAutoScanHour(Number(h));
                    setAutoScanMinute(Number(m));
                  }}
                  disabled={saveStatus === "saving"}
                />
              </div>
            </div>
          )}

          {lastAutoScan && autoScanInterval !== "never" && (
            <p className="text-xs text-muted-foreground">
              Último scan automático: {new Date(lastAutoScan).toLocaleString("pt-BR")}
            </p>
          )}
          {autoScanInterval !== "never" && (
            <p className="text-xs text-primary/80">
              O Sentinel360 vai varrer seus arquivos automaticamente sem precisar de ação manual.
            </p>
          )}
        </div>

        {saveStatus === "ok" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {saveMsg}
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveMsg}
          </div>
        )}

        <button type="submit" disabled={saveStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saveStatus === "saving"
            ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
            : <><Save className="h-4 w-4" />Salvar alterações</>}
        </button>
      </form>

    </div>
  );
}
