## MODIFIED Requirements

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
