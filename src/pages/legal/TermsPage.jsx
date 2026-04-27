import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 font-poppins mb-3 pb-2 border-b border-gray-100">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TermsPage() {
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
              <FileText size={20} className="text-[#F46B03]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">Terms of Service</h1>
              <p className="text-xs text-gray-400 mt-0.5">Last updated: {updated}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 text-sm text-gray-700">
            Please read these Terms of Service carefully before using the TBSS website or placing any orders.
            By accessing our platform, you agree to be bound by these terms.
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you and
              The Book & Stationery Store (<strong>"TBSS"</strong>, <strong>"we"</strong>, <strong>"us"</strong>),
              a business operating from Accra, Ghana.
            </p>
            <p>
              By creating an account, browsing our website, or placing an order, you confirm that you are
              at least 18 years old (or have parental consent if younger) and that you accept these Terms
              in full. If you do not agree, please do not use our services.
            </p>
          </Section>

          <Section title="2. Our Services">
            <p>TBSS provides an online retail platform for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Books (fiction, non-fiction, academic, children's, and more)</li>
              <li>Stationery and office supplies</li>
              <li>Educational and recreational games</li>
              <li>Personalised reading plan advisory services</li>
              <li>Virtual book clubs and community features</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our services at any time
              with reasonable notice where possible.
            </p>
          </Section>

          <Section title="3. Accounts & Registration">
            <p>To place an order or access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Keep your password secure and not share it with others.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, engage in
              fraudulent activity, or remain inactive for an extended period.
            </p>
          </Section>

          <Section title="4. Ordering & Payment">
            <p><strong>Placing an order:</strong> When you submit an order, you are making an offer to purchase
            the products at the listed price. An order is confirmed only when you receive a confirmation
            email from us.</p>
            <p><strong>Pricing:</strong> All prices are displayed in Ghana Cedis (₵) and are inclusive of
            applicable taxes. We reserve the right to correct pricing errors before an order is confirmed.</p>
            <p><strong>Payment:</strong> Payments are processed securely through Hubtel. TBSS does not store
            your card details. By providing payment information, you authorise us to charge the total amount
            for your order.</p>
            <p><strong>Availability:</strong> We do our best to keep stock information accurate, but items
            may occasionally sell out after your order is placed. In such cases, we will contact you with
            alternatives or issue a full refund.</p>
          </Section>

          <Section title="5. Delivery & Shipping">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We currently deliver within Ghana. Delivery timelines vary by location and are shown at checkout.</li>
              <li>Risk of loss passes to you upon delivery to the specified address.</li>
              <li>We are not liable for delays caused by third-party couriers or circumstances beyond our control.</li>
              <li>It is your responsibility to ensure the delivery address is accurate at checkout.</li>
            </ul>
          </Section>

          <Section title="6. Returns & Refunds">
            <p><strong>Eligibility:</strong> You may return most items within 7 days of receipt, provided they
            are in their original, undamaged condition with all packaging intact.</p>
            <p><strong>Non-returnable items:</strong></p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Digital products or eBooks once downloaded.</li>
              <li>Items that have been clearly used or damaged after delivery.</li>
              <li>Customised or special-order items.</li>
            </ul>
            <p><strong>Process:</strong> To initiate a return, contact us at{' '}
            <a href="mailto:returns@tbss.com" className="text-[#F46B03] hover:underline">returns@tbss.com</a>{' '}
            with your order number. Approved refunds are processed within 7–10 business days to your original
            payment method.</p>
            <p><strong>Damaged/wrong items:</strong> If you receive a damaged or incorrect item, contact us within
            48 hours of delivery and we will arrange a replacement or full refund at no extra cost.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on the TBSS website — including text, images, logos, graphics, and software — is
              the property of TBSS or its licensors and is protected by Ghanaian and international copyright
              law. You may not reproduce, distribute, or create derivative works without our express written
              permission.
            </p>
            <p>
              Book cover images and descriptions are reproduced under licence from publishers or rights holders.
              Product descriptions are provided for informational purposes only.
            </p>
          </Section>

          <Section title="8. Reading Plan Service">
            <p>
              Our personalised reading plan service is an advisory service. Reading plan recommendations
              are provided in good faith based on the information you supply. TBSS does not guarantee
              specific outcomes from following a reading plan.
            </p>
            <p>
              Response times for reading plan requests are indicative only. We aim to respond within 3–5
              business days. Complex requests may take longer.
            </p>
          </Section>

          <Section title="9. Book Clubs & Community">
            <p>
              By participating in TBSS virtual book clubs or community features, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Treat other members with respect and courtesy.</li>
              <li>Not post content that is offensive, defamatory, or infringes third-party rights.</li>
              <li>Not spam, advertise, or solicit other members.</li>
            </ul>
            <p>
              We reserve the right to remove content or suspend community access for violations of these
              standards without prior notice.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by Ghanaian law, TBSS shall not be liable for any indirect,
              incidental, consequential, or special damages arising from your use of our services. Our total
              liability for any claim shall not exceed the amount paid for the specific order giving rise to
              the claim.
            </p>
            <p>
              Nothing in these Terms limits our liability for death or personal injury caused by negligence,
              fraud, or any other liability that cannot lawfully be excluded.
            </p>
          </Section>

          <Section title="11. Privacy">
            <p>
              Your use of our services is also governed by our{' '}
              <Link to="/privacy" className="text-[#F46B03] hover:underline">Privacy & Cookie Policy</Link>,
              which is incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by the laws of the Republic of Ghana. Any disputes arising under these
              Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify users of material changes via email
              or an in-app notice. Continued use of our services after the effective date of changes constitutes
              acceptance of the new Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <div className="bg-gray-50 rounded-xl p-4">
              <p><strong>TBSS Customer Service</strong></p>
              <p>Email: <a href="mailto:hello@tbss.com" className="text-[#F46B03] hover:underline">hello@tbss.com</a></p>
              <p>Address: Accra, Ghana</p>
            </div>
          </Section>

        </div>

        <div className="mt-6 text-center">
          <Link to="/privacy" className="text-sm text-[#F46B03] hover:underline font-medium">
            View Privacy & Cookie Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
