import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Smartphone,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  cancelPayment,
  checkPaymentStatus,
  createPayment,
  formatMNT,
  getServiceTypeName,
  Payment,
  PaymentProvider,
  PaymentServiceType,
  ServiceAgreementAcceptance,
} from "@/api/payments";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

type ModalStep = "method" | "loading" | "payment" | "success" | "failed" | "cancelled";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payment: Payment) => void;
  onPaymentSuccess?: (payment: Payment) => void;
  serviceType: PaymentServiceType;
  amount?: number;
  description?: string;
  applicationId?: string;
  agreement?: ServiceAgreementAcceptance;
}

interface PaymentMethodOption {
  provider: PaymentProvider;
  title: string;
  description: string;
  highlight?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    provider: "KHAN_BANK",
    title: "Khan Bank Transfer",
    description: "Transfer directly to our business account",
    highlight: "Recommended",
    icon: Building2,
  },
  {
    provider: "CARD",
    title: "Card Payment",
    description: "Visa / Mastercard manual confirmation",
    icon: CreditCard,
  },
  {
    provider: "PAYPAL",
    title: "PayPal",
    description: "Pay and submit your transaction reference",
    icon: Wallet,
  },
  {
    provider: "WECHAT_PAY",
    title: "WeChat Pay",
    description: "Cross-border wallet payment",
    icon: Smartphone,
  },
  {
    provider: "ZHIFUBAO",
    title: "Zhifubao (Alipay)",
    description: "Alipay wallet payment",
    icon: Globe2,
  },
];

const COMING_SOON_METHODS = ["QPay", "MonPay", "DigiPay"];

