import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Select({
  label,
  placeholder = "Selecione um valor",
  options,
  value,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [listboxRect, setListboxRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const pinnedOption = options[0];
  const matches = useMemo(() => {
    const normalizedSearch = normalize(search);
    return options.slice(1).filter((option) => normalize(option.label).includes(normalizedSearch));
  }, [options, search]);
  const filteredOptions = useMemo(
    () => (pinnedOption ? [pinnedOption, ...matches] : matches),
    [pinnedOption, matches],
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listboxRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    function updateRect() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setListboxRect({ top: rect.bottom, left: rect.left, width: rect.width });
    }

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setHighlightedValue(filteredOptions[0]?.value ?? null);
  }, [filteredOptions]);

  const selected = options.find((option) => option.value === value);

  function close() {
    setOpen(false);
    setSearch("");
  }

  function selectOption(option: SelectOption) {
    onChange?.(option.value);
    close();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (filteredOptions.length === 0) return;

    const currentIndex = filteredOptions.findIndex((option) => option.value === highlightedValue);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % filteredOptions.length;
      setHighlightedValue(filteredOptions[nextIndex].value);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const previousIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
      setHighlightedValue(filteredOptions[previousIndex].value);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const highlighted = filteredOptions.find((option) => option.value === highlightedValue);
      if (highlighted) selectOption(highlighted);
    }
  }

  return (
    <div ref={rootRef} className="relative flex w-full flex-col items-start gap-0.5">
      {label && <span className="text-default font-bold text-neutral-900">{label}</span>}
      {open ? (
        <div className="flex h-12 w-full items-center justify-between border-2 border-solid border-neutral-900 bg-neutral-0 px-4 shadow-hard">
          <input
            ref={searchInputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={highlightedValue ? `${listboxId}-${highlightedValue}` : undefined}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar..."
            className="w-full text-default text-neutral-900 outline-none placeholder:text-neutral-300"
          />
          <ChevronDown size={24} className="shrink-0 text-neutral-900" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-12 w-full items-center justify-between border-2 border-solid border-neutral-900 bg-neutral-0 px-4 shadow-hard"
        >
          <span className={`text-default ${selected ? "text-neutral-900" : "text-neutral-300"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={24} className="shrink-0 text-neutral-900" />
        </button>
      )}
      {open &&
        listboxRect &&
        createPortal(
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            style={{ top: listboxRect.top, left: listboxRect.left, width: listboxRect.width }}
            className="fixed z-[60] mt-1 max-h-60 overflow-y-auto border-2 border-solid border-neutral-900 bg-neutral-0 shadow-hard"
          >
            {matches.length === 0 && (
              <p className="p-2 text-default text-neutral-300">Nenhum resultado encontrado</p>
            )}
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                id={`${listboxId}-${option.value}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseEnter={() => setHighlightedValue(option.value)}
                onClick={() => selectOption(option)}
                className={`w-full p-2 text-left text-default text-neutral-900 ${
                  option.value === highlightedValue ? "bg-neutral-30" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
