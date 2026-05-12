import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, WifiOff, FileText, Search, Trash2, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

const RISK_STYLE: Record<string,string> = {
  "Credencial":"bg-red-100 text-red-700 border-red-200",
  "Token/Key":"bg-amber-100 text-amber-700 border-amber-200",
  "Nenhum":"bg-green-100 text-green-700 border-green-200",
  "":"bg-gray-100 text-gray-600 border-gray-200",
};

export function Reports() {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string[]>([]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/results`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const all = (data.items ?? []).filter((i: any) => !deleted.includes(i.Caminho || i.path));
      setItems(all);
      setFiltered(all);
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Servidor indisponiavel. Aguarde o Render iniciar (30s) e tente novamente." : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(i =>
      (i.Arquivo || i.name || "").toLowerCase().includes(q) ||
      (i.Caminho || i.path || "").toLowerCase().includes(q) ||
      (i.Riscos || i.risk_level || "").toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleDelete = async (item: any) => {
    const path = item.Caminho || item.path;
    setDeleting(path);
    try {
      const res = await fetch(`${API_URL}/delete-item?path=${encodeURIComponent(path)}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(prev => [...prev, path]);
        setItems(prev => prev.filter(i => (i.Caminho || i.path) !== path));
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><FileText className="h-6 w-6"/> Relatorios Sentinel</h1>
          <p className="text-sm text-muted-foreground">Todos os arquivos detectados no ultimo scan</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Sincronizar
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          <WifiOff className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar arquivos detectados..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Carregando dados...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          {search ? (
            <><Search className="h-size-10 w-10 mx-auto mb-3 opacity-40"/><p className="font-medium">Nenhum resultado para "{search}"</p></>
          ) : (
            <><CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40 text-green-500"/><p className="font-medium">Nenhum arquivo detectado ainda</p><p className="text-sm mt-1">Execute o agente na maquina alvo para popular os dados</p></>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Riscos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Tam.</TableHead>
                  <TableHead className="text-center">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => {
                  const risco = item.Riscos || item.risk_level || "";
                  const inativo = item.Inativo === "SIM" || item.is_inactive;
                  const cls = RISK_STYLE[risco] || "bg-gray-100 text-gray-600 border-gray-200";
                  const path = item.Caminho || item.path;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium max-w-[180px] truncate">{item.Arquivo || item.name}</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${inativo ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}`}>{inativo ? "Inativo" : "Ativo"}</span></TableCell>
                      <TableCell>{risco ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>{risco}</span> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.Data || item.last_scan}</TableCell>
                      <TableCell className="text-right text-xs">{item.Tamanho_MB || item.size_mb} MB</TableCell>
                      <TableCell className="text-center">
                        <button onClick={() => handleDelete(item)} disabled={deleting === path} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors disabled:opacity-50" title="Remover do registro">
                          {deleting === path ? <RefreshCw className="h-size-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="px-4 py-2 border-t text-xs text-muted-foreground flex justify-between">
              <span>{filtered.length} de {items.length} arquivo(s)</span>
              {search && <button onClick={()=>setSearch("")} className="hover:underline">Limpar filtro</button>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
