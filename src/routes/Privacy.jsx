import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 font-light">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-semibold mb-6 text-center tracking-tight" style={{ fontFamily: "Crimson Pro, serif" }}>
          Privacy Policy
        </h1>

        <p className="text-center mb-12 text-stone-600 dark:text-stone-400">
          Last updated: October 2025
        </p>

        <div className="space-y-10 leading-relaxed">
          {/* INTRODUCTION */}
          <section>
            <h2 className="text-2xl font-medium mb-2">1. Introduction</h2>
            <p>
              Intellectual Intimacy (“we,” “our,” or “us”) values your trust and is
              committed to protecting your personal information. This Privacy Policy
              explains how we collect, use, and safeguard your data when you interact
              with our website, participate in our programs, make donations, or
              engage with our community.
            </p>
            <p className="mt-3">
              By using our website or participating in our initiatives, you agree to
              the terms outlined in this policy.
            </p>
          </section>

          {/* DATA WE COLLECT */}
          <section>
            <h2 className="text-2xl font-medium mb-2">2. Information We Collect</h2>
            <p>
              We collect personal and non-personal information to operate effectively
              and deliver meaningful experiences to our community. This includes:
            </p>
            <ul className="list-disc ml-8 mt-3 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address, contact
                number, and other details you provide when you register for events,
                subscribe to newsletters, or make a donation.
              </li>
              <li>
                <strong>Donation Data:</strong> Payment details (processed securely
                through third-party gateways such as Paystack — we do not store your
                card information).
              </li>
              <li>
                <strong>Website Usage Data:</strong> IP address, browser type,
                referring pages, and visit duration, collected via analytics tools.
              </li>
            </ul>
          </section>

          {/* HOW WE USE */}
          <section>
            <h2 className="text-2xl font-medium mb-2">3. How We Use Your Information</h2>
            <p>
              We use your information only for purposes that align with our mission
              and legal obligations, such as:
            </p>
            <ul className="list-disc ml-8 mt-3 space-y-2">
              <li>To communicate with you about our programs, events, and updates.</li>
              <li>To process and acknowledge your donations or sponsorships.</li>
              <li>To improve our website, services, and community engagement.</li>
              <li>To maintain accurate internal records and comply with financial regulations.</li>
            </ul>
          </section>

          {/* THIRD PARTY */}
          <section>
            <h2 className="text-2xl font-medium mb-2">4. Sharing of Information</h2>
            <p>
              We do not sell or rent your personal data. We may share limited
              information only when necessary with:
            </p>
            <ul className="list-disc ml-8 mt-3 space-y-2">
              <li>Trusted service providers (e.g., Paystack for payments, email platforms for newsletters).</li>
              <li>Regulatory authorities if required by law or for legal compliance.</li>
            </ul>
            <p className="mt-3">
              All third parties are required to maintain confidentiality and data
              protection standards consistent with this policy.
            </p>
          </section>

          {/* DATA STORAGE */}
          <section>
            <h2 className="text-2xl font-medium mb-2">5. Data Security and Retention</h2>
            <p>
              We employ reasonable technical and organizational measures to protect
              your data from unauthorized access, alteration, or disclosure. We retain
              your personal information only for as long as necessary to fulfill the
              purposes outlined above or as required by law.
            </p>
          </section>

          {/* COOKIES */}
          <section>
            <h2 className="text-2xl font-medium mb-2">6. Cookies and Tracking</h2>
            <p>
              Our website may use cookies and analytics tools to improve your
              experience and understand how visitors engage with our content. You can
              control cookie preferences through your browser settings.
            </p>
          </section>

          {/* YOUR RIGHTS */}
          <section>
            <h2 className="text-2xl font-medium mb-2">7. Your Rights</h2>
            <p>
              You have the right to access, correct, or request deletion of your
              personal data. You may also withdraw consent to receive communications
              at any time.
            </p>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:privacy@intellectualintimacy.org"
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                privacy@intellectualintimacy.org
              </a>
              .
            </p>
          </section>

          {/* CHILDREN */}
          <section>
            <h2 className="text-2xl font-medium mb-2">8. Children’s Privacy</h2>
            <p>
              Our programs are designed for adults and young adults. We do not
              knowingly collect personal data from children under 16. If we discover
              such data has been provided, we will promptly delete it.
            </p>
          </section>

          {/* UPDATES */}
          <section>
            <h2 className="text-2xl font-medium mb-2">9. Updates to This Policy</h2>
            <p>
              We may update this policy periodically to reflect new practices or legal
              requirements. Updates will be posted on this page with the revised
              effective date.
            </p>
          </section>

          {/* CONTACT */}
          <section>
            <h2 className="text-2xl font-medium mb-2">10. Contact Us</h2>
            <p>
              If you have any questions, concerns, or feedback regarding this Privacy
              Policy or our data practices, please reach out to us:
            </p>
            <div className="mt-4 border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-white dark:bg-stone-900">
              <p className="font-medium">Intellectual Intimacy</p>
              <p>Email: <a href="mailto:hello@intellectualintimacy.org" className="text-amber-600 dark:text-amber-400 hover:underline">hello@intellectualintimacy.org</a></p>
              <p>Location: Johannesburg, South Africa</p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
