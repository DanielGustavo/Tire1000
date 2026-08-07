import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { NotepadText } from "lucide-react";
import { getApiErrorMessage } from "../libs/axios";
import { setAccessToken } from "../libs/auth";
import { authService } from "../services/auth-service";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";

function AuthDivider() {
  return <div className="h-0 w-full border-t-2 border-dashed border-neutral-900" />;
}

export function SignInModal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authService.login({ email, password }),
    onSuccess: (tokens) => {
      setAccessToken(tokens.accessToken);
      navigate("/");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate();
  }

  return (
    <Modal onClose={() => navigate("/")}>
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
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          {loginMutation.isError && (
            <p className="text-small text-error-300">
              {getApiErrorMessage(loginMutation.error, "Email ou senha inválidos.")}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Entrando..." : "Acessar conta"}
          </Button>
        </div>
      </form>
      <AuthDivider />
      <p className="text-center text-default text-neutral-900">
        Ainda não tem uma conta?{" "}
        <Link to="/signup" className="font-bold text-primary-300">
          Criar conta
        </Link>
      </p>
    </Modal>
  );
}

const CREDIT_OPTIONS = [1, 2, 3];

function CreditsStep({
  pending,
  error,
  onSelect,
  onSkip,
}: {
  pending: boolean;
  error: string | null;
  onSelect: (creditsQty: number) => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="w-full text-title font-extrabold text-neutral-900">
        Selecione a quantidade de créditos para iniciar
      </h1>
      <div className="flex w-full flex-col gap-6">
        {CREDIT_OPTIONS.map((qty) => (
          <div key={qty} className="flex w-full flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-neutral-900" aria-hidden="true">
              {Array.from({ length: qty }, (_, index) => (
                <NotepadText key={index} size={24} />
              ))}
            </div>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={pending}
              onClick={() => onSelect(qty)}
            >
              {`Iniciar com ${qty} crédito${qty > 1 ? "s" : ""}`}
            </Button>
          </div>
        ))}
      </div>
      {error && <p className="text-small text-error-300">{error}</p>}
      <button
        type="button"
        onClick={onSkip}
        disabled={pending}
        className="text-default text-neutral-300 underline disabled:opacity-50"
      >
        Continuar sem comprar créditos agora
      </button>
    </div>
  );
}

export function SignUpModal() {
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
      setAccessToken(tokens.accessToken);
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

  if (step === "credits") {
    return (
      <Modal onClose={() => navigate("/")}>
        <CreditsStep
          pending={signUpMutation.isPending}
          error={
            signUpMutation.isError
              ? getApiErrorMessage(signUpMutation.error, "Não foi possível criar a conta. Tente novamente.")
              : null
          }
          onSelect={(creditsQty) => signUpMutation.mutate(creditsQty)}
          onSkip={() => signUpMutation.mutate(undefined)}
        />
      </Modal>
    );
  }

  return (
    <Modal onClose={() => navigate("/")}>
      <form onSubmit={handleFormSubmit} className="flex w-full flex-col items-center gap-8">
        <h1 className="w-full text-center text-title font-extrabold text-neutral-900">Crie Sua Conta</h1>
        <div className="flex w-full flex-col gap-4">
          <Field
            id="signup-name"
            label="Nome"
            type="text"
            placeholder="Insira seu nome"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Field
            id="signup-email"
            label="Email"
            type="email"
            placeholder="Insira seu e-mail"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="signup-password"
            label="Senha"
            type="password"
            placeholder="Insira sua senha"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Field
            id="signup-confirm-password"
            label="Confirmação de senha"
            type="password"
            placeholder="Confirme a sua senha"
            required
            autoComplete="new-password"
            value={confirmPassword}
            errors={passwordsMismatch ? ["As senhas não coincidem"] : []}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Cadastrar conta
        </Button>
      </form>
      <AuthDivider />
      <p className="text-center text-default text-neutral-900">
        Já tenho uma conta?{" "}
        <Link to="/login" className="font-bold text-primary-300">
          Acessar conta
        </Link>
      </p>
    </Modal>
  );
}
