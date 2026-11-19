# Sphinx configuration for "Lambda rules" article
import datetime

project = "Drawing chips in λ"
author = "Tim Ansell and contributors"
copyright = f"{datetime.date.today().year}, {author}"

extensions = ["myst_parser"]
myst_enable_extensions = ["colon_fence", "attrs_inline", "attrs_block", "deflist", "html_image"]
myst_heading_anchors = 3
myst_footnote_transition = True
myst_footnote_sort = True

source_suffix = {".md": "markdown"}
root_doc = "index"
exclude_patterns = ["_build", "README.md"]

html_theme = "essay"
html_theme_path = ["_themes"]
html_title = project
html_short_title = project
html_static_path = ["_static"]
html_js_files = ["js/diagrams.js"]
html_css_files = ["diagrams.css"]
html_last_updated_fmt = "%-d %B %Y"
html_show_sourcelink = False
html_copy_source = False
html_use_index = False
html_domain_indices = False
html_theme_options = {
    "repo_url": "https://github.com/mithro/lambda-rules-history",
}
