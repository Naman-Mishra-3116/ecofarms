interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  name?: string;
  description?: string;
  image?: string;
  callback_url?: string;
  handler?: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: any) => void): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
