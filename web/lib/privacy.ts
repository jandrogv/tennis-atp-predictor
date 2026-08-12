export const PRIVACY_MODE = "essential-only" as const;
export const PRIVACY_NOTICE_VERSION = "1";
export const PRIVACY_NOTICE_STORAGE_KEY = `atp-insight:privacy-notice:v${PRIVACY_NOTICE_VERSION}`;
export const PRIVACY_NOTICE_DISMISSED_VALUE = "dismissed";
export const PRIVACY_SETTINGS_EVENT = "atp-insight:privacy-settings";

export type PrivacyStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readPrivacyNoticePreference(storage: PrivacyStorage): boolean {
  try {
    return storage.getItem(PRIVACY_NOTICE_STORAGE_KEY) === PRIVACY_NOTICE_DISMISSED_VALUE;
  } catch {
    return false;
  }
}

export function dismissPrivacyNotice(storage: PrivacyStorage): void {
  try {
    storage.setItem(PRIVACY_NOTICE_STORAGE_KEY, PRIVACY_NOTICE_DISMISSED_VALUE);
  } catch {
    // The notice remains usable when browser storage is unavailable.
  }
}

export function resetPrivacyNotice(storage: PrivacyStorage): void {
  try {
    storage.removeItem(PRIVACY_NOTICE_STORAGE_KEY);
  } catch {
    // The notice remains usable when browser storage is unavailable.
  }
}