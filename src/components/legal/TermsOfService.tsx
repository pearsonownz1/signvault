import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Content */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Last Updated: May 9, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to SignVault. These Terms of Service ("Terms") govern your access to and use of the SignVault website, applications, APIs, and other online products and services (collectively, the "Services") provided by SignVault ("Company," "we," "us," or "our").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services. If you are accessing and using the Services on behalf of a company or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms. In that case, "you" and "your" will refer to that entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Using the Services</h2>
              
              <h3 className="text-xl font-medium mb-3">2.1 Eligibility</h3>
              <p>
                To use the Services, you must be at least 18 years of age and have the legal capacity to enter into these Terms. By using the Services, you represent and warrant that you meet these requirements.
              </p>

              <h3 className="text-xl font-medium mb-3">2.2 Account Registration</h3>
              <p>
                To access certain features of the Services, you may be required to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself and to update such information as necessary. You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-medium mb-3">2.3 Service Changes</h3>
              <p>
                We reserve the right to modify, suspend, or discontinue the Services, temporarily or permanently, with or without notice. You agree that we will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium mb-3">3.1 Your Content</h3>
              <p>
                Our Services allow you to upload, store, and share documents and other materials (collectively, "Your Content"). You retain all rights to Your Content that you upload, store, or share through our Services.
              </p>
              <p>
                By uploading, storing, or sharing Your Content through our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display Your Content solely for the purpose of providing, improving, and promoting the Services. This license terminates when you delete Your Content from our Services, except to the extent that Your Content has been shared with others and they have not deleted it.
              </p>

              <h3 className="text-xl font-medium mb-3">3.2 Content Restrictions</h3>
              <p>
                You agree not to upload, store, or share any Content that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violates any applicable law or regulation</li>
                <li>Infringes or violates any third-party rights, including intellectual property rights</li>
                <li>Contains malicious code, viruses, or other harmful components</li>
                <li>Is deceptive, fraudulent, or misleading</li>
                <li>Is defamatory, obscene, pornographic, or offensive</li>
                <li>Promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group</li>
                <li>Is violent or threatening or promotes violence or actions that are threatening to any person or entity</li>
                <li>Promotes illegal or harmful activities or substances</li>
              </ul>
              <p>
                We reserve the right to remove any Content that violates these restrictions or otherwise violates these Terms.
              </p>

              <h3 className="text-xl font-medium mb-3">3.3 Our Intellectual Property</h3>
              <p>
                The Services and all content, features, and functionality thereof, including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof (excluding Your Content), are owned by the Company, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p>
                These Terms do not grant you any right, title, or interest in the Services or our content, nor any intellectual property rights. You may not use our trademarks, logos, or other proprietary information without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Privacy</h2>
              <p>
                Please refer to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for information about how we collect, use, and disclose information about you. By using the Services, you agree to the collection, use, and disclosure of your information as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
              
              <h3 className="text-xl font-medium mb-3">5.1 Subscription Plans</h3>
              <p>
                Some features of the Services may require a subscription. The pricing, features, and limitations of each subscription plan are described on our website. We reserve the right to modify, terminate, or otherwise amend our subscription plans at any time.
              </p>

              <h3 className="text-xl font-medium mb-3">5.2 Payment</h3>
              <p>
                You agree to pay all fees associated with your subscription plan. All fees are exclusive of taxes, which you are responsible for paying. Payment must be made using a valid payment method. By providing a payment method, you authorize us to charge all fees to that payment method.
              </p>

              <h3 className="text-xl font-medium mb-3">5.3 Automatic Renewal</h3>
              <p>
                Subscriptions automatically renew for successive periods equal to the initial subscription period unless you cancel your subscription before the end of the current period. You may cancel your subscription at any time through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-medium mb-3">5.4 Refunds</h3>
              <p>
                Except as required by law, all fees are non-refundable. No refunds or credits will be provided for partial periods of service, downgrades, or unused services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
              <p>
                We may terminate or suspend your access to all or part of the Services, with or without notice, for any conduct that we, in our sole discretion, believe violates these Terms, is harmful to other users of the Services, or is harmful to our business interests.
              </p>
              <p>
                Upon termination, your right to use the Services will immediately cease, and you must delete or destroy any copies of materials you have obtained from the Services. All provisions of these Terms that by their nature should survive termination shall survive, including without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p>
                WE MAKE NO GUARANTEES REGARDING THE RELIABILITY, ACCURACY, OR COMPLETENESS OF ANY CONTENT AVAILABLE THROUGH THE SERVICES, INCLUDING THIRD-PARTY CONTENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THE SERVICES.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY DIRECT DAMAGES IN EXCESS OF (IN THE AGGREGATE) THE GREATER OF: (A) THE AMOUNT YOU HAVE PAID TO THE COMPANY FOR THE SERVICES IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY; OR (B) ONE HUNDRED DOLLARS ($100).
              </p>
              <p>
                THE LIMITATIONS OF LIABILITY IN THIS SECTION APPLY WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER BASIS, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
              <p>
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS OR EXCLUSIONS MAY NOT APPLY TO YOU. THESE TERMS GIVE YOU SPECIFIC LEGAL RIGHTS, AND YOU MAY ALSO HAVE OTHER RIGHTS WHICH VARY FROM JURISDICTION TO JURISDICTION.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless the Company, its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that such parties may incur as a result of or arising from your violation of these Terms. The Company reserves the right, at its own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, and in such case, you agree to cooperate with the Company's defense of such claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Jurisdiction</h2>
              <p>
                These Terms and any dispute arising out of or related to these Terms or the Services shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice or conflict of law provision or rule. Any legal suit, action, or proceeding arising out of or related to these Terms or the Services shall be instituted exclusively in the federal courts of the United States or the courts of the State of California, in each case located in San Francisco County, and you irrevocably submit to the personal jurisdiction of such courts in any such suit, action, or proceeding.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Arbitration Agreement</h2>
              <p>
                For any dispute you have with the Company, you agree to first contact us and attempt to resolve the dispute informally. If the Company has not been able to resolve the dispute with you informally, we each agree to resolve any claim, dispute, or controversy arising out of or in connection with or relating to these Terms, or the breach or alleged breach thereof, through binding arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules.
              </p>
              <p>
                The arbitration will be conducted in San Francisco, California, unless you and the Company agree otherwise. Each party will be responsible for paying any filing, administrative, and arbitrator fees in accordance with the rules of the American Arbitration Association.
              </p>
              <p>
                YOU AND THE COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. Further, unless both you and the Company agree otherwise, the arbitrator may not consolidate more than one person's claims, and may not otherwise preside over any form of a representative or class proceeding.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Miscellaneous</h2>
              
              <h3 className="text-xl font-medium mb-3">12.1 Entire Agreement</h3>
              <p>
                These Terms, together with the Privacy Policy and any other agreements expressly incorporated by reference herein, constitute the entire agreement between you and the Company concerning the Services.
              </p>

              <h3 className="text-xl font-medium mb-3">12.2 Waiver</h3>
              <p>
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and the Company's failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-medium mb-3">12.3 Severability</h3>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>

              <h3 className="text-xl font-medium mb-3">12.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms, by operation of law or otherwise, without the Company's prior written consent. Any attempt by you to assign or transfer these Terms without such consent will be null and of no effect. The Company may assign or transfer these Terms, at its sole discretion, without restriction.
              </p>

              <h3 className="text-xl font-medium mb-3">12.5 Notices</h3>
              <p>
                Any notices or other communications provided by the Company under these Terms will be given by posting to the Services or by email to the email address you provide during registration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@signvault.co<br />
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
