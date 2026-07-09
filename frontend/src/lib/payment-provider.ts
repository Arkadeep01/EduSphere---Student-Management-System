export interface PaymentRequest {
  amount: number;
  studentId: string;
  studentName: string;
  month: string;
  academicSession: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionRef?: string;
  error?: string;
  redirectUrl?: string;
}

export interface IPaymentProvider {
  readonly name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  isAvailable(): boolean;
}

class MockPaymentProvider implements IPaymentProvider {
  readonly name = "Payment Gateway";

  async processPayment(_request: PaymentRequest): Promise<PaymentResponse> {
    return {
      success: false,
      error: "Payment Gateway Not Connected. Please contact the administrator to configure a payment provider.",
    };
  }

  isAvailable(): boolean {
    return false;
  }
}

let currentProvider: IPaymentProvider = new MockPaymentProvider();

export function getPaymentProvider(): IPaymentProvider {
  return currentProvider;
}

export function setPaymentProvider(provider: IPaymentProvider): void {
  currentProvider = provider;
}
