import { useMutation } from "@tanstack/react-query";
import { authService, type SignUpInput } from "../../services/auth-service";

export function useSignUp() {
  const { mutate: signUp, mutateAsync: signUpAsync, ...rest } = useMutation({
    mutationFn: (input: SignUpInput) => authService.signUp(input),
  });

  return { signUp, signUpAsync, ...rest };
}
