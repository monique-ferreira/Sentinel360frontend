import { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Key, 
  CreditCard, 
  Lock,
  FileWarning,
  Eye,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const detectionsByType = [
  { type: 'API Keys', count: 12, severity: 'critical' },
  { type: 'Senhas', count: 8, severity: 'critical' },
  { type: 'Tokens AWS', count: 5, severity: 'critical' },
  { type: 'Chaves SSH', count: 4, severity: 'high' },
  { type: 'Credenciais DB', count: 6, severity: 'critical' },
  { type: 'Certificados', count: 3, severity: 'medium' },
];

const chartData = [
  { month: 'Jan', critical: 8, high: 4, medium: 2, id: 'jan-chart' },
  { month: 'Fev', critical: 12, high: 6, medium: 3, id: 'fev-chart' },
  { month: 'Mar', critical: 6, high: 3, medium: 1, id: 'mar-chart' },
  { month: 'Abr', critical: 10, high: 5, medium: 4, id: 'abr-chart' },
  { month: 'Mai', critical: 15, high: 8, medium: 5, id: 'mai-chart' },
  { month: 'Jun', critical: 9, high: 4, medium: 2, id: 'jun-chart' },
];

const detectedItems = [
  {
    id: 1,
    file: 'config_production.json',
    path: '/src/config',
    credentialType: 'API Key',
    severity: 'critical',
    detected: '2024-03-20 14:32',
    status: 'pendente',
    preview: 'api_key: "sk_live_51H7xK2eZv..."'
  },
  {
    id: 2,
    file: 'database_config.php',
    path: '/www/config',
    credentialType: 'Senha DB',
    severity: 'critical',
    detected: '2024-03-20 11:15',
    status: 'pendente',
    preview: 'password = "MyS3cr3tP@ss..."'
  },
  {
    id: 3,
    file: 'aws_credentials.txt',
    path: '/backup',
    credentialType: 'AWS Token',
    severity: 'critical',
    detected: '2024-03-19 16:48',
    status: 'resolvido',
    preview: 'aws_secret_access_key = "wJalrX..."'
  },
  {
    id: 4,
    file: 'id_rsa',
    path: '/users/dev/.ssh',
    credentialType: 'Chave SSH',
    severity: 'high',
    detected: '2024-03-19 09:22',
    status: 'pendente',
    preview: '-----BEGIN RSA PRIVATE KEY-----'
  },
  {
    id: 5,
    file: 'payment_gateway_setup.docx',
    path: '/documentos/financeiro',
    credentialType: 'API Key',
    severity: 'critical',
    detected: '2024-03-18 13:55',
    status: 'em revisão',
    preview: 'merchant_key: "pk_test_TYooM..."'
  },
];

export function SensitiveData() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filteredItems = detectedItems.filter(item => {
    const matchesSearch = item.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.credentialType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Detecção de Dados Sensíveis</h2>
        <p className="text-sm text-neutral-500 mt-1">Identifique e proteja credenciais e informações críticas</p>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 bg-red-100 rounded-md text-red-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-red-900 text-sm">23 credenciais sensíveis detectadas</p>
          <p className="text-sm text-red-700/80 mt-1">
            Foram encontradas credenciais não protegidas em arquivos de texto plano. Tome ação imediata para proteger esses dados.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">15</p>
          <p className="text-xs text-neutral-400 mt-1">Requer ação imediata</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Altos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">8</p>
          <p className="text-xs text-neutral-400 mt-1">Atenção necessária</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileWarning className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Médios</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">12</p>
          <p className="text-xs text-neutral-400 mt-1">Revisar quando possível</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neutral-300"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-neutral-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Resolvidos</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">142</p>
          <p className="text-xs text-neutral-400 mt-1">Últimos 30 dias</p>
        </div>
      </div>

      {/* Chart and Detection Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Tendência de Detecções</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar key="bar-critical" dataKey="critical" fill="#ef4444" name="Crítico" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar key="bar-high" dataKey="high" fill="#f59e0b" name="Alto" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar key="bar-medium" dataKey="medium" fill="#10b981" name="Médio" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Tipos de Credenciais</h3>
          <div className="space-y-2">
            {detectionsByType.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50/50 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Key className={`w-4 h-4 ${
                    item.severity === 'critical' ? 'text-red-500' :
                    item.severity === 'high' ? 'text-amber-500' :
                    'text-emerald-500'
                  }`} />
                  <span className="text-sm font-medium text-neutral-700">{item.type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  item.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                  item.severity === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Buscar por arquivo ou tipo de credencial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-neutral-400"
            />
          </div>
          <select 
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Todas Severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
          </select>
        </div>
      </div>

      {/* Detections Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50">
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Arquivo</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Severidade</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Detectado</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileWarning className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{item.file}</p>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.credentialType.includes('API') && <Key className="w-4 h-4 text-emerald-600" />}
                      {item.credentialType.includes('Senha') && <Lock className="w-4 h-4 text-emerald-600" />}
                      {item.credentialType.includes('AWS') && <CreditCard className="w-4 h-4 text-emerald-600" />}
                      {item.credentialType.includes('SSH') && <Key className="w-4 h-4 text-emerald-600" />}
                      <span className="text-sm text-neutral-700">{item.credentialType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      item.severity === 'critical' 
                        ? 'bg-red-50 text-red-700 border border-red-100' 
                        : item.severity === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {item.severity === 'critical' ? 'Crítico' : item.severity === 'high' ? 'Alto' : 'Médio'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{item.detected}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      item.status === 'pendente' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : item.status === 'resolvido'
                        ? 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[11px] bg-neutral-100 px-2 py-1 rounded font-mono text-neutral-600 border border-neutral-200">
                      {item.preview}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-50 hover:text-emerald-600 text-sm font-medium transition-colors shadow-sm">
                      <Eye className="w-3.5 h-3.5" />
                      Revisar
                    </button>
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