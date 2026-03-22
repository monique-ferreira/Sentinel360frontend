import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Play, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

const API_URL = "https://sentinel360.onrender.com";

export function Integrations() {
  const [status, setStatus] = useState<any>({ is_scanning: false, progress: 0 });

  // Polling: Verifica o estado a cada 2 segundos. 
  // Isso permite que você mude de aba e volte, e os dados continuem atualizados.
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/scan-status`);
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error("Erro ao buscar status");
      }
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus(); // Chama imediatamente ao montar
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = async () => {
    try {
      await fetch(`${API_URL}/scan?days=180`, { method: "POST" });
    } catch (e) {
      alert("Falha ao iniciar motor.");
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Calculando...";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s restantes`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
        <p className="text-muted-foreground">Gerencie o motor de busca e integrações do Sentinel 360.</p>
      </div>

      <Card className={`border-2 ${status.is_scanning ? "border-blue-500 animate-pulse" : "border-slate-200"}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {status.is_scanning ? <ShieldAlert className="text-blue-500" /> : <CheckCircle2 className="text-green-500" />}
                Motor de Varredura Local
              </CardTitle>
              <CardDescription>
                Análise profunda de arquivos inativos e documentos sensíveis (LGPD).
              </CardDescription>
            </div>
            <Button 
              onClick={handleStartScan} 
              disabled={status.is_scanning}
              className={status.is_scanning ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}
            >
              {status.is_scanning ? "Escaneando..." : <><Play className="mr-2 h-4 w-4" /> Iniciar Scan Real</>}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {status.is_scanning ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Progresso Total: {status.progress}%</span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-4 h-4" /> {formatTime(status.eta_seconds)}
                </span>
              </div>
              <Progress value={status.progress} className="h-3 w-full bg-slate-100" />
              <div className="grid grid-cols-2 text-xs text-muted-foreground">
                <span>Arquivos total: {status.total}</span>
                <span className="text-right">Processados: {status.processed}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg text-center text-sm text-slate-500 border border-dashed border-slate-300">
              O motor está em espera. Clique no botão acima para iniciar a varredura no servidor.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}