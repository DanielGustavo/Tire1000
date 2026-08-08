import { Camera, CameraOff, ChevronRight } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { Modal } from "../../../components/Modal";

type CameraPermissionModalProps = { error: string | null; onClose: () => void } & (
  | { state: "revoked"; onRetry: () => void }
  | { state: "accepted"; onContinue: () => void }
);

export function CameraPermissionModal(props: CameraPermissionModalProps) {
  const isRevoked = props.state === "revoked";

  return (
    <Modal onClose={props.onClose}>
      <div className="flex w-full flex-col items-end gap-6">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="slot" color={isRevoked ? "var(--color-error-300)" : "var(--color-primary-300)"} size="large" rotate="left">
            {isRevoked ? <CameraOff size={24} className="text-neutral-0" /> : <Camera size={24} className="text-neutral-0" />}
          </Bullet>
          <p className="flex-1 text-title font-extrabold text-neutral-900">
            {isRevoked ? "Ative sua câmera!" : "Câmera ativada com sucesso!"}
          </p>
        </div>

        <p className="w-full text-default text-neutral-900">
          {isRevoked
            ? "O acesso à câmera no seu navegador está desativado. Para utilizar esta funcionalidade, por favor, ative a permissão de acesso à câmera nas configurações do seu navegador."
            : "O acesso à câmera no seu navegador foi concedido. Você agora pode utilizar esta funcionalidade sem restrições."}
        </p>

        {props.error && <p className="w-full text-small text-error-300">{props.error}</p>}

        {isRevoked ? (
          <Button variant="primary" onClick={props.onRetry}>
            Ativei a permissão, tentar novamente
          </Button>
        ) : (
          <Button variant="primary" icon={<ChevronRight size={20} />} onClick={props.onContinue}>
            Continuar
          </Button>
        )}
      </div>
    </Modal>
  );
}
