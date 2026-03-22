import { useState } from "react";
import { 
  Search, 
  Filter, 
  FolderOpen, 
  FileText, 
  MoreVertical, 
  Trash2,
  Archive,
  Download,
  Clock
} from "lucide-react";

const inactiveItems = [
  { 
    id: 1, 
    name: 'Marketing_Campaign_2023', 
    type: 'folder', 
    size: '2.3 GB', 
    lastAccessed: '186 dias atrás',
    lastAccessedDate: '2025-09-18',
    path: '/Departamentos/Marketing',
    owner: 'maria.silva@company.com'
  },
  { 
    id: 2, 
    name: 'old_product_specs.docx', 
    type: 'file', 
    size: '4.2 MB', 
    lastAccessed: '234 dias atrás',
    lastAccessedDate: '2025-08-01',
    path: '/Departamentos/Produto',
    owner: 'joao.santos@company.com'
  },
  { 
    id: 3, 
    name: 'Financial_Reports_2022', 
    type: 'folder', 
    size: '890 MB', 
    lastAccessed: '312 dias atrás',
    lastAccessedDate: '2025-05-15',
    path: '/Departamentos/Financeiro',
    owner: 'ana.costa@company.com'
  },
  { 
    id: 4, 
    name: 'backup_database_jan2023.sql', 
    type: 'file', 
    size: '1.2 GB', 
    lastAccessed: '156 dias atrás',
    lastAccessedDate: '2025-10-18',
    path: '/TI/Backups',
    owner: 'carlos.oliveira@company.com'
  },
  { 
    id: 5, 
    name: 'training_videos_archive', 
    type: 'folder', 
    size: '5.6 GB', 
    lastAccessed: '421 dias atrás',
    lastAccessedDate: '2024-12-23',
    path: '/RH/Treinamentos',
    owner: 'patricia.lima@company.com'
  },
  { 
    id: 6, 
    name: 'legacy_code_samples.zip', 
    type: 'file', 
    size: '234 MB', 
    lastAccessed: '278 dias atrás',
    lastAccessedDate: '2025-06-18',
    path: '/TI/Desenvolvimento',
    owner: 'ricardo.ferreira@company.com'
  },
  { 
    id: 7, 
    name: 'sales_presentations_2022', 
    type: 'folder', 
    size: '1.8 GB', 
    lastAccessed: '199 dias atrás',
    lastAccessedDate: '2025-09-05',
    path: '/Departamentos/Vendas',
    owner: 'fernanda.alves@company.com'
  },
  { 
    id: 8, 
    name: 'meeting_recordings_old', 
    type: 'folder', 
    size: '3.4 GB', 
    lastAccessed: '367 dias atrás',
    lastAccessedDate: '2025-03-21',
    path: '/Geral/Reuniões',
    owner: 'admin@company.com'
  },
];

export function InactiveFiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState('90');

  const filteredItems = inactiveItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Arquivos Inativos</h2>
        <p className="text-sm text-neutral-500 mt-1">Identifique e gerencie arquivos sem acesso recente</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <p className="text-neutral-500 text-sm font-medium mb-1">Total de Itens</p>
          <p className="text-2xl font-bold text-neutral-900">1,247</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <p className="text-neutral-500 text-sm font-medium mb-1">Espaço Ocupado</p>
          <p className="text-2xl font-bold text-neutral-900">38.2 GB</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <p className="text-neutral-500 text-sm font-medium mb-1">Economia Potencial</p>
          <p className="text-2xl font-bold text-emerald-600">28.5 GB</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <p className="text-neutral-500 text-sm font-medium mb-1">Itens Arquivados</p>
          <p className="text-2xl font-bold text-neutral-900">432</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Buscar por nome de arquivo ou pasta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-neutral-400"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="30">+30 dias</option>
              <option value="90">+90 dias</option>
              <option value="180">+180 dias</option>
              <option value="365">+365 dias</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50">
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-12">
                  <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tamanho</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Último Acesso</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Proprietário</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.type === 'folder' ? (
                        <FolderOpen className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-neutral-400" />
                      )}
                      <div>
                        <span className="font-medium text-neutral-900 text-sm">{item.name}</span>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      item.type === 'folder' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {item.type === 'folder' ? 'Pasta' : 'Arquivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{item.size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{item.lastAccessed}</p>
                        <p className="text-xs text-neutral-500">{item.lastAccessedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{item.owner}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-emerald-600 transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-emerald-600 transition-colors" title="Arquivar">
                        <Archive className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-md text-neutral-500 hover:text-red-600 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/30">
          <p className="text-sm text-neutral-500">
            Mostrando <span className="font-medium text-neutral-900">1-8</span> de <span className="font-medium text-neutral-900">1,247</span> itens
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-neutral-200 rounded-md hover:bg-white text-sm font-medium text-neutral-600 transition-colors">
              Anterior
            </button>
            <button className="px-3 py-1.5 bg-emerald-600 border border-transparent text-white rounded-md hover:bg-emerald-700 text-sm font-medium transition-colors">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}