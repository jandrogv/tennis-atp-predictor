import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { PRIVACY_NOTICE_STORAGE_KEY } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookies and browser storage used by ATP Insight.",
  robots: { index: false, follow: true }
};

export default function CookiePage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Cookie Policy"
      intro="ATP Insight currently uses no advertising or analytics cookies. This page records the browser storage and delivery technologies found in the July 2026 technical audit."
    >
      <LegalSection title="Current storage inventory">
        <div className="atp-table-shell mt-4">
          <table className="atp-table min-w-[760px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">Technology / key</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Purpose</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 font-mono text-xs">localStorage: {PRIVACY_NOTICE_STORAGE_KEY}</td>
                <td className="px-4 py-4">ATP Insight</td>
                <td className="px-4 py-4">Remember that the informational privacy notice was dismissed.</td>
                <td className="px-4 py-4">Until reset or browser storage is cleared.</td>
                <td className="px-4 py-4">Strictly necessary</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Technologies not used by the application">
        <ul className="list-disc space-y-2 pl-5">
          <li>Application cookies: none detected.</li>
          <li>Third-party advertising or analytics cookies: none detected.</li>
          <li>sessionStorage: not used.</li>
          <li>IndexedDB: not used.</li>
          <li>Application-managed Cache Storage: not used.</li>
          <li>Service workers or PWA storage: not used.</li>
          <li>Google Analytics, Google Tag Manager, Vercel Web Analytics and Vercel Speed Insights: not enabled.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vercel delivery">
        <p>
          Vercel delivers and secures the site and may process technical request data. No <code>Set-Cookie</code> header was observed on the audited production pages on July 23, 2026, but infrastructure behavior may change. Any future cookie or optional storage will be reviewed before this policy is updated.
        </p>
      </LegalSection>

      <LegalSection title="Why no consent banner is shown">
        <p>
          The current notice is informational rather than a consent panel because the application has no optional storage or tracking technology. The single local preference is strictly necessary to remember whether that notice was dismissed. It does not identify users across websites or enable profiling.
        </p>
      </LegalSection>

      <LegalSection title="Managing the preference">
        <p>
          Use <strong>Privacy settings</strong> in the footer to inspect or reset the notice. You can also clear site data through browser settings. Resetting the preference makes the informational notice appear again; it does not affect access to the site.
        </p>
        <p>For broader context, read the <Link className="font-medium text-lime-800 underline underline-offset-4" href="/privacy">Privacy Policy</Link>.</p>
      </LegalSection>
    </LegalPage>
  );
}