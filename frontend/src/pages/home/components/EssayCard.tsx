import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { IconButton } from "../../../components/IconButton";
import { TexturedCard } from "../../../components/TexturedCard";
import { formatDate } from "../../../libs/date";
import { RESENDABLE_STATUSES, scoreCardColor } from "../../../services/essayService";
import type { Essay, EssayStatus } from "../../../types/essay";
import { EssayResendFlow } from "./EssayResendFlow";
import { EssayStatusHeader } from "./EssayStatusHeader";

// The Correção result page redirects these statuses straight back to Home (ticket 07), so "Tentar
// novamente" can't just link there like it used to — it has to trigger the resend flow right here.
// UPLOADING is resendable too, but it's not a terminal status yet — its card link still opens the
// result page, which shows the pending/loading state instead of bouncing.
const INLINE_RESEND_STATUSES: EssayStatus[] = RESENDABLE_STATUSES.filter((status) => status !== "UPLOADING");

export function EssayCard({ essay }: { essay: Essay }) {
  const [resendOpen, setResendOpen] = useState(false);
  const navigate = useNavigate();

  if (essay.status === "SUCCESS") {
    return (
      <TexturedCard color={scoreCardColor(essay.finalScore ?? 0)} className="w-full" contentClassName="gap-4 p-2.5" interactive>
        <Link to={`/essays/${essay.id}`} aria-label={`Ver resultado da redação sobre ${essay.themeTitle}`} className="absolute inset-0 z-10" />
        <div className="flex w-full items-center gap-4">
          <Bullet variant="white" size="auto" rotate="left">
            {essay.finalScore ?? "—"}
          </Bullet>
          <p className="line-clamp-2 flex-1 text-subtitle font-bold capitalize text-neutral-900">{essay.themeTitle}</p>
        </div>
        <div className="flex w-full items-end justify-between">
          <p className="text-small font-bold text-neutral-900">{formatDate(essay.createdAt)}</p>
          <IconButton variant="dark" tabIndex={-1} aria-hidden icon={<ChevronRight size={24} className="text-neutral-0" />} />
        </div>
      </TexturedCard>
    );
  }

  const inlineResend = INLINE_RESEND_STATUSES.includes(essay.status);
  // EVALUATION_FAILED gets no action row at all (nothing to retry, nothing to view yet), so it
  // stays unlinked just like the inline-resend statuses — only they have a real reason to (the
  // resend button needs the card to stay non-clickable so it doesn't compete with the link).
  const isClickable = !inlineResend && essay.status !== "EVALUATION_FAILED";

  return (
    <div className="flex w-full flex-col gap-2">
      <EssayStatusHeader essay={essay} />
      <TexturedCard color="dark" className="w-full" contentClassName="gap-4 p-2.5" interactive={isClickable}>
        {isClickable && (
          <Link to={`/essays/${essay.id}`} aria-label={`Ver redação sobre ${essay.themeTitle}`} className="absolute inset-0 z-10" />
        )}
        <div className="flex w-full items-center gap-4">
          <Bullet variant="dark" size="auto" rotate="left">
            ???
          </Bullet>
          <p className="line-clamp-2 flex-1 text-subtitle font-bold capitalize text-neutral-0">{essay.themeTitle}</p>
        </div>
        <div className="flex w-full items-center justify-end">
          {inlineResend && (
            <Button variant="dark" onClick={() => setResendOpen(true)}>
              Tentar novamente
            </Button>
          )}
          {essay.status === "UPLOADING" && (
            <Button variant="dark" tabIndex={-1} aria-hidden>
              Acompanhar envio
            </Button>
          )}
          {!inlineResend && essay.status !== "UPLOADING" && essay.status !== "EVALUATION_FAILED" && (
            <IconButton variant="dark" tabIndex={-1} aria-hidden icon={<ChevronRight size={24} className="text-neutral-0" />} />
          )}
        </div>
      </TexturedCard>
      {inlineResend && resendOpen && (
        <EssayResendFlow essayId={essay.id} onClose={() => setResendOpen(false)} onDone={() => navigate(`/essays/${essay.id}`)} />
      )}
    </div>
  );
}
