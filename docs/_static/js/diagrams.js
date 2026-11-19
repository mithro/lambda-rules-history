/* Interactive diagrams for the lambda-rules article.
 * Each diagram is a <div class="diagram" data-diagram="NAME" ...> placed in the
 * page by a raw-HTML block. Everything is drawn as inline SVG; colours come
 * from CSS custom properties so light and dark themes both work. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
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
    var a = { x: x, y: y, "font-size": 13 };
    for (var k in attrs || {}) a[k] = attrs[k];
    var t = el("text", a, parent);
    t.textContent = s;
    return t;
  }
  var LAYER = {
    well: { fill: "var(--l-well)", op: 0.35, stroke: "var(--l-well)" },
    diff: { fill: "var(--l-diff)", op: 0.55, stroke: "var(--l-diff)" },
    poly: { fill: "var(--l-poly)", op: 0.6, stroke: "var(--l-poly)" },
    metal: { fill: "var(--l-metal)", op: 0.45, stroke: "var(--l-metal)" },
    contact: { fill: "var(--l-contact)", op: 0.85, stroke: "var(--l-contact)" },
  };
  function rect(g, layer, x, y, w, h, extra) {
    var L = LAYER[layer];
    var a = { x: x, y: y, width: w, height: h, fill: L.fill, "fill-opacity": L.op, stroke: L.stroke, "stroke-width": 0.15 };
    for (var k in extra || {}) a[k] = extra[k];
    return el("rect", a, g);
  }
  function grid(g, x0, y0, w, h, step, cls) {
    for (var x = x0; x <= x0 + w + 1e-9; x += step)
      el("line", { x1: x, y1: y0, x2: x, y2: y0 + h, stroke: "var(--ink-faint)", "stroke-opacity": 0.22, "stroke-width": 0.06 }, g);
    for (var y = y0; y <= y0 + h + 1e-9; y += step)
      el("line", { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: "var(--ink-faint)", "stroke-opacity": 0.22, "stroke-width": 0.06 }, g);
  }
  function dimLine(g, x1, y1, x2, y2, label, opts) {
    opts = opts || {};
    var col = opts.color || "var(--ink)";
    var m = el("g", {}, g);
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": opts.sw || 0.12, "marker-start": "url(#arr)", "marker-end": "url(#arr)" }, m);
    var t = svgText(m, (x1 + x2) / 2 + (opts.dx || 0), (y1 + y2) / 2 + (opts.dy || 0), label, {
      "font-size": opts.fs || 1.1, "text-anchor": opts.anchor || "middle", fill: col, "font-weight": 600,
    });
    t.style.fill = col;
    return m;
  }
  function arrowDefs(svg, size) {
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "arr", viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: size || 4, markerHeight: size || 4, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,1 L9,5 L0,9 z", fill: "context-stroke" }, mk);
    return defs;
  }

  /* ------------------------------------------------------------------ */
  /* 1. Misalignment: why a gate must overhang the diffusion             */
  /* ------------------------------------------------------------------ */
  function misalign(root) {
    var W = 24, H = 14;
    var svg = el("svg", { viewBox: "-1 -1 " + (W + 2) + " " + (H + 2), role: "img", "aria-label": "Transistor layout with adjustable mask misalignment" }, root);
    arrowDefs(svg, 3);
    var g = el("g", {}, svg);
    grid(g, 0, 0, W, H, 1);
    // diffusion: horizontal strip, 4 lambda tall
    var diffY = 5, diffH = 4;
    rect(g, "diff", 2, diffY, 20, diffH);
    svgText(g, 3, diffY + 2.4, "source", { "font-size": 1.0, fill: "var(--ink)" });
    svgText(g, 21, diffY + 2.4, "drain", { "font-size": 1.0, "text-anchor": "end", fill: "var(--ink)" });
    var polyG = el("g", {}, g);
    var poly = rect(polyG, "poly", 11, 0, 2, 0);
    var gap1 = el("rect", { fill: "#d11", "fill-opacity": 0, x: 11, width: 2 }, g);
    var dims = el("g", {}, g);
    var controls = html("div", { class: "controls" }, root);
    var l1 = html("label", {}, controls, "Mask misalignment ");
    var slider = html("input", { type: "range", min: -3, max: 3, step: 0.25, value: 0, "aria-label": "Misalignment in lambda" }, l1);
    var ruleBtns = html("div", { class: "rule-btns" }, controls);
    var overhang = 2;
    [["Rule: overhang 2λ", 2], ["Overhang 0.5λ", 0.5]].forEach(function (o) {
      var b = html("button", { class: "chip", type: "button", "aria-pressed": o[1] === overhang ? "true" : "false" }, ruleBtns, o[0]);
      b.addEventListener("click", function () {
        overhang = o[1];
        [].forEach.call(ruleBtns.children, function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        draw();
      });
    });
    var out = html("div", { class: "readout", role: "status" }, root);
    function draw() {
      var s = parseFloat(slider.value);
      var top = diffY - overhang + s, bot = diffY + diffH + overhang + s;
      poly.setAttribute("y", top);
      poly.setAttribute("height", bot - top);
      while (dims.firstChild) dims.removeChild(dims.firstChild);
      dimLine(dims, 14, diffY - overhang, 14, diffY, "", { color: "var(--ink-soft)" });
      svgText(dims, 14.6, diffY - overhang / 2 + 0.35, "drawn overhang " + overhang + "λ", { "font-size": 0.9, fill: "var(--ink-soft)" });
      svgText(dims, 0.3, H - 0.5, "grid square = λ × λ", { "font-size": 0.8, fill: "var(--ink-faint)" });
      var shorted = top > diffY || bot < diffY + diffH;
      var gapTop = Math.max(diffY, Math.min(top, diffY + diffH));
      var gapBot = Math.min(diffY + diffH, Math.max(bot, diffY));
      if (top > diffY) { gap1.setAttribute("y", diffY); gap1.setAttribute("height", Math.min(top, diffY + diffH) - diffY); }
      else if (bot < diffY + diffH) { gap1.setAttribute("y", Math.max(bot, diffY)); gap1.setAttribute("height", diffY + diffH - Math.max(bot, diffY)); }
      gap1.setAttribute("fill-opacity", shorted ? 0.55 : 0);
      var shift = (s === 0 ? "0" : (s > 0 ? "+" : "−") + Math.abs(s)) + "λ";
      out.innerHTML = "";
      html("span", {}, out, "Poly mask shifted " + shift + ". ");
      var verdict = html("strong", {}, out, shorted ? "Broken: a strip of diffusion slips past the gate, so source and drain are shorted together." : "Works: the gate still cuts the diffusion completely.");
      verdict.style.color = shorted ? "#d33" : "var(--l-diff)";
    }
    slider.addEventListener("input", draw);
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* 2. The rulebook drawn: hover a rule to highlight it                 */
  /* ------------------------------------------------------------------ */
  function rulebook(root) {
    var rules = JSON.parse(root.getAttribute("data-rules"));
    var W = 44, H = 21;
    var svg = el("svg", { viewBox: "-1 -1 " + (W + 2) + " " + (H + 2), role: "img", "aria-label": "Basic lambda design rules drawn to scale on a lambda grid" }, root);
    arrowDefs(svg, 3);
    var g = el("g", {}, svg);
    grid(g, 0, 0, W, H, 1);
    var hiLayer = {};
    function r(key, layer, x, y, w, h) { var e = rect(g, layer, x, y, w, h); (hiLayer[key] = hiLayer[key] || []).push(e); return e; }
    // diffusion pair: width 2, spacing 3
    r("diff", "diff", 1, 2, 2, 16); r("diff", "diff", 6, 2, 2, 16);
    // poly pair: width 2, spacing 2
    r("poly", "poly", 11, 2, 2, 16); r("poly", "poly", 15, 2, 2, 16);
    // metal pair: width 3, spacing 3
    r("metal", "metal", 20, 2, 3, 16); r("metal", "metal", 26, 2, 3, 16);
    // transistor: diffusion 33..41 (2 tall), poly 36..38 crossing with 2 overhang
    r("tr", "diff", 34, 6, 6, 2); r("tr", "poly", 36, 4, 2, 6);
    svgText(g, 37, 3.2, "transistor", { "font-size": 1.0, "text-anchor": "middle", fill: "var(--ink-soft)" });
    // contact: diffusion pad 4x4 with metal, 2x2 cut, 1 surround
    r("ct", "diff", 34, 12, 4, 4); r("ct", "metal", 34, 12, 4, 4); r("ct", "contact", 35, 13, 2, 2);
    svgText(g, 36, 18.6, "contact", { "font-size": 1.0, "text-anchor": "middle", fill: "var(--ink-soft)" });
    var hi = el("g", {}, g);
    var D = {
      diffW: [[1, 12, 3, 12, "2λ", 0, -0.6]], diffS: [[3, 14, 6, 14, "3λ", 0, -0.6]],
      polyW: [[11, 12, 13, 12, "2λ", 0, -0.6]], polyS: [[13, 14, 15, 14, "2λ", 0, -0.6]],
      metalW: [[20, 12, 23, 12, "3λ", 0, -0.6]], metalS: [[23, 14, 26, 14, "3λ", 0, -0.6]],
      overhang: [[38.6, 8, 38.6, 10, "2λ", 1.3, 0.4], [38.6, 4, 38.6, 6, "2λ", 1.3, 0.4]],
      sd: [[34, 9, 36, 9, "2λ", 0, 1.4]],
      contact: [[35, 16.8, 37, 16.8, "2λ", 0, 1.3]],
      surround: [[38.8, 12, 38.8, 13, "1λ", 1.3, 0.4]],
    };
    var list = html("div", { class: "rule-list controls" }, root);
    function show(key) {
      while (hi.firstChild) hi.removeChild(hi.firstChild);
      (D[key] || []).forEach(function (d) {
        dimLine(hi, d[0], d[1], d[2], d[3], d[4], { color: "var(--accent)", fs: 1.3, dx: d[5], dy: d[6], sw: 0.16 });
      });
      [].forEach.call(list.children, function (c) { c.setAttribute("aria-pressed", c.dataset.key === key ? "true" : "false"); });
    }
    rules.forEach(function (rl) {
      var b = html("button", { class: "chip", type: "button", "data-key": rl.key, "aria-pressed": "false" }, list, rl.label);
      b.addEventListener("mouseenter", function () { show(rl.key); });
      b.addEventListener("focus", function () { show(rl.key); });
      b.addEventListener("click", function () { show(rl.key); });
    });
    show(rules[0].key);
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
  function shrink(root) {
    var procs = JSON.parse(root.getAttribute("data-procs"));
    var VIEW = 200; // micrometres shown across
    var svg = el("svg", { viewBox: "0 0 " + VIEW + " 150", role: "img", "aria-label": "An inverter drawn in lambda units, shown at true relative size for different processes" }, root);
    // human hair band ~ 70 um
    var hairX = 110;
    el("rect", { x: hairX, y: 0, width: 80, height: 150, fill: "var(--ink-faint)", "fill-opacity": 0.12 }, svg);
    svgText(svg, hairX + 3, 8, "human hair, ~60–100 µm wide", { "font-size": 4.6, fill: "var(--ink-soft)" });
    var cell = el("g", {}, svg);
    inverterLayout(cell);
    // scale bar 10 um
    var sb = el("g", {}, svg);
    el("rect", { x: 4, y: 143, width: 10, height: 1.6, fill: "var(--ink)" }, sb);
    svgText(sb, 16, 145.2, "10 µm", { "font-size": 4.2, fill: "var(--ink)" });
    var controls = html("div", { class: "controls" }, root);
    var chips = html("div", { class: "proc-chips" }, controls);
    var out = html("div", { class: "readout", role: "status" }, root);
    function pick(i) {
      var p = procs[i];
      var lam = p.lambda;
      var cellW = 28 * lam, cellH = 46 * lam;
      // position: layout coords x -2..26, y 0..46 ; flip y
      cell.setAttribute("transform", "translate(" + (6 + 2 * lam) + "," + (138) + ") scale(" + lam + "," + (-lam) + ")");
      [].forEach.call(chips.children, function (c, j) { c.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      var perMm2 = Math.floor(1e6 / (cellW * cellH));
      out.textContent = p.label + ": λ = " + lam + " µm, gate length " + (2 * lam).toFixed(2).replace(/\.?0+$/, "") + " µm. This cell is " +
        cellW.toFixed(1).replace(/\.0$/, "") + " × " + cellH.toFixed(1).replace(/\.0$/, "") + " µm; about " + perMm2.toLocaleString() + " fit in 1 mm².";
    }
    procs.forEach(function (p, i) {
      var b = html("button", { class: "chip", type: "button" }, chips, p.short);
      b.addEventListener("click", function () { pick(i); });
    });
    pick(0);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Multi-project wafer                                              */
  /* ------------------------------------------------------------------ */
  function wafer(root) {
    var svg = el("svg", { viewBox: "0 0 200 100", role: "img", "aria-label": "A wafer carrying one design versus many designs" }, root);
    var palette = ["var(--l-poly)", "var(--l-metal)", "var(--l-diff)", "var(--l-implant)", "var(--accent)", "var(--ink-soft)"];
    function drawWafer(cx, label, multi) {
      var g = el("g", {}, svg);
      var clip = el("clipPath", { id: "wclip" + cx }, g);
      el("circle", { cx: cx, cy: 48, r: 40 }, clip);
      el("circle", { cx: cx, cy: 48, r: 40, fill: "var(--bg)", stroke: "var(--ink-soft)", "stroke-width": 0.6 }, g);
      var inner = el("g", { "clip-path": "url(#wclip" + cx + ")" }, g);
      var step = 13;
      for (var x = cx - 40; x < cx + 40; x += step) for (var y = 8; y < 88; y += step) {
        if (!multi) {
          el("rect", { x: x + 0.4, y: y + 0.4, width: step - 0.8, height: step - 0.8, fill: palette[1], "fill-opacity": 0.45 }, inner);
        } else {
          var s = (step - 0.8) / 2;
          for (var i = 0; i < 4; i++) {
            el("rect", { x: x + 0.4 + (i % 2) * s, y: y + 0.4 + Math.floor(i / 2) * s, width: s - 0.3, height: s - 0.3, fill: palette[(i * 2 + 1) % palette.length], "fill-opacity": 0.5 }, inner);
          }
        }
      }
      svgText(svg, cx, 97, label, { "font-size": 5, "text-anchor": "middle", fill: "var(--ink)" });
    }
    drawWafer(50, "One customer’s design, repeated", false);
    drawWafer(150, "Many designs share each exposure", true);
  }


  /* ------------------------------------------------------------------ */
  /* 5. Rule drift across SCMOS, SUBM, DEEP                              */
  /* ------------------------------------------------------------------ */
  function drift(root) {
    var rows = [
      ["Poly width (3.1)", 2, 2, 2],
      ["Metal1 width (7.1)", 3, 3, 3],
      ["Poly space over field (3.2)", 2, 3, 3],
      ["Metal1 space (7.2)", 2, 3, 3],
      ["Metal2 space (9.2)", 3, 3, 4],
      ["Gate extension past active (3.3)", 2, 2, 2.5],
      ["Active extension past poly (3.4)", 3, 3, 4],
      ["Contact spacing (5.3, 6.3)", 2, 3, 4],
      ["Via width (8.1)", 2, 2, 3],
      ["Well space, different potential (1.2)", 9, 18, 18],
    ];
    var sets = [["SCMOS", "var(--ink-faint)", -7], ["SUBM", "var(--l-metal)", 0], ["DEEP", "var(--accent)", 7]];
    var labelW = 250, plotW = 400, valW = 120, rowH = 30, top = 40, maxV = 18;
    var W = labelW + plotW + valW + 10, H = top + rows.length * rowH + 30;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Dot chart of ten SCMOS rules in lambda for the SCMOS, SUBM and DEEP rule sets" }, root);
    function X(v) { return labelW + (v / maxV) * plotW; }
    svgText(svg, 0, 16, "Minimum value of each rule, in λ", { "font-size": 14, "font-weight": 600, fill: "var(--ink)" });
    svgText(svg, W - 4, 16, "SCMOS → SUBM → DEEP", { "font-size": 11.5, "text-anchor": "end", fill: "var(--ink-soft)" });
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18].forEach(function (v) {
      el("line", { x1: X(v), y1: top - 6, x2: X(v), y2: top + rows.length * rowH, stroke: "var(--rule)", "stroke-width": 1 }, svg);
      svgText(svg, X(v), H - 10, v + "λ", { "font-size": 11, "text-anchor": "middle", fill: "var(--ink-soft)" });
    });
    rows.forEach(function (r, i) {
      var y = top + i * rowH + rowH / 2;
      if (i % 2 === 0) el("rect", { x: 0, y: y - rowH / 2, width: W, height: rowH, fill: "var(--ink-faint)", "fill-opacity": 0.06 }, svg);
      svgText(svg, labelW - 12, y + 4, r[0], { "font-size": 12.5, "text-anchor": "end", fill: "var(--ink)" });
      [1, 2, 3].forEach(function (k) {
        var c = el("circle", { cx: X(r[k]), cy: y + sets[k - 1][2], r: 4.5, fill: sets[k - 1][1], stroke: "var(--bg-soft)", "stroke-width": 1 }, svg);
        var t = el("title", {}, c); t.textContent = sets[k - 1][0] + ": " + r[k] + "λ";
      });
      var txt = r[1] === r[3] ? "unchanged, " + r[1] + "λ" : r[1] + " → " + r[2] + " → " + r[3] + "λ";
      svgText(svg, W - 4, y + 4, txt, { "font-size": 12, "text-anchor": "end", fill: r[1] === r[3] ? "var(--ink-soft)" : "var(--ink)", "font-weight": r[1] === r[3] ? 400 : 600 });
    });
    var lg = html("div", { class: "legend" }, root);
    [["SCMOS (top dot, 1–3 µm processes)"], ["SUBM (middle dot, sub-micron)"], ["DEEP (bottom dot, 0.25 µm and below)"]].forEach(function (l, k) { html("span", { style: "--c:" + sets[k][1] }, lg, l[0]); });
  }

  var REGISTRY = { misalign: misalign, rulebook: rulebook, shrink: shrink, wafer: wafer, drift: drift };
  function init() {
    [].forEach.call(document.querySelectorAll("[data-diagram]"), function (root) {
      var f = REGISTRY[root.getAttribute("data-diagram")];
      if (f && !root.dataset.ready) { root.dataset.ready = "1"; try { f(root); } catch (e) { console.error(e); } }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
