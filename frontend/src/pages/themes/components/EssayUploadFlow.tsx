import { CameraPermissionModal } from "../../essay-upload/components/CameraPermissionModal";
import { PhotoConfirmationErrorModal } from "../../essay-upload/components/PhotoConfirmationErrorModal";
import { PhotoConfirmationLoadingModal } from "../../essay-upload/components/PhotoConfirmationLoadingModal";
import { PhotoConfirmationModal } from "../../essay-upload/components/PhotoConfirmationModal";
import { TipsModal } from "../../essay-upload/components/TipsModal";
import type { EssayUploadMode } from "../../essay-upload/useEssayCaptureFlow";
import { useEssayUploadFlow } from "./useEssayUploadFlow";

/** The upload flow (ticket 06), opened in place over the theme detail page instead of at its own route (`/essays/new`) — triggered by the "Tirar foto"/"Fazer upload" CTAs. */
export function EssayUploadFlow({
  themeId,
  mode,
  onClose,
  onDone,
}: {
  themeId: string;
  mode: EssayUploadMode;
  onClose: () => void;
  onDone: () => void;
}) {
  const {
    step,
    photoUrl,
    photoSizeError,
    fileInputRef,
    submitMutation,
    handleOpenCamera,
    handleOpenFilePicker,
    handleFileChange,
    handleSubmit,
  } = useEssayUploadFlow(themeId, mode, onDone);

  const showStep = !submitMutation.isPending && !submitMutation.isError;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        {...(mode === "camera" ? { capture: "environment" as const } : {})}
        onChange={handleFileChange}
        className="hidden"
      />

      {submitMutation.isPending && <PhotoConfirmationLoadingModal />}

      {submitMutation.isError && <PhotoConfirmationErrorModal onClose={onClose} />}

      {showStep && step === "tips" && (
        <TipsModal
          mode={mode}
          error={photoSizeError}
          onAction={mode === "camera" ? handleOpenCamera : handleOpenFilePicker}
          onClose={onClose}
        />
      )}

      {showStep && step === "permission-revoked" && (
        <CameraPermissionModal state="revoked" error={photoSizeError} onRetry={handleOpenCamera} onClose={onClose} />
      )}

      {showStep && step === "permission-accepted" && (
        <CameraPermissionModal state="accepted" error={photoSizeError} onContinue={handleOpenFilePicker} onClose={onClose} />
      )}

      {showStep && step === "confirmation" && photoUrl && (
        <PhotoConfirmationModal
          mode={mode}
          photoUrl={photoUrl}
          error={photoSizeError}
          onRetake={handleOpenFilePicker}
          onConfirm={handleSubmit}
          onClose={onClose}
        />
      )}
    </>
  );
}
