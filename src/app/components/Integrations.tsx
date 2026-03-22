import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Settings, Users, ArrowRight } from "lucide-react";

const integrations = [
  {
    id: 1,
    name: 'Office 365',
    logo: '📧',
    status: 'connected',
    lastSync: '2 minutos atrás',
    syncedItems: '12,456 arquivos',
    description: 'SharePoint, OneDrive, Teams',
    accounts: 234,
    storage: '145 GB'
  },
  {
    id: 2,
    name: 'Active Directory',
    logo: '🔐',
    status: 'connected',
    lastSync: '5 minutos atrás',
    syncedItems: '567 usuários',
    description: 'Gerenciamento de usuários e grupos',
    accounts: 567,
    storage: 'N/A'
  },
  {
    id: 3,
    name: 'Azure AD',
    logo: '☁️',
    status: 'connected',
    lastSync: '10 minutos atrás',
    syncedItems: '523 identidades',
    description: 'Autenticação e controle de acesso',
    accounts: 523,
    storage: 'N/A'
  },
  {
    id: 4,
    name: 'Google Workspace',
    logo: '🔧',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncedItems: '0 arquivos',
    description: 'Drive, Gmail, Docs',
    accounts: 0,
    storage: '0 GB'
  },
];

const syncHistory = [
  { 
    id: 1, 
    service: 'Office 365', 
    action: 'Sincronização completa', 
    items: '234 novos arquivos',
    status: 'success',
    timestamp: '2024-03-22 14:32:15'
  },
  { 
    id: 2, 
    service: 'Active Directory', 
    action: 'Atualização de usuários', 
    items: '12 usuários modificados',
    status: 'success',
    timestamp: '2024-03-22 14:28:42'
  },
  { 
    id: 3, 
    service: 'Azure AD', 
    action: 'Sincronização de grupos', 
    items: '45 grupos atualizados',
    status: 'success',
    timestamp: '2024-03-22 14:15:23'
  },
  { 
    id: 4, 
    service: 'Office 365', 
    action: 'Varredura de permissões', 
    items: '1,234 permissões verificadas',
    status: 'warning',
    timestamp: '2024-03-22 13:45:10'
  },
  { 
    id: 5, 
    service: 'Active Directory', 
    action: 'Sincronização incremental', 
    items: '8 novos usuários',
    status: 'success',
    timestamp: '2024-03-22 12:30:00'
  },
];

const apiEndpoints = [
  { name: 'Microsoft Graph API', endpoint: 'https://graph.microsoft.com/v1.0', status: 'active' },
  { name: 'SharePoint REST API', endpoint: 'https://tenant.sharepoint.com/_api', status: 'active' },
  { name: 'Azure AD Graph', endpoint: 'https://graph.windows.net', status: 'active' },
  { name: 'OneDrive API', endpoint: 'https://graph.microsoft.com/v1.0/me/drive', status: 'active' },
];

export function Integrations() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Integrações</h2>
        <p className="text-sm text-neutral-500 mt-1">Conecte-se com Office 365, Active Directory e outros serviços corporativos.</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {integrations.map((integration) => (
          <div 
            key={integration.id} 
            className={`bg-white rounded-xl p-6 border ${
              integration.status === 'connected' 
                ? 'border-emerald-200 shadow-sm shadow-emerald-100/50' 
                : 'border-neutral-200 shadow-sm'
            } transition-all`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {integration.logo}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{integration.name}</h3>
                  <p className="text-sm text-neutral-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integration.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200/50 rounded-full text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Desconectado
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral-50/50 rounded-lg p-3 border border-neutral-100">
                <p className="text-xs text-neutral-500 mb-1 font-medium">Contas</p>
                <p className="text-base font-semibold text-neutral-900">{integration.accounts}</p>
              </div>
              <div className="bg-neutral-50/50 rounded-lg p-3 border border-neutral-100">
                <p className="text-xs text-neutral-500 mb-1 font-medium">Armazenamento</p>
                <p className="text-base font-semibold text-neutral-900">{integration.storage}</p>
              </div>
              <div className="bg-neutral-50/50 rounded-lg p-3 border border-neutral-100">
                <p className="text-xs text-neutral-500 mb-1 font-medium">Última Sync</p>
                <p className="text-xs font-medium text-neutral-900 mt-1">{integration.lastSync}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                <Cloud className="w-4 h-4 text-emerald-600" />
                {integration.syncedItems}
              </div>
              <div className="flex gap-2">
                {integration.status === 'connected' ? (
                  <>
                    <button className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 flex items-center gap-2 text-sm font-medium transition-colors">
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                      <RefreshCw className="w-4 h-4" />
                      Sincronizar
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm">
                    Conectar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Endpoints API Configurados</h3>
        <div className="space-y-2">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-neutral-900 text-sm mb-0.5">{endpoint.name}</p>
                <code className="text-xs text-neutral-500 font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200">{endpoint.endpoint}</code>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  Ativo
                </span>
                <button className="p-1.5 hover:bg-neutral-200/50 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sync History */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-200 bg-white">
            <h3 className="text-base font-semibold text-neutral-900">Histórico de Sincronização</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ação</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Itens Processados</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {syncHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-neutral-900 text-sm">{item.service}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{item.action}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{item.items}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
                        item.status === 'success' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                      }`}>
                        {item.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {item.status === 'success' ? 'Sucesso' : 'Aviso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 font-mono">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OAuth Configuration Section */}
        <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-1 text-base">Autenticação Segura</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                As integrações utilizam OAuth 2.0 e tokens de acesso seguros. As credenciais são armazenadas de forma criptografada.
              </p>
            </div>
          </div>
          <div className="mt-auto pt-4 flex flex-col gap-3">
            <button className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
              Gerenciar Permissões
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 text-sm font-medium transition-colors">
              Ver Documentação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}