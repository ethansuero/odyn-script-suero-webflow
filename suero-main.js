// ============================================================
// SUERO STUDIO — MAIN JS
// ============================================================
// Functions:
//   1. initScroll()                  — LocomotiveScroll + UnicornStudio
//   2. initRevealAnimations()        — GSAP scroll reveal (SplitText)
//   3. initLinkHoverChars()          — Link hover character animation
//   4. initFooterReveal()            — Footer SVG reveal
//   5. initLogoRevealLoader()        — Page loader
//   6. initHeroCursorCard()          — Hero cursor card movement
//   7. initButtonCharacterStagger()  — Button character stagger
//   8. initButtonArrowAnimation()    — Button arrow hover animation
//   9. initBarScaleReveal()          — Bar scale reveal
//  10. initImagesOnPathScroll()      — Images on motion path scroll
//  11. initMotionPathTitleReveal()   — Motion path title character reveal
//  12. initLogoMarquee()             — Logo marquee with hover effects
//  13. initReviewsLayoutSwitcher()   — Reviews desktop/mobile layout toggle
//      initReviewsHoverAnimation()   — Reviews hover reveal animations
//  14. initFeaturedHorizontalScroll() — Featured horizontal scroll with progress bars
//  15. initFeaturedVideoHover()       — Featured video hover (height via GSAP, blur via CSS)
//  16. initCursorMarqueeEffect()      — Custom cursor with marquee text on hover
//  17. initVelocityBasedCustomCursor() — Custom cursor with velocity-based rotation
//  18. initMiniShowreelPlayer()        — Mini showreel Flip animation player
//  19. initButtonLinkHover()           — Button link underline hover animation
//  20. initFaqsAccordion()             — FAQs accordion open/close
//  21. initNavDesktop()                — Nav desktop hide/show on scroll
//  22. initNavMobileScroll()           — Nav mobile button hide/show on scroll
//  23. initMobileMenu()                — Mobile menu open/close
//  24. initEstimateButton()            — Estimate button hover animation
//  25. initDocumentTitle()             — Tab title change on blur/focus
// ============================================================

// Force scroll to top on page load so ScrollTrigger calculates trigger positions
// correctly — but only when there's no anchor hash in the URL.
history.scrollRestoration = "manual";
if (!window.location.hash) window.scrollTo(0, 0);

// Register all GSAP plugins once
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  CustomEase,
  MotionPathPlugin,
  Flip
);

// Prevent ScrollTrigger from erroring on resize when instances have been killed
ScrollTrigger.config({ ignoreMobileResize: true });

// Shared custom eases
CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");
CustomEase.create("dramatic", "0.65, 0.01, 0.05, 0.99");

// DOM ready helper
function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

// Utility: debounce
function debounce(fn, delay = 200) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

// ============================================================
// 1. LENIS SMOOTH SCROLL + UNICORN STUDIO
// ============================================================
// Notes:
//   Lenis runs directly through gsap.ticker for frame-perfect sync.
//   Safari and touch devices get native scroll (no Lenis).
//   UnicornStudio skipped on touch devices and when reduced motion is enabled.
// ============================================================

function initScroll() {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  gsap.ticker.lagSmoothing(0);

  if (!isTouch && !prefersReducedMotion) {
    const lenis = new Lenis({
      lerp: isSafari ? 0.12 : 0.08,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
  }

  if (
    document.querySelector("[data-us-project]") &&
    !isTouch &&
    !prefersReducedMotion
  ) {
    var i = document.createElement("script");
    i.src =
      "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@patch-2.1.2/dist/unicornStudio.umd.js";
    i.onload = function () {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          UnicornStudio.init();
        });
      });
    };
    (document.head || document.body).appendChild(i);
  }
}

// ============================================================
// 2. GSAP SCROLL REVEAL (SplitText)
// ============================================================
// Attributes:
//   data-reveal-content="component"  — wrapper element
//   data-reveal-content="heading"    — animates words (mask)
//   data-reveal-content="paragraph"  — simple fade (no SplitText)
//   data-reveal-content="fade"       — fades in (autoAlpha)
// ============================================================

function initRevealAnimations() {
  let splitInstances = [];
  let revealScrollTriggers = [];
  let isAnimating = false;

  function runAnimations() {
    if (isAnimating) return;
    isAnimating = true;

    revealScrollTriggers.forEach((st) => st.kill());
    revealScrollTriggers = [];

    splitInstances.forEach((instance) => instance.revert());
    splitInstances = [];

    const components = document.querySelectorAll(
      '[data-reveal-content="component"]'
    );

    components.forEach((component) => {
      const headings = component.querySelectorAll(
        '[data-reveal-content="heading"]'
      );
      const paragraphs = component.querySelectorAll(
        '[data-reveal-content="paragraph"]'
      );
      const buttons = component.querySelectorAll(
        '[data-reveal-content="fade"]'
      );

      const rect = component.getBoundingClientRect();
      const alreadyVisible =
        rect.top < window.innerHeight * 0.8 ||
        (window.scrollY > 0 && rect.bottom < window.innerHeight);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: component,
          start: "top 80%",
          once: true,
          refreshPriority: -1,
        },
        defaults: alreadyVisible ? { duration: 0 } : {},
      });

      revealScrollTriggers.push(tl.scrollTrigger);

      if (headings.length > 0) {
        headings.forEach((heading) => {
          const headingSplit = SplitText.create(heading.children, {
            type: "lines, words",
            mask: "lines",
            linesClass: "line-mask",
            wordsClass: "word-mask",
          });
          splitInstances.push(headingSplit);

          gsap.set(heading, { opacity: 1 });

          tl.from(
            headingSplit.words,
            {
              yPercent: 110,
              duration: 0.8,
              stagger: 0.04,
              ease: "power2.out",
            },
            0
          );
        });
      }

      if (paragraphs.length > 0) {
        paragraphs.forEach((paragraph) => {
          gsap.set(paragraph, { opacity: 0 });
          tl.to(
            paragraph,
            { opacity: 1, duration: 0.8, ease: "power2.out" },
            0.4
          );
        });
      }

      if (buttons.length > 0) {
        gsap.set(buttons, { autoAlpha: 0 });

        tl.add(() => {
          gsap.fromTo(
            buttons,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.5, ease: "power2.out" }
          );
        }, 0.8);
      }
    });

    isAnimating = false;
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  document.fonts.ready
    .then(() => {
      if (isSafari) {
        requestAnimationFrame(() => requestAnimationFrame(runAnimations));
      } else {
        runAnimations();
      }
    })
    .catch(runAnimations);

  let lastWidth = window.innerWidth;
  let resizeTimer;

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) > 50) {
        runAnimations();
        lastWidth = currentWidth;
      }
    }, 300);
  });
}

