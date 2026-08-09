import { Service } from "./service";

export interface RequestCreditsCheckoutResponse {
  checkoutUrl: string;
}

class CreditsService extends Service {
  async requestCheckout(creditsQty: number): Promise<RequestCreditsCheckoutResponse> {
    const { data } = await this.client.post<RequestCreditsCheckoutResponse>("/credits/checkout", { creditsQty });
    return data;
  }
}

export const creditsService = new CreditsService();
