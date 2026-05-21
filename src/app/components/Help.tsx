import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, FolderClock, ShieldAlert, Zap,
  FileBarChart2, User, Shield, Search, Eye, AlertTriangle,
  Building2, ChevronDown, ChevronRight, PlayCircle,
} from "lucide-react";
import { OnboardingTour } from "./OnboardingTour";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  summary: string;
  content: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    summary: "Painel de controle com métricas e visão geral do ambiente.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>O Dashboard é a primeira tela após o login e apresenta um resumo do seu ambiente de segurança:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-foreground">Total de arquivos</strong> — quantidade de itens já indexados no seu armazenamento.</li>
          <li><strong className="text-foreground">Arquivos inativos</strong> — arquivos não acessados dentro do período configurado.</li>
          <li><strong className="text-foreground">Arquivos com risco</strong> — itens que contêm dados sensíveis ou padrões suspeitos.</li>
          <li><strong className="text-foreground">Histórico de scans</strong> — gráfico com evolução dos últimos 30 dias.</li>
        </ul>
        <p>Os dados são atualizados automaticamente a cada nova varredura disparada pelas integrações.</p>
      </div>
    ),
  },
  {
    id: "inactive",
    icon: FolderClock,
    title: "Arquivos Inativos",
    summary: "Detecta arquivos que não foram acessados há muito tempo.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Lista todos os arquivos cujo último acesso é anterior ao limiar de inatividade configurado no seu Perfil (padrão: 90 dias).</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Clique no <strong className="text-foreground">nome do arquivo</strong> para visualizar o conteúdo (admins e contas pessoais).</li>
          <li>A coluna <strong className="text-foreground">Último Acesso</strong> mostra a data registrada pela plataforma de origem.</li>
          <li>A badge <strong className="text-foreground">scan</strong> indica quando o Sentinel360 analisou o arquivo pela última vez.</li>
        </ul>
        <p>Use essa lista para identificar arquivos candidatos à exclusão ou arquivamento, reduzindo superfície de ataque.</p>
      </div>
    ),
  },
  {
    id: "sensitive",
    icon: ShieldAlert,
    title: "Dados Sensíveis",
    summary: "Identifica arquivos com CPF, CNPJ, e-mails, senhas e outros padrões sensíveis.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>O Sentinel360 analisa o conteúdo dos arquivos em busca de padrões como:</p>
        <div className="grid grid-cols-2 gap-2">
          {["CPF / CNPJ", "E-mails", "Senhas / tokens", "Cartões de crédito", "Chaves de API", "Dados pessoais (LGPD)"].map(p => (
            <div key={p} className="flex items-center gap-2 bg-secondary/50 rounded-md px-2 py-1 text-xs text-foreground">
              <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
              {p}
            </div>
          ))}
        </div>
        <p>Cada item exibe a <strong className="text-foreground">categoria de risco</strong> detectada. Clique no arquivo para ver o trecho que ativou o alerta.</p>
      </div>
    ),
  },
  {
    id: "integrations",
    icon: Zap,
    title: "Integrações",
    summary: "Conecte suas contas Microsoft e Google para habilitar as varreduras.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>O Sentinel360 se integra ao Microsoft Graph API e Google Drive API para acessar seus arquivos. Conecte a conta adequada para o tipo da sua conta:</p>
        <div className="space-y-2">
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Conta Pessoal — OneDrive Pessoal</p>
            <p className="text-xs">Conecte sua conta Microsoft pessoal (Outlook, OneDrive) via OAuth para analisar seus arquivos pessoais.</p>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Conta Pessoal — Google Drive Pessoal</p>
            <p className="text-xs">Conecte sua conta Google via OAuth para analisar arquivos do Meu Drive. Requer permissão <code className="bg-black/20 rounded px-1">drive.readonly</code> no Google Cloud Console.</p>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Conta Corporativa — Microsoft 365</p>
            <p className="text-xs">Conecte o tenant da organização (Tenant ID + Client ID + Secret) para analisar arquivos do SharePoint e OneDrive for Business.</p>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Conta Corporativa — Azure AD</p>
            <p className="text-xs">Integração com diretório para gestão de usuários e controle de acesso por grupo.</p>
          </div>
          <div className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Conta Corporativa — Google Workspace</p>
            <p className="text-xs">Configure uma Service Account com Domain-Wide Delegation para varrer os Shared Drives da organização. Cole o JSON da chave diretamente na integração — há um tutorial passo a passo dentro do card.</p>
          </div>
        </div>
        <p>Após conectar, clique em <strong className="text-foreground">Varrer arquivos</strong> para disparar a primeira análise.</p>
      </div>
    ),
  },
  {
    id: "reports",
    icon: FileBarChart2,
    title: "Relatórios",
    summary: "Exporte dados completos em PDF ou Excel.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Gere relatórios detalhados para auditorias, conformidade e apresentação para stakeholders:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-foreground">PDF</strong> — relatório executivo com KPIs, gráficos e tabelas de riscos.</li>
          <li><strong className="text-foreground">Excel (.xlsx)</strong> — planilha BI com 5 abas: Resumo, Arquivos, Risco, Histórico e Gráficos.</li>
        </ul>
        <p>Os relatórios refletem os dados do último scan. Clique em qualquer nome de arquivo na lista para visualizar o conteúdo diretamente (requer permissão de admin em contas corporativas).</p>
      </div>
    ),
  },
  {
    id: "profile",
    icon: User,
    title: "Perfil",
    summary: "Configure preferências e veja dados da sua conta.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>No Perfil você pode:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-foreground">Limiar de inatividade</strong> — define quantos dias sem acesso classifica um arquivo como inativo (padrão 90 dias).</li>
          <li><strong className="text-foreground">Tipo de conta</strong> — pessoal ou corporativa, com o nome da organização se aplicável.</li>
          <li><strong className="text-foreground">Papel</strong> — admin ou membro (contas corporativas).</li>
        </ul>
      </div>
    ),
  },
  {
    id: "workspace",
    icon: Building2,
    title: "Workspace (Admins)",
    summary: "Gerencie membros da organização e visualize dados de cada usuário.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Exclusivo para administradores de contas corporativas. No Workspace você pode:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Listar todos os membros da organização e seus status de aprovação.</li>
          <li>Aprovar ou remover membros pendentes.</li>
          <li>Acessar os dados de varredura de cada membro individualmente — clique no nome do usuário para ver os arquivos analisados.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "virustotal",
    icon: Shield,
    title: "VirusTotal",
    summary: "Análise de arquivos por hash via VirusTotal sem envio de conteúdo.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Ao visualizar um arquivo, um botão <strong className="text-foreground">VirusTotal</strong> permite verificar se o arquivo é conhecido como malicioso por mais de 70 engines antivírus.</p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Privacidade garantida
          </p>
          <p className="text-xs">O Sentinel360 <strong>nunca envia o conteúdo</strong> dos seus arquivos para o VirusTotal. A verificação é feita apenas pelo hash SHA-256, que é um identificador único do arquivo — sem expor dados corporativos.</p>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Resultados são <strong className="text-foreground">armazenados em cache</strong> — arquivos já verificados não consomem cota da API.</li>
          <li>"Arquivo não encontrado" é normal para documentos internos que nunca foram submetidos publicamente ao VT.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "filepreview",
    icon: Eye,
    title: "Visualização de Arquivos",
    summary: "Abra e leia arquivos diretamente no Sentinel360.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Clique no nome de qualquer arquivo nas listas para abrir o visualizador inline:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Visualiza até <strong className="text-foreground">50 KB</strong> do conteúdo do arquivo.</li>
          <li>Suporta arquivos de texto, código, CSV, JSON, XML e similares.</li>
          <li>Arquivos maiores exibem um aviso de truncamento — o conteúdo mostrado é o início do arquivo.</li>
        </ul>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            <strong>Permissões:</strong> Em contas corporativas, apenas administradores podem visualizar arquivos. Membros têm acesso somente leitura aos dados de risco e inatividade.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "search",
    icon: Search,
    title: "Como funciona a varredura",
    summary: "Entenda o processo de análise de arquivos do Sentinel360.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>O fluxo de varredura do Sentinel360:</p>
        <ol className="list-decimal list-inside space-y-2 pl-2">
          <li><strong className="text-foreground">Autenticação</strong> — o Sentinel360 obtém um token OAuth2 via Microsoft Graph API ou Google Drive API (conforme a integração conectada).</li>
          <li><strong className="text-foreground">Listagem</strong> — todos os arquivos do OneDrive, SharePoint ou Google Drive são listados com metadados (nome, tamanho, data de acesso, hash).</li>
          <li><strong className="text-foreground">Análise de conteúdo</strong> — até 8KB de cada arquivo de texto são baixados e analisados em busca de padrões sensíveis com expressões regulares.</li>
          <li><strong className="text-foreground">Classificação</strong> — cada arquivo recebe categorias de risco (CPF, senha, etc.) ou "NENHUM".</li>
          <li><strong className="text-foreground">Armazenamento</strong> — resultados são salvos no banco de dados, identificados pela origem (OneDrive, SharePoint, Google Drive), para consultas futuras e relatórios.</li>
        </ol>
      </div>
    ),
  },
];

export function Help() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(SECTIONS[0].id);
  const [showTour, setShowTour] = useState(false);

  if (showTour) {
    return (
      <OnboardingTour
        onClose={() => { setShowTour(false); navigate(-1); }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Documentação</h2>
          <p className="text-sm text-muted-foreground">
            Guias completos para todas as funcionalidades do Sentinel360 — Cyber Defense Platform.
          </p>
        </div>
        <button
          onClick={() => setShowTour(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          Tour Guiado
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map(({ id, icon: Icon, title, summary, content }) => {
          const isOpen = open === id;
          return (
            <div key={id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/40 transition-colors"
                onClick={() => setOpen(isOpen ? null : id)}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground truncate">{summary}</p>
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
