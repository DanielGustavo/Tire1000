import { Camera, NotepadText, Send, Upload } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { Modal } from "../../../components/Modal";
import type { EssayUploadMode } from "../useEssayCaptureFlow";

type PhotoConfirmationModalProps = {
  mode: EssayUploadMode;
  photoUrl: string;
  error: string | null;
  onRetake: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function PhotoConfirmationModal({ mode, photoUrl, error, onRetake, onConfirm, onClose }: PhotoConfirmationModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="flex w-full flex-col items-end gap-6">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="slot" color="var(--color-primary-300)" size="large" rotate="left">
            <NotepadText size={24} className="text-neutral-0" />
          </Bullet>
          <p className="flex-1 text-title font-extrabold text-neutral-900">Show!</p>
        </div>

        <p className="w-full text-default text-neutral-900">
          Aqui está a imagem da sua redação. Se estiver satisfeito, você pode enviá-la.
        </p>

        <div className="w-full overflow-clip border-2 border-solid border-neutral-900 bg-alert-100 shadow-hard">
          <img src={photoUrl} alt="Foto da redação" className="max-h-[45vh] w-full object-contain" />
        </div>

        {error && <p className="w-full text-small text-error-300">{error}</p>}

        <div className="flex w-full flex-col gap-2">
          <Button
            variant="neutral"
            className="w-full"
            icon={mode === "camera" ? <Camera size={20} /> : <Upload size={20} />}
            onClick={onRetake}
          >
            {mode === "camera" ? "Tirar outra foto" : "Selecionar outro arquivo"}
          </Button>
          <Button variant="primary" className="w-full" icon={<Send size={20} />} onClick={onConfirm}>
            Enviar redação agora
          </Button>
        </div>
      </div>
    </Modal>
  );
}
