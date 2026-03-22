import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  PieChart as PieChartIcon,
  FileBarChart,
  Clock,
  Filter
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const reportsData = [
  {
    id: 1,
    name: 'Relatório de Armazenamento Mensal',
    type: 'storage',
    format: 'PDF',
    lastGenerated: '2024-03-20 08:00',
    frequency: 'Mensal',
    status: 'scheduled',
    size: '2.4 MB'
  },
  {
    id: 2,
    name: 'Análise de Credenciais Sensíveis',
    type: 'security',
    format: 'Excel',
    lastGenerated: '2024-03-22 06:00',
    frequency: 'Diário',
    status: 'ready',
    size: '856 KB'
  },
  {
    id: 3,
    name: 'Arquivos Inativos - Trimestral',
    type: 'inactive',
    format: 'PDF',
    lastGenerated: '2024-03-15 09:00',
    frequency: 'Trimestral',
    status: 'ready',
    size: '5.2 MB'
  },
  {
    id: 4,
    name: 'Dashboard Executivo',
    type: 'executive',
    format: 'PowerPoint',
    lastGenerated: '2024-03-21 10:00',
    frequency: 'Semanal',
    status: 'ready',
    size: '12.8 MB'
  },
  {
    id: 5,
    name: 'Compliance e Auditoria',
    type: 'compliance',
    format: 'PDF',
    lastGenerated: '2024-03-18 07:00',
    frequency: 'Mensal',
    status: 'ready',
    size: '3.1 MB'
  },
  {
    id: 6,
    name: 'Atividade de Usuários - AD',
    type: 'users',
    format: 'Excel',
    lastGenerated: '2024-03-22 05:00',
    frequency: 'Diário',
    status: 'processing',
    size: '-'
  },
];

const reportMetrics = [
  { month: 'Jan', reports: 45, id: 'jan-reports' },
  { month: 'Fev', reports: 52, id: 'fev-reports' },
  { month: 'Mar', reports: 48, id: 'mar-reports' },
  { month: 'Abr', reports: 61, id: 'abr-reports' },
  { month: 'Mai', reports: 58, id: 'mai-reports' },
  { month: 'Jun', reports: 67, id: 'jun-reports' },
];

const reportTemplates = [
  { 
    id: 1, 
    name: 'Análise de Capacidade', 
    description: 'Projeção de crescimento de armazenamento',
    icon: BarChart3,
  },
  { 
    id: 2, 
    name: 'Segurança de Dados', 
    description: 'Detecções de credenciais e vulnerabilidades',
    icon: FileBarChart,
  },
  { 
    id: 3, 
    name: 'Otimização de Custos', 
    description: 'Identificação de oportunidades de economia',
    icon: TrendingUp,
  },
  { 
    id: 4, 
    name: 'Compliance Report', 
    description: 'Conformidade com políticas e regulamentações',
    icon: FileText,
  },
];

export function Reports() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Relatórios e BI</h2>
        <p className="text-sm text-neutral-500 mt-1">Relatórios automatizados e dashboards analíticos para tomada de decisão.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="p-2 bg-neutral-50 rounded-lg text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">+12%</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 relative z-10">67</p>
          <p className="text-sm font-medium text-neutral-500 relative z-10">Relatórios este mês</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="p-2 bg-neutral-50 rounded-lg text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 relative z-10">12</p>
          <p className="text-sm font-medium text-neutral-500 relative z-10">Agendamentos</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Download className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="p-2 bg-neutral-50 rounded-lg text-emerald-600">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">Este mês</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 relative z-10">234</p>
          <p className="text-sm font-medium text-neutral-500 relative z-10">Downloads realizados</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="p-2 bg-neutral-50 rounded-lg text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">Painel</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 relative z-10">8</p>
          <p className="text-sm font-medium text-neutral-500 relative z-10">Dashboards ativos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Reports Generation Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-neutral-900">Geração de Relatórios</h3>
            <button className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-600 rounded-md hover:bg-neutral-50 transition-colors">
              Últimos 6 meses
            </button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                />
                <Tooltip 
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  key="area-reports"
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReports)" 
                  name="Relatórios"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BI Integration Note */}
        <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-1 text-base">Integração BI</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Exporte dados para Power BI, Tableau ou outras ferramentas de Business Intelligence via API direta.
              </p>
            </div>
          </div>
          <div className="mt-auto pt-4 flex flex-col gap-3">
            <button className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm">
              Configurar Power BI
            </button>
            <button className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 text-sm font-medium transition-colors">
              Documentação da API
            </button>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Modelos de Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div 
                key={template.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                  <Icon className="w-5 h-5 text-neutral-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-1 text-sm">{template.name}</h4>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{template.description}</p>
                <button className="w-full py-2 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-xs font-medium transition-colors">
                  Gerar Relatório
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Relatórios Agendados</h3>
            <p className="text-sm text-neutral-500 mt-0.5">Configuração de geração automática</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-neutral-200 bg-white rounded-md hover:bg-neutral-50 flex items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors">
              <Filter className="w-4 h-4 text-neutral-500" />
              Filtrar
            </button>
            <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-1.5 text-sm font-medium transition-colors shadow-sm">
              <Calendar className="w-4 h-4" />
              Novo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Relatório</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Formato</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Frequência</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Última Geração</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {reportsData.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{report.name}</p>
                        {report.size !== '-' && (
                          <p className="text-xs text-neutral-500 mt-0.5">{report.size}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700 font-medium">{report.format}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-700">{report.frequency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500 font-mono">{report.lastGenerated}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      report.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' :
                      report.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-100/50' :
                      'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}>
                      {report.status === 'ready' ? 'Pronto' :
                       report.status === 'processing' ? 'Processando' : 'Agendado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {report.status === 'ready' && (
                        <button className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-emerald-600 transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors" title="Configurar">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}