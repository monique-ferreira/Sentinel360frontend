import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { RefreshCw, WifiOff, FolderClock } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";
export function InactiveFiles() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setItems((data.items ?? []).filter((i: any) => i.Inativo === "SJM" || i.is_inactive));
    } catch (e: any) { setError(e.message?.includes("fetch") ? "Servidor indisponivel." : e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold flex items-center gap-2"><FolderClock className="h-size-6 w-6"/> Arquivos Inativos</h1><p className="text-sm text-muted-foreground">Arquivos sem acesso ha mais de 180 dias</p></div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-secondary disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/> Atualizar</button>
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700"><WifiOff className="h-size-4 w-4"/>{error}</div>}
      {loading ? (<div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><RefreshCw className="h-size-5 w-5 animate-spin"/>Carregando...</div>)
      : items.length === 0 ? (<div className="py-16 text-center text-muted-foreground"><FolderClock className="h-10 w-10 mx-auto mb-3 opacity-40"/><p className="font-medium">Nenhum arquivo inativo encontrado</p><p className="text-sm mt-1">Execute um scan para detectar arquivos inativos</p></div>)
      : (<div className="border rounded-lg overflow-hidden"><Table><TableHeader><TableRow><TableHead>Arquivo</TableHead><TableHead>Caminho</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Tamanho</TableHead></TableRow></TableHeader><TableBody>{items.map((item,i)=>(<TableRow key={i}><TableCell className="font-medium max-wl[200px] truncate">{item.Arquivo||item.name}</TableCell><TableCell className="text-muted-foreground text-xs max-w-[300px] truncate">{item.Caminho||item.path}</TableCell><TableCell className="text-xs text-muted-foreground">{item.Data||item.last_scan||item.last_accessed}</TableCell><TableCell className="text-right text-xs">{item.Tamanho_MB||item.size_mb} MB</TableCell></TableRow>))}</TableBody></Table><div className="px-4 py-2 border-t text-xs text-muted-foreground">{items.length} arquivo(s) inativo(s)</div></div>)}
    </div>
  );
}
