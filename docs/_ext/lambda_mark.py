"""Wrap every λ (the design-rule unit) in <span class="lam"> so the theme can colour it.

Runs on the resolved doctree for ordinary text, and on raw HTML blocks for the
text between tags (attributes such as data-rules are left untouched).
"""
import re
from docutils import nodes

LAM = "λ"
_TAG_SPLIT = re.compile(r"(<[^>]*>)")


def _mark_html(html: str) -> str:
    parts = _TAG_SPLIT.split(html)
    for i, part in enumerate(parts):
        if part and not part.startswith("<") and LAM in part:
            parts[i] = part.replace(LAM, '<span class="lam">λ</span>')
    return "".join(parts)


def _process(app, doctree, docname):
    for raw in list(doctree.findall(nodes.raw)):
        if raw.get("format") == "html":
            new = _mark_html(raw.astext())
            raw.replace_self(nodes.raw("", new, format="html"))
    skip = (nodes.literal, nodes.literal_block, nodes.raw, nodes.FixedTextElement)
    for text in list(doctree.findall(nodes.Text)):
        parent = text.parent
        if parent is None or isinstance(parent, skip) or LAM not in text:
            continue
        pieces = str(text).split(LAM)
        new = []
        for j, p in enumerate(pieces):
            if p:
                new.append(nodes.Text(p))
            if j < len(pieces) - 1:
                new.append(nodes.inline(LAM, LAM, classes=["lam"]))
        idx = parent.index(text)
        parent.remove(text)
        for k, n in enumerate(new):
            parent.insert(idx + k, n)


def setup(app):
    app.connect("doctree-resolved", _process)
    return {"parallel_read_safe": True, "parallel_write_safe": True}
