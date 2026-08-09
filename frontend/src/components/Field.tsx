import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { CircleCheck, CircleX, Eye, EyeClosed } from "lucide-react";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label?: string;
  errors?: string[];
  success?: string[];
};

export function Field({
  label,
  errors = [],
  success = [],
  type = "text",
  id,
  disabled,
  ...props
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const hasError = errors.length > 0;
  const hasSuccess = !hasError && success.length > 0;

  const labelColor = hasError
    ? "text-error-300"
    : hasSuccess
      ? "text-primary-300"
      : "text-neutral-900";
  const borderColor = hasError
    ? "border-error-300"
    : hasSuccess
      ? "border-primary-300"
      : "border-neutral-900";
  const focusOutlineColor = hasError
    ? "focus-within:outline-error-300"
    : hasSuccess
      ? "focus-within:outline-primary-300"
      : "focus-within:outline-neutral-900";

  return (
    <div className="flex w-full flex-col items-start gap-0.5">
      {label && (
        <label htmlFor={id} className={`text-default font-bold ${labelColor}`}>
          {label}
        </label>
      )}
      <div
        className={`flex h-12 w-full items-center justify-between border-2 border-solid bg-neutral-0 px-4 shadow-hard transition-shadow duration-100 ${borderColor} ${
          disabled
            ? "opacity-50 shadow-none"
            : `hover:shadow-[3px_3px_0px_0px_#1e1e1e] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 ${focusOutlineColor}`
        }`}
      >
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
          className="w-full text-default text-neutral-900 outline-none placeholder:text-neutral-300 disabled:cursor-not-allowed"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="shrink-0 text-neutral-900"
          >
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </button>
        )}
      </div>
      {(errors.length > 0 || success.length > 0) && (
        <div className="flex w-full flex-col items-start">
          {[
            ...errors.map((message) => ({ message, Icon: CircleX, color: "text-error-300" })),
            ...success.map((message) => ({ message, Icon: CircleCheck, color: "text-primary-300" })),
          ].map(({ message, Icon, color }) => (
            <p key={message} className={`flex items-center gap-1 pl-2 pt-1 text-small ${color}`}>
              <Icon size={12} className="shrink-0" />
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
