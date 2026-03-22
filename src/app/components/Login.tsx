import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ShieldCheck, UserPlus, LogIn, Mail, Lock, User } from "lucide-react";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  // Estados para a aba de Entrar (Login)
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Estados para a aba de Registrar (Cadastro)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  // Função para processar o Login
  const handleLogin = async () => {
    if (loginUser && loginPass) {
      // Simulação de Token - No futuro, aqui será a chamada ao teu backend no Render
      const fakeToken = "auth_token_sentinel_360";
      localStorage.setItem("sentinel_token", fakeToken);
      onLogin(fakeToken);
    } else {
      alert("Erro: Por favor, preencha o utilizador e a senha para entrar.");
    }
  };

  // Função para processar o Registro (Onde estava o erro)
  const handleRegister = async () => {
    if (regName && regEmail && regPass) {
      console.log("Registando:", { regName, regEmail, regPass });
      alert(`Conta criada para ${regName}! Agora já pode fazer login na aba 'Entrar'.`);
      
      // Limpa os campos após registrar
      setRegName("");
      setRegEmail("");
      setRegPass("");
    } else {
      alert("Erro: Preencha TODOS os campos do formulário de registo.");
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
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
              >
                Registrar
              </TabsTrigger>
            </TabsList>

            {/* CONTEÚDO: ENTRAR */}
            <TabsContent value="login" className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Utilizador ou E-mail" 
                    className="pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500" 
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="Senha" 
                    className="pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11 shadow-md shadow-green-100"
              >
                <LogIn className="mr-2 h-4 w-4" /> Acessar Sistema
              </Button>
            </TabsContent>

            {/* CONTEÚDO: REGISTRAR */}
            <TabsContent value="register" className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Nome Completo" 
                    className="pl-10 border-slate-200" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="E-mail Corporativo" 
                    className="pl-10 border-slate-200" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="Criar Senha Segura" 
                    className="pl-10 border-slate-200"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleRegister} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 shadow-md shadow-blue-100"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Finalizar Registo
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className="p-4 text-center border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Sentinel 360 v1.0.2 • Securing Your Data
          </p>
        </div>
      </Card>
    </div>
  );
}