// ============================================================
// 3. LINK HOVER CHARACTER ANIMATION
// ============================================================
// Attributes:
//   data-link-animate-chars  — on the text element to animate
// ============================================================

function initLinkHoverChars() {
  const offsetIncrement = 0.021;

  document.querySelectorAll("[data-link-animate-chars]").forEach((el) => {
    const hoverParent =
      el.closest("a, button, li, [data-link-hover]") || el.parentElement;
    hoverParent.setAttribute("data-link-hover", "");

    el.setAttribute("data-link-chars", "");

    const text = el.textContent;
    el.innerHTML = "";
    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${i * offsetIncrement}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      el.appendChild(span);
    });
  });
}

// ============================================================
// 4. FOOTER SVG REVEAL
// ============================================================
// Classes:
//   .footer_bottom_logo         — ScrollTrigger trigger element
//   .footer_bottom_logo_main    — bottom layer SVG
//   .footer_bottom_logo_middle  — middle layer SVG
//   .footer_bottom_logo_top     — top layer SVG
// ============================================================

function initFooterReveal() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (!document.querySelector(".footer_bottom_logo")) return;

  const initialStates = () =>
    gsap.set(
      [
        ".footer_bottom_logo_main svg",
        ".footer_bottom_logo_middle svg",
        ".footer_bottom_logo_top svg",
      ],
      { yPercent: 200 }
    );

  const animConfig = {
    duration: prefersReducedMotion ? 0 : 1,
    ease: "power3.out",
  };

  window.addEventListener(
    "load",
    () => {
      initialStates();

      ScrollTrigger.create({
        trigger: ".footer_bottom_logo",
        start: "top bottom",
        invalidateOnRefresh: true,
        onEnter: () => {
          gsap.to(".footer_bottom_logo_main svg", {
            yPercent: 0,
            onComplete: () =>
              gsap.set(".footer_bottom_logo_main svg", { clearProps: "all" }),
            ...animConfig,
          });
          gsap.to(".footer_bottom_logo_middle svg", {
            yPercent: 0,
            delay: 0.06,
            onComplete: () =>
              gsap.set(".footer_bottom_logo_middle svg", { clearProps: "all" }),
            ...animConfig,
          });
          gsap.to(".footer_bottom_logo_top svg", {
            yPercent: 0,
            delay: 0.12,
            onComplete: () =>
              gsap.set(".footer_bottom_logo_top svg", { clearProps: "all" }),
            ...animConfig,
          });
        },
        onLeaveBack: () => initialStates(),
      });
    },
    { once: true }
  );
}

// ============================================================
// 5. PAGE LOADER
// ============================================================
// Attributes:
//   data-load-wrap       — outermost loader wrapper
//   data-load-container  — inner content container (fades out)
//   data-load-bg         — background that slides away
//   data-load-progress   — progress bar element
//   data-load-logo       — logo element (clip-path reveal)
//   data-load-text       — text elements to animate (min. 2)
//   data-load-reset      — elements to show after loader (FOUC fix)
// ============================================================

function initLogoRevealLoader() {
  CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const wrap = document.querySelector("[data-load-wrap]");
  if (!wrap) return;

  const container = wrap.querySelector("[data-load-container]");
  const bg = wrap.querySelector("[data-load-bg]");
  const progressBar = wrap.querySelector("[data-load-progress]");
  const logo = wrap.querySelector("[data-load-logo]");
  const textElements = Array.from(wrap.querySelectorAll("[data-load-text]"));

  const resetTargets = Array.from(
    wrap.querySelectorAll("[data-load-reset]:not([data-load-text])")
  );

  const loadTimeline = gsap
    .timeline({
      defaults: {
        ease: "loader",
        duration: isSafari ? 5 : 3,
      },
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    })
    .set(wrap, { display: "block" })
    .to(progressBar, { scaleX: 1 })
    .to(logo, { clipPath: "inset(0% 0% 0% 0%)" }, "<")
    .to(container, { autoAlpha: 0, duration: 0.5 })
    .to(
      progressBar,
      { scaleX: 0, transformOrigin: "right center", duration: 0.5 },
      "<"
    )
    .add("hideContent", "<")
    .to(bg, { yPercent: -101, duration: 1 }, "hideContent")
    .set(wrap, { display: "none" });

  if (resetTargets.length) {
    loadTimeline.set(resetTargets, { autoAlpha: 1 }, 0);
  }

  if (textElements.length >= 2) {
    const firstWord = new SplitText(textElements[0], {
      type: "lines,chars",
      mask: "lines",
    });
    const secondWord = new SplitText(textElements[1], {
      type: "lines,chars",
      mask: "lines",
    });

    gsap.set([firstWord.chars, secondWord.chars], {
      autoAlpha: 0,
      yPercent: 125,
    });
    gsap.set(textElements, { autoAlpha: 1 });

    loadTimeline.to(
      firstWord.chars,
      { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } },
      0
    );

    loadTimeline.to(
      firstWord.chars,
      { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } },
      ">+=0.4"
    );

    loadTimeline.to(
      secondWord.chars,
      { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } },
      "<"
    );

    loadTimeline.to(
      secondWord.chars,
      { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } },
      "hideContent-=0.5"
    );
  }
}

// ============================================================
// 6. HERO CURSOR CARD
// ============================================================
// Classes:
//   .hero_full    — mouse tracking area
//   .reel_card    — card element that moves and rotates
//   .reel_layout  — container that defines movement bounds
// ============================================================

