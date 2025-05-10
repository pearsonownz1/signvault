import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import {
  CheckCircle2,
  Shield,
  Clock,
  Lock,
  FileCheck,
  Link2,
  Calendar,
  Zap,
  Building,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Vaulting Compliance Features
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
            SignVault is designed for enterprises that demand security, control,
            and trust for their signed documents. Our platform brings
            MISMO-inspired vaulting principles to the modern world of
            eSignatures — without the complexity.
          </p>
        </div>
      </section>

      {/* Features Sections */}
      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Authoritative Copy Protection */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center text-primary mb-4">
              <CheckCircle2 className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Authoritative Copy Protection
              </h2>
            </div>
            <p className="text-lg mb-6">
              Every document stored in SignVault is designated and protected as
              the Authoritative Copy.
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Visible "Authoritative Copy" watermark on documents
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Immutable metadata including source (Adobe Sign, PandaDoc,
                    DocuSign) and vault date
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Cryptographic SHA-256 hash to verify authenticity and
                    integrity
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1568607689150-17e625c1d296?w=800&q=80"
              alt="Document with watermark"
              className="rounded-md w-full h-auto"
            />
          </div>
        </section>

        {/* Full Audit Trail */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
              alt="Audit trail visualization"
              className="rounded-md w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center text-primary mb-4">
              <Clock className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">Full Audit Trail</h2>
            </div>
            <p className="text-lg mb-6">Transparency is built in.</p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Time-stamped record of all views, downloads, shares, and
                    verifications
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Exportable audit logs for compliance, litigation, and audits
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Role-based access tracking to know who did what and when
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Enterprise-Grade Security */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center text-primary mb-4">
              <Lock className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">Enterprise-Grade Security</h2>
            </div>
            <p className="text-lg mb-6">Your documents are safe — always.</p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    End-to-end encryption (AES-256 at rest, TLS 1.3 in transit)
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Role-based access controls with optional Multi-Factor
                    Authentication (MFA)
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Secure storage infrastructure with daily encrypted backups
                    and disaster recovery
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80"
              alt="Security visualization"
              className="rounded-md w-full h-auto"
            />
          </div>
        </section>

        {/* Compliance-Ready Architecture */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
              alt="Compliance documentation"
              className="rounded-md w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center text-primary mb-4">
              <FileCheck className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Compliance-Ready Architecture
              </h2>
            </div>
            <p className="text-lg mb-6">
              Designed for enterprises that need to satisfy regulatory and legal
              standards:
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">ESIGN Act and UETA Compliant</p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    GDPR and HIPAA Considerations Supported
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Retention policies customizable to meet SEC, IRS, or
                    industry-specific recordkeeping guidelines
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Cryptographic hashing and integrity verification mechanisms
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Seamless Integration */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center text-primary mb-4">
              <Link2 className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">Seamless Integration</h2>
            </div>
            <p className="text-lg mb-6">
              Continue using your preferred eSignature providers — we handle the
              vaulting.
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Integrations with Adobe Sign, PandaDoc, DocuSign, and more
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Real-time webhook ingestion of signed documents
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Automatic archiving of signed, completed documents with
                    proof of signature source
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80"
              alt="Integration diagram"
              className="rounded-md w-full h-auto"
            />
          </div>
        </section>

        {/* Retention & Lifecycle Management */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
              alt="Document lifecycle"
              className="rounded-md w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center text-primary mb-4">
              <Calendar className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Retention & Lifecycle Management
              </h2>
            </div>
            <p className="text-lg mb-6">Control the life of your documents.</p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Customizable retention policies (e.g., 7 years, 10 years,
                    indefinite)
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Auto-deletion or archiving upon expiration
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Notifications before document retention periods expire
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Rapid Verification */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center text-primary mb-4">
              <Zap className="mr-2 h-6 w-6" />
              <h2 className="text-2xl font-bold">Rapid Verification</h2>
            </div>
            <p className="text-lg mb-6">
              Instantly prove the authenticity of any vaulted document.
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    One-click "Verify Integrity" feature
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Recalculate and compare SHA-256 hash to validate document
                    has not been altered
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1 bg-primary/10 p-1 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Provide verifiable proof during audits, disputes, or legal
                    proceedings
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1569098644584-210bcd375b59?w=800&q=80"
              alt="Document verification"
              className="rounded-md w-full h-auto"
            />
          </div>
        </section>

        {/* Built for Enterprises */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center text-primary mb-4">
            <Building className="mr-2 h-6 w-6" />
            <h2 className="text-2xl font-bold">
              Built for Enterprises that Value Trust
            </h2>
          </div>
          <p className="text-lg mb-8">
            SignVault brings the highest standards of document management and
            protection — without replacing your existing eSignature workflows.
          </p>
          <p className="text-xl font-medium text-primary mb-12">
            Secure today. Audit tomorrow. Trust forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8">
              Request a Demo
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More About Vaulting Compliance
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-muted/20 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-primary mb-4">
                SignVault
              </h2>
              <p className="text-muted-foreground max-w-md">
                Secure today. Audit tomorrow. Trust forever.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/features"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Security
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Customers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} SignVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
