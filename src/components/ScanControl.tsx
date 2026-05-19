import { useState, useEffect, useCallback } from "react";
import { Play, RefreshCw, Plus, Copy, CheckCircle2, ShieldAlert, Cpu, Clock, Key } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360-production.up.railway.app";

function timeSince(iso: string | null): string {
  if (!iso) return "nunca";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s atras`;
  if (diff < 3600) return `${Math.floor(diff/60)}min atras`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h atras`;
  return `${Math.floor(diff/86400)}d atras`;
}

function ApiKeyModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-background border rounded-xl p-6 max-w-lg w-full mx-4 space-y-4"><div className="flex items-center gap-2 text-amber-600"><Key className="h-5 w-5"/><h2 className="font-medium">Guarde esta chave</h2></div><div className="bg-secondary rounded-md p-3 font-mono text-sm break-all select-all">{apiKey}</div><div className="flex gap-2"><button onClick={copy} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-secondary">{copied?<CheckCircle2 className="h-4 w-4 text-green-600"/>:<Copy className="h-4 w-4"/>}{copied?"Copiado!":"Copiar"}</button><button onClick={onClose} className="flex-1 px-3 py-2 text-sm bg-foreground text-background rounded-md hover:oropacity-90">Entendi</button></div></div></div>);
}

function ScanCard({ scan }: { scan: any }) {
  const running = scan.status === "running";
  return (<div className={`rounded-lg border p-4 ${running?"border-blue-300 bg-blue-50/50":""}`}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2">{punning?<ShieldAlert className="h-4 w-4 text-blue-500 animate-pulse"/>:<CheckCircle2 className="h-4 w-4 text-green-500"/>}<span className="text-sm font-medium capitalize">{scan.status}</span></div><span className="text-xs text-muted-foreground">{timeSince(scan.created_at)}</span></div><div className="h-1.5 bg-secondary rounded-full mb-2"><div className="h-1.5 bg-blue-500 rounded-full" style={{width:`${scan.progress??0}%`}}/></div><div className="flex justify-between text-xs text-muted-foreground"><span>{scan.processed_files??0} / {scan.total_files??"?"} arquivos</span><span>{scan.results_count??0} resultados · {scan.risk_count??0} riscos</span></div></div>);
}

export function ScanControl() {
  const [agents, setAgents] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newApiKey, setNewApiKey] = useState<string|null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [days, setDays] = useState(180);
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [platform, setPlatform] = useState("linux");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState("");
  const headers = { Authorization: `Bearer ${localStorage.getItem("s360_token")??""}` };
  const fetchData = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([fetch(`${API_URL}/agents`,{headers}),fetch(`${API_URL}/scans`,{headers})]);
      if (a.ok) { const agts = await a.json(); setAgents(agts); if (!selectedAgent && agts.length>0) setSelectedAgent(agts[0]._id); }
      if (s.ok) setScans(await s.json());
    } catch(e){} finally{setLoading(false);}
  },[selectedAgent]);
  useEffect(()=>{fetchData();const id=setInterval(fetchData,3000);return ()=>clearInterval(id);},[fetchData]);
  const createAgent = async () => {
    if (!name||!hostname) {setErr("Preencha todos os campos.");return;}
    setCreating(true);setErr("");
    try{
      const res=await fetch(`${API_URL}/agents`,{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({name,hostname,platform})});
      if(!res.ok)throw new Error(await res.text());
      const d=await res.json();setNewApiKey(d.api_key);setShowForm(false);setName("");setHostname("");fetchData();
    }catch(e:any){setErr(e.message);}finally{setCreating(false);}
  };
  const startScan=()=>alert(`Execute no agente "${agents.find(a=>a._id===selectedAgent)?.name}":\n\ns360-agent run --days ${days}`);
  const activeScans=scans.filter(s=>s.status==="running");
  const recentScans=scans.filter(s=>s.status!=="running").slice(0,5);
  return (
    <div className="p-6 space-y-6">
      {newApiKey && <ApiKeyModal apiKey={newApiKey} onClose={()=>setNewApiKey(null)}/>}
      <div><h1 className="text-2xl font-medium tracking-tight">Painel de controle</h1><p>Gerencie agentes e monitore scans.</p></div>
      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div><h2>Agentes registrados</h2><p>Maquinas monitoradas</p></div>
          <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-foreground text-background rounded-md"><Plus className="h-4 w-4"/> Novo agente</button>
        </div>
        {showForm && <div className="mb-4 p-4 bg-secondary/50 rounded-lg space-y-3"><div className="grid grid-cols-2 gap-3"><div><label>Nome</label><input className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" placeholder="servidor-web-01" value={name} onChange={e=>setName(e.target.value)}/></div><div><label>Hostname</label><input className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" placeholder="web01.empresa.com" value={hostname} onChange={e=>setHostname(e.target.value)}/></div></div><div><label>Plataforma</label><select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" value={platform} onChange={e=>setPlatform(e.target.value)}><option value="linux">Linux</option><option value="windows">Windows</option><option value="darwin">macOS</option></select></div>{err&&<p className="text-sm text-red-600">{err}</p>}<button onClick={createAgent} disabled={creating} className="w-full py-2 text-sm bg-foreground text-background rounded-md disabled:opacity-50">Criar agente</button></div>}
        {loading ? <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        : agents.length===0 ? <div className="py-8 text-center"><Cpu className="h-8 w-8 text-muted-foreground mx-auto"/><p className="text-sm text-muted-foreground">Nenhum agente.</p></div>
        : <div className="divide-y divide-border">{agents.map(agent=>(<div key={agent._id} className="py-3 flex items-center gap-4"><input type="radio" name="agent" value={agent._id} checked={selectedAgent===agent._id} onChange={()=>setSelectedAgent(agent._id)}/><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-medium text-sm">{agent.name}</span><span className="text-xs px-1.5 py-0.5 rounded border">{agent.status}</span></div><p className="text-xs text-muted-foreground">{agent.hostname} · {agent.platform}</p></div><span className="text-xs text-muted-foreground">{timeSince(agent.last_scan_at)}</span></div>))}</div>}
      </div>
      <div className="bg-background border rounded-lg p-4 space-y-4">
        <div><h2>Iniciar varredura</h2></div>
        <div className="flex items-center gap-4">
          <div className="flex-1"><label>Threshold (dias)</label><input type="number" min={1} max={3650} value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"/></div>
          <div className="pt-5"><button onClick={startScan} disabled={!selectedAgent} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50 flex items-center gap-2"><Play className="h-4 w-4"/> Iniciar scan</button></div>
        </div>
        {activeScans.length>0&&<div className="space-y-2"><p>Em andamento</p>{activeScans.map(s=><ScanCard key={s._id} scan={s}/>)}</div>}
      </div>
      {recentScans.length>0&&<div className="bg-background border rounded-lg p-4"><h2 className="font-medium mb-3 flex items-center gap-2"><Clock className="h-4 w-4"/> Historico</h2><div className="space-y-2">{recentScans.map(s=><ScanCard key={s._id} scan={s}/>)}</div></div>}
    </div>
  );
}