function initHeroCursorCard() {
  if (window.innerWidth < 992) return;

  const hero = document.querySelector(".hero_full");
  const card = document.querySelector(".reel_card");
  const container = document.querySelector(".reel_layout");

  if (!hero || !card || !container) return;

  let mouseVelocity = 0;
  let lastMouseX = 0;
  let isMouseInHero = false;
  let velocityTimeout;
  let animationFrame;

  hero.addEventListener("mouseenter", function () {
    isMouseInHero = true;
  });

  hero.addEventListener("mouseleave", function () {
    isMouseInHero = false;
    mouseVelocity = 0;
    clearTimeout(velocityTimeout);
    cancelAnimationFrame(animationFrame);

    gsap.to(card, {
      rotation: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  hero.addEventListener("mousemove", function (e) {
    if (window._miniShowreelOpen) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(function () {
      if (!isMouseInHero) return;

      const heroRect = hero.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const mouseX = e.clientX - heroRect.left;
      const mousePercent = mouseX / heroRect.width;

      const containerWidth = containerRect.width;
      const cardWidth = card.offsetWidth;
      const maxMove = containerWidth - cardWidth;
      const targetX = maxMove * mousePercent;

      mouseVelocity = e.clientX - lastMouseX;
      lastMouseX = e.clientX;

      const rotation = Math.max(-15, Math.min(15, mouseVelocity * 0.5));

      gsap.to(card, {
        x: targetX,
        rotation: rotation,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });

      clearTimeout(velocityTimeout);
      velocityTimeout = setTimeout(function () {
        if (isMouseInHero) {
          mouseVelocity = 0;
          gsap.to(card, {
            rotation: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }, 100);
    });
  });

  document.addEventListener("mouseleave", function () {
    mouseVelocity = 0;
    clearTimeout(velocityTimeout);
    cancelAnimationFrame(animationFrame);

    gsap.to(card, {
      rotation: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
}

// ============================================================
// 7. BUTTON CHARACTER STAGGER
// ============================================================
// Attributes:
//   data-button-animate-chars  — on the button element to animate
// ============================================================

function initButtonCharacterStagger() {
  const offsetIncrement = 0.01;

  document.querySelectorAll("[data-button-animate-chars]").forEach((button) => {
    const text = button.textContent;
    button.innerHTML = "";
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      button.appendChild(span);
    });
  });
}

// ============================================================
// 8. BUTTON ARROW ANIMATION
// ============================================================
// Classes:
//   .button_main_wrap           — hover trigger element
//   .button_main_arrow img/svg  — arrow element that animates
// ============================================================

function initButtonArrowAnimation() {
  document.querySelectorAll(".button_main_wrap").forEach((button) => {
    const arrowIcon = button.querySelector(
      ".button_main_arrow img, .button_main_arrow svg"
    );
    if (!arrowIcon) return;

    button.addEventListener("mouseenter", () => {
      gsap
        .timeline()
        .to(arrowIcon, { xPercent: 100, duration: 0.5, ease: "power2.out" })
        .set(arrowIcon, { xPercent: -100 })
        .to(arrowIcon, { xPercent: 0, duration: 0.5, ease: "power2.out" });
    });
  });
}

// ============================================================
// 9. BAR SCALE REVEAL
// ============================================================
// Classes:
//   .bars_wrap           — ScrollTrigger trigger element
//   .bars_first          — first bar (scales in from left)
//   .bars_second         — second bar (scales in from left)
//   .bars_first .c-text  — text inside first bar (fades in)
//   .bars_second .c-text — text inside second bar (fades in)
// ============================================================

function initBarScaleReveal() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const barFirst = document.querySelector(".bars_first");
  const barSecond = document.querySelector(".bars_second");
  const barFirstText = document.querySelector(".bars_first .c-text");
  const barSecondText = document.querySelector(".bars_second .c-text");

  if (!barFirst || !barSecond || !barFirstText || !barSecondText) return;

  if (prefersReducedMotion) {
    gsap.set([barFirst, barSecond], { scaleX: 1 });
    gsap.set([barFirstText, barSecondText], { opacity: 1 });
    return;
  }

  gsap.set(barFirst, { transformOrigin: "left center", scaleX: 0 });
  gsap.set(barSecond, { transformOrigin: "left center", scaleX: 0 });
  gsap.set([barFirstText, barSecondText], { opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  tl.to(barFirst, { scaleX: 1, duration: 1.85, ease: "expo.inOut" })
    .to(barFirstText, { opacity: 1, duration: 0.4, ease: "sine.out" }, "-=.6")
    .to(barSecond, { scaleX: 1, duration: 1.85, ease: "expo.inOut" }, "-=1.6")
    .to(barSecondText, { opacity: 1, duration: 0.4, ease: "sine.out" }, "-=.5");

  ScrollTrigger.create({
    trigger: ".bars_wrap",
    start: "top 85%",
    once: true,
    invalidateOnRefresh: true,
    onEnter: () => tl.play(),
  });
}

// ============================================================
// 10. IMAGES ON MOTION PATH SCROLL
// ============================================================
// Attributes:
//   data-motionpath="wrap"         — outer wrapper + ScrollTrigger trigger
//   data-motionpath="path"         — SVG path that items follow
//   data-motionpath="item"         — each image/card item
//   data-motionpath="item-details" — detail elements that fade in mid-scroll
// ============================================================

function initImagesOnPathScroll() {
  const wrap = document.querySelector('[data-motionpath="wrap"]');
  if (!wrap) return;

  const path = wrap.querySelector('[data-motionpath="path"]');
  const items = wrap.querySelectorAll('[data-motionpath="item"]');
  const itemDetails = wrap.querySelectorAll('[data-motionpath="item-details"]');

  gsap.set(items, { autoAlpha: 0 });
  gsap.set(itemDetails, { autoAlpha: 0 });

  function build() {
    gsap.set(items, {
      zIndex: (i, target, all) => all.length - i,
    });

    const oldTl = initImagesOnPathScroll.tl;
    let progress = 0;

    if (oldTl) {
      progress = oldTl.progress();
      oldTl.progress(0).kill();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
      defaults: {
        ease: "none",
        stagger: 0.3,
      },
    });

    tl.to(items, {
      duration: 1,
      motionPath: { path, align: path, curviness: 2, alignOrigin: [0.5, 0.5] },
    })
      .fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0)
      .fromTo(
        itemDetails,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.1 },
        0.5
      )
      .fromTo(items, { scale: 0.4 }, { scale: 1, duration: 0.65 }, 0)
      .to(items, { autoAlpha: 0, duration: 0.15 }, 0.85)
      .to(itemDetails, { autoAlpha: 0, duration: 0.05 }, 0.9);

    tl.progress(progress);

    initImagesOnPathScroll.tl = tl;
  }

  window.addEventListener("load", build, { once: true });

  if (!initImagesOnPathScroll.resizeHandler) {
    initImagesOnPathScroll.resizeHandler = debounce(build, 200);
    window.addEventListener("resize", initImagesOnPathScroll.resizeHandler);
  }
}

// ============================================================
// 11. MOTION PATH TITLE REVEAL
// ============================================================
// Classes:
//   .motionpath-content        — ScrollTrigger trigger element
//   .motionpath-content-title  — title whose characters animate in
// ============================================================

function initMotionPathTitleReveal() {
  const title = document.querySelector(".motionpath-content-title");
  if (!title) return;

  title.innerHTML = title.textContent
    .split("")
    .map(
      (char) =>
        `<span style="display: inline-block; overflow: hidden;">
          <span style="display: inline-block;">${
            char === " " ? "&nbsp;" : char
          }</span>
        </span>`
    )
    .join("");

  const chars = title.querySelectorAll("span > span");

  gsap.set(chars, { yPercent: 100 });

  window.addEventListener(
    "load",
    () => {
      gsap.to(chars, {
        yPercent: 0,
        stagger: { each: 0.05, from: "random" },
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".motionpath-content",
          start: "center bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { once: true }
  );
}

// ============================================================
// 12. LOGO MARQUEE
// ============================================================
// Classes:
//   .logos_scroll.top      — top marquee row (scrolls left)
//   .logos_scroll.bottom   — bottom marquee row (scrolls right)
//   .logos_cms_item        — individual logo items
//   .logos_title_name      — title element that shows brand name on hover
// Attributes:
//   data-brand             — brand name on each .logos_cms_item
// ============================================================

function initLogoMarquee() {
  const topRow = document.querySelector(".logos_scroll.top");
  const bottomRow = document.querySelector(".logos_scroll.bottom");
  if (!topRow || !bottomRow) return;

  function startMarquee() {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const topRowWidth = topRow.scrollWidth / 2;
    const bottomRowWidth = bottomRow.scrollWidth / 2;

    if (topRowWidth === 0 || bottomRowWidth === 0) {
      window.addEventListener("load", startMarquee, { once: true });
      return;
    }

    const topTl = gsap.timeline({ repeat: -1 });
    topTl.to(topRow, {
      x: -topRowWidth,
      duration: 60,
      ease: "none",
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % topRowWidth),
      },
    });

    const bottomTl = gsap.timeline({ repeat: -1 });
    bottomTl.fromTo(
      bottomRow,
      { x: -bottomRowWidth },
      {
        x: 0,
        duration: 60,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % bottomRowWidth),
        },
      }
    );

    if (!isTouchDevice) {
      const pauseBoth = () => {
        topTl.pause();
        bottomTl.pause();
      };
      const resumeBoth = () => {
        topTl.resume();
        bottomTl.resume();
      };

      topRow.addEventListener("mouseenter", pauseBoth);
      topRow.addEventListener("mouseleave", resumeBoth);
      bottomRow.addEventListener("mouseenter", pauseBoth);
      bottomRow.addEventListener("mouseleave", resumeBoth);

      const allItems = document.querySelectorAll(".logos_cms_item");
      const titleElement = document.querySelector(".logos_title_name");
      const originalTitle = titleElement ? titleElement.textContent : "";
      let isHovering = false;

      if (titleElement) gsap.set(titleElement, { opacity: 0 });

      allItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
          isHovering = true;

          allItems.forEach((otherItem) => {
            if (otherItem !== item)
              gsap.to(otherItem, { opacity: 0.3, duration: 0.3 });
          });

          const brandName = item.getAttribute("data-brand");
          if (brandName && titleElement) {
            titleElement.textContent = brandName;
            gsap.to(titleElement, { opacity: 1, duration: 0.3 });
          }
        });

        item.addEventListener("mouseleave", () => {
          isHovering = false;

          gsap.to(allItems, { opacity: 1, duration: 0.3 });

          setTimeout(() => {
            if (!isHovering && titleElement) {
              gsap.to(titleElement, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                  if (!isHovering) titleElement.textContent = originalTitle;
                },
              });
            }
          }, 50);
        });
      });
    }
  }

  startMarquee();
}

