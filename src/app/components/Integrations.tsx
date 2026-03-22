import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const API_URL = (import.meta as any).env?.VITE_API_URL || "https://sentinel360.onrender.com";

export function Integrations() {
  const [status, setStatus] = useState("idle");

  const startScan = async () => {
    setStatus("scanning");
    try {
      await fetch(`${API_URL}/scan?days=180`, { method: "POST" });
      alert("Varredura iniciada! Aguarde alguns minutos e atualize os relatórios.");
      setStatus("done");
    } catch (e) {
      alert("Erro ao conectar com o backend.");
      setStatus("idle");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ações do Sentinel</h1>
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle>Motor de Varredura Local</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-sm text-slate-600">Inicia a análise de riscos e arquivos inativos no servidor.</p>
          <Button 
            onClick={startScan} 
            disabled={status === "scanning"}
            className={status === "scanning" ? "bg-slate-400" : "bg-blue-600"}
          >
            {status === "scanning" ? "Varrendo..." : <><Play className="mr-2 h-4 w-4" /> Iniciar Scan Real</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}