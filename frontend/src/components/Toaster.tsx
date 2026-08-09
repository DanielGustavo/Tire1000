import { CircleCheck, CircleX, Loader } from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Toast container, mounted once near the app root (`App.tsx`). Renders `sonner`'s toasts fully
 * `unstyled` and re-skinned to match the app's hand-rolled design system instead of the library's
 * default look — square corners, hard-shadow border, same color tokens as `Button`/`Field`.
 * Call sites fire toasts with `import { toast } from "sonner"` directly; this component only owns
 * the container's visual theme.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      gap={12}
      icons={{
        success: <CircleCheck size={20} className="shrink-0 text-primary-300" />,
        error: <CircleX size={20} className="shrink-0 text-error-300" />,
        loading: <Loader size={20} className="shrink-0 animate-spin text-neutral-900" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full max-w-[377px] items-start gap-3 border-2 border-solid border-neutral-900 bg-neutral-0 px-4 py-3 shadow-hard text-default text-neutral-900",
          title: "font-bold leading-tight",
          description: "text-small text-neutral-300",
          closeButton:
            "!border-2 !border-solid !border-neutral-900 !bg-neutral-0 !text-neutral-900 !shadow-hard",
        },
      }}
    />
  );
}
