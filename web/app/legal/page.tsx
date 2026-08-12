import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal and usage information for the ATP Insight portfolio.",
  robots: { index: false, follow: true }
};

export default function LegalNoticePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Legal Notice"
      intro="Terms and legal information for ATP Insight, a personal, non-commercial tennis data and machine-learning portfolio."
    >
      <LegalSection title="Operator">
        <p>
          Operator: <strong>{siteConfig.owner}</strong>, {siteConfig.country}. Contact:{" "}
          <a className="font-medium text-lime-800 underline underline-offset-4" href={`mailto:${siteConfig.privacyEmail}`}>{siteConfig.privacyEmail}</a>.
        </p>
        <p><a className="font-medium text-lime-800 underline underline-offset-4" href={siteConfig.professionalProfile}>LinkedIn</a> is provided as an additional professional profile.</p>
      </LegalSection>

      <LegalSection title="Purpose and acceptable use">
        <p>ATP Insight demonstrates a reproducible data pipeline, machine-learning experimentation and an interactive web product using public tennis information.</p>
        <p>You may browse the site for lawful informational, educational and portfolio-review purposes. Do not interfere with availability, attempt unauthorized access, automate abusive request volumes or misrepresent the project&apos;s content as an official ATP service.</p>
      </LegalSection>

      <LegalSection title="Sports data and predictions">
        <p>Sports records, rankings and tournament information are informational and may contain delays, source errors or incomplete coverage.</p>
        <p>Model probabilities are experimental estimates, not guarantees of outcomes, financial advice or betting advice. They must not be used as the sole basis for gambling or financial decisions.</p>
      </LegalSection>

      <LegalSection title="Intellectual property and third-party material">
        <p>The ATP Insight name, original interface, project code, documentation and original assets remain subject to their applicable ownership and repository licence terms.</p>
        <p>Public sports data, player and tournament names, third-party libraries, fonts and referenced services remain the property of their respective owners and are used subject to applicable licences, terms and lawful limitations. No affiliation with or endorsement by the ATP is claimed.</p>
      </LegalSection>

      <LegalSection title="External links">
        <p>Links to LinkedIn, authorities and service-provider documentation are provided for convenience. Their operators control their own availability, content and privacy practices.</p>
      </LegalSection>

      <LegalSection title="Availability and responsibility">
        <p>The operator aims to keep the portfolio accurate and available but does not guarantee uninterrupted access, complete data or error-free predictions. Content may change as data sources, models and the project evolve.</p>
        <p>Nothing in this notice excludes or limits liability where exclusion or limitation is prohibited by applicable law.</p>
      </LegalSection>

      <LegalSection title="Applicable law and future commercial use">
        <p>Spanish and European Union rules may apply given that the operator is based in Spain, without limiting any mandatory law or forum that applies to a particular user or dispute.</p>
        <p>This notice is drafted for the current personal, non-commercial portfolio. Monetization, sponsorship, advertising or professional services would require a fresh legal review and potentially additional operator information.</p>
      </LegalSection>
    </LegalPage>
  );
}