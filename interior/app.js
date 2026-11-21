(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Inkwood Interiors",
    area: "Bandra West",
    city: "Mumbai",
    // Studio and building. The page adds the area and city after it.
    address: "Studio 3, 2nd floor, Sea Breeze Building",
    // A short line that helps people find the place. Shown with the address.
    landmark: "Off Hill Road",
    since: 2014,
    // Quick facts.
    homesDone: 340,
    officesDone: 60,
    // Days to finish a usual 2 BHK, counted from design sign-off.
    handoverDays: 45,
    // Warranty on modular woodwork, in years.
    warrantyYears: 10,
    // Starting rate for offices, clinics and shops, in rupees per square foot.
    officeRate: 1450,
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
  // 2. STUDIO HOURS. One line per day: [opens, closes] on the 24-hour clock.
  //    "10:30" is 10:30 am and "19:30" is 7:30 pm.
  //    Closed all day: write null, for example  Sun: null
  //    The "Open now" badge, the contact card and the site visit days all read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["10:30", "19:30"],
    Tue: ["10:30", "19:30"],
    Wed: ["10:30", "19:30"],
    Thu: ["10:30", "19:30"],
    Fri: ["10:30", "19:30"],
    Sat: ["10:30", "19:30"],
    Sun: null
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. RECENT PROJECTS, for the 3D carousel.
  //    id: the Unsplash photo id.   budget: in rupees.   days: from design sign-off to keys.
  // ---------------------------------------------------------------------
  const PROJECTS = [
    { id: "1600607687939-ce8a6c25118c", title: "3 BHK in Bandra West", style: "Warm modern", size: "1,250 sq ft", days: 52, budget: 1840000 },
    { id: "1631679706909-1844bbd07221", title: "1 BHK in Juhu", style: "Soft neutrals", size: "520 sq ft", days: 34, budget: 460000 },
    { id: "1615529182904-14819c35db37", title: "2 BHK in Khar West", style: "Earthy and calm", size: "780 sq ft", days: 44, budget: 760000 },
    { id: "1598928506311-c55ded91a20c", title: "3 BHK in Santacruz", style: "Classic white", size: "1,180 sq ft", days: 55, budget: 1520000 },
    { id: "1617806118233-18e1de247200", title: "2 BHK in Andheri West", style: "Green and oak", size: "820 sq ft", days: 46, budget: 690000 },
    { id: "1600121848594-d8644e57abab", title: "2 BHK in Powai", style: "Grey and walnut", size: "900 sq ft", days: 48, budget: 840000 }
  ];

  // ---------------------------------------------------------------------
  // 4. OUR WORK, by room. room: one of ROOMS (they become the filter buttons).
  //    tall: true shows the photo taller in the grid.
  // ---------------------------------------------------------------------
  const ROOMS = ["Living", "Kitchen", "Bedroom", "Bathroom", "Office"];
  const WORKS = [
    { id: "1616486338812-3dadae4b4ace", room: "Living", caption: "Living room in light oak and linen", tall: true },
    { id: "1565538810643-b5bdb714032a", room: "Kitchen", caption: "Kitchen with a quartz top and brass tap" },
    { id: "1616594039964-ae9021a400a0", room: "Bedroom", caption: "Main bedroom with a dark accent wall" },
    { id: "1584622650111-993a426fbf0a", room: "Bathroom", caption: "Bathroom with a glass shower", tall: true },
    { id: "1600210492486-724fe5c67fb0", room: "Living", caption: "Living room with a gallery wall" },
    { id: "1497366811353-6870744d04b2", room: "Office", caption: "Open office for a team of 30" },
    { id: "1556912173-3bb406ef7e77", room: "Kitchen", caption: "White modular kitchen", tall: true },
    { id: "1505693416388-ac5ce068fe85", room: "Bedroom", caption: "Bedroom with a padded headboard" },
    { id: "1604014237800-1c9102c219da", room: "Living", caption: "Wood-panel TV wall" },
    { id: "1615874959474-d609969a20ed", room: "Bedroom", caption: "Guest bedroom with plants", tall: true },
    { id: "1552321554-5fefe8c9ef14", room: "Bathroom", caption: "Small bathroom, bright and easy to clean" },
    { id: "1524758631624-e2822e304c36", room: "Office", caption: "Meeting corner with soft seating" }
  ];

  // ---------------------------------------------------------------------
  // 5. PACKAGES. Starting prices in rupees for 1, 2 and 3 BHK.
  //    days: how long each home size takes.   popular: true marks the one most people pick.
  //    The same three names are the finishes in the budget estimator below.
  // ---------------------------------------------------------------------
  const BHK_SIZES = { 1: 450, 2: 750, 3: 1100, 4: 1600 };   // usual carpet area in sq ft
  const START_BHK = 2;
  const PACKAGES = [
    {
      name: "Essential", line: "Smart, strong basics for a first home or a rental.",
      prices: { 1: 290000, 2: 450000, 3: 560000 }, days: { 1: 30, 2: 40, 3: 50 }, popular: false,
      includes: ["Modular kitchen in laminate", "A wardrobe in every bedroom", "TV unit and shoe rack", "Lights and painting"]
    },
    {
      name: "Signature", line: "Our most picked look, with richer finishes.",
      prices: { 1: 420000, 2: 650000, 3: 790000 }, days: { 1: 34, 2: 45, 3: 55 }, popular: true,
      includes: ["Everything in Essential", "Kitchen in acrylic with soft-close fittings", "False ceiling with cove lights", "Wall panels and a study unit"]
    },
    {
      name: "Luxe", line: "Made to measure, every piece chosen with you.",
      prices: { 1: 650000, 2: 950000, 3: 1150000 }, days: { 1: 42, 2: 55, 3: 68 }, popular: false,
      includes: ["Everything in Signature", "Veneer and lacquer finishes", "Loose furniture and curtains", "Smart lights you control by phone"]
    }
  ];

  // ---------------------------------------------------------------------
  // 6. BUDGET ESTIMATOR, in rupees, for the Essential finish.
  //    The other finishes multiply these by their factor.
  //    perSpace: charged once for every room in the home (bedrooms + living + kitchen).
  // ---------------------------------------------------------------------
  const ROOM_COST = { living: 85000, kitchen: 110000, main: 80000, bedroom: 65000, bath: 25000 };
  const WHOLE_HOME = [
    { key: "ceiling", name: "False ceiling and lights", perSpace: 18000 },
    { key: "paint", name: "Painting, whole home", perSpace: 12000 }
  ];
  const BATHS = { 1: 1, 2: 2, 3: 3, 4: 3 };
  const FINISHES = [
    { name: "Essential", factor: 1, extraDays: 0, note: "Laminate finishes and branded hardware. Clean, practical and strong." },
    { name: "Signature", factor: 1.45, extraDays: 5, note: "Acrylic and PU finishes, soft-close fittings and cove lighting." },
    { name: "Luxe", factor: 2.1, extraDays: 12, note: "Veneer, lacquer and stone tops, with smart lights and loose furniture." }
  ];
  const START_FINISH = "Signature";

  // ---------------------------------------------------------------------
  // 7. HOW IT WORKS. icon: ruler, cube, swatch, saw, hammer or key.   pay: when money is due.
  // ---------------------------------------------------------------------
  const STEPS = [
    { icon: "ruler", name: "Free site visit", when: "Day 1", text: "A designer measures every room and listens to how you live.", pay: "" },
    { icon: "cube", name: "Design and 3D views", when: "Week 1 to 2", text: "Layouts and 3D views of every room. Change them until they feel right.", pay: "10% to book" },
    { icon: "swatch", name: "Pick materials", when: "Week 2", text: "Choose laminates, fabrics, tiles and handles at the studio. The price is then fixed in writing.", pay: "" },
    { icon: "saw", name: "Made in our factory", when: "Week 3 to 5", text: "Kitchen, wardrobes and units are cut by machine for a clean, tight fit.", pay: "50% when production starts" },
    { icon: "hammer", name: "Site work", when: "Week 3 to 6", text: "Ceiling, wiring, painting and fitting. Photos on WhatsApp every week.", pay: "35% at installation" },
    { icon: "key", name: "Handover", when: "Week 6 to 7", text: "Deep cleaning, a walk-through with you, and your warranty card.", pay: "5% at handover" }
  ];

  // ---------------------------------------------------------------------
  // 8. REVIEWS. These are examples to show the layout. Replace them with real Google reviews.
  // ---------------------------------------------------------------------
  const REVIEWS = [
    { who: "A homeowner", where: "2 BHK, Khar West", text: "They showed us 3D views of every room before we paid anything. The kitchen came out exactly like the drawing." },
    { who: "A young couple", where: "1 BHK, Juhu", text: "Finished in 34 days, as promised. Photos came on WhatsApp every Saturday, so we never had to chase anyone." },
    { who: "A dentist", where: "Clinic, Bandra West", text: "Our clinic was done over three weekends. Patients did not miss a single day of appointments." }
  ];

  // ---------------------------------------------------------------------
  // 9. A link like  ?firm=Casa+Design&area=Thane  shows the page
  //    with that studio name and area, so one sample works for many designers.
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

  // One drawn shape (used for the floor plan).
  const shape = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  // Prices are in rupees here; owner.js decides how they are shown (rupees, or dirhams for the UAE).
  // Big rupee amounts read better in lakh: 6,50,000 shows as "₹6.5 lakh".
  const money = (window.OWNER && window.OWNER.money) || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const amount = (n) => Math.round(n * money.scale).toLocaleString(money.locale);
  const inr = (n) => money.sign + amount(n);
  const price = (n) => {
    if (money.code === "INR" && n >= 100000) {
      return money.sign + String(Math.round(n / 10000) / 10).replace(/\.0$/, "") + " lakh";
    }
    return inr(n);
  };
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");
  const roundTo = (n, step) => Math.round(n / step) * step;

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const setPressed = (button, on) => {
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  };

  // "19:30" becomes 1170 (minutes after midnight), and 1170 becomes "7:30 pm".
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
  document.title = firm + " | Interior designer in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $$("[data-handover]").forEach((node) => { node.textContent = String(CONFIG.handoverDays); });
  $$("[data-warranty]").forEach((node) => { node.textContent = String(CONFIG.warrantyYears); });
  $("#trustWarranty").textContent = CONFIG.warrantyYears + "-year warranty on woodwork";
  $("#officeRate").textContent = inr(CONFIG.officeRate);
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about interior design for my home in " + area + ".");
  });
  $$('[data-wa="visit"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to book a free site visit for my home. Please tell me a good day.");
  });
  $$('[data-wa="office"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to plan the interiors of my office. Size: about ___ sq ft. Please call me.");
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
  // Studio hours and the live "Open now" badge
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

  // If the studio is open at minute t, the minute it closes. Otherwise null.
  const closingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    for (const span of spans) {
      for (const shift of [0, -WEEK]) {
        if (inWeek >= span.from + shift && inWeek < span.to + shift) { return t + (span.to + shift - inWeek); }
      }
    }
    return null;
  };

  // The next minute the studio opens after minute t. Null when it never opens.
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
      return { open: true, short: "Studio open now until " + clock(closes) };
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

  // "Mon to Sat: 10:30 am to 7:30 pm" and "Sun: Closed" for the contact card.
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

  // The next open days for a site visit. Today counts only if there are two hours left.
  const visitDays = (limit) => {
    const now = new Date();
    const list = [];
    for (let ahead = 0; ahead < 14 && list.length < limit; ahead += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      const hours = hoursOf(todayIndex(date));
      if (!hours) { continue; }
      if (ahead === 0 && now.getHours() * 60 + now.getMinutes() > hours.end - 120) { continue; }
      list.push({ date: date, ahead: ahead, word: ahead === 0 ? "Today" : ahead === 1 ? "Tomorrow" : DAYS[todayIndex(date)].name });
    }
    return list;
  };
  const paintVisitChip = () => {
    const next = visitDays(1)[0];
    $("#heroVisit").textContent = next ? "Next free site visit: " + next.word + ", " + shortDate(next.date) : "Free site visits every week";
  };

  // ---------------------------------------------------------------------
  // Recent projects: the 3D carousel. The turning is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const ringTrack = $("#ringTrack");
  if (ringTrack && PROJECTS.length >= 3) {
    PROJECTS.forEach((project) => {
      const card = el("article", "ring-card");
      const photo = el("div", "ring-photo");
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.draggable = false;
      img.width = 600;
      img.height = 420;
      img.addEventListener("error", () => img.remove());
      img.src = photoUrl(project.id, 600, 420);
      photo.appendChild(img);
      photo.appendChild(el("span", "ring-style", project.style));
      card.appendChild(photo);

      const body = el("div", "ring-body");
      body.appendChild(el("h3", "", project.title));
      const facts = el("ul", "ring-facts");
      [["Size", project.size], ["Time", project.days + " days"], ["Budget", price(project.budget)]].forEach(([k, v]) => {
        const li = el("li");
        li.appendChild(el("small", "", k));
        li.appendChild(el("strong", "", v));
        facts.appendChild(li);
      });
      body.appendChild(facts);
      const ask = el("a", "btn btn-brand btn-sm btn-3d");
      ask.dataset.ripple = "";
      ask.target = "_blank";
      ask.rel = "noopener";
      ask.draggable = false;
      ask.href = waLink("Hello " + firm + ", I liked your " + project.title + " project (" + project.style.toLowerCase() + "). I want something similar for my home.");
      ask.setAttribute("aria-label", "Ask on WhatsApp about a home like " + project.title);
      ask.appendChild(icon("wa", true));
      ask.appendChild(el("span", "", "I want a home like this"));
      body.appendChild(ask);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  } else if (ringTrack) {
    $("#projects").hidden = true;
  }

  // ---------------------------------------------------------------------
  // Our work, room by room, and the larger photo window
  // ---------------------------------------------------------------------
  const works = $("#works");
  const roomChips = $("#roomChips");
  let room = "all";
  let shown = WORKS.slice();

  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbStage = $("#lbStage");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbIndex = 0;
  let lbOpener = null;

  const lbShow = (index) => {
    lbIndex = (index + shown.length) % shown.length;
    const shot = shown[lbIndex];
    lbImg.style.visibility = "";
    lbImg.alt = shot.caption;
    lbImg.src = photoUrl(shot.id, 1200, 800);
    $("#lbCaption").textContent = shot.room + ": " + shot.caption;
    $("#lbCount").textContent = (lbIndex + 1) + " of " + shown.length;
    lbPrev.hidden = shown.length < 2;
    lbNext.hidden = shown.length < 2;
    // Fetch the following photo early so the arrow feels instant.
    if (shown.length > 1) { new Image().src = photoUrl(shown[(lbIndex + 1) % shown.length].id, 1200, 800); }
  };
  lbImg.addEventListener("error", () => { lbImg.style.visibility = "hidden"; });

  const openLightbox = (index, opener) => {
    lbOpener = opener;
    lbShow(index);
    if (!lightbox.open) {
      if (typeof lightbox.showModal === "function") { lightbox.showModal(); } else { lightbox.setAttribute("open", ""); }
    }
    document.documentElement.classList.add("is-locked");
  };
  // Tidy up straight away when the window closes. The browser's own "close" message can
  // arrive a little late, so the close button and the Escape key do not wait for it.
  const unlockPage = () => document.documentElement.classList.remove("is-locked");
  const onLightboxClosed = () => {
    unlockPage();
    if (lbOpener) { lbOpener.focus(); }
    lbOpener = null;
  };
  const closeLightbox = () => {
    if (typeof lightbox.close === "function" && lightbox.open) { lightbox.close(); } else { lightbox.removeAttribute("open"); }
    onLightboxClosed();
  };
  lightbox.addEventListener("cancel", unlockPage);
  lightbox.addEventListener("close", onLightboxClosed);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) { closeLightbox(); } });
  $("#lbClose").addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => lbShow(lbIndex - 1));
  lbNext.addEventListener("click", () => lbShow(lbIndex + 1));
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); lbShow(lbIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); lbShow(lbIndex - 1); }
  });
  // A finger swipe left or right also moves between photos.
  let swipeFrom = null;
  lbStage.addEventListener("touchstart", (event) => { swipeFrom = event.changedTouches[0].clientX; }, { passive: true });
  lbStage.addEventListener("touchend", (event) => {
    if (swipeFrom === null) { return; }
    const moved = event.changedTouches[0].clientX - swipeFrom;
    swipeFrom = null;
    if (Math.abs(moved) > 40) { lbShow(lbIndex + (moved < 0 ? 1 : -1)); }
  }, { passive: true });

  const renderWorks = () => {
    shown = WORKS.filter((work) => room === "all" || work.room === room);
    works.replaceChildren(...shown.map((work, i) => {
      const li = el("li", work.tall ? "work is-tall" : "work");
      li.style.setProperty("--i", String(i));
      const button = el("button", "shot");
      button.type = "button";
      button.setAttribute("aria-label", "See larger photo: " + work.room + ", " + work.caption);
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.width = 700;
      img.height = work.tall ? 900 : 520;
      img.addEventListener("error", () => img.remove());
      img.src = photoUrl(work.id, 700, work.tall ? 900 : 520);
      button.appendChild(img);
      const cap = el("span", "shot-cap");
      cap.appendChild(el("small", "", work.room));
      cap.appendChild(el("span", "", work.caption));
      button.appendChild(cap);
      button.addEventListener("click", () => openLightbox(i, button));
      li.appendChild(button);
      return li;
    }));
    $$(".chip", roomChips).forEach((button) => setPressed(button, button.dataset.room === room));
    $("#roomCount").textContent = room === "all"
      ? shown.length + " photos from finished homes and offices"
      : shown.length + " " + room.toLowerCase() + " photo" + (shown.length === 1 ? "" : "s");
  };

  [["all", "All rooms", WORKS.length]].concat(ROOMS.map((name) => [name, name, WORKS.filter((w) => w.room === name).length]))
    .filter((entry) => entry[2] > 0)
    .forEach(([value, label, count]) => {
      const button = el("button", "chip", label);
      button.type = "button";
      button.dataset.room = value;
      button.appendChild(el("span", "chip-count", String(count)));
      button.addEventListener("click", () => { room = value; renderWorks(); });
      roomChips.appendChild(button);
    });

  // ---------------------------------------------------------------------
  // Packages and the home size switch
  // ---------------------------------------------------------------------
  const planGrid = $("#planGrid");
  const bhkSeg = $("#bhkSeg");
  const packageSizes = Object.keys(PACKAGES[0].prices).map(Number);
  let bhk = packageSizes.indexOf(START_BHK) !== -1 ? START_BHK : packageSizes[0];

  const buildPackage = (pack) => {
    const total = pack.prices[bhk];
    const card = el("article", pack.popular ? "plan is-popular" : "plan");
    card.dataset.tilt = "";
    card.dataset.tiltMax = "5";
    if (pack.popular) { card.appendChild(el("span", "plan-flag", "Most picked")); }

    const head = el("div");
    head.appendChild(el("h3", "plan-name", pack.name));
    head.appendChild(el("p", "plan-line", pack.line));
    card.appendChild(head);

    const cost = el("p", "plan-price");
    cost.appendChild(el("span", "plan-from", "From"));
    cost.appendChild(el("strong", "", price(total)));
    card.appendChild(cost);
    const sub = el("p", "plan-sub");
    sub.appendChild(el("span", "", "For a " + bhk + " BHK, about " + inr(total / BHK_SIZES[bhk]) + " a sq ft"));
    sub.appendChild(el("span", "plan-days", "Ready in about " + pack.days[bhk] + " days"));
    card.appendChild(sub);

    const list = el("ul", "plan-list");
    pack.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    card.appendChild(list);

    // Only the popular package gets the filled button, so the eye knows where to go first.
    const ask = el("a", pack.popular ? "btn btn-brass btn-3d" : "btn btn-ghost");
    ask.dataset.ripple = "";
    ask.target = "_blank";
    ask.rel = "noopener";
    ask.href = waLink("Hello " + firm + ", I like the " + pack.name + " package for my " + bhk + " BHK (from " + price(total) + "). Please book a free site visit.");
    ask.setAttribute("aria-label", "Ask on WhatsApp: " + pack.name + " package, " + bhk + " BHK, from " + price(total));
    ask.appendChild(icon("wa", true));
    ask.appendChild(el("span", "", "Ask for this package"));
    card.appendChild(ask);
    return card;
  };

  const setBhk = (count) => {
    bhk = count;
    $$(".seg-btn", bhkSeg).forEach((button) => setPressed(button, Number(button.dataset.bhk) === bhk));
    planGrid.replaceChildren(...PACKAGES.map(buildPackage));
    $("#bhkNote").textContent = "Starting prices for a " + bhk + " BHK of about " + grouped(BHK_SIZES[bhk]) + " sq ft.";
  };
  packageSizes.forEach((count) => {
    const button = el("button", "seg-btn", count + " BHK");
    button.type = "button";
    button.dataset.bhk = String(count);
    button.addEventListener("click", () => setBhk(count));
    bhkSeg.appendChild(button);
  });
  const lowestPackage = Math.min(...PACKAGES.map((pack) => Math.min(...packageSizes.map((n) => pack.prices[n]))));
  $("#heroFrom").textContent = price(lowestPackage);

  // ---------------------------------------------------------------------
  // Budget estimator and the drawn floor plan
  // ---------------------------------------------------------------------
  const est = { bhk: START_BHK, finish: FINISHES.find((f) => f.name === START_FINISH) || FINISHES[0], off: new Set() };
  const estBhk = $("#estBhk");
  const estFinish = $("#estFinish");
  const roomPicks = $("#roomPicks");
  const planDraw = $("#planDraw");

  // The rooms of a home of this size, in plan order.
  const roomsFor = (count) => {
    const list = [
      { key: "living", name: "Living and dining", short: "Living", cost: ROOM_COST.living },
      { key: "kitchen", name: "Kitchen", short: "Kitchen", cost: ROOM_COST.kitchen },
      { key: "bed1", name: "Main bedroom", short: "Main bed", cost: ROOM_COST.main, bed: true }
    ];
    for (let n = 2; n <= count; n += 1) { list.push({ key: "bed" + n, name: "Bedroom " + n, short: "Bed " + n, cost: ROOM_COST.bedroom, bed: true }); }
    for (let n = 1; n <= BATHS[count]; n += 1) { list.push({ key: "bath" + n, name: "Bathroom " + n, short: "Bath", cost: ROOM_COST.bath, bath: true }); }
    return list;
  };

  // The sums for the current choices.
  const estimate = () => {
    const rooms = roomsFor(est.bhk);
    const spaces = est.bhk + 2;
    const items = rooms.map((r) => ({ key: r.key, name: r.name, cost: r.cost * est.finish.factor }))
      .concat(WHOLE_HOME.map((w) => ({ key: w.key, name: w.name, cost: w.perSpace * spaces * est.finish.factor })))
      .filter((item) => !est.off.has(item.key));
    const sum = items.reduce((total, item) => total + item.cost, 0);
    const roomCount = rooms.filter((r) => !est.off.has(r.key)).length;
    const days = 16 + roomCount * 4 + (est.off.has("ceiling") ? 0 : 4) + (est.off.has("paint") ? 0 : 3) + est.finish.extraDays;
    return { rooms: rooms, items: items, low: roundTo(sum * 0.92, 5000), high: roundTo(sum * 1.1, 5000), weeks: Math.max(2, Math.round(days / 7)) };
  };

  // The floor plan: living and kitchen on top, bedrooms below, bathrooms stacked on the right.
  const PLAN = { x: 8, y: 8, w: 304, h: 204, split: 104, kitchenW: 112, bathW: 64 };
  const drawPlan = (sums) => {
    const svg = shape("svg", { viewBox: "0 0 320 220", class: "plan-svg", focusable: "false" });
    const boxes = [];
    const right = PLAN.x + PLAN.w;
    const bottom = PLAN.y + PLAN.h;
    const mid = PLAN.y + PLAN.split;
    boxes.push({ key: "living", x: PLAN.x, y: PLAN.y, w: PLAN.w - PLAN.kitchenW, h: PLAN.split });
    boxes.push({ key: "kitchen", x: right - PLAN.kitchenW, y: PLAN.y, w: PLAN.kitchenW, h: PLAN.split });
    const beds = sums.rooms.filter((r) => r.bed);
    const baths = sums.rooms.filter((r) => r.bath);
    const bedW = (PLAN.w - PLAN.bathW) / beds.length;
    beds.forEach((r, i) => boxes.push({ key: r.key, x: PLAN.x + i * bedW, y: mid, w: bedW, h: bottom - mid }));
    const bathH = (bottom - mid) / baths.length;
    baths.forEach((r, i) => boxes.push({ key: r.key, x: right - PLAN.bathW, y: mid + i * bathH, w: PLAN.bathW, h: bathH }));

    boxes.forEach((box) => {
      const roomInfo = sums.rooms.find((r) => r.key === box.key);
      const on = !est.off.has(box.key);
      const g = shape("g", { class: on ? "room is-on" : "room" });
      g.appendChild(shape("rect", { x: box.x, y: box.y, width: box.w, height: box.h, class: "room-fill" }));
      const label = shape("text", { x: (box.x + box.w / 2).toFixed(1), y: (box.y + box.h / 2 + 4).toFixed(1), "text-anchor": "middle", class: "room-label" });
      // In a 4 BHK the bedroom boxes are narrow, so "Main bed" becomes "Bed 1".
      label.textContent = box.w < 72 && roomInfo.key === "bed1" ? "Bed 1" : roomInfo.short;
      g.appendChild(label);
      svg.appendChild(g);
    });
    // Outer walls drawn last, thicker, so the plan reads as one home.
    svg.appendChild(shape("rect", { x: PLAN.x, y: PLAN.y, width: PLAN.w, height: PLAN.h, class: "plan-wall" }));
    // Door gaps on the inner wall between the living room and each bedroom.
    beds.forEach((r, i) => {
      const cx = PLAN.x + i * bedW + bedW / 2;
      svg.appendChild(shape("line", { x1: (cx - 11).toFixed(1), y1: mid, x2: (cx + 11).toFixed(1), y2: mid, class: "plan-door" }));
    });
    planDraw.replaceChildren(svg);
    const doneRooms = sums.rooms.filter((r) => !est.off.has(r.key)).map((r) => r.name);
    planDraw.setAttribute("aria-label", "Floor plan of a " + est.bhk + " BHK. Rooms to design: " + (doneRooms.length ? doneRooms.join(", ") : "none") + ".");
  };

  const renderEstimate = () => {
    const sums = estimate();
    $$(".seg-btn", estBhk).forEach((button) => setPressed(button, Number(button.dataset.bhk) === est.bhk));
    $$(".seg-btn", estFinish).forEach((button) => setPressed(button, button.dataset.finish === est.finish.name));
    $("#finishNote").textContent = est.finish.note;

    // Room toggles: every room of this home size, then the whole-home jobs.
    const options = sums.rooms.map((r) => ({ key: r.key, name: r.name, cost: r.cost * est.finish.factor }))
      .concat(WHOLE_HOME.map((w) => ({ key: w.key, name: w.name, cost: w.perSpace * (est.bhk + 2) * est.finish.factor })));
    roomPicks.replaceChildren(...options.map((option) => {
      const li = el("li");
      const button = el("button", "room-pick");
      button.type = "button";
      setPressed(button, !est.off.has(option.key));
      button.appendChild(el("span", "pick-box", ""));
      $(".pick-box", button).appendChild(icon("check"));
      const words = el("span", "pick-words");
      words.appendChild(el("strong", "", option.name));
      words.appendChild(el("span", "", price(roundTo(option.cost, 1000))));
      button.appendChild(words);
      button.addEventListener("click", () => {
        if (est.off.has(option.key)) { est.off.delete(option.key); } else { est.off.add(option.key); }
        renderEstimate();
        const again = $$(".room-pick", roomPicks)[options.indexOf(option)];
        if (again) { again.focus(); }
      });
      li.appendChild(button);
      return li;
    }));

    drawPlan(sums);
    const any = sums.items.length > 0;
    $("#estTotal").textContent = any ? price(sums.low) + " to " + price(sums.high) : "Pick at least one room";
    $("#estTime").textContent = any ? "About " + sums.weeks + " weeks from design sign-off, " + est.finish.name + " finish" : "";
    $("#estLines").replaceChildren(...sums.items.map((item) => {
      const li = el("li");
      li.appendChild(el("span", "", item.name));
      li.appendChild(el("strong", "", price(roundTo(item.cost, 1000))));
      return li;
    }).concat(any ? [(() => {
      const li = el("li", "est-free");
      li.appendChild(el("span", "", "Design and 3D views"));
      li.appendChild(el("strong", "", "Free"));
      return li;
    })()] : []));

    const wa = $("#estWa");
    if (any) { wa.removeAttribute("aria-disabled"); } else { wa.setAttribute("aria-disabled", "true"); wa.removeAttribute("href"); }
    if (any) wa.href = waLink([
      "Hello " + firm + ", I used the budget estimator on your website.",
      "Home: " + est.bhk + " BHK, " + est.finish.name + " finish.",
      "Rooms: " + sums.items.map((item) => item.name).join(", ") + ".",
      "Estimate: " + price(sums.low) + " to " + price(sums.high) + ", about " + sums.weeks + " weeks.",
      "I want a free site visit."
    ].join("\n"));

    // The contact form follows the home size picked here.
    const space = $("#spaceSelect");
    if (space && !space.dataset.touched) { space.value = SPACES[Math.min(est.bhk, 4) - 1]; }
  };

  const SPACES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK or a villa", "Office, clinic or shop"];
  [1, 2, 3, 4].forEach((count) => {
    const button = el("button", "seg-btn", count + " BHK");
    button.type = "button";
    button.dataset.bhk = String(count);
    button.addEventListener("click", () => {
      est.bhk = count;
      // Rooms that do not exist in the new home size are forgotten; the others keep their choice.
      const exists = new Set(roomsFor(count).map((r) => r.key));
      Array.from(est.off).forEach((key) => { if (/^(bed|bath)\d/.test(key) && !exists.has(key)) { est.off.delete(key); } });
      renderEstimate();
    });
    estBhk.appendChild(button);
  });
  FINISHES.forEach((finish) => {
    const button = el("button", "seg-btn", finish.name);
    button.type = "button";
    button.dataset.finish = finish.name;
    button.addEventListener("click", () => { est.finish = finish; renderEstimate(); });
    estFinish.appendChild(button);
  });

  // ---------------------------------------------------------------------
  // How it works, and the reviews
  // ---------------------------------------------------------------------
  $("#steps").replaceChildren(...STEPS.map((step, i) => {
    const li = el("li", "step");
    const top = el("div", "step-top");
    const badge = el("span", "step-ico");
    badge.appendChild(icon(step.icon));
    top.appendChild(badge);
    top.appendChild(el("span", "step-n", String(i + 1).padStart(2, "0")));
    li.appendChild(top);
    li.appendChild(el("p", "step-when", step.when));
    li.appendChild(el("h3", "", step.name));
    li.appendChild(el("p", "step-text", step.text));
    if (step.pay) { li.appendChild(el("p", "step-pay", step.pay)); }
    return li;
  }));

  $("#reviewList").replaceChildren(...REVIEWS.map((review) => {
    const li = el("li", "review");
    const top = el("div", "review-top");
    top.appendChild(el("span", "review-tag", "Example review"));
    const stars = el("span", "review-stars");
    stars.setAttribute("aria-hidden", "true");
    for (let n = 0; n < 5; n += 1) { stars.appendChild(icon("star", true)); }
    top.appendChild(stars);
    li.appendChild(top);
    li.appendChild(el("p", "review-text", review.text));
    const who = el("p", "review-who");
    who.appendChild(el("strong", "", review.who));
    who.appendChild(el("span", "", review.where));
    li.appendChild(who);
    return li;
  }));

  // ---------------------------------------------------------------------
  // Quick facts, worked out from the settings
  // ---------------------------------------------------------------------
  const setStat = (id, value) => {
    const node = $(id);
    node.textContent = grouped(value);
    node.dataset.count = String(value);
  };
  setStat("#statHomes", CONFIG.homesDone);
  setStat("#statOffices", CONFIG.officesDone);
  setStat("#statDays", CONFIG.handoverDays);
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
  // Site visit form: opens WhatsApp with the message ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const form = $("#enquiry");
  const formError = $("#formError");
  const spaceSelect = $("#spaceSelect");
  SPACES.forEach((label) => spaceSelect.appendChild(el("option", "", label)));
  spaceSelect.addEventListener("change", () => { spaceSelect.dataset.touched = "1"; });
  ["Not sure yet", "Under " + price(500000), price(500000) + " to " + price(1000000),
    price(1000000) + " to " + price(2000000), "Above " + price(2000000)].forEach((label) => {
    $("#budgetSelect").appendChild(el("option", "", label));
  });
  const fillDays = () => {
    const select = $("#daySelect");
    const keep = select.value;
    const options = visitDays(6).map((d) => d.word + ", " + shortDate(d.date));
    if (!options.length) { options.push("Any day that suits you"); }
    select.replaceChildren(...options.map((text) => el("option", "", text)));
    if (options.indexOf(keep) !== -1) { select.value = keep; }
  };
  fillDays();

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
    const where = clean(data.get("where"), 80);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I want a free site visit for my " + data.get("space") + (where ? " in " + where : "") + ".",
      "The flat is: " + String(data.get("status")).toLowerCase() + ".",
      "Budget: " + data.get("budget") + ".",
      "A good day for me: " + data.get("day") + "."
    ];
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  setBhk(bhk);
  renderWorks();
  renderEstimate();
  paintOpen();
  paintVisitChip();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    paintVisitChip();
    fillDays();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
