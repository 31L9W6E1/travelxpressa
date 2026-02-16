import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ListChecks, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

type GuideStep = {
  id: number;
  title: string;
  description: string;
  note: string;
  cta: string;
  to: string;
};

const GuidedStart = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isMongolian = i18n.resolvedLanguage?.toLowerCase().startsWith("mn") ?? false;

  const requireLoginPath = (path: string) => (user ? path : "/login");

  const steps: GuideStep[] = isMongolian
    ? [
        {
          id: 1,
          title: "Бүртгэлээ баталгаажуулах",
          description:
            "Нэвтэрч орсноор таны мэдээлэл, драфт, явцын шинэчлэлт нэг аккаунт дээр хадгалагдана.",
          note: "Хэрэв бүртгэлтэй бол шууд нэвтэрнэ.",
          cta: user ? "Профайл нээх" : "Нэвтрэх",
          to: user ? "/profile" : "/login",
        },
        {
          id: 2,
          title: "Улс болон визийн төрлөө сонгох",
          description:
            "Ямар улс руу, ямар зорилгоор мэдүүлэхээ сонгоход систем зөв дараалал, шаардлагатай алхмуудыг гаргана.",
          note: "Буруу ангилал сонгох нь татгалзалтын эрсдэл нэмэгдүүлдэг.",
          cta: "Сонголтоо эхлүүлэх",
          to: requireLoginPath("/select-country"),
        },
        {
          id: 3,
          title: "Өргөдлийн маягтаа алхам алхмаар бөглөх",
          description:
            "Хувийн мэдээлэл, паспорт, аяллын төлөвлөгөө, гэр бүл, ажил, аюулгүй байдлын хэсгийг шат дараатай бөглөнө.",
          note: "Save Draft ашиглаад хүссэн үедээ үргэлжлүүлж болно.",
          cta: "Маягт нээх",
          to: requireLoginPath("/application"),
        },
        {
          id: 4,
          title: "Баримт бичгээ бэлдэх",
          description:
            "Шаардлагатай документын жагсаалтыг дагаж материалыг бүрэн, логик дарааллаар бэлдэнэ.",
          note: "Дутуу баримт нь хугацаа сунгах гол шалтгаан болдог.",
          cta: "Баримтын хэсэг рүү",
          to: requireLoginPath("/application"),
        },
        {
          id: 5,
          title: "Онлайн гэрээг зөвшөөрөх",
          description:
            "Төлбөрийн өмнө үйлчилгээний нөхцөл, хариуцлагын заалтыг уншаад checkbox-оор баталгаажуулна.",
          note: "Гэрээний дугаар, огноо автоматаар бөглөгдөнө.",
          cta: "Гэрээтэй танилцах",
          to: requireLoginPath("/application"),
        },
        {
          id: 6,
          title: "Төлбөр хийж илгээх",
          description:
            "Төлбөр амжилттай болсны дараа таны өргөдөл илгээгдэж, админ баг ажиллаж эхэлнэ.",
          note: "Төлбөрийн статус автоматаар шалгагдана.",
          cta: "Төлбөрийн шат руу",
          to: requireLoginPath("/application"),
        },
        {
          id: 7,
          title: "Явцаа хянах ба багтай холбогдох",
          description:
            "Inbox дээрээ бодит шинэчлэлт, хувь шатны ахиц, хүсэлт болон зааврыг шууд хүлээн авна.",
          note: "Яаралтай асуултаа Support чатаар шууд илгээнэ.",
          cta: "Inbox нээх",
          to: requireLoginPath("/profile/inbox"),
        },
      ]
    : [
        {
          id: 1,
          title: "Sign in to your account",
          description:
            "Logging in keeps your drafts, uploaded data, and status updates in one secure place.",
          note: "If you already have an account, continue directly.",
          cta: user ? "Open Profile" : "Sign In",
          to: user ? "/profile" : "/login",
        },
        {
          id: 2,
          title: "Select destination and visa type",
          description:
            "Choose your target country and visa purpose so the system gives the correct checklist and steps.",
          note: "Wrong visa category is a common source of refusal risk.",
          cta: "Start Selection",
          to: requireLoginPath("/select-country"),
        },
        {
          id: 3,
          title: "Complete the application step-by-step",
          description:
            "Fill personal details, passport, travel plan, family, work, and security sections in guided order.",
          note: "You can save draft and continue later at any point.",
          cta: "Open Form",
          to: requireLoginPath("/application"),
        },
        {
          id: 4,
          title: "Prepare required documents",
          description:
            "Follow the checklist and organize all documents in complete, review-ready order.",
          note: "Missing documents are the top reason for processing delays.",
          cta: "Go to Documents",
          to: requireLoginPath("/application"),
        },
        {
          id: 5,
          title: "Accept the online agreement",
          description:
            "Before payment, review service terms and confirm using checkbox-based electronic acceptance.",
          note: "Contract number and date are generated automatically.",
          cta: "Review Agreement",
          to: requireLoginPath("/application"),
        },
        {
          id: 6,
          title: "Pay and submit",
          description:
            "Once payment is confirmed, your application is submitted and processing starts on our side.",
          note: "Payment status is checked automatically in the system.",
          cta: "Continue to Payment",
          to: requireLoginPath("/application"),
        },
        {
          id: 7,
          title: "Track progress and chat with support",
          description:
            "Use Inbox for stage-by-stage progress updates, requests, and direct communication with our team.",
          note: "Use support chat for urgent follow-up or missing details.",
          cta: "Open Inbox",
          to: requireLoginPath("/profile/inbox"),
        },
      ];

  const quickItems = isMongolian
    ? [
        "Гадаад паспорт (хүчинтэй хугацаа шалгах)",
        "Цээж зураг (шаардлагатай хэмжээтэй)",
        "Санхүүгийн нотолгоо / банкны хуулга",
        "Ажлын эсвэл сургуулийн тодорхойлолт",
      ]
    : [
        "Valid passport (check expiry window)",
        "Photo that matches visa requirements",
        "Financial proof / bank statement",
        "Employment or school verification",
      ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={isMongolian ? "Алхамчилсан визийн заавар" : "Guided Visa Instructions"}
        subtitle={
          isMongolian
            ? "Эхнээс нь дуустал 7 алхмаар явж, шаардлагатай үйлдлийг шууд товшоод үргэлжлүүлнэ."
            : "Follow 7 clear steps from start to finish with one-click actions."
        }
        actions={
          <Button asChild>
            <Link to={steps[0]?.to || "/login"}>
              {isMongolian ? "Одоо эхлүүлэх" : "Start Now"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/35 text-primary">
            {isMongolian ? "7 алхамтай чиглүүлэг" : "7-step guided flow"}
          </Badge>
          <Badge variant="secondary">
            {isMongolian ? "Драфт хадгалалттай" : "Draft-friendly"}
          </Badge>
          <Badge variant="secondary">
            {isMongolian ? "Бодит явц хяналттай" : "Live progress tracking"}
          </Badge>
        </div>
      </PageHeader>

      <section className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {steps.map((step) => (
              <Card key={step.id} className="border-border">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                        {step.id}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        <p className="text-xs text-primary mt-2">{step.note}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="md:shrink-0">
                      <Link to={step.to}>{step.cta}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="w-4 h-4 text-primary" />
                  {isMongolian ? "Хурдан шалгах жагсаалт" : "Quick Checklist"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickItems.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {isMongolian ? "Тусламж хэрэгтэй юу?" : "Need help now?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link to={requireLoginPath("/contactsupport")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isMongolian ? "Support чат нээх" : "Open Support Chat"}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/q-and-a">{isMongolian ? "Q&A харах" : "View Q&A"}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/learn-more">{isMongolian ? "Төлбөр ба хугацаа" : "Fees & Processing"}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidedStart;
