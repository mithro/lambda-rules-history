---
myst:
  html_meta:
    "description": "How Lynn Conway's λ design rules let computer scientists design chips, created the MOSIS shared-wafer service, and why they stopped working below about a quarter of a micron."
---

# Drawing chips in λ

```{rst-class} dek
In 1977 Lynn Conway rewrote the rules of chip layout as multiples of one number, λ. For twenty years that number let students, professors and start-ups design chips without ever visiting a factory. Then physics stopped cooperating.
```

```{rst-class} byline
A history of lambda design rules, from Xerox PARC to Tiny Tapeout
```

```{rst-class} lead
Every chip starts as a drawing: coloured rectangles, one colour per manufacturing step, that become the [photomasks](https://en.wikipedia.org/wiki/Photomask) used to print the circuit onto silicon. The drawing has to obey a list of **design rules**, minimum widths and gaps that keep the printed shapes from merging or breaking. In the mid-1970s every factory had its own list, measured in microns, and a design drawn for one factory was useless at the next. Lynn Conway, a computer architect at [Xerox PARC](https://en.wikipedia.org/wiki/PARC_(company)), replaced those lists with a short set of ratios: every width and gap became a small multiple of a single length she called λ (lambda).[^conway2012]
```

That one change did three things. Chip layouts became portable, because moving to a newer factory meant changing one number rather than redrawing. Chip design became teachable, because two pages of rules fit in a semester course. And chips from many different designers could be merged onto one shared wafer, because they all followed the same rules. Out of that came the 1980 textbook *Introduction to VLSI Systems*, the shared-wafer service [MOSIS](https://en.wikipedia.org/wiki/MOSIS), and research chips that turned into Silicon Graphics, MIPS and SPARC.[^nrc1999]

:::{admonition} At a glance
- **Why λ was invented:** to separate chip *design* from chip *manufacturing*, so that people outside chip companies could design chips and their designs would survive the next process shrink.[^conway2012]
- **When it was used:** from 6 µm nMOS chips in 1978 (λ = 3 µm) to roughly 0.25–0.18 µm CMOS around 2000 (λ = 0.12–0.09 µm), mostly by universities and research labs through MOSIS.[^conway2012][^scmos8]
- **Why it stopped:** below about 1 µm the different rules stopped shrinking at the same rate. A single λ either wasted area or forced exceptions, and from the late 1990s lithography needed rules that no list of simple widths and gaps could express.[^scmos8][^liebmann2003]
:::

## Timeline

{.timeline}
- [1974]{.yr} Robert Dennard's group at IBM shows that shrinking every dimension of a transistor by the same factor makes it faster and lower-power. This is the physics that λ relies on.[^dennard1974]
- [1975]{.yr} Conway meets [Carver Mead](https://en.wikipedia.org/wiki/Carver_Mead) of Caltech; PARC and Caltech start working together on how to design complex chips.[^conway2012]
- [1977]{.yr} Conway invents λ-based design rules at PARC.[^conway2012]
- [1978]{.yr} Conway teaches the first λ-based chip design course at MIT; 19 student projects are fabricated on one shared chip.[^conway2012]
- [1979]{.yr} *Introduction to VLSI Systems* is published. MPC79 fabricates 82 projects from 12 universities in 29 days.[^timeline][^conway2012]
- [1981]{.yr} MOSIS opens at the University of Southern California's Information Sciences Institute, running λ = 2.5 µm nMOS.[^cohen1981][^isi1984]
- [1981–84]{.yr} Research chips designed this way (RISC I, the Geometry Engine, MIPS) lead to SPARC, Silicon Graphics and MIPS Computer Systems.[^nrc1999]
- [1984]{.yr} The Magic layout editor from Berkeley builds λ into its grid and its design-rule checker.[^magic1984]
- [1989]{.yr} MOSIS runs 1,880 projects in one year.[^nrc1999]
- [~1990s]{.yr} MOSIS's Scalable CMOS (SCMOS) rules spawn "sub-micron" and "deep" variants because some rules no longer shrink with the rest.[^scmos8]
- [2000]{.yr} SCMOS DEEP rules map λ = 0.09 µm onto TSMC's 0.18 µm process, the smallest λ MOSIS published.[^scmos74]
- [2009]{.yr} Last revision of the SCMOS rules.[^scmos8]
- [2020]{.yr} Google and SkyWater publish the open SKY130 process design kit, with rules in absolute microns, not λ.[^edwards2020]

## Before λ, a chip design belonged to one factory

A chip is built up in layers. Each layer is patterned through its own mask: one for the regions of doped silicon called **diffusion** (or "active"), one for **polysilicon** (the material of transistor gates), one for **metal** wires, one for the **contact** holes that connect metal down to the layers below, and so on. Wherever a polysilicon line crosses a diffusion region, the result is a [MOSFET](https://en.wikipedia.org/wiki/MOSFET) transistor. A layout is a drawing of these overlapping shapes, viewed from above, and [integrated circuit layout](https://en.wikipedia.org/wiki/Integrated_circuit_layout) was, until the late 1970s, a craft practised mostly inside semiconductor companies.

Design rules exist because the factory is imperfect. Each mask is aligned to the ones before it, and the alignment is never exact; printed shapes also come out a little wider or narrower than drawn. Dick Lyon, a colleague of Conway's at PARC, described λ as a bound on exactly these two errors: how far a printed edge can wander from where it was drawn, and how far one mask can be misaligned from another.[^lyon1981] The interactive figure shows why a transistor's gate must overhang the diffusion it crosses.

```{raw} html
<figure class="fig">
  <div class="diagram" data-diagram="misalign"></div>
  <figcaption><strong>Masks never line up perfectly.</strong> A polysilicon gate (red) crossing a strip of diffusion (green) makes a transistor. Drag the slider to misalign the polysilicon mask. With the rule's 2λ overhang the gate keeps cutting the diffusion; with a 0.5λ overhang a small shift leaves a sliver of diffusion that shorts source to drain. Overhang value from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon (1981)</a>.</figcaption>
</figure>
```

Before λ, each fabrication line published its own rules as absolute lengths, and they changed whenever the line improved. Carver Mead had been teaching simplified rules at Caltech, but, as Conway later put it, "the resulting layouts were also tied to particular processes, and had to be redone as new processes came online."[^conway2012] Rules were also often treated as confidential, part of what Lyon called the "vertically integrated" paradigm, in which the people who designed chips and the people who made them worked for the same company.[^lyon1981]

The cost of a prototype reflected that. In 1981 Conway estimated that masks and wafer fabrication for one prototype design cost about $15,000 to $20,000 and took three or four months.[^mpcadventures] A computer science department had no way in.

## Conway's fix: every rule as a multiple of λ

In spring 1977 Conway asked a different question. Instead of listing every rule in microns, she looked for the single largest of the minimum widths, gaps, extensions and overlaps a process needed, and used it as a unit. "Suddenly it beamed down to me," she wrote in 2012: "MOS design rules should not be framed as sets of lengths but as sets of ratios of lengths. Such dimensionless rules could then be scaled to any process as multiples of a basic length unit in microns, a unit I called Lambda (λ)."[^conway2012] She set λ to half of that largest minimum dimension and wrote the rules as small whole multiples of it. The result fitted on two pages, "easy to teach, learn, apply, and check".[^conway2012]

The core rules for the silicon-gate nMOS process of the time looked like this. Hover over or tap a rule to see it drawn.

```{raw} html
<figure class="fig wide">
  <div class="diagram" data-diagram="rulebook" data-rules='[{"key":"diffW","label":"Diffusion width 2λ"},{"key":"diffS","label":"Diffusion spacing 3λ"},{"key":"polyW","label":"Poly width 2λ"},{"key":"polyS","label":"Poly spacing 2λ"},{"key":"metalW","label":"Metal width 3λ"},{"key":"metalS","label":"Metal spacing 3λ"},{"key":"overhang","label":"Gate overhang 2λ"},{"key":"sd","label":"Source/drain extension 2λ"},{"key":"contact","label":"Contact 2λ × 2λ"},{"key":"surround","label":"Contact surround 1λ"}]'></div>
  <div class="legend"><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact cut</span></div>
  <figcaption><strong>The Mead–Conway nMOS rules, drawn on a λ grid.</strong> Each grid square is λ × λ. Metal gets 3λ rather than 2λ because metal lines had to climb over the bumps left by the layers beneath. Values from <a href="https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf">Lyon (1981)</a>, which follows Mead and Conway's textbook.</figcaption>
</figure>
```

| Rule | Value | Why it exists |
|---|---|---|
| Polysilicon width and spacing | 2λ | Narrowest line the process reliably prints and separates[^lyon1981] |
| Diffusion width | 2λ | Same, for doped silicon[^lyon1981] |
| Diffusion spacing | 3λ | Extra gap so depletion regions of neighbours don't conduct[^lyon1981] |
| Metal width and spacing | 3λ | Metal crosses uneven terrain and needs margin[^conway2012][^lyon1981] |
| Gate overhang past diffusion | 2λ | Survives misalignment without shorting source to drain[^lyon1981] |
| Polysilicon to unrelated diffusion | 1λ | Keeps them from accidentally forming a transistor[^lyon1981] |
| Contact cut | 2λ × 2λ, with 1λ of surround | The hole must land fully inside what it connects[^lyon1981] |
| Bond pads | 100 µm, *not* in λ | Pads must fit a bonding wire, which does not shrink[^lyon1981] |

Lyon summarised the logic in two "meta-rules": moving any edge relative to another by less than 2λ should never be fatal, and moving it by less than 1λ should not noticeably hurt performance.[^lyon1981] The last row of the table is a hint of what came later: even in 1981 some things refused to be expressed in λ.

There was a second benefit that mattered to programmers. Because every rule was a whole multiple of λ, layouts could live on an integer grid with only horizontal and vertical edges, which made layout editors and rule checkers far simpler and faster to write.[^conway2012]

## One drawing, any factory

A λ-based layout is a drawing in abstract units. To manufacture it, a designer or a service multiplies every coordinate by the value of λ for the chosen process. The first course chips in 1978 used λ = 3 µm; the MPC79 run a year later used λ = 2.5 µm; by the late 1990s MOSIS was mapping its scalable CMOS rules onto processes with λ as small as 0.2 µm.[^conway2012][^scmos72]

```{raw} html
<figure class="fig wide">
  <div class="diagram" data-diagram="shrink" data-procs='[
    {"label":"MIT course, 6 µm nMOS (1978)","short":"6 µm · 1978","lambda":3},
    {"label":"MPC79, 5 µm nMOS (1979)","short":"5 µm · 1979","lambda":2.5},
    {"label":"Orbit 2.0 µm CMOS (MOSIS SCMOS)","short":"2 µm","lambda":1.0},
    {"label":"AMI / HP 1.2 µm CMOS (MOSIS SCMOS)","short":"1.2 µm","lambda":0.6},
    {"label":"HP 0.5 µm CMOS (MOSIS SCMOS)","short":"0.5 µm","lambda":0.35},
    {"label":"HP 0.35 µm CMOS (MOSIS SCMOS)","short":"0.35 µm","lambda":0.25}
  ]'></div>
  <div class="legend"><span style="--c:var(--l-well)">n-well</span><span style="--c:var(--l-diff)">diffusion</span><span style="--c:var(--l-poly)">polysilicon</span><span style="--c:var(--l-metal)">metal</span><span style="--c:var(--l-contact)">contact</span></div>
  <figcaption><strong>The drawing never changes; only λ does.</strong> A simplified CMOS inverter drawn in λ units, shown at true physical size for six processes against a 10 µm scale bar and a human hair (roughly 60–100 µm across, per <a href="https://en.wikipedia.org/wiki/Hair">Wikipedia</a>). The 1978–79 course chips were nMOS rather than CMOS; their λ values are included for scale. λ values from <a href="https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf">Conway (2012)</a> and <a href="https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html">MOSIS SCMOS rev. 7.2</a>.</figcaption>
</figure>
```

This worked because of [Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling). In 1974 Robert Dennard and colleagues at IBM showed that if every dimension of a MOSFET, and its voltage, is reduced by the same factor, the transistor gets faster and uses less power while its power density stays the same.[^dennard1974] If the physics shrinks uniformly, a uniformly scaled drawing stays correct. Conway saw the payoff: cell layouts could be drawn "in a timeless form", opening the door to "widely-sharable, time-durable MOS cell libraries".[^conway2012] With chip density doubling roughly every two years, she argued, it made more sense to skip painstaking hand-compaction and move to the next, smaller process sooner.[^conway2012]

The price was area. A λ rule set has to cover the worst rule in the process, so every other rule gets rounded up to the nearest convenient multiple. An MIT thesis from 1980 called the Mead–Conway rules "very conservative", noting that layouts which broke them could still work.[^baker1980] Conway accepted the trade on purpose: λ was a simplification for designers who did not have time to learn a factory's every quirk.

## A book and a course turned the idea into a movement

Mead and Conway wrote the method up as *Introduction to VLSI Systems*. Drafts were printed on PARC's laser printers and handed to courses at Caltech, Berkeley, Carnegie Mellon and elsewhere from late 1977; Addison-Wesley published the book in time for courses in autumn 1979, with a 1980 copyright date.[^timeline][^conway2012] It eventually sold around 70,000 copies.[^conway2012] Wikipedia covers the wider story as the [Mead–Conway VLSI chip design revolution](https://en.wikipedia.org/wiki/Mead%E2%80%93Conway_VLSI_chip_design_revolution).

The real test was whether students could actually build chips. In autumn 1978 Conway taught a course at MIT. Its 32 students sent 19 projects over the [ARPANET](https://en.wikipedia.org/wiki/ARPANET) to PARC, where they were merged into one shared chip; masks were made by Micro Mask with an electron-beam machine, and wafers were run at Hewlett-Packard's research lab on a 6 µm nMOS process, λ = 3 µm. Packaged chips reached MIT on 18 January 1979.[^conway2012]

The following year PARC scaled the experiment up. For **MPC79** ("multi-project chip, 1979"), 124 designers at about a dozen universities submitted 82 projects by a 4 December deadline. PARC's software merged them onto 12 chip types, and HP fabricated them on a 5 µm nMOS process (λ = 2.5 µm). Packaged chips went back to every designer 29 days after the deadline, at a cost per project "on the order of a few hundred dollars".[^mpcadventures][^conway2012] In spring 1980 the next run, MPC580, carried 171 projects from 15 organisations.[^conway2012]

Mead called the people this method created "tall thin" designers: system designers who could carry an idea all the way from architecture down to layout. Conway noted that the phrase left women engineers, herself included, out of the picture.[^conway2012] Within about two years, more than a hundred universities were teaching Mead–Conway courses.[^timeline][^conway2012]

## Who actually made the silicon

None of these groups owned a factory. The trick, worked out at PARC and handed on, was to act as a **broker** between many designers and a few commercial fabs.

```{raw} html
<figure class="fig">
  <div class="diagram" data-diagram="wafer"></div>
  <figcaption><strong>A multi-project wafer splits one expensive run among many designs.</strong> Mask sets and wafer processing cost the same whether a wafer carries one design or dozens, so packing many small projects into each repeated exposure divides the cost. Schematic, not to scale.</figcaption>
</figure>
```

At PARC, Alan Bell and Martin Newell wrote the "implementation system" for MPC79 in the summer of 1979. PARC's own description reads like an operating system: software to "interface a large number of remote users with centralized maskmaking, wafer fabrication, and packaging facilities, making automated responses to electronic messages from users."[^mpc79doc] Designers emailed their layouts; PARC merged them; Micro Mask wrote the masks; HP's Integrated Circuit Processing Laboratory ran the wafers.[^mpc79doc]

In spring 1980 PARC handed the system to Danny Cohen and Keith Uncapher at the [USC Information Sciences Institute](https://en.wikipedia.org/wiki/Information_Sciences_Institute), funded by [DARPA](https://en.wikipedia.org/wiki/DARPA). The resulting service, MOSIS (the MOS Implementation Service), began operating in January 1981.[^conway2012][^isi1984] Cohen and George Lewicki explained the model at Caltech that month: MOSIS was "the ARPA silicon broker", trying "to totally isolate the designer from all the trivia that fabrication requires." It supported "nMOS with the Mead-Conway design rules", with "lambda equals 2.5 microns".[^cohen1981]

λ was what made the broker possible. MOSIS did not ask fabs for their rules; it told them its own. "We say, 'Those are OUR design rules. Do you support them?'" Cohen said, and a fab that answered "Lambda equals, say, two microns, for everything except…" got the reply "Too bad."[^cohen1981] Because designs were in λ, MOSIS could also "change lambda a little bit, but not a lot" if a slightly finer process was available and the designer agreed.[^cohen1981] By 1984 MOSIS reported that "at least 20 vendors" could make nMOS chips to the Mead–Conway rules, at 4 µm and 3 µm, with turnaround of four to six weeks and costs cut by one to two orders of magnitude by sharing wafers.[^isi1984]

The numbers grew fast. MOSIS ran 258 projects in 1981 and 1,880 in 1989, for users at more than 360 institutions.[^nrc1999] It also made fabrication free for classes, a practice that dates back to August 1980; by 2005 MOSIS had prototyped more than 50,000 designs.[^viterbi2005] Over its life the foundries behind MOSIS included HP, Orbit Semiconductor, AMI (later ON Semiconductor), TSMC, IBM, austriamicrosystems and Peregrine.[^mosisfab1997][^mosisvendors2010]

Other countries built their own brokers. France's CMP fabricated nine Grenoble student chips in March 1981; the Nordic countries started NORCHIP the same year; Canada's CMC began fabricating with Nortel in 1984; and Europe's EUROCHIP (1989) became EUROPRACTICE in 1995.[^cmp1981][^wpmpw][^cmc][^das2010] Wikipedia keeps a list under [multi-project wafer service](https://en.wikipedia.org/wiki/Multi-project_wafer_service).

## The software was built around the λ grid

A shared format came first. The **Caltech Intermediate Form** ([CIF](https://en.wikipedia.org/wiki/Caltech_Intermediate_Form)), a plain-text list of boxes, wires and polygons on each layer, was respecified as CIF 2.0 by Bob Sproull and Dick Lyon in 1978 and became the file designers sent over the network to MPC79 and later to MOSIS.[^cif1980][^mpcadventures] Its unit is the centimicron (0.01 µm), and the Magic editor still writes CIF in those units today.[^magicmanual]

The tools that followed all leaned on λ's integer grid:

- **ICARUS**, a layout editor on PARC's Alto workstations, was adapted to λ rules in 1977.[^icarus1978][^timeline]
- **Bristle Blocks** (Caltech, 1979), an early "silicon compiler" by Dave Johannsen, aimed to produce "an entire LSI mask set" from a one-page description.[^bristle1979]
- **MOSSIM**, a switch-level simulator written by Randy Bryant for Conway's 1978 MIT course, and an MIT circuit extractor that found bugs in the Scheme-79 chip before it was fabricated.[^simmos][^baker1980]
- **Caesar** and **KIC**, Berkeley layout editors that produced CIF by 1981.[^cifplot1981] Caesar was used to lay out RISC I, RISC II and MIPS.[^nrc1999]
- **Lyra** (1982), a design rule checker that tested geometry at corners.[^lyra1982]
- **[Magic](https://en.wikipedia.org/wiki/Magic_(software))** (1984), from John Ousterhout's group at Berkeley, which checked design rules in the background as you drew.[^magic1984][^wpmagic] Berkeley shipped it in a 1985 distribution of about twenty free VLSI tools.[^ucb1985]

Magic is still maintained, by Tim Edwards, and is used today with the open SKY130 and GF180MCU process kits. Its own manual records what happened to λ: "The decreasing use of scalable processes, however, has made this method largely obsolete."[^magicmanual][^openpdks]

## The chips and papers that came out of it

The Mead–Conway method arrived as DARPA was funding a large VLSI research programme, which grew from under $15 million in 1979 to over $93 million in 1982.[^nrc1999] Its best-known chips were designed by small university teams and fabricated through MPC runs or MOSIS:

| Year | Chip | Where | What it showed | What came next |
|---|---|---|---|---|
| 1979 | Scheme-79 | MIT | A Lisp processor on one chip, fabricated in MPC79[^mpcadventures][^scheme1980] | Grew from a prototype Guy Steele designed in the 1978 MIT course[^mpcadventures] |
| 1979–82 | [Geometry Engine](https://en.wikipedia.org/wiki/Geometry_Engine) | Stanford | First prototype on MPC79; a 3D graphics pipeline in custom silicon[^mpcadventures][^clark1982] | [Silicon Graphics](https://en.wikipedia.org/wiki/Silicon_Graphics)[^chmsgi] |
| 1981–82 | [RISC I](https://en.wikipedia.org/wiki/Berkeley_RISC) | Berkeley | 44,420 transistors, 4–5 µm nMOS (sources differ), built by a graduate class and fabricated through MOSIS[^chmrisc][^peek1983][^ethw] | Sun's [SPARC](https://en.wikipedia.org/wiki/SPARC)[^nrc1999] |
| 1983 | PSC | Carnegie Mellon | A programmable systolic processor "laid out in nMOS (using Mead-Conway design rules)"[^psc1983] | Part of H. T. Kung's systolic-array work; DARPA's related WARP project led to Intel's iWarp[^nrc1999] |
| 1984 | [MIPS](https://en.wikipedia.org/wiki/Stanford_MIPS) | Stanford | 32-bit nMOS processor, fabricated through MOSIS and on Stanford's own line[^mipsoh] | [MIPS Computer Systems](https://en.wikipedia.org/wiki/MIPS_Computer_Systems)[^nrc1999] |

The key papers trace the same path: Mead and Conway's textbook (1980); Conway's report on the MPC experiments, *The MPC Adventures* (1981);[^mpcadventures] Patterson and Séquin's *RISC I: A Reduced Instruction Set VLSI Computer* (1981);[^risc1981] Clark's *The Geometry Engine* (1982), which credits Conway's support and says the project "probably would not have been carried out" without it;[^clark1982] and Ousterhout's *Magic: A VLSI Layout System* (1984).[^magic1984]

There is a twist in the MIPS story. When the Stanford team founded a company to sell the chip, they dropped the Mead–Conway style. Co-founder John Moussouris recalled that the commercial chip "needed to go from NMOS to CMOS, from Mead/Conway design to SRAM-like design", and turned down one chipmaker because "we knew we couldn't get to our clock rates using their Mead/Conway design methodology."[^mipsoh] λ was superb for getting a first chip working. It was not how you squeezed out the last 30% of speed or area.

## SCMOS: stretching λ into the CMOS era

Through the 1980s the industry moved from nMOS to [CMOS](https://en.wikipedia.org/wiki/CMOS), which adds wells, a second type of diffusion and, soon, extra metal layers. MOSIS answered with **Scalable CMOS (SCMOS)**: "a set of logical layers together with their design rules, which provide a nearly process- and metric-independent interface to many CMOS fabrication processes".[^scmos8] Designers drew in λ; MOSIS mapped the design onto whichever process ran. Its own documentation was frank about the trade-off: "SCMOS is there for portability and simplicity. It is NOT there for fine-tuned layout."[^scmos8]

```{table} λ values MOSIS published for each rule set, from SCMOS revisions 7.2 (late 1990s) and 7.4 (2000).[^scmos72][^scmos74]
:name: lambda-table

| Process offered through MOSIS | λ (SCMOS) | λ (SUBM) | λ (DEEP) |
|---|---|---|---|
| Orbit 2.0 µm | 1.0 µm | not offered | not offered |
| AMI / HP 1.2 µm | 0.6 µm | not offered | not offered |
| HP 0.8 µm | 0.5 µm | 0.4 µm | not offered |
| AMI / HP 0.5 µm | 0.35 µm | 0.30 µm | not offered |
| TSMC 0.35 µm | 0.25 µm | 0.20 µm | not offered |
| TSMC 0.25 µm | not offered | 0.15 µm | 0.12 µm |
| TSMC 0.18 µm | not offered | 0.10 µm | 0.09 µm |
```

The table already shows the problem. SCMOS rules, MOSIS explained, "were historically developed for 1.0 to 3.0 micron processes." For sub-micron processes it created **SCMOS_SUBM**, "by increasing the lambda size for some rules (those that didn't shrink as fast in practice as did the overall scheme of things)", and at 0.25 µm it revised them again into **SCMOS_DEEP**.[^scmos8] The single ruler had become three, and each was less uniform than the last.

```{raw} html
<figure class="fig wide">
  <div class="diagram" data-diagram="drift"></div>
  <figcaption><strong>Rule values in λ grew as processes shrank.</strong> Selected MOSIS SCMOS rules, measured in λ, in the original SCMOS, sub-micron (SUBM) and deep sub-micron (DEEP) rule sets. Gate and wire widths stayed fixed, while spacings and overlaps grew, so the same circuit needed more λ×λ squares, and DEEP introduced half-λ values such as 2.5λ. Data from MOSIS SCMOS rev. 8.00, tables 3a and 3b (<a href="https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html">archived copy</a>).</figcaption>
</figure>
```

## Why λ stopped working

λ assumed that every rule shrinks by the same factor. From the late 1980s onward, several things broke that assumption at once.

**Different features shrank at different rates.** Lithography improved faster than some of the physics around it: wells, the isolation between transistors, and the gaps between wide metal lines did not keep pace. In the figure above, the gap between two contacts went from 2λ to 4λ, and the space between wells of different voltage from 9λ to 18λ.[^scmos8] A course at Cornell, adapting an example from the standard textbook, puts the cost plainly: at λ = 0.5 µm a λ-based metal track (one wire plus one gap) takes 4 µm, where the process's own micron rules allowed 2.75 µm. "Scaled design is legal but much larger than it needs to be!"[^batten] Every rule rounded up to whole λ is area thrown away, and area is money.

**Integer λ ran out of resolution.** The DEEP rules needed values such as 2.5λ and 1.5λ, and MOSIS's scalable rules required layouts on a half-λ grid.[^scmos8] Once a rule set needs fractions of its own unit, the unit is no longer doing its job.

**New kinds of rule appeared that are not widths or gaps.** Polishing each layer flat ([chemical-mechanical planarization](https://en.wikipedia.org/wiki/Chemical-mechanical_polishing)) needs every area of a layer to be neither too empty nor too full, so modern rule decks specify metal **density** windows. Long wires can collect charge during etching and destroy the gate they connect to, giving **[antenna rules](https://en.wikipedia.org/wiki/Antenna_effect)** that limit the ratio of wire area to gate area.[^wpdrc] Neither fits on a λ grid.

**Lithography went below the wavelength of light.** By around 1999 chips were being printed with features smaller than the wavelength used to expose them, using tricks such as [optical proximity correction](https://en.wikipedia.org/wiki/Optical_proximity_correction) that deliberately distort the mask so the printed shape comes out right. Lars Liebmann of IBM showed in 2003 that the k₁ factor, a measure of how hard a feature is to print, had already passed the "fundamental resolution limit" of 0.5. He warned that these techniques "require layout restrictions" that "can not be enforced through 'conventional' design rules", and that "simple (i.e. understandable) design rules are inadequate (misleading)".[^liebmann2003] Whether a shape prints now depends on its neighbours, which no fixed list of minimum dimensions can capture.

**The rule decks exploded.** Writing in 2014, Synopsys's Marco Casale-Rossi compared Conway's "just two pages" with modern processes needing "several thousands of complex design rules", described in "tens of thousands of lines of code".[^casale2014] Semiconductor Engineering reported in 2018 that the count grows sharply again with double and triple patterning below 28 nm.[^semieng2018] Around 2005–2007 the physics underneath gave way too: leakage currents stopped voltages from shrinking, and with them Dennard scaling ended.[^wpdennard]

There is no single date when λ died. Casale-Rossi puts its main period of use "from 3-µm n-channel [nMOS] of the late 1970s to 0.7-µm [CMOS] of the early 1990s".[^casale2014] MOSIS's scalable rules stop at 0.18 µm, and their last revision is dated 2009.[^scmos8] By 2020 Tim Edwards, then at Efabless, wrote that MOSIS "has dropped support" for the SCMOS kits, and that they "only worked because they used conservative rules that did not reveal manufacturing limits".[^edwards2020] λ survives in textbooks: Harris and Weste's *CMOS VLSI Design* course slides still introduce "λ = f/2" as "conservative rules to get you started".[^harris]

## What survived: the shared wafer, not the ruler

The part of the Mead–Conway project that outlived λ was the service model: designers anywhere, sending files electronically to a broker who packs many projects onto shared wafers at a commercial fab.

That model is how the open-silicon movement works today. In 2020 Google and SkyWater released the SKY130 process design kit as open source. Unlike SCMOS, it publishes the foundry's exact rules, in absolute units: polysilicon at least 0.150 µm wide, first-layer metal at least 0.140 µm.[^edwards2020][^sky130rules] Google funded free multi-project shuttles on SKY130 and GF180MCU that manufactured 360 designs from more than 600 submissions in 19 countries.[^google2023] [Tiny Tapeout](https://tinytapeout.com/) took the idea to its limit, fitting 152 projects into small tiles on one shared chip in 2022.[^tt01]

The brokers changed, as they did in the 1980s. Efabless, which ran the shuttles, shut down in March 2025; Tiny Tapeout moved to other shuttles, and a new company, ChipFoundry, restored SKY130 runs in May 2025.[^ttefabless][^chipfoundry] Germany's IHP runs free shuttles on its own open 130 nm kit.[^ihp] MOSIS itself was relaunched as MOSIS 2.0 in 2023 and signed a partnership with GlobalFoundries in July 2026.[^mosis2][^aac2026]

Conway's insight was that chip design needed a clean interface between designer and factory, the way software has an instruction set between programmer and processor. For two decades that interface was λ: a deliberately conservative abstraction that traded some area for portability, simplicity and the ability to teach. When physics made the abstraction too expensive, the interface moved to per-process kits with exact rules and automated checkers. The open PDKs used today are a descendant of that same separation of design from manufacturing.

## Further reading

- Lynn Conway, [*Reminiscences of the VLSI Revolution*](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf) (2012): the inventor's own long account.
- Lynn Conway, [*The MPC Adventures*](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf) (1981): the shared-wafer experiments as reported at the time.
- National Research Council, [*Funding a Revolution*, chapter 4](https://www.nationalacademies.org/read/6323/chapter/6) (1999): DARPA's VLSI programme and what came out of it.
- Wikipedia: [Lynn Conway](https://en.wikipedia.org/wiki/Lynn_Conway), [Carver Mead](https://en.wikipedia.org/wiki/Carver_Mead), [MOSIS](https://en.wikipedia.org/wiki/MOSIS), [VLSI Project](https://en.wikipedia.org/wiki/VLSI_Project), [Design rule checking](https://en.wikipedia.org/wiki/Design_rule_checking), [Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling), [Process design kit](https://en.wikipedia.org/wiki/Process_design_kit).

## Sources

[^conway2012]: Lynn Conway, "Reminiscences of the VLSI Revolution: How a series of failures triggered a paradigm shift in digital design", *IEEE Solid-State Circuits Magazine* 4(4), 2012, pp. 8–31. [DOI 10.1109/MSSC.2012.2215752](https://doi.org/10.1109/MSSC.2012.2215752); [full text](https://worrydream.com/refs/Conway_L_2012_-_Reminiscences_of_the_VLSI_Revolution.pdf).
[^timeline]: Lynn Conway, "Reminiscences of the VLSI Revolution: A Timeline of Events", 2012. [Archived copy](http://web.archive.org/web/20260721222742/https://ai.eecs.umich.edu/people/conway/Memoirs/VLSI/Timeline/VLSI_Timeline.pdf).
[^lyon1981]: Richard F. Lyon, "Simplified Design Rules for VLSI Layouts", Southcon 1981 and *LAMBDA* magazine, first quarter 1981. [Scan](https://www.dicklyon.com/tech/Scans/DesignRules-Lyon.pdf).
[^mpcadventures]: Lynn Conway, *The MPC Adventures: Experiences with the Generation of VLSI Design and Implementation Methodologies*, Xerox PARC VLSI-81-2, January 1981. [Scan](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/xerox/parc/techReports/VLSI-81-2_The_MPC_Adventures.pdf).
[^mpc79doc]: L. Conway, A. Bell, M. Newell et al., *MPC79 Implementation Documentation*, Xerox PARC, 1980. [Archived copy](https://web.archive.org/web/2023/https://ai.eecs.umich.edu/people/conway/VLSI/MPC79/ImpDoc/ImpDoc79Front.html).
[^cohen1981]: Danny Cohen and George Lewicki, "MOSIS: The ARPA Silicon Broker", Caltech Conference on VLSI, January 1981. [Archived copy](https://web.archive.org/web/2024/https://caltechconf.library.caltech.edu/219/1/DannyCohen.pdf).
[^isi1984]: USC Information Sciences Institute, *1984 Annual Technical Report* (ISI/SR-85-150), MOSIS chapter. [Archived copy of DTIC ADA157991](https://web.archive.org/web/20250119100913/https://apps.dtic.mil/sti/pdfs/ADA157991.pdf).
[^nrc1999]: National Research Council, *Funding a Revolution: Government Support for Computing Research*, chapter 4, "The Organization of Federal Support: A Historical Review", 1999. [Online](https://www.nationalacademies.org/read/6323/chapter/6).
[^viterbi2005]: USC Viterbi School, "MOSIS Free Chips for Students Program Nears Quarter Century Mark", May 2005. [Online](https://viterbischool.usc.edu/news/2005/05/mosis-free-chips-for-students-program-nears-quarter-century-mark/).
[^mosisfab1997]: MOSIS fabrication schedule, 1997. [Archived copy](https://web.archive.org/web/19970717024919/http://www.mosis.org:80/mosis-fab.html).
[^mosisvendors2010]: MOSIS vendor list, 2010. [Archived copy](https://web.archive.org/web/20101226053736/http://www.mosis.com/products/fab/vendors/).
[^cmp1981]: Patstec, record of Grenoble's first multi-project circuits, 1981. [Online](https://www.patstec.fr/pdfgen.php?id=26861).
[^wpmpw]: Wikipedia, "Multi-project wafer service". [Online](https://en.wikipedia.org/wiki/Multi-project_wafer_service).
[^cmc]: CMC Microsystems, foundry partnerships history. [Online](https://cmc.ca/?p=43732).
[^das2010]: C. Das and J. McLean, "EUROCHIP-EUROPRACTICE: 20 Years of Design Support for European Universities", EWME 2010. [PDF](https://www.mes.tu-darmstadt.de/media/mikroelektronische_systeme/pdf_3/ewme2010/proceedings/others/das_paper.pdf).
[^dennard1974]: R. H. Dennard et al., "Design of ion-implanted MOSFET's with very small physical dimensions", *IEEE Journal of Solid-State Circuits* 9(5), 1974, pp. 256–268. [DOI 10.1109/JSSC.1974.1050511](https://doi.org/10.1109/JSSC.1974.1050511).
[^wpdennard]: Wikipedia, "Dennard scaling", section on breakdown. [Online](https://en.wikipedia.org/wiki/Dennard_scaling).
[^baker1980]: Clark M. Baker, *Artwork Analysis Tools for VLSI Circuits*, MIT/LCS/TR-239, 1980. [Scan](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/mit/lcs/tr/MIT-LCS-TR-0239.pdf).
[^scmos72]: MOSIS, *Scalable CMOS Design Rules*, revision 7.2. [University mirror](https://www.ece.iit.edu/~eoruklu/courses/ece429/tutorial/rules72.html).
[^scmos74]: MOSIS, *Scalable CMOS Design Rules*, revision 7.4, March 2000. [Archived copy](https://web.archive.org/web/20001002134149/http://www.mosis.org/Technical/Designrules/scmos/scmos-main.html).
[^scmos8]: MOSIS, *Scalable CMOS (SCMOS) Design Rules*, revision 8.00, updated May 2009. [Archived copy](https://web.archive.org/web/20111231160920/http://www.mosis.com:80/Technical/Designrules/scmos/scmos-main.html).
[^cif1980]: R. Sproull, R. Lyon and S. Trimberger, *The Caltech Intermediate Form for LSI Layout Description*, Caltech CS TR 2686, 1980. [Record](https://authors.library.caltech.edu/records/jmrgc-2f168).
[^icarus1978]: D. G. Fairbairn and J. A. Rowson, "ICARUS: An interactive integrated circuit layout program", 15th Design Automation Conference, 1978. [DOI 10.1109/DAC.1978.1585168](https://doi.org/10.1109/DAC.1978.1585168).
[^bristle1979]: D. Johannsen, "Bristle Blocks: A Silicon Compiler", 16th Design Automation Conference, 1979. [Record](https://authors.library.caltech.edu/71793).
[^simmos]: Martin Newell, SimMOS documentation, Xerox PARC, 1980. [Online](https://xeroxparcarchive.computerhistory.org/indigo/da/simmos/.SimMOS.bravo!1.html).
[^cifplot1981]: D. T. Fitzpatrick, *CIFPLOT: Plotting Software for IC Layouts*, UCB/ERL M81/96, 1981. [PDF](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1981/ERL-m-81-96.pdf).
[^lyra1982]: M. H. Arnold and J. K. Ousterhout, "Lyra: A new approach to geometric layout rule checking", 19th Design Automation Conference, 1982. [DOI 10.1145/800263.809255](https://doi.org/10.1145/800263.809255).
[^magic1984]: J. K. Ousterhout, G. T. Hamachi, R. N. Mayo, W. S. Scott and G. S. Taylor, "Magic: A VLSI Layout System", 21st Design Automation Conference, 1984. [DOI 10.1109/DAC.1984.1585789](https://doi.org/10.1109/DAC.1984.1585789).
[^ucb1985]: W. S. Scott, G. Hamachi, J. Ousterhout and R. N. Mayo, *1985 VLSI Tools: More Works by the Original Artists*, UCB/CSD-85-225. [Record](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1985/5583.html).
[^wpmagic]: Wikipedia, "Magic (software)". [Online](https://en.wikipedia.org/wiki/Magic_(software)).
[^magicmanual]: Magic VLSI, "Magic Maintainer's Manual #2: The Technology File". [Online](http://opencircuitdesign.com/magic/techref/maint2.html).
[^openpdks]: R. Timothy Edwards, open_pdks. [GitHub](https://github.com/rtimothyedwards/open_pdks).
[^scheme1980]: J. Holloway, G. L. Steele Jr., G. J. Sussman and A. Bell, *The SCHEME-79 Chip*, MIT AI Memo 559, 1980. [Record](https://dspace.mit.edu/handle/1721.1/6334).
[^clark1982]: J. H. Clark, "The Geometry Engine: A VLSI Geometry System for Graphics", *Computer Graphics* (SIGGRAPH '82) 16(3), pp. 127–133. [PDF](https://archive.org/download/bitsavers_sgiirisgeok_1057823/p127-clark.pdf).
[^chmsgi]: Computer History Museum, "Silicon Graphics", *Revolution* exhibit. [Online](https://www.computerhistory.org/revolution/computer-graphics-music-and-art/15/219).
[^chmrisc]: Computer History Museum, "RISC I", *Revolution* exhibit. [Online](https://www.computerhistory.org/revolution/digital-logic/12/286/1591).
[^peek1983]: J. B. Peek, *The VLSI Circuitry of RISC I*, UCB/CSD-83-135, 1983. [Record](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1983/6347.html).
[^ethw]: IEEE, "Milestone Proposal: First RISC Microprocessor". [Online](https://ethw.org/Milestone-Proposal:First_RISC_Microprocessor).
[^psc1983]: A. L. Fisher, H. T. Kung, L. M. Monier and Y. Dohi, "Architecture of the PSC: A Programmable Systolic Chip", ISCA 1983. [PDF](https://www.eecs.harvard.edu/~htk/publication/1983-sigarch-fisher-kung-monier-dohi.pdf).
[^mipsoh]: Computer History Museum, "MIPS Oral History Panel" (Hennessy, Moussouris, Stritter and others), 2011. [Transcript](https://archive.computerhistory.org/resources/access/text/2012/01/102746197-05-01-acc.pdf).
[^risc1981]: D. A. Patterson and C. H. Séquin, "RISC I: A Reduced Instruction Set VLSI Computer", ISCA 1981, pp. 443–457. [PDF](https://www.cse.iitk.ac.in/users/biswap/CS422/RISC-ISCA81.pdf).
[^batten]: C. Batten, Cornell ECE 6745, "T04: Full-Custom Design Methodology", slide adapted from MIT 6.371. [PDF](https://www.csl.cornell.edu/courses/ece6745/handouts/ece6745-T04-methodology-custom.pdf).
[^wpdrc]: Wikipedia, "Design rule checking". [Online](https://en.wikipedia.org/wiki/Design_rule_checking).
[^liebmann2003]: L. Liebmann, "Layout Impact of Resolution Enhancement Techniques: Impediment or Opportunity?", ISPD 2003. [Slides](https://ispd.cc/ispd2027/slides/2003/07_1_liebmann.pdf).
[^casale2014]: M. Casale-Rossi, "The Heritage of Mead & Conway: What Has Remained the Same, What Has Changed, What Was Missed, and What Lies Ahead", *Proceedings of the IEEE* 102(2), 2014, pp. 114–119. [DOI 10.1109/JPROC.2013.2295871](https://doi.org/10.1109/JPROC.2013.2295871); [PDF](https://www.uvic.ca/research/transchair/assets/docs/The%20Heritage%20of%20Mead%20and%20Conway.pdf).
[^semieng2018]: E. Sperling, "Design Rule Complexity Rising", *Semiconductor Engineering*, April 2018. [Online](https://semiengineering.com/design-rule-complexity-rising).
[^harris]: D. Harris, "Introduction", *CMOS VLSI Design* course slides, Harvey Mudd College E158. [PDF](https://pages.hmc.edu/harris/class/e158/16/lect0.pdf).
[^edwards2020]: R. Timothy Edwards, "Google/SkyWater and the Promise of the Open PDK", Workshop on Open-Source EDA Technology (WOSET), 2020. [PDF](https://woset-workshop.github.io/PDFs/2020/a03.pdf).
[^sky130rules]: SkyWater SKY130 PDK documentation, "Periphery rules". [Online](https://skywater-pdk.readthedocs.io/en/main/rules/periphery.html).
[^google2023]: Google Open Source Blog, "Open source PDKs joining Linux Foundation's CHIPS Alliance", November 2023. [Online](https://opensource.googleblog.com/2023/11/open-source-pdks-joining-linux-foundation-chips-alliance.html).
[^tt01]: Tiny Tapeout, "TT01 launch", 2022. [Online](https://tinytapeout.com/news/tt01-launch/).
[^ttefabless]: Tiny Tapeout, "Efabless shuts down", March 2025. [Online](https://tinytapeout.com/news/efabless-shutsdown/).
[^chipfoundry]: Tiny Tapeout, "ChipFoundry sponsors Tiny Tapeout", May 2025. [Online](https://tinytapeout.com/news/chipfoundry-sponsor/).
[^ihp]: IHP Open Design Library, free MPW runs. [Online](https://ihp-open-designlib.readthedocs.io/en/latest/).
[^mosis2]: USC ISI, "MOSIS 2.0's First Year". [Online](https://www.isi.edu/news/972800/mosis-2-0s-first-year/).
[^aac2026]: All About Circuits, "MOSIS Partners With GlobalFoundries, Extending 40-Year Prototyping Legacy", July 2026. [Online](https://allaboutcircuits.com/news/mosis-partners-with-globalfoundries-extending-40-year-prototyping-legacy).
