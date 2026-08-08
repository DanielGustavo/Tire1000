import { useMutation } from "@tanstack/react-query";
import { NotepadText } from "lucide-react";
import { getApiErrorMessage } from "../libs/axios";
import { creditsService } from "../services/credits-service";
import { Button } from "./Button";
import { Modal } from "./Modal";

const CREDIT_OPTIONS = [1, 2, 3];

type PriceModalProps = {
  onClose: () => void;
};

export function PriceModal({ onClose }: PriceModalProps) {
  const checkoutMutation = useMutation({
    mutationFn: (creditsQty: number) => creditsService.requestCheckout(creditsQty),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
  });

  return (
    <Modal onClose={onClose}>
      <div className="flex w-full flex-col items-center gap-8">
        <h1 className="w-full text-title font-extrabold text-neutral-900">Selecione quantos créditos adicionar</h1>
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
                disabled={checkoutMutation.isPending}
                onClick={() => checkoutMutation.mutate(qty)}
              >
                {`Adicionar ${qty} crédito${qty > 1 ? "s" : ""}`}
              </Button>
            </div>
          ))}
        </div>
        {checkoutMutation.isError && (
          <p className="text-small text-error-300">
            {getApiErrorMessage(checkoutMutation.error, "Não foi possível iniciar o checkout. Tente novamente.")}
          </p>
        )}
      </div>
    </Modal>
  );
}
