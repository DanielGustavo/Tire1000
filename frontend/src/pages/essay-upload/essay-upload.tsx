import { CameraPermissionModal } from "./components/CameraPermissionModal";
import { PhotoConfirmationErrorModal } from "./components/PhotoConfirmationErrorModal";
import { PhotoConfirmationLoadingModal } from "./components/PhotoConfirmationLoadingModal";
import { PhotoConfirmationModal } from "./components/PhotoConfirmationModal";
import { TipsModal } from "./components/TipsModal";
import { useEssayUploadPage } from "./useEssayUploadPage";

export function EssayUploadPage() {
  const {
    mode,
    step,
    photoUrl,
    photoSizeError,
    fileInputRef,
    submitMutation,
    handleOpenCamera,
    handleOpenFilePicker,
    handleFileChange,
    handleClose,
    handleGoHome,
    handleSubmit,
  } = useEssayUploadPage();

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

      {submitMutation.isError && <PhotoConfirmationErrorModal onClose={handleGoHome} />}

      {showStep && step === "tips" && (
        <TipsModal
          mode={mode}
          error={photoSizeError}
          onAction={mode === "camera" ? handleOpenCamera : handleOpenFilePicker}
          onClose={handleClose}
        />
      )}

      {showStep && step === "permission-revoked" && (
        <CameraPermissionModal state="revoked" error={photoSizeError} onRetry={handleOpenCamera} onClose={handleClose} />
      )}

      {showStep && step === "permission-accepted" && (
        <CameraPermissionModal state="accepted" error={photoSizeError} onContinue={handleOpenFilePicker} onClose={handleClose} />
      )}

      {showStep && step === "confirmation" && photoUrl && (
        <PhotoConfirmationModal
          mode={mode}
          photoUrl={photoUrl}
          error={photoSizeError}
          onRetake={handleOpenFilePicker}
          onConfirm={handleSubmit}
          onClose={handleClose}
        />
      )}
    </>
  );
}