// ============================================================
// 13. REVIEWS — LAYOUT SWITCHER + HOVER ANIMATIONS
// ============================================================
// Classes:
//   .reviews_layout           — desktop hover layout (shown >=1280px, non-touch)
//   .slider-main_component    — mobile/touch slider layout
//   .reviews-links_cms_btn    — hover triggers (one per review)
// IDs (NodeLists, one per review item):
//   #review-para              — review paragraph text
//   #review-visual img        — review image (clip-path wipe)
//   #review-client-name       — client name
//   #review-client-project    — client project
//   #review-client-title      — client title
// ============================================================

function initReviewsLayoutSwitcher() {
  const reviewsLayout = document.querySelector(".reviews_layout");
  const sliderComponent = document.querySelector(".slider-main_component");
  if (!reviewsLayout || !sliderComponent) return;

  function checkDisplayConditions() {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isWideEnough = window.innerWidth >= 1280;

    if (!isTouch && isWideEnough) {
      reviewsLayout.style.display = "";
      sliderComponent.style.display = "none";
    } else {
      reviewsLayout.style.display = "none";
      sliderComponent.style.display = "";
    }
  }

  checkDisplayConditions();
  window.addEventListener("resize", checkDisplayConditions);
}

function initReviewsHoverAnimation() {
  const reviewHeadingTrigger = document.querySelectorAll(
    ".reviews-links_cms_btn"
  );
  const reviewPara = document.querySelectorAll("#review-para");
  if (reviewHeadingTrigger.length === 0 || reviewPara.length === 0) return;

  const reviewVisual = document.querySelectorAll("#review-visual img");
  const reviewClientName = document.querySelectorAll("#review-client-name");
  const reviewClientProject = document.querySelectorAll(
    "#review-client-project"
  );
  const reviewClientTitle = document.querySelectorAll("#review-client-title");

  const splitParas = Array.from(reviewPara).map((para) =>
    SplitText.create(para, {
      type: "lines, words",
      mask: "lines",
      reduceWhiteSpace: true,
      smartWrap: true,
      linesClass: "line-mask",
    })
  );

  let currentIndex = null;

  gsap.set(reviewPara, { visibility: "hidden" });
  gsap.set(reviewVisual, { clipPath: "inset(0 100% 0 0)" });
  gsap.set([reviewClientName, reviewClientProject, reviewClientTitle], {
    yPercent: 100,
    opacity: 0,
  });
  splitParas.forEach((split) => gsap.set(split.lines, { yPercent: 100 }));

  function animateIn(index) {
    const tl = gsap.timeline();

    tl.set(reviewPara[index], { visibility: "visible" }, 0);

    tl.to(
      splitParas[index].lines,
      { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.04 },
      0
    );

    tl.fromTo(
      [
        reviewClientName[index],
        reviewClientProject[index],
        reviewClientTitle[index],
      ],
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      },
      0.2
    );

    tl.to(
      reviewVisual[index],
      { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power3.out" },
      0.4
    );

    return tl;
  }

  function forceHide(index) {
    gsap.set(reviewPara[index], { visibility: "hidden", overwrite: true });
    gsap.set(splitParas[index].lines, { yPercent: 100, overwrite: true });
    gsap.set(reviewClientName[index], {
      yPercent: 100,
      opacity: 0,
      overwrite: true,
    });
    gsap.set(reviewClientProject[index], {
      yPercent: 100,
      opacity: 0,
      overwrite: true,
    });
    gsap.set(reviewClientTitle[index], {
      yPercent: 100,
      opacity: 0,
      overwrite: true,
    });
    gsap.set(reviewVisual[index], {
      clipPath: "inset(0 100% 0 0)",
      overwrite: true,
    });
  }

  const allReviewTargets = () => [
    ...reviewPara,
    ...reviewVisual,
    ...reviewClientName,
    ...reviewClientProject,
    ...reviewClientTitle,
    ...splitParas.flatMap((s) => s.lines),
  ];

  function hideAll() {
    gsap.killTweensOf(allReviewTargets());
    for (let i = 0; i < reviewPara.length; i++) forceHide(i);
    currentIndex = null;
  }

  reviewHeadingTrigger.forEach((trigger, index) => {
    trigger.addEventListener("mouseenter", function () {
      if (index === currentIndex) return;

      gsap.killTweensOf(allReviewTargets());
      for (let i = 0; i < reviewPara.length; i++) forceHide(i);

      currentIndex = index;
      animateIn(index);
    });
  });

  reviewHeadingTrigger.forEach((trigger) => {
    trigger.addEventListener("mouseleave", function () {
      setTimeout(() => {
        const isOverAnyTrigger = Array.from(reviewHeadingTrigger).some((t) =>
          t.matches(":hover")
        );
        if (!isOverAnyTrigger) hideAll();
      }, 50);
    });
  });

  window.addEventListener("blur", hideAll);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) hideAll();
  });

  const triggerContainer = reviewHeadingTrigger[0]?.parentElement;
  if (triggerContainer) {
    triggerContainer.addEventListener("mouseleave", hideAll);
  }
}

