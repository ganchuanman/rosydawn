## MODIFIED Requirements

### Requirement: Detect article changes
The system SHALL detect new and modified articles in `src/content/posts/` using git status when running `npm run content:publish`.

#### Scenario: New article detected
- **WHEN** user runs `npm run content:publish`
- **THEN** system runs `git status` to find changes in `src/content/posts/`
- **THEN** system identifies new files as "[新增]"
- **THEN** system displays article title and file path

#### Scenario: Modified article detected
- **WHEN** an existing article file has been modified
- **THEN** system identifies it as "[修改]"
- **THEN** system displays article title and file path

#### Scenario: No changes detected
- **WHEN** no article files have changed
- **THEN** system displays "没有待发布的文章"
- **THEN** system exits without further action

### Requirement: AI generates article metadata
The system SHALL call AI to generate description, tags, and commit message based on article content.

#### Scenario: Successful metadata generation
- **WHEN** article changes are detected
- **THEN** system displays "正在分析文章内容..."
- **THEN** system reads the full article content
- **THEN** system calls AI with article content
- **THEN** AI returns description (100-150 characters), tags array, and commit message

#### Scenario: Description generation
- **WHEN** AI analyzes article content
- **THEN** AI generates a 100-150 character description summarizing the article
- **THEN** description accurately reflects the article's main points

### Requirement: Tags recommendation with existing vocabulary
The system SHALL recommend tags based on existing tag vocabulary in the codebase.

#### Scenario: Build tag vocabulary
- **WHEN** analyzing article for tags
- **THEN** system scans all existing articles in `src/content/posts/`
- **THEN** system extracts all tags from frontmatter to build vocabulary

#### Scenario: Prefer existing tags
- **WHEN** AI recommends tags
- **THEN** AI is provided with existing tag vocabulary as context
- **THEN** AI prioritizes tags from existing vocabulary
- **THEN** new tags follow the same naming convention as existing ones

### Requirement: Generate commit message
The system SHALL generate a commit message following Conventional Commits format.

#### Scenario: New article commit
- **WHEN** publishing a new article
- **THEN** commit message follows format `feat(blog): add article about <topic>`

#### Scenario: Modified article commit
- **WHEN** publishing a modified article
- **THEN** commit message follows format `fix(blog): update <article-title>` or similar

### Requirement: Preview before publishing
The system SHALL display generated metadata for user confirmation.

#### Scenario: Display preview
- **WHEN** AI generation completes
- **THEN** system displays generated description
- **THEN** system displays recommended tags
- **THEN** system displays proposed commit message
- **THEN** system prompts "确认以上信息？ (Y/n/e)"

#### Scenario: User confirms
- **WHEN** user enters "Y"
- **THEN** system proceeds with publishing

#### Scenario: User cancels
- **WHEN** user enters "n"
- **THEN** system exits without making changes

#### Scenario: User edits
- **WHEN** user enters "e"
- **THEN** system allows user to modify description, tags, or commit message
- **THEN** system re-displays for confirmation

### Requirement: Update frontmatter
The system SHALL update the article's frontmatter with generated metadata.

#### Scenario: Write description
- **WHEN** user confirms publishing
- **THEN** system updates `description` field in frontmatter

#### Scenario: Write tags
- **WHEN** user confirms publishing
- **THEN** system updates `tags` array in frontmatter

### Requirement: Final confirmation before git operations
The system SHALL display a summary of all changes and require explicit user confirmation before executing git commit and push.

#### Scenario: Display final summary
- **WHEN** frontmatter updates are ready
- **THEN** system displays section "即将提交的变更："
- **THEN** system displays commit message
- **THEN** system displays list of changed files with diff summary
- **THEN** system displays article count and total changes summary
- **THEN** system prompts "确认提交并推送？ (Y/n)"

#### Scenario: User confirms final publish
- **WHEN** user enters "Y" at final confirmation
- **THEN** system proceeds with git add, commit, and push

#### Scenario: User cancels final publish
- **WHEN** user enters "n" at final confirmation
- **THEN** system exits without git operations
- **THEN** frontmatter changes are preserved in files (not committed)
- **THEN** system displays "已取消发布，文件变更已保留"

### Requirement: Git commit and push
The system SHALL commit changes and push to remote repository after user confirms.

#### Scenario: Successful publish
- **WHEN** user confirms final publish
- **THEN** system runs `git add` for changed files
- **THEN** system runs `git commit` with generated message
- **THEN** system runs `git push origin <current-branch>`
- **THEN** system displays success message

#### Scenario: Push failure
- **WHEN** `git push` fails (network or conflict)
- **THEN** system displays error message
- **THEN** system preserves local commit
- **THEN** system suggests manual resolution

### Requirement: Batch processing
The system SHALL support processing multiple changed articles.

#### Scenario: Multiple articles changed
- **WHEN** multiple articles have changes
- **THEN** system lists all changed articles
- **THEN** system processes each article sequentially
- **THEN** system creates a single commit for all changes

### Requirement: Graceful degradation without AI
The system SHALL allow manual input when AI service is unavailable.

#### Scenario: AI service unavailable
- **WHEN** AI service is not accessible
- **THEN** system prompts user to manually enter description
- **THEN** system prompts user to manually enter tags
- **THEN** system prompts user to manually enter commit message
