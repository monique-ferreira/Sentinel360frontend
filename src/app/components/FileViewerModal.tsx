import { useEffect, useState } from "react";
import { X, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

interface Props {
  item: { nome?: string; Arquivo?: string; name?: string; caminho?: string; Caminho?: string; path?: string } | null;
  onClose: () => void;
  targetUsername?: string;
}

export function FileViewerModal({ item, onClose, targetUsername }: Props) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nome = item?.nome || item?.Arquivo || item?.name || "Arquivo";
  const path = item?.caminho || item?.Caminho || item?.path || "";

  useEffect(() => {
    if (!item) return;
    setContent(""); setError(""); setTruncated(false);
    setLoading(true);
    const qs = targetUsername ? `&target_username=${encodeURIComponent(targetUsername)}` : "";
    fetch(`${API_URL}/file-preview?path=${encodeURIComponent(path)}${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.detail ?? `Erro ${r.status}`);
        }
        return r.json();
      })
      .then(d => { setContent(d.content); setTruncated(d.truncated); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/30 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{nome}</p>
            <p className="text-xs text-muted-foreground truncate">{path}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando conteúdo...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Não foi possível abrir o arquivo</p>
                <p className="text-xs text-destructive/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && content && (
            <>
              {truncated && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-[#d29922]/10 border border-[#d29922]/20 text-xs text-[#d29922]">
                  Exibindo apenas os primeiros 50 KB do arquivo.
                </div>
              )}
              <pre className="text-xs text-foreground/90 font-mono leading-relaxed whitespace-pre-wrap break-words bg-secondary/30 rounded-xl border border-border p-4">
                {content}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
