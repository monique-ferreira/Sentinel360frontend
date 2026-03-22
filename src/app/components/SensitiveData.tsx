import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { AlertCircle } from "lucide-react";

const API_URL = (import.meta as any).env?.VITE_API_URL || "https://sentinel360.onrender.com";

export function SensitiveData() {
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/results`)
      .then(res => res.json())
      .then(json => {
        const onlyRisks = (json.items || []).filter((i: any) => i.riscos !== "NENHUM");
        setRisks(onlyRisks);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
        <AlertCircle /> Dados Sensíveis Detectados
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Arquivo</TableHead>
            <TableHead>Tipo de Risco</TableHead>
            <TableHead>Caminho Crítico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Nenhuma vulnerabilidade encontrada no momento.</TableCell></TableRow>
          ) : (
            risks.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-bold">{item.nome}</TableCell>
                <TableCell><Badge variant="destructive">{item.riscos}</Badge></TableCell>
                <TableCell className="text-xs text-slate-500">{item.caminho}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}