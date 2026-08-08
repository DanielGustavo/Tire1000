import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { essayService } from "../../services/essay-service";

const MAX_PHOTO_SIZE_IN_BYTES = 10 * 1024 * 1024;

export type EssayUploadMode = "camera" | "upload";
type Step = "tips" | "permission-revoked" | "permission-accepted" | "confirmation";

async function checkCameraPermission(): Promise<"granted" | "denied" | "unknown"> {
  if (!navigator.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({ name: "camera" });
    return status.state === "granted" || status.state === "denied" ? status.state : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Used only to force the browser's permission prompt and read the outcome — the stream itself is
 * discarded immediately. Actual capture always goes through the native `<input capture>` picker.
 * Any rejection (denied, no hardware, etc.) is treated as "revoked" — the modal only ever offers
 * the "check your browser settings" message, so hardware-absence isn't distinguished from denial.
 */
async function requestCameraPermissionGate(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function useEssayUploadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const themeId = searchParams.get("themeId") ?? "";
  const mode: EssayUploadMode = searchParams.get("mode") === "camera" ? "camera" : "upload";

  const [step, setStep] = useState<Step>("tips");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoSizeError, setPhotoSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { essayId, upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo!);
      return essayId;
    },
    onSuccess: () => navigate("/"),
  });

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleOpenCamera() {
    const permission = await checkCameraPermission();
    if (permission === "granted") {
      handleOpenFilePicker();
      return;
    }
    if (permission === "denied") {
      setStep("permission-revoked");
      return;
    }
    const granted = await requestCameraPermissionGate();
    setStep(granted ? "permission-accepted" : "permission-revoked");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_PHOTO_SIZE_IN_BYTES) {
      setPhotoSizeError("A foto deve ter no máximo 10MB.");
      return;
    }
    setPhotoSizeError(null);
    setPhoto(file);
    setStep("confirmation");
  }

  function handleClose() {
    navigate(themeId ? `/themes/${themeId}` : "/themes");
  }

  function handleGoHome() {
    navigate("/");
  }

  return {
    mode,
    step,
    photoUrl,
    photoSizeError,
    fileInputRef,
    uploadMutation,
    handleOpenCamera,
    handleOpenFilePicker,
    handleFileChange,
    handleClose,
    handleGoHome,
    handleSubmit: () => uploadMutation.mutate(),
  };
}
