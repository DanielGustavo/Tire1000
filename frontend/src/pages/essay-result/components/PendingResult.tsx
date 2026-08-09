import { PaperCard } from "../../../components/PaperCard";
import { TypingAnimation } from "../../../components/TypingAnimation";
import { ROTATED_SHADOW_CLASSES, rotateClass } from "../../../libs/hard-shadow";
import { pendingResultHeading, type EssayStatus } from "../../../services/essay-service";

export function PendingResult({ status }: { status: EssayStatus }) {
  const message = pendingResultHeading(status);

  return (
    // lg:min-h-[518px] matches the Figma desktop frames ("Correção - in progress"/"loading") — taller
    // than the mobile card since the sidebar next to it (ticket 13) has more content to sit level with.
    <PaperCard className="flex min-h-[378px] items-center justify-center lg:min-h-[518px]">
      <div className={`max-w-[95%] overflow-hidden ${rotateClass("left")}`}>
        <div
          className={`flex flex-col items-center gap-2 border-2 border-solid border-neutral-900 bg-alert-100 p-3 text-center ${ROTATED_SHADOW_CLASSES.black}`}
        >
          <p className="text-subtitle-small font-extrabold text-neutral-900">
            {message}
            <TypingAnimation />
          </p>
          <p className="text-default font-bold text-neutral-900 text-wrap">
            Quase lá! Isso leva só alguns minutos, então sinta-se à vontade pra sair da página.
          </p>
        </div>
      </div>
    </PaperCard>
  );
}
