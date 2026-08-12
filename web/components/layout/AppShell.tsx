import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { PrivacyNotice, PrivacySettingsButton } from "@/components/privacy/PrivacyNotice";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</main>
      <footer className="relative z-10 mt-auto border-t border-slate-950/[0.06] bg-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-slate-500">ATP Insight · Personal, non-commercial data portfolio.</p>
          <nav aria-label="Legal and privacy" className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link className="text-slate-600 transition hover:text-slate-950" href="/privacy">Privacy</Link>
            <Link className="text-slate-600 transition hover:text-slate-950" href="/cookies">Cookies</Link>
            <Link className="text-slate-600 transition hover:text-slate-950" href="/legal">Legal notice</Link>
            <PrivacySettingsButton />
          </nav>
        </div>
      </footer>
      <PrivacyNotice />
    </div>
  );
}
