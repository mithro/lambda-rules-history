/* Interactive diagrams for the lambda-rules article.
 * Each diagram is a <div class="diagram" data-diagram="NAME" ...> placed in the
 * page by a raw-HTML block. Everything is drawn as inline SVG; colours come
 * from CSS custom properties so light and dark themes both work.
 * Every diagram has a wide and a narrow layout so that no label is drawn
 * smaller than about 11 px on screen. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) {
      var v = attrs[k];
      if (v === undefined) continue;
      if (typeof v === "string" && v.indexOf("var(") >= 0) e.style.setProperty(k, v);
      else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function html(tag, attrs, parent, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgText(parent, x, y, s, attrs) {
    var a = { x: x, y: y, "font-size": 13, fill: "var(--ink)" };
    for (var k in attrs || {}) a[k] = attrs[k];
    var t = el("text", a, parent);
    t.textContent = s;
    return t;
  }
  var LAYER = {
    well: { fill: "var(--l-well)", op: 0.35 },
    diff: { fill: "var(--l-diff)", op: 0.55 },
    poly: { fill: "var(--l-poly)", op: 0.6 },
    metal: { fill: "var(--l-metal)", op: 0.45 },
    contact: { fill: "var(--l-contact)", op: 0.85 },
  };
  function rect(g, layer, x, y, w, h, extra) {
    var L = LAYER[layer];
    var a = { x: x, y: y, width: w, height: h, fill: L.fill, "fill-opacity": L.op, stroke: L.fill, "stroke-width": 0.15 };
    for (var k in extra || {}) a[k] = extra[k];
    return el("rect", a, g);
  }
  function grid(g, x0, y0, w, h, step) {
    for (var x = x0; x <= x0 + w + 1e-9; x += step)
      el("line", { x1: x, y1: y0, x2: x, y2: y0 + h, stroke: "var(--ink-faint)", "stroke-opacity": 0.25, "stroke-width": 0.06 }, g);
    for (var y = y0; y <= y0 + h + 1e-9; y += step)
      el("line", { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: "var(--ink-faint)", "stroke-opacity": 0.25, "stroke-width": 0.06 }, g);
  }
  function arrowDefs(svg, size) {
    var id = "arr" + (++uid);
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: id, viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: size || 4, markerHeight: size || 4, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,1 L9,5 L0,9 z", fill: "context-stroke" }, mk);
    return { defs: defs, id: id };
  }
  function dimLine(g, arr, x1, y1, x2, y2, label, opts) {
    opts = opts || {};
    var col = opts.color || "var(--ink)";
    var m = el("g", {}, g);
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": opts.sw || 0.12, "marker-start": "url(#" + arr + ")", "marker-end": "url(#" + arr + ")" }, m);
    if (label) svgText(m, (x1 + x2) / 2 + (opts.dx || 0), (y1 + y2) / 2 + (opts.dy || 0), label, {
      "font-size": opts.fs || 1.1, "text-anchor": opts.anchor || "middle", fill: col, "font-weight": 600,
    });
    return m;
  }
  function svgRoot(root, vw, vh, label) {
    return el("svg", { viewBox: "0 0 " + vw + " " + vh, role: "img", "aria-label": label }, root);
  }
  function chipRow(parent, items, selected, onPick, cls) {
    var row = html("div", { class: cls || "chip-row", role: "group" }, parent);
    items.forEach(function (label, i) {
      var b = html("button", { class: "chip", type: "button", "aria-pressed": i === selected ? "true" : "false" }, row, label);
      b.addEventListener("click", function () { onPick(i); });
    });
    return function mark(i) {
      [].forEach.call(row.children, function (c, j) { c.setAttribute("aria-pressed", j === i ? "true" : "false"); });
    };
  }

  /* ------------------------------------------------------------------ */
  /* 1. Misalignment: why a gate must overhang the diffusion             */
  /* ------------------------------------------------------------------ */
  function misalign(root, narrow, st) {
    if (st.overhang === undefined) { st.overhang = 2; st.shift = 0; }
    var W = 24, H = 14, f = narrow ? 1.25 : 0.9;
    var svg = el("svg", { viewBox: "-0.5 -0.5 " + (W + 1) + " " + (H + 1 + f * 1.3), role: "img", "aria-label": "Transistor layout with adjustable mask misalignment" }, root);
    var A = arrowDefs(svg, 3);
    var pat = "hatch" + (++uid);
    var p = el("pattern", { id: pat, patternUnits: "userSpaceOnUse", width: 0.7, height: 0.7, patternTransform: "rotate(45)" }, A.defs);
    el("rect", { width: 0.7, height: 0.7, fill: "var(--bad)", "fill-opacity": 0.35 }, p);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 0.7, stroke: "var(--bad)", "stroke-width": 0.35 }, p);
    var g = el("g", {}, svg);
    grid(g, 0, 0, W, H, 1);
    var diffY = 5, diffH = 4;
    rect(g, "diff", 2, diffY, 20, diffH);
    svgText(g, 2.4, diffY + diffH / 2 + f * 0.35, "source", { "font-size": f });
    svgText(g, 21.6, diffY + diffH / 2 + f * 0.35, "drain", { "font-size": f, "text-anchor": "end" });
    var poly = rect(g, "poly", 11, 0, 2, 0);
    var gap = el("rect", { fill: "url(#" + pat + ")", stroke: "var(--bad)", "stroke-width": 0.12, x: 10.6, width: 2.8, visibility: "hidden" }, g);
    var dims = el("g", {}, g);
    svgText(g, 0, H + f * 1.15, "grid square = λ × λ", { "font-size": f * 0.95, fill: "var(--ink-soft)" });

    var controls = html("div", { class: "controls" }, root);
    var l1 = html("label", {}, controls, "Mask misalignment ");
    var slider = html("input", { type: "range", min: -3, max: 3, step: 0.25, value: st.shift, "aria-label": "Misalignment in lambda" }, l1);
    var opts = [["Rule: overhang 2λ", 2], ["Too short: 0.5λ", 0.5]];
    var mark = chipRow(controls, opts.map(function (o) { return o[0]; }), st.overhang === 2 ? 0 : 1, function (i) {
      st.overhang = opts[i][1]; mark(i); draw();
    });
    var out = html("div", { class: "readout", role: "status" }, root);
    function draw() {
      var s = parseFloat(slider.value), oh = st.overhang;
      st.shift = s;
      var top = diffY - oh + s, bot = diffY + diffH + oh + s;
      poly.setAttribute("y", top);
      poly.setAttribute("height", bot - top);
      while (dims.firstChild) dims.removeChild(dims.firstChild);
      // Dimension the overhang that moves away from the diffusion, so its label never sits on "source".
      var oy0 = s > 0 ? bot - oh : top;
      dimLine(dims, A.id, 10.2, oy0, 10.2, oy0 + oh, "", { color: "var(--ink-soft)", sw: 0.1 });
      svgText(dims, 9.8, oy0 + oh / 2 + f * 0.35, "overhang " + oh + "λ", { "font-size": f, "text-anchor": "end", fill: "var(--ink-soft)" });
      var gy = null, gh = 0;
      if (top > diffY) { gy = diffY; gh = Math.min(top, diffY + diffH) - diffY; }
      else if (bot < diffY + diffH) { gy = Math.max(bot, diffY); gh = diffY + diffH - gy; }
      if (gy !== null) {
        gap.setAttribute("y", gy); gap.setAttribute("height", gh); gap.setAttribute("visibility", "visible");
        var ly = gy < diffY + diffH / 2 ? diffY - 0.5 : diffY + diffH + 0.5 + f * 0.7;
        svgText(dims, 13.8, ly, "leak path", { "font-size": f, fill: "var(--bad)", "font-weight": 700 });
      } else gap.setAttribute("visibility", "hidden");
      var shift = (s === 0 ? "0" : (s > 0 ? "+" : "−") + Math.abs(s)) + "λ";
      out.innerHTML = "";
      html("span", {}, out, "Poly mask shifted " + shift + ". ");
      var v = html("strong", { class: gy !== null ? "bad" : "good" }, out,
        gy !== null ? "Broken: a strip of diffusion slips past the gate, so source and drain are shorted together." : "Works: the gate still cuts the diffusion completely.");
    }
    slider.addEventListener("input", draw);
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* 2. The rulebook drawn: choose a rule to highlight it                */
  /* ------------------------------------------------------------------ */
  var RULE_GROUP = { diffW: "diff", diffS: "diff", polyW: "poly", polyS: "poly", metalW: "metal", metalS: "metal", overhang: "tr", sd: "tr", contact: "ct", surround: "ct" };
  function rulebook(root, narrow, st) {
    var rules = JSON.parse(root.getAttribute("data-rules"));
    if (st.key === undefined) st.key = rules[0].key;
    var f = narrow ? 1.2 : 0.85;
    // strips occupy x 0..30, y 0..18; device block is drawn at (ox, oy)
    var ox = narrow ? 10 : 32, oy = narrow ? 18 : 0;
    var W = narrow ? 30 : 42, H = narrow ? 37 : 20;
    var svg = el("svg", { viewBox: "-0.5 0 " + (W + 1) + " " + H, role: "img", "aria-label": "Basic lambda design rules drawn to scale on a lambda grid" }, root);
    var A = arrowDefs(svg, 3);
    var g = el("g", {}, svg);
    grid(g, 0, 1, 30, 18, 1);
    grid(g, ox, oy + 1, 9, 17, 1);
    var shapes = [];
    function r(grp, layer, x, y, w, h) { shapes.push([grp, rect(g, layer, x, y, w, h)]); }
    r("diff", "diff", 1, 2, 2, 16); r("diff", "diff", 6, 2, 2, 16);
    r("poly", "poly", 11, 2, 2, 16); r("poly", "poly", 15, 2, 2, 16);
    r("metal", "metal", 20, 2, 3, 16); r("metal", "metal", 26, 2, 3, 16);
    r("tr", "diff", ox + 1, oy + 6, 6, 2); r("tr", "poly", ox + 3, oy + 4, 2, 6);
    r("ct", "diff", ox + 1, oy + 12, 4, 4); r("ct", "metal", ox + 1, oy + 12, 4, 4); r("ct", "contact", ox + 2, oy + 13, 2, 2);
    svgText(g, ox + 4, oy + 3.4, "transistor", { "font-size": f, "text-anchor": "middle", fill: "var(--ink-soft)" });
    svgText(g, ox + 3, oy + 11.5, "contact", { "font-size": f, "text-anchor": "middle", fill: "var(--ink-soft)" });
    var hi = el("g", {}, g);
    var fs = f * 1.3;
    var D = {
      diffW: [[1, 12, 3, 12, "2λ", 0, -0.5]], diffS: [[3, 14, 6, 14, "3λ", 0, -0.5]],
      polyW: [[11, 12, 13, 12, "2λ", 0, -0.5]], polyS: [[13, 14, 15, 14, "2λ", 0, -0.5]],
      metalW: [[20, 12, 23, 12, "3λ", 0, -0.5]], metalS: [[23, 14, 26, 14, "3λ", 0, -0.5]],
      overhang: [[ox + 5.6, oy + 8, ox + 5.6, oy + 10, "2λ", 1.5, 0.45], [ox + 5.6, oy + 4, ox + 5.6, oy + 6, "2λ", 1.5, 0.45]],
      // narrow: label left of the line, clear of the "contact" heading below
      sd: [[ox + 1, oy + 9, ox + 3, oy + 9, "2λ", narrow ? -2.7 : 0, narrow ? 0.5 : fs * 0.95]],
      contact: [[ox + 2, oy + 16.8, ox + 4, oy + 16.8, "2λ", 0, fs * 0.95]],
      surround: [[ox + 5.8, oy + 12, ox + 5.8, oy + 13, "1λ", 1.5, 0.45]],
    };
    var controls = html("div", { class: "controls" }, root);
    var out = html("div", { class: "readout", role: "status" }, root);
    var mark = chipRow(controls, rules.map(function (x) { return x.label; }), -1, function (i) { show(rules[i].key); }, "chip-row rule-list");
    function show(key) {
      st.key = key;
      while (hi.firstChild) hi.removeChild(hi.firstChild);
      (D[key] || []).forEach(function (d) {
        dimLine(hi, A.id, d[0], d[1], d[2], d[3], d[4], { color: "var(--accent)", fs: fs, dx: d[5], dy: d[6], sw: 0.16 });
      });
      shapes.forEach(function (s) { s[1].style.opacity = s[0] === RULE_GROUP[key] ? 1 : 0.28; });
      var idx = 0;
      rules.forEach(function (x, i) { if (x.key === key) idx = i; });
      mark(idx);
      out.textContent = rules[idx].why || "";
    }
    show(st.key);
  }

  /* ------------------------------------------------------------------ */
  /* 3. Same drawing, shrinking ruler                                    */
  /* ------------------------------------------------------------------ */
  function inverterLayout(g) {
    rect(g, "well", -2, 22, 28, 24);
    rect(g, "metal", 0, 0, 24, 4);            // GND
    rect(g, "metal", 0, 40, 24, 4);           // VDD
    rect(g, "diff", 6, 6, 12, 6);             // n diffusion
    rect(g, "diff", 6, 28, 12, 10);           // p diffusion
    rect(g, "poly", 11, 4, 2, 36);            // gate
    rect(g, "poly", 1, 18, 12, 4);            // input pad
    rect(g, "metal", 6, 0, 4, 11);            // GND to n source
    rect(g, "metal", 6, 31, 4, 13);           // VDD to p source
    rect(g, "metal", 14, 7, 4, 28);           // output
    rect(g, "metal", 0, 18, 5, 4);            // input
    [[7, 8], [15, 8], [7, 32], [15, 32], [2, 19]].forEach(function (c) { rect(g, "contact", c[0], c[1], 2, 2); });
  }
  function shrink(root, narrow, st) {
    var procs = JSON.parse(root.getAttribute("data-procs"));
    if (st.i === undefined) st.i = 0;
    var f = narrow ? 8.6 : 5.5;
    var base = 160, s = 2.7;
    var VW = narrow ? 225 : 345, VH = narrow ? 368 : 182;
    var svg = svgRoot(root, VW, VH, "An inverter drawn in lambda units, and the same drawing at true size for the chosen process");
    // Left panel: fixed lambda scale
    var L = el("g", { transform: narrow ? "translate(57,0)" : "translate(0,0)" }, svg);
    svgText(L, 0, f + 1, "Drawn in λ", { "font-size": f, "font-weight": 600 });
    var lx = 18 + 2 * s;
    var lc = el("g", { transform: "translate(" + lx + "," + base + ") scale(" + s + "," + (-s) + ")" }, L);
    inverterLayout(lc);
    function at(x, y) { return [lx + x * s, base - y * s]; }
    var t;
    t = at(12, 2); svgText(L, t[0], t[1] + f * 0.35, "GND", { "font-size": f, "text-anchor": "middle", "font-weight": 600 });
    t = at(12, 42); svgText(L, t[0], t[1] + f * 0.35, "VDD", { "font-size": f, "text-anchor": "middle", "font-weight": 600 });
    t = at(-2, 20); svgText(L, t[0] - 1.5, t[1] + f * 0.35, "IN", { "font-size": f, "text-anchor": "end", "font-weight": 600 });
    var o1 = at(18, 16), o2 = at(26, 16);
    el("line", { x1: o1[0], y1: o1[1], x2: o2[0] + 1, y2: o2[1], stroke: "var(--ink)", "stroke-width": 0.6 }, L);
    svgText(L, o2[0] + 2, o2[1] + f * 0.35, "OUT", { "font-size": f, "font-weight": 600 });
    svgText(L, at(12, 0)[0], base + f + 4, "28λ × 46λ", { "font-size": f, "text-anchor": "middle", fill: "var(--ink-soft)" });

    // Right panel: true size in micrometres
    var R = el("g", { transform: narrow ? "translate(0,186)" : "translate(118,0)" }, svg);
    svgText(R, 0, f + 1, "True size, in µm", { "font-size": f, "font-weight": 600 });
    el("rect", { x: 95, y: f + 6, width: 60, height: base - f - 6, fill: "var(--ink-faint)", "fill-opacity": 0.28 }, R);
    el("rect", { x: 155, y: f + 6, width: 60, height: base - f - 6, fill: "var(--ink-faint)", "fill-opacity": 0.12 }, R);
    svgText(R, 98, f * 2 + 8, "human hair,", { "font-size": f, fill: "var(--ink-soft)" });
    svgText(R, 98, f * 3 + 10, "60–120 µm wide", { "font-size": f, fill: "var(--ink-soft)" });
    var cell = el("g", {}, R);
    inverterLayout(cell);
    el("rect", { x: 5, y: base + 6, width: 10, height: 2, fill: "var(--ink)" }, R);
    svgText(R, 18, base + 8.5, "10 µm", { "font-size": f, fill: "var(--ink)", "dominant-baseline": "auto" });
    el("line", { x1: 0, y1: base, x2: 215, y2: base, stroke: "var(--rule)", "stroke-width": 0.6 }, R);

    var controls = html("div", { class: "controls" }, root);
    var out = html("div", { class: "readout", role: "status" }, root);
    var mark = chipRow(controls, procs.map(function (p) { return p.short; }), st.i, pick);
    function trim(n, d) { return n.toFixed(d).replace(/\.?0+$/, ""); }
    function pick(i) {
      st.i = i;
      var p = procs[i], lam = p.lambda;
      var cellW = 28 * lam, cellH = 46 * lam;
      cell.setAttribute("transform", "translate(" + (5 + 2 * lam) + "," + base + ") scale(" + lam + "," + (-lam) + ")");
      mark(i);
      var perMm2 = Math.floor(1e6 / (cellW * cellH));
      out.textContent = p.label + ": λ = " + lam + " µm, so a 2λ gate is " + trim(2 * lam, 2) + " µm long. This cell is " +
        trim(cellW, 1) + " × " + trim(cellH, 1) + " µm; about " + perMm2.toLocaleString("en-GB") + " fit in 1 mm².";
    }
    pick(st.i);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Multi-project wafer                                              */
  /* ------------------------------------------------------------------ */
  function wafer(root, narrow) {
    var VW = narrow ? 100 : 200, VH = narrow ? 200 : 100, f = 4.4;
    var svg = svgRoot(root, VW, VH, "A wafer carrying one design repeated, beside a wafer whose every exposure carries four different designs");
    var palette = ["var(--l-poly)", "var(--l-metal)", "var(--l-diff)", "var(--l-implant)"];
    function drawWafer(cx, cy, label, multi) {
      var g = el("g", {}, svg);
      var R = 40, step = 13;
      el("circle", { cx: cx, cy: cy, r: R, fill: "var(--bg)", stroke: "var(--ink-soft)", "stroke-width": 0.6 }, g);
      for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) {
        var x = cx + i * step - step / 2, y = cy + j * step - step / 2;
        var far = Math.max(Math.abs(x - cx), Math.abs(x + step - cx));
        var farY = Math.max(Math.abs(y - cy), Math.abs(y + step - cy));
        if (far * far + farY * farY > R * R) continue;
        if (!multi) {
          el("rect", { x: x + 0.8, y: y + 0.8, width: step - 1.6, height: step - 1.6, fill: palette[1], "fill-opacity": 0.55 }, g);
        } else {
          var h = (step - 1.6) / 2;
          for (var k = 0; k < 4; k++)
            el("rect", { x: x + 0.8 + (k % 2) * h + 0.25, y: y + 0.8 + Math.floor(k / 2) * h + 0.25, width: h - 0.5, height: h - 0.5, fill: palette[k], "fill-opacity": 0.7 }, g);
        }
        el("rect", { x: x + 0.3, y: y + 0.3, width: step - 0.6, height: step - 0.6, fill: "none", stroke: "var(--ink)", "stroke-width": 0.35 }, g);
      }
      svgText(svg, cx, cy + R + f + 2.5, label, { "font-size": f, "text-anchor": "middle" });
    }
    if (narrow) {
      drawWafer(50, 44, "One design, repeated", false);
      drawWafer(50, 144, "Four designs share each exposure", true);
    } else {
      drawWafer(50, 44, "One design, repeated", false);
      drawWafer(150, 44, "Four designs share each exposure", true);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 5. Rule drift across SCMOS, SUBM, DEEP                              */
  /* ------------------------------------------------------------------ */
  function drift(root, narrow) {
    var rows = [
      ["Poly width", 2, 2, 2],
      ["Metal 1 width", 3, 3, 3],
      ["Poly gap", 2, 3, 3],
      ["Metal 1 gap", 2, 3, 3],
      ["Metal 2 gap", 3, 3, 4],
      ["Gate overhang past diffusion", 2, 2, 2.5],
      ["Diffusion past gate", 3, 3, 4],
      ["Gap between contacts", 2, 3, 4],
      ["Via width", 2, 2, 3],
      ["Gap between wells at different voltages", 9, 18, 18],
    ];
    var sets = [["SCMOS", "var(--ink-faint)", -8], ["SUBM", "var(--l-metal)", 0], ["DEEP", "var(--accent)", 8]];
    var maxV = 5;
    var W, H, X, rowY, fsz, top;
    if (narrow) {
      fsz = 15.5; var rowH = 58; top = 52; W = 400;
      H = top + rows.length * rowH + 30;
      X = function (v) { return 16 + (v / maxV) * 250; };
      rowY = function (i) { return top + i * rowH; };
    } else {
      fsz = 13; var rowH2 = 30; top = 46; W = 820;
      H = top + rows.length * rowH2 + 30;
      X = function (v) { return 270 + (v / maxV) * 380; };
      rowY = function (i) { return top + i * rowH2; };
    }
    var svg = svgRoot(root, W, H, "Dot chart of ten MOSIS rules in lambda for the SCMOS, SUBM and DEEP rule sets");
    svgText(svg, 0, fsz + 4, "Minimum value of each rule, in λ", { "font-size": fsz * 1.12, "font-weight": 600 });
    var plotTop = top - 8, plotBot = rowY(rows.length) + (narrow ? -4 : 0);
    for (var v = 0; v <= maxV; v++) {
      el("line", { x1: X(v), y1: plotTop, x2: X(v), y2: plotBot, stroke: "var(--rule)", "stroke-width": 1 }, svg);
      svgText(svg, X(v), H - 8, v + "λ", { "font-size": fsz, "text-anchor": "middle", fill: "var(--ink-soft)" });
    }
    if (!narrow) svgText(svg, W - 2, top - 14, "SCMOS → SUBM → DEEP", { "font-size": fsz, "text-anchor": "end", fill: "var(--ink-soft)" });
    rows.forEach(function (r, i) {
      var y0 = rowY(i), h = narrow ? 58 : 30;
      if (i % 2 === 0) el("rect", { x: 0, y: y0, width: W, height: h, fill: "var(--ink-faint)", "fill-opacity": 0.07 }, svg);
      var dotsY = narrow ? y0 + 40 : y0 + h / 2;
      var off = r[1] > maxV;
      var label = r[0];
      if (narrow) svgText(svg, 8, y0 + 19, label, { "font-size": fsz });
      else svgText(svg, 258, dotsY + fsz * 0.35, label, { "font-size": fsz, "text-anchor": "end" });
      if (off && narrow) {
        svgText(svg, 8, dotsY + fsz * 0.35, r[1] + " → " + r[2] + " → " + r[3] + "λ, off the scale →", { "font-size": fsz, "font-weight": 600 });
        return;
      }
      if (off) {
        el("line", { x1: X(maxV) - 30, y1: dotsY, x2: X(maxV) + 10, y2: dotsY, stroke: "var(--ink-soft)", "stroke-width": 1.5, "stroke-dasharray": "3 3" }, svg);
        el("path", { d: "M" + (X(maxV) + 10) + "," + (dotsY - 5) + " l8,5 l-8,5 z", fill: "var(--ink-soft)" }, svg);
      } else {
        [1, 2, 3].forEach(function (k) {
          var c = el("circle", { cx: X(r[k]), cy: dotsY + sets[k - 1][2] * (narrow ? 1.25 : 1), r: narrow ? 5.5 : 4.5, fill: sets[k - 1][1], stroke: "var(--bg-soft)", "stroke-width": 1 }, svg);
          el("title", {}, c).textContent = sets[k - 1][0] + ": " + r[k] + "λ";
        });
      }
      var same = r[1] === r[2] && r[2] === r[3];
      var txt = same ? "unchanged, " + r[1] + "λ" : r[1] + " → " + r[2] + " → " + r[3] + "λ";
      if (off) txt = r[1] + " → " + r[2] + " → " + r[3] + "λ, off scale";
      svgText(svg, W - 2, dotsY + fsz * 0.35, txt, { "font-size": fsz * (narrow && off ? 0.92 : 1), "text-anchor": "end", fill: same ? "var(--ink-soft)" : "var(--ink)", "font-weight": same ? 400 : 600 });
    });
    var lg = html("div", { class: "legend" }, root);
    ["SCMOS (top dot, 1–3 µm processes)", "SUBM (middle dot, sub-micron)", "DEEP (bottom dot, 0.25 µm and below)"].forEach(function (l, k) {
      html("span", { class: "dot", style: "--c:" + sets[k][1] }, lg, l);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Contacted metal pitch: lambda rules versus micron rules          */
  /* ------------------------------------------------------------------ */
  function pitch(root, narrow) {
    var segs = ["contact", "surround", "gap", "surround", "contact"];
    var bars = [
      { title: "λ rules (λ = 0.5 µm): 7λ", total: "3.5 µm", v: [0.5, 0.5, 1.5, 0.5, 0.5] },
      { title: "The same process’s micron rules", total: "2.75 µm", v: [0.375, 0.5, 1.0, 0.5, 0.375] },
    ];
    var fsz = narrow ? 15.5 : 13;
    var W = narrow ? 400 : 800, x0 = narrow ? 24 : 20, plotW = narrow ? 290 : 640;
    var k = plotW / 4; // units per micrometre
    var barH = narrow ? 34 : 30;
    var blockH = narrow ? 120 : 92;
    var top = fsz * (narrow ? 3.2 : 2) + 18;
    var H = top + bars.length * blockH + 34;
    var svg = svgRoot(root, W, H, "Two bars to the same scale: contacted metal pitch under lambda rules, 3.5 micrometres, and under micron rules, 2.75 micrometres");
    if (narrow) {
      svgText(svg, 0, fsz + 4, "Contacted metal pitch, in µm", { "font-size": fsz * 1.12, "font-weight": 600 });
      svgText(svg, 0, fsz * 2.3 + 4, "Both bars to the same scale", { "font-size": fsz, fill: "var(--ink-soft)" });
    } else svgText(svg, 0, fsz + 4, "Contacted metal pitch, in µm (both bars to the same scale)", { "font-size": fsz * 1.12, "font-weight": 600 });
    for (var t = 0; t <= 4; t++) {
      el("line", { x1: x0 + t * k, y1: top - 4, x2: x0 + t * k, y2: H - 26, stroke: "var(--rule)", "stroke-width": 1 }, svg);
      svgText(svg, x0 + t * k, H - 8, t + " µm", { "font-size": fsz, "text-anchor": "middle", fill: "var(--ink-soft)" });
    }
    var FILL = {
      contact: { fill: "var(--l-contact)", op: 0.85, text: "var(--bg)" },
      surround: { fill: "var(--l-metal)", op: 0.5, text: "var(--ink)" },
      gap: { fill: "var(--bg)", op: 1, text: "var(--ink)" },
    };
    bars.forEach(function (b, bi) {
      var y = top + bi * blockH;
      svgText(svg, narrow ? 0 : x0, y + fsz, b.title, { "font-size": fsz, "font-weight": 600 });
      var by = y + fsz + 8;
      var x = x0;
      var charW = fsz * 0.6;
      function lab(v) { return v === 1 ? "1.0" : String(v); }
      var inside = b.v.every(function (v) { return v * k > (lab(v).length + 1) * charW; });
      b.v.forEach(function (v, i) {
        var w = v * k, F = FILL[segs[i]];
        el("rect", { x: x, y: by, width: w, height: barH, fill: F.fill, "fill-opacity": F.op, stroke: segs[i] === "gap" ? "var(--ink-soft)" : "var(--bg-soft)", "stroke-width": 1, "stroke-dasharray": segs[i] === "gap" ? "4 3" : undefined }, svg);
        if (inside) svgText(svg, x + w / 2, by + barH / 2 + fsz * 0.35, lab(v), { "font-size": fsz, "text-anchor": "middle", fill: F.text, "font-weight": 600 });
        else {
          var ly = by + barH + fsz + 4 + (i % 2) * (fsz + 6);
          el("line", { x1: x + w / 2, y1: by + barH, x2: x + w / 2, y2: ly - fsz + 2, stroke: "var(--ink-soft)", "stroke-width": 1 }, svg);
          svgText(svg, x + w / 2, ly, lab(v), { "font-size": fsz, "text-anchor": "middle", "font-weight": 600 });
        }
        x += w;
      });
      svgText(svg, x + 8, by + barH / 2 + fsz * 0.35, b.total, { "font-size": fsz * 1.05, "font-weight": 700 });
    });
    var lg = html("div", { class: "legend" }, root);
    [["half a contact hole", "var(--l-contact)"], ["metal surrounding the contact", "var(--l-metal)"], ["gap between the two metal wires", "var(--bg)"]].forEach(function (l, i) {
      html("span", { class: i === 2 ? "gap" : "", style: "--c:" + l[1] }, lg, l[0]);
    });
  }

  var REGISTRY = { misalign: misalign, rulebook: rulebook, shrink: shrink, wafer: wafer, drift: drift, pitch: pitch };
  // Narrowest diagram box (px, padding included) at which each wide layout keeps every label >= 11 px.
  var MIN_WIDE = { misalign: 560, rulebook: 600, shrink: 730, wafer: 560, drift: 730, pitch: 712 };
  var live = [];
  function isNarrow(root) { return root.clientWidth < (MIN_WIDE[root.getAttribute("data-diagram")] || 560); }
  function build(item) {
    var root = item.root;
    while (root.firstChild) root.removeChild(root.firstChild);
    item.narrow = isNarrow(root);
    root.classList.toggle("narrow", item.narrow);
    try { item.f(root, item.narrow, item.state); } catch (e) { console.error(e); }
  }
  function init() {
    [].forEach.call(document.querySelectorAll("[data-diagram]"), function (root) {
      var f = REGISTRY[root.getAttribute("data-diagram")];
      if (!f || root.dataset.ready) return;
      root.dataset.ready = "1";
      var item = { root: root, f: f, state: {} };
      live.push(item);
      build(item);
    });
    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        live.forEach(function (item) { if (isNarrow(item.root) !== item.narrow) build(item); });
      }, 150);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
