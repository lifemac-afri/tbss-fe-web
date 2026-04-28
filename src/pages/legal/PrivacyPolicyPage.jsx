import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 font-poppins mb-3 pb-2 border-b border-gray-100">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPolicyPage() {
  const updated = 'April 8, 2026';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#F46B03] transition-colors mb-4">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Shield size={20} className="text-[#F46B03]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">Privacy & Cookie Policy</h1>
              <p className="text-xs text-gray-400 mt-0.5">Last updated: {updated}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 text-sm text-gray-700">
            <strong>Summary:</strong> TBSS (The Book & Stationery Store) collects only the personal data needed
            to run our bookstore and deliver your orders. We do not sell your data to third parties. This policy
            explains what we collect, why, and how you can control it.
          </div>

          <Section title="1. Who We Are">
            <p>
              The Book & Stationery Store (<strong>"TBSS"</strong>, <strong>"we"</strong>, <strong>"us"</strong>)
              is an online bookstore based in Accra, Ghana. We sell books, stationery, and games through our
              website. You can contact our data team at{' '}
              <a href="mailto:tbssgh@gmail.com" className="text-[#F46B03] hover:underline">tbssgh@gmail.com</a>.
            </p>
            <p>
              This policy applies to all personal data processed by TBSS when you visit our website, create
              an account, place an order, or otherwise interact with our services.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account data:</strong> name, email address, password (hashed), and profile picture when you register.</li>
              <li><strong>Order data:</strong> delivery address, order history, payment reference numbers (we do not store card details).</li>
              <li><strong>Communication data:</strong> messages you send us, reading plan requests, and customer support enquiries.</li>
              <li><strong>Usage data:</strong> pages visited, products viewed, search queries, and time spent on pages — collected via cookies and server logs.</li>
              <li><strong>Newsletter data:</strong> email address and sign-up date if you subscribe to our newsletter.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device type, and operating system.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Order fulfilment:</strong> to process and deliver your orders and send order confirmations.</li>
              <li><strong>Account management:</strong> to create and maintain your account, handle authentication, and enable wishlist and reading plan features.</li>
              <li><strong>Customer support:</strong> to respond to enquiries, reading plan requests, and complaints.</li>
              <li><strong>Marketing (with consent):</strong> to send newsletters and promotional emails if you have opted in.</li>
              <li><strong>Security:</strong> to detect fraud, abuse, and unauthorised access to our platform.</li>
              <li><strong>Legal compliance:</strong> to meet our obligations under Ghanaian and applicable international law.</li>
              <li><strong>Service improvement:</strong> to analyse usage patterns and improve our website and product selection.</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>We process your data under the following legal bases as set out under the Ghana Data Protection Act, 2012 (Act 843):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contractual necessity:</strong> processing required to fulfil your order or manage your account.</li>
              <li><strong>Consent:</strong> newsletter subscriptions, non-essential cookies, and marketing communications.</li>
              <li><strong>Legitimate interests:</strong> fraud prevention, security monitoring, and general service improvement.</li>
              <li><strong>Legal obligation:</strong> tax record keeping and compliance with applicable laws.</li>
            </ul>
          </Section>

          <Section title="5. Cookies & Tracking Technologies">
            <p>We use the following types of cookies:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs mt-2 border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Type</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Essential</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['Session cookies', 'Maintain your login state across pages', 'Yes'],
                    ['Refresh token (HttpOnly)', 'Securely renew your authentication session', 'Yes'],
                    ['Cart & wishlist', 'Remember items in your cart and saved list', 'Yes'],
                    ['Cookie consent', 'Remember your cookie preference', 'Yes'],
                    ['Analytics', 'Understand how visitors use our site (anonymised)', 'No'],
                    ['reCAPTCHA', 'Prevent spam and bot activity on forms', 'No'],
                  ].map(([type, purpose, essential]) => (
                    <tr key={type} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-medium text-gray-800">{type}</td>
                      <td className="px-3 py-2.5 text-gray-500">{purpose}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          essential === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {essential}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              You can manage non-essential cookies at any time using the cookie banner shown when you first visit
              the site, or by clearing your browser cookies. Note that disabling essential cookies may affect
              site functionality.
            </p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>We share data with the following third-party service providers who process data on our behalf:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Cloudinary</strong> — image hosting for product photos.</li>
              <li><strong>Resend</strong> — transactional email delivery (order confirmations, notifications).</li>
              <li><strong>Pusher</strong> — real-time notifications within your account.</li>
              <li><strong>Hubtel</strong> — payment processing for orders placed on our platform.</li>
              <li><strong>Google reCAPTCHA</strong> — bot and spam prevention on subscription forms.</li>
            </ul>
            <p>
              All third-party processors are bound by data processing agreements and are required to process
              your data only for the purposes we specify. We do not sell or rent your personal data.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain your personal data for as long as is necessary for the purposes set out in this policy:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account data:</strong> for the duration of your account plus 90 days after deletion.</li>
              <li><strong>Order data:</strong> 7 years for accounting and tax compliance purposes.</li>
              <li><strong>Newsletter subscriptions:</strong> until you unsubscribe.</li>
              <li><strong>Server logs:</strong> 30 days on a rolling basis.</li>
            </ul>
          </Section>

          <Section title="8. Your Rights">
            <p>Under the Ghana Data Protection Act and applicable law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
              <li><strong>Delete</strong> your account and personal data (subject to legal retention requirements).</li>
              <li><strong>Object</strong> to processing based on legitimate interests.</li>
              <li><strong>Withdraw consent</strong> at any time for processing based on consent (e.g. newsletter).</li>
              <li><strong>Data portability</strong> — request a copy of your data in a machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href="mailto:tbssgh@gmail.com" className="text-[#F46B03] hover:underline">tbssgh@gmail.com</a>.
              We will respond within 30 days. You can also delete your account directly from your{' '}
              <Link to="/dashboard/account" className="text-[#F46B03] hover:underline">Account Settings</Link>.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We implement appropriate technical and organisational measures to protect your personal data,
              including HTTPS encryption, hashed passwords, HttpOnly cookie tokens, and rate-limiting on
              authentication endpoints. Despite our best efforts, no internet transmission is 100% secure.
              If you suspect unauthorised access to your account, contact us immediately.
            </p>
          </Section>

          <Section title="10. International Transfers">
            <p>
              Some of our third-party processors (Cloudinary, Resend, Pusher) operate servers outside Ghana.
              Where data is transferred internationally, we ensure appropriate safeguards are in place through
              data processing agreements that comply with applicable data protection law.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal data
              from children. If you believe a child has provided us with personal data, please contact us and
              we will delete it promptly.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material
              changes by email or via an in-app notification. The "Last updated" date at the top of this page
              reflects the most recent revision.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>For privacy-related questions or requests:</p>
            <div className="bg-gray-50 rounded-xl p-4 mt-2">
              <p><strong>TBSS Data Protection</strong></p>
              <p>Email: <a href="mailto:tbssgh@gmail.com" className="text-[#F46B03] hover:underline">tbssgh@gmail.com</a></p>
              <p>Address: Ho - Volta Region, Ghana</p>
            </div>
          </Section>

        </div>

        <div className="mt-6 text-center">
          <Link to="/terms" className="text-sm text-[#F46B03] hover:underline font-medium">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
