(() => {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const dots = Array.from(slider.querySelectorAll(".dot"));
  const counter = slider.querySelector(".slider-counter");
  const prevButton = slider.querySelector(".slider-arrow.prev");
  const nextButton = slider.querySelector(".slider-arrow.next");

  if (!slides.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTOPLAY_MS = 6500;
  let index = 0;
  let timer = null;
  let pointerStart = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
      dot.tabIndex = active ? 0 : -1;
    });

    if (counter) {
      counter.textContent = `${index + 1} / ${slides.length}`;
    }
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    if (reducedMotion.matches || document.hidden) return;
    timer = window.setInterval(() => show(index + 1), AUTOPLAY_MS);
  }

  function go(delta) {
    show(index + delta);
    start();
  }

  prevButton?.addEventListener("click", () => go(-1));
  nextButton?.addEventListener("click", () => go(1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      show(i);
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", (event) => {
    if (!slider.contains(event.relatedTarget)) start();
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  });

  slider.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    stop();
  });

  slider.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;

    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    } else {
      start();
    }
  });

  slider.addEventListener("pointercancel", () => {
    pointerStart = null;
    start();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reducedMotion.addEventListener?.("change", start);

  show(0);
  start();
})();

/* USB install modal */

(() => {
  const modal = document.getElementById("usb-modal");
  if (!modal) return;

  const video = document.getElementById("usb-video");
  const live = document.getElementById("usb-code-live");
  const pad2 = (value) => String(value).padStart(2, "0");

  function codeFor(date) {
    const month = date.getMonth() + 1;
    const hour12 = date.getHours() % 12 || 12;
    return `#*${month + 10}${pad2(date.getDate())}${pad2(hour12)}`;
  }

  function update() {
    if (live) live.textContent = codeFor(new Date());
  }

  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    update();
    const button = modal.querySelector(".modal-close");
    if (button) button.focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (video) video.pause();
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.querySelectorAll('[data-open-modal="usb-modal"]').forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      open();
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.setInterval(() => {
    if (!modal.hidden) update();
  }, 30000);

  update();
})();