## ADDED Requirements

### Requirement: Header component structure
The system SHALL provide a reusable `Header.astro` component containing the site logo, navigation links, and theme toggle button.

#### Scenario: Header displays on all pages
- **WHEN** any page is rendered
- **THEN** the Header component SHALL display the logo linking to home, navigation links (文章, 分类, 关于), and theme toggle button

#### Scenario: Logo links to home
- **WHEN** a user clicks the logo
- **THEN** the browser SHALL navigate to the root path `/`

#### Scenario: Navigation links are functional
- **WHEN** a user clicks a navigation link
- **THEN** the browser SHALL navigate to the corresponding page (`/`, `/tags`, `/about`)

### Requirement: Footer component structure
The system SHALL provide a reusable `Footer.astro` component containing site credits and external links.

#### Scenario: Footer displays attribution
- **WHEN** any page is rendered
- **THEN** the Footer component SHALL display text containing "developed with llm and openspec"

#### Scenario: OpenSpec link
- **WHEN** the Footer is rendered
- **THEN** the text "openspec" SHALL be a hyperlink to `https://github.com/Fission-AI/OpenSpec`
- **AND** the link SHALL open in a new tab with `rel="noopener"`

#### Scenario: Astro attribution preserved
- **WHEN** the Footer is rendered
- **THEN** the Footer SHALL include "built with astro" with a link to `https://astro.build`

### Requirement: Component file location
The Header and Footer components SHALL be located in the `src/components/` directory.

#### Scenario: Component paths
- **WHEN** a developer needs to import the components
- **THEN** Header SHALL be importable from `@components/Header.astro` or `../components/Header.astro`
- **AND** Footer SHALL be importable from `@components/Footer.astro` or `../components/Footer.astro`

### Requirement: Single source of truth
All pages SHALL import and use the shared Header and Footer components instead of duplicating navigation markup.

#### Scenario: No inline navigation in pages
- **WHEN** examining any page file in `src/pages/`
- **THEN** the page SHALL NOT contain duplicated header/nav markup
- **AND** the page SHALL import and render the Header component

#### Scenario: No inline footer in pages
- **WHEN** examining any page file in `src/pages/`
- **THEN** the page SHALL NOT contain duplicated footer markup
- **AND** the page SHALL import and render the Footer component

### Requirement: Consistent styling
The Header and Footer components SHALL maintain the existing visual appearance and styling.

#### Scenario: Header styling preserved
- **WHEN** the Header component is rendered
- **THEN** the layout SHALL use flexbox with space-between alignment
- **AND** the logo SHALL use monospace font with terminal-style cursor animation
- **AND** navigation links SHALL have hover effects matching current behavior

#### Scenario: Footer styling preserved
- **WHEN** the Footer component is rendered
- **THEN** the Footer SHALL have top border, appropriate padding, and muted text color
- **AND** links SHALL have hover effects matching current behavior

### Requirement: Responsive behavior
The Header component SHALL adapt layout for mobile viewports.

#### Scenario: Mobile layout
- **WHEN** the viewport width is below 640px
- **THEN** the Header SHALL switch to column layout with centered content
