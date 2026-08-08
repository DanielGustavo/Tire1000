import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LibraryBig, NotepadText, User, X } from "lucide-react";
import { clearAccessToken } from "../libs/auth";
import { ROTATED_SHADOW_CLASSES, rotateClass } from "../libs/hard-shadow";
import { Bullet } from "../components/Bullet";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { PriceModal } from "../components/PriceModal";
import { TexturedCard } from "../components/TexturedCard";
import { essayService, REJECTION_REASON_LABELS, RESENDABLE_STATUSES, scoreCardColor, type Essay, type EssayStatus } from "../services/essay-service";
import { themeService, type ThemeWithTopic } from "../services/theme-service";
import { userService } from "../services/user-service";
import logo from "../assets/landing/logo.png";

const RECENT_THEMES_COUNT = 5;
const ESSAYS_PER_PAGE = 5;
const DEFAULT_THEME_COLOR = "#EDEDED";

const STATUS_MESSAGES: Partial<Record<EssayStatus, string>> = {
  UPLOADING: "O envio da sua redação não foi concluído",
  QUEUED: "Sua redação está na fila da Revisão",
  VALIDATING: "Estamos corrigindo sua redação, aguarde alguns minutos",
  VALIDATED: "Sua redação está na fila da Avaliação",
  EVALUATING: "Estamos corrigindo sua redação, aguarde alguns minutos",
  UPLOAD_FAILED: "Não foi possível confirmar o envio da foto",
  VALIDATION_FAILED: "Falha técnica ao revisar sua redação",
  EVALUATION_FAILED: "Falha técnica ao avaliar sua redação",
};

function statusMessage(essay: Essay): string {
  if (essay.status === "REJECTED") {
    const reasons = essay.rejectionReasons.map((reason) => REJECTION_REASON_LABELS[reason] ?? reason).join(", ");
    return `Problemas com a imagem: ${reasons}`;
  }
  return STATUS_MESSAGES[essay.status] ?? "";
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR");
}

/** Always keeps first/last/neighbors-of-current visible, collapsing gaps into "...". */
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("...");
    result.push(page);
    previous = page;
  }
  return result;
}

function Header({ credits }: { credits: number | undefined }) {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="flex w-full items-center justify-between bg-neutral-20 p-4">
      <img src={logo} alt="Tire 1000" className="h-10 w-[45px] object-contain" />
      <div className="flex items-center gap-4">
        <IconButton
          variant="gray"
          rotate="left"
          aria-label="Comprar créditos"
          onClick={() => setPriceModalOpen(true)}
          icon={
            <span className="flex items-center gap-0.5 text-default font-bold text-neutral-0">
              {credits ?? "…"}
              <NotepadText size={20} />
            </span>
          }
        />
        <UserMenu open={userMenuOpen} onOpenChange={setUserMenuOpen} />
      </div>
      {priceModalOpen && <PriceModal onClose={() => setPriceModalOpen(false)} />}
    </header>
  );
}

function UserMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const userQuery = useQuery({ queryKey: ["currentUser"], queryFn: () => userService.getCurrentUser() });

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  function handleSignOut() {
    clearAccessToken();
    navigate("/");
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        variant="gray"
        rotate="left"
        aria-label="Menu do usuário"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        icon={<User size={24} className="text-neutral-0" />}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-3 flex w-[240px] flex-col items-start gap-6 border-2 border-solid border-neutral-900 bg-neutral-0 p-4 shadow-hard"
        >
          <div className="flex flex-col items-start">
            <p className="text-default text-neutral-900">
              Olá, <span className="font-bold">{userQuery.data?.name ?? "..."}</span>!
            </p>
            <p className="text-small text-neutral-700">{userQuery.data?.email}</p>
          </div>
          <Button type="button" variant="neutral" className="w-full" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}

function ThemesSection() {
  const themesQuery = useQuery({ queryKey: ["themes", "recent"], queryFn: () => themeService.list() });
  const recentThemes = themesQuery.data?.slice(0, RECENT_THEMES_COUNT) ?? [];

  return (
    <section className="flex w-full flex-col gap-4 px-4">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-title font-extrabold text-neutral-900">Temas</h2>
        <Link to="/themes" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>

      {themesQuery.isPending && <p className="text-default text-neutral-700">Carregando...</p>}
      {themesQuery.isError && <p className="text-default text-error-300">Não foi possível carregar os temas.</p>}

      {recentThemes.length > 0 && (
        <div className="flex w-full gap-4 overflow-x-auto pb-2">
          {recentThemes.map(({ theme, topic }) => (
            <ThemeCard key={theme.id} theme={theme} topic={topic} />
          ))}
        </div>
      )}
    </section>
  );
}

function ThemeCard({ theme, topic }: ThemeWithTopic) {
  return (
    <div className="flex h-[295px] w-[309px] shrink-0 flex-col items-start gap-2">
      <Bullet size="auto" color={topic?.color ?? DEFAULT_THEME_COLOR}>{theme.enemYear ? `ENEM ${theme.enemYear}` : `Tire 1000`}</Bullet>

      <TexturedCard color={topic?.color ?? DEFAULT_THEME_COLOR} className="flex-1 w-full" contentClassName="justify-between p-2.5">
        <p className="line-clamp-3 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Link to={`/themes/${theme.id}`} className="self-end">
          <Button variant="dark">Ver tema</Button>
        </Link>
      </TexturedCard>
    </div>
  );
}

