## ADDED Requirements

### Requirement: OpenAI protocol compatibility
The system SHALL use the OpenAI API protocol for AI service calls.

#### Scenario: Standard OpenAI endpoint
- **WHEN** no custom base URL is configured
- **THEN** system uses default OpenAI API endpoint `https://api.openai.com/v1`

#### Scenario: Custom endpoint
- **WHEN** `OPENAI_BASE_URL` environment variable is set
- **THEN** system uses the custom endpoint for API calls
- **THEN** system works with Azure OpenAI, Ollama, or other compatible services

### Requirement: API key configuration
The system SHALL require an API key for authentication.

#### Scenario: API key from environment
- **WHEN** `OPENAI_API_KEY` environment variable is set
- **THEN** system uses the key for API authentication

#### Scenario: Missing API key
- **WHEN** `OPENAI_API_KEY` is not set
- **THEN** system displays error "请设置 OPENAI_API_KEY 环境变量"
- **THEN** system falls back to manual input mode

### Requirement: Model configuration
The system SHALL support configuring the AI model.

#### Scenario: Default model
- **WHEN** no model is specified
- **THEN** system uses `gpt-4o-mini` as default

#### Scenario: Custom model from environment
- **WHEN** `OPENAI_MODEL` environment variable is set
- **THEN** system uses the specified model

#### Scenario: Custom model from config file
- **WHEN** `rosydawn.config.js` contains `ai.model` setting
- **THEN** system uses the configured model
- **THEN** environment variable takes precedence over config file

### Requirement: Configuration file support
The system SHALL support optional configuration via `rosydawn.config.js`.

#### Scenario: Config file exists
- **WHEN** `rosydawn.config.js` exists in project root
- **THEN** system loads AI configuration from `ai` section
- **THEN** system loads publish configuration from `publish` section

#### Scenario: Config file missing
- **WHEN** `rosydawn.config.js` does not exist
- **THEN** system uses environment variables and defaults
- **THEN** system operates normally without config file

### Requirement: Request timeout handling
The system SHALL handle API request timeouts gracefully.

#### Scenario: Request timeout
- **WHEN** AI API does not respond within 10 seconds
- **THEN** system aborts the request
- **THEN** system displays timeout warning
- **THEN** system falls back to manual input mode

### Requirement: Error handling
The system SHALL handle API errors gracefully.

#### Scenario: Network error
- **WHEN** network connection fails
- **THEN** system displays connection error message
- **THEN** system falls back to manual input mode

#### Scenario: API rate limit
- **WHEN** API returns rate limit error (429)
- **THEN** system displays rate limit warning
- **THEN** system falls back to manual input mode

#### Scenario: Invalid API key
- **WHEN** API returns authentication error (401)
- **THEN** system displays "API 密钥无效，请检查 OPENAI_API_KEY"
- **THEN** system falls back to manual input mode

### Requirement: Prompt templates
The system SHALL use structured prompts for AI generation.

#### Scenario: Article creation prompt
- **WHEN** generating title and slug for new article
- **THEN** prompt includes user's topic description
- **THEN** prompt requests Chinese title and English slug
- **THEN** prompt specifies slug format (lowercase, hyphens, no special chars)

#### Scenario: Article publish prompt
- **WHEN** generating metadata for publishing
- **THEN** prompt includes full article content
- **THEN** prompt includes existing tag vocabulary
- **THEN** prompt requests description (100-150 chars), tags, and commit message
- **THEN** prompt specifies Conventional Commits format for commit message

### Requirement: Response parsing
The system SHALL parse AI responses into structured data.

#### Scenario: Parse creation response
- **WHEN** AI returns title and slug
- **THEN** system extracts title as string
- **THEN** system extracts slug as string
- **THEN** system validates slug format (lowercase, hyphens only)

#### Scenario: Parse publish response
- **WHEN** AI returns publish metadata
- **THEN** system extracts description as string
- **THEN** system extracts tags as array
- **THEN** system extracts commit message as string

#### Scenario: Invalid response format
- **WHEN** AI response cannot be parsed
- **THEN** system displays parsing error
- **THEN** system falls back to manual input mode

### Requirement: Configuration priority
The system SHALL follow a defined priority for configuration sources.

#### Scenario: Priority order
- **WHEN** loading configuration
- **THEN** environment variables take highest priority
- **THEN** `rosydawn.config.js` takes second priority
- **THEN** built-in defaults take lowest priority
