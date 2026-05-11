import { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

type View = "login" | "register" | "forgot";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [view, setView] = useState<View>("login");

  // Login fields
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regOrg, setRegOrg] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) { setError("Preencha usuario e senha."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setError("Usuario ou senha incorretos. Verifique suas credenciais.");
        else if (res.status === 403) setError("Conta desativada. Entre em contato com o administrador.");
        else if (res.status === 422) setError("Formato invalido. Tente novamente.");
        else if (res.status === 0 || res.status >= 500) setError("Servidor indisponivel. Aguarde alguns segundos e tente novamente (o servidor pode estar iniciando).");
        else setError(data?.detail ?? `Erro ${res.status}. Tente novamente.`);
        return;
      }
      localStorage.setItem("s360_token", data.access_token);
      onLogin(data.access_token);
    } catch (err: any) {
      if (err.message?.includes("fetch")) {
        setError("Nao foi possivel conectar ao servidor. Verifique sua conexao ou aguarde o servidor iniciar.");
      } else {
        setError("Erro inesperado: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPass || !regOrg) { setError("Preencha todos os campos."); return; }
    if (regPass.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true); setError(""); setSuccess("");
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
        if (res.status === 409 || data?.detail?.includes("duplicate") || data?.detail?.includes("already")) {
          setError("Email ja cadastrado. Tente fazer login.");
        } else {
          setError(data?.detail ?? "Erro ao criar conta.");
        }
        return;
      }
      setSuccess("Conta criada com sucesso! Faca o login.");
      setView("login");
      setLoginUser(regEmail.split("@")[0]);
    } catch (err: any) {
      setError("Erro de conexao: " + err.message);
    } finally {
      setLoading(false);
    }
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
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground mb-4">
            <Shield className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sentinel360</h1>
          <p className="text-sm text-muted-foreground mt-1">Cyber Defense Platform</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {/* Tabs */}
          {view !== "forgot" && (
            <div className="flex border-b border-border mb-6">
              <button
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${view === "login" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setView("login"); setError(""); setSuccess(""); }}
              >
                Entrar
              </button>
              <button
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${view === "register" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setView("register"); setError(""); setSuccess(""); }}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          {/* ââ LOGIN  ââ s}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Usuario</label>
                <input
                  type="text"
                  autoComplete="username"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="seu_usuario"
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    className="w%sfull h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff className="h-size-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(""); setSuccess(""); setForgotSent(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w%sfull h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</> : "Entrar"}
              </button>
            </form>
          )}

          {/* _â REGISTER  ââ s*/}
          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email corporativo</label>
                <input type="email" autoComplete="email" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="voce@empresa.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} disabled={loading}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome da organizacao</label>
                <input type="text" className="w%sfull h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Minha Empresa" value={regOrg} onChange={e => setRegOrg(e.target.value)} disabled={loading}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Senha</label>
                <div className="relative">
                  <input type={showRegPass ? "text" : "password"} autoComplete="new-password" className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Minimo 8 caracteres" value={regPass} onChange={e => setRegPass(e.target.value)} disabled={loading}/>
                  <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showRegPass ? "Ocultar senha" : "Mostrar senha"}>
                    {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {regPass && regPass.length < 8 && (
                  <p className="text-xs text-amber-600 mt-1">Minimo 8 caracteres</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="w%sfull h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando conta...</> : "Criar conta"}
              </button>
            </form>
          )}

          {/* ââ FORGOT PASSWORD  ââ*/}
          {view === "forgot" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setView("login"); setError(""); setForgotSent(false); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &#8592; Voltar
                </button>
                <h2 className="text-base font-medium">Recuperar senha</h2>
              </div>
              {forgotSent ? (
                <div className="text-center space-y-3 py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 mb-2">
                    <Shield className="h-size-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Email enviado!</p>
                  <p className="text-sm text-muted-foreground">Se o email existir no sistema, voce recehera instrucoes para redefinir sua senha em instantes.</p>
                  <button
                    onClick={() => { setView("login"); setForgotSent(false); }}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-sm text-muted-foreground">Informe seu email e enviaremos instrucoes para redefinir sua senha.</p>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input type="email" autoComplete="email" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="voce@empresa.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} disabled={loading}/>
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : "Enviar instrucoes"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sentinel360 &copy; {new Date().getFullYear()} &mdash; Cyber Defense Platform
        </p>
      </div>
    </div>
  );
}
