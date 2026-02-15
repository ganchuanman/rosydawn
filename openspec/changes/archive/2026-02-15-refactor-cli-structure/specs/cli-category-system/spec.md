## ADDED Requirements

### Requirement: Three-tier command categorization
The system SHALL organize all npm scripts into three main categories: Development (dev), Content (content), and Deployment (deploy).

#### Scenario: Development category commands
- **WHEN** user views available commands
- **THEN** system displays dev category containing: dev, build, preview
- **THEN** each command is clearly labeled as development-related

#### Scenario: Content category commands
- **WHEN** user views available commands
- **THEN** system displays content category containing: content:new, content:publish
- **THEN** each command is clearly labeled as content creation related

#### Scenario: Deployment category commands
- **WHEN** user views available commands
- **THEN** system displays deploy category containing: deploy:build, deploy:ssl, deploy:renew, deploy:status, deploy:cron, deploy:cron:install, deploy:cron:remove, deploy:cron:status
- **THEN** each command is clearly labeled as deployment related

### Requirement: Consistent category naming
The system SHALL use consistent naming pattern `<category>:<action>` for all categorized commands.

#### Scenario: Content command naming
- **WHEN** user runs a content command
- **THEN** command follows format `content:<action>`
- **THEN** action is a clear verb describing the operation (e.g., new, publish)

#### Scenario: Deploy command naming
- **WHEN** user runs a deploy command
- **THEN** command follows format `deploy:<action>` or `deploy:<subsystem>:<action>`
- **THEN** subsystem is optional for grouping related operations (e.g., deploy:cron:install)

### Requirement: Category documentation
The system SHALL provide clear documentation for each command category explaining its purpose.

#### Scenario: README documentation structure
- **WHEN** user reads the README
- **THEN** commands are organized under category headers
- **THEN** each category has a brief description of its purpose
- **THEN** commands within each category are listed with descriptions

#### Scenario: Category purpose clarity
- **WHEN** user views dev category
- **THEN** description explains these are for local development and building
- **WHEN** user views content category
- **THEN** description explains these are for creating and publishing blog content
- **WHEN** user views deploy category
- **THEN** description explains these are for deployment and server management
