## ADDED Requirements

### Requirement: Dark CSS variable set
The system SHALL define a complete set of dark theme CSS variables under the `html[data-theme="dark"]` selector, covering all 12 existing `:root` variables (`--bg`, `--bg-secondary`, `--bg-tertiary`, `--text`, `--text-muted`, `--text-dim`, `--accent`, `--accent-dim`, `--accent-light`, `--border`, `--border-light`, `--code-bg`).

#### Scenario: Dark variables override light defaults
- **WHEN** the `<html>` element has `data-theme="dark"`
- **THEN** all 12 CSS variables SHALL resolve to their dark theme values

#### Scenario: Light theme remains default
- **WHEN** the `<html>` element has no `data-theme` attribute or `data-theme="light"`
- **THEN** all CSS variables SHALL resolve to their existing light theme values defined in `:root`

### Requirement: System preference auto-detection
The system SHALL detect the user's OS color scheme preference via `prefers-color-scheme` media query and apply the matching theme on initial page load when no user override is stored.

#### Scenario: System prefers dark, no stored preference
- **WHEN** the user's OS is set to dark mode
- **AND** no theme preference exists in localStorage
- **THEN** the system SHALL set `data-theme="dark"` on `<html>`

#### Scenario: System prefers light, no stored preference
- **WHEN** the user's OS is set to light mode
- **AND** no theme preference exists in localStorage
- **THEN** the system SHALL NOT set `data-theme` (light is default)

### Requirement: Manual theme toggle
The system SHALL provide a toggle button in the site header navigation area that allows users to switch between light and dark themes. The toggle button SHALL be vertically centered with other navigation elements.

#### Scenario: User toggles from light to dark
- **WHEN** the current theme is light
- **AND** the user clicks the theme toggle button
- **THEN** the system SHALL set `data-theme="dark"` on `<html>`
- **AND** the page SHALL immediately reflect dark theme colors without reload

#### Scenario: User toggles from dark to light
- **WHEN** the current theme is dark
- **AND** the user clicks the theme toggle button
- **THEN** the system SHALL remove `data-theme` from `<html>` (or set to `"light"`)
- **AND** the page SHALL immediately reflect light theme colors without reload

#### Scenario: Toggle icon reflects current state
- **WHEN** the theme is light
- **THEN** the toggle button SHALL display a moon icon (indicating "switch to dark")
- **WHEN** the theme is dark
- **THEN** the toggle button SHALL display a sun icon (indicating "switch to light")

#### Scenario: Toggle button vertical alignment
- **WHEN** the Header is rendered
- **THEN** the theme toggle button SHALL be vertically centered with adjacent navigation links
- **AND** the button's visual center SHALL align with the text baseline of navigation links

### Requirement: Theme preference persistence
The system SHALL persist the user's manual theme choice to localStorage and restore it on subsequent page loads, overriding the system preference.

#### Scenario: Preference stored on toggle
- **WHEN** the user clicks the theme toggle
- **THEN** the system SHALL write the selected theme (`"dark"` or `"light"`) to `localStorage` under a defined key

#### Scenario: Stored preference restored on load
- **WHEN** a theme preference exists in localStorage
- **THEN** the system SHALL apply the stored theme before the page renders (no flash of wrong theme)

#### Scenario: Stored preference restored after View Transitions navigation
- **WHEN** a theme preference exists in localStorage
- **AND** the user navigates to another page via View Transitions (SPA navigation)
- **THEN** the system SHALL restore the stored theme after the DOM swap completes
- **AND** the new page SHALL display with the correct theme without flashing the wrong theme

#### Scenario: localStorage unavailable
- **WHEN** localStorage is not available (e.g., private browsing restrictions)
- **THEN** the system SHALL fall back to system preference detection
- **AND** the toggle SHALL still work for the current session without persistence

### Requirement: No flash of unstyled content (FOUC)
The system SHALL apply the correct theme before any visible content renders to prevent a flash of the wrong theme.

#### Scenario: Inline blocking script initializes theme
- **WHEN** the page begins loading
- **THEN** an inline script in `<head>` SHALL read the stored preference (or detect system preference) and set `data-theme` on `<html>` before the browser paints

### Requirement: Code block dark theme
The system SHALL configure Shiki syntax highlighting with dual themes so that code blocks display appropriate colors in both light and dark modes.

#### Scenario: Code blocks in dark mode
- **WHEN** the theme is dark
- **THEN** code blocks SHALL render with a dark-compatible color scheme (e.g., `github-dark`)

#### Scenario: Code blocks in light mode
- **WHEN** the theme is light
- **THEN** code blocks SHALL render with the existing light color scheme (`one-light`)
