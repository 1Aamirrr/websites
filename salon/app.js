(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Plum & Ivy Salon",
    area: "Powai",
    city: "Mumbai",
    since: 2012,
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Aamir Behlim",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // ---------------------------------------------------------------------
  // 2. TIMINGS. One line per day, in 24-hour time ("21:00" is 9 pm).
  //    For a weekly off write:  { day: "Tuesday", closed: true }
  //    The "Open now" badge and the booking window both read this list.
  // ---------------------------------------------------------------------
  const HOURS = [
    { day: "Monday", open: "10:00", close: "21:00" },
    { day: "Tuesday", open: "10:00", close: "21:00" },
    { day: "Wednesday", open: "10:00", close: "21:00" },
    { day: "Thursday", open: "10:00", close: "21:00" },
    { day: "Friday", open: "10:00", close: "21:00" },
    { day: "Saturday", open: "09:00", close: "21:30" },
    { day: "Sunday", open: "09:00", close: "20:00" }
  ];

  // Appointment times a visitor can pick, in 24-hour time.
  // A time is offered only on days when the salon is open at that time.
  const SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

  // ---------------------------------------------------------------------
  // 3. SERVICE MENU.
  //    The tabs above the menu, in the order they are shown:
  // ---------------------------------------------------------------------
  const CATEGORIES = [
    { id: "hair", label: "Hair" },
    { id: "skin", label: "Skin" },
    { id: "nails", label: "Nails" },
    { id: "makeup", label: "Makeup" },
    { id: "bridal", label: "Bridal" }
  ];

  //    One line per service.
  //    id: a short code, never used twice.   cat: one of the tab ids above.
  //    who: "women", "men" or "all".         mins: how long it takes.
  //    price: in rupees, as a plain number.
  const SERVICES = [
    { id: "h-cut-w", cat: "hair", who: "women", name: "Haircut and blow-dry", note: "Wash, cut and a simple blow-dry.", mins: 45, price: 700 },
    { id: "h-cut-m", cat: "hair", who: "men", name: "Haircut and styling", note: "Wash, cut and style.", mins: 30, price: 350 },
    { id: "h-beard", cat: "hair", who: "men", name: "Beard trim and shape", note: "Trim, a clean line and a hot towel.", mins: 20, price: 200 },
    { id: "h-blow", cat: "hair", who: "women", name: "Wash and blow-dry", note: "Straight, or with soft curls at the ends.", mins: 30, price: 450 },
    { id: "h-root", cat: "hair", who: "all", name: "Root touch-up", note: "Colour on the roots only, with ammonia-free colour.", mins: 60, price: 1200 },
    { id: "h-colour", cat: "hair", who: "women", name: "Full hair colour", note: "One shade from roots to ends. Price is for shoulder-length hair.", mins: 120, price: 3500 },
    { id: "h-spa", cat: "hair", who: "all", name: "Hair spa", note: "Deep conditioning with steam and a head massage.", mins: 45, price: 900 },
    { id: "h-smooth", cat: "hair", who: "women", name: "Keratin smoothing", note: "For frizzy hair. Price is for shoulder-length hair.", mins: 180, price: 5500 },
    { id: "h-champi", cat: "hair", who: "all", name: "Champi head massage", note: "Warm oil massage for the head, neck and shoulders.", mins: 20, price: 300 },

    { id: "s-clean", cat: "skin", who: "all", name: "Clean-up", note: "Cleanse, scrub, steam and a pack.", mins: 30, price: 600 },
    { id: "s-facial", cat: "skin", who: "all", name: "Glow facial", note: "A clean-up plus a face massage and a brightening mask.", mins: 60, price: 1500 },
    { id: "s-detan", cat: "skin", who: "all", name: "De-tan for face and neck", note: "Takes off sun tan. Good before a function.", mins: 20, price: 400 },
    { id: "s-thread", cat: "skin", who: "women", name: "Threading: eyebrows and upper lip", note: "A neat shape, with a cooling gel after.", mins: 10, price: 80 },
    { id: "s-arms", cat: "skin", who: "women", name: "Full arms waxing", note: "Soft wax, underarms included.", mins: 20, price: 350 },
    { id: "s-legs", cat: "skin", who: "women", name: "Full legs waxing", note: "Soft wax with a lotion after.", mins: 30, price: 500 },
    { id: "s-men", cat: "skin", who: "men", name: "Deep-clean facial for men", note: "For oily skin, blackheads and dullness.", mins: 45, price: 1200 },

    { id: "n-mani", cat: "nails", who: "all", name: "Classic manicure", note: "Soak, cuticle care, shaping and polish.", mins: 30, price: 500 },
    { id: "n-pedi", cat: "nails", who: "all", name: "Classic pedicure", note: "Soak, scrub, heel care and polish.", mins: 40, price: 700 },
    { id: "n-gel", cat: "nails", who: "women", name: "Gel polish for hands", note: "Glossy colour that stays for about two weeks.", mins: 40, price: 900 },
    { id: "n-ext", cat: "nails", who: "women", name: "Nail extensions with gel polish", note: "A full set in one colour, any length.", mins: 90, price: 2200 },
    { id: "n-cut", cat: "nails", who: "all", name: "Cut, file and polish", note: "A quick tidy-up when you are short of time.", mins: 15, price: 200 },

    { id: "m-party", cat: "makeup", who: "women", name: "Party make-up", note: "For a function or a night out. Lashes included.", mins: 60, price: 2500 },
    { id: "m-hd", cat: "makeup", who: "women", name: "HD make-up", note: "A long-lasting base for engagement and reception photos.", mins: 75, price: 4500 },
    { id: "m-hair", cat: "makeup", who: "women", name: "Occasion hair styling", note: "Curls, waves or a neat bun.", mins: 40, price: 900 },
    { id: "m-saree", cat: "makeup", who: "women", name: "Saree draping", note: "Any style, pinned so it stays in place.", mins: 15, price: 400 },
    { id: "m-men", cat: "makeup", who: "men", name: "Light make-up for men", note: "A natural finish for photos and video.", mins: 30, price: 1200 },

    { id: "b-trial", cat: "bridal", who: "women", name: "Bridal make-up trial", note: "We try your wedding look before the big day.", mins: 90, price: 3000 },
    { id: "b-day", cat: "bridal", who: "women", name: "Bridal make-up and hair", note: "Wedding day make-up, hair and saree or dupatta draping.", mins: 180, price: 15000 },
    { id: "b-mehndi", cat: "bridal", who: "women", name: "Bridal mehndi", note: "Both hands up to the elbow, and both feet.", mins: 150, price: 4000 },
    { id: "b-pre", cat: "bridal", who: "women", name: "Pre-bridal skin session", note: "Facial, de-tan and body polish in one visit.", mins: 120, price: 3500 },
    { id: "b-groom", cat: "bridal", who: "men", name: "Groom make-up and hair", note: "The wedding day look, with hair styling.", mins: 60, price: 3500 }
  ];

  // ---------------------------------------------------------------------
  // 4. PACKAGES. "includes" lists service ids from the menu above.
  //    The page adds up their normal prices by itself and shows the saving,
  //    so only "price" (the package price) has to be typed here.
  // ---------------------------------------------------------------------
  const PACKAGES = [
    { name: "Party ready", who: "women", price: 3600, includes: ["h-blow", "m-party", "m-saree", "n-gel"] },
    { name: "Bridal trial", who: "women", price: 4900, includes: ["b-trial", "m-hair", "s-facial", "m-saree"] },
    { name: "Groom's package", who: "men", price: 4900, includes: ["h-cut-m", "h-beard", "s-men", "n-mani", "b-groom"] }
  ];

  // ---------------------------------------------------------------------
  // 5. GALLERY. photo: the code from an Unsplash photo link.
  //    For a real client, replace these with the salon's own photos.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { photo: "1595944024804-733665a112db", caption: "Styling stations" },
    { photo: "1600948836101-f9ffda59d250", caption: "The mirror wall" },
    { photo: "1580618672591-eb180b1a973f", caption: "Blow-dry in progress" },
    { photo: "1582095133179-bfd08e2fc6b3", caption: "Hair-up for a function" },
    { photo: "1610992015732-2449b76344bc", caption: "After a manicure" },
    { photo: "1607779097040-26e80aa78e66", caption: "Gel polish" },
    { photo: "1526045478516-99145907023c", caption: "Make-up brushes" },
    { photo: "1585747860715-2ba37e788b70", caption: "The men's corner" }
  ];

  // ---------------------------------------------------------------------
  // 6. TEAM. First name, role and one line about their work.
  //    look: which drawing to use. One of "long", "bun", "bob", "short", "beard".
  //    These are drawings, not photos. The names here are made-up examples.
  // ---------------------------------------------------------------------
  const TEAM = [
    { name: "Neha", role: "Senior stylist", line: "Cuts, colour and keratin.", look: "long" },
    { name: "Farhan", role: "Barber", line: "Men's cuts, beard styling and champi.", look: "beard" },
    { name: "Priya", role: "Skin therapist", line: "Facials, clean-ups and waxing.", look: "bun" },
    { name: "Ritu", role: "Nail artist", line: "Gel polish, extensions and nail art.", look: "bob" },
    { name: "Aisha", role: "Bridal make-up artist", line: "Wedding, engagement and party looks.", look: "long" },
    { name: "Karan", role: "Colour specialist", line: "Full colour, highlights and root touch-ups.", look: "short" }
  ];

  // ---------------------------------------------------------------------
  // 7. POPULAR SERVICES for the turning carousel near the top (use 6).
  //    id: a service id from the menu above.   photo: an Unsplash photo code.
  //    The first one is also shown on the small card over the top photo.
  // ---------------------------------------------------------------------
  const POPULAR = [
    { id: "h-cut-w", photo: "1522337360788-8b13dee7a37e" },
    { id: "s-facial", photo: "1540555700478-4be289fbecef" },
    { id: "n-gel", photo: "1604654894610-df63bc536371" },
    { id: "m-party", photo: "1596462502278-27bfdc403348" },
    { id: "h-cut-m", photo: "1622286342621-4bd786c2447c" },
    { id: "b-mehndi", photo: "1505932794465-147d1f1b2c97" }
  ];

  // ---------------------------------------------------------------------
  // GIFT VOUCHER. amounts: the choices, in rupees. start: the one shown first.
  // validFor: how long a voucher can be used, in plain words.
  // ---------------------------------------------------------------------
  const VOUCHER = { amounts: [1000, 2000, 3000, 5000], start: 2000, validFor: "6 months" };

  // ---------------------------------------------------------------------
  // 8. HAIR COLOUR SHADES for the "Try a shade" strip.
  //    colour: the hair colour used in the drawing (a web colour code).
  //    start: true marks the shade that is shown first.
  // ---------------------------------------------------------------------
  const SHADES = [
    { name: "Natural black", colour: "#1e1216" },
    { name: "Dark brown", colour: "#3d241b" },
    { name: "Chestnut", colour: "#6e412b" },
    { name: "Burgundy", colour: "#7a2238", start: true },
    { name: "Copper", colour: "#a8552b" },
    { name: "Caramel", colour: "#b98445" }
  ];

  // ---------------------------------------------------------------------
  // 9. A link like  ?firm=Glow+Unisex+Salon&area=Andheri  shows the page
  //    with that salon name and area, so one sample works for many salons.
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

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // "14:30" becomes 870 (minutes after midnight)
  const toMinutes = (time) => {
    const parts = String(time).split(":");
    return Number(parts[0]) * 60 + Number(parts[1] || 0);
  };
  // 870 becomes "2:30 pm", 600 becomes "10 am"
  const clock = (mins) => {
    const hour = Math.floor(mins / 60) % 24;
    const minute = mins % 60;
    return (hour % 12 || 12) + (minute ? ":" + String(minute).padStart(2, "0") : "") + (hour >= 12 ? " pm" : " am");
  };
  // 135 becomes "2 hr 15 min"
  const duration = (mins) => {
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return [hours ? hours + " hr" : "", rest || !hours ? rest + " min" : ""].filter(Boolean).join(" ");
  };
  const countText = (n) => (n === 1 ? "1 service" : n + " services");
  const WHO_LABEL = { women: "Women", men: "Men", all: "Unisex" };

  const serviceById = (id) => SERVICES.find((item) => item.id === id);
  const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);

  // Pop-up windows (booking and bigger photo). While one is open the page behind
  // does not scroll. When it closes, the keyboard focus goes back to "focusBack()".
  // The tidy-up runs straight away and again on the browser's own "close" signal
  // (the Escape key), so the page is never left locked.
  const popup = (dialog, focusBack) => {
    let isOpen = false;
    const tidy = () => {
      if (!isOpen) { return; }
      isOpen = false;
      document.documentElement.classList.remove("is-locked");
      const back = focusBack();
      if (back) { back.focus(); }
    };
    const close = () => {
      if (typeof dialog.close === "function" && dialog.open) { dialog.close(); } else { dialog.removeAttribute("open"); }
      tidy();
    };
    dialog.addEventListener("close", tidy);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) { close(); } });
    return {
      open: () => {
        if (!dialog.open) {
          if (typeof dialog.showModal === "function") { dialog.showModal(); } else { dialog.setAttribute("open", ""); }
        }
        isOpen = true;
        document.documentElement.classList.add("is-locked");
      },
      close: close
    };
  };

  // Small pop-up message at the bottom of the screen.
  let toastTimer = 0;
  const toast = (message) => {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove("is-on"), 2200);
  };

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Unisex salon in " + area + ", " + CONFIG.city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = CONFIG.city; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I would like to book an appointment at your salon in " + area + ".");
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
  // Timings: "Open now" or "Closed now, opens at ..." from the visitor's clock
  // ---------------------------------------------------------------------
  const hoursFor = (dayIndex) => HOURS.find((row) => row.day === DAY_NAMES[dayIndex]) || null;
  const isOpenDay = (row) => Boolean(row && !row.closed && row.open && row.close);
  const rangeText = (row) => (isOpenDay(row) ? clock(toMinutes(row.open)) + " to " + clock(toMinutes(row.close)) : "Closed");

  const statusAt = (now) => {
    const mins = now.getHours() * 60 + now.getMinutes();
    const today = hoursFor(now.getDay());
    const todayLine = isOpenDay(today) ? "Today: " + rangeText(today) + "." : "Today: closed all day.";
    if (isOpenDay(today)) {
      if (mins >= toMinutes(today.open) && mins < toMinutes(today.close)) {
        const until = clock(toMinutes(today.close));
        return { open: true, chip: "Open now", text: "Open now", detail: "Closes at " + until + " today.", line: "Open now, until " + until };
      }
      if (mins < toMinutes(today.open)) {
        const text = "Closed now, opens at " + clock(toMinutes(today.open));
        return { open: false, chip: "Closed now", text: text, detail: todayLine, line: text };
      }
    }
    for (let ahead = 1; ahead <= 7; ahead += 1) {
      const next = hoursFor((now.getDay() + ahead) % 7);
      if (isOpenDay(next)) {
        const text = "Closed now, opens at " + clock(toMinutes(next.open)) + (ahead === 1 ? " tomorrow" : " on " + next.day);
        return { open: false, chip: "Closed now", text: text, detail: todayLine, line: text };
      }
    }
    return { open: false, chip: "Closed", text: "Closed for now", detail: "Please message us for timings.", line: "Closed for now" };
  };

  const paintStatus = () => {
    const now = new Date();
    const status = statusAt(now);
    $("#statusText").textContent = status.text;
    $("#statusDetail").textContent = status.detail;
    $("#statusBadge").classList.toggle("is-closed", !status.open);
    $("#heroChipText").textContent = status.chip;
    $("#heroChip").classList.toggle("is-closed", !status.open);
    $("#contactHours").textContent = status.line;

    // The table runs Monday to Sunday. Days in a row with the same hours share one
    // line ("Monday to Friday"), and the line that covers today is marked.
    const groups = [];
    [1, 2, 3, 4, 5, 6, 0].forEach((dayIndex) => {
      const hours = rangeText(hoursFor(dayIndex));
      const last = groups[groups.length - 1];
      if (last && last.hours === hours) { last.days.push(dayIndex); }
      else { groups.push({ hours: hours, days: [dayIndex] }); }
    });
    $("#hoursBody").replaceChildren(...groups.map((group) => {
      const isToday = group.days.indexOf(now.getDay()) !== -1;
      const first = DAY_NAMES[group.days[0]];
      const last = DAY_NAMES[group.days[group.days.length - 1]];
      const row = el("tr", isToday ? "is-today" : "");
      const day = el("th", "", group.days.length === 1 ? first : group.days.length === 2 ? first + " and " + last : first + " to " + last);
      day.scope = "row";
      if (isToday) { day.appendChild(el("span", "today-tag", "Today")); }
      row.appendChild(day);
      row.appendChild(el("td", "", group.hours));
      return row;
    }));
  };
  paintStatus();
  window.setInterval(paintStatus, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { paintStatus(); } });

  const openDays = DAY_NAMES.filter((name, index) => isOpenDay(hoursFor(index))).length;
  $("#trustDays").textContent = openDays === 7 ? "Open all 7 days" : "Open " + openDays + " days a week";

  // ---------------------------------------------------------------------
  // Appointment basket. Kept on the visitor's own phone, nowhere else.
  // ---------------------------------------------------------------------
  const STORE_KEY = "salon-sample-basket";
  const basket = [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORE_KEY) || "[]");
    if (Array.isArray(stored)) {
      stored.forEach((id) => {
        if (serviceById(id) && basket.indexOf(id) === -1) { basket.push(id); }
      });
    }
  } catch (error) { /* storage is blocked: the basket still works until the page closes */ }

  const persistBasket = () => {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(basket)); } catch (error) { /* ignore */ }
  };

  const basketItems = () => basket.map(serviceById).filter(Boolean);

  const booking = $("#booking");

  const syncBasket = () => {
    const items = basketItems();
    const totalMins = sum(items, "mins");
    const totalPrice = sum(items, "price");

    // Add / Remove buttons, in the menu rows and on the carousel cards
    $$("[data-add]").forEach((button) => {
      const on = basket.indexOf(button.dataset.add) !== -1;
      const wide = button.dataset.wide === "yes";
      if (button.getAttribute("aria-pressed") !== String(on) || !button.firstChild) {
        button.setAttribute("aria-pressed", String(on));
        button.replaceChildren(
          icon(on ? "x" : "plus"),
          el("span", "", wide ? (on ? "Remove from appointment" : "Add to my appointment") : (on ? "Remove" : "Add")));
      }
      button.setAttribute("aria-label", (on ? "Remove from my appointment: " : "Add to my appointment: ") + button.dataset.label);
      button.closest(".svc, .ring-card").classList.toggle("is-on", on);
    });

    // Small number on each tab: how many services are picked from it
    $$("[data-cat]").forEach((button) => {
      const picked = items.filter((item) => item.cat === button.dataset.cat).length;
      const bubble = $(".tab-count", button);
      bubble.textContent = String(picked);
      bubble.hidden = picked === 0;
      if (picked) { button.setAttribute("aria-label", button.dataset.label + ", " + picked + " chosen"); }
      else { button.removeAttribute("aria-label"); }
    });

    // The bar at the bottom
    $("#basket").hidden = items.length === 0;
    document.body.classList.toggle("has-basket", items.length > 0);
    $("#basketLine").replaceChildren(
      el("span", "", countText(items.length)),
      document.createTextNode(" · "),
      el("span", "", duration(totalMins)));
    $("#basketPrice").textContent = inr(totalPrice);

    // The booking window
    $("#bookItems").replaceChildren(...items.map((item) => {
      const row = el("li");
      const text = el("div");
      text.appendChild(el("p", "picked-name", item.name));
      text.appendChild(el("p", "picked-meta", duration(item.mins) + " · " + WHO_LABEL[item.who]));
      row.appendChild(text);
      row.appendChild(el("span", "picked-price", inr(item.price)));
      const remove = el("button", "picked-x");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + item.name);
      remove.appendChild(icon("x"));
      remove.addEventListener("click", () => removeInBooking(item.id));
      row.appendChild(remove);
      return row;
    }));
    $("#bookTotalText").textContent = countText(items.length) + ", " + duration(totalMins);
    $("#bookTotalPrice").textContent = inr(totalPrice);
    updateSendLink();
  };

  const toggleBasket = (id) => {
    const at = basket.indexOf(id);
    if (at === -1) { basket.push(id); } else { basket.splice(at, 1); }
    persistBasket();
    syncBasket();
    toast((at === -1 ? "Added: " : "Removed: ") + serviceById(id).name);
  };

  const clearBasket = () => {
    basket.length = 0;
    persistBasket();
    syncBasket();
  };

  $("#basketClear").addEventListener("click", () => {
    clearBasket();
    toast("Appointment cleared");
    activeTab().focus();
  });

  // ---------------------------------------------------------------------
  // Service menu: tabs, the For filter and the rows
  // ---------------------------------------------------------------------
  const state = { cat: CATEGORIES[0].id, who: "all" };
  const menu = $("#menu");
  const empty = $("#empty");
  const tabs = $("#catTabs");

  tabs.replaceChildren(...CATEGORIES.map((cat) => {
    const button = el("button", "tab");
    button.type = "button";
    button.dataset.cat = cat.id;
    button.dataset.label = cat.label;
    button.appendChild(el("span", "", cat.label));
    const bubble = el("span", "tab-count", "0");
    bubble.hidden = true;
    button.appendChild(bubble);
    button.addEventListener("click", () => {
      setState({ cat: cat.id });
      // On a phone the tabs scroll sideways: bring the tapped one to the middle.
      tabs.scrollTo({ left: button.offsetLeft - (tabs.clientWidth - button.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
    });
    return button;
  }));
  const activeTab = () => $('[data-cat="' + state.cat + '"]', tabs);

  const buildRow = (item, index) => {
    const row = el("li", "svc");
    row.style.setProperty("--i", String(index));
    // Name, a dotted line, then the price: laid out like a printed price list.
    const head = el("div", "svc-head");
    head.appendChild(el("h3", "svc-name", item.name));
    const lead = el("span", "svc-lead");
    lead.setAttribute("aria-hidden", "true");
    head.appendChild(lead);
    head.appendChild(el("p", "svc-price", inr(item.price)));
    row.appendChild(head);
    row.appendChild(el("p", "svc-note", item.note));

    const foot = el("div", "svc-foot");
    const meta = el("p", "svc-meta");
    const time = el("span", "svc-time");
    time.appendChild(icon("clock"));
    time.appendChild(document.createTextNode(duration(item.mins)));
    meta.appendChild(time);
    const sep = el("span", "sep", "·");
    sep.setAttribute("aria-hidden", "true");
    meta.appendChild(sep);
    meta.appendChild(el("span", "", WHO_LABEL[item.who]));
    foot.appendChild(meta);

    const add = el("button", "add");
    add.type = "button";
    add.dataset.add = item.id;
    add.dataset.label = item.name + ", " + inr(item.price);
    add.addEventListener("click", () => toggleBasket(item.id));
    foot.appendChild(add);
    row.appendChild(foot);
    return row;
  };

  const render = () => {
    const shown = SERVICES.filter((item) =>
      item.cat === state.cat &&
      (state.who === "all" || item.who === "all" || item.who === state.who));
    menu.replaceChildren(...shown.map(buildRow));
    menu.hidden = shown.length === 0;
    empty.hidden = shown.length !== 0;
    $("#resultCount").textContent = countText(shown.length);
    syncBasket();
  };

  const setState = (patch) => {
    Object.assign(state, patch);
    $$("[data-cat]").forEach((button) => {
      const on = button.dataset.cat === state.cat;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    $$("[data-for]").forEach((button) => {
      const on = button.dataset.for === state.who;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    render();
  };

  $$("[data-for]").forEach((button) => button.addEventListener("click", () => setState({ who: button.dataset.for })));
  $("#resetFilters").addEventListener("click", () => setState({ who: "all" }));

  // ---------------------------------------------------------------------
  // Booking window: chosen services, day, time and name, then WhatsApp
  // ---------------------------------------------------------------------
  const bookName = $("#bookName");
  const bookError = $("#bookError");
  const bookSend = $("#bookSend");
  const pick = { dayKey: "", slot: "" };
  let bookDays = [];
  let bookOpener = null;

  const dateKey = (date) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  // The next 7 days, each with the times that are still free.
  const buildDays = (now) => {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return Array.from({ length: 7 }, (unused, ahead) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      const row = hoursFor(date.getDay());
      const slots = !isOpenDay(row) ? [] : SLOTS
        .filter((slot) => toMinutes(slot) >= toMinutes(row.open) && toMinutes(slot) < toMinutes(row.close))
        .map((slot) => ({ slot: slot, past: ahead === 0 && toMinutes(slot) <= nowMins }));
      return {
        key: dateKey(date),
        date: date,
        label: ahead === 0 ? "Today" : DAY_NAMES[date.getDay()].slice(0, 3),
        sub: !isOpenDay(row) ? "Closed" : date.getDate() + " " + MONTH_NAMES[date.getMonth()].slice(0, 3),
        closed: !isOpenDay(row),
        slots: slots,
        free: slots.filter((entry) => !entry.past).length
      };
    });
  };

  const pickedDay = () => bookDays.find((day) => day.key === pick.dayKey) || null;

  const bookingMessage = () => {
    const items = basketItems();
    const day = pickedDay();
    const name = clean(bookName.value, 60);
    const lines = ["Hello " + firm + ", I would like to book an appointment.", ""];
    items.forEach((item, i) => {
      lines.push((i + 1) + ". " + item.name + " - " + duration(item.mins) + " - " + inr(item.price));
    });
    lines.push("");
    lines.push("Total: " + countText(items.length) + ", " + duration(sum(items, "mins")) + ", " + inr(sum(items, "price")));
    if (day) {
      lines.push("Day: " + DAY_NAMES[day.date.getDay()] + ", " + day.date.getDate() + " " + MONTH_NAMES[day.date.getMonth()] + " " + day.date.getFullYear());
    }
    if (pick.slot) { lines.push("Time: " + clock(toMinutes(pick.slot))); }
    if (name) { lines.push("Name: " + name); }
    return lines.join("\n");
  };

  function updateSendLink() {
    bookSend.href = waLink(bookingMessage());
  }

  const paintPicks = () => {
    const day = pickedDay();
    $("#bookDays").replaceChildren(...bookDays.map((entry) => {
      const button = el("button", "day");
      button.type = "button";
      button.disabled = entry.free === 0;
      button.setAttribute("aria-pressed", String(entry.key === pick.dayKey));
      button.setAttribute("aria-label", (entry.label === "Today" ? "Today, " : "") + DAY_NAMES[entry.date.getDay()] + " " + entry.date.getDate() + " " + MONTH_NAMES[entry.date.getMonth()] + (entry.closed ? ", closed" : entry.free === 0 ? ", no times left" : ""));
      button.appendChild(el("span", "", entry.label));
      button.appendChild(el("small", "", entry.sub));
      button.addEventListener("click", () => {
        pick.dayKey = entry.key;
        settleSlot();
        paintPicks();
        $('#bookDays [aria-pressed="true"]').focus();
      });
      return button;
    }));
    $("#bookSlots").replaceChildren(...(day ? day.slots : []).map((entry) => {
      const button = el("button", "slot", clock(toMinutes(entry.slot)));
      button.type = "button";
      button.disabled = entry.past;
      button.setAttribute("aria-pressed", String(entry.slot === pick.slot));
      button.addEventListener("click", () => {
        pick.slot = entry.slot;
        paintPicks();
        $('#bookSlots [aria-pressed="true"]').focus();
      });
      return button;
    }));
    const note = $("#bookSlotNote");
    const todayFull = bookDays.length > 0 && bookDays[0].free === 0;
    note.hidden = !(todayFull || !day);
    note.textContent = !day ? "No times are open this week. Please message us on WhatsApp."
      : bookDays[0].slots.length ? "No times are left for today."
      : "We are closed today.";
    bookError.hidden = true;
    updateSendLink();
  };

  // Keep the picked time if that day still has it, else take the first free one.
  const settleSlot = () => {
    const day = pickedDay();
    const free = day ? day.slots.filter((entry) => !entry.past) : [];
    if (!free.some((entry) => entry.slot === pick.slot)) { pick.slot = free.length ? free[0].slot : ""; }
  };

  const openBooking = (opener) => {
    if (basket.length === 0) { return; }
    bookOpener = opener || null;
    bookDays = buildDays(new Date());
    const stillGood = bookDays.find((day) => day.key === pick.dayKey && day.free > 0);
    const firstFree = bookDays.find((day) => day.free > 0);
    pick.dayKey = stillGood ? stillGood.key : firstFree ? firstFree.key : "";
    settleSlot();
    paintPicks();
    bookingPopup.open();
    $("#bookScroll").scrollTop = 0;
  };

  // Focus goes back to the bar's button, or to the menu tabs if the bar is gone.
  const bookingPopup = popup(booking, () => {
    const back = bookOpener && !$("#basket").hidden ? bookOpener : activeTab();
    bookOpener = null;
    return back;
  });
  $("#bookClose").addEventListener("click", bookingPopup.close);
  $("#basketOpen").addEventListener("click", (event) => openBooking(event.currentTarget));

  function removeInBooking(id) {
    const at = basket.indexOf(id);
    if (at === -1) { return; }
    const position = Math.min(at, basket.length - 2);
    basket.splice(at, 1);
    persistBasket();
    syncBasket();
    if (basket.length === 0) {
      bookingPopup.close();
      toast("Nothing left in your appointment");
      return;
    }
    // Keep the keyboard focus on a nearby remove button.
    const buttons = $$("#bookItems .picked-x");
    if (buttons[position]) { buttons[position].focus(); }
  }

  $("#bookClear").addEventListener("click", () => {
    clearBasket();
    bookingPopup.close();
    toast("Appointment cleared");
  });

  bookName.addEventListener("input", () => {
    bookError.hidden = true;
    updateSendLink();
  });

  // Checks the booking before WhatsApp opens. Returns true when it is ready.
  const bookingReady = () => {
    if (!pickedDay() || !pick.slot) {
      bookError.textContent = "Please pick a day and a time.";
      bookError.hidden = false;
      return false;
    }
    if (!clean(bookName.value, 60)) {
      bookError.textContent = "Please type your name.";
      bookError.hidden = false;
      bookName.focus();
      return false;
    }
    bookError.hidden = true;
    updateSendLink();
    return true;
  };
  bookSend.addEventListener("click", (event) => { if (!bookingReady()) { event.preventDefault(); } });
  // Pressing Enter in the name box does the same as tapping the button.
  $("#bookForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (bookingReady()) { window.open(bookSend.href, "_blank", "noopener"); }
  });

  // ---------------------------------------------------------------------
  // Packages: the page adds up the separate prices from the menu
  // ---------------------------------------------------------------------
  $("#packs").replaceChildren(...PACKAGES.map((pack) => {
    const items = pack.includes.map(serviceById).filter(Boolean);
    const separate = sum(items, "price");

    const card = el("article", "pack reveal");
    card.dataset.tilt = "";
    card.dataset.tiltMax = "5";
    // Who it is for and how long it takes, then the name and the price first.
    const who = pack.who === "men" ? "For men" : pack.who === "women" ? "For women" : "For everyone";
    card.appendChild(el("p", "pack-for", who + " · about " + duration(sum(items, "mins"))));
    card.appendChild(el("h3", "", pack.name));
    const now = el("p", "pack-now");
    now.appendChild(el("strong", "", inr(pack.price)));
    if (separate > pack.price) {
      const was = el("span", "pack-was");
      was.appendChild(el("s", "", inr(separate)));
      was.appendChild(document.createTextNode(" if booked one by one"));
      now.appendChild(was);
    }
    card.appendChild(now);
    if (separate > pack.price) { card.appendChild(el("p", "pack-save", "You save " + inr(separate - pack.price))); }

    const list = el("ul", "pack-list");
    items.forEach((item) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", item.name));
      li.appendChild(el("span", "", inr(item.price)));
      list.appendChild(li);
    });
    card.appendChild(list);

    const ask = el("a", "btn btn-ghost btn-block");
    ask.target = "_blank";
    ask.rel = "noopener";
    ask.href = waLink("Hello " + firm + ", I want to know about this package: " + pack.name + " (" + inr(pack.price) + "). Please share the details.");
    ask.appendChild(icon("wa", true));
    ask.appendChild(el("span", "", "Ask about this package"));
    ask.setAttribute("aria-label", "Ask about this package on WhatsApp: " + pack.name);
    card.appendChild(ask);
    return card;
  }));

  // ---------------------------------------------------------------------
  // Gift voucher: pick an amount and the printed card shows it
  // ---------------------------------------------------------------------
  $$("[data-gift-valid]").forEach((node) => { node.textContent = VOUCHER.validFor; });
  // A long salon name gets smaller letters on the voucher, so it fits without being cut.
  $(".voucher-firm").classList.toggle("is-long", firm.length > 22);
  const pickAmount = (amount) => {
    $$("[data-gift-amount]").forEach((node) => { node.textContent = inr(amount); });
    $$("#giftAmounts .seg-btn").forEach((button) => {
      const on = Number(button.dataset.amount) === amount;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    $("#giftAsk").href = waLink("Hello " + firm + ", I would like a gift voucher of " + inr(amount) + ". Please tell me how to pay and when I can collect it.");
  };
  $("#giftAmounts").replaceChildren(...VOUCHER.amounts.map((amount) => {
    const button = el("button", "seg-btn", inr(amount));
    button.type = "button";
    button.dataset.amount = String(amount);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => pickAmount(amount));
    return button;
  }));
  pickAmount(VOUCHER.amounts.indexOf(VOUCHER.start) !== -1 ? VOUCHER.start : VOUCHER.amounts[0]);

  // ---------------------------------------------------------------------
  // Popular services: the turning carousel, and the small cards over the top photo.
  // The turning itself is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const popular = POPULAR
    .map((entry) => ({ service: serviceById(entry.id), photo: entry.photo }))
    .filter((entry) => entry.service);
  const ringTrack = $("#ringTrack");
  popular.forEach((entry) => {
    const item = entry.service;
    const card = el("article", "ring-card");
    const photo = el("div", "ring-photo");
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.loading = "lazy";
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(entry.photo, 600, 400);
    photo.appendChild(img);
    const category = CATEGORIES.find((cat) => cat.id === item.cat);
    photo.appendChild(el("span", "ring-tag", category ? category.label : ""));
    card.appendChild(photo);

    const body = el("div", "ring-body");
    body.appendChild(el("h3", "", item.name));
    const row = el("p", "ring-row");
    const time = el("span", "svc-time");
    time.appendChild(icon("clock"));
    time.appendChild(document.createTextNode(duration(item.mins) + " · " + WHO_LABEL[item.who]));
    row.appendChild(time);
    row.appendChild(el("strong", "ring-price", inr(item.price)));
    body.appendChild(row);

    // The same Add button as in the menu, so both always show the same state.
    const add = el("button", "btn btn-brand btn-sm btn-3d ring-add");
    add.type = "button";
    add.dataset.ripple = "";
    add.dataset.add = item.id;
    add.dataset.wide = "yes";
    add.dataset.label = item.name + ", " + inr(item.price);
    add.addEventListener("click", () => toggleBasket(item.id));
    body.appendChild(add);
    card.appendChild(body);
    ringTrack.appendChild(card);
  });

  // Small card on the top photo: the first popular service.
  if (popular[0]) {
    $("#heroMiniPrice").textContent = inr(popular[0].service.price);
    $("#heroMiniTitle").textContent = popular[0].service.name;
    $("#heroMiniPhoto").style.backgroundImage = "url('" + photoUrl(popular[0].photo, 120, 120) + "')";
  }
  // "Today's offer" card: one package each day, in turn.
  const offer = PACKAGES[new Date().getDay() % PACKAGES.length];
  if (offer) {
    $("#heroOfferName").textContent = offer.name;
    $("#heroOfferPrice").textContent = inr(offer.price);
  } else {
    $("#heroOffer").hidden = true;
  }

  // ---------------------------------------------------------------------
  // Try a shade: tap a colour and the hair in the drawing changes
  // ---------------------------------------------------------------------
  const shadeStage = $("#shadeStage");
  shadeStage.style.setProperty("--av-skin", "#e3b28e");
  shadeStage.style.setProperty("--av-top", "#6e1f40");
  const pickShade = (shade) => {
    shadeStage.style.setProperty("--av-hair", shade.colour);
    $("#shadeName").textContent = shade.name;
    $("#shadeAsk").href = waLink("Hello " + firm + ", I am thinking about a new hair colour. I like the shade " + shade.name + ". Please tell me the price and how long it takes.");
    $$("#swatches .swatch").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.shade === shade.name));
    });
  };
  $("#swatches").replaceChildren(...SHADES.map((shade) => {
    const button = el("button", "swatch");
    button.type = "button";
    button.dataset.shade = shade.name;
    button.setAttribute("aria-label", shade.name);
    button.setAttribute("aria-pressed", "false");
    button.style.setProperty("--shade", shade.colour);
    button.appendChild(icon("check"));
    button.addEventListener("click", () => pickShade(shade));
    return button;
  }));
  if (SHADES.length) { pickShade(SHADES.find((shade) => shade.start) || SHADES[0]); }

  // ---------------------------------------------------------------------
  // Gallery and the bigger photo window
  // ---------------------------------------------------------------------
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  let lbIndex = 0;
  let lbOpener = null;
  // Focus goes back to the photo that was tapped.
  const photoPopup = popup(lightbox, () => lbOpener);

  lbImg.addEventListener("error", () => { lbImg.style.visibility = "hidden"; });

  const lbShow = (index) => {
    lbIndex = (index + GALLERY.length) % GALLERY.length;
    const shot = GALLERY[lbIndex];
    lbImg.style.visibility = "";
    lbImg.alt = shot.caption;
    lbImg.src = photoUrl(shot.photo, 1200, 900);
    $("#lbCaption").textContent = shot.caption;
    $("#lbCount").textContent = "Photo " + (lbIndex + 1) + " of " + GALLERY.length;
  };

  $("#shots").replaceChildren(...GALLERY.map((shot, index) => {
    const button = el("button", "shot reveal");
    button.type = "button";
    button.dataset.tilt = "";
    button.dataset.tiltMax = "6";
    button.setAttribute("aria-label", "See bigger: " + shot.caption);
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.width = 600;
    img.height = 600;
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(shot.photo, 600, 600);
    button.appendChild(img);
    button.appendChild(el("span", "shot-cap", shot.caption));
    button.addEventListener("click", () => {
      lbOpener = button;
      lbShow(index);
      photoPopup.open();
    });
    return button;
  }));

  $("#lbPrev").addEventListener("click", () => lbShow(lbIndex - 1));
  $("#lbNext").addEventListener("click", () => lbShow(lbIndex + 1));
  $("#lbClose").addEventListener("click", () => photoPopup.close());
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); lbShow(lbIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); lbShow(lbIndex - 1); }
  });
  // A finger swipe left or right also changes the photo.
  let swipeX = null;
  lightbox.addEventListener("touchstart", (event) => { swipeX = event.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (swipeX === null) { return; }
    const moved = event.changedTouches[0].clientX - swipeX;
    swipeX = null;
    if (Math.abs(moved) > 48) { lbShow(lbIndex + (moved < 0 ? 1 : -1)); }
  }, { passive: true });

  // ---------------------------------------------------------------------
  // Team: a small drawing, first name, role and one line each
  // ---------------------------------------------------------------------
  // Colours for the drawings. Each person takes the next set in turn.
  const AVATAR_COLOURS = [
    { skin: "#e3b28e", hair: "#2b1722", top: "#6e1f40", bg: "#f8e6ec" },
    { skin: "#cf9a73", hair: "#1e1216", top: "#c8a25a", bg: "#f6ecd8" },
    { skin: "#ecc3a2", hair: "#4a2a24", top: "#8a2c52", bg: "#f3e3dd" },
    { skin: "#d9a680", hair: "#33191f", top: "#2b1722", bg: "#f8e6ec" },
    { skin: "#e3b28e", hair: "#5a3327", top: "#c8a25a", bg: "#f6ecd8" },
    { skin: "#c98f68", hair: "#1e1216", top: "#6e1f40", bg: "#f3e3dd" }
  ];
  const AVATAR_BACK = { long: true, bun: true, bob: true };

  const avatar = (look, index) => {
    const colours = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "avatar");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    svg.style.setProperty("--av-skin", colours.skin);
    svg.style.setProperty("--av-hair", colours.hair);
    svg.style.setProperty("--av-top", colours.top);
    svg.style.setProperty("--av-bg", colours.bg);
    const layers = (AVATAR_BACK[look] ? ["av-" + look + "-back"] : []).concat(["av-body", "av-" + look + "-front"]);
    layers.forEach((id) => {
      const use = document.createElementNS(SVG_NS, "use");
      use.setAttribute("href", "#" + id);
      svg.appendChild(use);
    });
    return svg;
  };

  $("#teamList").replaceChildren(...TEAM.map((person, index) => {
    const li = el("li", "person reveal");
    li.dataset.tilt = "";
    li.dataset.tiltMax = "6";
    li.appendChild(avatar(person.look, index));
    li.appendChild(el("h3", "", person.name));
    li.appendChild(el("p", "person-role", person.role));
    li.appendChild(el("p", "person-line", person.line));
    return li;
  }));

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, header shadow, menu marker
  // ---------------------------------------------------------------------
  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(group.indexOf(node) % 4));
  });
  const showNode = (node) => node.classList.add("is-in");
  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { showNode(entry.target); revealer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((node) => revealer.observe(node));
    // Safety net: if the browser is slow to report what is on screen, show it anyway.
    // It runs once soon after the page opens, and again each time scrolling stops.
    const showVisible = () => {
      reveals.forEach((node) => {
        if (!node.classList.contains("is-in") && node.getBoundingClientRect().top < window.innerHeight) {
          showNode(node);
          revealer.unobserve(node);
        }
      });
    };
    window.setTimeout(showVisible, 1200);
    let revealTimer = 0;
    window.addEventListener("scroll", () => {
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(showVisible, 200);
    }, { passive: true });

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
    reveals.forEach(showNode);
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
  form.elements.name.addEventListener("input", () => { formError.hidden = true; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"), 60);
    if (!name) {
      formError.hidden = false;
      form.elements.name.focus();
      return;
    }
    formError.hidden = true;
    const day = clean(data.get("day"), 40);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I want to ask about: " + data.get("need") + ".",
      day ? "Best day for me: " + day + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint ----------
  setState({});
})();
