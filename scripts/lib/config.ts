import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export interface AIConfig {
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
}

export interface PublishConfig {
  autoPush: boolean;
  commitPrefix: string;
}

export interface Config {
  ai: AIConfig;
  publish: PublishConfig;
}

interface RosydawnConfigFile {
  ai?: {
    baseUrl?: string;
    model?: string;
  };
  publish?: {
    autoPush?: boolean;
    commitPrefix?: string;
  };
}

const DEFAULT_CONFIG: Config = {
  ai: {
    apiKey: undefined,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  publish: {
    autoPush: true,
    commitPrefix: 'feat',
  },
};

async function loadConfigFile(): Promise<RosydawnConfigFile | null> {
  const configPath = resolve(process.cwd(), 'rosydawn.config.js');

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const configUrl = pathToFileURL(configPath).href;
    const module = await import(configUrl);
    return module.default || module;
  } catch {
    return null;
  }
}

export async function loadConfig(): Promise<Config> {
  const fileConfig = await loadConfigFile();

  const config: Config = {
    ai: {
      apiKey: process.env.OPENAI_API_KEY || DEFAULT_CONFIG.ai.apiKey,
      baseUrl: process.env.OPENAI_BASE_URL || fileConfig?.ai?.baseUrl || DEFAULT_CONFIG.ai.baseUrl,
      model: process.env.OPENAI_MODEL || fileConfig?.ai?.model || DEFAULT_CONFIG.ai.model,
    },
    publish: {
      autoPush: fileConfig?.publish?.autoPush ?? DEFAULT_CONFIG.publish.autoPush,
      commitPrefix: fileConfig?.publish?.commitPrefix || DEFAULT_CONFIG.publish.commitPrefix,
    },
  };

  return config;
}

export function validateAIConfig(config: Config): { valid: boolean; error?: string } {
  if (!config.ai.apiKey) {
    return { valid: false, error: '请设置 OPENAI_API_KEY 环境变量' };
  }
  return { valid: true };
}
