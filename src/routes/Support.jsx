// src/pages/Support.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Video,
  Calendar,
  Award,
  CheckCircle,
  ArrowRight,
  Gift,
  Building2,
  Sparkles,
  Play,
} from "lucide-react";

/**
 * SUPPORT PAGE (full): Maintains all original layout & content.
 * - One-time payments: Paystack inline (client-side).
 * - Recurring subscriptions: Calls server endpoint /create-subscription (server required).
 * - Sponsorships: One-time via Paystack inline (amount from tier).
 * - Bank/EFT: copy-to-clipboard helper.
 *
 * Before using: ensure index.html loads Paystack script:
 * <script src="https://js.paystack.co/v1/inline.js"></script>
 *
 * Replace SERVER_URL with your deployed server that handles subscription creation.
 */

const PAYSTACK_PUBLIC_KEY = "pk_test_3acf5a388d0fddb0abbeba40e811993c38580e65";
// placeholder email used in transaction; you can replace with input from user
const DONATION_RECEIVER_EMAIL = "donations@intellectualintimacy.org";

// server endpoint to create subscription (must be implemented server-side)
const SERVER_URL = import.meta.env.VITE_PAYSTACK_SERVER_URL || "http://localhost:4242";

export default function Support() {
  // donor/donation state
  const [donationType, setDonationType] = useState("one-time");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  // UI modals
  const [modal, setModal] = useState({ open: false, type: "success", message: "" });

  // Sponsorship & programs UI (keeps original details)
  const donationAmounts = [50, 100, 250, 500, 1000, 2500];

  const sponsorshipTiers = [
    {
      name: "Community Partner",
      amount: 5000,
      duration: "per year",
      icon: <Heart className="w-8 h-8" />,
      benefits: [
        "Logo on website and materials",
        "Recognition in newsletter",
        "Invitation to 2 exclusive events",
        "Monthly impact reports",
        "Social media mentions",
      ],
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Program Sponsor",
      amount: 15000,
      duration: "per year",
      icon: <Award className="w-8 h-8" />,
      benefits: [
        "All Community Partner benefits",
        "Co-branded workshop series",
        "Sponsor a specific program",
        "Speaking opportunity at events",
        "Quarterly strategy sessions",
        "Custom impact report",
      ],
      color: "from-purple-500 to-pink-500",
      featured: true,
    },
    {
      name: "Anchor Sponsor",
      amount: 50000,
      duration: "per year",
      icon: <Building2 className="w-8 h-8" />,
      benefits: [
        "All Program Sponsor benefits",
        "Naming rights to annual festival",
        "Co-design custom programs",
        "Executive retreat invitation",
        "Advisory board seat",
        "Comprehensive research partnership",
        "Premium brand integration",
      ],
      color: "from-red-500 to-orange-600",
    },
  ];

  const programOptions = [
    {
      name: "Sponsor Monthly Salons",
      amount: 3000,
      icon: <Users className="w-6 h-6" />,
      description: "Fund intimate monthly conversations for 50+ participants",
      impact: "Enables 12 transformative gatherings per year",
    },
    {
      name: "Support Content Creation",
      amount: 5000,
      icon: <Video className="w-6 h-6" />,
      description: "Produce high-quality recorded conversations and educational content",
      impact: "Reaches 10,000+ viewers with valuable insights",
    },
    {
      name: "Fund Workshop Series",
      amount: 8000,
      icon: <Calendar className="w-6 h-6" />,
      description: "Enable quarterly deep-dive workshops on personal development",
      impact: "Transforms 200+ lives through intensive learning",
    },
    {
      name: "Scholarship Program",
      amount: 10000,
      icon: <Gift className="w-6 h-6" />,
      description: "Provide free access to events and programs for underserved communities",
      impact: "Makes growth accessible to 100+ individuals annually",
    },
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed", icon: <Users /> },
    { number: "50+", label: "Events Hosted", icon: <Calendar /> },
    { number: "R250K", label: "Community Investment", icon: <Heart /> },
  ];

  // Helper: show auto-dismiss modal
  function showModal(type, message) {
    setModal({ open: true, type, message });
    setTimeout(() => setModal({ open: false, type: "success", message: "" }), 5000);
  }

  // Copy bank details
  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => showModal("success", "Copied to clipboard"))
      .catch(() => showModal("error", "Copy failed"));
  }

  // Paystack inline for one-time payments (donations & sponsorships)
  function payWithPaystack({ amountZAR, referenceMetadata = {} }) {
    if (!window.PaystackPop) {
      showModal("error", "Paystack script not loaded. Add https://js.paystack.co/v1/inline.js to index.html");
      return;
    }

    const email = DONATION_RECEIVER_EMAIL; // placeholder; ideally collect donor email
    const amountKobo = Math.round(Number(amountZAR) * 100);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountKobo,
      currency: "ZAR",
      metadata: {
        custom_fields: [
          { display_name: "donation_type", variable_name: "donation_type", value: donationType },
          ...Object.keys(referenceMetadata).map((k) => ({
            display_name: k,
            variable_name: k,
            value: referenceMetadata[k],
          })),
        ],
      },
      onClose: function () {
        setProcessing(false);
        showModal("error", "Transaction closed.");
      },
      callback: function (response) {
        // response.reference is the transaction reference; verify server-side if needed
        setProcessing(false);
        showModal("success", `Payment successful — reference: ${response.reference}`);
      },
    });

    handler.openIframe();
  }

  // Handler for Donate button (one-time)
  async function handleDonateNow() {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) {
      showModal("error", "Please choose or enter a valid amount.");
      return;
    }
    setProcessing(true);

    if (donationType === "one-time") {
      // one-time donation via inline Paystack
      try {
        payWithPaystack({ amountZAR: amount, referenceMetadata: { donation_mode: "one-time" } });
      } catch (err) {
        setProcessing(false);
        showModal("error", "Payment initialization failed.");
      }
    } else {
      // monthly recurring: frontend calls server to create subscription (server will call Paystack secret API)
      try {
        const resp = await fetch(`${SERVER_URL}/create-subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(Number(amount) * 100), // cents
            email: DONATION_RECEIVER_EMAIL,
            interval: "monthly",
            // include metadata if you want
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          setProcessing(false);
          showModal("error", data.message || "Failed to create subscription");
          return;
        }

        // server returns { authorization_url } or { subscription: {...} }
        // If server provides authorization_url, open it, otherwise show success
        if (data.authorization_url) {
          // open subscription checkout (e.g. hosted page)
          window.open(data.authorization_url, "_blank");
          setProcessing(false);
          showModal("success", "Subscription initialization opened. Complete checkout in new tab.");
        } else {
          setProcessing(false);
          showModal("success", "Subscription created. We'll follow up with confirmation.");
        }
      } catch (err) {
        setProcessing(false);
        showModal("error", "Subscription creation failed.");
      }
    }
  }

  // Sponsor via inline paystack for tier amount (one-time)
  function handleSponsorTier(tier) {
    setProcessing(true);
    try {
      payWithPaystack({ amountZAR: tier.amount, referenceMetadata: { sponsor_tier: tier.name } });
    } catch (err) {
      setProcessing(false);
      showModal("error", "Sponsor payment failed to initialize.");
    }
  }

  // Program sponsorship flow (click card)
  function handleSponsorProgram(program) {
    setProcessing(true);
    try {
      payWithPaystack({ amountZAR: program.amount, referenceMetadata: { program_sponsor: program.name } });
    } catch (err) {
      setProcessing(false);
      showModal("error", "Program sponsorship failed.");
    }
  }

  // helper to format currency small
  const formatZAR = (num) => `R${Number(num).toLocaleString()}`;

  return (
    <main className="pt-32">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-amber-50 to-white dark:from-stone-950 dark:to-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-20"></div>

        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            <div className="elegant-divider mb-8"></div>
            <h1 className="text-6xl lg:text-7xl mb-8 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>
              Support Our <span className="elegant-text">Mission</span>
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              Help us build a global movement for meaningful conversation and transformative growth. Your support makes depth, authenticity, and connection accessible to all.
            </p>
          </motion.div>
        </div>
      </section>

      {/* One-Time / Monthly Donation Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>
              Make a <span className="elegant-text">Donation</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300 font-light max-w-2xl mx-auto">
              Every contribution, no matter the size, helps us create spaces for meaningful dialogue and growth.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="feature-card max-w-3xl mx-auto">
            {/* Donation Type Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button onClick={() => setDonationType("one-time")} className={`px-6 py-3 font-light transition-all ${donationType === "one-time" ? "bg-amber-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"}`}>
                One-Time
              </button>
              <button onClick={() => setDonationType("monthly")} className={`px-6 py-3 font-light transition-all ${donationType === "monthly" ? "bg-amber-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"}`}>
                Monthly
              </button>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {donationAmounts.map((amount) => (
                <button key={amount} onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }} className={`p-4 border-2 font-light transition-all ${selectedAmount === amount ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20" : "border-stone-200 dark:border-stone-700 hover:border-amber-400"}`}>
                  <div className="text-2xl font-light" style={{ fontFamily: "Crimson Pro, serif" }}>
                    R{amount}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">Or enter custom amount (ZAR)</label>
              <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }} placeholder="Enter amount" className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-400 transition-colors" />
            </div>

            <button onClick={handleDonateNow} disabled={!selectedAmount && !customAmount || processing} className={`btn-elegant w-full inline-flex items-center justify-center ${(!selectedAmount && !customAmount) || processing ? "opacity-50 cursor-not-allowed" : ""}`}>
              {processing ? "Processing..." : `Donate ${donationType === "monthly" ? "Monthly" : "Now"}`} <ArrowRight className="ml-3 w-4 h-4" />
            </button>

            <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-4 font-light">Secure payment processing powered by Paystack. Tax receipts available.</p>
          </motion.div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-20 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>
              Sponsorship <span className="elegant-text">Opportunities</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300 font-light max-w-3xl mx-auto">
              Partner with us to amplify your brand while supporting meaningful social impact. Choose a sponsorship tier that aligns with your values and goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className={`relative feature-card overflow-hidden ${tier.featured ? "ring-2 ring-amber-500" : ""}`}>
                {tier.featured && <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-xs font-medium">MOST POPULAR</div>}

                <div className={`inline-flex p-4 bg-gradient-to-br ${tier.color} text-white mb-6`}>{tier.icon}</div>

                <h3 className="text-2xl mb-2 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>{tier.name}</h3>

                <div className="mb-6">
                  <span className="text-4xl font-light elegant-text" style={{ fontFamily: "Crimson Pro, serif" }}>R{tier.amount.toLocaleString()}</span>
                  <span className="text-stone-500 dark:text-stone-400 text-sm ml-2">{tier.duration}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-600 dark:text-stone-300 font-light text-sm">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleSponsorTier(tier)} className="btn-outlined w-full">{processing ? "Processing..." : "Become a Sponsor"}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specific Program Sponsorship */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>Sponsor a <span className="elegant-text">Program</span></h2>
            <p className="text-stone-600 dark:text-stone-300 font-light max-w-3xl mx-auto">Direct your support to specific initiatives that resonate with your mission. See exactly where your investment makes a difference.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {programOptions.map((program, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="feature-card group hover:border-amber-400 cursor-pointer">
                <div className="flex items-start gap-6">
                  <div className="icon-elegant flex-shrink-0">{program.icon}</div>

                  <div className="flex-1">
                    <h3 className="text-xl mb-2 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>{program.name}</h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light text-sm mb-3">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl elegant-text font-light" style={{ fontFamily: "Crimson Pro, serif" }}>R{program.amount.toLocaleString()}</span>
                      <button onClick={() => handleSponsorProgram(program)} className="text-amber-600"><ArrowRight /></button>
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-500">
                      <p className="text-xs text-stone-700 dark:text-stone-300 font-light"><strong>Impact:</strong> {program.impact}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>Your Impact in <span className="elegant-text">Action</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="feature-card">
                <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 mb-4">{stat.icon}</div>
                <div className="text-4xl font-light elegant-text mb-2" style={{ fontFamily: "Crimson Pro, serif" }}>{stat.number}</div>
                <div className="text-stone-600 dark:text-stone-300 font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank / EFT Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>Direct Bank Transfer (EFT)</h2>
            <p className="text-stone-600 dark:text-stone-300 font-light max-w-3xl mx-auto">Prefer to donate directly? Use these bank details and use your full name as the reference so we can issue a receipt.</p>
          </motion.div>

          <div className="feature-card p-8 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="mb-3 text-sm text-stone-600 dark:text-stone-300">Account Name</div>
              <div className="text-lg font-medium mb-4">Intellectual Intimacy</div>

              <div className="mb-3 text-sm text-stone-600 dark:text-stone-300">Bank</div>
              <div className="text-lg font-medium mb-4">First National Bank (FNB)</div>

              <div className="mb-3 text-sm text-stone-600 dark:text-stone-300">Account Number</div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium">62812345678</div>
                <button onClick={() => copyToClipboard("62812345678")} className="text-sm text-amber-600">Copy</button>
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm text-stone-600 dark:text-stone-300">Branch Code</div>
              <div className="text-lg font-medium mb-4">250655</div>

              <div className="mb-3 text-sm text-stone-600 dark:text-stone-300">Reference</div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium">Your Name / Company</div>
                <button onClick={() => copyToClipboard("Your Name / Company")} className="text-sm text-amber-600">Copy</button>
              </div>

              <div className="mt-6 text-sm text-stone-500 dark:text-stone-400">
                After sending an EFT, please email <a href="mailto:donations@intellectualintimacy.org" className="underline">donations@intellectualintimacy.org</a> with the reference, amount, and date so we can issue a receipt.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-amber-600 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-10"></div>

        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: "Crimson Pro, serif" }}>Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 font-light opacity-90">Let's discuss how we can partner to create meaningful impact together.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-amber-600 px-10 py-4 font-medium hover:bg-amber-50 transition-all">Schedule a Call</button>
              <button className="border-2 border-white text-white px-10 py-4 font-medium hover:bg-white hover:text-amber-600 transition-all">Download Sponsorship Deck</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success/Error Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-6 pointer-events-none">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }} className="pointer-events-auto w-full max-w-md">
            <div className={`rounded-xl p-5 shadow-lg ${modal.type === "success" ? "bg-white text-black" : "bg-[#111] text-white"}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {modal.type === "success" ? <CheckCircle className="w-6 h-6 text-amber-500" /> : <Play className="w-6 h-6 text-red-400" />}
                </div>
                <div>
                  <div className="font-medium">{modal.type === "success" ? "Success" : "Notice"}</div>
                  <div className="text-sm">{modal.message}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
