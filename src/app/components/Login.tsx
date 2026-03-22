import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ShieldCheck, UserPlus, LogIn, Mail, Lock, User, Loader2 } from "lucide-react";

// URL do teu Backend no Render
const API_URL = "https://sentinel360.onrender.com";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [loading, setLoading] = useState(false);

  // Estados para Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Estados para Registro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  // FUNÇÃO DE LOGIN (FETCH REAL)
  const handleLogin = async () => {
    if (!loginUser || !loginPass) return alert("Preencha os campos de login.");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("sentinel_token", data.access_token);
        onLogin(data.access_token);
      } else {
        alert(data.detail || "Erro ao fazer login");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE REGISTRO (FETCH REAL)
  const handleRegister = async () => {
    if (!regName || !regEmail || !regPass) return alert("Preencha todos os campos.");

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regEmail.split('@')[0], // Gera um username do email
          password: regPass,
          email: regEmail,
          fullname: regName
        }),
      });

      if (response.ok) {
        alert("Conta criada com sucesso! Agora faça login.");
        // Opcional: mudar para aba login automaticamente aqui
      } else {
        const data = await response.json();
        alert(data.detail || "Erro ao registrar");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <Card className="w-[420px] border-slate-200 bg-white shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-100">
            <ShieldCheck className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Sentinel 360</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Cyber Defense & Governance</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-green-600">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Registrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="E-mail ou Utilizador" 
                    className="pl-10" 
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="Senha" 
                    className="pl-10"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><LogIn className="mr-2 h-4 w-4" /> Acessar Dashboard</>}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-5">
              <div className="space-y-4">
                <Input 
                  placeholder="Nome Completo" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <Input 
                  placeholder="E-mail Corporativo" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <Input 
                  type="password" 
                  placeholder="Criar Senha Segura" 
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleRegister} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><UserPlus className="mr-2 h-4 w-4" /> Finalizar Registo</>}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className="p-4 text-center border-t border-slate-50 bg-slate-50/50 rounded-b-2xl text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Sentinel 360 v1.0.2 • Securing Your Data
        </div>
      </Card>
    </div>
  );
}