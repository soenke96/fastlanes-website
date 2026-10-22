// Tracking nur nach Einwilligung (Cookie-Banner, Cookie fl_cookie_consent).
// Wird im <head> jeder Seite geladen. Vor einer Einwilligung lädt kein Dienst eines Drittanbieters.
//   Statistik: Google Tag Manager, Contentsquare
//   Marketing: Google Tag Manager, Google Ads (gtag), Meta Pixel
// Der Banner ruft nach jeder Auswahl window.flApplyConsent(consent) auf.
(function () {
  var GTM_ID = 'GTM-TH2G4ML9';
  var ADS_ID = 'AW-17770054938';
  var META_PIXEL_ID = '1405700951350539';
  var CONTENTSQUARE_ID = '690420be7a475';

  var loaded = {};
  var addScript = function (src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Google Consent Mode: bis zur Auswahl ist alles abgelehnt
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  window.flApplyConsent = function (c) {
    if (!c) return;
    var stats = !!c.statistics;
    var marketing = !!c.marketing;

    window.gtag('consent', 'update', {
      analytics_storage: stats ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied'
    });

    if ((stats || marketing) && !loaded.gtm) {
      loaded.gtm = true;
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      addScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);
    }

    if (marketing && !loaded.ads) {
      loaded.ads = true;
      window.gtag('js', new Date());
      window.gtag('config', ADS_ID);
      addScript('https://www.googletagmanager.com/gtag/js?id=' + ADS_ID);
    }

    if (marketing && !loaded.meta) {
      loaded.meta = true;
      /* Meta Pixel (offizieller Code) */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    } else if (!marketing && loaded.meta && window.fbq) {
      window.fbq('consent', 'revoke');
    }

    if (stats && !loaded.cs) {
      loaded.cs = true;
      addScript('https://t.contentsquare.net/uxa/' + CONTENTSQUARE_ID + '.js');
    }
  };

  // Schon früher ausgewählt? Dann gleich beim Laden anwenden.
  var m = document.cookie.match(/(?:^|; )fl_cookie_consent=([^;]*)/);
  if (m) {
    try { window.flApplyConsent(JSON.parse(decodeURIComponent(m[1]))); } catch (e) {}
  }
})();
