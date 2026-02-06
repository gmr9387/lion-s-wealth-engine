import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
              <img src={lweLogo} alt="LWE" className="h-10 w-10 object-cover" />
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 6, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Lion's Wealth Engine ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you may not use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lion's Wealth Engine is an AI-guided credit optimization platform that provides tools for credit analysis, 
              dispute letter generation, wealth planning, and funding strategy. The Platform generates documents and provides 
              strategy—you are responsible for executing actions, reviewing all generated documents, and making all final decisions.
            </p>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              We are NOT a credit repair organization (CRO) as defined by the Credit Repair Organizations Act (CROA). 
              We do not perform credit repair services on your behalf. We provide AI-powered tools that assist you in 
              managing your own credit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must provide accurate and complete information when using the Platform.</li>
              <li>You are responsible for reviewing all generated dispute letters and documents before submission.</li>
              <li>You must provide electronic consent (e-sign) before any action is taken on your behalf.</li>
              <li>You are solely responsible for mailing dispute letters and communicating with credit bureaus.</li>
              <li>You must not use the Platform for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Subscription & Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid subscriptions are billed on a recurring monthly basis. You may cancel your subscription at any time 
              through the customer portal. Cancellation takes effect at the end of the current billing period. 
              Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. No Guarantees</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform does not guarantee any specific credit score improvement, funding approval, or financial outcome. 
              Results vary based on individual credit profiles, user effort, and external factors. Past performance indicators 
              shown on the Platform are illustrative and not guarantees of future results.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Data & Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Platform is also governed by our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. 
              By using the Platform, you consent to the collection and use of information as described therein.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. FCRA & FDCPA Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              All dispute letters and processes generated by the Platform comply with the Fair Credit Reporting Act (FCRA) 
              and Fair Debt Collection Practices Act (FDCPA). Users retain full control and consent authority over all 
              actions taken through the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Lion's Wealth Engine shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
              indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes 
              via email or through the Platform. Continued use of the Platform after changes constitutes acceptance 
              of the modified Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us through the Platform's support channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
