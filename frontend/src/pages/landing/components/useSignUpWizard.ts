import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { applyFieldErrors, type ApiFieldErrors } from "../../../libs/axios";
import { setTokens } from "../../../libs/auth";
import { validatePassword } from "../../../libs/password";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth-service";

export function useSignUpWizard(onClose: () => void) {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [step, setStep] = useState<"form" | "credits">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMismatch, setPasswordsMismatch] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const signUpMutation = useMutation({
    mutationFn: (creditsQty?: number) => authService.signUp({ name, email, password, creditsQty }),
    onSuccess: async ({ tokens, checkoutUrl }) => {
      setTokens(tokens);
      await refetch();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      navigate("/");
    },
    onError: (error) => {
      // Sending the user to the credits step calls this mutation directly (there's no form to
      // resubmit) — an error here has nowhere to be fixed unless we send them back to "form",
      // where name/email/password already live independently of `step`.
      const { fieldErrors, toastMessage } = applyFieldErrors(
        error,
        "Não foi possível criar a conta. Tente novamente.",
      );
      setFieldErrors(fieldErrors);
      setStep("form");
      if (toastMessage) toast.error(toastMessage);
    },
  });

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPasswordErrors = validatePassword(password);
    setPasswordErrors(nextPasswordErrors);
    setPasswordsMismatch(password !== confirmPassword);
    if (nextPasswordErrors.length > 0 || password !== confirmPassword) return;
    setFieldErrors({});
    setStep("credits");
  }

  return {
    step,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordsMismatch,
    passwordErrors,
    fieldErrors,
    handleFormSubmit,
    signUpMutation,
    onClose,
  };
}
