import { useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { applyFieldErrors } from "../libs/axios";
import { useAuth } from "../contexts/AuthContext";
import { creditsService } from "../services/credits-service";
import { Button } from "../components/Button";

const PRESET_CREDITS_QTY = [5, 10, 20];

interface CreditsPageLocationState {
  initialCheckoutUrl?: string | null;
}

export function CreditsPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [creditsQty, setCreditsQty] = useState(PRESET_CREDITS_QTY[0]);

  const initialCheckoutUrl = (location.state as CreditsPageLocationState | null)?.initialCheckoutUrl ?? null;
  const checkoutStatus = searchParams.get("checkout");

  const { user, isLoading } = useAuth();

  const checkoutMutation = useMutation({
    mutationFn: (qty: number) => creditsService.requestCheckout(qty),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: (error) => {
      const { toastMessage } = applyFieldErrors(error, "Não foi possível iniciar o checkout. Tente novamente.");
      if (toastMessage) toast.error(toastMessage);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkoutMutation.mutate(creditsQty);
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Créditos</h1>

      {checkoutStatus === "success" && (
        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Pagamento confirmado! Seu saldo é atualizado assim que o Stripe confirma o pagamento — pode levar alguns
          instantes.
        </p>
      )}
      {checkoutStatus === "cancel" && (
        <p className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          Pagamento cancelado. Você pode tentar novamente quando quiser.
        </p>
      )}

      <p className="mt-4 text-sm text-gray-600">Seu saldo atual</p>
      <p className="text-3xl font-semibold text-gray-900">
        {isLoading ? "..." : `${user?.credits} créditos`}
      </p>

      {initialCheckoutUrl && (
        <div className="mt-6 rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-700">Finalize a compra inicial de créditos para começar a enviar redações.</p>
          <a href={initialCheckoutUrl} className="mt-2 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
            Finalizar compra inicial
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        <div>
          <label htmlFor="creditsQty" className="block text-sm font-medium text-gray-700">
            Quantidade de créditos
          </label>
          <select
            id="creditsQty"
            value={creditsQty}
            onChange={(event) => setCreditsQty(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {PRESET_CREDITS_QTY.map((qty) => (
              <option key={qty} value={qty}>
                {qty} créditos
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="dark" size="small" className="w-full" loading={checkoutMutation.isPending}>
          Comprar créditos
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/" className="font-medium text-gray-900 underline">
          Voltar
        </Link>
      </p>
    </main>
  );
}
