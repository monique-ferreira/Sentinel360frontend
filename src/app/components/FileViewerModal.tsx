import { useEffect, useState } from "react";
import { X, FileText, AlertCircle, RefreshCw, ShieldCheck, ShieldAlert, ExternalLink } from "lucide-react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "https://sentinel360.onrender.com";

interface Props {
  item: { nome?: string; Arquivo?: string; name?: string; caminho?: string; Caminho?: string; path?: string } | null;
  onClose: () => void;
  targetUsername?: string;
}

type VtStatus = "idle" | "loading" | "found" | "not_found" | "error" | "no_hash" | "no_key";

export function FileViewerModal({ item, onClose, targetUsername }: Props) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [binaryData, setBinaryData] = useState<{ mime: string; data: string } | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vtStatus, setVtStatus] = useState<VtStatus>("idle");
  const [vtData, setVtData] = useState<any>(null);
  const [vtError, setVtError] = useState("");

  const nome = item?.nome || item?.Arquivo || item?.name || "Arquivo";
  const path = item?.caminho || item?.Caminho || item?.path || "";
  const qs = targetUsername ? `&target_username=${encodeURIComponent(targetUsername)}` : "";

  useEffect(() => {
    if (!item) return;
    setContent(""); setBinaryData(null); setError(""); setTruncated(false);
    setVtStatus("idle"); setVtData(null); setVtError("");
    setLoading(true);
    fetch(`${API_URL}/file-preview?path=${encodeURIComponent(path)}${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.detail ?? `Erro ${r.status}`); }
        return r.json();
      })
      .then(d => {
        if (d.type === "binary") {
          setBinaryData({ mime: d.mime, data: d.data });
        } else {
          setContent(d.content);
        }
        setTruncated(d.truncated);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [item]);

  const checkVt = async () => {
    setVtStatus("loading"); setVtData(null); setVtError("");
    try {
      const res = await fetch(`${API_URL}/virustotal/check?path=${encodeURIComponent(path)}${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (res.status === 503) { setVtStatus("no_key"); setVtError("VirusTotal não configurado no servidor."); return; }
      if (res.status === 422) { setVtStatus("no_hash"); setVtError(d.detail); return; }
      if (!res.ok) { setVtStatus("error"); setVtError(d.detail ?? `Erro ${res.status}`); return; }
      if (d.status === "not_found") { setVtStatus("not_found"); setVtData(d); return; }
      setVtStatus("found"); setVtData(d);
    } catch (e: any) {
      setVtStatus("error"); setVtError(e.message);
    }
  };

  if (!item) return null;

  const malicious = vtData?.stats?.malicious ?? 0;
  const suspicious = vtData?.stats?.suspicious ?? 0;
  const total = vtData ? Object.values(vtData.stats ?? {}).reduce((a: any, b: any) => a + b, 0) : 0;
  const isMalicious = malicious > 0;
  const isSuspicious = !isMalicious && suspicious > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          {/* VirusTotal button */}
          <button onClick={checkVt} disabled={vtStatus === "loading"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#394eff]/30 bg-[#394eff]/10 text-[#394eff] text-xs font-medium hover:bg-[#394eff]/20 disabled:opacity-50 transition-colors shrink-0">
            {vtStatus === "loading"
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <ShieldCheck className="w-3.5 h-3.5" />}
            VirusTotal
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VirusTotal result panel */}
        {vtStatus !== "idle" && vtStatus !== "loading" && (
          <div className={`px-5 py-3 border-b border-border shrink-0 ${
            vtStatus === "no_key" || vtStatus === "no_hash" || vtStatus === "error" ? "bg-secondary/20" :
            vtStatus === "not_found" ? "bg-secondary/20" :
            isMalicious ? "bg-[#f85149]/8" : isSuspicious ? "bg-[#d29922]/8" : "bg-[#3fb950]/8"
          }`}>
            {(vtStatus === "no_key" || vtStatus === "no_hash" || vtStatus === "error") && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" /> {vtError}
              </p>
            )}
            {vtStatus === "not_found" && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Arquivo não encontrado na base do VirusTotal.
                <span className="text-muted-foreground/50 font-mono text-[10px]">{vtData?.sha256?.slice(0, 16)}…</span>
              </p>
            )}
            {vtStatus === "found" && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Detection badge */}
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    isMalicious ? "bg-[#f85149]/15 border-[#f85149]/30 text-[#f85149]" :
                    isSuspicious ? "bg-[#d29922]/15 border-[#d29922]/30 text-[#d29922]" :
                    "bg-[#3fb950]/15 border-[#3fb950]/30 text-[#3fb950]"
                  }`}>
                    {isMalicious || isSuspicious
                      ? <ShieldAlert className="w-3.5 h-3.5" />
                      : <ShieldCheck className="w-3.5 h-3.5" />}
                    {malicious + suspicious}/{total} engines detectaram
                  </span>
                  {vtData.threat_names?.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {vtData.threat_names.slice(0, 3).join(", ")}
                    </span>
                  )}
                  {vtData.from_cache && (
                    <span className="text-[10px] text-muted-foreground/50 border border-border rounded px-1.5 py-0.5">cache</span>
                  )}
                  <a href={vtData.vt_link} target="_blank" rel="noreferrer"
                    className="ml-auto flex items-center gap-1 text-[10px] text-[#394eff] hover:underline shrink-0">
                    Ver relatório completo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {vtData.detections?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {vtData.detections.slice(0, 8).map((d: any) => (
                      <span key={d.engine} className={`text-[10px] px-2 py-0.5 rounded border ${
                        d.category === "malicious" ? "bg-[#f85149]/10 border-[#f85149]/20 text-[#f85149]"
                          : "bg-[#d29922]/10 border-[#d29922]/20 text-[#d29922]"
                      }`}>
                        {d.engine}: {d.result}
                      </span>
                    ))}
                    {vtData.detections.length > 8 && (
                      <span className="text-[10px] text-muted-foreground/60">+{vtData.detections.length - 8} mais</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* file content */}
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
          {!loading && !error && binaryData && (
            <>
              {truncated && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-[#d29922]/10 border border-[#d29922]/20 text-xs text-[#d29922]">
                  Exibindo primeiros 5 MB do arquivo.
                </div>
              )}
              {binaryData.mime.startsWith("image/") && (
                <div className="flex items-center justify-center bg-secondary/20 rounded-xl border border-border p-4 min-h-[200px]">
                  <img
                    src={`data:${binaryData.mime};base64,${binaryData.data}`}
                    alt={nome}
                    className="max-w-full max-h-[55vh] object-contain rounded-lg"
                  />
                </div>
              )}
              {binaryData.mime === "application/pdf" && (
                <iframe
                  src={`data:application/pdf;base64,${binaryData.data}`}
                  className="w-full rounded-xl border border-border"
                  style={{ height: "60vh" }}
                  title={nome}
                />
              )}
            </>
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
