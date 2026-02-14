import { Link } from "react-router-dom";

export default function DataDeletion() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">User Data Deletion</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">English</h2>
          <p>
            If you want your account and personal data deleted from visamn.com, send a request from your
            registered email to <strong className="text-foreground">baqateacate@gmail.com</strong> with subject
            line <strong className="text-foreground">Data Deletion Request</strong>.
          </p>
          <p className="mt-2">
            Include your account email and full name. We verify ownership first, then permanently delete your
            account data within 30 days, except information required by law or fraud prevention records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Монгол</h2>
          <p>
            Хэрэв та visamn.com дээрх өөрийн бүртгэл болон хувийн мэдээллээ устгуулахыг хүсвэл бүртгэлтэй имэйл
            хаягаасаа <strong className="text-foreground">baqateacate@gmail.com</strong> руу
            <strong className="text-foreground"> Data Deletion Request</strong> гэсэн гарчигтай хүсэлт илгээнэ үү.
          </p>
          <p className="mt-2">
            Хүсэлтдээ бүртгэлийн имэйл болон овог нэрээ оруулна уу. Бид хэрэглэгчийг баталгаажуулсны дараа хууль,
            залилангаас хамгаалах зорилгоор хадгалах шаардлагатай мэдээллээс бусдыг 30 хоногийн дотор бүрэн устгана.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link to="/" className="text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
