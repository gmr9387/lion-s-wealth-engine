import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-gold">Lion's Wealth Engine</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 6, 2025</p>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number provided during registration.</li>
              <li><strong>Credit Report Data:</strong> Information extracted from PDF credit reports you upload, including tradelines, scores, and account details.</li>
              <li><strong>Usage Data:</strong> How you interact with the Platform, including features used and actions taken.</li>
              <li><strong>Consent Records:</strong> Electronic signatures and timestamps for all actions requiring your approval.</li>
              <li><strong>Business Information:</strong> Business entity details you provide for business credit building.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide AI-powered credit analysis and generate dispute letters.</li>
              <li>To create personalized wealth plans and funding projections.</li>
              <li>To send notifications about score changes, dispute updates, and action reminders.</li>
              <li>To process subscription payments through our payment processor (Stripe).</li>
              <li>To improve the Platform's AI models and user experience.</li>
              <li>To comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take data security seriously and implement the following measures:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All data is encrypted in transit (TLS/SSL) and at rest.</li>
              <li>Credit report files are stored in encrypted, access-controlled storage buckets.</li>
              <li>Row-Level Security (RLS) ensures users can only access their own data.</li>
              <li>Two-Factor Authentication (2FA) is available for additional account protection.</li>
              <li>We perform regular security audits and vulnerability assessments.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do NOT sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Payment Processor:</strong> Stripe processes subscription payments. See Stripe's privacy policy for details.</li>
              <li><strong>AI Services:</strong> Anonymized data may be processed by AI models for credit analysis. No personally identifiable information is shared with third-party AI providers.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or legal process.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. 
              Credit report files are retained for 90 days after processing, then automatically deleted. 
              You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data stored on the Platform.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Export your data in a machine-readable format.</li>
              <li>Opt out of non-essential communications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Cookies & Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform uses essential cookies for authentication and session management. 
              We do not use third-party advertising trackers. Analytics data is collected in aggregate 
              to improve the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform is not intended for users under 18 years of age. We do not knowingly collect 
              information from minors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              via email or through the Platform. Your continued use of the Platform after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related inquiries, data access requests, or to exercise your rights, 
              please contact us through the Platform's support channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
