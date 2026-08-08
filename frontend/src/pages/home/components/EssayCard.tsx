import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { IconButton } from "../../../components/IconButton";
import { TexturedCard } from "../../../components/TexturedCard";
import { RESENDABLE_STATUSES, scoreCardColor, type Essay } from "../../../services/essay-service";
import { EssayStatusHeader } from "./EssayStatusHeader";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR");
}

export function EssayCard({ essay }: { essay: Essay }) {
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
