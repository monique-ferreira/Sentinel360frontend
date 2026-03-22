import { useState, useEffect } from "react";
import { FileText, Trash2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

const API_URL = (import.meta as any).env.VITE_API_URL || "https://sentinel360.onrender.com";

interface ReportItem {
  nome: string;
  caminho: string;
  inativo: string;
  riscos: string;
}

export function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Faz a chamada real para o seu backend no Render
      const response = await fetch(`${API_URL}/results`);
      const data = await response.json();
      setReports(data.items || []);
    } catch (error) {
      console.error("Erro ao buscar dados reais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.caminho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Sentinel</h1>
        <Button variant="outline" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Dados Reais
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Input 
            placeholder="Filtrar arquivos detectados..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Riscos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Conectando ao Render...</TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Nenhum dado real encontrado. Inicie uma varredura.</TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600">{report.nome}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-xs">{report.caminho}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.inativo === "SIM" ? "secondary" : "outline"}>
                        <Clock className="mr-1 h-3 w-3" />
                        {report.inativo === "SIM" ? "Inativo" : "Ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.riscos !== "NENHUM" ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" /> {report.riscos}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}