import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../libs/axios";
import { setAccessToken } from "../../../libs/auth";
import { authService } from "../../../services/auth-service";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Modal } from "../../../components/Modal";
import { AuthDivider } from "./AuthDivider";

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
