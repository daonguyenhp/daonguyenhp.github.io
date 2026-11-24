(function () {
  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Mobile menu toggle with keyboard Escape and outside click support
  var burger = document.querySelector("[data-nav-burger]");
  var nav = document.getElementById("primary-nav");

  function setMenuOpen(open) {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = burger.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        burger.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        burger.getAttribute("aria-expanded") === "true" &&
        !nav.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  // 2. Active tab tracking on click and scroll (top nav + floating side rail)
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var railLinks = Array.prototype.slice.call(document.querySelectorAll("[data-rail-link]"));
  var sectionMap = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var target = id ? document.getElementById(id) : null;
    if (target) {
      sectionMap.push({ id: id, link: link, target: target });
    }
    link.addEventListener("click", function () {
      setActiveNav(id);
    });
  });

  railLinks.forEach(function (rLink) {
    var id = rLink.getAttribute("data-rail-link");
    rLink.addEventListener("click", function () {
      setActiveNav(id);
    });
  });

  function setActiveNav(activeId) {
    var activeIdx = 0;
    sectionMap.forEach(function (item, idx) {
      if (item.id === activeId) {
        activeIdx = idx;
      }
    });

    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + activeId;
      if (match) {
        link.setAttribute("aria-current", "page");
        link.classList.add("is-active");
      } else {
        link.removeAttribute("aria-current");
        link.classList.remove("is-active");
      }
    });

    railLinks.forEach(function (rLink, idx) {
      var match = rLink.getAttribute("data-rail-link") === activeId;
      rLink.classList.toggle("is-passed", idx <= activeIdx);
      if (match) {
        rLink.setAttribute("aria-current", "page");
        rLink.classList.add("is-active");
      } else {
        rLink.removeAttribute("aria-current");
        rLink.classList.remove("is-active");
      }
    });
  }

  if (sectionMap.length > 0) {
    function syncActiveSectionOnScroll() {
      var triggerY = window.innerHeight * 0.34;
      var currentId = sectionMap[0].id;
      for (var i = 0; i < sectionMap.length; i++) {
        var rect = sectionMap[i].target.getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentId = sectionMap[i].id;
        }
      }
      // If scrolled to the very bottom of the page, light up the final section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
        currentId = sectionMap[sectionMap.length - 1].id;
      }
      setActiveNav(currentId);
    }

    window.addEventListener("scroll", syncActiveSectionOnScroll, { passive: true });
    syncActiveSectionOnScroll();
  }

  // 3. Hardware-accelerated 2D Canvas Engine: Ambient Constellation + Smooth Physics Star Particles
  if (!prefersReducedMotion) {
    initCanvasEngine();
  }

  function initCanvasEngine() {
    var bgCanvas = document.createElement("canvas");
    bgCanvas.className = "ambient-canvas";
    bgCanvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(bgCanvas, document.body.firstChild);

    var fxCanvas = document.createElement("canvas");
    fxCanvas.className = "fx-canvas";
    fxCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(fxCanvas);

    var bgCtx = bgCanvas.getContext("2d");
    var fxCtx = fxCanvas.getContext("2d");
    if (!bgCtx || !fxCtx) return;

    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var stars = [];
    var pointer = { x: -9999, y: -9999, prevX: -9999, prevY: -9999 };
    var palette = [
      { r: 194, g: 65, b: 12 },   // Terracotta accent
      { r: 0, g: 82, b: 156 },    // HCMUT blue
      { r: 217, g: 119, b: 6 },   // Warm amber
      { r: 20, g: 20, b: 19 }     // Deep ink
    ];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fxCanvas.width = width * dpr;
      fxCanvas.height = height * dpr;
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var targetCount = Math.min(Math.max(Math.floor((width * height) / 26000), 18), 44);
      while (nodes.length < targetCount) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 20, // px per second
          vy: (Math.random() - 0.5) * 20,
          r: Math.random() * 1.4 + 1.1,
          phase: Math.random() * Math.PI * 2,
          isStar: Math.random() < 0.28
        });
      }
      if (nodes.length > targetCount) {
        nodes.length = targetCount;
      }
    }

    function drawSparkle(ctx, x, y, outerR, rotation, color, alpha) {
      if (alpha <= 0.005 || outerR <= 0.2) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha.toFixed(3) + ")";

      var innerR = outerR * 0.26;
      ctx.beginPath();
      ctx.moveTo(0, -outerR);
      ctx.quadraticCurveTo(innerR, -innerR, outerR, 0);
      ctx.quadraticCurveTo(innerR, innerR, 0, outerR);
      ctx.quadraticCurveTo(-innerR, innerR, -outerR, 0);
      ctx.quadraticCurveTo(-innerR, -innerR, 0, -outerR);
      ctx.closePath();
      ctx.fill();

      // Subtle bright core for smoothness
      ctx.fillStyle = "rgba(255, 255, 255, " + (alpha * 0.55).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(0, 0, outerR * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function spawnStarBurst(x, y, count, speedScale, inheritVx, inheritVy) {
      if (stars.length > 140) return;
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = (Math.random() * 85 + 45) * speedScale;
        var color = palette[Math.floor(Math.random() * palette.length)];
        stars.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed + (inheritVx || 0) * 0.25,
          vy: Math.sin(angle) * speed - 28 + (inheritVy || 0) * 0.25,
          size: Math.random() * 4.5 + 4.5, // outer radius 4.5px - 9px
          angle: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 4.5, // rad/s
          age: 0,
          ttl: Math.random() * 0.28 + 0.48, // 0.48s - 0.76s lifetime
          color: color
        });
      }
    }

    var lastTime = performance.now();

    function frame(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.05); // delta time in seconds, capped at 50ms
      lastTime = now;

      // Render ambient constellation background
      bgCtx.clearRect(0, 0, width, height);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.phase += 1.4 * dt;

        if (a.x < 0) a.x = width;
        if (a.x > width) a.x = 0;
        if (a.y < 0) a.y = height;
        if (a.y > height) a.y = 0;

        var mdx = pointer.x - a.x;
        var mdy = pointer.y - a.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 170) {
          var mAlpha = (1 - mDist / 170) * 0.22;
          bgCtx.strokeStyle = "rgba(194, 65, 12, " + mAlpha.toFixed(3) + ")";
          bgCtx.lineWidth = 1;
          bgCtx.beginPath();
          bgCtx.moveTo(a.x, a.y);
          bgCtx.lineTo(pointer.x, pointer.y);
          bgCtx.stroke();
        }

        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 135) {
            var lineAlpha = (1 - dist / 135) * 0.11;
            bgCtx.strokeStyle = "rgba(20, 20, 19, " + lineAlpha.toFixed(3) + ")";
            bgCtx.lineWidth = 0.8;
            bgCtx.beginPath();
            bgCtx.moveTo(a.x, a.y);
            bgCtx.lineTo(b.x, b.y);
            bgCtx.stroke();
          }
        }

        var twinkle = 0.24 + (Math.sin(a.phase) + 1) * 0.15;
        if (a.isStar) {
          drawSparkle(bgCtx, a.x, a.y, a.r + 2.1, a.phase * 0.2, palette[0], twinkle + 0.12);
        } else {
          bgCtx.fillStyle = "rgba(20, 20, 19, " + twinkle.toFixed(3) + ")";
          bgCtx.beginPath();
          bgCtx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }

      // Render smooth hover star particles on top canvas (zero DOM reflow)
      fxCtx.clearRect(0, 0, width, height);
      var drag = Math.pow(0.035, dt); // smooth exponential air resistance
      for (var k = stars.length - 1; k >= 0; k--) {
        var s = stars[k];
        s.age += dt;
        if (s.age >= s.ttl) {
          stars.splice(k, 1);
          continue;
        }

        var progress = s.age / s.ttl;
        s.vx *= drag;
        s.vy = s.vy * drag - 18 * dt; // gentle upward float
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.angle += s.spin * dt;

        // Smooth scale curve: quick cubic pop-in (0 -> 0.18), then smooth cosine ease-out
        var scale =
          progress < 0.18
            ? 1 - Math.pow(1 - progress / 0.18, 3)
            : Math.cos(((progress - 0.18) / 0.82) * (Math.PI / 2));
        var alpha = 1 - Math.pow(progress, 1.6);

        drawSparkle(fxCtx, s.x, s.y, s.size * scale, s.angle, s.color, alpha);
      }

      window.requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      function (e) {
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      },
      { passive: true }
    );
    window.addEventListener("pointerleave", function () {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    var interactiveBoxes = document.querySelectorAll(
      ".card, .panel, .award-compact, .proof-thumb, .uni-badge, .field-jump a, .button, .filters button"
    );

    interactiveBoxes.forEach(function (box) {
      var trailDist = 0;
      var lastX = null;
      var lastY = null;

      box.addEventListener("pointerenter", function (e) {
        var x = e.clientX;
        var y = e.clientY;
        if (!x && !y) {
          var rect = box.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
        lastX = x;
        lastY = y;
        trailDist = 0;
        spawnStarBurst(x, y, 5, 1.0, 0, 0);
      });

      box.addEventListener(
        "pointermove",
        function (e) {
          if (lastX === null || lastY === null) {
            lastX = e.clientX;
            lastY = e.clientY;
            return;
          }
          var dx = e.clientX - lastX;
          var dy = e.clientY - lastY;
          var stepDist = Math.sqrt(dx * dx + dy * dy);
          trailDist += stepDist;

          // Distance-based emission (every 26px of cursor travel) for silky ribbon trail
          if (trailDist >= 26) {
            trailDist = 0;
            spawnStarBurst(e.clientX, e.clientY, 1, 0.72, dx * 12, dy * 12);
          }

          lastX = e.clientX;
          lastY = e.clientY;
        },
        { passive: true }
      );

      box.addEventListener("pointerleave", function () {
        lastX = null;
        lastY = null;
        trailDist = 0;
      });
    });

    resize();
    window.requestAnimationFrame(frame);
  }

  // 4. Proof Thumbnail Click-to-Enlarge Lightbox Dialog
  var proofDialog = document.getElementById("proof-dialog");
  if (proofDialog) {
    var modalTag = proofDialog.querySelector("[data-proof-modal-tag]");
    var modalTitle = proofDialog.querySelector("[data-proof-modal-title]");
    var modalImg = proofDialog.querySelector("[data-proof-modal-img]");
    var modalPlaceholder = proofDialog.querySelector("[data-proof-modal-placeholder]");
    var modalSlotTitle = proofDialog.querySelector("[data-proof-modal-slot-title]");
    var modalPath = proofDialog.querySelector("[data-proof-modal-path]");
    var modalCaption = proofDialog.querySelector("[data-proof-modal-caption]");
    var closeBtn = proofDialog.querySelector("[data-proof-close]");
    var lastTrigger = null;

    document.querySelectorAll("[data-proof-open]").forEach(function (thumb) {
      var src = thumb.getAttribute("data-proof-src");
      var box = thumb.querySelector(".proof-thumb-box");
      if (src && box && !box.querySelector("img")) {
        var probe = new Image();
        probe.onload = function () {
          probe.alt = thumb.getAttribute("data-proof-title") || "";
          box.appendChild(probe);
        };
        probe.src = src;
      }

      thumb.addEventListener("click", function () {
        lastTrigger = thumb;
        var tag = thumb.getAttribute("data-proof-tag") || "Proof";
        var title = thumb.getAttribute("data-proof-title") || "Competition proof";
        var caption = thumb.getAttribute("data-proof-caption") || "";

        if (modalTag) modalTag.textContent = tag;
        if (modalTitle) modalTitle.textContent = title;
        if (modalSlotTitle) modalSlotTitle.textContent = title;
        if (modalPath) modalPath.textContent = src || "";
        if (modalCaption) modalCaption.textContent = caption;

        if (modalImg && modalPlaceholder) {
          modalImg.hidden = true;
          modalPlaceholder.hidden = false;
          if (src) {
            var testImg = new Image();
            testImg.onload = function () {
              modalImg.src = src;
              modalImg.alt = title;
              modalImg.hidden = false;
              modalPlaceholder.hidden = true;
            };
            testImg.src = src;
          }
        }

        if (typeof proofDialog.showModal === "function") {
          proofDialog.showModal();
        } else {
          proofDialog.setAttribute("open", "");
        }
      });
    });

    function closeProofDialog() {
      if (typeof proofDialog.close === "function") {
        proofDialog.close();
      } else {
        proofDialog.removeAttribute("open");
      }
      if (lastTrigger) {
        lastTrigger.focus();
      }
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeProofDialog);
    }

    proofDialog.addEventListener("click", function (event) {
      if (event.target === proofDialog) {
        closeProofDialog();
      }
    });
  }

  // 4b. Scrollable Honors & Awards Archive Popup Dialog
  var awardsDialog = document.getElementById("awards-dialog");
  var awardsOpenBtn = document.querySelector("[data-awards-modal-open]");
  if (awardsDialog && awardsOpenBtn) {
    var awardsCloseBtn = awardsDialog.querySelector("[data-awards-modal-close]");

    awardsOpenBtn.addEventListener("click", function () {
      if (typeof awardsDialog.showModal === "function") {
        awardsDialog.showModal();
      } else {
        awardsDialog.setAttribute("open", "");
      }
    });

    function closeAwardsDialog() {
      if (typeof awardsDialog.close === "function") {
        awardsDialog.close();
      } else {
        awardsDialog.removeAttribute("open");
      }
      awardsOpenBtn.focus();
    }

    if (awardsCloseBtn) {
      awardsCloseBtn.addEventListener("click", closeAwardsDialog);
    }

    awardsDialog.addEventListener("click", function (event) {
      if (event.target === awardsDialog) {
        closeAwardsDialog();
      }
    });
  }

  // 5. Project tag filtering
  var filterRoot = document.querySelector("[data-project-filter]");
  if (!filterRoot) return;

  var buttons = filterRoot.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll(".card[data-tags]");
  var blocks = document.querySelectorAll(".field-block");
  var emptyState = document.querySelector("[data-filter-empty]");
  var clearBtn = document.querySelector("[data-clear-filters]");
  var validFilters = ["all", "software", "ai", "robot", "award"];

  function applyFilter(filter, syncUrl) {
    var activeFilter = validFilters.indexOf(filter) !== -1 ? filter : "all";
    var shown = 0;

    cards.forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var match = activeFilter === "all" || tags.indexOf(activeFilter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });

    blocks.forEach(function (block) {
      var visible = block.querySelectorAll(".card:not(.is-hidden)").length;
      block.classList.toggle("is-empty", visible === 0);
    });

    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === activeFilter));
    });

    if (emptyState) {
      emptyState.hidden = shown > 0;
    }

    if (syncUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (activeFilter === "all") {
        url.searchParams.delete("tag");
      } else {
        url.searchParams.set("tag", activeFilter);
      }
      window.history.replaceState(null, "", url.toString());
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-filter"), true);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      applyFilter("all", true);
    });
  }

  var initialFilter = "all";
  try {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get("tag");
    if (fromUrl && validFilters.indexOf(fromUrl) !== -1) {
      initialFilter = fromUrl;
    }
  } catch (e) {
    initialFilter = "all";
  }

  applyFilter(initialFilter, false);
})();
