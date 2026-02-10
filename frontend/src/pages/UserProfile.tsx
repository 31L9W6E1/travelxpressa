import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  ChevronRight,
  Edit3,
  Eye,
  Download,
  Shield,
  Loader2,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Application {
  id: string;
  visaType: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  personalInfo?: string;
  contactInfo?: string;
  passportInfo?: string;
  travelInfo?: string;
}

const UserProfile = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/applications");
      const apps = response.data.data || [];
      setApplications(apps);
      if (apps.length > 0) {
        setActiveApplication(apps[0]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: t('userProfile.status.submitted', 'Submitted'),
          color: "text-foreground",
          bgColor: "bg-secondary",
          borderColor: "border-border",
          icon: CheckCircle
        };
      case "UNDER_REVIEW":
        return {
          label: t('userProfile.status.underReview', 'Under Review'),
          color: "text-foreground",
          bgColor: "bg-secondary",
          borderColor: "border-border",
          icon: Clock
        };
      case "PAYMENT_PENDING":
        return {
          label: t('userProfile.status.paymentPending', 'Payment Pending'),
          color: "text-foreground",
          bgColor: "bg-secondary",
          borderColor: "border-border",
          icon: CreditCard
        };
      case "APPROVED":
        return {
          label: t('userProfile.status.approved', 'Approved'),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          borderColor: "border-green-200 dark:border-green-800",
          icon: CheckCircle
        };
      case "REJECTED":
        return {
          label: t('userProfile.status.rejected', 'Rejected'),
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          borderColor: "border-red-200 dark:border-red-800",
          icon: AlertCircle
        };
      case "DRAFT":
      case "IN_PROGRESS":
      default:
        return {
          label: status === "DRAFT"
            ? t('userProfile.status.draft', 'Draft')
            : t('userProfile.status.inProgress', 'In Progress'),
          color: "text-muted-foreground",
          bgColor: "bg-secondary/50",
          borderColor: "border-border",
          icon: Edit3
        };
    }
  };

  const statusTimeline = [
    { step: 1, label: t('userProfile.timeline.applicationStarted', 'Application Started'), completed: true },
    { step: 2, label: t('userProfile.timeline.formCompleted', 'Form Completed'), completed: activeApplication?.status !== "DRAFT" && activeApplication?.status !== "IN_PROGRESS" },
    { step: 3, label: t('userProfile.timeline.submitted', 'Submitted'), completed: ["SUBMITTED", "PAYMENT_PENDING", "UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
    { step: 4, label: t('userProfile.timeline.paymentReceived', 'Payment Received'), completed: ["UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
    { step: 5, label: t('userProfile.timeline.underReview', 'Under Review'), completed: ["UNDER_REVIEW", "APPROVED"].includes(activeApplication?.status || "") },
    { step: 6, label: t('userProfile.timeline.decisionMade', 'Decision Made'), completed: activeApplication?.status === "APPROVED" || activeApplication?.status === "REJECTED" },
  ];

  const paymentMethods = [
    {
      id: "khan_qr",
      name: t('userProfile.paymentMethods.khanQr.name', 'Khan Bank QR'),
      description: t('userProfile.paymentMethods.khanQr.description', 'Pay using Khan Bank QR code'),
      icon: QrCode,
      instructions: t('userProfile.paymentMethods.khanQr.instructions', 'Scan the QR code with your Khan Bank app')
    },
    {
      id: "monpay",
      name: t('userProfile.paymentMethods.monpay.name', 'MonPay'),
      description: t('userProfile.paymentMethods.monpay.description', 'Pay using MonPay wallet'),
      icon: Smartphone,
      instructions: t('userProfile.paymentMethods.monpay.instructions', 'Open MonPay app and scan or enter payment code')
    },
    {
      id: "bank_transfer",
      name: t('userProfile.paymentMethods.bankTransfer.name', 'Bank Transfer'),
      description: t('userProfile.paymentMethods.bankTransfer.description', 'Direct bank transfer'),
      icon: Building2,
      instructions: t('userProfile.paymentMethods.bankTransfer.instructions', 'Transfer to our bank account directly')
    },
    {
      id: "qpay",
      name: t('userProfile.paymentMethods.qpay.name', 'QPay'),
      description: t('userProfile.paymentMethods.qpay.description', 'Pay using QPay'),
      icon: Wallet,
      instructions: t('userProfile.paymentMethods.qpay.instructions', 'Scan QR code with any QPay-supported bank app')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('userProfile.loading', 'Loading your profile...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pt-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user?.name || t('common.user', 'User')}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {t('userProfile.memberSince', 'Member since')} {new Date().toLocaleDateString(i18n.language)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-foreground text-sm">{t('userProfile.autoSaveEnabled', 'Auto-save enabled')}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Card */}
            {activeApplication ? (
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {t('userProfile.applicationTitle', {
                            defaultValue: '{{visaType}} Visa Application',
                            visaType: activeApplication.visaType || "B1/B2",
                          })}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {t('userProfile.startedOn', {
                            defaultValue: 'Started {{date}}',
                            date: new Date(activeApplication.createdAt).toLocaleDateString(i18n.language),
                          })}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const status = getStatusInfo(activeApplication.status);
                      const StatusIcon = status.icon;
                      return (
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </CardHeader>

                {/* Status Timeline */}
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('userProfile.applicationProgress', 'Application Progress')}</h3>
                  <div className="relative">
                    {statusTimeline.map((item, index) => (
                      <div key={item.step} className="flex items-start gap-4 mb-6 last:mb-0">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary border-2 border-border"
                          }`}>
                            {item.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs text-muted-foreground">{item.step}</span>
                            )}
                          </div>
                          {index < statusTimeline.length - 1 && (
                            <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 ${
                              item.completed ? "bg-primary/50" : "bg-border"
                            }`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={item.completed ? "text-foreground font-medium" : "text-muted-foreground"}>
                            {item.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Actions */}
                <div className="p-6 bg-secondary/30 border-t border-border">
                  <div className="flex flex-wrap gap-3">
                    {activeApplication.status === "DRAFT" || activeApplication.status === "IN_PROGRESS" ? (
                      <Button asChild>
                        <Link to="/application" className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          {t('userProfile.continueApplication', 'Continue Application')}
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {t('userProfile.viewApplication', 'View Application')}
                      </Button>
                    )}
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t('userProfile.downloadPdf', 'Download PDF')}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('userProfile.noApplicationsYet', 'No Applications Yet')}</h3>
                <p className="text-muted-foreground mb-6">{t('userProfile.startYourApplication', 'Start your DS-160 visa application today.')}</p>
                <Button asChild>
                  <Link to="/application" className="inline-flex items-center gap-2">
                    {t('userProfile.startApplication', 'Start Application')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>
            )}

            {/* Submission History */}
            {applications.length > 1 && (
              <Card>
                <CardHeader className="border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">{t('userProfile.submissionHistory', 'Submission History')}</h2>
                </CardHeader>
                <div className="divide-y divide-border">
                  {applications.map((app) => {
                    const status = getStatusInfo(app.status);
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={app.id}
                        className={`p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer ${
                          activeApplication?.id === app.id ? "bg-secondary/50" : ""
                        }`}
                        onClick={() => setActiveApplication(app)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-secondary rounded-lg">
                            <FileText className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {t('userProfile.visaLabel', {
                                defaultValue: '{{visaType}} Visa',
                                visaType: app.visaType || "B1/B2",
                              })}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {t('userProfile.updatedOn', {
                                defaultValue: 'Updated {{date}}',
                                date: new Date(app.updatedAt).toLocaleDateString(i18n.language),
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color} text-sm`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Section */}
            {activeApplication && (activeApplication.status === "SUBMITTED" || activeApplication.status === "PAYMENT_PENDING") && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <CreditCard className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{t('userProfile.paymentRequired', 'Payment Required')}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('userProfile.paymentDescription', 'Complete your payment to proceed with visa application processing.')}
                </p>

                {/* Fee Breakdown */}
                <div className="p-4 bg-secondary/50 rounded-xl border border-border mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">{t('userProfile.applicationFee', 'Application Fee')}</span>
                    <span className="text-foreground font-medium">$160.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">{t('userProfile.processingFee', 'Processing Fee')}</span>
                    <span className="text-foreground font-medium">$25.00</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">{t('common.total', 'Total')}</span>
                      <span className="text-foreground font-bold text-lg">$185.00</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 mb-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setShowPaymentModal(true);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedPayment === method.id
                          ? "bg-secondary border-primary"
                          : "bg-secondary/30 border-border hover:bg-secondary hover:border-muted-foreground"
                      }`}
                    >
                      <method.icon className="w-5 h-5 text-foreground" />
                      <div className="text-left flex-1">
                        <p className="text-foreground font-medium text-sm">{method.name}</p>
                        <p className="text-muted-foreground text-xs">{method.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {t('userProfile.securePayment', 'Secure payment processing. Your payment information is encrypted.')}
                </p>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('userProfile.quickActions', 'Quick Actions')}</h3>
              <div className="space-y-3">
                <Link
                  to="/application"
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-foreground" />
                    <span className="text-muted-foreground">{t('userProfile.newApplication', 'New Application')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
                <button className="w-full flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-foreground" />
                    <span className="text-muted-foreground">{t('userProfile.editProfile', 'Edit Profile')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary hover:border-muted-foreground transition-all group">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-foreground" />
                    <span className="text-muted-foreground">{t('userProfile.securitySettings', 'Security Settings')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('userProfile.needHelp', 'Need Help?')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('userProfile.supportDescription', 'Our support team is available 24/7 to assist with your application.')}
              </p>
              <Button variant="outline" className="w-full">
                {t('userProfile.contactSupport', 'Contact Support')}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {paymentMethods.find(m => m.id === selectedPayment)?.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-card border border-border rounded-xl p-8 mb-6">
              <div className="w-48 h-48 mx-auto bg-secondary rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-muted-foreground" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-foreground font-semibold mb-1">
                {t('userProfile.paymentModal.amount', { defaultValue: 'Amount' })}: $185.00
              </p>
              <p className="text-muted-foreground text-sm">
                {paymentMethods.find(m => m.id === selectedPayment)?.instructions}
              </p>
            </div>

            <div className="bg-secondary rounded-lg p-4 mb-6 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">
                  {t('userProfile.paymentModal.noteTitle', { defaultValue: 'Note' })}:
                </strong>{" "}
                {t('userProfile.paymentModal.noteBody', {
                  defaultValue:
                    'After payment, it may take up to 24 hours for your payment to be confirmed. You will receive an email notification once your payment is processed.',
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={() => {
                  alert(t('userProfile.paymentInitiated', 'Payment initiated! You will receive confirmation shortly.'));
                  setShowPaymentModal(false);
                }}
                className="flex-1"
              >
                {t('userProfile.ivePaid', "I've Paid")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
