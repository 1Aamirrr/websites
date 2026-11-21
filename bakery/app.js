(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Crumb & Cocoa",
    area: "Bandra West",
    city: "Mumbai",
    // Shop number and building. The page adds the area and city after it.
    address: "Shop 4, Sea Breeze Apartments",
    // A short line that helps people find the place. Shown under the headline and with the address.
    landmark: "5 minutes from the station",
    since: 2016,
    // About how many cakes the bakery makes in a month, for the quick facts.
    cakesPerMonth: 1200,
    // Last time to order a cake for the next day, on the 24-hour clock. "18:00" is 6 pm.
    orderBy: "18:00",
    // What an eggless cake costs extra, for each kilo, in rupees. Use 0 if there is no extra charge.
    egglessExtraPerKg: 100,
    // Orders at or above this amount (in rupees) get free delivery. Use 0 for no free delivery.
    freeDeliveryOver: 1500,
    // Part of the price paid by UPI to confirm an order, in percent. Use 0 if no advance is taken.
    advancePercent: 50,
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
  //    "09:00" is 9 am and "22:00" is 10 pm.
  //    Closed all day: write null, for example  Mon: null
  //    Open past midnight: write the real closing time, for example ["09:00", "01:00"].
  //    The "Open now" badge and the hours table both read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["09:00", "22:00"],
    Tue: ["09:00", "22:00"],
    Wed: ["09:00", "22:00"],
    Thu: ["09:00", "22:00"],
    Fri: ["09:00", "22:00"],
    Sat: ["09:00", "22:30"],
    Sun: ["09:00", "22:30"]
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. CAKE SIZES. The buttons above the menu and in the order form.
  //    kg: the weight, written the same way as in the prices below.
  //    serves: how many people one cake of this size is enough for.
  //    START_SIZE is the size picked at first.
  // ---------------------------------------------------------------------
  const SIZES = [
    { kg: "0.5", label: "0.5 kg", serves: "6 to 8 people" },
    { kg: "1", label: "1 kg", serves: "12 to 15 people" },
    { kg: "2", label: "2 kg", serves: "25 to 30 people" }
  ];
  const START_SIZE = "1";

  // ---------------------------------------------------------------------
  // 4. THE MENU.
  //    CATEGORIES are the filter buttons. Each item must use one of them as its type.
  //    Cakes have prices: what the customer pays for 0.5 kg, 1 kg and 2 kg, in rupees.
  //    Cupcakes and brownies have box: how many come in a box, and the price of the box.
  //    eggless: true shows the green "Eggless" tag (the extra cost is set in SETTINGS).
  //    bestseller: true puts the item in the turning carousel at the top (use it on 3 to 6 items).
  //    photo: the Unsplash photo id.   colour: the cake's colour in the drawing in the order form.
  // ---------------------------------------------------------------------
  const CATEGORIES = ["Chocolate", "Fruit", "Classic", "Cheesecakes", "Cupcakes and brownies"];
  // The filter button picked at first. "all" shows the whole menu (long on a phone).
  const START_TYPE = "Chocolate";

  const MENU = [
    { id: "truffle", type: "Chocolate", name: "Belgian Chocolate Truffle", photo: "1578985545062-69928b1d9587", colour: "#4a2a1c",
      text: "Dark chocolate sponge, ganache and a chocolate drip.", prices: { "0.5": 550, "1": 1000, "2": 1900 }, eggless: true, bestseller: true },
    { id: "forest", type: "Chocolate", name: "Black Forest", photo: "1606890737304-57a1ca8a5b62", colour: "#3b2219",
      text: "Chocolate sponge, fresh cream and cherries.", prices: { "0.5": 450, "1": 850, "2": 1600 }, eggless: true, bestseller: true },
    { id: "oreo", type: "Chocolate", name: "Chocolate Oreo Crunch", photo: "1557925923-cd4648e211a0", colour: "#2f2420",
      text: "Cookies and cream between chocolate layers.", prices: { "0.5": 500, "1": 950, "2": 1800 }, eggless: true },
    { id: "strawberry", type: "Fruit", name: "Fresh Strawberry Cream", photo: "1565958011703-44f9829ba187", colour: "#f6c3d0",
      text: "Vanilla sponge, whipped cream and fresh strawberries.", prices: { "0.5": 500, "1": 950, "2": 1800 }, eggless: true, bestseller: true },
    { id: "mango", type: "Fruit", name: "Mango Mousse", photo: "1542826438-bd32f43d626f", colour: "#f2a33a",
      text: "Light mango mousse on a soft vanilla base.", prices: { "0.5": 550, "1": 1050, "2": 2000 }, eggless: true },
    { id: "raspberry", type: "Fruit", name: "Raspberry White Chocolate", photo: "1505976378723-9726b54e9bb9", colour: "#f3dfe4",
      text: "White chocolate cream with raspberry jam inside.", prices: { "0.5": 600, "1": 1150, "2": 2200 }, eggless: false },
    { id: "blueberry", type: "Fruit", name: "Blueberry Vanilla", photo: "1559620192-032c4bc4674e", colour: "#efe6f3",
      text: "Vanilla cream with blueberry filling and berries on top.", prices: { "0.5": 600, "1": 1150, "2": 2200 }, eggless: true },
    { id: "velvet", type: "Classic", name: "Red Velvet", photo: "1586788680434-30d324b2d46f", colour: "#9e1b32",
      text: "Soft red sponge with cream cheese frosting.", prices: { "0.5": 550, "1": 1050, "2": 2000 }, eggless: true, bestseller: true },
    { id: "rainbow", type: "Classic", name: "Rainbow Sprinkle", photo: "1464349095431-e9a21285b5f3", colour: "#fff1f4",
      text: "Six coloured layers. The children's birthday favourite.", prices: { "0.5": 500, "1": 950, "2": 1800 }, eggless: true },
    { id: "pinkdrip", type: "Classic", name: "Pink Drip Birthday", photo: "1621303837174-89787a7d4729", colour: "#f4a7c0",
      text: "Vanilla and strawberry with a pink drip and sprinkles.", prices: { "0.5": 600, "1": 1150, "2": 2200 }, eggless: true },
    { id: "newyork", type: "Cheesecakes", name: "New York Cheesecake", photo: "1524351199678-941a58a3df50", colour: "#f6e5c3",
      text: "Baked cream cheese on a biscuit base.", prices: { "0.5": 650, "1": 1250, "2": 2400 }, eggless: false },
    { id: "bluecheese", type: "Cheesecakes", name: "Blueberry Cheesecake", photo: "1533134242443-d4fd215305ad", colour: "#4b2f6b",
      text: "Chilled cheesecake with a thick blueberry top.", prices: { "0.5": 700, "1": 1350, "2": 2600 }, eggless: true, bestseller: true },
    { id: "tiramisu", type: "Cheesecakes", name: "Tiramisu", photo: "1571877227200-a0d98ea607e9", colour: "#8a6142",
      text: "Coffee-soaked sponge, mascarpone and cocoa.", prices: { "0.5": 700, "1": 1300, "2": 2500 }, eggless: false },
    { id: "cupchoc", type: "Cupcakes and brownies", name: "Chocolate Cupcakes", photo: "1550617931-e17a7b70dce2",
      text: "Chocolate cupcakes with a chocolate swirl.", box: { count: 6, price: 420 }, eggless: true },
    { id: "cupvelvet", type: "Cupcakes and brownies", name: "Red Velvet Cupcakes", photo: "1614707267537-b85aaf00c4b7",
      text: "Red velvet with cream cheese and red crumbs.", box: { count: 6, price: 480 }, eggless: true },
    { id: "brownie", type: "Cupcakes and brownies", name: "Fudge Brownies", photo: "1606313564200-e75d5e30476c",
      text: "Dense, gooey chocolate brownies.", box: { count: 6, price: 360 }, eggless: true, bestseller: true },
    { id: "ferrero", type: "Cupcakes and brownies", name: "Hazelnut Cupcakes", photo: "1603532648955-039310d9ed75",
      text: "Hazelnut cream and a chocolate truffle on top.", box: { count: 6, price: 540 }, eggless: false }
  ];

  // ---------------------------------------------------------------------
  // 5. DELIVERY AREAS. fee: the delivery charge in rupees (0 = free).   time: how long it takes.
  //    The first line is the bakery's own area: the page shows the area name from the link there.
  // ---------------------------------------------------------------------
  const AREAS = [
    { name: "", fee: 0, time: "Within 1 hour" },
    { name: "Bandra East", fee: 40, time: "1 to 2 hours" },
    { name: "Khar West", fee: 40, time: "1 to 2 hours" },
    { name: "Mahim", fee: 60, time: "1 to 2 hours" },
    { name: "Santacruz West", fee: 60, time: "1 to 2 hours" },
    { name: "Juhu", fee: 80, time: "2 hours" },
    { name: "Vile Parle West", fee: 80, time: "2 hours" },
    { name: "Andheri West", fee: 100, time: "2 to 3 hours" }
  ];

  // ---------------------------------------------------------------------
  // 6. GALLERY. id: the Unsplash photo id.   caption: the line shown on the photo.
  //    On phones the first and last photos are shown wide.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { id: "1517433670267-08bbd4be890f", caption: "Our counter, filled every morning" },
    { id: "1555507036-ab1f4038808a", caption: "Butter croissants" },
    { id: "1509440159596-0249088772ff", caption: "Multigrain and sourdough loaves" },
    { id: "1563729784474-d77dbb933a9e", caption: "Strawberry cupcakes" },
    { id: "1558961363-fa8fdf82db35", caption: "Choco-chip cookies" },
    { id: "1535141192574-5d4897c12636", caption: "A two-tier cake for an engagement" }
  ];

  // ---------------------------------------------------------------------
  // 7. A link like  ?firm=Sweet+Tooth&area=Borivali  shows the page
  //    with that bakery name and area, so one sample works for many bakeries.
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const customFirm = clean(params.get("firm") || LEAD.firm, 60);
  const customArea = clean(params.get("area") || LEAD.area, 40);
  const firm = customFirm || CONFIG.firm;
  const area = customArea || CONFIG.area;
  // A bakery in another area (from the link) gets distance bands in place of the Bandra list above.
  const deliveryAreas = customArea
    ? [
      { name: "", fee: 0, time: "Within 1 hour" },
      { name: "Up to 3 km away", fee: 40, time: "1 to 2 hours" },
      { name: "3 to 6 km away", fee: 80, time: "About 2 hours" },
      { name: "6 to 10 km away", fee: 120, time: "2 to 3 hours" }
    ]
    : AREAS;
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

  // One drawn shape (used for the cake drawing in the order form).
  const shape = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  // Prices are in rupees here; owner.js decides how they are shown (rupees, or dirhams for the UAE).
  const money = (window.OWNER && window.OWNER.money) || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const amount = (n) => Math.round(n * money.scale).toLocaleString(money.locale);
  const inr = (n) => money.sign + amount(n);

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const setPressed = (button, on) => {
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  };

  // "18:30" becomes 1110 (minutes after midnight), and 1110 becomes "6:30 pm".
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
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Bakery and cake shop in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about your cakes and prices in " + area + ".");
  });
  $$('[data-wa="order"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to order a cake. Please tell me today's flavours.");
  });
  $$('[data-wa="photo"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want a cake like the one in the photo I am sending here. Please tell me the price.");
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

  // ---------- Words that follow the settings ----------
  const cutoff = toMinutes(CONFIG.orderBy);
  const cutoffWords = clock(cutoff);
  const egglessHalf = CONFIG.egglessExtraPerKg / 2;
  $("#stickerTime").textContent = cutoffWords;
  $("#cutoffText").textContent = cutoffWords;
  $("#faqAdvance").textContent = "Order by " + cutoffWords + " for a cake the next day. Theme cakes, tiers and photo cakes need two to three days.";
  $("#faqEggless").textContent = CONFIG.egglessExtraPerKg > 0
    ? "Most of them, yes. Cakes marked Eggless on the menu can be made without egg for " + inr(CONFIG.egglessExtraPerKg) + " more a kilo. Cupcakes and brownies marked Eggless cost the same."
    : "Most of them, yes. Every item marked Eggless on the menu can be made without egg at the same price.";
  $("#menuNote").textContent = (CONFIG.egglessExtraPerKg > 0
    ? "Eggless cakes cost " + inr(egglessHalf) + " more for half a kilo and " + inr(CONFIG.egglessExtraPerKg) + " more a kilo. "
    : "Eggless cakes cost the same. ") + "Cupcakes and brownies come in boxes. Pay by UPI, card or cash.";
  if (CONFIG.advancePercent > 0) {
    $("#stepPay").textContent = "Pay " + CONFIG.advancePercent + "% by UPI to confirm";
    $("#faqPay").textContent = "Pay " + CONFIG.advancePercent + "% by UPI when you order, and the rest by UPI, card or cash when you get the cake.";
  } else {
    $("#stepPay").textContent = "Pay when you get the cake";
    $("#faqPay").textContent = "Pay when you get the cake, by UPI, card or cash.";
  }
  $("#freeOver").textContent = CONFIG.freeDeliveryOver > 0
    ? "Free delivery on orders above " + inr(CONFIG.freeDeliveryOver)
    : "A small delivery charge, shown for each area";

  // ---------------------------------------------------------------------
  // Timings: the hours table and the live "Open now" badge
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

  // If the shop is open at minute t, the minute it closes. Otherwise null.
  // The second pass (one week back) catches a Sunday night that runs into Monday.
  const closingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    for (const span of spans) {
      for (const shift of [0, -WEEK]) {
        if (inWeek >= span.from + shift && inWeek < span.to + shift) { return t + (span.to + shift - inWeek); }
      }
    }
    return null;
  };

  // The next minute the shop opens after minute t. Null when it never opens.
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
      // Back-to-back hours (a shop that never shuts): keep following to the real closing time.
      let hops = 0;
      while (hops < 8) {
        const later = closingAfter(closes);
        if (later === null) { break; }
        closes = later;
        hops += 1;
      }
      if (hops >= 8) { return { open: true, full: "Open now, 24 hours a day", short: "Open 24 hours" }; }
      return { open: true, full: "Open now, closes at " + clock(closes), short: "Open now until " + clock(closes) };
    }
    const opens = openingAfter(now);
    if (opens === null) { return { open: false, full: "Closed now", short: "Closed now" }; }
    const daysAway = Math.floor(opens / DAY) - today;
    const base = "Closed now, opens at " + clock(opens);
    if (daysAway === 0) { return { open: false, full: base, short: base }; }
    if (daysAway === 1) { return { open: false, full: base + " tomorrow", short: base }; }
    const onDay = base + " on " + DAYS[Math.floor(opens / DAY) % 7].name;
    return { open: false, full: onDay, short: onDay };
  };

  const hoursText = (dayIndex) => {
    const hours = hoursOf(dayIndex);
    if (hours && hours.end - hours.start >= DAY) { return "Open 24 hours"; }
    return hours ? clock(hours.start) + " to " + clock(hours.end) : "Closed";
  };

  const hoursList = $("#hoursList");
  DAYS.forEach((day, i) => {
    const li = el("li");
    const name = el("span", "hours-day", day.name + " ");
    const tag = el("span", "today-tag", "Today");
    tag.hidden = true;
    name.appendChild(tag);
    li.appendChild(name);
    li.appendChild(el("span", "hours-time", hoursText(i)));
    hoursList.appendChild(li);
  });

  // "Mon to Fri: 9 am to 10 pm" and "Sat to Sun: 9 am to 10:30 pm" for the contact card.
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

  // The hours most days share, for the tick under the headline.
  let usual = null;
  const tally = {};
  DAYS.forEach((day, i) => {
    const hours = hoursOf(i);
    if (!hours) { return; }
    const key = hours.start + "-" + hours.end;
    tally[key] = (tally[key] || 0) + 1;
    if (!usual || tally[key] > tally[usual.key]) { usual = { key: key, start: hours.start, end: hours.end }; }
  });
  if (usual) { $("#trustHours").textContent = usual.end - usual.start >= DAY ? "Open 24 hours, 7 days" : "Open " + clock(usual.start) + " to " + clock(usual.end); }

  const paintOpen = () => {
    const now = new Date();
    const status = openStatus(now);
    $$("[data-open-badge]").forEach((node) => {
      node.hidden = false;
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
      const text = node.dataset.openBadge === "full" ? status.full : status.short;
      const label = $("[data-open-text]", node);
      if (label.textContent !== text) { label.textContent = text; }
    });
    const today = todayIndex(now);
    Array.from(hoursList.children).forEach((li, i) => {
      li.classList.toggle("is-today", i === today);
      $(".today-tag", li).hidden = i !== today;
    });
  };

  // ---------------------------------------------------------------------
  // Prices for one item and one size
  // ---------------------------------------------------------------------
  const sizeOf = (kg) => SIZES.find((size) => size.kg === kg) || SIZES[0];
  const priceOf = (item, kg) => (item.box ? item.box.price : item.prices[kg]);
  // "1 kg" for a cake, "box of 6" for cupcakes and brownies.
  const sizeWords = (item, kg) => (item.box ? "box of " + item.box.count : sizeOf(kg).label);
  const egglessExtra = (item, kg) => (item.box || !item.eggless ? 0 : Math.round(CONFIG.egglessExtraPerKg * Number(kg)));
  const typeSlug = (type) => String(type).toLowerCase().replace(/[^a-z0-9]/g, "");

  // The WhatsApp message for ordering one item straight from the menu.
  const orderLink = (item, kg) =>
    waLink("Hello " + firm + ", I want to order: " + item.name + ", " + sizeWords(item, kg) + " (" + inr(priceOf(item, kg)) + "). Please tell me when I can have it.");

  // The small line above a cake name: a colour dot and the type, then the green Eggless mark.
  const tagLine = (item) => {
    const line = el("p", "type-line");
    const dot = el("i", "type-dot type-" + typeSlug(item.type));
    dot.setAttribute("aria-hidden", "true");
    line.appendChild(dot);
    line.appendChild(el("span", "", item.type));
    if (item.eggless) {
      line.appendChild(document.createTextNode(" "));
      const tag = el("span", "tag tag-egg");
      const mark = el("i", "veg-mark");
      mark.setAttribute("aria-hidden", "true");
      tag.appendChild(mark);
      tag.appendChild(document.createTextNode("Eggless"));
      line.appendChild(tag);
    }
    return line;
  };

  const cheapestCake = Math.min(...MENU.filter((item) => !item.box).map((item) => item.prices[SIZES[0].kg]));
  $("#heroFrom").textContent = inr(cheapestCake);

  // ---------------------------------------------------------------------
  // Cake menu: size switch and type filter
  // ---------------------------------------------------------------------
  const menu = {
    kg: SIZES.some((size) => size.kg === START_SIZE) ? START_SIZE : SIZES[0].kg,
    type: CATEGORIES.indexOf(START_TYPE) !== -1 ? START_TYPE : "all"
  };
  const weightSeg = $("#weightSeg");
  const catChips = $("#catChips");
  const cakeList = $("#cakeList");

  const buildCake = (item, index) => {
    const li = el("li", "cake");
    li.style.setProperty("--i", String(index));

    const pic = el("div", "cake-pic");
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.width = 600;
    img.height = 450;
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(item.photo, 600, 450);
    pic.appendChild(img);
    if (item.bestseller) { pic.appendChild(el("span", "cake-flag", "Bestseller")); }
    li.appendChild(pic);

    const body = el("div", "cake-body");
    body.appendChild(tagLine(item));
    body.appendChild(el("h3", "", item.name));
    body.appendChild(el("p", "cake-text", item.text));
    const price = el("p", "cake-price");
    price.appendChild(el("strong", "", inr(priceOf(item, menu.kg))));
    price.appendChild(document.createTextNode(" "));
    price.appendChild(el("span", "", "for " + sizeWords(item, menu.kg)));
    body.appendChild(price);
    li.appendChild(body);

    const actions = el("div", "cake-actions");
    const order = el("a", "btn btn-soft btn-sm");
    order.dataset.ripple = "";
    order.target = "_blank";
    order.rel = "noopener";
    order.href = orderLink(item, menu.kg);
    order.setAttribute("aria-label", "Order on WhatsApp: " + item.name + ", " + sizeWords(item, menu.kg) + ", " + inr(priceOf(item, menu.kg)));
    order.appendChild(icon("wa", true));
    order.appendChild(el("span", "", "Order"));
    actions.appendChild(order);
    // Cakes can also be sent to the order form, to add a message and pick a date.
    if (!item.box) {
      const custom = el("button", "btn btn-ghost btn-sm");
      custom.type = "button";
      custom.setAttribute("aria-label", "Add a message and date: " + item.name);
      custom.appendChild(icon("edit"));
      custom.appendChild(el("span", "", "Add message"));
      custom.addEventListener("click", () => pickForOrder(item.id, menu.kg));
      actions.appendChild(custom);
    }
    li.appendChild(actions);
    return li;
  };

  const renderMenu = () => {
    const rows = MENU.filter((item) => menu.type === "all" || item.type === menu.type);
    cakeList.replaceChildren(...rows.map(buildCake));
    const size = sizeOf(menu.kg);
    const cakeCount = rows.filter((item) => !item.box).length;
    const boxCount = rows.length - cakeCount;
    const parts = [];
    if (cakeCount) { parts.push(cakeCount + (cakeCount === 1 ? " cake" : " cakes") + ", prices for " + size.label); }
    if (boxCount) { parts.push(boxCount + (boxCount === 1 ? " box" : " boxes") + " of cupcakes and brownies"); }
    $("#menuCount").textContent = (menu.type === "all" ? "Everything" : menu.type) + ": " + parts.join(" and ") + ".";
    $("#weightNote").textContent = size.label + " serves " + size.serves + ".";
  };

  // Keep the picked chip in view when the row of chips is wider than the phone.
  const showChip = (button) => {
    const row = button.parentElement;
    row.scrollLeft += button.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - button.offsetWidth) / 2;
  };

  const setMenu = (patch) => {
    Object.assign(menu, patch);
    $$(".seg-btn", weightSeg).forEach((button) => setPressed(button, button.dataset.kg === menu.kg));
    $$(".chip", catChips).forEach((button) => setPressed(button, button.dataset.type === menu.type));
    renderMenu();
    const on = $(".chip.is-on", catChips);
    if (on && patch.type !== undefined) { showChip(on); }
  };

  SIZES.forEach((size) => {
    const button = el("button", "seg-btn", size.label);
    button.type = "button";
    button.dataset.kg = size.kg;
    button.addEventListener("click", () => setMenu({ kg: size.kg }));
    weightSeg.appendChild(button);
  });
  [["all", "All"]].concat(CATEGORIES.map((type) => [type, type])).forEach(([value, label]) => {
    const button = el("button", "chip", label);
    button.type = "button";
    button.dataset.type = value;
    button.addEventListener("click", () => setMenu({ type: value }));
    catChips.appendChild(button);
  });

  // ---------------------------------------------------------------------
  // Bestsellers: the turning carousel (the turning is done by ../fx/fx.js),
  // and the small card on the top photo.
  // ---------------------------------------------------------------------
  const best = MENU.filter((item) => item.bestseller).slice(0, 6);
  const ringTrack = $("#ringTrack");
  if (ringTrack && best.length >= 3) {
    best.forEach((item) => {
      const kg = START_SIZE;
      const card = el("article", "ring-card");
      const top = el("div", "ring-top");
      const img = document.createElement("img");
      img.alt = "";
      img.width = 600;
      img.height = 520;
      img.draggable = false;
      img.addEventListener("error", () => img.remove());
      img.src = photoUrl(item.photo, 600, 520);
      top.appendChild(img);
      top.appendChild(el("strong", "ring-price", inr(priceOf(item, kg))));
      card.appendChild(top);

      const body = el("div", "ring-body");
      body.appendChild(tagLine(item));
      body.appendChild(el("h3", "", item.name));
      body.appendChild(el("p", "ring-meta", "For " + sizeWords(item, kg) + ". " + item.text));
      const order = el("a", "btn btn-brand btn-sm btn-3d");
      order.dataset.ripple = "";
      order.target = "_blank";
      order.rel = "noopener";
      order.draggable = false;
      order.href = orderLink(item, kg);
      order.setAttribute("aria-label", "Order on WhatsApp: " + item.name + ", " + sizeWords(item, kg) + ", " + inr(priceOf(item, kg)));
      order.appendChild(icon("wa", true));
      order.appendChild(el("span", "", "Order on WhatsApp"));
      body.appendChild(order);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  } else if (ringTrack) {
    $("#bestsellers").hidden = true;   // fewer than three bestsellers: no carousel
  }

  const heroItem = best[0] || MENU[0];
  $("#heroBestName").textContent = heroItem.name;
  $("#heroBestText").textContent = inr(priceOf(heroItem, START_SIZE)) + " for " + sizeWords(heroItem, START_SIZE) + (heroItem.eggless ? ", eggless too" : "");

  // ---------------------------------------------------------------------
  // Order form: flavour, size, eggless, message, date, pickup or delivery.
  // The bill and the drawing of the cake update as you fill it in.
  // ---------------------------------------------------------------------
  const form = $("#orderForm");
  const ofFlavour = $("#ofFlavour");
  const ofSize = $("#ofSize");
  const ofHow = $("#ofHow");
  const ofArea = $("#ofArea");
  const ofEggless = $("#ofEggless");
  const ofMessage = $("#ofMessage");
  const ofDate = $("#ofDate");
  const ofName = $("#ofName");
  const orderError = $("#orderError");
  const cakes = MENU.filter((item) => !item.box);
  const order = { id: (best.find((item) => !item.box) || cakes[0]).id, kg: menu.kg, how: "pickup" };
  let billSpeak = 0;

  // Flavours, grouped by type.
  CATEGORIES.forEach((type) => {
    const items = cakes.filter((item) => item.type === type);
    if (!items.length) { return; }
    const group = document.createElement("optgroup");
    group.label = type;
    items.forEach((item) => {
      const option = el("option", "", item.name + (item.eggless ? ", eggless too" : ""));
      option.value = item.id;
      group.appendChild(option);
    });
    ofFlavour.appendChild(group);
  });

  SIZES.forEach((size) => {
    const button = el("button", "seg-btn", size.label);
    button.type = "button";
    button.dataset.kg = size.kg;
    button.addEventListener("click", () => { order.kg = size.kg; paintOrder(); });
    ofSize.appendChild(button);
  });
  [["pickup", "Pickup", "bag"], ["delivery", "Delivery", "truck"]].forEach(([value, label, name]) => {
    const button = el("button", "seg-btn");
    button.type = "button";
    button.dataset.how = value;
    button.appendChild(icon(name));
    button.appendChild(el("span", "", label));
    button.addEventListener("click", () => { order.how = value; paintOrder(); });
    ofHow.appendChild(button);
  });
  const areaName = (spot) => spot.name || area;
  deliveryAreas.forEach((spot, i) => {
    const option = el("option", "", areaName(spot) + " (" + (spot.fee ? inr(spot.fee) : "free") + ")");
    option.value = String(i);
    ofArea.appendChild(option);
  });

  // Dates: the earliest day a cake can be ready. After the order time, the day after tomorrow.
  const isoDate = (date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  const earliest = () => {
    const now = new Date();
    let ahead = now.getHours() * 60 + now.getMinutes() >= cutoff ? 2 : 1;
    const dayAt = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
    // Never offer a day the shop is closed (HOURS says null for that day).
    for (let tries = 0; tries < 7 && !HOURS[DAYS[todayIndex(dayAt(ahead))].key]; tries += 1) { ahead += 1; }
    return dayAt(ahead);
  };
  const dateWords = (value) => {
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || !parts[0]) { return ""; }
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return DAYS[todayIndex(date)].name + ", " + date.getDate() + " " + MONTHS[date.getMonth()];
  };
  // dateMoved: the order time passed while the form was open and the chosen date had to move.
  // The send button then stops once and says so, instead of sending a date the customer did not pick.
  let dateMoved = false;
  const setEarliest = () => {
    const first = isoDate(earliest());
    ofDate.min = first;
    if (!ofDate.value || ofDate.value < first) {
      if (ofDate.value) { dateMoved = true; }
      ofDate.value = first;
    }
    $("#ofDateHint").textContent = "Earliest: " + dateWords(first) + ". Order by " + cutoffWords + " for a cake the next day.";
  };

  // The drawing: a round cake seen from above, with piping round the edge and the message in the middle.
  const view = shape("svg", { viewBox: "0 0 240 240", class: "cake-svg", focusable: "false", "aria-hidden": "true" });
  const defs = shape("defs", {});
  const sheen = shape("radialGradient", { id: "cakeSheen", cx: "36%", cy: "30%", r: "70%" });
  sheen.appendChild(shape("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".32" }));
  sheen.appendChild(shape("stop", { offset: ".6", "stop-color": "#fff", "stop-opacity": "0" }));
  defs.appendChild(sheen);
  view.appendChild(defs);
  view.appendChild(shape("circle", { cx: 120, cy: 120, r: 116, fill: "#fffaf5" }));
  view.appendChild(shape("circle", { cx: 120, cy: 120, r: 108, fill: "none", stroke: "#eadbd0", "stroke-width": "1.5" }));
  view.appendChild(shape("circle", { cx: 120, cy: 125, r: 96, fill: "rgba(42,26,20,.18)" }));
  const cakeTop = shape("circle", { cx: 120, cy: 120, r: 96, class: "cake-top" });
  view.appendChild(cakeTop);
  view.appendChild(shape("circle", { cx: 120, cy: 120, r: 96, fill: "url(#cakeSheen)" }));
  const piping = shape("g", { class: "cake-piping" });
  for (let i = 0; i < 22; i += 1) {
    const angle = (Math.PI * 2 * i) / 22;
    piping.appendChild(shape("circle", { cx: (120 + 85 * Math.cos(angle)).toFixed(1), cy: (120 + 85 * Math.sin(angle)).toFixed(1), r: 7.5 }));
  }
  view.appendChild(piping);
  const words = shape("text", { x: 120, y: 120, "text-anchor": "middle", class: "cake-words" });
  view.appendChild(words);
  $("#cakeView").appendChild(view);

  // Light writing on a dark cake, dark writing on a light one.
  const isDark = (hex) => {
    const n = parseInt(String(hex).replace("#", ""), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
  };
  // Up to three short lines, so the message fits on the cake.
  const splitMessage = (text) => {
    const lines = [];
    text.split(" ").forEach((word) => {
      const last = lines[lines.length - 1];
      if (last !== undefined && (last + " " + word).length <= 13) { lines[lines.length - 1] = last + " " + word; } else { lines.push(word); }
    });
    return lines.slice(0, 3);
  };
  const drawCake = (item, text) => {
    const dark = isDark(item.colour || "#f6e5c3");
    cakeTop.setAttribute("fill", item.colour || "#f6e5c3");
    piping.setAttribute("fill", dark ? "#f3e2d4" : "#ffffff");
    words.setAttribute("fill", dark ? "#fff7ef" : "#7a1d3d");
    const lines = text ? splitMessage(text) : ["Your message"];
    words.classList.toggle("is-empty", !text);
    const longest = Math.max(...lines.map((line) => line.length));
    const size = lines.length >= 3 || longest > 11 ? 24 : lines.length === 2 || longest > 8 ? 28 : 34;
    words.setAttribute("font-size", String(size));
    words.replaceChildren(...lines.map((line, i) => {
      const span = shape("tspan", { x: 120, y: (120 + (i - (lines.length - 1) / 2) * size * 1.05 + size * 0.33).toFixed(1) });
      span.textContent = line;
      return span;
    }));
  };

  const billRow = (label, value, className) => {
    const li = el("li", className || "");
    li.appendChild(el("span", "", label));
    li.appendChild(el("strong", "num", value));
    return li;
  };

  // Works out the whole order: what it is, each charge and the total.
  const orderSums = () => {
    const item = cakes.find((entry) => entry.id === order.id) || cakes[0];
    const base = priceOf(item, order.kg);
    const eggless = item.eggless && ofEggless.checked ? egglessExtra(item, order.kg) : 0;
    const spot = deliveryAreas[Number(ofArea.value) || 0];
    const before = base + eggless;
    const free = CONFIG.freeDeliveryOver > 0 && before >= CONFIG.freeDeliveryOver;
    const fee = order.how === "delivery" ? (free ? 0 : spot.fee) : 0;
    const total = before + fee;
    return { item: item, base: base, eggless: eggless, spot: spot, fee: fee, free: free, total: total,
      advance: Math.ceil((total * CONFIG.advancePercent) / 100) };
  };

  const paintOrder = () => {
    const sums = orderSums();
    const item = sums.item;
    $$(".seg-btn", ofSize).forEach((button) => setPressed(button, button.dataset.kg === order.kg));
    $$(".seg-btn", ofHow).forEach((button) => setPressed(button, button.dataset.how === order.how));
    $("#ofAreaField").hidden = order.how !== "delivery";
    $("#ofSizeHint").textContent = "Serves " + sizeOf(order.kg).serves + ".";

    // Some cakes are only made with egg: the switch turns off and says so.
    ofEggless.disabled = !item.eggless;
    if (!item.eggless) { ofEggless.checked = false; }
    $("#ofEgglessHint").textContent = !item.eggless
      ? "This cake is only made with egg. Pick another flavour for eggless."
      : CONFIG.egglessExtraPerKg > 0 ? "Adds " + inr(egglessExtra(item, order.kg)) + " for " + sizeOf(order.kg).label + "." : "Same price.";

    const text = clean(ofMessage.value, 30);
    $("#ofMessageLeft").textContent = String(30 - ofMessage.value.length);
    drawCake(item, text);

    const rows = [billRow(item.name + ", " + sizeOf(order.kg).label, inr(sums.base))];
    if (sums.eggless) { rows.push(billRow("Eggless", "+ " + inr(sums.eggless))); }
    if (order.how === "delivery") {
      rows.push(billRow("Delivery to " + areaName(sums.spot), sums.fee ? "+ " + inr(sums.fee) : "Free", sums.fee ? "" : "is-free"));
    } else {
      rows.push(billRow("Pickup from the shop", "Free", "is-free"));
    }
    $("#bill").replaceChildren(...rows);
    $("#billTotal").textContent = inr(sums.total);
    let note = CONFIG.advancePercent > 0
      ? "Pay " + inr(sums.advance) + " now by UPI to confirm. The rest when you get the cake."
      : "Pay when you get the cake, by UPI, card or cash.";
    if (order.how === "delivery" && CONFIG.freeDeliveryOver > 0 && !sums.free && sums.spot.fee > 0) {
      note += " Delivery is free above " + inr(CONFIG.freeDeliveryOver) + ".";
    }
    $("#billNote").textContent = note;

    // Screen readers hear the new total once the visitor stops changing things.
    window.clearTimeout(billSpeak);
    billSpeak = window.setTimeout(() => { $("#billLive").textContent = "Total " + inr(sums.total) + "."; }, 500);
  };

  // "Add message" on a menu card: fill the form with that cake and size, then go there.
  function pickForOrder(id, kg) {
    order.id = id;
    order.kg = kg;
    ofFlavour.value = id;
    paintOrder();
    $("#custom").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    window.setTimeout(() => ofMessage.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  }

  ofFlavour.value = order.id;
  ofFlavour.addEventListener("change", () => { order.id = ofFlavour.value; paintOrder(); });
  [ofEggless, ofArea].forEach((field) => field.addEventListener("change", paintOrder));
  ofMessage.addEventListener("input", paintOrder);

  const showOrderError = (text, field) => {
    orderError.textContent = text;
    orderError.hidden = !text;
    [ofName, ofDate].forEach((input) => {
      if (input === field) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "orderError");
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    });
  };
  ofName.addEventListener("input", () => showOrderError("", null));
  ofDate.addEventListener("change", () => { dateMoved = false; showOrderError("", null); });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = clean(ofName.value, 60);
    setEarliest();
    if (dateMoved) {
      dateMoved = false;
      showOrderError("It is past " + cutoffWords + " now, so the earliest date is " + dateWords(ofDate.value) + ". Please check the date and send again.", ofDate);
      ofDate.focus();
      return;
    }
    if (!name) {
      showOrderError("Please type your name so we know who is ordering.", ofName);
      ofName.focus();
      return;
    }
    showOrderError("", null);
    const sums = orderSums();
    const text = clean(ofMessage.value, 30);
    const lines = [
      "Hello " + firm + ", I want to order a cake.",
      "Name: " + name,
      "Cake: " + sums.item.name + ", " + sizeOf(order.kg).label + (sums.eggless ? ", eggless" : ""),
      text ? "Message on the cake: " + text : "",
      "Date: " + dateWords(ofDate.value),
      order.how === "delivery"
        ? "Delivery to: " + areaName(sums.spot) + (sums.fee ? " (" + inr(sums.fee) + ")" : " (free)")
        : "Pickup from the shop",
      "Total shown on the website: " + inr(sums.total),
      "Please confirm and send the UPI details."
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------------------------------------------------------------------
  // Delivery areas
  // ---------------------------------------------------------------------
  $("#areaList").replaceChildren(...deliveryAreas.map((spot, i) => {
    const li = el("li", i === 0 ? "is-home" : "");
    const label = el("div");
    label.appendChild(el("strong", "", areaName(spot) + (i === 0 ? " (our area)" : "")));
    label.appendChild(el("span", "area-time", spot.time));
    li.appendChild(label);
    li.appendChild(el("span", spot.fee ? "area-fee" : "area-fee is-free", spot.fee ? inr(spot.fee) : "Free"));
    return li;
  }));

  // ---------------------------------------------------------------------
  // Gallery and the larger photo window
  // ---------------------------------------------------------------------
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbStage = $("#lbStage");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbIndex = 0;
  let lbOpener = null;

  const lbShow = (index) => {
    lbIndex = (index + GALLERY.length) % GALLERY.length;
    const shot = GALLERY[lbIndex];
    lbImg.style.visibility = "";
    lbImg.alt = shot.caption;
    lbImg.src = photoUrl(shot.id, 1200, 800);
    $("#lbCaption").textContent = shot.caption;
    $("#lbCount").textContent = (lbIndex + 1) + " of " + GALLERY.length;
    // Fetch the following photo early so the arrow feels instant.
    if (GALLERY.length > 1) { new Image().src = photoUrl(GALLERY[(lbIndex + 1) % GALLERY.length].id, 1200, 800); }
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
  lbPrev.hidden = GALLERY.length < 2;
  lbNext.hidden = GALLERY.length < 2;
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

  $("#shots").replaceChildren(...GALLERY.map((shot, i) => {
    const li = el("li", "reveal");
    const button = el("button", "shot");
    button.type = "button";
    button.setAttribute("aria-label", "See larger photo: " + shot.caption);
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.width = 800;
    img.height = 600;
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(shot.id, 800, 600);
    button.appendChild(img);
    button.appendChild(el("span", "shot-cap", shot.caption));
    button.addEventListener("click", () => openLightbox(i, button));
    li.appendChild(button);
    return li;
  }));

  // ---------------------------------------------------------------------
  // Quick facts, worked out from the lists above
  // ---------------------------------------------------------------------
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");
  const setStat = (id, value) => {
    const node = $(id);
    node.textContent = grouped(value);
    node.dataset.count = String(value);
  };
  setStat("#statYears", Math.max(1, new Date().getFullYear() - CONFIG.since));
  setStat("#statCakes", CONFIG.cakesPerMonth);
  setStat("#statFlavours", MENU.length);
  // A bakery from the link gets distance bands, so the fact becomes the delivery distance.
  setStat("#statAreas", customArea ? 10 : deliveryAreas.length);
  if (customArea) { $("#statAreasLabel").textContent = "km delivery radius around the shop"; }

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
  // Enquiry form: opens WhatsApp with the message ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const enquiry = $("#enquiry");
  const formError = $("#formError");
  const needSelect = $("#needSelect");
  ["A theme or photo cake", "A wedding or engagement cake", "Cupcakes or brownies for a party", "A bulk order for an office", "Bread and croissants every morning"].forEach((label) => {
    needSelect.appendChild(el("option", "", label));
  });
  // The name box says it has a problem only while the message is showing.
  const showNameError = (on) => {
    formError.hidden = !on;
    if (on) {
      enquiry.elements.name.setAttribute("aria-invalid", "true");
      enquiry.elements.name.setAttribute("aria-describedby", "formError");
    } else {
      enquiry.elements.name.removeAttribute("aria-invalid");
      enquiry.elements.name.removeAttribute("aria-describedby");
    }
  };
  enquiry.elements.name.addEventListener("input", () => showNameError(false));
  enquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(enquiry);
    const name = clean(data.get("name"), 60);
    if (!name) {
      showNameError(true);
      enquiry.elements.name.focus();
      return;
    }
    showNameError(false);
    const time = clean(data.get("time"), 20);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I am looking for: " + data.get("need") + " in " + area + ".",
      time ? "Best time to reach me: " + time + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  setMenu({});
  setEarliest();
  paintOrder();
  paintOpen();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    setEarliest();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
