(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Saffron Tawa Kitchen",
    area: "Mira Road",
    city: "Mumbai",
    since: 2012,
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // Smallest order, in rupees, for home delivery. Put 0 for no minimum.
    minDelivery: 300,
    // How far the restaurant delivers, in km.
    deliveryKm: 3,
    // How many minutes a pickup order takes to be ready.
    pickupMinutes: 20,
    // One line that helps people find you. Shown next to the address.
    landmark: "2 minutes from the station",
    // The dish in the big photo at the top (its id from the menu below).
    // Its name and price show on the small card that floats over the photo.
    heroDish: "paneer-butter-masala",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Aamir Behlim",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // ---------------------------------------------------------------------
  // 2. TIMINGS. One line per day, Sunday first. Use the 24-hour clock.
  //    Two pairs in a day mean there is an afternoon break.
  //    An empty list, open: [], means closed on that day.
  //    The "Open now" badge and the table-booking times are worked out from this.
  // ---------------------------------------------------------------------
  const HOURS = [
    { day: "Sunday",    open: [["11:00", "15:30"], ["19:00", "23:30"]] },
    { day: "Monday",    open: [["11:00", "15:30"], ["19:00", "23:00"]] },
    { day: "Tuesday",   open: [["11:00", "15:30"], ["19:00", "23:00"]] },
    { day: "Wednesday", open: [["11:00", "15:30"], ["19:00", "23:00"]] },
    { day: "Thursday",  open: [["11:00", "15:30"], ["19:00", "23:00"]] },
    { day: "Friday",    open: [["11:00", "15:30"], ["19:00", "23:30"]] },
    { day: "Saturday",  open: [["11:00", "15:30"], ["19:00", "23:30"]] }
  ];

  // ---------------------------------------------------------------------
  // 3. MENU.
  //    SECTIONS are the buttons above the menu, in the order they are shown.
  //    Then one line per dish:
  //      section: the id of its section.     veg: true = green mark, false = red-brown mark.
  //      price: in rupees, as a plain number. tags: "Bestseller", "Spicy" or leave it as [].
  //      photo: optional. Leave it out and the row shows without a photo.
  //    The turning carousel near the top shows the first six dishes that are
  //    tagged "Bestseller" and have a photo.
  // ---------------------------------------------------------------------
  const SECTIONS = [
    { id: "snacks", name: "Snacks and starters" },
    { id: "main", name: "Main course" },
    { id: "breads", name: "Breads and rice" },
    { id: "desserts", name: "Desserts" },
    { id: "drinks", name: "Drinks" }
  ];

  const MENU = [
    { id: "samosa", section: "snacks", name: "Punjabi Samosa (2 pieces)", veg: true, price: 50, tags: [],
      desc: "Crisp pastry filled with spiced potato and peas, with green chutney.", photo: "1601050690597-df0568f70950" },
    { id: "paneer-tikka", section: "snacks", name: "Paneer Tikka", veg: true, price: 260, tags: ["Bestseller"],
      desc: "Paneer cubes marinated in curd and spices, roasted in the tandoor.", photo: "1567188040759-fb8a883dc6d8" },
    { id: "masala-dosa", section: "snacks", name: "Masala Dosa", veg: true, price: 140, tags: ["Bestseller"],
      desc: "Crisp dosa with potato filling, sambar and coconut chutney.", photo: "1668236543090-82eba5ee5976" },
    { id: "pav-bhaji", section: "snacks", name: "Pav Bhaji", veg: true, price: 160, tags: ["Bestseller"],
      desc: "Mashed vegetables cooked in butter and spices, with soft buttered pav.", photo: "1606491956689-2ea866880c84" },
    { id: "chicken-tikka", section: "snacks", name: "Chicken Tikka", veg: false, price: 290, tags: [],
      desc: "Boneless chicken marinated overnight and grilled on skewers.", photo: "1599487488170-d11ec9c172f0" },
    { id: "chicken-chilli", section: "snacks", name: "Chicken Chilli Dry", veg: false, price: 270, tags: ["Spicy"],
      desc: "Fried chicken tossed with capsicum, onion and green chillies.", photo: "1628294895950-9805252327bc" },

    { id: "paneer-butter-masala", section: "main", name: "Paneer Butter Masala", veg: true, price: 270, tags: ["Bestseller"],
      desc: "Soft paneer in a creamy tomato and butter gravy.", photo: "1631452180519-c014fe946bc7" },
    { id: "dal-tadka", section: "main", name: "Dal Tadka", veg: true, price: 190, tags: [],
      desc: "Yellow dal with a tadka of garlic, cumin and ghee." },
    { id: "veg-kolhapuri", section: "main", name: "Veg Kolhapuri", veg: true, price: 230, tags: ["Spicy"],
      desc: "Mixed vegetables in a hot Kolhapuri masala." },
    { id: "veg-thali", section: "main", name: "Veg Thali", veg: true, price: 220, tags: [],
      desc: "Two sabzis, dal, rice, three rotis, salad and a sweet.", photo: "1546833999-b9f581a1996d" },
    { id: "butter-chicken", section: "main", name: "Butter Chicken", veg: false, price: 320, tags: ["Bestseller"],
      desc: "Tandoori chicken in a smooth tomato, butter and cream gravy.", photo: "1565557623262-b51c2513a641" },
    { id: "mutton-rogan-josh", section: "main", name: "Mutton Rogan Josh", veg: false, price: 390, tags: ["Spicy"],
      desc: "Tender mutton cooked slowly in a rich red gravy." },

    { id: "butter-naan", section: "breads", name: "Butter Naan", veg: true, price: 50, tags: [],
      desc: "Soft tandoor bread brushed with butter." },
    { id: "tandoori-roti", section: "breads", name: "Tandoori Roti", veg: true, price: 25, tags: [],
      desc: "Whole wheat roti baked in the tandoor." },
    { id: "jeera-rice", section: "breads", name: "Jeera Rice", veg: true, price: 150, tags: [],
      desc: "Basmati rice tossed with cumin and ghee." },
    { id: "veg-biryani", section: "breads", name: "Veg Dum Biryani", veg: true, price: 240, tags: [],
      desc: "Basmati rice cooked on dum with vegetables and mint. Comes with raita.", photo: "1642821373181-696a54913e93" },
    { id: "chicken-biryani", section: "breads", name: "Chicken Dum Biryani", veg: false, price: 300, tags: ["Bestseller"],
      desc: "Basmati rice and chicken cooked on dum. Comes with raita.", photo: "1631515243349-e0cb75fb8d3a" },

    { id: "gulab-jamun", section: "desserts", name: "Gulab Jamun (2 pieces)", veg: true, price: 80, tags: [],
      desc: "Served warm, in sugar syrup." },
    { id: "gajar-halwa", section: "desserts", name: "Gajar Halwa", veg: true, price: 110, tags: [],
      desc: "Carrots cooked slowly in milk and ghee, with dry fruits.", photo: "1517244683847-7456b63c5969" },
    { id: "caramel-ice-cream", section: "desserts", name: "Vanilla Ice Cream with Caramel", veg: true, price: 120, tags: [],
      desc: "Two scoops with warm caramel sauce.", photo: "1551024506-0bccd828d307" },

    { id: "masala-chai", section: "drinks", name: "Masala Chai", veg: true, price: 30, tags: [],
      desc: "Fresh tea boiled with ginger and cardamom." },
    { id: "sweet-lassi", section: "drinks", name: "Sweet Lassi", veg: true, price: 80, tags: [],
      desc: "Thick curd lassi, served chilled." },
    { id: "iced-tea", section: "drinks", name: "Lemon Iced Tea", veg: true, price: 110, tags: [],
      desc: "Chilled tea with lemon and mint.", photo: "1556679343-c7306c1976bc" },
    { id: "cappuccino", section: "drinks", name: "Cappuccino", veg: true, price: 110, tags: [],
      desc: "Hot coffee with steamed milk and foam.", photo: "1561336313-0bd5e0b27ec8" }
  ];

  // ---------------------------------------------------------------------
  // 4. TODAY'S SPECIALS. Three dishes from the menu above (use the dish id),
  //    each with one short line. They are shown first in the menu.
  // ---------------------------------------------------------------------
  const SPECIALS = [
    { id: "veg-thali", line: "Today's sabzis are aloo gobi and paneer mutter." },
    { id: "chicken-tikka", line: "Straight off the grill, with mint chutney." },
    { id: "gajar-halwa", line: "A winter favourite, made fresh this morning." }
  ];

  // ---------------------------------------------------------------------
  // 5. PHOTOS of the food and the place. The first one is shown bigger.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { photo: "1589778655375-3e622a9fc91c", caption: "The full thali at lunch" },
    { photo: "1552590635-27c2c2128abf", caption: "Handi biryani, cooked on dum" },
    { photo: "1537047902294-62a40c20a6ae", caption: "Sofa seating for families" },
    { photo: "1596040033229-a9821ebd058d", caption: "Spices ground every morning" },
    { photo: "1554118811-1e0d58224f24", caption: "The cafe corner" }
  ];

  // ---------------------------------------------------------------------
  // 6. A link like  ?firm=Hotel+Sai+Sagar&area=Borivali  shows the page
  //    with that name and area, so one sample works for many restaurants.
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
  const countText = (n, one, many) => (n === 1 ? "1 " + one : n + " " + many);

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  // The green (veg) or red-brown (non-veg) square with a dot, with words for screen readers.
  const vegMark = (veg) => {
    const mark = el("span", veg ? "mark" : "mark nonveg");
    mark.appendChild(el("span", "vh", veg ? "Veg." : "Non-veg."));
    return mark;
  };

  // A photo that quietly disappears if its link ever stops working.
  const photo = (id, w, h, lazy) => {
    const img = document.createElement("img");
    img.alt = "";
    img.width = w;
    img.height = h;
    img.loading = lazy ? "lazy" : "eager";
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(id, w, h);
    return img;
  };

  const scrollToId = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
  };

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Restaurant in " + area + ", " + CONFIG.city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = CONFIG.city; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $$("[data-pickup]").forEach((node) => { node.textContent = String(CONFIG.pickupMinutes); });
  $$("[data-km]").forEach((node) => { node.textContent = String(CONFIG.deliveryKm); });
  $$("[data-min]").forEach((node) => { node.textContent = inr(CONFIG.minDelivery); });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I have a question about your restaurant in " + area + ".");
  });
  $$('[data-wa="party"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to ask about a party or bulk order.");
  });
  if (phone) {
    $$("[data-call]").forEach((node) => { node.href = "tel:+" + phone; });
    $$("[data-phone-text]").forEach((node) => { node.textContent = prettyPhone(phone); });
  }

  // ---------- Sample notice at the top ----------
  $("#demoText").textContent = customFirm
    ? "Sample made for " + firm + " by " + CONFIG.builtBy + ". All details, dishes and prices are examples."
    : "Sample website by " + CONFIG.builtBy + ". All details, prices and timings are examples.";
  const builderNumber = CONFIG.builtByWhatsApp.replace(/\D/g, "");
  if (builderNumber) {
    const link = $("#demoLink");
    link.href = waLink("Hi " + CONFIG.builtBy.split(" ")[0] + ", I saw the sample website for " + firm + ". I want one.", builderNumber);
    link.hidden = false;
  }

  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + CONFIG.city) + "&output=embed";

  // ---------------------------------------------------------------------
  // Timings: open or closed right now, and the table of hours
  // ---------------------------------------------------------------------
  const DAY = 24 * 60;
  const WEEK = 7 * DAY;
  const toMinutes = (text) => {
    const parts = String(text).split(":").map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  };
  // 690 becomes "11:30 am"
  const clock = (minutes) => {
    const inDay = ((minutes % DAY) + DAY) % DAY;
    const hour24 = Math.floor(inDay / 60);
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return hour12 + ":" + String(inDay % 60).padStart(2, "0") + (hour24 < 12 ? " am" : " pm");
  };
  const slotText = (pair) => clock(toMinutes(pair[0])) + " to " + clock(toMinutes(pair[1]));

  // Every open stretch of the week, counted in minutes from Sunday midnight.
  // A closing time that is earlier than the opening time means "after midnight".
  const openPeriods = [];
  HOURS.forEach((entry, dayIndex) => {
    entry.open.forEach((pair) => {
      const start = dayIndex * DAY + toMinutes(pair[0]);
      let end = dayIndex * DAY + toMinutes(pair[1]);
      if (end <= start) { end += DAY; }
      openPeriods.push({ start: start, end: end });
    });
  });

  const openStatus = (now) => {
    const t = now.getDay() * DAY + now.getHours() * 60 + now.getMinutes();
    const current = openPeriods.find((p) => (t >= p.start && t < p.end) || (t + WEEK >= p.start && t + WEEK < p.end));
    if (current) { return { open: true, text: "Open now, closes at " + clock(current.end) }; }

    let next = null;
    openPeriods.forEach((p) => {
      const wait = (p.start - t + WEEK) % WEEK;
      if (!next || wait < next.wait) { next = { wait: wait, start: p.start }; }
    });
    if (!next) { return { open: false, text: "Closed now" }; }
    const daysAway = Math.floor((t + next.wait) / DAY) - Math.floor(t / DAY);
    const dayName = HOURS[Math.floor((next.start % WEEK) / DAY)].day;
    const when = daysAway === 0 ? "" : daysAway === 1 ? "tomorrow " : "on " + dayName + " ";
    return { open: false, text: "Closed now, opens " + when + "at " + clock(next.start) };
  };

  // Monday first, Sunday last. Days next to each other with the same hours share one row,
  // for example "Monday to Thursday".
  const buildHours = (todayIndex) => {
    const groups = [];
    [1, 2, 3, 4, 5, 6, 0].forEach((dayIndex) => {
      const key = JSON.stringify(HOURS[dayIndex].open);
      const last = groups[groups.length - 1];
      if (last && last.key === key) { last.days.push(dayIndex); } else { groups.push({ key: key, days: [dayIndex] }); }
    });
    $("#hoursBody").replaceChildren(...groups.map((group) => {
      const first = HOURS[group.days[0]].day;
      const lastDay = HOURS[group.days[group.days.length - 1]].day;
      const hasToday = group.days.indexOf(todayIndex) !== -1;
      const row = el("tr", hasToday ? "is-today" : "");
      const name = el("th", "", group.days.length === 1 ? first : first + " to " + lastDay);
      name.scope = "row";
      if (hasToday) { name.append(" ", el("span", "today-tag", "Today")); }
      const times = el("td");
      const slots = HOURS[group.days[0]].open;
      if (slots.length === 0) { times.appendChild(el("span", "", "Closed")); }
      slots.forEach((pair) => times.appendChild(el("span", "", slotText(pair))));
      row.append(name, times);
      return row;
    }));
  };

  let shownDay = -1;
  const refreshStatus = () => {
    const now = new Date();
    const status = openStatus(now);
    const todaySlots = HOURS[now.getDay()].open;
    $("#statusText").textContent = status.text;
    $("#statusToday").textContent = todaySlots.length ? "Today: " + todaySlots.map(slotText).join(" and ") : "Closed today";
    $("#heroStatus").textContent = status.open ? "Open now" : "Closed now";
    $("#contactToday").textContent = status.text;
    [$("#statusCard"), $("#heroChip")].forEach((node) => {
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
    });
    const pill = $("#hoursPill");
    pill.textContent = status.open ? "Open now" : "Closed now";
    pill.classList.toggle("is-closed", !status.open);
    pill.hidden = false;
    if (shownDay !== now.getDay()) {
      shownDay = now.getDay();
      buildHours(shownDay);
    }
  };
  refreshStatus();
  // Keep the badge right while the page stays open
  window.setInterval(refreshStatus, 30000);

  // ---------------------------------------------------------------------
  // Cart. Kept on the visitor's own phone, so it survives a page reload.
  // ---------------------------------------------------------------------
  const STORE_KEY = "restaurant-sample-cart";
  const MAX_EACH = 20;
  const dishById = new Map(MENU.map((dish) => [dish.id, dish]));
  const cart = new Map();
  let orderType = "delivery";
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}") || {};
    (Array.isArray(saved.items) ? saved.items : []).forEach((pair) => {
      const id = Array.isArray(pair) ? pair[0] : "";
      const qty = Array.isArray(pair) ? Math.floor(Number(pair[1])) : 0;
      if (dishById.has(id) && qty >= 1) { cart.set(id, Math.min(MAX_EACH, qty)); }
    });
    if (saved.type === "pickup") { orderType = "pickup"; }
  } catch (error) { /* storage is blocked: the cart still works until the page closes */ }

  const persistCart = () => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ items: Array.from(cart), type: orderType }));
    } catch (error) { /* ignore */ }
  };

  const cartLines = () => Array.from(cart, (pair) => ({ dish: dishById.get(pair[0]), qty: pair[1] }));
  const cartCount = () => cartLines().reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = () => cartLines().reduce((sum, line) => sum + line.qty * line.dish.price, 0);

  // The "Add" button that turns into  minus / count / plus.
  const paintQty = (box) => {
    const qty = cart.get(box.dataset.qty) || 0;
    $('[data-act="add"]', box).hidden = qty > 0;
    $(".qty", box).hidden = qty === 0;
    $(".qty-num", box).textContent = String(qty);
    $('[data-act="plus"]', box).disabled = qty >= MAX_EACH;
    const holder = box.closest(".dish, .ring-card");
    if (holder) { holder.classList.toggle("in-cart", qty > 0); }
  };

  // big = true gives the wide "Add to order" button used on the carousel cards.
  const qtyControl = (dish, big) => {
    const box = el("div", big ? "qty-box qty-box-wide" : "qty-box");
    box.dataset.qty = dish.id;

    const add = el("button", big ? "btn btn-brand btn-block btn-3d" : "btn-add");
    add.type = "button";
    add.dataset.act = "add";
    if (big) { add.dataset.ripple = ""; }
    add.setAttribute("aria-label", "Add " + dish.name + " to your order");
    add.appendChild(el("span", "", big ? "Add to order" : "Add"));
    add.appendChild(icon("plus"));

    const stepper = el("div", "qty");
    stepper.setAttribute("role", "group");
    stepper.setAttribute("aria-label", "How many: " + dish.name);
    const minus = el("button", "qty-btn");
    minus.type = "button";
    minus.dataset.act = "minus";
    minus.setAttribute("aria-label", "One less: " + dish.name);
    minus.appendChild(icon("minus"));
    const plus = el("button", "qty-btn");
    plus.type = "button";
    plus.dataset.act = "plus";
    plus.setAttribute("aria-label", "One more: " + dish.name);
    plus.appendChild(icon("plus"));
    stepper.append(minus, el("span", "qty-num", "0"), plus);

    box.append(add, stepper);
    paintQty(box);
    return box;
  };

  // ---------- The cart window ----------
  const cartDialog = $("#cart");
  const cartBar = $("#cartBar");
  const cartList = $("#cartList");
  const cartForm = $("#cartForm");
  const cartName = $("#cartName");
  const cartAddress = $("#cartAddress");
  const cartSend = $("#cartSend");
  const cartError = $("#cartError");
  const cartFine = $("#cartFine");
  const cartFineText = cartFine.textContent;

  const buildCartRow = (dish) => {
    const row = el("li", "cart-row");
    row.dataset.row = dish.id;
    const name = el("p", "cart-name");
    name.appendChild(vegMark(dish.veg));
    name.appendChild(el("span", "", dish.name));
    row.append(name, el("p", "cart-line"), el("p", "cart-each", inr(dish.price) + " each"), qtyControl(dish));
    return row;
  };

  // What still stops the order from being sent. Nothing wrong = null.
  const orderProblem = () => {
    const total = cartTotal();
    if (cart.size === 0) { return { text: "Your order is empty. Add a dish first." }; }
    if (orderType === "delivery" && total < CONFIG.minDelivery) {
      return { text: "Home delivery needs an order of " + inr(CONFIG.minDelivery) + " or more. Add " + inr(CONFIG.minDelivery - total) + " more, or choose Pickup." };
    }
    if (!clean(cartName.value, 60)) { return { text: "Please type your name.", field: cartName }; }
    if (orderType === "delivery" && !clean(cartAddress.value, 160)) {
      return { text: "Please type your delivery address.", field: cartAddress };
    }
    return null;
  };

  // The message that opens in WhatsApp
  const orderMessage = () => {
    const lines = ["Hello " + firm + ", I want to place an order.", ""];
    cartLines().forEach((line) => {
      lines.push(line.qty + " x " + line.dish.name + " = " + inr(line.qty * line.dish.price));
    });
    lines.push("", "Total: " + inr(cartTotal()));
    lines.push("Order type: " + (orderType === "delivery" ? "Home delivery" : "Pickup"));
    lines.push("Name: " + clean(cartName.value, 60));
    if (orderType === "delivery") { lines.push("Address: " + clean(cartAddress.value, 160)); }
    return lines.join("\n");
  };

  const syncOrderForm = () => {
    const delivery = orderType === "delivery";
    const total = cartTotal();
    const short = delivery && cart.size > 0 && total < CONFIG.minDelivery;
    $$('input[name="type"]', cartForm).forEach((input) => { input.checked = input.value === orderType; });
    $("#addressField").hidden = !delivery;

    const note = $("#typeNote");
    note.classList.toggle("is-short", short);
    if (!delivery) {
      note.textContent = "Collect it from our counter in " + area + ". Ready in about " + CONFIG.pickupMinutes + " minutes after we confirm.";
    } else if (short) {
      note.textContent = "Minimum order for home delivery is " + inr(CONFIG.minDelivery) + ". Add " + inr(CONFIG.minDelivery - total) + " more, or choose Pickup.";
    } else {
      note.textContent = "We deliver in " + area + " and up to " + CONFIG.deliveryKm + " km around." +
        (CONFIG.minDelivery > 0 ? " Minimum order " + inr(CONFIG.minDelivery) + "." : "");
    }

    // The button only carries a WhatsApp link when the order is complete.
    cartSend.href = orderProblem() ? "#menu" : waLink(orderMessage());
  };

  const syncCart = () => {
    $$("[data-qty]").forEach(paintQty);

    const rows = new Map(Array.from(cartList.children, (row) => [row.dataset.row, row]));
    rows.forEach((row, id) => { if (!cart.has(id)) { row.remove(); } });
    cartLines().forEach((line) => {
      let row = rows.get(line.dish.id);
      if (!row || !row.isConnected) {
        row = buildCartRow(line.dish);
        cartList.appendChild(row);
      }
      $(".cart-line", row).textContent = inr(line.qty * line.dish.price);
    });

    const count = cartCount();
    const total = cartTotal();
    cartBar.hidden = count === 0;
    document.body.classList.toggle("has-cart", count > 0);
    $("#cartBarCount").textContent = countText(count, "item", "items");
    $("#cartBarTotal").textContent = inr(total);
    cartBar.setAttribute("aria-label", "View your order: " + countText(count, "item", "items") + ", total " + inr(total));
    $("#cartTotal").textContent = inr(total);
    $("#cartEmpty").hidden = count > 0;
    $("#cartFull").hidden = count === 0;
    $("#cartActions").hidden = count === 0;
    syncOrderForm();
    syncBill();
    $("#orderGo").textContent = count > 0 ? "See my order" : "Start my order";
  };

  const say = (message) => { $("#cartLive").textContent = message; };

  // Any change to the order clears the old red message and the "WhatsApp is opening" line.
  const resetOrderNotes = () => {
    cartError.hidden = true;
    cartFine.textContent = cartFineText;
  };

  const bumpCartBar = () => {
    if (reduceMotion || cartBar.hidden) { return; }
    cartBar.classList.remove("is-bump");
    void cartBar.offsetWidth;
    cartBar.classList.add("is-bump");
  };

  // A small touch: for a moment the cart bar says which dish was just added.
  let addedTimer = 0;
  const showAdded = (dish) => {
    window.clearTimeout(addedTimer);
    cartBar.classList.toggle("is-added", Boolean(dish));
    if (!dish) { return; }
    $("#cartBarCount").textContent = "Added: " + dish.name;
    addedTimer = window.setTimeout(() => {
      cartBar.classList.remove("is-added");
      $("#cartBarCount").textContent = countText(cartCount(), "item", "items");
    }, 1800);
  };

  const setQty = (id, qty) => {
    const dish = dishById.get(id);
    if (!dish) { return; }
    const next = Math.max(0, Math.min(MAX_EACH, qty));
    if (next === 0) { cart.delete(id); } else { cart.set(id, next); }
    persistCart();
    resetOrderNotes();
    syncCart();
    say(next === 0
      ? dish.name + " removed. " + countText(cartCount(), "item", "items") + " in your order."
      : dish.name + ": " + next + " in your order. Total " + inr(cartTotal()) + ".");
  };

  // One listener for every Add, minus and plus button on the page and in the cart window.
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-act]");
    const box = button ? button.closest("[data-qty]") : null;
    if (!box) { return; }
    const id = box.dataset.qty;
    const act = button.dataset.act;
    const before = cart.get(id) || 0;
    setQty(id, act === "minus" ? before - 1 : before + 1);
    const after = cart.get(id) || 0;

    // Keep the keyboard on a button that is still showing.
    if (!box.isConnected) {
      (cart.size === 0 ? $("#cartBack") : $("#cartClose")).focus();
    } else if (act === "add") {
      $('[data-act="plus"]', box).focus();
    } else if (after === 0) {
      $('[data-act="add"]', box).focus();
    } else if (act === "plus" && after >= MAX_EACH) {
      $('[data-act="minus"]', box).focus();
    }
    if (!cartDialog.open) {
      bumpCartBar();
      showAdded(after > before ? dishById.get(id) : null);
    }
  });

  $$('input[name="type"]', cartForm).forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) { return; }
      orderType = input.value;
      persistCart();
      resetOrderNotes();
      syncOrderForm();
      syncBill();
    });
  });
  cartForm.addEventListener("input", () => {
    resetOrderNotes();
    syncOrderForm();
  });

  cartSend.addEventListener("click", (event) => {
    const problem = orderProblem();
    if (problem) {
      event.preventDefault();
      cartFine.textContent = cartFineText;
      cartError.textContent = problem.text;
      cartError.hidden = false;
      if (problem.field) { problem.field.focus(); }
      return;
    }
    cartError.hidden = true;
    cartFine.textContent = "WhatsApp is opening with your order. Press send there to place it.";
  });
  // Pressing Enter in the name box does the same as the button.
  cartForm.addEventListener("submit", (event) => {
    event.preventDefault();
    cartSend.click();
  });

  $("#cartClear").addEventListener("click", () => {
    cart.clear();
    persistCart();
    resetOrderNotes();
    syncCart();
    say("Your order is empty now.");
    $("#cartBack").focus();
  });

  // ---------- Pop-up windows (cart and large photo) ----------
  const openDialog = (dialog) => {
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") { dialog.showModal(); } else { dialog.setAttribute("open", ""); }
    }
    document.documentElement.classList.add("is-locked");
  };
  // Runs when a pop-up window has closed, however it was closed (button, tap outside or the Escape key).
  const afterClose = (dialog) => {
    document.documentElement.classList.remove("is-locked");
    // If the cart was emptied, its bar is gone, so put the keyboard on the menu heading instead.
    const active = document.activeElement;
    const lost = !active || active === document.body || dialog.contains(active);
    if (dialog === cartDialog && cartBar.hidden && lost) { $("#menuTitle").focus({ preventScroll: true }); }
  };
  const closeDialog = (dialog) => {
    if (typeof dialog.close === "function" && dialog.open) { dialog.close(); } else { dialog.removeAttribute("open"); }
    afterClose(dialog);
  };

  cartBar.addEventListener("click", () => {
    resetOrderNotes();
    syncOrderForm();
    openDialog(cartDialog);
    $("#cartScroll").scrollTop = 0;
  });
  $("#cartClose").addEventListener("click", () => closeDialog(cartDialog));
  $("#cartBack").addEventListener("click", () => {
    closeDialog(cartDialog);
    scrollToId("menu");
  });
  cartDialog.addEventListener("click", (event) => { if (event.target === cartDialog) { closeDialog(cartDialog); } });
  cartDialog.addEventListener("close", () => afterClose(cartDialog));

  // ---------------------------------------------------------------------
  // Menu: sections, veg only, search
  // ---------------------------------------------------------------------
  const state = { section: "all", vegOnly: false, query: "" };
  const header = $("#top");
  const menuBar = $("#menuBar");
  const menuBody = $("#menuBody");
  const menuList = $("#menuList");
  const sectionChips = $("#cats");
  const search = $("#dishSearch");
  const searchClear = $("#searchClear");
  const vegOnly = $("#vegOnly");

  // note: a line that replaces the usual description (used for today's specials).
  const buildDish = (dish, index, note) => {
    const row = el("article", "dish");
    row.style.setProperty("--i", String(Math.min(index, 10)));

    const text = el("div", "dish-text");
    const head = el("div", "dish-head");
    head.appendChild(vegMark(dish.veg));
    head.appendChild(el("h4", "dish-name", dish.name));
    text.appendChild(head);
    if (dish.tags && dish.tags.length) {
      const tags = el("div", "dish-tags");
      dish.tags.forEach((tag) => {
        const spicy = tag.toLowerCase() === "spicy";
        const pill = el("span", spicy ? "pill pill-spicy" : "pill");
        if (spicy) { pill.appendChild(icon("flame")); }
        pill.appendChild(document.createTextNode(tag));
        tags.appendChild(pill);
      });
      text.appendChild(tags);
    }
    text.appendChild(el("p", "dish-desc", note || dish.desc));
    text.appendChild(el("p", "dish-price", inr(dish.price)));
    row.appendChild(text);

    const side = el("div", "dish-side");
    if (dish.photo) {
      const frame = el("div", "dish-photo");
      frame.appendChild(photo(dish.photo, 224, 168, index > 3));
      side.appendChild(frame);
    }
    side.appendChild(qtyControl(dish));
    row.appendChild(side);
    return row;
  };

  // fresh = true plays the small entrance. It is left off while typing in the search box.
  const renderMenu = (fresh) => {
    const query = state.query.toLowerCase();
    const shown = MENU.filter((dish) =>
      (state.section === "all" || dish.section === state.section) &&
      (!state.vegOnly || dish.veg) &&
      (!query || dish.name.toLowerCase().includes(query)));

    let index = 0;
    const groups = SECTIONS
      .map((section) => ({ section: section, dishes: shown.filter((dish) => dish.section === section.id) }))
      .filter((group) => group.dishes.length > 0)
      .map((group) => {
        const block = el("section", "menu-group");
        const title = el("h3", "menu-group-title", group.section.name + " ");
        title.appendChild(el("small", "", countText(group.dishes.length, "dish", "dishes")));
        const grid = el("div", "dish-grid");
        group.dishes.forEach((dish) => { grid.appendChild(buildDish(dish, index)); index += 1; });
        block.append(title, grid);
        return block;
      });

    // Today's specials sit on top of the full menu, on warmer paper.
    const specials = state.section === "all" && !query
      ? SPECIALS.map((item) => ({ dish: dishById.get(item.id), line: item.line }))
        .filter((item) => item.dish && (!state.vegOnly || item.dish.veg))
      : [];
    if (specials.length) {
      const block = el("section", "menu-group is-special");
      const title = el("h3", "menu-group-title", "Today's specials ");
      title.appendChild(el("small", "", "Made fresh today"));
      const grid = el("div", "dish-grid");
      specials.forEach((item, i) => { grid.appendChild(buildDish(item.dish, i, item.line)); });
      block.append(title, grid);
      groups.unshift(block);
    }

    menuList.classList.toggle("is-fresh", Boolean(fresh));
    menuList.replaceChildren(...groups);
    menuList.hidden = shown.length === 0;
    $("#empty").hidden = shown.length !== 0;
    $("#emptyTitle").textContent = state.query
      ? "No dish matches “" + state.query + "”."
      : "No dishes to show here.";
    $("#resultCount").textContent = countText(shown.length, state.vegOnly ? "veg dish" : "dish", state.vegOnly ? "veg dishes" : "dishes");
  };

  const setMenu = (patch, fresh) => {
    Object.assign(state, patch);
    $$(".chip", sectionChips).forEach((chip) => {
      const on = chip.dataset.section === state.section;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", String(on));
      if (on) {
        // Slide the row so the chosen section is in view
        const left = chip.offsetLeft - 20;
        const right = chip.offsetLeft + chip.offsetWidth + 44;
        if (left < sectionChips.scrollLeft) { sectionChips.scrollLeft = left; }
        else if (right > sectionChips.scrollLeft + sectionChips.clientWidth) { sectionChips.scrollLeft = right - sectionChips.clientWidth; }
      }
    });
    vegOnly.setAttribute("aria-pressed", String(state.vegOnly));
    searchClear.hidden = search.value === "";
    renderMenu(fresh);
  };

  // After picking a section while the row is stuck under the header, bring the list back to its top.
  const alignMenu = () => {
    const limit = header.offsetHeight + menuBar.offsetHeight + 8;
    const top = menuBody.getBoundingClientRect().top;
    if (top < limit - 2) { window.scrollBy({ top: top - limit, behavior: "instant" }); }
  };

  [{ id: "all", name: "All" }].concat(SECTIONS).forEach((section) => {
    const chip = el("button", "chip", section.name);
    chip.type = "button";
    chip.dataset.section = section.id;
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
      // Picking a section shows all of it, so any search text is cleared.
      search.value = "";
      setMenu({ section: section.id, query: "" }, true);
      alignMenu();
    });
    sectionChips.appendChild(chip);
  });

  vegOnly.addEventListener("click", () => setMenu({ vegOnly: !state.vegOnly }, true));

  // Typing searches the whole menu, so the section goes back to "All".
  search.addEventListener("input", () => {
    const query = clean(search.value, 40);
    setMenu(query ? { query: query, section: "all" } : { query: "" }, false);
  });
  const resetSearch = () => {
    search.value = "";
    setMenu({ query: "" }, true);
  };
  searchClear.addEventListener("click", () => {
    resetSearch();
    search.focus();
  });
  $("#resetMenu").addEventListener("click", () => {
    search.value = "";
    setMenu({ query: "", section: "all", vegOnly: false }, true);
    search.focus();
  });

  // ---------------------------------------------------------------------
  // Bestsellers 3D carousel, and the small card floating on the top photo.
  // The turning itself is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const favourites = MENU.filter((dish) => dish.photo && (dish.tags || []).indexOf("Bestseller") !== -1).slice(0, 6);
  if (favourites.length < 3) {
    // The carousel needs at least three dishes to turn.
    $("#bestsellers").hidden = true;
  } else {
    favourites.forEach((dish) => {
      const card = el("article", "ring-card");
      const frame = el("div", "ring-photo");
      const img = photo(dish.photo, 560, 400, true);
      img.draggable = false;
      frame.appendChild(img);
      card.appendChild(frame);

      const body = el("div", "ring-body");
      const head = el("div", "dish-head");
      head.appendChild(vegMark(dish.veg));
      head.appendChild(el("h3", "dish-name", dish.name));
      body.appendChild(head);
      body.appendChild(el("p", "dish-price", inr(dish.price)));
      body.appendChild(qtyControl(dish, true));
      card.appendChild(body);
      $("#ringTrack").appendChild(card);
    });
  }

  // ---------------------------------------------------------------------
  // The takeaway bag. The bill stapled to it shows the visitor's own order,
  // or a sample order while nothing has been added yet.
  // ---------------------------------------------------------------------
  const SAMPLE_BILL = [["paneer-tikka", 1], ["dal-tadka", 1], ["butter-naan", 2], ["masala-chai", 2]];
  const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // A long name gets a smaller size, so it always fits on the bag and the bill.
  const fitSize = (text, steps) => {
    const found = steps.find((step) => text.length <= step[0]);
    return (found ? found[1] : steps[steps.length - 1][1]) + "px";
  };
  $(".bag-name").style.setProperty("--fit", fitSize(firm, [[16, 21], [24, 19], [32, 15], [99, 13]]));
  $(".bill-name").style.setProperty("--fit", fitSize(firm, [[22, 12], [99, 11]]));
  $("#bagScene").setAttribute("aria-label", "A takeaway bag from " + firm + " with the bill stapled to it");

  function syncBill() {
    const mine = cart.size > 0;
    const lines = mine
      ? cartLines().map((line) => [line.dish, line.qty])
      : SAMPLE_BILL.map((pair) => [dishById.get(pair[0]), pair[1]]).filter((pair) => pair[0]);
    const shown = lines.slice(0, lines.length > 4 ? 3 : 4);
    const items = shown.map((pair) => {
      const li = el("li");
      li.append(el("span", "", pair[1] + " " + pair[0].name), el("span", "", (pair[1] * pair[0].price).toLocaleString("en-IN")));
      return li;
    });
    if (lines.length > shown.length) {
      const more = lines.slice(shown.length).reduce((sum, pair) => sum + pair[1], 0);
      items.push(el("li", "bill-more", "+ " + countText(more, "more item", "more items")));
    }
    $("#billLines").replaceChildren(...items);
    $("#billTotal").textContent = inr(lines.reduce((sum, pair) => sum + pair[1] * pair[0].price, 0));
    const now = new Date();
    const hour = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
    $("#billMeta").textContent = now.getDate() + " " + SHORT_MONTHS[now.getMonth()] + ", " + hour + ":" +
      String(now.getMinutes()).padStart(2, "0") + (now.getHours() < 12 ? " am" : " pm");
    $("#billFoot").textContent = mine
      ? (orderType === "delivery" ? "Home delivery" : "Pickup") + ", your order"
      : "Pickup. Thank you";
  }

  // "Start my order" goes to the menu; once there is an order, it opens it.
  $("#orderGo").addEventListener("click", () => {
    if (cart.size > 0) { cartBar.click(); return; }
    scrollToId("menu");
    $("#menuTitle").focus({ preventScroll: true });
  });

  const heroDish = dishById.get(CONFIG.heroDish);
  if (heroDish) {
    $("#heroMiniName").textContent = heroDish.name;
    $("#heroMiniPrice").textContent = inr(heroDish.price);
    $("#heroMiniTag").textContent = (heroDish.tags && heroDish.tags[0]) || "Today";
    $("#heroMiniMark").classList.toggle("nonveg", !heroDish.veg);
  } else {
    $(".hero-mini").hidden = true;
  }

  // ---------------------------------------------------------------------
  // Photos: the grid, and the larger view with next and previous
  // ---------------------------------------------------------------------
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  let lbPos = 0;

  const lbShow = (index) => {
    lbPos = (index + GALLERY.length) % GALLERY.length;
    const item = GALLERY[lbPos];
    const src = photoUrl(item.photo, 1200, 900);
    if (lbImg.getAttribute("src") !== src) {
      // Hide the old photo until the new one arrives, so a caption never sits under the wrong photo.
      lbImg.style.visibility = "hidden";
      lbImg.src = src;
    }
    lbImg.alt = item.caption;
    $("#lbCap").textContent = item.caption;
    $("#lbCount").textContent = "Photo " + (lbPos + 1) + " of " + GALLERY.length;
    // Fetch the photos on both sides early, so next and previous feel instant.
    [lbPos - 1, lbPos + 1].forEach((near) => {
      new Image().src = photoUrl(GALLERY[(near + GALLERY.length) % GALLERY.length].photo, 1200, 900);
    });
  };
  lbImg.addEventListener("load", () => { lbImg.style.visibility = ""; });
  lbImg.addEventListener("error", () => { lbImg.style.visibility = "hidden"; });

  GALLERY.forEach((item, index) => {
    const button = el("button", "gal-item");
    button.type = "button";
    button.setAttribute("aria-label", "See larger: " + item.caption);
    button.dataset.tilt = "";
    button.dataset.tiltMax = "5";
    button.appendChild(index === 0 ? photo(item.photo, 1000, 800, true) : photo(item.photo, 600, 600, true));
    button.appendChild(el("span", "gal-cap", item.caption));
    button.addEventListener("click", () => {
      lbShow(index);
      openDialog(lightbox);
    });
    $("#galGrid").appendChild(button);
  });

  $("#lbPrev").addEventListener("click", () => lbShow(lbPos - 1));
  $("#lbNext").addEventListener("click", () => lbShow(lbPos + 1));
  $("#lbClose").addEventListener("click", () => closeDialog(lightbox));
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); lbShow(lbPos + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); lbShow(lbPos - 1); }
  });
  // A tap on the dark area around the photo closes it.
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.classList.contains("lb-fig")) { closeDialog(lightbox); }
  });
  lightbox.addEventListener("close", () => afterClose(lightbox));

  // ---------------------------------------------------------------------
  // Table booking: opens WhatsApp with the request. The restaurant confirms there.
  // ---------------------------------------------------------------------
  const BOOK_DAYS_AHEAD = 60;
  const MAX_PEOPLE = 20;
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const bookForm = $("#bookForm");
  const bookDate = $("#bookDate");
  const bookTime = $("#bookTime");
  const bookName = $("#bookName");
  const bookSend = $("#bookSend");
  const bookError = $("#bookError");
  const bookNote = $("#bookNote");
  const bookNoteText = bookNote.textContent;
  let people = 2;

  // Dates are handled as "2026-11-14" in the visitor's own time, never in UTC.
  const dateKey = (date) =>
    date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  const parseKey = (key) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
    if (!match) { return null; }
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.getMonth() === Number(match[2]) - 1 ? date : null;
  };
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const longDate = (date) => HOURS[date.getDay()].day + ", " + date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();

  // Table times for a date: every half hour while the restaurant is open.
  // The last table is one hour before closing. For today, only times at least 30 minutes away.
  const tableTimes = (date, now) => {
    const earliest = dateKey(date) === dateKey(now) ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
    const times = [];
    HOURS[date.getDay()].open.forEach((pair) => {
      const start = toMinutes(pair[0]);
      let end = toMinutes(pair[1]);
      if (end <= start) { end += DAY; }
      for (let t = start; t <= Math.min(end - 60, DAY - 30); t += 30) {
        if (t >= earliest) { times.push(t); }
      }
    });
    return times;
  };

  const fillTimes = () => {
    const date = parseKey(bookDate.value);
    const keep = bookTime.value;
    const times = date ? tableTimes(date, new Date()) : [];
    const groups = [["Lunch", times.filter((t) => t < 16 * 60)], ["Dinner", times.filter((t) => t >= 16 * 60)]]
      .filter((group) => group[1].length > 0)
      .map((group) => {
        const block = document.createElement("optgroup");
        block.label = group[0];
        group[1].forEach((t) => {
          const option = el("option", "", clock(t));
          option.value = String(t);
          block.appendChild(option);
        });
        return block;
      });
    bookTime.replaceChildren(...groups);
    if (times.length === 0) {
      const option = el("option", "", date ? "No tables on this day" : "Pick a date first");
      option.value = "";
      bookTime.appendChild(option);
    }
    bookTime.disabled = times.length === 0;
    if (keep !== "" && times.includes(Number(keep))) { bookTime.value = keep; }
    else if (times.includes(20 * 60)) { bookTime.value = String(20 * 60); }
  };

  const setDateLimits = () => {
    const now = new Date();
    const today = startOfDay(now);
    const last = startOfDay(now);
    last.setDate(last.getDate() + BOOK_DAYS_AHEAD);
    bookDate.min = dateKey(today);
    bookDate.max = dateKey(last);
    const picked = parseKey(bookDate.value);
    if (!picked || picked < today) {
      // Start on today, or on the next day that still has a table time left.
      const first = startOfDay(now);
      for (let i = 0; i < 8 && tableTimes(first, now).length === 0; i += 1) { first.setDate(first.getDate() + 1); }
      bookDate.value = dateKey(first);
    }
    fillTimes();
  };

  const bookProblem = () => {
    const today = startOfDay(new Date());
    const date = parseKey(bookDate.value);
    if (!date) { return { text: "Please pick a date.", field: bookDate }; }
    if (date < today) { return { text: "That date has passed. Please pick today or a later date.", field: bookDate }; }
    if (bookDate.max && bookDate.value > bookDate.max) {
      return { text: "We take bookings up to " + BOOK_DAYS_AHEAD + " days ahead. For a later date, please message us.", field: bookDate };
    }
    if (HOURS[date.getDay()].open.length === 0) {
      return { text: "We are closed on " + HOURS[date.getDay()].day + "s. Please pick another day.", field: bookDate };
    }
    if (bookTime.value === "") { return { text: "No table times are left on this day. Please pick another day.", field: bookDate }; }
    if (!clean(bookName.value, 60)) { return { text: "Please type your name.", field: bookName }; }
    return null;
  };

  const bookMessage = () => [
    "Hello " + firm + ", I want to book a table.",
    "",
    "Date: " + longDate(parseKey(bookDate.value)),
    "Time: " + clock(Number(bookTime.value)),
    "People: " + people,
    "Name: " + clean(bookName.value, 60),
    "",
    "Please confirm if the table is available."
  ].join("\n");

  const syncBook = () => {
    $("#peopleCount").textContent = String(people);
    $("#peopleMinus").disabled = people <= 1;
    $("#peoplePlus").disabled = people >= MAX_PEOPLE;
    bookNote.textContent = people >= 10
      ? "For 10 or more people we may call you to plan the seating. Your table is booked only when we reply."
      : bookNoteText;
    // The button only carries a WhatsApp link when the request is complete.
    bookSend.href = bookProblem() ? "#book" : waLink(bookMessage());
  };

  const changePeople = (step) => {
    people = Math.max(1, Math.min(MAX_PEOPLE, people + step));
    bookError.hidden = true;
    syncBook();
    // Do not leave the keyboard on a button that has just switched off.
    if (people <= 1) { $("#peoplePlus").focus(); }
    if (people >= MAX_PEOPLE) { $("#peopleMinus").focus(); }
  };
  $("#peopleMinus").addEventListener("click", () => changePeople(-1));
  $("#peoplePlus").addEventListener("click", () => changePeople(1));

  bookDate.addEventListener("change", () => {
    fillTimes();
    bookError.hidden = true;
    syncBook();
  });
  bookForm.addEventListener("input", () => {
    bookError.hidden = true;
    syncBook();
  });
  bookSend.addEventListener("click", (event) => {
    const problem = bookProblem();
    if (problem) {
      event.preventDefault();
      syncBook();
      bookError.textContent = problem.text;
      bookError.hidden = false;
      problem.field.focus();
      return;
    }
    bookError.hidden = true;
    bookNote.textContent = "WhatsApp is opening with your request. Press send there. Your table is booked only when we reply.";
  });
  bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    bookSend.click();
  });

  // When the visitor comes back to the page, bring the badge, the dates and the times up to date.
  const refreshClock = () => {
    refreshStatus();
    setDateLimits();
    syncBook();
  };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { refreshClock(); } });
  window.addEventListener("focus", refreshClock);

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, header shadow, menu marker
  // ---------------------------------------------------------------------
  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(group.indexOf(node)));
  });
  const showNode = (node) => node.classList.add("is-in");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Visitors who asked for less motion (and old browsers) get everything shown at once.
    reveals.forEach(showNode);
  } else {
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
  }

  // The menu link of the section on screen gets an underline (desktop header).
  if ("IntersectionObserver" in window) {
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
  }

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    const barTop = menuBar.getBoundingClientRect().top;
    menuBar.classList.toggle("is-stuck", barTop <= header.offsetHeight + 1 && barTop > 0);
    // Second safety net: anything scrolled into view is shown, even if the browser never reported it.
    reveals.forEach((node) => {
      if (!node.classList.contains("is-in") && node.getBoundingClientRect().top < window.innerHeight) { showNode(node); }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- First paint ----------
  setMenu({}, true);
  syncCart();
  setDateLimits();
  syncBook();
})();
