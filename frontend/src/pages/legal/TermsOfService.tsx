import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-foreground">
      <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>

      <div className="max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
          <p className="text-muted-foreground text-sm">
            This service is NOT affiliated with, endorsed by, or connected to the U.S. Department of State, U.S. Embassy, U.S. Consulate, or any U.S. government agency. We are an independent third-party service that provides assistance in preparing DS-160 visa application forms.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing or using visamn.com ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground mb-4">visamn.com provides:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Guided assistance in preparing DS-160 visa application forms</li>
            <li>Field-by-field explanations and tips</li>
            <li>Form validation and error checking</li>
            <li>Progress saving and resume functionality</li>
            <li>Application review services (paid tiers)</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            <strong>Our Service does NOT:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Submit applications to the U.S. government on your behalf</li>
            <li>Guarantee visa approval</li>
            <li>Provide legal or immigration advice</li>
            <li>Replace official government resources</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
          <p className="text-muted-foreground mb-4">You agree to:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Provide accurate and truthful information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Not use the Service for fraudulent purposes</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Review all information before official submission</li>
            <li>Submit your final application through official government channels</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">4. Account Registration</h2>
          <p className="text-muted-foreground mb-4">
            To use certain features, you must create an account. You must:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Be at least 18 years old</li>
            <li>Provide accurate registration information</li>
            <li>Keep your password secure</li>
            <li>Notify us immediately of unauthorized access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
          <p className="text-muted-foreground mb-4">
            For paid services:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Prices are listed in USD unless otherwise specified</li>
            <li>Payment is due at the time of purchase</li>
            <li>Subscriptions auto-renew unless cancelled</li>
            <li>Refunds are available within 7 days if service not yet used</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>We provide the Service "as is" without warranties</li>
            <li>We are not liable for visa decisions or outcomes</li>
            <li>We are not responsible for user-provided information</li>
            <li>Our liability is limited to the amount you paid for the Service</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content, features, and functionality of the Service are owned by visamn.com and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">8. Prohibited Uses</h2>
          <p className="text-muted-foreground mb-4">You may not:</p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Use the Service for illegal purposes</li>
            <li>Submit false or misleading information</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with the Service's operation</li>
            <li>Scrape or harvest data from the Service</li>
            <li>Resell or redistribute the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">9. Termination</h2>
          <p className="text-muted-foreground mb-4">
            We may suspend or terminate your account if you violate these Terms. Upon termination:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Your access to the Service will be revoked</li>
            <li>You may request export of your data within 30 days</li>
            <li>No refunds for unused subscription periods</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">10. Governing Law</h2>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws applicable to your business jurisdiction. Any disputes shall be resolved by the competent courts in that jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
          <p className="text-muted-foreground mb-4">
            We may modify these Terms at any time. Significant changes will be notified via email or through the Service. Continued use constitutes acceptance of modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Information</h2>
          <p className="text-muted-foreground">
            For questions about these Terms, contact us at:<br />
            Email: baqateacate@gmail.com<br />
            Website: https://www.visamn.com
          </p>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link to="/" className="text-primary hover:underline">
          &larr; Back to Home
        </Link>
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Policy &rarr;
        </Link>
      </div>
    </div>
  );
}
