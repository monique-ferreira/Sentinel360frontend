import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { RefreshCw, WifiOff, ShieldAlert } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
const RISK_STYLE: Record<string,string> = {
  "Credencial":"bg-red-100 text-red-700 border-red-200",
  "Token/Key":"bg-amber-100 text-amber-700 border-amber-200",
  "CPF":"bg-red-100 text-red-700 border-red-200",
  "Email":"bg-blue-100 text-blue-700 border-blue-200",
};
export function SensitiveData() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setItems((data.items ?? []).filter((i: any) => i.Riscos && i.Riscos !== "Nenhum" && i.Riscos !== ""));
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldAlert className="h-6 w-6"/>Dados Sensiveis</h1>
          <p className="text-sm text-muted-foreground">Arquivos com credenciais, tokens e dados pessoais</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-secondary disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Atualizar
        </button>
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700"><WifiOff className="h-4 w-4"/>{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><RefreshCw className="h-5 w-5 animate-spin"/>Carregando...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-40"/>
          <p className="font-medium">Nenhum dado sensivel detectado</p>
          <p className="text-sm mt-1">Execute um scan para detectar arquivos sensiveis</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Arquivo</TableHead><TableHead>Risco</TableHead>
              <TableHead>Caminho</TableHead><TableHead>Data</TableHead>
              <TableHead className="text-right">Tam.</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item, i) => {
                const r = item.Riscos || item.risk_level || "?";
                const cls = RISK_STYLE[r] || "bg-gray-100 text-gray-700 border-gray-200";
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium max-w-[200px] truncate">{item.Arquivo || item.name}</TableCell>
                    <TableCell><span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${cls}`}>{r}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">{item.Caminho || item.path}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.Data || item.last_scan}</TableCell>
                    <TableCell className="text-right text-xs">{item.Tamanho_MB || item.size_mb} MB</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="px-4 py-2 border-t text-xs text-muted-foreground">{items.length} arquivo(s) com risco</div>
        </div>
      )}
    </div>
  );
}