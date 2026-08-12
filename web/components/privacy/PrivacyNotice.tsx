"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  dismissPrivacyNotice,
  PRIVACY_SETTINGS_EVENT,
  readPrivacyNoticePreference,
  resetPrivacyNotice
} from "@/lib/privacy";

export function PrivacySettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(PRIVACY_SETTINGS_EVENT))}
      className="rounded-md text-sm text-slate-600 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-500"
    >
      Privacy settings
    </button>
  );
}

export function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false);

  useEffect(() => {
    const dismissed = readPrivacyNoticePreference(window.localStorage);
    setWasDismissed(dismissed);
    setIsOpen(!dismissed);

    function openSettings() {
      setWasDismissed(readPrivacyNoticePreference(window.localStorage));
      setIsOpen(true);
    }

    window.addEventListener(PRIVACY_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(PRIVACY_SETTINGS_EVENT, openSettings);
  }, []);

  function acknowledgeNotice() {
    dismissPrivacyNotice(window.localStorage);
    setWasDismissed(true);
    setIsOpen(false);
  }

  function resetNotice() {
    resetPrivacyNotice(window.localStorage);
    setWasDismissed(false);
  }

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-labelledby="privacy-notice-title"
      aria-describedby="privacy-notice-description"
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-xl border border-slate-950/[0.10] bg-[rgba(248,250,245,0.96)] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p id="privacy-notice-title" className="text-sm font-semibold text-slate-950">
            Privacy &amp; cookies
          </p>
          <p id="privacy-notice-description" className="mt-1.5 text-sm leading-6 text-slate-600">
            ATP Insight does not use advertising or analytics cookies. Strictly necessary local storage is used only
            to remember this privacy preference. Vercel may process technical request data to deliver and secure the
            site.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/privacy" className="font-medium text-lime-800 underline decoration-lime-500/40 underline-offset-4 hover:text-lime-900">
              Privacy policy
            </Link>
            <Link href="/cookies" className="font-medium text-lime-800 underline decoration-lime-500/40 underline-offset-4 hover:text-lime-900">
              Cookie policy
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {wasDismissed ? (
            <button
              type="button"
              onClick={resetNotice}
              className="rounded-full border border-slate-950/[0.10] bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-lime-500/30 hover:text-slate-950"
            >
              Reset notice
            </button>
          ) : null}
          <button
            type="button"
            onClick={acknowledgeNotice}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Got it
          </button>
        </div>
      </div>
    </aside>
  );
}