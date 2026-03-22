import { 
  HardDrive, 
  AlertTriangle, 
  FileWarning, 
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const storageData = [
  { month: 'Jan', used: 45, inactive: 25, id: 'jan' },
  { month: 'Fev', used: 52, inactive: 28, id: 'fev' },
  { month: 'Mar', used: 48, inactive: 26, id: 'mar' },
  { month: 'Abr', used: 61, inactive: 32, id: 'abr' },
  { month: 'Mai', used: 55, inactive: 30, id: 'mai' },
  { month: 'Jun', used: 67, inactive: 38, id: 'jun' },
];

const sensitiveDataTrend = [
  { month: 'Jan', detections: 12, id: 'jan-sens' },
  { month: 'Fev', detections: 19, id: 'fev-sens' },
  { month: 'Mar', detections: 8, id: 'mar-sens' },
  { month: 'Abr', detections: 15, id: 'abr-sens' },
  { month: 'Mai', detections: 23, id: 'mai-sens' },
  { month: 'Jun', detections: 11, id: 'jun-sens' },
];

const fileTypeData = [
  { name: 'Documentos', value: 35, color: '#10b981', id: 'docs' },
  { name: 'Planilhas', value: 25, color: '#34d399', id: 'sheets' },
  { name: 'PDFs', value: 20, color: '#6ee7b7', id: 'pdfs' },
  { name: 'Imagens', value: 12, color: '#a7f3d0', id: 'images' },
  { name: 'Outros', value: 8, color: '#e5e7eb', id: 'others' },
];

const recentAlerts = [
  { id: 1, type: 'critical', message: 'Credenciais AWS detectadas em "config_backup.txt"', time: '2 min atrás', file: 'config_backup.txt' },
  { id: 2, type: 'warning', message: 'Pasta "Marketing_2023" inativa há 180 dias', time: '1 hora atrás', file: 'Marketing_2023' },
  { id: 3, type: 'critical', message: 'Chave API encontrada em "dev_notes.docx"', time: '3 horas atrás', file: 'dev_notes.docx' },
  { id: 4, type: 'info', message: 'Sincronização com Office 365 concluída', time: '5 horas atrás', file: null },
];

export function Dashboard() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h2>
        <p className="text-sm text-neutral-500 mt-1">Visão geral do gerenciamento de arquivos corporativos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
              <HardDrive className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingDown className="w-3 h-3" />
              -5.2%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500 mb-1">Armazenamento Total</p>
          <p className="text-2xl font-bold text-neutral-900">2.4 TB</p>
          <p className="text-xs text-neutral-400 mt-2">67% utilizado do total</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
              <FileWarning className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              +12.3%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500 mb-1">Arquivos Inativos</p>
          <p className="text-2xl font-bold text-neutral-900">1,247</p>
          <p className="text-xs text-neutral-400 mt-2">+90 dias sem acesso</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              +8.1%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500 mb-1">Credenciais Detectadas</p>
          <p className="text-2xl font-bold text-neutral-900">23</p>
          <p className="text-xs text-neutral-400 mt-2">Últimos 30 dias</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              +15.7%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500 mb-1">Scans Realizados</p>
          <p className="text-2xl font-bold text-neutral-900">456</p>
          <p className="text-xs text-neutral-400 mt-2">Neste mês</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Storage Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Tendência de Armazenamento</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dx={-10} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area 
                  key="area-used"
                  type="monotone" 
                  dataKey="used" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsed)" 
                  name="Usado (GB)"
                />
                <Area 
                  key="area-inactive"
                  type="monotone" 
                  dataKey="inactive" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorInactive)" 
                  name="Inativo (GB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Types Distribution */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Distribuição por Tipo</h3>
          <div className="h-[220px] w-full mb-6 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {fileTypeData.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#1f2937' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for PieChart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-neutral-900">100</span>
              <span className="text-xs text-neutral-500">Total %</span>
            </div>
          </div>
          <div className="space-y-3">
            {fileTypeData.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-neutral-600 font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-neutral-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensitive Data Detections */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-neutral-900">Detecções de Dados Sensíveis</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Ver relatório</button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitiveDataTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  key="bar-detections"
                  dataKey="detections" 
                  fill="#10b981" 
                  name="Detecções" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-neutral-900">Alertas Recentes</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Ver todos</button>
          </div>
          <div className="space-y-4 flex-1">
            {recentAlerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-4 pb-4 ${index !== recentAlerts.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <div className={`mt-0.5 p-2 rounded-full ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 text-red-500' 
                    : alert.type === 'warning' 
                    ? 'bg-amber-50 text-amber-500' 
                    : 'bg-emerald-50 text-emerald-500'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800 font-medium leading-snug">{alert.message}</p>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <span>{alert.time}</span>
                    {alert.file && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                        <span className="truncate">{alert.file}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}