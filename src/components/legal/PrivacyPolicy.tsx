import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Content */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Last Updated: May 9, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                SignVault ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website signvault.co and use our document security and verification services (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Register for an account</li>
                <li>Sign up for our newsletter</li>
                <li>Request a demo</li>
                <li>Contact our support team</li>
                <li>Upload or store documents</li>
                <li>Complete forms on our website</li>
              </ul>
              <p>This information may include:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Company name and job title</li>
                <li>Billing information</li>
                <li>Document metadata</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 Document Information</h3>
              <p>
                When you use our Services to store, secure, or verify documents, we collect information about those documents, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Document content and metadata</li>
                <li>Digital signatures and certificates</li>
                <li>Cryptographic hashes</li>
                <li>Timestamps</li>
                <li>Audit trail information</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.3 Automatically Collected Information</h3>
              <p>
                When you access or use our Services, we automatically collect certain information about your device and usage patterns. This may include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Device information</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Referral source</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>We may use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and manage your account</li>
                <li>Verify the authenticity and integrity of documents</li>
                <li>Generate and maintain audit trails</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you technical notices, updates, security alerts, and administrative messages</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Protect the rights, property, and safety of our users and others</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-medium mb-3">4.1 Service Providers</h3>
              <p>
                We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as cloud storage providers, payment processors, and analytics services.
              </p>

              <h3 className="text-xl font-medium mb-3">4.2 Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of company assets, your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-xl font-medium mb-3">4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
              </p>

              <h3 className="text-xl font-medium mb-3">4.4 Protection of Rights</h3>
              <p>
                We may disclose your information to protect the rights, property, or safety of SignVault, our users, or others, including exchanging information with other companies and organizations for fraud protection and risk reduction.
              </p>

              <h3 className="text-xl font-medium mb-3">4.5 With Your Consent</h3>
              <p>
                We may share your information with third parties when you have given us your consent to do so.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
              <p>
                Our security measures include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Monitoring for suspicious activities</li>
                <li>Regular security training for our staff</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p>
                We will retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. For documents stored in our vault, we will retain them according to the retention period specified in your service agreement or account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>The right to access and receive a copy of your personal information</li>
                <li>The right to rectify or update your personal information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to our processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Services and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <p>
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Essential cookies: Necessary for the operation of our website</li>
                <li>Analytical/performance cookies: Allow us to recognize and count visitors and see how they move around our website</li>
                <li>Functionality cookies: Enable us to personalize content for you</li>
                <li>Targeting cookies: Record your visit to our website, the pages you have visited, and the links you have followed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p>
                Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@signvault.co<br />
                <strong>Address:</strong> 123 Security Avenue, Suite 500, San Francisco, CA 94105
              </p>
            </section>
          </div>
        </div>
      </main>

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
