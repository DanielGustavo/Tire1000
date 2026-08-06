import { User } from "../../../domain/entities/user.js";
import type { AuthGateway } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { PaymentGateway } from "../../../domain/contracts/gateways/payment-gateway.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { toAuthTokensDTO, type AuthTokensDTO } from "../../dtos/auth-tokens-dto.js";
import { toUserDTO, type UserDTO } from "../../dtos/user-dto.js";
import { createCheckoutForUser } from "../request-credits-checkout/create-checkout-for-user.js";

export interface SignUpUserDeps {
  authGateway: AuthGateway;
  userRepository: UserRepository;
  idGenerator: IdGenerator;
  checkoutRepository: CheckoutRepository;
  paymentGateway: PaymentGateway;
}

export interface SignUpUserInput {
  name: string;
  email: string;
  password: string;
  creditsQty?: number;
}

export interface SignUpUserOutput {
  user: UserDTO;
  tokens: AuthTokensDTO;
  checkoutUrl: string | null;
}

export function createSignUpUser({
  authGateway,
  userRepository,
  idGenerator,
  checkoutRepository,
  paymentGateway,
}: SignUpUserDeps) {
  return async function signUpUser({ name, email, password, creditsQty }: SignUpUserInput): Promise<SignUpUserOutput> {
    const id = await idGenerator.generate();
    const { externalId } = await authGateway.signUp({ id, name, email, password });

    const user = User.create({ id, externalId, email, name });
    try {
      await userRepository.create(user);
    } catch (error) {
      await authGateway.deleteUser({ email });
      throw error;
    }

    const tokens = await authGateway.login({ email, password });

    // The initial credits purchase is opt-in (ADR-0009): callers that don't ask for credits get
    // no checkout at all. When they do ask, the account already works without the purchase
    // completing, so a Stripe failure here must not fail signup — we just skip the checkout link.
    let checkoutUrl: string | null = null;
    if (creditsQty) {
      try {
        ({ checkoutUrl } = await createCheckoutForUser(
          { checkoutRepository, paymentGateway, idGenerator },
          { userId: user.id, creditsQty },
        ));
      } catch (error) {
        console.error("Failed to create the signup checkout session", error);
      }
    }

    return { user: toUserDTO(user), tokens: toAuthTokensDTO(tokens), checkoutUrl };
  };
}
