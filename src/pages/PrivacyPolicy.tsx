import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" style={{ color: "#5271ff" }} />
          <span style={{ color: "#5271ff" }}>Back to Chat</span>
        </Link>

        <div className="rounded-lg p-8" style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <h1 className="text-4xl font-bold mb-8" style={{ color: "#1a1a1a" }}>Privacy Policy</h1>
          
          <div className="space-y-6" style={{ color: "#4a4a4a", lineHeight: "1.6" }}>
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>1. Information We Collect</h2>
              <p className="mb-3">We collect various types of information to provide and improve our service:</p>
              
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a1a" }}>Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Messages and queries you send to our AI assistant</li>
                <li>Files and documents you upload for analysis</li>
                <li>Feedback and communications with our support team</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: "#1a1a1a" }}>Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and general location information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>2. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our AI-powered procurement service</li>
                <li>To process and respond to your queries and requests</li>
                <li>To improve and optimize our service functionality</li>
                <li>To train and enhance our AI models for better performance</li>
                <li>To communicate with you about service updates and support</li>
                <li>To detect, prevent, and address technical issues or fraudulent activities</li>
                <li>To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>3. Data Sharing and Disclosure</h2>
              <p className="mb-3">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We work with third-party service providers who assist in operating our service (e.g., cloud hosting, analytics)</li>
                <li><strong>AI Processing:</strong> Your queries may be processed by third-party AI services to provide responses</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-3">We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>6. Your Rights and Choices</h2>
              <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              </ul>
              <p className="mt-3">To exercise these rights, please contact us through our support channels.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to enhance user experience, analyze usage patterns, and improve our service. You can control cookie settings through your browser preferences, but disabling cookies may affect service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>8. Children's Privacy</h2>
              <p>
                Our service is not intended for users under the age of 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>11. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our support channels. We will respond to your inquiry in a timely manner.
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

export default PrivacyPolicy;
