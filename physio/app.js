(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Stridewell Physio",
    area: "Powai",
    city: "Mumbai",
    // Floor and building. The page adds the area and city after it.
    address: "1st floor, Lakeview Plaza",
    // A short line that helps people find the place. Shown under the headline and with the address.
    landmark: "on the main road, above the medical store",
    since: 2014,
    // Patients treated so far, for the quick facts. The page adds a "+" after it.
    patientsHelped: 6000,
    // When the therapists go out for home visits. Shown with the home visit areas.
    homeVisitHours: "Monday to Saturday, 8 am to 8 pm",
    // The name printed on the sample session card in the packages section.
    cardPatient: "Anil P.",
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
  //    "08:00" is 8 am and "21:00" is 9 pm.
  //    Closed all day: write null, for example  Sun: null
  //    Open past midnight: write the real closing time, for example ["08:00", "01:00"].
  //    The "Open now" badge, the hours table and the days in the form all read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["08:00", "21:00"],
    Tue: ["08:00", "21:00"],
    Wed: ["08:00", "21:00"],
    Thu: ["08:00", "21:00"],
    Fri: ["08:00", "21:00"],
    Sat: ["08:00", "21:00"],
    Sun: ["09:00", "13:00"]
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. CONDITIONS. One block per problem area. The first five have a dot on the drawn body.
  //    spot: where the dot sits on the drawing (x from 0 to 200, y from 0 to 440, left to
  //          right and top to bottom), and which side its label goes: "left" or "right".
  //    lights: for areas without a dot of their own, the dots that light up with it.
  //    ask: the end of the WhatsApp button, "Ask about my ...".
  //    sessions: the usual number of sessions, in plain words. Keep it honest and general.
  // ---------------------------------------------------------------------
  const CONDITIONS = [
    {
      id: "back", name: "Back", title: "Back pain and slipped disc", ask: "back pain",
      spot: { x: 100, y: 186, side: "left" },
      line: "Lower back pain from long hours at a desk, lifting, or a disc problem.",
      problems: ["Lower back pain and stiffness", "Slipped disc and sciatica (pain down the leg)", "Pain after sitting or driving for long"],
      treat: ["Gentle hands-on therapy to ease the pain", "Core and posture exercises", "Advice on your desk, chair and sleep"],
      sessions: "Usually 6 to 10 sessions over 3 to 5 weeks"
    },
    {
      id: "neck", name: "Neck", title: "Neck pain and stiffness", ask: "neck pain",
      spot: { x: 100, y: 68, side: "left" },
      line: "Stiffness and pain from laptops, phones and long commutes.",
      problems: ["Stiff neck from laptop and phone use", "Cervical spondylosis", "Pain or tingling into the arm"],
      treat: ["Hands-on therapy, and traction if needed", "Posture and neck strength exercises", "Simple changes to your work set-up"],
      sessions: "Usually 5 to 8 sessions over 3 to 4 weeks"
    },
    {
      id: "shoulder", name: "Shoulder", title: "Shoulder pain and frozen shoulder", ask: "shoulder pain",
      spot: { x: 147, y: 98, side: "right" },
      line: "Pain or stiffness when you lift the arm, reach behind, or sleep on that side.",
      problems: ["Frozen shoulder", "Pain lifting the arm overhead", "Rotator cuff strain"],
      treat: ["Joint mobilisation to bring back movement", "Band and weight exercises, step by step", "Heat, ultrasound or taping when useful"],
      sessions: "Usually 8 to 12 sessions over 4 to 6 weeks"
    },
    {
      id: "knee", name: "Knee", title: "Knee pain and arthritis", ask: "knee pain",
      spot: { x: 79, y: 318, side: "left" },
      line: "Pain on stairs, when you get up from the floor, or after a twist.",
      problems: ["Knee arthritis (osteoarthritis)", "Pain climbing stairs or sitting cross-legged", "Swelling after a twist"],
      treat: ["Strength work for the thigh and hip", "Hands-on therapy and taping", "A walking and stairs plan you can follow"],
      sessions: "Usually 6 to 10 sessions over 3 to 5 weeks"
    },
    {
      id: "ankle", name: "Ankle and foot", label: "Ankle", title: "Ankle sprain and heel pain", ask: "ankle or foot pain",
      spot: { x: 120, y: 398, side: "right" },
      line: "A sprain that keeps coming back, or heel pain with the first steps of the day.",
      problems: ["Ankle sprain that keeps coming back", "Heel pain in the morning (plantar fasciitis)", "Flat feet and foot pain"],
      treat: ["Balance and ankle strength training", "Stretching and taping", "Advice on footwear"],
      sessions: "Usually 4 to 8 sessions over 2 to 4 weeks"
    },
    {
      id: "surgery", name: "After surgery", title: "Rehab after surgery", ask: "rehab after my surgery",
      lights: ["knee", "shoulder", "back"],
      line: "Getting strong and steady again after an operation, at the clinic or at home.",
      problems: ["Knee or hip replacement", "ACL or ligament repair", "A fracture after the plaster comes off"],
      treat: ["A plan that follows your surgeon's advice", "Walking, stairs and daily tasks first", "Strength and movement, week by week"],
      sessions: "Usually 10 to 20 sessions over 6 to 10 weeks"
    },
    {
      id: "sports", name: "Sports injury", title: "Sports and gym injuries", ask: "sports injury",
      lights: ["knee", "ankle", "shoulder"],
      line: "For runners, cricketers, footballers and gym-goers who want to get back to it safely.",
      problems: ["Muscle pull or tear", "Runner's knee and shin pain", "Tennis elbow and gym shoulder pain"],
      treat: ["Find out what caused it, not just ease the pain", "A step-by-step return to your sport", "Taping and warm-up advice"],
      sessions: "Usually 6 to 12 sessions, depending on the injury"
    }
  ];
  // The area shown first.
  const START_CONDITION = "back";

  // ---------------------------------------------------------------------
  // 4. SESSION PACKAGES.
  //    PLACES are the buttons above the packages. START_PLACE is the one picked at first.
  //    prices: what the patient pays in total, in rupees, at the clinic and at home.
  //    The page works out the price per session and the saving by itself.
  //    weeks: how long the pack can be used, for the "Use by" date on the session card.
  //    popular: true marks the pack most people take (use it on one pack only).
  // ---------------------------------------------------------------------
  const PLACES = [
    { key: "clinic", label: "At the clinic", icon: "clinic" },
    { key: "home", label: "Home visit", icon: "home" }
  ];
  const START_PLACE = "clinic";

  const PACKAGES = [
    {
      name: "Single session", sessions: 1, weeks: 1, popular: false,
      line: "One visit, for a check or a small problem.",
      prices: { clinic: 700, home: 1200 },
      includes: ["About 45 minutes, one to one", "A full check on the first visit", "Exercise sheet to take home"]
    },
    {
      name: "6-session pack", sessions: 6, weeks: 4, popular: true,
      line: "For most back, neck and knee pain.",
      prices: { clinic: 3900, home: 6600 },
      includes: ["Everything in a single session", "Use within 4 weeks", "Progress check on visits 3 and 6", "Exercise photos on WhatsApp"]
    },
    {
      name: "10-session pack", sessions: 10, weeks: 8, popular: false,
      line: "For rehab after surgery or a sports injury.",
      prices: { clinic: 6000, home: 10500 },
      includes: ["Everything in the 6-session pack", "Use within 8 weeks", "Written report for your doctor", "One free review a month later"]
    }
  ];

  // ---------------------------------------------------------------------
  // 5. HOME VISIT AREAS. extra: the travel charge in rupees on top of the session price (0 = none).
  //    A link with ?area=... shows that area and "nearby areas" instead of this list.
  // ---------------------------------------------------------------------
  const HOME_AREAS = [
    { name: "Powai", extra: 0 },
    { name: "Chandivali", extra: 0 },
    { name: "Vikhroli", extra: 0 },
    { name: "Kanjurmarg", extra: 150 },
    { name: "Ghatkopar", extra: 200 },
    { name: "Andheri East (Marol, Saki Naka)", extra: 200 }
  ];

  // ---------------------------------------------------------------------
  // 6. THERAPISTS. Name, role, degree and one line about what they do.
  //    since: the year they started working; the page works out "12 years".
  //    look: a number from 1 to 6. It picks one of the six drawn faces
  //    (1 and 2 have short hair, 3 short hair with glasses, 4 a bun, 5 long hair, 6 a ponytail).
  //    The faces are drawings, so no photo of a real person is needed.
  // ---------------------------------------------------------------------
  const THERAPISTS = [
    { name: "Dr. Neha Kulkarni (PT)", role: "Head physiotherapist", degree: "MPT (Orthopaedics)", since: 2011, look: 4,
      languages: "English, Hindi, Marathi", text: "Back, neck and joint pain. Sees most new patients first and plans the treatment." },
    { name: "Dr. Arjun Rao (PT)", role: "Sports physiotherapist", degree: "MPT (Sports)", since: 2016, look: 1,
      languages: "English, Hindi, Kannada", text: "Runners, cricketers and gym injuries. Gets you back to your sport step by step." },
    { name: "Dr. Fatima Shaikh (PT)", role: "Women's health and older adults", degree: "BPT, women's health course", since: 2018, look: 5,
      languages: "English, Hindi, Urdu", text: "Care in pregnancy and after delivery, and balance and walking for older adults." },
    { name: "Dr. Rahul Iyer (PT)", role: "Home visit physiotherapist", degree: "BPT", since: 2019, look: 3,
      languages: "English, Hindi, Tamil", text: "Rehab after surgery at home, for people who cannot travel to the clinic yet." }
  ];

  // ---------------------------------------------------------------------
  // 7. GALLERY. id: the Unsplash photo id.   caption: the line shown on the photo.
  //    On phones the first and last photos are shown wide.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { id: "1666214280557-f1b5022eb634", caption: "Your scan, explained in plain words" },
    { id: "1598632640487-6ea4a4e8b963", caption: "Balance and core work" },
    { id: "1600881333168-2ef49b341f30", caption: "Stretches you can repeat at home" },
    { id: "1517130038641-a774d04afb3c", caption: "Small-group band exercise class" },
    { id: "1597764690523-15bea4c581c9", caption: "Splints and supports, fitted on the spot" },
    { id: "1576765608535-5f04d1e3f289", caption: "Home visits for older patients" }
  ];

  // ---------------------------------------------------------------------
  // 8. A link like  ?firm=Move+Well+Physio&area=Thane  shows the page
  //    with that clinic name and area, so one sample works for many clinics.
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

  // A clinic in another area gets its own area and "nearby areas" for home visits.
  const homeAreas = customArea
    ? [{ name: area, extra: 0 }, { name: "Nearby areas, within about 5 km", extra: 150 }]
    : HOME_AREAS;

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

  // One drawn shape (used for the body map glow and the therapists' faces).
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
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const shortDate = (date) => date.getDate() + " " + MONTH_NAMES[date.getMonth()] + " " + date.getFullYear();

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Physiotherapy clinic in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about physiotherapy at your clinic in " + area + ".");
  });
  $$('[data-wa="book"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to book a physiotherapy appointment in " + area + ". Please tell me the next free time.");
  });
  $$('[data-wa="ask"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I have a question for a physiotherapist before I book. My problem is: ");
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

  // If the clinic is open at minute t, the minute it closes. Otherwise null.
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

  // The next minute the clinic opens after minute t. Null when it never opens.
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
      // Back-to-back hours (a clinic that never shuts): keep following to the real closing time.
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

  // "Mon to Sat: 8 am to 9 pm" and "Sun: 9 am to 1 pm" for the contact card.
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
  // Home visit areas: the list under the timings and the small card on the top photo
  // ---------------------------------------------------------------------
  $("#areaList").replaceChildren(...homeAreas.map((place) => {
    const li = el("li", "area");
    li.appendChild(icon("pin"));
    li.appendChild(el("span", "area-name", place.name));
    li.appendChild(el("span", place.extra ? "area-fee" : "area-fee is-free", place.extra ? "+ " + inr(place.extra) + " travel" : "No travel charge"));
    return li;
  }));
  $("#areasNote").textContent = CONFIG.homeVisitHours + ". The therapist brings all the equipment needed.";
  const heroNames = homeAreas.slice(0, 3).map((place) => place.name.replace(/\s*\(.*\)$/, ""));
  $("#heroHomeAreas").textContent = customArea ? area + " and nearby" : heroNames.join(", ");
  $("#heroHomeText").textContent = customArea ? CONFIG.homeVisitHours : "and nearby, " + CONFIG.homeVisitHours.split(",")[0];

  // ---------------------------------------------------------------------
  // Conditions: the drawn body, the dots on it, the chips and the detail card
  // ---------------------------------------------------------------------
  const bodyMap = $("#bodyMap");
  const glowLayer = $(".body-glows");
  const condChips = $("#condChips");
  const condCard = $("#condCard");
  const problemSelect = $("#problemSelect");
  const spots = [];
  let condId = CONDITIONS.some((item) => item.id === START_CONDITION) ? START_CONDITION : CONDITIONS[0].id;

  // Ask on WhatsApp about one area.
  const askLink = (cond) =>
    waLink("Hello " + firm + ", I want to ask about my " + cond.ask + ". How can physiotherapy help, and how many sessions may I need?");

  CONDITIONS.filter((cond) => cond.spot).forEach((cond) => {
    const x = (cond.spot.x / 200) * 100;
    const y = (cond.spot.y / 440) * 100;
    // A soft coloured glow on the drawing, under the dot.
    const glow = shape("circle", { cx: cond.spot.x, cy: cond.spot.y, r: 30, class: "body-glow" });
    glowLayer.appendChild(glow);

    const button = el("button", "spot spot-" + (cond.spot.side === "right" ? "right" : "left"));
    button.type = "button";
    button.style.left = x.toFixed(2) + "%";
    button.style.top = y.toFixed(2) + "%";
    button.setAttribute("aria-label", "Show " + cond.name.toLowerCase());
    button.appendChild(el("span", "spot-dot"));
    const label = el("span", "spot-label", cond.label || cond.name);
    label.setAttribute("aria-hidden", "true");
    button.appendChild(label);
    button.addEventListener("click", () => setCondition(cond.id, true));
    bodyMap.appendChild(button);
    spots.push({ id: cond.id, button: button, glow: glow });
  });

  const buildList = (heading, lines, iconName) => {
    const box = el("div", "cond-col");
    box.appendChild(el("h4", "", heading));
    const list = el("ul", "cond-list");
    lines.forEach((line) => {
      const li = el("li");
      li.appendChild(icon(iconName));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    box.appendChild(list);
    return box;
  };

  const renderCard = (cond) => {
    const head = el("div", "cond-head");
    head.appendChild(el("p", "cond-kicker", cond.name));
    head.appendChild(el("h3", "cond-title", cond.title));
    head.appendChild(el("p", "cond-line", cond.line));

    const cols = el("div", "cond-cols");
    cols.appendChild(buildList("Common problems", cond.problems, "activity"));
    cols.appendChild(buildList("How we help", cond.treat, "check"));

    const sessions = el("p", "cond-sessions");
    sessions.appendChild(icon("calendar"));
    sessions.appendChild(el("span", "", cond.sessions));

    const ask = el("a", "btn btn-brand btn-3d");
    ask.dataset.ripple = "";
    ask.target = "_blank";
    ask.rel = "noopener";
    ask.href = askLink(cond);
    ask.appendChild(icon("wa", true));
    ask.appendChild(el("span", "", "Ask about my " + cond.ask));

    const note = el("p", "cond-note", "Every body is different. Your therapist tells you the real plan after the first check.");
    condCard.replaceChildren(head, cols, sessions, ask, note);
  };

  // Keep the picked chip in view when the row of chips is wider than the phone.
  const showChip = (button) => {
    const row = button.parentElement;
    row.scrollLeft += button.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - button.offsetWidth) / 2;
  };

  const setCondition = (id, byVisitor) => {
    const cond = CONDITIONS.find((item) => item.id === id) || CONDITIONS[0];
    condId = cond.id;
    const lit = cond.spot ? [cond.id] : (cond.lights || []);
    spots.forEach((spot) => {
      spot.button.classList.toggle("is-lit", lit.indexOf(spot.id) !== -1);
      setPressed(spot.button, spot.id === cond.id);
      spot.glow.classList.toggle("is-on", lit.indexOf(spot.id) !== -1);
    });
    $$(".chip", condChips).forEach((button) => setPressed(button, button.dataset.id === cond.id));
    renderCard(cond);
    const chip = $('.chip[data-id="' + cond.id + '"]', condChips);
    if (chip) { showChip(chip); }
    if (byVisitor) {
      $("#condLive").textContent = "Showing " + cond.title + ".";
      // The appointment form follows the area picked here.
      problemSelect.value = cond.name;
    }
  };

  CONDITIONS.forEach((cond) => {
    const button = el("button", "chip", cond.name);
    button.type = "button";
    button.dataset.id = cond.id;
    button.addEventListener("click", () => setCondition(cond.id, true));
    condChips.appendChild(button);
  });

  // ---------------------------------------------------------------------
  // Session packages and the clinic / home visit switch
  // ---------------------------------------------------------------------
  const packGrid = $("#packGrid");
  const placeSeg = $("#placeSeg");
  const single = PACKAGES.find((pack) => pack.sessions === 1) || PACKAGES[0];
  let place = PLACES.some((item) => item.key === START_PLACE) ? START_PLACE : PLACES[0].key;
  const placeOf = (key) => PLACES.find((item) => item.key === key);

  // Total, price per session and saving for one pack at one place.
  const packSums = (pack, where) => {
    const total = pack.prices[where];
    const singleRate = single.prices[where] / single.sessions;
    return { total: total, perSession: total / pack.sessions, saving: Math.max(0, Math.round(singleRate * pack.sessions - total)) };
  };
  const sessionWord = (count) => count + (count === 1 ? " session" : " sessions");

  const buildPack = (pack) => {
    const sums = packSums(pack, place);
    const where = placeOf(place);
    const card = el("article", pack.popular ? "plan is-popular" : "plan");
    card.dataset.tilt = "";       // leans toward the mouse or finger (done by ../fx/fx.js)
    card.dataset.tiltMax = "5";
    if (pack.popular) { card.appendChild(el("span", "plan-flag", "Most chosen")); }

    const head = el("div");
    head.appendChild(el("h3", "plan-name", pack.name));
    head.appendChild(el("p", "plan-line", pack.line));
    card.appendChild(head);

    const price = el("p", "plan-price");
    price.appendChild(el("strong", "", inr(sums.total)));
    price.appendChild(document.createTextNode(" "));
    price.appendChild(el("span", "", "for " + sessionWord(pack.sessions)));
    card.appendChild(price);

    const sub = el("p", "plan-sub");
    if (pack.sessions === 1) {
      sub.appendChild(el("span", "per", "Pay on the day"));
    } else {
      sub.appendChild(el("span", "per", "That is " + inr(sums.perSession) + " a session"));
      if (sums.saving > 0) {
        sub.appendChild(document.createTextNode(" "));
        sub.appendChild(el("span", "save", "Save " + inr(sums.saving)));
      }
    }
    card.appendChild(sub);

    const tag = el("p", "plan-place");
    tag.appendChild(icon(where.icon));
    tag.appendChild(el("span", "", place === "home" ? "At your home in " + area : "At the clinic in " + area));
    card.appendChild(tag);

    const list = el("ul", "plan-list");
    pack.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    card.appendChild(list);

    // Only the popular pack gets the filled button, so the eye knows where to go first.
    const book = el("a", pack.popular ? "btn btn-brand btn-3d" : "btn btn-ghost");
    book.dataset.ripple = "";
    book.target = "_blank";
    book.rel = "noopener";
    const whereWords = place === "home" ? "as home visits in " + area : "at the clinic";
    book.href = waLink("Hello " + firm + ", I want to book the " + pack.name + " " + whereWords + " (" + inr(sums.total) + "). Please tell me the first free time.");
    book.setAttribute("aria-label", "Book on WhatsApp: " + pack.name + ", " + where.label.toLowerCase() + ", " + inr(sums.total));
    book.appendChild(icon("wa", true));
    book.appendChild(el("span", "", "Book on WhatsApp"));
    card.appendChild(book);
    return card;
  };

  // ---------------------------------------------------------------------
  // The session card drawn under the packages. It carries the clinic's own name,
  // shows the popular pack, and follows the clinic / home visit switch.
  // ---------------------------------------------------------------------
  const cardPack = PACKAGES.find((pack) => pack.popular) || PACKAGES[0];
  const cardDots = $("#cardDots");
  // Two sessions are ticked, so the card looks like one in use.
  const TICKED = 2;
  for (let i = 0; i < Math.min(cardPack.sessions, 12); i += 1) {
    const dot = el("span", i < TICKED ? "scard-dot is-done" : "scard-dot");
    if (i < TICKED) { dot.appendChild(icon("check")); } else { dot.appendChild(el("b", "", String(i + 1))); }
    cardDots.appendChild(dot);
  }
  $("#cardPatient").textContent = CONFIG.cardPatient;

  const paintCard = () => {
    const end = new Date();
    end.setDate(end.getDate() + cardPack.weeks * 7);
    const until = shortDate(end);
    const placeWord = place === "home" ? "home" : "clinic";
    $("#cardPlan").textContent = sessionWord(cardPack.sessions) + ", " + placeWord;
    $("#cardUntil").textContent = until;
    $("#cardLive").textContent = "Start the " + cardPack.name + " " + (place === "home" ? "at home" : "at the clinic") + " today and use it by " + until + ".";
    $("#cardStage").setAttribute("aria-label",
      "Session card for " + firm + ". Patient " + CONFIG.cardPatient + ", " + sessionWord(cardPack.sessions) + " at the " + placeWord + ", use by " + until + ".");
  };

  const setPlace = (key) => {
    place = key;
    $$(".seg-btn", placeSeg).forEach((button) => setPressed(button, button.dataset.place === place));
    packGrid.replaceChildren(...PACKAGES.map(buildPack));
    const bestSaving = Math.max(...PACKAGES.map((pack) => packSums(pack, place).saving));
    $("#placeNote").textContent = (place === "home"
      ? "The therapist comes to your home with the equipment."
      : "Sessions at our clinic in " + area + ".") + (bestSaving > 0 ? " Packs save up to " + inr(bestSaving) + "." : "");
    paintCard();
  };

  PLACES.forEach((item) => {
    const button = el("button", "seg-btn");
    button.type = "button";
    button.dataset.place = item.key;
    button.appendChild(icon(item.icon));
    button.appendChild(el("span", "", item.label));
    button.addEventListener("click", () => setPlace(item.key));
    placeSeg.appendChild(button);
  });

  // The lowest price per session on the page, for the second button under the headline.
  const lowest = Math.min(...PACKAGES.map((pack) => Math.min(...PLACES.map((item) => pack.prices[item.key] / pack.sessions))));
  $("#heroFrom").textContent = inr(lowest);
  $("#faqHomePrice").textContent = inr(single.prices.home);

  // ---------------------------------------------------------------------
  // Therapists
  // ---------------------------------------------------------------------
  // The six drawn faces. Simple head-and-shoulders figures in the page colours.
  // hair: "short", "bun", "long" or "tail".   extra: "glasses" or "coat" (a white coat collar).
  const FACES = [
    { back: "#dff1ec", skin: "#c98d5e", hair: "#1c1612", top: "#0f766e", style: "short", extra: "coat" },
    { back: "#ffe6de", skin: "#b0764a", hair: "#16120f", top: "#0c2a2e", style: "short", extra: "" },
    { back: "#dff1ec", skin: "#dba878", hair: "#2a1d14", top: "#0f766e", style: "short", extra: "glasses" },
    { back: "#ffe6de", skin: "#c98d5e", hair: "#1c1612", top: "#0f766e", style: "bun", extra: "coat" },
    { back: "#dff1ec", skin: "#dba878", hair: "#2a1d14", top: "#b9442b", style: "long", extra: "" },
    { back: "#ffe6de", skin: "#b0764a", hair: "#16120f", top: "#0c2a2e", style: "tail", extra: "" }
  ];

  const drawFace = (look) => {
    const face = FACES[(Math.max(1, Number(look) || 1) - 1) % FACES.length];
    const svg = shape("svg", { viewBox: "0 0 64 64", class: "member-face", "aria-hidden": "true" });
    svg.appendChild(shape("rect", { width: 64, height: 64, fill: face.back }));
    // Hair that falls behind the head is drawn first.
    if (face.style === "long") { svg.appendChild(shape("path", { d: "M18 30c0-11 5.5-18 14-18s14 7 14 18v18H18z", fill: face.hair })); }
    if (face.style === "tail") { svg.appendChild(shape("path", { d: "M40 16c8 1 11 8 9 17-1 5-3 8-6 10 1-5 1-9-1-13z", fill: face.hair })); }
    if (face.style === "bun") { svg.appendChild(shape("circle", { cx: 32, cy: 11, r: 5.5, fill: face.hair })); }
    if (face.extra === "coat") {
      // A white coat over a coloured top: the colour shows only in the V of the collar.
      svg.appendChild(shape("path", { d: "M9 64c0-12 9.5-19 23-19s23 7 23 19z", fill: "#ffffff" }));
      svg.appendChild(shape("path", { d: "M25 46.5l7 11 7-11z", fill: face.top }));
      svg.appendChild(shape("path", { d: "M9 64c0-12 9.5-19 23-19s23 7 23 19", fill: "none", stroke: "#b9d6cf", "stroke-width": "1.2" }));
    } else {
      svg.appendChild(shape("path", { d: "M9 64c0-12 9.5-19 23-19s23 7 23 19z", fill: face.top }));
    }
    svg.appendChild(shape("path", { d: "M27 38h10v7.5a5 5 0 0 1-10 0z", fill: face.skin }));
    svg.appendChild(shape("path", { d: "M27 41.5c3 2 7 2 10 0V38H27z", fill: "#000", opacity: ".14" }));
    svg.appendChild(shape("ellipse", { cx: 32, cy: 28, rx: 10.5, ry: 12.5, fill: face.skin }));
    svg.appendChild(shape("path", { d: "M21 28c-1-9 3.5-15 11-15s12 6 11 15c-1.5-4.5-5-7-11-7s-9.5 2.5-11 7z", fill: face.hair }));
    if (face.extra === "glasses") {
      svg.appendChild(shape("circle", { cx: 27.6, cy: 29, r: 3.6, fill: "none", stroke: "#0c2a2e", "stroke-width": "1.6" }));
      svg.appendChild(shape("circle", { cx: 36.4, cy: 29, r: 3.6, fill: "none", stroke: "#0c2a2e", "stroke-width": "1.6" }));
      svg.appendChild(shape("path", { d: "M31.2 28.6h1.6", stroke: "#0c2a2e", "stroke-width": "1.6" }));
    }
    return svg;
  };

  const thisYear = new Date().getFullYear();
  $("#teamList").replaceChildren(...THERAPISTS.map((person) => {
    const li = el("li", "member reveal");
    const top = el("div", "member-top");
    top.appendChild(drawFace(person.look));
    const who = el("div");
    who.appendChild(el("h3", "", person.name));
    who.appendChild(el("p", "member-role", person.role));
    top.appendChild(who);
    li.appendChild(top);

    const facts = el("ul", "member-facts");
    const years = Math.max(1, thisYear - person.since);
    [["award", person.degree], ["clock", years + (years === 1 ? " year" : " years") + " in practice"], ["globe", person.languages]].forEach((fact) => {
      const item = el("li");
      item.appendChild(icon(fact[0]));
      item.appendChild(el("span", "", fact[1]));
      facts.appendChild(item);
    });
    li.appendChild(facts);
    li.appendChild(el("p", "member-text", person.text));
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
  setStat("#statYears", Math.max(1, thisYear - CONFIG.since));
  setStat("#statPatients", CONFIG.patientsHelped);
  setStat("#statTherapists", THERAPISTS.length);
  setStat("#statAreas", homeAreas.length);

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
    $$("[data-count]", node).forEach(countUp);
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
  // Appointment form: opens WhatsApp with the request ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const form = $("#enquiry");
  const formError = $("#formError");
  CONDITIONS.map((cond) => cond.name).concat(["Something else"]).forEach((label) => {
    problemSelect.appendChild(el("option", "", label));
  });

  // The next seven days the clinic is open: "Today, Fri 21 Nov", "Tomorrow, Sat 22 Nov", "Mon 24 Nov".
  // Each option's value is the date itself, so a picked day stays picked when "Tomorrow" becomes "Today".
  const daySelect = $("#daySelect");
  let dayList = "";
  const fillDays = () => {
    const items = [["", "As soon as possible"]];
    const now = new Date();
    for (let ahead = 0; ahead < 8; ahead += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      const hours = hoursOf(todayIndex(date));
      if (!hours) { continue; }
      // Today is offered only while there is still time for a session.
      if (ahead === 0 && now.getHours() * 60 + now.getMinutes() > hours.end - 60) { continue; }
      const label = DAYS[todayIndex(date)].key + " " + date.getDate() + " " + MONTH_NAMES[date.getMonth()];
      items.push([date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), ahead === 0 ? "Today, " + label : ahead === 1 ? "Tomorrow, " + label : label]);
    }
    // Rebuild only when the list really changed, and never while the visitor has the list open.
    const list = items.map((item) => item.join("=")).join("|");
    if (list === dayList || document.activeElement === daySelect) { return; }
    dayList = list;
    const keep = daySelect.value;
    daySelect.replaceChildren(...items.map(([value, text]) => {
      const option = el("option", "", text);
      option.value = value;
      return option;
    }));
    if (items.some(([value]) => value === keep)) { daySelect.value = keep; }
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
    const time = clean(data.get("time"), 20);
    const home = data.get("where") === "Home visit";
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I need physiotherapy for: " + data.get("problem") + ".",
      home ? "I would like a home visit in " + area + "." : "I would like to come to the clinic.",
      "Day: " + (daySelect.selectedIndex >= 0 ? daySelect.options[daySelect.selectedIndex].textContent : "As soon as possible") + ".",
      time ? "Best time for me: " + time + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  setCondition(condId, false);
  setPlace(place);
  paintOpen();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    fillDays();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
