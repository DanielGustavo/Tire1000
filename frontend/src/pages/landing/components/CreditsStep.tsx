import { NotepadText } from "lucide-react";
import { Button } from "../../../components/Button";

const CREDIT_OPTIONS = [1, 2, 3];

export function CreditsStep({
  pending,
  pendingCreditsQty,
  onSelect,
  onSkip,
}: {
  pending: boolean;
  pendingCreditsQty?: number;
  onSelect: (creditsQty: number) => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="w-full text-title font-extrabold text-neutral-900">
        Selecione a quantidade de créditos para iniciar
      </h1>
      <div className="flex w-full flex-col gap-6">
        {CREDIT_OPTIONS.map((qty) => (
          <div key={qty} className="flex w-full flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-neutral-900" aria-hidden="true">
              {Array.from({ length: qty }, (_, index) => (
                <NotepadText key={index} size={24} />
              ))}
            </div>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={pending}
              loading={pending && pendingCreditsQty === qty}
              onClick={() => onSelect(qty)}
            >
              {`Iniciar com ${qty} crédito${qty > 1 ? "s" : ""}`}
            </Button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        disabled={pending}
        className="text-default text-neutral-300 underline disabled:opacity-50"
      >
        Continuar sem comprar créditos agora
      </button>
    </div>
  );
}
