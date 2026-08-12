import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ATP Insight handles technical request data and privacy enquiries.",
  robots: { index: false, follow: true }
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This policy describes the limited personal-data processing associated with ATP Insight, a personal and non-commercial tennis data and machine-learning portfolio."
    >
      <LegalSection title="Operator and contact">
        <p>
          ATP Insight is operated by <strong>{siteConfig.owner}</strong> in {siteConfig.country}. Privacy enquiries and requests to exercise data-protection rights can be sent to{" "}
          <a className="font-medium text-lime-800 underline underline-offset-4" href={`mailto:${siteConfig.privacyEmail}`}>{siteConfig.privacyEmail}</a>.
        </p>
        <p>
          The operator&apos;s{" "}<a className="font-medium text-lime-800 underline underline-offset-4" href={siteConfig.professionalProfile}>LinkedIn profile</a>{" "}
          is provided as an additional professional contact, not as a replacement for the privacy email.
        </p>
      </LegalSection>

      <LegalSection title="What data is processed">
        <p>ATP Insight has no user accounts, registration forms, payments, advertising profiles or newsletter forms.</p>
        <p>
          When you access the site, Vercel may process technical request information such as IP address, user agent,
          requested URL, timestamps, network and security information, and diagnostic logs needed to deliver and protect the service.
          ATP Insight does not claim that access is completely anonymous.
        </p>
        <p>
          If you contact the privacy email, the operator processes the address and information you choose to provide solely to manage and answer that communication.
        </p>
      </LegalSection>

      <LegalSection title="Purposes and proposed legal bases">
        <ul className="list-disc space-y-2 pl-5">
          <li>Delivering the website and its public content: legitimate interests in publishing and operating the portfolio.</li>
          <li>Maintaining availability, diagnosing errors and preventing abuse: legitimate interests in service security and reliability.</li>
          <li>Answering enquiries and rights requests: legitimate interests and, where applicable, steps taken at the requester&apos;s initiative or compliance with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Hosting, recipients and international transfers">
        <p>
          The site is hosted and delivered by Vercel. Vercel acts as a technical service provider and may process request and diagnostic data under its own infrastructure, subprocessors and contractual safeguards. Processing may involve countries outside the European Economic Area. Applicable transfer mechanisms and current provider details should be reviewed in Vercel&apos;s published privacy and data-processing documentation.
        </p>
        <p>ATP Insight does not sell personal data and does not use it for advertising or commercial profiling.</p>
      </LegalSection>

      <LegalSection title="Google Search Console">
        <p>
          A metadata verification token is used to confirm control of the site in Google Search Console and monitor indexing and search presence. The site does not load Google Analytics or Google Tag Manager. Search Console is a webmaster and indexing service, not an on-page analytics script.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          The local privacy-notice preference remains in the browser until it is reset or browser storage is cleared. Vercel controls retention of its infrastructure and security logs under its applicable service documentation. Direct email correspondence is retained only for as long as reasonably needed to answer the enquiry, meet legal obligations or establish and defend claims.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Where applicable, you may request access, rectification, erasure, restriction, objection or portability of personal data, and may withdraw consent where processing relies on consent. Send requests to{" "}
          <a className="font-medium text-lime-800 underline underline-offset-4" href={`mailto:${siteConfig.privacyEmail}`}>{siteConfig.privacyEmail}</a>.
        </p>
        <p>
          You may also lodge a complaint with the competent supervisory authority. In Spain, information is available from the{" "}
          <a className="font-medium text-lime-800 underline underline-offset-4" href="https://www.aepd.es/">Spanish Data Protection Agency (AEPD)</a>.
        </p>
      </LegalSection>

      <LegalSection title="External links and policy changes">
        <p>External websites, including LinkedIn and provider documentation, apply their own privacy terms. ATP Insight is not responsible for their independent processing.</p>
        <p>This policy will be updated if the project adds accounts, forms, analytics, advertising, monetization or other processing. The update date shown above identifies the current version.</p>
        <p>See also the <Link className="font-medium text-lime-800 underline underline-offset-4" href="/cookies">Cookie Policy</Link> and <Link className="font-medium text-lime-800 underline underline-offset-4" href="/legal">Legal Notice</Link>.</p>
      </LegalSection>
    </LegalPage>
  );
}