// ============================================================
// 14. FEATURED HORIZONTAL SCROLL
// ============================================================
// Classes:
//   .featured_height          — scroll height trigger element
//   .featured_contain         — pinned container
//   .featured_content         — bounds reference for max scroll
//   .featured_cms_list        — horizontally scrolling list
//   .featured_card img        — images with parallax effect
//   .featured_loader_slot     — progress bar slot wrappers
//   .featured_loader_progress — progress bar fill elements
// ============================================================

function initFeaturedHorizontalScroll() {
  const list = document.querySelector(".featured_cms_list");
  const content = document.querySelector(".featured_content");
  const trigger = document.querySelector(".featured_height");
  const pin = document.querySelector(".featured_contain");
  if (!list || !content || !trigger || !pin) return;

  const loaderSlots = document.querySelectorAll(".featured_loader_slot");
  const listImages = document.querySelectorAll(".featured_card img");

  const progressBars = [];
  loaderSlots.forEach((slot) => {
    const progress = slot.querySelector(".featured_loader_progress");
    if (progress) progressBars.push(progress);
  });

  if (listImages.length)
    gsap.set(listImages, { transformOrigin: "right center" });
  if (progressBars.length)
    gsap.set(progressBars, { transformOrigin: "left center" });

  const computeMaxScroll = () => -(list.scrollWidth - content.offsetWidth);
  let maxScroll = computeMaxScroll();

  const applyTriggerH = () => {
    trigger.style.height = `${list.scrollWidth}px`;
  };

  const applyProgress = (progress) => {
    const containerX = gsap.utils.interpolate(0, maxScroll, progress);
    list.style.transform = `translateX(${containerX}px)`;

    for (let i = 0; i < listImages.length; i++) {
      const image = listImages[i];
      const lerp = gsap.utils.interpolate(
        0,
        image.clientWidth * 0.25,
        progress
      );
      image.style.transform = `translateX(${lerp}px) scale(1.25)`;
    }

    const total = progressBars.length;
    if (!total) return;

    const stagger = total > 1 ? 0.8 / (total - 1) : 0;
    const maxOffset = (total - 1) * stagger;
    const denom = Math.max(1e-6, 1 - maxOffset);

    for (let i = 0; i < total; i++) {
      const offset = i * stagger;
      const p = gsap.utils.clamp(0, 1, (progress - offset) / denom);
      const x = gsap.utils.interpolate(-100, 0, p);
      progressBars[i].style.transform = `translateX(${x}%)`;
    }
  };

  applyProgress(0);
  applyTriggerH();

  const st = ScrollTrigger.create({
    trigger,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    pin,
    pinSpacing: false,
    invalidateOnRefresh: true,
    onUpdate: (self) => applyProgress(self.progress),
    onRefresh: (self) => {
      maxScroll = computeMaxScroll();
      applyProgress(self.progress);
    },
  });

  const queueRefresh = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyTriggerH();
        st.refresh();
      });
    });
  };

  let resizeTimer;
  const debouncedRefresh = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const savedProgress = gsap.utils.clamp(0, 1, st.progress);
      const wasActive = st.isActive;

      maxScroll = computeMaxScroll();
      applyTriggerH();
      st.refresh();

      if (wasActive) {
        const targetScroll = st.start + savedProgress * (st.end - st.start);
        st.scroll(targetScroll);
      }
      applyProgress(savedProgress);
    }, 200);
  };

  document.fonts.ready.then(queueRefresh).catch(() => {});
  window.addEventListener("load", queueRefresh, { once: true });
  window.addEventListener("resize", debouncedRefresh);
}

// ============================================================
// 15. FEATURED VIDEO HOVER
// ============================================================
// Classes:
//   .featured_cms_item  — hover trigger element
//   .featured_video     — video wrapper (height animates via GSAP)
// ============================================================

