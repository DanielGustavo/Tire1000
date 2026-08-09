import { Camera, Image as ImageIcon, LineStyle, NotebookPen, NotepadText, Sun, Upload, type LucideIcon } from "lucide-react";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { Modal } from "../../../components/Modal";
import type { EssayUploadMode } from "../useEssayCaptureFlow";

const CAMERA_TIPS: { icon: LucideIcon; label: string }[] = [
  { icon: Sun, label: "Iluminação boa!" },
  { icon: NotebookPen, label: "Escrita legível" },
  { icon: LineStyle, label: "Entre 7 e 30 linhas." },
];
const UPLOAD_TIPS: { icon: LucideIcon; label: string }[] = [...CAMERA_TIPS, { icon: ImageIcon, label: "Apenas imagens" }];

type TipsModalProps = {
  mode: EssayUploadMode;
  error: string | null;
  onAction: () => void;
  onClose: () => void;
};

export function TipsModal({ mode, error, onAction, onClose }: TipsModalProps) {
  const tips = mode === "camera" ? CAMERA_TIPS : UPLOAD_TIPS;

  return (
    <Modal onClose={onClose}>
      <div className="flex w-full flex-col items-end gap-6">
        <div className="flex w-full items-center gap-4">
          <Bullet variant="slot" color="var(--color-primary-300)" size="large" rotate="left">
            <NotepadText size={24} className="text-neutral-0" />
          </Bullet>
          <p className="flex-1 text-title font-extrabold text-neutral-900">
            {mode === "camera" ? "Tire uma foto da sua redação!" : "Faça upload da sua redação!"}
          </p>
        </div>

        <p className="w-full text-default text-neutral-900">Mas antes, não esquece que a foto precisa seguir essas dicas:</p>

        <div className="flex w-full flex-col gap-2">
          {tips.map(({ icon: Icon, label }) => (
            <div key={label} className="flex w-full items-center gap-4">
              <Bullet variant="slot" color="var(--color-alert-100)" size="small" rotate="left">
                <Icon size={20} className="text-neutral-900" />
              </Bullet>
              <p className="flex-1 text-subtitle font-bold capitalize text-neutral-900">{label}</p>
            </div>
          ))}
        </div>

        {error && <p className="w-full text-small text-error-300">{error}</p>}

        <Button variant="primary" icon={mode === "camera" ? <Camera size={20} /> : <Upload size={20} />} onClick={onAction}>
          {mode === "camera" ? "Abrir câmera" : "Selecionar arquivo"}
        </Button>
      </div>
    </Modal>
  );
}
