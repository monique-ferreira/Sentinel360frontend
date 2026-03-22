import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Clock } from "lucide-react";

const API_URL = (import.meta as any).env?.VITE_API_URL || "https://sentinel360.onrender.com";

export function InactiveFiles() {
  const [inactives, setInactives] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/results`)
      .then(res => res.json())
      .then(json => {
        const onlyInactives = (json.items || []).filter((i: any) => i.inativo === "SIM");
        setInactives(onlyInactives);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-amber-600 flex items-center gap-2">
        <Clock /> Arquivos Inativos (+180 dias)
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Arquivo</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Localização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inactives.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.nome}</TableCell>
              <TableCell>{item.tamanho_mb} MB</TableCell>
              <TableCell className="text-xs">{item.caminho}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}