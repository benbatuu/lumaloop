/*
 * Parcel Loop playable: parcels ride a round belt clockwise. Tap a station to arm its
 * diverter; the next parcel to pass that junction drops into the station.
 * Play never ends: each level needs a few more sorts and speeds the belt up, and a wrong sort only
 * breaks the combo. After 75 seconds one end card offers the store or "Keep playing".
 */
(function () {
  var TAU = Math.PI * 2;
  var END_CARD_AFTER = 75; // seconds of play before the single end card
  var SPAWN_ANGLE = -Math.PI / 2; // top of the ring

  var COLORS = [
    { key: "coral", fill: "#F06455", dark: "#B9443A" },
    { key: "honey", fill: "#FDD30D", dark: "#C98A02" },
    { key: "mint", fill: "#21C29E", dark: "#138A70" },
  ];
  // Stations sit inside the ring; junction angles in radians (0 = right, clockwise).
  var STATION_ANGLES = [0.35, 1.95, 3.55];
  // A gentle scripted opening, then random parcels.
  var OPENING = [1, 0, 2, 1, 2, 0];

  var g; // shell: ctx, view, images, showEnd, openStore
  var s; // round state
  var L = {}; // layout

  function reset() {
    s = {
      time: 0,
      parcels: [],
      spawnTimer: 0.4,
      spawned: 0,
      sorted: 0,
      mistakes: 0,
      combo: 0,
      armed: [false, false, false],
      pulses: [0, 0, 0],
      particles: [],
      floaters: [],
      shake: 0,
      beltOffset: 0,
      idle: 0,
      level: 1,
      levelSorted: 0,
      banner: null,
      endCardShown: false,
    };
  }

  function layout() {
    var w = g.view.w;
    var h = g.view.h;
    var portrait = h >= w;
    L.landscape = w > h * 1.25;
    if (L.landscape) {
      // Ring centered, HUD in the left column.
      L.R = (h - 24) * 0.36;
      L.cx = w / 2;
      L.cy = h / 2;
      L.belt = L.R * 0.3;
      L.parcel = L.belt * 0.95;
      L.stationR = L.R * 0.5;
      L.stationSize = L.R * 0.36;
      L.side = w / 2 - L.R * 1.3;
      return;
    }
    L.top = portrait ? Math.min(h * 0.2, 150) : Math.min(h * 0.18, 110);
    var avail = Math.min(w * 0.92, h - L.top - (portrait ? 110 : 60));
    L.R = avail * 0.4;
    L.cx = w / 2;
    L.cy = L.top + (h - L.top - (portrait ? 70 : 20)) / 2;
    L.belt = L.R * 0.3;
    L.parcel = L.belt * 0.95;
    L.stationR = L.R * 0.5;
    L.stationSize = L.R * 0.36;
  }

  function stationPos(i) {
    var a = STATION_ANGLES[i];
    return { x: L.cx + Math.cos(a) * L.stationR, y: L.cy + Math.sin(a) * L.stationR };
  }

  function ringPos(a) {
    return { x: L.cx + Math.cos(a) * L.R, y: L.cy + Math.sin(a) * L.R };
  }

  function norm(a) {
    a %= TAU;
    return a < 0 ? a + TAU : a;
  }

  // ---- Simulation ---------------------------------------------------------
  function levelGoal() {
    return 5 + s.level * 3;
  }

  function lapSeconds() {
    return Math.max(5.2, 9 - (s.level - 1) * 0.75);
  }

  function spawnInterval() {
    if (s.spawned < 4) return 1.7;
    return Math.max(0.7, 1.3 - (s.level - 1) * 0.12);
  }

  function spawn() {
    if (s.parcels.length >= 8) return;
    for (var i = 0; i < s.parcels.length; i++) {
      var p = s.parcels[i];
      if (p.state === "belt" && norm(p.a - SPAWN_ANGLE) < 0.55) return; // keep spacing
    }
    var color = s.spawned < OPENING.length ? OPENING[s.spawned] : Math.floor(Math.random() * 3);
    s.parcels.push({ a: SPAWN_ANGLE, color: color, state: "belt", t: 0, scale: 0 });
    s.spawned++;
  }

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      var dir = Math.random() * TAU;
      var sp = 80 + Math.random() * 180;
      s.particles.push({
        x: x,
        y: y,
        vx: Math.cos(dir) * sp,
        vy: Math.sin(dir) * sp - 60,
        life: 0.6 + Math.random() * 0.4,
        t: 0,
        color: color,
        size: 4 + Math.random() * 6,
      });
    }
  }

  function floatText(x, y, text, color) {
    s.floaters.push({ x: x, y: y, text: text, color: color, t: 0 });
  }

  function land(p) {
    var st = stationPos(p.station);
    if (p.color === p.station) {
      s.sorted++;
      s.levelSorted++;
      s.combo++;
      s.pulses[p.station] = 1;
      burst(st.x, st.y, COLORS[p.color].fill, 18);
      burst(st.x, st.y, "#FFF6E8", 6);
      var words = ["Nice!", "Great!", "Perfect!", "Combo x" + s.combo + "!"];
      floatText(st.x, st.y - L.stationSize * 0.7, s.combo >= 3 ? words[3] : words[Math.min(s.combo, 3) - 1], "#FDD30D");
      if (s.levelSorted >= levelGoal()) {
        s.level++;
        s.levelSorted = 0;
        s.banner = { text: "Level " + s.level, sub: "The belt speeds up!", t: 0 };
        burst(L.cx, L.cy, "#FDD30D", 30);
      }
    } else {
      s.mistakes++;
      s.combo = 0;
      s.shake = 0.35;
      floatText(st.x, st.y - L.stationSize * 0.7, "Wrong station!", "#F06455");
    }
  }

  function update(dt) {
    s.time += dt;
    s.idle += dt;
    s.beltOffset += dt;
    s.shake = Math.max(0, s.shake - dt);
    for (var k = 0; k < 3; k++) s.pulses[k] = Math.max(0, s.pulses[k] - dt * 2.5);

    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      spawn();
      s.spawnTimer = spawnInterval();
    }
    if (s.banner) {
      s.banner.t += dt;
      if (s.banner.t > 1.8) s.banner = null;
    }

    var omega = TAU / lapSeconds();
    var step = omega * dt;
    for (var i = s.parcels.length - 1; i >= 0; i--) {
      var p = s.parcels[i];
      p.scale = Math.min(1, p.scale + dt * 5);
      if (p.state === "belt") {
        var prev = p.a;
        p.a = prev + step;
        for (var j = 0; j < 3; j++) {
          if (s.armed[j] && norm(STATION_ANGLES[j] - prev) <= step) {
            s.armed[j] = false;
            p.state = "drop";
            p.station = j;
            p.from = ringPos(STATION_ANGLES[j]);
            p.t = 0;
            break;
          }
        }
      } else if (p.state === "drop") {
        p.t += dt / 0.32;
        if (p.t >= 1) {
          land(p);
          s.parcels.splice(i, 1);
        }
      }
    }

    for (var m = s.particles.length - 1; m >= 0; m--) {
      var q = s.particles[m];
      q.t += dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 420 * dt;
      if (q.t > q.life) s.particles.splice(m, 1);
    }
    for (var f = s.floaters.length - 1; f >= 0; f--) {
      s.floaters[f].t += dt;
      if (s.floaters[f].t > 1.1) s.floaters.splice(f, 1);
    }

    if (!s.endCardShown && s.time >= END_CARD_AFTER) {
      s.endCardShown = true;
      g.showEnd(
        "You're on a roll!",
        "Level " + s.level + " with " + s.sorted + " parcels sorted. Hundreds of levels are waiting in the full game.",
      );
    }
  }

  // ---- Hint ---------------------------------------------------------------
  // The station whose matching parcel will reach its junction soonest.
  function hintStation() {
    var best = null;
    for (var j = 0; j < 3; j++) {
      if (s.armed[j]) continue;
      var nearest = null;
      var nd = Infinity;
      for (var i = 0; i < s.parcels.length; i++) {
        var p = s.parcels[i];
        if (p.state !== "belt") continue;
        var d = norm(STATION_ANGLES[j] - p.a);
        if (d < nd) {
          nd = d;
          nearest = p;
        }
      }
      if (nearest && nearest.color === j && nd > 0.12 && nd < 1.1 && (!best || nd < best.d)) best = { i: j, d: nd };
    }
    return best ? best.i : -1;
  }

  // ---- Input --------------------------------------------------------------
  function down(pt) {
    s.idle = 0;
    var hit = -1;
    var hitD = Infinity;
    for (var j = 0; j < 3; j++) {
      var st = stationPos(j);
      var junction = ringPos(STATION_ANGLES[j]);
      var d = Math.min(Math.hypot(pt.x - st.x, pt.y - st.y), Math.hypot(pt.x - junction.x, pt.y - junction.y));
      if (d < hitD) {
        hitD = d;
        hit = j;
      }
    }
    if (hit >= 0 && hitD < L.stationSize * 1.1) {
      s.armed[hit] = !s.armed[hit];
      s.pulses[hit] = 0.6;
    }
  }

  // ---- Drawing ------------------------------------------------------------
  // Shifts a parcel image toward a color while keeping its shading and transparency.
  function tint(img, color, amount) {
    if (!img || !img.width) return img;
    var c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    var x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "source-atop";
    x.globalAlpha = amount;
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground(ctx) {
    var w = g.view.w;
    var h = g.view.h;
    var grad = ctx.createRadialGradient(L.cx, L.cy, L.R * 0.2, L.cx, L.cy, Math.max(w, h) * 0.8);
    grad.addColorStop(0, "#FFE96B");
    grad.addColorStop(0.45, "#FDB80A");
    grad.addColorStop(1, "#FB8A03");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Soft sunburst
    ctx.save();
    ctx.translate(L.cx, L.cy);
    ctx.rotate(s.time * 0.05);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (var i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(w, h), (i * TAU) / 12, (i * TAU) / 12 + TAU / 24);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBelt(ctx) {
    var R = L.R;
    var b = L.belt;
    // base shadow
    ctx.beginPath();
    ctx.ellipse(L.cx, L.cy + b * 0.55, R + b * 0.75, R + b * 0.6, 0, 0, TAU);
    ctx.fillStyle = "rgba(120, 50, 0, 0.25)";
    ctx.fill();

    // hazard rim
    ctx.lineWidth = b * 1.45;
    ctx.strokeStyle = "#031241";
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, R, 0, TAU);
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([b * 0.35, b * 0.35]);
    ctx.lineDashOffset = -s.beltOffset * b * 1.2;
    ctx.lineWidth = b * 1.3;
    ctx.strokeStyle = "#FDD30D";
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, R, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // steel rails
    ctx.lineWidth = b * 1.12;
    ctx.strokeStyle = "#AEB8CC";
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, R, 0, TAU);
    ctx.stroke();

    // belt surface
    ctx.lineWidth = b * 0.92;
    ctx.strokeStyle = "#2B3550";
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, R, 0, TAU);
    ctx.stroke();

    // moving slats
    var slats = 36;
    var shift = ((s.beltOffset / lapSeconds()) * TAU) % (TAU / slats);
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 2;
    for (var i = 0; i < slats; i++) {
      var a = (i * TAU) / slats + shift;
      ctx.beginPath();
      ctx.moveTo(L.cx + Math.cos(a) * (R - b * 0.44), L.cy + Math.sin(a) * (R - b * 0.44));
      ctx.lineTo(L.cx + Math.cos(a) * (R + b * 0.44), L.cy + Math.sin(a) * (R + b * 0.44));
      ctx.stroke();
    }

    // inner plate
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, R - b * 0.6, 0, TAU);
    ctx.fillStyle = "#1A2747";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.stroke();
  }

  function drawStation(ctx, j, hint) {
    var st = stationPos(j);
    var c = COLORS[j];
    var size = L.stationSize * (1 + s.pulses[j] * 0.12);
    var a = STATION_ANGLES[j];
    var junction = ringPos(a);

    // chute from junction to station
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = L.belt * 0.55;
    ctx.strokeStyle = s.armed[j] ? "rgba(253, 211, 13, 0.85)" : "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(junction.x, junction.y);
    ctx.lineTo(st.x, st.y);
    ctx.stroke();
    ctx.restore();

    // diverter gate on the belt
    ctx.save();
    ctx.translate(junction.x, junction.y);
    ctx.rotate(a + (s.armed[j] ? Math.PI / 2 - 0.5 : Math.PI / 2));
    roundRect(ctx, -L.belt * 0.5, -L.belt * 0.11, L.belt, L.belt * 0.22, L.belt * 0.11);
    ctx.fillStyle = s.armed[j] ? "#FDD30D" : "#8199C0";
    ctx.fill();
    ctx.restore();

    // station body
    ctx.save();
    ctx.translate(st.x, st.y);
    if (s.armed[j]) {
      ctx.shadowColor = "rgba(253, 211, 13, 0.95)";
      ctx.shadowBlur = 24;
    }
    roundRect(ctx, -size / 2, -size / 2 + size * 0.08, size, size, size * 0.26);
    ctx.fillStyle = c.dark;
    ctx.fill();
    ctx.shadowBlur = 0;
    roundRect(ctx, -size / 2, -size / 2, size, size, size * 0.26);
    ctx.fillStyle = c.fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = s.armed[j] ? "#FFF6E8" : "rgba(3,18,65,0.35)";
    ctx.stroke();
    var img = g.images[c.key];
    if (img) {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, -size * 0.36, -size * 0.38, size * 0.72, size * 0.72);
      ctx.globalAlpha = 1;
    }
    if (hint) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.5 * Math.sin(s.time * 8)) + ")";
      roundRect(ctx, -size / 2 - 7, -size / 2 - 7, size + 14, size + 14, size * 0.3);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParcel(ctx, p) {
    var pos;
    var size = L.parcel * p.scale;
    if (p.state === "drop") {
      var st = stationPos(p.station);
      var t = p.t * p.t;
      pos = { x: p.from.x + (st.x - p.from.x) * t, y: p.from.y + (st.y - p.from.y) * t };
      size *= 1 - p.t * 0.35;
    } else {
      pos = ringPos(p.a);
    }
    var img = g.images[COLORS[p.color].key];
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    if (img) ctx.drawImage(img, pos.x - size * 0.62, pos.y - size * 0.7, size * 1.24, size * 1.24);
    ctx.restore();
  }

  function drawHand(ctx, x, y) {
    var t = (s.time * 1.6) % 1;
    var press = t < 0.5 ? t * 2 : 2 - t * 2;
    ctx.save();
    ctx.translate(x + 10, y + 16 + press * 10);
    ctx.rotate(-0.35);
    ctx.fillStyle = "#FFF6E8";
    ctx.strokeStyle = "#031241";
    ctx.lineWidth = 3;
    var k = Math.max(0.7, L.R / 160);
    ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-6, -26);
    ctx.quadraticCurveTo(0, -34, 6, -26);
    ctx.lineTo(6, -6);
    ctx.lineTo(20, -4);
    ctx.quadraticCurveTo(28, 0, 26, 14);
    ctx.lineTo(22, 34);
    ctx.lineTo(-8, 34);
    ctx.lineTo(-18, 10);
    ctx.quadraticCurveTo(-18, 2, -10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // tap ripple
    ctx.beginPath();
    ctx.arc(x, y, 10 + t * 30, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255," + (1 - t) + ")";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Where the logo, progress pill and first-run tip go.
  function hudBox() {
    var w = g.view.w;
    if (L.landscape) {
      var colW = Math.max(120, L.side - 24);
      return { cx: L.side / 2, logoY: g.view.h * 0.16, logoW: colW, logoH: g.view.h * 0.32, pillY: g.view.h * 0.54, pillW: colW, tipY: g.view.h * 0.72 };
    }
    return { cx: w / 2, logoY: L.top * 0.08, logoW: w * 0.7, logoH: L.top * 0.62, pillY: L.top * 0.74, pillW: Math.min(260, w * 0.62), tipY: L.cy + L.R + L.belt * 1.6 };
  }

  function drawHud(ctx) {
    var w = g.view.w;
    var box = hudBox();
    var logo = g.images.logo;
    if (logo && logo.width) {
      var lh = box.logoH;
      var lw = (lh * logo.width) / logo.height;
      if (lw > box.logoW) {
        lw = box.logoW;
        lh = (lw * logo.height) / logo.width;
      }
      ctx.drawImage(logo, box.cx - lw / 2, box.logoY, lw, lh);
    }
    // progress pill
    var pw = box.pillW;
    var ph = 30;
    var px = box.cx - pw / 2;
    var py = box.pillY;
    roundRect(ctx, px, py, pw, ph, ph / 2);
    ctx.fillStyle = "rgba(3,18,65,0.8)";
    ctx.fill();
    var fill = Math.min(1, s.levelSorted / levelGoal());
    if (fill > 0) {
      roundRect(ctx, px + 4, py + 4, Math.max(ph - 8, (pw - 8) * fill), ph - 8, (ph - 8) / 2);
      ctx.fillStyle = "#21C29E";
      ctx.fill();
    }
    ctx.fillStyle = "#FFF6E8";
    ctx.font = "800 15px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Level " + s.level + "     " + s.levelSorted + " / " + levelGoal(), box.cx, py + ph / 2 + 1);
  }

  function drawFx(ctx) {
    s.particles.forEach(function (q) {
      ctx.globalAlpha = Math.max(0, 1 - q.t / q.life);
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
    });
    ctx.globalAlpha = 1;
    s.floaters.forEach(function (f) {
      var a = Math.max(0, 1 - f.t / 1.1);
      ctx.globalAlpha = a;
      ctx.font = "900 " + Math.round(L.R * 0.16) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#031241";
      ctx.strokeText(f.text, f.x, f.y - f.t * 40);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - f.t * 40);
    });
    ctx.globalAlpha = 1;
  }

  function drawBanner(ctx) {
    var t = s.banner.t;
    var a = t < 0.2 ? t / 0.2 : t > 1.4 ? Math.max(0, (1.8 - t) / 0.4) : 1;
    var pop = Math.min(1, t / 0.25);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(L.cx, L.cy);
    ctx.scale(0.7 + 0.3 * pop, 0.7 + 0.3 * pop);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#031241";
    ctx.font = "900 " + Math.round(L.R * 0.3) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.strokeText(s.banner.text, 0, -L.R * 0.08);
    ctx.fillStyle = "#FDD30D";
    ctx.fillText(s.banner.text, 0, -L.R * 0.08);
    ctx.font = "800 " + Math.round(L.R * 0.12) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.lineWidth = 5;
    ctx.strokeText(s.banner.sub, 0, L.R * 0.17);
    ctx.fillStyle = "#FFF6E8";
    ctx.fillText(s.banner.sub, 0, L.R * 0.17);
    ctx.restore();
  }

  function draw() {
    var ctx = g.ctx;
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * s.shake, (Math.random() - 0.5) * 12 * s.shake);
    drawBackground(ctx);
    drawHud(ctx);
    drawBelt(ctx);

    var hint = s.sorted < 3 || s.idle > 3 ? hintStation() : -1;
    for (var j = 0; j < 3; j++) drawStation(ctx, j, j === hint);
    s.parcels.forEach(function (p) {
      if (p.state === "belt") drawParcel(ctx, p);
    });
    s.parcels.forEach(function (p) {
      if (p.state === "drop") drawParcel(ctx, p);
    });
    drawFx(ctx);
    if (hint >= 0) {
      var st = stationPos(hint);
      drawHand(ctx, st.x, st.y);
    }
    if (s.banner) drawBanner(ctx);
    if (s.time < 3.2 && s.sorted === 0) {
      ctx.font = "800 " + Math.round(Math.max(16, L.R * 0.11)) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#031241";
      var box = hudBox();
      var lines = L.landscape ? ["Tap a station", "to catch its color!"] : ["Tap a station to catch its color!"];
      if (L.landscape) ctx.font = "800 15px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillStyle = "#FFF6E8";
      lines.forEach(function (line, i) {
        ctx.strokeText(line, box.cx, box.tipY + i * 20);
        ctx.fillText(line, box.cx, box.tipY + i * 20);
      });
    }
    ctx.restore();
  }

  var game = {
    init: function (shell) {
      g = shell;
      g.images.coral = g.images.parcelCoral;
      g.images.honey = tint(g.images.parcelHoney, "#FDD30D", 0.55);
      g.images.mint = g.images.parcelMint;
      reset();
      layout();
    },
    reset: reset,
    layout: layout,
    update: update,
    draw: draw,
    down: down,
    state: function () {
      return {
        time: s.time,
        sorted: s.sorted,
        mistakes: s.mistakes,
        level: s.level,
        endCardShown: s.endCardShown,
        armed: s.armed.slice(),
        hint: hintStation(),
        stations: [0, 1, 2].map(stationPos),
        parcels: s.parcels.map(function (p) {
          return { color: p.color, state: p.state, a: norm(p.a) };
        }),
      };
    },
  };

  window.Playable.start(game);
})();
