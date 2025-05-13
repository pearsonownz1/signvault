import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Shield,
  Clock,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-primary/5 py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
                <span className="text-primary">Secure</span> and{" "}
                <span className="text-primary">Verify</span> Your Critical
                Documents
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                The enterprise vault for your signed documents. Tamper-proof
                storage with cryptographic verification and complete audit
                trails.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/request-demo">
                  <Button size="lg" className="px-8">
                    Request a Demo
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="px-8">
                    Explore Features
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-primary">
                        {i}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">
                    Trusted by 500+ enterprises
                  </p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      4.9/5 rating
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="p-1 bg-muted">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-xs font-medium">
                      Document Vault
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold">NDA-CompanyX-2023.pdf</h3>
                      <p className="text-xs text-muted-foreground">
                        Authoritative Copy ✓
                      </p>
                    </div>
                    <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                      Verified
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SHA-256:</span>
                      <span className="font-mono text-xs truncate max-w-[180px]">
                        a6f23b4c8d9e0f1a2b3c...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vaulted:</span>
                      <span>May 16, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Signed Via:</span>
                      <span>PandaDoc</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retention:</span>
                      <span>7 years</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="text-xs font-medium mb-2">Audit Trail</div>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                        <span>Viewed by John on 5/9/23 3:00pm</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Downloaded by Admin on 5/9/23 3:02pm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </section>

      {/* Trust Logos */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=Acme&backgroundColor=e5e7eb"
                alt="Client 1"
                className="h-8"
              />
              <span className="ml-2 font-semibold">ACME Corp</span>
            </div>
            <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=Globex&backgroundColor=e5e7eb"
                alt="Client 2"
                className="h-8"
              />
              <span className="ml-2 font-semibold">Globex</span>
            </div>
            <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=Stark&backgroundColor=e5e7eb"
                alt="Client 3"
                className="h-8"
              />
              <span className="ml-2 font-semibold">Stark Industries</span>
            </div>
            <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=Wayne&backgroundColor=e5e7eb"
                alt="Client 4"
                className="h-8"
              />
              <span className="ml-2 font-semibold">Wayne Enterprises</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Enterprise-Grade Document Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SignVault brings bank-level security to your document management
              workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Authoritative Copy Protection
              </h3>
              <p className="text-muted-foreground mb-4">
                Every document is designated and protected as the Authoritative
                Copy with visible watermarks and cryptographic verification.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">Tamper-evident storage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">SHA-256 hash verification</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Complete Audit Trails
              </h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive, immutable records of every document interaction
                for compliance and security purposes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">Time-stamped access logs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">User activity tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compliance Ready</h3>
              <p className="text-muted-foreground mb-4">
                Built to satisfy regulatory and legal standards for document
                management and retention.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">ESIGN & UETA compliant</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">Custom retention policies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How SignVault Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Seamlessly integrate with your existing eSignature workflow
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-12 left-[50%] h-0.5 bg-primary/20 w-[calc(100%-4rem)] max-w-4xl -translate-x-1/2 hidden md:block"></div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-primary text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Connect Your eSign Platform
                </h3>
                <p className="text-muted-foreground">
                  Securely connect your DocuSign, Adobe Sign, or PandaDoc
                  account with a few clicks.
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-primary text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Automatic Document Ingestion
                </h3>
                <p className="text-muted-foreground">
                  Signed documents are automatically transferred to your secure
                  vault with complete metadata.
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-primary text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Access & Verify Anytime
                </h3>
                <p className="text-muted-foreground">
                  Instantly access, verify, and prove the authenticity of your
                  documents whenever needed.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/features">
              <Button variant="outline" className="group">
                See detailed workflow
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Continue using your preferred eSignature platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-8 flex flex-col items-center text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#EC1C24]/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🖋️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Adobe Sign</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Automatic ingestion of completed Adobe Sign documents
              </p>
              <Button variant="outline" size="sm" className="mt-auto">
                Connect
              </Button>
            </div>

            <div className="bg-card rounded-xl p-8 flex flex-col items-center text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#FFCC00]/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">PandaDoc</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time webhook integration with PandaDoc
              </p>
              <Button variant="outline" size="sm" className="mt-auto">
                Connect
              </Button>
            </div>

            <div className="bg-card rounded-xl p-8 flex flex-col items-center text-center border border-border hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#0062FF]/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">DocuSign</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Secure connection to your DocuSign account
              </p>
              <Button variant="outline" size="sm" className="mt-auto">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card rounded-2xl p-10 md:p-16 border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                    alt="John Smith"
                    className="w-20 h-20 rounded-full"
                  />
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <svg
                  className="w-10 h-10 text-primary/20 mb-4 mx-auto md:mx-0"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-lg mb-6">
                  SignVault has transformed how we manage our signed contracts.
                  The audit trails and verification features have been
                  invaluable during our compliance audits.
                </p>
                <div>
                  <p className="font-semibold">John Smith</p>
                  <p className="text-sm text-muted-foreground">
                    Chief Legal Officer, Acme Corporation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to secure your documents?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join hundreds of enterprises that trust SignVault for their document
            security needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/request-demo">
              <Button variant="secondary" size="lg" className="px-8">
                Request a Demo
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="px-8 bg-transparent border-white hover:bg-white/10"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background border-t">
        <div className="container mx-auto">
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
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} SignVault. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <a href="#" className="hover:text-foreground">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
