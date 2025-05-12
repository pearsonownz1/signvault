import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Header />
      {/* Hero */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Integrate Your eSignature Platforms
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Secure your signed documents without changing the way you send
          agreements. Connect Adobe Sign, PandaDoc, or DocuSign — we'll handle
          the vaulting.
        </p>
        <Button size="lg">Get Started</Button>
      </section>

      {/* Integrations Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center space-y-16">
        <h2 className="text-3xl font-bold mb-12">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Adobe Sign */}
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
              <span className="font-semibold text-red-600 text-xl">A</span>
            </div>
            <h3 className="text-xl font-semibold">Adobe Acrobat Sign</h3>
            <p className="text-muted-foreground">
              Instantly vault completed agreements from Adobe Sign into secure
              storage with full audit tracking.
            </p>
          </div>

          {/* PandaDoc */}
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto">
              <span className="font-semibold text-blue-600 text-xl">P</span>
            </div>
            <h3 className="text-xl font-semibold">PandaDoc</h3>
            <p className="text-muted-foreground mb-4">
              Capture finalized PandaDoc documents automatically. Ensure every
              signed contract is safe, permanent, and auditable.
            </p>
            <Link to="/integrations/pandadoc">
              <Button variant="outline" size="sm">Connect PandaDoc</Button>
            </Link>
          </div>

          {/* DocuSign */}
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mx-auto">
              <span className="font-semibold text-yellow-600 text-xl">D</span>
            </div>
            <h3 className="text-xl font-semibold">DocuSign</h3>
            <p className="text-muted-foreground mb-4">
              Keep your DocuSign process — vault the signed outcomes without
              disruption. Full compliance, minimal setup.
            </p>
            <Link to="/integrations/docusign">
              <Button variant="outline" size="sm">Connect DocuSign</Button>
            </Link>
          </div>
          
          {/* SignNow */}
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <span className="font-semibold text-green-600 text-xl">S</span>
            </div>
            <h3 className="text-xl font-semibold">SignNow</h3>
            <p className="text-muted-foreground mb-4">
              Seamlessly integrate with SignNow to automatically vault your signed 
              documents with complete security and compliance.
            </p>
            <Link to="/integrations/signnow">
              <Button variant="outline" size="sm">Connect SignNow</Button>
            </Link>
          </div>
          
          {/* API Integration */}
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mx-auto">
              <span className="font-semibold text-purple-600 text-xl">API</span>
            </div>
            <h3 className="text-xl font-semibold">Custom API</h3>
            <p className="text-muted-foreground mb-4">
              Build your own integration using our secure API. Generate API keys and
              programmatically vault documents from any system.
            </p>
            <Link to="/integrations/api">
              <Button variant="outline" size="sm">Manage API Keys</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-muted text-center">
        <h2 className="text-3xl font-bold mb-12">How Integration Works</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto mb-4">
              <span className="font-semibold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Account</h3>
            <p className="text-muted-foreground">
              Use secure OAuth to link your eSign provider to SignVault in
              minutes.
            </p>
          </div>
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto mb-4">
              <span className="font-semibold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Capture Signed Documents
            </h3>
            <p className="text-muted-foreground">
              We monitor your signing activity via secure webhooks and APIs.
            </p>
          </div>
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto mb-4">
              <span className="font-semibold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Vault, Seal, and Track
            </h3>
            <p className="text-muted-foreground">
              Signed documents are vaulted automatically, sealed, and audited
              for compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center space-y-16">
        <h2 className="text-3xl font-bold mb-12">
          Why Integrate with SignVault?
        </h2>
        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">No Disruption</h3>
            <p className="text-muted-foreground">
              Keep sending documents through your trusted eSign platform.
              SignVault runs silently behind the scenes to secure the outcomes.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Immutable Proof</h3>
            <p className="text-muted-foreground">
              Every signed document is hashed, time-stamped, and stored securely
              with full audit trails.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Compliance Built-In</h3>
            <p className="text-muted-foreground">
              Designed to meet ESIGN, UETA, HIPAA, GDPR, and other industry
              regulations.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">
              Retention + Lifecycle Management
            </h3>
            <p className="text-muted-foreground">
              Apply automated rules to archive, delete, or manage documents over
              time.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-primary/5">
        <h2 className="text-4xl font-bold mb-4">
          Protect Your Signed Documents with One Click
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get started today — it takes less than 5 minutes to connect your
          signing platforms.
        </p>
        <div className="flex gap-4">
          <Button size="lg">Connect Your Account</Button>
          <Button size="lg" variant="outline">
            Request Demo
          </Button>
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
                    <Link
                      to="/integrations"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Integrations
                    </Link>
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
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
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
