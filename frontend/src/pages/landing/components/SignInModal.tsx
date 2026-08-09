import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { applyFieldErrors, type ApiFieldErrors } from "../../../libs/axios";
import { setTokens } from "../../../libs/auth";
import { fieldErrorMessages } from "../../../libs/form-errors";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth-service";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Modal } from "../../../components/Modal";
import { AuthDivider } from "./AuthDivider";
import { loginSchema, type LoginFormValues } from "./login-schema";

export function SignInModal({ onClose, onSwitchToSignUp }: { onClose: () => void; onSwitchToSignUp: () => void }) {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [serverFieldErrors, setServerFieldErrors] = useState<ApiFieldErrors>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),
    onSuccess: async (tokens) => {
      setTokens(tokens);
      await refetch();
      navigate("/");
    },
    onError: (error) => {
      const { fieldErrors, toastMessage } = applyFieldErrors(error, "Email ou senha inválidos.");
      setServerFieldErrors(fieldErrors);
      if (toastMessage) toast.error(toastMessage);
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerFieldErrors({});
    loginMutation.mutate(values);
  });

  function fieldErrors(name: keyof LoginFormValues): string[] {
    const clientMessages = fieldErrorMessages(errors[name]);
    return clientMessages.length > 0 ? clientMessages : (serverFieldErrors[name] ?? []);
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex w-full flex-col items-center gap-8">
        <h1 className="w-full text-center text-title font-extrabold text-neutral-900">Acesso à Sua Conta</h1>
        <div className="flex w-full flex-col gap-4">
          <Field
            id="login-email"
            label="Email"
            type="email"
            placeholder="Insira seu e-mail"
            autoComplete="email"
            errors={fieldErrors("email")}
            {...register("email")}
          />
          <Field
            id="login-password"
            label="Senha"
            type="password"
            placeholder="Insira sua senha"
            autoComplete="current-password"
            errors={fieldErrors("password")}
            {...register("password")}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" loading={loginMutation.isPending}>
          Acessar conta
        </Button>
      </form>
      <AuthDivider />
      <p className="text-center text-default text-neutral-900">
        Ainda não tem uma conta?{" "}
        <button type="button" onClick={onSwitchToSignUp} className="font-bold text-primary-300">
          Criar conta
        </button>
      </p>
    </Modal>
  );
}
