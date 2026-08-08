import { PaperCard } from "../../../components/PaperCard";
import { ROTATED_SHADOW_CLASSES, rotateClass } from "../../../libs/hard-shadow";
import { VALIDATING_STATUSES, type EssayStatus } from "../../../services/essay-service";

export function PendingResult({ status }: { status: EssayStatus }) {
  const message = VALIDATING_STATUSES.includes(status)
    ? "estamos carregando nossa correção..."
    : "estamos corrigindo a sua redação...";

  return (
    <PaperCard className="flex min-h-[378px] items-center justify-center">
      <div className={rotateClass("left")}>
        <div
          className={`flex flex-col items-center gap-2 whitespace-nowrap border-2 border-solid border-neutral-900 bg-alert-100 p-3 text-center ${ROTATED_SHADOW_CLASSES.black}`}
        >
          <p className="text-subtitle-small font-extrabold text-neutral-900">Aguarde um instante,</p>
          <p className="text-default font-bold text-neutral-900">{message}</p>
        </div>
      </div>
    </PaperCard>
  );
}
