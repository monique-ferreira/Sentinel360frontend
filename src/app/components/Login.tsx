import { useState } from "react";
import {
  Eye, EyeOff, Shield, AlertCircle, Loader2,
  CheckCircle2, Lock, Users, FileSearch, BarChart3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360-production.up.railway.app";

type View = "login" | "register" | "forgot";

const features = [
  { icon: <FileSearch className="w-5 h-5" />, label: "Varredura automatizada de arquivos inativos" },
  { icon: <Lock className="w-5 h-5" />, label: "Detecção de credenciais e dados sensíveis" },
  { icon: <Users className="w-5 h-5" />, label: "Integração com Microsoft 365 e Azure AD" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Relatórios e dashboards em tempo real" },
];

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [view, setView] = useState<View>("login");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regOrg, setRegOrg] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const go = (v: View) => { setView(v); setError(""); setSuccess(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) { setError("Preencha usuário e senha."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setError("Usuário ou senha incorretos.");
        else if (res.status === 403) setError("Conta desativada. Contate o administrador.");
        else if (res.status >= 500) setError("Servidor indisponível. O servidor pode estar iniciando — aguarde 30s.");
        else setError(data?.detail ?? `Erro ${res.status}.`);
        return;
      }
      onLogin(data.access_token);
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPass || !regOrg) { setError("Preencha todos os campos."); return; }
    if (regPass.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regEmail.split("@")[0],
          email: regEmail,
          password: regPass,
          full_name: regEmail.split("@")[0],
          org_name: regOrg,
          org_slug: regOrg.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || data?.detail?.includes("already")) setError("Email já cadastrado. Faça login.");
        else setError(data?.detail ?? "Erro ao criar conta.");
        return;
      }
      setSuccess("Conta criada! Faça o login.");
      go("login");
      setLoginUser(regEmail.split("@")[0]);
    } catch { setError("Erro de conexão. Tente novamente."); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setError("Informe seu email."); return; }
    setLoading(true); setError("");
    try {
      await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
    } catch { /* silencioso */ }
    finally { setForgotSent(true); setLoading(false); }
  };

  const inputCls = "w-full h-10 rounded-md border border-border bg-input-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors disabled:opacity-50";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#080d14] border-r border-border relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080d14]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Sentinel360</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Visibilidade total.<br />
            <span className="text-primary">Risco zero.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Plataforma de governança e segurança de dados para ambientes corporativos Windows e Linux.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                {f.icon}
              </div>
              <span className="text-sm text-muted-foreground">{f.label}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-muted-foreground/50">
          Sentinel360 &copy; {new Date().getFullYear()} — Cyber Defense Team
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-semibold">Sentinel360</span>
          </div>

          {view !== "forgot" && (
            <>
              <h2 className="text-2xl font-bold mb-1">
                {view === "login" ? "Bem-vindo de volta" : "Criar conta"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {view === "login"
                  ? "Entre na sua conta para continuar"
                  : "Registre sua organização no Sentinel360"}
              </p>

              <div className="flex gap-1 p-1 rounded-lg bg-secondary mb-6">
                <button
                  onClick={() => go("login")}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${view === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => go("register")}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${view === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Registrar
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* LOGIN */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Usuário</label>
                <input
                  type="text" autoComplete="username"
                  className={inputCls} placeholder="seu_usuario"
                  value={loginUser} onChange={e => setLoginUser(e.target.value)} disabled={loading}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  <button type="button" onClick={() => { go("forgot"); setForgotSent(false); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} autoComplete="current-password"
                    className={inputCls + " pr-10"} placeholder="••••••••"
                    value={loginPass} onChange={e => setLoginPass(e.target.value)} disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Entrando...</> : "Entrar"}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email corporativo</label>
                <input type="email" autoComplete="email" className={inputCls}
                  placeholder="voce@empresa.com" value={regEmail}
                  onChange={e => setRegEmail(e.target.value)} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome da organização</label>
                <input type="text" className={inputCls}
                  placeholder="Minha Empresa" value={regOrg}
                  onChange={e => setRegOrg(e.target.value)} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Senha</label>
                <div className="relative">
                  <input type={showRegPass ? "text" : "password"} autoComplete="new-password"
                    className={inputCls + " pr-10"} placeholder="Mínimo 8 caracteres"
                    value={regPass} onChange={e => setRegPass(e.target.value)} disabled={loading} />
                  <button type="button" onClick={() => setShowRegPass(!showRegPass)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {regPass && regPass.length < 8 && (
                  <p className="text-xs text-yellow-500 mt-1">Mínimo 8 caracteres</p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Criando...</> : "Criar conta"}
              </button>
            </form>
          )}

          {/* FORGOT */}
          {view === "forgot" && (
            <div>
              <button onClick={() => go("login")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                ← Voltar ao login
              </button>
              <h2 className="text-2xl font-bold mb-1">Recuperar senha</h2>
              <p className="text-sm text-muted-foreground mb-6">Enviaremos um link para o seu email.</p>
              {forgotSent ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-2">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">Email enviado!</p>
                  <p className="text-sm text-muted-foreground">Se o email existir, você receberá as instruções em instantes.</p>
                  <button onClick={() => go("login")} className="mt-4 text-sm text-primary hover:underline">
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input type="email" autoComplete="email" className={inputCls}
                      placeholder="voce@empresa.com" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)} disabled={loading} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</> : "Enviar instruções"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
