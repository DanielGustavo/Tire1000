import { X } from "lucide-react";
import { ROTATED_SHADOW_CLASSES, rotateClass } from "../../../libs/hard-shadow";
import { REJECTION_REASON_LABELS, type Essay, type EssayStatus } from "../../../services/essay-service";

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

export function EssayStatusHeader({ essay }: { essay: Essay }) {
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
