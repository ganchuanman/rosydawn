## ADDED Requirements

### Requirement: Reading progress bar display
The system SHALL display a thin horizontal progress bar fixed to the top of the viewport on article detail pages, indicating how far the user has scrolled through the article.

#### Scenario: Progress bar visible on article pages
- **WHEN** the user is on an article detail page (`/blog/<slug>`)
- **THEN** a progress bar SHALL be visible at the top of the viewport
- **AND** the bar SHALL have a height of 2px
- **AND** the bar SHALL use `var(--accent)` as its background color

#### Scenario: Progress bar not shown on non-article pages
- **WHEN** the user is on the homepage, tag pages, or about page
- **THEN** no reading progress bar SHALL be displayed

### Requirement: Progress bar tracks scroll position
The system SHALL update the progress bar width in real-time to reflect the user's scroll position as a percentage of the total scrollable article content.

#### Scenario: Page at top
- **WHEN** the user has not scrolled (scrollTop = 0)
- **THEN** the progress bar width SHALL be 0%

#### Scenario: Page at bottom
- **WHEN** the user has scrolled to the bottom of the page
- **THEN** the progress bar width SHALL be 100%

#### Scenario: Page scrolled midway
- **WHEN** the user has scrolled to 50% of the scrollable content
- **THEN** the progress bar width SHALL be approximately 50%

#### Scenario: Real-time update on scroll
- **WHEN** the user scrolls the page
- **THEN** the progress bar width SHALL update in real-time without perceptible delay

### Requirement: Progress bar z-index
The progress bar SHALL render above all other page elements, including fixed headers or sidebars.

#### Scenario: Progress bar layering
- **WHEN** the page contains fixed or sticky elements
- **THEN** the progress bar SHALL appear above them (z-index: 9999)
