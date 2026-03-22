import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Shield, AlertTriangle, FileClock, HardDrive } from "lucide-react";

const API_URL = (import.meta as any).env?.VITE_API_URL || "https://sentinel360.onrender.com";

export function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/results`)
      .then(res => res.json())
      .then(json => {
        setData(json.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Cálculos dinâmicos baseados nos dados REAIS
  const totalFiles = data.length;
  const inactiveCount = data.filter(i => i.inativo === "SIM").length;
  const riskCount = data.filter(i => i.riscos !== "NENHUM").length;
  const totalStorage = data.reduce((acc, curr) => acc + (curr.tamanho_mb || 0), 0).toFixed(2);

  const chartData = [
    { name: "Inativos", value: inactiveCount, color: "#f59e0b" },
    { name: "Riscos", value: riskCount, color: "#ef4444" },
    { name: "Protegidos", value: totalFiles - riskCount, color: "#10b981" }
  ];

  if (loading) return <div className="p-10 text-center text-blue-500">Carregando métricas reais...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sentinel Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Monitorado</CardTitle><Shield className="h-4 w-4 text-blue-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalFiles} itens</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Críticos/Riscos</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{riskCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Arquivos Inativos</CardTitle><FileClock className="h-4 w-4 text-amber-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{inactiveCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Espaço Ocupado</CardTitle><HardDrive className="h-4 w-4 text-slate-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalStorage} MB</div></CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader><CardTitle>Visão Geral de Segurança</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}