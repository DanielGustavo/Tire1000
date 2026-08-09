import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { Modal } from "../../../components/Modal";

export function PhotoConfirmationErrorModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex w-full flex-col items-end gap-6">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="slot" color="var(--color-error-300)" size="large" rotate="left">
            <span className="text-title font-extrabold text-neutral-0">!</span>
          </Bullet>
          <p className="flex-1 text-title font-extrabold text-neutral-900">Erro ao enviar redação</p>
        </div>

        <Button variant="error" className="w-full" onClick={onClose}>
          Tentar novamente mais tarde
        </Button>
      </div>
    </Modal>
  );
}
