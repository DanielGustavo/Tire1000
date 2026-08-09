import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Modal } from "../../../components/Modal";
import { fieldErrorMessages } from "../../../libs/form-errors";
import { AuthDivider } from "./AuthDivider";
import { CreditsStep } from "./CreditsStep";
import { useSignUpWizard } from "../hooks/useSignUpWizard";
import type { SignUpFormValues } from "./signup-schema";

export function SignUpModal({ onClose, onSwitchToSignIn }: { onClose: () => void; onSwitchToSignIn: () => void }) {
  const { step, form, serverFieldErrors, handleFormSubmit, signUpMutation } = useSignUpWizard();
  const {
    register,
    formState: { errors },
  } = form;

  function fieldErrors(name: keyof SignUpFormValues): string[] {
    const clientMessages = fieldErrorMessages(errors[name]);
    return clientMessages.length > 0 ? clientMessages : (serverFieldErrors[name] ?? []);
  }

  if (step === "credits") {
    return (
      <Modal onClose={onClose}>
        <CreditsStep
          pending={signUpMutation.isPending}
          onSelect={(creditsQty) => signUpMutation.mutate(creditsQty)}
          onSkip={() => signUpMutation.mutate(undefined)}
        />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleFormSubmit} noValidate className="flex w-full flex-col items-center gap-8">
        <h1 className="w-full text-center text-title font-extrabold text-neutral-900">Crie Sua Conta</h1>
        <div className="flex w-full flex-col gap-4">
          <Field
            id="signup-name"
            label="Nome"
            type="text"
            placeholder="Insira seu nome"
            autoComplete="name"
            errors={fieldErrors("name")}
            {...register("name")}
          />
          <Field
            id="signup-email"
            label="Email"
            type="email"
            placeholder="Insira seu e-mail"
            autoComplete="email"
            errors={fieldErrors("email")}
            {...register("email")}
          />
          <Field
            id="signup-password"
            label="Senha"
            type="password"
            placeholder="Insira sua senha"
            autoComplete="new-password"
            errors={fieldErrors("password")}
            {...register("password")}
          />
          <Field
            id="signup-confirm-password"
            label="Confirmação de senha"
            type="password"
            placeholder="Confirme a sua senha"
            autoComplete="new-password"
            errors={fieldErrors("confirmPassword")}
            {...register("confirmPassword")}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Cadastrar conta
        </Button>
      </form>
      <AuthDivider />
      <p className="text-center text-default text-neutral-900">
        Já tenho uma conta?{" "}
        <button type="button" onClick={onSwitchToSignIn} className="font-bold text-primary-300">
          Acessar conta
        </button>
      </p>
    </Modal>
  );
}
