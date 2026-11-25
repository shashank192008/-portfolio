# God Shashank — Personal Portfolio

A responsive, single-page developer portfolio for **God Shashank** — Student Developer and Aspiring Software Engineer.

Built with plain HTML, CSS, and vanilla JavaScript. No build step, no frameworks, and no runtime dependencies — ready for GitHub Pages.

## Preview locally

Open `index.html` directly, or serve the folder:

```bash
cd student-profile
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content, sections, metadata, inline SVG icons |
| `styles.css` | Theme tokens, layout, components, animations, responsive rules |
| `script.js` | Theme, navigation, tabs, filters, GitHub data, form validation |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |
| `README.md` | This guide |

## Features

- Dark and light themes with system detection and saved preference (`localStorage`)
- Sticky glass header with animated active-link indicator and scroll spy
- Mobile menu with keyboard and outside-click dismissal
- Scroll progress bar and back-to-top button
- Scroll-reveal animations that respect `prefers-reduced-motion`
- Accessible skill tabs with arrow-key navigation
- Project category filters
- Live GitHub profile snapshot with a cached, graceful fallback
- Copy-to-clipboard GitHub username
- Contact form with inline validation, spam honeypot, and a configurable endpoint
- SEO metadata, Open Graph tags, JSON-LD Person schema, and an inline SVG favicon
- Responsive from small phones to wide desktops

## Customize

### 1. Personal details

The site uses the name **God Shashank** and GitHub profile **[@shashank192008](https://github.com/shashank192008)**. If anything changes, update it in `index.html` and the `GITHUB_USER` constant in `script.js`.

### 2. VolunteerHub project

The public GitHub account does not expose a VolunteerHub repository yet, so the card deliberately avoids inventing features, technologies, or URLs. Add verified details here in `index.html`:

- Search for `VolunteerHub` in the project section.
- Replace the overview copy with a real description.
- Add a `<ul class="project-features">` list and a `<ul class="tech-chips">` list.
- Add real links inside `.project-links` (GitHub and/or live demo).
- Update the badge and `data-category` if needed.

### 3. Education and milestones

No education, work experience, certifications, or awards are invented. Add real education entries to the timeline in `index.html` (look for the comment above `<ol class="timeline">`), using the same `.timeline-item` markup.

### 4. Skills

The skills list combines the stack used in MSME Sahayak with common web fundamentals. Remove anything you do not actually use, and add new cards to the relevant `.skill-panel` in `index.html`. Each card follows this pattern:

```html
<article class="skill-card">
  <span class="skill-icon icon-ts" aria-hidden="true">TS</span>
  <div><h3>TypeScript</h3><p>Typed JavaScript for reliable applications.</p></div>
</article>
```

### 5. Contact form

The form validates input and is ready to submit, but no endpoint is configured yet. To receive messages:

1. Create a form endpoint (for example [Formspree](https://formspree.io/), [Getform](https://getform.io/), or your own API).
2. Open `script.js` and set:

```js
var CONTACT_ENDPOINT = "https://formspree.io/f/your-id";
```

Until then, the form shows a clear message pointing visitors to GitHub. No email address or LinkedIn URL was provided, so neither is displayed. Add verified links in `index.html` when available.

### 6. Colors and type

Edit the `:root` and `html[data-theme="dark"]` blocks at the top of `styles.css`.

- `--accent`, `--accent-2`, `--accent-3` drive the gradients and highlights.
- `--bg`, `--surface`, `--text`, `--muted`, `--border` control the surfaces.
- Fonts: Sora (display), Inter (body), JetBrains Mono (code) via Google Fonts.

## Deploy to GitHub Pages

### Option A — project site

1. Push these files to a GitHub repository, for example `portfolio`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch (usually `main`) and the `/ (root)` folder, then save.
5. GitHub publishes the site at `https://<username>.github.io/<repository>/`.

### Option B — user site

1. Create a repository named `<username>.github.io`.
2. Push the contents of this folder to the `main` branch.
3. The site publishes at `https://<username>.github.io/`.

No build command or environment variables are required. The `.nojekyll` file prevents Jekyll from processing the static assets.

## Notes

- No external images are used, so there are no broken image links. Project visuals are CSS/SVG previews, clearly labelled.
- The GitHub section fetches only public profile and repository data, caches it for 10 minutes, and falls back to the verified profile details written into the page if the API is unavailable.
- The contribution graph is not fetched (GitHub does not expose it without authentication); the section links to the real profile instead.
