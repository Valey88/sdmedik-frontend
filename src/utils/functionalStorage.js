import { getCookieConsent } from "../global/components/CookieConsent";

function hasFunctionalConsent() {
  const consent = getCookieConsent();
  return consent?.functional === true;
}

export function setFunctional(key, value) {
  if (!hasFunctionalConsent()) return;
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {}
}

export function getFunctional(key) {
  if (!hasFunctionalConsent()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

export function removeFunctional(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
