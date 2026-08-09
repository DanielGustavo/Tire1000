import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { applyFieldErrors, type ApiFieldErrors } from "../../../libs/axios";
import { setTokens } from "../../../libs/auth";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth-service";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Modal } from "../../../components/Modal";
import { AuthDivider } from "./AuthDivider";

export function SignInModal({ onClose, onSwitchToSignUp }: { onClose: () => void; onSwitchToSignUp: () => void }) {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const loginMutation = useMutation({
    mutationFn: () => authService.login({ email, password }),
    onSuccess: async (tokens) => {
      setTokens(tokens);
      await refetch();
      navigate("/");
    },
    onError: (error) => {
      const { fieldErrors, toastMessage } = applyFieldErrors(error, "Email ou senha inválidos.");
      setFieldErrors(fieldErrors);
      if (toastMessage) toast.error(toastMessage);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate();
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-8">
        <h1 className="w-full text-center text-title font-extrabold text-neutral-900">Acesso à Sua Conta</h1>
        <div className="flex w-full flex-col gap-4">
          <Field
            id="login-email"
            label="Email"
            type="email"
            placeholder="Insira seu e-mail"
            required
            autoComplete="email"
            value={email}
            errors={fieldErrors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="login-password"
            label="Senha"
            type="password"
            placeholder="Insira sua senha"
            required
            autoComplete="current-password"
            value={password}
            errors={fieldErrors.password}
            onChange={(event) => setPassword(event.target.value)}
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
