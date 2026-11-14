(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "White Arc Dental",
    area: "Bandra West",
    city: "Mumbai",
    since: 2012,
    // The clinic's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // How long one appointment slot is, in minutes.
    slotMinutes: 30,
    // The clinic's clock. "Open now" follows this, even if the visitor is in another country.
    timeZone: "Asia/Kolkata",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Aamir Behlim",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // ---------------------------------------------------------------------
  // 2. THE DOCTOR. Made-up sample details: change them for each client.
  //    practisingSince: the year the doctor started working. The page
  //    works out "16 years in practice" from it.
  //    regNo: keep the digits hidden until the client gives the real number.
  // ---------------------------------------------------------------------
  const DOCTOR = {
    name: "Dr. Riya Mehta",
    role: "Dentist and clinic head",
    degree: "BDS, MDS (Prosthodontics)",
    practisingSince: 2010,
    regNo: "A-XXXXX"
  };

  // ---------------------------------------------------------------------
  // 3. TIMINGS. One line per day, in 24-hour time.
  //    Two pairs = a lunch break in between.  One pair = one sitting.
  //    Empty brackets [] = closed that day.
  //    The "Open now" badge, the timings table and the appointment slots
  //    are all made from this list.
  // ---------------------------------------------------------------------
  const HOURS = {
    Monday:    [["10:00", "13:30"], ["17:00", "21:00"]],
    Tuesday:   [["10:00", "13:30"], ["17:00", "21:00"]],
    Wednesday: [["10:00", "13:30"], ["17:00", "21:00"]],
    Thursday:  [],
    Friday:    [["10:00", "13:30"], ["17:00", "21:00"]],
    Saturday:  [["10:00", "13:30"], ["17:00", "21:00"]],
    Sunday:    [["10:00", "13:00"]]
  };

  // ---------------------------------------------------------------------
  // 4. TREATMENTS. One block per treatment.
  //    from: the starting price in rupees, as a plain number.
  //    visits: the usual number of visits, in a few words.
  //    icon: tooth, filling, root, braces, crown, implant, spark or child.
  //    Keep the check-up first: its price is also shown at the top of the
  //    page and in the Questions section.
  // ---------------------------------------------------------------------
  const TREATMENTS = [
    {
      id: "checkup", icon: "tooth", name: "Check-up and cleaning", from: 500, visits: "1 visit",
      line: "A look at your teeth and gums, and a clean to remove tartar.",
      about: "The dentist checks every tooth and your gums, and tells you what they see. Cleaning (also called scaling) removes the hard layer that brushing cannot.",
      expect: ["About 30 to 45 minutes in the chair", "An X-ray only if the dentist needs one, and you hear the cost first", "You leave with a clear list of what is needed, if anything"]
    },
    {
      id: "filling", icon: "filling", name: "Fillings", from: 1200, visits: "1 visit",
      line: "Repairs a cavity with a tooth-coloured material.",
      about: "The decayed part of the tooth is removed. The space is then filled with a tooth-coloured material that is set hard with a light.",
      expect: ["The area is usually numbed first", "Most fillings take 20 to 40 minutes", "The price depends on the size of the cavity and the material"]
    },
    {
      id: "rootcanal", icon: "root", name: "Root canal", from: 4500, visits: "1 to 3 visits",
      line: "Cleans and seals the inside of a tooth, with the aim of keeping it.",
      about: "When the soft centre of a tooth is infected or badly inflamed, it is cleaned out, disinfected and sealed. The tooth often needs a crown afterwards.",
      expect: ["Done under local anaesthetic", "One to three visits, depending on the tooth", "The cost of a crown, if you need one, is told to you separately"]
    },
    {
      id: "braces", icon: "braces", name: "Braces and aligners", from: 35000, visits: "Monthly visits",
      line: "Slowly moves teeth into a new position.",
      about: "Braces use small brackets and a wire. Aligners are clear trays that you change every one to two weeks. The dentist tells you which options suit your teeth.",
      expect: ["First a check-up, photos and measurements", "A short visit every 4 to 6 weeks", "How long it takes is different for each person, often 12 to 24 months"]
    },
    {
      id: "crown", icon: "crown", name: "Crowns and caps", from: 4000, visits: "2 visits",
      line: "A cover made to fit over a weak or broken tooth.",
      about: "A crown is a cap shaped like your own tooth. The tooth is prepared, a measurement is taken, and the crown is fixed on the next visit.",
      expect: ["Usually two visits, about a week apart", "A temporary cap in between, if needed", "The price depends on the material: metal, ceramic or zirconia"]
    },
    {
      id: "implant", icon: "implant", name: "Implants", from: 30000, visits: "3 to 5 visits",
      line: "A fixed replacement for a missing tooth.",
      about: "An implant is a small post placed in the jaw bone. Later it holds a crown. It is not suitable for everyone, so the dentist checks your bone and your health first.",
      expect: ["A check-up and X-rays or a scan come first", "Several visits over a few months, with healing time in between", "You get the full cost in writing before you decide"]
    },
    {
      id: "whitening", icon: "spark", name: "Teeth whitening", from: 6000, visits: "1 visit",
      line: "Lightens the shade of natural teeth.",
      about: "A whitening gel is put on your teeth in the clinic. How much the shade changes is different for each person. It does not change the colour of fillings or crowns.",
      expect: ["A check-up first, to see if whitening is right for you", "About one hour in the chair", "Teeth can feel sensitive for a day or two"]
    },
    {
      id: "kids", icon: "child", name: "Children's dentistry", from: 400, visits: "1 visit",
      line: "Check-ups and simple care for milk teeth and new teeth.",
      about: "Short visits, so a child gets used to the dentist. We check how the teeth are coming in and show brushing in a way a child can follow.",
      expect: ["A parent stays with the child", "First visits are kept short", "Everything is explained to you before any treatment"]
    }
  ];

  // ---------------------------------------------------------------------
  // 5. A link like  ?firm=Smile+Care+Dental&area=Andheri&doctor=Dr.+Asha+Rao
  //    shows the page with that clinic name, area and doctor's name, so one
  //    sample works for many clinics. Each of the three parts is optional.
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const customFirm = clean(params.get("firm"), 60);
  const customArea = clean(params.get("area"), 40);
  const customDoctor = clean(params.get("doctor"), 50);
  const firm = customFirm || CONFIG.firm;
  const area = customArea || CONFIG.area;
  const doctorName = customDoctor || DOCTOR.name;
  const phone = CONFIG.phone.replace(/\D/g, "");
  const slotLength = Math.max(5, Number(CONFIG.slotMinutes) || 30);
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
  // A treatment with a mistyped icon name still gets the plain tooth.
  const treatIcon = (item) => icon(document.getElementById("i-" + item.icon) ? item.icon : "tooth");

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const setText = (node, text) => { if (node.textContent !== text) { node.textContent = text; } };

  // "a treatment, a time and your name"
  const listText = (items) =>
    items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];

  const scrollToId = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  // ---------------------------------------------------------------------
  // Clock and timings
  // ---------------------------------------------------------------------
  const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // "13:30" becomes 810 (minutes after midnight).
  const toMinutes = (text) => {
    const parts = String(text).split(":");
    return Number(parts[0]) * 60 + (Number(parts[1]) || 0);
  };
  // 810 becomes "1:30 pm".
  const timeText = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return (hour % 12 || 12) + (rest ? ":" + String(rest).padStart(2, "0") : "") + (hour < 12 ? " am" : " pm");
  };

  const sessionsFor = (dayName) =>
    (HOURS[dayName] || [])
      .map((pair) => [toMinutes(pair[0]), toMinutes(pair[1])])
      .filter((pair) => Number.isFinite(pair[0]) && pair[1] > pair[0])
      .sort((a, b) => a[0] - b[0]);

  // The date and time at the clinic right now.
  const clinicNow = () => {
    const real = new Date();
    try {
      const got = {};
      new Intl.DateTimeFormat("en-GB", {
        timeZone: CONFIG.timeZone, year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(real).forEach((part) => { got[part.type] = Number(part.value); });
      if ([got.year, got.month, got.day, got.hour, got.minute].every(Number.isFinite)) {
        return { y: got.year, m: got.month - 1, d: got.day, minutes: (got.hour % 24) * 60 + got.minute };
      }
    } catch (error) { /* an old browser: use the phone's own clock below */ }
    return { y: real.getFullYear(), m: real.getMonth(), d: real.getDate(), minutes: real.getHours() * 60 + real.getMinutes() };
  };

  // One calendar day, counted from today (0 = today, 1 = tomorrow).
  const dayAt = (base, offset) => {
    const date = new Date(Date.UTC(base.y, base.m, base.d + offset));
    const name = WEEK[date.getUTCDay()];
    return {
      offset: offset,
      key: date.toISOString().slice(0, 10),
      name: name,
      date: date.getUTCDate(),
      month: MONTHS[date.getUTCMonth()],
      year: date.getUTCFullYear(),
      sessions: sessionsFor(name)
    };
  };

  let now = clinicNow();
  let days = [0, 1, 2, 3, 4, 5, 6].map((offset) => dayAt(now, offset));

  const groupName = (start) => (start < 12 * 60 ? "Morning" : start < 16 * 60 ? "Afternoon" : "Evening");
  const slotGroups = (day) => day.sessions.map(([from, to]) => {
    const times = [];
    for (let t = from; t + slotLength <= to; t += slotLength) { times.push(t); }
    return { label: groupName(from), from: from, to: to, times: times };
  });
  const isPast = (day, time) => day.offset === 0 && time <= now.minutes;
  const freeTimes = (day) => slotGroups(day).flatMap((group) => group.times).filter((time) => !isPast(day, time));

  // "Open now" or "Closed now, opens at ..."
  const openStatus = () => {
    const today = days[0].sessions;
    const current = today.find(([from, to]) => now.minutes >= from && now.minutes < to);
    if (current) { return { open: true, main: "Open now", detail: "until " + timeText(current[1]) }; }
    const later = today.find(([from]) => from > now.minutes);
    if (later) { return { open: false, main: "Closed now", detail: "opens at " + timeText(later[0]) }; }
    for (let offset = 1; offset <= 7; offset += 1) {
      const next = dayAt(now, offset);
      if (next.sessions.length) {
        return { open: false, main: "Closed now", detail: "opens " + (offset === 1 ? "tomorrow" : next.name) + " at " + timeText(next.sessions[0][0]) };
      }
    }
    return { open: false, main: "Closed now", detail: "" };
  };

  const renderStatus = () => {
    const status = openStatus();
    $$("[data-status]").forEach((node) => {
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
    });
    $$("[data-status-text]").forEach((node) => setText(node, status.detail ? status.main + ", " + status.detail : status.main));
    $$("[data-status-main]").forEach((node) => setText(node, status.main));
    $$("[data-status-detail]").forEach((node) => setText(node, status.detail));
  };

  const renderHours = () => {
    // Monday first, Sunday last.
    $("#hoursBody").replaceChildren(...[1, 2, 3, 4, 5, 6, 0].map((index) => {
      const name = WEEK[index];
      const sessions = sessionsFor(name);
      const row = el("tr");
      const head = el("th", "", name);
      head.scope = "row";
      if (name === days[0].name) {
        row.classList.add("is-today");
        head.appendChild(document.createTextNode(" "));
        head.appendChild(el("span", "today", "Today"));
      }
      const cell = el("td");
      if (sessions.length) {
        sessions.forEach(([from, to]) => cell.appendChild(el("span", "", timeText(from) + " to " + timeText(to))));
      } else {
        row.classList.add("is-shut");
        cell.appendChild(el("span", "", "Closed"));
      }
      row.appendChild(head);
      row.appendChild(cell);
      return row;
    }));
  };

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Dentist in " + area + ", " + CONFIG.city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = CONFIG.city; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  const practiceYears = Math.max(1, now.y - DOCTOR.practisingSince);
  $$("[data-doctor]").forEach((node) => { node.textContent = doctorName; });
  $("#docRole").textContent = DOCTOR.role;
  $("#docDegree").textContent = DOCTOR.degree;
  $("#docYears").textContent = practiceYears + (practiceYears === 1 ? " year" : " years") + " in practice";
  $("#docReg").textContent = DOCTOR.regNo;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I would like to book a dental appointment in " + area + ".");
  });
  if (phone) {
    $$("[data-call]").forEach((node) => { node.href = "tel:+" + phone; });
    $$("[data-phone-text]").forEach((node) => { node.textContent = prettyPhone(phone); });
  }

  const setCount = (id, value) => {
    $(id).textContent = String(value);
    $(id).dataset.count = String(value);
  };
  setCount("#statYears", Math.max(1, now.y - CONFIG.since));
  setCount("#statDays", WEEK.filter((name) => sessionsFor(name).length > 0).length);
  setCount("#statTreat", TREATMENTS.length);
  setCount("#statSlot", slotLength);
  $("#heroPrice").textContent = inr(TREATMENTS[0].from);
  $("#faqPrice").textContent = inr(TREATMENTS[0].from);

  // ---------- Sample notice at the top ----------
  $("#demoText").textContent = customFirm
    ? "Sample made for " + firm + " by " + CONFIG.builtBy + ". All details, prices and timings are examples."
    : "Sample website by " + CONFIG.builtBy + ". All details, prices and timings are examples.";
  const builderNumber = CONFIG.builtByWhatsApp.replace(/\D/g, "");
  if (builderNumber) {
    const link = $("#demoLink");
    link.href = waLink("Hi " + CONFIG.builtBy.split(" ")[0] + ", I saw the sample website for " + firm + ". I want one.", builderNumber);
    link.hidden = false;
  }

  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + CONFIG.city) + "&output=embed";

  // ---------------------------------------------------------------------
  // Appointment picker. It only builds a WhatsApp message: nothing is
  // booked or stored by the website.
  // ---------------------------------------------------------------------
  const book = { treatment: null, dayKey: null, slot: null, name: "" };
  const treatBox = $("#pickTreat");
  const dayBox = $("#pickDays");
  const slotBox = $("#pickSlots");
  const bookSend = $("#bookSend");

  const treatmentById = (id) => TREATMENTS.find((item) => item.id === id) || null;
  const dayByKey = (key) => days.find((day) => day.key === key) || null;

  // Drop a day or time that can no longer be chosen (for example, the time has passed).
  const fixSelection = () => {
    let day = dayByKey(book.dayKey);
    if (!day || freeTimes(day).length === 0) {
      day = days.find((entry) => freeTimes(entry).length > 0) || null;
      book.dayKey = day ? day.key : null;
      book.slot = null;
    }
    if (book.slot !== null && !freeTimes(day).includes(book.slot)) { book.slot = null; }
  };

  const summaryText = () => {
    const treatment = treatmentById(book.treatment);
    const day = dayByKey(book.dayKey);
    if (!treatment && !day && book.slot === null && !book.name) { return "Nothing chosen yet"; }
    let text = treatment ? treatment.name : "Appointment";
    if (day) { text += " on " + day.name + ", " + day.date + " " + day.month; }
    if (book.slot !== null) { text += " at " + timeText(book.slot); }
    if (book.name) { text += ", for " + book.name; }
    return text;
  };

  const bookingMessage = () => {
    const treatment = treatmentById(book.treatment);
    const day = dayByKey(book.dayKey);
    return [
      "Hello " + firm + ", I would like to request an appointment.",
      "Treatment: " + treatment.name,
      "Day: " + day.name,
      "Date: " + day.date + " " + day.month + " " + day.year,
      "Time: " + timeText(book.slot),
      "Name: " + book.name,
      "Please confirm if this slot is free."
    ].join("\n");
  };

  const syncBook = () => {
    const mark = (selector, isOn) => $$(selector).forEach((button) => {
      const on = isOn(button);
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    mark("[data-treat]", (button) => button.dataset.treat === book.treatment);
    mark("[data-day]", (button) => button.dataset.day === book.dayKey);
    mark("[data-slot]", (button) => Number(button.dataset.slot) === book.slot);

    const treatment = treatmentById(book.treatment);
    const day = dayByKey(book.dayKey);
    const done = {
      treatment: Boolean(treatment),
      day: Boolean(day),
      time: book.slot !== null,
      name: Boolean(book.name)
    };
    // The drawn appointment card fills in line by line.
    setText($("#aptTreat"), treatment ? treatment.name : "");
    setText($("#aptDay"), day ? day.name.slice(0, 3) + ", " + day.date + " " + day.month.slice(0, 3) : "");
    setText($("#aptTime"), done.time ? timeText(book.slot) : "");
    setText($("#aptName"), book.name);
    // The same, as one sentence, for screen readers.
    setText($("#bookSummary"), summaryText() + ". ");

    const missing = [
      done.treatment ? "" : "a treatment",
      done.day ? "" : "a day",
      done.time ? "" : "a time",
      done.name ? "" : "your name"
    ].filter(Boolean);
    bookSend.disabled = missing.length > 0;
    $("#aptStamp").hidden = missing.length > 0;
    setText($("#bookHint"), missing.length
      ? "Still needed: " + listText(missing) + "."
      : "Ready. The button opens WhatsApp with this request.");
  };

  const chooseTreatment = (id) => { book.treatment = id; syncBook(); };
  // "Book this treatment": choose it in the picker and take the visitor there.
  const bookTreatment = (id) => {
    chooseTreatment(id);
    const chosen = $('[data-treat="' + id + '"]');
    if (chosen) { chosen.focus({ preventScroll: true }); }
    scrollToId("book");
  };
  const chooseDay = (key) => { book.dayKey = key; fixSelection(); renderSlots(); syncBook(); };
  const chooseSlot = (time) => { book.slot = time; syncBook(); };

  treatBox.replaceChildren(...TREATMENTS.map((item) => {
    const button = el("button", "opt");
    button.type = "button";
    button.dataset.treat = item.id;
    button.appendChild(el("span", "opt-name", item.name));
    button.appendChild(el("span", "opt-sub", "from " + inr(item.from)));
    button.addEventListener("click", () => chooseTreatment(item.id));
    return button;
  }));

  const renderDays = () => {
    dayBox.replaceChildren(...days.map((day) => {
      const closed = day.sessions.length === 0;
      const free = freeTimes(day).length > 0;
      const button = el("button", "day");
      button.type = "button";
      button.dataset.day = day.key;
      button.disabled = !free;
      button.appendChild(el("span", "day-w", day.name.slice(0, 3)));
      button.appendChild(el("span", "day-n", String(day.date)));
      button.appendChild(el("span", "day-m", closed ? "Closed" : !free ? "No slots" : day.offset === 0 ? "Today" : day.month.slice(0, 3)));
      button.setAttribute("aria-label", day.name + ", " + day.date + " " + day.month +
        (closed ? ", clinic closed" : !free ? ", no slots left" : day.offset === 0 ? ", today" : ""));
      button.addEventListener("click", () => chooseDay(day.key));
      return button;
    }));
  };

  function renderSlots() {
    const day = dayByKey(book.dayKey);
    if (!day) {
      slotBox.replaceChildren(el("p", "slots-empty", "No free days this week. Please message the clinic on WhatsApp."));
      return;
    }
    const groups = slotGroups(day);
    const blocks = groups.map((group) => {
      const wrap = el("div", "slot-group");
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", group.label + " times");
      const head = el("p", "slot-head");
      head.appendChild(icon(group.label === "Evening" ? "moon" : "sun"));
      head.appendChild(el("span", "", group.label));
      head.appendChild(el("small", "", timeText(group.from) + " to " + timeText(group.to)));
      wrap.appendChild(head);
      const list = el("div", "slots");
      group.times.forEach((time) => {
        const button = el("button", "slot", timeText(time));
        button.type = "button";
        button.dataset.slot = String(time);
        if (isPast(day, time)) {
          button.disabled = true;
          button.setAttribute("aria-label", timeText(time) + ", already passed");
        }
        button.addEventListener("click", () => chooseSlot(time));
        list.appendChild(button);
      });
      wrap.appendChild(list);
      return wrap;
    });
    if (groups.length === 1) {
      blocks.push(el("p", "slots-empty", "Only " + groups[0].label.toLowerCase() + " times on " + day.name + "."));
    }
    slotBox.replaceChildren(...blocks);
  }

  const nameInput = $("#bookName");
  nameInput.addEventListener("input", () => { book.name = clean(nameInput.value, 60); syncBook(); });

  $("#bookForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (bookSend.disabled) { return; }
    window.open(waLink(bookingMessage()), "_blank", "noopener");
  });

  // The small card on the top photo: the first time a visitor can still ask for.
  const renderEarliest = () => {
    const day = days.find((entry) => freeTimes(entry).length > 0);
    $("#heroMini").hidden = !day;
    if (!day) { return; }
    const when = day.offset === 0 ? "Today" : day.offset === 1 ? "Tomorrow" : day.name.slice(0, 3) + " " + day.date + " " + day.month.slice(0, 3);
    setText($("#heroSlot"), when + ", " + timeText(freeTimes(day)[0]));
  };

  // Which days and times can still be chosen. When this changes, the picker is drawn again.
  const availability = () => days.map((day) => day.key + ":" + freeTimes(day).length).join("|");
  let lastAvailability = "";

  const drawPicker = () => {
    lastAvailability = availability();
    // Keep the keyboard position if the visitor was on a day or time button.
    const focused = document.activeElement;
    const keep = focused && focused.dataset
      ? (focused.dataset.day ? '[data-day="' + focused.dataset.day + '"]' : focused.dataset.slot ? '[data-slot="' + focused.dataset.slot + '"]' : "")
      : "";
    fixSelection();
    renderDays();
    renderSlots();
    syncBook();
    renderEarliest();
    if (keep) {
      const again = $(keep);
      if (again && !again.disabled) { again.focus({ preventScroll: true }); }
    }
  };

  // Runs twice a minute, so the badge and the slots stay right while the page is open.
  const refresh = () => {
    const previousDay = days[0].key;
    now = clinicNow();
    days = [0, 1, 2, 3, 4, 5, 6].map((offset) => dayAt(now, offset));
    renderStatus();
    if (days[0].key !== previousDay) { renderHours(); }
    if (availability() !== lastAvailability) { drawPicker(); }
  };

  renderStatus();
  renderHours();
  drawPicker();
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { refresh(); } });

  // ---------------------------------------------------------------------
  // Treatment cards and the details window
  // ---------------------------------------------------------------------
  const sheet = $("#sheet");
  let current = null;
  let opener = null;
  let bookAfterClose = null;
  let sheetIsOpen = false;

  function openSheet(item, fromButton) {
    current = item;
    opener = fromButton || null;
    $("#sheetIcon").replaceChildren(treatIcon(item));
    $("#sheetTitle").textContent = item.name;
    $("#sheetLine").textContent = item.line;
    $("#sheetPrice").textContent = inr(item.from);
    $("#sheetVisits").textContent = item.visits;
    $("#sheetAbout").textContent = item.about;
    $("#sheetExpect").replaceChildren(...item.expect.map((text) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", text));
      return li;
    }));
    $("#sheetWa").href = waLink("Hello " + firm + ", I have a question about " + item.name + " (from " + inr(item.from) + ").");
    $("#sheetCall").href = phone ? "tel:+" + phone : "#contact";

    if (!sheet.open) {
      if (typeof sheet.showModal === "function") { sheet.showModal(); } else { sheet.setAttribute("open", ""); }
    }
    document.documentElement.classList.add("is-locked");
    $("#sheetScroll").scrollTop = 0;
    sheetIsOpen = true;
  }

  // Tidy up after the window closes. Runs once per close, whichever way it was closed.
  const onSheetClosed = () => {
    if (!sheetIsOpen) { return; }
    sheetIsOpen = false;
    document.documentElement.classList.remove("is-locked");
    current = null;
    if (bookAfterClose) {
      const id = bookAfterClose;
      bookAfterClose = null;
      bookTreatment(id);
    } else if (opener && document.contains(opener)) {
      opener.focus();
    }
    opener = null;
  };
  const closeSheet = () => {
    if (typeof sheet.close === "function" && sheet.open) { sheet.close(); } else { sheet.removeAttribute("open"); }
    // Tidy up straight away. The browser's own "close" message can arrive late.
    onSheetClosed();
  };
  sheet.addEventListener("close", onSheetClosed);
  // The Escape key
  sheet.addEventListener("cancel", (event) => { event.preventDefault(); closeSheet(); });
  sheet.addEventListener("click", (event) => { if (event.target === sheet) { closeSheet(); } });
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetCall").addEventListener("click", () => { if (!phone) { opener = null; closeSheet(); } });
  $("#sheetBook").addEventListener("click", () => {
    if (!current) { return; }
    bookAfterClose = current.id;
    closeSheet();
  });

  // "from ₹1,200", with the word "from" set smaller than the number.
  const priceTag = (item, className) => {
    const price = el("span", className);
    price.appendChild(el("small", "", "from"));
    price.appendChild(document.createTextNode(" " + inr(item.from)));
    return price;
  };

  // The price list: each row is one button that opens the details.
  $("#treatGrid").replaceChildren(...TREATMENTS.map((item) => {
    const row = el("li", "treat");
    const open = el("button", "treat-open");
    open.type = "button";
    open.setAttribute("aria-haspopup", "dialog");
    open.setAttribute("aria-label", "Details: " + item.name + ", from " + inr(item.from) + ", " + item.visits);
    open.appendChild(el("span", "treat-name", item.name));
    open.appendChild(el("span", "treat-line", item.line));
    open.appendChild(el("span", "treat-visits", item.visits));
    open.appendChild(priceTag(item, "treat-price"));
    open.appendChild(icon("right"));
    open.addEventListener("click", () => openSheet(item, open));
    row.appendChild(open);
    return row;
  }));

  // ---------------------------------------------------------------------
  // 3D carousel near the top: the first six treatments in the list.
  // The turning itself is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const ringTrack = $("#ringTrack");
  if (ringTrack) {
    TREATMENTS.slice(0, 6).forEach((item) => {
      const card = el("article", "ring-card");
      const top = el("div", "ring-top");
      top.appendChild(treatIcon(item));
      card.appendChild(top);

      const body = el("div", "ring-body");
      body.appendChild(el("h3", "", item.name));
      body.appendChild(el("p", "ring-line", item.line));
      const meta = el("p", "ring-meta");
      meta.appendChild(priceTag(item, "ring-price"));
      meta.appendChild(el("span", "ring-visits", item.visits));
      body.appendChild(meta);
      const go = el("button", "btn btn-brand btn-sm btn-3d", "Book this treatment");
      go.type = "button";
      go.dataset.ripple = "";
      go.addEventListener("click", () => bookTreatment(item.id));
      body.appendChild(go);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, counting numbers, header shadow, menu marker
  // ---------------------------------------------------------------------
  const countUp = (node) => {
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) { return; }
    const started = performance.now();
    const duration = 900;
    let done = false;
    const tick = (time) => {
      if (done) { return; }
      const t = Math.min(1, (time - started) / duration);
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
    node.style.setProperty("--d", String(Math.min(group.indexOf(node), 5)));
  });
  const showNode = (node) => {
    node.classList.add("is-in");
    const number = $("[data-count]", node);
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
  $("#enquiryNeed").replaceChildren(...TREATMENTS.map((item) => item.name).concat("Something else").map((name) => el("option", "", name)));
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
    const note = clean(data.get("note"), 160);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "I want to ask about: " + data.get("need") + ".",
      note ? "My question: " + note : ""
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
})();
