---
myst:
  html_meta:
    "description": "How λ design rules let computer scientists design chips, made shared-wafer services such as MOSIS possible, and why they stopped working as processes shrank below a micron."
---

# Drawing chips in λ

```{rst-class} dek
In 1977 Lynn Conway, working with Carver Mead, rewrote the rules of chip layout as multiples of one number, λ. For two decades that number let students and researchers design chips without ever visiting a factory. Then the physics of shrinking stopped cooperating.
```

```{rst-class} byline
Last updated 19 November 2026 · about 20 minutes to read
```

```{rst-class} lead
Every chip starts as a drawing: coloured rectangles, one colour per manufacturing step, that are turned into the [photomasks](https://en.wikipedia.org/wiki/Photomask) used to print the circuit onto silicon. Sending that finished drawing off to be made is called the [tape-out](https://en.wikipedia.org/wiki/Tape-out). The drawing has to obey **design rules**: minimum widths and gaps that keep printed shapes from merging or breaking. In the mid-1970s each factory published its own rules in microns, and a drawing made for one factory was useless at the next.[^conway2012]
```

[Lynn Conway](https://en.wikipedia.org/wiki/Lynn_Conway), a computer architect at [Xerox PARC](https://en.wikipedia.org/wiki/PARC_(company)), replaced those lists with ratios. Every width and gap became a small whole multiple of one length, λ (lambda), which for the factories of the day came to about half the smallest feature they could print.[^conway2012][^harris] To build the same design in a better factory, you changed λ and nothing else. Her memoir credits the idea to her; papers written at the time credit "Mead and Conway", after her collaborator [Carver Mead](https://en.wikipedia.org/wiki/Carver_Mead) of Caltech.[^conway2012][^lyon1981]

:::{admonition} At a glance
- **Why λ was invented:** to separate chip *design* from chip *manufacturing*, so that people outside chip companies could learn to design chips, and their designs would survive the next factory upgrade. [Conway's fix](#sec-ratios)
- **When it was used:** λ was about half the smallest feature, so chips with 6 µm features used λ = 3 µm from 1978, until features of about 0.7 µm in industry in the early 1990s. Universities kept using it through MOSIS, a US chip-making service, down to 0.18 µm features (λ = 0.09 µm) around 2000. [SCMOS](#sec-scmos)
- **Why it stopped:** below about one micron, different rules stopped shrinking at the same rate. One λ either wasted area or needed exceptions, and from the late 1990s printing features smaller than the wavelength of light needed rules that no list of widths and gaps could express. [Why it stopped](#sec-stopped)
:::

(sec-timeline)=
## Timeline

{.timeline}
- [1974]{.yr} IBM's Robert Dennard and colleagues show that shrinking a transistor's dimensions and voltage together makes it faster and more efficient. [→ One drawing, many factories](#sec-shrink)[^dennard1974]
- [1977]{.yr} Conway devises λ-based rules at Xerox PARC while working with Mead's group at Caltech. [→ Conway's fix](#sec-ratios)[^conway2012]
- [1978]{.yr} Conway's MIT course: 19 student projects are fabricated together on one shared chip, at λ = 3 µm. [→ The movement](#sec-movement)[^conway2012]
- [1979]{.yr} Mead and Conway's textbook *Introduction to VLSI Systems* appears (dated 1980). A larger shared run, MPC79, returns chips for 82 projects 29 days after its design deadline. [→ The movement](#sec-movement)[^timeline][^mpcadventures]
- [1981]{.yr} MOSIS, a government-funded "silicon broker", opens at the University of Southern California for designs in λ = 2.5 µm rules; France's CMP makes Grenoble student chips. [→ The brokers](#sec-brokers)[^cohen1981][^isi1984][^cmp1981]
- [1982–87]{.yr} Chips designed this way lead to Silicon Graphics (1982), MIPS Computer Systems (1984) and Sun's SPARC processors (1987). [→ The chips](#sec-chips)[^nrc1999][^chmsgi]
- [1984]{.yr} Berkeley's Magic layout editor checks λ rules while you draw. [→ The software](#sec-tools) ISI checks rules for the newer CMOS chips "scalable from 3 microns to 1.2 microns". [→ SCMOS](#sec-scmos)[^magic1984][^isi1984]
- [Early 1990s]{.yr} Industry's λ era ends at features of about 0.7 µm. [→ The chips](#sec-chips)[^casale2014]
- [1997]{.yr} MOSIS offers a separate sub-micron λ rule set (SUBM), and later a deep sub-micron one (DEEP), because some rules no longer shrink with the rest. [→ SCMOS](#sec-scmos)[^hp1997][^scmos8]
- [1999]{.yr} 0.18 µm features are printed with 0.248 µm light. [→ Why it stopped](#sec-stopped)[^liebmann2003]
- [2000]{.yr} MOSIS maps λ = 0.09 µm onto TSMC's 0.18 µm process, the smallest λ found in its published rules. [→ SCMOS](#sec-scmos)[^scmos74]
- [2020]{.yr} Google and SkyWater publish the SKY130 kit of a factory's exact rules in microns; MOSIS has dropped its λ kits. [→ What outlived λ](#sec-survived)[^edwards2020]
- [2022]{.yr} Tiny Tapeout's first shared chip carries 152 projects. [→ What outlived λ](#sec-survived)[^tt01]
- [2025–26]{.yr} Efabless, which ran Google's free shared runs, shuts down; MOSIS 2.0 partners with GlobalFoundries. [→ What outlived λ](#sec-survived)[^ttefabless][^aac2026]

(sec-before)=
## Before λ, a chip design belonged to one factory

A chip is built up in layers on a [wafer](https://en.wikipedia.org/wiki/Wafer_(electronics)), a thin disc of silicon that carries many copies of the chip at once. Each layer is printed through its own mask: one for regions of [doped](https://en.wikipedia.org/wiki/Doping_(semiconductor)) silicon called **diffusion**, one for [**polysilicon**](https://en.wikipedia.org/wiki/Polycrystalline_silicon) ("poly"), one for **metal** wires, one for the **contact** holes that connect metal down to the layers below. Wherever a poly line crosses diffusion, it forms the gate of a [MOSFET](https://en.wikipedia.org/wiki/MOSFET) transistor. The chips of the late 1970s used [nMOS](https://en.wikipedia.org/wiki/NMOS_logic), which builds everything from one type of transistor.[^lyon1981]

A factory's recipe is called its **process**, named after the smallest feature it can print, usually the transistor's gate length: a "6 µm process" prints gates 6 µm long.[^harris]

Each process had its own rules in microns, and they changed whenever the factory improved. Drawing [layouts](https://en.wikipedia.org/wiki/Integrated_circuit_layout) was a craft practised inside semiconductor companies that both designed and made their chips. Mead had been teaching simplified rules at Caltech, but, Conway wrote, "the resulting layouts were also tied to particular processes, and had to be redone as new processes came online."[^conway2012] A prototype cost about $15,000 to $20,000 in masks and wafers and took three or four months, by Conway's 1981 estimate.[^mpcadventures]

Design rules exist because the factory is imperfect. Each mask is aligned to the layers already on the wafer and is never exactly in place, and printed shapes come out a little wider or narrower than drawn. [Dick Lyon](https://en.wikipedia.org/wiki/Richard_F._Lyon) of Xerox PARC described λ as a bound on both errors, so that in the worst case edges on two different masks can end up 2λ away from where they were drawn.[^lyon1981] A transistor's gate therefore overhangs the diffusion it crosses by 2λ: if it overhung by less, a small slip would leave a strip of diffusion running past the gate, connecting the transistor's two ends permanently.[^lyon1981]

```{raw} html
<figure class="fig" id="fig-misalign">
  <div class="diagram" data-diagram="misalign"><noscript><p>A poly gate crossing a diffusion strip. With a 2λ overhang the gate still cuts the diffusion after a mask shift of up to 2λ; with a 0.5λ overhang, a shift of 0.75λ leaves a sliver of diffusion that shorts source to drain.</p></noscript></div>
  <figcaption><strong>Masks never line up perfectly.</strong> A polysilicon gate (red) crossing diffusion (green) makes a transistor. Drag the slider to shift the poly mask. With the 2λ overhang from the rules, the gate keeps cutting the diffusion for any shift up to 2λ; with 0.5λ, a small slip opens a leak path that shorts source to drain. Overhang rule from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon, "Simplified Design Rules for VLSI Layouts" (1981)</a>.</figcaption>
</figure>
```

(sec-ratios)=
## Conway's fix: every rule as a multiple of λ

Conway's idea, in spring 1977, was to express every rule as a ratio. "MOS design rules should not be framed as sets of lengths but as sets of ratios of lengths," she recalled in 2012. "Such dimensionless rules could then be scaled to any process as multiples of a basic length unit in microns, a unit I called Lambda (λ)."[^conway2012] She found the largest of a process's minimum widths, gaps, extensions and overlaps, set λ to half of it, and wrote each rule as a small whole number of λ. The final rule set "remained small at only two pages in length, easy to teach, learn, apply, and check."[^conway2012]

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

Lyon summarised the logic as two "meta-rules": moving an edge relative to another by less than 2λ "should not be obviously fatal", and moving it by less than 1λ "should not cause significant degradation in performance."[^lyon1981] Even in 1981 some things refused to fit: the pads where bonding wires attach to the chip stayed about 100 µm across whatever λ was.[^lyon1981]

The whole-number rules also made layout software far simpler. Shapes could sit on an integer λ grid with only horizontal and vertical edges, which Conway noted made editors and checking tools "greatly simplified and speeded-up".[^conway2012]

(sec-shrink)=
## One drawing, many factories

A λ layout is a drawing in abstract units. To make it, every coordinate is multiplied by the λ of the chosen process. The first course chips in 1978 used λ = 3 µm, the MPC79 run a year later λ = 2.5 µm, and by the 1990s university chip services were mapping the same kind of drawing onto [CMOS](https://en.wikipedia.org/wiki/CMOS) processes, which use two types of transistor, with λ of 0.6 µm and below.[^conway2012][^scmos72]

```{raw} html
<figure class="fig wide" id="fig-shrink">
  <div class="diagram" data-diagram="shrink" data-procs='[
    {"label":"MIT course, 6 µm nMOS (1978)","short":"6 µm","lambda":3},
    {"label":"MPC79, 5 µm nMOS (1979)","short":"5 µm","lambda":2.5},
    {"label":"Orbit 2.0 µm CMOS via MOSIS (1990s)","short":"2 µm","lambda":1.0,"node":2},
    {"label":"AMI or HP 1.2 µm CMOS via MOSIS (1990s)","short":"1.2 µm","lambda":0.6,"node":1.2},
    {"label":"AMI or HP 0.5 µm CMOS via MOSIS (1990s)","short":"0.5 µm","lambda":0.35,"node":0.5},
    {"label":"TSMC 0.35 µm CMOS via MOSIS (1990s)","short":"0.35 µm","lambda":0.25,"node":0.35}
  ]'><noscript><p>A simplified inverter that is 28λ × 46λ: at λ = 3 µm it measures 84 × 138 µm, taller than a 160 × 100 µm Tiny Tapeout tile; at λ = 0.25 µm it measures 7 × 11.5 µm.</p></noscript></div>
  <div class="legend"><span style="--c:var(--l-well)">n-well (CMOS only, explained below)</span><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact</span></div>
  <figcaption><strong>The drawing never changes; only λ does.</strong> Left: a simplified inverter (a NOT gate) drawn in λ units. Right: the same drawing at true size for six processes, next to a 10 µm scale bar and a 160 × 100 µm <a href="https://tinytapeout.com/faq/">Tiny Tapeout</a> tile; when the cell becomes a speck, an enlarged copy appears beside it. The inverter is drawn as CMOS, the later standard; the 1978–79 chips were nMOS. λ values from <a href="https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf">Conway (2012)</a> and <a href="https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html">MOSIS SCMOS rules rev. 7.2</a>.</figcaption>
</figure>
```

The bet behind λ was that a factory's errors would shrink in step with its features: better lithography would bring tighter alignment and sharper edges at the same rate, so a drawing scaled by the same factor would still print correctly.[^lyon1981]

Shrinking was worth chasing for a separate reason. In 1974 [Robert Dennard](https://en.wikipedia.org/wiki/Robert_H._Dennard)'s group at IBM had shown that scaling a transistor's dimensions and voltage together made it faster and lower-power at the same power density, the principle now called [Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling).[^dennard1974] With density "doubling roughly every two years" ([Moore's law](https://en.wikipedia.org/wiki/Moore%27s_law)), Conway reasoned, a layout that could move to the next process beat one hand-squeezed for this one.[^conway2012]

The price was area. Each rule was rounded up to a whole number of λ that was safe on every process it might meet, and a 1980 MIT thesis called the Mead–Conway rules "very conservative".[^baker1980] Conway accepted that on purpose, as the cost of rules that newcomers could learn.[^conway2012]

(sec-movement)=
## A textbook and a course turned λ into a movement

Mead and Conway wrote the method up as *Introduction to VLSI Systems*, [VLSI](https://en.wikipedia.org/wiki/Very-large-scale_integration) meaning "very-large-scale integration". Drafts printed at PARC were used in courses at Caltech and Berkeley from October 1977, and Addison-Wesley published the book in time for the autumn 1979 courses, with a 1980 date in the imprint.[^timeline][^conway2012] It eventually sold around 70,000 copies.[^conway2012]

Conway's autumn 1978 course at [MIT](https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology) proved that students could get working chips. The class had 32 students, and on 6 December its 19 projects were sent over the [ARPANET](https://en.wikipedia.org/wiki/ARPANET) to PARC and merged into one shared chip. Micro Mask made the masks with an [electron-beam](https://en.wikipedia.org/wiki/Electron-beam_lithography) machine, and [Hewlett-Packard](https://en.wikipedia.org/wiki/Hewlett-Packard)'s research lab ran the wafers on a 6 µm nMOS process, λ = 3 µm. Packaged chips were shipped back on 18 January 1979.[^conway2012]

**MPC79** ("multi-project chip, 1979") scaled the experiment up: 124 designers at about a dozen universities submitted 82 projects by a 4 December deadline. PARC merged them onto 12 chip types, and HP fabricated them on a 5 µm nMOS process (λ = 2.5 µm). Packaged chips went back to every designer 29 days after the deadline, at a cost per project "on the order of a few hundred dollars", against $15,000 to $20,000 for a conventional prototype.[^mpcadventures][^conway2012] The next run, MPC580 in spring 1980, carried 171 projects from 15 organisations.[^conway2012]

Mead coined "the 'Tall Thin Man'" for "system designers like Johannsen who used our exploratory methods"; Conway noted that the image left out women engineers, herself included.[^conway2012] Within two years, 120 universities were teaching [Mead–Conway](https://en.wikipedia.org/wiki/Mead%E2%80%93Conway_VLSI_chip_design_revolution) courses.[^timeline][^conway2012]

(sec-brokers)=
## Brokers, not universities, got the chips made

The chips were made by a **broker** that collected many designs, packed them onto [shared wafers](https://en.wikipedia.org/wiki/Multi-project_wafer_service) and paid one factory, or **fab**, for the whole run, so that the cost of masks and wafer processing was divided among the designs;[^isi1984]

```{raw} html
<figure class="fig" id="fig-wafer">
  <div class="diagram" data-diagram="wafer"><noscript><p>Left: a wafer covered by repeated copies of one design. Right: a multi-project wafer, where each repeated exposure carries four different projects.</p></noscript></div>
  <figcaption><strong>A multi-project wafer splits one run among many designs.</strong> A wafer is printed by repeating one exposure (outlined) across its surface. Filling each exposure with several small projects instead of one product shares the cost of masks and processing among them. Schematic, not to scale; cost model from the <a href="https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf">USC/ISI 1984 annual report</a>.</figcaption>
</figure>
```

At PARC, Alan Bell and [Martin Newell](https://en.wikipedia.org/wiki/Martin_Newell_(computer_scientist)) built the MPC79 "implementation system" in 1979, software that took designs by electronic message and fed them to mask makers and fabs.[^mpc79doc] In spring 1980 PARC handed the system to [Danny Cohen](https://en.wikipedia.org/wiki/Danny_Cohen_(computer_scientist)) and [Keith Uncapher](https://en.wikipedia.org/wiki/Keith_Uncapher) at the [USC Information Sciences Institute](https://en.wikipedia.org/wiki/Information_Sciences_Institute), and the resulting service, **[MOSIS](https://en.wikipedia.org/wiki/MOSIS)** (the MOS Implementation Service), began operating in January 1981 with [DARPA](https://en.wikipedia.org/wiki/DARPA) funding.[^conway2012][^isi1984]

Cohen credited the idea of a "silicon broker" to Carver Mead.[^cohen1981] λ was what made it practical. MOSIS aimed "to totally isolate the designer from all the trivia that fabrication requires", Cohen and George Lewicki wrote, and in 1981 it supported "nMOS with the Mead-Conway design rules" at "lambda equals 2.5 microns".[^cohen1981] MOSIS told factories its rules rather than asking for theirs: "We say, 'Those are OUR design rules. Do you support them?'" Once given a file, MOSIS could "change lambda a little bit, but not a lot. If a big change of lambda is necessary, the designer has to make the changes."[^cohen1981]

By 1984 MOSIS reported that "at least 20 vendors" could make nMOS chips to the Mead–Conway rules, at 3 µm and 4 µm, with costs cut by one to two orders of magnitude by sharing wafers.[^isi1984] It ran 258 projects in 1981 and 1,880 in 1989, for users at more than 360 institutions.[^nrc1999] Class projects were made free, and by 2005 MOSIS had prototyped more than 50,000 designs.[^viterbi2005] Its factories changed over the years, from HP to Orbit Semiconductor, [AMI](https://en.wikipedia.org/wiki/American_Microsystems), [TSMC](https://en.wikipedia.org/wiki/TSMC), IBM and others.[^mosisfab1997][^mosisvendors2010]

Europe built its own brokers: France's CMP made Grenoble student chips in 1981, followed by EUROCHIP (1989) and EUROPRACTICE (1995).[^cmp1981][^das2010]

(sec-tools)=
## The software grew up around the λ grid

The designs travelled as **CIF**, the [Caltech Intermediate Form](https://en.wikipedia.org/wiki/Caltech_Intermediate_Form): a plain-text list of boxes and wires on each layer, in units of 0.01 µm. Its 2.0 version was written by [Bob Sproull](https://en.wikipedia.org/wiki/Bob_Sproull) and Dick Lyon between December 1977 and spring 1978, and it was the file format of MPC79 and of MOSIS.[^cif1980][^mpcadventures][^timeline]

Layout tools of the period included:

- **ICARUS**, a layout editor for PARC's [Alto](https://en.wikipedia.org/wiki/Xerox_Alto) workstation, adapted to λ rules in 1977.[^icarus1978][^timeline]
- **Bristle Blocks** (Caltech, 1979), an early [silicon compiler](https://en.wikipedia.org/wiki/Silicon_compiler) by Dave Johannsen, which aimed to produce "an entire LSI mask set" from a one-page description.[^bristle1979]
- **Caesar** and **KIC**, Berkeley layout editors producing CIF by 1981; Caesar was used to lay out RISC I, RISC II and MIPS.[^cifplot1981][^nrc1999]
- **[Magic](https://en.wikipedia.org/wiki/Magic_(software))** (1984), from [John Ousterhout](https://en.wikipedia.org/wiki/John_Ousterhout)'s group at Berkeley, which re-ran [design rule checking](https://en.wikipedia.org/wiki/Design_rule_checking) incrementally as the designer edited.[^magic1984][^magicdrc1984]

Circuit extractors and simulators followed; one at MIT caught bugs in the Scheme-79 chip before fabrication.[^baker1980] Magic is still maintained by Tim Edwards and is used with today's open process kits (described below), though its manual notes that "the decreasing use of scalable processes" has made drawing in λ "largely obsolete".[^magicsite][^magicmanual][^openpdks]

```{raw} html
<figure class="fig" id="fig-flow">
  <ol class="flow">
    <li><strong>Draw</strong> the layout on a λ grid in an editor such as Caesar (later Magic).</li>
    <li><strong>Scale and export:</strong> multiply by λ and write a CIF text file in absolute units.</li>
    <li><strong>Submit</strong> the file to MOSIS by ARPANET or email.</li>
    <li><strong>Merge:</strong> MOSIS places projects onto shared chips and the chips onto wafers, matched to a factory that accepts its rules.</li>
    <li><strong>Masks:</strong> MOSIS converts the geometry for a mask maker, and the first masks are made (4 days at best).</li>
    <li><strong>Wafers:</strong> the fab processes them (5 days at best); MOSIS accepts them (1 day).</li>
    <li><strong>Package and ship</strong> the chips back (8 days at best). Best case about 18 days in all; MOSIS quoted four to six weeks for standard runs.</li>
  </ol>
  <figcaption><strong>A λ tape-out through MOSIS in the mid-1980s.</strong> Day counts and the four-to-six-week figure are from the <a href="https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf">USC/ISI 1984 annual report</a>; MOSIS's later rules confirm files arrived "always in absolute metric units — never in lambda units" (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">SCMOS rev. 8.00</a>).</figcaption>
</figure>
```

(sec-chips)=
## Student λ chips seeded Silicon Graphics, MIPS and SPARC

λ arrived as DARPA's [VLSI research programme](https://en.wikipedia.org/wiki/VLSI_Project) was growing from under $15 million in 1979 to over $93 million in 1982.[^nrc1999] Its best-known λ chips were designed by small university teams and fabricated through MPC runs or MOSIS.[^mpcadventures][^nrc1999]

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
  - About 44,000 transistors on 4–5 µm nMOS (sources differ: 44,420 or 44,500), designed in a graduate course and fabricated through MOSIS.[^chmrisc][^peek1983][^ethw]
  - Sun's [SPARC](https://en.wikipedia.org/wiki/SPARC) processors (1987).[^nrc1999]
* - **[Stanford MIPS](https://en.wikipedia.org/wiki/Stanford_MIPS)**, 1981–84
  - A 32-bit nMOS processor from [John Hennessy](https://en.wikipedia.org/wiki/John_L._Hennessy)'s group, fabricated through MOSIS and on Stanford's own line.[^mipsoh]
  - [MIPS Computer Systems](https://en.wikipedia.org/wiki/MIPS_Computer_Systems), founded 1984.[^nrc1999][^mipsoh]
```

Beyond the textbook, the key papers are Conway's report on the shared runs, *The MPC Adventures* (1981);[^mpcadventures] [Patterson](https://en.wikipedia.org/wiki/David_Patterson_(computer_scientist)) and [Séquin](https://en.wikipedia.org/wiki/Carlo_H._S%C3%A9quin)'s *RISC I: A Reduced Instruction Set VLSI Computer* (1981);[^risc1981] [Clark](https://en.wikipedia.org/wiki/James_H._Clark)'s *The Geometry Engine* (1982), which says the project "probably would not have been carried out" without Conway's support;[^clark1982] and Ousterhout's *Magic: A VLSI Layout System* (1984).[^magic1984]

MIPS also shows where λ's usefulness ended. Its commercial chip, co-founder John Moussouris recalled, "needed to go from NMOS to CMOS, from Mead/Conway design to SRAM-like design. You know, very high speed, balanced path, dynamic circuits."[^mipsoh]

Industry used λ too. In 2014 [Synopsys](https://en.wikipedia.org/wiki/Synopsys)'s Marco Casale-Rossi wrote that λ rules "have been used to design the layout of ICs for more than a decade, from 3-µm" nMOS "of the late 1970s to 0.7-µm" CMOS "of the early 1990s", and that they raised layout productivity "from a handful of transistors a day to several hundred".[^casale2014]

(sec-scmos)=
## SCMOS stretched λ to CMOS, and needed three rulebooks to do it

Through the 1980s the industry moved from nMOS to CMOS, which needs **wells** (deep doped regions that host the second transistor type) and soon added several metal layers joined by **vias**. By 1984 ISI was checking CMOS rules "scalable from 3 microns to 1.2 microns", written by Don Trotter of the University of Mississippi.[^isi1984] The rule set it settled on, **Scalable CMOS (SCMOS)**, was "a set of logical layers together with their design rules, which provide a nearly process- and metric-independent interface to many CMOS fabrication processes".[^scmos8] Its rules were frank about the trade-off: "SCMOS is there for portability and simplicity. It is NOT there for fine-tuned layout."[^scmos8]

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

The same HP 0.8 µm process had two values of λ, 0.5 µm under the original rules and 0.4 µm under the sub-micron ones. MOSIS made SCMOS_SUBM "by increasing the lambda size for some rules (those that didn't shrink as fast in practice as did the overall scheme of things)", offered by 1997, and revised them again into SCMOS_DEEP at 0.25 µm; by 2000 it mapped λ = 0.09 µm onto TSMC's 0.18 µm process.[^scmos8][^hp1997][^scmos74] The single ruler had become three. Below a micron, λ was no longer half the process name either: on 0.5 µm processes plain SCMOS used λ = 0.35 µm, so a minimum gate was drawn 0.7 µm long.[^scmos8]

```{raw} html
<figure class="fig wide" id="fig-drift">
  <div class="diagram" data-diagram="drift"><noscript><p>Rule values in λ for SCMOS, SUBM and DEEP: poly width 2, 2, 2; metal 1 width 3, 3, 3; poly gap 2, 3, 3; metal 1 gap 2, 3, 3; metal 2 gap 3, 3, 4; gate overhang 2, 2, 2.5; diffusion past gate 3, 3, 4; contact gap 2, 3, 4; via width 2, 2, 3; gap between wells at different voltages 9, 18, 18.</p></noscript></div>
  <figcaption><strong>Measured in λ, the gaps grew as λ shrank.</strong> Selected MOSIS rules in the original SCMOS, sub-micron (SUBM) and deep sub-micron (DEEP) rule sets. In the rules shown, widths mostly stayed put while gaps and overlaps grew, so the same circuit needed more λ × λ squares, and DEEP needed half-λ values such as 2.5λ. Data from MOSIS SCMOS rev. 8.00, tables 3a and 3b (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">archived copy</a>).</figcaption>
</figure>
```

(sec-stopped)=
## Below a micron, the rules stopped shrinking together

λ assumed that "all manufacturing dimensions scale equally", which a Cornell course slide says holds only over "some modest span of time".[^batten] Below a micron, several things broke it at once.

**Some rules shrank more slowly than others.** Between the original and deep rule sets, the minimum gap between two contacts went from 2λ to 4λ, and the gap between wells at different voltages from 9λ to 18λ, while poly stayed 2λ wide.[^scmos8] The same slide, based on Neil Weste's CMOS design textbook, adds up the **contacted metal pitch**, the centre-to-centre distance of two metal wires that each land on a contact, for a process with λ = 0.5 µm.[^batten]

```{raw} html
<figure class="fig wide" id="fig-pitch">
  <div class="diagram" data-diagram="pitch"><noscript><p>Contacted metal pitch at λ = 0.5 µm: λ rules give half a contact 0.5, surround 0.5, metal gap 1.5, surround 0.5, half a contact 0.5, total 3.5 µm; the process's own micron rules give 0.375, 0.5, 1.0, 0.5, 0.375, total 2.75 µm.</p></noscript></div>
  <figcaption><strong>Theory versus practice: λ rules spend extra space.</strong> The distance between two contacted metal wires, built from its parts, under λ rules (λ = 0.5 µm) and under the same process's own micron rules, drawn to the same scale. The micron rules allow smaller contacts and a narrower metal gap. Values from <a href="https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf">Batten, Cornell ECE 6745, slide 21</a> (after Weste, table 3.2), whose totals are 7λ = 3.5 µm and 2.75 µm.</figcaption>
</figure>
```

"Scaled design is legal but much larger than it needs to be!", the slide concludes.[^batten]

**Integer λ ran out of resolution.** The DEEP rules needed values such as 2.5λ and 1.5λ, so layouts had to sit on a half-λ grid and the unit was no longer whole.[^scmos8]

**New kinds of rule were about area, not widths or gaps.** Each metal layer is polished flat ([chemical-mechanical polishing](https://en.wikipedia.org/wiki/Chemical-mechanical_polishing)), which only works if it is evenly filled, so processes set **density** limits: SKY130 checks metal 1 density over 700 µm squares.[^sky130rules] [**Antenna rules**](https://en.wikipedia.org/wiki/Antenna_effect) cap "the maximum allowed ratio of interconnect area exposed to plasma etch to active gate poly area", because long wires collect charge during etching that can destroy a gate.[^sky130antenna]

**Lithography went below the wavelength of light.** Chips are printed by [photolithography](https://en.wikipedia.org/wiki/Photolithography), projecting the mask with light. By 1999, 0.18 µm features were printed with 0.248 µm ultraviolet light (a wavelength, unrelated to the layout λ), helped by [optical proximity correction](https://en.wikipedia.org/wiki/Optical_proximity_correction), which deliberately distorts the mask so that the printed shape comes out right.[^liebmann2003] For smaller features, IBM's Lars Liebmann reported in 2003, the stronger tricks needed "require layout restrictions", and "simple (i.e. understandable) design rules are inadequate (misleading)".[^liebmann2003]

**The rulebooks exploded.** Casale-Rossi contrasted Conway's "just two pages" with modern processes needing "several thousands of complex design rules", described in "tens of thousands of lines of code".[^casale2014] *Semiconductor Engineering* reported in 2018 that the count rises steeply again when a single layer is printed in two, three or four exposures, a technique called [multiple patterning](https://en.wikipedia.org/wiki/Multiple_patterning).[^semieng2018]

There was no single day when λ died. MOSIS's scalable rules stop at 0.18 µm, in a document last revised in 2009, and by 2020 Tim Edwards, then at Efabless, wrote that MOSIS "has dropped support" for its SCMOS kits, which "only worked because they used conservative rules that did not reveal manufacturing limits".[^scmos8][^edwards2020] λ lives on in teaching: Harvey Mudd College's *CMOS VLSI Design* course still introduces rules "in terms of λ = f/2", with *f* the feature size.[^harris]

(sec-survived)=
## The shared wafer outlived the ruler

What outlived λ was the shared-wafer broker, now working from each factory's exact rules.[^edwards2020] In 2020 Google and [SkyWater](https://en.wikipedia.org/wiki/SkyWater_Technology) released the SKY130 [process design kit](https://en.wikipedia.org/wiki/Process_design_kit) (PDK), the bundle of rules, transistor models and building blocks for a 130 nm process, as open source. Unlike MOSIS's SCMOS, it publishes the factory's exact rules in microns.[^edwards2020]

Those rules show why no λ would fit. Poly must be at least 0.150 µm wide and 0.210 µm apart; metal 1 at least 0.140 µm wide.[^sky130rules] Set λ to half the poly width, 0.075 µm, and the poly gap becomes 2.8λ and the metal width 1.87λ. In the Mead–Conway rules, metal was 50% *wider* than poly; here it is narrower.[^lyon1981][^sky130rules]

Google funded free shared runs ("shuttles") on SKY130 and GlobalFoundries' 180 nm process that made 360 designs from more than 600 submissions in 19 countries.[^google2023] [Tiny Tapeout](https://tinytapeout.com/) took sharing further: its first run in 2022 put 152 projects onto one chip.[^tt01] Since its fourth run a Tiny Tapeout tile has been about 160 × 100 µm and holds about 1,000 logic gates; at λ = 3 µm, the <a href="#fig-shrink">28λ × 46λ inverter</a> alone would take 84 × 138 µm.[^ttfaq] Its designers write [Verilog](https://en.wikipedia.org/wiki/Verilog) rather than drawing rectangles, and the open-source OpenLane flow turns it into a layout that obeys the micron rules, adding protective "antenna diodes" where needed.[^ttfaq]

The brokers still change, as in the 1980s: Efabless shut down in March 2025, and a relaunched MOSIS 2.0 partnered with [GlobalFoundries](https://en.wikipedia.org/wiki/GlobalFoundries) in July 2026.[^ttefabless][^aac2026]

"We had defined a clean interface between design and fab," Conway wrote.[^conway2012] For about twenty years that interface was λ, a conservative ruler that gave up area for "portability and simplicity".[^scmos8] Today it is a process design kit holding the factory's exact rules.[^edwards2020]

## Further reading

- Lynn Conway, [*Reminiscences of the VLSI Revolution*](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf) (2012), Conway's own long account.
- Lynn Conway, [*The MPC Adventures*](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf) (1981), the shared-wafer experiments reported at the time.
- National Research Council, [*Funding a Revolution*, chapter 4](https://web.archive.org/web/20260802192522/https://www.nationalacademies.org/read/6323/chapter/6) (1999), on DARPA's VLSI programme and what came out of it.

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
[^hp1997]: MOSIS, ["HP CMOS14TB Technology"](https://web.archive.org/web/19970717030547/http://www.mosis.org:80/html/hp-cmos14tb-tech.html), 1997 (archived copy).
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
[^mipsoh]: Computer History Museum, ["Oral History of MIPS Computer Systems Founders" (panel with John Hennessy, John Moussouris, Skip Stritter and others)](https://archive.computerhistory.org/resources/access/text/2012/01/102746197-05-01-acc.pdf), 2011.
[^risc1981]: David A. Patterson and Carlo H. Séquin, ["RISC I: A Reduced Instruction Set VLSI Computer"](https://www.cse.iitk.ac.in/users/biswap/CS422/RISC-ISCA81.pdf), 8th International Symposium on Computer Architecture, May 1981, pp. 443–457.
[^batten]: Christopher Batten, ["T04: Full-Custom Design Methodology"](https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf), Cornell ECE 6745 lecture slides, slide 21 (adapted from MIT 6.371, fall 2002, which cites Weste and Eshraghian, table 3.2).
[^liebmann2003]: Lars Liebmann, ["Layout Impact of Resolution Enhancement Techniques: Impediment or Opportunity?"](https://ispd.cc/slides/2003/07_1_liebmann.pdf), International Symposium on Physical Design, 2003 (slides © 2002 IBM).
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
[^aac2026]: Luke James, ["MOSIS Partners With GlobalFoundries, Extending 40-Year Prototyping Legacy"](https://www.allaboutcircuits.com/news/mosis-partners-with-globalfoundries-extending-40-year-prototyping-legacy), *All About Circuits*, 22 July 2026.
