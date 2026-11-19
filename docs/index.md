---
myst:
  html_meta:
    "description": "How λ design rules worked, what they cost in silicon area, how they let newcomers design chips for shared wafers, and why they stopped working below a micron."
---

# Drawing chips in λ

```{rst-class} dek
In 1977 chip-layout rules were rewritten as small whole multiples of one length, λ. Designers drew once in λ; each factory turned λ into microns. For two decades that traded silicon area for portability and simplicity, until shrinking stopped being uniform.
```

```{rst-class} byline
Last updated 19 November 2026 · about 18 minutes to read
```

```{rst-class} lead
Every chip starts as a drawing: coloured rectangles, one colour per manufacturing step, that are turned into the [photomasks](https://en.wikipedia.org/wiki/Photomask) used to print the circuit onto silicon. Sending that finished drawing off to be made is called the [tape-out](https://en.wikipedia.org/wiki/Tape-out). The drawing has to obey **design rules**: minimum widths and gaps that keep printed shapes from merging or breaking. In the mid-1970s each factory published its own rules in microns, "often running 40 pages or more", and a drawing made for one factory was useless at the next.[^conway2012]
```

λ rules replaced those lists with ratios. Every width and gap became a small whole multiple of one length, λ (lambda), which for the factories of the day came to about half the smallest feature they could print.[^conway2012][^harris] To build the same design in a better factory, you changed λ and nothing else. The idea came out of [Lynn Conway](https://en.wikipedia.org/wiki/Lynn_Conway) and [Carver Mead](https://en.wikipedia.org/wiki/Carver_Mead)'s work at Xerox PARC and Caltech.[^conway2012][^lyon1981]

:::{admonition} At a glance
- **Why λ was invented:** to separate chip *design* from chip *manufacturing*. Every rule became a whole number of λ, about half the smallest feature, so people outside chip companies could learn the rules quickly and their designs would survive the next factory upgrade. [The rules](#sec-ratios)
- **What it cost:** mainly area. Rounding every rule up to whole λ made layouts larger than a factory's own rules allowed: about 27% wider wiring at λ = 0.5 µm, and about 2.7 times the area for one 180 nm logic gate drawn for this article (derived figures). That mattered for products, not for prototypes. [What λ cost](#sec-cost)
- **When it was used:** from 1978 (λ = 3 µm, in an MIT course); in industry from 3 µm nMOS processes in the late 1970s to about 0.7 µm CMOS processes in the early 1990s; in university rule sets down to λ = 0.09 µm in 2000. [SCMOS](#sec-scmos)
- **Why it stopped:** below about one micron, different rules stopped shrinking at the same rate, so one λ either wasted area or needed exceptions; then printing below the wavelength of light needed rules no list of widths and gaps could express. [Why it stopped](#sec-stopped)
:::

(sec-timeline)=
## Timeline

{.timeline}
- [1977]{.yr} By her account, Conway devises λ-based rules at Xerox PARC while working with Mead's group at Caltech.[^conway2012] [→ The rules](#sec-ratios)
- [1978]{.yr} The first shared chip of student λ designs: 19 projects from an MIT course, at λ = 3 µm.[^conway2012] [→ Access](#sec-access)
- [1979]{.yr} Mead and Conway's textbook *Introduction to VLSI Systems* teaches the rules; 82 projects from 124 designers are made at λ = 2.5 µm.[^conway2012][^mpcadventures] [→ Access](#sec-access)
- [1981]{.yr} λ becomes the interface: MOSIS takes designs in the Mead–Conway rules at λ = 2.5 µm and asks factories to support its rules.[^cohen1981] [→ Access](#sec-access)
- [1981–84]{.yr} Berkeley's RISC I is drawn at λ = 2 µm; one RISC II layout is made at λ = 2 µm and 1.5 µm on two different lines.[^riscerl1982][^risc2jssc1984] [→ One drawing](#sec-shrink)
- [1984]{.yr} Berkeley's Magic editor checks λ rules while you draw; CMOS rules "scalable from 3 microns to 1.2 microns" appear.[^magic1984][^isi1984] [→ Software](#sec-tools)
- [1986]{.yr} Xerox's Dragon rules merge two factories' rules into one λ = 1 µm set by taking "the more conservative rule".[^hoel1986] [→ Access](#sec-access)
- [Early 1990s]{.yr} Industry's λ era ends at features of about 0.7 µm.[^casale2014] [→ What λ cost](#sec-cost)
- [1997]{.yr} MOSIS adds sub-micron (SUBM) and later deep sub-micron (DEEP) λ rules, because some rules no longer shrink with the rest.[^hp1997][^scmos8] [→ SCMOS](#sec-scmos)
- [1999]{.yr} 0.18 µm features are printed with 0.248 µm light, which simple width-and-gap rules cannot describe.[^liebmann2003] [→ Why it stopped](#sec-stopped)
- [2000]{.yr} λ = 0.09 µm on TSMC's 0.18 µm process, the smallest λ in MOSIS's rules.[^scmos74] [→ SCMOS](#sec-scmos)
- [2009–20]{.yr} MOSIS last revises its λ rules in 2009 and has dropped support for them by 2020; λ survives in teaching.[^scmos8][^edwards2020][^harris] [→ Why it stopped](#sec-stopped)

(sec-before)=
## Why layouts need rules

A chip is built up in layers on a [wafer](https://en.wikipedia.org/wiki/Wafer_(electronics)). Each layer is printed through its own mask: one for regions of [doped](https://en.wikipedia.org/wiki/Doping_(semiconductor)) silicon called **diffusion**, one for [**polysilicon**](https://en.wikipedia.org/wiki/Polycrystalline_silicon) ("poly"), one for **metal** wires, one for the **contact** holes that connect metal down to the layers below. Wherever a poly line crosses diffusion, it forms the gate of a [MOSFET](https://en.wikipedia.org/wiki/MOSFET) transistor. The chips of the late 1970s used [nMOS](https://en.wikipedia.org/wiki/NMOS_logic), which builds everything from one type of transistor.[^lyon1981] A factory's recipe is called its **process**, named after the smallest feature it can print, usually the gate length: a "6 µm process" prints gates 6 µm long.[^harris]

Design rules exist because the factory is imperfect. Each mask is aligned to the layers already on the wafer and is never exactly in place, and printed shapes come out a little wider or narrower than drawn. [Dick Lyon](https://en.wikipedia.org/wiki/Richard_F._Lyon) of Xerox PARC described λ as a bound on both errors, so that in the worst case edges on two different masks can end up 2λ away from where they were drawn.[^lyon1981] A transistor's gate therefore overhangs the diffusion it crosses by 2λ: if it overhung by less, a small slip would leave a strip of diffusion running past the gate, connecting the transistor's two ends permanently.[^lyon1981]

```{raw} html
<figure class="fig" id="fig-misalign">
  <div class="diagram" data-diagram="misalign"><noscript><p>A poly gate crossing a diffusion strip. With a 2λ overhang the gate still cuts the diffusion after a mask shift of up to 2λ; with a 0.5λ overhang, a shift of 0.75λ leaves a sliver of diffusion that shorts source to drain.</p></noscript></div>
  <figcaption><strong>Masks never line up perfectly.</strong> A polysilicon gate (red) crossing diffusion (green) makes a transistor. Drag the slider to shift the poly mask. With the 2λ overhang from the rules, the gate keeps cutting the diffusion for any shift up to 2λ; with 0.5λ, a small slip opens a leak path that shorts source to drain. Overhang rule from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon, "Simplified Design Rules for VLSI Layouts" (1981)</a>.</figcaption>
</figure>
```

(sec-ratios)=
## The rules, written in λ

"MOS design rules should not be framed as sets of lengths but as sets of ratios of lengths," Conway recalled. "Such dimensionless rules could then be scaled to any process as multiples of a basic length unit in microns, a unit I called Lambda (λ)."[^conway2012] She set λ to half the largest of a process's minimum widths, gaps, extensions and overlaps, then tuned each rule to a small whole number of λ; the textbook description is that λ rules "round up dimensions to an integer multiple of λ".[^conway2012][^westeharris2011] The result fitted on "only two pages", "easy to teach, learn, apply, and check".[^conway2012]

Read as a recipe, the rules build a minimum transistor directly: a 2λ poly line crosses a 2λ diffusion strip and overhangs it by 2λ on each side; diffusion extends 2λ past the gate to form the source and drain; a contact is a 2λ square with 1λ of metal or diffusion around it; metal wires are 3λ wide and 3λ apart because metal climbs over the bumps left by the layers below.[^lyon1981] For a programmer, the rules work like a linter over integer coordinates: every poly box at least 2 grid units wide, every gap between poly boxes at least 2.

```{raw} html
<figure class="fig wide" id="fig-rulebook">
  <div class="diagram" data-diagram="rulebook" data-rules='[
    {"key":"polyW","label":"Poly width 2λ","why":"Poly lines are at least 2λ wide: the narrowest line the process prints reliably."},
    {"key":"polyS","label":"Poly gap 2λ","why":"Poly lines are at least 2λ apart, so neighbouring lines never print as one."},
    {"key":"diffW","label":"Diffusion width 2λ","why":"Diffusion is 2λ wide, like poly."},
    {"key":"diffS","label":"Diffusion gap 3λ","why":"Diffusion needs a 3λ gap so neighbouring regions don’t conduct into each other."},
    {"key":"metalW","label":"Metal width 3λ","why":"Metal is at least 3λ wide because it has to climb over the bumps left by the layers below."},
    {"key":"metalS","label":"Metal gap 3λ","why":"Metal lines are at least 3λ apart, for the same reason: edges over bumps print less sharply."},
    {"key":"overhang","label":"Gate overhang 2λ","why":"The gate overhangs the diffusion by 2λ on each side, so a misaligned mask cannot short the transistor."},
    {"key":"sd","label":"Diffusion past gate 2λ","why":"Diffusion extends 2λ beyond the gate to form the transistor’s source and drain."},
    {"key":"contact","label":"Contact 2λ × 2λ","why":"A contact hole is 2λ square."},
    {"key":"surround","label":"Contact surround 1λ","why":"The layers above and below surround a contact by 1λ, so the hole always lands inside both."}
  ]'><noscript><p>The core nMOS rules in λ: poly width and gap 2λ; diffusion width 2λ and gap 3λ; metal width and gap 3λ; gate overhang 2λ; diffusion past the gate 2λ; contacts 2λ square with 1λ of surround.</p></noscript></div>
  <div class="legend"><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact hole</span></div>
  <figcaption><strong>The Mead–Conway nMOS rules on a λ grid.</strong> Each grid square is λ × λ. Choose a rule to highlight it. Values and reasons from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon, "Simplified Design Rules for VLSI Layouts" (1981)</a>, which follows the Mead–Conway textbook.</figcaption>
</figure>
```

Lyon summarised the logic as two "meta-rules": moving an edge by less than 2λ "should not be obviously fatal", and by less than 1λ "should not cause significant degradation in performance."[^lyon1981]

Even the first set had exceptions. Lyon flagged the 1.5λ rule for the depletion implant (the layer that makes always-on load transistors) as "not as uniformly conservative as the rest" and recommended 2λ instead, and the pads where bonding wires attach stayed about 100 µm across whatever λ was.[^lyon1981] The simple rules also left out process options such as buried contacts, which join poly directly to diffusion and "may provide dramatic improvements in density".[^lyon1981]

(sec-shrink)=
## One drawing, many factories

The bet behind λ was that a factory's errors would shrink in step with its features, so a drawing scaled by the same factor would still print correctly.[^lyon1981] It was worth making because shrinking a transistor makes it faster and lower-power ([Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling)), and with density "doubling roughly every two years", Conway reasoned, a layout that could move to the next process beat one hand-squeezed for this one.[^dennard1974][^conway2012]

A λ layout is a drawing in abstract units. To make it, every coordinate is multiplied by the λ of the chosen process, and the file sent to the factory is "always in absolute metric units -- never in lambda units".[^scmos8] The 2λ poly width becomes 6 µm at λ = 3 µm, the value for the first course chips in 1978, and 1.2 µm at λ = 0.6 µm on a 1.2 µm CMOS process of the 1990s.[^conway2012][^scmos72]

```{raw} html
<figure class="fig wide" id="fig-shrink">
  <div class="diagram" data-diagram="shrink" data-procs='[
    {"label":"MIT course, 6 µm nMOS (1978)","short":"6 µm","lambda":3},
    {"label":"MPC79, 5 µm nMOS (1979)","short":"5 µm","lambda":2.5},
    {"label":"Orbit 2.0 µm CMOS via MOSIS (1990s)","short":"2 µm","lambda":1.0,"node":2},
    {"label":"AMI or HP 1.2 µm CMOS via MOSIS (1990s)","short":"1.2 µm","lambda":0.6,"node":1.2},
    {"label":"AMI or HP 0.5 µm CMOS via MOSIS (1990s)","short":"0.5 µm","lambda":0.35,"node":0.5},
    {"label":"TSMC 0.35 µm CMOS via MOSIS (1990s)","short":"0.35 µm","lambda":0.25,"node":0.35}
  ]'><noscript><p>A simplified inverter that is 28λ × 46λ: at λ = 3 µm it measures 84 × 138 µm; at λ = 0.25 µm it measures 7 × 11.5 µm.</p></noscript></div>
  <div class="legend"><span style="--c:var(--l-well)">n-well (CMOS only, explained below)</span><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact</span></div>
  <figcaption><strong>The drawing never changes; only λ does.</strong> Left: a simplified inverter (a NOT gate) drawn in λ units. Right: the same drawing at true size for six processes side by side, with a 10 µm scale bar; the process is named under each cell, from λ = 3 µm (6 µm) down to λ = 0.25 µm (0.35 µm). <a href="#fig-exact">A later figure</a> draws the same inverter to a modern factory's exact rules. The inverter is drawn as CMOS, the later standard; the 1978–79 chips were nMOS. λ values from <a href="https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf">Conway (2012)</a> and MOSIS SCMOS rules <a href="https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html">rev. 7.2</a> and <a href="https://web.archive.org/web/20001002134149/http://www.mosis.org/Technical/Designrules/scmos/scmos-main.html">rev. 7.4</a>.</figcaption>
</figure>
```

It worked in practice. Berkeley's RISC II was made in "two scaled versions" on "two different processing lines using the simple layout rules of C.A. Mead and L.A. Conway", at λ = 2 µm and 1.5 µm, giving 4 µm and 3 µm gates from one layout.[^risc2jssc1984] The flexibility had limits: the chip service [MOSIS](https://en.wikipedia.org/wiki/MOSIS) could "change lambda a little bit, but not a lot. If a big change of lambda is necessary, the designer has to make the changes."[^cohen1981]

(sec-access)=
## How λ let more people use shared wafers

On a shared run, or [multi-project wafer](https://en.wikipedia.org/wiki/Multi-project_wafer_service), many designs ride on one mask set. λ widened who could take part in three ways.

**A rulebook newcomers could learn.** Two pages of whole numbers replaced forty pages of process-specific microns, so people who had never seen a factory could draw correct layouts.[^conway2012] In an MIT course in autumn 1978, 19 student projects were merged onto one chip at λ = 3 µm, and in 1979, 124 designers at about a dozen universities submitted 82 projects at λ = 2.5 µm.[^conway2012][^mpcadventures]

**One set of rules for every design.** Because every project obeyed the same λ rules, a broker could check them all with one checker, pack them onto shared masks and pick the factory afterwards. MOSIS turned the usual relationship round: "We say, 'Those are OUR design rules. Do you support them?'"[^cohen1981] By 1984 it reported "at least 20 vendors" able to make nMOS chips to the Mead–Conway rules.[^isi1984] Later, a design in MOSIS's most conservative λ rules "could be fabricated on any of the MOSIS processes".[^westeharris2011]

**One mask set for several factories.** When two factories' rules differed, a λ rule set could cover both by taking the worse of each. Xerox's 1986 Dragon CMOS rules, at λ = 1 µm, aimed for "a mask set that can be used by both" its own lab and VLSI Technology: "We simply adopt the more conservative rule universally."[^hoel1986]

(sec-tools)=
## Software on the λ grid

Whole-number rules let every shape sit on an integer λ grid with only horizontal and vertical edges, which Conway said made editors and checkers "greatly simplified and speeded-up".[^conway2012] Designs left the grid at export: they travelled as **CIF**, the [Caltech Intermediate Form](https://en.wikipedia.org/wiki/Caltech_Intermediate_Form), a plain-text list of boxes in units of 0.01 µm, so a 2λ contact at λ = 3 µm was written as a box 600 units wide.[^cif1980]

- **ICARUS**, a layout editor for PARC's [Alto](https://en.wikipedia.org/wiki/Xerox_Alto), was adapted to λ rules in 1977.[^icarus1978][^timeline]
- **[Magic](https://en.wikipedia.org/wiki/Magic_(software))** (1984), from Berkeley, re-ran [design rule checking](https://en.wikipedia.org/wiki/Design_rule_checking) incrementally as the designer edited.[^magic1984][^magicdrc1984] It is still maintained, though its manual notes that "the decreasing use of scalable processes" has made drawing in λ "largely obsolete".[^magicsite][^magicmanual]

(sec-chips)=
## What people built in λ

Well-known λ chips include processors and accelerators designed by small university teams.[^mpcadventures][^nrc1999]

```{list-table} Research chips drawn with Mead–Conway λ rules.
:header-rows: 1
:class: cards
:widths: 22 46 32

* - Chip
  - What it showed
  - λ and process
* - **Scheme-79**, MIT, 1979
  - A Lisp processor on one chip; grew from a prototype [Guy Steele](https://en.wikipedia.org/wiki/Guy_L._Steele_Jr.) designed in the 1978 course.[^mpcadventures][^scheme1980]
  - λ = 2.5 µm, 5 µm nMOS (the 1979 shared run).[^mpcadventures][^conway2012]
* - **[Geometry Engine](https://en.wikipedia.org/wiki/Geometry_Engine)**, Stanford, 1979–82
  - 3D graphics maths in custom silicon.[^clark1982]
  - First prototype at λ = 2.5 µm (the 1979 shared run); later λ not found in sources.[^mpcadventures]
* - **[RISC I](https://en.wikipedia.org/wiki/Berkeley_RISC)**, Berkeley, 1981–82
  - About 44,000 transistors (sources differ: 44,420 or 44,500), drawn in a graduate course.[^chmrisc][^peek1983]
  - λ = 2 µm, nMOS with no buried contacts.[^riscerl1982]
* - **RISC II**, Berkeley, 1983–84
  - One layout made on two different lines.[^risc2jssc1984]
  - λ = 2 µm and 1.5 µm (4 µm and 3 µm gates).[^risc2jssc1984]
```

(sec-cost)=
## What λ cost, and whether it mattered

The cost was area. "Lambda-based rules are necessarily conservative because they round up dimensions to an integer multiple of λ," the standard CMOS textbook says; "the potential density advantage of micron rules is sacrificed for simplicity and easy scalability".[^westeharris2011] The clearest way to see it is to add up the space between two metal wires that each land on a contact.[^batten]

```{raw} html
<figure class="fig wide" id="fig-pitch">
  <div class="diagram" data-diagram="pitch"><noscript><p>Contacted metal pitch at λ = 0.5 µm: λ rules give half a contact 0.5, surround 0.5, metal gap 1.5, surround 0.5, half a contact 0.5, total 3.5 µm; the process's own micron rules give 0.375, 0.5, 1.0, 0.5, 0.375, total 2.75 µm.</p></noscript></div>
  <figcaption><strong>Theory versus practice: λ rules spend extra space.</strong> The distance between two contacted metal wires, built from its parts, under λ rules (λ = 0.5 µm) and under the same process's own micron rules, drawn to the same scale. The micron rules allow smaller contacts and a narrower metal gap. Values from <a href="https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf">Batten, Cornell ECE 6745, slide 21</a> (after Weste, table 3.2), whose totals are 7λ = 3.5 µm and 2.75 µm.</figcaption>
</figure>
```

At λ = 0.5 µm the λ pitch is 3.5 µm against 2.75 µm, about 27% wider (3.5 / 2.75, derived); "Scaled design is legal but much larger than it needs to be!", the slide concludes.[^batten] At 65 nm the gap is similar: Weste and Harris's example micron rules give a contacted metal 1 pitch of about 0.19 µm, against 7λ = 0.245 µm with λ = 0.035 µm, about 29% wider (0.245 / 0.19, derived).[^westeharris2011]

For a whole logic gate, the simple CMOS inverter drawn in λ above can also be drawn to GlobalFoundries' 180 nm GF180MCU rules with the same transistor sizes. Dividing GF180MCU's 0.28 µm minimum gate by 2 shows λ must be at least 0.14 µm there.[^gf180rules] At that λ the λ cell takes 25.2 µm²; the exact-rule cell takes 9.5 µm², about 62% less (1 − 9.5 / 25.2, derived). Part of that gap is slack in the λ drawing, and its 0.28 µm contacts would also need resizing to GF180MCU's fixed 0.22 µm.

```{raw} html
<figure class="fig" id="fig-exact">
  <div class="diagram" data-diagram="exact"><noscript><p>The 28λ × 46λ inverter at λ = 0.14 µm measures 3.92 × 6.44 µm (25.2 µm²). The same circuit drawn to GF180MCU rules measures 2.20 × 4.32 µm (9.5 µm²).</p></noscript></div>
  <div class="legend"><span style="--c:var(--l-well)">n-well</span><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact</span></div>
  <figcaption><strong>The same inverter, drawn both ways for one 180 nm process, at the same scale.</strong> Left: the λ drawing from <a href="#fig-shrink">the earlier figure</a> at λ = 0.14 µm, the smallest λ whose 2λ gate meets GF180MCU's 0.28 µm minimum. Right: the same circuit with the same transistor sizes, drawn for this article to GF180MCU's 3.3 V rules (CO.1–CO.8, PL.2–PL.5b, DF.4c, DF.6, DF.16 and Mn.1–Mn.3, checked by script), with the λ cell's outline dashed behind it. Both are simplified hand layouts without implant layers, and the λ drawing is not squeezed to its own minimum, so part of the difference is slack in the drawing rather than the rules. Its 2λ contacts would also have to be resized to GF180MCU's fixed 0.22 µm when masks are made. Rules from the <a href="https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_02.html">GF180MCU design manual</a>.</figcaption>
</figure>
```

Speed is harder to pin down. In λ's main era the minimum gate was 2λ, the process's own gate length (6 µm at λ = 3 µm), so λ rules did not lengthen the gate itself.[^conway2012] Later rule sets differed: some 180 nm λ rules "set λ = 0.10 µm, then shrink the gate by 20 nm while generating masks", while plain SCMOS on 0.5 µm processes drew gates 0.7 µm long.[^westeharris2011][^scmos8] The extra spacing makes wires longer; we found no source that measured how much delay that cost.

Berkeley's RISC I team compared their chip with Motorola's MC68000, a different and more complex design, so the gaps below are not λ's alone. RISC I took 15 man-months of design and 12 of layout and reached first silicon in 19 months; the 68000 took 100 and 70 man-months and 30 months.[^riscerl1982] RISC I also used about 2.8 square mils (one square mil is about 645 µm²) per device against about 1.0 for the 68000, though nearly half the 68000's devices are dense ROM, and the source does not separate the effect of λ rules from the rest of the design.[^riscerl1982]

Whether it mattered depended on the chip.

- **For classes and prototypes, no.** The Dragon designers, drawing an N-well at 12λ where one factory needed 4λ, wrote "we're not too concerned about the area penalty".[^hoel1986] The textbook calls λ rules "usable for class designs".[^westeharris2011]
- **For products, yes.** The same textbook calls them "not very useful for production designs", especially metal width and spacing, which are "too conservative".[^westeharris2011] MIPS's commercial chip left the whole Mead–Conway style behind, not just its rules; it "needed to go from NMOS to CMOS, from Mead/Conway design to SRAM-like design. You know, very high speed, balanced path, dynamic circuits," co-founder John Moussouris recalled.[^mipsoh] Industry used the Mead–Conway method, λ included, for layout productivity, "from a handful of transistors a day to several hundred", but only until about 0.7 µm.[^casale2014]

(sec-scmos)=
## SCMOS stretched λ to CMOS, and needed three rulebooks

[CMOS](https://en.wikipedia.org/wiki/CMOS), which pairs n-type and p-type transistors, needs **wells** (deep doped regions that host the second type) and soon added several metal layers joined by **vias**. MOSIS's answer was **Scalable CMOS (SCMOS)**, "a nearly process- and metric-independent interface to many CMOS fabrication processes", with its own values (a 2λ metal 1 gap, for example, against 3λ in the Mead–Conway nMOS rules). Its documentation was frank: "SCMOS is there for portability and simplicity. It is NOT there for fine-tuned layout."[^scmos8]

```{table} λ values MOSIS published for each SCMOS rule set. Plain SCMOS rules were written for 1–3 µm processes; the SUBM and DEEP variants changed some rules so that a smaller λ could be used.[^scmos72][^scmos74]
:name: lambda-table
:class: numeric

| Process | λ, SCMOS | λ, SUBM | λ, DEEP |
|---|---|---|---|
| Orbit 2.0 µm | 1.0 µm | not offered | not offered |
| AMI or HP 1.2 µm | 0.6 µm | not offered | not offered |
| HP 0.8 µm | 0.5 µm | 0.4 µm | not offered |
| AMI or HP 0.5 µm | 0.35 µm | 0.30 µm | not offered |
| TSMC 0.35 µm | 0.25 µm | 0.20 µm | not offered |
| TSMC 0.25 µm | not offered | 0.15 µm | 0.12 µm |
| TSMC 0.18 µm | not offered | 0.10 µm | 0.09 µm |
```

The same HP 0.8 µm process had two values of λ, 0.5 µm under the original rules and 0.4 µm under the sub-micron ones. MOSIS made SCMOS_SUBM "by increasing the lambda size for some rules (those that didn't shrink as fast in practice as did the overall scheme of things)", and revised them again into SCMOS_DEEP.[^scmos8][^hp1997] The single ruler had become three. λ was no longer half the process name either: on 0.5 µm processes plain SCMOS used λ = 0.35 µm, so a minimum gate was drawn 0.7 µm long. Under the SUBM rules (λ = 0.3 µm), poly was drawn 0.6 µm wide and MOSIS shrank it by 0.1 µm when making masks.[^scmos8][^westeharris2011]

```{raw} html
<figure class="fig wide" id="fig-drift">
  <div class="diagram" data-diagram="drift"><noscript><p>How many times larger each MOSIS rule became, measured in λ, from SCMOS to SUBM and to DEEP: gap between wells at different voltages 9λ, 18λ, 18λ; gap between contacts 2λ, 3λ, 4λ; poly gap 2λ, 3λ, 3λ; metal 1 gap 2λ, 3λ, 3λ; via width 2λ, 2λ, 3λ; metal 2 gap 3λ, 3λ, 4λ; diffusion past gate 3λ, 3λ, 4λ; gate overhang 2λ, 2λ, 2.5λ; poly width 2λ and metal 1 width 3λ unchanged.</p></noscript></div>
  <figcaption><strong>Measured in λ, the gaps grew as λ shrank.</strong> Paired bars show how many times larger each rule became, in λ, in MOSIS's sub-micron (SUBM, grey) and deep sub-micron (DEEP, accent) rule sets than in the original SCMOS set, whose value is given with each rule. If every dimension had scaled with λ, every bar would stay at ×1. Widths mostly did; gaps and overlaps grew, so the same circuit needed more λ × λ squares, and DEEP needed half-λ values such as 2.5λ. Data from MOSIS SCMOS rev. 8.00, tables 3a and 3b (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">archived copy</a>).</figcaption>
</figure>
```

(sec-stopped)=
## Below a micron, the rules stopped shrinking together

λ assumed that "all manufacturing dimensions scale equally", which holds only over "some modest span of time".[^batten] Below a micron, several things broke it at once.

**Some rules shrank more slowly than others.** Between the original and deep rule sets, the gap between two contacts went from 2λ to 4λ, and the gap between wells at different voltages from 9λ to 18λ, while poly stayed 2λ wide.[^scmos8]

**Integer λ ran out of resolution.** The DEEP rules needed values such as 2.5λ and 1.5λ, and "half-lambda rules reduce productivity because they force the designer off a λ grid."[^scmos8][^westeharris2011]

**No single λ fitted a real process.** Dividing each GF180MCU minimum by its λ multiple gives a different λ: the 0.28 µm gate (2λ) needs λ = 0.14 µm, the 0.24 µm poly gap (2λ) 0.12 µm, the 0.22 µm contact (2λ) 0.11 µm and the 0.23 µm metal 1 width (3λ) about 0.077 µm.[^gf180rules][^lyon1981] One λ has to take the largest, 0.14 µm, and every other rule then wastes space.

**New kinds of rule were about area, not widths or gaps.** Processes set **density** limits, such as GF180MCU's requirements that metal cover more than 30% of the chip and poly at least 14%, with dummy shapes added where needed.[^gf180rules] [**Antenna rules**](https://en.wikipedia.org/wiki/Antenna_effect) cap "the maximum allowed ratio of interconnect area exposed to plasma etch to active gate poly area", because long wires collect charge while they are etched and can damage the gate they connect to.[^sky130antenna]

**Lithography went below the wavelength of light.** By 1999, 0.18 µm features were printed with 0.248 µm ultraviolet light (a wavelength, unrelated to the layout λ), helped by [optical proximity correction](https://en.wikipedia.org/wiki/Optical_proximity_correction), which deliberately distorts the mask so the printed shape comes out right.[^liebmann2003] For smaller features, IBM's Lars Liebmann reported in 2003, "simple (i.e. understandable) design rules are inadequate (misleading)".[^liebmann2003]

**The rulebooks exploded.** Synopsys's Marco Casale-Rossi contrasted Conway's "just two pages" with "several thousands of complex design rules", described in "tens of thousands of lines of code".[^casale2014] Another count gives about 400 checks at 0.35 µm and more than 5,000 at 28 nm.[^date2013]

MOSIS's λ rules stop at 0.18 µm, in a document last revised in 2009, and by 2020 MOSIS had dropped support for them; they "only worked because they used conservative rules that did not reveal manufacturing limits".[^scmos8][^edwards2020] λ lives on in teaching: Harvey Mudd College's course still introduces rules "in terms of λ = f/2", with *f* the feature size.[^harris]

"We had defined a clean interface between design and fab," Conway wrote.[^conway2012] For two decades that interface was λ, a conservative ruler that gave up area for "portability and simplicity".[^scmos8]

## Further reading

- Richard F. Lyon, [*Simplified Design Rules for VLSI Layouts*](https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf) (1981), the λ rules with the reason for each.
- Neil Weste and David Harris, [*CMOS VLSI Design*](https://pages.hmc.edu/harris/cmosvlsi/4e/index.html), 4th edition (2011), section 1.5.3 and chapter 3, on λ versus micron rules.
- Lynn Conway, [*Reminiscences of the VLSI Revolution*](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf) (2012), on how the rules were devised.

## Sources

[^conway2012]: Lynn Conway, ["Reminiscences of the VLSI Revolution: How a series of failures triggered a paradigm shift in digital design"](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf), *IEEE Solid-State Circuits Magazine* 4(4), 2012, pp. 8–31. DOI [10.1109/MSSC.2012.2215752](https://doi.org/10.1109/MSSC.2012.2215752). Author's copy: [archived](https://web.archive.org/web/20241230111939/https://ai.eecs.umich.edu/people/conway/Memoirs/VLSI/Lynn_Conway_VLSI_Reminiscences.pdf).
[^timeline]: Lynn Conway, ["Reminiscences of the VLSI Revolution: A Timeline of Events"](https://web.archive.org/web/20260721222742/https://ai.eecs.umich.edu/people/conway/Memoirs/VLSI/Timeline/VLSI_Timeline.pdf), December 2012 (archived copy).
[^gf180rules]: GlobalFoundries, GF180MCU PDK design manual, sections [7.4 Nwell](https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_05.html), [7.5 Comp](https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_06.html), [7.7 Poly2](https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_08.html), [7.12 Contact](https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_13.html) and [7.13 Metaln](https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_07_14.html); 3.3 V column.
[^lyon1981]: Richard F. Lyon, ["Simplified Design Rules for VLSI Layouts"](https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf), Southcon '81, January 1981; also *LAMBDA*, first quarter 1981.
[^mpcadventures]: Lynn Conway, ["The MPC Adventures: Experiences with the Generation of VLSI Design and Implementation Methodologies"](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf), Xerox PARC report VLSI-81-2, January 1981. Journal version: *Microprocessing and Microprogramming* 10(4), 1982, pp. 209–228, DOI [10.1016/0165-6074(82)90054-0](https://doi.org/10.1016/0165-6074(82)90054-0).
[^cohen1981]: Danny Cohen and George Lewicki, ["MOSIS: The ARPA Silicon Broker"](https://web.archive.org/web/20240829090244/http://caltechconf.library.caltech.edu/219/1/DannyCohen.pdf), Proceedings of the Second Caltech Conference on VLSI, January 1981 (archived copy).
[^isi1984]: USC Information Sciences Institute, ["1984 Annual Technical Report" (ISI/SR-85-150)](https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf), MOSIS chapter, 1985 (archived copy of DTIC ADA157991).
[^nrc1999]: National Research Council, ["Funding a Revolution: Government Support for Computing Research", chapter 4](https://web.archive.org/web/20260802192522/https://www.nationalacademies.org/read/6323/chapter/6), National Academy Press, 1999 (archived copy). DOI [10.17226/6323](https://doi.org/10.17226/6323).
[^hp1997]: MOSIS, ["HP CMOS14TB Technology"](https://web.archive.org/web/19970717030547/http://www.mosis.org:80/html/hp-cmos14tb-tech.html), 1997 (archived copy).
[^dennard1974]: Robert H. Dennard et al., "Design of ion-implanted MOSFET's with very small physical dimensions", *IEEE Journal of Solid-State Circuits* 9(5), October 1974, pp. 256–268. DOI [10.1109/JSSC.1974.1050511](https://doi.org/10.1109/JSSC.1974.1050511).
[^scmos72]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 7.2"](https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html), undated, before March 2000 (university mirror).
[^scmos74]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 7.4"](https://web.archive.org/web/20001002134149/http://www.mosis.org/Technical/Designrules/scmos/scmos-main.html), March 2000 (archived copy).
[^scmos8]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 8.00"](https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html), updated May 2009 (archived copy).
[^cif1980]: Robert Sproull, Richard Lyon and Stephen Trimberger, ["The Caltech Intermediate Form for LSI Layout Description"](https://authors.library.caltech.edu/records/jmrgc-2f168), Caltech Computer Science Technical Report 2686, February 1980.
[^icarus1978]: Douglas G. Fairbairn and James A. Rowson, "ICARUS: An interactive integrated circuit layout program", 15th Design Automation Conference, 1978, pp. 188–192. DOI [10.1109/DAC.1978.1585168](https://doi.org/10.1109/DAC.1978.1585168).
[^magic1984]: John K. Ousterhout, Gordon T. Hamachi, Robert N. Mayo, Walter S. Scott and George S. Taylor, "Magic: A VLSI Layout System", 21st Design Automation Conference, 1984, pp. 152–159. DOI [10.1109/DAC.1984.1585789](https://doi.org/10.1109/DAC.1984.1585789).
[^magicdrc1984]: George S. Taylor and John K. Ousterhout, "Magic's Incremental Design-Rule Checker", 21st Design Automation Conference, 1984. DOI [10.1109/DAC.1984.1585790](https://doi.org/10.1109/DAC.1984.1585790).
[^magicmanual]: Magic VLSI, ["Magic Maintainer's Manual #2: The Technology File"](https://opencircuitdesign.com/magic/techref/maint2.html).
[^magicsite]: Open Circuit Design, ["Magic VLSI Layout Tool"](https://opencircuitdesign.com/magic/), project home page.
[^scheme1980]: Jack Holloway, Guy L. Steele Jr., Gerald Jay Sussman and Alan Bell, ["The SCHEME-79 Chip"](https://dspace.mit.edu/handle/1721.1/6334), MIT AI Memo 559, January 1980.
[^clark1982]: James H. Clark, ["The Geometry Engine: A VLSI Geometry System for Graphics"](https://archive.org/download/bitsavers_sgiirisgeok_1057823/p127-clark.pdf), *Computer Graphics* (SIGGRAPH '82) 16(3), July 1982, pp. 127–133. DOI [10.1145/800064.801272](https://doi.org/10.1145/800064.801272).
[^chmrisc]: Computer History Museum, ["RISC I"](https://www.computerhistory.org/revolution/digital-logic/12/286/1591), *Revolution* exhibition.
[^peek1983]: James B. Peek, ["The VLSI Circuitry of RISC I"](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1983/6347.html), UC Berkeley UCB/CSD-83-135, June 1983.
[^mipsoh]: Computer History Museum, ["Oral History of MIPS Computer Systems Founders" (panel with John Hennessy, John Moussouris, Skip Stritter and others)](https://archive.computerhistory.org/resources/access/text/2012/01/102746197-05-01-acc.pdf), 2011.
[^batten]: Christopher Batten, ["T04: Full-Custom Design Methodology"](https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf), Cornell ECE 6745 lecture slides, slide 21 (adapted from MIT 6.371, fall 2002, which cites Weste and Eshraghian, table 3.2).
[^liebmann2003]: Lars Liebmann, ["Layout Impact of Resolution Enhancement Techniques: Impediment or Opportunity?"](https://ispd.cc/slides/2003/07_1_liebmann.pdf), International Symposium on Physical Design, 2003 (slides © 2002 IBM).
[^casale2014]: Marco Casale-Rossi, ["The Heritage of Mead & Conway: What Has Remained the Same, What Has Changed, What Was Missed, and What Lies Ahead"](https://www.uvic.ca/research/transchair/assets/docs/The%20Heritage%20of%20Mead%20and%20Conway.pdf), *Proceedings of the IEEE* 102(2), February 2014, pp. 114–119. DOI [10.1109/JPROC.2013.2295871](https://doi.org/10.1109/JPROC.2013.2295871).
[^harris]: David Harris, ["Introduction" (lecture 0)](https://pages.hmc.edu/harris/class/e158/16/lect0.pdf), *CMOS VLSI Design*, Harvey Mudd College E158, 2016, slide 39.
[^edwards2020]: R. Timothy Edwards, ["Google/SkyWater and the Promise of the Open PDK"](https://woset-workshop.github.io/PDFs/2020/a03.pdf), Workshop on Open-Source EDA Technology (WOSET), 2020.
[^sky130antenna]: SkyWater, ["SKY130 Antenna Rules"](https://skywater-pdk.readthedocs.io/en/main/rules/antenna.html).
[^westeharris2011]: Neil H. E. Weste and David Money Harris, [*CMOS VLSI Design: A Circuits and Systems Perspective*](https://pages.hmc.edu/harris/cmosvlsi/4e/index.html), 4th edition, Addison-Wesley, 2011: section 1.5.3 (pp. 25–26, including footnote), section 3.3 (pp. 118–119) and the box "Using lambda design rules on commercial designs" (p. 137).
[^riscerl1982]: David A. Patterson and Carlo H. Séquin, ["A VLSI RISC"](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1982/ERL-m-82-10.pdf), UC Berkeley report UCB/ERL M82/10, 17 February 1982, p. 12 and table 8.
[^risc2jssc1984]: Robert W. Sherburne, Manolis G. H. Katevenis, David A. Patterson and Carlo H. Séquin, ["A 32-bit NMOS microprocessor with a large register file"](https://doi.org/10.1109/JSSC.1984.1052208), *IEEE Journal of Solid-State Circuits* 19(5), 1984, pp. 682–689 (abstract).
[^hoel1986]: Jeff Hoel, ["Dragon CMOS Design Rules", revision C](https://xeroxparcarchive.computerhistory.org/_cd4_/dragon7.0/documentation/dragoncmosdesignrules/.DragonCMOSDesignRulesC.tioga!3.html), Xerox PARC, 26 January 1986.
[^date2013]: Luca Carloni and others, ["The Heritage of Mead & Conway: What Has Remained the Same, What Has Changed, What Was Missed, and What Lies Ahead"](https://www.cs.columbia.edu/~luca/research/DATE13_panel.pdf), panel summary, DATE 2013 (statements by Alberto Sangiovanni-Vincentelli and Bernard Courtois).
