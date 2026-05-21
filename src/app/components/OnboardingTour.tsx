import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TourStep {
  target: string; // data-tour value
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    target: "nav-dashboard",
    title: "Dashboard",
    description: "Visão geral do seu ambiente: arquivos analisados, riscos detectados e histórico de scans em tempo real.",
  },
  {
    target: "nav-inactive",
    title: "Arquivos Inativos",
    description: "Lista arquivos que não foram acessados há mais de X dias (configurável no Perfil). Ideal para limpeza e conformidade.",
  },
  {
    target: "nav-sensitive",
    title: "Dados Sensíveis",
    description: "Arquivos que contêm CPF, CNPJ, e-mails, credenciais ou outras informações sensíveis detectadas automaticamente.",
  },
  {
    target: "nav-integrations",
    title: "Integrações",
    description: "Conecte suas contas Microsoft 365, Azure AD ou conta pessoal para que o Sentinel360 possa analisar seus arquivos.",
  },
  {
    target: "nav-reports",
    title: "Relatórios",
    description: "Exporte relatórios completos em PDF ou Excel com todos os dados de varredura, riscos e histórico.",
  },
  {
    target: "nav-profile",
    title: "Perfil",
    description: "Configure seu limiar de inatividade, preferências e veja informações da sua conta.",
  },
  {
    target: "theme-toggle",
    title: "Modo Claro / Escuro",
    description: "Alterne entre tema escuro e claro a qualquer momento. Sua preferência é salva automaticamente.",
  },
  {
    target: "help-btn",
    title: "Ajuda & Documentação",
    description: "Acesse a documentação completa do Sentinel360 com guias detalhados para cada funcionalidade.",
  },
];

interface Rect { top: number; left: number; width: number; height: number }

const PADDING = 10;

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

function positionTooltip(rect: Rect): { top: number; left: number } {
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 160;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = rect.top + rect.height + 12;
  let left = rect.left + rect.width / 2 - TOOLTIP_W / 2;

  if (top + TOOLTIP_H > vh - 16) top = rect.top - TOOLTIP_H - 12;
  if (left < 12) left = 12;
  if (left + TOOLTIP_W > vw - 12) left = vw - TOOLTIP_W - 12;

  return { top, left };
}

interface Props {
  onClose: () => void;
  startStep?: number;
}

export function OnboardingTour({ onClose, startStep = 0 }: Props) {
  const [step, setStep] = useState(startStep);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];

  const measure = useCallback(() => {
    setRect(getTargetRect(current.target));
  }, [current.target]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const finish = useCallback(() => {
    localStorage.setItem("s360_tour_done", "1");
    onClose();
  }, [onClose]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const tooltipPos = rect ? positionTooltip(rect) : { top: 0, left: 0 };

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with hole */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx="6"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border */}
      {rect && (
        <div
          className="absolute rounded-md border-2 border-primary transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-card border border-border rounded-xl shadow-2xl p-4 w-80 transition-all duration-200"
        style={{ ...tooltipPos, pointerEvents: "all" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={finish}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-1">{current.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{current.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>
          <button
            onClick={next}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            {step === STEPS.length - 1 ? "Concluir" : "Próximo"}
            {step < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