function initFeaturedVideoHover() {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const items = document.querySelectorAll(".featured_cms_item");
  if (!items.length) return;

  items.forEach((item) => {
    const videoWrapper = item.querySelector(".featured_video");
    const video = videoWrapper ? videoWrapper.querySelector("video") : null;
    if (!videoWrapper) return;

    if (isTouch) {
      gsap.set(videoWrapper, { height: "auto" });
      if (video) video.play();
      return;
    }

    gsap.set(videoWrapper, { height: 0 });

    item.addEventListener("mouseenter", () => {
      gsap.to(videoWrapper, {
        height: "auto",
        duration: 0.6,
        ease: "power2.out",
      });
      if (video) {
        video.currentTime = 0;
        const p = video.play();
        if (p !== undefined) p.catch(() => {});
      }
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(videoWrapper, { height: 0, duration: 0.6, ease: "power2.out" });
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  });
}

// ============================================================
// 16. CURSOR MARQUEE EFFECT
// ============================================================
// Attributes:
//   data-cursor-marquee-status      — on the cursor element
//   data-cursor-marquee-text-target — text elements inside the cursor
//   data-cursor-marquee-text        — on hoverable elements, value is marquee text
// ============================================================

function initCursorMarqueeEffect() {
  const cursor = document.querySelector("[data-cursor-marquee-status]");
  if (!cursor) return;

  const wrap = document.querySelector(".work_wrap");

  const hoverOutDelay = 0.4;
  const followDuration = 0.4;
  const speedMultiplier = 5;

  const targets = cursor.querySelectorAll("[data-cursor-marquee-text-target]");

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });

  const xTo = gsap.quickTo(cursor, "x", {
    duration: followDuration,
    ease: "power3",
  });
  const yTo = gsap.quickTo(cursor, "y", {
    duration: followDuration,
    ease: "power3",
  });

  let pauseTimeout = null;
  let activeEl = null;
  let lastX = 0;
  let lastY = 0;
  let insideWrap = false;

  function showCursor() {
    insideWrap = true;
    cursor.setAttribute("data-cursor-marquee-status", "not-active");
  }

  function hideCursor() {
    insideWrap = false;
    if (activeEl) pauseLater();
    cursor.setAttribute("data-cursor-marquee-status", "hidden");
  }

  function playFor(el) {
    if (!el) return;
    if (pauseTimeout) clearTimeout(pauseTimeout);
    const text = el.getAttribute("data-cursor-marquee-text") || "";
    const sec = (text.length || 1) / speedMultiplier;
    targets.forEach((t) => {
      t.textContent = text;
      t.style.animationPlayState = "running";
      t.style.animationDuration = sec + "s";
    });
    cursor.setAttribute("data-cursor-marquee-status", "active");
    activeEl = el;
  }

  function pauseLater() {
    cursor.setAttribute("data-cursor-marquee-status", "not-active");
    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      targets.forEach((t) => {
        t.style.animationPlayState = "paused";
      });
    }, hoverOutDelay * 1000);
    activeEl = null;
  }

  function checkTarget() {
    if (!insideWrap) return;
    const el = document.elementFromPoint(lastX, lastY);
    const hit = el && el.closest("[data-cursor-marquee-text]");
    if (hit !== activeEl) {
      if (activeEl) pauseLater();
      if (hit) playFor(hit);
    }
  }

  const moveTarget = wrap || window;

  if (wrap) {
    wrap.addEventListener("mouseenter", showCursor);
    wrap.addEventListener("mouseleave", hideCursor);
  }

  moveTarget.addEventListener(
    "pointermove",
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    },
    { passive: true }
  );

  cursor.setAttribute("data-cursor-marquee-status", "hidden");
}

// ============================================================
// 17. VELOCITY BASED CUSTOM CURSOR
// ============================================================
// Classes:
//   .cursor        — cursor wrapper element
//   .cursor-inner  — inner elements that rotate based on velocity
// ============================================================

function initVelocityBasedCustomCursor() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const innerElements = cursor.querySelectorAll(".cursor-inner");
  innerElements.forEach((el) => (el.style.transformOrigin = "50% 50%"));

  let currentRotation = 0;
  let targetRotation = 0;
  let lastX = 0;
  let lastTime = performance.now();

  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

    if (!prefersReducedMotion) {
      const currentTime = performance.now();
      const timeDifference = currentTime - lastTime;

      if (timeDifference > 0) {
        const positionDifference = e.clientX - lastX;
        const velocityX = positionDifference / timeDifference;
        targetRotation = Math.max(Math.min(velocityX * 50, 70), -70);
      }

      lastX = e.clientX;
      lastTime = currentTime;
    }
  });

  function animateRotation() {
    if (!prefersReducedMotion) {
      currentRotation += (targetRotation - currentRotation) * 0.07;
      targetRotation += (0 - targetRotation) * 0.03;
      innerElements.forEach(
        (el) => (el.style.transform = `rotate(${currentRotation}deg)`)
      );
    }
    requestAnimationFrame(animateRotation);
  }
  animateRotation();
}

// ============================================================
// 18. MINI SHOWREEL PLAYER
// ============================================================
// Attributes:
//   data-mini-showreel-open="name"      — open trigger button
//   data-mini-showreel-close="name"     — close trigger button
//   data-mini-showreel-lightbox="name"  — lightbox wrapper element
//   data-mini-showreel-player="name"    — player element that flips
//   data-mini-showreel-target           — target area inside lightbox
//   data-mini-showreel-safearea         — safe area bounds for sizing
//   data-mini-showreel-status           — toggled "active"/"not-active"
// ============================================================

