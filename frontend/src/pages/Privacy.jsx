export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 md:p-12">
          <h1 style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            letterSpacing: '-0.02em',
            fontSize: '2.5rem',
            marginBottom: '1.5rem'
          }}>
            Privacy Policy
          </h1>

          <div style={{
            fontFamily: 'Inter, sans-serif',
            color: '#6D6B6B',
            fontSize: '1.0625rem',
            letterSpacing: '-0.01em',
            lineHeight: '1.7'
          }}>
            <p className="mb-4" style={{ color: '#8B8886', fontSize: '0.9375rem' }}>
              <strong>R STERLING ENTERPRISES LLC</strong><br />
              <strong>Last Updated:</strong> January 21, 2025
            </p>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                1. Introduction
              </h2>
              <p className="mb-4">
                This Privacy Policy explains how R Sterling Enterprises LLC ("we," "us," or "our") collects, uses, and protects your personal information when you use our Nervous System Sensitization Quiz ("the Quiz") and other services. By using the Quiz, you consent to the practices described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                2. Information We Collect
              </h2>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                Information You Provide Directly
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Quiz submissions:</strong> Email address (required to deliver results), quiz responses, optional free-text responses, and chronic pain/medical clearance status</li>
                <li><strong>Course access:</strong> Name and email address for course enrollment and communication</li>
                <li><strong>Payment information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
              </ul>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                Information Collected Automatically
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Technical data:</strong> Browser type, device information, IP address, operating system, and referring URLs</li>
                <li><strong>Usage data:</strong> Session IDs, pages visited, links clicked, time spent on pages, and quiz completion rates</li>
                <li><strong>Marketing parameters:</strong> UTM source and campaign parameters if you arrived via a tracked link</li>
                <li><strong>Cookies:</strong> Used for preferences, traffic analysis, and session maintenance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                3. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Deliver personalized results:</strong> Generate AI-powered insights about your nervous system state using Claude AI (Anthropic)</li>
                <li><strong>Provide services:</strong> Deliver course content, process payments, and provide customer support</li>
                <li><strong>Communication:</strong> Send course materials, program information, and follow-up resources via email</li>
                <li><strong>Improve services:</strong> Analyze aggregate data to understand user patterns and enhance our offerings</li>
                <li><strong>Marketing:</strong> Share relevant information about programs, workshops, and resources (you can opt out anytime)</li>
                <li><strong>Prevent abuse:</strong> Implement rate limiting and fraud prevention measures</li>
                <li><strong>Legal compliance:</strong> Meet legal obligations and protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                4. Information Sharing
              </h2>
              <p className="mb-4">
                <strong>We do not sell your personal information to third parties.</strong> We may share your information with:
              </p>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                Service Providers
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Supabase (PostgreSQL):</strong> Database storage for quiz responses and analytics</li>
                <li><strong>Anthropic Claude API:</strong> AI-powered generation of personalized insights</li>
                <li><strong>ConvertKit:</strong> Email marketing and newsletter delivery (via n8n webhooks)</li>
                <li><strong>Stripe:</strong> Payment processing for courses and programs</li>
                <li><strong>HelloAudio:</strong> Audio content delivery for courses</li>
                <li><strong>Google Analytics:</strong> Website traffic and usage analysis</li>
                <li><strong>Optibase:</strong> Data analytics</li>
                <li><strong>n8n:</strong> Workflow automation</li>
                <li><strong>Cloudflare Workers:</strong> Secure API processing</li>
              </ul>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                Other Disclosures
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mb-4">
                All third-party processors comply with applicable data protection regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                5. Data Retention
              </h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Course data:</strong> Retained while you have an active subscription</li>
                <li><strong>Payment records:</strong> 7 years for tax and compliance purposes</li>
                <li><strong>Quiz data:</strong> Retained indefinitely for analytics and service improvement (you may request deletion anytime)</li>
                <li><strong>Marketing data:</strong> Until you unsubscribe or request deletion</li>
                <li><strong>Analytics data:</strong> Typically 26 months</li>
                <li><strong>Support communications:</strong> Up to 3 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                6. Your Rights
              </h2>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                General Rights
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Object:</strong> Object to our processing of your personal data</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent at any time (does not affect lawfulness of prior processing)</li>
              </ul>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                GDPR Rights (EU/EEA Residents)
              </h3>
              <p className="mb-4">
                If you are located in the European Union or European Economic Area, you have additional rights under GDPR including the right to lodge a complaint with a supervisory authority.
              </p>

              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#101827',
                marginTop: '1.5rem',
                marginBottom: '0.75rem'
              }}>
                CCPA Rights (California Residents)
              </h3>
              <p className="mb-4">
                California residents have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Know what personal information is collected, used, and shared</li>
                <li>Request deletion of personal information</li>
                <li>Opt-out of the sale of personal information (we do not sell your information)</li>
                <li>Non-discrimination for exercising these rights</li>
              </ul>

              <p className="mb-4">
                To exercise any of these rights, please contact us at <a href="mailto:maggie@maggiesterling.com" style={{ color: '#4D1E22', textDecoration: 'underline' }}>maggie@maggiesterling.com</a>. We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                7. Email Preferences
              </h2>
              <p className="mb-4">
                You can manage your email preferences at any time:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Click "unsubscribe" in any marketing email</li>
                <li>Update preferences in your account settings</li>
                <li>Contact us directly at <a href="mailto:maggie@maggiesterling.com" style={{ color: '#4D1E22', textDecoration: 'underline' }}>maggie@maggiesterling.com</a></li>
              </ul>
              <p className="mb-4">
                Note: You will continue to receive transactional emails (course access, payment receipts) even if you opt out of marketing communications.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                8. Data Security
              </h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit using HTTPS/TLS</li>
                <li>Secure API key management using Cloudflare Worker secrets</li>
                <li>Rate limiting to prevent abuse and unauthorized access</li>
                <li>Regular security audits of our infrastructure</li>
                <li>Restricted access to personal data</li>
                <li>Secure payment processing through Stripe (PCI DSS compliant)</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                9. Third-Party Links
              </h2>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                10. Children's Privacy
              </h2>
              <p className="mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                11. International Data Transfers
              </h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                12. Do Not Track
              </h2>
              <p className="mb-4">
                Our website does not currently respond to "Do Not Track" browser signals. However, you can manage cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                13. Legal Basis for Processing (GDPR)
              </h2>
              <p className="mb-4">
                We process your personal data on the following legal bases:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Consent:</strong> You have explicitly consented to data processing</li>
                <li><strong>Contract:</strong> Processing is necessary to fulfill our contract with you (course delivery, payment processing)</li>
                <li><strong>Legitimate interests:</strong> We have a legitimate interest in improving services, preventing abuse, and understanding user behavior</li>
                <li><strong>Legal obligation:</strong> Processing is required to comply with legal requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                14. Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. Material changes will be communicated via email or prominent notice on our website. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.5rem',
                color: '#101827',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                15. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or how we handle your personal data, please contact us:
              </p>
              <p className="mb-4">
                <strong>Email:</strong> <a href="mailto:maggie@maggiesterling.com" style={{ color: '#4D1E22', textDecoration: 'underline' }}>maggie@maggiesterling.com</a><br />
                <strong>Alternative:</strong> <a href="mailto:hello@vibewithmaggie.com" style={{ color: '#4D1E22', textDecoration: 'underline' }}>hello@vibewithmaggie.com</a>
              </p>
              <p className="mb-4">
                <strong>Mailing Address:</strong><br />
                R Sterling Enterprises LLC<br />
                136 N Desert Sage Dr.<br />
                Saratoga Springs, UT 84045
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E6E4E1' }}>
            <a
              href="/"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4D1E22',
                fontSize: '0.9375rem',
                textDecoration: 'underline'
              }}
            >
              ← Back to Quiz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
