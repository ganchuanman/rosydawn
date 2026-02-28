/**
 * AI 响应缓存 (实验性功能)
 *
 * 缓存 AI 意图识别结果，避免重复调用
 */

import type { IntentRecognitionResult } from './types.js';

interface CacheEntry {
  result: IntentRecognitionResult;
  timestamp: number;
  hits: number;
}

/**
 * AI 响应缓存管理器
 */
export class AIResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 300000) {
    this.maxSize = maxSize;
    this.ttl = ttl; // Default: 5 minutes

    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60000); // 每分钟清理一次
  }

  /**
   * 生成缓存键
   */
  private generateKey(userInput: string): string {
    // 简单的键生成：规范化用户输入
    return userInput.toLowerCase().trim();
  }

  /**
   * 获取缓存
   */
  get(userInput: string): IntentRecognitionResult | null {
    const key = this.generateKey(userInput);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 增加命中计数
    entry.hits++;

    console.log(`   💾 缓存命中 (已使用 ${entry.hits} 次)`);

    return entry.result;
  }

  /**
   * 设置缓存
   */
  set(userInput: string, result: IntentRecognitionResult): void {
    const key = this.generateKey(userInput);

    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 删除最旧的条目
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 0
    });

    console.log(`   💾 已缓存 (缓存大小: ${this.cache.size}/${this.maxSize})`);
  }

  /**
   * 查找最旧的缓存键
   */
  private findOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`   🧹 清理过期缓存: ${cleaned} 个`);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    console.log('   🧹 缓存已清空');
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; maxSize: number; totalHits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits
    };
  }
}

// 全局缓存实例 (实验性)
export const aiCache = new AIResponseCache(100, 300000); // 100 条，5 分钟 TTL
