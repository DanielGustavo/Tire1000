import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ onClose, children }: ModalProps) {
  const closedByPopStateRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Faz o botão/gesto de voltar fechar o modal em vez de navegar pra fora da página:
  // empurra uma entrada de history ao montar e escuta o popstate pra fechar.
  // Se o modal fechar por qualquer outro caminho (X, backdrop, Esc, sucesso de alguma
  // ação interna), o cleanup consome essa entrada com history.back() pra não deixar
  // um "degrau" órfão que o usuário precisaria voltar duas vezes pra passar.
  useEffect(() => {
    closedByPopStateRef.current = false;
    window.history.pushState({ modal: true }, "");

    function handlePopState() {
      closedByPopStateRef.current = true;
      onClose();
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedByPopStateRef.current) window.history.back();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-full w-full max-w-[377px] flex-col items-center gap-6 overflow-y-auto border-2 border-solid border-neutral-900 bg-neutral-0 px-4 py-6 shadow-hard"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
