import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, AlertTriangle, FileClock, HardDrive, Activity, RefreshCw, Cpu, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360-production.up.railway.app";
const RISK_COLORS: Record<string,string> = { critical:"#A32D2D",high:"#854F0B",medium:"#185FA5",low:"#3B6D11",none:"#5F5E5A" };
const RISK_LABELS: Record<string,string> = { critical:"Critico",high:"Alto",medium:"Medio",low:"Baixo" };

function Badge({ level }: { level: string }) {
  const cls: Record<string,string> = { critical:"bg-red-100 text-red-800 border-red-200",high:"bg-amber-100 text-amber-800 border-amber-200",medium:"bg-blue-100 text-blue-800 border-blue-200",low:"bg-green-100 text-green-800 border-green-200" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls[level]??"bg-gray-100 text-gray-600"}`}>{RISK_LABELS[level]??level}</span>;
}

function StatCard({ title, value, subtitle, icon, color="default" }: any) {
  const bg: Record<string,string> = { default:"bg-secondary",danger:"bg-red-50",warning:"bg-amber-50",info:"bg-blue-50" };
  const tx: Record<string,string> = { default:"text-foreground",danger:"text-red-700",warning:"text-amber-700",info:"text-blue-700" };
  return (
    <div className={`rounded-lg p-4 ${bg[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className={`text-2xl font-medium ${tx[color]}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date|null>(null);
  const token = localStorage.getItem("s360_token")??"";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [d, r] = await Promise.all([
        fetch(`${API_URL}/dashboard`, {headers:h}),
        fetch(`${API_URL}/results?limit=50`, {headers:h}),
      ]);
      if (d.ok) setData(await d.json());
      if (r.ok) setResults((await r.json())??[]);
      setLastUpdate(new Date());
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchAll(); const id = setInterval(fetchAll,30000); return ()=>clearInterval(id); }, [fetchAll]);
  if (loading && !data) return <div className="p-8 flex items-center justify-center gap-3 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin"/><span>Carregando...</span></div>;
  const s = data?.stats??{}, agents=data?.agents??[], scans=data?.recent_scans??[];
  const pieData = [{name:"Critico",value:s.critical??0,color:RISK_COLORS.critical},{name:"Alto",value:s.high??0,color:RISK_COLORS.high},{name:"Medio",value:s.medium??0,color:RISK_COLORS.medium}].filter(d=>d.value>0);
  const barData = [{name:"Critico",count:s.critical??0},{name:"Alto",count:s.high??0},{name:"Medio",count:s.medium??0}];
  const topFiles = results.filter(r=>r.risk_level!=="none").sort((a,b)=>({critical:4,high:3,medium:2,low:1}[b.risk_level]??0)-({critical:4,high:3,medium:2,low:1}[a.risk_level]??0)).slice(0,8);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
          {lastUpdate && <p className="text-xs text-muted-foreground mt-0.5">Atualizado as {lastUpdate.toLocaleTimeString("pt-BR")}</p>}</div>
        <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-secondary disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/> Atualizar</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total monitorado" value={(gs.total??0).toLocaleString("pt-BR")} subtitle="arquivos" icon={<Shield className="h-4 w-4"/>}/>
        <StatCard title="Criticos" value={s.critical??0} subtitle="acao imediata" icon={<AlertTriangle className="h-4 w-4"/>} color="danger"/>
        <StatCard title="Inativos" value={(s.inactive??0).toLocaleString("pt-BR")} subtitle="+180 dias" icon={<FileClock className="h-4 w-4"/>} color="warning"/>
        <StatCard title="Storage" value={`${s.storage_mb??0}.toFixed(1)} MB`} subtitle="em risco" icon={<HardDrive className="h-4 w-4"/>} color="info"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-background border rounded-lg p-4"><h3 className="text-sm font-medium mb-3">Distribuicao de riscos</h3>
          {pieData.length>0 ? (<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>) : <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm"><CheckCircle2 className="h-5 w-5 mr-2 text-green-500"/>Sem riscos</div>}
        </div>
        <div className="bg-background border rounded-lg p-4"><h3 className="text-sm font-medium mb-3">Por nivel</h3>
          <ResponsiveContainer width="100%" height={200}><BarChart data={barData} margin={{top:5,right:10,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="count" fill="#185FA5" radius={[4,4,0,0]}>{{barData.map((_,i)=><Cell key={i} fill={Object.values(RISK_COLORS)[i]??"#185FA5"}/>)}}</Bar></BarChart></ResponsiveContainer>
        </div>
        <div className="bg-background border rounded-lg p-4"><h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Cpu className="h-4 w-4"/> Agentes ({agents.length})</h3><div className="space-y-2">
          {agents.length===0&&<p className="text-sm text-muted-foreground">Nenhum agente.</p>}
          {agents.map((a:any)=>(<div key={a._id} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className={`inline-block w-2 h-2 rounded-full ${a.status==="online"?"bg-green-500":a.status==="scanning"?"bg-blue-500 animate-pulse":a.status==="error"?"bg-red-500":"bg-gray-400"}`}/><span className="font-medium truncate max-w-[120px]">{a.name}</span></div><span className="text-xs text-muted-foreground">{a.platform}</span></div>))}</div></div>
      </div>
      <div className="bg-background border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Arquivos de maior risco</h3>
        {topFiles.length===0 ? <p className="text-sm text-muted-foreground py-4 text-center"><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-500"/>Sem riscos.</p> : (
          <div className="divide-y divide-border">
            {topFiles.map((item:any,i:number)=>(<div key={i} className="py-3 flex items-start gap-3"><Badge level={item.risk_level}/><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground truncate">{item.path}</p></div><div className="text-right flex-shrink-0"><p className="text-xs text-muted-foreground">{item.size_mb} MB</p><p className="text-xs text-muted-foreground">{item.risks?.map((r:any)=>r.type).join(", ")}</p></div></div>))}
          </div>
        )}
      </div>
      <div className="bg-background border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Activity className="h-4 w-4"/> Scans recentes</h3>
        <div className="divide-y divide-border">
          {scans.map((s:any,i:number)=>(<div key={i} className="py-3 flex items-center justify-between text-sm"><div><span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.status==="completed"?"bg-green-500":s.status==="running"?"bg-blue-500 animate-pulse":"bg-red-500"}`}/><span className="font-medium">{s.status}</span><span className="text-muted-foreground ml-2">{s.results_count??0} resultados · {s.risk_count??0} riscos</span></div><span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString("pt-BR")}</span></div>))}
          {scans.length===0&&<p className="py-4 text-center text-sm text-muted-foreground">Nenhum scan ainda.</p>}
        </div>
      </div>
    </div>
  );
}
