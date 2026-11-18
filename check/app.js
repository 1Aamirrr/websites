/* Free Google listing check.
   One page for every business. The link says what we found on their public Google Maps listing:

     /check/?firm=Chetan+Realtor&area=Wadala&kind=broker&rating=4.9&reviews=43&web=none

   firm, area   text (cleaned and cut to 60 and 40 letters, like the samples)
   kind         broker | clinic | gym | salon | restaurant   (picks the sample to link to)
   rating       1.0 to 5.0          reviews  whole number
   web          what they have instead of their own website:
                facebook | instagram | justdial | practo | zomato | none
   Optional, only when known:
   hours        yes | no            opening hours on the listing
   photos       whole number        photos on the listing
   replies      yes | no            owner replies to reviews

   Every value is optional. A value that does not make sense counts as "not checked" and is never shown.
   With no values at all the page shows a clearly marked example. */
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const params = new URLSearchParams(window.location.search);
  const owner = window.OWNER || {};
  const ownerName = String(owner.name || "Oxzi");
  const ownerFirst = ownerName.split(" ")[0];
  const number = String(owner.whatsapp || "").replace(/\D/g, "");

  // ---------- 1. Read the link ----------
  // Text: anything that looks like HTML is thrown away, the rest is tidied and cut short.
  const text = (name, max) => {
    const raw = String(params.get(name) || "");
    if (/[<>]/.test(raw)) { return ""; }
    return raw.replace(/"/g, "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max).trim();
  };
  const oneOf = (name, list) => {
    const value = String(params.get(name) || "").trim().toLowerCase();
    return list.indexOf(value) === -1 ? null : value;
  };
  const whole = (name, max) => {
    const value = String(params.get(name) || "").trim().replace(/,/g, "");
    if (!/^\d{1,7}$/.test(value)) { return null; }
    const count = Number(value);
    return count <= max ? count : null;
  };
  const stars = (name) => {
    const value = String(params.get(name) || "").trim().replace(",", ".");
    if (!/^\d(\.\d{1,2})?$/.test(value)) { return null; }
    const rounded = Math.round(Number(value) * 10) / 10;
    return rounded >= 1 && rounded <= 5 ? rounded : null;
  };
  const yesNo = (name) => {
    const value = oneOf(name, ["yes", "no"]);
    return value === null ? null : value === "yes";
  };

  const link = {
    firm: text("firm", 60),
    area: text("area", 40),
    kind: oneOf("kind", ["broker", "clinic", "gym", "salon", "restaurant"]),
    rating: stars("rating"),
    reviews: whole("reviews", 1000000),
    web: oneOf("web", ["facebook", "instagram", "justdial", "practo", "zomato", "none"]),
    hours: yesNo("hours"),
    photos: whole("photos", 100000),
    replies: yesNo("replies")
  };
  const facts = ["rating", "reviews", "web", "hours", "photos", "replies"];
  const example = !link.firm && facts.every((key) => link[key] === null);
  // The example: made-up values, clearly marked on the page. They are never passed on to a sample.
  const data = example
    ? { firm: "", area: "", kind: link.kind, rating: 4.6, reviews: 38, web: "instagram", hours: true, photos: 6, replies: false }
    : link;

  // ---------- 2. Words that fit the kind of business ----------
  const KINDS = {
    broker: { people: "clients", things: "listings, prices and photos", photos: "your office and properties" },
    clinic: { people: "patients", things: "treatments, fees and timings", photos: "your clinic and team" },
    gym: { people: "members", things: "plans, prices and timetable", photos: "your equipment and classes" },
    salon: { people: "clients", things: "services, prices and photos", photos: "your salon and your work" },
    restaurant: { people: "guests", things: "menu, prices and photos", photos: "your food and your place" }
  };
  const words = KINDS[data.kind] || { people: "customers", things: "services, prices and photos", photos: "your place and your work" };
  const WEB = {
    none: "No website of your own",
    facebook: "Only a Facebook page, no website of your own",
    instagram: "Only an Instagram page, no website of your own",
    justdial: "Only a Justdial page, no website of your own",
    practo: "Only a Practo page, no website of your own",
    zomato: "Only a Zomato page, no website of your own"
  };
  const plural = (count, one, many) => count.toLocaleString("en-IN") + " " + (count === 1 ? one : many);
  const starText = (value) => value.toFixed(1);

  // ---------- 3. The checks: good, to fix, or not checked ----------
  const checks = [];
  // A high rating from only a few reviews is good, but we do not oversell it.
  const fewReviews = data.reviews !== null && data.reviews < 10;
  const add = (title, state, value, why, key) => checks.push({ title: title, state: state, value: value, why: why, key: Boolean(key) });

  if (data.rating === null) {
    add("Star rating", "unknown", "", "People look at the stars first, before they call.");
  } else if (data.rating >= 4.5 && fewReviews) {
    add("Star rating", "good", starText(data.rating) + " out of 5 stars", "People look at the stars first. Yours are high, and more reviews will make them count.");
  } else if (data.rating >= 4.5) {
    add("Star rating", "good", starText(data.rating) + " out of 5 stars", "People look at the stars first. Yours show " + words.people + " clearly trust you.");
  } else if (data.rating >= 4) {
    add("Star rating", "good", starText(data.rating) + " out of 5 stars", "People look at the stars first. Yours show most " + words.people + " are happy.");
  } else {
    add("Star rating", "fix", starText(data.rating) + " out of 5 stars", "People compare stars before they call. New reviews from happy " + words.people + " lift it.");
  }

  if (data.reviews === null) {
    add("Number of reviews", "unknown", "", "New " + words.people + " read reviews to decide whom to call.");
  } else if (data.reviews >= 20) {
    add("Number of reviews", "good", plural(data.reviews, "review", "reviews"), "New " + words.people + " have plenty of real experiences to read.");
  } else if (data.reviews > 0) {
    add("Number of reviews", "fix", plural(data.reviews, "review", "reviews"), "More reviews make new " + words.people + " feel sure. Ask happy " + words.people + " to leave one.");
  } else {
    add("Number of reviews", "fix", "No reviews yet", "New " + words.people + " trust what others say. Ask happy " + words.people + " to leave a review.");
  }

  if (data.web === null) {
    add("Own website", "unknown", "", "A website shows your " + words.things + " in one place.");
  } else {
    add("Own website", "fix", WEB[data.web],
      "People who find you on Maps cannot see your " + words.things + " in one place, so they call someone else.", true);
  }

  if (data.hours !== null) {
    add("Opening hours", data.hours ? "good" : "fix",
      data.hours ? "Opening hours are shown" : "No opening hours shown",
      data.hours ? "People know when to call or visit." : "People cannot tell if you are open, so they may pick a place that shows its hours.");
  }
  if (data.photos !== null) {
    if (data.photos >= 10) {
      add("Photos", "good", plural(data.photos, "photo", "photos"), "People can see what to expect before they visit.");
    } else {
      add("Photos", "fix", data.photos ? plural(data.photos, "photo", "photos") : "No photos yet",
        "Add a few recent photos of " + words.photos + ". People like to see what to expect.");
    }
  }
  if (data.replies !== null) {
    add("Replies to reviews", data.replies ? "good" : "fix",
      data.replies ? "You reply to reviews" : "No replies to reviews",
      data.replies ? "New " + words.people + " can see that you care." : "A short thank-you under each review shows new " + words.people + " that you care.");
  }

  // ---------- 4. Fill the page ----------
  $$("[data-owner]").forEach((node) => { node.textContent = ownerName; });
  $$("[data-city]").forEach((node) => { node.textContent = owner.city || "Mumbai"; });
  $$("[data-things]").forEach((node) => { node.textContent = words.things; });

  const place = [link.firm, link.area].filter(Boolean).join(", ");
  if (link.firm) {
    $("#madeFor").textContent = "Made for " + place;
    document.title = "Free Google listing check for " + link.firm + " | " + ownerName;
  } else if (example) {
    $("#madeFor").textContent = "Example check";
    $("#exampleNote").hidden = false;
  } else {
    $("#madeFor").textContent = "Made for your business" + (link.area ? ", " + link.area : "");
  }

  // Score: only what we could check counts.
  const known = checks.filter((item) => item.state !== "unknown");
  const good = known.filter((item) => item.state === "good");
  const fixes = known.filter((item) => item.state === "fix");
  if (known.length) {
    $("#score").hidden = false;
    $("#scoreDone").textContent = String(good.length);
    $("#scoreTotal").textContent = String(known.length);
    const bar = $("#scoreBar");
    bar.hidden = false;
    // Done first, then the ones to fix, so the bar reads like the score.
    good.concat(fixes).forEach((item, i) => {
      const seg = document.createElement("span");
      seg.className = "score-seg is-" + item.state;
      seg.style.setProperty("--i", String(i));
      bar.appendChild(seg);
    });
    window.setTimeout(() => bar.classList.add("is-in"), 60); // after the first paint, so the bar fills up
    $("#scoreNote").hidden = known.length === checks.length;
  }

  // Summary: one honest strength, then the main gap.
  const parts = [];
  if (data.rating !== null && data.rating >= 4) {
    const from = data.reviews ? " from " + plural(data.reviews, "review", "reviews") : "";
    const praise = fewReviews ? "the people who reviewed you are happy." : words.people + (data.rating >= 4.5 ? " clearly trust you." : " are happy with you.");
    parts.push(starText(data.rating) + " stars" + from + ": " + praise);
  } else if (good.length) {
    parts.push("Good start: " + good.length + " of " + known.length + " already done.");
  }
  const smallFixes = fixes.filter((item) => !item.key).length;
  if (data.web !== null) {
    parts.push("The main gap: no website of your own" + (smallFixes ? ", plus " + plural(smallFixes, "small fix", "small fixes") + " below." : "."));
  } else if (smallFixes) {
    parts.push(plural(smallFixes, "thing", "things") + " to fix below.");
  }
  if (!known.length) {
    $("#summary").textContent = "We have not filled in your listing details yet. Message us and we will check your listing for free.";
  } else {
    $("#summary").textContent = parts.join(" ") || "Your listing is in good shape.";
  }

  // The list, built with plain text only (nothing from the link becomes HTML).
  const LABEL = { good: "Good", fix: "To fix", unknown: "Not checked" };
  const svgUse = (id) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + id);
    svg.appendChild(use);
    return svg;
  };
  const make = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (content) { node.textContent = content; }
    return node;
  };
  const list = $("#checks");
  checks.forEach((item) => {
    const li = make("li", "check reveal is-" + item.state + (item.key && item.state === "fix" ? " is-key" : ""));
    const ico = make("span", "check-ico");
    ico.appendChild(svgUse(item.state));
    const body = make("div", "check-body");
    const top = make("div", "check-top");
    top.appendChild(make("h3", "", item.title));
    top.appendChild(make("span", "chip", LABEL[item.state]));
    body.appendChild(top);
    if (item.value) { body.appendChild(make("p", "check-value", item.value)); } // "not checked" needs no value line
    body.appendChild(make("p", "check-why", item.why));
    li.appendChild(ico);
    li.appendChild(body);
    list.appendChild(li);
  });

  // ---------- 5. Buttons ----------
  const sample = $("#sampleBtn");
  const wa = $("#waBtn");
  if (link.kind) {
    const query = new URLSearchParams();
    if (link.firm) { query.set("firm", link.firm); }
    if (link.area) { query.set("area", link.area); }
    if (link.rating !== null) { query.set("rating", starText(link.rating)); }
    if (link.reviews !== null) { query.set("reviews", String(link.reviews)); }
    const search = query.toString();
    sample.href = "/" + link.kind + "/" + (search ? "?" + search : "");
    sample.hidden = false;
    if (!link.firm) { $("#sampleLabel").textContent = "See a sample website"; }
  }
  if (link.firm && link.kind) {
    $("#next-title").textContent = "We made a sample website for you";
    $("#nextLead").textContent = "It has your name" + (link.area ? " and area" : "") + ". Have a look, then ask us anything.";
  } else if (example) {
    $("#next-title").textContent = "Want this for your business?";
    $("#nextLead").textContent = "Send us your business name. We check your Google listing for free.";
  } else if (link.kind) {
    $("#next-title").textContent = "See a sample website";
    $("#nextLead").textContent = "Made for businesses like yours. Have a look, then ask us anything.";
  }
  if (number) {
    const message = link.firm
      ? "Hi " + ownerFirst + ", I saw the free Google listing check for " + link.firm + ". I have a question."
      : example
        ? "Hi " + ownerFirst + ", I saw the free Google listing check. I want one for my business."
        : "Hi " + ownerFirst + ", I saw the free Google listing check. I have a question.";
    wa.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
    wa.hidden = false;
    if (example) { $("#waLabel").textContent = "Ask for your free check"; }
    // With no sample to show, WhatsApp becomes the main button.
    if (sample.hidden) { wa.classList.add("is-main", "btn-3d"); wa.setAttribute("data-ripple", ""); }
  }

  // ---------- 6. Cards rise into place as you scroll (the look comes from fx/fx.css) ----------
  window.CHECK_READY = true;
  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(group.indexOf(node)));
  });
  if ("IntersectionObserver" in window) {
    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); watcher.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((node) => watcher.observe(node));
    // Safety net (as on the home page): never leave something on screen invisible.
    window.setTimeout(() => {
      reveals.forEach((node) => {
        if (node.getBoundingClientRect().top < window.innerHeight) { node.classList.add("is-in"); }
      });
    }, 1200);
  } else {
    reveals.forEach((node) => node.classList.add("is-in"));
  }
})();
