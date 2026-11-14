(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Ironleaf Fitness",
    area: "Andheri West",
    city: "Mumbai",
    // Floor and building. The page adds the area and city after it.
    address: "2nd floor, Sunrise Arcade",
    // A short line that helps people find the place. Shown under the headline and with the address.
    landmark: "2 minutes from the station",
    since: 2015,
    // Size of the gym floor in square feet, for the quick facts.
    floorSqFt: 4500,
    // The name printed on the sample membership card in the plans section.
    cardMember: "Riya S.",
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Aamir Behlim",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // ---------------------------------------------------------------------
  // 2. OPENING HOURS. One line per day: [opens, closes] on the 24-hour clock.
  //    "06:00" is 6 am and "23:00" is 11 pm.
  //    Closed all day: write null, for example  Sun: null
  //    Open past midnight: write the real closing time, for example ["06:00", "01:00"].
  //    The "Open now" badge and the hours table both read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["06:00", "23:00"],
    Tue: ["06:00", "23:00"],
    Wed: ["06:00", "23:00"],
    Thu: ["06:00", "23:00"],
    Fri: ["06:00", "23:00"],
    Sat: ["06:00", "23:00"],
    Sun: ["07:00", "14:00"]
  };

  // ---------------------------------------------------------------------
  // 3. MEMBERSHIP PLANS.
  //    PERIODS are the buttons above the plans. START_PERIOD is the one picked at first.
  //    prices: what the member pays in total for 1, 3 and 12 months, in rupees.
  //    The page works out the per-month price and the saving by itself.
  //    popular: true marks the plan most people take (use it on one plan only).
  // ---------------------------------------------------------------------
  const PERIODS = [
    { months: 1, label: "1 month" },
    { months: 3, label: "3 months" },
    { months: 12, label: "12 months" }
  ];
  const START_PERIOD = 3;

  const PLANS = [
    {
      name: "Gym only", line: "The full gym floor, any time we are open.",
      prices: { 1: 2500, 3: 6600, 12: 18000 }, popular: false,
      includes: ["Cardio, machines and free weights", "Locker and shower", "Starter workout plan from a trainer"]
    },
    {
      name: "Gym + classes", line: "The gym floor and every group class.",
      prices: { 1: 3500, 3: 9300, 12: 27000 }, popular: true,
      includes: ["Everything in Gym only", "All classes: Strength, Yoga, Zumba and HIIT", "Body check and a new plan every month"]
    },
    {
      name: "Personal training", line: "Your own trainer and a plan made for you.",
      prices: { 1: 9000, 3: 24000, 12: 84000 }, popular: false,
      includes: ["Everything in Gym + classes", "Your own trainer, 12 sessions a month", "Diet chart made for you"]
    }
  ];

  // ---------------------------------------------------------------------
  // 4. WEEKLY CLASS TIMETABLE.
  //    CLASS_TYPES are the filter buttons. Each class must use one of them as its type.
  //    time: 24-hour clock.   women: true shows a "Women only" tag.
  //    by: the trainer's role, written exactly as in the TRAINERS list below.
  //    The page then shows the trainer's first name with it.
  // ---------------------------------------------------------------------
  const CLASS_TYPES = ["Strength", "Yoga", "Zumba", "HIIT"];

  const TIMETABLE = {
    Mon: [
      { time: "06:30", name: "Strength Basics", type: "Strength", level: "Beginner", by: "Strength coach" },
      { time: "07:30", name: "Morning Yoga", type: "Yoga", level: "All levels", by: "Yoga teacher" },
      { time: "11:00", name: "Women's Strength", type: "Strength", level: "Beginner", by: "Women's batch trainer", women: true },
      { time: "18:30", name: "Zumba Party", type: "Zumba", level: "All levels", by: "Zumba instructor" },
      { time: "19:30", name: "HIIT Burn", type: "HIIT", level: "Intermediate", by: "HIIT coach" }
    ],
    Tue: [
      { time: "06:30", name: "HIIT Express", type: "HIIT", level: "All levels", by: "HIIT coach" },
      { time: "07:30", name: "Power Yoga", type: "Yoga", level: "Intermediate", by: "Yoga teacher" },
      { time: "11:00", name: "Women's Zumba", type: "Zumba", level: "All levels", by: "Women's batch trainer", women: true },
      { time: "18:30", name: "Barbell Club", type: "Strength", level: "Intermediate", by: "Strength coach" },
      { time: "20:00", name: "Stretch and Relax", type: "Yoga", level: "Beginner", by: "Yoga teacher" }
    ],
    Wed: [
      { time: "06:30", name: "Strength Basics", type: "Strength", level: "Beginner", by: "Strength coach" },
      { time: "07:30", name: "Morning Yoga", type: "Yoga", level: "All levels", by: "Yoga teacher" },
      { time: "11:00", name: "Women's Yoga", type: "Yoga", level: "Beginner", by: "Women's batch trainer", women: true },
      { time: "18:30", name: "Zumba Party", type: "Zumba", level: "All levels", by: "Zumba instructor" },
      { time: "19:30", name: "Core Blast", type: "HIIT", level: "Intermediate", by: "HIIT coach" }
    ],
    Thu: [
      { time: "06:30", name: "HIIT Express", type: "HIIT", level: "All levels", by: "HIIT coach" },
      { time: "07:30", name: "Power Yoga", type: "Yoga", level: "Intermediate", by: "Yoga teacher" },
      { time: "11:00", name: "Women's Strength", type: "Strength", level: "Beginner", by: "Women's batch trainer", women: true },
      { time: "18:30", name: "Barbell Club", type: "Strength", level: "Intermediate", by: "Strength coach" },
      { time: "20:00", name: "Zumba Night", type: "Zumba", level: "All levels", by: "Zumba instructor" }
    ],
    Fri: [
      { time: "06:30", name: "Strength Basics", type: "Strength", level: "Beginner", by: "Strength coach" },
      { time: "07:30", name: "Morning Yoga", type: "Yoga", level: "All levels", by: "Yoga teacher" },
      { time: "11:00", name: "Women's Zumba", type: "Zumba", level: "All levels", by: "Women's batch trainer", women: true },
      { time: "18:30", name: "Zumba Party", type: "Zumba", level: "All levels", by: "Zumba instructor" },
      { time: "19:30", name: "HIIT Burn", type: "HIIT", level: "Intermediate", by: "HIIT coach" }
    ],
    Sat: [
      { time: "07:00", name: "Weekend Yoga", type: "Yoga", level: "All levels", by: "Yoga teacher" },
      { time: "08:30", name: "Bootcamp", type: "HIIT", level: "Intermediate", by: "Head trainer" },
      { time: "10:00", name: "Zumba Party", type: "Zumba", level: "All levels", by: "Zumba instructor" },
      { time: "17:30", name: "Lifting Workshop", type: "Strength", level: "All levels", by: "Head trainer" }
    ],
    Sun: [
      { time: "08:00", name: "Sunday Yoga", type: "Yoga", level: "All levels", by: "Yoga teacher" },
      { time: "09:30", name: "Family Zumba", type: "Zumba", level: "All levels", by: "Zumba instructor" }
    ]
  };

  // ---------------------------------------------------------------------
  // 5. BMI CALCULATOR. The bands on the coloured scale, from low to high.
  //    below: the band ends just under this number. The last band has no end.
  //    These are the usual world-wide bands. Some Indian doctors use 23 and 25
  //    in place of 25 and 30. Change the two numbers here if the client wants that.
  //    healthy: true marks the band used for the "healthy weight" line.
  // ---------------------------------------------------------------------
  const BMI_BANDS = [
    { name: "Underweight", below: 18.5, colour: "#7cc4ff",
      text: "Your BMI is below the healthy range. Strength training and the right food can help you build up slowly." },
    { name: "Healthy range", below: 25, colour: "#58d39b", healthy: true,
      text: "Your BMI is in the healthy range. Regular training will keep you there and make you stronger." },
    { name: "Overweight", below: 30, colour: "#ffc857",
      text: "Your BMI is a little above the healthy range. Cardio and strength work, three to four days a week, is a good start." },
    { name: "Obese range", colour: "#ff8370",
      text: "Your BMI is well above the healthy range. Start gently, and speak to your doctor before any hard exercise." }
  ];
  // The lowest and highest BMI drawn on the scale.
  const BMI_SCALE = { from: 15, to: 40 };

  // ---------------------------------------------------------------------
  // 6. FACILITIES. icon: one of cardio, dumbbell, lock, shower, steam, park, wind, drop.
  // ---------------------------------------------------------------------
  const FACILITIES = [
    { icon: "cardio", name: "Cardio zone", text: "Treadmills, cross trainers and cycles." },
    { icon: "dumbbell", name: "Free weights", text: "Dumbbells from 2.5 kg to 40 kg, bars and plates." },
    { icon: "lock", name: "Lockers", text: "Free to use while you train." },
    { icon: "shower", name: "Showers", text: "Separate changing rooms for men and women." },
    { icon: "steam", name: "Steam room", text: "Open every evening for members." },
    { icon: "park", name: "Parking", text: "Two-wheeler parking right outside." },
    { icon: "wind", name: "Air conditioning", text: "The whole floor stays cool, even in May." },
    { icon: "drop", name: "Drinking water", text: "Filtered cold water on the floor." }
  ];

  // ---------------------------------------------------------------------
  // 7. TRAINERS. First name, role and one line about what they do.
  //    look: a number from 1 to 6. It picks one of the six drawn faces
  //    (1, 2 and 3 have short hair, 4 a bun, 5 long hair, 6 a ponytail).
  //    The faces are drawings, so no photo of a real person is needed.
  // ---------------------------------------------------------------------
  const TRAINERS = [
    { name: "Karan", role: "Head trainer", look: 1, text: "Strength and conditioning. Plans your first month and checks your progress." },
    { name: "Rohit", role: "Strength coach", look: 2, text: "Safe lifting, from your first squat to heavy barbell work." },
    { name: "Aditya", role: "HIIT coach", look: 3, text: "Short, hard sessions that burn fat and build stamina." },
    { name: "Meera", role: "Yoga teacher", look: 4, text: "Morning and evening yoga for flexibility and a calm mind." },
    { name: "Sneha", role: "Zumba instructor", look: 5, text: "Dance workouts where you forget you are exercising." },
    { name: "Priya", role: "Women's batch trainer", look: 6, text: "Runs the women-only batch at 11 am, Monday to Friday." }
  ];

  // ---------------------------------------------------------------------
  // 8. GALLERY. id: the Unsplash photo id.   caption: the line shown on the photo.
  //    On phones the first and last photos are shown wide.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { id: "1540497077202-7c8a3999166f", caption: "Main workout floor" },
    { id: "1558611848-73f7eb4001a1", caption: "Squat rack and free weights" },
    { id: "1598289431512-b97b0917affc", caption: "Cycling studio" },
    { id: "1571902943202-507ec2618e8f", caption: "Cardio zone by the windows" },
    { id: "1521805103424-d8f8430e8933", caption: "Barbells and plates" },
    { id: "1623874514711-0f321325f318", caption: "Functional training area" }
  ];

  // ---------------------------------------------------------------------
  // 9. A link like  ?firm=Iron+House+Gym&area=Borivali  shows the page
  //    with that gym name and area, so one sample works for many gyms.
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const customFirm = clean(params.get("firm"), 60);
  const customArea = clean(params.get("area"), 40);
  const firm = customFirm || CONFIG.firm;
  const area = customArea || CONFIG.area;
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

  // One drawn shape (used for the BMI dial and the trainers' faces).
  const shape = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const oneDecimal = (x) => String(Math.round(x * 10) / 10);

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

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Gym in " + area + ", " + CONFIG.city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = CONFIG.city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about gym membership in " + area + ".");
  });
  $$('[data-wa="trial"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to book a free trial session at your gym in " + area + ". Please tell me a good time.");
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
    link.hidden = false;
  }

  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + CONFIG.city) + "&output=embed";

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

  // If the gym is open at minute t, the minute it closes. Otherwise null.
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

  // The next minute the gym opens after minute t. Null when it never opens.
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
      // Back-to-back hours (a gym that never shuts): keep following to the real closing time.
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

  // "Mon to Sat: 6 am to 11 pm" and "Sun: 7 am to 2 pm" for the contact card.
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

  // The hours most days share, for the tick under the headline and the quick fact.
  let usual = null;
  const tally = {};
  DAYS.forEach((day, i) => {
    const hours = hoursOf(i);
    if (!hours) { return; }
    const key = hours.start + "-" + hours.end;
    tally[key] = (tally[key] || 0) + 1;
    if (!usual || tally[key] > tally[usual.key]) { usual = { key: key, start: hours.start, end: hours.end }; }
  });
  if (usual) { $("#trustHours").textContent = "Open " + clock(usual.start) + " to " + clock(usual.end); }

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
  // Membership plans and the period switch
  // ---------------------------------------------------------------------
  const shortest = PERIODS[0];
  const planGrid = $("#planGrid");
  const periodSeg = $("#periodSeg");
  let months = PERIODS.some((period) => period.months === START_PERIOD) ? START_PERIOD : shortest.months;

  const periodLabel = (count) => PERIODS.find((period) => period.months === count).label;

  // Total, per-month price and saving for one plan over the chosen period.
  const planSums = (plan, count) => {
    const total = plan.prices[count];
    const fullRate = plan.prices[shortest.months] / shortest.months;
    return { total: total, perMonth: total / count, saving: Math.max(0, Math.round(fullRate * count - total)) };
  };

  const buildPlan = (plan) => {
    const sums = planSums(plan, months);
    const label = periodLabel(months);
    const card = el("article", plan.popular ? "plan is-popular" : "plan");
    card.dataset.tilt = "";       // leans toward the mouse or finger (done by ../fx/fx.js)
    card.dataset.tiltMax = "5";
    if (plan.popular) { card.appendChild(el("span", "plan-flag", "Most popular")); }

    const head = el("div");
    head.appendChild(el("h3", "plan-name", plan.name));
    head.appendChild(el("p", "plan-line", plan.line));
    card.appendChild(head);

    const price = el("p", "plan-price");
    price.appendChild(el("strong", "", inr(sums.total)));
    price.appendChild(document.createTextNode(" "));
    price.appendChild(el("span", "", "for " + label));
    card.appendChild(price);

    const sub = el("p", "plan-sub");
    if (months === shortest.months) {
      sub.appendChild(el("span", "per", "Pay month by month"));
    } else {
      sub.appendChild(el("span", "per", "That is " + inr(sums.perMonth) + " a month"));
      if (sums.saving > 0) {
        sub.appendChild(document.createTextNode(" "));
        sub.appendChild(el("span", "save", "Save " + inr(sums.saving)));
      }
    }
    card.appendChild(sub);

    const list = el("ul", "plan-list");
    plan.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    card.appendChild(list);

    // Only the popular plan gets the filled button, so the eye knows where to go first.
    const join = el("a", plan.popular ? "btn btn-brand btn-3d" : "btn btn-ghost");
    join.dataset.ripple = "";
    join.target = "_blank";
    join.rel = "noopener";
    join.href = waLink("Hello " + firm + ", I want to join the " + plan.name + " plan for " + label + " (" + inr(sums.total) + "). Please tell me how to start.");
    join.setAttribute("aria-label", "Join on WhatsApp: " + plan.name + ", " + label + ", " + inr(sums.total));
    join.appendChild(icon("wa", true));
    join.appendChild(el("span", "", "Join on WhatsApp"));
    card.appendChild(join);
    return card;
  };

  // ---------------------------------------------------------------------
  // The membership card drawn under the plans. It carries the gym's own name,
  // shows the popular plan, and its "valid until" date follows the period switch.
  // ---------------------------------------------------------------------
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Today plus a number of months. The 31st of a month lands on the last day of a shorter month.
  const dateAfterMonths = (count) => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + count + 1, 0).getDate();
    const end = new Date(now.getFullYear(), now.getMonth() + count, Math.min(now.getDate(), lastDay));
    return end.getDate() + " " + MONTH_NAMES[end.getMonth()] + " " + end.getFullYear();
  };
  const cardPlan = PLANS.find((plan) => plan.popular) || PLANS[0];

  // The barcode strip: bars of different widths, always the same pattern.
  const barsBox = $("#mcardBars");
  const BAR_WIDTHS = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2];
  let barX = 2;
  BAR_WIDTHS.forEach((width, i) => {
    if (i % 2 === 0) { barsBox.appendChild(shape("rect", { x: barX, y: 0, width: width * 1.5, height: 34, fill: "#17130f" })); }
    barX += width * 1.5 + (i % 2 === 0 ? 0 : 0.6);
  });
  barsBox.setAttribute("viewBox", "0 0 " + (barX + 2).toFixed(1) + " 34");
  $("#mcardMember").textContent = CONFIG.cardMember;

  const paintCard = () => {
    const until = dateAfterMonths(months);
    $("#mcardPlan").textContent = cardPlan.name;
    $("#mcardUntil").textContent = until;
    $("#passLive").textContent = "Join today for " + periodLabel(months) + " and your card is valid until " + until + ".";
    $("#passStage").setAttribute("aria-label",
      "Membership card for " + firm + ". Member " + CONFIG.cardMember + ", plan " + cardPlan.name + ", valid until " + until + ".");
  };

  const setPeriod = (count) => {
    months = count;
    $$(".seg-btn", periodSeg).forEach((button) => setPressed(button, Number(button.dataset.months) === months));
    planGrid.replaceChildren(...PLANS.map(buildPlan));
    const bestSaving = Math.max(...PLANS.map((plan) => planSums(plan, months).saving));
    $("#periodNote").textContent = months === shortest.months || bestSaving <= 0
      ? "Pay month by month. Longer plans cost less per month."
      : "Pay for " + periodLabel(months) + " together and save up to " + inr(bestSaving) + ".";
    paintCard();
  };

  PERIODS.forEach((period) => {
    const button = el("button", "seg-btn", period.label);
    button.type = "button";
    button.dataset.months = String(period.months);
    button.addEventListener("click", () => setPeriod(period.months));
    periodSeg.appendChild(button);
  });

  // The lowest per-month price on the page, for the second button under the headline.
  const lowest = Math.min(...PLANS.map((plan) => Math.min(...PERIODS.map((period) => plan.prices[period.months] / period.months))));
  $("#heroFrom").textContent = inr(lowest);

  // ---------------------------------------------------------------------
  // Weekly class timetable: day tabs and the class type filter
  // ---------------------------------------------------------------------
  const timetable = { day: todayIndex(), type: "all" };
  const dayTabs = $("#dayTabs");
  const typeChips = $("#typeChips");
  const slots = $("#slots");
  const slotsEmpty = $("#slotsEmpty");
  let shownNext = "";

  const classesFor = (dayIndex, type) =>
    (TIMETABLE[DAYS[dayIndex].key] || [])
      .filter((item) => type === "all" || item.type === type)
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  // On today's tab, the first class that has not started yet.
  const nextClass = (rows, dayIndex) => {
    const now = new Date();
    if (dayIndex !== todayIndex(now)) { return null; }
    const minute = now.getHours() * 60 + now.getMinutes();
    return rows.find((item) => toMinutes(item.time) > minute) || null;
  };
  const classKey = (item) => (item ? item.time + " " + item.name : "");

  // The WhatsApp message for booking one class.
  const bookLink = (item, day) =>
    waLink("Hello " + firm + ", I want to book the " + item.name + " class on " + day.name + " at " + clock(toMinutes(item.time)) + ". Please confirm my place.");

  // The next classes from this minute onward: the rest of today, then tomorrow, and so on.
  // ahead: 0 for today, 1 for tomorrow, 2 and more for later in the week.
  const upcoming = (limit) => {
    const now = new Date();
    const today = todayIndex(now);
    const minute = now.getHours() * 60 + now.getMinutes();
    const list = [];
    for (let ahead = 0; ahead <= 7 && list.length < limit; ahead += 1) {
      const dayIndex = (today + ahead) % 7;
      classesFor(dayIndex, "all").forEach((item) => {
        const start = toMinutes(item.time);
        if ((ahead === 0 && start <= minute) || (ahead === 7 && start > minute) || list.length >= limit) { return; }
        list.push({ item: item, day: DAYS[dayIndex], ahead: ahead });
      });
    }
    return list;
  };
  const dayWord = (entry) => (entry.ahead === 0 ? "Today" : entry.ahead === 1 ? "Tomorrow" : entry.day.name);

  // The quiet line under a class name: "Beginner, with Rohit".
  // The first name comes from the TRAINERS list; if the role is not found there, the role is shown.
  const classDetail = (item) => {
    const person = TRAINERS.find((entry) => entry.role === item.by);
    if (person) { return item.level + ", with " + person.name; }
    return item.level + ", " + item.by;
  };

  // The small line above a class name: a colour dot and the class type,
  // then "Women only" and "Up next" when they apply.
  const typeSlug = (type) => String(type).toLowerCase().replace(/[^a-z0-9]/g, "");
  const typeLine = (item, isNext) => {
    const line = el("p", "type-line");
    const dot = el("i", "type-dot type-" + typeSlug(item.type));
    dot.setAttribute("aria-hidden", "true");
    line.appendChild(dot);
    line.appendChild(el("span", "", item.type));
    if (item.women) {
      line.appendChild(document.createTextNode(" "));
      line.appendChild(el("span", "tag tag-women", "Women only"));
    }
    if (isNext) {
      line.appendChild(document.createTextNode(" "));
      line.appendChild(el("span", "tag tag-next", "Up next"));
    }
    return line;
  };

  const buildSlot = (item, day, index, isNext) => {
    const when = clock(toMinutes(item.time));
    const li = el("li", isNext ? "slot is-next" : "slot");
    li.style.setProperty("--i", String(index));

    const time = el("div", "slot-time");
    const parts = when.split(" ");
    time.appendChild(el("strong", "", parts[0]));
    if (parts[1]) {
      time.appendChild(document.createTextNode(" "));
      time.appendChild(el("span", "", parts[1]));
    }
    li.appendChild(time);

    const main = el("div", "slot-main");
    main.appendChild(typeLine(item, isNext));
    main.appendChild(el("h3", "", item.name));
    main.appendChild(el("p", "slot-meta", classDetail(item)));
    li.appendChild(main);

    // On a phone the button just says "Book"; wider screens have room for the full words.
    const book = el("a", "btn btn-ghost btn-sm slot-book");
    book.dataset.ripple = "";
    book.target = "_blank";
    book.rel = "noopener";
    book.href = bookLink(item, day);
    book.setAttribute("aria-label", "Book this class on WhatsApp: " + item.name + ", " + day.name + " at " + when);
    book.appendChild(icon("wa", true));
    book.appendChild(el("span", "label-short", "Book"));
    book.appendChild(el("span", "label-long", "Book this class"));
    li.appendChild(book);
    return li;
  };

  const renderSlots = () => {
    const day = DAYS[timetable.day];
    const rows = classesFor(timetable.day, timetable.type);
    const next = nextClass(rows, timetable.day);
    shownNext = classKey(next);
    slots.replaceChildren(...rows.map((item, i) => buildSlot(item, day, i, item === next)));
    slots.hidden = rows.length === 0;
    slotsEmpty.hidden = rows.length !== 0;
    const kind = timetable.type === "all" ? "" : timetable.type + " ";
    $("#slotCount").textContent = rows.length === 0 ? "" : day.name + ": " + rows.length + " " + kind + (rows.length === 1 ? "class" : "classes");
    $("#slotsEmptyText").textContent = "No " + kind + "classes on " + day.name + ".";
    $("#slotsReset").hidden = timetable.type === "all";
  };

  // Keep the picked day in view when the row of days is wider than the phone.
  const showChip = (button) => {
    const row = button.parentElement;
    row.scrollLeft += button.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - button.offsetWidth) / 2;
  };

  const markToday = () => {
    const today = todayIndex();
    $$(".chip-day", dayTabs).forEach((button, i) => {
      button.classList.toggle("is-today", i === today);
      button.setAttribute("aria-label", DAYS[i].name + (i === today ? ", today" : ""));
    });
  };

  const setTimetable = (patch) => {
    Object.assign(timetable, patch);
    $$(".chip-day", dayTabs).forEach((button, i) => setPressed(button, i === timetable.day));
    $$(".chip", typeChips).forEach((button) => setPressed(button, button.dataset.type === timetable.type));
    renderSlots();
    showChip(dayTabs.children[timetable.day]);
  };

  DAYS.forEach((day, i) => {
    const button = el("button", "chip chip-day");
    button.type = "button";
    button.appendChild(el("span", "d-short", day.key));
    button.appendChild(el("span", "d-long", day.name));
    button.addEventListener("click", () => setTimetable({ day: i }));
    dayTabs.appendChild(button);
  });
  [["all", "All classes"]].concat(CLASS_TYPES.map((type) => [type, type])).forEach(([value, label]) => {
    const button = el("button", "chip", label);
    button.type = "button";
    button.dataset.type = value;
    button.addEventListener("click", () => setTimetable({ type: value }));
    typeChips.appendChild(button);
  });
  $("#slotsReset").addEventListener("click", () => setTimetable({ type: "all" }));

  // ---------------------------------------------------------------------
  // "Coming up" 3D carousel, and the small "next class" card on the top photo.
  // The cards are the next six classes from now. The turning is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const TYPE_ICONS = { strength: "dumbbell", yoga: "yoga", zumba: "music", hiit: "bolt" };

  const ringTrack = $("#ringTrack");
  const comingUp = upcoming(6);
  if (ringTrack && comingUp.length >= 3) {
    comingUp.forEach((entry) => {
      const item = entry.item;
      const when = clock(toMinutes(item.time));
      const card = el("article", "ring-card");

      const top = el("div", "ring-top");
      const big = icon(TYPE_ICONS[typeSlug(item.type)] || "dumbbell");
      big.classList.add("ring-ico");
      top.appendChild(big);
      top.appendChild(el("span", "ring-day", dayWord(entry)));
      top.appendChild(el("strong", "ring-time", when));
      card.appendChild(top);

      const body = el("div", "ring-body");
      body.appendChild(typeLine(item, false));
      body.appendChild(el("h3", "", item.name));
      body.appendChild(el("p", "ring-meta", classDetail(item)));
      const book = el("a", "btn btn-brand btn-sm btn-3d");
      book.dataset.ripple = "";
      book.target = "_blank";
      book.rel = "noopener";
      book.draggable = false;
      book.href = bookLink(item, entry.day);
      book.setAttribute("aria-label", "Book this class on WhatsApp: " + item.name + ", " + entry.day.name + " at " + when);
      book.appendChild(icon("wa", true));
      book.appendChild(el("span", "", "Book this class"));
      body.appendChild(book);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  } else if (ringTrack) {
    $("#next").hidden = true;   // fewer than three classes in the whole week: no carousel
  }

  const paintHeroNext = () => {
    const entry = upcoming(1)[0];
    const card = $("#heroNext");
    card.hidden = !entry;
    if (!entry) { return; }
    const label = "Next class " + (entry.ahead > 1 ? "on " + entry.day.name : dayWord(entry).toLowerCase());
    if ($("#heroNextWhen").textContent !== label) { $("#heroNextWhen").textContent = label; }
    $("#heroNextName").textContent = entry.item.name;
    $("#heroNextTime").textContent = clock(toMinutes(entry.item.time)) + ", " + entry.item.level.toLowerCase();
  };

  // ---------------------------------------------------------------------
  // BMI calculator
  // ---------------------------------------------------------------------
  const bmiFields = [
    { box: $("#bmiHeight"), slider: $("#bmiHeightRange"), value: 0 },
    { box: $("#bmiWeight"), slider: $("#bmiWeightRange"), value: 0 }
  ];
  const bmiLegend = $("#bmiLegend");
  const bmiCard = $(".bmi-card");
  let bmiSpeak = 0;

  const scaleSpan = BMI_SCALE.to - BMI_SCALE.from;
  const scalePlace = (bmi) => Math.min(100, Math.max(0, ((bmi - BMI_SCALE.from) / scaleSpan) * 100));
  const bandStart = (index) => (index === 0 ? BMI_SCALE.from : BMI_BANDS[index - 1].below);
  const bandEnd = (index) => (BMI_BANDS[index].below === undefined ? BMI_SCALE.to : BMI_BANDS[index].below);

  // The dial is half a circle, like a weighing machine: the lowest BMI on the left,
  // the highest on the right. A point on it is found from how far along the scale it is.
  const DIAL = { cx: 120, cy: 122, r: 86 };
  const dialPoint = (percent, radius) => {
    const angle = Math.PI * (1 - percent / 100);
    return (DIAL.cx + radius * Math.cos(angle)).toFixed(1) + " " + (DIAL.cy - radius * Math.sin(angle)).toFixed(1);
  };
  const dial = shape("svg", { viewBox: "0 0 240 140", class: "bmi-dial-svg", focusable: "false" });
  const needle = shape("g", { class: "bmi-needle" });
  needle.appendChild(shape("path", { d: "M120 50L125.5 122h-11z", fill: "#fff" }));

  // Draw the coloured dial, the numbers around it and the key once.
  BMI_BANDS.forEach((band, i) => {
    // A small gap between two bands, none at the two ends of the dial.
    const from = scalePlace(bandStart(i)) + (i === 0 ? 0 : 0.7);
    const to = scalePlace(bandEnd(i)) - (band.below === undefined ? 0 : 0.7);
    dial.appendChild(shape("path", {
      d: "M" + dialPoint(from, DIAL.r) + "A" + DIAL.r + " " + DIAL.r + " 0 0 1 " + dialPoint(to, DIAL.r),
      fill: "none", stroke: band.colour, "stroke-width": "16", class: "bmi-arc"
    }));

    if (band.below !== undefined) {
      const spot = dialPoint(scalePlace(band.below), DIAL.r + 23).split(" ");
      const tick = shape("text", { x: spot[0], y: String(Number(spot[1]) + 4), "text-anchor": "middle", class: "bmi-tick" });
      tick.textContent = String(band.below);
      dial.appendChild(tick);
    }

    const range = i === 0
      ? "Below " + band.below
      : band.below === undefined
        ? bandStart(i) + " and above"
        : bandStart(i) + " to " + oneDecimal(band.below - 0.1);
    const li = el("li");
    const swatch = el("i");
    swatch.style.background = band.colour;
    li.appendChild(swatch);
    const words = el("span", "", " " + range);
    words.prepend(el("strong", "", band.name));
    li.appendChild(words);
    bmiLegend.appendChild(li);
  });
  dial.appendChild(needle);
  dial.appendChild(shape("circle", { cx: DIAL.cx, cy: DIAL.cy, r: 10, class: "bmi-hub" }));
  $("#bmiDial").appendChild(dial);

  const setFill = (field) => {
    const min = Number(field.slider.min);
    const max = Number(field.slider.max);
    field.slider.style.setProperty("--fill", ((field.value - min) / (max - min)) * 100 + "%");
  };

  const paintBmi = () => {
    const height = bmiFields[0].value;
    const weight = bmiFields[1].value;
    const metres = height / 100;
    // The band is picked from the rounded number, so the number and the band always agree.
    const bmi = Math.round((weight / (metres * metres)) * 10) / 10;
    let index = BMI_BANDS.findIndex((band) => band.below === undefined || bmi < band.below);
    if (index < 0) { index = BMI_BANDS.length - 1; }
    const band = BMI_BANDS[index];

    $("#bmiValue").textContent = bmi.toFixed(1);
    $("#bmiBand").textContent = band.name;
    $("#bmiText").textContent = band.text;
    bmiCard.style.setProperty("--band", band.colour);
    // The needle points straight up at the middle of the scale and swings 90 degrees each way.
    needle.style.transform = "rotate(" + ((scalePlace(bmi) - 50) * 1.8).toFixed(1) + "deg)";
    Array.from(bmiLegend.children).forEach((li, i) => li.classList.toggle("is-on", i === index));

    const healthy = BMI_BANDS.findIndex((item) => item.healthy);
    const ideal = $("#bmiIdeal");
    ideal.hidden = healthy < 0;
    if (healthy >= 0) {
      const low = Math.ceil(bandStart(healthy) * metres * metres);
      const high = Math.floor((bandEnd(healthy) - 0.1) * metres * metres);
      ideal.textContent = "A healthy weight for " + oneDecimal(height) + " cm is about " + low + " to " + high + " kg.";
    }

    bmiFields.forEach(setFill);
    $("#bmiWa").href = waLink(
      "Hello " + firm + ", I checked my BMI on your website. Height " + oneDecimal(height) + " cm, weight " + oneDecimal(weight) +
      " kg, BMI " + bmi.toFixed(1) + " (" + band.name + "). Please suggest a plan for me.");

    // Screen readers hear the result once the slider stops moving.
    window.clearTimeout(bmiSpeak);
    bmiSpeak = window.setTimeout(() => { $("#bmiLive").textContent = "BMI " + bmi.toFixed(1) + ", " + band.name + "."; }, 500);
  };

  bmiFields.forEach((field) => {
    const min = Number(field.box.min);
    const max = Number(field.box.max);
    const start = parseFloat(field.box.value);
    field.value = Number.isFinite(start) ? Math.min(max, Math.max(min, start)) : Number(field.slider.value);
    field.slider.value = String(field.value);

    field.slider.addEventListener("input", () => {
      field.value = Number(field.slider.value);
      field.box.value = oneDecimal(field.value);
      paintBmi();
    });
    // While typing, wait until the number makes sense ("1" on the way to "170" is ignored).
    field.box.addEventListener("input", () => {
      const typed = parseFloat(field.box.value);
      if (!Number.isFinite(typed) || typed < min || typed > max) { return; }
      field.value = Math.round(typed * 10) / 10;
      field.slider.value = String(field.value);
      paintBmi();
    });
    // When the visitor leaves the box, tidy it: too low or too high snaps to the limit.
    field.box.addEventListener("change", () => {
      const typed = parseFloat(field.box.value);
      if (Number.isFinite(typed)) { field.value = Math.min(max, Math.max(min, Math.round(typed * 10) / 10)); }
      field.box.value = oneDecimal(field.value);
      field.slider.value = String(field.value);
      paintBmi();
    });
  });

  // ---------------------------------------------------------------------
  // Facilities and trainers
  // ---------------------------------------------------------------------
  $("#facGrid").replaceChildren(...FACILITIES.map((item) => {
    const li = el("li", "fac");
    li.appendChild(icon(item.icon));
    const words = el("div");
    words.appendChild(el("h3", "", item.name));
    words.appendChild(el("p", "", item.text));
    li.appendChild(words);
    return li;
  }));

  // The six drawn faces. Simple head-and-shoulders figures in the page colours.
  // hair: "short", "bun", "long" or "tail".   extra: "beard" or "band" (a sweat band).
  const FACES = [
    { back: "#fde8d9", skin: "#c98d5e", hair: "#1f1712", top: "#17130f", style: "short", extra: "beard" },
    { back: "#f1eadd", skin: "#b0764a", hair: "#17130f", top: "#c84400", style: "short", extra: "" },
    { back: "#fde8d9", skin: "#dba878", hair: "#2a1d14", top: "#9a3412", style: "short", extra: "band" },
    { back: "#f1eadd", skin: "#c98d5e", hair: "#1f1712", top: "#c84400", style: "bun", extra: "" },
    { back: "#fde8d9", skin: "#dba878", hair: "#2a1d14", top: "#17130f", style: "long", extra: "" },
    { back: "#f1eadd", skin: "#b0764a", hair: "#17130f", top: "#9a3412", style: "tail", extra: "" }
  ];

  const drawFace = (look) => {
    const face = FACES[(Math.max(1, Number(look) || 1) - 1) % FACES.length];
    const svg = shape("svg", { viewBox: "0 0 64 64", class: "member-face", "aria-hidden": "true" });
    svg.appendChild(shape("rect", { width: 64, height: 64, fill: face.back }));
    // Hair that falls behind the head is drawn first.
    if (face.style === "long") { svg.appendChild(shape("path", { d: "M18 30c0-11 5.5-18 14-18s14 7 14 18v18H18z", fill: face.hair })); }
    if (face.style === "tail") { svg.appendChild(shape("path", { d: "M40 16c8 1 11 8 9 17-1 5-3 8-6 10 1-5 1-9-1-13z", fill: face.hair })); }
    if (face.style === "bun") { svg.appendChild(shape("circle", { cx: 32, cy: 11, r: 5.5, fill: face.hair })); }
    svg.appendChild(shape("path", { d: "M9 64c0-12 9.5-19 23-19s23 7 23 19z", fill: face.top }));
    svg.appendChild(shape("path", { d: "M27 38h10v7.5a5 5 0 0 1-10 0z", fill: face.skin }));
    svg.appendChild(shape("path", { d: "M27 41.5c3 2 7 2 10 0V38H27z", fill: "#000", opacity: ".14" }));
    svg.appendChild(shape("ellipse", { cx: 32, cy: 28, rx: 10.5, ry: 12.5, fill: face.skin }));
    svg.appendChild(shape("path", { d: "M21 28c-1-9 3.5-15 11-15s12 6 11 15c-1.5-4.5-5-7-11-7s-9.5 2.5-11 7z", fill: face.hair }));
    if (face.extra === "beard") {
      svg.appendChild(shape("path", { d: "M21.6 30c0 7 4.4 11 10.4 11s10.4-4 10.4-11c-2 4.5-5.8 6.5-10.4 6.5s-8.4-2-10.4-6.5z", fill: face.hair }));
    }
    if (face.extra === "band") {
      svg.appendChild(shape("path", { d: "M21.3 23.5c3-2.2 6.5-3.3 10.7-3.3s7.7 1.1 10.7 3.3", fill: "none", stroke: "#c84400", "stroke-width": "3", "stroke-linecap": "round" }));
    }
    return svg;
  };

  $("#team").replaceChildren(...TRAINERS.map((person) => {
    const li = el("li", "member");
    li.appendChild(drawFace(person.look));
    const words = el("div");
    words.appendChild(el("h3", "", person.name));
    words.appendChild(el("p", "member-role", person.role));
    words.appendChild(el("p", "member-text", person.text));
    li.appendChild(words);
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
  setStat("#statClasses", DAYS.reduce((sum, day) => sum + (TIMETABLE[day.key] || []).length, 0));
  setStat("#statTrainers", TRAINERS.length);
  setStat("#statFloor", CONFIG.floorSqFt);

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
  const form = $("#enquiry");
  const formError = $("#formError");
  const needSelect = $("#needSelect");
  PLANS.map((plan) => "The " + plan.name + " plan").concat(["The women-only batch"]).forEach((label) => {
    needSelect.appendChild(el("option", "", label));
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
    const time = clean(data.get("time"), 20);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I am interested in: " + data.get("need") + " in " + area + ".",
      time ? "Best time for me: " + time + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  setPeriod(months);
  markToday();
  setTimetable({});
  paintBmi();
  paintOpen();
  paintHeroNext();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    paintHeroNext();
    markToday();
    if (classKey(nextClass(classesFor(timetable.day, timetable.type), timetable.day)) !== shownNext) { renderSlots(); }
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();
