(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Nestwise Home Services",
    area: "Powai",
    city: "Mumbai",
    // Office and building. The page adds the area and city after it.
    address: "Office 12, ground floor, Lakeview Plaza",
    // A short line that helps people find the place. Shown with the address.
    landmark: "Near the main market",
    since: 2017,
    // Quick facts.
    homesServed: 12400,
    technicians: 38,
    // Warranty on every job, in days.
    warrantyDays: 30,
    // Slots for today close this many minutes before they start.
    leadMinutes: 90,
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Oxzi",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // One business's real details: ?id=... loads ../leads/<id>.js (see ../lead.js).
  const LEAD = window.LEAD || {};
  if (LEAD.phone) { CONFIG.phone = LEAD.phone; }


  // ---------------------------------------------------------------------
  // 2. OPENING HOURS. One line per day: [opens, closes] on the 24-hour clock.
  //    "08:00" is 8 am and "20:00" is 8 pm.
  //    Closed all day: write null, for example  Sun: null
  //    The booking slots are two-hour blocks inside these hours, so they follow any change here.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["08:00", "20:00"],
    Tue: ["08:00", "20:00"],
    Wed: ["08:00", "20:00"],
    Thu: ["08:00", "20:00"],
    Fri: ["08:00", "20:00"],
    Sat: ["08:00", "20:00"],
    Sun: ["08:00", "20:00"]
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. SERVICES AND PRICES, in rupees.
  //    price: one price.   prices: a price for each home size (1, 2 and 3 BHK).
  //    unit: when the price is per piece ("AC", "bathroom", "seat"). The booking then asks how many.
  //    popular: true marks the one most people book (one per kind).
  //    icon: snow, wrench, gauge, unit, bug, bed, wood, drop, sparkle, pot, bath or sofa.
  // ---------------------------------------------------------------------
  const KINDS = [
    { key: "ac", name: "AC", icon: "snow", sized: false },
    { key: "pest", name: "Pest control", icon: "bug", sized: true },
    { key: "clean", name: "Deep cleaning", icon: "sparkle", sized: true }
  ];
  const BHK_LIST = [1, 2, 3];
  const START_BHK = 2;
  // Already in the booking when the page opens, so the visitor sees how it works. [] for none.
  const START_CART = ["ac-split"];

  const SERVICES = [
    { id: "ac-split", kind: "ac", icon: "snow", name: "AC service, split", price: 599, unit: "AC", time: "45 minutes", popular: true,
      includes: ["Jet wash of filter and cooling coil", "Drain pipe cleared", "Gas pressure and cooling check"] },
    { id: "ac-window", kind: "ac", icon: "unit", name: "AC service, window", price: 499, unit: "AC", time: "40 minutes",
      includes: ["Filter and coil cleaned", "Fan and body cleaned", "Cooling check"] },
    { id: "ac-repair", kind: "ac", icon: "wrench", name: "AC repair visit", price: 349, time: "Within 4 hours",
      includes: ["Problem found on the spot", "Repair price told before work", "Visit fee taken off the repair bill"] },
    { id: "ac-gas", kind: "ac", icon: "gauge", name: "AC gas refill", price: 2499, unit: "AC", time: "1 to 2 hours",
      includes: ["Leak found and sealed", "Full gas top-up", "Cooling tested with a meter"] },
    { id: "ac-install", kind: "ac", icon: "wrench", name: "AC installation", price: 1499, unit: "AC", time: "2 to 3 hours",
      includes: ["Indoor and outdoor unit fitted", "Up to 3 metres of copper pipe", "Test run with you"] },
    { id: "pest-roach", kind: "pest", icon: "bug", name: "Cockroach control", prices: { 1: 999, 2: 1299, 3: 1599 }, time: "1 hour", popular: true,
      includes: ["Gel in kitchen and bathrooms", "No smell, safe for kids and pets", "Free repeat visit within 30 days"] },
    { id: "pest-bedbug", kind: "pest", icon: "bed", name: "Bed bug treatment", prices: { 1: 1799, 2: 2199, 3: 2699 }, time: "2 visits",
      includes: ["Two visits, 15 days apart", "Beds, sofas and cupboards treated", "Step out for 4 hours"] },
    { id: "pest-termite", kind: "pest", icon: "wood", name: "Termite treatment", prices: { 1: 3999, 2: 4999, 3: 5999 }, time: "3 to 4 hours",
      includes: ["Drill and fill at wood joints", "Wooden furniture treated", "One-year warranty"] },
    { id: "pest-mosquito", kind: "pest", icon: "drop", name: "Mosquito control", prices: { 1: 899, 2: 1099, 3: 1299 }, time: "45 minutes",
      includes: ["Spray in corners and drains", "Window and duct check", "Tips to stop breeding"] },
    { id: "clean-home", kind: "clean", icon: "sparkle", name: "Full home deep cleaning", prices: { 1: 3499, 2: 4999, 3: 6499 }, time: "5 to 8 hours", popular: true,
      includes: ["Every room, floor to ceiling", "Kitchen and bathrooms scrubbed", "Machines and eco-safe products"] },
    { id: "clean-kitchen", kind: "clean", icon: "pot", name: "Kitchen deep cleaning", price: 1899, time: "3 hours",
      includes: ["Chimney and stove degreased", "Cabinets inside and out", "Tiles and sink scrubbed"] },
    { id: "clean-bath", kind: "clean", icon: "bath", name: "Bathroom deep cleaning", price: 699, unit: "bathroom", time: "1 hour",
      includes: ["Hard-water stains removed", "Tiles, taps and fittings", "Exhaust fan cleaned"] },
    { id: "clean-sofa", kind: "clean", icon: "sofa", name: "Sofa shampoo", price: 549, unit: "seat", time: "30 minutes a seat",
      includes: ["Dust pulled out by machine", "Shampoo and stain removal", "Dry in 4 to 6 hours"] }
  ];

  // ---------------------------------------------------------------------
  // 4. YEARLY CARE PLANS (AMC). Prices in rupees for one year.
  //    "Pay each time" is worked out from the service prices above, so the saving is always true.
  // ---------------------------------------------------------------------
  const AMC = {
    acPerUnit: 999,                                  // AC Care, per AC per year (2 services each)
    pest: { 1: 2499, 2: 2999, 3: 3599 },             // Pest-free Home, per year
    totalDiscount: 0.15                              // Total Home Care: this much off the three together
  };
  const START_ACS = 2;

  // ---------------------------------------------------------------------
  // 5. AREAS SERVED. same: true for same-day slots, false for slots from the next day.
  //    The business's own area (from the settings or the link) is always added as same day.
  // ---------------------------------------------------------------------
  const AREAS = [
    { name: "Powai", same: true }, { name: "Chandivali", same: true }, { name: "Andheri East", same: true },
    { name: "Saki Naka", same: true }, { name: "Vikhroli", same: true }, { name: "Kanjurmarg", same: true },
    { name: "Bhandup", same: true }, { name: "Ghatkopar", same: true }, { name: "Jogeshwari East", same: true },
    { name: "Goregaon East", same: true }, { name: "Kurla", same: true },
    { name: "Mulund", same: false }, { name: "Thane", same: false }, { name: "Chembur", same: false },
    { name: "Sion", same: false }, { name: "Andheri West", same: false }, { name: "Bandra", same: false },
    { name: "Santacruz", same: false }, { name: "Vile Parle", same: false }, { name: "Malad", same: false },
    { name: "Juhu", same: false }, { name: "Dadar", same: false }
  ];

  // ---------------------------------------------------------------------
  // 6. WHY HOMES TRUST US, and HOW IT WORKS.
  //    icon: idcard, shield, tag, calendar, leaf, sparkle, chat, user or rupee.
  // ---------------------------------------------------------------------
  const TRUST = [
    { icon: "idcard", name: "Police-verified staff", text: "Every technician's ID and address are checked by the police before their first job." },
    { icon: "shield", name: "Trained and insured", text: "Trained on every major AC brand. If anything in your home breaks, it is covered." },
    { icon: "tag", name: "Price fixed before work", text: "The price on this page is what you pay. Parts only after your yes." },
    { icon: "calendar", name: "On time, or money off", text: "More than 15 minutes late? You get 100 rupees off the bill." },
    { icon: "leaf", name: "Safe, approved products", text: "Government-approved, low-smell products, safe around children and pets." },
    { icon: "sparkle", name: "We clean up after", text: "Shoe covers inside, and the work area wiped clean before we leave." }
  ];
  const HOW = [
    { icon: "calendar", name: "Pick a service and a slot", text: "Add what you need and choose a two-hour slot on this page." },
    { icon: "chat", name: "Get a WhatsApp confirmation", text: "Within 10 minutes, with the name and photo of your technician." },
    { icon: "user", name: "We arrive, in uniform", text: "With an ID card, tools and shoe covers. The price is confirmed before we start." },
    { icon: "rupee", name: "Pay after the work", text: "Check the work first. Then pay by UPI, card or cash and get a GST bill." }
  ];

  // ---------------------------------------------------------------------
  // 7. A link like  ?firm=Cool+Care&area=Thane  shows the page
  //    with that company name and area, so one sample works for many businesses.
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const customFirm = clean(params.get("firm") || LEAD.firm, 60);
  const customArea = clean(params.get("area") || LEAD.area, 40);
  const firm = customFirm || CONFIG.firm;
  const area = customArea || CONFIG.area;
  // ?city=Dubai: for a business outside Mumbai
  const city = clean(params.get("city") || LEAD.city, 30) || CONFIG.city;
  const phone = CONFIG.phone.replace(/\D/g, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Small helpers ----------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const SVG_NS = "http://www.w3.org/2000/svg";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  };

  const icon = (name, filled) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", filled ? "ico ico-fill" : "ico");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  };

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  // Prices are in rupees here; owner.js decides how they are shown (rupees, or dirhams for the UAE).
  const money = (window.OWNER && window.OWNER.money) || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const amount = (n) => Math.round(n * money.scale).toLocaleString(money.locale);
  const inr = (n) => money.sign + amount(n);
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const setPressed = (button, on) => {
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  };

  // "14:00" becomes 840 (minutes after midnight), and 840 becomes "2 pm".
  const toMinutes = (time) => {
    const parts = String(time).split(":");
    return Number(parts[0]) * 60 + Number(parts[1] || 0);
  };
  const clock = (minutes) => {
    const m = ((minutes % 1440) + 1440) % 1440;
    if (m === 0) { return "midnight"; }
    if (m === 720) { return "12 noon"; }
    const hour = Math.floor(m / 60);
    const rest = m % 60;
    return (hour % 12 || 12) + (rest ? ":" + String(rest).padStart(2, "0") : "") + (hour < 12 ? " am" : " pm");
  };

  // The week runs Monday to Sunday on this page.
  const DAYS = [
    { key: "Mon", name: "Monday" }, { key: "Tue", name: "Tuesday" }, { key: "Wed", name: "Wednesday" },
    { key: "Thu", name: "Thursday" }, { key: "Fri", name: "Friday" }, { key: "Sat", name: "Saturday" },
    { key: "Sun", name: "Sunday" }
  ];
  const todayIndex = (date = new Date()) => (date.getDay() + 6) % 7;
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const shortDate = (date) => date.getDate() + " " + MONTH_NAMES[date.getMonth()];

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | AC service, pest control and deep cleaning in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $$("[data-warranty]").forEach((node) => { node.textContent = String(CONFIG.warrantyDays); });
  $("#trustWarranty").textContent = CONFIG.warrantyDays + "-day service warranty";
  $("#tpWarranty").textContent = CONFIG.warrantyDays + " days";
  $("#leadTime").textContent = CONFIG.leadMinutes + " minutes";
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about your home services in " + area + ".");
  });
  if (phone) {
    $$("[data-call]").forEach((node) => { node.href = "tel:+" + phone; });
    $$("[data-phone-text]").forEach((node) => { node.textContent = prettyPhone(phone); });
  }

  // ---------- Sample notice at the top ----------
  $("#demoText").textContent = customFirm
    ? "Sample made for " + firm + " by " + CONFIG.builtBy + ". All details and prices are examples."
    : "Sample website by " + CONFIG.builtBy + ". All details, prices and timings are examples.";
  const builderNumber = CONFIG.builtByWhatsApp.replace(/\D/g, "");
  if (builderNumber) {
    const link = $("#demoLink");
    link.href = waLink("Hi " + CONFIG.builtBy.split(" ")[0] + ", I saw the sample website for " + firm + ". I want one.", builderNumber);
    // A tap opens the offer sheet (../fx/fx.js, section 9). The link above is the fallback.
    link.dataset.offerFirm = customFirm;
    link.hidden = false;
  }

  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + city) + "&output=embed";

  // ---------------------------------------------------------------------
  // Opening hours and the live "Open now" badge
  // ---------------------------------------------------------------------
  const DAY = 1440;          // minutes in a day
  const WEEK = 7 * DAY;      // minutes in a week

  // Opening and closing minute for one day, or null when closed all day.
  // A closing time at or before the opening time means "after midnight".
  const hoursOf = (dayIndex) => {
    const pair = HOURS[DAYS[dayIndex].key];
    if (!pair) { return null; }
    const start = toMinutes(pair[0]);
    let end = toMinutes(pair[1]);
    if (end <= start) { end += DAY; }
    return { start: start, end: end };
  };

  // Every open stretch of the week, counted in minutes from Monday 00:00.
  const spans = [];
  DAYS.forEach((day, i) => {
    const hours = hoursOf(i);
    if (hours) { spans.push({ from: i * DAY + hours.start, to: i * DAY + hours.end }); }
  });

  // If the business is open at minute t, the minute it closes. Otherwise null.
  const closingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    for (const span of spans) {
      for (const shift of [0, -WEEK]) {
        if (inWeek >= span.from + shift && inWeek < span.to + shift) { return t + (span.to + shift - inWeek); }
      }
    }
    return null;
  };

  // The next minute it opens after minute t. Null when it never opens.
  const openingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    let best = null;
    for (const span of spans) {
      for (const shift of [0, WEEK]) {
        const start = span.from + shift;
        if (start > inWeek && (best === null || start < best)) { best = start; }
      }
    }
    return best === null ? null : t + (best - inWeek);
  };

  // Works out the badge text for any moment.
  const openStatus = (date) => {
    const today = todayIndex(date);
    const now = today * DAY + date.getHours() * 60 + date.getMinutes();
    let closes = closingAfter(now);
    if (closes !== null) {
      let hops = 0;
      while (hops < 8) {
        const later = closingAfter(closes);
        if (later === null) { break; }
        closes = later;
        hops += 1;
      }
      if (hops >= 8) { return { open: true, short: "Open 24 hours" }; }
      return { open: true, short: "Open now until " + clock(closes) };
    }
    const opens = openingAfter(now);
    if (opens === null) { return { open: false, short: "Closed now" }; }
    const daysAway = Math.floor(opens / DAY) - today;
    const base = "Closed now, opens at " + clock(opens);
    if (daysAway === 0) { return { open: false, short: base }; }
    if (daysAway === 1) { return { open: false, short: base + " tomorrow" }; }
    return { open: false, short: base + " on " + DAYS[Math.floor(opens / DAY) % 7].name };
  };

  const hoursText = (dayIndex) => {
    const hours = hoursOf(dayIndex);
    if (hours && hours.end - hours.start >= DAY) { return "Open 24 hours"; }
    return hours ? clock(hours.start) + " to " + clock(hours.end) : "Closed";
  };

  // "Every day: 8 am to 8 pm", or one line per group of days, for the contact card.
  const groups = [];
  DAYS.forEach((day, i) => {
    const text = hoursText(i);
    const last = groups[groups.length - 1];
    if (last && last.text === text) { last.to = i; } else { groups.push({ from: i, to: i, text: text }); }
  });
  $("#contactHours").replaceChildren(...groups.map((group) => {
    const days = groups.length === 1 ? "Every day" : group.from === group.to ? DAYS[group.from].key : DAYS[group.from].key + " to " + DAYS[group.to].key;
    return el("span", "hours-line", days + ": " + group.text);
  }));

  const paintOpen = () => {
    const status = openStatus(new Date());
    $$("[data-open-badge]").forEach((node) => {
      node.hidden = false;
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
      const label = $("[data-open-text]", node);
      if (label.textContent !== status.short) { label.textContent = status.short; }
    });
  };

  // ---------------------------------------------------------------------
  // Services, prices and the booking basket
  // ---------------------------------------------------------------------
  let kind = KINDS[0];
  let bhk = START_BHK;
  const cart = new Map();   // service id -> how many
  START_CART.forEach((id) => { if (SERVICES.some((s) => s.id === id)) { cart.set(id, 1); } });

  const serviceOf = (id) => SERVICES.find((s) => s.id === id);
  const priceOf = (service, size = bhk) => (service.prices ? service.prices[size] : service.price);
  const priceNote = (service) => (service.prices ? "for a " + bhk + " BHK" : service.unit ? "per " + service.unit : "");

  const catTabs = $("#catTabs");
  const bhkSeg = $("#bhkSeg");
  const serviceGrid = $("#serviceGrid");

  const buildService = (service) => {
    const added = cart.has(service.id);
    const card = el("article", service.popular ? "svc is-popular" : "svc");
    card.dataset.tilt = "";
    card.dataset.tiltMax = "5";
    if (service.popular) { card.appendChild(el("span", "svc-flag", "Most booked")); }

    const top = el("div", "svc-top");
    const badge = el("span", "svc-ico");
    badge.appendChild(icon(service.icon));
    top.appendChild(badge);
    const time = el("span", "svc-time");
    time.appendChild(icon("clock"));
    time.appendChild(el("span", "", service.time));
    top.appendChild(time);
    card.appendChild(top);

    card.appendChild(el("h3", "svc-name", service.name));
    const cost = el("p", "svc-price");
    cost.appendChild(el("strong", "", inr(priceOf(service))));
    const note = priceNote(service);
    if (note) { cost.appendChild(el("span", "", note)); }
    card.appendChild(cost);

    const list = el("ul", "svc-list");
    service.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    card.appendChild(list);

    const add = el("button", added ? "btn btn-added" : service.popular ? "btn btn-lime btn-3d" : "btn btn-ghost");
    add.type = "button";
    add.dataset.ripple = "";
    add.setAttribute("aria-pressed", String(added));
    add.appendChild(icon(added ? "check" : "plus"));
    add.appendChild(el("span", "", added ? "Added to booking" : "Add to booking"));
    add.addEventListener("click", () => {
      if (cart.has(service.id)) { cart.delete(service.id); } else { cart.set(service.id, 1); }
      renderServices();
      renderTicket();
      const again = $('[data-service="' + service.id + '"] .btn', serviceGrid);
      if (again) { again.focus(); }
    });
    card.dataset.service = service.id;
    card.appendChild(add);
    return card;
  };

  const renderServices = () => {
    $$(".tab", catTabs).forEach((button) => setPressed(button, button.dataset.kind === kind.key));
    $$(".seg-btn", bhkSeg).forEach((button) => setPressed(button, Number(button.dataset.bhk) === bhk));
    $("#sizeRow").hidden = !kind.sized;
    serviceGrid.replaceChildren(...SERVICES.filter((s) => s.kind === kind.key).map(buildService));
  };

  KINDS.forEach((item) => {
    const button = el("button", "tab");
    button.type = "button";
    button.dataset.kind = item.key;
    button.appendChild(icon(item.icon));
    button.appendChild(el("span", "", item.name));
    const count = el("span", "tab-count", "");
    count.hidden = true;
    button.appendChild(count);
    button.addEventListener("click", () => { kind = item; renderServices(); });
    catTabs.appendChild(button);
  });

  // One home-size switch for the services and one for the yearly plans. They stay in step.
  const sizeButtons = (box) => BHK_LIST.forEach((count) => {
    const button = el("button", "seg-btn", count + " BHK");
    button.type = "button";
    button.dataset.bhk = String(count);
    button.addEventListener("click", () => { bhk = count; renderServices(); renderTicket(); renderAmc(); });
    box.appendChild(button);
  });
  sizeButtons(bhkSeg);
  sizeButtons($("#amcBhkSeg"));

  // The lowest price on the page, for the second button under the headline.
  $("#heroFrom").textContent = inr(Math.min(...SERVICES.map((s) => (s.prices ? Math.min(...BHK_LIST.map((n) => s.prices[n])) : s.price))));

  // ---------------------------------------------------------------------
  // Same-day slots: two-hour blocks inside the opening hours
  // ---------------------------------------------------------------------
  const booking = { ahead: null, start: null };
  const dayChips = $("#dayChips");
  const slotGrid = $("#slotGrid");

  const dateAhead = (ahead) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
  };
  const dayWord = (ahead) => (ahead === 0 ? "Today" : ahead === 1 ? "Tomorrow" : DAYS[todayIndex(dateAhead(ahead))].name);

  const slotsFor = (ahead) => {
    const hours = hoursOf(todayIndex(dateAhead(ahead)));
    if (!hours) { return []; }
    const list = [];
    for (let t = Math.ceil(hours.start / 60) * 60; t + 120 <= hours.end; t += 120) { list.push(t); }
    return list;
  };

  // A sample page has no real diary, so some slots show as full in a pattern that looks real
  // and stays the same for each date. A real client's page would read their own bookings.
  const slotState = (ahead, start) => {
    if (ahead === 0) {
      const now = new Date();
      if (start - (now.getHours() * 60 + now.getMinutes()) < CONFIG.leadMinutes) { return "gone"; }
    }
    const date = dateAhead(ahead);
    const mix = (date.getDate() * 7 + date.getMonth() * 3 + start / 60 * 5) % 9;
    if (mix === 0 || (ahead === 0 && mix === 4)) { return "full"; }
    if (mix === 2 || mix === 6) { return "few"; }
    return "free";
  };
  const openSlots = (ahead) => slotsFor(ahead).filter((t) => slotState(ahead, t) !== "gone" && slotState(ahead, t) !== "full");

  const bookDays = () => {
    const list = [];
    for (let ahead = 0; ahead < 10 && list.length < 6; ahead += 1) {
      if (slotsFor(ahead).length) { list.push(ahead); }
    }
    return list;
  };

  // The first slot anyone can still book, for the card on the top photo.
  const nextFree = () => {
    for (const ahead of bookDays()) {
      const free = openSlots(ahead);
      if (free.length) { return { ahead: ahead, start: free[0] }; }
    }
    return null;
  };

  const slotText = (start) => clock(start) + " to " + clock(start + 120);

  const renderSlots = () => {
    const days = bookDays();
    if (booking.ahead === null || days.indexOf(booking.ahead) === -1) {
      const first = nextFree();
      booking.ahead = first ? first.ahead : days[0];
      booking.start = first ? first.start : null;
    }
    dayChips.replaceChildren(...days.map((ahead) => {
      const date = dateAhead(ahead);
      const button = el("button", "chip chip-day");
      button.type = "button";
      button.appendChild(el("strong", "", ahead < 2 ? dayWord(ahead) : DAYS[todayIndex(date)].key));
      button.appendChild(el("span", "", shortDate(date)));
      setPressed(button, ahead === booking.ahead);
      button.setAttribute("aria-label", dayWord(ahead) + ", " + shortDate(date) + (openSlots(ahead).length ? "" : ", no slots left"));
      if (!openSlots(ahead).length) { button.classList.add("is-full"); }
      button.addEventListener("click", () => {
        booking.ahead = ahead;
        const free = openSlots(ahead);
        if (free.indexOf(booking.start) === -1) { booking.start = free.length ? free[0] : null; }
        renderSlots();
        renderTicket();
      });
      return button;
    }));

    const starts = slotsFor(booking.ahead);
    slotGrid.replaceChildren(...starts.map((start) => {
      const state = slotState(booking.ahead, start);
      const button = el("button", "slot slot-" + state);
      button.type = "button";
      button.disabled = state === "gone" || state === "full";
      setPressed(button, start === booking.start && !button.disabled);
      button.appendChild(el("strong", "", slotText(start)));
      button.appendChild(el("span", "", state === "gone" ? "Closed" : state === "full" ? "Full" : state === "few" ? "Few left" : "Free"));
      button.addEventListener("click", () => {
        booking.start = start;
        renderSlots();
        renderTicket();
        const again = $$(".slot", slotGrid)[starts.indexOf(start)];
        if (again) { again.focus(); }
      });
      return button;
    }));
    const free = openSlots(booking.ahead).length;
    const when = booking.ahead < 2 ? dayWord(booking.ahead).toLowerCase() : "on " + dayWord(booking.ahead);
    $("#slotNote").textContent = free
      ? free + " slot" + (free === 1 ? "" : "s") + " free " + when + "."
      : "No slots left " + when + ". Please pick another day.";
  };

  // ---------------------------------------------------------------------
  // The booking ticket
  // ---------------------------------------------------------------------
  const ticketLines = $("#ticketLines");
  const ticketError = $("#ticketError");
  const basket = $("#basket");

  const cartRows = () => Array.from(cart.entries()).map(([id, qty]) => {
    const service = serviceOf(id);
    return { service: service, qty: qty, total: priceOf(service) * qty };
  });

  const qtyStepper = (row) => {
    const box = el("span", "stepper stepper-sm");
    const minus = el("button", "step-btn");
    minus.type = "button";
    minus.dataset.step = "minus";
    minus.setAttribute("aria-label", "One " + row.service.unit + " less: " + row.service.name);
    minus.appendChild(icon("minus"));
    minus.disabled = row.qty <= 1;
    const value = el("output", "step-val", String(row.qty));
    const plus = el("button", "step-btn");
    plus.type = "button";
    plus.dataset.step = "plus";
    plus.setAttribute("aria-label", "One " + row.service.unit + " more: " + row.service.name);
    plus.appendChild(icon("plus"));
    plus.disabled = row.qty >= 6;
    const change = (by, way) => {
      cart.set(row.service.id, Math.min(6, Math.max(1, row.qty + by)));
      renderTicket();
      const line = $('[data-line="' + row.service.id + '"]', ticketLines);
      const same = line && $('[data-step="' + way + '"]', line);
      if (same && !same.disabled) { same.focus(); } else if (line) { $(".step-btn:not(:disabled)", line).focus(); }
    };
    minus.addEventListener("click", () => change(-1, "minus"));
    plus.addEventListener("click", () => change(1, "plus"));
    box.append(minus, value, plus);
    return box;
  };

  const renderTicket = () => {
    const rows = cartRows();
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    ticketLines.replaceChildren(...rows.map((row) => {
      const li = el("li", row.service.unit ? "tl has-qty" : "tl");
      li.dataset.line = row.service.id;
      const words = el("div", "tl-words");
      words.appendChild(el("strong", "", row.service.name));
      const note = row.service.prices ? "For a " + bhk + " BHK"
        : row.service.unit ? inr(priceOf(row.service)) + " per " + row.service.unit : "";
      if (note) { words.appendChild(el("span", "", note)); }
      li.appendChild(words);
      if (row.service.unit) { li.appendChild(qtyStepper(row)); }
      li.appendChild(el("span", "tl-amt", inr(row.total)));
      const drop = el("button", "tl-x");
      drop.type = "button";
      drop.setAttribute("aria-label", "Remove " + row.service.name);
      drop.appendChild(icon("x"));
      drop.addEventListener("click", () => {
        cart.delete(row.service.id);
        renderTicket();
        renderServices();
        const next = $(".tl-x", ticketLines) || $("#ticketName");
        if (next) { next.focus(); }
      });
      li.appendChild(drop);
      return li;
    }));
    $("#ticketEmpty").hidden = rows.length > 0;
    $("#ticketWhen").textContent = booking.start === null ? "Pick a slot" : dayWord(booking.ahead) + ", " + shortDate(dateAhead(booking.ahead)) + ", " + slotText(booking.start);
    $("#ticketTotal").textContent = inr(total);

    // The basket line under the services and the counts on the tabs.
    const count = rows.length;
    basket.hidden = count === 0;
    $("#basketCount").textContent = count + " service" + (count === 1 ? "" : "s") + " added";
    $("#basketTotal").textContent = inr(total);
    $$(".tab", catTabs).forEach((button) => {
      const n = rows.filter((row) => row.service.kind === button.dataset.kind).length;
      const badge = $(".tab-count", button);
      badge.hidden = n === 0;
      badge.textContent = String(n);
    });
    ticketError.hidden = true;
  };

  $("#ticketSend").addEventListener("click", () => {
    const rows = cartRows();
    const name = clean($("#ticketName").value, 60);
    const where = clean($("#ticketWhere").value, 80);
    const problems = [];
    if (!rows.length) { problems.push("add at least one service"); }
    if (booking.start === null) { problems.push("pick a slot"); }
    if (!name) { problems.push("type your name"); }
    if (!name) { $("#ticketName").setAttribute("aria-invalid", "true"); } else { $("#ticketName").removeAttribute("aria-invalid"); }
    if (problems.length) {
      ticketError.textContent = "Please " + problems.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
      ticketError.hidden = false;
      if (!rows.length) { $("#ticketEmpty a").focus(); } else if (!name) { $("#ticketName").focus(); }
      return;
    }
    ticketError.hidden = true;
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const lines = ["Hello " + firm + ", I want to book:"]
      .concat(rows.map((row) => "- " + row.service.name +
        (row.service.prices ? " (" + bhk + " BHK)" : "") +
        (row.service.unit ? " x " + row.qty + " " + row.service.unit + (row.qty === 1 ? "" : "s") : "") + ": " + inr(row.total)))
      .concat([
        "Slot: " + dayWord(booking.ahead) + ", " + shortDate(dateAhead(booking.ahead)) + ", " + slotText(booking.start),
        "Total: " + inr(total),
        "Name: " + name,
        where ? "Area: " + where : "",
        "Please confirm."
      ]).filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
  $("#ticketName").addEventListener("input", () => { $("#ticketName").removeAttribute("aria-invalid"); ticketError.hidden = true; });

  const paintHeroSlot = () => {
    const next = nextFree();
    const card = $("#heroSlot");
    card.hidden = !next;
    if (!next) { return; }
    $("#heroSlotWhen").textContent = next.ahead === 0 ? "Next free slot today" : next.ahead === 1 ? "Next free slot tomorrow" : "Next free slot on " + dayWord(next.ahead);
    $("#heroSlotTime").textContent = slotText(next.start);
  };

  // ---------------------------------------------------------------------
  // How it works, yearly plans, areas and trust points
  // ---------------------------------------------------------------------
  $("#howSteps").replaceChildren(...HOW.map((step, i) => {
    const li = el("li", "how-step");
    const badge = el("span", "how-ico");
    badge.appendChild(icon(step.icon));
    badge.appendChild(el("span", "how-n", String(i + 1)));
    li.appendChild(badge);
    li.appendChild(el("h3", "", step.name));
    li.appendChild(el("p", "", step.text));
    return li;
  }));

  let acs = START_ACS;
  const amcGrid = $("#amcGrid");
  const per = (id) => priceOf(serviceOf(id));
  const roundPlan = (n) => Math.max(99, Math.round(n / 100) * 100 - 1);

  const renderAmc = () => {
    $("#acCount").textContent = String(acs);
    $("#acMinus").disabled = acs <= 1;
    $("#acPlus").disabled = acs >= 6;
    $$(".seg-btn", $("#amcBhkSeg")).forEach((button) => setPressed(button, Number(button.dataset.bhk) === bhk));

    const acPrice = AMC.acPerUnit * acs;
    const acPay = acs * 2 * per("ac-split") + per("ac-repair");
    const pestPrice = AMC.pest[bhk];
    const pestPay = 3 * per("pest-roach") + per("pest-mosquito");
    const cleanPay = per("clean-home");
    const totalPrice = roundPlan((acPrice + pestPrice + cleanPay) * (1 - AMC.totalDiscount));
    const totalPay = acPay + pestPay + cleanPay;
    const acWord = acs + " AC" + (acs === 1 ? "" : "s");

    const plans = [
      { name: "AC Care", line: "For " + acWord + ". Cool air all summer.", price: acPrice, pay: acPay,
        includes: ["2 services a year for every AC", "Free repair visits all year", "10% off gas and parts"] },
      { name: "Total Home Care", line: "AC, pests and one deep clean, for " + acWord + " in a " + bhk + " BHK.", price: totalPrice, pay: totalPay, popular: true,
        includes: ["Everything in AC Care and Pest-free Home", "1 full home deep cleaning a year", "Priority slots, even on Sundays"] },
      { name: "Pest-free Home", line: "For a " + bhk + " BHK. No cockroaches, no mosquitoes.", price: pestPrice, pay: pestPay,
        includes: ["3 cockroach treatments a year", "1 mosquito treatment before the monsoon", "Free extra visit if pests come back"] }
    ];
    amcGrid.replaceChildren(...plans.map((plan) => {
      const card = el("article", plan.popular ? "plan is-popular" : "plan");
      card.dataset.tilt = "";
      card.dataset.tiltMax = "5";
      if (plan.popular) { card.appendChild(el("span", "plan-flag", "Best value")); }
      const head = el("div");
      head.appendChild(el("h3", "plan-name", plan.name));
      head.appendChild(el("p", "plan-line", plan.line));
      card.appendChild(head);
      const cost = el("p", "plan-price");
      cost.appendChild(el("strong", "", inr(plan.price)));
      cost.appendChild(el("span", "", "a year"));
      card.appendChild(cost);
      const sub = el("p", "plan-sub");
      sub.appendChild(el("span", "", "About " + inr(plan.price / 12) + " a month"));
      const saving = plan.pay - plan.price;
      if (saving > 0) { sub.appendChild(el("span", "save", "Save " + inr(saving) + " a year")); }
      card.appendChild(sub);
      const list = el("ul", "plan-list");
      plan.includes.forEach((line) => {
        const li = el("li");
        li.appendChild(icon("check"));
        li.appendChild(el("span", "", line));
        list.appendChild(li);
      });
      card.appendChild(list);
      const start = el("a", plan.popular ? "btn btn-lime btn-3d" : "btn btn-ghost");
      start.dataset.ripple = "";
      start.target = "_blank";
      start.rel = "noopener";
      start.href = waLink("Hello " + firm + ", I want the " + plan.name + " plan for " + acWord + " in a " + bhk + " BHK (" + inr(plan.price) + " a year). Please tell me how to start.");
      start.setAttribute("aria-label", "Start on WhatsApp: " + plan.name + ", " + inr(plan.price) + " a year");
      start.appendChild(icon("wa", true));
      start.appendChild(el("span", "", "Start this plan"));
      card.appendChild(start);
      return card;
    }));
  };
  $("#acMinus").addEventListener("click", () => { acs = Math.max(1, acs - 1); renderAmc(); if ($("#acMinus").disabled) { $("#acPlus").focus(); } });
  $("#acPlus").addEventListener("click", () => { acs = Math.min(6, acs + 1); renderAmc(); if ($("#acPlus").disabled) { $("#acMinus").focus(); } });

  // Areas: the business's own area always comes first, with same-day slots.
  const areas = AREAS.slice();
  const homeIndex = areas.findIndex((a) => a.name.toLowerCase() === area.toLowerCase());
  if (homeIndex !== -1) { areas.splice(homeIndex, 1); }
  areas.unshift({ name: area, same: true });
  $("#areaChips").replaceChildren(...areas.map((a) => el("li", a.same ? "area is-same" : "area", a.name)));
  $("#areaList").replaceChildren(...areas.map((a) => { const option = el("option"); option.value = a.name; return option; }));

  const areaResult = $("#areaResult");
  const checkArea = () => {
    const typed = clean($("#areaInput").value, 40);
    const key = typed.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    areaResult.className = "area-result";
    if (key.length < 2) { areaResult.hidden = true; return; }
    const found = areas.find((a) => a.name.toLowerCase() === key) ||
      areas.find((a) => a.name.toLowerCase().startsWith(key)) ||
      areas.find((a) => a.name.toLowerCase().indexOf(key) !== -1);
    areaResult.hidden = false;
    areaResult.replaceChildren();
    if (found) {
      areaResult.classList.add(found.same ? "is-same" : "is-next");
      areaResult.appendChild(icon("check"));
      areaResult.appendChild(el("span", "", found.same
        ? "Yes, we come to " + found.name + " the same day. Pick a slot above."
        : "Yes, we come to " + found.name + ". Slots start from the next day."));
    } else {
      areaResult.classList.add("is-none");
      const words = el("span", "", "We do not list " + typed + " yet. ");
      const ask = el("a", "", "Ask on WhatsApp");
      ask.href = waLink("Hello " + firm + ", do you come to " + typed + "? I need a home service.");
      ask.target = "_blank";
      ask.rel = "noopener";
      words.appendChild(ask);
      words.appendChild(document.createTextNode(", we may still come."));
      areaResult.appendChild(words);
    }
  };
  $("#areaInput").addEventListener("input", checkArea);

  $("#trustPoints").replaceChildren(...TRUST.map((item) => {
    const li = el("li", "point");
    const badge = el("span", "point-ico");
    badge.appendChild(icon(item.icon));
    li.appendChild(badge);
    const words = el("div");
    words.appendChild(el("h3", "", item.name));
    words.appendChild(el("p", "", item.text));
    li.appendChild(words);
    return li;
  }));

  // ---------------------------------------------------------------------
  // Quick facts, worked out from the settings and lists above
  // ---------------------------------------------------------------------
  const setStat = (id, value) => {
    const node = $(id);
    node.textContent = grouped(value);
    node.dataset.count = String(value);
  };
  setStat("#statHomes", CONFIG.homesServed);
  setStat("#statStaff", CONFIG.technicians);
  setStat("#statAreas", areas.length);
  setStat("#statYears", Math.max(1, new Date().getFullYear() - CONFIG.since));

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, counting numbers, header shadow, menu marker
  // ---------------------------------------------------------------------
  const countUp = (node) => {
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) { return; }
    const started = performance.now();
    const duration = 900;
    let done = false;
    const step = (now) => {
      if (done) { return; }
      const t = Math.min(1, (now - started) / duration);
      node.textContent = grouped(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
    // Safety net: always land on the real number, even if the browser pauses the animation.
    window.setTimeout(() => { done = true; node.textContent = grouped(target); }, duration + 150);
  };

  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(Math.min(group.indexOf(node), 6)));
  });
  const showNode = (node) => {
    node.classList.add("is-in");
    $$(".stat-num", node).forEach(countUp);
  };
  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { showNode(entry.target); revealer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((node) => revealer.observe(node));
    // Safety net: if the browser is slow to report what is on screen, show it anyway.
    window.setTimeout(() => {
      reveals.forEach((node) => {
        if (!node.classList.contains("is-in") && node.getBoundingClientRect().top < window.innerHeight) {
          showNode(node);
          revealer.unobserve(node);
        }
      });
    }, 1200);

    const navLinks = $$(".nav a");
    const marker = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) { link.setAttribute("aria-current", "true"); }
          else { link.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.forEach((link) => {
      const section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) { marker.observe(section); }
    });
  } else {
    reveals.forEach((node) => node.classList.add("is-in"));
  }

  const header = $("#top");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------------------
  // Contact form: opens WhatsApp with the message ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const form = $("#enquiry");
  const formError = $("#formError");
  ["AC service or repair", "Pest control", "Deep cleaning", "A yearly care plan (AMC)", "Something else"].forEach((label) => {
    $("#needSelect").appendChild(el("option", "", label));
  });
  // The name box says it has a problem only while the message is showing.
  const showNameError = (on) => {
    formError.hidden = !on;
    if (on) {
      form.elements.name.setAttribute("aria-invalid", "true");
      form.elements.name.setAttribute("aria-describedby", "formError");
    } else {
      form.elements.name.removeAttribute("aria-invalid");
      form.elements.name.removeAttribute("aria-describedby");
    }
  };
  form.elements.name.addEventListener("input", () => showNameError(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"), 60);
    if (!name) {
      showNameError(true);
      form.elements.name.focus();
      return;
    }
    showNameError(false);
    const where = clean(data.get("where"), 60);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I need help with: " + data.get("need") + (where ? ", in " + where : "") + ".",
      "Best time to call me: " + String(data.get("time")).toLowerCase() + "."
    ];
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  renderServices();
  renderSlots();
  renderTicket();
  renderAmc();
  paintOpen();
  paintHeroSlot();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    paintHeroSlot();
    // A slot that has just closed is let go, so the booking never points at it.
    if (booking.start !== null && slotState(booking.ahead, booking.start) === "gone") { booking.start = null; booking.ahead = null; }
    renderSlots();
    renderTicket();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
