import { Loader } from "lucide-react";
import { Bullet } from "./Bullet";

type LoadingProps = {
  text?: string;
  /** Adds min-h-screen — for use outside AppLayout, where there's no surrounding flex context to fill. */
  fullScreen?: boolean;
};

export function Loading({ text, fullScreen }: LoadingProps) {
  return (
    <div
      className={`flex w-full flex-1 flex-col items-center justify-center gap-4 ${fullScreen ? "min-h-screen" : ""}`}
    >
      <Bullet variant="slot" color="var(--color-primary-300)" size="large" rotate="left">
        <Loader size={24} className="animate-spin text-neutral-900" />
      </Bullet>
      {text && <p className="text-default font-extrabold text-neutral-900">{text}</p>}
    </div>
  );
}
