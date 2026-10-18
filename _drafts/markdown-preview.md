---
layout: post
lang: en
translation_key: markdown-preview
title: "Markdown layout preview"
description: "A local-only specimen for checking typography, code, and tables."
permalink: /preview/markdown/
sitemap: false
published: false
---

**This is a local-only formatting sample.** It appears when you run
`./bin/dev --unpublished`, and is excluded from the production site. Edit this file to try
out Markdown, or remove it when you’re ready to add your own writing.

## A comfortable place to read

This paragraph is here to show the reading width, line spacing, and rhythm of
a longer page. Markdown keeps the source simple while the theme takes care of
how the finished article looks. You can use **bold text**, *emphasis*, and
[ordinary links](https://www.markdownguide.org/basic-syntax/) within a paragraph.

### Lists and structure

- A short observation.
- A supporting detail with a little more room to breathe.
- A link, reference, or next step.

> A blockquote provides a little visual separation for a quotation or an
> excerpt. Attribution can go in the paragraph that follows.

## Code, when you need it

Put a language name after the opening code fence to enable syntax highlighting.
Inline code such as `example()` works within a sentence, too.

```python
def greet(name: str) -> str:
    return f"Hello, {name}."

print(greet("reader"))
```

## Tables and references

| Element | Markdown source |
| --- | --- |
| A heading | `## Heading` |
| Emphasis | `*emphasis*` |
| A link | `[label](https://example.com)` |

Footnotes are available when you want to keep a reference out of the main
paragraph.[^example]

[^example]: This is an example footnote, included to check how references render.
