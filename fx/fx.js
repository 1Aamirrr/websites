/* Motion and 3D kit shared by every sample. Load it LAST, after the sample's own app.js.

   Use it from a page with attributes only:
     data-tilt              the card leans toward the mouse, or toward a tap on phones
                            (data-tilt-max="8" sets the angle, data-tilt-lift="0" stops the lift)
     data-stage             a 3D stage. Children with data-depth="40" float at that depth,
                            so they slide apart when the stage turns. It follows the mouse,
                            follows the phone when it is tilted, and floats gently when idle.
     data-ring              a 3D carousel that can be dragged (markup: see broker/index.html)
     data-spotlight         a soft light that follows the mouse on a dark panel
     data-ripple            tap ripple on a button
     data-words             headline words rise one after another
     data-parallax="0.15"   moves slower than the page while scrolling
     data-phone             a phone frame whose page scrolls slowly by itself
     data-offer="clinic"    a tap opens the offer sheet: what the owner gets, the price, WhatsApp buttons
                            (data-offer-firm="Name" puts the firm name in it; see section 9)
     data-google-rating     a list that gets "4.9 stars from 98 Google reviews" on top when the
                            link has ?rating=4.9&reviews=98 (see section 10)

   After adding new data-ring or data-stage elements later, call window.FX.refresh(). */
