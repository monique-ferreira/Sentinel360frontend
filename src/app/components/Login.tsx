import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Shield, AlertCircle, Loader2,
  CheckCircle2, Lock, Users, FileSearch, BarChart3,
  User, Building2, ArrowLeft, Search,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

type View = "login" | "register" | "forgot";
type AccountType = "personal" | "corporate";
type RegStep = 1 | 2;
type OrgAction = "create" | "join";

const features = [
  { icon: <FileSearch className="w-5 h-5" />, label: "Varredura automatizada de arquivos inativos" },
  { icon: <Lock className="w-5 h-5" />, label: "Detecção de credenciais e dados sensíveis" },
  { icon: <Users className="w-5 h-5" />, label: "Integração com Microsoft 365 e Azure AD" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Relatórios e dashboards em tempo real" },
];

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [view, setView] = useState<View>("login");

  // Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register — step system
  const [regStep, setRegStep] = useState<RegStep>(1);
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  // Corporate fields
  const [orgAction, setOrgAction] = useState<OrgAction>("create");
  const [orgName, setOrgName] = useState("");
  const [orgSearch, setOrgSearch] = useState("");
  const [orgSuggestions, setOrgSuggestions] = useState<any[]>([]);
  const [orgSugLoading, setOrgSugLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const go = (v: View) => { setView(v); setError(""); setSuccess(""); setRegStep(1); };

  // Org search debounce
  useEffect(() => {
    if (orgAction !== "join") return;
    if (!orgSearch.trim()) { setOrgSuggestions([]); return; }
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setOrgSugLoading(true);
      try {
        // We can't call authenticated endpoint here, so we'll handle this after registration
        // For now do a best-effort unauthenticated search (backend can allow it)
        const res = await fetch(`${API_URL}/orgs/search?q=${encodeURIComponent(orgSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setOrgSuggestions(data.orgs ?? []);
        }
      } catch { /* ignore */ }
      finally { setOrgSugLoading(false); }
    }, 350);
  }, [orgSearch, orgAction]);

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
    } catch (err: any) {
      setError(`Erro de conexão: ${err?.message ?? "verifique o console (F12)"}`);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPass) { setError("Preencha todos os campos."); return; }
    if (regPass.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    if (accountType === "corporate" && orgAction === "create" && !orgName.trim()) {
      setError("Informe o nome da organização."); return;
    }
    if (accountType === "corporate" && orgAction === "join" && !selectedOrg) {
      setError("Selecione uma organização da lista."); return;
    }

    setLoading(true); setError("");
    try {
      const body: any = {
        username:     regUsername.trim(),
        email:        regEmail.trim(),
        password:     regPass,
        full_name:    regFullName.trim() || regUsername.trim(),
        account_type: accountType,
      };
      if (accountType === "corporate") {
        body.org_action = orgAction;
        if (orgAction === "create") {
          body.org_name = orgName.trim();
          body.org_slug = orgName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
        } else {
          body.org_id = selectedOrg.org_id;
        }
      }
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail ?? "Erro ao criar conta.");
        return;
      }
      if (accountType === "corporate" && orgAction === "join") {
        setSuccess("Conta criada! Aguardando aprovação do administrador.");
      } else {
        setSuccess("Conta criada! Faça o login.");
      }
      go("login");
      setLoginUser(regUsername.trim());
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
                {view === "login" ? "Bem-vindo de volta" : (regStep === 1 ? "Criar conta" : "Seus dados")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {view === "login"
                  ? "Entre na sua conta para continuar"
                  : regStep === 1
                    ? "Escolha o tipo de conta"
                    : accountType === "personal"
                      ? "Informações pessoais"
                      : "Informações corporativas"}
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

          {/* REGISTER — step 1: account type */}
          {view === "register" && regStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("personal")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    accountType === "personal"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accountType === "personal" ? "bg-primary/10" : "bg-secondary"}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Pessoal</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Uso individual</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("corporate")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    accountType === "corporate"
                      ? "border-[#58a6ff] bg-[#58a6ff]/5 text-[#58a6ff]"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accountType === "corporate" ? "bg-[#58a6ff]/10" : "bg-secondary"}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Corporativo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Equipes e orgs</p>
                  </div>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRegStep(2)}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* REGISTER — step 2 */}
          {view === "register" && regStep === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <button
                type="button"
                onClick={() => { setRegStep(1); setError(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nome de usuário</label>
                <input type="text" autoComplete="username" className={inputCls}
                  placeholder="usuario123" value={regUsername}
                  onChange={e => setRegUsername(e.target.value.replace(/\s/g, ""))} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome completo</label>
                <input type="text" autoComplete="name" className={inputCls}
                  placeholder="Seu Nome" value={regFullName}
                  onChange={e => setRegFullName(e.target.value)} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" autoComplete="email" className={inputCls}
                  placeholder={accountType === "corporate" ? "voce@empresa.com" : "voce@email.com"}
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} disabled={loading} />
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

              {/* Corporate extra fields */}
              {accountType === "corporate" && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organização</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setOrgAction("create"); setSelectedOrg(null); }}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                        orgAction === "create"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Criar nova empresa
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgAction("join")}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                        orgAction === "join"
                          ? "border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Entrar em empresa
                    </button>
                  </div>

                  {orgAction === "create" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Nome da empresa</label>
                      <input type="text" className={inputCls}
                        placeholder="Minha Empresa Ltda" value={orgName}
                        onChange={e => setOrgName(e.target.value)} disabled={loading} />
                    </div>
                  )}

                  {orgAction === "join" && (
                    <div className="relative">
                      <label className="block text-sm font-medium mb-1.5">Buscar empresa</label>
                      {selectedOrg ? (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-md border border-[#58a6ff]/40 bg-[#58a6ff]/5 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{selectedOrg.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedOrg.member_count} membro(s)</p>
                          </div>
                          <button type="button" onClick={() => { setSelectedOrg(null); setOrgSearch(""); }}
                            className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input type="text" className={inputCls + " pl-9"}
                              placeholder="Digite o nome da empresa..."
                              value={orgSearch} onChange={e => { setOrgSearch(e.target.value); setSelectedOrg(null); }}
                              disabled={loading} />
                          </div>
                          {(orgSuggestions.length > 0 || orgSugLoading) && (
                            <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                              {orgSugLoading && (
                                <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando...
                                </div>
                              )}
                              {orgSuggestions.map(org => (
                                <button key={org.org_id} type="button"
                                  onClick={() => { setSelectedOrg(org); setOrgSearch(org.name); setOrgSuggestions([]); }}
                                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 text-left transition-colors">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{org.name}</p>
                                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{org.member_count} membro(s)</span>
                                </button>
                              ))}
                              {!orgSugLoading && orgSuggestions.length === 0 && orgSearch.trim() && (
                                <div className="px-3 py-2.5 text-xs text-muted-foreground">Nenhuma empresa encontrada.</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {orgAction === "join" && (
                        <p className="text-xs text-[#58a6ff] mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Você aguardará aprovação do administrador.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
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