const KHAN_BANK_DETAILS = {
  bankName: "Khan Bank",
  accountName: "VISAMN LLC",
  accountNumber: "MN58005005111289705",
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPaymentSuccess,
  serviceType,
  amount,
  description,
  applicationId,
  agreement,
}) => {
  const handleSuccess = onPaymentSuccess || onSuccess;

  const [step, setStep] = useState<ModalStep>("method");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("KHAN_BANK");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedMethod = useMemo(
    () => PAYMENT_METHODS.find((method) => method.provider === selectedProvider),
    [selectedProvider]
  );

  const resetState = useCallback(() => {
    setStep("method");
    setPayment(null);
    setError(null);
    setCheckingStatus(false);
    setSelectedProvider("KHAN_BANK");
    setCopiedField(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    setStep("method");
    setPayment(null);
    setError(null);
    setCheckingStatus(false);
    setCopiedField(null);
  }, [isOpen, resetState]);

  const initializePayment = async () => {
    setStep("loading");
    setError(null);

    try {
      const response = await createPayment({
        provider: selectedProvider,
        serviceType,
        amount,
        description,
        applicationId,
        agreement,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create payment");
      }

      setPayment(response.data);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "Failed to create payment");
      setStep("failed");
    }
  };

  const handleCheckStatus = useCallback(
    async (silent = false) => {
      if (!payment || checkingStatus) return;

      if (!silent) {
        setCheckingStatus(true);
      }

      try {
        const response = await checkPaymentStatus(payment.id);

        if (response.success && response.data) {
          if (response.data.status === "PAID") {
            const paidPayment = { ...payment, status: "PAID" as const };
            setPayment(paidPayment);
            setStep("success");
            handleSuccess?.(paidPayment);
          } else if (response.data.status === "FAILED") {
            setStep("failed");
          }
        }
      } catch (err) {
        console.error("Failed to check payment status:", err);
      } finally {
        setCheckingStatus(false);
      }
    },
    [checkingStatus, handleSuccess, payment]
  );

  useEffect(() => {
    const isQPay = payment?.provider === "QPAY";
    if (step !== "payment" || !payment || !isQPay) return;

    const interval = setInterval(() => {
      void handleCheckStatus(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [step, payment, handleCheckStatus]);

  const handleManualConfirm = () => {
    if (!payment) return;

    const processingPayment = { ...payment, status: "PROCESSING" as const };
    setPayment(processingPayment);
    setStep("success");
    handleSuccess?.(processingPayment);
  };

  const handleCancel = async () => {
    if (!payment) {
      setStep("cancelled");
      return;
    }

    try {
      await cancelPayment(payment.id);
      setStep("cancelled");
    } catch (err: any) {
      setError(err.message || "Failed to cancel payment");
    }
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 1600);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (!isOpen) return null;

  const isQPayPayment = payment?.provider === "QPAY";
  const modalTitle =
    step === "success"
      ? isQPayPayment
        ? "Payment Successful"
        : "Payment Submitted"
      : step === "failed"
      ? "Payment Failed"
      : step === "cancelled"
      ? "Payment Cancelled"
      : step === "method"
      ? "Choose Payment Method"
      : "Complete Payment";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={step === "success" || step === "cancelled" ? handleClose : undefined}
      />

      <div className="relative w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-primary/15">
          <h2 className="text-lg font-semibold">{modalTitle}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6">
          {step === "method" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{getServiceTypeName(serviceType)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-xl font-bold text-primary">{formatMNT(amount ?? 0)}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Select a payment method. You can continue now, and we will verify manual payments from admin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedProvider === method.provider;

                    return (
                      <button
                        key={method.provider}
                        type="button"
                        onClick={() => setSelectedProvider(method.provider)}
                        className={`group rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-background/90 hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold leading-tight">{method.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                            </div>
                          </div>
                          {method.highlight ? (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {method.highlight}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-primary/30 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Coming Soon Gateways
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMING_SOON_METHODS.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={initializePayment}>Continue</Button>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="py-10">
              <Item variant="muted" className="max-w-md mx-auto [--radius:1rem]">
                <ItemMedia>
                  <Spinner className="size-5" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
                </ItemContent>
                <ItemContent className="flex-none justify-end">
                  <span className="text-sm tabular-nums text-foreground">{formatMNT(amount ?? 0)}</span>
                </ItemContent>
              </Item>
            </div>
          )}

          {step === "payment" && payment && (
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service</p>
                    <p className="font-medium">{getServiceTypeName(payment.serviceType as PaymentServiceType)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold text-primary">{formatMNT(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice</p>
                    <p className="font-mono text-sm">{payment.invoiceNo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-medium">{selectedMethod?.title || payment.provider}</p>
                  </div>
                </div>
              </div>

              {isQPayPayment ? (
                <>
                  {payment.qrImage && (
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground mb-3">Scan with your banking app to pay</p>
                      <div className="bg-white p-4 rounded-xl shadow-inner">
                        <img
                          src={`data:image/png;base64,${payment.qrImage}`}
                          alt="Payment QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                  )}

                  {payment.deepLinks && payment.deepLinks.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Or open your banking app
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {payment.deepLinks.slice(0, 9).map((link, index) => (
                          <a
                            key={index}
                            href={link.link}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={link.logo}
                              alt={link.name}
                              className="w-10 h-10 rounded-lg mb-1"
                              onError={(event) => {
                                (event.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <span className="text-xs text-center line-clamp-1">{link.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Item variant="muted" className="[--radius:1rem]">
                    <ItemMedia>
                      {checkingStatus ? (
                        <Spinner className="size-4" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                      )}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
                    </ItemContent>
                    <ItemContent className="flex-none justify-end">
                      <span className="text-sm tabular-nums">{formatMNT(payment.amount)}</span>
                    </ItemContent>
                  </Item>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => void handleCheckStatus(false)}
                      disabled={checkingStatus}
                    >
                      {checkingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "I've Paid"
                      )}
                    </Button>
                  </div>

                  {payment.shortUrl && (
                    <div className="text-center">
                      <a
                        href={payment.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Open in QPay <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-primary/20 bg-background/90 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Khan Bank Account</p>
                        <p className="text-sm font-semibold mt-1">{KHAN_BANK_DETAILS.bankName}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Bank Transfer
                      </span>
                    </div>

                    <div className="grid gap-2">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">Amount to Send</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{formatMNT(payment.amount)}</p>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard("amount", String(payment.amount))}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-primary/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === "amount" ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">Transfer Reference (Invoice)</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-mono">{payment.invoiceNo}</p>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard("invoice", payment.invoiceNo)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-primary/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === "invoice" ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">Account Name</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{KHAN_BANK_DETAILS.accountName}</p>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard("name", KHAN_BANK_DETAILS.accountName)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-primary/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === "name" ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">Account Number</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-mono font-semibold tracking-wide">
                            {KHAN_BANK_DETAILS.accountNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard("account", KHAN_BANK_DETAILS.accountNumber)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-primary/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === "account" ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Item variant="muted" className="[--radius:1rem]">
                    <ItemMedia>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="line-clamp-1">
                        Manual payment mode enabled ({selectedMethod?.title})
                      </ItemTitle>
                    </ItemContent>
                  </Item>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleManualConfirm}>
                      I Completed Payment
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isQPayPayment ? "Payment Successful!" : "Payment Recorded"}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {isQPayPayment
                  ? `Your payment of ${payment && formatMNT(payment.amount)} has been received.`
                  : "Your payment confirmation is saved. Your application will proceed now and our team will verify the transfer."}
              </p>
              <Button onClick={handleClose} className="w-full max-w-xs">
                Continue
              </Button>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
              <p className="text-muted-foreground text-center mb-6">
                {error || "Something went wrong with your payment. Please try again."}
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setError(null);
                    setStep("method");
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {step === "cancelled" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Cancelled</h3>
              <p className="text-muted-foreground text-center mb-6">Your payment has been cancelled.</p>
              <Button onClick={handleClose} className="w-full max-w-xs">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
