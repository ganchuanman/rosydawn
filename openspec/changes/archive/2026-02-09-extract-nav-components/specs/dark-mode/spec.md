## MODIFIED Requirements

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
