// One place for your own details. Every sample page reads this file.
// whatsapp: your number with country code, digits only. Example: "919820012345".
// While it is empty, the "Get yours" and "WhatsApp me" buttons stay hidden.
window.OWNER = {
  name: "Oxzi",
  city: "Mumbai",
  whatsapp: "918655102089"
};

// Money on the sample pages. Prices are written in rupees. A sample made for a business in the
// UAE (?city=Dubai, Abu Dhabi, Sharjah or Ajman) shows them in dirhams, at about local price
// levels (a tenth of the rupee amount), and its offer sheet shows the dirham prices (fx.js, section 9).
(() => {
  let city = "";
  try { city = String(new URLSearchParams(window.location.search).get("city") || "").trim().toLowerCase(); } catch (error) { /* old browsers */ }
  const uae = ["dubai", "abu dhabi", "sharjah", "ajman"].indexOf(city) !== -1;
  window.OWNER.money = uae
    ? { code: "AED", sign: "AED ", scale: 0.1, locale: "en-US" }
    : { code: "INR", sign: "\u20B9", scale: 1, locale: "en-IN" };
})();
