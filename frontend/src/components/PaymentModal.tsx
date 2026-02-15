import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, CheckCircle, XCircle, Clock, ExternalLink, Smartphone } from 'lucide-react';
import {
  createPayment,
  checkPaymentStatus,
  cancelPayment,
  Payment,
  PaymentServiceType,
  ServiceAgreementAcceptance,
  formatMNT,
  getPaymentStatusColor,
  getPaymentStatusText,
  getServiceTypeName,
} from '@/api/payments';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payment: Payment) => void;
  onPaymentSuccess?: (payment: Payment) => void; // Alias for onSuccess
  serviceType: PaymentServiceType;
  amount?: number;
  description?: string;
  applicationId?: string;
  agreement?: ServiceAgreementAcceptance;
}

type ModalStep = 'loading' | 'payment' | 'checking' | 'success' | 'failed' | 'cancelled';

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
  // Use onPaymentSuccess as alias for onSuccess
  const handleSuccess = onPaymentSuccess || onSuccess;
  const [step, setStep] = useState<ModalStep>('loading');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Create payment on modal open
  useEffect(() => {
    if (isOpen && !payment) {
      initializePayment();
    }
  }, [isOpen]);

  // Auto-check payment status every 5 seconds while on payment step
  useEffect(() => {
    if (step !== 'payment' || !payment) return;

    const interval = setInterval(() => {
      handleCheckStatus(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [step, payment]);

  const initializePayment = async () => {
    setStep('loading');
    setError(null);

    try {
      const response = await createPayment({
        serviceType,
        amount,
        description,
        applicationId,
        agreement,
      });

      if (response.success && response.data) {
        setPayment(response.data);
        setStep('payment');
      } else {
        throw new Error(response.error || 'Failed to create payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
      setStep('failed');
    }
  };

  const handleCheckStatus = useCallback(async (silent = false) => {
    if (!payment || checkingStatus) return;

    if (!silent) {
      setCheckingStatus(true);
    }

    try {
      const response = await checkPaymentStatus(payment.id);

      if (response.success && response.data) {
        if (response.data.status === 'PAID') {
          setPayment({ ...payment, status: 'PAID' });
          setStep('success');
          handleSuccess?.({ ...payment, status: 'PAID' });
        } else if (response.data.status === 'FAILED') {
          setStep('failed');
        }
      }
    } catch (err) {
      console.error('Failed to check payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  }, [payment, checkingStatus, onSuccess]);

  const handleCancel = async () => {
    if (!payment) return;

    try {
      await cancelPayment(payment.id);
      setStep('cancelled');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel payment');
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setPayment(null);
    setStep('loading');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={step === 'success' || step === 'cancelled' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {step === 'success' ? 'Payment Successful' :
             step === 'failed' ? 'Payment Failed' :
             step === 'cancelled' ? 'Payment Cancelled' :
             'Complete Payment'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {step === 'loading' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Creating payment...</p>
            </div>
          )}

          {/* Payment QR Code */}
          {step === 'payment' && payment && (
            <div className="space-y-6">
              {/* Service Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{getServiceTypeName(payment.serviceType as PaymentServiceType)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-xl font-bold text-primary">{formatMNT(payment.amount)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono text-sm">{payment.invoiceNo}</span>
                </div>
              </div>

              {/* QR Code */}
              {payment.qrImage && (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Scan with your banking app to pay
                  </p>
                  <div className="bg-white p-4 rounded-xl shadow-inner">
                    <img
                      src={`data:image/png;base64,${payment.qrImage}`}
                      alt="Payment QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Bank App Links */}
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-xs text-center line-clamp-1">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Check */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Waiting for payment...</span>
                {checkingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleCheckStatus(false)}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'I\'ve Paid'
                  )}
                </Button>
              </div>

              {/* Short URL fallback */}
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
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground text-center mb-6">
                Your payment of {payment && formatMNT(payment.amount)} has been received.
              </p>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {/* Failed State */}
          {step === 'failed' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
              <p className="text-muted-foreground text-center mb-6">
                {error || 'Something went wrong with your payment. Please try again.'}
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={initializePayment} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {step === 'cancelled' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Cancelled</h3>
              <p className="text-muted-foreground text-center mb-6">
                Your payment has been cancelled.
              </p>
              <Button onClick={handleClose} className="w-full">
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
