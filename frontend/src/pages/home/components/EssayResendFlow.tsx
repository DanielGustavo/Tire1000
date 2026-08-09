import { PhotoConfirmationErrorModal } from "../../../flows/essayCapture/components/PhotoConfirmationErrorModal";
import { PhotoConfirmationLoadingModal } from "../../../flows/essayCapture/components/PhotoConfirmationLoadingModal";
import { PhotoConfirmationModal } from "../../../flows/essayCapture/components/PhotoConfirmationModal";
import { TipsModal } from "../../../flows/essayCapture/components/TipsModal";
import { useEssayResendFlow } from "./useEssayResendFlow";

/** The same modal chain as a new essay upload (ticket 06), opened in place over the Homepage instead of at its own route — triggered by "Tentar novamente" on a rejected/failed essay's card. */
export function EssayResendFlow({ essayId, onClose }: { essayId: string; onClose: () => void }) {
  const { mode, step, photoUrl, photoSizeError, fileInputRef, submitMutation, handleOpenFilePicker, handleFileChange, handleSubmit } =
    useEssayResendFlow(essayId, onClose);

  const showStep = !submitMutation.isPending && !submitMutation.isError;

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {submitMutation.isPending && <PhotoConfirmationLoadingModal />}

      {submitMutation.isError && <PhotoConfirmationErrorModal onClose={onClose} />}

      {showStep && step === "tips" && (
        <TipsModal mode={mode} error={photoSizeError} onAction={handleOpenFilePicker} onClose={onClose} />
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
