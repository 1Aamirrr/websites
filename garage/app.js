(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Torqline Auto Care",
    area: "Chembur",
    city: "Mumbai",
    // Shop and building. The page adds the area and city after it.
    address: "Shop 4, Ganesh Industrial Estate",
    // A short line that helps people find the place. Shown with the address.
    landmark: "5 minutes from the station",
    since: 2012,
    // Cars and bikes serviced so far, and mechanics on the floor, for the quick facts.
    jobsDone: 18000,
    mechanics: 9,
    // Free pick-up and drop inside this many kilometres.
    pickupKm: 5,
    // Warranty on every service, in kilometres (and 30 days).
    warrantyKm: 1000,
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
  //    "09:00" is 9 am and "20:00" is 8 pm.
  //    Closed all day: write null, for example  Sun: null
  //    The "Open now" badge, the hours table and the booking days all read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["09:00", "20:00"],
    Tue: ["09:00", "20:00"],
    Wed: ["09:00", "20:00"],
    Thu: ["09:00", "20:00"],
    Fri: ["09:00", "20:00"],
    Sat: ["09:00", "20:00"],
    Sun: ["10:00", "14:00"]
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. VEHICLES. The size buttons above the prices.
  //    kind: "car" or "bike".   like: a few common models, shown under the buttons.
  //    START_VEHICLE is the one picked when the page opens.
  // ---------------------------------------------------------------------
  const VEHICLES = [
    { key: "hatch", kind: "car", label: "Hatchback", like: "Swift, i20, Tiago" },
    { key: "sedan", kind: "car", label: "Sedan", like: "Dzire, City, Verna" },
    { key: "suv", kind: "car", label: "SUV", like: "Creta, Nexon, XUV700" },
    { key: "scooter", kind: "bike", label: "Scooter", like: "Activa, Jupiter, Access" },
    { key: "bike", kind: "bike", label: "Bike up to 200cc", like: "Splendor, Pulsar, Shine" },
    { key: "big", kind: "bike", label: "Bike above 200cc", like: "Classic 350, Duke, Himalayan" }
  ];
  const START_VEHICLE = "sedan";

  // ---------------------------------------------------------------------
  // 4. SERVICES AND PRICES, in rupees.
  //    prices: [lowest, highest] for each vehicle size above. Leave a size out if you do not do it.
  //    unit: for a price per piece (like "panel"). The estimate then asks how many.
  //    ready: how long it takes. 0 = 2 to 3 hours, 1 = same day, 2 = 2 days, 3 = 3 to 4 days.
  //    popular: true marks the job most people book (one per kind).
  //    icon: wrench, snow, spray, tyre, battery, drop, oil or brake.
  // ---------------------------------------------------------------------
  const SERVICES = [
    {
      id: "general", kind: "car", icon: "wrench", name: "General service", popular: true, ready: 1,
      line: "The full service your owner's manual asks for.",
      prices: { hatch: [2499, 3499], sedan: [2999, 4199], suv: [3699, 5499] },
      includes: ["Engine oil and oil filter", "40-point check with a report", "Wash and vacuum"]
    },
    {
      id: "ac", kind: "car", icon: "snow", name: "AC service", ready: 0,
      line: "For an AC that is slow to cool or smells.",
      prices: { hatch: [1499, 2499], sedan: [1699, 2799], suv: [1999, 3299] },
      includes: ["Gas check and top-up", "Cooling coil and filter cleaned", "Leak test"]
    },
    {
      id: "dent", kind: "car", icon: "spray", name: "Denting and painting", unit: "panel", ready: 2,
      line: "Dents and scratches gone, colour matched by computer.",
      prices: { hatch: [2200, 3000], sedan: [2500, 3400], suv: [2800, 3900] },
      includes: ["Dent pulled and filled", "Paint matched to your car", "Polish to blend it in"]
    },
    {
      id: "wheels", kind: "car", icon: "tyre", name: "Wheel alignment and balancing", ready: 0,
      line: "For a car that pulls to one side or shakes at speed.",
      prices: { hatch: [599, 899], sedan: [699, 999], suv: [899, 1299] },
      includes: ["Computer wheel alignment", "Balancing on all four wheels", "Tyre pressure and wear check"]
    },
    {
      id: "battery", kind: "car", icon: "battery", name: "New battery", ready: 0,
      line: "Free battery check. A new one fitted if it is weak.",
      prices: { hatch: [3800, 5500], sedan: [4500, 6800], suv: [5500, 9500] },
      includes: ["Branded battery with warranty", "Old battery taken back", "Charging system check"]
    },
    {
      id: "wash", kind: "car", icon: "drop", name: "Foam wash and interior cleaning", ready: 0,
      line: "Outside and inside, seats and mats included.",
      prices: { hatch: [699, 1199], sedan: [799, 1399], suv: [999, 1699] },
      includes: ["Foam wash and wax", "Seats, roof and mats cleaned", "Dashboard polish"]
    },
    {
      id: "bgeneral", kind: "bike", icon: "wrench", name: "General service", popular: true, ready: 0,
      line: "Everything your bike needs every 3,000 km.",
      prices: { scooter: [599, 899], bike: [699, 999], big: [1499, 2499] },
      includes: ["Engine oil change", "Brakes, chain and clutch set", "Wash and polish"]
    },
    {
      id: "boil", kind: "bike", icon: "oil", name: "Engine oil change", ready: 0,
      line: "Just the oil, done while you wait.",
      prices: { scooter: [349, 499], bike: [399, 599], big: [899, 1499] },
      includes: ["Oil of the right grade", "Oil level and leak check", "Done in 30 minutes"]
    },
    {
      id: "bbrake", kind: "bike", icon: "brake", name: "Brakes and clutch", ready: 0,
      line: "For brakes that squeak or a clutch that slips.",
      prices: { scooter: [299, 799], bike: [399, 999], big: [699, 1799] },
      includes: ["Brake shoes or pads checked", "Clutch cable and plates set", "Road test after work"]
    },
    {
      id: "btyre", kind: "bike", icon: "tyre", name: "New tyre", unit: "tyre", ready: 0,
      line: "Tubeless tyres of trusted brands, fitted while you wait.",
      prices: { scooter: [1300, 1900], bike: [1500, 2400], big: [3500, 6500] },
      includes: ["Tyre fitted and balanced", "Old tyre taken back", "Free puncture check for a month"]
    },
    {
      id: "bwash", kind: "bike", icon: "drop", name: "Wash and polish", ready: 0,
      line: "Back to showroom shine.",
      prices: { scooter: [199, 349], bike: [249, 399], big: [399, 699] },
      includes: ["Foam wash", "Chain cleaned and oiled", "Body polish"]
    }
  ];
  const READY = ["Ready in 2 to 3 hours", "Ready the same day", "Ready in 2 days", "Ready in 3 to 4 days"];

  // ---------------------------------------------------------------------
  // 5. WHY PEOPLE TRUST US. icon: camera, box, tag, shield, chat or rupee.
  // ---------------------------------------------------------------------
  const WHY = [
    { icon: "camera", name: "Photos before extra work", text: "Found something else? You get a photo and the price first. No yes, no work." },
    { icon: "box", name: "Old parts handed back", text: "Every part we change goes back in your boot, so you can see it." },
    { icon: "tag", name: "Price fixed before work", text: "The price we agree on WhatsApp is the price on the bill." },
    { icon: "shield", name: "Warranty on every job", text: "" },
    { icon: "chat", name: "Updates on WhatsApp", text: "Picked up, checked, working, ready. You always know where your car is." },
    { icon: "rupee", name: "Pay after you check", text: "UPI, card or cash, once you are happy with the work. GST bill every time." }
  ];

  // ---------------------------------------------------------------------
  // 6. BRANDS WE SERVICE. Plain names, no logos.
  // ---------------------------------------------------------------------
  const CAR_BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Kia", "Renault", "Nissan", "Skoda", "Volkswagen", "MG"];
  const BIKE_BRANDS = ["Hero", "Honda", "Bajaj", "TVS", "Royal Enfield", "Yamaha", "Suzuki", "KTM", "Ather"];

  // ---------------------------------------------------------------------
  // 7. BOOKING FORM. The choices in "What does it need?".
  // ---------------------------------------------------------------------
  const NEEDS = [
    "General service", "AC not cooling", "Dent or scratch repair", "Tyres or wheel alignment",
    "Battery or starting problem", "A strange noise or warning light", "Wash and cleaning", "Something else"
  ];

  // ---------------------------------------------------------------------
  // 8. GALLERY. id: the Unsplash photo id.   caption: the line shown on the photo.
  //    On phones the first and last photos are shown wide.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { id: "1530046339160-ce3e530c7d2f", caption: "The workshop floor" },
    { id: "1619642751034-765dfdf7c58e", caption: "Engine repair bay" },
    { id: "1578844251758-2f71da64c96f", caption: "Tyres in stock for most sizes" },
    { id: "1607860108855-64acf2078ed9", caption: "Hand wash before every delivery" },
    { id: "1615906655593-ad0386982a0f", caption: "Under-body check with a lamp" },
    { id: "1622185135505-2d795003994a", caption: "Serviced and ready for pick-up" }
  ];

  // ---------------------------------------------------------------------
  // 9. A link like  ?firm=Speed+Motors&area=Kurla  shows the page
  //    with that garage name and area, so one sample works for many garages.
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

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  // Prices are in rupees here; owner.js decides how they are shown (rupees, or dirhams for the UAE).
  const money = (window.OWNER && window.OWNER.money) || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const amount = (n) => Math.round(n * money.scale).toLocaleString(money.locale);
  const inr = (n) => money.sign + amount(n);
  const range = (pair) => (pair[0] === pair[1] ? inr(pair[0]) : inr(pair[0]) + " to " + inr(pair[1]));
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");

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
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const shortDate = (date) => date.getDate() + " " + MONTH_NAMES[date.getMonth()];

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Car and bike garage in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $$("[data-pickup-km]").forEach((node) => { node.textContent = String(CONFIG.pickupKm); });
  $$("[data-warranty]").forEach((node) => { node.textContent = grouped(CONFIG.warrantyKm); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about car or bike service in " + area + ".");
  });
  $$('[data-wa="book"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to book a service for my car or bike. Please tell me a free slot.");
  });
  $$('[data-wa="pickup"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want a service with free pick-up and drop. My area is: ");
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

  // If the garage is open at minute t, the minute it closes. Otherwise null.
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

  // The next minute the garage opens after minute t. Null when it never opens.
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
      // Back-to-back hours (a garage that never shuts): keep following to the real closing time.
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

  // "Mon to Sat: 9 am to 8 pm" and "Sun: 10 am to 2 pm" for the contact card.
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
  // Services and prices: car or bike, then the size
  // ---------------------------------------------------------------------
  const vehicleOf = (key) => VEHICLES.find((v) => v.key === key) || VEHICLES[0];
  let vehicle = vehicleOf(START_VEHICLE);
  // The jobs ticked in the estimate. Cars and bikes keep their own ticks.
  const picks = { car: new Set(["general"]), bike: new Set(["bgeneral"]) };
  const counts = {};   // how many panels or tyres, per job
  SERVICES.forEach((s) => { if (s.unit) { counts[s.id] = 1; } });

  const servicesFor = (v) => SERVICES.filter((s) => s.kind === v.kind && s.prices[v.key]);
  const kindSeg = $("#kindSeg");
  const sizeChips = $("#sizeChips");
  const serviceGrid = $("#serviceGrid");

  const buildService = (service) => {
    const pair = service.prices[vehicle.key];
    const card = el("article", service.popular ? "svc is-popular" : "svc");
    card.dataset.tilt = "";
    card.dataset.tiltMax = "5";
    if (service.popular) { card.appendChild(el("span", "svc-flag", "Most booked")); }

    const top = el("div", "svc-top");
    const badge = el("span", "svc-ico");
    badge.appendChild(icon(service.icon));
    top.appendChild(badge);
    const ready = el("span", "svc-ready");
    ready.appendChild(icon("clock"));
    ready.appendChild(el("span", "", READY[service.ready] || READY[1]));
    top.appendChild(ready);
    card.appendChild(top);

    const head = el("div");
    head.appendChild(el("h3", "svc-name", service.name));
    head.appendChild(el("p", "svc-line", service.line));
    card.appendChild(head);

    const price = el("p", "svc-price");
    price.appendChild(el("strong", "", inr(pair[0])));
    if (pair[1] !== pair[0]) {
      price.appendChild(el("span", "svc-to", " to "));
      price.appendChild(el("strong", "", inr(pair[1])));
    }
    if (service.unit) { price.appendChild(el("span", "svc-unit", " a " + service.unit)); }
    card.appendChild(price);

    const list = el("ul", "svc-list");
    service.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    card.appendChild(list);

    const actions = el("div", "svc-actions");
    const book = el("a", service.popular ? "btn btn-brand btn-3d" : "btn btn-ghost");
    book.dataset.ripple = "";
    book.target = "_blank";
    book.rel = "noopener";
    book.href = waLink("Hello " + firm + ", I want to book " + service.name.toLowerCase() + " for my " + vehicle.label.toLowerCase() +
      ". Your website shows " + range(pair) + (service.unit ? " a " + service.unit : "") + ". Please tell me a free slot.");
    book.setAttribute("aria-label", "Book on WhatsApp: " + service.name + ", " + vehicle.label + ", " + range(pair));
    book.appendChild(icon("wa", true));
    book.appendChild(el("span", "", "Book on WhatsApp"));
    actions.appendChild(book);

    // "Add to estimate" ticks the job in the calculator below.
    const add = el("button", "svc-add");
    add.type = "button";
    const inEstimate = picks[vehicle.kind].has(service.id);
    add.classList.toggle("is-on", inEstimate);
    add.setAttribute("aria-pressed", String(inEstimate));
    add.appendChild(icon(inEstimate ? "check" : "plus"));
    add.appendChild(el("span", "", inEstimate ? "In your estimate" : "Add to estimate"));
    add.addEventListener("click", () => {
      const set = picks[vehicle.kind];
      if (set.has(service.id)) { set.delete(service.id); } else { set.add(service.id); }
      renderAll();
      if (set.has(service.id)) {
        const target = $("#estimate");
        if (target) { target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
      }
    });
    actions.appendChild(add);
    card.appendChild(actions);
    return card;
  };

  const renderPicker = () => {
    $$(".seg-btn", kindSeg).forEach((button) => setPressed(button, button.dataset.kind === vehicle.kind));
    sizeChips.replaceChildren(...VEHICLES.filter((v) => v.kind === vehicle.kind).map((v) => {
      const button = el("button", "chip", v.label);
      button.type = "button";
      setPressed(button, v.key === vehicle.key);
      button.addEventListener("click", () => setVehicle(v.key));
      return button;
    }));
    $("#sizeNote").textContent = "Like " + vehicle.like.replace(/, ([^,]*)$/, " and $1");
  };

  // ---------------------------------------------------------------------
  // Estimate calculator and the job card
  // ---------------------------------------------------------------------
  const estVehicle = $("#estVehicle");
  const jobList = $("#jobList");
  const estPickup = $("#estPickup");

  VEHICLES.forEach((v) => {
    const option = el("option", "", (v.kind === "car" ? "Car: " : "Bike: ") + v.label);
    option.value = v.key;
    estVehicle.appendChild(option);
  });
  estVehicle.addEventListener("change", () => setVehicle(estVehicle.value));
  estPickup.addEventListener("change", () => renderEstimate());
  $("#pickupNote").textContent = "Free within " + CONFIG.pickupKm + " km of the garage";

  // The low and high price for one job, times the number of panels or tyres.
  const jobRange = (service) => {
    const pair = service.prices[vehicle.key];
    const n = service.unit ? counts[service.id] : 1;
    return [pair[0] * n, pair[1] * n];
  };

  const stepper = (service) => {
    const box = el("span", "stepper");
    const minus = el("button", "step-btn");
    minus.type = "button";
    minus.setAttribute("aria-label", "One " + service.unit + " less");
    minus.appendChild(icon("minus"));
    const value = el("output", "step-val", String(counts[service.id]));
    value.setAttribute("aria-live", "polite");
    const plus = el("button", "step-btn");
    plus.type = "button";
    plus.setAttribute("aria-label", "One " + service.unit + " more");
    plus.appendChild(icon("plus"));
    minus.dataset.step = "minus";
    plus.dataset.step = "plus";
    // After the list is drawn again, the same button keeps the focus (or its partner, at the limit).
    const set = (n, way) => {
      counts[service.id] = Math.min(8, Math.max(1, n));
      picks[vehicle.kind].add(service.id);
      renderAll();
      const row = $('[data-job="' + service.id + '"]', jobList);
      if (!row) { return; }
      const same = $('[data-step="' + way + '"]', row);
      const other = $('[data-step="' + (way === "plus" ? "minus" : "plus") + '"]', row);
      if (same && !same.disabled) { same.focus(); } else if (other) { other.focus(); }
    };
    minus.disabled = counts[service.id] <= 1;
    plus.disabled = counts[service.id] >= 8;
    minus.addEventListener("click", () => set(counts[service.id] - 1, "minus"));
    plus.addEventListener("click", () => set(counts[service.id] + 1, "plus"));
    box.append(minus, value, plus);
    box.appendChild(el("span", "step-unit", service.unit + (counts[service.id] === 1 ? "" : "s")));
    return box;
  };

  const renderJobs = () => {
    const set = picks[vehicle.kind];
    jobList.replaceChildren(...servicesFor(vehicle).map((service) => {
      const li = el("li", set.has(service.id) ? "job is-on" : "job");
      li.dataset.job = service.id;
      const label = el("label", "job-main");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = set.has(service.id);
      box.addEventListener("change", () => {
        if (box.checked) { set.add(service.id); } else { set.delete(service.id); }
        renderAll();
        const again = $('[data-job="' + service.id + '"] input', jobList);
        if (again) { again.focus(); }
      });
      label.appendChild(box);
      label.appendChild(el("span", "job-box", ""));
      $(".job-box", label).appendChild(icon("check"));
      const words = el("span", "job-words");
      words.appendChild(el("strong", "", service.name));
      words.appendChild(el("span", "", range(jobRange(service))));
      label.appendChild(words);
      li.appendChild(label);
      if (service.unit) { li.appendChild(stepper(service)); }
      return li;
    }));
  };

  // A job card number that stays the same all day for this garage: initials, date, three digits.
  const today = new Date();
  const initials = firm.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("").replace(/[^A-Z0-9]/g, "") || "JC";
  let seed = 0;
  for (const ch of firm) { seed = (seed * 31 + ch.charCodeAt(0)) % 997; }
  $("#jcNo").textContent = "No. " + initials + "-" + String(today.getDate()).padStart(2, "0") + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(100 + seed).slice(-3);
  $("#jcDate").textContent = shortDate(today) + " " + today.getFullYear();

  const jcLines = $("#jcLines");
  const renderEstimate = () => {
    const chosen = servicesFor(vehicle).filter((s) => picks[vehicle.kind].has(s.id));
    const pickup = estPickup.checked;
    let low = 0;
    let high = 0;
    let slowest = -1;
    const rows = chosen.map((service) => {
      const pair = jobRange(service);
      low += pair[0];
      high += pair[1];
      let ready = service.ready;
      if (service.unit === "panel" && counts[service.id] > 3) { ready = Math.max(ready, 3); }
      slowest = Math.max(slowest, ready);
      const li = el("li");
      const name = el("span", "jc-name", service.name);
      if (service.unit) { name.appendChild(el("small", "", counts[service.id] + " " + service.unit + (counts[service.id] === 1 ? "" : "s"))); }
      li.appendChild(name);
      li.appendChild(el("span", "jc-dots", ""));
      li.appendChild(el("span", "jc-amt", range(pair)));
      return li;
    });
    if (pickup && chosen.length) {
      const li = el("li", "jc-free");
      li.appendChild(el("span", "jc-name", "Pick-up and drop"));
      li.appendChild(el("span", "jc-dots", ""));
      li.appendChild(el("span", "jc-amt", "Free"));
      rows.push(li);
    }
    jcLines.replaceChildren(...rows);
    $("#jcEmpty").hidden = chosen.length > 0;
    $("#jcVehicle").textContent = (vehicle.kind === "car" ? "Car" : "Bike") + ": " + vehicle.label + " (like " + vehicle.like + ")";
    $("use", $("#jcVehicleIcon")).setAttribute("href", "#i-" + vehicle.kind);
    $("#jcTotal").textContent = chosen.length ? range([low, high]) : inr(0);
    $("#jcTime").textContent = chosen.length ? READY[slowest] + (pickup ? ", dropped at your door" : "") : "Pick a job to see the time";

    const wa = $("#jcWa");
    if (chosen.length === 0) { wa.setAttribute("aria-disabled", "true"); } else { wa.removeAttribute("aria-disabled"); }
    const lines = ["Hello " + firm + ", I made an estimate on your website.",
      "Vehicle: " + vehicle.label + " (like " + vehicle.like + ")"]
      .concat(chosen.map((s) => "- " + s.name + (s.unit ? ", " + counts[s.id] + " " + s.unit + (counts[s.id] === 1 ? "" : "s") : "") + ": " + range(jobRange(s))))
      .concat([pickup ? "Pick-up and drop: yes, please" : "Pick-up and drop: not needed",
        "Estimate: " + range([low, high]),
        "Please check and tell me the final price and a free slot."]);
    wa.href = waLink(lines.join("\n"));
  };

  const renderAll = () => {
    renderPicker();
    serviceGrid.replaceChildren(...servicesFor(vehicle).map(buildService));
    estVehicle.value = vehicle.key;
    renderJobs();
    renderEstimate();
  };

  const setVehicle = (key) => {
    vehicle = vehicleOf(key);
    renderAll();
  };

  // Car or bike: switching keeps the same position (small, medium, big) where it can.
  ["car", "bike"].forEach((kind) => {
    const button = el("button", "seg-btn");
    button.type = "button";
    button.dataset.kind = kind;
    button.appendChild(icon(kind));
    button.appendChild(el("span", "", kind === "car" ? "Car" : "Bike or scooter"));
    button.addEventListener("click", () => {
      if (vehicle.kind === kind) { return; }
      const now = VEHICLES.filter((v) => v.kind === vehicle.kind).indexOf(vehicle);
      const list = VEHICLES.filter((v) => v.kind === kind);
      setVehicle((list[now] || list[0]).key);
    });
    kindSeg.appendChild(button);
  });

  // The lowest price on the page, for the second button under the headline.
  const lowest = Math.min(...SERVICES.map((s) => Math.min(...Object.keys(s.prices).map((k) => s.prices[k][0]))));
  $("#heroFrom").textContent = inr(lowest);

  // ---------------------------------------------------------------------
  // Why people trust us, and the brand lists
  // ---------------------------------------------------------------------
  WHY[3].name = grouped(CONFIG.warrantyKm) + " km warranty";
  WHY[3].text = "Every job is covered for " + grouped(CONFIG.warrantyKm) + " km or 30 days. Same problem again? We fix it free.";
  $("#whyGrid").replaceChildren(...WHY.map((item) => {
    const li = el("li", "why-item");
    const badge = el("span", "why-ico");
    badge.appendChild(icon(item.icon));
    li.appendChild(badge);
    const words = el("div");
    words.appendChild(el("h3", "", item.name));
    words.appendChild(el("p", "", item.text));
    li.appendChild(words);
    return li;
  }));
  $("#carBrands").replaceChildren(...CAR_BRANDS.map((name) => el("li", "tag", name)));
  $("#bikeBrands").replaceChildren(...BIKE_BRANDS.map((name) => el("li", "tag", name)));

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
  // Quick facts, worked out from the settings and lists above
  // ---------------------------------------------------------------------
  const setStat = (id, value) => {
    const node = $(id);
    node.textContent = grouped(value);
    node.dataset.count = String(value);
  };
  setStat("#statYears", Math.max(1, new Date().getFullYear() - CONFIG.since));
  setStat("#statJobs", CONFIG.jobsDone);
  setStat("#statMechanics", CONFIG.mechanics);
  setStat("#statBrands", CAR_BRANDS.length + BIKE_BRANDS.length);

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
  // Booking form: opens WhatsApp with the message ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const form = $("#enquiry");
  const formError = $("#formError");
  NEEDS.forEach((label) => { $("#needSelect").appendChild(el("option", "", label)); });

  // The next open days, starting today if there is still time to bring the vehicle in.
  const fillDays = () => {
    const select = $("#daySelect");
    const keep = select.value;
    const now = new Date();
    const options = [];
    for (let ahead = 0; ahead < 10 && options.length < 6; ahead += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      const hours = hoursOf(todayIndex(date));
      if (!hours) { continue; }
      if (ahead === 0 && now.getHours() * 60 + now.getMinutes() > hours.end - 120) { continue; }
      const word = ahead === 0 ? "Today" : ahead === 1 ? "Tomorrow" : DAYS[todayIndex(date)].name;
      options.push(word + ", " + shortDate(date));
    }
    select.replaceChildren(...options.map((text) => el("option", "", text)));
    if (options.indexOf(keep) !== -1) { select.value = keep; }
  };
  fillDays();

  const pickupWhere = $("#pickupWhere");
  $("#formPickup").addEventListener("change", (event) => { pickupWhere.hidden = !event.target.checked; });

  // The boxes say they have a problem only while the message is showing.
  const showError = (fields) => {
    formError.hidden = fields.length === 0;
    ["name", "model"].forEach((key) => {
      const input = form.elements[key];
      if (fields.indexOf(key) !== -1) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "formError");
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    });
  };
  ["name", "model"].forEach((key) => form.elements[key].addEventListener("input", () => showError([])));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"), 60);
    const model = clean(data.get("model"), 60);
    const missing = [];
    if (!name) { missing.push("name"); }
    if (!model) { missing.push("model"); }
    if (missing.length) {
      showError(missing);
      form.elements[missing[0]].focus();
      return;
    }
    showError([]);
    const where = clean(data.get("where"), 80);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "Vehicle: " + model + ".",
      "It needs: " + data.get("need") + ".",
      "Day that suits me: " + data.get("day") + ".",
      data.get("pickup") ? "I need pick-up and drop" + (where ? " from " + where : "") + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  renderAll();
  paintOpen();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    fillDays();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
