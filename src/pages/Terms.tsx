import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" style={{ color: "#5271ff" }} />
          <span style={{ color: "#5271ff" }}>Back to Chat</span>
        </Link>

        <div className="rounded-lg p-8" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <h1 className="text-4xl font-bold mb-8" style={{ color: "#1a1a1a" }}>Terms of Service</h1>
          
          <div className="space-y-6" style={{ color: "#4a4a4a", lineHeight: "1.6" }}>
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>1. Acceptance of Terms</h2>
              <p>
                By accessing and using WitAI's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>2. Description of Service</h2>
              <p>
                WitAI provides an AI-powered procurement assistant designed to help users with project-related inquiries, document analysis, and procurement guidance. Our service uses artificial intelligence to process and respond to user queries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>3. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Provide accurate and truthful information when using our services</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to interfere with or disrupt the service</li>
                <li>Not upload malicious files or content that violates intellectual property rights</li>
                <li>Maintain the confidentiality of any account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>4. Intellectual Property</h2>
              <p>
                All content, features, and functionality of WitAI, including but not limited to text, graphics, logos, and software, are owned by WitAI or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>5. Limitation of Liability</h2>
              <p>
                WitAI provides the service "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information provided by our AI assistant. WitAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>6. Data and Privacy</h2>
              <p>
                Your use of WitAI is also governed by our Privacy Policy. By using our service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>7. Modifications to Service</h2>
              <p>
                WitAI reserves the right to modify, suspend, or discontinue the service at any time without prior notice. We may also update these Terms of Service periodically. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>8. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>9. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through our support channels.
              </p>
            </section>

            <footer className="mt-8 pt-6 border-t" style={{ borderColor: "#e0e0e0" }}>
              <p className="text-sm" style={{ color: "#999999" }}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
