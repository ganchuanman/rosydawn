## ADDED Requirements

### Requirement: Previous and next article links
The system SHALL display navigation links to the previous and next articles at the bottom of each article detail page, ordered by publication date.

#### Scenario: Article with both neighbors
- **WHEN** the current article has both a newer and an older article
- **THEN** the navigation SHALL display "上一篇" (previous/older) on the left and "下一篇" (next/newer) on the right
- **AND** each link SHALL show the target article's title

#### Scenario: First article (oldest)
- **WHEN** the current article is the oldest (no older articles exist)
- **THEN** the "上一篇" position SHALL be empty
- **AND** only "下一篇" SHALL be displayed on the right

#### Scenario: Last article (newest)
- **WHEN** the current article is the newest (no newer articles exist)
- **THEN** the "下一篇" position SHALL be empty
- **AND** only "上一篇" SHALL be displayed on the left

### Requirement: Navigation layout
The previous/next navigation SHALL use a two-column flex layout positioned in the article footer area, below the existing back link.

#### Scenario: Two-column layout
- **WHEN** both previous and next articles exist
- **THEN** the navigation SHALL display as two columns
- **AND** the left column SHALL be left-aligned (上一篇)
- **AND** the right column SHALL be right-aligned (下一篇)

#### Scenario: Navigation styling
- **WHEN** the navigation is displayed
- **THEN** labels ("← 上一篇" / "下一篇 →") SHALL use monospace font
- **AND** article titles SHALL be displayed below the labels
- **AND** titles SHALL change color on hover to indicate interactivity

### Requirement: Navigation ordering
Articles in the navigation SHALL be ordered by publication date, where "上一篇" links to the chronologically older article and "下一篇" links to the chronologically newer article.

#### Scenario: Correct ordering
- **WHEN** articles are published on Jan 1, Jan 5, and Jan 10
- **AND** the user is viewing the Jan 5 article
- **THEN** "上一篇" SHALL link to the Jan 1 article
- **AND** "下一篇" SHALL link to the Jan 10 article

### Requirement: Navigation links are build-time generated
The previous/next article data SHALL be computed at build time in `getStaticPaths`, not at runtime via client-side JavaScript.

#### Scenario: Static generation
- **WHEN** the site is built
- **THEN** each article page SHALL have its previous/next article data embedded in the HTML
- **AND** no client-side API calls SHALL be required for navigation
