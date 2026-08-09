import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";

const MAX_PHOTO_SIZE_IN_BYTES = 10 * 1024 * 1024;

export type EssayUploadMode = "camera" | "upload";
export type EssayCaptureStep = "tips" | "permission-revoked" | "permission-accepted" | "confirmation";

// Firefox and Safari don't support querying "camera" via the Permissions API (the query throws) — on those
// browsers we can't read the current state ahead of time, so we remember the outcome of our own past grants
// instead. Without this, "accepted" would show on every single visit rather than only the first one.
const CAMERA_PERMISSION_GRANTED_STORAGE_KEY = "essayUpload:cameraPermissionGranted";

async function checkCameraPermission(): Promise<"granted" | "denied" | "unknown"> {
  if (navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: "camera" });
      if (status.state === "granted" || status.state === "denied") return status.state;
      return "unknown";
    } catch {
      // Permissions API doesn't support "camera" here — fall through to the remembered state below.
    }
  }
  return localStorage.getItem(CAMERA_PERMISSION_GRANTED_STORAGE_KEY) === "true" ? "granted" : "unknown";
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
    localStorage.setItem(CAMERA_PERMISSION_GRANTED_STORAGE_KEY, "true");
    return true;
  } catch {
    localStorage.removeItem(CAMERA_PERMISSION_GRANTED_STORAGE_KEY);
    return false;
  }
}

type UseEssayCaptureFlowOptions = {
  mode: EssayUploadMode;
  onSubmit: (photo: File) => Promise<void>;
  onSuccess: () => void;
};

/**
 * The step machine shared by every "take/pick a photo and submit it" flow — originally built for
 * uploading a brand new essay (ticket 06), reused since ticket 07 for resending one. Callers own what
 * "submit" and "success" mean (new essay vs. resend) and where the entry points/exits go.
 */
export function useEssayCaptureFlow({ mode, onSubmit, onSuccess }: UseEssayCaptureFlowOptions) {
  const [step, setStep] = useState<EssayCaptureStep>("tips");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoSizeError, setPhotoSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const submitMutation = useMutation({
    mutationFn: () => onSubmit(photo!),
    onSuccess,
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

  return {
    mode,
    step,
    photoUrl,
    photoSizeError,
    fileInputRef,
    submitMutation,
    handleOpenCamera,
    handleOpenFilePicker,
    handleFileChange,
    handleSubmit: () => submitMutation.mutate(),
  };
}
