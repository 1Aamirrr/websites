(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client. Nothing else needs editing.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Greenkey Realty",
    area: "Dadar",
    city: "Mumbai",
    since: 2007,
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    nearby: ["Dadar East", "Dadar West", "Matunga", "Mahim", "Prabhadevi", "Parel", "Wadala", "Sion"],
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Aamir Behlim",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // ---------------------------------------------------------------------
  // 2. LISTINGS. One block per property.
  //    deal: "sale" or "rent".   kind: "1", "2", "3" (BHK) or "commercial".
  //    amount: the price in rupees, as a plain number (rent = per month).
  //    photos: the first photo is the one shown on the card.
  // ---------------------------------------------------------------------
  const LISTINGS = [
    {
      id: "S-101", deal: "sale", kind: "2", title: "2 BHK flat", amount: 14500000, isNew: true,
      sqft: 780, floor: "7th of 14", furnish: "Semi-furnished", baths: 2, parking: "1 covered", facing: "East",
      note: "5 minutes from the station.",
      desc: "Bright corner flat with cross ventilation and a balcony off the living room. The society has a lift, power backup and a children's play area.",
      amenities: ["Lift", "Power backup", "24-hour security", "Play area"],
      photos: ["1560448204-e02f11c3d0e2", "1505693416388-ac5ce068fe85", "1556911220-bff31c812dba"]
    },
    {
      id: "R-204", deal: "rent", kind: "1", title: "1 BHK flat", amount: 32000, isNew: false,
      sqft: 450, floor: "3rd of 7", furnish: "Furnished", baths: 1, parking: "Bike only", facing: "North",
      note: "Families and working professionals welcome.",
      desc: "Comes with a bed, wardrobe, fridge and washing machine. The deposit is three months of rent.",
      amenities: ["Lift", "Piped gas", "Water 24 hours"],
      photos: ["1502672260266-1c1ef2d93688", "1522771739844-6a9f6d5f14af", "1552321554-5fefe8c9ef14"]
    },
    {
      id: "S-102", deal: "sale", kind: "3", title: "3 BHK flat", amount: 26000000, isNew: true,
      sqft: 1150, floor: "11th of 22", furnish: "Unfurnished", baths: 3, parking: "2 covered", facing: "West",
      note: "Garden-facing, quiet lane.",
      desc: "Large living room, three bedrooms with attached bathrooms and a separate utility area. Clubhouse and gym in the complex.",
      amenities: ["Clubhouse", "Gym", "Lift", "Power backup", "Garden"],
      photos: ["1505691938895-1758d7feb511", "1540518614846-7eded433c457", "1484154218962-a197022b5858"]
    },
    {
      id: "R-205", deal: "rent", kind: "2", title: "2 BHK flat", amount: 55000, isNew: false,
      sqft: 720, floor: "5th of 12", furnish: "Semi-furnished", baths: 2, parking: "1 covered", facing: "East",
      note: "Gated society with lift and security.",
      desc: "Modular kitchen, wardrobes in both bedrooms and a geyser in each bathroom. Free from the 1st of next month.",
      amenities: ["Lift", "24-hour security", "Modular kitchen", "Piped gas"],
      photos: ["1522708323590-d24dbb6b0267", "1616594039964-ae9021a400a0", "1584622650111-993a426fbf0a"]
    },
    {
      id: "S-103", deal: "sale", kind: "1", title: "1 BHK flat", amount: 7800000, isNew: false,
      sqft: 410, floor: "2nd of 4", furnish: "Unfurnished", baths: 1, parking: "Open", facing: "South",
      note: "Good for first-time buyers.",
      desc: "Well-kept flat in a small, friendly society. Walking distance to the market, school and bus stop.",
      amenities: ["Water 24 hours", "Society office", "Close to market"],
      photos: ["1493809842364-78817add7ffb", "1586023492125-27b2c045efd7", "1552321554-5fefe8c9ef14"]
    },
    {
      id: "S-104", deal: "sale", kind: "commercial", title: "Shop", amount: 9500000, isNew: true,
      sqft: 240, floor: "Ground floor", furnish: "Bare shell", baths: 1, parking: "On street", facing: "Main road",
      note: "Wide frontage on a busy market road.",
      desc: "12-foot frontage with a loft for storage. Suits a clinic, salon or retail shop.",
      amenities: ["12 ft frontage", "Loft", "Three-phase power"],
      photos: ["1441986300917-64674bd600d8", "1567401893414-76b7b1e5a7a5", "1604719312566-8912e9227c6a"]
    },
    {
      id: "R-206", deal: "rent", kind: "commercial", title: "Office", amount: 85000, isNew: false,
      sqft: 900, floor: "4th of 9", furnish: "Fully fitted", baths: 2, parking: "2 covered", facing: "North",
      note: "Ready office with a meeting room.",
      desc: "12 workstations, a manager's cabin, a meeting room and a pantry. Central air conditioning and two lifts.",
      amenities: ["12 workstations", "Meeting room", "Central AC", "Lift"],
      photos: ["1497366216548-37526070297c", "1497366811353-6870744d04b2", "1524758631624-e2822e304c36"]
    },
    {
      id: "R-207", deal: "rent", kind: "3", title: "3 BHK flat", amount: 95000, isNew: false,
      sqft: 1200, floor: "15th of 30", furnish: "Furnished", baths: 3, parking: "2 covered", facing: "West",
      note: "High floor with an open view.",
      desc: "Fully furnished, with air conditioners in every room. Swimming pool, gym and clubhouse in the tower.",
      amenities: ["Swimming pool", "Gym", "Clubhouse", "Power backup"],
      photos: ["1560185127-6ed189bf02f4", "1600210492486-724fe5c67fb0", "1600607687939-ce8a6c25118c"]
    },
    {
      id: "S-105", deal: "sale", kind: "2", title: "2 BHK flat", amount: 11200000, isNew: false,
      sqft: 650, floor: "4th of 7", furnish: "Semi-furnished", baths: 2, parking: "1 open", facing: "North-east",
      note: "Renovated last year.",
      desc: "New flooring, new bathrooms and a modular kitchen. Ready to move in.",
      amenities: ["Lift", "Renovated", "Modular kitchen"],
      photos: ["1582037928769-181f2644ecb7", "1554995207-c18c203602cb", "1522771739844-6a9f6d5f14af"]
    }
  ];

  // ---------------------------------------------------------------------
  // 3. A link like  ?firm=Lan+Marc+Realty&area=Andheri  shows the page
  //    with that firm name and area, so one sample works for many brokers.
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
  const tidy = (x, digits) => String(parseFloat(x.toFixed(digits)));
  const shortMoney = (n) =>
    n >= 1e7 ? "₹" + tidy(n / 1e7, 2) + " Cr" : n >= 1e5 ? "₹" + tidy(n / 1e5, 1) + " Lakh" : inr(n);
  const priceText = (item) => (item.deal === "rent" ? inr(item.amount) + " a month" : shortMoney(item.amount));

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  // Small pop-up message. Uses the one inside the details window when that is open.
  const toastTimers = new WeakMap();
  const toast = (message) => {
    const sheetEl = $("#sheet");
    const node = sheetEl.open ? $("#sheetToast") : $("#toast");
    node.textContent = message;
    node.classList.add("is-on");
    clearTimeout(toastTimers.get(node));
    toastTimers.set(node, setTimeout(() => node.classList.remove("is-on"), 2200));
  };

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Property in " + area + ", " + CONFIG.city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = CONFIG.city; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I am looking for a property in " + area + ".");
  });
  $$('[data-wa="owner"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I own a property in " + area + " and want to list it with you.");
  });
  if (phone) {
    $$("[data-call]").forEach((node) => { node.href = "tel:+" + phone; });
    $$("[data-phone-text]").forEach((node) => { node.textContent = prettyPhone(phone); });
  }

  const years = Math.max(1, new Date().getFullYear() - CONFIG.since);
  $("#statYears").textContent = String(years);
  $("#statYears").dataset.count = String(years);
  $("#statLive").textContent = String(LISTINGS.length);
  $("#statLive").dataset.count = String(LISTINGS.length);
  $("#heroCount").textContent = String(LISTINGS.length);

  // ---------- Sample notice at the top ----------
  $("#demoText").textContent = customFirm
    ? "Sample made for " + firm + " by " + CONFIG.builtBy + ". All details and properties are examples."
    : "Sample website by " + CONFIG.builtBy + ". All details and properties are examples.";
  const builderNumber = CONFIG.builtByWhatsApp.replace(/\D/g, "");
  if (builderNumber) {
    const link = $("#demoLink");
    link.href = waLink("Hi " + CONFIG.builtBy.split(" ")[0] + ", I saw the sample website for " + firm + ". I want one.", builderNumber);
    link.hidden = false;
  }

  // ---------- Areas and map ----------
  const areaList = $("#areaList");
  (customArea ? [area, "Nearby areas on request"] : CONFIG.nearby).forEach((name) => {
    const li = el("li");
    li.appendChild(icon("pin"));
    li.appendChild(el("span", "", name));
    areaList.appendChild(li);
  });
  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + CONFIG.city) + "&output=embed";

  // ---------------------------------------------------------------------
  // Saved properties (the heart button). Kept on the visitor's own phone.
  // ---------------------------------------------------------------------
  const STORE_KEY = "broker-sample-saved";
  const saved = new Set();
  try {
    JSON.parse(window.localStorage.getItem(STORE_KEY) || "[]").forEach((id) => {
      if (LISTINGS.some((item) => item.id === id)) { saved.add(id); }
    });
  } catch (error) { /* storage is blocked: saving still works until the page closes */ }

  const persistSaved = () => {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(saved))); } catch (error) { /* ignore */ }
  };

  const syncSaved = () => {
    $$("[data-save]").forEach((button) => {
      const on = saved.has(button.dataset.save);
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", (on ? "Remove from saved: " : "Save: ") + button.dataset.title);
    });
    const picked = LISTINGS.filter((item) => saved.has(item.id));
    $("#shortlist").hidden = picked.length === 0;
    document.body.classList.toggle("has-saved", picked.length > 0);
    $("#shortlistText").textContent = picked.length + " saved";
    $("#shortlistSend").href = waLink(
      "Hello " + firm + ", I shortlisted these properties in " + area + ":\n" +
      picked.map((item) => "- " + item.title + ", " + priceText(item) + " (ID " + item.id + ")").join("\n") +
      "\nPlease share details.");
  };

  const toggleSaved = (id) => {
    if (saved.has(id)) { saved.delete(id); } else { saved.add(id); }
    persistSaved();
    syncSaved();
    toast(saved.has(id) ? "Saved to your list" : "Removed from your list");
  };

  $("#shortlistClear").addEventListener("click", () => {
    saved.clear();
    persistSaved();
    syncSaved();
    toast("Saved list cleared");
  });

  // ---------------------------------------------------------------------
  // Listing cards
  // ---------------------------------------------------------------------
  const buildCard = (item, index) => {
    const card = el("article", "card");
    card.style.setProperty("--i", String(index));
    card.dataset.tilt = "";
    card.dataset.tiltMax = "5";

    const photo = el("div", "card-photo");
    const open = el("button", "card-open");
    open.type = "button";
    open.setAttribute("aria-label", "See details: " + item.title + ", " + priceText(item));
    open.addEventListener("click", () => openSheet(item.id));
    const img = document.createElement("img");
    img.loading = index < 2 ? "eager" : "lazy";
    img.alt = "";
    img.width = 800;
    img.height = 500;
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(item.photos[0], 800, 500);
    open.appendChild(img);
    photo.appendChild(open);

    const tags = el("div", "card-tags");
    tags.appendChild(el("span", "badge " + item.deal, item.deal === "rent" ? "For rent" : "For sale"));
    if (item.isNew) { tags.appendChild(el("span", "badge new", "New")); }
    photo.appendChild(tags);

    const heart = el("button", "heart");
    heart.type = "button";
    heart.dataset.save = item.id;
    heart.dataset.title = item.title + ", " + priceText(item);
    heart.appendChild(icon("heart"));
    heart.addEventListener("click", () => toggleSaved(item.id));
    photo.appendChild(heart);
    card.appendChild(photo);

    const body = el("div", "card-body");

    const priceRow = el("div", "price-row");
    const price = el("p", "price", item.deal === "rent" ? inr(item.amount) : shortMoney(item.amount));
    if (item.deal === "rent") {
      price.appendChild(document.createTextNode(" "));
      price.appendChild(el("small", "", "a month"));
    }
    priceRow.appendChild(price);
    priceRow.appendChild(el("span", "card-id", "ID " + item.id));
    body.appendChild(priceRow);

    body.appendChild(el("h3", "card-title", item.title));

    const where = el("p", "card-where");
    where.appendChild(icon("pin"));
    where.appendChild(el("span", "", area + ", " + CONFIG.city));
    body.appendChild(where);

    const facts = el("div", "facts");
    [["area", item.sqft.toLocaleString("en-IN") + " sq ft"], ["layers", item.floor], ["check", item.furnish]].forEach(([name, text]) => {
      const fact = el("span", "fact");
      fact.appendChild(icon(name));
      fact.appendChild(document.createTextNode(text));
      facts.appendChild(fact);
    });
    body.appendChild(facts);

    body.appendChild(el("p", "card-note", item.note));

    const actions = el("div", "card-actions");
    const wa = el("a", "btn btn-wa btn-3d");
    wa.dataset.ripple = "";
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.href = enquiryLink(item);
    wa.appendChild(icon("wa", true));
    wa.appendChild(el("span", "", "WhatsApp"));
    wa.setAttribute("aria-label", "WhatsApp enquiry: " + item.title + ", ID " + item.id);
    actions.appendChild(wa);

    const details = el("button", "btn btn-ghost");
    details.type = "button";
    details.appendChild(el("span", "", "Details"));
    details.appendChild(icon("arrow"));
    details.setAttribute("aria-label", "Details: " + item.title + ", ID " + item.id);
    details.addEventListener("click", () => openSheet(item.id));
    actions.appendChild(details);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  };

  const enquiryLink = (item) =>
    waLink("Hello " + firm + ", I am interested in the " + item.title + " in " + area + " (" + priceText(item) + ", ID " + item.id + "). Please share details.");

  // ---------------------------------------------------------------------
  // Filters and sorting
  // ---------------------------------------------------------------------
  const state = { deal: "all", kind: "all", sort: "new" };
  const grid = $("#grid");
  const empty = $("#empty");
  const count = $("#resultCount");

  const render = () => {
    const shown = LISTINGS.filter((item) =>
      (state.deal === "all" || item.deal === state.deal) &&
      (state.kind === "all" || item.kind === state.kind));
    if (state.sort === "low") { shown.sort((a, b) => a.amount - b.amount); }
    if (state.sort === "high") { shown.sort((a, b) => b.amount - a.amount); }
    grid.replaceChildren(...shown.map(buildCard));
    grid.hidden = shown.length === 0;
    empty.hidden = shown.length !== 0;
    count.textContent = shown.length === 1 ? "1 property" : shown.length + " properties";
    syncSaved();
  };

  const setState = (patch) => {
    Object.assign(state, patch);
    $$(".seg-btn").forEach((button) => {
      const on = button.dataset.deal === state.deal;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    $$(".chip").forEach((button) => {
      const on = button.dataset.kind === state.kind;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    $("#sort").value = state.sort;
    $("#qsDeal").value = state.deal;
    $("#qsKind").value = state.kind;
    render();
  };

  $$(".seg-btn").forEach((button) => button.addEventListener("click", () => setState({ deal: button.dataset.deal })));
  $$(".chip").forEach((button) => button.addEventListener("click", () => setState({ kind: button.dataset.kind })));
  $("#sort").addEventListener("change", (event) => setState({ sort: event.target.value }));
  $("#resetFilters").addEventListener("click", () => setState({ deal: "all", kind: "all" }));

  const scrollToId = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  $("#quickSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    setState({ deal: $("#qsDeal").value, kind: $("#qsKind").value });
    scrollToId("listings");
  });

  // ---------------------------------------------------------------------
  // Property details window
  // ---------------------------------------------------------------------
  const sheet = $("#sheet");
  const gallery = $("#sheetGallery");
  const dots = $("#galDots");
  const galPrev = $("#galPrev");
  const galNext = $("#galNext");
  let current = null;

  // galPos is the photo the visitor asked for. It is tracked on its own, so
  // quick taps on the arrows keep moving even while the slide is still sliding.
  let galPos = 0;
  let galSettle = 0;
  const galSync = () => {
    Array.from(dots.children).forEach((dot, i) => dot.classList.toggle("is-on", i === galPos));
    galPrev.disabled = galPos <= 0;
    galNext.disabled = galPos >= gallery.children.length - 1;
  };
  const galGo = (index) => {
    galPos = Math.max(0, Math.min(gallery.children.length - 1, index));
    galSync();
    gallery.scrollTo({ left: galPos * gallery.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
  };
  // After a finger swipe stops, read which photo is in view.
  gallery.addEventListener("scroll", () => {
    clearTimeout(galSettle);
    galSettle = setTimeout(() => {
      galPos = Math.round(gallery.scrollLeft / Math.max(1, gallery.clientWidth));
      galSync();
    }, 140);
  }, { passive: true });
  galPrev.addEventListener("click", () => galGo(galPos - 1));
  galNext.addEventListener("click", () => galGo(galPos + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); galGo(galPos + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); galGo(galPos - 1); }
  });

  const pageUrl = () => window.location.pathname + window.location.search;

  function openSheet(id, fromLink) {
    const item = LISTINGS.find((entry) => entry.id === id);
    if (!item) { return; }
    current = item;

    gallery.replaceChildren(...item.photos.map((photoId, i) => {
      const img = document.createElement("img");
      img.alt = item.title + ", photo " + (i + 1) + " of " + item.photos.length;
      img.loading = i === 0 ? "eager" : "lazy";
      img.addEventListener("error", () => { img.style.visibility = "hidden"; });
      img.src = photoUrl(photoId, 1200, 750);
      return img;
    }));
    dots.replaceChildren(...item.photos.map(() => el("span")));

    const tags = $("#sheetTags");
    tags.replaceChildren(el("span", "badge " + item.deal, item.deal === "rent" ? "For rent" : "For sale"));
    if (item.isNew) { tags.appendChild(el("span", "badge new", "New")); }
    tags.appendChild(el("span", "card-id", "ID " + item.id));

    const price = $("#sheetPrice");
    price.textContent = priceText(item);
    if (item.deal === "sale") {
      price.appendChild(el("small", "", inr(item.amount / item.sqft) + " per sq ft"));
    }

    $("#sheetTitle").textContent = item.title + " in " + area;
    const where = $("#sheetWhere");
    where.replaceChildren(icon("pin"), el("span", "", area + ", " + CONFIG.city + ". " + item.note));

    const commercial = item.kind === "commercial";
    const specs = [
      ["area", "Carpet area", item.sqft.toLocaleString("en-IN") + " sq ft"],
      ["layers", "Floor", item.floor],
      ["bath", commercial ? "Washrooms" : "Bathrooms", String(item.baths)],
      ["park", "Parking", item.parking],
      ["compass", "Facing", item.facing],
      ["home", commercial ? "Fit-out" : "Furnishing", item.furnish]
    ];
    $("#sheetSpecs").replaceChildren(...specs.map(([name, label, value]) => {
      const row = el("div");
      row.appendChild(icon(name));
      row.appendChild(el("dt", "", label));
      row.appendChild(el("dd", "", value));
      return row;
    }));

    $("#sheetDesc").textContent = item.desc;
    $("#sheetAmenities").replaceChildren(...item.amenities.map((name) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(document.createTextNode(name));
      return li;
    }));

    $("#sheetEmi").hidden = item.deal !== "sale";
    $("#sheetWa").href = enquiryLink(item);
    $("#sheetCall").href = phone ? "tel:+" + phone : "#contact";
    const save = $("#sheetSave");
    save.dataset.save = item.id;
    save.dataset.title = item.title + ", " + priceText(item);
    syncSaved();

    if (!sheet.open) {
      if (typeof sheet.showModal === "function") { sheet.showModal(); } else { sheet.setAttribute("open", ""); }
    }
    document.documentElement.classList.add("is-locked");
    $("#sheetScroll").scrollTop = 0;
    gallery.scrollLeft = 0;
    galPos = 0;
    galSync();
    if (!fromLink) { window.history.replaceState(null, "", pageUrl() + "#p=" + item.id); }
  }

  const closeSheet = () => {
    if (typeof sheet.close === "function" && sheet.open) { sheet.close(); } else { sheet.removeAttribute("open"); }
    onSheetClosed(); // tidy up right away; the browser's own "close" event can arrive late
  };
  const onSheetClosed = () => {
    document.documentElement.classList.remove("is-locked");
    current = null;
    if (window.location.hash.indexOf("#p=") === 0) { window.history.replaceState(null, "", pageUrl()); }
  };
  sheet.addEventListener("close", onSheetClosed);
  sheet.addEventListener("click", (event) => { if (event.target === sheet) { closeSheet(); } });
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetCall").addEventListener("click", () => { if (!phone) { closeSheet(); } });
  $("#sheetSave").addEventListener("click", () => { if (current) { toggleSaved(current.id); } });

  $("#sheetShare").addEventListener("click", async () => {
    if (!current) { return; }
    const url = window.location.origin + pageUrl() + "#p=" + current.id;
    const text = current.title + " in " + area + ", " + priceText(current);
    // Phones: the normal share menu. Computers: copy the link.
    // If neither is allowed, open WhatsApp with the link ready to send.
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text: text, url: url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
        return;
      }
    } catch (error) {
      if (error && error.name === "AbortError") { return; }
    }
    window.open(waLink(text + "\n" + url, ""), "_blank", "noopener");
  });

  // ---------------------------------------------------------------------
  // EMI calculator
  // ---------------------------------------------------------------------
  const emiPrice = $("#emiPrice");
  const emiDown = $("#emiDown");
  const emiRate = $("#emiRate");
  const emiYears = $("#emiYears");

  const setFill = (input) => {
    const min = Number(input.min);
    const max = Number(input.max);
    input.style.setProperty("--fill", ((Number(input.value) - min) / (max - min)) * 100 + "%");
  };

  const calcEmi = () => {
    const price = Number(emiPrice.value);
    const downPct = Number(emiDown.value);
    const rate = Number(emiRate.value);
    const yearsCount = Number(emiYears.value);
    const loan = price * (1 - downPct / 100);
    const monthlyRate = rate / 1200;
    const months = yearsCount * 12;
    const growth = Math.pow(1 + monthlyRate, months);
    const monthly = monthlyRate === 0 ? loan / months : (loan * monthlyRate * growth) / (growth - 1);
    const interest = monthly * months - loan;

    $("#emiPriceOut").textContent = shortMoney(price);
    $("#emiDownOut").textContent = downPct + "%";
    $("#emiRateOut").textContent = rate.toFixed(1) + "%";
    $("#emiYearsOut").textContent = yearsCount + " years";
    $("#emiValue").textContent = inr(monthly);
    $("#emiLoan").textContent = shortMoney(loan);
    $("#emiUpfront").textContent = shortMoney(price - loan);
    $("#emiInterest").textContent = shortMoney(interest);
    $("#emiBar").style.width = (loan / (loan + interest)) * 100 + "%";
    [emiPrice, emiDown, emiRate, emiYears].forEach(setFill);
    $("#emiWa").href = waLink(
      "Hello " + firm + ", my budget is about " + shortMoney(price) + " (EMI near " + inr(monthly) +
      " a month over " + yearsCount + " years). Please suggest properties in " + area + ".");
  };
  [emiPrice, emiDown, emiRate, emiYears].forEach((input) => input.addEventListener("input", calcEmi));
  calcEmi();

  $("#sheetEmi").addEventListener("click", () => {
    if (!current) { return; }
    const step = Number(emiPrice.step);
    const rounded = Math.round(current.amount / step) * step;
    emiPrice.value = String(Math.max(Number(emiPrice.min), Math.min(Number(emiPrice.max), rounded)));
    calcEmi();
    closeSheet();
    window.setTimeout(() => scrollToId("emi"), 60);
  });

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, counting numbers, header shadow, menu marker
  // ---------------------------------------------------------------------
  const countUp = (node) => {
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) { return; }
    const started = performance.now();
    const duration = 900;
    let done = false;
    const tick = (now) => {
      if (done) { return; }
      const t = Math.min(1, (now - started) / duration);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) { requestAnimationFrame(tick); }
    };
    requestAnimationFrame(tick);
    // Safety net: always land on the real number, even if the browser pauses the animation.
    window.setTimeout(() => { done = true; node.textContent = String(target); }, duration + 150);
  };

  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(group.indexOf(node)));
  });
  const showNode = (node) => {
    node.classList.add("is-in");
    const number = $(".stat-num", node);
    if (number) { countUp(number); }
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
    const budget = clean(data.get("budget"), 40);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I want to: " + data.get("need") + " in " + area + ".",
      budget ? "Budget: " + budget + "." : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------------------------------------------------------------------
  // Featured 3D carousel, and the small card floating on the top photo.
  // The newest properties come first. The turning itself is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const featured = LISTINGS.filter((item) => item.isNew).concat(LISTINGS.filter((item) => !item.isNew)).slice(0, 6);
  const ringTrack = $("#ringTrack");
  if (ringTrack) {
    featured.forEach((item) => {
      const card = el("article", "ring-card");
      const photo = el("div", "ring-photo");
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.loading = "lazy";
      img.addEventListener("error", () => img.remove());
      img.src = photoUrl(item.photos[0], 600, 400);
      photo.appendChild(img);
      const tags = el("div", "card-tags");
      tags.appendChild(el("span", "badge " + item.deal, item.deal === "rent" ? "For rent" : "For sale"));
      photo.appendChild(tags);
      card.appendChild(photo);

      const body = el("div", "ring-body");
      body.appendChild(el("p", "price", priceText(item)));
      body.appendChild(el("h3", "", item.title));
      const where = el("p", "card-where");
      where.appendChild(icon("pin"));
      where.appendChild(el("span", "", area + ", " + CONFIG.city));
      body.appendChild(where);
      const open = el("button", "btn btn-brand btn-sm btn-3d", "See details");
      open.type = "button";
      open.dataset.ripple = "";
      open.addEventListener("click", () => openSheet(item.id));
      body.appendChild(open);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  }
  if (featured[0] && $("#heroMiniPrice")) {
    $("#heroMiniPrice").textContent = priceText(featured[0]);
    $("#heroMiniTitle").textContent = featured[0].title;
    $("#heroMiniPhoto").style.backgroundImage = "url('" + photoUrl(featured[0].photos[0], 120, 120) + "')";
  }

  // ---------- First paint ----------
  render();

  // A shared link that ends in #p=S-101 opens that property straight away.
  const linked = window.location.hash.match(/^#p=([A-Za-z0-9-]+)$/);
  if (linked) { openSheet(linked[1], true); }
})();
