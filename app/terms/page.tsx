import Link from "next/link"
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react"

const sections = [
  {
    title: "Service overview",
    body:
      "StreamTip provides creator tools including donation overlays, creator dashboards, virtual account display, live notifications, payout tracking, and related streaming utilities.",
  },
  {
    title: "Creator accounts",
    body:
      "Creators are responsible for providing accurate registration information, keeping login credentials secure, and ensuring the payment and payout details they use are lawful and correct.",
  },
  {
    title: "Platform fee",
    body:
      "StreamTip retains 20% of creator earnings generated through the platform as the service fee. This fee supports payment tooling, overlay technology, dashboard access, notifications, account management, and ongoing product operation.",
  },
  {
    title: "Payouts and balances",
    body:
      "Displayed balances, donations, and payout records depend on the payment and webhook data available to the platform. Creators should verify payout details before initiating withdrawals.",
  },
  {
    title: "Payment providers",
    body:
      "Some platform features depend on third-party services such as Monnify and related infrastructure. Availability, timing, and successful account provisioning may depend on those third-party services being properly configured and operational.",
  },
  {
    title: "Acceptable use",
    body:
      "Users may not use StreamTip for fraud, unlawful fundraising, impersonation, abusive conduct, or any activity that puts the platform, payment providers, or supporters at risk.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09090f,#11111a)] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">Legal</p>
              <h1 className="text-4xl font-black">Terms and Conditions</h1>
            </div>
          </div>

          <p className="mt-6 text-white/70 leading-8">
            These terms describe the basic operating rules for StreamTip. By registering, logging in, or using the platform, creators agree to these terms, including the platform fee structure described below.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p className="mt-3 text-white/68 leading-8">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="rounded-[28px] border border-emerald-400/15 bg-emerald-400/10 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-300" />
            <p className="text-sm leading-7 text-emerald-50/90">
              Important commercial term: StreamTip retains 20% of creator earnings as the platform fee. If you do not agree with this fee structure, do not register or continue using the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
