import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { setTokens } from "../../../libs/auth";
import { authService } from "../../../services/auth-service";

export function useSignUpWizard(onClose: () => void) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "credits">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMismatch, setPasswordsMismatch] = useState(false);

  const signUpMutation = useMutation({
    mutationFn: (creditsQty?: number) => authService.signUp({ name, email, password, creditsQty }),
    onSuccess: ({ tokens, checkoutUrl }) => {
      setTokens(tokens);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      navigate("/");
    },
  });

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordsMismatch(true);
      return;
    }
    setPasswordsMismatch(false);
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
    handleFormSubmit,
    signUpMutation,
    onClose,
  };
}
