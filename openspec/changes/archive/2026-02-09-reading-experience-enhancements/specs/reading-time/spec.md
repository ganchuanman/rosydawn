## ADDED Requirements

### Requirement: Reading time calculation
The system SHALL calculate the estimated reading time for each article at build time based on the article's text content, using a reading speed of 400 characters per minute (optimized for Chinese text).

#### Scenario: Standard article
- **WHEN** an article contains 2000 characters of text content
- **THEN** the estimated reading time SHALL be 5 minutes (`Math.ceil(2000 / 400)`)

#### Scenario: Short article
- **WHEN** an article contains fewer than 400 characters
- **THEN** the estimated reading time SHALL be 1 minute (minimum value)

#### Scenario: Mixed content article
- **WHEN** an article contains both Chinese text and code blocks
- **THEN** the character count SHALL include all rendered text content (including code)

### Requirement: Reading time display
The system SHALL display the estimated reading time in the article's meta information area, positioned after the date and before the tags.

#### Scenario: Reading time in meta line
- **WHEN** the user views an article detail page
- **THEN** the reading time SHALL appear in the `meta-line` section
- **AND** it SHALL be formatted as `· X 分钟` (with a separator dot)
- **AND** it SHALL use the same font style as other meta information (monospace, muted color)

#### Scenario: Reading time with tags
- **WHEN** an article has both a reading time and tags
- **THEN** the display order SHALL be: date → reading time → tags
