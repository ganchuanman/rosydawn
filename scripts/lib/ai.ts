import OpenAI from 'openai';
import type { AIConfig } from './config.js';

const AI_TIMEOUT_MS = 10000;

export interface ArticleMetadata {
  title: string;
  slug: string;
}

export interface PublishMetadata {
  description: string;
  tags: string[];
  commitMessage: string;
}

export type AIResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function createClient(config: AIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: AI_TIMEOUT_MS,
  });
}

export async function generateArticleMetadata(
  config: AIConfig,
  topicDescription: string
): Promise<AIResult<ArticleMetadata>> {
  const client = createClient(config);

  const prompt = `你是一个博客文章元信息生成助手。根据用户提供的主题描述，生成合适的文章标题和 URL slug。

要求：
1. 标题：使用中文，简洁明了，能准确概括文章主题
2. slug：使用英文，全部小写，单词之间用连字符（-）连接，不包含特殊字符，**限制在 2-4 个单词之间**（例如：react-hooks-guide, typescript-basics）

请以 JSON 格式返回，格式如下：
{"title": "文章标题", "slug": "short-slug"}

用户主题描述：${topicDescription}`;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'AI 返回内容为空' };
    }

    const parsed = JSON.parse(content) as ArticleMetadata;

    if (!parsed.title || !parsed.slug) {
      return { success: false, error: 'AI 返回格式不正确' };
    }

    const slug = parsed.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    return {
      success: true,
      data: { title: parsed.title, slug },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return { success: false, error: 'AI 服务响应超时' };
      }
      if (error.message.includes('401')) {
        return { success: false, error: 'API 密钥无效，请检查 OPENAI_API_KEY' };
      }
      if (error.message.includes('429')) {
        return { success: false, error: 'API 请求频率限制，请稍后重试' };
      }
      return { success: false, error: `AI 服务错误: ${error.message}` };
    }
    return { success: false, error: 'AI 服务未知错误' };
  }
}

export async function generatePublishMetadata(
  config: AIConfig,
  articleContent: string,
  existingTags: string[],
  isNew: boolean
): Promise<AIResult<PublishMetadata>> {
  const client = createClient(config);

  const tagsContext = existingTags.length > 0
    ? `现有标签词库：${existingTags.join(', ')}\n优先从词库中选择合适的标签，如需新标签请保持命名风格一致。`
    : '暂无现有标签。';

  const commitPrefix = isNew ? 'feat(blog): add article about' : 'fix(blog): update';

  const prompt = `你是一个博客文章元信息生成助手。根据文章内容，生成摘要、标签和 commit message。

要求：
1. description：100-150 字的中文摘要，概括文章核心内容
2. tags：2-5 个标签，${tagsContext}
3. commitMessage：遵循 Conventional Commits 格式，前缀使用 "${commitPrefix}"

请以 JSON 格式返回，格式如下：
{"description": "文章摘要", "tags": ["标签1", "标签2"], "commitMessage": "feat(blog): add article about xxx"}

文章内容：
${articleContent.slice(0, 8000)}`;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'AI 返回内容为空' };
    }

    const parsed = JSON.parse(content) as PublishMetadata;

    if (!parsed.description || !parsed.tags || !parsed.commitMessage) {
      return { success: false, error: 'AI 返回格式不正确' };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return { success: false, error: 'AI 服务响应超时' };
      }
      if (error.message.includes('401')) {
        return { success: false, error: 'API 密钥无效，请检查 OPENAI_API_KEY' };
      }
      if (error.message.includes('429')) {
        return { success: false, error: 'API 请求频率限制，请稍后重试' };
      }
      return { success: false, error: `AI 服务错误: ${error.message}` };
    }
    return { success: false, error: 'AI 服务未知错误' };
  }
}
