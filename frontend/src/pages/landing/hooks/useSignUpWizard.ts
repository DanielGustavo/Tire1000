import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { applyFieldErrors, type ApiFieldErrors } from "../../../libs/axios";
import { setTokens } from "../../../libs/auth";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth-service";
import { signUpSchema, type SignUpFormValues } from "../components/signup-schema";

export function useSignUpWizard() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [step, setStep] = useState<"form" | "credits">("form");
  const [serverFieldErrors, setServerFieldErrors] = useState<ApiFieldErrors>({});

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signUpMutation = useMutation({
    mutationFn: (creditsQty?: number) => {
      const { name, email, password } = form.getValues();
      return authService.signUp({ name, email, password, creditsQty });
    },
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
      // where name/email/password already live independently of `step` (react-hook-form keeps
      // unmounted field values by default).
      const { fieldErrors, toastMessage } = applyFieldErrors(
        error,
        "Não foi possível criar a conta. Tente novamente.",
      );
      setServerFieldErrors(fieldErrors);
      setStep("form");
      if (toastMessage) toast.error(toastMessage);
    },
  });

  const handleFormSubmit = form.handleSubmit(() => {
    setServerFieldErrors({});
    setStep("credits");
  });

  return {
    step,
    form,
    serverFieldErrors,
    handleFormSubmit,
    signUpMutation,
  };
}
