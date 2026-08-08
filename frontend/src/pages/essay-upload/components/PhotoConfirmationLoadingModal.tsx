import { Loader } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Modal } from "../../../components/Modal";

export function PhotoConfirmationLoadingModal() {
  // Non-dismissible on purpose — there's no safe way to cancel an in-flight submit.
  return (
    <Modal onClose={() => {}}>
      <div className="flex w-full items-center gap-4">
        <Bullet variant="slot" color="var(--color-primary-300)" size="large" rotate="left">
          <Loader size={24} className="animate-spin text-neutral-0" />
        </Bullet>
        <p className="flex-1 text-title font-extrabold text-neutral-900">Enviando sua redação...</p>
      </div>
    </Modal>
  );
}
