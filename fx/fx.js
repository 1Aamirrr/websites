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
  const refresh = () => {
    $$("[data-stage]").forEach(initStage);
    $$("[data-ring]").forEach(initRing);
  };
  refresh();
  window.FX = { refresh: refresh };
})();
