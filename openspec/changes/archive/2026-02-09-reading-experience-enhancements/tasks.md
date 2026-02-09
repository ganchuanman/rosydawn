## 1. Dark Mode - CSS Variables & Infrastructure

- [x] 1.1 Add `html[data-theme="dark"]` CSS variable overrides in `src/layouts/Layout.astro` (all 12 variables with GitHub Dark-style values)
- [x] 1.2 Add inline blocking script in `<head>` of `Layout.astro` to read localStorage and set `data-theme` before paint (FOUC prevention)
- [x] 1.3 Add theme toggle button (sun/moon SVG icon) to the site header nav area in `src/pages/blog/[...slug].astro`
- [x] 1.4 Add theme toggle button to site header in `src/pages/index.astro`, `src/pages/blog/[...page].astro`, `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`, and `src/pages/about.astro`
- [x] 1.5 Implement toggle click handler: switch `data-theme`, update localStorage, swap icon (with try-catch for localStorage unavailability)

## 2. Dark Mode - Code Block Dual Themes

- [x] 2.1 Update `astro.config.mjs` to configure Shiki with dual themes (`themes: { light: 'one-light', dark: 'github-dark' }`)
- [x] 2.2 Add CSS to switch `--astro-code-*` variables based on `data-theme="dark"` selector so code blocks match the active theme

## 3. Reading Progress Bar

- [x] 3.1 Add progress bar `<div>` element in article detail page
- [x] 3.2 Add scroll event listener to update progress bar width

## 4. Estimated Reading Time

- [x] 4.1 In `src/pages/blog/[...slug].astro` frontmatter script, extract article body text and calculate reading time
- [x] 4.2 Display reading time in `meta-line` after date and before tags, formatted as `· X 分钟`

## 5. Previous / Next Article Navigation

- [x] 5.1 Update `getStaticPaths` to sort all posts by date and inject `prevPost` and `nextPost`
- [x] 5.2 Add prev/next navigation component in `article-footer`
- [x] 5.3 Style the navigation links: hover color change, spacing, responsive layout

## 6. Cross-Cutting Concerns

- [x] 6.1 Verify all existing components render correctly in dark mode (diagrams, blockquotes, tables, images, scrollbar, selection color)
- [x] 6.2 Test dark mode toggle persistence across page navigation and full reload
- [x] 6.3 Test progress bar behavior on short articles (no scroll needed) and very long articles
- [x] 6.4 Verify prev/next navigation at boundary articles (first and last post)
- [x] 6.5 Test mobile responsiveness for all new features (toggle button, progress bar, reading time, prev/next nav)
