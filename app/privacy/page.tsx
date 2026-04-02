import Link from "next/link"
import { ArrowLeft, FileLock2, ShieldAlert } from "lucide-react"

const sections = [
  {
    title: "What StreamTip collects",
    body:
      "StreamTip may collect account details such as name, email address, encrypted login credentials, creator profile information, payout and bank details submitted by users, donation records, payout records, virtual account metadata, notification preferences, overlay settings, and related operational logs.",
  },
  {
    title: "How StreamTip uses data",
    body:
      "We use account and payment-related data to create creator accounts, provision virtual accounts, process donations, manage overlays, send notifications, administer payouts, secure the platform, investigate misuse, and maintain service reliability.",
  },
  {
    title: "Payment and third-party providers",
    body:
      "Some payment and account services are provided through third parties such as Monnify. When these features are used, relevant transaction and account data may be processed through those providers according to their own policies, infrastructure, and compliance requirements.",
  },
  {
    title: "No affiliation with TikTok",
    body:
      "StreamTip is not affiliated with, endorsed by, sponsored by, or operated by TikTok or ByteDance. Any mention of TikTok or other streaming platforms is for descriptive compatibility purposes only. StreamTip does not receive privileged platform status or official platform approval merely because a creator chooses to use the service alongside a livestream platform.",
  },
  {
    title: "Platform compliance responsibility",
    body:
      "Creators remain responsible for complying with the rules and legal obligations that apply to their content and monetization activities on third-party platforms, including community guidelines, branded content disclosures, age restrictions, platform monetization restrictions, and intellectual property requirements.",
  },
  {
    title: "Security and retention",
    body:
      "StreamTip takes reasonable steps to secure stored account and transaction data, but no online service can guarantee absolute security. We may retain operational, payment, audit, and fraud-prevention records for as long as reasonably necessary to run the service, comply with legal obligations, resolve disputes, and protect the platform.",
  },
  {
    title: "Prohibited use of third-party marks and identities",
    body:
      "Users may not use StreamTip to impersonate TikTok, ByteDance, or any other third party, nor may they use StreamTip materials in a way that falsely suggests official endorsement, partnership, or approval by another platform.",
  },
]

export default function PrivacyPage() {
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
              <FileLock2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">Legal</p>
              <h1 className="text-4xl font-black">Privacy Policy</h1>
            </div>
          </div>

          <p className="mt-6 text-white/70 leading-8">
            This privacy policy describes the categories of information StreamTip may collect, how we use that information to operate the platform, and the third-party service context that applies to creator donations, overlays, and payouts.
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

        <div className="rounded-[28px] border border-amber-400/15 bg-amber-400/10 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 text-amber-300" />
            <p className="text-sm leading-7 text-amber-50/90">
              Disclosure: StreamTip is an independent product. It is not affiliated with TikTok or ByteDance, and nothing in this privacy policy should be interpreted as creating a partnership, endorsement, or official integration with TikTok unless StreamTip states that separately in writing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
