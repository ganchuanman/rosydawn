/**
 * CommandRegistry - 统一管理命令映射和别名
 *
 * 提供命令注册、别名支持、参数验证和帮助文本生成
 */

export interface CommandOption {
  name: string;
  type: 'string' | 'boolean' | 'number';
  required: boolean;
  description: string;
  default?: any;
}

export interface CommandConfig {
  command: string;          // 命令名称（如 content:new）
  workflow: string;         // 对应的 workflow 名称
  description: string;      // 命令描述
  aliases?: string[];       // 命令别名
  options?: CommandOption[]; // 参数配置
  examples?: string[];      // 使用示例
  category?: string;        // 命令分类（content、deploy、system）
}

export class CommandRegistry {
  private commands = new Map<string, CommandConfig>();
  private aliases = new Map<string, string>();

  /**
   * 注册命令
   */
  register(config: CommandConfig): void {
    // 检查命令是否已存在
    if (this.commands.has(config.command)) {
      throw new Error(`命令 "${config.command}" 已注册`);
    }

    this.commands.set(config.command, config);

    // 注册命令的内置别名
    if (config.aliases) {
      for (const alias of config.aliases) {
        this.alias(alias, config.command);
      }
    }
  }

  /**
   * 注册命令别名
   */
  alias(name: string, target: string): void {
    // 检查别名是否与现有命令冲突
    if (this.commands.has(name)) {
      throw new Error(`别名 "${name}" 与已存在的命令冲突`);
    }

    // 检查别名是否已存在
    if (this.aliases.has(name)) {
      throw new Error(`别名 "${name}" 已存在`);
    }

    this.aliases.set(name, target);
  }

  /**
   * 解析命令（支持别名）
   */
  resolve(input: string): CommandConfig | null {
    // 先检查是否是别名
    const actualCommand = this.aliases.get(input) || input;

    // 返回命令配置
    return this.commands.get(actualCommand) || null;
  }

  /**
   * 生成帮助文本
   */
  getHelp(command?: string): string {
    if (!command) {
      return this.generateGlobalHelp();
    }

    const config = this.resolve(command);
    if (!config) {
      return `未知命令: ${command}\n使用 "rosydawn --help" 查看所有可用命令。`;
    }

    return this.generateCommandHelp(config);
  }

  /**
   * 获取所有命令（按类别分组）
   */
  getCommandsByCategory(): Map<string, CommandConfig[]> {
    const grouped = new Map<string, CommandConfig[]>();

    for (const config of this.commands.values()) {
      const category = config.category || 'other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(config);
    }

    return grouped;
  }

  /**
   * 验证所有 workflow 都有命令映射
   */
  validateCompleteness(workflows: string[]): string[] {
    const warnings: string[] = [];
    const registeredWorkflows = new Set(
      Array.from(this.commands.values()).map(c => c.workflow)
    );

    for (const workflow of workflows) {
      if (!registeredWorkflows.has(workflow)) {
        warnings.push(`Workflow "${workflow}" 没有对应的命令映射`);
      }
    }

    return warnings;
  }

  /**
   * 生成全局帮助文本
   */
  private generateGlobalHelp(): string {
    const lines: string[] = [
      'Rosydawn - 个人技术博客系统 CLI',
      '',
      'Usage:',
      '  rosydawn [options]',
      '  rosydawn <command> [options]',
      '',
      'Commands:'
    ];

    // 按类别分组显示命令
    const grouped = this.getCommandsByCategory();
    const categoryOrder = ['content', 'deploy', 'system'];

    for (const category of categoryOrder) {
      const commands = grouped.get(category);
      if (commands && commands.length > 0) {
        lines.push('');
        lines.push(`  ${this.getCategoryLabel(category)}:`);

        for (const config of commands) {
          const aliases = config.aliases ? ` (${config.aliases.join(', ')})` : '';
          lines.push(`    ${config.command}${aliases.padEnd(20)} ${config.description}`);
        }
      }
    }

    lines.push('');
    lines.push('Options:');
    lines.push('  --help, -h        显示帮助信息');
    lines.push('');
    lines.push('Examples:');
    lines.push('  rosydawn                          启动 REPL 模式');
    lines.push('  rosydawn new --topic "WebSocket"  创建新文章');
    lines.push('  rosydawn --help                   显示此帮助信息');

    return lines.join('\n');
  }

  /**
   * 生成命令帮助文本
   */
  private generateCommandHelp(config: CommandConfig): string {
    const lines: string[] = [];

    // 标题
    lines.push(`${config.command} - ${config.description}`);
    lines.push('');

    // Usage
    lines.push('Usage:');
    lines.push(`  rosydawn ${config.command} [options]`);
    lines.push('');

    // Arguments/Options
    if (config.options && config.options.length > 0) {
      lines.push('Options:');
      for (const option of config.options) {
        const required = option.required ? ' (必填)' : '';
        const defaultValue = option.default !== undefined ? ` [默认: ${option.default}]` : '';
        lines.push(`  --${option.name.padEnd(15)} ${option.description}${required}${defaultValue}`);
      }
      lines.push('');
    }

    // Examples
    if (config.examples && config.examples.length > 0) {
      lines.push('Examples:');
      for (const example of config.examples) {
        lines.push(`  ${example}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 获取类别标签
   */
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      content: '内容管理',
      deploy: '部署运维',
      system: '系统命令'
    };
    return labels[category] || category;
  }
}
