import { useEffect } from "react";
import { getCookieConsent } from "./CookieConsent";

const YM_ID = 104963496;

function loadYM() {
  if (window.ym) return;

  window.ym = function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = 1 * new Date();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;
  document.head.appendChild(script);

  window.ym(YM_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

export default function YandexMetrika() {
  useEffect(() => {
    const consent = getCookieConsent();
    if (consent?.analytics || consent?.marketing) {
      loadYM();
    }

    const handleConsentUpdate = () => {
      const updated = getCookieConsent();
      if (updated?.analytics || updated?.marketing) {
        loadYM();
      }
    };

    window.addEventListener("cookieConsentUpdated", handleConsentUpdate);
    return () => window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
  }, []);

  return null;
}