function EssayStatusHeader({ essay }: { essay: Essay }) {
  const isError = essay.status === "REJECTED" || essay.status === "UPLOAD_FAILED" || essay.status === "VALIDATION_FAILED" || essay.status === "EVALUATION_FAILED";

  return (
    <div className="flex w-full items-center gap-2">
      <div className={`${rotateClass("left")} flex w-[21px] h-[38px] shrink-0 items-center justify-center border-2 border-solid border-neutral-900 ${isError ? "bg-error-300" : "bg-alert-300"} ${ROTATED_SHADOW_CLASSES.black}`}>
        {isError ? <X size={24} strokeWidth={3} className="text-neutral-0" /> : <span className="text-subtitle font-bold text-neutral-900">!</span>}
      </div>
      <p className="flex-1 text-default font-bold text-neutral-900">{statusMessage(essay)}</p>
    </div>
  );
}

function EssayCard({ essay }: { essay: Essay }) {
  if (essay.status === "SUCCESS") {
    return (
      <TexturedCard color={scoreCardColor(essay.finalScore ?? 0)} className="w-full" contentClassName="gap-4 p-2.5">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="white" size="auto" rotate="left">
            {essay.finalScore ?? "—"}
          </Bullet>
          <p className="line-clamp-2 flex-1 text-subtitle font-bold capitalize text-neutral-900">{essay.themeTitle}</p>
        </div>
        <div className="flex w-full items-end justify-between">
          <p className="text-small font-bold text-neutral-900">{formatDate(essay.createdAt)}</p>
          <Link to={`/essays/${essay.id}`}>
            <IconButton variant="dark" aria-label="Ver resultado" icon={<ChevronRight size={24} className="text-neutral-0" />} />
          </Link>
        </div>
      </TexturedCard>
    );
  }

  const isResendable = RESENDABLE_STATUSES.includes(essay.status);

  return (
    <div className="flex w-full flex-col gap-2">
      <EssayStatusHeader essay={essay} />
      <TexturedCard color="dark" className="w-full" contentClassName="gap-4 p-2.5">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="dark" size="auto" rotate="left">
            ???
          </Bullet>
          <p className="line-clamp-2 flex-1 text-subtitle font-bold capitalize text-neutral-0">{essay.themeTitle}</p>
        </div>
        <div className="flex w-full items-center justify-end">
          {isResendable ? (
            <Link to={`/essays/${essay.id}`}>
              <Button variant="dark">Tentar novamente</Button>
            </Link>
          ) : (
            <Link to={`/essays/${essay.id}`}>
              <IconButton variant="dark" aria-label="Ver detalhes" icon={<ChevronRight size={24} className="text-neutral-0" />} />
            </Link>
          )}
        </div>
      </TexturedCard>
    </div>
  );
}

function EssaysEmptyState() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <LibraryBig size={64} className="text-neutral-200" />
        <p className="w-full text-center text-default text-neutral-200">Você ainda não enviou nenhuma redação</p>
      </div>
      <Link to="/themes">
        <Button variant="primary">Escolher um tema</Button>
      </Link>
    </div>
  );
}

function EssaysPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-6 pt-4">
      <IconButton
        variant="gray"
        aria-label="Página anterior"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        icon={<ChevronLeft size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
      <div className="flex items-center gap-4">
        {buildPageNumbers(page, totalPages).map((entry, index) =>
          entry === "..." ? (
            <span key={`ellipsis-${index}`} className="text-small text-neutral-500">
              ...
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              className={entry === page ? "text-default font-bold text-neutral-900 underline" : "text-small text-neutral-500"}
            >
              {entry}
            </button>
          ),
        )}
      </div>
      <IconButton
        variant="gray"
        aria-label="Próxima página"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        icon={<ChevronRight size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
    </div>
  );
}

function EssaysSection() {
  const [page, setPage] = useState(1);
  const essaysQuery = useQuery({ queryKey: ["essays"], queryFn: () => essayService.list() });
  const essays = essaysQuery.data?.essays ?? [];
  const totalPages = Math.max(1, Math.ceil(essays.length / ESSAYS_PER_PAGE));
  const pageEssays = essays.slice((page - 1) * ESSAYS_PER_PAGE, page * ESSAYS_PER_PAGE);

  return (
    <section className="flex w-full flex-col gap-4 px-4">
      <h2 className="text-title font-extrabold text-neutral-900">Suas redações</h2>

      {essaysQuery.isPending && <p className="text-default text-neutral-700">Carregando...</p>}
      {essaysQuery.isError && <p className="text-default text-error-300">Não foi possível carregar suas redações.</p>}
      {essaysQuery.isSuccess && essays.length === 0 && <EssaysEmptyState />}

      {pageEssays.length > 0 && (
        <div className="flex w-full flex-col gap-4">
          {pageEssays.map((essay) => (
            <EssayCard key={essay.id} essay={essay} />
          ))}
        </div>
      )}

      <EssaysPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex h-[100px] w-full items-center justify-center gap-4 bg-neutral-900 p-2">
      <p className="text-small text-neutral-0">Todos os direitos reservados à</p>
      <img src={logo} alt="Tire 1000" className="h-[35px] w-[39px] object-contain" />
    </footer>
  );
}

export function HomePage() {
  const userQuery = useQuery({ queryKey: ["currentUser"], queryFn: () => userService.getCurrentUser() });

  return (
    <div className="flex w-full flex-col items-center gap-6 bg-neutral-0">
      <Header credits={userQuery.data?.credits} />
      <ThemesSection />
      <EssaysSection />
      <Footer />
    </div>
  );
}
