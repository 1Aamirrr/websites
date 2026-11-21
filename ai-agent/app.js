(() => {
  "use strict";

  // =====================================================================
  // WhatsApp AI assistant demo.
  // Everything runs in the browser: no AI service, no network calls.
  // The "assistant" matches what the customer types against keywords
  // (English and Hinglish) and the business details in data.js.
  // =====================================================================

  const BUSINESSES = window.AGENT_BUSINESSES || [];
  const OWNER = window.OWNER || {};
  const LEAD = window.LEAD || {};
  if (!BUSINESSES.length) { return; }

  // ---------------------------------------------------------------------
  // 1. Link values:  ?kind=gym&firm=Iron+House&area=Borivali&owner=Rohit
  //    kind picks the business. firm, area, city and owner rename it.
  //    ?autoplay=1 plays the demo by itself. ?id=... uses a real business (see ../lead.js).
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const KIND_WORDS = {
    clinic: "clinic", dental: "clinic", dentist: "clinic", doctor: "clinic",
    gym: "gym", fitness: "gym",
    salon: "salon", parlour: "salon", parlor: "salon", beauty: "salon", spa: "salon",
    restaurant: "restaurant", cafe: "restaurant", food: "restaurant", hotel: "restaurant"
  };
  const startKind = KIND_WORDS[clean(params.get("kind"), 20).toLowerCase()] || "clinic";
  const custom = {
    firm: clean(params.get("firm") || LEAD.firm, 60),
    area: clean(params.get("area") || LEAD.area, 40),
    city: clean(params.get("city") || LEAD.city, 30),
    owner: clean(params.get("owner"), 40)
  };
  const builtBy = OWNER.name || "Oxzi";
  const builderNumber = String(OWNER.whatsapp || "").replace(/\D/g, "");
  const money = OWNER.money || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const isINR = money.code === "INR";
  const fast = params.get("fast") === "1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------
  // 2. Small helpers
  // ---------------------------------------------------------------------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const SVG_NS = "http://www.w3.org/2000/svg";
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  };
  const icon = (name, extra) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "ico" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  };
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, fast ? Math.round(ms * 0.25) : ms));
  const rs = (n) => money.sign + Math.round(n * money.scale).toLocaleString(money.locale);
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const waLink = (text, number) => "https://wa.me/" + (number || "") + "?text=" + encodeURIComponent(text);

  // Time: minutes after midnight. 1050 is "5:30 pm".
  const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const toMin = (hhmm) => { const p = String(hhmm).split(":"); return Number(p[0]) * 60 + Number(p[1] || 0); };
  const clock = (minutes) => {
    const m = ((minutes % 1440) + 1440) % 1440;
    if (m === 0) { return "midnight"; }
    if (m === 720) { return "12 noon"; }
    const h = Math.floor(m / 60);
    const r = m % 60;
    return (h % 12 || 12) + (r ? ":" + String(r).padStart(2, "0") : "") + (h < 12 ? " am" : " pm");
  };
  const stamp = (date = new Date()) => {
    const h = date.getHours();
    return (h % 12 || 12) + ":" + String(date.getMinutes()).padStart(2, "0") + (h < 12 ? " am" : " pm");
  };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const dateAt = (offset) => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset); };
  const dateKey = (d) => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  const shortDate = (d) => d.getDate() + " " + MONTHS[d.getMonth()];
  const dayWord = (offset, hi) => {
    const d = dateAt(offset);
    if (offset === 0) { return hi ? "aaj" : "today"; }
    if (offset === 1) { return hi ? "kal" : "tomorrow"; }
    return DAY_NAMES[d.getDay()];
  };
  const dayLong = (offset) => { const d = dateAt(offset); return DAY_NAMES[d.getDay()] + ", " + shortDate(d); };

  // A steady number from a string, so the "booked" slots look the same every time.
  const hash = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  // ---------------------------------------------------------------------
  // 3. The business on screen
  // ---------------------------------------------------------------------
  let biz = null;

  const makeBiz = (kind) => {
    const base = BUSINESSES.find((b) => b.kind === kind) || BUSINESSES[0];
    const b = JSON.parse(JSON.stringify(base));
    b.custom = false;
    if (b.kind === startKind) {
      if (custom.firm) { b.firm = custom.firm; b.custom = true; }
      if (custom.area) { b.area = custom.area; }
      if (custom.city) { b.city = custom.city; }
      if (custom.owner) { b.owner = custom.owner; b.ownerShort = custom.owner; b.pronoun = "They"; }
      else if (b.custom) {
        b.owner = b.kind === "clinic" ? "the doctor" : "the owner";
        b.ownerShort = b.owner;
        b.pronoun = "They";
      }
      if (LEAD.firm && LEAD.hours) {
        Object.keys(b.hours).forEach((d) => { b.hours[d] = LEAD.hours[d] || []; });
      }
    }
    const realAddress = b.kind === startKind && LEAD.firm && LEAD.address;
    b.fullAddress = realAddress ? LEAD.address : b.address + ", " + b.area + ", " + b.city;
    if (realAddress) { b.landmark = ""; } // the sample's directions do not fit a real address
    b.mapHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.firm + ", " + b.fullAddress);
    b.items = [];
    (b.menu || []).forEach((section) => section.items.forEach((item) => { item.section = section.section; b.items.push(item); }));
    const bookName = (b.script || []).find((s) => s.indexOf("@book:") === 0);
    b.demoName = bookName ? bookName.slice(6) : (b.demoName || "Rahul");
    b.talkChip = b.kind === "clinic" ? "Talk to doctor" : "Talk to owner";
    return b;
  };

  const fill = (text) => String(text)
    .replace(/\{rs:(\d+)\}/g, (_, n) => rs(Number(n)))
    .replace(/\{(firm|area|city|owner|ownerShort)\}/g, (_, key) => biz[key]);

  // Opening hours of one day as [start, end] minute pairs. A close at or before the open time means after midnight.
  const rangesOn = (date) => (biz.hours[DAY_KEYS[date.getDay()]] || []).map((r) => {
    const a = toMin(r[0]);
    let b = toMin(r[1]);
    if (b <= a) { b += 1440; }
    return [a, b];
  });
  const rangesText = (ranges, hi) => ranges.map((r) => clock(r[0]) + (hi ? " se " : " to ") + clock(r[1]) + (hi ? " tak" : "")).join(hi ? " aur " : " and ");

  const openState = () => {
    const today = rangesOn(dateAt(0));
    const n = nowMin();
    const inside = today.find((r) => n >= r[0] && n < r[1]);
    if (inside) { return { open: true, until: inside[1] }; }
    // Still open from last night, for example a cafe that closes at 1 am
    const lateNight = rangesOn(dateAt(-1)).find((r) => r[1] > 1440 && n < r[1] - 1440);
    if (lateNight) { return { open: true, until: lateNight[1] - 1440 }; }
    for (let off = 0; off < 8; off += 1) {
      const next = rangesOn(dateAt(off)).find((r) => off > 0 || r[0] > n);
      if (next) { return { open: false, offset: off, at: next[0] }; }
    }
    return { open: false };
  };

  // "Mon to Wed: 10 am to 1:30 pm and 5 pm to 9 pm" lines, Monday first.
  const hoursRows = () => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    const rows = [];
    order.forEach((idx) => {
      const r = (biz.hours[DAY_KEYS[idx]] || []).map((x) => clock(toMin(x[0])) + " to " + clock(toMin(x[1]))).join("\n");
      const text = r || "Closed";
      const last = rows[rows.length - 1];
      if (last && last.text === text) { last.to = idx; } else { rows.push({ from: idx, to: idx, text: text }); }
    });
    return rows.map((row) => [
      row.from === row.to ? DAY_KEYS[row.from] : DAY_KEYS[row.from] + " to " + DAY_KEYS[row.to],
      row.text
    ]);
  };

  // ---------------------------------------------------------------------
  // 4. Free slots. Some slots look booked already (the same ones every time),
  //    5 pm is always taken (the busy hour), and slots booked in the demo are taken.
  // ---------------------------------------------------------------------
  const slotsOn = (offset) => {
    const date = dateAt(offset);
    const step = biz.booking.slotMins;
    const last = biz.booking.people ? 60 : step; // tables: last seating an hour before closing
    const out = [];
    rangesOn(date).forEach((r) => {
      for (let t = r[0]; t + last <= Math.min(r[1], 1440); t += step) { out.push(t); } // bookings stop at midnight
    });
    return out.map((t) => ({ t: t, free: isFree(offset, t) }));
  };
  const isFree = (offset, t) => {
    const key = dateKey(dateAt(offset)) + "@" + t;
    if (offset === 0 && t < nowMin() + 30) { return false; }
    if (S.taken.has(key)) { return false; }
    if (t === 17 * 60) { return false; }
    return hash(biz.kind + key) % 100 >= 32;
  };
  // Up to "count" free slots spread over the day, or the ones nearest a wanted time.
  const pickSlots = (free, count, near) => {
    if (near !== undefined) {
      return free.slice().sort((a, b) => Math.abs(a.t - near) - Math.abs(b.t - near) || a.t - b.t).slice(0, count).sort((a, b) => a.t - b.t);
    }
    if (free.length <= count) { return free; }
    const out = [];
    for (let i = 0; i < count; i += 1) { out.push(free[Math.round(i * (free.length - 1) / (count - 1))]); }
    return out.filter((s, i) => out.indexOf(s) === i);
  };
  const nextOpenDay = (from) => {
    for (let off = from; off < from + 14; off += 1) {
      if (slotsOn(off).some((s) => s.free)) { return off; }
    }
    return null;
  };

  // ---------------------------------------------------------------------
  // 5. Reading the message: keywords in English and Hinglish
  // ---------------------------------------------------------------------
  const normWord = (w) => String(w).toLowerCase().replace(/[’`']/g, "").replace(/[^a-z0-9:*\s]/g, " ").replace(/\s+/g, " ").trim();
  const norm = (text) => " " + String(text).toLowerCase()
    .replace(/[’`']/g, "")
    .replace(/(\d)\.(\d\d)/g, "$1:$2")
    .replace(/[^a-z0-9:\s]/g, " ")
    .replace(/\s+/g, " ").trim() + " ";
  const reCache = new Map();
  // "clean*" matches "clean", "cleaning", "cleanup"
  const prefixRe = (word) => {
    let re = reCache.get(word);
    if (!re) {
      re = new RegExp(" " + normWord(word.slice(0, -1)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[a-z]*(?= )");
      reCache.set(word, re);
    }
    return re;
  };
  const has = (n, word) => {
    if (word.slice(-1) === "*") { return prefixRe(word).test(n); }
    return n.indexOf(" " + normWord(word) + " ") !== -1;
  };
  const hasAny = (n, list) => list.some((w) => has(n, w));
  const firstHit = (n, list) => list.find((w) => has(n, w));

  const K = {
    greet: ["hi", "hii", "hiii", "hello", "helo", "hey", "heyy", "namaste", "namaskar", "good morning", "good evening", "good afternoon", "salaam", "salam", "assalam*", "hlo", "hy"],
    timing: ["timing*", "hours", "open*", "close*", "closing", "khul*", "kab tak", "kab se", "kitne baje", "what time", "working hours", "holiday", "chutti", "band hai", "band rehta"],
    location: ["location", "address", "kaha", "kahan", "kidhar", "where", "map", "direction*", "pata bhej*", "pata do", "pata kya", "ka pata", "reach", "route", "landmark", "nearest station", "how to come", "kaise aaye", "kaise aana"],
    price: ["price*", "pricing", "cost*", "rate*", "charge*", "fee", "fees", "kitna", "kitne", "kitni", "how much", "paisa", "paise", "rupees", "package*", "plan", "plans", "membership", "tariff", "expensive", "sasta"],
    menu: ["menu", "khana", "food", "dish*", "what do you have", "kya milta", "kya kya", "starters", "dessert*", "non veg", "nonveg"],
    order: ["order*", "deliver*", "mangwa*", "mangana", "bhej do", "bhejo", "bhej", "parcel", "takeaway", "take away", "home delivery", "checkout", "cart"],
    bookStrong: ["book*", "appointment*", "appoint*", "slot*", "reserv*", "trial", "fix kar*", "schedule"],
    bookWeak: ["visit", "milna", "aana", "aaun", "aau", "aa sakta", "aa sakti", "come in", "consultation", "session", "table", "kab aa", "available"],
    handoff: ["owner", "manager", "human", "insaan", "real person", "a person", "staff", "call me", "call karo", "call kar*", "phone karo", "baat karni", "baat karna", "baat karwa*", "baat kar sakt*", "talk", "speak", "contact number", "number do", "number dena", "doctor se", "doctor ko", "malik"],
    cancel: ["cancel*", "nahi aa*", "nahin aa*", "nahi aana", "reschedul*"],
    thanks: ["thank*", "thx", "thnx", "tnx", "shukriya", "dhanyavad", "dhanyawad", "great", "perfect", "awesome", "super", "nice"],
    yes: ["yes", "yeah", "yep", "yup", "haan", "han", "ha", "haa", "ji", "ok", "okay", "okk", "confirm*", "sure", "done", "theek", "thik", "chalega", "pakka", "bilkul", "correct", "go ahead", "kar do", "book it", "yes book it"],
    no: ["no", "nope", "nahi", "nahin", "mat", "dont", "not now", "later", "baad mein", "rehne do"],
    dontBook: ["dont", "do not", "nahi chahiye", "mat karo", "mat kar", "not now", "rehne do", "wait"],
    change: ["change*", "badal*", "another", "dusra", "doosra", "different", "other time", "koi aur"],
    pay: ["upi", "gpay", "google pay", "phonepe", "phone pe", "paytm", "card", "cash", "online payment", "payment"],
    checkout: ["checkout", "check out", "place order", "thats all", "that is all", "bas", "itna hi", "itna", "done", "confirm order", "order karo", "order kar do"],
    remove: ["remove", "hata*", "nikal*", "delete", "minus", "without"],
    clear: ["clear cart", "empty cart", "start again", "sab hata"],
    delivery: ["delivery", "deliver*", "home", "ghar", "ghar pe", "bhej do"],
    pickup: ["pickup", "pick up", "takeaway", "take away", "collect", "le jaunga", "le jaungi", "aakar"],
    cash: ["cash", "cod", "cash on delivery", "pay at pickup", "counter"],
    paid: ["paid", "pay kar diya", "payment done", "kar diya"],
    whoami: ["who are you", "are you a bot", "are you bot", "bot", "robot", "chatbot", "ai", "are you human", "are you real", "aapka naam", "tumhara naam", "aap kaun", "tum kaun", "kaun ho", "machine"]
  };
  const HINGLISH = ["kya", "hai", "hain", "kal", "aaj", "baje", "bje", "chahiye", "chaiye", "kitna", "kitne", "kitni", "kaha", "kahan", "kidhar", "mujhe", "muje", "karna", "karni", "karo", "kar", "aur", "ka", "ki", "ke", "ko", "se", "nahi", "nahin", "haan", "kab", "bhai", "ji", "mera", "meri", "naam", "hoga", "milega", "dena", "wala", "wali", "bhejo", "bata", "batao", "bataiye", "kaise", "kyu", "kyun", "theek", "thik", "acha", "achha", "shaam", "sham", "subah", "raat", "parso", "aapka", "aap", "hum", "tum", "khana", "khula", "bhi", "pe", "tak", "liye", "chalega", "dijiye", "kijiye", "sakte", "sakta", "bolo", "abhi", "kuch"];

  const NUMWORDS = { ek: 1, one: 1, a: 1, an: 1, do: 2, two: 2, teen: 3, three: 3, char: 4, chaar: 4, four: 4, paanch: 5, panch: 5, five: 5, chhe: 6, che: 6, six: 6, saat: 7, seven: 7, aath: 8, eight: 8, nau: 9, nine: 9, das: 10, ten: 10 };
  const toNumber = (token) => {
    if (/^\d{1,2}$/.test(token)) { return Number(token); }
    return NUMWORDS[token] || 0;
  };

  const detectLang = (n, src) => {
    if (src === "chip") { return; }
    const words = n.trim().split(" ");
    const hinglish = words.filter((w) => HINGLISH.indexOf(w) !== -1).length;
    if (hinglish > 0) { S.lang = "hi"; }
    else if (words.length >= 3) { S.lang = "en"; }
  };
  const T = (en, hi) => (S.lang === "hi" && hi ? hi : en);

  // Day: today, kal, parso, Saturday, shanivar, 25 Nov ...
  const WEEKDAYS = [
    ["sunday", "ravivar", "raviwar", "itwar", "itvar"],
    ["monday", "mon", "somvar", "somwar"],
    ["tuesday", "tue", "tues", "mangalvar", "mangalwar"],
    ["wednesday", "wed", "budhvar", "budhwar"],
    ["thursday", "thu", "thurs", "guruvar", "guruwar"],
    ["friday", "fri", "shukravar", "shukrawar"],
    ["saturday", "sat", "shanivar", "shaniwar", "weekend"]
  ];
  const DAY_WORDS = [
    [2, ["day after tomorrow", "parso", "parson", "parsoon"]],
    [1, ["kal", "tomorrow", "tmrw", "tmr", "tomorow", "tommorow", "tommorrow"]],
    [0, ["aaj", "today", "tonight", "aj", "abhi"]]
  ];
  const parseDay = (n) => {
    const found = [];
    const today = new Date().getDay();
    DAY_WORDS.forEach((d) => d[1].forEach((w) => { const at = n.indexOf(" " + w + " "); if (at !== -1) { found.push({ at: at, off: d[0] }); } }));
    WEEKDAYS.forEach((names, idx) => names.forEach((w) => {
      const at = n.indexOf(" " + w + " ");
      if (at === -1) { return; }
      let off = (idx - today + 7) % 7;
      if (off === 0 && has(n, "next")) { off = 7; }
      found.push({ at: at, off: off });
    }));
    if (found.length) {
      found.sort((a, b) => a.at - b.at);
      // "kal nahi, Friday ko" or "not Monday, Tuesday": the last day named is the one wanted
      return hasAny(n, ["nahi", "nahin", "not", "instead", "no"]) ? found[found.length - 1].off : found[0].off;
    }
    const m = n.match(/ (\d{1,2})(?:st|nd|rd|th)? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* /) ||
      n.match(/ (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\d{1,2})(?:st|nd|rd|th)? /);
    if (m) {
      const dayNum = Number(/\d/.test(m[1]) ? m[1] : m[2]);
      const mon = MONTHS.map((x) => x.toLowerCase()).indexOf(/\d/.test(m[1]) ? m[2] : m[1]);
      const now = dateAt(0);
      let target = new Date(now.getFullYear(), mon, dayNum);
      if (target < now) { target = new Date(now.getFullYear() + 1, mon, dayNum); }
      const off = Math.round((target - now) / 86400000);
      if (off >= 0 && off < 60) { return off; }
    }
    return null;
  };

  // Time: "5 baje", "5:30 pm", "saade 5", "subah 7", "17:00". Or only a part of the day.
  const parseTime = (n, bare) => {
    let pm = null;
    if (hasAny(n, ["shaam", "sham", "evening", "raat", "night", "dopahar", "afternoon", "noon"]) || / \d{1,2}(:\d\d)? ?pm /.test(n)) { pm = true; }
    if (hasAny(n, ["subah", "morning", "savere"]) || / \d{1,2}(:\d\d)? ?am /.test(n)) { pm = false; }
    let h = null;
    let m = 0;
    let ap = null;
    let r = n.match(/ (\d{1,2}):(\d{2}) ?(am|pm)?(?= )/);
    if (r) { h = Number(r[1]); m = Number(r[2]); ap = r[3] || null; }
    if (h === null) { r = n.match(/ (\d{1,2}) ?(am|pm)(?= )/); if (r) { h = Number(r[1]); ap = r[2]; } }
    if (h === null && has(n, "12 noon")) { h = 12; ap = "pm"; }
    if (h === null) { r = n.match(/ (saade|sade|sawa|paune) (\d{1,2}|[a-z]+)(?= )/); if (r && toNumber(r[2])) { h = toNumber(r[2]); m = r[1] === "sawa" ? 15 : r[1] === "paune" ? -15 : 30; } }
    if (h === null) { r = n.match(/ (\d{1,2}|[a-z]+) (baje|bje|bajey|bajay|o clock|oclock)(?= )/); if (r && toNumber(r[1])) { h = toNumber(r[1]); } }
    if (h === null) { r = n.match(/ (?:at|around|by) (\d{1,2})(?= )/); if (r) { h = Number(r[1]); } }
    if (h === null && bare) { r = n.match(/^ (\d{1,2}) $/); if (r) { h = Number(r[1]); } }
    if (h === null) {
      if (hasAny(n, ["morning", "subah", "savere"])) { return { part: "morning", from: 0, to: 12 * 60 }; }
      if (hasAny(n, ["afternoon", "dopahar", "lunch"])) { return { part: "afternoon", from: 12 * 60, to: 17 * 60 }; }
      if (hasAny(n, ["evening", "shaam", "sham", "night", "raat", "dinner", "after office", "office ke baad"])) { return { part: "evening", from: 17 * 60, to: 24 * 60 }; }
      return null;
    }
    if (h > 23 || m > 59) { return null; }
    let alt;
    if (ap === "pm" && h < 12) { h += 12; }
    else if (ap === "am" && h === 12) { h = 0; }
    else if (!ap && h < 12) {
      if (pm === true) { h += 12; }
      else if (pm === null && h >= 1) {
        // No am or pm: 1 to 7 is read as evening, 8 to 11 as morning. The opening hours can flip it later.
        if (h <= 7) { alt = h * 60 + m; h += 12; } else { alt = (h + 12) * 60 + m; }
      }
    }
    return alt === undefined ? { min: h * 60 + m } : { min: h * 60 + m, alt: alt };
  };

  const STOP_NAMES = ["yes", "no", "ok", "okay", "haan", "han", "ji", "nahi", "kal", "aaj", "hi", "hello", "thanks", "confirm", "change", "cancel", "sure", "today", "tomorrow", "price", "time", "timing", "menu", "location", "done", "the", "a", "looking", "interested", "not", "free", "available", "coming", "going", "new", "here", "fine", "from", "in",
    "where", "what", "when", "how", "why", "who", "kya", "kaise", "kab", "kahan", "hai", "kuch", "aap", "aapka", "mera", "am", "pm", "please", "pls", "sorry", "hmm", "wait", "acha", "achha", "theek", "thik", "bhai", "great", "good", "fine", "busy", "ready", "back", "sir", "madam"];
  const titleCase = (s) => s.split(" ").map((w) => cap(w.toLowerCase())).join(" ");
  const parseName = (raw, awaiting) => {
    const text = String(raw).replace(/[^A-Za-z.\s]/g, " ").replace(/\s+/g, " ").trim();
    let cand = null;
    const m = text.match(/\b(my name is|my names|name is|mera naam|naam|this is|i am|im)\s+([A-Za-z][A-Za-z.]*(?:\s+[A-Za-z][A-Za-z.]*)?)/i);
    if (m) {
      const weak = ["this is", "i am", "im"].indexOf(m[1].toLowerCase()) !== -1;
      if (!weak || awaiting || /^[A-Z]/.test(m[2])) { cand = m[2]; }
    } else if (awaiting && !/\d/.test(raw)) {
      const words = text.replace(/\b(ji|hai|hu|hoon|here|naam|name|mera|my|is)\b/gi, " ").replace(/\s+/g, " ").trim();
      if (words && words.split(" ").length <= 3) { cand = words; }
    }
    if (!cand) { return null; }
    cand = cand.replace(/\b(hai|hu|hoon|here|ji)\b/gi, "").replace(/\s+/g, " ").trim();
    const parts = cand.split(" ").filter(Boolean).slice(0, 2);
    if (!parts.length || parts.some((p) => STOP_NAMES.indexOf(p.toLowerCase()) !== -1)) { return null; }
    const name = titleCase(parts.join(" "));
    return name.length >= 2 && name.length <= 30 ? name : null;
  };

  const parsePeople = (n, awaiting) => {
    let r = n.match(/ (\d{1,2}|[a-z]+) (people|persons|person|log|logon|logo|members|guests|pax|adults|jan|ppl)(?= )/);
    if (r && toNumber(r[1])) { return toNumber(r[1]); }
    r = n.match(/ (?:table for|for|we are|hum) (\d{1,2}|[a-z]+)(?= )/);
    if (r && toNumber(r[1]) && (awaiting || has(n, "table"))) { return toNumber(r[1]); }
    if (awaiting) { r = n.match(/^ (\d{1,2}|[a-z]+) $/); if (r && toNumber(r[1])) { return toNumber(r[1]); } }
    return null;
  };

  // Which services (or dishes) the message talks about. A service's own name counts most.
  const spanOf = (n, word) => {
    const w = normWord(word);
    if (w.slice(-1) === "*") {
      const m = n.match(prefixRe(word));
      return m ? { start: m.index + 1, end: m.index + m[0].length } : null;
    }
    const at = n.indexOf(" " + w + " ");
    return at === -1 ? null : { start: at + 1, end: at + 1 + w.length };
  };
  const matchServices = (n) => {
    const hits = [];
    (biz.services || []).forEach((service) => {
      let best = null;
      service.words.concat([service.name]).forEach((w) => {
        const span = spanOf(n, w);
        if (span && (!best || span.end - span.start > best.end - best.start)) { best = span; }
      });
      if (best) { hits.push({ service: service, start: best.start, end: best.end }); }
    });
    // "beard trim" is one service, not a beard plus a haircut ("trim")
    const kept = hits.filter((h) => !hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && (o.end - o.start) > (h.end - h.start)));
    kept.sort((a, b) => a.start - b.start);
    let list = kept.map((h) => h.service);
    // "haircut for men": swap to the men's service
    if (hasAny(n, ["men", "mens", "gents", "male", "boy", "boys", "ladka", "husband", "son"])) {
      list = list.map((s) => (s.men ? biz.services.find((x) => x.id === s.men) || s : s));
    }
    return list.filter((s, i) => list.indexOf(s) === i);
  };

  // Dishes with how many: "2 butter chicken aur 4 naan", "ek gulab jamun".
  const matchItems = (n) => {
    const found = [];
    biz.items.forEach((item) => {
      item.words.concat([item.name]).forEach((w) => {
        const word = " " + normWord(w.replace(/\*$/, "")) + " ";
        let at = n.indexOf(word);
        while (at !== -1) {
          found.push({ item: item, start: at, end: at + word.length - 1, len: word.length });
          at = n.indexOf(word, at + 1);
        }
      });
    });
    found.sort((a, b) => b.len - a.len);
    const kept = [];
    found.forEach((f) => { if (!kept.some((k) => f.start < k.end && k.start < f.end)) { kept.push(f); } });
    kept.sort((a, b) => a.start - b.start);
    const fillers = ["plate", "plates", "x", "pcs", "piece", "pieces", "full", "half", "order", "of"];
    return kept.map((k) => {
      const before = n.slice(0, k.start).trim().split(" ").reverse();
      let qty = 1;
      let counted = false;
      for (let i = 0; i < Math.min(before.length, 3); i += 1) {
        if (fillers.indexOf(before[i]) !== -1) { continue; }
        const q = toNumber(before[i]);
        if (q && (before[i] !== "do" || i === 0)) { qty = q; counted = true; }
        break;
      }
      return { item: k.item, qty: Math.min(qty, 20), counted: counted };
    });
  };

  // ---------------------------------------------------------------------
  // 6. State of the chat
  // ---------------------------------------------------------------------
  const S = {
    gen: 0, busy: false, queue: [], lang: "en", flow: null, offer: null, paused: false,
    customerName: null, taken: new Set(), cart: [], orders: 0, bookings: [], auto: null,
    steps: 0, unknowns: 0, msgs: 0
  };

  // A plan is what the assistant decides to do for one message: steps for the
  // "Agent at work" panel, then the replies and the quick-reply buttons.
  const newPlan = (head) => {
    const plan = { head: head || null, steps: [], msgs: [], chips: null };
    plan.step = (ico, text, opts = {}) => { plan.steps.push(Object.assign({ ico: ico, text: text, ms: 420 }, opts)); return plan; };
    plan.say = (msg) => { plan.msgs.push(typeof msg === "string" ? { type: "text", text: msg } : msg); return plan; };
    plan.chipsSet = (list) => { plan.chips = list; return plan; };
    return plan;
  };

  const startChips = () => {
    if (biz.kind === "restaurant") { return ["Menu", "Order food", biz.booking.action, "Timings", "Location", biz.talkChip]; }
    return ["Timings", biz.priceChip, biz.booking.action, "Location", biz.talkChip];
  };
  const bookable = () => (biz.services || []).filter((s) => s.mins && s.price > 0);

  const bump = (topic) => { dash.topics[topic] = (dash.topics[topic] || 0) + 1; };

  // ---------------------------------------------------------------------
  // 7. The assistant's brain: one message in, a plan out
  // ---------------------------------------------------------------------
  const think = (raw, src) => {
    const n = norm(raw);
    detectLang(n, src);
    S.msgs += 1;
    if (S.offer && S.msgs - S.offer.at > 2) { S.offer = null; }
    const plan = newPlan();
    const f = S.flow;
    const ctx = {
      raw: raw, n: n, src: src,
      services: matchServices(n),
      items: biz.items.length ? matchItems(n) : [],
      day: parseDay(n),
      time: null,
      people: biz.booking.people ? parsePeople(n, f && f.type === "booking" && f.await === "people") : null,
      name: parseName(raw, false),
      faq: (biz.faqs || []).find((q) => hasAny(n, q.words)) || null
    };
    const bookingContext = (f && f.type === "booking") || hasAny(n, K.bookStrong) || hasAny(n, K.bookWeak);
    if (bookingContext || ctx.services.length || ctx.day !== null) { ctx.time = parseTime(n, f && f.type === "booking" && f.await === "time"); }
    const I = {};
    Object.keys(K).forEach((key) => { I[key] = hasAny(n, K[key]); });
    ctx.I = I;

    plan.step("read", "Read the message", { tag: S.lang === "hi" ? "Hinglish" : "English", ms: 360, read: true });

    if (f && f.type === "booking" && bookingTurn(ctx, plan)) { return finish(plan); }
    if (f && f.type === "order" && orderTurn(ctx, plan)) { return finish(plan); }
    route(ctx, plan);
    return finish(plan);
  };

  const finish = (plan) => {
    plan.step("reply", S.lang === "hi" ? "Wrote the reply in Hinglish" : "Wrote the reply", { ms: 300 });
    if (!plan.chips) { plan.chips = startChips(); }
    return plan;
  };

  const foundText = (ctx) => {
    const bits = [];
    if (ctx.day !== null) { bits.push(cap(dayWord(ctx.day)) + " (" + shortDate(dateAt(ctx.day)) + ")"); }
    if (ctx.time && ctx.time.min !== undefined) { bits.push(clock(ctx.time.min)); }
    if (ctx.time && ctx.time.part) { bits.push("in the " + ctx.time.part); }
    if (ctx.people) { bits.push(ctx.people + " people"); }
    if (ctx.name) { bits.push("name " + ctx.name); }
    return bits.length ? "Found: " + bits.join(", ") : "";
  };

  // Top level: what is this message about?
  const route = (ctx, plan) => {
    const I = ctx.I;
    const n = ctx.n;

    if (I.whoami && !hasAny(n, ["talk", "speak", "baat", "call", "connect"])) {
      plan.step("spark", "Understood: asking who is replying", { ms: 380 });
      plan.say(T(
        "I am " + biz.firm + "'s AI assistant. I answer questions, book " + biz.booking.nounPlural + (biz.kind === "restaurant" ? ", take orders" : "") + " and pass anything tricky to " + biz.ownerShort + ". Want to talk to " + biz.ownerShort + " instead?",
        "Main " + biz.firm + " ka AI assistant hoon. Sawaalon ka jawab deta hoon, " + biz.booking.nounPlural + " book karta hoon" + (biz.kind === "restaurant" ? ", order leta hoon" : "") + ", aur mushkil baatein " + biz.ownerShort + " ko bhejta hoon. " + biz.ownerShort + " se baat karni hai?"
      ));
      plan.chipsSet([biz.talkChip, biz.booking.action, "Timings"]);
      return;
    }
    if (I.handoff && !ctx.faq) { handoff(ctx, plan, "asked"); return; }
    if (I.cancel) { cancelBooking(ctx, plan); return; }

    if (ctx.faq && ctx.faq.urgent) {
      plan.step("alert", "Understood: in pain, needs help soon", { tone: "warn", ms: 460 });
      bump("tooth pain");
      plan.say(fill(T(ctx.faq.en, ctx.faq.hi)));
      ownerAlert(plan, "In pain, booking the earliest slot", false);
      startBooking(ctx, plan, { service: (biz.services || [])[0], day: ctx.day !== null ? ctx.day : nextOpenDay(0), silent: true, earliest: true });
      return;
    }

    // Food: dishes in the message go straight to the cart
    if (biz.items.length && ctx.items.length && !I.remove) {
      if (dishQuestion(ctx)) { dishInfo(ctx, plan); } else { addToCart(ctx, plan); }
      return;
    }
    if (biz.items.length && (I.order || I.menu) && !I.bookStrong && !ctx.faq && !I.location && !I.timing) { showMenu(ctx, plan, I.order); return; }

    // "kal 11 baje cleaning" is a booking even without the word "book"
    const when = ctx.day !== null || (ctx.time && ctx.time.min !== undefined);
    const wantsBooking = I.bookStrong || ((I.bookWeak || (ctx.services.length && !I.price)) && when);
    const info = [];
    if (I.timing) { info.push("timing"); }
    if (I.location && !(ctx.faq && ctx.faq.over)) { info.push("location"); }
    if (I.price || (ctx.services.length && !wantsBooking && !ctx.faq)) { info.push("price"); }
    if (ctx.faq) { info.push("faq"); }
    if (I.pay && !ctx.faq && !info.length) { info.push("pay"); }

    if (!wantsBooking && !info.length && S.offer && (I.yes || I.no)) {
      if (I.yes) {
        plan.step("spark", "Understood: yes, go ahead with the booking", { ms: 380 });
        const offer = S.offer;
        S.offer = null;
        startBooking(ctx, plan, { service: offer.service, silent: true });
      } else {
        S.offer = null;
        plan.step("spark", "Understood: not now", { ms: 360 });
        plan.say(T("No problem. Is there anything else I can help with?", "Koi baat nahi. Aur kuch madad chahiye?"));
      }
      return;
    }

    if (info.length) {
      const what = info.map((x) => ({ timing: "timings", location: "the address", price: ctx.services.length ? "the price of " + ctx.services.slice(0, 2).map((s) => s.name.toLowerCase()).join(" and ") : "prices", faq: "\"" + String(firstHit(n, ctx.faq ? ctx.faq.words : []) || "").replace("*", "") + "\"", pay: "payment" }[x]));
      plan.step("spark", "Understood: asking about " + what.join(" and ") + (wantsBooking ? ", and wants to book" : ""), { detail: foundText(ctx), ms: 480 });
      info.forEach((kind) => answerInfo(kind, ctx, plan));
      if (wantsBooking) { startBooking(ctx, plan, { silent: true }); }
      else if (!plan.chips) { plan.chipsSet(afterInfoChips(info)); }
      return;
    }
    if (wantsBooking) { startBooking(ctx, plan, {}); return; }

    if (ctx.name && !I.greet) {
      S.customerName = ctx.name;
      dash.setName(ctx.name);
      plan.step("user", "Saved the customer's name: " + ctx.name, { tag: "Contacts", ms: 380 });
      plan.say(T("Nice to meet you, " + ctx.name + ". How can I help?", ctx.name + " ji, bataiye kya madad karoon?"));
      return;
    }

    if (I.greet) {
      plan.step("spark", "Understood: saying hello", { ms: 360 });
      plan.step("search", "Loaded " + biz.firm + "'s details", { tag: "Business info", ms: 380 });
      greet(plan);
      return;
    }
    if (I.thanks || (I.yes && !S.flow)) {
      plan.step("spark", I.thanks ? "Understood: saying thanks" : "Understood: okay", { ms: 360 });
      plan.say(I.thanks
        ? T("You are welcome! Message any time, day or night.", "Koi baat nahi! Kabhi bhi message kijiye, din ho ya raat.")
        : T("Great. What else can I help with?", "Theek hai. Aur kya madad karoon?"));
      return;
    }
    if (I.no && !S.flow) {
      plan.step("spark", "Understood: nothing more needed", { ms: 360 });
      plan.say(T("Okay. I am here if you need anything.", "Theek hai. Kuch bhi chahiye toh message kijiye."));
      return;
    }
    unknown(ctx, plan);
  };

  const afterInfoChips = (info) => {
    const list = [biz.booking.action];
    if (info.indexOf("timing") === -1) { list.push("Timings"); }
    if (info.indexOf("location") === -1) { list.push("Location"); }
    if (info.indexOf("price") === -1) { list.push(biz.priceChip); }
    list.push(biz.talkChip);
    return list;
  };

  const greet = (plan) => {
    const can = biz.kind === "restaurant"
      ? T("I can share the menu, take your order or book a table.", "Menu bhej sakta hoon, order le sakta hoon ya table book kar sakta hoon.")
      : biz.kind === "gym"
        ? T("I can tell you plans and timings, or book a free trial.", "Plans, timings bata sakta hoon, ya free trial book kar sakta hoon.")
        : T("I can tell you timings and prices, or book an appointment.", "Timings, price bata sakta hoon, ya appointment book kar sakta hoon.");
    plan.say(T(
      "Hi! Welcome to *" + biz.firm + "*. I am the assistant here and I reply at any hour.\n" + can + "\nWhat do you need?",
      "Namaste! *" + biz.firm + "* mein aapka swagat hai. Main yahan ka assistant hoon, kisi bhi time reply karta hoon.\n" + can + "\nBataiye, kya chahiye?"
    ));
    bump("hello");
  };

  // Answers from the business details
  const answerInfo = (kind, ctx, plan) => {
    const hi = S.lang === "hi";
    if (kind === "timing") {
      plan.step("clock", "Looked up opening hours", { tag: "Business info", ms: 420 });
      bump("timings");
      if (ctx.day !== null && ctx.day > 0) {
        const r = rangesOn(dateAt(ctx.day));
        const day = DAY_NAMES[dateAt(ctx.day).getDay()];
        plan.step("cal", "Checked " + day + ": " + (r.length ? rangesText(r) : "closed"), { ms: 380 });
        plan.say(r.length
          ? T("On " + day + " we are open " + rangesText(r) + ".", day + " ko " + rangesText(r, true) + " khula hai.")
          : T("We are closed on " + day + ".", day + " ko band rehta hai."));
        return;
      }
      const st = openState();
      const nowLine = st.open
        ? T("We are open now, till " + clock(st.until) + ".", "Abhi khula hai, " + clock(st.until) + " tak.")
        : st.offset === 0
          ? T("We are closed right now. We open again today at " + clock(st.at) + ".", "Abhi band hai. Aaj " + clock(st.at) + " ko phir khulega.")
          : T("We are closed right now. We open " + dayWord(st.offset) + " at " + clock(st.at) + ".", "Abhi band hai. " + cap(dayWord(st.offset, true)) + " " + clock(st.at) + " ko khulega.");
      plan.step("clock", st.open ? "Checked: open now, closes " + clock(st.until) : "Checked: closed now, opens " + clock(st.at), { ms: 360 });
      plan.say({ type: "card", title: hi ? "Timings" : "Opening hours", rows: hoursRows() });
      plan.say(nowLine);
      return;
    }
    if (kind === "location") {
      plan.step("pin", "Found the address and map pin", { tag: "Business info", ms: 420 });
      bump("location");
      plan.say({ type: "location" });
      plan.say(T("We are at " + biz.fullAddress + ". " + biz.landmark, "Hum " + biz.fullAddress + " pe hain. " + biz.landmark));
      return;
    }
    if (kind === "price") {
      if (biz.kind === "restaurant" && !ctx.services.length) { showMenu(ctx, plan, false, true); return; }
      if (ctx.services.length) {
        const list = ctx.services.slice(0, 3);
        plan.step("tag", "Found the price of " + list.map((s) => s.name.toLowerCase()).join(" and "), { tag: "Price list", ms: 460 });
        list.forEach((s) => bump("price of " + s.name.toLowerCase()));
        const lines = list.map((s) => "*" + s.name + "*: " + priceText(s) + (s.unit ? " " + s.unit : "") + (biz.booking.askService && s.mins && s.price ? T(" (about " + s.mins + " minutes)", " (lagbhag " + s.mins + " minute)") : "") + (s.note ? "\n" + fill(s.note) : ""));
        const first = list.find((s) => s.mins) || list[0];
        const canBook = biz.booking.askService ? first.mins && first.price > 0 : true;
        if (canBook) {
          S.offer = { service: biz.booking.askService ? first : null, at: S.msgs };
          lines.push(biz.booking.askService
            ? T("Shall I book a " + first.name.toLowerCase() + " for you?", first.name + " book kar doon?")
            : T("Shall I book a free trial so you can try it first?", "Pehle try karne ke liye free trial book kar doon?"));
          plan.chipsSet(["Yes, book it", biz.priceChip, "Timings", "Location"]);
        }
        plan.say(lines.join("\n"));
        return;
      }
      plan.step("tag", "Opened the price list", { tag: "Price list", ms: 460 });
      bump(biz.kind === "gym" ? "membership price" : "price list");
      plan.say({
        type: "card",
        title: biz.kind === "gym" ? T("Membership plans", "Membership plans") : T("Price list", "Rate list"),
        rows: (biz.services || []).map((s) => [s.name, priceText(s) + (s.unit ? " " + s.unit : "")])
      });
      plan.say(T(
        biz.kind === "gym" ? "No joining fee. Want to try a free session first?" : "Prices marked \"from\" depend on your case. Want to book?",
        biz.kind === "gym" ? "Koi joining fee nahi. Pehle free session try karoge?" : "\"from\" wale price aapke case pe depend karte hain. Book karna hai?"
      ));
      plan.chipsSet([biz.booking.action, "Timings", "Location"]);
      return;
    }
    if (kind === "faq") {
      const word = firstHit(ctx.n, ctx.faq.words);
      plan.step("search", "Found the answer in " + biz.firm + "'s notes", { tag: "Business info", ms: 460 });
      bump(word.replace("*", ""));
      plan.say(fill(T(ctx.faq.en, ctx.faq.hi)));
      if (ctx.faq.handoff) { ownerAlert(plan, ctx.raw, true); }
      return;
    }
    if (kind === "pay") {
      plan.step("search", "Looked up payment options", { tag: "Business info", ms: 400 });
      bump("payment");
      plan.say(isINR
        ? T("You can pay by UPI (GPay, PhonePe, Paytm), card or cash.", "UPI (GPay, PhonePe, Paytm), card ya cash, sab chalega.")
        : T("You can pay by card, bank transfer or cash.", "Card, bank transfer ya cash, sab chalega."));
    }
  };

  const priceText = (s) => {
    if (s.price === 0) { return "Free"; }
    if (!s.from) { return rs(s.price); }
    return S.lang === "hi" ? rs(s.price) + " se shuru" : "from " + rs(s.price);
  };

  // ---------- Booking: service, (people), day, time, name, confirm ----------
  const startBooking = (ctx, plan, opts = {}) => {
    const prev = S.flow && S.flow.type === "booking" ? S.flow : null;
    S.flow = prev || { type: "booking", service: null, day: null, time: null, people: null, name: S.customerName, await: null };
    const f = S.flow;
    if (!biz.booking.askService) { f.service = { name: biz.booking.service || "Table", price: 0, mins: biz.booking.slotMins }; }
    if (opts.service) { f.service = opts.service; }
    if (!f.service && ctx.services.length) { f.service = ctx.services.find((s) => s.mins && s.price > 0) || null; }
    let remembered = null;
    if (!f.service && S.offer && S.offer.service) { f.service = S.offer.service; remembered = f.service; }
    S.offer = null;
    if (opts.day !== undefined && opts.day !== null) { f.day = opts.day; }
    if (opts.earliest) { f.earliest = true; }
    fillBooking(ctx);
    if (!opts.silent) {
      plan.step("spark", "Understood: wants to book " + bookingWhat(f), { detail: foundText(ctx), ms: 480 });
    }
    if (remembered) { plan.step("spark", "Remembered: asked about " + remembered.name.toLowerCase() + " earlier", { ms: 380 }); }
    bump("booking");
    bookingNext(ctx, plan);
  };

  const bookingWhat = (f) => {
    if (biz.booking.people) { return "a table"; }
    if (!biz.booking.askService) { return "a " + biz.booking.noun; }
    return f.service ? "a " + f.service.name.toLowerCase() : "an " + biz.booking.noun;
  };

  const fillBooking = (ctx) => {
    const f = S.flow;
    if (biz.booking.askService && ctx.services.length) {
      const s = ctx.services.find((x) => x.mins && x.price > 0);
      if (s) { f.service = s; }
    }
    if (ctx.day !== null) { f.day = ctx.day; }
    if (ctx.time) { f.time = ctx.time; }
    if (ctx.people) { f.people = ctx.people; }
    if (ctx.name) { f.name = ctx.name; S.customerName = ctx.name; dash.setName(ctx.name); }
  };

  const dayChips = () => {
    const out = [];
    for (let off = 0; off < 10 && out.length < 4; off += 1) {
      if (slotsOn(off).some((s) => s.free)) { out.push(off === 0 ? "Today" : off === 1 ? "Tomorrow" : (off >= 7 ? "Next " : "") + DAY_NAMES[dateAt(off).getDay()]); }
    }
    return out;
  };

  const bookingNext = (ctx, plan) => {
    const f = S.flow;
    const hi = S.lang === "hi";
    if (!f.service) {
      f.await = "service";
      plan.say(T("Sure. What is the " + biz.booking.noun + " for?", "Zaroor. " + cap(biz.booking.noun) + " kis cheez ke liye hai?"));
      plan.chipsSet(bookable().slice(0, 4).map((s) => s.name));
      return;
    }
    if (biz.booking.people && !f.people) {
      f.await = "people";
      plan.say(T("Sure. How many people?", "Zaroor. Kitne log honge?"));
      plan.chipsSet(["2 people", "4 people", "6 people"]);
      return;
    }
    if (biz.booking.people && f.people > 12) {
      S.flow = null;
      plan.step("alert", "Group of " + f.people + ": the owner plans big groups", { tone: "warn", ms: 420 });
      plan.say(T("For " + f.people + " people, " + biz.ownerShort + " plans the seating and menu personally.", f.people + " logon ke liye " + biz.ownerShort + " khud seating aur menu plan karte hain."));
      ownerAlert(plan, "Table for " + f.people + " people", true);
      return;
    }
    if (f.day === null) {
      f.await = "day";
      const when = f.time && f.time.min !== undefined ? clock(f.time.min) : "";
      plan.say(T(
        "Which day suits you" + (when ? " for " + when : "") + "?",
        (when ? when + " ke liye " : "") + "kaunsa din theek rahega?"
      ).replace(/^k/, "K"));
      plan.chipsSet(dayChips());
      return;
    }

    let off = f.day;
    let date = dateAt(off);
    let note = "";
    plan.step("cal", "Checked the calendar for " + DAY_NAMES[date.getDay()] + ", " + shortDate(date), { tag: "Calendar", ms: 680 });
    let slots = slotsOn(off);
    let free = slots.filter((s) => s.free);
    if (!free.length) {
      const closed = !rangesOn(date).length;
      const past = off === 0 && slots.length > 0;
      const next = nextOpenDay(off + 1);
      plan.step("alert", closed ? "Closed on " + DAY_NAMES[date.getDay()] : past ? "No free slots left today" : DAY_NAMES[date.getDay()] + " is fully booked", { tone: "warn", ms: 420 });
      if (next === null) { S.flow = null; plan.say(T("Sorry, I could not find a free slot soon. I have asked " + biz.ownerShort + " to call you.", "Sorry, jaldi koi slot free nahi hai. " + biz.ownerShort + " aapko call karenge.")); ownerAlert(plan, "No free slot found", true); return; }
      note = closed
        ? T("We are closed on " + DAY_NAMES[date.getDay()] + ". ", DAY_NAMES[date.getDay()] + " ko band rehta hai. ")
        : past ? T("Today is full now. ", "Aaj ke slots khatam ho gaye. ") : T(DAY_NAMES[date.getDay()] + " is fully booked. ", DAY_NAMES[date.getDay()] + " full hai. ");
      off = next;
      f.day = next;
      date = dateAt(off);
      plan.step("search", "Found the next free day: " + DAY_NAMES[date.getDay()], { tag: "Calendar", ms: 460 });
      slots = slotsOn(off);
      free = slots.filter((s) => s.free);
    }
    const dayText = off <= 1 ? dayWord(off, hi) + " (" + shortDate(date) + ")" : (hi ? "" : "on ") + DAY_NAMES[date.getDay()] + ", " + shortDate(date);

    if (f.time && f.time.alt !== undefined) {
      // "8 baje" at a restaurant means 8 pm: pick the reading that falls in the opening hours.
      const open = (m) => rangesOn(date).some((r) => m >= r[0] && m < r[1]);
      if (!open(f.time.min) && open(f.time.alt)) { f.time = { min: f.time.alt }; plan.step("clock", "Read the time as " + clock(f.time.min) + " (we are open then)", { ms: 340 }); }
      else { f.time = { min: f.time.min }; }
    }
    if (f.time && f.time.min !== undefined) {
      const want = f.time.min;
      const ranges = rangesOn(date);
      const inside = ranges.some((r) => want >= r[0] && want + biz.booking.slotMins <= r[1]);
      const exact = slots.find((s) => s.t === want);
      if (exact && exact.free) {
        plan.step("check", clock(want) + " is free", { tone: "ok", ms: 360 });
        f.slot = want;
      } else {
        const near = pickSlots(free, 3, want);
        if (off === 0 && want <= nowMin()) {
          plan.step("alert", clock(want) + " has already passed today", { tone: "warn", ms: 400 });
          note += T(clock(want) + " has passed today. ", clock(want) + " nikal gaya aaj. ");
        } else if (off === 0 && inside && want < nowMin() + 30) {
          plan.step("alert", clock(want) + " is less than 30 minutes away", { detail: "Too soon to get ready", tone: "warn", ms: 420 });
          note += T(clock(want) + " is too soon to book. ", clock(want) + " bahut jaldi hai. ");
        } else if (!inside) {
          plan.step("alert", clock(want) + " is outside opening hours", { detail: DAY_NAMES[date.getDay()] + ": " + rangesText(ranges), tone: "warn", ms: 420 });
          note += T("On " + DAY_NAMES[date.getDay()] + " we are open " + rangesText(ranges) + ". ", DAY_NAMES[date.getDay()] + " ko timing " + rangesText(ranges, true) + " hai. ");
        } else if (!exact) {
          plan.step("search", "No slot starts at " + clock(want), { detail: "Slots start every " + biz.booking.slotMins + " minutes", ms: 420 });
        } else {
          plan.step("alert", clock(want) + " is already booked", { detail: "Found " + near.length + " free slots near it", tone: "warn", ms: 460 });
          note += T(clock(want) + " is already booked. ", clock(want) + " already booked hai. ");
        }
        f.time = null;
        f.await = "time";
        plan.say(note + T("The nearest free times " + dayText + " are *" + listJoin(near.map((s) => clock(s.t))) + "*. Which one works?", cap(dayText) + " ke paas wale free slots: *" + listJoin(near.map((s) => clock(s.t)), true) + "*. Kaunsa chalega?"));
        plan.chipsSet(near.map((s) => clock(s.t)).concat(["Another day"]));
        return;
      }
    }

    if (!f.slot) {
      let pool = free;
      if (f.time && f.time.part) {
        const part = free.filter((s) => s.t >= f.time.from && s.t < f.time.to);
        if (part.length) { pool = part; } else { note += T("No free " + f.time.part + " slots. ", f.time.part + " mein slot free nahi hai. "); }
        f.time = null;
      }
      const show = f.earliest ? pool.slice(0, 3) : pickSlots(pool, 4);
      plan.step("search", "Found " + free.length + " free slots", { detail: "Showing " + show.length, tag: "Calendar", ms: 420 });
      f.await = "time";
      plan.say(note + T((f.earliest ? "The earliest free slots " : "Free slots ") + dayText + ": *" + listJoin(show.map((s) => clock(s.t))) + "*. Which time suits you?", cap(dayText) + " ke free slots: *" + listJoin(show.map((s) => clock(s.t)), true) + "*. Kaunsa time chalega?"));
      plan.chipsSet(show.map((s) => clock(s.t)).concat(["Another day"]));
      return;
    }

    // The slot is free: hold it, then the name, then confirm.
    if (!f.held) {
      plan.step("lock", "Held " + clock(f.slot) + " for 5 minutes", { tag: "Calendar", ms: 360 });
      f.held = true;
    }
    if (!f.name) {
      f.await = "name";
      plan.say(note + T("Good news: " + clock(f.slot) + " " + dayText + " is free. May I have your name for the booking?", "Achhi baat: " + dayText + " " + clock(f.slot) + " free hai. Booking ke liye aapka naam bata dijiye?"));
      plan.chipsSet([biz.demoName]);
      return;
    }
    f.await = "confirm";
    const rows = [];
    if (biz.booking.people) { rows.push([T("Table", "Table"), T("For " + f.people, f.people + " log")]); }
    else { rows.push([T("For", "Kiske liye"), f.service.name]); }
    rows.push([T("Day", "Din"), dayLong(off)]);
    rows.push([T("Time", "Time"), clock(f.slot)]);
    rows.push([T("Name", "Naam"), f.name]);
    if (f.service.price) { rows.push([T("Price", "Price"), priceText(f.service)]); }
    plan.say({ type: "card", title: T("Please check", "Ek baar check kijiye"), rows: rows });
    plan.say(T("Shall I confirm this?", "Confirm kar doon?"));
    plan.chipsSet(["Confirm", "Change time", "Cancel"]);
  };

  const listJoin = (list, hi) => (list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + (hi ? " ya " : " or ") + list[list.length - 1]);

  const bookingTurn = (ctx, plan) => {
    const f = S.flow;
    const I = ctx.I;
    if (I.handoff && !ctx.faq) { S.flow = null; handoff(ctx, plan, "asked"); return true; }
    const yesBook = f.await === "confirm" && I.yes && !I.change && !hasAny(ctx.n, K.dontBook);
    if (yesBook) { book(plan); return true; }
    if (I.cancel || (I.no && f.await === "confirm")) {
      S.flow = null;
      plan.step("spark", "Understood: stop the booking", { ms: 380 });
      plan.say(T("Okay, I have not booked anything. Message me any time to book.", "Theek hai, kuch book nahi kiya. Jab chahiye message kar dijiye."));
      return true;
    }

    const before = JSON.stringify([f.service && f.service.name, f.day, f.time, f.people, f.name, f.slot]);
    if (I.change || has(ctx.n, "another day")) {
      if (has(ctx.n, "day") || has(ctx.n, "din")) { f.day = null; }
      f.slot = null; f.held = false; f.time = null;
    }
    if (f.await === "name" && !ctx.name) {
      const looksLikeQuestion = I.timing || I.location || I.price || I.menu || I.handoff || I.bookStrong || ctx.faq ||
        ctx.services.length || ctx.day !== null || ctx.time || /[?\d]/.test(ctx.raw) || ctx.raw.trim().split(/\s+/).length > 4;
      if (!looksLikeQuestion) { const name = parseName(ctx.raw, true); if (name) { ctx.name = name; } }
    }
    if (ctx.name) { plan.step("user", "Saved the customer's name: " + ctx.name, { tag: "Contacts", ms: 360 }); }
    if (ctx.day !== null || (ctx.time && (ctx.time.min !== undefined || ctx.time.part))) { f.slot = null; f.held = false; }
    if (f.await === "service" && !ctx.services.length && (I.yes || has(ctx.n, "not sure"))) { ctx.services = [bookable()[0]]; }
    fillBooking(ctx);
    const after = JSON.stringify([f.service && f.service.name, f.day, f.time, f.people, f.name, f.slot]);
    const changed = before !== after;

    const info = [];
    if (!changed) {
      if (I.timing) { info.push("timing"); }
      if (I.location) { info.push("location"); }
      if (I.price) { info.push("price"); }
      if (ctx.faq) { info.push("faq"); }
    }
    if (info.length) {
      plan.step("spark", "Understood: a question in the middle of the booking", { ms: 420 });
      info.forEach((kind) => answerInfo(kind, ctx, plan));
      plan.step("cal", "Went back to the booking", { ms: 320 });
      plan.say(T("Coming back to your booking:", "Aapki booking pe wapas aate hain:"));
      bookingNext(ctx, plan);
      return true;
    }
    if (changed) {
      plan.step("spark", "Understood the reply", { detail: foundText(ctx), ms: 420 });
      bookingNext(ctx, plan);
      return true;
    }
    if (I.bookStrong) {
      plan.step("spark", "Understood: still booking", { ms: 360 });
      bookingNext(ctx, plan);
      return true;
    }
    const want = { service: "the service", people: "how many people", day: "a day", time: "a time", name: "a name", confirm: "a yes or no" }[f.await] || "that";
    plan.step("alert", "Could not find " + want + " in the reply", { tone: "warn", ms: 400 });
    plan.say(T("Sorry, I did not get that.", "Sorry, samajh nahi aaya."));
    bookingNext(ctx, plan);
    return true;
  };

  const book = (plan) => {
    const f = S.flow;
    const off = f.day;
    const date = dateAt(off);
    const t = f.slot;
    const what = biz.booking.people ? "Table for " + f.people : f.service.name;
    let remind = t - biz.booking.reminderHours * 60;
    let remindDay = off;
    let before = biz.booking.reminderHours + " hours before";
    if (remind < 7 * 60 + 30) { remind = 20 * 60; remindDay = off - 1; before = "the evening before"; }
    if (remindDay === 0 && remind <= nowMin() + 5) { remind = t - 60; remindDay = off; before = "1 hour before"; }
    const remindOk = remindDay > 0 || (remindDay === 0 && remind > nowMin() + 5);
    const remindDate = dateAt(remindDay);
    S.taken.add(dateKey(date) + "@" + t);
    const record = { id: "b" + Date.now(), name: f.name, what: what, day: off, t: t, price: f.service.price || 0, live: true, status: "Confirmed" };
    S.bookings.push(record);
    S.flow = null;
    S.customerName = f.name;
    const when = (off === 0 ? "today" : off === 1 ? "tomorrow" : DAY_NAMES[date.getDay()]);
    plan.step("calok", "Booked " + clock(t) + " " + when + " for " + f.name, { tone: "ok", tag: "Calendar", ms: 520, effect: () => dash.addBooking(record) });
    plan.step("cal", "Added to " + biz.firm + "'s calendar", { tag: "Calendar", ms: 380 });
    if (remindOk) {
      plan.step("clock", "Will send a reminder " + before, { detail: DAY_NAMES[remindDate.getDay()] + ", " + clock(remind), ms: 380 });
    }
    ownerAlert(plan, "New booking: " + what + ", " + clock(t) + " " + when, false, true);
    const hi = S.lang === "hi";
    plan.say({
      type: "ticket",
      title: biz.booking.people ? T("Table booked", "Table book ho gaya") : T(cap(biz.booking.noun) + " confirmed", cap(biz.booking.noun) + " confirm"),
      rows: [[T("For", "Kiske liye"), what], [T("When", "Kab"), dayLong(off) + ", " + clock(t)], [T("Name", "Naam"), f.name], [T("Where", "Kahan"), biz.firm + ", " + biz.area]]
    });
    plan.say(T(
      "Done, " + f.name + "! See you " + (off <= 1 ? dayWord(off) : "on " + DAY_NAMES[date.getDay()]) + " at " + clock(t) + "." + (remindOk ? "\nI will send you a reminder " + (remindDay === off ? "at " + clock(remind) + " that day." : "the evening before, at " + clock(remind) + ".") : "") + "\nTo change or cancel, just reply here.",
      "Ho gaya, " + f.name + "! " + cap(dayWord(off, true)) + " " + clock(t) + " ko milte hain." + (remindOk ? "\n" + (remindDay === off ? "Us din " : "Ek din pehle ") + clock(remind) + " ko reminder bhej dunga." : "") + "\nBadalna ya cancel karna ho toh yahin reply kar dijiye."
    ));
    if (remindOk) {
      plan.say({ type: "system", text: T("Preview: the reminder " + f.name + " gets on " + DAY_NAMES[remindDate.getDay()] + " at " + clock(remind), "Preview: " + DAY_NAMES[remindDate.getDay()] + " " + clock(remind) + " wala reminder") });
      plan.say({
        type: "reminder",
        text: hi
          ? "Reminder: " + (remindDay === off ? "aaj" : "kal") + " " + clock(t) + " ko " + biz.firm + " mein aapka " + (biz.booking.people ? "table" : what.toLowerCase()) + " hai. Confirm ke liye 1, badalne ke liye 2 bhejiye."
          : "Reminder: your " + (biz.booking.people ? "table" : what.toLowerCase()) + " at " + biz.firm + " is " + (remindDay === off ? "today" : "tomorrow") + " at " + clock(t) + ". Reply 1 to confirm or 2 to change."
      });
    }
    plan.chipsSet(["Location", "Cancel booking", biz.talkChip]);
  };

  const cancelBooking = (ctx, plan) => {
    const last = S.bookings.filter((b) => b.live && b.status !== "Cancelled").pop();
    plan.step("spark", "Understood: wants to cancel", { ms: 380 });
    if (!last) {
      plan.step("search", "Looked for a booking from this number", { detail: "None found", ms: 420 });
      plan.say(T("I could not find a booking from this number. Would you like to book one?", "Is number se koi booking nahi mili. Book karna hai?"));
      plan.chipsSet([biz.booking.action, "Timings"]);
      return;
    }
    plan.step("cal", "Cancelled " + last.what.toLowerCase() + ", " + clock(last.t), { tag: "Calendar", ms: 460, effect: () => dash.cancelBooking(last) });
    plan.step("check", "Freed the slot for other customers", { ms: 360 });
    ownerAlert(plan, "Booking cancelled: " + last.what + ", " + clock(last.t), false, true);
    S.taken.delete(dateKey(dateAt(last.day)) + "@" + last.t);
    plan.say(T("Done. Your " + last.what.toLowerCase() + " at " + clock(last.t) + " is cancelled. Want a different time?", "Ho gaya. " + clock(last.t) + " wala " + last.what.toLowerCase() + " cancel kar diya. Koi aur time chahiye?"));
    plan.chipsSet([biz.booking.action, "No, thanks"]);
  };

  // ---------- Food order: menu, cart, checkout, pay ----------
  const sampleAddressChip = () => ({ label: "Use a sample address", send: fill("Flat 302, Shanti Nagar, near {area} station") });
  const cartCard = () => ({ type: "card", title: T("Your cart", "Aapka cart"), rows: cartRows(), total: [T("Total", "Total"), rs(cartTotal())] });

  // "is paneer tikka spicy?" or "butter chicken kitne ka hai" is a question, not an order
  const dishQuestion = (ctx) => !ctx.items.some((x) => x.counted) && !ctx.I.order &&
    (ctx.I.price || !!ctx.faq || /\?/.test(ctx.raw) || hasAny(ctx.n, ["is", "hai kya", "kaisa", "kaisi", "how", "what"]));
  const dishInfo = (ctx, plan) => {
    const list = ctx.items.map((x) => x.item);
    plan.step("spark", "Understood: a question about " + list.map((i) => i.name).join(" and "), { ms: 420 });
    plan.step("book", "Looked up the dish on the menu", { tag: "Menu", ms: 420 });
    bump("dish questions");
    plan.say(list.map((i) => "*" + i.name + "*: " + rs(i.price) + (i.veg ? T(" (veg)", " (veg)") : T(" (non-veg)", " (non-veg)"))).join("\n"));
    if (ctx.faq) { plan.say(fill(T(ctx.faq.en, ctx.faq.hi))); }
    plan.say(T("Shall I add it to your order?", "Order mein add kar doon?"));
    plan.chipsSet(list.slice(0, 3).map((i) => "1 " + i.name).concat(["See menu"]));
  };
  const showMenu = (ctx, plan, ordering, quiet) => {
    if (!quiet) { plan.step("spark", ordering ? "Understood: wants to order food" : "Understood: asking for the menu", { ms: 420 }); }
    plan.step("book", "Opened today's menu", { tag: "Menu", ms: 440 });
    bump("menu");
    S.flow = { type: "order", await: "items" };
    plan.say({ type: "menu" });
    plan.say(T("Type what you want, like *2 butter chicken and 4 naan*, or tap a dish below.", "Jo chahiye type kijiye, jaise *2 butter chicken aur 4 naan*, ya neeche dish pe tap kijiye."));
    plan.chipsSet(["1 Butter Chicken", "1 Paneer Tikka", "1 Chicken Biryani", "2 Butter Naan", "1 Veg Thali"]);
  };

  const cartTotal = () => S.cart.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const cartRows = () => S.cart.map((line) => [line.qty + " x " + line.item.name, rs(line.item.price * line.qty)]);

  const addToCart = (ctx, plan) => {
    if (!S.flow || S.flow.type !== "order") { S.flow = { type: "order", await: "items" }; }
    const words = ctx.items.map((x) => x.qty + " x " + x.item.name).join(", ");
    plan.step("spark", "Understood: ordering food", { detail: "Found: " + words, ms: 460 });
    plan.step("book", "Checked the menu: all available", { tag: "Menu", ms: 420 });
    ctx.items.forEach((x) => {
      const line = S.cart.find((l) => l.item.id === x.item.id);
      if (line) { line.qty += x.qty; } else { S.cart.push({ item: x.item, qty: x.qty }); }
    });
    plan.step("cart", "Updated the cart: " + rs(cartTotal()), { tag: "Cart", ms: 380 });
    bump("orders");
    S.flow.await = "items";
    plan.say(cartCard());
    plan.say(T("Added " + words + ". Anything else, or shall I place the order?", words + " add kar diya. Aur kuch, ya order place kar doon?"));
    plan.chipsSet(["Checkout", "See menu", "Clear cart"]);
  };

  const deliveryEta = () => {
    const st = openState();
    const mins = biz.delivery.minutes;
    if (st.open) { return { scheduled: false, at: nowMin() + mins }; }
    return { scheduled: true, offset: st.offset, opens: st.at, at: st.at + mins };
  };

  const orderTurn = (ctx, plan) => {
    const f = S.flow;
    const I = ctx.I;
    const n = ctx.n;
    if (f.await === "address" && /[a-z]{3}/i.test(ctx.raw) && ctx.raw.trim().length >= 8 && /\d|flat|room|road|nagar|building|bldg|tower|society|lane|street|marg|near|opp|sector|wing|floor/i.test(ctx.raw)) {
      f.address = ctx.raw.trim();
      plan.step("pin", "Read the address", { detail: f.address.slice(0, 48), ms: 420 });
      plan.step("check", "Inside the " + biz.delivery.km + " km delivery area", { tone: "ok", ms: 380 });
      placeOrder(plan);
      return true;
    }
    if (I.handoff && !ctx.faq) { handoff(ctx, plan, "asked"); return true; }
    if (hasAny(n, K.clear)) {
      S.cart = [];
      f.await = "items";
      plan.step("cart", "Emptied the cart", { tag: "Cart", ms: 360 });
      plan.say(T("Your cart is empty now. What would you like?", "Cart khaali kar diya. Kya mangwana hai?"));
      plan.chipsSet(["See menu", "1 Butter Chicken", "1 Veg Thali"]);
      return true;
    }
    if (ctx.items.length && I.remove) {
      ctx.items.forEach((x) => { S.cart = S.cart.filter((l) => l.item.id !== x.item.id); });
      plan.step("cart", "Removed " + ctx.items.map((x) => x.item.name).join(", "), { tag: "Cart", ms: 380 });
      plan.say(S.cart.length ? cartCard() : T("Your cart is empty now.", "Cart khaali hai."));
      plan.chipsSet(S.cart.length ? ["Checkout", "See menu"] : ["See menu"]);
      return true;
    }
    if (ctx.items.length && (f.await === "items" || f.await === "mode")) {
      if (dishQuestion(ctx)) { dishInfo(ctx, plan); } else { addToCart(ctx, plan); }
      return true;
    }
    if (has(n, "see menu") || (I.menu && !ctx.items.length)) { showMenu(ctx, plan, false); return true; }

    if (f.await === "items" && S.cart.length && (I.checkout || I.yes || (I.order && !I.location && !I.timing && !ctx.faq))) {
      f.await = "mode";
      plan.step("spark", "Understood: ready to order", { ms: 380 });
      plan.say(T("Great. Delivery or pickup?", "Badhiya. Delivery chahiye ya pickup?"));
      plan.chipsSet(["Delivery", "Pickup"]);
      return true;
    }
    if (f.await === "mode" && (I.delivery || I.pickup)) {
      f.mode = I.pickup && !has(n, "delivery") ? "pickup" : "delivery";
      plan.step("spark", "Understood: " + f.mode, { ms: 360 });
      if (f.mode === "delivery") {
        f.await = "address";
        plan.say(T("Please send your delivery address.", "Delivery address bhej dijiye."));
        plan.chipsSet([sampleAddressChip()]);
        return true;
      }
      placeOrder(plan);
      return true;
    }
    if (f.await === "pay" && (I.cash || I.paid)) { paid(plan, I.cash ? "cash" : "upi"); return true; }

    const info = [];
    if (I.timing) { info.push("timing"); }
    if (I.location && !(ctx.faq && ctx.faq.over)) { info.push("location"); }
    if (ctx.faq) { info.push("faq"); }
    if (I.pay && !ctx.faq) { info.push("pay"); }
    if (info.length) {
      plan.step("spark", "Understood: a question during the order", { ms: 400 });
      info.forEach((kind) => answerInfo(kind, ctx, plan));
      if (S.cart.length) {
        plan.say(T("Your cart is saved. Tap Checkout when you are ready.", "Aapka cart save hai. Ready ho toh Checkout dabaiye."));
        plan.chipsSet(f.await === "pay" ? ["Cash on delivery"] : ["Checkout", "See menu"]);
      }
      return true;
    }
    if (I.bookStrong) { S.flow = null; return false; }
    if (f.await === "items") { return false; }
    const want = { items: "a dish", mode: "delivery or pickup", address: "an address", pay: "a payment" }[f.await];
    plan.step("alert", "Could not find " + want + " in the reply", { tone: "warn", ms: 400 });
    if (f.await === "mode") { plan.say(T("Delivery or pickup?", "Delivery ya pickup?")); plan.chipsSet(["Delivery", "Pickup"]); }
    else if (f.await === "address") { plan.say(T("Please type the full address with the building and road.", "Building aur road ke saath poora address likh dijiye.")); plan.chipsSet([sampleAddressChip()]); }
    else { plan.say(T("Tap the pay link above, or choose cash on delivery.", "Upar wale link se pay kijiye, ya cash on delivery chuniye.")); plan.chipsSet(["Cash on delivery"]); }
    return true;
  };

  const placeOrder = (plan) => {
    const f = S.flow;
    const sub = cartTotal();
    const fee = f.mode === "delivery" && sub < biz.delivery.freeAbove ? biz.delivery.fee : 0;
    const total = sub + fee;
    S.orders += 1;
    f.no = 1042 + S.orders;
    f.total = total;
    f.await = "pay";
    const eta = deliveryEta();
    f.eta = eta;
    if (eta.scheduled) {
      plan.step("clock", "Kitchen is closed now: scheduled for " + clock(eta.opens), { tone: "warn", ms: 440 });
    } else {
      plan.step("clock", "Kitchen time: " + biz.delivery.minutes + " minutes", { tag: "Kitchen", ms: 400 });
    }
    plan.step("rupee", "Made the bill: " + rs(total), { tag: "Billing", ms: 420 });
    plan.step("rupee", isINR ? "Created a UPI pay link" : "Created a pay link", { tag: "Payments", ms: 380 });
    const rows = cartRows();
    if (f.mode === "delivery") { rows.push([T("Delivery", "Delivery"), fee ? rs(fee) : T("Free", "Free")]); }
    const ready = f.mode === "delivery" ? T("Delivery by ", "Delivery ") + clock(eta.at) + (S.lang === "hi" ? " tak" : "") : T("Ready for pickup at ", "Pickup ") + clock(eta.at - 10) + (S.lang === "hi" ? " pe ready" : "");
    plan.say({ type: "card", title: T("Order #", "Order #") + f.no, rows: rows, total: [T("Total", "Total"), rs(total)], foot: ready + (eta.scheduled ? " (" + (eta.offset === 0 ? T("today", "aaj") : dayWord(eta.offset, S.lang === "hi")) + ")" : "") });
    if (eta.scheduled) {
      plan.say(T(
        "The kitchen opens at " + clock(eta.opens) + (eta.offset > 0 ? " " + dayWord(eta.offset) : "") + ". Your order is booked for then, so it is first in line.",
        "Kitchen " + clock(eta.opens) + " ko khulega. Aapka order tab ke liye book hai, sabse pehle banega."
      ));
    }
    plan.say({ type: "pay", amount: total, no: f.no });
    plan.chipsSet([f.mode === "pickup" ? "Pay at pickup" : "Cash on delivery"]);
  };

  const paid = (plan, how) => {
    const f = S.flow;
    if (!f || f.type !== "order" || f.await !== "pay") { return; }
    const total = f.total;
    const record = { id: "o" + f.no, name: S.customerName || "Customer (you)", what: "Order #" + f.no + ": " + S.cart.map((l) => l.item.name + (l.qty > 1 ? " x" + l.qty : "")).join(", "), day: 0, t: f.mode === "pickup" ? f.eta.at - 10 : f.eta.at, price: total, live: true, order: true, status: how === "cash" ? (f.mode === "pickup" ? "Pay at pickup" : "Cash on delivery") : "Paid" };
    if (how === "cash") {
      plan.step("spark", "Understood: cash on delivery", { ms: 360 });
    } else {
      plan.step("rupee", "Payment received: " + rs(total) + (isINR ? " by UPI" : ""), { tone: "money", tag: "Payments", ms: 520 });
    }
    plan.step("bowl", "Sent order #" + f.no + " to the kitchen", { tag: "Kitchen", ms: 420, effect: () => dash.addBooking(record) });
    ownerAlert(plan, "New order #" + f.no + ": " + rs(total), false, true);
    const pickup = f.mode === "pickup";
    plan.say(how === "cash" && pickup
      ? T("Done. Order #" + f.no + " is placed. It will be ready at " + clock(f.eta.at - 10) + ". Please pay " + rs(total) + " at the counter.", "Ho gaya. Order #" + f.no + " place ho gaya. " + clock(f.eta.at - 10) + " pe ready hoga. " + rs(total) + " counter pe de dijiye.")
      : how === "cash"
      ? T("Done. Order #" + f.no + " is placed. Please keep " + rs(total) + " ready. It will reach you by " + clock(f.eta.at) + ".", "Ho gaya. Order #" + f.no + " place ho gaya. " + rs(total) + " cash ready rakhiye. " + clock(f.eta.at) + " tak pahunch jayega.")
      : pickup
      ? T("Payment of " + rs(total) + " received, thank you! Order #" + f.no + " will be ready for pickup at " + clock(f.eta.at - 10) + ".", rs(total) + " mil gaye, shukriya! Order #" + f.no + " " + clock(f.eta.at - 10) + " pe pickup ke liye ready hoga.")
      : T("Payment of " + rs(total) + " received, thank you! Order #" + f.no + " is being prepared and will reach you by " + clock(f.eta.at) + ". I will message you when it leaves the kitchen.", rs(total) + " mil gaye, shukriya! Order #" + f.no + " ban raha hai, " + clock(f.eta.at) + " tak pahunch jayega. Kitchen se nikalte hi message karunga."));
    if (how === "cash") {
      const link = waLog.querySelector('[data-pay="' + f.no + '"]');
      if (link) { link.disabled = true; link.textContent = "Cash on delivery chosen"; }
    }
    S.cart = [];
    S.flow = null;
    plan.chipsSet(["Book a table", "Location", "Talk to owner"]);
  };

  // ---------- Owner in the loop ----------
  const ownerAlert = (plan, text, waiting, quiet) => {
    plan.step("bell", quiet ? "Told " + biz.ownerShort + ": " + text.split(":")[0].toLowerCase() : "Sent an alert to " + biz.ownerShort + "'s phone",
      { tone: "owner", tag: "Owner alert", ms: 440, effect: waiting ? () => dash.addHandoff(text) : null });
    if (waiting) { plan.step("hand", "Added to \"Waiting for you\"", { ms: 320 }); }
  };

  const handoff = (ctx, plan, why) => {
    plan.step("spark", "Understood: wants to talk to a person", { ms: 420 });
    bump("talk to owner");
    ownerAlert(plan, "Wants to talk: \"" + ctx.raw.slice(0, 60) + "\"", true);
    plan.say(T(
      "Sure. I have told " + biz.ownerShort + ". " + biz.pronoun + (biz.pronoun === "They" ? " usually reply" : " usually replies") + " here within 15 minutes.\nMeanwhile, I can help with timings, prices or booking.",
      "Bilkul. Maine " + biz.ownerShort + " ko bata diya hai, woh 15 minute mein yahin reply karenge.\nTab tak timings, price ya booking mein madad kar sakta hoon."
    ));
  };

  const unknown = (ctx, plan) => {
    S.unknowns += 1;
    plan.step("spark", "Understood: a question it has no answer for", { tone: "warn", ms: 460 });
    plan.step("search", "Searched " + biz.firm + "'s details", { detail: "No answer found", tag: "Business info", ms: 520 });
    plan.step("shield", "Did not guess an answer", { ms: 340 });
    bump("other questions");
    ownerAlert(plan, "Asked: \"" + ctx.raw.slice(0, 60) + "\"", true);
    plan.say(T(
      "Good question. I do not want to give you a wrong answer, so I have sent it to " + biz.ownerShort + ". " + biz.pronoun + " will reply here soon.\nMeanwhile, I can help with timings, prices or booking.",
      "Achha sawaal hai. Galat jawab nahi dena chahta, isliye " + biz.ownerShort + " ko bhej diya hai. Woh jaldi yahin reply karenge.\nTab tak timings, price ya booking mein madad kar sakta hoon."
    ));
  };

  // =====================================================================
  // 8. On screen: the phone
  // =====================================================================
  const waLog = $("#waLog");
  const waBody = $("#waBody");
  const chipsBox = $("#chips");
  const waStatus = $("#waStatus");
  const input = $("#waText");

  const scrollChat = () => {
    waBody.scrollTop = waBody.scrollHeight;
  };

  // *bold* like WhatsApp, and line breaks
  const rich = (text) => {
    const frag = document.createDocumentFragment();
    String(text).split("\n").forEach((line, i) => {
      if (i) { frag.appendChild(document.createElement("br")); }
      line.split(/(\*[^*]+\*)/).forEach((part) => {
        if (!part) { return; }
        if (part.length > 2 && part[0] === "*" && part[part.length - 1] === "*") { frag.appendChild(el("strong", null, part.slice(1, -1))); }
        else { frag.appendChild(document.createTextNode(part)); }
      });
    });
    return frag;
  };

  let lastSide = null;
  const addItem = (side, body, opts = {}) => {
    const li = el("li", "msg msg-" + side + (side !== lastSide ? " tail" : "") + (opts.cls ? " " + opts.cls : ""));
    const bubble = el("div", "bubble");
    if (opts.sender) { bubble.appendChild(el("span", "sender", opts.sender)); }
    bubble.appendChild(body);
    const meta = el("span", "meta");
    meta.appendChild(el("time", null, stamp()));
    if (side === "out") {
      const ticks = el("span", "ticks");
      ticks.appendChild(icon("tick"));
      meta.appendChild(ticks);
    }
    bubble.appendChild(meta);
    li.appendChild(bubble);
    waLog.appendChild(li);
    lastSide = side;
    scrollChat();
    return li;
  };
  const setTicks = (li, state) => {
    if (!li) { return; }
    const ticks = $(".ticks", li);
    if (!ticks) { return; }
    ticks.replaceChildren(icon(state === "sent" ? "tick" : "ticks"));
    ticks.classList.toggle("is-read", state === "read");
  };
  const addSystem = (text, cls) => {
    const li = el("li", "sys" + (cls ? " " + cls : ""));
    li.appendChild(el("span", null, text));
    waLog.appendChild(li);
    lastSide = null;
    scrollChat();
    return li;
  };

  let typingLi = null;
  const showTyping = () => {
    if (typingLi) { return; }
    typingLi = el("li", "msg msg-in typing" + (lastSide !== "in" ? " tail" : ""));
    const b = el("div", "bubble");
    b.setAttribute("aria-label", "typing");
    b.append(el("i"), el("i"), el("i"));
    typingLi.appendChild(b);
    waLog.appendChild(typingLi);
    waStatus.textContent = "typing...";
    waStatus.classList.add("is-typing");
    scrollChat();
  };
  const hideTyping = () => {
    if (typingLi) { typingLi.remove(); typingLi = null; }
    waStatus.textContent = "online";
    waStatus.classList.remove("is-typing");
  };

  // One reply from the business, drawn by its type
  const renderMsg = (msg) => {
    if (msg.type === "system") { addSystem(msg.text, "sys-note"); return; }
    if (msg.type === "owner") { addItem("in", rich(msg.text), { sender: msg.sender, cls: "from-owner" }); return; }
    const box = document.createElement("div");
    if (msg.type === "text") { box.appendChild(rich(msg.text)); }
    else if (msg.type === "card" || msg.type === "ticket") {
      box.className = "wcard" + (msg.type === "ticket" ? " wcard-ticket" : "");
      const head = el("p", "wcard-title");
      if (msg.type === "ticket") { head.appendChild(icon("calok")); }
      head.appendChild(el("span", null, msg.title));
      box.appendChild(head);
      const rows = el("dl", "wcard-rows");
      msg.rows.forEach((r) => {
        const row = el("div", "wrow");
        row.append(el("dt", null, r[0]), el("dd", null, r[1]));
        rows.appendChild(row);
      });
      if (msg.total) {
        const row = el("div", "wrow wrow-total");
        row.append(el("dt", null, msg.total[0]), el("dd", null, msg.total[1]));
        rows.appendChild(row);
      }
      box.appendChild(rows);
      if (msg.foot) { box.appendChild(el("p", "wcard-foot", msg.foot)); }
    } else if (msg.type === "menu") {
      box.className = "wcard wmenu";
      box.appendChild(el("p", "wcard-title", T("Menu: " + biz.firm, "Menu: " + biz.firm)));
      biz.menu.forEach((section) => {
        box.appendChild(el("p", "wmenu-sec", section.section));
        const ul = el("ul", "wmenu-list");
        section.items.forEach((item) => {
          const li = el("li");
          const mark = el("span", "veg " + (item.veg ? "is-veg" : "is-non"));
          mark.setAttribute("aria-label", item.veg ? "Veg" : "Non-veg");
          li.append(mark, el("span", "wmenu-name", item.name), el("span", "wmenu-price", rs(item.price)));
          ul.appendChild(li);
        });
        box.appendChild(ul);
      });
    } else if (msg.type === "location") {
      box.className = "wloc";
      const map = el("a", "wloc-map");
      map.href = biz.mapHref;
      map.target = "_blank";
      map.rel = "noopener";
      map.setAttribute("aria-label", "Open " + biz.firm + " in Google Maps");
      const pin = el("span", "wloc-pin");
      pin.appendChild(icon("pin"));
      map.appendChild(pin);
      box.appendChild(map);
      box.appendChild(el("strong", "wloc-name", biz.firm));
      box.appendChild(el("span", "wloc-addr", biz.fullAddress));
      const link = el("a", "wloc-link", "Open in Google Maps");
      link.href = biz.mapHref;
      link.target = "_blank";
      link.rel = "noopener";
      box.appendChild(link);
    } else if (msg.type === "pay") {
      box.className = "wpay";
      const top = el("p", "wpay-top");
      top.append(icon("rupee"), el("span", null, isINR ? "UPI payment request" : "Payment request"));
      box.appendChild(top);
      box.appendChild(el("p", "wpay-amt", rs(msg.amount)));
      box.appendChild(el("p", "wpay-no", "Order #" + msg.no + " · " + biz.firm));
      const btn = el("button", "wpay-btn", "Pay " + rs(msg.amount));
      btn.type = "button";
      btn.dataset.pay = String(msg.no);
      box.appendChild(btn);
      box.appendChild(el("p", "wpay-note", "Demo link. In the real assistant this opens " + (isINR ? "GPay, PhonePe or Paytm" : "your payment page") + ". No money moves here."));
    } else if (msg.type === "reminder") {
      box.className = "wremind";
      const head = el("p", "wremind-head");
      head.append(icon("bell"), el("span", null, "Reminder"));
      box.append(head, rich(msg.text));
    }
    addItem("in", box, { cls: msg.type === "text" ? "" : "msg-rich" + (msg.type === "reminder" ? " msg-reminder" : "") });
  };

  const setChips = (list) => {
    chipsBox.replaceChildren();
    (list || []).forEach((chip) => {
      const c = typeof chip === "string" ? { label: chip, send: chip } : chip;
      const b = el("button", "chip", c.label);
      b.type = "button";
      b.dataset.send = c.send;
      chipsBox.appendChild(b);
    });
    chipsBox.scrollLeft = 0;
  };

  // =====================================================================
  // 9. On screen: "Agent at work"
  // =====================================================================
  const runsBox = $("#runs");
  const agentState = $("#agentState");
  const ticker = $("#ticker");
  const tickerText = $("#tickerText");
  let tickerTimer = 0;

  const showTicker = (text) => {
    window.clearTimeout(tickerTimer);
    tickerText.textContent = text;
    ticker.classList.add("is-on");
  };
  const hideTicker = (later) => {
    window.clearTimeout(tickerTimer);
    tickerTimer = window.setTimeout(() => ticker.classList.remove("is-on"), later || 0);
  };

  const startRun = (head) => {
    $("#agentEmpty").hidden = true;
    const li = el("li", "run" + (head.kind === "owner" ? " run-owner" : head.kind === "event" ? " run-event" : ""));
    const top = el("div", "run-head");
    const who = el("span", "run-who");
    who.appendChild(icon(head.kind === "owner" ? "hand" : head.kind === "event" ? "rupee" : "user"));
    who.appendChild(el("span", null, head.who));
    top.append(who, el("time", null, stamp()));
    li.appendChild(top);
    if (head.text) { li.appendChild(el("p", "run-msg", head.text)); }
    const steps = el("ol", "steps");
    li.appendChild(steps);
    runsBox.appendChild(li);
    while (runsBox.children.length > 40) { runsBox.firstElementChild.remove(); }
    scrollRuns();
    return {
      add: (st) => {
        const s = el("li", "step is-running" + (st.tone ? " tone-" + st.tone : ""));
        const ic = el("span", "step-ico");
        ic.appendChild(icon(st.ico));
        const body = el("span", "step-body");
        body.appendChild(el("span", "step-text", st.text));
        if (st.detail) { body.appendChild(el("span", "step-detail", st.detail)); }
        s.append(ic, body);
        if (st.tag) { s.appendChild(el("span", "step-tag", st.tag)); }
        steps.appendChild(s);
        S.steps += 1;
        $("#agentSteps").textContent = String(S.steps);
        scrollRuns();
        return s;
      },
      end: (secs, label) => {
        const foot = el("p", "run-foot");
        foot.appendChild(icon("check"));
        foot.appendChild(el("span", null, label || "Replied in " + secs.toFixed(1) + " s"));
        li.appendChild(foot);
        li.classList.add("is-done");
        scrollRuns();
      }
    };
  };
  const scrollRuns = () => {
    runsBox.scrollTop = runsBox.scrollHeight;
  };

  // Plays one plan: the steps one by one, then the replies.
  const runPlan = async (plan, job, gen) => {
    const head = plan.head || { kind: "customer", who: S.customerName || "Customer", text: job ? "“" + job.text + "”" : "" };
    const run = startRun(head);
    agentState.textContent = "Working on it";
    $(".agent").classList.add("is-busy");
    const t0 = performance.now();
    let firstReply = 0;
    let typing = false;
    for (const st of plan.steps) {
      const node = run.add(st);
      showTicker(st.text);
      await wait(Math.round(st.ms * 0.85));
      if (gen !== S.gen) { return; }
      node.classList.remove("is-running");
      node.classList.add("is-done");
      if (st.effect) { st.effect(); }
      if (st.read && job) { setTicks(job.li, "read"); }
      if (!typing && job && head.kind === "customer") { showTyping(); typing = true; }
    }
    for (let i = 0; i < plan.msgs.length; i += 1) {
      const msg = plan.msgs[i];
      if (msg.type === "system") { hideTyping(); typing = false; await wait(350); }
      else {
        if (!typing) { showTyping(); typing = true; }
        await wait(i === 0 ? 240 : 340 + Math.min(420, (msg.text || "").length * 3));
      }
      if (gen !== S.gen) { return; }
      hideTyping();
      typing = false;
      renderMsg(msg);
      // What the customer waits for: the time to the first reply
      if (!firstReply) { firstReply = performance.now(); }
    }
    hideTyping();
    const secs = ((firstReply || performance.now()) - t0) / 1000;
    run.end(secs, head.kind === "customer" ? null : head.doneLabel);
    if (head.kind === "customer") { dash.replyTimes.push(fast ? secs * 4 : secs); }
    if (plan.chips) { setChips(plan.chips); }
    hideTicker(1600);
    if (plan.after) { plan.after(); }
    agentState.textContent = S.paused ? "Paused: owner is replying" : "Waiting for a message";
    $(".agent").classList.remove("is-busy");
    dash.render();
    badge("agent");
  };

  // Jobs run one after another, so fast typing never mixes up replies.
  const enqueue = (job) => { S.queue.push(job); pump(); };
  const pump = async () => {
    if (S.busy) { return; }
    S.busy = true;
    const gen = S.gen;
    while (S.queue.length && gen === S.gen) {
      const job = S.queue.shift();
      try { await job(gen); } catch (error) { if (window.console) { window.console.error(error); } }
    }
    if (gen === S.gen) { S.busy = false; }
  };

  // The customer sends a message
  const send = (text, src) => {
    const clean1 = String(text || "").replace(/\s+/g, " ").trim().slice(0, 160);
    if (!clean1) { return; }
    $("#chatHint") && $("#chatHint").remove();
    const li = addItem("out", rich(clean1));
    dash.liveMessage(clean1);
    window.setTimeout(() => setTicks(li, li.querySelector(".is-read") ? "read" : "delivered"), fast ? 60 : 260);
    chipsBox.replaceChildren();
    enqueue(async (gen) => {
      if (gen !== S.gen) { return; }
      const plan = think(clean1, src);
      await runPlan(plan, { text: clean1, li: li }, gen);
    });
  };
  const waitFor = (test) => new Promise((resolve) => {
    const tick = () => { if (test()) { resolve(); } else { window.setTimeout(tick, 120); } };
    tick();
  });

  // Pay link tapped
  waLog.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-pay]");
    if (!btn || btn.disabled) { return; }
    if (event.isTrusted) { stopAuto(); }
    if (!S.flow || S.flow.type !== "order" || S.flow.await !== "pay" || String(S.flow.no) !== btn.dataset.pay) { return; }
    btn.disabled = true;
    btn.textContent = "Opening UPI app...";
    enqueue(async (gen) => {
      await wait(900);
      if (gen !== S.gen) { return; }
      if (!S.flow || S.flow.type !== "order" || S.flow.await !== "pay" || String(S.flow.no) !== btn.dataset.pay) {
        btn.textContent = "Order already placed";
        return;
      }
      btn.replaceChildren(icon("check"), el("span", null, "Paid"));
      btn.classList.add("is-paid");
      const plan = newPlan({ kind: "event", who: "Payment came in", text: "Order #" + S.flow.no + ", " + rs(S.flow.total) });
      paid(plan, "upi");
      await runPlan(plan, null, gen);
    });
  });

  // =====================================================================
  // 10. On screen: the owner view
  // =====================================================================
  const minutesAgoClock = (ago) => { const d = new Date(Date.now() - ago * 60000); return stamp(d); };
  const agoText = (ms) => {
    const mins = Math.round((Date.now() - ms) / 60000);
    return mins < 1 ? "just now" : mins < 60 ? mins + " min ago" : Math.floor(mins / 60) + " h ago";
  };

  const dash = {
    reset() {
      const seed = biz.seed;
      this.started = false;
      this.liveName = null;
      this.liveLast = "";
      this.liveTag = "Live";
      this.bookings = seed.bookings.map((b, i) => ({ id: "s" + i, name: b.name, what: b.what, day: 0, t: toMin(b.time), price: b.price, order: !!b.order, live: false }));
      this.handoffs = seed.handoffs.map((h, i) => ({ id: "h" + i, name: h.name, text: h.text, at: Date.now() - h.ago * 60000, live: false, done: false }));
      this.chats = seed.chats.map((c) => ({ name: c.name, text: c.text, tag: c.tag, time: minutesAgoClock(c.ago) }));
      this.topics = Object.assign({}, seed.topics);
      this.replyTimes = [];
      this.fresh = null;
      this.render();
    },
    liveMessage(text) {
      if (!this.started) { this.started = true; this.flash("kpiChats"); badge("owner"); }
      this.liveLast = text;
      this.render();
    },
    setName(name) { this.liveName = name; this.render(); },
    addBooking(record) {
      this.bookings.push(record);
      this.liveTag = record.order ? "Ordered" : "Booked";
      this.fresh = record.id;
      this.flash("kpiBooked");
      this.render();
      badge("owner");
      toast(record.order ? "Owner view: new order added" : "Owner view: new booking added");
    },
    cancelBooking(record) { record.status = "Cancelled"; this.liveTag = "Cancelled"; this.flash("kpiBooked"); this.render(); badge("owner"); },
    addHandoff(text) {
      const open = this.handoffs.find((h) => h.live && !h.done);
      if (open) { open.text = text; open.at = Date.now(); }
      else { this.handoffs.push({ id: "h" + Date.now(), name: null, text: text, at: Date.now(), live: true, done: false }); }
      this.liveTag = "Needs you";
      this.flash("kpiWaiting");
      this.render();
      badge("owner");
      toast("Owner view: a chat is waiting for you");
    },
    flash(id) {
      const node = document.getElementById(id);
      if (!node) { return; }
      node.classList.remove("bump");
      void node.offsetWidth;
      node.classList.add("bump");
    },
    render() {
      const kindOrders = biz.kind === "restaurant";
      const active = this.bookings.filter((b) => b.status !== "Cancelled");
      $("#kpiChats").textContent = String(biz.seed.chatCount + (this.started ? 1 : 0));
      $("#kpiBooked").textContent = String(active.length);
      $("#kpiBookedLabel").textContent = kindOrders ? "Orders and tables" : biz.kind === "gym" ? "Trials and joins" : "Bookings";
      const waiting = this.handoffs.filter((h) => !h.done);
      $("#kpiWaiting").textContent = String(waiting.length);
      const times = this.replyTimes;
      const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 2.6;
      $("#kpiSpeed").textContent = avg.toFixed(1) + " s";
      $("#bookTitle").textContent = kindOrders ? "Orders and tables from the assistant" : "Booked by the assistant";

      // Waiting for you
      const waitList = $("#waitList");
      waitList.replaceChildren();
      waiting.slice().reverse().forEach((h) => {
        const li = el("li", "row row-wait" + (h.live ? " is-live" : ""));
        const main = el("div", "row-main");
        main.appendChild(el("strong", null, h.live ? (this.liveName || S.customerName || "Customer (you)") : h.name));
        main.appendChild(el("span", null, h.text));
        main.appendChild(el("small", null, agoText(h.at)));
        const btn = el("button", "btn-row" + (h.live ? " btn-row-main" : ""), h.live ? "Take over chat" : "Mark done");
        btn.type = "button";
        btn.dataset.handoff = h.id;
        li.append(main, btn);
        waitList.appendChild(li);
      });
      $("#waitEmpty").hidden = waiting.length > 0;

      // Bookings and orders, newest from the demo on top
      const bookList = $("#bookList");
      bookList.replaceChildren();
      const now = nowMin();
      const sorted = this.bookings.filter((b) => b.live).reverse().concat(this.bookings.filter((b) => !b.live).sort((a, b) => a.t - b.t));
      sorted.forEach((b) => {
        // A new row slides in once; later redraws keep only its tint.
        const li = el("li", "row" + (b.live ? " is-live" : "") + (b.id === this.fresh ? " is-new" : "") + (b.status === "Cancelled" ? " is-cancelled" : ""));
        const when = el("span", "row-time");
        when.appendChild(el("b", null, clock(b.t)));
        when.appendChild(el("small", null, b.order ? "order" : b.day === 0 ? "today" : b.day === 1 ? "tomorrow" : DAY_KEYS[dateAt(b.day).getDay()]));
        const main = el("div", "row-main");
        main.appendChild(el("strong", null, b.name));
        main.appendChild(el("span", null, b.what + (b.price ? " · " + rs(b.price) : "")));
        const status = b.status || (b.order ? "Delivered" : b.day === 0 && b.t < now ? "Done" : "Confirmed");
        const shown = b.live && b.status !== "Cancelled" ? "New" : status;
        const pill = el("span", "pill pill-" + shown.toLowerCase().replace(/[^a-z]+/g, "-"), shown);
        li.append(when, main, pill);
        bookList.appendChild(li);
      });
      this.fresh = null;

      // Today's chats
      const chatList = $("#chatList");
      chatList.replaceChildren();
      const rows = this.chats.slice().reverse();
      if (this.started) {
        rows.unshift({ name: this.liveName || S.customerName || "+91 98XXX XX419", text: this.liveLast, tag: this.liveTag, time: stamp(), live: true });
      }
      rows.forEach((c) => {
        const li = el("li", "row row-chat" + (c.live ? " is-live" : ""));
        const av = el("span", "avatar", (c.name.replace(/[^A-Za-z]/g, "").charAt(0) || "+").toUpperCase());
        const main = el("div", "row-main");
        const top = el("strong", null, c.name);
        main.appendChild(top);
        main.appendChild(el("span", null, c.text));
        const side = el("div", "row-side");
        side.appendChild(el("small", null, c.time));
        side.appendChild(el("span", "pill pill-" + c.tag.toLowerCase().replace(/[^a-z]+/g, "-"), c.tag));
        li.append(av, main, side);
        chatList.appendChild(li);
      });

      // Nightly summary, written like a WhatsApp message to the owner
      const chats = biz.seed.chatCount + (this.started ? 1 : 0);
      const orders = active.filter((b) => b.order);
      const slots = active.filter((b) => !b.order);
      const worth = slots.reduce((sum, b) => sum + (b.price || 0), 0);
      const sales = orders.reduce((sum, b) => sum + (b.price || 0), 0);
      const top3 = Object.keys(this.topics).filter((k) => k !== "hello").sort((a, b) => this.topics[b] - this.topics[a]).slice(0, 3);
      const lines = [];
      lines.push("*Today at " + biz.firm + "*");
      lines.push(chats + " chats answered, average reply " + avg.toFixed(1) + " seconds");
      if (kindOrders) {
        lines.push(orders.length + " orders worth " + rs(sales) + ", " + slots.length + " table" + (slots.length === 1 ? "" : "s") + " booked");
      } else {
        lines.push(slots.length + " " + (slots.length === 1 ? biz.booking.noun : biz.booking.nounPlural) + " booked" + (worth ? ", worth about " + rs(worth) : ""));
      }
      lines.push(waiting.length ? waiting.length + " waiting for you: " + waiting.map((h) => (h.live ? (this.liveName || "the demo chat") : h.name)).join(", ") : "Nothing waiting for you");
      if (top3.length) { lines.push("Most asked: " + top3.join(", ")); }
      lines.push("Reminders go out " + biz.booking.reminderHours + " hours before each " + (kindOrders ? "table booking" : biz.booking.noun) + ", or the evening before for early ones");
      const box = $("#summary");
      box.replaceChildren();
      lines.forEach((line, i) => {
        const p = el("p", i === 0 ? "summary-title" : null);
        p.appendChild(rich(line));
        box.appendChild(p);
      });
      box.appendChild(el("time", null, "9:00 pm"));
    }
  };

  // Owner taps a button in "Waiting for you"
  $("#waitList").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-handoff]");
    if (!btn) { return; }
    if (event.isTrusted) { stopAuto(); }
    const h = dash.handoffs.find((x) => x.id === btn.dataset.handoff);
    if (!h || h.done) { return; }
    if (!h.live) { h.done = true; dash.render(); return; }
    takeOver(h);
  });

  const takeOver = (h) => {
    if (h.taking) { return; }
    h.taking = true;
    setTab("chat");
    enqueue(async (gen) => {
      S.paused = true;
      const name = dash.liveName || S.customerName;
      const plan = newPlan({ kind: "owner", who: biz.ownerShort === "the owner" || biz.ownerShort === "the doctor" ? cap(biz.ownerShort) + " stepped in" : biz.ownerShort + " stepped in", text: "Took over the chat from the owner view", doneLabel: "Owner handled it. Assistant is back on." });
      plan.step("hand", "Paused the assistant for this chat", { tone: "owner", ms: 380, effect: () => { agentState.textContent = "Paused: owner is replying"; } });
      plan.step("reply", "Showed " + biz.ownerShort + " the full chat and the question", { ms: 380 });
      plan.say({ type: "system", text: cap(biz.owner) + " joined the chat" });
      plan.say({
        type: "owner",
        sender: cap(biz.owner),
        text: S.lang === "hi"
          ? "Hi" + (name ? " " + name : "") + ", " + (biz.custom && !custom.owner ? "main " + biz.firm + " se" : biz.ownerShort) + " bol raha hoon. Aapka message dekha. 10 minute mein call karta hoon, wahi pe sab tay kar lete hain."
          : "Hi" + (name ? " " + name : "") + ", " + (biz.custom && !custom.owner ? "this is " + biz.firm : biz.ownerShort + " here") + ". I saw your message. I will call you in 10 minutes and we will sort it out."
      });
      plan.after = () => {
        h.done = true;
        S.paused = false;
        dash.liveTag = "Owner replied";
        addSystem("The assistant is back on for this chat", "sys-note");
        dash.render();
      };
      await runPlan(plan, null, gen);
    });
  };

  // =====================================================================
  // 11. Tabs (phones), business picker, buttons, toast
  // =====================================================================
  const grid = $("#demoGrid");
  const mqWide = window.matchMedia("(min-width: 1180px)");
  const mqMid = window.matchMedia("(min-width: 860px)");
  const tabBtns = $$(".tab");

  const visible = (pane) => {
    if (mqWide.matches) { return true; }
    if (mqMid.matches && pane === "chat") { return true; }
    return grid.dataset.tab === pane;
  };
  const setTab = (name, focus) => {
    let tab = name;
    if (mqMid.matches && !mqWide.matches && tab === "chat") { tab = grid.dataset.tab === "owner" ? "owner" : "agent"; }
    grid.dataset.tab = tab;
    tabBtns.forEach((b) => {
      const on = b.dataset.tab === tab;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on) { const badgeNode = $(".tab-badge", b); if (badgeNode) { badgeNode.hidden = true; badgeNode.textContent = ""; } }
      if (on && focus) { b.focus(); }
    });
    // A view that was hidden could not scroll: show its newest item now.
    runsBox.scrollTop = runsBox.scrollHeight;
    waBody.scrollTop = waBody.scrollHeight;
  };
  const badge = (pane) => {
    if (visible(pane)) { return; }
    const node = $("#tab-" + pane + " .tab-badge");
    if (!node) { return; }
    node.textContent = String(Number(node.textContent || 0) + 1);
    node.hidden = false;
  };
  tabBtns.forEach((b, i) => {
    b.addEventListener("click", () => {
      setTab(b.dataset.tab);
      if (!mqMid.matches) {
        const top = $("#tabs").getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.4) { $("#tabs").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); }
      }
    });
    b.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") { return; }
      const shown = tabBtns.filter((x) => x.offsetParent !== null);
      const at = shown.indexOf(b);
      const next = shown[(at + (event.key === "ArrowRight" ? 1 : shown.length - 1)) % shown.length];
      setTab(next.dataset.tab, true);
      event.preventDefault();
      void i;
    });
  });
  const onLayout = () => setTab(grid.dataset.tab);
  if (mqWide.addEventListener) { mqWide.addEventListener("change", onLayout); mqMid.addEventListener("change", onLayout); }

  let toastTimer = 0;
  const toast = (text) => {
    if (visible("owner")) { return; }
    const node = $("#toast");
    node.textContent = text;
    node.hidden = false;
    node.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { node.classList.remove("is-on"); window.setTimeout(() => { node.hidden = true; }, 300); }, 2400);
  };
  $("#toast").addEventListener("click", () => { setTab("owner"); $("#toast").hidden = true; });

  // Chips and the text box
  chipsBox.addEventListener("click", (event) => {
    const b = event.target.closest(".chip");
    if (!b) { return; }
    if (event.isTrusted) { stopAuto(); }
    send(b.dataset.send, "chip");
  });
  $("#waForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    input.value = "";
    send(text, "typed");
  });
  input.addEventListener("keydown", (event) => { if (event.isTrusted) { stopAuto(); } });

  // Business picker
  const picker = $("#picker");
  BUSINESSES.forEach((b) => {
    const btn = el("button", "pick");
    btn.type = "button";
    btn.setAttribute("role", "radio");
    btn.dataset.kind = b.kind;
    btn.appendChild(icon(b.icon));
    btn.appendChild(el("span", null, b.label));
    picker.appendChild(btn);
  });
  picker.addEventListener("click", (event) => {
    const btn = event.target.closest(".pick");
    if (!btn || btn.dataset.kind === biz.kind) { return; }
    stopAuto();
    load(btn.dataset.kind);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("kind", btn.dataset.kind);
      window.history.replaceState(null, "", url);
    } catch (error) { /* old browsers */ }
  });
  picker.addEventListener("keydown", (event) => {
    if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].indexOf(event.key) === -1) { return; }
    const list = $$(".pick", picker);
    const at = list.findIndex((x) => x.dataset.kind === biz.kind);
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : list.length - 1;
    const next = list[(at + step) % list.length];
    next.click();
    next.focus();
    event.preventDefault();
  });

  $("#resetBtn").addEventListener("click", () => { stopAuto(); load(biz.kind); });
  $("#playBtn").addEventListener("click", () => { if (S.auto) { stopAuto(); } else { autoplay(); } });

  // =====================================================================
  // 12. "Play the demo": types the script for this business by itself
  // =====================================================================
  const idle = () => waitFor(() => !S.busy && !S.queue.length);
  const setPlayBtn = (playing) => {
    const btn = $("#playBtn");
    btn.replaceChildren(icon(playing ? "stop" : "play", "ico-fill"), el("span", null, playing ? "Stop the demo" : "Play the demo"));
    btn.classList.toggle("is-playing", playing);
  };
  const stopAuto = () => {
    if (!S.auto) { return; }
    S.auto.stop = true;
    S.auto = null;
    setPlayBtn(false);
    input.value = "";
  };
  const typeAndSend = async (text, token) => {
    input.value = "";
    for (let i = 0; i < text.length; i += 1) {
      if (token.stop) { return; }
      input.value += text[i];
      await wait(text[i] === " " ? 55 : 32);
    }
    await wait(260);
    if (token.stop) { return; }
    input.value = "";
    send(text, "typed");
  };
  const tapChip = (match) => {
    const list = $$(".chip", chipsBox);
    const chip = typeof match === "number" ? list[match] : list.find((c) => c.textContent.toLowerCase().indexOf(match.toLowerCase()) === 0);
    if (chip) { chip.classList.add("is-tapped"); chip.click(); return true; }
    return false;
  };
  const autoplay = async () => {
    load(biz.kind);
    const token = { stop: false };
    S.auto = token;
    setPlayBtn(true);
    await wait(500);
    for (const raw of biz.script) {
      if (token.stop) { return; }
      await idle();
      await wait(raw.indexOf("@") === 0 ? 1100 : 1300);
      if (token.stop) { return; }
      if (raw === "@takeover") {
        const h = dash.handoffs.find((x) => x.live && !x.done);
        if (h) {
          const btn = $('[data-handoff="' + h.id + '"]');
          if (btn) { btn.classList.add("is-tapped"); }
          await wait(700);
          if (token.stop) { return; }
          takeOver(h);
        }
      } else if (raw === "@pay") {
        const btn = $$("[data-pay]", waLog).pop();
        if (btn) { btn.classList.add("is-tapped"); await wait(350); btn.click(); }
      } else if (raw.indexOf("@chip:") === 0) {
        tapChip(raw.slice(6));
      } else if (raw.indexOf("@book:") === 0) {
        const name = raw.slice(6);
        for (let i = 0; i < 8 && S.flow && S.flow.type === "booking" && !token.stop; i += 1) {
          const step = S.flow.await;
          if (step === "name") { await typeAndSend(name, token); }
          else if (step === "people") { await typeAndSend("4 people", token); }
          else if (step === "confirm") { tapChip("Confirm"); }
          else { tapChip(0); }
          await idle();
          await wait(1000);
        }
      } else {
        await typeAndSend(fill(raw), token);
      }
    }
    await idle();
    if (S.auto === token) { S.auto = null; setPlayBtn(false); }
  };

  // =====================================================================
  // 13. Load a business: names, colours, links, an empty chat
  // =====================================================================
  const load = (kind) => {
    S.gen += 1;
    S.queue = [];
    S.busy = false;
    S.lang = "en";
    S.flow = null;
    S.offer = null;
    S.paused = false;
    S.customerName = null;
    S.taken = new Set();
    S.cart = [];
    S.orders = 0;
    S.bookings = [];
    S.steps = 0;
    S.unknowns = 0;
    S.msgs = 0;
    biz = makeBiz(kind);

    document.documentElement.style.setProperty("--biz", biz.color);
    document.title = "AI assistant on WhatsApp for " + biz.firm + " | " + builtBy;
    $$("[data-firm]").forEach((node) => { node.textContent = biz.firm; });
    $$("[data-owner]").forEach((node) => { node.textContent = biz.owner; });
    $("#waAvatar").replaceChildren(icon(biz.icon));
    $$(".pick", picker).forEach((b) => {
      const on = b.dataset.kind === biz.kind;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $("#ctaTitle").textContent = "Want this for your " + biz.word + "?";
    const today = dateAt(0);
    $("#todayText").textContent = DAY_NAMES[today.getDay()] + ", " + shortDate(today);
    $("#agentSteps").textContent = "0";
    setLinks();

    // Empty chat with the honest note
    hideTyping();
    waLog.replaceChildren();
    lastSide = null;
    addSystem("Today", "sys-date");
    addSystem("Demo: replies are pre-set. The real assistant is trained on your business.", "sys-note");
    const hint = el("li", "chat-hint");
    hint.id = "chatHint";
    hint.appendChild(icon("reply"));
    hint.appendChild(el("p", null, "You are the customer. Tap a button below or type a question, in English or Hinglish. Try \"kal 5 baje appointment chahiye\"."));
    if (biz.kind === "restaurant") { hint.lastChild.textContent = "You are the customer. Tap a button below or type, in English or Hinglish. Try \"2 butter chicken aur 4 naan\"."; }
    waLog.appendChild(hint);
    setChips(["Hi"].concat(startChips()));
    input.value = "";

    runsBox.replaceChildren();
    $("#agentEmpty").hidden = false;
    agentState.textContent = "Waiting for a message";
    $(".agent").classList.remove("is-busy");
    ticker.classList.remove("is-on");
    $$(".tab-badge").forEach((b) => { b.hidden = true; b.textContent = ""; });
    dash.reset();
  };

  // Links to the seller (owner.js), like the other samples
  const setLinks = () => {
    const hello = "Hi " + builtBy.split(" ")[0] + ", I saw the WhatsApp AI assistant demo" + (biz.custom ? " for " + biz.firm : "") + ". I want one for my " + biz.word + ".";
    const href = waLink(hello, builderNumber);
    $("#topCta").href = href;
    $("#ctaBtn").href = href;
    const link = $("#demoLink");
    if (builderNumber) {
      link.href = href;
      link.dataset.offerFirm = biz.custom ? biz.firm : "";
      link.hidden = false;
    }
    $$("[data-builder]").forEach((node) => { node.textContent = builtBy; });
    $("#builtBy").textContent = builtBy;
    $("#builderCity").textContent = OWNER.city || "Mumbai";
  };
  const setDemoText = () => {
    $("#demoText").textContent = custom.firm
      ? "Sample made for " + custom.firm + " by " + builtBy + ". The prices and chats are examples."
      : "Sample by " + builtBy + ". The businesses, prices and chats are examples.";
  };

  // Phone status bar clock
  const tickClock = () => {
    const d = new Date();
    $("#statusTime").textContent = (d.getHours() % 12 || 12) + ":" + String(d.getMinutes()).padStart(2, "0");
  };
  tickClock();
  window.setInterval(tickClock, 30000);

  load(startKind);
  setDemoText();
  // ../lead.js writes its own sample note after the page loads; this one comes later and wins.
  document.addEventListener("DOMContentLoaded", setDemoText);
  setTab("chat");

  if (/^(1|true|yes)$/.test(params.get("autoplay") || params.get("play") || "")) { window.setTimeout(autoplay, 600); }

  // For testing in the browser console: AgentDemo.send("timing kya hai")
  window.AgentDemo = { send: (text) => send(text, "typed"), idle: idle, state: () => S, dash: () => dash, load: load, autoplay: autoplay };
})();
