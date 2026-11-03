/*
 * Shared playable-ad shell: store redirect for each ad network, ad lifecycle, canvas sizing,
 * image loading and the end card. Each game calls Playable.start(game).
 */
(function () {
  var isIOS =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function storeUrl() {
    return isIOS && window.STORE.ios ? window.STORE.ios : window.STORE.android;
  }

  function openStore() {
    try {
      if (window.NETWORK === "google" && window.ExitApi) return window.ExitApi.exit();
      if (window.NETWORK === "meta" && window.FbPlayableAd) return window.FbPlayableAd.onCTAClick();
      if (window.dapi && window.dapi.openStoreUrl) return window.dapi.openStoreUrl();
      if (window.install) return window.install(); // Mintegral
      if (window.mraid && window.mraid.open) return window.mraid.open(storeUrl());
    } catch (e) {
      /* fall through to a plain link */
    }
    window.open(storeUrl(), "_blank");
  }

  // Signal "game finished" where networks ask for it.
  function gameEnded() {
    try {
      if (window.mintGameEnd) window.mintGameEnd();
      if (window.gameEnd) window.gameEnd();
    } catch (e) {}
  }

  // ---- Canvas ------------------------------------------------------------
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var view = { w: 0, h: 0, dpr: 1 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (window.mraid && window.mraid.getMaxSize) {
      try {
        var s = window.mraid.getMaxSize();
        if (s && s.width && s.height) {
          w = s.width;
          h = s.height;
        }
      } catch (e) {}
    }
    view.w = w;
    view.h = h;
    view.dpr = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- Images ------------------------------------------------------------
  function loadImages(map, done) {
    var keys = Object.keys(map);
    var images = {};
    var left = keys.length;
    keys.forEach(function (key) {
      var img = new Image();
      img.onload = img.onerror = function () {
        if (--left === 0) done(images);
      };
      img.src = map[key];
      images[key] = img;
    });
    if (!keys.length) done(images);
  }

  // ---- End card ----------------------------------------------------------
  // The card pauses the game; "Keep playing" closes it and play carries on where it was.
  var end = document.getElementById("end");
  var endOpen = false;
  function showEnd(title, text) {
    document.getElementById("endTitle").textContent = title;
    document.getElementById("endText").textContent = text;
    end.classList.add("show");
    endOpen = true;
    gameEnded();
  }
  function hideEnd() {
    end.classList.remove("show");
    endOpen = false;
  }

  document.getElementById("mini").addEventListener("click", openStore);
  document.getElementById("endCta").addEventListener("click", openStore);
  document.getElementById("endLogo").src = window.ASSETS.logo;
  end.addEventListener("click", function (e) {
    if (e.target === end || e.target.tagName === "IMG") openStore();
  });

  // ---- Lifecycle ---------------------------------------------------------
  var hidden = false;
  var started = false;
  function isPaused() {
    return hidden || endOpen;
  }

  function start(game) {
    loadImages(window.ASSETS, function (images) {
      resize();
      game.init({ ctx: ctx, view: view, images: images, showEnd: showEnd, openStore: openStore });

      document.getElementById("again").addEventListener("click", hideEnd);

      function point(e) {
        var r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      canvas.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        game.down && game.down(point(e));
      });
      canvas.addEventListener("pointermove", function (e) {
        game.move && game.move(point(e));
      });
      canvas.addEventListener("pointerup", function (e) {
        game.up && game.up(point(e));
      });
      canvas.addEventListener("pointercancel", function (e) {
        game.up && game.up(point(e));
      });

      window.addEventListener("resize", function () {
        resize();
        game.layout && game.layout();
      });

      // Test hook: advance the simulation without waiting for real frames.
      window.__playable = {
        step: function (seconds) {
          for (var t = 0; t < seconds; t += 1 / 60) game.update(1 / 60);
          ctx.clearRect(0, 0, view.w, view.h);
          game.draw();
        },
        state: function () {
          return game.state && game.state();
        },
        tap: function (x, y) {
          game.down && game.down({ x: x, y: y });
          game.up && game.up({ x: x, y: y });
        },
        drag: function (x0, y0, x1, y1) {
          game.down && game.down({ x: x0, y: y0 });
          game.move && game.move({ x: x1, y: y1 });
          game.up && game.up({ x: x1, y: y1 });
        },
      };

      var last = performance.now();
      function frame(now) {
        var dt = Math.min((now - last) / 1000, 1 / 20);
        last = now;
        if (!isPaused()) game.update(dt);
        ctx.clearRect(0, 0, view.w, view.h);
        game.draw();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  function boot(game) {
    if (started) return;
    started = true;
    start(game);
  }

  window.Playable = {
    start: function (game) {
      var mraid = window.mraid;
      if (mraid && mraid.getState) {
        var whenViewable = function () {
          mraid.addEventListener("viewableChange", function (v) {
            if (v) boot(game);
            hidden = !v;
          });
          if (!mraid.isViewable || mraid.isViewable()) boot(game);
        };
        if (mraid.getState() === "loading") mraid.addEventListener("ready", whenViewable);
        else whenViewable();
      } else if (window.dapi && window.dapi.isReady) {
        var go = function () {
          window.dapi.removeEventListener && window.dapi.removeEventListener("ready", go);
          boot(game);
          window.dapi.addEventListener("viewableChange", function (e) {
            hidden = !(e && e.isViewable);
          });
        };
        if (window.dapi.isReady()) go();
        else window.dapi.addEventListener("ready", go);
      } else {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { boot(game); });
        else boot(game);
      }
      document.addEventListener("visibilitychange", function () {
        hidden = document.hidden;
      });
    },
    openStore: openStore,
  };
})();
