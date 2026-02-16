import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Filter,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  adminGetPayments,
  adminGetPaymentSummary,
  adminRefundPayment,
  Payment,
  PaymentSummary,
  PaymentStatus,
  formatMNT,
  getPaymentStatusColor,
  getPaymentStatusText,
  getServiceTypeName,
  PaymentServiceType,
} from '@/api/payments';

const PaymentDashboard = () => {
  const [payments, setPayments] = useState<(Payment & { userId: string })[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [refunding, setRefunding] = useState(false);
  const currentPageTotal = payments.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, providerFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        adminGetPayments({
          page,
          limit: 20,
          status: statusFilter !== 'all' ? statusFilter as PaymentStatus : undefined,
          provider: providerFilter !== 'all' ? providerFilter as any : undefined,
        }),
        adminGetPaymentSummary(),
      ]);

      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data);
        if (paymentsRes.pagination) {
          setTotalPages(paymentsRes.pagination.totalPages);
        }
      }

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundPayment) return;

    setRefunding(true);
    try {
      await adminRefundPayment(refundPayment.id, {
        reason: refundReason,
        amount: refundAmount,
      });
      toast.success('Payment refunded successfully');
      setRefundModalOpen(false);
      setRefundPayment(null);
      setRefundReason('');
      setRefundAmount(undefined);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'REFUNDED':
        return <RefreshCw className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMNT(summary?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {summary?.successfulPayments || 0} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pendingPayments || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalTransactions
                ? Math.round((summary.successfulPayments / summary.totalTransactions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.failedPayments || 0} failed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Refunds
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatMNT(summary?.refundedAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total amount refunded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Service Type */}
      {summary?.byServiceType && Object.keys(summary.byServiceType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary.byServiceType).map(([service, data]) => (
                <div key={service} className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {getServiceTypeName(service as PaymentServiceType)}
                  </p>
                  <p className="text-xl font-bold">{formatMNT(data.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.count} transactions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                All payment transactions
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Provider Filter */}
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="QPAY">QPay</SelectItem>
                  <SelectItem value="KHAN_BANK">Khan Bank</SelectItem>
                  <SelectItem value="MONPAY">MonPay</SelectItem>
                  <SelectItem value="SOCIALPAY">SocialPay</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchData} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[980px]">
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Invoice</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payments found</p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium font-mono text-sm">{payment.invoiceNo}</TableCell>
                    <TableCell>
                      {getServiceTypeName(payment.serviceType as PaymentServiceType)}
                    </TableCell>
                    <TableCell className="font-semibold">{formatMNT(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(payment.status as PaymentStatus)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(payment.status as PaymentStatus)}
                          {getPaymentStatusText(payment.status as PaymentStatus)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.provider}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'PAID' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRefundPayment(payment);
                            setRefundAmount(payment.amount);
                            setRefundModalOpen(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {payments.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Current page total</TableCell>
                  <TableCell className="text-right font-semibold">{formatMNT(currentPageTotal)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t gap-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment for invoice {refundPayment?.invoiceNo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Original Amount</span>
                <span className="font-bold">{formatMNT(refundPayment?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span>
                  {refundPayment && getServiceTypeName(refundPayment.serviceType as PaymentServiceType)}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refundAmount">Refund Amount (MNT)</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundAmount || ''}
                onChange={(e) => setRefundAmount(parseInt(e.target.value) || undefined)}
                placeholder="Leave empty for full refund"
                max={refundPayment?.amount}
              />
              <p className="text-xs text-muted-foreground">
                Max: {formatMNT(refundPayment?.amount || 0)}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={refunding}>
              {refunding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentDashboard;
