## MODIFIED Requirements

### Requirement: Interactive topic input
The system SHALL prompt the user to enter a topic description when running `npm run content:new`.

#### Scenario: User enters topic description
- **WHEN** user runs `npm run content:new`
- **THEN** system displays prompt "这篇文章的核心主题是什么？"
- **THEN** user can enter free-form text describing the article topic

### Requirement: AI generates article metadata
The system SHALL call the AI service to generate title and slug based on the topic description.

#### Scenario: Successful AI generation
- **WHEN** user submits a topic description
- **THEN** system displays "正在生成文章信息..."
- **THEN** system calls AI service with the topic description
- **THEN** AI returns a Chinese title and URL-friendly English slug

#### Scenario: Topic about React Server Components
- **WHEN** user enters "想写一篇介绍 React Server Components 原理和实践的文章，面向有 React 基础的开发者"
- **THEN** AI generates title like "React Server Components 原理与实践"
- **THEN** AI generates slug like "react-server-components"

### Requirement: Preview before creation
The system SHALL display generated metadata for user confirmation before creating files.

#### Scenario: User confirms creation
- **WHEN** AI generation completes
- **THEN** system displays preview with title, directory path, and filename
- **THEN** system prompts "确认创建？ (Y/n)"
- **THEN** user can confirm with Y or cancel with n

#### Scenario: User cancels creation
- **WHEN** user enters "n" at confirmation prompt
- **THEN** system exits without creating any files
- **THEN** system displays cancellation message

### Requirement: Create article directory structure
The system SHALL create the article directory following the pattern `src/content/posts/{year}/{month}/{slug}/index.md`.

#### Scenario: Directory creation
- **WHEN** user confirms creation
- **THEN** system creates directory `src/content/posts/2026/02/{slug}/`
- **THEN** system creates file `index.md` in that directory

#### Scenario: Slug directory already exists
- **WHEN** the target slug directory already exists
- **THEN** system prompts user to choose a different slug or overwrite

### Requirement: Generate article skeleton
The system SHALL create an `index.md` file with frontmatter template.

#### Scenario: Frontmatter generation
- **WHEN** file is created
- **THEN** frontmatter contains `title` from AI
- **THEN** frontmatter contains `date` as current date (YYYY-MM-DD format)
- **THEN** frontmatter contains empty `description: ""`
- **THEN** frontmatter contains empty `tags: []`
- **THEN** file contains placeholder comment for writing

### Requirement: Start development server
The system SHALL start the Astro dev server after file creation.

#### Scenario: Dev server not running
- **WHEN** port 4321 is not in use
- **THEN** system executes `npm run dev`
- **THEN** system waits for server to be ready
- **THEN** system displays preview URL `http://localhost:4321/blog/{slug}`

#### Scenario: Dev server already running
- **WHEN** port 4321 is already in use
- **THEN** system skips starting dev server
- **THEN** system displays preview URL using existing server

### Requirement: Display completion summary
The system SHALL display a summary with file path and preview URL after completion.

#### Scenario: Successful completion
- **WHEN** all steps complete successfully
- **THEN** system displays the file path for editing
- **THEN** system displays the preview URL
- **THEN** system suggests running `npm run content:publish` when done (updated from `npm run publish`)

### Requirement: Graceful degradation without AI
The system SHALL allow manual input when AI service is unavailable.

#### Scenario: AI service timeout
- **WHEN** AI service does not respond within 10 seconds
- **THEN** system prompts user to manually enter title
- **THEN** system prompts user to manually enter slug

#### Scenario: AI service error
- **WHEN** AI service returns an error
- **THEN** system displays error message
- **THEN** system prompts user to manually enter title and slug
