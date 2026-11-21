// Shop software sample: billing, stock, udhaar, staff and reports for a small Indian shop.
// Plain JavaScript, no libraries. Everything is saved in this browser (localStorage).
// data.js makes the sample shop; ?firm=Name&area=Place puts a real shop's name on it.
(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. Values from the link and fixed settings
  // ---------------------------------------------------------------------
  const LEAD = window.LEAD || {};
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const linkFirm = clean(params.get("firm") || LEAD.firm, 60);
  const linkArea = clean(params.get("area") || LEAD.area, 40);
  const linkCity = clean(params.get("city") || LEAD.city, 30);
  const BUILDER = String((window.OWNER && window.OWNER.name) || "Oxzi");
  const BUILDER_WA = String((window.OWNER && window.OWNER.whatsapp) || "").replace(/\D/g, "");

  const DEFAULT_NAME = window.ERP_SEED.shopName;
  const STORE_KEY = "oxzi-shop-demo-v1";
  const DRAFT_KEY = "oxzi-shop-demo-v1-bill";
  const DAY_MS = 86400000;
  // The sample items use the September 2025 slabs (0, 5, 18). 12% stays selectable for older stock and bills.
  const GST_RATES = [0, 5, 12, 18];
  const UNITS = ["pc", "pack", "kg", "L", "tray", "bottle", "box", "dozen"];
  // Payment colours: the first four of a colour-blind-safe chart palette, always in this order.
  const MODES = [
    { key: "cash", label: "Cash", color: "#2a78d6" },
    { key: "upi", label: "UPI", color: "#eb6834" },
    { key: "card", label: "Card", color: "#1baf7a" },
    { key: "udhaar", label: "Udhaar", color: "#eda100", darkText: true }
  ];
  const ATT = [["P", "Present"], ["H", "Half day"], ["A", "Absent"]];

  // ---------------------------------------------------------------------
  // 2. Small helpers
  // ---------------------------------------------------------------------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name) => '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const pad = (n) => String(n).padStart(2, "0");
  const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
  const modeOf = (key) => MODES.find((m) => m.key === key) || { key: key, label: key, color: "#898781" };

  const nf0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Rupees with Indian digit grouping: 1,24,560
  const rs = (n) => { const r = Math.round(n); return (r < 0 ? "−" : "") + "₹" + nf0.format(Math.abs(r)); };
  const rs2 = (n) => (n < -0.004 ? "−" : "") + "₹" + nf2.format(Math.abs(n));
  const money2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
  // GST splits into CGST and SGST. CGST is rounded to the paisa and SGST is the rest, so the two always add up.
  const halves = (gst) => { const total = Math.round(gst * 100) / 100; const c = Math.round(total * 50) / 100; return [c, Math.round((total - c) * 100) / 100]; };
  // Short amounts for chart labels: 950, 4.1K, 1.25L
  const compact = (n) => {
    const a = Math.abs(n);
    const trim = (x, d) => x.toFixed(d).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    if (a >= 1e7) { return trim(n / 1e7, 2) + "Cr"; }
    if (a >= 1e5) { return trim(n / 1e5, 2) + "L"; }
    if (a >= 1e3) { return trim(n / 1e3, 1) + "K"; }
    return String(Math.round(n));
  };

  // Dates: days are kept as "2026-11-21" in the shop's local time.
  const dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const keyDate = (key) => { const p = key.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2] || 1); };
  const startOfDay = (ts) => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fmtShort = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const fmtLong = (ts) => new Date(ts).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  const monthName = (ym) => keyDate(ym + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const daysInMonth = (ym) => { const p = ym.split("-").map(Number); return new Date(p[0], p[1], 0).getDate(); };
  const daysSince = (ts) => Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY_MS);
  const ago = (ts) => { const d = daysSince(ts); return d <= 0 ? "today" : d === 1 ? "yesterday" : d + " days ago"; };

  // Amount in words, Indian style: "Rupees One Lakh Twenty Four Thousand Five Hundred Sixty only"
  const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const twoWords = (n) => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  const words = (amount) => {
    let n = Math.round(amount);
    if (n <= 0) { return "Rupees Zero only"; }
    const parts = [];
    const crore = Math.floor(n / 1e7); n %= 1e7;
    const lakh = Math.floor(n / 1e5); n %= 1e5;
    const thousand = Math.floor(n / 1e3); n %= 1e3;
    const hundred = Math.floor(n / 100); n %= 100;
    if (crore) { parts.push(twoWords(crore) + " Crore"); }
    if (lakh) { parts.push(twoWords(lakh) + " Lakh"); }
    if (thousand) { parts.push(twoWords(thousand) + " Thousand"); }
    if (hundred) { parts.push(ONES[hundred] + " Hundred"); }
    if (n) { parts.push(twoWords(n)); }
    return "Rupees " + parts.join(" ") + " only";
  };

  // WhatsApp: a real 10-digit number opens that chat; the sample's masked numbers open the contact picker.
  const waNumber = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) { return "91" + digits; }
    if (digits.length === 12 && digits.startsWith("91")) { return digits; }
    return "";
  };
  const waLink = (text, number) => "https://wa.me/" + (number || "") + "?text=" + encodeURIComponent(text);
  const initials = (name) => String(name || "").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w.charAt(0)))
    .slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "S";
  const firstName = (name) => String(name || "").split(" ")[0];

  // ---------------------------------------------------------------------
  // 3. Saved data
  // ---------------------------------------------------------------------
  let canSave = true;
  let toastTimer = 0;
  const toast = (text) => {
    const box = $("#toast");
    box.textContent = text;
    box.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => box.classList.remove("is-on"), 3600);
  };

  const readJson = (key) => {
    let raw = null;
    try { raw = window.localStorage.getItem(key); }
    catch (error) { canSave = false; return null; } // storage blocked (private mode, settings)
    if (!raw) { return null; }
    try { return JSON.parse(raw); }
    catch (error) { try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ } return null; } // a damaged value is dropped
  };
  const writeJson = (key, value) => {
    if (!canSave) { return; }
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { canSave = false; toast("This browser cannot save. Changes last until the page is closed."); }
  };
  const emptyDraft = () => ({ lines: [], disc: "", cust: "", mode: "cash", cash: "", newName: "", newPhone: "" });
  const freshData = () => {
    const data = window.ERP_SEED(Date.now());
    data.v = 1;
    data.seededAt = Date.now();
    data.touched = false;
    return data;
  };
  // A name, area or city in the link becomes the shop's (until a different link is opened).
  const applyLink = () => {
    if (linkFirm && linkFirm !== db.shop.fromLink) { db.shop.name = linkFirm; db.shop.fromLink = linkFirm; }
    if (linkArea && linkArea !== db.shop.areaFromLink) { db.shop.area = linkArea; db.shop.areaFromLink = linkArea; }
    if (linkCity && linkCity !== db.shop.cityFromLink) { db.shop.city = linkCity; db.shop.cityFromLink = linkCity; }
    if (LEAD.phone && !db.touched) {
      const digits = String(LEAD.phone).replace(/\D/g, "").slice(-10);
      db.shop.phone = digits.length === 10 ? "+91 " + digits.slice(0, 5) + " " + digits.slice(5) : clean(LEAD.phone, 24);
    }
  };

  let db = readJson(STORE_KEY);
  // Sample data nobody has changed is rebuilt after an hour, so "today" always looks like today.
  if (!db || db.v !== 1 || !Array.isArray(db.bills) || (!db.touched && Date.now() - (db.seededAt || 0) > 3600000)) {
    db = freshData();
  }
  applyLink();
  writeJson(STORE_KEY, db);
  let draft = Object.assign(emptyDraft(), readJson(DRAFT_KEY) || {});

  let derived = null;
  const save = () => { db.touched = true; derived = null; writeJson(STORE_KEY, db); };
  const saveDraft = () => writeJson(DRAFT_KEY, draft);

  const itemById = (id) => db.items.find((i) => i.id === id);
  const customerById = (id) => db.customers.find((c) => c.id === id);
  const billById = (id) => db.bills.find((b) => b.id === id);
  const uid = (prefix) => { db.seq.id += 1; return prefix + "n" + db.seq.id.toString(36); };

  // ---------------------------------------------------------------------
  // 4. Sums. Prices include GST (MRP style), so GST is worked out from inside the price.
  // ---------------------------------------------------------------------
  const totalsCache = new WeakMap();
  const billTotals = (bill) => {
    const cached = totalsCache.get(bill);
    if (cached) { return cached; }
    let sub = 0;
    let cost = 0;
    let qty = 0;
    bill.lines.forEach((l) => { sub += l.q * l.p; cost += l.q * l.b; qty += l.q; });
    const disc = Math.min(Math.max(0, bill.d || 0), sub);
    const factor = sub ? (sub - disc) / sub : 0;
    const rates = {};
    const lineNet = [];
    let taxable = 0;
    let gst = 0;
    bill.lines.forEach((l) => {
      const net = l.q * l.p * factor; // the discount is shared across lines by value
      const base = net / (1 + l.g / 100);
      const r = rates[l.g] || (rates[l.g] = { taxable: 0, gst: 0 });
      r.taxable += base;
      r.gst += net - base;
      taxable += base;
      gst += net - base;
      lineNet.push(net);
    });
    const totals = { sub: sub, disc: disc, total: sub - disc, taxable: taxable, gst: gst, rates: rates, lineNet: lineNet,
      profit: sub - disc - cost, qty: qty };
    totalsCache.set(bill, totals);
    return totals;
  };

  const index = () => {
    if (derived) { return derived; }
    const byDay = new Map();
    const sold = {};
    db.bills.forEach((b) => {
      const key = dayKey(b.t);
      if (!byDay.has(key)) { byDay.set(key, []); }
      byDay.get(key).push(b);
      b.lines.forEach((l) => { sold[l.id] = (sold[l.id] || 0) + l.q; });
    });
    derived = { byDay: byDay, sold: sold };
    return derived;
  };
  const billsOn = (key) => index().byDay.get(key) || [];
  const billsInMonth = (ym) => {
    const out = [];
    index().byDay.forEach((list, key) => { if (key.startsWith(ym)) { out.push.apply(out, list); } });
    return out.sort((a, b) => a.t - b.t);
  };

  const summarize = (bills) => {
    const s = { sales: 0, count: bills.length, profit: 0, gst: 0, taxable: 0, disc: 0, qty: 0,
      modes: { cash: 0, upi: 0, card: 0, udhaar: 0 }, rates: {}, items: {} };
    bills.forEach((b) => {
      const t = billTotals(b);
      s.sales += t.total;
      s.profit += t.profit;
      s.gst += t.gst;
      s.taxable += t.taxable;
      s.disc += t.disc;
      s.qty += t.qty;
      s.modes[b.m] = (s.modes[b.m] || 0) + t.total;
      Object.keys(t.rates).forEach((r) => {
        const x = s.rates[r] || (s.rates[r] = { taxable: 0, gst: 0 });
        x.taxable += t.rates[r].taxable;
        x.gst += t.rates[r].gst;
      });
      b.lines.forEach((l, i) => {
        const it = s.items[l.id] || (s.items[l.id] = { id: l.id, name: l.n, g: l.g, qty: 0, sales: 0, taxable: 0, gst: 0 });
        const net = t.lineNet[i];
        const base = net / (1 + l.g / 100);
        it.qty += l.q;
        it.sales += net;
        it.taxable += base;
        it.gst += net - base;
      });
    });
    s.avg = s.count ? s.sales / s.count : 0;
    return s;
  };

  // Udhaar: credit adds to a customer's balance, a payment takes it off.
  const balances = () => {
    const bal = {};
    const lastPay = {};
    const firstDue = {};
    db.ledger.forEach((e) => {
      const before = bal[e.c] || 0;
      bal[e.c] = before + (e.type === "credit" ? e.amt : -e.amt);
      if (e.type === "payment") { lastPay[e.c] = e.t; }
      if (before <= 0 && bal[e.c] > 0) { firstDue[e.c] = e.t; }
    });
    return { bal: bal, lastPay: lastPay, firstDue: firstDue };
  };

  const stockState = (it) => it.stock <= 0 ? "out" : it.stock <= it.low ? "low" : "ok";
  // "6 kg", "1 pack", "12 packs"
  const UNIT_PLURAL = { pc: "pcs", pack: "packs", tray: "trays", bottle: "bottles", box: "boxes" };
  const qtyText = (n, unit) => n + " " + (n === 1 ? unit : UNIT_PLURAL[unit] || unit);

  // ---------------------------------------------------------------------
  // 5. Charts: bars drawn as inline SVG at the real width, and a split bar for payments
  // ---------------------------------------------------------------------
  const charts = new Map();
  let chartSeq = 0;
  const barChart = (points, opts) => {
    chartSeq += 1;
    const id = "ch" + chartSeq;
    charts.set(id, { points: points, opts: opts });
    return '<div class="chart" data-chart="' + id + '" style="height:' + (opts.height || 200) + 'px"></div>';
  };
  const f1 = (n) => Math.round(n * 10) / 10;
  const barPath = (x, y, w, h, r) => {
    r = Math.min(r, h);
    return "M" + f1(x) + "," + f1(y + h) + "V" + f1(y + r) + "Q" + f1(x) + "," + f1(y) + " " + f1(x + r) + "," + f1(y) +
      "H" + f1(x + w - r) + "Q" + f1(x + w) + "," + f1(y) + " " + f1(x + w) + "," + f1(y + r) + "V" + f1(y + h) + "Z";
  };
  const niceStep = (raw) => {
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
  };
  const chartSvg = (width, points, opts) => {
    const W = Math.max(240, Math.round(width));
    const H = opts.height || 200;
    const padL = 38;
    const padR = 6;
    const padT = 24;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const max = Math.max(0, ...points.map((p) => p.value));
    const step = niceStep(Math.max(max, 1000) / 4);
    const top = Math.max(step, Math.ceil(max / step) * step);
    const y = (v) => padT + plotH * (1 - v / top);
    const slot = plotW / points.length;
    const barW = Math.max(2, Math.min(24, slot * 0.62, slot - 2));
    const focusable = points.length <= 16;
    let out = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="group" aria-label="' + esc(opts.label) + '">';
    for (let v = 0; v <= top + 0.001; v += step) {
      const yy = Math.round(y(v)) + 0.5;
      out += '<line class="' + (v === 0 ? "c-axis" : "c-grid") + '" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + yy + '" y2="' + yy + '"/>' +
        '<text class="c-tick" x="' + (padL - 7) + '" y="' + (yy + 4) + '" text-anchor="end">' + (v ? compact(v) : "0") + "</text>";
    }
    const every = Math.max(1, Math.ceil((opts.labelWidth || 36) / slot));
    points.forEach((p, i) => {
      const cx = padL + slot * i + slot / 2;
      const h = (plotH * p.value) / top;
      out += '<g class="c-col">';
      if (p.value > 0) {
        out += '<path class="c-bar' + (p.hi ? " is-hi" : "") + '" d="' + barPath(cx - barW / 2, y(p.value), barW, Math.max(1, h), Math.min(4, barW / 2)) + '"/>';
      }
      out += '<rect class="c-hit" x="' + f1(padL + slot * i) + '" y="' + padT + '" width="' + f1(slot) + '" height="' + plotH + '"' +
        (focusable ? ' tabindex="0" role="img" aria-label="' + esc(p.tip) + '"' : "") + ' data-tip="' + esc(p.tip) + '"/></g>';
      if (p.hi && p.value > 0) {
        // Near either edge the label lines up with the bar's outer side, so it never runs into the axis labels.
        const edge = slot < 30 ? (i < 3 ? "start" : i > points.length - 4 ? "end" : "middle") : "middle";
        const lx = edge === "start" ? cx - barW / 2 : edge === "end" ? cx + barW / 2 : cx;
        out += '<text class="c-val" x="' + f1(lx) + '" y="' + f1(y(p.value) - 7) + '" text-anchor="' + edge + '">₹' + compact(p.value) + "</text>";
      }
      if ((points.length - 1 - i) % every === 0) {
        out += '<text class="c-x' + (p.hi ? " is-hi" : "") + '" x="' + f1(cx) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(p.label) + "</text>";
      }
    });
    return out + "</svg>";
  };
  const fitSplitLabels = () => {
    $$(".split-pct").forEach((label) => {
      label.hidden = false;
      label.hidden = label.scrollWidth + 12 > label.parentElement.clientWidth;
    });
  };
  const drawCharts = () => {
    $$("[data-chart]").forEach((el) => {
      const chart = charts.get(el.dataset.chart);
      if (chart) { el.innerHTML = chartSvg(el.clientWidth, chart.points, chart.opts); }
    });
    fitSplitLabels();
  };
  // Numbers behind a chart, for anyone who prefers a table (and for screen readers).
  const numbersTable = (rows, head) =>
    '<details class="numbers"><summary>Show the numbers</summary><div class="table-wrap"><table class="table table-sm"><thead><tr>' +
    head.map((h, i) => '<th scope="col"' + (i ? ' class="num"' : "") + ">" + h + "</th>").join("") + "</tr></thead><tbody>" +
    rows.map((r) => "<tr>" + r.map((c, i) => (i ? '<td class="num">' : "<td>") + c + "</td>").join("") + "</tr>").join("") +
    "</tbody></table></div></details>";

  const splitBar = (modes, label) => {
    const total = MODES.reduce((sum, m) => sum + (modes[m.key] || 0), 0);
    if (!total) { return '<p class="empty">No sales yet.</p>'; }
    const parts = MODES.filter((m) => modes[m.key] > 0).map((m) => {
      const v = modes[m.key];
      const pct = Math.round((v / total) * 100);
      const tip = m.label + ": " + rs(v) + " (" + pct + "%)";
      return '<div class="split-part' + (m.darkText ? " on-light" : "") + '" style="flex-grow:' + v.toFixed(2) + ";background:" + m.color +
        '" data-tip="' + esc(tip) + '" tabindex="0" role="img" aria-label="' + esc(tip) + '"><span class="split-pct">' + pct + "%</span></div>";
    }).join("");
    const legend = MODES.map((m) => '<li><span class="sw" style="background:' + m.color + '"></span><span class="lg-name">' + m.label +
      '</span><span class="lg-val">' + rs(modes[m.key] || 0) + "</span></li>").join("");
    return '<div class="split" role="group" aria-label="' + esc(label) + '">' + parts + '</div><ul class="legend">' + legend + "</ul>";
  };

  // One tooltip for every chart mark: follows the mouse, shows on keyboard focus and on tap.
  const tip = $("#tip");
  const showTip = (target, x, y) => {
    const text = target.getAttribute("data-tip");
    if (!text) { return; }
    tip.textContent = text;
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left;
    let top;
    if (x === undefined) {
      const r = target.getBoundingClientRect();
      left = r.left + r.width / 2 - tw / 2;
      top = r.top + Math.min(r.height / 2, 40) - th - 10;
    } else {
      left = x - tw / 2;
      top = y - th - 14;
    }
    left = Math.max(8, Math.min(window.innerWidth - tw - 8, left));
    if (top < 8) { top = (y === undefined ? 8 : y + 18); }
    tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  };
  const hideTip = () => { tip.hidden = true; };
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") { return; }
    const target = event.target.closest ? event.target.closest("[data-tip]") : null;
    if (target) { showTip(target, event.clientX, event.clientY); } else if (!tip.hidden) { hideTip(); }
  });
  document.addEventListener("focusin", (event) => {
    if (event.target.matches && event.target.matches("[data-tip]")) { showTip(event.target); }
  });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, { passive: true });

  // ---------------------------------------------------------------------
  // 6. The frame: shop name, sample notice, menu
  // ---------------------------------------------------------------------
  const place = () => [db.shop.area, db.shop.city].filter(Boolean).join(", ");
  const paintShell = () => {
    $$("[data-shop]").forEach((n) => { n.textContent = db.shop.name; });
    $$("[data-shop-place]").forEach((n) => { n.textContent = place(); });
    $$("[data-mark]").forEach((n) => { n.textContent = initials(db.shop.name); });
    $$("[data-builder]").forEach((n) => { n.textContent = BUILDER; });
    $("#topDate").textContent = fmtLong(Date.now());
    $("#topDatePhone").textContent = place();
    // The sample notice names the shop when the link or Shop details gave it a name of its own.
    // A lead page (?id=) keeps the notice from ../lead.js while the name is still the one from Google.
    const named = Boolean(linkFirm) || db.shop.name !== DEFAULT_NAME;
    if (!(LEAD.firm && db.shop.name === LEAD.firm)) {
      $("#demoText").textContent = named
        ? "Sample made for " + db.shop.name + " by " + BUILDER + ". All numbers are examples and stay on this device."
        : "Sample shop software by " + BUILDER + ". All numbers are examples and stay on this device.";
    }
    if (BUILDER_WA) {
      const link = $("#demoLink");
      link.href = waLink("Hi " + firstName(BUILDER) + ", I saw the shop software sample" + (named ? " for " + db.shop.name : "") +
        ". I want billing and stock software like this for my shop.", BUILDER_WA);
      link.dataset.offerFirm = named ? db.shop.name : "";
      link.hidden = false;
    }
  };

  // ---------------------------------------------------------------------
  // 7. Home (dashboard)
  // ---------------------------------------------------------------------
  const kpi = (label, value, note, extra) => {
    const tag = extra && extra.href ? "a" : "div";
    return "<" + tag + ' class="kpi' + (extra && extra.cls ? " " + extra.cls : "") + '"' + (extra && extra.href ? ' href="' + extra.href + '"' : "") + ">" +
      '<span class="kpi-label">' + label + '</span><span class="kpi-val">' + value + "</span>" +
      (note ? '<span class="kpi-note">' + note + "</span>" : "") + "</" + tag + ">";
  };

  const billRow = (b) => {
    const t = billTotals(b);
    const mode = modeOf(b.m);
    return '<li><button type="button" class="row row-btn" data-act="invoice" data-id="' + b.id + '">' +
      '<span class="row-main"><span class="row-title">Bill ' + b.no + " · " + esc(b.cn || "Walk-in") + "</span>" +
      '<span class="row-sub">' + (dayKey(b.t) === dayKey(Date.now()) ? fmtTime(b.t) : fmtShort(b.t) + ", " + fmtTime(b.t)) + " · " + plural(t.qty, "item", "items") + "</span></span>" +
      '<span class="mode-tag" style="--c:' + mode.color + '">' + mode.label + "</span>" +
      '<span class="row-amt">' + rs(t.total) + "</span></button></li>";
  };

  const viewHome = () => {
    const now = Date.now();
    const today = summarize(billsOn(dayKey(now)));
    const yesterdayKey = dayKey(startOfDay(now) - 1);
    const sameTimeYesterday = summarize(billsOn(yesterdayKey).filter((b) => b.t <= now - DAY_MS));
    const b = balances();
    const dueList = Object.keys(b.bal).filter((id) => b.bal[id] > 0);
    const dueTotal = dueList.reduce((sum, id) => sum + b.bal[id], 0);
    const low = db.items.filter((i) => i.stock <= i.low).sort((x, y) => x.stock / Math.max(1, x.low) - y.stock / Math.max(1, y.low));

    const week = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const s = summarize(billsOn(dayKey(d.getTime())));
      week.push({ ts: d.getTime(), sales: s.sales, count: s.count, isToday: i === 0 });
    }
    const weekTotal = week.reduce((sum, d) => sum + d.sales, 0);
    const best = week.reduce((m, d) => (d.sales > m.sales ? d : m), week[0]);
    const dayLabel = (d) => d.isToday ? "Today" : new Date(d.ts).toLocaleDateString("en-IN", { weekday: "short" });
    const points = week.map((d) => ({ value: d.sales, hi: d.isToday, label: dayLabel(d),
      tip: (d.isToday ? "Today" : fmtLong(d.ts)) + ": " + rs(d.sales) + ", " + plural(d.count, "bill", "bills") }));

    const hour = new Date(now).getHours();
    const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    let change = "";
    if (sameTimeYesterday.sales > 0) {
      const pct = Math.round(((today.sales - sameTimeYesterday.sales) / sameTimeYesterday.sales) * 100);
      change = '<span class="delta ' + (pct >= 0 ? "is-up" : "is-down") + '">' + icon(pct >= 0 ? "up" : "down") +
        (pct >= 0 ? "Up " : "Down ") + Math.abs(pct) + "% vs this time yesterday</span>";
    }
    const stale = db.touched && dayKey(db.seededAt) !== dayKey(now)
      ? '<div class="notice">' + icon("alert") + "<p>This sample data was made on " + fmtDate(db.seededAt) +
        ". Reset it to see fresh numbers for today.</p>" +
        '<button type="button" class="btn btn-sm btn-soft" data-act="reset">' + icon("reset") + "<span>Reset demo data</span></button></div>"
      : "";

    const lowRows = low.slice(0, 6).map((it) => {
      const state = stockState(it);
      return '<li class="row"><span class="row-main"><span class="row-title">' + esc(it.name) + "</span>" +
        '<span class="row-sub"><span class="pill pill-' + (state === "out" ? "bad" : "warn") + '">' + (state === "out" ? "Out of stock" : "Low") + "</span> " +
        (state === "out" ? "" : esc(qtyText(it.stock, it.unit)) + " left · ") + "reorder at " + it.low + "</span></span>" +
        '<button type="button" class="btn btn-xs btn-soft" data-act="stockin" data-id="' + it.id + '">' + icon("in") + "<span>Stock in</span></button></li>";
    }).join("");

    return '<div class="view-head"><div><p class="eyebrow"><span class="only-narrow">' + fmtLong(now) + '</span><span class="only-wide">How the shop is doing today</span></p><h1>' + hello + "</h1></div>" +
      '<a class="btn btn-primary only-narrow" href="#bill">' + icon("plus") + "<span>New bill</span></a></div>" +
      stale +
      '<div class="kpis kpis-4">' +
        kpi("Today's sales", rs(today.sales), change || plural(today.count, "bill", "bills") + " so far", { cls: "kpi-hero", href: "#reports" }) +
        kpi("Bills today", nf0.format(today.count), "Average " + rs(today.avg)) +
        kpi("Profit today", rs(today.profit), today.sales ? "Estimate, " + ((today.profit / today.sales) * 100).toFixed(1) + "% of sales" : "Estimate") +
        kpi("Udhaar to collect", rs(dueTotal), "from " + plural(dueList.length, "customer", "customers"), { cls: "kpi-due", href: "#udhaar" }) +
      "</div>" +
      '<div class="grid grid-wide">' +
        '<section class="card" aria-labelledby="weekTitle"><div class="card-head"><h2 id="weekTitle">Sales, last 7 days</h2>' +
          '<p class="card-sub">' + rs(weekTotal) + " in 7 days · best day " + dayLabel(best) + " " + rs(best.sales) + "</p></div>" +
          barChart(points, { label: "Sales in the last 7 days. Today " + rs(today.sales) + ". Total " + rs(weekTotal) + ".", height: 210 }) +
          numbersTable(week.map((d) => [d.isToday ? "Today" : fmtLong(d.ts), nf0.format(d.count), rs(d.sales)]), ["Day", "Bills", "Sales"]) +
        "</section>" +
        '<section class="card" aria-labelledby="payTitle"><div class="card-head"><h2 id="payTitle">How customers paid today</h2>' +
          '<p class="card-sub">Cash in the drawer: ' + rs(today.modes.cash) + "</p></div>" +
          splitBar(today.modes, "Today's payments") +
        "</section>" +
      "</div>" +
      '<div class="grid grid-2">' +
        '<section class="card" aria-labelledby="lowTitle"><div class="card-head"><h2 id="lowTitle">Low stock</h2>' +
          '<a class="card-link" href="#stock">All stock</a></div>' +
          (low.length ? '<ul class="rows">' + lowRows + "</ul>" + (low.length > 6 ? '<p class="hint">' + (low.length - 6) + ' more on the Stock page.</p>' : "")
            : '<p class="empty">' + icon("check") + "Every item has enough stock.</p>") +
        "</section>" +
        '<section class="card" aria-labelledby="recentTitle"><div class="card-head"><h2 id="recentTitle">Latest bills</h2>' +
          '<a class="card-link" href="#reports">Reports</a></div>' +
          '<ul class="rows">' + db.bills.slice(-6).reverse().map(billRow).join("") + "</ul>" +
        "</section>" +
      "</div>" +
      '<p class="page-foot">This is sample data. <button type="button" class="link-btn" data-act="reset">Reset demo data</button></p>';
  };

  // ---------------------------------------------------------------------
  // 8. Billing (point of sale)
  // ---------------------------------------------------------------------
  let pickCat = "All";
  let pickQuery = "";

  const viewBill = () => {
    const cats = ["All"].concat(Array.from(new Set(db.items.map((i) => i.cat))));
    return '<div class="view-head"><div><p class="eyebrow">Bill no. ' + (db.seq.bill + 1) + " · " + fmtDate(Date.now()) + "</p><h1>New bill</h1></div>" +
      '<p class="head-note">Prices include GST</p></div>' +
      '<div class="pos">' +
        '<section class="card pos-pick" aria-labelledby="pickTitle">' +
          '<h2 id="pickTitle" class="card-title">Add items</h2>' +
          '<div class="search">' + icon("search") + '<label for="pickSearch" class="sr-only">Search items</label>' +
            '<input id="pickSearch" type="search" placeholder="Search: atta, milk, soap" autocomplete="off" enterkeyhint="done" value="' + esc(pickQuery) + '"></div>' +
          '<div class="chips" role="group" aria-label="Item group">' + cats.map((c) =>
            '<button type="button" class="chip" data-act="cat" data-id="' + esc(c) + '" aria-pressed="' + (c === pickCat) + '">' + esc(c) + "</button>").join("") + "</div>" +
          '<div class="picks" id="picks"></div>' +
          '<p class="hint only-wide">Type a name and press Enter to add the first match.</p>' +
        "</section>" +
        '<section class="card pos-cart" id="checkout" aria-labelledby="cartTitle"><div id="cart"></div></section>' +
      "</div>";
  };

  const pickHtml = (it) => {
    const line = draft.lines.find((l) => l.id === it.id);
    const state = stockState(it);
    return '<button type="button" class="pick' + (line ? " in-cart" : "") + '" data-act="add" data-id="' + it.id + '"' + (state === "out" ? " disabled" : "") + ">" +
      '<span class="pick-name">' + esc(it.name) + "</span>" +
      '<span class="pick-foot"><span class="pick-price">' + rs(it.sell) + "</span>" +
      '<span class="pick-stock' + (state !== "ok" ? " is-low" : "") + '">' + (state === "out" ? "Out of stock" : it.stock + " left") + "</span></span>" +
      '<span class="pick-badge"' + (line ? "" : " hidden") + '><span class="sr-only">In bill: </span><span data-badge>' + (line ? line.q : 0) + "</span></span>" +
      "</button>";
  };

  const matchingItems = () => {
    const q = pickQuery.trim().toLowerCase();
    const sold = index().sold;
    const list = db.items.filter((i) => (pickCat === "All" || i.cat === pickCat) &&
      (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)));
    const starts = (i) => (q && i.name.toLowerCase().startsWith(q) ? 0 : 1);
    return list.sort((a, b) => starts(a) - starts(b) || (sold[b.id] || 0) - (sold[a.id] || 0));
  };

  const renderPicks = () => {
    const box = $("#picks");
    if (!box) { return; }
    const list = matchingItems();
    const limit = pickCat === "All" && !pickQuery.trim() ? 12 : 60;
    const shown = list.slice(0, limit);
    if (!shown.length) {
      box.innerHTML = '<p class="empty">No item matches "' + esc(pickQuery) + '". <button type="button" class="link-btn" data-act="item-new-search">Add it to stock</button></p>';
      return;
    }
    box.innerHTML = shown.map(pickHtml).join("") +
      (list.length > shown.length ? '<p class="hint picks-more">Showing the ' + shown.length + " best sellers. Search or pick a group to see all " + list.length + " items.</p>" : "");
  };

  const syncPick = (id) => {
    const button = $('.pick[data-id="' + id + '"]');
    if (!button) { return; }
    const line = draft.lines.find((l) => l.id === id);
    button.classList.toggle("in-cart", Boolean(line));
    const badge = $(".pick-badge", button);
    badge.hidden = !line;
    $("[data-badge]", button).textContent = line ? String(line.q) : "0";
    badge.classList.remove("bump");
    void badge.offsetWidth; // restart the small bump animation
    badge.classList.add("bump");
  };

  const draftBill = () => ({
    lines: draft.lines.map((l) => {
      const it = itemById(l.id);
      return it ? { id: it.id, n: it.name, q: l.q, p: it.sell, b: it.buy, g: l.g } : null;
    }).filter(Boolean),
    d: Math.max(0, Math.floor(Number(draft.disc) || 0)),
    m: draft.mode
  });

  const lineHtml = (l) => {
    const it = itemById(l.id);
    const name = esc(it.name);
    return '<li class="line">' +
      '<div class="line-info"><span class="line-name">' + name + "</span>" +
        '<span class="line-sub">' + rs(it.sell) + " each · GST " +
        '<select class="gst-select" data-gst="' + it.id + '" aria-label="GST rate for ' + name + '">' +
        GST_RATES.map((r) => '<option value="' + r + '"' + (r === l.g ? " selected" : "") + ">" + r + "%</option>").join("") + "</select></span></div>" +
      '<button type="button" class="icon-btn icon-btn-sm line-x" data-act="remove" data-id="' + it.id + '" aria-label="Remove ' + name + '">' + icon("x") + "</button>" +
      '<div class="qty"><button type="button" class="qty-btn" data-act="qty-down" data-id="' + it.id + '" aria-label="One less ' + name + '">' + icon("minus") + "</button>" +
        '<input class="qty-in" data-qty="' + it.id + '" type="number" min="1" max="' + it.stock + '" step="1" inputmode="numeric" value="' + l.q + '" aria-label="Quantity of ' + name + '">' +
        '<button type="button" class="qty-btn" data-act="qty-up" data-id="' + it.id + '" aria-label="One more ' + name + '">' + icon("plus") + "</button></div>" +
      '<span class="line-amt" data-amt="' + it.id + '">' + rs(l.q * it.sell) + "</span>" +
      "</li>";
  };

  const renderCart = () => {
    const box = $("#cart");
    if (!box) { return; }
    draft.lines = draft.lines.filter((l) => itemById(l.id));
    if (!draft.lines.length) {
      box.innerHTML = '<div class="card-head"><h2 id="cartTitle">Current bill</h2></div>' +
        '<div class="cart-empty">' + icon("bill") + "<p>Tap an item to add it to the bill.</p></div>";
      updatePosBar();
      return;
    }
    const customers = db.customers.slice().sort((a, b) => a.name.localeCompare(b.name));
    box.innerHTML = '<div class="card-head"><h2 id="cartTitle">Current bill</h2><button type="button" class="link-btn" data-act="cart-clear">Clear bill</button></div>' +
      '<ul class="lines">' + draft.lines.map(lineHtml).join("") + "</ul>" +
      '<div class="cart-form">' +
        '<div class="field-row">' +
          '<div class="field"><label for="billCust">Customer</label><select id="billCust"><option value="">Walk-in customer</option>' +
            customers.map((c) => '<option value="' + c.id + '"' + (draft.cust === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>").join("") +
            '<option value="new"' + (draft.cust === "new" ? " selected" : "") + ">+ New customer</option></select></div>" +
          '<div class="field field-sm"><label for="billDisc">Discount (₹)</label><input id="billDisc" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="' + esc(draft.disc) + '"></div>' +
        "</div>" +
        '<div class="field-row" id="newCust"' + (draft.cust === "new" ? "" : " hidden") + ">" +
          '<div class="field"><label for="newName">Customer name</label><input id="newName" autocomplete="off" value="' + esc(draft.newName) + '"></div>' +
          '<div class="field"><label for="newPhone">Phone, for bills on WhatsApp</label><input id="newPhone" type="tel" inputmode="numeric" autocomplete="off" placeholder="10 digits" value="' + esc(draft.newPhone) + '"></div>' +
        "</div>" +
        '<fieldset class="seg-field"><legend>Payment</legend><div class="seg">' + MODES.map((m) =>
          '<label class="seg-opt"><input type="radio" name="payMode" value="' + m.key + '"' + (draft.mode === m.key ? " checked" : "") + "><span>" + m.label + "</span></label>").join("") +
        "</div></fieldset>" +
        '<div id="modeExtra"></div>' +
      "</div>" +
      '<dl class="totals" id="totals"></dl>' +
      '<button type="button" class="btn btn-primary btn-lg btn-block" data-act="save-bill" id="saveBill">Save bill</button>';
    renderModeExtra();
    updateTotals();
  };

  const renderModeExtra = () => {
    const box = $("#modeExtra");
    if (!box) { return; }
    box.innerHTML = draft.mode === "cash"
      ? '<div class="field-row field-row-end"><div class="field"><label for="billCash">Cash received (₹)</label><input id="billCash" type="number" min="0" step="1" inputmode="numeric" placeholder="Optional" value="' + esc(draft.cash) + '"></div>' +
        '<p class="change" id="changeText" aria-live="polite"></p></div>'
      : '<p class="mode-note" id="modeNote" aria-live="polite"></p>';
  };

  const updateTotals = () => {
    const box = $("#totals");
    if (!box) { updatePosBar(); return; }
    const t = billTotals(draftBill());
    box.innerHTML =
      "<div><dt>Items</dt><dd>" + t.qty + "</dd></div>" +
      "<div><dt>Subtotal</dt><dd>" + rs(t.sub) + "</dd></div>" +
      (t.disc ? "<div><dt>Discount</dt><dd>−" + rs(t.disc) + "</dd></div>" : "") +
      '<div class="is-quiet"><dt>Taxable value</dt><dd>' + rs2(t.taxable) + "</dd></div>" +
      '<div class="is-quiet"><dt>GST included <span class="nowrap">(CGST + SGST)</span></dt><dd>' + rs2(t.gst) + "</dd></div>" +
      '<div class="grand"><dt>Total</dt><dd>' + rs(t.total) + "</dd></div>";
    $("#saveBill").innerHTML = icon("check") + "<span>Save bill · " + rs(t.total) + "</span>";
    const change = $("#changeText");
    if (change) {
      const cash = Math.floor(Number(draft.cash) || 0);
      change.textContent = !cash ? "" : cash >= t.total ? "Give back " + rs(cash - t.total) : rs(t.total - cash) + " still to pay";
      change.classList.toggle("is-short", cash > 0 && cash < t.total);
    }
    const note = $("#modeNote");
    if (note) {
      if (draft.mode === "udhaar") {
        const c = draft.cust && draft.cust !== "new" ? customerById(draft.cust) : null;
        const due = c ? Math.max(0, balances().bal[c.id] || 0) : 0;
        note.textContent = c ? "Goes in " + firstName(c.name) + "'s khata. Udhaar now " + rs(due) + ", after this bill " + rs(due + t.total) + "."
          : draft.cust === "new" ? "The new customer gets a khata with this bill in it." : "Pick the customer above. This bill goes in their khata.";
      } else {
        note.textContent = draft.mode === "upi" ? "Customer scans your shop QR. Wait for the payment sound, then save."
          : "Swipe or tap the card on your card machine, then save.";
      }
    }
    updatePosBar(t);
  };

  let checkoutInView = false;
  let checkoutObserver = null;
  const updatePosBar = (t) => {
    const bar = $("#posBar");
    const show = current === "bill" && draft.lines.length > 0 && !checkoutInView;
    bar.hidden = !show;
    document.documentElement.classList.toggle("has-posbar", current === "bill" && draft.lines.length > 0);
    if (show) {
      const totals = t || billTotals(draftBill());
      $("#posBarTotal").textContent = rs(totals.total);
      $("#posBarCount").textContent = plural(totals.qty, "item", "items");
    }
  };

  const afterBill = () => {
    renderPicks();
    renderCart();
    if (checkoutObserver) { checkoutObserver.disconnect(); }
    checkoutInView = false;
    if ("IntersectionObserver" in window) {
      checkoutObserver = new IntersectionObserver((entries) => {
        checkoutInView = entries[0].isIntersecting;
        updatePosBar();
      }, { rootMargin: "0px 0px -40% 0px" });
      checkoutObserver.observe($("#checkout"));
    }
  };

  const addItem = (id) => {
    const it = itemById(id);
    if (!it) { return; }
    const line = draft.lines.find((l) => l.id === id);
    const want = (line ? line.q : 0) + 1;
    if (want > it.stock) {
      toast(it.stock <= 0 ? it.name + " is out of stock." : "Only " + qtyText(it.stock, it.unit) + " of " + it.name + " in stock.");
      return;
    }
    if (line) {
      line.q = want;
      const input = $('[data-qty="' + id + '"]');
      if (input) { input.value = String(want); }
      const amt = $('[data-amt="' + id + '"]');
      if (amt) { amt.textContent = rs(want * it.sell); }
      saveDraft();
      updateTotals();
    } else {
      draft.lines.push({ id: id, q: 1, g: it.gst });
      saveDraft();
      renderCart();
    }
    syncPick(id);
  };

  const setQty = (id, q, typing) => {
    const it = itemById(id);
    const line = draft.lines.find((l) => l.id === id);
    if (!it || !line) { return; }
    if (it.stock <= 0) { toast(it.name + " is out of stock."); removeLine(id); return; }
    let qty = Math.max(1, Math.floor(q) || 1);
    if (qty > it.stock) {
      qty = it.stock;
      toast("Only " + qtyText(it.stock, it.unit) + " of " + it.name + " in stock.");
    }
    line.q = qty;
    const input = $('[data-qty="' + id + '"]');
    if (input && (!typing || Number(input.value) !== qty)) { input.value = String(qty); }
    $('[data-amt="' + id + '"]').textContent = rs(qty * it.sell);
    saveDraft();
    updateTotals();
    syncPick(id);
  };

  const removeLine = (id) => {
    draft.lines = draft.lines.filter((l) => l.id !== id);
    saveDraft();
    renderCart();
    syncPick(id);
  };

  // One place that checks and makes a customer, for the bill and the Add customer form.
  const makeCustomer = (rawName, rawPhone) => {
    const name = clean(rawName, 50);
    if (!name) { return { error: "Write the customer's name.", field: "name" }; }
    let phone = String(rawPhone || "").replace(/\D/g, "");
    if (phone.length === 12 && phone.startsWith("91")) { phone = phone.slice(2); }
    if (phone && phone.length !== 10) { return { error: "Phone number should have 10 digits.", field: "phone" }; }
    const customer = { id: uid("c"), name: name, phone: phone ? phone.slice(0, 5) + " " + phone.slice(5) : "" };
    db.customers.push(customer);
    return { customer: customer };
  };

  const saveBill = () => {
    const bill = draftBill();
    if (!bill.lines.length) { toast("Add at least one item."); return; }
    for (const l of bill.lines) {
      const it = itemById(l.id);
      if (l.q < 1 || l.q > it.stock) {
        toast(it.stock <= 0 ? it.name + " is out of stock. Remove it from the bill." : "Only " + qtyText(it.stock, it.unit) + " of " + it.name + " in stock.");
        return;
      }
    }
    let customer = null;
    if (draft.cust === "new") {
      const made = makeCustomer(draft.newName, draft.newPhone);
      if (made.error) { toast(made.error); $(made.field === "name" ? "#newName" : "#newPhone").focus(); return; }
      customer = made.customer;
    } else if (draft.cust) {
      customer = customerById(draft.cust) || null;
    }
    if (bill.m === "udhaar" && !customer) {
      toast("Udhaar needs a customer. Pick one, or add a new customer.");
      $("#billCust").focus();
      return;
    }
    const totals = billTotals(bill);
    db.seq.bill += 1;
    const saved = { id: uid("b"), no: db.seq.bill, t: Date.now(), c: customer ? customer.id : null, cn: customer ? customer.name : "",
      m: bill.m, d: Math.min(bill.d, totals.sub), lines: bill.lines };
    const nowLow = [];
    saved.lines.forEach((l) => {
      const it = itemById(l.id);
      const wasOk = stockState(it) === "ok";
      it.stock -= l.q;
      if (wasOk && stockState(it) !== "ok") { nowLow.push(it.name + " (" + it.stock + " left)"); }
    });
    if (saved.m === "udhaar") {
      db.ledger.push({ id: uid("l"), c: customer.id, t: saved.t, type: "credit", amt: billTotals(saved).total, bill: saved.no });
    }
    db.bills.push(saved);
    save();
    draft = emptyDraft();
    saveDraft();
    pickQuery = "";
    render();
    openInvoice(saved, true);
    toast("Bill " + saved.no + " saved. Stock updated." + (nowLow.length ? " Now low: " + nowLow.join(", ") + "." : ""));
  };

  // ---------------------------------------------------------------------
  // 9. The GST bill: on screen, printed, and as WhatsApp text
  // ---------------------------------------------------------------------
  const invoiceHtml = (bill) => {
    const t = billTotals(bill);
    const s = db.shop;
    const customer = bill.c ? customerById(bill.c) : null;
    const rates = Object.keys(t.rates).map(Number).sort((a, b) => a - b);
    return '<article class="inv" aria-label="Bill ' + bill.no + '">' +
      '<header class="inv-head"><div class="inv-shop"><p class="inv-name">' + esc(s.name) + "</p>" +
        "<p>" + esc([s.address, s.area, s.city].filter(Boolean).join(", ")) + "</p>" +
        "<p>" + (s.phone ? "Phone " + esc(s.phone) : "") + (s.gstin ? (s.phone ? " · " : "") + "GSTIN " + esc(s.gstin) : "") + "</p></div>" +
        '<div class="inv-meta"><p class="inv-kind">Tax invoice</p><p>Bill no. <strong>' + bill.no + "</strong></p><p>" + fmtDate(bill.t) + ", " + fmtTime(bill.t) + "</p></div></header>" +
      '<p class="inv-to"><span>Bill to</span> <strong>' + esc(bill.cn || "Walk-in customer") + "</strong>" + (customer && customer.phone ? " · " + esc(customer.phone) : "") + "</p>" +
      '<div class="table-wrap"><table class="inv-table"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Rate</th><th scope="col" class="num">GST</th><th scope="col" class="num">Amount</th></tr></thead><tbody>' +
        bill.lines.map((l) => "<tr><td>" + esc(l.n) + '</td><td class="num">' + l.q + '</td><td class="num">' + rs2(l.p) + '</td><td class="num">' + l.g + '%</td><td class="num">' + rs2(l.q * l.p) + "</td></tr>").join("") +
      "</tbody></table></div>" +
      '<dl class="inv-sum">' +
        "<div><dt>Subtotal</dt><dd>" + rs2(t.sub) + "</dd></div>" +
        (t.disc ? "<div><dt>Discount</dt><dd>−" + rs2(t.disc) + "</dd></div>" : "") +
        "<div><dt>Taxable value</dt><dd>" + rs2(t.taxable) + "</dd></div>" +
        "<div><dt>CGST</dt><dd>" + rs2(halves(t.gst)[0]) + "</dd></div>" +
        "<div><dt>SGST</dt><dd>" + rs2(halves(t.gst)[1]) + "</dd></div>" +
        '<div class="inv-total"><dt>Total</dt><dd>' + rs2(t.total) + "</dd></div>" +
      "</dl>" +
      '<p class="inv-words">' + words(t.total) + "</p>" +
      '<div class="table-wrap"><table class="inv-gst"><caption>GST summary</caption><thead><tr><th scope="col">Rate</th><th scope="col" class="num">Taxable value</th><th scope="col" class="num">CGST</th><th scope="col" class="num">SGST</th></tr></thead><tbody>' +
        rates.map((r) => "<tr><td>" + r + '%</td><td class="num">' + rs2(t.rates[r].taxable) + '</td><td class="num">' + rs2(halves(t.rates[r].gst)[0]) + '</td><td class="num">' + rs2(halves(t.rates[r].gst)[1]) + "</td></tr>").join("") +
      "</tbody></table></div>" +
      '<p class="inv-foot">Paid by ' + modeOf(bill.m).label + (bill.m === "udhaar" ? " (added to the customer's khata)" : "") + ". Prices include GST.</p>" +
      '<p class="inv-thanks">Thank you. Please visit again.</p>' +
      "</article>";
  };

  const billText = (bill) => {
    const t = billTotals(bill);
    const lines = bill.lines.map((l) => l.n + "  " + l.q + " x " + rs(l.p) + " = " + rs(l.q * l.p));
    return ["*" + db.shop.name + "*", place(), "Bill no. " + bill.no + " | " + fmtDate(bill.t) + ", " + fmtTime(bill.t), ""]
      .concat(lines)
      .concat(["", t.disc ? "Discount: -" + rs(t.disc) : "", "*Total: " + rs(t.total) + "*",
        "Paid by " + modeOf(bill.m).label + ". GST included: " + rs2(t.gst) + ".", "", "Thank you for shopping with us. Please visit again."])
      .filter((line, i, all) => line !== "" || all[i - 1] !== "")
      .join("\n");
  };

  const openInvoice = (bill, fresh) => {
    const customer = bill.c ? customerById(bill.c) : null;
    openModal("Bill " + bill.no, invoiceHtml(bill) +
      '<div class="modal-actions modal-actions-bill">' +
        '<button type="button" class="btn btn-soft" data-act="print" data-id="' + bill.id + '">' + icon("print") + "<span>Print</span></button>" +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(waLink(billText(bill), customer ? waNumber(customer.phone) : "")) + '">' + icon("wa") + "<span>Send on WhatsApp</span></a>" +
        (fresh ? '<button type="button" class="btn btn-primary" data-act="close">' + icon("plus") + "<span>Next bill</span></button>" : "") +
      "</div>", "wide");
  };

  const printBill = (bill) => {
    $("#printArea").innerHTML = invoiceHtml(bill);
    window.print();
  };
  window.addEventListener("afterprint", () => { $("#printArea").innerHTML = ""; });

  // ---------------------------------------------------------------------
  // 10. Stock
  // ---------------------------------------------------------------------
  let stockFilter = "all";
  let stockQuery = "";

  const viewStock = () => {
    const value = db.items.reduce((sum, i) => sum + Math.max(0, i.stock) * i.buy, 0);
    const lowCount = db.items.filter((i) => stockState(i) === "low").length;
    const outCount = db.items.filter((i) => stockState(i) === "out").length;
    const ins = db.stockIns.slice().sort((a, b) => b.t - a.t).slice(0, 8);
    const chip = (key, label, n) => '<button type="button" class="chip" data-act="stock-filter" data-id="' + key + '" aria-pressed="' + (stockFilter === key) + '">' +
      label + ' <span class="chip-n">' + n + "</span></button>";
    return '<div class="view-head"><div><p class="eyebrow">' + db.items.length + " items · worth " + rs(value) + " at buy price</p><h1>Stock</h1></div>" +
      '<div class="head-actions"><button type="button" class="btn btn-soft" data-act="stockin">' + icon("in") + "<span>Stock in</span></button>" +
      '<button type="button" class="btn btn-primary" data-act="item-new">' + icon("plus") + "<span>Add item</span></button></div></div>" +
      '<div class="toolbar"><div class="search">' + icon("search") + '<label for="stockSearch" class="sr-only">Search stock</label>' +
        '<input id="stockSearch" type="search" placeholder="Search items" autocomplete="off" value="' + esc(stockQuery) + '"></div>' +
        '<div class="chips" role="group" aria-label="Show">' + chip("all", "All", db.items.length) + chip("low", "Low", lowCount) + chip("out", "Out of stock", outCount) + "</div></div>" +
      '<section class="card card-flush" aria-label="Items"><div id="stockList"></div></section>' +
      '<section class="card" aria-labelledby="inTitle"><div class="card-head"><h2 id="inTitle">Stock in, recent</h2></div>' +
        (ins.length ? '<ul class="rows">' + ins.map((s) => '<li class="row"><span class="row-main"><span class="row-title">' + esc(s.name) + "</span>" +
          '<span class="row-sub">' + fmtShort(s.t) + (s.from ? " · " + esc(s.from) : "") + "</span></span>" +
          '<span class="row-in">+' + s.q + '</span><span class="row-amt">' + rs(s.q * s.buy) + "</span></li>").join("") + "</ul>"
          : '<p class="empty">No stock received yet.</p>') +
      "</section>";
  };

  const stockBadge = (it) => {
    const state = stockState(it);
    return '<span class="stock-badge is-' + state + '">' + (state === "out" ? "Out of stock" : esc(qtyText(it.stock, it.unit)) + (state === "low" ? " · Low" : "")) + "</span>";
  };

  const renderStockList = () => {
    const box = $("#stockList");
    if (!box) { return; }
    const q = stockQuery.trim().toLowerCase();
    const list = db.items.filter((i) => (stockFilter === "all" || stockState(i) === stockFilter) &&
      (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)))
      .sort((a, b) => (stockFilter === "all" ? a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name) : a.stock - b.stock));
    if (!list.length) {
      box.innerHTML = '<p class="empty empty-pad">No items here.' + (q ? ' <button type="button" class="link-btn" data-act="item-new-stock">Add "' + esc(stockQuery) + '" as a new item</button>' : "") + "</p>";
      return;
    }
    const table = '<div class="table-wrap only-wide"><table class="table"><thead><tr><th scope="col">Item</th><th scope="col">In stock</th>' +
      '<th scope="col" class="num">Buy</th><th scope="col" class="num">Sell</th><th scope="col" class="num">Margin</th><th scope="col" class="num">GST</th>' +
      '<th scope="col" class="num">Reorder at</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
      list.map((it) => "<tr><td><span class=\"cell-title\">" + esc(it.name) + '</span><span class="cell-sub">' + esc(it.cat) + "</span></td>" +
        "<td>" + stockBadge(it) + '</td><td class="num">' + rs(it.buy) + '</td><td class="num">' + rs(it.sell) + "</td>" +
        '<td class="num">' + (it.sell ? Math.round(((it.sell - it.buy) / it.sell) * 100) : 0) + '%</td><td class="num">' + it.gst + '%</td><td class="num">' + it.low + "</td>" +
        '<td class="cell-actions"><button type="button" class="btn btn-xs btn-soft" data-act="stockin" data-id="' + it.id + '">' + icon("in") + "<span>Stock in</span></button>" +
        '<button type="button" class="icon-btn icon-btn-sm" data-act="item-edit" data-id="' + it.id + '" aria-label="Edit ' + esc(it.name) + '">' + icon("edit") + "</button></td></tr>").join("") +
      "</tbody></table></div>";
    const cards = '<ul class="scards only-narrow">' + list.map((it) => '<li class="scard">' +
      '<button type="button" class="scard-main" data-act="item-edit" data-id="' + it.id + '"><span class="scard-name">' + esc(it.name) + "</span>" +
      '<span class="scard-sub">Buy ' + rs(it.buy) + " · Sell " + rs(it.sell) + " · GST " + it.gst + "%</span></button>" +
      stockBadge(it) +
      '<button type="button" class="icon-btn icon-btn-sm" data-act="stockin" data-id="' + it.id + '" aria-label="Stock in ' + esc(it.name) + '">' + icon("in") + "</button></li>").join("") + "</ul>";
    box.innerHTML = table + cards;
  };

  const openItemForm = (id, presetName) => {
    const it = id ? itemById(id) : { name: presetName || "", cat: "", unit: "pc", buy: "", sell: "", gst: 5, stock: "", low: 5 };
    const cats = Array.from(new Set(db.items.map((i) => i.cat)));
    openModal(id ? "Edit item" : "Add item",
      '<form class="form" data-form="item" data-id="' + (id || "") + '" novalidate>' +
        '<div class="field"><label for="fName">Item name</label><input id="fName" name="name" required autocomplete="off" value="' + esc(it.name) + '"></div>' +
        '<div class="field-row"><div class="field"><label for="fCat">Group</label><input id="fCat" name="cat" list="catList" autocomplete="off" value="' + esc(it.cat) + '">' +
          '<datalist id="catList">' + cats.map((c) => '<option value="' + esc(c) + '">').join("") + "</datalist></div>" +
          '<div class="field field-sm"><label for="fUnit">Unit</label><select id="fUnit" name="unit">' +
          UNITS.map((u) => '<option value="' + u + '"' + (u === it.unit ? " selected" : "") + ">" + u + "</option>").join("") + "</select></div></div>" +
        '<div class="field-row field-row-3"><div class="field"><label for="fBuy">Buy price (₹)</label><input id="fBuy" name="buy" type="number" min="0" step="0.5" inputmode="decimal" value="' + esc(it.buy) + '"></div>' +
          '<div class="field"><label for="fSell">Sell price (₹)</label><input id="fSell" name="sell" type="number" min="0" step="0.5" inputmode="decimal" value="' + esc(it.sell) + '"></div>' +
          '<div class="field"><label for="fGst">GST</label><select id="fGst" name="gst">' +
          GST_RATES.map((r) => '<option value="' + r + '"' + (r === it.gst ? " selected" : "") + ">" + r + "%</option>").join("") + "</select></div></div>" +
        '<div class="field-row"><div class="field"><label for="fStock">' + (id ? "In stock now" : "Opening stock") + '</label><input id="fStock" name="stock" type="number" min="0" step="1" inputmode="numeric" value="' + esc(it.stock) + '"></div>' +
          '<div class="field"><label for="fLow">Low-stock alert at</label><input id="fLow" name="low" type="number" min="0" step="1" inputmode="numeric" value="' + esc(it.low) + '"></div></div>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-soft" data-act="close">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + icon("check") + "<span>" + (id ? "Save changes" : "Add item") + "</span></button></div>" +
      "</form>");
  };

  const suggestQty = (it) => {
    const want = Math.max(it.low * 3 - it.stock, it.low, 1);
    return it.sell < 60 ? Math.ceil(want / 12) * 12 : Math.ceil(want / 6) * 6;
  };

  const openStockIn = (id) => {
    const items = db.items.slice().sort((a, b) => a.name.localeCompare(b.name));
    const it = id ? itemById(id) : null;
    openModal("Stock in",
      '<form class="form" data-form="stockin" novalidate>' +
        '<div class="field"><label for="siItem">Item</label><select id="siItem" name="item"><option value="">Choose an item</option>' +
          items.map((i) => '<option value="' + i.id + '"' + (i.id === id ? " selected" : "") + ">" + esc(i.name) + " (" + i.stock + " in stock)</option>").join("") + "</select></div>" +
        '<div class="field-row"><div class="field"><label for="siQty">Quantity received</label><input id="siQty" name="qty" type="number" min="1" step="1" inputmode="numeric" value="' + (it ? suggestQty(it) : "") + '"></div>' +
          '<div class="field"><label for="siBuy">Buy price each (₹)</label><input id="siBuy" name="buy" type="number" min="0" step="0.5" inputmode="decimal" value="' + (it ? it.buy : "") + '"></div></div>' +
        '<div class="field"><label for="siFrom">Supplier</label><input id="siFrom" name="from" autocomplete="off" value="' + esc(it ? it.supplier || "" : "") + '"></div>' +
        '<p class="form-note" id="siNote" aria-live="polite"></p>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-soft" data-act="close">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + icon("in") + "<span>Add to stock</span></button></div>" +
      "</form>");
    updateStockInNote();
  };

  const updateStockInNote = () => {
    const note = $("#siNote");
    if (!note) { return; }
    const it = itemById($("#siItem").value);
    const qty = Math.floor(Number($("#siQty").value) || 0);
    const buy = Number($("#siBuy").value) || 0;
    note.textContent = it && qty > 0 ? "Stock after this: " + qtyText(it.stock + qty, it.unit) + ". Supplier bill: " + rs(qty * buy) + "." : "";
  };

  // ---------------------------------------------------------------------
  // 11. Customers and udhaar
  // ---------------------------------------------------------------------
  let custQuery = "";
  let custFilter = "due";

  const viewUdhaar = () => {
    const b = balances();
    const due = Object.keys(b.bal).filter((id) => b.bal[id] > 0);
    const dueTotal = due.reduce((sum, id) => sum + b.bal[id], 0);
    const ym = dayKey(Date.now()).slice(0, 7);
    const month = db.ledger.filter((e) => dayKey(e.t).startsWith(ym));
    const got = month.filter((e) => e.type === "payment");
    const given = month.filter((e) => e.type === "credit" && !e.opening);
    const chip = (key, label) => '<button type="button" class="chip" data-act="cust-filter" data-id="' + key + '" aria-pressed="' + (custFilter === key) + '">' + label + "</button>";
    return '<div class="view-head"><div><p class="eyebrow">Udhaar khata</p><h1>Customers</h1></div>' +
      '<button type="button" class="btn btn-primary" data-act="cust-new">' + icon("plus") + "<span>Add customer</span></button></div>" +
      '<div class="kpis kpis-3">' +
        kpi("Udhaar to collect", rs(dueTotal), "from " + plural(due.length, "customer", "customers"), { cls: "kpi-hero" }) +
        kpi("Received this month", rs(got.reduce((s, e) => s + e.amt, 0)), plural(got.length, "payment", "payments")) +
        kpi("Given on udhaar this month", rs(given.reduce((s, e) => s + e.amt, 0)), plural(given.length, "entry", "entries")) +
      "</div>" +
      '<div class="toolbar"><div class="search">' + icon("search") + '<label for="custSearch" class="sr-only">Search customers</label>' +
        '<input id="custSearch" type="search" placeholder="Search by name or phone" autocomplete="off" value="' + esc(custQuery) + '"></div>' +
        '<div class="chips" role="group" aria-label="Show">' + chip("due", "With udhaar") + chip("all", "All customers") + "</div></div>" +
      '<ul class="card card-flush clist" id="custList" aria-label="Customers"></ul>';
  };

  const renderCustList = () => {
    const box = $("#custList");
    if (!box) { return; }
    const b = balances();
    const q = custQuery.trim().toLowerCase();
    const list = db.customers.filter((c) => (custFilter === "all" || (b.bal[c.id] || 0) > 0) &&
      (!q || c.name.toLowerCase().includes(q) || String(c.phone || "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))))
      .sort((x, y) => (custFilter === "due" ? (b.bal[y.id] || 0) - (b.bal[x.id] || 0) : x.name.localeCompare(y.name)));
    if (!list.length) { box.innerHTML = '<li class="empty empty-pad">No customers here.</li>'; return; }
    box.innerHTML = list.map((c) => {
      const bal = b.bal[c.id] || 0;
      const since = b.lastPay[c.id] || b.firstDue[c.id];
      const late = bal > 0 && since && daysSince(since) > 20;
      const sub = bal > 0
        ? (b.lastPay[c.id] ? "Last paid " + ago(b.lastPay[c.id]) : "No payment yet")
        : (c.phone || "No phone added");
      return '<li><button type="button" class="crow" data-act="cust-open" data-id="' + c.id + '">' +
        '<span class="avatar" aria-hidden="true">' + esc(initials(c.name)) + "</span>" +
        '<span class="crow-main"><span class="crow-name">' + esc(c.name) + "</span>" +
        '<span class="crow-sub' + (late ? " is-late" : "") + '">' + (late ? icon("alert") : "") + esc(sub) + "</span></span>" +
        '<span class="crow-bal ' + (bal > 0 ? "is-due" : "is-clear") + '">' + (bal > 0 ? rs(bal) : bal < 0 ? "Advance " + rs(-bal) : "No udhaar") + "</span>" +
        icon("right") + "</button></li>";
    }).join("");
  };

  const reminderText = (c, bal) => {
    const lastBill = db.ledger.filter((e) => e.c === c.id && e.type === "credit").pop();
    return "Namaste " + firstName(c.name) + " ji,\n" +
      db.shop.name + " se message hai. Aapke khate mein " + rs(bal) + " ka udhaar baaki hai" +
      (lastBill ? " (last entry " + fmtDate(lastBill.t) + ")" : "") + ".\n" +
      "Jab aapko time mile, please UPI ya cash se de dijiye.\n" +
      "Kuch galat lage toh bata dijiye, hum check kar lenge.\n" +
      "Dhanyavaad!";
  };

  const openCustomer = (id, mode) => {
    const c = customerById(id);
    if (!c) { return; }
    const b = balances();
    const bal = b.bal[id] || 0;
    let run = 0;
    const entries = db.ledger.filter((e) => e.c === id).map((e) => {
      run += e.type === "credit" ? e.amt : -e.amt;
      return { e: e, after: run };
    }).reverse();
    let form = "";
    if (mode === "pay") {
      form = '<form class="form inline-form" data-form="pay" data-id="' + id + '" novalidate><h3 class="form-title">Payment received</h3>' +
        '<div class="field-row field-row-end"><div class="field"><label for="payAmt">Amount (₹)</label><input id="payAmt" name="amt" type="number" min="1" step="1" inputmode="numeric" value="' + (bal > 0 ? bal : "") + '"></div>' +
        '<fieldset class="seg-field"><legend>Paid by</legend><div class="seg">' +
        '<label class="seg-opt"><input type="radio" name="mode" value="cash" checked><span>Cash</span></label>' +
        '<label class="seg-opt"><input type="radio" name="mode" value="upi"><span>UPI</span></label></div></fieldset></div>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-soft" data-act="cust-open" data-id="' + id + '">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + icon("check") + "<span>Save payment</span></button></div></form>";
    } else if (mode === "credit") {
      form = '<form class="form inline-form" data-form="credit" data-id="' + id + '" novalidate><h3 class="form-title">Add udhaar</h3>' +
        '<div class="field-row"><div class="field field-sm"><label for="crAmt">Amount (₹)</label><input id="crAmt" name="amt" type="number" min="1" step="1" inputmode="numeric"></div>' +
        '<div class="field"><label for="crNote">What for</label><input id="crNote" name="note" autocomplete="off" placeholder="Example: monthly ration"></div></div>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-soft" data-act="cust-open" data-id="' + id + '">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + icon("plus") + "<span>Add to khata</span></button></div></form>";
    }
    openModal(c.name,
      '<div class="cust-head"><span class="avatar avatar-lg" aria-hidden="true">' + esc(initials(c.name)) + "</span><div>" +
        '<p class="cust-phone">' + esc(c.phone || "No phone added") + "</p>" +
        '<p class="muted">' + (b.lastPay[id] ? "Last payment " + ago(b.lastPay[id]) + ", " + fmtDate(b.lastPay[id]) : "No payment yet") + "</p></div></div>" +
      '<div class="bal-box ' + (bal > 0 ? "is-due" : "is-clear") + '"><span>' + (bal < 0 ? "Advance paid" : "Udhaar balance") + "</span><strong>" + rs(Math.abs(bal)) + "</strong></div>" +
      (form ? form : '<div class="btn-grid">' +
        '<button type="button" class="btn btn-primary" data-act="cust-pay" data-id="' + id + '">' + icon("rupee") + "<span>Payment received</span></button>" +
        (bal > 0 ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(waLink(reminderText(c, bal), waNumber(c.phone))) + '">' + icon("wa") + "<span>Send reminder on WhatsApp</span></a>" : "") +
        '<button type="button" class="btn btn-soft" data-act="cust-credit" data-id="' + id + '">' + icon("plus") + "<span>Add udhaar</span></button></div>") +
      '<h3 class="sub-title">Khata</h3>' +
      (entries.length ? '<ul class="ledger">' + entries.slice(0, 20).map((x) => {
        const e = x.e;
        const what = e.type === "credit" ? (e.bill ? "Bill " + e.bill : esc(e.note || "Udhaar")) : "Payment received, " + modeOf(e.mode).label;
        return '<li class="led"><span class="led-main"><span class="led-what">' + what + '</span><span class="led-date">' + fmtDate(e.t) + "</span></span>" +
          '<span class="led-right"><span class="led-amt is-' + e.type + '">' + (e.type === "credit" ? "+" : "−") + rs(e.amt) + "</span>" +
          '<span class="led-bal">Balance ' + rs(x.after) + "</span></span></li>";
      }).join("") + "</ul>" + (entries.length > 20 ? '<p class="hint">Showing the latest 20 of ' + entries.length + " entries.</p>" : "")
        : '<p class="empty">No entries yet.</p>'));
    if (mode) {
      const first = $(mode === "pay" ? "#payAmt" : "#crAmt");
      if (first) { first.focus(); first.select && first.select(); }
    }
  };

  const openNewCustomer = () => {
    openModal("Add customer",
      '<form class="form" data-form="customer" novalidate>' +
        '<div class="field"><label for="ncName">Name</label><input id="ncName" name="name" autocomplete="off" required></div>' +
        '<div class="field"><label for="ncPhone">Phone</label><input id="ncPhone" name="phone" type="tel" inputmode="numeric" autocomplete="off" placeholder="10 digits"></div>' +
        '<div class="field"><label for="ncOpen">Old udhaar, if any (₹)</label><input id="ncOpen" name="open" type="number" min="0" step="1" inputmode="numeric" placeholder="0"></div>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="button" class="btn btn-soft" data-act="close">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + icon("plus") + "<span>Add customer</span></button></div>" +
      "</form>");
  };

  // ---------------------------------------------------------------------
  // 12. Staff attendance
  // ---------------------------------------------------------------------
  let attMonth = "";

  const monthSummary = (ym) => {
    const rows = db.staff.map((s) => ({ s: s, P: 0, H: 0, A: 0 }));
    let days = 0;
    Object.keys(db.attendance).filter((k) => k.startsWith(ym)).forEach((k) => {
      const marks = db.attendance[k];
      if (Object.keys(marks).length) { days += 1; }
      rows.forEach((r) => { const m = marks[r.s.id]; if (m) { r[m] += 1; } });
    });
    const dim = daysInMonth(ym);
    rows.forEach((r) => { r.pay = (r.s.salary / dim) * (r.P + r.H / 2); });
    return { rows: rows, days: days, dim: dim };
  };

  const viewStaff = () => {
    const now = Date.now();
    const marks = db.attendance[dayKey(now)] || {};
    const count = { P: 0, H: 0, A: 0 };
    db.staff.forEach((s) => { if (marks[s.id]) { count[marks[s.id]] += 1; } });
    const notMarked = db.staff.length - count.P - count.H - count.A;
    const months = Array.from(new Set(Object.keys(db.attendance).map((k) => k.slice(0, 7)))).sort().reverse();
    const ym = attMonth && months.indexOf(attMonth) !== -1 ? attMonth : months[0] || dayKey(now).slice(0, 7);
    const sum = monthSummary(ym);
    const totalPay = sum.rows.reduce((s, r) => s + r.pay, 0);
    return '<div class="view-head"><div><p class="eyebrow">' + fmtLong(now) + "</p><h1>Staff attendance</h1></div>" +
      (notMarked ? '<button type="button" class="btn btn-soft" data-act="att-all">' + icon("check") + "<span>Mark the rest present</span></button>" : "") + "</div>" +
      '<div class="att-counts" aria-live="polite">' +
        '<span class="att-count is-P"><strong>' + count.P + "</strong> Present</span>" +
        '<span class="att-count is-H"><strong>' + count.H + "</strong> Half day</span>" +
        '<span class="att-count is-A"><strong>' + count.A + "</strong> Absent</span>" +
        '<span class="att-count is-N"><strong>' + notMarked + "</strong> Not marked</span></div>" +
      '<ul class="card card-flush staff-list" aria-label="Today">' + db.staff.map((s) =>
        '<li class="staff-row"><span class="avatar" aria-hidden="true">' + esc(initials(s.name)) + "</span>" +
        '<span class="staff-main"><span class="staff-name">' + esc(s.name) + '</span><span class="staff-role">' + esc(s.role) +
          (marks[s.id] ? "" : ' · <span class="not-marked">not marked</span>') + "</span></span>" +
        '<fieldset class="seg seg-att"><legend class="sr-only">Today for ' + esc(s.name) + "</legend>" +
          ATT.map((a) => '<label class="seg-opt att-' + a[0] + '"><input type="radio" name="att-' + s.id + '" value="' + a[0] + '" data-att="' + s.id + '"' +
            (marks[s.id] === a[0] ? " checked" : "") + "><span>" + a[1] + "</span></label>").join("") +
        "</fieldset></li>").join("") + "</ul>" +
      '<section class="card" aria-labelledby="monthTitle"><div class="card-head"><h2 id="monthTitle">Month summary</h2>' +
        '<label class="sr-only" for="attMonth">Month</label><select id="attMonth" class="select-sm">' +
        months.map((m) => '<option value="' + m + '"' + (m === ym ? " selected" : "") + ">" + monthName(m) + "</option>").join("") + "</select></div>" +
        '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Name</th><th scope="col" class="num">Present</th><th scope="col" class="num">Half day</th>' +
        '<th scope="col" class="num">Absent</th><th scope="col" class="num">Pay so far</th></tr></thead><tbody>' +
        sum.rows.map((r) => '<tr><td><span class="cell-title">' + esc(r.s.name) + '</span><span class="cell-sub">' + rs(r.s.salary) + " a month</span></td>" +
          '<td class="num">' + r.P + '</td><td class="num">' + r.H + '</td><td class="num">' + r.A + '</td><td class="num">' + rs(r.pay) + "</td></tr>").join("") +
        '</tbody><tfoot><tr><th scope="row">Total</th><td></td><td></td><td></td><td class="num">' + rs(totalPay) + "</td></tr></tfoot></table></div>" +
        '<p class="hint">' + plural(sum.days, "day", "days") + " marked in " + monthName(ym) + ". Pay so far = monthly pay ÷ " + sum.dim +
        " days × (present days + half of the half days).</p>" +
      "</section>";
  };

  const markAttendance = (staffId, value) => {
    const key = dayKey(Date.now());
    db.attendance[key] = db.attendance[key] || {};
    db.attendance[key][staffId] = value;
    save();
    render('input[data-att="' + staffId + '"][value="' + value + '"]');
  };

  // ---------------------------------------------------------------------
  // 13. Reports and CSV export
  // ---------------------------------------------------------------------
  const rep = { type: "day", day: "", month: "" };

  const reportBills = () => (rep.type === "day" ? billsOn(rep.day).slice() : billsInMonth(rep.month));

  const viewReports = () => {
    const todayKey = dayKey(Date.now());
    if (!rep.day) { rep.day = todayKey; }
    if (!rep.month) { rep.month = todayKey.slice(0, 7); }
    const months = Array.from(new Set(Array.from(index().byDay.keys()).map((k) => k.slice(0, 7)))).sort().reverse();
    if (months.indexOf(rep.month) === -1 && months.length) { rep.month = months[0]; }
    const firstDay = db.bills.length ? dayKey(db.bills[0].t) : todayKey;
    const bills = reportBills();
    const s = summarize(bills);
    const isDay = rep.type === "day";
    const title = isDay ? (rep.day === todayKey ? "Today, " : "") + fmtLong(keyDate(rep.day).getTime()) : monthName(rep.month);

    let points;
    let chartTitle;
    const daySums = new Map(); // each day's sums, worked out once for the chart and the table
    if (isDay) {
      chartTitle = "Sales by hour";
      // Shop hours 7 am to 11 pm, widened when a bill was made earlier or later, so every bill sits in its real hour.
      const billHours = bills.map((b) => new Date(b.t).getHours());
      const firstHour = Math.min(7, ...billHours);
      const lastHour = Math.max(22, ...billHours);
      const hours = [];
      for (let h = firstHour; h <= lastHour; h += 1) { hours.push({ h: h, v: 0, n: 0 }); }
      bills.forEach((b, i) => {
        hours[billHours[i] - firstHour].v += billTotals(b).total;
        hours[billHours[i] - firstHour].n += 1;
      });
      const peak = hours.reduce((m, x) => (x.v > m.v ? x : m), hours[0]);
      const hourName = (h) => (h % 12 || 12) + (h < 12 ? "am" : "pm");
      points = hours.map((x) => ({ value: x.v, hi: x === peak && x.v > 0, label: hourName(x.h),
        tip: hourName(x.h) + " to " + hourName(x.h + 1) + ": " + rs(x.v) + ", " + plural(x.n, "bill", "bills") }));
    } else {
      chartTitle = "Sales by day";
      const dim = daysInMonth(rep.month);
      const lastDay = rep.month === todayKey.slice(0, 7) ? Number(todayKey.slice(8)) : dim;
      const days = [];
      for (let d = 1; d <= lastDay; d += 1) {
        const key = rep.month + "-" + pad(d);
        const ds = summarize(billsOn(key));
        daySums.set(key, ds);
        days.push({ d: d, key: key, v: ds.sales, n: ds.count });
      }
      const best = days.reduce((m, x) => (x.v > m.v ? x : m), days[0] || { v: 0 });
      points = days.map((x) => ({ value: x.v, hi: x === best && x.v > 0, label: String(x.d),
        tip: fmtLong(keyDate(x.key).getTime()) + ": " + rs(x.v) + ", " + plural(x.n, "bill", "bills") }));
    }

    const top = Object.keys(s.items).map((k) => s.items[k]).sort((a, b) => b.sales - a.sales).slice(0, 8);
    const rates = Object.keys(s.rates).map(Number).sort((a, b) => a - b);

    let list;
    if (isDay) {
      list = '<section class="card" aria-labelledby="listTitle"><div class="card-head"><h2 id="listTitle">Bills</h2><p class="card-sub">' + plural(bills.length, "bill", "bills") + "</p></div>" +
        (bills.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Time</th><th scope="col">Bill</th><th scope="col">Customer</th><th scope="col">Paid by</th><th scope="col" class="num">Amount</th></tr></thead><tbody>' +
          bills.slice().reverse().map((b) => { const m = modeOf(b.m); return "<tr><td>" + fmtTime(b.t) + '</td><td><button type="button" class="link-btn" data-act="invoice" data-id="' + b.id + '">' + b.no + "</button></td>" +
            "<td>" + esc(b.cn || "Walk-in") + '</td><td><span class="mode-tag" style="--c:' + m.color + '">' + m.label + '</span></td><td class="num">' + rs(billTotals(b).total) + "</td></tr>"; }).join("") +
          "</tbody></table></div>" : '<p class="empty">No bills on this day.</p>') + "</section>";
    } else {
      const days = [];
      index().byDay.forEach((dayBills, key) => { if (key.startsWith(rep.month)) { days.push({ key: key, s: daySums.get(key) || summarize(dayBills) }); } });
      days.sort((a, b) => (a.key < b.key ? 1 : -1));
      list = '<section class="card" aria-labelledby="listTitle"><div class="card-head"><h2 id="listTitle">Day by day</h2></div>' +
        (days.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Day</th><th scope="col" class="num">Bills</th><th scope="col" class="num">Sales</th><th scope="col" class="num">Profit (est.)</th></tr></thead><tbody>' +
          days.map((d) => '<tr><td><button type="button" class="link-btn" data-act="rep-day" data-id="' + d.key + '">' + fmtLong(keyDate(d.key).getTime()) + "</button></td>" +
            '<td class="num">' + d.s.count + '</td><td class="num">' + rs(d.s.sales) + '</td><td class="num">' + rs(d.s.profit) + "</td></tr>").join("") +
          "</tbody></table></div>" : '<p class="empty">No bills in this month.</p>') + "</section>";
    }

    return '<div class="view-head"><div><p class="eyebrow">Reports</p><h1>' + esc(title) + "</h1></div></div>" +
      '<div class="toolbar toolbar-report">' +
        '<fieldset class="seg seg-inline"><legend class="sr-only">Report for</legend>' +
          '<label class="seg-opt"><input type="radio" name="repType" value="day"' + (isDay ? " checked" : "") + "><span>Day</span></label>" +
          '<label class="seg-opt"><input type="radio" name="repType" value="month"' + (isDay ? "" : " checked") + "><span>Month</span></label></fieldset>" +
        (isDay ? '<label class="sr-only" for="repDay">Day</label><input class="input-sm" type="date" id="repDay" min="' + firstDay + '" max="' + todayKey + '" value="' + rep.day + '">'
          : '<label class="sr-only" for="repMonth">Month</label><select class="select-sm" id="repMonth">' +
            months.map((m) => '<option value="' + m + '"' + (m === rep.month ? " selected" : "") + ">" + monthName(m) + "</option>").join("") + "</select>") +
        '<div class="toolbar-end"><button type="button" class="btn btn-soft btn-sm" data-act="csv-bills">' + icon("download") + "<span>Bills CSV</span></button>" +
          '<button type="button" class="btn btn-soft btn-sm" data-act="csv-items">' + icon("download") + "<span>Items CSV</span></button></div>" +
      "</div>" +
      '<div class="kpis kpis-5">' +
        kpi("Sales", rs(s.sales), s.disc ? rs(s.disc) + " given as discount" : "Prices include GST", { cls: "kpi-hero" }) +
        kpi("Bills", nf0.format(s.count), plural(s.qty, "item", "items") + " sold") +
        kpi("Average bill", rs(s.avg), "per bill") +
        kpi("Profit", rs(s.profit), "Estimate: sale price minus buy price") +
        kpi("GST collected", rs2(s.gst), "CGST " + rs2(halves(s.gst)[0]) + " + SGST " + rs2(halves(s.gst)[1])) +
      "</div>" +
      '<div class="grid grid-wide">' +
        '<section class="card" aria-labelledby="repChartTitle"><div class="card-head"><h2 id="repChartTitle">' + chartTitle + "</h2>" +
          '<p class="card-sub">' + (isDay ? "Busiest hour is darker" : "Best day is darker") + "</p></div>" +
          barChart(points, { label: chartTitle + ", " + title + ". Total " + rs(s.sales) + ".", height: 210, labelWidth: isDay ? 40 : 22 }) +
          numbersTable(points.filter((p) => p.value > 0).map((p) => [esc(p.tip.split(":")[0]), rs(p.value)]), [isDay ? "Hour" : "Day", "Sales"]) +
        "</section>" +
        '<section class="card" aria-labelledby="repPayTitle"><div class="card-head"><h2 id="repPayTitle">How customers paid</h2></div>' +
          splitBar(s.modes, "Payments, " + title) + "</section>" +
      "</div>" +
      '<div class="grid grid-2">' +
        '<section class="card" aria-labelledby="topTitle"><div class="card-head"><h2 id="topTitle">Top items</h2></div>' +
          (top.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Sales</th></tr></thead><tbody>' +
            top.map((it) => "<tr><td>" + esc(it.name) + '</td><td class="num">' + it.qty + '</td><td class="num">' + rs(it.sales) + "</td></tr>").join("") +
            "</tbody></table></div>" : '<p class="empty">Nothing sold.</p>') + "</section>" +
        '<section class="card" aria-labelledby="gstTitle"><div class="card-head"><h2 id="gstTitle">GST summary</h2><p class="card-sub">For your GST return</p></div>' +
          (rates.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Rate</th><th scope="col" class="num">Taxable value</th><th scope="col" class="num">CGST</th><th scope="col" class="num">SGST</th></tr></thead><tbody>' +
            rates.map((r) => "<tr><td>" + r + '%</td><td class="num">' + rs2(s.rates[r].taxable) + '</td><td class="num">' + rs2(halves(s.rates[r].gst)[0]) + '</td><td class="num">' + rs2(halves(s.rates[r].gst)[1]) + "</td></tr>").join("") +
            '</tbody><tfoot><tr><th scope="row">Total</th><td class="num">' + rs2(s.taxable) + '</td><td class="num">' + rs2(halves(s.gst)[0]) + '</td><td class="num">' + rs2(halves(s.gst)[1]) + "</td></tr></tfoot></table></div>"
            : '<p class="empty">No GST in this period.</p>') + "</section>" +
      "</div>" + list;
  };

  const csvCell = (v) => {
    let text = String(v == null ? "" : v);
    // A typed name starting with = + - @ would run as a formula in Excel: a leading ' keeps it plain text.
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(text)) { text = "'" + text; }
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "shop";
  const downloadCsv = (name, rows) => {
    const text = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Downloaded " + name);
  };
  const periodName = () => (rep.type === "day" ? rep.day : rep.month);
  const billsCsv = () => {
    const rows = [["Date", "Time", "Bill no", "Customer", "Paid by", "Items", "Subtotal", "Discount", "Taxable value", "CGST", "SGST", "Total"]];
    reportBills().forEach((b) => {
      const t = billTotals(b);
      rows.push([dayKey(b.t), fmtTime(b.t), b.no, b.cn || "Walk-in", modeOf(b.m).label, t.qty, money2(t.sub), money2(t.disc),
        money2(t.taxable), money2(halves(t.gst)[0]), money2(halves(t.gst)[1]), money2(t.total)]);
    });
    return rows;
  };
  const itemsCsv = () => {
    const s = summarize(reportBills());
    const rows = [["Item", "Group", "GST rate", "Qty sold", "Sales (incl. GST)", "Taxable value", "GST"]];
    Object.keys(s.items).map((k) => s.items[k]).sort((a, b) => b.sales - a.sales).forEach((it) => {
      const item = itemById(it.id);
      rows.push([it.name, item ? item.cat : "", it.g + "%", it.qty, money2(it.sales), money2(it.taxable), money2(it.gst)]);
    });
    return rows;
  };

  // ---------------------------------------------------------------------
  // 14. Shop details and reset
  // ---------------------------------------------------------------------
  const openSettings = () => {
    const s = db.shop;
    const field = (id, name, label, value, extra) => '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + name + '" autocomplete="off" value="' + esc(value) + '"' + (extra || "") + "></div>";
    openModal("Shop details",
      '<form class="form" data-form="shop" novalidate>' +
        field("sName", "name", "Shop name", s.name, " required") +
        field("sAddr", "address", "Address", s.address) +
        '<div class="field-row">' + field("sArea", "area", "Area", s.area) + field("sCity", "city", "City", s.city) + "</div>" +
        '<div class="field-row">' + field("sPhone", "phone", "Phone", s.phone, ' type="tel"') + field("sGst", "gstin", "GSTIN", s.gstin, ' maxlength="15" autocapitalize="characters"') + "</div>" +
        '<p class="form-note">These show on every bill.</p><p class="form-msg" role="alert"></p>' +
        '<div class="modal-actions"><button type="submit" class="btn btn-primary">' + icon("check") + "<span>Save</span></button></div>" +
      "</form>" +
      '<div class="danger-zone"><h3 class="sub-title">Demo data</h3><p>Everything you add is saved only in this browser. Reset to bring back the sample shop.</p>' +
        '<button type="button" class="btn btn-danger" data-act="reset">' + icon("reset") + "<span>Reset demo data</span></button></div>");
  };

  let resetTimer = 0;
  const askReset = (button) => {
    if (button.dataset.armed) {
      window.clearTimeout(resetTimer);
      doReset();
      return;
    }
    $$('[data-act="reset"]').forEach((b) => { delete b.dataset.armed; });
    button.dataset.armed = "1";
    const label = button.querySelector("span") || button;
    const before = label.textContent;
    label.textContent = "Tap again to reset everything";
    resetTimer = window.setTimeout(() => {
      if (button.isConnected) { delete button.dataset.armed; label.textContent = before; }
    }, 4000);
  };
  const doReset = () => {
    try { window.localStorage.removeItem(STORE_KEY); window.localStorage.removeItem(DRAFT_KEY); } catch (error) { /* nothing saved */ }
    db = freshData();
    applyLink();
    writeJson(STORE_KEY, db);
    derived = null;
    draft = emptyDraft();
    saveDraft();
    pickQuery = "";
    pickCat = "All";
    stockQuery = "";
    custQuery = "";
    rep.day = "";
    rep.month = "";
    closeModal();
    paintShell();
    if (current === "home") { render(); } else { window.location.hash = "#home"; }
    toast("Demo data reset. The sample shop is back.");
  };

  // ---------------------------------------------------------------------
  // 15. The pop-up panel (bottom sheet on phones)
  // ---------------------------------------------------------------------
  const modal = $("#modal");
  const openModal = (title, html, size) => {
    hideTip();
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    modal.classList.toggle("modal-wide", size === "wide");
    if (!modal.open) { modal.showModal(); }
    $("#modalBody").scrollTop = 0;
    const first = $("#modalBody input:not([type=radio]), #modalBody select");
    if (first && $("#modalBody form") && window.matchMedia("(min-width: 700px)").matches) { first.focus(); }
  };
  const closeModal = () => { if (modal.open) { modal.close(); } };
  modal.addEventListener("click", (event) => { if (event.target === modal) { closeModal(); } });

  const formMsg = (form, text) => { const box = $(".form-msg", form); if (box) { box.textContent = text; } };

  const FORMS = {
    item: (form) => {
      const data = new FormData(form);
      const name = clean(data.get("name"), 60);
      const buy = Number(data.get("buy"));
      const sell = Number(data.get("sell"));
      if (!name) { formMsg(form, "Write the item name."); $("#fName").focus(); return; }
      if (!(sell > 0)) { formMsg(form, "Write the sell price."); $("#fSell").focus(); return; }
      if (!(buy >= 0) || String(data.get("buy")).trim() === "") { formMsg(form, "Write the buy price."); $("#fBuy").focus(); return; }
      if (sell < buy) { formMsg(form, "Sell price is lower than buy price. Please check."); $("#fSell").focus(); return; }
      const values = { name: name, cat: clean(data.get("cat"), 40) || "Other", unit: String(data.get("unit")), buy: buy, sell: sell,
        gst: Number(data.get("gst")), stock: Math.max(0, Math.floor(Number(data.get("stock")) || 0)), low: Math.max(0, Math.floor(Number(data.get("low")) || 0)) };
      const id = form.dataset.id;
      if (id) {
        Object.assign(itemById(id), values);
        toast(name + " saved.");
      } else {
        db.items.push(Object.assign({ id: uid("i"), supplier: "" }, values));
        toast(name + " added to stock.");
      }
      save();
      closeModal();
      render();
    },
    stockin: (form) => {
      const data = new FormData(form);
      const it = itemById(String(data.get("item")));
      const qty = Math.floor(Number(data.get("qty")) || 0);
      const buy = Number(data.get("buy"));
      if (!it) { formMsg(form, "Choose the item."); $("#siItem").focus(); return; }
      if (qty < 1) { formMsg(form, "Write how many came in."); $("#siQty").focus(); return; }
      it.stock = Math.max(0, it.stock) + qty;
      if (buy > 0) { it.buy = buy; }
      const from = clean(data.get("from"), 60);
      if (from) { it.supplier = from; }
      db.stockIns.push({ id: uid("s"), t: Date.now(), item: it.id, name: it.name, q: qty, buy: it.buy, from: from });
      save();
      closeModal();
      render();
      toast("Added " + qtyText(qty, it.unit) + " of " + it.name + ". Stock now " + it.stock + ".");
    },
    pay: (form) => {
      const c = customerById(form.dataset.id);
      const data = new FormData(form);
      const amt = Math.floor(Number(data.get("amt")) || 0);
      if (amt < 1) { formMsg(form, "Write the amount received."); $("#payAmt").focus(); return; }
      db.ledger.push({ id: uid("l"), c: c.id, t: Date.now(), type: "payment", amt: amt, mode: String(data.get("mode") || "cash") });
      save();
      const left = balances().bal[c.id] || 0;
      render();
      openCustomer(c.id);
      toast(rs(amt) + " received from " + c.name + ". " + (left > 0 ? "Udhaar left " + rs(left) + "." : left < 0 ? "Advance " + rs(-left) + "." : "Khata is clear."));
    },
    credit: (form) => {
      const c = customerById(form.dataset.id);
      const data = new FormData(form);
      const amt = Math.floor(Number(data.get("amt")) || 0);
      if (amt < 1) { formMsg(form, "Write the amount."); $("#crAmt").focus(); return; }
      db.ledger.push({ id: uid("l"), c: c.id, t: Date.now(), type: "credit", amt: amt, note: clean(data.get("note"), 60) || "Udhaar" });
      save();
      render();
      openCustomer(c.id);
      toast(rs(amt) + " added to " + c.name + "'s khata.");
    },
    customer: (form) => {
      const data = new FormData(form);
      const open = Math.floor(Number(data.get("open")) || 0);
      const made = makeCustomer(data.get("name"), data.get("phone"));
      if (made.error) { formMsg(form, made.error); $(made.field === "name" ? "#ncName" : "#ncPhone").focus(); return; }
      const c = made.customer;
      // Old udhaar is marked "opening" so it does not count as udhaar given this month.
      if (open > 0) { db.ledger.push({ id: uid("l"), c: c.id, t: Date.now(), type: "credit", amt: open, note: "Old udhaar", opening: true }); }
      save();
      custFilter = open > 0 ? custFilter : "all";
      render();
      openCustomer(c.id);
      toast(c.name + " added.");
    },
    shop: (form) => {
      const data = new FormData(form);
      const name = clean(data.get("name"), 60);
      if (!name) { formMsg(form, "Write the shop name."); $("#sName").focus(); return; }
      Object.assign(db.shop, { name: name, address: clean(data.get("address"), 80), area: clean(data.get("area"), 40),
        city: clean(data.get("city"), 30), phone: clean(data.get("phone"), 24), gstin: clean(data.get("gstin"), 15).toUpperCase() });
      save();
      paintShell();
      closeModal();
      render();
      toast("Shop details saved.");
    }
  };

  // ---------------------------------------------------------------------
  // 16. Taps, typing and pages
  // ---------------------------------------------------------------------
  const ACTIONS = {
    close: closeModal,
    settings: openSettings,
    reset: (id, el) => askReset(el),
    add: addItem,
    cat: (id) => {
      pickCat = id;
      $$('[data-act="cat"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
      renderPicks();
    },
    "qty-up": (id) => { const l = draft.lines.find((x) => x.id === id); if (l) { setQty(id, l.q + 1); } },
    "qty-down": (id) => { const l = draft.lines.find((x) => x.id === id); if (l) { if (l.q <= 1) { removeLine(id); } else { setQty(id, l.q - 1); } } },
    remove: removeLine,
    "cart-clear": () => {
      const ids = draft.lines.map((l) => l.id);
      draft = emptyDraft();
      saveDraft();
      renderCart();
      ids.forEach(syncPick);
    },
    "save-bill": saveBill,
    "to-checkout": () => {
      const target = $("#checkout");
      if (target) { target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    },
    invoice: (id) => { const b = billById(id); if (b) { openInvoice(b); } },
    print: (id) => { const b = billById(id); if (b) { printBill(b); } },
    stockin: (id) => openStockIn(id || ""),
    "item-new": () => openItemForm(""),
    "item-new-search": () => openItemForm("", clean(pickQuery, 60)),
    "item-new-stock": () => openItemForm("", clean(stockQuery, 60)),
    "item-edit": (id) => openItemForm(id),
    "stock-filter": (id) => {
      stockFilter = id;
      $$('[data-act="stock-filter"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
      renderStockList();
    },
    "cust-filter": (id) => {
      custFilter = id;
      $$('[data-act="cust-filter"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
      renderCustList();
    },
    "cust-open": (id) => openCustomer(id),
    "cust-pay": (id) => openCustomer(id, "pay"),
    "cust-credit": (id) => openCustomer(id, "credit"),
    "cust-new": openNewCustomer,
    "att-all": () => {
      const key = dayKey(Date.now());
      db.attendance[key] = db.attendance[key] || {};
      let n = 0;
      db.staff.forEach((s) => { if (!db.attendance[key][s.id]) { db.attendance[key][s.id] = "P"; n += 1; } });
      save();
      render();
      toast(plural(n, "person", "people") + " marked present.");
    },
    "rep-day": (id) => { rep.type = "day"; rep.day = id; render(); window.scrollTo(0, 0); },
    "csv-bills": () => downloadCsv(slug(db.shop.name) + "-bills-" + periodName() + ".csv", billsCsv()),
    "csv-items": () => downloadCsv(slug(db.shop.name) + "-items-" + periodName() + ".csv", itemsCsv())
  };

  document.addEventListener("click", (event) => {
    const tipTarget = event.target.closest("[data-tip]");
    if (tipTarget) { showTip(tipTarget, event.clientX, event.clientY); } else { hideTip(); }
    const el = event.target.closest("[data-act]");
    if (!el || el.disabled) { return; }
    const fn = ACTIONS[el.dataset.act];
    if (!fn) { return; }
    event.preventDefault();
    fn(el.dataset.id || "", el, event);
  });

  document.addEventListener("input", (event) => {
    const t = event.target;
    if (t.id === "pickSearch") { pickQuery = t.value; renderPicks(); }
    else if (t.id === "stockSearch") { stockQuery = t.value; renderStockList(); }
    else if (t.id === "custSearch") { custQuery = t.value; renderCustList(); }
    else if (t.dataset && t.dataset.qty) { const v = parseInt(t.value, 10); if (v >= 1) { setQty(t.dataset.qty, v, true); } }
    else if (t.id === "billDisc") { draft.disc = t.value; saveDraft(); updateTotals(); }
    else if (t.id === "billCash") { draft.cash = t.value; saveDraft(); updateTotals(); }
    else if (t.id === "newName" || t.id === "newPhone") { draft[t.id] = t.value; saveDraft(); }
    else if (t.id === "siQty" || t.id === "siBuy") { updateStockInNote(); }
  });

  document.addEventListener("change", (event) => {
    const t = event.target;
    if (t.dataset && t.dataset.qty) { setQty(t.dataset.qty, parseInt(t.value, 10) || 1); }
    else if (t.dataset && t.dataset.gst) {
      const line = draft.lines.find((l) => l.id === t.dataset.gst);
      if (line) { line.g = Number(t.value); saveDraft(); updateTotals(); }
    }
    else if (t.id === "billCust") {
      draft.cust = t.value;
      saveDraft();
      $("#newCust").hidden = t.value !== "new";
      if (t.value === "new") { $("#newName").focus(); }
      updateTotals();
    }
    else if (t.name === "payMode") { draft.mode = t.value; saveDraft(); renderModeExtra(); updateTotals(); }
    else if (t.dataset && t.dataset.att) { markAttendance(t.dataset.att, t.value); }
    else if (t.id === "attMonth") { attMonth = t.value; render("#attMonth"); }
    else if (t.name === "repType") { rep.type = t.value; render('input[name="repType"][value="' + t.value + '"]'); }
    else if (t.id === "repDay") { if (t.value) { rep.day = t.value; render("#repDay"); } }
    else if (t.id === "repMonth") { rep.month = t.value; render("#repMonth"); }
    else if (t.id === "siItem") {
      const it = itemById(t.value);
      if (it) {
        $("#siQty").value = String(suggestQty(it));
        $("#siBuy").value = String(it.buy);
        $("#siFrom").value = it.supplier || "";
      }
      updateStockInNote();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.id === "pickSearch") {
      event.preventDefault();
      const first = $("#picks .pick:not([disabled])");
      if (first) {
        addItem(first.dataset.id);
        pickQuery = "";
        event.target.value = "";
        renderPicks();
      }
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    const kind = form.dataset && form.dataset.form;
    if (!kind || !FORMS[kind]) { return; }
    event.preventDefault();
    FORMS[kind](form);
  });

  const VIEWS = {
    home: { title: "Home", render: viewHome },
    bill: { title: "Billing", render: viewBill, after: afterBill },
    stock: { title: "Stock", render: viewStock, after: renderStockList },
    udhaar: { title: "Customers and udhaar", render: viewUdhaar, after: renderCustList },
    staff: { title: "Staff", render: viewStaff },
    reports: { title: "Reports", render: viewReports }
  };
  let current = "";

  // Draws the current page again. focusSelector puts the keyboard focus back where it was.
  const render = (focusSelector) => {
    charts.clear();
    if (current !== "bill" && checkoutObserver) { checkoutObserver.disconnect(); checkoutObserver = null; }
    $("#view").innerHTML = VIEWS[current].render();
    if (VIEWS[current].after) { VIEWS[current].after(); }
    drawCharts();
    updatePosBar();
    if (focusSelector) { const el = $(focusSelector); if (el) { el.focus({ preventScroll: true }); } }
  };

  const route = (moveFocus) => {
    const name = window.location.hash.replace("#", "");
    if (VIEWS[name]) { current = name; }
    else if (!current) { current = "home"; }
    else { return; }
    $$("[data-tab]").forEach((a) => {
      if (a.dataset.tab === current) { a.setAttribute("aria-current", "page"); } else { a.removeAttribute("aria-current"); }
    });
    document.title = VIEWS[current].title + " | " + db.shop.name;
    closeModal();
    render();
    if (moveFocus) {
      window.scrollTo(0, 0);
      $("#view").focus({ preventScroll: true });
    }
  };
  window.addEventListener("hashchange", () => route(true));

  let resizeTimer = 0;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) { return; } // phones fire resize when the address bar hides
    lastWidth = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(drawCharts, 120);
  });

  paintShell();
  route(false);
  // Keep the date and "today" right if the page stays open past midnight.
  window.setInterval(() => { if ($("#topDate").textContent !== fmtLong(Date.now())) { paintShell(); if (!modal.open) { render(); } } }, 60000);

  // For quick checks from the browser console.
  window.ERP_DEMO = { get db() { return db; }, billsCsv: billsCsv, itemsCsv: itemsCsv, billText: billText, words: words };
})();
