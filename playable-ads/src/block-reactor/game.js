/*
 * Block Reactor playable: drag pieces onto an 8x8 board and clear full rows and columns.
 * The board is staged so the first piece clears a row and the second clears a row and a
 * column together. After that the tray refills endlessly with pieces that fit, and a
 * stuck board is refreshed instead of ending the game. After 75 seconds one end card
 * offers the store or "Keep playing".
 */
(function () {
  var N = 8;
  var END_CARD_AFTER = 75; // seconds of play before the single end card

  // Block colors from the game's palette (lib/core/theme/app_colors.dart), slightly deepened.
  var COLORS = [
    { fill: "#FF8A78", dark: "#D9604F" }, // coral
    { fill: "#FFB45E", dark: "#D98A33" }, // apricot
    { fill: "#FFD45A", dark: "#D9A92A" }, // butter
    { fill: "#7FD99A", dark: "#4FAE6C" }, // mint
    { fill: "#6EC3F2", dark: "#3F96C7" }, // sky
    { fill: "#B391F2", dark: "#8466C7" }, // lavender
  ];
  var LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  var START_BOARD = [
    ".......C",
    ".....A.C",
    "..BB...C",
    ".EBB..DC",
    "EE...ADC",
    "EA..AADC",
    "CB...DAC",
    "ADEBC...",
  ];

  var PIECES = {
    I3: [[0, 0], [0, 1], [0, 2]],
    J: [[0, 2], [1, 0], [1, 1], [1, 2]],
    O: [[0, 0], [0, 1], [1, 0], [1, 1]],
    I2: [[0, 0], [0, 1]],
    I2v: [[0, 0], [1, 0]],
    I3v: [[0, 0], [1, 0], [2, 0]],
    I4: [[0, 0], [0, 1], [0, 2], [0, 3]],
    L: [[0, 0], [1, 0], [2, 0], [2, 1]],
    T: [[0, 0], [0, 1], [0, 2], [1, 1]],
    V: [[0, 0], [1, 0], [1, 1]],
    S: [[0, 1], [0, 2], [1, 0], [1, 1]],
    DOT: [[0, 0]],
  };
  // Shapes drawn for refills; the first tray is scripted.
  var REFILL = ["I3", "I3v", "I2", "I2v", "O", "L", "T", "V", "J", "S", "I4", "DOT"];
  // Tray order, colors and the hint target (row, col) for each piece.
  var TRAY = [
    { shape: "I3", color: 4, target: [6, 2] },
    { shape: "J", color: 0, target: [6, 5] },
    { shape: "O", color: 3, target: [0, 0] },
  ];

  var g;
  var s;
  var L = {};

  function reset() {
    var board = START_BOARD.map(function (row) {
      return row.split("").map(function (ch) {
        return ch === "." ? -1 : LETTER[ch];
      });
    });
    s = {
      time: 0,
      board: board,
      tray: TRAY.map(function (t) {
        return { cells: PIECES[t.shape], color: t.color, target: t.target, used: false };
      }),
      drag: null,
      score: 0,
      placed: 0,
      clearing: [], // {r, c, color, t}
      particles: [],
      floaters: [],
      idle: 0,
      shake: 0,
      endCardShown: false,
    };
  }

  function layout() {
    var w = g.view.w;
    var h = g.view.h;
    L.landscape = w > h * 1.25;
    if (L.landscape) {
      // HUD on the left, board in the middle, tray stacked on the right.
      var bs = Math.min(h - 32, w * 0.5);
      L.cell = Math.floor(bs / N);
      L.board = L.cell * N;
      L.bx = Math.round((w - L.board) / 2);
      L.by = Math.round((h - L.board) / 2);
      L.side = L.bx;
      L.trayX = L.bx + L.board + L.side / 2;
      L.trayCell = Math.min(L.cell * 0.55, L.side / 5);
      L.slotW = L.side * 0.85;
      L.slotH = h / 3;
      return;
    }
    var portrait = h >= w * 1.1;
    L.top = portrait ? Math.min(h * 0.2, 170) : Math.min(h * 0.16, 100);
    var trayH = portrait ? Math.min(h * 0.2, 170) : Math.min(h * 0.22, 130);
    var size = Math.min(w * 0.9, h - L.top - trayH - 20);
    L.cell = Math.floor(size / N);
    L.board = L.cell * N;
    L.bx = Math.round((w - L.board) / 2);
    L.by = Math.round(L.top + 6);
    L.trayY = L.by + L.board + trayH / 2 + 4;
    L.trayCell = L.cell * 0.55;
    L.slotW = Math.min(w / 3, L.board / 3 + 20);
    L.slotH = L.cell * 3.6;
  }

  function pieceSize(cells) {
    var rows = 0;
    var cols = 0;
    cells.forEach(function (c) {
      rows = Math.max(rows, c[0] + 1);
      cols = Math.max(cols, c[1] + 1);
    });
    return { rows: rows, cols: cols };
  }

  function slotCenter(i) {
    if (L.landscape) return { x: L.trayX, y: g.view.h / 2 + (i - 1) * L.slotH };
    return { x: g.view.w / 2 + (i - 1) * L.slotW, y: L.trayY };
  }

  function fits(cells, r0, c0) {
    for (var i = 0; i < cells.length; i++) {
      var r = r0 + cells[i][0];
      var c = c0 + cells[i][1];
      if (r < 0 || c < 0 || r >= N || c >= N || s.board[r][c] !== -1) return false;
    }
    return true;
  }

  function anyFit(cells) {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (fits(cells, r, c)) return true;
    return false;
  }

  /** Rows and columns that would be full if cells were placed at r0, c0. */
  function linesAfter(cells, r0, c0) {
    var filled = function (r, c) {
      if (s.board[r][c] !== -1) return true;
      for (var i = 0; i < cells.length; i++) if (r0 + cells[i][0] === r && c0 + cells[i][1] === c) return true;
      return false;
    };
    var rows = [];
    var cols = [];
    for (var r = 0; r < N; r++) {
      var full = true;
      for (var c = 0; c < N && full; c++) full = filled(r, c);
      if (full) rows.push(r);
    }
    for (var c2 = 0; c2 < N; c2++) {
      var fullC = true;
      for (var r2 = 0; r2 < N && fullC; r2++) fullC = filled(r2, c2);
      if (fullC) cols.push(c2);
    }
    return { rows: rows, cols: cols };
  }

  /** Best spot for a piece: most lines cleared, then most filled neighbors. */
  function bestMove(cells) {
    var best = null;
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        if (!fits(cells, r, c)) continue;
        var lines = linesAfter(cells, r, c);
        var near = 0;
        cells.forEach(function (pc) {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var rr = r + pc[0] + d[0];
            var cc = c + pc[1] + d[1];
            if (rr < 0 || cc < 0 || rr >= N || cc >= N || s.board[rr][cc] !== -1) near++;
          });
        });
        var score = (lines.rows.length + lines.cols.length) * 100 + near;
        if (!best || score > best.score) best = { r: r, c: c, score: score };
      }
    }
    return best;
  }

  function refill() {
    s.tray = [0, 1, 2].map(function () {
      var shape;
      for (var tries = 0; tries < 12; tries++) {
        shape = REFILL[Math.floor(Math.random() * REFILL.length)];
        if (anyFit(PIECES[shape])) break;
      }
      return { cells: PIECES[shape], color: Math.floor(Math.random() * COLORS.length), target: null, used: false };
    });
  }

  // Clears the fullest rows so a stuck board can keep going.
  function rescue() {
    var rows = s.board
      .map(function (row, r) {
        return { r: r, n: row.filter(function (v) { return v !== -1; }).length };
      })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 4);
    rows.forEach(function (row, idx) {
      for (var c = 0; c < N; c++) {
        var v = s.board[row.r][c];
        if (v === -1) continue;
        s.board[row.r][c] = -1;
        s.clearing.push({ r: row.r, c: c, color: v, t: -idx * 0.05 - c * 0.012 });
      }
    });
    s.shake = 0.3;
    floatText(L.bx + L.board / 2, L.by + L.board / 2, "Board refreshed!", "#FFFFFF");
  }

  // Board cell under the dragged piece's top-left block.
  function dropCell(drag) {
    var x = drag.x - drag.offX;
    var y = drag.y - drag.offY;
    return { r: Math.round((y - L.by) / L.cell), c: Math.round((x - L.bx) / L.cell) };
  }

  // ---- Input --------------------------------------------------------------
  function down(pt) {
    s.idle = 0;
    for (var i = 0; i < s.tray.length; i++) {
      var p = s.tray[i];
      if (p.used) continue;
      var c = slotCenter(i);
      if (Math.abs(pt.x - c.x) < L.slotW / 2 && Math.abs(pt.y - c.y) < L.slotH / 2) {
        var sz = pieceSize(p.cells);
        // Lift the piece above the finger so it stays visible.
        s.drag = {
          i: i,
          x: pt.x,
          y: pt.y,
          offX: (sz.cols * L.cell) / 2,
          offY: sz.rows * L.cell + L.cell * 0.9,
        };
        return;
      }
    }
  }

  function move(pt) {
    if (!s.drag) return;
    s.drag.x = pt.x;
    s.drag.y = pt.y;
  }

  function up() {
    if (!s.drag) return;
    var d = s.drag;
    var piece = s.tray[d.i];
    var cell = dropCell(d);
    s.drag = null;
    if (!fits(piece.cells, cell.r, cell.c)) return;
    place(piece, cell.r, cell.c);
  }

  function place(piece, r0, c0) {
    var lines = linesAfter(piece.cells, r0, c0);
    piece.cells.forEach(function (c) {
      s.board[r0 + c[0]][c0 + c[1]] = piece.color;
    });
    piece.used = true;
    s.placed++;
    s.score += piece.cells.length * 10;

    var toClear = {};
    lines.rows.forEach(function (r) {
      for (var c = 0; c < N; c++) toClear[r + "," + c] = [r, c];
    });
    lines.cols.forEach(function (c) {
      for (var r = 0; r < N; r++) toClear[r + "," + c] = [r, c];
    });
    var count = lines.rows.length + lines.cols.length;
    Object.keys(toClear).forEach(function (k, idx) {
      var rc = toClear[k];
      var color = s.board[rc[0]][rc[1]];
      s.board[rc[0]][rc[1]] = -1;
      s.clearing.push({ r: rc[0], c: rc[1], color: color, t: -idx * 0.012 });
    });
    if (count) {
      s.score += count * 100 * count;
      s.shake = 0.18 + count * 0.1;
      var cx = L.bx + (c0 + 1) * L.cell;
      var cy = L.by + r0 * L.cell;
      floatText(cx, cy, count > 1 ? "COMBO x" + count + "!" : ["Nice!", "Great!"][s.placed % 2], count > 1 ? "#FFD45A" : "#FFFFFF");
    }

    if (
      s.tray.every(function (p) {
        return p.used;
      })
    )
      refill();
    var stuck = !s.tray.some(function (p) {
      return !p.used && anyFit(p.cells);
    });
    if (stuck) rescue();
  }

  function floatText(x, y, text, color) {
    s.floaters.push({ x: x, y: y, text: text, color: color, t: 0 });
  }

  // ---- Simulation ---------------------------------------------------------
  function update(dt) {
    s.time += dt;
    if (!s.drag) s.idle += dt;
    s.shake = Math.max(0, s.shake - dt);

    for (var i = s.clearing.length - 1; i >= 0; i--) {
      var k = s.clearing[i];
      k.t += dt;
      if (k.t > 0 && !k.burst) {
        k.burst = true;
        var x = L.bx + (k.c + 0.5) * L.cell;
        var y = L.by + (k.r + 0.5) * L.cell;
        for (var n = 0; n < 4; n++) {
          var dir = Math.random() * Math.PI * 2;
          var sp = 60 + Math.random() * 160;
          s.particles.push({
            x: x,
            y: y,
            vx: Math.cos(dir) * sp,
            vy: Math.sin(dir) * sp - 80,
            t: 0,
            life: 0.5 + Math.random() * 0.4,
            color: COLORS[k.color] ? COLORS[k.color].fill : "#fff",
            size: L.cell * (0.12 + Math.random() * 0.14),
          });
        }
      }
      if (k.t > 0.35) s.clearing.splice(i, 1);
    }
    for (var m = s.particles.length - 1; m >= 0; m--) {
      var q = s.particles[m];
      q.t += dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 500 * dt;
      if (q.t > q.life) s.particles.splice(m, 1);
    }
    for (var f = s.floaters.length - 1; f >= 0; f--) {
      s.floaters[f].t += dt;
      if (s.floaters[f].t > 1.2) s.floaters.splice(f, 1);
    }
    if (!s.endCardShown && s.time >= END_CARD_AFTER) {
      s.endCardShown = true;
      g.showEnd("Amazing combos!", "You scored " + s.score + ". Clear lines, chain combos and beat your best in the full game.");
    }
  }

  // ---- Drawing ------------------------------------------------------------
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBlock(ctx, x, y, size, color, alpha) {
    var c = COLORS[color];
    var r = size * 0.22;
    var pad = size * 0.05;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, r);
    ctx.fillStyle = c.dark;
    ctx.fill();
    roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2 - size * 0.1, r);
    ctx.fillStyle = c.fill;
    ctx.fill();
    // gloss
    roundRect(ctx, x + size * 0.2, y + size * 0.14, size * 0.4, size * 0.13, size * 0.07);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBackground(ctx) {
    var w = g.view.w;
    var h = g.view.h;
    ctx.fillStyle = "#FFE3C4";
    ctx.fillRect(0, 0, w, h);
    var bg = g.images.bg;
    if (bg && bg.width) {
      var scale = Math.max(w / bg.width, h / bg.height);
      var bw = bg.width * scale;
      var bh = bg.height * scale;
      ctx.drawImage(bg, (w - bw) / 2, (h - bh) / 2, bw, bh);
    }
  }

  function drawHud(ctx) {
    var w = g.view.w;
    var logo = g.images.logo;
    var bw = Math.min(140, w * 0.3);
    var bh = 54;
    var bx;
    var by;
    if (L.landscape) {
      var size = Math.min(L.side * 0.8, g.view.h * 0.5);
      if (logo && logo.width) ctx.drawImage(logo, L.side / 2 - size / 2, g.view.h * 0.12, size, size);
      bw = Math.min(bw, L.side * 0.8);
      bx = L.side / 2 - bw / 2;
      by = g.view.h * 0.12 + size + 12;
    } else {
      if (logo && logo.width) {
        var lh = L.top * 0.78;
        var lw = (lh * logo.width) / logo.height;
        ctx.drawImage(logo, w / 2 - lw / 2 - Math.min(80, w * 0.16), (L.top - lh) / 2, lw, lh);
      }
      bx = w / 2 + Math.min(40, w * 0.05);
      by = L.top / 2 - bh / 2;
    }
    roundRect(ctx, bx, by, bw, bh, 16);
    ctx.fillStyle = "#4B3524";
    ctx.fill();
    ctx.fillStyle = "#FFD45A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillText("SCORE", bx + bw / 2, by + 15);
    ctx.fillStyle = "#FFF3DC";
    ctx.font = "900 24px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillText(String(s.score), bx + bw / 2, by + 36);
  }

  function drawBoard(ctx) {
    roundRect(ctx, L.bx - 10, L.by - 10, L.board + 20, L.board + 20, 22);
    ctx.fillStyle = "#4B3524";
    ctx.fill();
    roundRect(ctx, L.bx - 4, L.by - 4, L.board + 8, L.board + 8, 16);
    ctx.fillStyle = "#F0E8DD";
    ctx.fill();

    var preview = null;
    if (s.drag) {
      var piece = s.tray[s.drag.i];
      var cell = dropCell(s.drag);
      if (fits(piece.cells, cell.r, cell.c)) preview = { piece: piece, r: cell.r, c: cell.c, lines: linesAfter(piece.cells, cell.r, cell.c) };
    }

    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var x = L.bx + c * L.cell;
        var y = L.by + r * L.cell;
        roundRect(ctx, x + 2, y + 2, L.cell - 4, L.cell - 4, L.cell * 0.18);
        ctx.fillStyle = "#E3DACE";
        ctx.fill();
        var v = s.board[r][c];
        if (v !== -1) {
          var glow = preview && (preview.lines.rows.indexOf(r) >= 0 || preview.lines.cols.indexOf(c) >= 0);
          drawBlock(ctx, x, y, L.cell, glow ? preview.piece.color : v);
        }
      }
    }

    if (preview) {
      preview.piece.cells.forEach(function (pc) {
        drawBlock(ctx, L.bx + (preview.c + pc[1]) * L.cell, L.by + (preview.r + pc[0]) * L.cell, L.cell, preview.piece.color, 0.45);
      });
    }

    s.clearing.forEach(function (k) {
      if (k.t < 0) {
        drawBlock(ctx, L.bx + k.c * L.cell, L.by + k.r * L.cell, L.cell, k.color);
        return;
      }
      var p = k.t / 0.35;
      var size = L.cell * (1 - p * 0.6);
      var x = L.bx + k.c * L.cell + (L.cell - size) / 2;
      var y = L.by + k.r * L.cell + (L.cell - size) / 2;
      drawBlock(ctx, x, y, size, k.color, 1 - p);
      ctx.globalAlpha = (1 - p) * 0.8;
      roundRect(ctx, x, y, size, size, size * 0.2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawPieceAt(ctx, piece, cx, cy, cellSize, alpha) {
    var sz = pieceSize(piece.cells);
    var x0 = cx - (sz.cols * cellSize) / 2;
    var y0 = cy - (sz.rows * cellSize) / 2;
    piece.cells.forEach(function (c) {
      drawBlock(ctx, x0 + c[1] * cellSize, y0 + c[0] * cellSize, cellSize, piece.color, alpha);
    });
  }

  function drawTray(ctx) {
    var w = g.view.w;
    if (L.landscape) roundRect(ctx, L.bx + L.board + 16, 12, L.side - 28, g.view.h - 24, 22);
    else roundRect(ctx, 12, L.trayY - L.cell * 1.6, w - 24, L.cell * 3.2, 22);
    ctx.fillStyle = "rgba(75, 53, 36, 0.12)";
    ctx.fill();
    s.tray.forEach(function (p, i) {
      if (p.used || (s.drag && s.drag.i === i)) return;
      var c = slotCenter(i);
      drawPieceAt(ctx, p, c.x, c.y, L.trayCell);
    });
    if (s.drag) {
      var piece = s.tray[s.drag.i];
      var sz = pieceSize(piece.cells);
      var x0 = s.drag.x - s.drag.offX;
      var y0 = s.drag.y - s.drag.offY;
      drawPieceAt(ctx, piece, x0 + (sz.cols * L.cell) / 2, y0 + (sz.rows * L.cell) / 2, L.cell);
    }
  }

  function drawHint(ctx) {
    if (s.drag) return;
    if (!(s.placed === 0 || s.idle > 2.5)) return;
    var i = -1;
    var spot = null;
    for (var k = 0; k < s.tray.length && i < 0; k++) {
      var cand = s.tray[k];
      if (cand.used) continue;
      if (cand.target && fits(cand.cells, cand.target[0], cand.target[1])) spot = { r: cand.target[0], c: cand.target[1] };
      else spot = bestMove(cand.cells);
      if (spot) i = k;
    }
    if (i < 0) return;
    var piece = s.tray[i];
    var sz = pieceSize(piece.cells);
    var from = slotCenter(i);
    var to = {
      x: L.bx + (spot.c + sz.cols / 2) * L.cell,
      y: L.by + (spot.r + sz.rows / 2) * L.cell,
    };
    var t = (s.time * 0.55) % 1;
    var e = t < 0.15 ? 0 : t > 0.8 ? 1 : (t - 0.15) / 0.65;
    e = e * e * (3 - 2 * e);
    var x = from.x + (to.x - from.x) * e;
    var y = from.y + (to.y - from.y) * e;
    var scale = L.trayCell + (L.cell - L.trayCell) * e;
    drawPieceAt(ctx, piece, x, y, scale, 0.55);

    // pointing hand
    ctx.save();
    ctx.translate(x + L.cell * 0.3, y + L.cell * 0.6);
    ctx.rotate(-0.35);
    var k2 = Math.max(0.8, L.cell / 40);
    ctx.scale(k2, k2);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#4B3524";
    ctx.lineWidth = 3;
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

    if (s.placed === 0) {
      var msg = "Drag blocks to fill a line!";
      ctx.font = "900 " + Math.round(Math.max(17, L.cell * 0.45)) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#4B3524";
      var my = L.by + L.cell * 1.3;
      ctx.strokeText(msg, g.view.w / 2, my);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(msg, g.view.w / 2, my);
    }
  }

  function drawFx(ctx) {
    s.particles.forEach(function (q) {
      ctx.globalAlpha = Math.max(0, 1 - q.t / q.life);
      ctx.fillStyle = q.color;
      roundRect(ctx, q.x - q.size / 2, q.y - q.size / 2, q.size, q.size, q.size * 0.25);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    s.floaters.forEach(function (f) {
      var a = Math.max(0, 1 - f.t / 1.2);
      var pop = Math.min(1, f.t * 6);
      ctx.globalAlpha = a;
      ctx.font = "900 " + Math.round(L.cell * 0.85 * (0.6 + 0.4 * pop)) + "px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#4B3524";
      var x = L.bx + L.board / 2;
      ctx.strokeText(f.text, x, f.y - f.t * 50);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, x, f.y - f.t * 50);
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    var ctx = g.ctx;
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 16 * s.shake, (Math.random() - 0.5) * 16 * s.shake);
    drawBackground(ctx);
    drawHud(ctx);
    drawBoard(ctx);
    drawTray(ctx);
    drawHint(ctx);
    drawFx(ctx);
    ctx.restore();
  }

  window.Playable.start({
    init: function (shell) {
      g = shell;
      reset();
      layout();
    },
    reset: reset,
    layout: layout,
    update: update,
    draw: draw,
    down: down,
    move: move,
    up: up,
    state: function () {
      return {
        time: s.time,
        score: s.score,
        placed: s.placed,
        endCardShown: s.endCardShown,
        board: s.board.map(function (row) {
          return row.map(function (v) {
            return v === -1 ? "." : "#";
          }).join("");
        }),
        layout: { bx: L.bx, by: L.by, cell: L.cell },
        tray: s.tray.map(function (p, i) {
          var c = slotCenter(i);
          var sz = pieceSize(p.cells);
          var spot = p.target ? { r: p.target[0], c: p.target[1] } : bestMove(p.cells);
          return { used: p.used, x: c.x, y: c.y, target: spot && [spot.r, spot.c], cols: sz.cols, rows: sz.rows };
        }),
      };
    },
  });
})();
