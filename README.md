# Drawing chips in λ

A sourced, illustrated history of **lambda (λ) design rules** for chip layout: why Lynn Conway invented them in 1977, how they let students and researchers design chips through shared-wafer services such as MOSIS, and why they stopped working below about a quarter of a micron.

Read it at **https://lambda-rules-history.readthedocs.io/**.

## Building locally

```sh
pip install -r docs/requirements.txt
sphinx-build -W -b html docs docs/_build/html
```

The article is `docs/index.md` (MyST Markdown). The interactive diagrams are plain JavaScript in `docs/_static/js/diagrams.js`, and the article-style theme is in `docs/_themes/essay/`.

## Corrections

Every claim is meant to carry a link to its source. If you find an error or a better source, please open an issue or pull request.

Text is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); code is licensed Apache 2.0.
