import "server-only";

export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface CustomerInput {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  address?: {
    zipcode: string;
    number: string;
    street?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
  };
}

export interface CardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments?: number;
}

export interface CheckoutInput {
  paymentId: string;
  courseId: string;
  courseTitle: string;
  amountInCents: number;
  customer: CustomerInput;
  method: PaymentMethod;
  card?: CardInput;
  remoteIp?: string;
}

export interface CheckoutResult {
  ok: boolean;
  transactionId?: string;
  status: PaymentStatus;
  pix?: {
    qrCode: string;
    qrCodeImage: string;
    expiresAt: Date;
  };
  boleto?: {
    barcode: string;
    pdfUrl: string;
    dueDate: Date;
  };
  errorMessage?: string;
}

export interface PaymentStatusResult {
  status: PaymentStatus;
  paidAt?: Date;
  failedAt?: Date;
}

export interface WebhookEvent {
  transactionId: string;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface PaymentGateway {
  name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;
  validateWebhook?(headers: Record<string, string>, body: unknown): WebhookEvent | null;
}