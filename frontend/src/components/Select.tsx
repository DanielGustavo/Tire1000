import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

export function Select({
  label,
  placeholder = "Selecione um valor",
  options,
  value,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className="flex w-full flex-col items-start gap-0.5">
      {label && <span className="text-default font-bold text-neutral-900">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between border-2 border-solid border-neutral-900 bg-neutral-0 px-4 shadow-hard"
      >
        <span className={`text-default ${selected ? "text-neutral-900" : "text-neutral-300"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={24} className="shrink-0 text-neutral-900" />
      </button>
      {open && (
        <div className="w-full border-2 border-solid border-neutral-900 bg-neutral-0 shadow-hard">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className="w-full p-2 text-left text-default text-neutral-900 hover:bg-neutral-30"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
