import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-foreground">
      <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>

      <div className="max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
          <p className="text-muted-foreground mb-4">
            visamn.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our visa application assistance service.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>Important Notice:</strong> This service is NOT affiliated with, endorsed by, or connected to the U.S. Department of State, U.S. Embassy, or any U.S. government agency. We are an independent third-party service that helps users prepare their DS-160 forms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
          <p className="text-muted-foreground mb-4">We collect information you provide directly, including:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Full name (as it appears on your passport)</li>
            <li>Date and place of birth</li>
            <li>Contact information (email, phone, address)</li>
            <li>Passport information</li>
            <li>Travel plans and itinerary</li>
            <li>Employment and education history</li>
            <li>Family information</li>
            <li>Previous travel history</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Provide our DS-160 form preparation assistance</li>
            <li>Save your application progress</li>
            <li>Generate form previews and summaries</li>
            <li>Send service-related communications</li>
            <li>Improve our services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h2>
          <p className="text-muted-foreground mb-4">We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>AES-256 encryption for sensitive data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Secure authentication with token rotation</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and audit logging</li>
            <li>Automatic session timeout</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            <strong>Important:</strong> We do NOT store your DS-160 password or answers to security questions. These must be entered directly on the official U.S. government website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Retention</h2>
          <p className="text-muted-foreground mb-4">
            We retain your application data for 90 days after submission to allow for revisions. After this period, your data is permanently deleted unless you request earlier deletion. Account information is retained until you request account deletion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Sharing</h2>
          <p className="text-muted-foreground mb-4">We do NOT sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Service providers (hosting, payment processing) under strict confidentiality agreements</li>
            <li>Legal authorities when required by law</li>
            <li>Your designated agents or representatives (with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">7. Your Rights</h2>
          <p className="text-muted-foreground mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with supervisory authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">8. Cookies</h2>
          <p className="text-muted-foreground mb-4">
            We use essential cookies for authentication and security. We also use analytics cookies to improve our service. You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Our service is not intended for users under 18. If we learn we have collected data from a minor without parental consent, we will delete it promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">10. Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            For privacy-related questions or to exercise your rights, contact us at:
          </p>
          <p className="text-muted-foreground">
            Email: baqateacate@gmail.com<br />
            Website: https://www.visamn.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this policy periodically. We will notify you of significant changes via email or through our service. Continued use after changes constitutes acceptance.
          </p>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <Link to="/" className="text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
