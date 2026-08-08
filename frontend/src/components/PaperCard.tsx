import type { ReactNode } from "react";
import paperEdge from "../assets/paper-edge.svg";

type PaperCardProps = {
  className?: string;
  children: ReactNode;
};

/** A bordered card styled like ruled notebook paper — the scalloped edge peeking above it, horizontal rules behind its content. Used for the essay text and the final score in the Correção result. */
export function PaperCard({ className, children }: PaperCardProps) {
  return (
    <div className="relative w-full pt-[18px]">
      <div
        aria-hidden
        className="absolute inset-x-2 top-0 h-[18px] bg-repeat-x"
        style={{ backgroundImage: `url(${paperEdge})`, backgroundSize: "34px 18px" }}
      />
      <div
        className={`relative border-2 border-solid border-neutral-900 bg-neutral-0 bg-repeat-y p-4 shadow-hard ${className ?? ""}`}
        style={{
          backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 2px), var(--color-neutral-50) calc(100% - 2px))",
          backgroundSize: "100% 27px",
          backgroundPosition: "0 43px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
