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
    // A halo in the panel colour keeps the label readable where it sits on a layer fill.
    if (label) svgText(m, (x1 + x2) / 2 + (opts.dx || 0), (y1 + y2) / 2 + (opts.dy || 0), label, {
      "font-size": opts.fs || 1.1, "text-anchor": opts.anchor || "middle", fill: col, "font-weight": 600,
      stroke: "var(--bg-soft)", "stroke-width": (opts.fs || 1.1) * 0.24, "stroke-linejoin": "round", "paint-order": "stroke",
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
      // Dimension the overhang on the side that is shrinking, and show its live value.
      var left = s > 0 ? oh - s : oh + s;
      if (left > 0) {
        var y1 = s > 0 ? top : diffY + diffH, y2 = y1 + left;
        if (left >= 1) dimLine(dims, A.id, 10.2, y1, 10.2, y2, "", { color: "var(--ink-soft)", sw: 0.1 });
        else {
          // too short for arrowheads: draw a bracket instead
          el("path", { d: "M9.9," + y1 + " H10.2 V" + y2 + " H9.9", fill: "none", stroke: "var(--ink-soft)", "stroke-width": 0.1 }, dims);
        }
        var ly0 = s > 0 ? Math.min((y1 + y2) / 2 + f * 0.35, diffY - 0.3) : Math.max((y1 + y2) / 2 + f * 0.35, diffY + diffH + f * 1.0);
        svgText(dims, 9.6, ly0, "overhang " + left + "λ", { "font-size": f, "text-anchor": "end", fill: "var(--ink-soft)" });
      }
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
    var f = narrow ? 1.2 : 0.93;
    // strips occupy x 0..30, y 0..18; device block is drawn at (ox, oy)
    var ox = narrow ? 10 : 32, oy = narrow ? 20.5 : 0;
    var W = narrow ? 30 : 42, H = narrow ? 39.5 : 21;
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
    [["diffusion", 4.5], ["poly", 14], ["metal", 24.5]].forEach(function (l) { svgText(g, l[1], 20.4, l[0], { "font-size": f, "text-anchor": "middle", fill: "var(--ink-soft)" }); });
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
      shapes.forEach(function (s) { s[1].style.opacity = s[0] === RULE_GROUP[key] ? 1 : "var(--dim)"; });
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
    var f = narrow ? 9.2 : 6;
    var base = 160, s = 2.7;
    var RW = 100; // right panel width in micrometres (fits the 84 x 138 um cell at lambda = 3 um)
    var VW = 118 + RW, VH = 184; // panels side by side at every width; narrow only enlarges the labels
    var svg = svgRoot(root, VW, VH, "An inverter drawn in lambda units, and the same drawing at true size for the chosen process next to a 10 micrometre scale bar");
    // Left panel: fixed lambda scale
    var L = el("g", { transform: "translate(0,0)" }, svg);
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

    // Right panel: true size in micrometres, next to a 10 um scale bar
    var R = el("g", { transform: "translate(118,0)" }, svg);
    svgText(R, 0, f + 1, "True size, in µm", { "font-size": f, "font-weight": 600 });
    var cell = el("g", {}, R);
    inverterLayout(cell);
    el("rect", { x: 5, y: base + 8, width: 10, height: 2, fill: "var(--ink)" }, R);
    svgText(R, 18, base + 10.5, "10 µm", { "font-size": f });
    el("line", { x1: 0, y1: base, x2: RW, y2: base, stroke: "var(--rule)", "stroke-width": 0.6 }, R);

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
      out.textContent = p.label + ": λ = " + lam + " µm, so a minimum 2λ gate is drawn " + trim(2 * lam, 2) + " µm long" + (p.node && 2 * lam > p.node ? ", longer than the process name (see the SCMOS section)" : "") + ". This cell is " +
        trim(cellW, 1) + " × " + trim(cellH, 1) + " µm; about " + perMm2.toLocaleString("en-GB") + " fit in 1 mm².";
    }
    pick(st.i);
  }

  /* ------------------------------------------------------------------ */
  /* 3b. The same inverter at 180 nm: lambda rules vs GF180MCU rules     */
  /* ------------------------------------------------------------------ */
  // GF180MCU 3.3 V rules used (micrometres): contact 0.22 (CO.1); COMP and Poly2
  // enclose contact 0.07 (CO.4, CO.3); Metal1 encloses contact 0.06 (CO.6);
  // contact to gate 0.15 (CO.7); COMP past gate 0.24 (DF.6); gate length 0.28 (PL.2); poly end cap 0.22 (PL.4);
  // poly to related COMP 0.1 (PL.5b); poly contact to COMP 0.17 (CO.8);
  // Nwell encloses PCOMP 0.43 (DF.4c); Nwell to NCOMP 0.43 (DF.16);
  // Metal1 width and space 0.23 (Mn.1, Mn.2a), area 0.1444 (Mn.3).
  // Implant (Nplus/Pplus) layers are left out, as in the lambda drawing.
  function gfInverter(g) {
    var sw = { "stroke-width": 0.0135 }; // same on-screen edge width as the lambda drawing
    rect(g, "well", 0.17, 1.47, 2.02, 1.59, sw);
    rect(g, "metal", 0, 0, 2.2, 0.46, sw);          // GND
    rect(g, "metal", 0, 2.6, 2.2, 0.46, sw);        // VDD
    rect(g, "diff", 0.6, 0.68, 1.16, 0.36, sw);     // n COMP
    rect(g, "diff", 0.6, 1.9, 1.16, 0.6, sw);       // p COMP
    rect(g, "poly", 1.04, 0.46, 0.28, 2.26, sw);    // gate
    rect(g, "poly", 0, 1.14, 1.32, 0.36, sw);       // input strip
    rect(g, "metal", 0.61, 0, 0.34, 1.03, sw);      // GND to n source
    rect(g, "metal", 0.61, 1.91, 0.34, 1.15, sw);   // VDD to p source
    rect(g, "metal", 1.41, 0.69, 0.34, 1.56, sw);   // output
    rect(g, "metal", 0.01, 1.09, 0.34, 0.46, sw);   // input
    [[0.67, 0.75], [1.47, 0.75], [0.67, 1.97], [1.47, 1.97], [0.07, 1.21]].forEach(function (c) { rect(g, "contact", c[0], c[1], 0.22, 0.22, sw); });
  }
  function exact(root, narrow) {
    var f = narrow ? 7 : 5.2, k = 30; // 30 units per micrometre, the same scale for both cells
    var VW = 200, VH = 172, base = 146;
    var svg = svgRoot(root, VW, VH, "The inverter drawn with lambda = 0.09 micrometres beside the same circuit drawn to GF180MCU rules, at the same scale");
    var lam = 0.09, lw = 28 * lam, lh = 46 * lam, gw = 2.2, gh = 3.06;
    var xl = 12, xg = 112;
    // lambda cell (offset so the well's -2 lambda edge sits at xl)
    var gl = el("g", { transform: "translate(" + (xl + 2 * lam * k) + "," + base + ") scale(" + (lam * k) + "," + (-lam * k) + ")" }, svg);
    inverterLayout(gl);
    // GF180MCU cell, with the lambda cell's outline behind it for comparison
    el("rect", { x: xg, y: base - lh * k, width: lw * k, height: lh * k, fill: "none", stroke: "var(--ink-soft)", "stroke-width": 0.6, "stroke-dasharray": "3 2" }, svg);
    var gg = el("g", { transform: "translate(" + xg + "," + base + ") scale(" + k + "," + (-k) + ")" }, svg);
    gfInverter(gg);
    el("line", { x1: 0, y1: base, x2: VW, y2: base, stroke: "var(--rule)", "stroke-width": 0.5 }, svg);
    var top = base - lh * k - 4;
    svgText(svg, xl, top - f - 2, "λ rules, λ = 0.09 µm", { "font-size": f, "font-weight": 600 });
    svgText(svg, xg, top - f - 2, "GF180MCU rules", { "font-size": f, "font-weight": 600 });
    svgText(svg, xl, top, "28λ × 46λ", { "font-size": f, fill: "var(--ink-soft)" });
    svgText(svg, xg, top, "dashed: the λ cell", { "font-size": f, fill: "var(--ink-soft)" });
    svgText(svg, xl, base + f + 3, "2.52 × 4.14 µm", { "font-size": f });
    svgText(svg, xl, base + 2 * f + 5, "area 10.4 µm²", { "font-size": f, "font-weight": 600 });
    svgText(svg, xg, base + f + 3, "2.20 × 3.06 µm", { "font-size": f });
    svgText(svg, xg, base + 2 * f + 5, "area 6.7 µm² (−35%)", { "font-size": f, "font-weight": 600 });
    // 1 um scale bar in the empty top of the dashed outline
    var sy = base - lh * k + 8;
    el("rect", { x: xg + 6, y: sy, width: k, height: 1.6, fill: "var(--ink)" }, svg);
    svgText(svg, xg + 6 + k + 3, sy + 1.6 + f * 0.3, "1 µm", { "font-size": f });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Multi-project wafer                                              */
  /* ------------------------------------------------------------------ */
  function wafer(root, narrow) {
    var VW = narrow ? 100 : 200, VH = narrow ? 200 : 100, f = 4.6;
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
  function drift(root, narrow, st) {
    // MOSIS rule values in lambda: SCMOS, SUBM, DEEP (SCMOS rev. 8.00, tables 3a and 3b)
    var rows = [
      ["Gap between wells at different voltages", 9, 18, 18],
      ["Gap between contacts", 2, 3, 4],
      ["Poly gap", 2, 3, 3],
      ["Metal 1 gap", 2, 3, 3],
      ["Via width", 2, 2, 3],
      ["Metal 2 gap", 3, 3, 4],
      ["Diffusion past gate", 3, 3, 4],
      ["Gate overhang past diffusion", 2, 2, 2.5],
      ["Poly width", 2, 2, 2],
      ["Metal 1 width", 3, 3, 3],
    ];
    var sets = ["SUBM (sub-micron)", "DEEP (0.25 µm and below)"];
    if (st.i === undefined) st.i = 1;
    var fsz = narrow ? 15 : 13, rowH = narrow ? 50 : 27, top = narrow ? 58 : 50;
    var W = narrow ? 400 : 820, H = top + rows.length * rowH + 34;
    var x0 = narrow ? 14 : 290, x1 = narrow ? 262 : 640; // x for ratio 1 and ratio 2
    function X(r) { return x0 + (r - 1) * (x1 - x0); }
    var svg = svgRoot(root, W, H, "Bar chart of how many times larger, measured in lambda, ten MOSIS rules became in the sub-micron rule sets than in the original SCMOS rules");
    var g = el("g", {}, svg);
    var controls = html("div", { class: "controls" }, root);
    var mark = chipRow(controls, ["SCMOS → SUBM", "SCMOS → DEEP"], st.i, draw);
    function draw(k) {
      st.i = k; mark(k);
      while (g.firstChild) g.removeChild(g.firstChild);
      svgText(g, 0, fsz + 4, "Growth of each rule, in λ, from SCMOS to " + (k ? "DEEP" : "SUBM"), { "font-size": fsz * 1.12, "font-weight": 600 });
      svgText(g, 0, fsz * 2 + 12, "If λ had kept working, every bar would stay at ×1.", { "font-size": fsz, fill: "var(--ink-soft)" });
      var plotTop = top - 6, plotBot = top + rows.length * rowH;
      [1, 1.5, 2].forEach(function (r) {
        el("line", { x1: X(r), y1: plotTop, x2: X(r), y2: plotBot, stroke: r === 1 ? "var(--ink-soft)" : "var(--rule)", "stroke-width": r === 1 ? 1.5 : 1 }, g);
        svgText(g, X(r), H - 10, "×" + r, { "font-size": fsz, "text-anchor": "middle", fill: "var(--ink-soft)", "font-weight": r === 1 ? 600 : 400 });
      });
      rows.forEach(function (row, i) {
        var y0 = top + i * rowH, v0 = row[1], v1 = row[2 + k], ratio = v1 / v0;
        if (i % 2 === 0) el("rect", { x: 0, y: y0, width: W, height: rowH, fill: "var(--ink-faint)", "fill-opacity": 0.07 }, g);
        var by = narrow ? y0 + 28 : y0 + 5, bh = narrow ? 16 : rowH - 10;
        if (narrow) svgText(g, x0 + 8, y0 + 19, row[0], { "font-size": fsz }); // clear of the x1 axis line
        else svgText(g, x0 - 12, y0 + rowH / 2 + fsz * 0.35, row[0], { "font-size": fsz, "text-anchor": "end" });
        var txt = v0 + "λ → " + v1 + "λ" + (ratio === 1 ? ", unchanged" : " (×" + (Math.round(ratio * 100) / 100) + ")");
        if (ratio > 1) {
          var bar = el("rect", { x: X(1), y: by, width: X(ratio) - X(1), height: bh, fill: "var(--accent)", "fill-opacity": 0.85 }, g);
          el("title", {}, bar).textContent = row[0] + ": " + txt;
        }
        var tx = ratio > 1 ? X(ratio) + 8 : X(1) + 8;
        svgText(g, tx, by + bh / 2 + fsz * 0.35, txt, { "font-size": fsz, "font-weight": ratio > 1 ? 600 : 400, fill: ratio > 1 ? "var(--ink)" : "var(--ink-soft)" });
      });
    }
    draw(st.i);
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
      gap: { fill: "none", op: 1, text: "var(--ink)" },
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
    [["half a contact hole", "var(--l-contact)"], ["metal surrounding the contact", "var(--l-metal)"], ["gap between the two metal wires", "transparent"]].forEach(function (l, i) {
      html("span", { class: i === 2 ? "gap" : "", style: "--c:" + l[1] }, lg, l[0]);
    });
  }


  /* Colour every λ (the design-rule unit) the same way as in the text. */
  function lamify(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var todo = [], n;
    while ((n = walker.nextNode())) {
      var par = n.parentNode;
      if (n.nodeValue.indexOf("λ") < 0 || !par) continue;
      if (par.classList && par.classList.contains("lam")) continue;
      var tag = (par.localName || "").toLowerCase();
      if (tag === "title" || tag === "style" || tag === "script") continue;
      todo.push(n);
    }
    todo.forEach(function (t) {
      var par = t.parentNode, svg = par.namespaceURI === NS;
      var bits = t.nodeValue.split("λ"), frag = document.createDocumentFragment();
      bits.forEach(function (b, i) {
        if (b) frag.appendChild(document.createTextNode(b));
        if (i < bits.length - 1) {
          var sp = svg ? document.createElementNS(NS, "tspan") : document.createElement("span");
          sp.setAttribute("class", "lam");
          sp.textContent = "λ";
          frag.appendChild(sp);
        }
      });
      par.replaceChild(frag, t);
    });
  }

  var REGISTRY = { misalign: misalign, rulebook: rulebook, shrink: shrink, exact: exact, wafer: wafer, drift: drift, pitch: pitch };
  // Narrowest diagram box (px, padding included) at which each wide layout keeps every label >= 11 px.
  var MIN_WIDE = { misalign: 560, rulebook: 600, shrink: 560, exact: 400, wafer: 560, drift: 730, pitch: 712 };
  var live = [];
  function isNarrow(root) { return root.clientWidth < (MIN_WIDE[root.getAttribute("data-diagram")] || 560); }
  function build(item) {
    var root = item.root;
    while (root.firstChild) root.removeChild(root.firstChild);
    item.narrow = isNarrow(root);
    root.classList.toggle("narrow", item.narrow);
    try { item.f(root, item.narrow, item.state); } catch (e) { console.error(e); }
    lamify(root);
  }
  function init() {
    document.documentElement.classList.add("js");
    [].forEach.call(document.querySelectorAll("[data-diagram]"), function (root) {
      var f = REGISTRY[root.getAttribute("data-diagram")];
      if (!f || root.dataset.ready) return;
      root.dataset.ready = "1";
      var item = { root: root, f: f, state: {} };
      if (window.MutationObserver) new MutationObserver(function () { lamify(root); }).observe(root, { childList: true, subtree: true, characterData: true });
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
