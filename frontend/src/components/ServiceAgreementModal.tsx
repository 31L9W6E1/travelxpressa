import { useMemo, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export type ServiceAgreementAcceptance = {
  agreementVersion: string;
  contractNumber: string;
  acceptedAt: string;
  signerName: string;
  signerEmail: string;
  signerPhone?: string;
  signerRegistry?: string;
  signerAddress?: string;
  signatureMethod: 'CHECKBOX';
  termsHash: string;
};

interface ServiceAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (agreement: ServiceAgreementAcceptance) => void;
  applicant: {
    name?: string;
    email?: string;
    phone?: string;
    registry?: string;
    address?: string;
  };
  serviceFeeMnt: number;
  applicationId?: string | null;
}

const AGREEMENT_VERSION = 'VISAMN-SERVICE-AGREEMENT-2026.02';

const formatDate = (value: Date): string => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

const simpleHash = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
};

export default function ServiceAgreementModal({
  isOpen,
  onClose,
  onAccept,
  applicant,
  serviceFeeMnt,
  applicationId,
}: ServiceAgreementModalProps) {
  const [agreeMain, setAgreeMain] = useState(false);
  const [agreeNoRefund, setAgreeNoRefund] = useState(false);
  const [agreeDigital, setAgreeDigital] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { settings } = useSiteSettings();

  const now = useMemo(() => new Date(), []);
  const agreementDate = formatDate(now);
  const contractNumber = useMemo(() => {
    const suffix = (applicationId || `${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
    return `VMN-${agreementDate.replace(/\./g, '')}-${suffix || 'NEW'}`;
  }, [agreementDate, applicationId]);

  if (!isOpen) return null;

  const fullName = applicant.name?.trim() || '__________________';
  const email = applicant.email?.trim() || '__________________';
  const phone = applicant.phone?.trim() || '__________________';
  const registry = applicant.registry?.trim() || '__________________';
  const address = applicant.address?.trim() || '__________________';
  const serviceFeeText = `${serviceFeeMnt.toLocaleString('mn-MN')}₮`;
  const agreementVersion = settings.agreement?.version?.trim() || AGREEMENT_VERSION;
  const agreementTemplate = settings.agreement?.template || '';

  const agreementBody = useMemo(() => {
    const replacements: Record<string, string> = {
      '{{DATE}}': agreementDate,
      '{{CONTRACT_NUMBER}}': contractNumber,
      '{{CLIENT_NAME}}': fullName,
      '{{CLIENT_EMAIL}}': email,
      '{{CLIENT_PHONE}}': phone,
      '{{CLIENT_REGISTRY}}': registry,
      '{{CLIENT_ADDRESS}}': address,
      '{{SERVICE_FEE_MNT}}': serviceFeeText,
    };
    return Object.entries(replacements).reduce(
      (acc, [token, value]) => acc.split(token).join(value),
      agreementTemplate
    );
  }, [agreementDate, contractNumber, fullName, email, phone, registry, address, serviceFeeText, agreementTemplate]);

  const canSubmit = agreeMain && agreeNoRefund && agreeDigital && !!applicant.name && !!applicant.email;

  const handleAccept = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const acceptedAt = new Date().toISOString();
      onAccept({
        agreementVersion,
        contractNumber,
        acceptedAt,
        signerName: applicant.name || '',
        signerEmail: applicant.email || '',
        signerPhone: applicant.phone || '',
        signerRegistry: applicant.registry || '',
        signerAddress: applicant.address || '',
        signatureMethod: 'CHECKBOX',
        termsHash: simpleHash(`${agreementVersion}:${contractNumber}:${acceptedAt}:${agreementBody}`),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-4 border-b border-border bg-background">
          <div>
            <h2 className="text-lg font-semibold">Үйлчилгээний гэрээ</h2>
            <p className="text-xs text-muted-foreground">Огноо: {agreementDate} · Гэрээний №: {contractNumber} · Хувилбар: {agreementVersion}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Хаах
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-160px)] p-4 space-y-4 text-sm leading-6">
          <div className="rounded-xl border border-border p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {agreementBody}
            </pre>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="font-semibold">Баталгаажуулалт</h3>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={agreeMain} onChange={(e) => setAgreeMain(e.target.checked)} />
              <span>Гэрээний бүх заалтыг уншиж, ойлгож, хүлээн зөвшөөрч байна.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={agreeNoRefund} onChange={(e) => setAgreeNoRefund(e.target.checked)} />
              <span>Үйлчилгээ эхэлсний дараах буцаан олголтын нөхцөлийг (буцаагдахгүй) зөвшөөрч байна.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={agreeDigital} onChange={(e) => setAgreeDigital(e.target.checked)} />
              <span>Цахим гарын үсэг / checkbox баталгаажуулалтыг хүчинтэйд тооцохыг зөвшөөрч байна.</span>
            </label>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p>Б тал: <strong>{fullName}</strong></p>
              <p>Огноо: <strong>{agreementDate}</strong></p>
              <p>Гэрээ №: <strong>{contractNumber}</strong></p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-border bg-background p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Цахим баталгаажуулалт бүртгэгдэнэ
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Буцах</Button>
            <Button onClick={handleAccept} disabled={!canSubmit || submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Зөвшөөрч, төлбөр рүү үргэлжлүүлэх
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