(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const closest = (target, selector) => (target instanceof Element ? target.closest(selector) : null);

  // ---------------------------------------------------------------------
  // 1. Reading progress line + slow-moving background shapes
  // ---------------------------------------------------------------------
  if (!reduce) {
    const bar = document.createElement("div");
    bar.className = "fx-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);
    const slow = $$("[data-parallax]");
    let waiting = false;
    const update = () => {
      waiting = false;
      const max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty("--fx-progress", max > 0 ? clamp(window.scrollY / max, 0, 1).toFixed(4) : "0");
      if (window.scrollY < window.innerHeight * 2) {
        slow.forEach((node) => {
          node.style.transform = "translate3d(0," + (window.scrollY * (Number(node.dataset.parallax) || 0.15)).toFixed(1) + "px,0)";
        });
      }
    };
    window.addEventListener("scroll", () => {
      if (!waiting) { waiting = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---------------------------------------------------------------------
  // 2. Tilt. One listener for the whole page, so cards added later work too.
  // ---------------------------------------------------------------------
  let tiltEl = null;
  let tiltRect = null;
  let tiltPoint = null;
  let tiltFrame = 0;
  let tapTimer = 0;

  const tiltApply = () => {
    tiltFrame = 0;
    if (!tiltEl || !tiltPoint || !tiltRect) { return; }
    const px = clamp((tiltPoint.x - tiltRect.left) / tiltRect.width, 0, 1);
    const py = clamp((tiltPoint.y - tiltRect.top) / tiltRect.height, 0, 1);
    const max = Number(tiltEl.dataset.tiltMax) || 7;
    const lift = tiltEl.dataset.tiltLift === undefined ? 4 : Number(tiltEl.dataset.tiltLift);
    tiltEl.style.transform =
      "perspective(900px) rotateX(" + ((0.5 - py) * 2 * max).toFixed(2) + "deg) rotateY(" +
      ((px - 0.5) * 2 * max).toFixed(2) + "deg) translateY(" + (-lift) + "px)";
    tiltEl.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    tiltEl.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
  };

  const tiltEnd = () => {
    if (!tiltEl) { return; }
    tiltEl.classList.remove("is-tilting");
    tiltEl.style.transform = "";
    tiltEl = null;
    tiltPoint = null;
    tiltRect = null;
  };

  const tiltStart = (el, x, y) => {
    tiltEnd();
    tiltEl = el;
    tiltRect = el.getBoundingClientRect();
    if (window.getComputedStyle(el).position === "static") { el.style.position = "relative"; }
    if (!el.querySelector(":scope > .fx-glare")) {
      const glare = document.createElement("span");
      glare.className = "fx-glare";
      glare.setAttribute("aria-hidden", "true");
      el.appendChild(glare);
    }
    el.style.transitionDelay = "0s";
    el.classList.add("is-tilting");
    tiltPoint = { x: x, y: y };
  };

  if (!reduce) {
    // Mouse: follow it.
    document.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") { return; }
      const el = closest(event.target, "[data-tilt]");
      if (el !== tiltEl) {
        if (el) { tiltStart(el, event.clientX, event.clientY); } else { tiltEnd(); }
      }
      if (tiltEl) {
        tiltPoint = { x: event.clientX, y: event.clientY };
        if (!tiltFrame) { tiltFrame = requestAnimationFrame(tiltApply); }
      }
    }, { passive: true });
    root.addEventListener("mouseleave", tiltEnd);
    window.addEventListener("blur", tiltEnd);
    window.addEventListener("scroll", () => { if (tiltEl) { tiltEnd(); } }, { passive: true });

    // Touch: a finished tap makes the card lean toward the finger for a moment.
    // (Scrolling with a thumb on a card does nothing, on purpose.)
    document.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") { return; }
      const el = closest(event.target, "[data-tilt]");
      if (!el) { return; }
      tiltStart(el, event.clientX, event.clientY);
      tiltApply();
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(tiltEnd, 260);
    }, { passive: true });
  }

  // ---------------------------------------------------------------------
  // 3. Stage: real depth. Follows the mouse, follows a tilted phone, floats when idle.
  // ---------------------------------------------------------------------
  const stages = [];
  let stageFrame = 0;
  let phoneTilt = null;

  const stageLoop = (now) => {
    let active = false;
    stages.forEach((stage) => {
      if (!stage.visible) { return; }
      active = true;
      let wantX;
      let wantY;
      if (stage.pointer) {
        wantY = stage.pointer.x * 2 * stage.max;
        wantX = -stage.pointer.y * 2 * stage.max * 0.8;
      } else {
        const drift = phoneTilt ? 0.25 : 0.55;
        wantY = Math.sin(now / 1900) * stage.max * drift + (phoneTilt ? phoneTilt.x * stage.max : 0);
        wantX = Math.cos(now / 2600) * stage.max * drift * 0.6 + (phoneTilt ? phoneTilt.y * stage.max * 0.8 : 0);
      }
      stage.rx += (wantX - stage.rx) * 0.08;
      stage.ry += (wantY - stage.ry) * 0.08;
      stage.el.style.transform =
        "perspective(1000px) rotateX(" + stage.rx.toFixed(2) + "deg) rotateY(" + stage.ry.toFixed(2) + "deg)";
    });
    stageFrame = active ? requestAnimationFrame(stageLoop) : 0;
  };

  const stageWatcher = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const stage = stages.find((item) => item.el === entry.target);
        if (stage) { stage.visible = entry.isIntersecting; stage.reported = true; }
      });
      if (!stageFrame && stages.some((item) => item.visible)) { stageFrame = requestAnimationFrame(stageLoop); }
    }, { threshold: 0.05 })
    : null;

  const initStage = (el) => {
    if (el.fxStage) { return; }
    el.fxStage = true;
    el.classList.add("fx-stage");
    $$("[data-depth]", el).forEach((layer) => {
      layer.style.setProperty("--depth", String(Number(layer.dataset.depth) || 0));
    });
    if (reduce || !stageWatcher) { return; }
    const stage = { el: el, rx: 0, ry: 0, pointer: null, visible: false, max: Number(el.dataset.stageMax) || 9 };
    stages.push(stage);
    const area = el.closest("[data-stage-area]") || el;
    area.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") { return; }
      const rect = area.getBoundingClientRect();
      stage.pointer = {
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5,
        y: clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5
      };
    }, { passive: true });
    area.addEventListener("pointerleave", () => { stage.pointer = null; });
    stageWatcher.observe(el);
    // Safety net: if the browser is slow to report what is on screen, work it out ourselves.
    window.setTimeout(() => {
      if (stage.reported) { return; }
      const rect = el.getBoundingClientRect();
      stage.visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (stage.visible && !stageFrame) { stageFrame = requestAnimationFrame(stageLoop); }
    }, 900);
  };

  // Phones that report their tilt without asking (Android): the stage follows the hand.
  if (!reduce && !canHover && "DeviceOrientationEvent" in window &&
      typeof window.DeviceOrientationEvent.requestPermission !== "function") {
    let rest = null;
    window.addEventListener("deviceorientation", (event) => {
      if (event.gamma === null || event.beta === null) { return; }
      if (!rest) { rest = { gamma: event.gamma, beta: event.beta }; }
      phoneTilt = {
        x: clamp((event.gamma - rest.gamma) / 22, -1, 1),
        y: clamp(-(event.beta - rest.beta) / 22, -1, 1)
      };
    }, { passive: true });
  }

  // ---------------------------------------------------------------------
  // 4. Ring: a 3D carousel. Drag it, use the arrows, tap a side card, or let it turn.
  // ---------------------------------------------------------------------
  const initRing = (ring) => {
    if (ring.fxRing) { return; }
    const stage = ring.querySelector(".fx-ring-stage");
    const track = ring.querySelector(".fx-ring-track");
    if (!stage || !track) { return; }
    const items = Array.from(track.children);
    const count = items.length;
    if (count < 3) { return; }
    items.forEach((item) => item.classList.add("fx-ring-item"));

    const step = 360 / count;
    let radius = 0;
    let angle = 0;
    let visible = false;
    let quietUntil = 0;
    let drag = null;
    let justDragged = false;
    let paused = false;

    const dotsBox = ring.querySelector(".fx-ring-dots");
    const dots = [];
    if (dotsBox) {
      dotsBox.replaceChildren();
      items.forEach((item, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "fx-ring-dot";
        const title = item.querySelector("[data-ring-label], h2, h3, h4");
        dot.setAttribute("aria-label", "Show " + (title ? title.textContent.trim() : "item " + (i + 1)) + " (" + (i + 1) + " of " + count + ")");
        dot.addEventListener("click", () => {
          const now = Math.round(angle / step);
          let move = i - (((now % count) + count) % count);
          if (move > count / 2) { move -= count; }
          if (move < -count / 2) { move += count; }
          go(now + move, true);
        });
        dotsBox.appendChild(dot);
        dots.push(dot);
      });
    }

    const render = () => {
      track.style.transform = "translateZ(" + (-radius) + "px) rotateY(" + (-angle).toFixed(3) + "deg)";
      const front = ((Math.round(angle / step) % count) + count) % count;
      items.forEach((item, i) => {
        const away = Math.min((i - front + count) % count, (front - i + count) % count);
        item.classList.toggle("is-front", away === 0);
        item.classList.toggle("is-near", away === 1);
        if (away === 0) { item.removeAttribute("inert"); } else { item.setAttribute("inert", ""); }
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-on", i === front);
        if (i === front) { dot.setAttribute("aria-current", "true"); } else { dot.removeAttribute("aria-current"); }
      });
    };

    const layout = () => {
      const width = track.offsetWidth || 280;
      radius = Math.round(width / 2 / Math.tan(Math.PI / count)) + (Number(ring.dataset.ringGap) || 18);
      // Place everything at once, with no animation, so the ring never "zooms" into place.
      track.style.transition = "none";
      items.forEach((item, i) => {
        item.style.transform = "rotateY(" + (i * step).toFixed(3) + "deg) translateZ(" + radius + "px)";
      });
      render();
      void track.offsetWidth;
      track.style.transition = "";
    };

    function go(position, byVisitor) {
      angle = position * step;
      render();
      if (byVisitor) { quietUntil = performance.now() + 7000; }
    }
    const position = () => Math.round(angle / step);

    const prev = ring.querySelector(".fx-ring-prev");
    const next = ring.querySelector(".fx-ring-next");
    if (prev) { prev.addEventListener("click", () => go(position() - 1, true)); }
    if (next) { next.addEventListener("click", () => go(position() + 1, true)); }
    ring.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(position() - 1, true); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(position() + 1, true); }
    });

    const degreesPerPixel = () => step / ((track.offsetWidth || 280) * 0.85);

    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) { return; }
      justDragged = false;
      quietUntil = performance.now() + 7000; // someone is touching it: do not turn by itself
      drag = { id: event.pointerId, x: event.clientX, from: angle, moved: false, lastX: event.clientX, lastTime: event.timeStamp, speed: 0 };
    });
    stage.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) { return; }
      const dx = event.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 8) { return; }
        drag.moved = true;
        ring.classList.add("is-dragging");
        try { stage.setPointerCapture(event.pointerId); } catch (error) { /* older browsers */ }
      }
      angle = drag.from - dx * degreesPerPixel();
      const dt = event.timeStamp - drag.lastTime;
      if (dt > 0) {
        drag.speed = (event.clientX - drag.lastX) / dt;
        drag.lastX = event.clientX;
        drag.lastTime = event.timeStamp;
      }
      render();
    });
    const endDrag = (event) => {
      if (!drag || (event && event.pointerId !== drag.id)) { return; }
      const finished = drag;
      drag = null;
      ring.classList.remove("is-dragging");
      if (!finished.moved) { return; }
      justDragged = true;
      window.setTimeout(() => { justDragged = false; }, 350);
      // Only throw the ring on if the finger was still moving when it lifted.
      const stillMoving = event && event.timeStamp - finished.lastTime < 120;
      const throwOn = stillMoving ? clamp(-finished.speed * 220 * degreesPerPixel(), -step * 1.5, step * 1.5) : 0;
      go(Math.round((angle + throwOn) / step), true);
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    // A drag must not also count as a tap. A tap beside the front card turns the ring.
    stage.addEventListener("click", (event) => {
      if (justDragged) {
        justDragged = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // A keyboard "click" (Enter or Space) has no position, and a click on the front card
      // belongs to that card. Neither may turn the ring.
      if (event.detail === 0 || closest(event.target, ".fx-ring-item.is-front")) { return; }
      const rect = stage.getBoundingClientRect();
      const half = (track.offsetWidth || 280) / 2;
      const middle = rect.left + rect.width / 2;
      if (event.clientX < middle - half) { go(position() - 1, true); }
      if (event.clientX > middle + half) { go(position() + 1, true); }
    }, true);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0.35 }).observe(ring);
    }
    if (!reduce && ring.dataset.ringAuto !== "off") {
      // A pause button, so nobody is forced to watch it move.
      if (dotsBox) {
        const pause = document.createElement("button");
        pause.type = "button";
        pause.className = "fx-ring-pause";
        pause.setAttribute("aria-label", "Pause the carousel");
        pause.addEventListener("click", () => {
          paused = !paused;
          pause.classList.toggle("is-paused", paused);
          pause.setAttribute("aria-label", paused ? "Play the carousel" : "Pause the carousel");
        });
        dotsBox.appendChild(pause);
      }
      window.setInterval(() => {
        if (paused || !visible || document.hidden || drag || performance.now() < quietUntil) { return; }
        if (canHover && ring.matches(":hover")) { return; }
        if (ring.contains(document.activeElement)) { return; }
        go(position() + 1, false);
      }, Number(ring.dataset.ringAuto) || 3400);
    }

    window.addEventListener("resize", layout);
    layout();
    ring.fxRing = { go: (index) => go(index, true), next: () => go(position() + 1, true), prev: () => go(position() - 1, true), layout: layout };
  };

  // ---------------------------------------------------------------------
  // 5. Spotlight on dark panels (mouse only)
  // ---------------------------------------------------------------------
  if (!reduce && canHover) {
    $$("[data-spotlight]").forEach((panel) => {
      const spot = document.createElement("span");
      spot.className = "fx-spot";
      spot.setAttribute("aria-hidden", "true");
      panel.prepend(spot);
      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        spot.style.setProperty("--sx", (event.clientX - rect.left).toFixed(0) + "px");
        spot.style.setProperty("--sy", (event.clientY - rect.top).toFixed(0) + "px");
        panel.classList.add("is-lit");
      }, { passive: true });
      panel.addEventListener("pointerleave", () => panel.classList.remove("is-lit"));
    });
  }

  // ---------------------------------------------------------------------
  // 6. Tap ripple
  // ---------------------------------------------------------------------
  if (!reduce) {
    document.addEventListener("pointerdown", (event) => {
      const button = closest(event.target, "[data-ripple]");
      if (!button) { return; }
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement("span");
      wave.className = "fx-ripple";
      wave.setAttribute("aria-hidden", "true");
      wave.style.width = size + "px";
      wave.style.height = size + "px";
      wave.style.left = (event.clientX - rect.left - size / 2) + "px";
      wave.style.top = (event.clientY - rect.top - size / 2) + "px";
      button.appendChild(wave);
      window.setTimeout(() => wave.remove(), 700);
    }, { passive: true });
  }

  // ---------------------------------------------------------------------
  // 7. Headline words rise one after another
  // ---------------------------------------------------------------------
  // Inside the phone mockup the page is a small preview, so the headline simply shows.
  const framed = window.self !== window.top;
  if (!reduce && !framed) {
    $$("[data-words]").forEach((heading) => {
      heading.setAttribute("aria-label", heading.textContent.replace(/\s+/g, " ").trim());
      let index = 0;
      const split = (node) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 1) { split(child); return; }
          if (child.nodeType !== 3) { return; }
          const pieces = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) { return; }
            if (/^\s+$/.test(part)) { pieces.appendChild(document.createTextNode(" ")); return; }
            const word = document.createElement("span");
            word.className = "fx-word";
            word.setAttribute("aria-hidden", "true");
            word.style.setProperty("--w", String(index));
            word.textContent = part;
            index += 1;
            pieces.appendChild(word);
          });
          child.replaceWith(pieces);
        });
      };
      split(heading);
    });
    // Safety net: the words always end up visible, even if the browser pauses animation.
    window.setTimeout(() => root.classList.add("fx-done"), 2600);
  } else {
    root.classList.add("fx-done");
  }

  // ---------------------------------------------------------------------
  // 8. Phone frame: fit the page inside it and scroll it slowly
  // ---------------------------------------------------------------------
  $$("[data-phone]").forEach((phone) => {
    const screen = phone.querySelector(".fx-phone-screen");
    const frame = phone.querySelector("iframe");
    if (!screen || !frame) { return; }
    // Dress the frame as an iPhone: status bar, Dynamic Island, home line, glass shine.
    const status = document.createElement("div");
    status.className = "fx-phone-status";
    status.innerHTML =
      '<span>9:41</span><span class="fx-phone-icons">' +
      '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></svg>' +
      '<svg viewBox="0 0 16 12"><path d="M1.2 4.3a9.8 9.8 0 0 1 13.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3.7 6.9a6.2 6.2 0 0 1 8.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="10" r="1.4"/></svg>' +
      '<svg viewBox="0 0 27 12"><rect x=".6" y=".6" width="22" height="10.8" rx="3.2" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.1"/><rect x="2.2" y="2.2" width="18.8" height="7.6" rx="1.9"/><rect x="24" y="4" width="2" height="4" rx="1" fill-opacity=".45"/></svg>' +
      "</span>";
    const island = document.createElement("span");
    island.className = "fx-phone-island";
    const home = document.createElement("span");
    home.className = "fx-phone-home";
    const glare = document.createElement("span");
    glare.className = "fx-phone-glare";
    [status, island, home, glare].forEach((part) => { part.setAttribute("aria-hidden", "true"); screen.appendChild(part); });

    // The page sits under the status bar and is scaled to the phone's width.
    const fit = () => {
      const scale = screen.clientWidth / 393;
      const top = status.offsetHeight;
      frame.style.top = top + "px";
      frame.style.height = Math.ceil((screen.clientHeight - top) / scale) + "px";
      frame.style.transform = "scale(" + scale.toFixed(4) + ")";
    };
    // The status bar takes the colour of whatever is at the top of the page, like a real phone.
    const paint = () => {
      try {
        const inner = frame.contentWindow;
        const doc = inner.document;
        let node = doc.elementFromPoint(12, 3) || doc.body;
        let colour = "";
        while (node && node.nodeType === 1) {
          const bg = inner.getComputedStyle(node).backgroundColor;
          if (bg && bg !== "transparent" && !/, 0\)$/.test(bg)) { colour = bg; break; }
          node = node.parentElement;
        }
        if (!colour) { return; }
        const parts = colour.match(/[\d.]+/g).map(Number);
        status.style.background = "rgb(" + parts[0] + "," + parts[1] + "," + parts[2] + ")";
        status.dataset.tone = (0.299 * parts[0] + 0.587 * parts[1] + 0.114 * parts[2]) / 255 < 0.55 ? "light" : "dark";
      } catch (error) { /* the page inside is not ours to read */ }
    };
    fit();
    paint();
    frame.addEventListener("load", () => { fit(); paint(); });
    window.addEventListener("resize", fit);
    window.setInterval(paint, 700);
    if (reduce || !("IntersectionObserver" in window)) { return; }

    let seen = false;
    let frameId = 0;
    let y = 0;
    let direction = 1;
    let last = 0;
    let holdUntil = 0;
    const travel = Number(phone.dataset.phoneTravel) || 2400;
    const tick = (now) => {
      frameId = 0;
      if (!seen) { return; }
      try {
        const inner = frame.contentWindow;
        const max = Math.min(inner.document.documentElement.scrollHeight - inner.innerHeight, travel);
        if (max > 0 && now > holdUntil) {
          y += direction * Math.min(48, now - (last || now)) * 0.07;
          if (y >= max) { y = max; direction = -1; holdUntil = now + 1500; }
          if (y <= 0) { y = 0; direction = 1; holdUntil = now + 1800; }
          inner.scrollTo({ top: y, behavior: "instant" });
        }
      } catch (error) {
        return; // the page inside is not ours to scroll
      }
      last = now;
      frameId = requestAnimationFrame(tick);
    };
    new IntersectionObserver((entries) => {
      seen = entries[0].isIntersecting;
      if (seen && !frameId) { last = 0; frameId = requestAnimationFrame(tick); }
    }, { threshold: 0.2 }).observe(phone);
  });

  // ---------------------------------------------------------------------
  // 9. Offer sheet. "Get a site like this" opens what the owner gets and the price,
  //    with two WhatsApp buttons, instead of jumping straight to WhatsApp.
  //    Markup: <a id="demoLink" data-offer="clinic" ...> (broker, clinic, gym, salon or restaurant).
  //    app.js puts the firm name from the link (?firm=) in data-offer-firm.
  //    The prices live here, in one place for every sample.
  // ---------------------------------------------------------------------
  const OFFER = {
    kinds: {
      broker: { word: "property", line: "Listings with photos and an enquiry button on each" },
      clinic: { word: "clinic", line: "Treatments and appointment requests" },
      gym: { word: "gym", line: "Plans, timetable and free-trial booking" },
      salon: { word: "salon", line: "Service menu and booking" },
      restaurant: { word: "restaurant", line: "Menu with WhatsApp ordering, no Zomato commission" }
    },
    gets: [
      "Your services, photos and timings",
      "WhatsApp and call buttons",
      "Your location on Google Maps",
      "Works well on phones",
      "Shows up when people search your name on Google"
    ],
    plans: [
      { name: "Starter", price: "7,999", lines: ["1 page", "Ready in 5 days"] },
      { name: "Business", price: "14,999", lines: ["Up to 5 pages", "Ready in 7 days"] }
    ],
    care: { name: "Monthly care", price: "1,499", note: "Site kept online, up to 5 small changes a month." },
    terms: [
      ["pay", "50% advance, 50% when your site is live. Pay by UPI."],
      ["key", "The domain (yourname.in) is bought in your name, so you own it."],
      ["edit", "2 rounds of changes before going live."]
    ],
    steps: ["Say yes on WhatsApp.", "Send your logo, photos and prices.", "Your site is live in 5 days."],
    currency: "Rs",
    // Launch offer for the first clients. Set to null to remove it everywhere in the sheet.
    launch: { label: "Launch offer: first 3 clients", price: "4,999", was: "7,999",
              note: "Starter site. You pay nothing until your site is live and you like it." }
  };
  if (OFFER.launch) {
    OFFER.terms[0][1] = "Launch offer: pay after your site is live. Other plans: 50% advance, 50% when live. Pay by UPI.";
  }
  // A sample made for a business in the UAE (owner.js sets the money) gets the dirham prices.
  if (window.OWNER && window.OWNER.money && window.OWNER.money.code === "AED") {
    OFFER.currency = "AED";
    OFFER.launch = null;
    OFFER.plans[0].price = "799";
    OFFER.plans[1].price = "1,499";
    OFFER.care.price = "149";
    OFFER.kinds.restaurant.line = "Menu with WhatsApp ordering, no delivery-app commission";
    OFFER.terms[0] = ["card", "50% advance, 50% when your site is live. Pay by bank transfer or card."];
    OFFER.terms[1][1] = "The domain (yourname.com) is bought in your name, so you own it.";
  }
  const OFFER_ICONS = {
    check: '<path d="M5 12.5l4.3 4.3L19 7.2"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    pay: '<path d="M6.5 4h11M6.5 8.5h11M9.5 4c3.6 0 5.3 1.9 5.3 4.5S13.1 13 9.5 13H7l8 7.5"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 10h18M7 14.5h4"/>',
    key: '<circle cx="8" cy="15.5" r="3.8"/><path d="M10.8 12.7L19.5 4M16 7.5l2.6 2.6M13.6 9.9l2 2"/>',
    edit: '<path d="M4.5 19.5l1-4.2L15.8 5a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.7 18.5z"/><path d="M13.8 7l3.2 3.2"/>',
    wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    ask: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.3M12 16.4v.1"/>'
  };
  const offerIcon = (name, fill) =>
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (fill ? ' class="is-fill"' : "") + ">" + OFFER_ICONS[name] + "</svg>";

  let offer = null; // the sheet, built on first use

  const buildOffer = () => {
    const dialog = document.createElement("dialog");
    dialog.className = "fx-offer";
    dialog.id = "fxOffer";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "fxOfferTitle");
    dialog.setAttribute("aria-describedby", "fxOfferLead");
    const plan = (item) =>
      '<div class="fx-plan' + (item.tag ? " is-pick" : "") + '">' +
      (item.tag ? '<span class="fx-plan-tag">' + item.tag + "</span>" : "") +
      '<p class="fx-plan-name">' + item.name + "</p>" +
      '<p class="fx-plan-price"><span>' + OFFER.currency + '</span> ' + item.price + "</p>" +
      '<ul class="fx-plan-lines">' + item.lines.map((line) => "<li>" + line + "</li>").join("") + "</ul></div>";
    dialog.innerHTML =
      '<div class="fx-offer-scrim" aria-hidden="true"></div>' +
      '<div class="fx-offer-panel">' +
        '<div class="fx-offer-head">' +
          '<span class="fx-offer-grip" aria-hidden="true"></span>' +
          '<p class="fx-offer-kicker">Price and what you get</p>' +
          '<h2 class="fx-offer-title" id="fxOfferTitle">Your website</h2>' +
          '<button type="button" class="fx-offer-x" aria-label="Close">' + offerIcon("close") + "</button>" +
        "</div>" +
        '<div class="fx-offer-body" tabindex="0" role="region" aria-label="What you get and the price">' +
          '<p class="fx-offer-lead" id="fxOfferLead">A site like this one, with your own name, photos and prices.</p>' +
          (OFFER.launch
            ? '<div class="fx-offer-launch"><p class="fx-launch-label">' + OFFER.launch.label + "</p>" +
              '<p class="fx-launch-price"><span>' + OFFER.currency + "</span> " + OFFER.launch.price +
              ' <s aria-label="instead of ' + OFFER.currency + " " + OFFER.launch.was + '">' + OFFER.launch.was + "</s></p>" +
              '<p class="fx-launch-note">' + OFFER.launch.note + "</p></div>"
            : "") +
          '<div><h3 class="fx-offer-label">What you get</h3><ul class="fx-offer-gets"></ul></div>' +
          '<div><h3 class="fx-offer-label">Plans</h3>' +
            '<div class="fx-offer-plans">' + OFFER.plans.map(plan).join("") + "</div>" +
            '<div class="fx-offer-care"><p class="fx-care-top"><strong>' + OFFER.care.name + '</strong><span class="fx-care-opt">Optional</span>' +
            '<span class="fx-care-price">' + OFFER.currency + " " + OFFER.care.price + ' a month</span></p><p class="fx-care-note">' + OFFER.care.note + "</p></div>" +
          "</div>" +
          '<div><h3 class="fx-offer-label">Simple terms</h3><ul class="fx-offer-terms">' +
            OFFER.terms.map((term) => '<li><span class="fx-offer-ico">' + offerIcon(term[0]) + "</span><span>" + term[1] + "</span></li>").join("") +
          "</ul></div>" +
          '<div><h3 class="fx-offer-label">How it works</h3><ol class="fx-offer-steps">' +
            OFFER.steps.map((step, i) => '<li><span class="fx-step-n" aria-hidden="true">' + (i + 1) + "</span><span>" + step + "</span></li>").join("") +
          "</ol></div>" +
        "</div>" +
        '<div class="fx-offer-foot">' +
          '<a class="fx-offer-yes" target="_blank" rel="noopener">' + offerIcon("wa", true) + "<span>Yes, I want this site</span></a>" +
          '<a class="fx-offer-ask" target="_blank" rel="noopener">' + offerIcon("ask") + "<span>Ask a question first</span></a>" +
        "</div>" +
      "</div>";
    document.body.appendChild(dialog);
    $$(".fx-offer-body > *", dialog).forEach((block, i) => block.style.setProperty("--i", String(i)));

    const panel = dialog.querySelector(".fx-offer-panel");
    const scrim = dialog.querySelector(".fx-offer-scrim");
    const head = dialog.querySelector(".fx-offer-head");
    const body = dialog.querySelector(".fx-offer-body");
    const closeButton = dialog.querySelector(".fx-offer-x");
    const modal = typeof dialog.showModal === "function";
    const cardLayout = window.matchMedia("(min-width: 720px)");
    const state = { open: false, closing: false, opener: null, backs: 0 };
    const ours = () => Boolean(window.history.state && window.history.state.fxOffer);

    // Tidy up once the sheet is out of sight. Safe to run more than once.
    const finish = () => {
      if (!state.open) { return; }
      state.open = false;
      state.closing = false;
      dialog.classList.remove("is-open", "is-dragging");
      panel.style.transform = "";
      scrim.style.opacity = "";
      if (dialog.open) {
        if (modal) { dialog.close(); } else { dialog.removeAttribute("open"); }
      }
      root.classList.remove("fx-offer-lock");
      if (state.opener && document.contains(state.opener)) { state.opener.focus({ preventScroll: true }); }
      state.opener = null;
    };

    // fromHistory: the phone's back button already left our history step.
    const close = (fromHistory) => {
      if (!state.open || state.closing) { return; }
      state.closing = true;
      if (!fromHistory && ours()) { state.backs += 1; window.history.back(); }
      dialog.classList.remove("is-open", "is-dragging");
      panel.style.transform = "";
      scrim.style.opacity = "";
      if (reduce) { finish(); return; }
      let done = false;
      const end = () => {
        if (done) { return; }
        done = true;
        panel.removeEventListener("transitionend", onEnd);
        finish();
      };
      const onEnd = (event) => { if (event.target === panel && event.propertyName === "transform") { end(); } };
      panel.addEventListener("transitionend", onEnd);
      window.setTimeout(end, 420);
    };

    const open = (trigger) => {
      if (state.open) { return; }
      const kind = OFFER.kinds[trigger.dataset.offer] || { word: "business", line: "" };
      const firm = (trigger.dataset.offerFirm || "").trim();
      const number = String((window.OWNER && window.OWNER.whatsapp) || "").replace(/\D/g, "");
      const hello = "Hi " + String((window.OWNER && window.OWNER.name) || "Oxzi").split(" ")[0] + ", I saw the sample " +
        (firm ? "website for " + firm : "for a " + kind.word + " website") + ".";
      const wa = (text) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

      const title = dialog.querySelector(".fx-offer-title");
      title.textContent = firm ? "Your website, " + firm : "Your website";
      title.classList.toggle("is-long", firm.length > 24); // a long name gets a smaller size
      const gets = dialog.querySelector(".fx-offer-gets");
      gets.replaceChildren();
      (kind.line ? [kind.line] : []).concat(OFFER.gets).forEach((text) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="fx-offer-tick">' + offerIcon("check") + "</span>";
        li.appendChild(document.createElement("span")).textContent = text;
        gets.appendChild(li);
      });
      dialog.querySelector(".fx-offer-yes").href = wa(hello + " I want a site like this.");
      dialog.querySelector(".fx-offer-ask").href = wa(hello + " I have a question.");

      state.open = true;
      state.closing = false;
      state.opener = trigger;
      if (modal) { dialog.showModal(); } else { dialog.setAttribute("open", ""); }
      root.classList.add("fx-offer-lock");
      body.scrollTop = 0;
      dialog.classList.remove("is-scrolled");
      void panel.offsetWidth; // start from below the screen, so the slide-up runs
      dialog.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
      // One step in the history, so the phone's back button closes the sheet instead of leaving.
      try { window.history.pushState({ fxOffer: true }, ""); } catch (error) { /* very old browsers */ }
    };

    body.addEventListener("scroll", () => { dialog.classList.toggle("is-scrolled", body.scrollTop > 4); }, { passive: true });
    closeButton.addEventListener("click", () => close(false));
    scrim.addEventListener("click", () => close(false));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) { close(false); } });
    // Escape, and the Android back gesture where the browser sends it to the open dialog.
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(false); });
    // If the browser closed it by itself, tidy up all the same.
    dialog.addEventListener("close", () => {
      // dialog.open is true when this is a late event from an earlier close and the sheet is open again.
      if (!state.open || dialog.open) { return; }
      if (!state.closing && ours()) { state.backs += 1; window.history.back(); }
      finish();
    });
    // Our own back() steps arrive here later; skip them so a quickly reopened sheet stays open.
    window.addEventListener("popstate", () => {
      if (state.backs > 0) { state.backs -= 1; return; }
      if (state.open && !state.closing) { close(true); }
    });

    // Keyboard: Escape closes, Tab goes round inside the sheet.
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(false); return; }
      if (event.key !== "Tab") { return; }
      const stops = $$('button, a[href], [tabindex="0"]', panel).filter((node) => node.offsetParent !== null);
      if (!stops.length) { return; }
      const first = stops[0];
      const last = stops[stops.length - 1];
      const inside = panel.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !inside)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !inside)) { event.preventDefault(); first.focus(); }
    });

    // Drag the top of the sheet down to close it (phones only).
    let drag = null;
    head.addEventListener("pointerdown", (event) => {
      if (!state.open || state.closing || reduce || cardLayout.matches) { return; }
      if (event.button !== undefined && event.button !== 0) { return; }
      drag = { id: event.pointerId, y: event.clientY, dy: 0, lastY: event.clientY, lastTime: event.timeStamp, speed: 0, moved: false };
    });
    head.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) { return; }
      const dy = event.clientY - drag.y;
      if (!drag.moved) {
        if (Math.abs(dy) < 6) { return; }
        drag.moved = true;
        dialog.classList.add("is-dragging");
        try { head.setPointerCapture(event.pointerId); } catch (error) { /* older browsers */ }
      }
      drag.dy = dy > 0 ? dy : dy / 5; // pulling up only gives a little
      const dt = event.timeStamp - drag.lastTime;
      if (dt > 0) {
        drag.speed = (event.clientY - drag.lastY) / dt;
        drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
      }
      panel.style.transform = "translate3d(0," + drag.dy.toFixed(1) + "px,0)";
      scrim.style.opacity = String(clamp(1 - drag.dy / (panel.offsetHeight || 600), 0.15, 1));
    });
    const dragEnd = (event) => {
      if (!drag || (event && event.pointerId !== drag.id)) { return; }
      const ended = drag;
      drag = null;
      if (!ended.moved) { return; }
      const flicked = event && event.timeStamp - ended.lastTime < 120 && ended.speed > 0.5 && ended.dy > 24;
      if (ended.dy > Math.min(120, panel.offsetHeight * 0.25) || flicked) {
        close(false);
      } else {
        dialog.classList.remove("is-dragging");
        panel.style.transform = "";
        scrim.style.opacity = "";
      }
    };
    head.addEventListener("pointerup", dragEnd);
    head.addEventListener("pointercancel", dragEnd);

    return { open: open, close: () => close(false) };
  };

  // A reload while the sheet was open keeps its history step: clear the mark, the sheet is shut.
  try {
    if (window.history.state && window.history.state.fxOffer) { window.history.replaceState(null, ""); }
  } catch (error) { /* very old browsers */ }
  $$("[data-offer]").forEach((trigger) => {
    if (trigger.fxOffer) { return; }
    trigger.fxOffer = true;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.addEventListener("click", (event) => {
      // Without a WhatsApp number there is nothing to offer: let the link do its own thing.
      if (!String((window.OWNER && window.OWNER.whatsapp) || "").replace(/\D/g, "")) { return; }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return; }
      event.preventDefault();
      if (!offer) { offer = buildOffer(); }
      offer.open(trigger);
    });
  });

  // ---------------------------------------------------------------------
  // 10. The business's own Google rating, from the link:
  //     ?rating=4.9&reviews=98 adds "4.9 stars from 98 Google reviews" with stars
  //     to the top of every list marked data-google-rating (the hero's trust list).
  //     Missing or odd values (rating not 1 to 5, reviews not a whole number) add nothing.
  // ---------------------------------------------------------------------
  const ratingLists = $$("[data-google-rating]");
  if (ratingLists.length) {
    const query = new URLSearchParams(window.location.search);
    const rawRating = String(query.get("rating") || "").trim();
    const rawReviews = String(query.get("reviews") || "").replace(/[\s,]/g, "");
    const stars = /^[1-5](\.\d{1,2})?$/.test(rawRating) ? Math.floor(parseFloat(rawRating) * 10 + 1e-9) / 10 : 0;  // 4.95 shows 4.9, never rounded up
    const count = /^\d{1,7}$/.test(rawReviews) ? parseInt(rawReviews, 10) : 0;
    if (stars >= 1 && stars <= 5) {
      const shown = stars.toFixed(1);
      const words = count
        ? shown + " stars from " + count.toLocaleString("en-IN") + " Google review" + (count === 1 ? "" : "s")
        : shown + " stars on Google";
      const star = (x) => '<path transform="translate(' + x + ' 0)" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/>';
      const row = '<svg viewBox="0 0 120 24" focusable="false">' + [0, 24, 48, 72, 96].map(star).join("") + "</svg>";
      ratingLists.forEach((list) => {
        if (list.querySelector(".fx-rating")) { return; }
        const item = document.createElement("li");
        item.className = "fx-rating";
        const meter = document.createElement("span");
        meter.className = "fx-stars";
        meter.setAttribute("aria-hidden", "true");
        meter.innerHTML = row + '<span class="fx-stars-fill" style="width:' + (stars / 5 * 100).toFixed(1) + '%">' + row + "</span>";
        const text = document.createElement("span");
        text.textContent = words;
        item.append(meter, text);
        list.prepend(item);
      });
    }
  }

  // ---------------------------------------------------------------------
  const refresh = () => {
    $$("[data-stage]").forEach(initStage);
    $$("[data-ring]").forEach(initRing);
  };
  refresh();
  window.FX = { refresh: refresh };
})();