function initMiniShowreelPlayer() {
  if (window.innerWidth < 992) return;

  const openBtns = document.querySelectorAll("[data-mini-showreel-open]");
  if (!openBtns.length) return;

  const duration = 1;
  const ease = "expo.inOut";
  const zIndex = 2000;

  let n = "",
    isOpen = false;
  let lb, pw, tg;
  let pwCss = "",
    lbZ = "",
    pwZ = "";

  const q = (sel, root = document) => root.querySelector(sel);
  const getLB = (name) => q(`[data-mini-showreel-lightbox="${name}"]`);
  const getPW = (name) => q(`[data-mini-showreel-player="${name}"]`);
  const safe = (t) =>
    t.closest("[data-mini-showreel-safearea]") ||
    q("[data-mini-showreel-safearea]", t) ||
    t;

  const fit = (b, a) => {
    let w = b.width,
      h = w / a;
    if (h > b.height) {
      h = b.height;
      w = h * a;
    }
    return {
      left: b.left + (b.width - w) / 2,
      top: b.top + (b.height - h) / 2,
      width: w,
      height: h,
    };
  };

  const rectFor = (t) => {
    const b = safe(t).getBoundingClientRect();
    const r = t.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
    return fit(b, a);
  };

  const toAbsolute = (el, r) => {
    const parent = el.offsetParent || document.body;
    const pb = parent.getBoundingClientRect();
    return {
      left: r.left - pb.left + parent.scrollLeft,
      top: r.top - pb.top + parent.scrollTop,
      width: r.width,
      height: r.height,
    };
  };

  const place = (el, r) => {
    const abs = toAbsolute(el, r);
    gsap.set(el, {
      position: "absolute",
      left: abs.left,
      top: abs.top,
      width: abs.width,
      height: abs.height,
      margin: 0,
      x: 0,
      y: 0,
    });
  };

  function setStatus(status) {
    if (!n) return;
    document
      .querySelectorAll(
        `[data-mini-showreel-lightbox="${n}"], [data-mini-showreel-player="${n}"]`
      )
      .forEach((el) => el.setAttribute("data-mini-showreel-status", status));
  }

  function zOn() {
    lbZ = lb?.style.zIndex || "";
    pwZ = pw?.style.zIndex || "";
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);
  }

  function zOff() {
    if (lb) lb.style.zIndex = lbZ;
    if (pw) pw.style.zIndex = pwZ;
  }

  function openBy(name) {
    if (!name || isOpen) return;
    lb = getLB(name);
    pw = getPW(name);
    if (!lb || !pw) return;
    tg = q("[data-mini-showreel-target]", lb);
    if (!tg) return;
    n = name;
    isOpen = true;
    window._miniShowreelOpen = true;
    pw.dataset.flipId = n;
    pwCss = pw.style.cssText || "";
    zOn();
    setStatus("active");
    const state = Flip.getState(pw);
    place(pw, rectFor(tg));
    Flip.from(state, { duration, ease, absolute: true, scale: false });
  }

  function closeBy(nameOrEmpty) {
    if (!isOpen || !pw) return;
    if (nameOrEmpty && nameOrEmpty !== n) return;
    setStatus("not-active");
    const state = Flip.getState(pw);
    pw.style.cssText = pwCss;
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);
    Flip.from(state, {
      duration,
      ease,
      absolute: true,
      scale: false,
      onComplete: () => {
        zOff();
        window._miniShowreelOpen = false;
        n = "";
        isOpen = false;
        lb = pw = tg = null;
        pwCss = lbZ = pwZ = "";
      },
    });
  }

  function onResize() {
    if (!isOpen || !pw || !tg) return;
    place(pw, rectFor(tg));
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openBy(btn.getAttribute("data-mini-showreel-open") || "");
    });
  });

  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-mini-showreel-close]");
    if (!closeBtn) return;
    e.preventDefault();
    closeBy(closeBtn.getAttribute("data-mini-showreel-close") || "");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBy("");
  });

  const heroFull = document.querySelector(".hero_full");
  if (heroFull) {
    heroFull.addEventListener("click", (e) => {
      if (!isOpen) return;
      if (e.target.closest("[data-mini-showreel-open]")) return;
      closeBy("");
    });
  }

  window.addEventListener("resize", onResize);
}

// ============================================================
// 19. BUTTON LINK HOVER
// ============================================================
// Classes:
//   .button_link_wrap — hover trigger element
//   .button_link_line — line element that animates width
// ============================================================

function initButtonLinkHover() {
  const buttonWraps = gsap.utils.toArray(".button_link_wrap");
  if (!buttonWraps.length) return;

  buttonWraps.forEach((wrap) => {
    const line = wrap.querySelector(".button_link_line");
    if (!line) return;

    wrap.addEventListener("mouseenter", () => {
      gsap.to(line, { width: "100%", duration: 0.6, ease: "power2.out" });
    });

    wrap.addEventListener("mouseleave", () => {
      gsap.to(line, { width: "0%", duration: 0.3, ease: "power2.out" });
    });
  });
}

// ============================================================
// 20. FAQS ACCORDION
// ============================================================
// Attributes:
//   data-accordion-css-init         — on the outer wrapper
//   data-accordion-toggle           — on each clickable toggle
//   data-accordion-status           — on each item (not-active/active)
// ============================================================

function initFaqsAccordion() {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouch) document.body.classList.add("is-touch");

  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return;

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return;

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );
      });
    });
}

// ============================================================
// 21. NAV DESKTOP HIDE/SHOW ON SCROLL
// ============================================================

function initNavDesktop() {
  const navContainer = document.querySelector(".nav_desktop_contain");
  if (!navContainer) return;

  const navLinks = navContainer.querySelectorAll("li");
  const navButton = navContainer.querySelector('[data-nav="button"]');

  let isHidden = false;

  function hideNav() {
    gsap.to(navLinks, {
      xPercent: -100,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
      stagger: { from: "start", amount: 0.15 },
    });
    gsap.to(navButton, {
      xPercent: 100,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
    });
  }

  function showNav() {
    gsap.to(navLinks, {
      xPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: { from: "end", amount: 0.15 },
    });
    gsap.to(navButton, {
      xPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    });
  }

  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const scrollingDown = self.direction === 1;
      const currentScrollY = self.scroll();
      if (currentScrollY < 50) {
        if (isHidden) {
          showNav();
          isHidden = false;
        }
        return;
      }
      if (scrollingDown && !isHidden) {
        hideNav();
        isHidden = true;
      } else if (!scrollingDown && isHidden) {
        showNav();
        isHidden = false;
      }
    },
  });
}

// ============================================================
// 22. NAV MOBILE BUTTON HIDE/SHOW ON SCROLL
// ============================================================

function initNavMobileScroll() {
  const navContainer = document.querySelector('[data-nav="component"]');
  const navMobileButton = navContainer?.querySelector(
    '[data-nav="mobile-btn"]'
  );
  if (!navContainer || !navMobileButton) return;

  gsap.set(navMobileButton, { xPercent: 0, opacity: 1 });

  let isHidden = false;

  function hideNav() {
    gsap.to(navMobileButton, {
      xPercent: 100,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
    });
  }

  function showNav() {
    gsap.to(navMobileButton, {
      xPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    });
  }

  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const scrollingDown = self.direction === 1;
      const currentScrollY = self.scroll();
      if (currentScrollY < 50) {
        if (isHidden) {
          showNav();
          isHidden = false;
        }
        return;
      }
      if (scrollingDown && !isHidden) {
        hideNav();
        isHidden = true;
      } else if (!scrollingDown && isHidden) {
        showNav();
        isHidden = false;
      }
    },
  });
}

// ============================================================
// 23. MOBILE MENU OPEN / CLOSE
// ============================================================

