---
myst:
  html_meta:
    "description": "How λ design rules let computer scientists design chips, made shared-wafer services such as MOSIS possible, and why they stopped working as processes shrank below a micron."
---

# Drawing chips in λ

```{rst-class} dek
In 1977 Lynn Conway rewrote the rules of chip layout as multiples of one number, λ. For two decades that number let students and researchers design chips without ever visiting a factory. Then the physics of shrinking stopped cooperating.
```

```{rst-class} byline
Last updated 19 November 2026 · about 20 minutes to read
```

```{rst-class} lead
Every chip starts as a drawing: coloured rectangles, one colour per manufacturing step, that are turned into the [photomasks](https://en.wikipedia.org/wiki/Photomask) used to print the circuit onto silicon. Sending that finished drawing off to be made is called the [tape-out](https://en.wikipedia.org/wiki/Tape-out), after the magnetic tape it once travelled on. The drawing has to obey **design rules**: minimum widths and gaps that keep printed shapes from merging or breaking. In the mid-1970s each factory published its own rules in microns, and a drawing made for one factory was useless at the next.[^conway2012]
```

[Lynn Conway](https://en.wikipedia.org/wiki/Lynn_Conway), a computer architect at [Xerox PARC](https://en.wikipedia.org/wiki/PARC_(company)), replaced those lists with ratios. Every width and gap became a small whole multiple of one length, λ (lambda), set to about half the smallest feature the factory could print.[^conway2012] To build the same design in a better factory, you changed λ and nothing else. Her memoir credits the idea to her; papers written at the time credit "Mead and Conway", after her collaborator [Carver Mead](https://en.wikipedia.org/wiki/Carver_Mead) of Caltech.[^conway2012][^lyon1981]

:::{admonition} At a glance
- **Why λ was invented:** to separate chip *design* from chip *manufacturing*, so that people outside chip companies could learn to design chips, and their designs would survive the next factory upgrade. [More](#sec-ratios)
- **When it was used:** from 1978, when a "6 µm" process had λ = 3 µm, until the early 1990s in industry (about 0.7 µm). Universities kept using it through the MOSIS service down to 0.18 µm processes (λ = 0.09 µm) around 2000. [More](#sec-scmos)
- **Why it stopped:** below about one micron, different rules stopped shrinking at the same rate. One λ either wasted area or needed exceptions, and from the late 1990s printing features smaller than the wavelength of light needed rules that no list of widths and gaps could express. [More](#sec-stopped)
:::

(sec-timeline)=
## Timeline

{.timeline}
- [1974]{.yr} IBM's Robert Dennard and colleagues show that shrinking a transistor's dimensions and voltage together makes it faster and more efficient, giving the industry a reason to keep shrinking.[^dennard1974]
- [1977]{.yr} Conway devises λ-based rules at Xerox PARC while working with Mead's group at Caltech. [Read more](#sec-ratios)[^conway2012]
- [1978]{.yr} Conway's MIT course: 19 student projects are fabricated together on one shared chip, at λ = 3 µm. [Read more](#sec-movement)[^conway2012]
- [1979]{.yr} Mead and Conway's textbook *Introduction to VLSI Systems* appears (dated 1980). MPC79 fabricates 82 projects from about a dozen universities in 29 days.[^timeline][^mpcadventures]
- [1981]{.yr} MOSIS, a government-funded "silicon broker", opens at the University of Southern California, accepting designs drawn in λ = 2.5 µm rules. [Read more](#sec-brokers)[^cohen1981][^isi1984]
- [1979–87]{.yr} Chips designed this way lead to Silicon Graphics (1982), MIPS Computer Systems (1984) and Sun's SPARC processors (1987). [Read more](#sec-chips)[^nrc1999][^chmsgi]
- [1984]{.yr} Berkeley's Magic layout editor checks λ design rules while you draw. [Read more](#sec-tools)[^magic1984]
- [1990s]{.yr} MOSIS splits its scalable CMOS rules into "sub-micron" and "deep" variants because some rules no longer shrink with the rest. [Read more](#sec-scmos)[^scmos8]
- [2000]{.yr} MOSIS maps λ = 0.09 µm onto TSMC's 0.18 µm process, the smallest λ found in its published rules.[^scmos74]
- [2020]{.yr} Google and SkyWater release the open SKY130 process kit, with exact rules in microns rather than λ. [Read more](#sec-survived)[^edwards2020]

(sec-before)=
## Before λ, a chip design belonged to one factory

A chip is built up in layers on a [wafer](https://en.wikipedia.org/wiki/Wafer_(electronics)), a thin disc of silicon that carries many copies of the chip at once. Each layer is printed through its own mask: one for regions of [doped](https://en.wikipedia.org/wiki/Doping_(semiconductor)) silicon called **diffusion**, one for [**polysilicon**](https://en.wikipedia.org/wiki/Polycrystalline_silicon) ("poly"), one for **metal** wires, one for the **contact** holes that connect metal down to the layers below. Wherever a poly line crosses diffusion, it forms the gate of a [MOSFET](https://en.wikipedia.org/wiki/MOSFET) transistor. The chips of the late 1970s used [nMOS](https://en.wikipedia.org/wiki/NMOS_logic), which builds everything from one type of transistor.[^lyon1981]

A factory's recipe is called its **process**, named after the smallest feature it can print, usually the transistor's gate length: a "6 µm process" prints gates 6 µm long. Until the late 1970s, drawing [layouts](https://en.wikipedia.org/wiki/Integrated_circuit_layout) was a craft practised inside semiconductor companies that both designed and made their chips.[^conway2012]

Design rules exist because the factory is imperfect. Each mask is aligned to the layers already on the wafer and is never exactly in place, and printed shapes come out a little wider or narrower than drawn. Dick Lyon of Xerox PARC described λ as a bound on both errors, so that in the worst case edges on two different masks can end up 2λ away from where they were drawn.[^lyon1981] A transistor's gate therefore overhangs the diffusion it crosses by 2λ: if it overhung by less, a small slip would leave a strip of diffusion running past the gate, connecting the transistor's two ends permanently.[^lyon1981]

```{raw} html
<figure class="fig" id="fig-misalign">
  <div class="diagram" data-diagram="misalign"></div>
  <noscript><p>A poly gate crossing a diffusion strip. With a 2λ overhang the gate still cuts the diffusion after a mask shift of up to 2λ; with a 0.5λ overhang, a shift of 0.75λ leaves a sliver of diffusion that shorts source to drain.</p></noscript>
  <figcaption><strong>Masks never line up perfectly.</strong> A polysilicon gate (red) crossing diffusion (green) makes a transistor. Drag the slider to shift the poly mask. With the 2λ overhang from the rules, the gate keeps cutting the diffusion; with 0.5λ, a small slip opens a leak path that shorts source to drain. Overhang rule from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon, "Simplified Design Rules for VLSI Layouts" (1981)</a>.</figcaption>
</figure>
```

Rules in microns changed whenever the factory improved. Mead had been teaching simplified rules at Caltech, but, Conway wrote, "the resulting layouts were also tied to particular processes, and had to be redone as new processes came online."[^conway2012] A prototype cost about $15,000 to $20,000 in masks and wafers and took three or four months, by Conway's 1981 estimate.[^mpcadventures]

(sec-ratios)=
## Conway's fix: every rule as a multiple of λ

Conway's idea, in spring 1977, was to express every rule as a ratio. "MOS design rules should not be framed as sets of lengths but as sets of ratios of lengths," she recalled in 2012. "Such dimensionless rules could then be scaled to any process as multiples of a basic length unit in microns, a unit I called Lambda (λ)."[^conway2012] She found the largest of a process's minimum widths, gaps, extensions and overlaps, set λ to half of it, and wrote each rule as a small whole number of λ. The final rule set "remained small at only two pages in length, easy to teach, learn, apply, and check."[^conway2012]

```{raw} html
<figure class="fig wide" id="fig-rulebook">
  <div class="diagram" data-diagram="rulebook" data-rules='[
    {"key":"polyW","label":"Poly width 2λ","why":"Poly lines are 2λ wide and 2λ apart: the narrowest line the process prints reliably."},
    {"key":"polyS","label":"Poly gap 2λ","why":"Poly lines are 2λ wide and 2λ apart: the narrowest line the process prints reliably."},
    {"key":"diffW","label":"Diffusion width 2λ","why":"Diffusion is 2λ wide, like poly."},
    {"key":"diffS","label":"Diffusion gap 3λ","why":"Diffusion needs a 3λ gap so neighbouring regions don’t conduct into each other."},
    {"key":"metalW","label":"Metal width 3λ","why":"Metal is 3λ wide and 3λ apart because it has to climb over the bumps left by the layers below."},
    {"key":"metalS","label":"Metal gap 3λ","why":"Metal is 3λ wide and 3λ apart because it has to climb over the bumps left by the layers below."},
    {"key":"overhang","label":"Gate overhang 2λ","why":"The gate overhangs the diffusion by 2λ on each side, so a misaligned mask cannot short the transistor."},
    {"key":"sd","label":"Diffusion past gate 2λ","why":"Diffusion extends 2λ beyond the gate to form the transistor’s source and drain."},
    {"key":"contact","label":"Contact 2λ × 2λ","why":"A contact hole is 2λ square."},
    {"key":"surround","label":"Contact surround 1λ","why":"The layers above and below surround a contact by 1λ, so the hole always lands inside both."}
  ]'></div>
  <noscript><p>The core nMOS rules in λ: poly width and gap 2λ; diffusion width 2λ and gap 3λ; metal width and gap 3λ; gate overhang 2λ; diffusion past the gate 2λ; contacts 2λ square with 1λ of surround.</p></noscript>
  <div class="legend"><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact hole</span></div>
  <figcaption><strong>The Mead–Conway nMOS rules on a λ grid.</strong> Each grid square is λ × λ. Choose a rule to highlight it. Values and reasons from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon, "Simplified Design Rules for VLSI Layouts" (1981)</a>, which follows the Mead–Conway textbook.</figcaption>
</figure>
```

Lyon summarised the logic as two "meta-rules": moving an edge relative to another by less than 2λ "should not be obviously fatal", and moving it by less than 1λ "should not cause significant degradation in performance."[^lyon1981] Even in 1981 some things refused to fit. The pads where bonding wires attach to the chip had to stay about 100 µm across whatever λ was, because the wires did not shrink.[^lyon1981]

The whole-number rules also made layout software far simpler. Shapes could sit on an integer λ grid with only horizontal and vertical edges, which Conway noted made editors and checking tools "greatly simplified and speeded-up".[^conway2012]

(sec-shrink)=
## One drawing, many factories

A λ layout is a drawing in abstract units. To make it, every coordinate is multiplied by the λ of the chosen process. The first course chips in 1978 used λ = 3 µm, the MPC79 run a year later λ = 2.5 µm, and by the 1990s MOSIS was mapping the same kind of drawing onto CMOS processes with λ of 0.6 µm and below.[^conway2012][^scmos72]

```{raw} html
<figure class="fig wide" id="fig-shrink">
  <div class="diagram" data-diagram="shrink" data-procs='[
    {"label":"MIT course, 6 µm nMOS (1978)","short":"1978 · 6 µm","lambda":3},
    {"label":"MPC79, 5 µm nMOS (1979)","short":"1979 · 5 µm","lambda":2.5},
    {"label":"Orbit 2.0 µm CMOS via MOSIS (1990s)","short":"2 µm","lambda":1.0},
    {"label":"AMI or HP 1.2 µm CMOS via MOSIS (1990s)","short":"1.2 µm","lambda":0.6},
    {"label":"HP 0.5 µm CMOS via MOSIS (1990s)","short":"0.5 µm","lambda":0.35},
    {"label":"HP 0.35 µm CMOS via MOSIS (1990s)","short":"0.35 µm","lambda":0.25}
  ]'></div>
  <noscript><p>A simplified inverter that is 28λ × 46λ: at λ = 3 µm it measures 84 × 138 µm, about the width of a human hair; at λ = 0.25 µm it measures 7 × 11.5 µm.</p></noscript>
  <div class="legend"><span style="--c:var(--l-well)">n-well</span><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact</span></div>
  <figcaption><strong>The drawing never changes; only λ does.</strong> Left: a simplified inverter (a NOT gate) drawn in λ units. Right: the same drawing at true size for six processes, next to a 10 µm scale bar and a <a href="https://en.wikipedia.org/wiki/Hair">human hair</a>, which is roughly 60–120 µm thick. The inverter is drawn as CMOS, the later standard; the 1978–79 chips were nMOS. λ values from <a href="https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf">Conway (2012)</a> and <a href="https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html">MOSIS SCMOS rules rev. 7.2</a>.</figcaption>
</figure>
```

The bet behind λ was that a factory's errors would shrink in step with its features: better lithography would bring tighter alignment and sharper edges at the same rate, so a drawing scaled by the same factor would still print correctly.[^lyon1981] Shrinking was worth chasing for a separate reason. In 1974 [Robert Dennard](https://en.wikipedia.org/wiki/Robert_H._Dennard)'s group at IBM had shown that scaling a transistor's dimensions and voltage together made it faster and lower-power at the same power density, the principle now called [Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling).[^dennard1974] With density "doubling roughly every two years", Conway reasoned, a layout that could move to the next process beat one hand-squeezed for this one.[^conway2012]

The price was area. Each rule was rounded up to a whole number of λ that was safe on every process it might meet, and a 1980 MIT thesis called the Mead–Conway rules "very conservative".[^baker1980] Conway accepted that on purpose, as the cost of rules that newcomers could learn.[^conway2012]

(sec-movement)=
## A textbook and a course turned λ into a movement

Mead and Conway wrote the method up as *Introduction to VLSI Systems*, [VLSI](https://en.wikipedia.org/wiki/Very-large-scale_integration) meaning "very-large-scale integration", chips with tens of thousands of transistors. Drafts printed at PARC were used in courses at Caltech and Berkeley from October 1977, and Addison-Wesley published the book in time for the autumn 1979 courses, with a 1980 date in the imprint.[^timeline][^conway2012] It eventually sold around 70,000 copies.[^conway2012]

Conway's autumn 1978 course at [MIT](https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology) proved that students could get working chips. The class had 32 students, and on 6 December its 19 projects were sent over the [ARPANET](https://en.wikipedia.org/wiki/ARPANET) to PARC and merged into one shared chip. Micro Mask made the masks with an [electron-beam](https://en.wikipedia.org/wiki/Electron-beam_lithography) machine, and [Hewlett-Packard](https://en.wikipedia.org/wiki/Hewlett-Packard)'s research lab ran the wafers on a 6 µm nMOS process, λ = 3 µm. Packaged chips reached MIT on 18 January 1979.[^conway2012]

**MPC79** ("multi-project chip, 1979") scaled the experiment up: 124 designers at about a dozen universities submitted 82 projects by a 4 December deadline. PARC merged them onto 12 chip types, and HP fabricated them on a 5 µm nMOS process (λ = 2.5 µm). Packaged chips went back to every designer 29 days after the deadline, at a cost per project "on the order of a few hundred dollars", against $15,000 to $20,000 for a conventional prototype.[^mpcadventures][^conway2012] The next run, MPC580 in spring 1980, carried 171 projects from 15 organisations.[^conway2012]

Mead's phrase for the people this created was "the 'Tall Thin Man'": a system designer who could carry an idea from architecture down to layout; Conway noted that the image left out women engineers, herself included.[^conway2012] Within about two years more than a hundred universities were teaching [Mead–Conway](https://en.wikipedia.org/wiki/Mead%E2%80%93Conway_VLSI_chip_design_revolution) courses.[^timeline][^conway2012]

(sec-brokers)=
## Brokers, not universities, got the chips made

No university could buy time in a commercial factory for a single student design. What made it work was a **broker** that collected many designs, packed them onto shared wafers and paid one factory, or **fab**, for the whole run. Because a run's masks and wafer processing cost the same however many designs it carries, sharing divided the cost.[^isi1984]

```{raw} html
<figure class="fig" id="fig-wafer">
  <div class="diagram" data-diagram="wafer"></div>
  <noscript><p>Left: a wafer covered by repeated copies of one design. Right: a multi-project wafer, where each repeated exposure carries four different projects.</p></noscript>
  <figcaption><strong>A multi-project wafer splits one run among many designs.</strong> A wafer is printed by repeating one exposure (outlined) across its surface. Filling each exposure with several small projects instead of one product shares the cost of masks and processing among them. Schematic, not to scale; cost model from the <a href="https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf">USC/ISI 1984 annual report</a>.</figcaption>
</figure>
```

At PARC, Alan Bell and [Martin Newell](https://en.wikipedia.org/wiki/Martin_Newell_(computer_scientist)) built the MPC79 "implementation system" in 1979, software that answered designers' electronic messages and fed their layouts to mask makers and fabs.[^mpc79doc] In spring 1980 PARC handed the system to [Danny Cohen](https://en.wikipedia.org/wiki/Danny_Cohen_(computer_scientist)) and Keith Uncapher at the [USC Information Sciences Institute](https://en.wikipedia.org/wiki/Information_Sciences_Institute), and the resulting service, **[MOSIS](https://en.wikipedia.org/wiki/MOSIS)** (the MOS Implementation Service), began operating in January 1981 with [DARPA](https://en.wikipedia.org/wiki/DARPA) funding.[^conway2012][^isi1984]

λ was what made the broker practical. Cohen and George Lewicki called MOSIS "the ARPA silicon broker", whose aim was "to totally isolate the designer from all the trivia that fabrication requires", and in 1981 it supported "nMOS with the Mead-Conway design rules" at "lambda equals 2.5 microns".[^cohen1981] MOSIS told factories its rules rather than asking for theirs: "We say, 'Those are OUR design rules. Do you support them?'" A factory that answered "Lambda equals, say, two microns, for everything except…" was told "Too bad."[^cohen1981]

```{raw} html
<figure class="fig" id="fig-flow">
  <ol class="flow">
    <li><strong>Draw</strong> the layout on a λ grid in an editor such as Caesar or Magic, which checks the rules as you go.</li>
    <li><strong>Scale and export:</strong> multiply by λ and write a CIF text file in absolute units.</li>
    <li><strong>Submit</strong> the file to MOSIS by ARPANET or email.</li>
    <li><strong>Merge:</strong> MOSIS places projects onto shared chips and the chips onto wafers, matched to a factory that accepts its rules.</li>
    <li><strong>Masks:</strong> a mask shop writes the masks with an electron beam (about 4 days).</li>
    <li><strong>Wafers:</strong> the fab processes them (about 5 days), MOSIS checks them (1 day).</li>
    <li><strong>Package and ship</strong> the chips back (about 8 days). Typical total: four to six weeks.</li>
  </ol>
  <figcaption><strong>A λ tape-out through MOSIS in the early 1980s.</strong> Day counts are MOSIS's best-case nMOS timings from the <a href="https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf">USC/ISI 1984 annual report</a>; MOSIS's later rules confirm files arrived "always in absolute metric units -- never in lambda units" (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">SCMOS rev. 8.00</a>).</figcaption>
</figure>
```

By 1984 MOSIS reported that "at least 20 vendors" could make nMOS chips to the Mead–Conway rules, at 3 µm and 4 µm, with costs cut by one to two orders of magnitude by sharing wafers.[^isi1984] It ran 258 projects in 1981 and 1,880 in 1989, for users at more than 360 institutions.[^nrc1999] Class projects were made free, and by 2005 MOSIS had prototyped more than 50,000 designs.[^viterbi2005] Its factories changed over the years, from HP to Orbit Semiconductor, AMI, TSMC, IBM and others.[^mosisfab1997][^mosisvendors2010] Europe built its own brokers: France's CMP made Grenoble student chips in 1981, followed by EUROCHIP (1989) and EUROPRACTICE (1995).[^cmp1981][^das2010]

(sec-tools)=
## The software grew up around the λ grid

The designs travelled as **CIF**, the [Caltech Intermediate Form](https://en.wikipedia.org/wiki/Caltech_Intermediate_Form): a plain-text list of boxes and wires on each layer, in units of 0.01 µm. Its 2.0 version was written by [Bob Sproull](https://en.wikipedia.org/wiki/Bob_Sproull) and Dick Lyon around the turn of 1978 (Conway's accounts give both December 1977 and spring 1978), and it was the file format of MPC79 and of MOSIS.[^cif1980][^mpcadventures][^timeline]

Most of the layout tools of the period were built around λ's integer grid:

- **ICARUS**, a layout editor for PARC's [Alto](https://en.wikipedia.org/wiki/Xerox_Alto) workstation, adapted to λ rules in 1977.[^icarus1978][^timeline]
- **Bristle Blocks** (Caltech, 1979), an early [silicon compiler](https://en.wikipedia.org/wiki/Silicon_compiler) by Dave Johannsen, which aimed to produce "an entire LSI mask set" from a one-page description.[^bristle1979]
- **Caesar** and **KIC**, Berkeley layout editors producing CIF by 1981; Caesar was used to lay out RISC I, RISC II and MIPS.[^cifplot1981][^nrc1999]
- **[Magic](https://en.wikipedia.org/wiki/Magic_(software))** (1984), from [John Ousterhout](https://en.wikipedia.org/wiki/John_Ousterhout)'s group at Berkeley, which re-checked the design rules incrementally as the designer edited.[^magic1984][^magicdrc1984]

Circuit extractors and simulators followed; one at MIT caught bugs in the Scheme-79 chip before fabrication.[^baker1980] Magic is still maintained by Tim Edwards and is used with today's open SKY130 and GF180MCU kits, though its manual notes that "the decreasing use of scalable processes" has made drawing in λ "largely obsolete".[^magicsite][^magicmanual][^openpdks]

(sec-chips)=
## Student λ chips seeded Silicon Graphics, MIPS and SPARC

λ arrived as DARPA's VLSI research programme was growing from under $15 million in 1979 to over $93 million in 1982.[^nrc1999] Its best-known chips were designed by small university teams and fabricated through MPC runs or MOSIS.

```{list-table} Research chips drawn with Mead–Conway λ rules, and where they led.
:header-rows: 1
:class: cards
:widths: 22 40 38

* - Chip
  - What it showed
  - What came next
* - **Scheme-79**, MIT, 1979
  - A Lisp processor on one chip, fabricated in MPC79; grew from a prototype [Guy Steele](https://en.wikipedia.org/wiki/Guy_L._Steele_Jr.) designed in the 1978 course.[^mpcadventures][^scheme1980]
  - Paper: Holloway, Steele, Sussman and Bell, *The SCHEME-79 Chip* (1980).[^scheme1980]
* - **[Geometry Engine](https://en.wikipedia.org/wiki/Geometry_Engine)**, Stanford, 1979–82
  - 3D graphics maths in custom silicon; first prototype on MPC79.[^mpcadventures][^clark1982]
  - [Silicon Graphics](https://en.wikipedia.org/wiki/Silicon_Graphics), founded 1982.[^chmsgi]
* - **[RISC I](https://en.wikipedia.org/wiki/Berkeley_RISC)**, Berkeley, 1981–82
  - About 44,000 transistors on 4–5 µm nMOS (sources differ: 44,420 or 44,500), designed in a graduate course and fabricated through MOSIS.[^chmrisc][^peek1983][^ethw]
  - Sun's [SPARC](https://en.wikipedia.org/wiki/SPARC) processors.[^nrc1999]
* - **[Stanford MIPS](https://en.wikipedia.org/wiki/Stanford_MIPS)**, 1981–84
  - A 32-bit nMOS processor fabricated through MOSIS and on Stanford's own line.[^mipsoh]
  - [MIPS Computer Systems](https://en.wikipedia.org/wiki/MIPS_Computer_Systems), founded 1984.[^nrc1999][^mipsoh]
* - **PSC**, Carnegie Mellon, 1983
  - A programmable [systolic](https://en.wikipedia.org/wiki/Systolic_array) processor, one of a grid of simple cells passing data along, "laid out in nMOS (using Mead-Conway design rules)".[^psc1983]
  - Part of [H. T. Kung](https://en.wikipedia.org/wiki/H._T._Kung)'s systolic-array research.[^psc1983]
```

Beyond the textbook, the key papers are Conway's report on the shared runs, *The MPC Adventures* (1981);[^mpcadventures] Patterson and Séquin's *RISC I: A Reduced Instruction Set VLSI Computer* (1981);[^risc1981] Clark's *The Geometry Engine* (1982), which says the project "probably would not have been carried out" without Conway's support;[^clark1982] and Ousterhout's *Magic: A VLSI Layout System* (1984).[^magic1984]

MIPS also shows where λ's usefulness ended. Its commercial chip, co-founder John Moussouris recalled, "needed to go from NMOS to CMOS, from Mead/Conway design to SRAM-like design", meaning hand-tuned, high-speed circuits.[^mipsoh] λ was excellent for a first working chip, and much less so for a competitive product.

(sec-scmos)=
## SCMOS stretched λ to CMOS, and needed three rulebooks to do it

Through the 1980s the industry moved from nMOS to [CMOS](https://en.wikipedia.org/wiki/CMOS), which pairs two types of transistor, needs **wells** (deep doped regions that host the second type), and soon added several metal layers joined by **vias**. MOSIS answered with **Scalable CMOS (SCMOS)**, "a set of logical layers together with their design rules, which provide a nearly process- and metric-independent interface to many CMOS fabrication processes".[^scmos8] Designers drew in λ, and MOSIS mapped the design onto whichever process was running. Its rules were frank about the trade-off: "SCMOS is there for portability and simplicity. It is NOT there for fine-tuned layout."[^scmos8]

```{table} λ values MOSIS published for each SCMOS rule set. Plain SCMOS rules were written for 1–3 µm processes; the SUBM and DEEP variants changed some rules so that a smaller λ could be used.[^scmos72][^scmos74]
:name: lambda-table
:class: numeric

| Process | λ, SCMOS | λ, SUBM | λ, DEEP |
|---|---|---|---|
| Orbit 2.0 µm | 1.0 µm | not offered | not offered |
| AMI or HP 1.2 µm | 0.6 µm | not offered | not offered |
| HP 0.8 µm | 0.5 µm | 0.4 µm | not offered |
| AMI or HP 0.5 µm | 0.35 µm | 0.30 µm | not offered |
| TSMC 0.35 µm | 0.25 µm | 0.20 µm | not offered |
| TSMC 0.25 µm | not offered | 0.15 µm | 0.12 µm |
| TSMC 0.18 µm | not offered | 0.10 µm | 0.09 µm |
```

The same HP 0.8 µm process had two values of λ, 0.5 µm under the original rules and 0.4 µm under the sub-micron ones. MOSIS made SCMOS_SUBM "by increasing the lambda size for some rules (those that didn't shrink as fast in practice as did the overall scheme of things)", and revised them again into SCMOS_DEEP at 0.25 µm.[^scmos8] The single ruler had become three.

```{raw} html
<figure class="fig wide" id="fig-drift">
  <div class="diagram" data-diagram="drift"></div>
  <noscript><p>Rule values in λ for SCMOS, SUBM and DEEP: poly width 2, 2, 2; metal 1 width 3, 3, 3; poly gap 2, 3, 3; metal 1 gap 2, 3, 3; metal 2 gap 3, 3, 4; gate overhang 2, 2, 2.5; diffusion past gate 3, 3, 4; contact gap 2, 3, 4; via width 2, 2, 3; gap between wells at different voltages 9, 18, 18.</p></noscript>
  <figcaption><strong>Measured in λ, the gaps grew as λ shrank.</strong> Selected MOSIS rules in the original SCMOS, sub-micron (SUBM) and deep sub-micron (DEEP) rule sets. Most minimum widths stayed put while gaps and overlaps grew, so the same circuit needed more λ × λ squares, and DEEP needed half-λ values such as 2.5λ. Data from MOSIS SCMOS rev. 8.00, tables 3a and 3b (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">archived copy</a>).</figcaption>
</figure>
```

(sec-stopped)=
## Below a micron, the rules stopped shrinking together

λ assumed that every rule shrinks by the same factor. As processes went below a micron, several things broke that assumption at once.

**Some rules shrank more slowly than others.** Between the original and deep rule sets, the minimum gap between two contacts went from 2λ to 4λ, and the gap between wells at different voltages from 9λ to 18λ, while poly stayed 2λ wide.[^scmos8] Rounding every rule up to fit one λ wastes area, and area is cost. A Cornell course slide, after the Weste textbook, adds up the **contacted metal pitch**, the centre-to-centre distance of two metal wires that each land on a contact, for a process with λ = 0.5 µm.[^batten]

```{raw} html
<figure class="fig wide" id="fig-pitch">
  <div class="diagram" data-diagram="pitch"></div>
  <noscript><p>Contacted metal pitch at λ = 0.5 µm: λ rules give half a contact 0.5, surround 0.5, metal gap 1.5, surround 0.5, half a contact 0.5, total 3.5 µm; the process's own micron rules give 0.375, 0.5, 1.0, 0.5, 0.375, total 2.75 µm.</p></noscript>
  <figcaption><strong>Theory versus practice: λ rules spend extra space.</strong> The distance between two contacted metal wires, built from its parts, under λ rules (λ = 0.5 µm) and under the same process's own micron rules, drawn to the same scale. The micron rules allow smaller contacts and a narrower metal gap. Values from the breakdown rows of <a href="https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf">Batten, Cornell ECE 6745, slide 21</a> (after Weste, table 3.2), whose summary row gives the λ total as 8λ = 4 µm.</figcaption>
</figure>
```

"Scaled design is legal but much larger than it needs to be!", the slide concludes.[^batten] Industry drew the same conclusion early. In 2014 Synopsys's Marco Casale-Rossi dated λ's main commercial use from the late 1970s to 0.7 µm CMOS in the early 1990s.[^casale2014]

**Integer λ ran out of resolution.** The DEEP rules needed values such as 2.5λ and 1.5λ, and MOSIS's scalable rules required layouts on a half-λ grid.[^scmos8] Once a rule set needs fractions of its own unit, the unit is no longer doing its job.

**New kinds of rule were about area, not widths or gaps.** Each metal layer is polished flat ([chemical-mechanical polishing](https://en.wikipedia.org/wiki/Chemical-mechanical_polishing)), which only works if it is evenly filled, so processes set **density** limits: SKY130 checks metal 1 density over 700 µm squares.[^sky130rules] [**Antenna rules**](https://en.wikipedia.org/wiki/Antenna_effect) cap "the maximum allowed ratio of interconnect area exposed to plasma etch to active gate poly area", because long wires collect charge during etching that can destroy a gate.[^sky130antenna] A rulebook of widths and gaps had no way to say either.

**Lithography went below the wavelength of light.** By 1999, 0.18 µm features were being printed with 0.248 µm ultraviolet light, using tricks such as [optical proximity correction](https://en.wikipedia.org/wiki/Optical_proximity_correction) that deliberately distort the mask so that the printed shape comes out right.[^liebmann2003] IBM's Lars Liebmann reported in 2003 that these techniques "require layout restrictions" that "can not be enforced through 'conventional' design rules", and that "simple (i.e. understandable) design rules are inadequate (misleading)".[^liebmann2003] Whether a shape prints now depends on its neighbours.

**The rulebooks exploded.** Casale-Rossi contrasted Conway's "just two pages" with modern processes needing "several thousands of complex design rules", described in "tens of thousands of lines of code".[^casale2014] *Semiconductor Engineering* reported in 2018 that the count rises steeply again when a single layer is printed in two, three or four exposures, a technique called [multiple patterning](https://en.wikipedia.org/wiki/Multiple_patterning).[^semieng2018]

There was no single day when λ died. MOSIS's scalable rules stop at 0.18 µm, in a document last revised in 2009, and by 2020 Tim Edwards, then at Efabless, wrote that MOSIS "has dropped support" for its SCMOS kits, which "only worked because they used conservative rules that did not reveal manufacturing limits".[^scmos8][^edwards2020] λ lives on in teaching: Harvey Mudd College's *CMOS VLSI Design* course still introduces rules "in terms of λ = f/2", with *f* the feature size.[^harris]

(sec-survived)=
## The shared wafer outlived the ruler

What outlived λ was the service model: designers anywhere sending files to a broker who packs many projects onto shared wafers at a commercial fab. In 2020 Google and [SkyWater](https://en.wikipedia.org/wiki/SkyWater_Technology) released the SKY130 [process design kit](https://en.wikipedia.org/wiki/Process_design_kit) (PDK), the bundle of rules, transistor models and building blocks for a 130 nm process, as open source. Unlike MOSIS's SCMOS, it publishes the factory's exact rules in microns.[^edwards2020]

Those rules show why no λ would fit. Poly must be at least 0.150 µm wide and 0.210 µm apart; metal 1 at least 0.140 µm wide.[^sky130rules] Set λ to half the poly width, 0.075 µm, and the poly gap becomes 2.8λ and the metal width 1.87λ. In the Mead–Conway rules, metal was 50% *wider* than poly; here it is narrower.[^lyon1981][^sky130rules]

Google funded free shared runs on SKY130 and GlobalFoundries' 180 nm process that made 360 designs from more than 600 submissions in 19 countries.[^google2023] [Tiny Tapeout](https://tinytapeout.com/) took sharing further: its first run in 2022 put 152 projects onto one chip.[^tt01] A Tiny Tapeout tile is about 160 × 100 µm and holds about 1,000 logic gates; at λ = 3 µm, <a href="#fig-shrink">the single inverter drawn above</a> would take 84 × 138 µm.[^ttfaq] Its designers write [Verilog](https://en.wikipedia.org/wiki/Verilog) rather than drawing rectangles, and the open-source OpenLane flow turns it into a layout that obeys the micron rules, adding protective "antenna diodes" where needed.[^ttfaq]

The brokers still change, as in the 1980s. Efabless, which ran the Google shuttles, shut down in March 2025; ChipFoundry announced SKY130 runs from that September.[^ttefabless][^chipfoundry] Germany's [IHP](https://en.wikipedia.org/wiki/Innovations_for_High_Performance_Microelectronics) offers free runs on its own open kit, and a relaunched MOSIS 2.0 partnered with [GlobalFoundries](https://en.wikipedia.org/wiki/GlobalFoundries) in July 2026.[^ihp][^mosis2][^aac2026]

Conway's insight was that chip design needed a clean interface between designer and factory, as software has an instruction set. For about twenty years that interface was λ, a conservative ruler that traded area for portability and teachability. When physics made the trade too expensive, the interface moved into per-process kits with exact rules and automated checkers, and the separation of design from manufacturing carried on.

## Further reading

- Lynn Conway, [*Reminiscences of the VLSI Revolution*](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf) (2012), the inventor's own long account.
- Lynn Conway, [*The MPC Adventures*](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf) (1981), the shared-wafer experiments reported at the time.
- National Research Council, [*Funding a Revolution*, chapter 4](https://web.archive.org/web/20260802192522/https://www.nationalacademies.org/read/6323/chapter/6) (1999), on DARPA's VLSI programme and what came out of it.
- Wikipedia: [VLSI Project](https://en.wikipedia.org/wiki/VLSI_Project), [Multi-project wafer service](https://en.wikipedia.org/wiki/Multi-project_wafer_service), [Design rule checking](https://en.wikipedia.org/wiki/Design_rule_checking).

## Sources

[^conway2012]: Lynn Conway, ["Reminiscences of the VLSI Revolution: How a series of failures triggered a paradigm shift in digital design"](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf), *IEEE Solid-State Circuits Magazine* 4(4), 2012, pp. 8–31. DOI [10.1109/MSSC.2012.2215752](https://doi.org/10.1109/MSSC.2012.2215752). Author's copy: [archived](https://web.archive.org/web/20241230111939/https://ai.eecs.umich.edu/people/conway/Memoirs/VLSI/Lynn_Conway_VLSI_Reminiscences.pdf).
[^timeline]: Lynn Conway, ["Reminiscences of the VLSI Revolution: A Timeline of Events"](https://web.archive.org/web/20260721222742/https://ai.eecs.umich.edu/people/conway/Memoirs/VLSI/Timeline/VLSI_Timeline.pdf), December 2012 (archived copy).
[^lyon1981]: Richard F. Lyon, ["Simplified Design Rules for VLSI Layouts"](https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf), Southcon '81, January 1981; also *LAMBDA*, first quarter 1981.
[^mpcadventures]: Lynn Conway, ["The MPC Adventures: Experiences with the Generation of VLSI Design and Implementation Methodologies"](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf), Xerox PARC report VLSI-81-2, January 1981. Journal version: *Microprocessing and Microprogramming* 10(4), 1982, pp. 209–228, DOI [10.1016/0165-6074(82)90054-0](https://doi.org/10.1016/0165-6074(82)90054-0).
[^mpc79doc]: Lynn Conway, Alan Bell, Martin Newell et al., ["MPC79 Implementation Documentation"](https://web.archive.org/web/20231122152953/https://ai.eecs.umich.edu/people/conway/VLSI/MPC79/ImpDoc/ImpDoc79Front.html), Xerox PARC, 1980 (archived copy).
[^cohen1981]: Danny Cohen and George Lewicki, ["MOSIS: The ARPA Silicon Broker"](https://web.archive.org/web/20240829090244/http://caltechconf.library.caltech.edu/219/1/DannyCohen.pdf), Proceedings of the Second Caltech Conference on VLSI, January 1981 (archived copy).
[^isi1984]: USC Information Sciences Institute, ["1984 Annual Technical Report" (ISI/SR-85-150)](https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf), MOSIS chapter, 1985 (archived copy of DTIC ADA157991).
[^nrc1999]: National Research Council, ["Funding a Revolution: Government Support for Computing Research", chapter 4](https://web.archive.org/web/20260802192522/https://www.nationalacademies.org/read/6323/chapter/6), National Academy Press, 1999 (archived copy). DOI [10.17226/6323](https://doi.org/10.17226/6323).
[^viterbi2005]: USC Viterbi School of Engineering, ["MOSIS Free Chips for Students Program Nears Quarter Century Mark"](https://viterbischool.usc.edu/news/2005/05/mosis-free-chips-for-students-program-nears-quarter-century-mark/), May 2005.
[^mosisfab1997]: MOSIS, ["MOSIS Fabrication Schedule"](https://web.archive.org/web/19970717024919/http://www.mosis.org:80/mosis-fab.html), July 1997 (archived copy).
[^mosisvendors2010]: MOSIS, ["Fabrication Vendors"](https://web.archive.org/web/20101226053736/http://www.mosis.com/products/fab/vendors/), December 2010 (archived copy).
[^cmp1981]: PATSTEC, ["Circuit intégré : boîte de masques de circuits multi-projets"](https://www.patstec.fr/pdfgen.php?id=26861), inventory record of Grenoble's 1981 multi-project circuits.
[^das2010]: Carl Das and John McLean, ["EUROCHIP-EUROPRACTICE: 20 Years of Design Support for European Universities"](https://www.mes.tu-darmstadt.de/media/mikroelektronische_systeme/pdf_3/ewme2010/proceedings/others/das_paper.pdf), European Workshop on Microelectronics Education, 2010.
[^dennard1974]: Robert H. Dennard et al., "Design of ion-implanted MOSFET's with very small physical dimensions", *IEEE Journal of Solid-State Circuits* 9(5), October 1974, pp. 256–268. DOI [10.1109/JSSC.1974.1050511](https://doi.org/10.1109/JSSC.1974.1050511).
[^baker1980]: Clark M. Baker, ["Artwork Analysis Tools for VLSI Circuits"](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/mit/lcs/tr/MIT-LCS-TR-0239.pdf), MIT/LCS/TR-239, May 1980.
[^scmos72]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 7.2"](https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html), undated, before March 2000 (university mirror).
[^scmos74]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 7.4"](https://web.archive.org/web/20001002134149/http://www.mosis.org/Technical/Designrules/scmos/scmos-main.html), March 2000 (archived copy).
[^scmos8]: MOSIS, ["MOSIS Scalable CMOS (SCMOS) Design Rules, revision 8.00"](https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html), updated May 2009 (archived copy).
[^cif1980]: Robert Sproull, Richard Lyon and Stephen Trimberger, ["The Caltech Intermediate Form for LSI Layout Description"](https://authors.library.caltech.edu/records/jmrgc-2f168), Caltech Computer Science Technical Report 2686, February 1980.
[^icarus1978]: Douglas G. Fairbairn and James A. Rowson, "ICARUS: An interactive integrated circuit layout program", 15th Design Automation Conference, 1978, pp. 188–192. DOI [10.1109/DAC.1978.1585168](https://doi.org/10.1109/DAC.1978.1585168).
[^bristle1979]: Dave Johannsen, ["Bristle Blocks: A Silicon Compiler"](https://authors.library.caltech.edu/records/1rrxm-n2k44), 16th Design Automation Conference, 1979, pp. 310–313. DOI [10.1109/DAC.1979.1600125](https://doi.org/10.1109/DAC.1979.1600125).
[^cifplot1981]: Daniel T. Fitzpatrick, ["CIFPLOT: Plotting Software for IC Layouts"](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1981/ERL-m-81-96.pdf), UC Berkeley ERL M81/96, December 1981.
[^magic1984]: John K. Ousterhout, Gordon T. Hamachi, Robert N. Mayo, Walter S. Scott and George S. Taylor, "Magic: A VLSI Layout System", 21st Design Automation Conference, 1984, pp. 152–159. DOI [10.1109/DAC.1984.1585789](https://doi.org/10.1109/DAC.1984.1585789).
[^magicdrc1984]: George S. Taylor and John K. Ousterhout, "Magic's Incremental Design-Rule Checker", 21st Design Automation Conference, 1984. DOI [10.1109/DAC.1984.1585790](https://doi.org/10.1109/DAC.1984.1585790).
[^magicmanual]: Magic VLSI, ["Magic Maintainer's Manual #2: The Technology File"](https://opencircuitdesign.com/magic/techref/maint2.html).
[^magicsite]: Open Circuit Design, ["Magic VLSI Layout Tool"](https://opencircuitdesign.com/magic/), project home page.
[^openpdks]: R. Timothy Edwards, ["open_pdks"](https://github.com/RTimothyEdwards/open_pdks), source repository.
[^scheme1980]: Jack Holloway, Guy L. Steele Jr., Gerald Jay Sussman and Alan Bell, ["The SCHEME-79 Chip"](https://dspace.mit.edu/handle/1721.1/6334), MIT AI Memo 559, January 1980.
[^clark1982]: James H. Clark, ["The Geometry Engine: A VLSI Geometry System for Graphics"](https://archive.org/download/bitsavers_sgiirisgeok_1057823/p127-clark.pdf), *Computer Graphics* (SIGGRAPH '82) 16(3), July 1982, pp. 127–133. DOI [10.1145/800064.801272](https://doi.org/10.1145/800064.801272).
[^chmsgi]: Computer History Museum, ["Silicon Graphics"](https://www.computerhistory.org/revolution/computer-graphics-music-and-art/15/219), *Revolution* exhibition.
[^chmrisc]: Computer History Museum, ["RISC I"](https://www.computerhistory.org/revolution/digital-logic/12/286/1591), *Revolution* exhibition.
[^peek1983]: James B. Peek, ["The VLSI Circuitry of RISC I"](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1983/6347.html), UC Berkeley UCB/CSD-83-135, June 1983.
[^ethw]: IEEE, ["Milestones: First RISC (Reduced Instruction-Set Computing) Microprocessor, 1980–1982"](https://ethw.org/Milestones:First_RISC_(Reduced_Instruction-Set_Computing)_Microprocessor_1980-1982), dedicated February 2015.
[^psc1983]: Allan L. Fisher, H. T. Kung, Louis M. Monier and Yasunori Dohi, ["Architecture of the PSC: A Programmable Systolic Chip"](https://www.eecs.harvard.edu/~htk/publication/1983-sigarch-fisher-kung-monier-dohi.pdf), 10th International Symposium on Computer Architecture, 1983.
[^mipsoh]: Computer History Museum, ["Oral History of MIPS Computer Systems Founders" (panel with John Hennessy, John Moussouris, Skip Stritter and others)](https://archive.computerhistory.org/resources/access/text/2012/01/102746197-05-01-acc.pdf), 2011.
[^risc1981]: David A. Patterson and Carlo H. Séquin, ["RISC I: A Reduced Instruction Set VLSI Computer"](https://www.cse.iitk.ac.in/users/biswap/CS422/RISC-ISCA81.pdf), 8th International Symposium on Computer Architecture, May 1981, pp. 443–457.
[^batten]: Christopher Batten, ["T04: Full-Custom Design Methodology"](https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf), Cornell ECE 6745 lecture slides, slide 21 (adapted from MIT 6.371, fall 2002, which cites Weste and Eshraghian, table 3.2).
[^liebmann2003]: Lars Liebmann, ["Layout Impact of Resolution Enhancement Techniques: Impediment or Opportunity?"](https://ispd.cc/ispd2027/slides/2003/07_1_liebmann.pdf), International Symposium on Physical Design, 2003 (slides © 2002 IBM).
[^casale2014]: Marco Casale-Rossi, ["The Heritage of Mead & Conway: What Has Remained the Same, What Has Changed, What Was Missed, and What Lies Ahead"](https://www.uvic.ca/research/transchair/assets/docs/The%20Heritage%20of%20Mead%20and%20Conway.pdf), *Proceedings of the IEEE* 102(2), February 2014, pp. 114–119. DOI [10.1109/JPROC.2013.2295871](https://doi.org/10.1109/JPROC.2013.2295871).
[^semieng2018]: Ed Sperling, ["Design Rule Complexity Rising"](https://semiengineering.com/design-rule-complexity-rising), *Semiconductor Engineering*, April 2018.
[^harris]: David Harris, ["Introduction" (lecture 0)](https://pages.hmc.edu/harris/class/e158/16/lect0.pdf), *CMOS VLSI Design*, Harvey Mudd College E158, 2016, slide 39.
[^edwards2020]: R. Timothy Edwards, ["Google/SkyWater and the Promise of the Open PDK"](https://woset-workshop.github.io/PDFs/2020/a03.pdf), Workshop on Open-Source EDA Technology (WOSET), 2020.
[^sky130rules]: SkyWater, ["SKY130 Periphery Rules"](https://skywater-pdk.readthedocs.io/en/main/rules/periphery.html), rules poly.1a, poly.2, m1.1 and m1.pd.
[^sky130antenna]: SkyWater, ["SKY130 Antenna Rules"](https://skywater-pdk.readthedocs.io/en/main/rules/antenna.html).
[^google2023]: Google Open Source Blog, ["Open source PDKs joining Linux Foundation's CHIPS Alliance"](https://opensource.googleblog.com/2023/11/open-source-pdks-joining-linux-foundation-chips-alliance.html), November 2023.
[^tt01]: Tiny Tapeout, ["TT01 Submitted to Efabless MPW7 Shuttle"](https://tinytapeout.com/news/tt01-launch/), 4 September 2022.
[^ttfaq]: Tiny Tapeout, ["FAQ"](https://tinytapeout.com/faq/), sections on tile size and OpenLane.
[^ttefabless]: Tiny Tapeout, ["Efabless shuts down – Tiny Tapeout will continue"](https://tinytapeout.com/news/efabless-shutsdown/), 1 March 2025.
[^chipfoundry]: Tiny Tapeout, ["ChipFoundry announced as Tiny Tapeout sponsor"](https://tinytapeout.com/news/chipfoundry-sponsor/), 10 May 2025.
[^ihp]: IHP, ["IHP Open Design Library: free MPW runs"](https://ihp-open-designlib.readthedocs.io/en/latest/).
[^mosis2]: USC Information Sciences Institute, ["MOSIS 2.0's First Year: Bridging Research and Production"](https://www.isi.edu/news/972800/mosis-2-0s-first-year-bridging-research-and-production/), February 2025.
[^aac2026]: Luke James, ["MOSIS Partners With GlobalFoundries, Extending 40-Year Prototyping Legacy"](https://www.allaboutcircuits.com/news/mosis-partners-with-globalfoundries-extending-40-year-prototyping-legacy), *All About Circuits*, 22 July 2026.
