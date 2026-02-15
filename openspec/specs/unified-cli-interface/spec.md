## ADDED Requirements

### Requirement: Consistent command naming format
The system SHALL enforce a consistent `<category>:<action>` naming format for all new commands.

#### Scenario: Standard format compliance
- **WHEN** a new command is added to the system
- **THEN** command name follows the pattern `<category>:<action>`
- **THEN** category is one of: dev, content, deploy
- **THEN** action is a lowercase verb or noun describing the operation

#### Scenario: Sub-category format
- **WHEN** a command needs further grouping within a category
- **THEN** command name follows the pattern `<category>:<subsystem>:<action>`
- **THEN** subsystem is optional and used for related operations
- **THEN** example: `deploy:cron:install` where cron is the subsystem

### Requirement: Package.json scripts organization
The system SHALL organize package.json scripts with clear section comments and grouping.

#### Scenario: Scripts section structure
- **WHEN** developer views package.json
- **THEN** scripts are grouped by category
- **THEN** each category has a comment line identifying it
- **THEN** related commands are placed adjacent to each other

#### Scenario: Comment format in package.json
- **WHEN** adding category comments
- **THEN** comments use format `// <Category Name> - <brief description>`
- **THEN** comments are placed before the first command in each category

### Requirement: Command discoverability
The system SHALL make it easy for users to discover available commands through documentation.

#### Scenario: README commands section
- **WHEN** user opens README.md
- **THEN** there is a dedicated "Commands" or "Available Scripts" section
- **THEN** commands are listed by category with descriptions
- **THEN** each command shows the exact npm run syntax

#### Scenario: Command examples
- **WHEN** user views command documentation
- **THEN** each command includes usage examples
- **THEN** examples show the full command (e.g., `npm run content:new`)
- **THEN** examples explain what the command does

### Requirement: No functional changes
The system SHALL ensure that command renaming does not change any functional behavior of the underlying scripts.

#### Scenario: Content:new replaces new
- **WHEN** user runs `npm run content:new`
- **THEN** system executes scripts/new.ts
- **THEN** all parameters and options work as before
- **THEN** output and behavior are unchanged

#### Scenario: Content:publish replaces publish
- **WHEN** user runs `npm run content:publish`
- **THEN** system executes scripts/publish.ts
- **THEN** all parameters and options work as before
- **THEN** output and behavior are unchanged

### Requirement: No additional dependencies
The system SHALL implement command categorization without adding new npm dependencies.

#### Scenario: Use existing package.json features
- **WHEN** implementing command categories
- **THEN** system uses only package.json scripts field
- **THEN** no new CLI framework libraries are installed
- **THEN** existing tsx and node commands are reused