function initMobileMenu() {
  const navMobileContainer = document.querySelector(".nav_mobile_contain");
  const navMobileWrapper = navMobileContainer?.querySelector(
    ".nav_mobile_wrapper"
  );
  const navLinks = navMobileContainer?.querySelectorAll("li");
  const navButton = navMobileContainer?.querySelector(
    ".nav_mobile_menu_button"
  );
  if (
    !navMobileContainer ||
    !navMobileWrapper ||
    !navLinks?.length ||
    !navButton
  )
    return;

  const mobileLineTop = navButton.querySelector(".nav_mobile_menu_line.top");
  const mobileLineBtm = navButton.querySelector(".nav_mobile_menu_line.btm");

  const tl = gsap.timeline({
    paused: true,
    delay: 0.1,
    defaults: { ease: "power3.inOut", duration: 0.5 },
  });
  tl.to(mobileLineTop, { y: 5 });
  tl.to(mobileLineBtm, { y: -5 }, "<");
  tl.to(mobileLineTop, { rotation: 45, ease: "back.inOut(1.2)" }, "<=.225");
  tl.to(mobileLineBtm, { rotation: -45, ease: "back.inOut(1.2)" }, "<");

  function openMenu() {
    gsap.killTweensOf([navLinks, navMobileWrapper]);
    tl.play();
    gsap.to(navMobileWrapper, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.8,
      ease: "power3.inOut",
    });
    gsap.fromTo(
      navLinks,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        stagger: { from: "start", amount: 0.1 },
        delay: 0.4,
      }
    );
  }

  function closeMenu() {
    tl.reverse();
    gsap.killTweensOf([navLinks, navMobileWrapper]);
    gsap.to(navMobileWrapper, {
      clipPath: "inset(100% 0% 0% 0%)",
      duration: 0.6,
      ease: "power3.inOut",
      delay: 0.1,
    });
    gsap.to(navLinks, {
      yPercent: 100,
      opacity: 0,
      duration: 0.3,
      ease: "power3.out",
      stagger: { from: "end", amount: 0.08 },
    });
  }

  navButton.addEventListener("click", () => {
    if (navMobileWrapper.classList.contains("open")) {
      closeMenu();
      navMobileWrapper.classList.remove("open");
    } else {
      openMenu();
      navMobileWrapper.classList.add("open");
    }
  });

  document.querySelectorAll('[data-nav="link"]').forEach((li) => {
    li.addEventListener("click", () => {
      if (navMobileWrapper.classList.contains("open")) {
        closeMenu();
        navMobileWrapper.classList.remove("open");
      }
    });
  });
}

// ============================================================
// 24. ESTIMATE BUTTON HOVER ANIMATION
// ============================================================
// Classes:
//   .estimate_btn            — outer button wrapper (receives is-hovered)
//   .estimate_btn_icon       — hover trigger element
//   .estimate_bg             — background that animates width 0 -> 100%
//   .btn-animate-chars__text — text element whose chars animate in
// Notes:
//   Non-touch only. On click, hides the button.
//   CSS required:
//     .estimate_bg { width: 0%; left: 0; transition: width 0.4s cubic-bezier(0.25,0.1,0.25,1); }
//     .estimate_btn.is-hovered .estimate_bg { width: 100%; transition: width 0.3s ease-out; }
//     .estimate-char-mask { display: inline-block; overflow: hidden; vertical-align: bottom; }
//     .estimate-char { display: inline-block; transform: translateY(110%); transition: transform 0.3s cubic-bezier(0.625,0.05,0,1); }
//     .estimate_btn.is-hovered .estimate-char { transform: translateY(0%); }
// ============================================================

function initEstimateButton() {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const btn = document.querySelector(".estimate_btn");
  const icon = btn?.querySelector(".estimate_btn_icon");
  const bg = btn?.querySelector(".estimate_bg");
  const text = btn?.querySelector(".btn-animate-chars__text");
  if (!btn || !icon || !bg || !text) return;

  const chars = [...text.textContent];
  text.textContent = "";

  const charEls = [];

  chars.forEach((char, i) => {
    const mask = document.createElement("span");
    mask.classList.add("estimate-char-mask");

    const inner = document.createElement("span");
    inner.classList.add("estimate-char");
    inner.textContent = char;
    if (char === " ") inner.style.whiteSpace = "pre";
    inner.dataset.staggerDelay = `${0.15 + i * 0.015}s`;
    inner.style.transitionDelay = `${0.15 + i * 0.015}s`;

    mask.appendChild(inner);
    text.appendChild(mask);
    charEls.push(inner);
  });

  if (!isTouch) {
    icon.addEventListener("mouseenter", () => {
      charEls.forEach(
        (c) => (c.style.transitionDelay = c.dataset.staggerDelay)
      );
      bg.style.transitionDelay = "0s";
      btn.classList.add("is-hovered");
    });

    icon.addEventListener("mouseleave", () => {
      charEls.forEach((c) => (c.style.transitionDelay = "0s"));
      bg.style.transitionDelay = "0.25s";
      btn.classList.remove("is-hovered");
    });
  }

  btn.addEventListener("click", () => {
    btn.style.display = "none";
  });
}

// ============================================================
// 25. DOCUMENT TITLE ON BLUR/FOCUS
// ============================================================

function initDocumentTitle() {
  const documentTitleStore = document.title;
  const documentTitleOnBlur = "Are you still there? We miss you!";

  window.addEventListener("focus", () => {
    document.title = documentTitleStore;
  });

  window.addEventListener("blur", () => {
    document.title = documentTitleOnBlur;
  });
}

// ============================================================
// RUN
// ============================================================

initScroll();

onReady(() => {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // All devices
  if (window.innerWidth >= 768) initRevealAnimations();
  initLogoRevealLoader();
  initLogoMarquee();
  initReviewsLayoutSwitcher();
  initFaqsAccordion();
  initEstimateButton();
  initDocumentTitle();

  window.addEventListener(
    "load",
    () => {
      initMobileMenu();
      initNavMobileScroll();
    },
    { once: true }
  );

  // Mobile only (<= 991px) — simple fade for motionpath cards
  if (window.innerWidth < 992) {
    document.querySelectorAll(".motionpath-content-item").forEach((item) => {
      gsap.from(item, {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          once: true,
        },
      });
    });
  }

  // All devices
  //initBarScaleReveal();

  // Desktop only (992px+)
  if (window.innerWidth >= 992) {
    initLinkHoverChars();
    initFooterReveal();
    //initImagesOnPathScroll();
    initMotionPathTitleReveal();
    initFeaturedHorizontalScroll();
    initFeaturedVideoHover();
  }

  // Non-touch only (any screen size)
  if (!isTouch) {
    initVelocityBasedCustomCursor();
  }

  // Desktop non-touch only (992px+)
  if (window.innerWidth >= 992 && !isTouch) {
    initNavDesktop();
    //initHeroCursorCard();
    initReviewsHoverAnimation();
    initCursorMarqueeEffect();
    initButtonLinkHover();

    if (!prefersReducedMotion) {
      initButtonCharacterStagger();
      initButtonArrowAnimation();
      //initMiniShowreelPlayer();
    }
  }

  // Final refresh — only if no loader present
  if (!document.querySelector("[data-load-wrap]")) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    window.addEventListener(
      "load",
      () => {
        setTimeout(() => ScrollTrigger.refresh(), isSafari ? 500 : 0);
      },
      { once: true }
    );
  }
});
