import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../libs/axios";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Modal } from "../../../components/Modal";
import { AuthDivider } from "./AuthDivider";
import { CreditsStep } from "./CreditsStep";
import { useSignUpWizard } from "./useSignUpWizard";

export function SignUpModal() {
  const {
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
  } = useSignUpWizard();

  if (step === "credits") {
    return (
      <Modal onClose={onClose}>
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
    <Modal onClose={onClose}>
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
