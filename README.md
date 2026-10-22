# colemakdvorak.github.io

A Markdown-first personal site built with [Jekyll](https://jekyllrb.com/) and
[Minima 2.5.1](https://github.com/jekyll/minima/tree/v2.5.1). It uses the
GitHub Pages dependency set, with a small layer of custom layouts and styling.
English and Korean versions share the design, with separate Markdown content.

## Local preview

From the `colemakdvorak.github.io` project directory:

```sh
./bin/setup   # First run, or after changing the Gemfile
./bin/dev
```

Open **http://localhost:4000** and use the language switch, or go directly to
**http://localhost:4000/ko/** for Korean. Saving a page, post, layout, translation label, or stylesheet
rebuilds the site and reloads the browser. Stop the server with **Ctrl+C**.
Changes to `_config.yml` require restarting `./bin/dev`.

The Markdown formatting specimens in `_drafts/markdown-preview.md` and
`ko/_drafts/markdown-preview.md` are hidden with `published: false`. To inspect
them locally, run `./bin/dev --unpublished`, then open
**http://localhost:4000/preview/markdown/** or
**http://localhost:4000/ko/preview/markdown/**.

The scripts use Ruby/Bundler from your PATH. In the original WSL workspace,
they automatically use the toolchain installed at
`~/.local/share/github-page-tools`. On a different machine, install Ruby 3.3,
Bundler, and the native-extension build tools for your platform first.
`GITHUB_PAGE_RUBY_HOME` can point to a different Ruby installation prefix.

For VS Code Remote, forward port **4000** for the site and **35729** for
LiveReload if those ports are not already accessible. In WSL, Windows browsers
can normally use the localhost URL directly.

## What to edit

| File | Purpose |
| --- | --- |
| `_config.yml` | Shared name (`title` and `author`), contacts, site URL, default language |
| `index.md` / `ko/index.md` | English / Korean homepage |
| `background.md` / `ko/background.md` | Background layout, introduction, and LinkedIn experience link |
| `_data/education.yml` | Newest-first education cards, degrees, dates, projects, and advisors |
| `interests.md` / `ko/interests.md` | Technical interests and hobbies in two collapsible cards |
| `_data/tech_stack.yml` | Shared technology list and green paid-work highlights |
| `writing.md` / `ko/writing.md` | English / Korean writing introduction |
| `_posts/` / `ko/_posts/` | English / Korean published posts |
| `_data/locales.yml` | Translated navigation, labels, date formats, and feed descriptions |
| `_data/places.yml` | Journey locations, contexts, dates, and bilingual notes |
| `_data/map_places.yml` | Country/US-coast pins, representative coordinates, labels, and summaries |
| `_data/work.yml` | Project preview copy and contribution/credit notes |
| `_data/links.yml` | Shared paper, source-code, demo, and award URLs |
| `assets/main.scss` | Typography, colors, spacing, and responsive styles |
| `assets/places-map.scss` | Map, numbered pins, popups, and timeline styles |
| `assets/journey-player.js` | Map playback, slider, animation, and chapter navigation |
| `assets/fonts/pretendard/` | Self-hosted Korean font and its SIL Open Font License |
| `_includes/` | Navigation, footer, and post-list markup |
| `_layouts/` | Homepage and Writing page structure |

Edit the source files, rather than the generated files in `_site/`.

To add a CV, place the PDF at `assets/cv.pdf` and uncomment `cv_url` in
`_config.yml`. The LinkedIn URL there is shared by the footer and Professional
experience section. Uncomment `email` when you want an email link.

## Interests

The Interests pages have two independent, initially collapsed top-level cards:
technical interests, and hobbies / other things. Hobbies contains separate TCG,
Anime / Manga, and Video Games cards. Edit ordinary Markdown inside the
`technical_interests`, `tcg_interests`, `anime_manga_interests`, and
`video_games_interests` capture blocks in `interests.md` and `ko/interests.md`.
Use short notes, headings, links, lists, images, or tables as needed; there is no
fixed entry format.

Edit `_data/tech_stack.yml` for the shared stack table. Languages occupy one row;
each tool with `paid: true` gets a green highlight, and `paid: false` entries use
plain text. Frameworks, cloud platforms, and the OS have their own rows.

`_includes/interest-card.html` uses native `<details>` and `<summary>` elements,
so the cards work with a mouse, keyboard, or JavaScript disabled. Pass
`nested=true` for a child card with a level-three heading and compact spacing;
use level-four headings (`####`) within that child's Markdown content.

## Places map

Both Background pages include an interactive map and an expandable text
timeline. Edit **`_data/places.yml`** to change the places and their notes.

- **Array order sets the timeline numbers.** All 11 chapters remain in their
  original order, including the return visits. Stop **6** is San Francisco.
- Every card follows the same structure: a location-only `title`, a `context`
  (school, company, or life chapter), country/date metadata, and a short `note`.
  School/company names belong in `context` rather than being mixed into titles.
  Dates appear when supplied; the final chapter also shows the Now label.
- `_includes/journey-card.html` is the shared card template. Its rendered
  content is reused by the timeline, slider card, and map popups so their
  wording, metadata, and typography stay consistent.
- `map_id` connects each chapter to one of five overview pins in
  **`_data/map_places.yml`**: `us-east`, `us-west`, `denmark`, `korea`, or `uk`.
- Overview shows the five main places with **Started / 시작** and **Now / 현재**
  labels. Choose a pin to jump to a related chapter.
- The slider runs from **0 (Overview)** through **11 chapters**. Previous/Next
  buttons and the slider's native arrow-key controls work as well.
- Playback highlights one move at a time, with an animated travelling point,
  a directional arrow, a location/date heading, and the chapter note. Local
  moves such as Daegu → Daejeon are included.
- Play starts or resumes the journey. Pause freezes movement and advancement;
  Replay restarts after the last chapter. Scrubbing or opening a place card
  pauses playback. Reduced-motion preferences use static chapter transitions.
- Chapter views use the city coordinates in `places.yml`. A multi-city chapter,
  such as Denmark, uses the center of its group, with the full list in its note.
- Edit bilingual names and summaries in `map_places.yml`. Its `pin_offset`
  and label settings are screen-space callouts that separate the two close
  European pins; thin leaders point to their geographic anchors.
- `period` is optional. The supplied Brown (**2011–2015**), return to Korea
  (**2020**), and Imperial (**2025–2026**) dates are included. Detailed cities
  and coordinates remain in `places.yml` for reference.

Click a chapter's pin or arrow to open its details, or expand the timeline to
choose a chapter directly. Move the slider to **0** to return to the full map.
Playback starts only when requested. The full text timeline is available even
without JavaScript.

The map uses self-hosted Leaflet and TopoJSON libraries with a local Natural
Earth backdrop. It needs no API key or tile-service account. Sources and
licenses are under `assets/lib/` and `assets/maps/`. Map assets load only on
pages with `places_map: true`; behavior lives in `assets/journey-player.js`.

## Work previews and attribution

Project preview text is in `_data/work.yml`. Shared source URLs are in
`_data/links.yml`; updating **`gpu_paper`** changes
the paper links in both languages.

The KAIST entry identifies the Android application-prototype contribution
and explicitly distinguishes it from authorship of the E-Gesture paper.
The IEEE-listed research/demo team is credited separately. LiftIgniter's
awards and finalist placement are presented as company achievements.

The gesture-player preview uses the original video's thumbnail and links to
YouTube. Its source is documented in `assets/images/README.md`.

The LiftIgniter team-photo link points to HuffPost's "Silicon Valley's Catch 22s
for Foreign Founders" article; its URL is `liftigniter_profile` in `_data/links.yml`.

Education follows the map. Edit `_data/education.yml` for its shared newest-first
card layout, university dates, projects, advisors, and the public dissertation
title with its NDA / Confidential label.

## Korean typography

Korean pages use self-hosted **Pretendard Variable 1.3.9**, including headings.
It is distributed under the **SIL Open Font License 1.1**, which permits web
embedding and commercial use under its terms. The unmodified font, copyright
notice, complete license, and source reference are in `assets/fonts/pretendard/`.
`assets/korean-font.css` loads only on Korean pages; no external font service is
needed at runtime.

The 한국어 language link on English pages uses two unmodified upstream font
subsets (about 42 KB total), registered in `assets/main.scss`. This makes the
switcher readable on systems without installed Korean fonts. Sources and the
shared license are documented in `assets/fonts/pretendard/README.md`.

## Languages

Use **English / 한국어** in the header to switch languages. A page's
`translation_key` connects it to its counterpart, so switching on Background,
Interests, Writing, or a translated post opens the matching page.

The browser remembers a language selected through the switch. Returning to
the root homepage `/` applies that preference. Direct links to other pages,
including `/ko/`, keep their explicit language. The links work without
JavaScript; remembering choices and applying a homepage language preference
are optional JavaScript enhancements.

Set the first-visit homepage language in `_config.yml`:

```yaml
default_language: en # or ko
```

Keep `lang: en` as the base language; individual Korean pages use `lang: ko`.
The `default_language` setting controls entry-page preference, not the
language of existing Markdown. Restart the preview after changing settings.

Each language has its own homepage post list, writing archive, and RSS feed
(`/feed.xml` and `/ko/feed.xml`). Head metadata includes the page language and
alternate-language URLs only where a corresponding translation exists.

## Write a post

1. For English, copy `_templates/post.md` into `_posts/`. For Korean, copy
   `_templates/post.ko.md` into `ko/_posts/`.
2. Name it `YYYY-MM-DD-your-post-slug.md`, using the publication date.
3. Set the title and an optional one-sentence description.
4. Write your post below the closing `---`.

```markdown
---
layout: post
lang: en
original_lang: en
translation_key: ""
title: "Your post title"
description: "An optional summary for the writing index."
---

Your writing goes here.
```

The homepage shows the three newest posts in its language. The Writing page
lists that language's posts newest first. RSS and the sitemap update
automatically. Markdown supports headings, links, images, tables, footnotes, and fenced code blocks with a
language identifier for syntax highlighting.

### Link two versions of a post

Give the English and Korean files the same unique `translation_key`, for
example `translation_key: learning-in-public`. Keep `lang: en` in the English
file and `lang: ko` in the Korean file. The publication dates and wording can
be different; the shared key connects them. Leave the key empty for a
standalone post, or add a translation later.

When a post has no counterpart, the language switch opens the other
language's Writing page. Each version is a separate Markdown file, so you
control the wording in both languages.

### Label originals and LLM translations

Set `original_lang` to the language the article was originally written in, using
the same value on every version. For an LLM-generated translation, also add
`translation_method: llm`. For example:

```yaml
# English original
lang: en
original_lang: en
translation_key: example-article
```

```yaml
# Korean LLM translation of that article
lang: ko
original_lang: en
translation_method: llm
translation_key: example-article
```

Labels appear under article titles, in the Writing index, and in the homepage's
recent-post list. Available versions with the same `translation_key` and
`original_lang` link to each other: **Original · English** and **LLM translation ·
Korean**, with localized wording on Korean pages. Korean originals work the same
way with `original_lang: ko`. Translations without `translation_method: llm` get
a neutral **Translation** label; posts without `original_lang` have no labels.

For a local draft, put a Markdown file in `_drafts/` (English) or
`ko/_drafts/` (Korean) without a date prefix.
`./bin/dev` includes drafts in the preview; production builds exclude them.
Repository visibility still determines who can read committed draft source.
Posts dated in the future stay hidden until that date and a subsequent build.

## Visitor analytics

Production pages load [GoatCounter](https://www.goatcounter.com/) using
`goatcounter_url` in `_config.yml`. Sign in at
**https://colemakdvorak.goatcounter.com/** to view the site's statistics.

Tracking is enabled only when `JEKYLL_ENV=production`, which the GitHub Pages
workflow already sets. Local `./bin/dev` previews do not send page views.
Remove or empty `goatcounter_url` to disable tracking.

## Production build

With Ruby/Bundler on PATH:

```sh
JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter
```

In the original WSL workspace, prepend the local toolchain when needed:

```sh
PATH="$HOME/.local/share/github-page-tools/bin:$PATH" \
  JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter
```

## Publish to GitHub Pages

The configuration targets **https://colemakdvorak.github.io/** with an empty
`baseurl`. The GitHub repository is
[`colemakdvorak/colemakdvorak.github.io`](https://github.com/colemakdvorak/colemakdvorak.github.io),
and this clone's `origin` remote is:

```text
https://github.com/colemakdvorak/colemakdvorak.github.io.git
```

1. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
2. Commit and push the site to `main` when you're ready to publish.
3. Watch the **Deploy GitHub Pages** workflow in the Actions tab.

GitHub Free requires a public repository for Pages; GitHub Pro also supports
publishing from a private repository.

For a custom domain later, configure the domain and DNS in GitHub Pages,
update `url` in `_config.yml`, and keep `baseurl` empty.
