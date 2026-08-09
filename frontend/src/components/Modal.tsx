import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
};

// Shared across every Modal instance (not a ref) because one modal can unmount and a
// different modal mount in the very same commit — e.g. swapping SignUpModal for SignInModal.
// Without a module-level handoff, the new instance can't see the old instance's deferred
// history.back() and would push its own entry on top, letting that stale back() pop it right
// after it opens. See the effect below for the full mechanism.
let pendingBack: (() => void) | null = null;

export function Modal({ onClose, children }: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Faz o botão/gesto de voltar fechar o modal em vez de navegar pra fora da página:
  // empurra uma entrada de history ao montar e escuta o popstate pra fechar.
  // Se o modal fechar por qualquer outro caminho (X, backdrop, Esc, sucesso de alguma
  // ação interna), o cleanup consome essa entrada com history.back() pra não deixar
  // um "degrau" órfão que o usuário precisaria voltar duas vezes pra passar.
  //
  // history.back() é assíncrono: o popstate correspondente só chega depois. Em StrictMode
  // (setup->cleanup->setup síncrono na montagem), quando `onClose` muda de identidade num
  // re-render, ou quando um modal fecha e outro abre no mesmo commit (ex.: SignUp -> SignIn),
  // o cleanup dispara e o setup seguinte (dessa instância ou de outra) roda antes desse back()
  // resolver. Por isso o back() do cleanup é adiado num microtask e cancelável via uma
  // variável de módulo compartilhada: se algum efeito de Modal montar antes do microtask
  // rodar, ele cancela o back() pendente e reaproveita a entrada de history já empurrada em
  // vez de empurrar outra e sem deixar o back() antigo fechar o modal que acabou de (re)montar.
  const closedByPopStateRef = useRef(false);

  useEffect(() => {
    closedByPopStateRef.current = false;

    if (pendingBack) {
      pendingBack();
      pendingBack = null;
    } else {
      window.history.pushState({ modal: true }, "");
    }

    function handlePopState() {
      closedByPopStateRef.current = true;
      onCloseRef.current();
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedByPopStateRef.current) {
        let cancelled = false;
        pendingBack = () => {
          cancelled = true;
        };
        queueMicrotask(() => {
          if (!cancelled) {
            pendingBack = null;
            window.history.back();
          }
        });
      }
    };
  }, []);

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
