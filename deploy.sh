#!/bin/bash

# ============================================
# Rosydawn 博客部署脚本
# ============================================
# 用法:
#   ./deploy.sh init     - 首次部署（克隆项目并构建）
#   ./deploy.sh update   - 检测更新并重新部署
#   ./deploy.sh build    - 强制重新构建
#   ./deploy.sh cron     - 安装定时任务
# ============================================

set -e

# ==================== 配置区域 ====================
# 请根据实际情况修改以下配置

# GitHub 仓库地址
REPO_URL="https://github.com/YOUR_USERNAME/rosydawn.git"

# 项目部署目录
DEPLOY_DIR="/var/www/rosydawn"

# Astro 构建输出目录（相对于项目根目录）
BUILD_OUTPUT="dist"

# Nginx 网站根目录（Astro 构建产物会复制到这里）
WEB_ROOT="/var/www/html/rosydawn"

# Node.js 版本要求
NODE_VERSION_REQUIRED="18"

# 日志文件
LOG_FILE="/var/log/rosydawn-deploy.log"

# 检测更新的间隔（分钟），用于 cron
CRON_INTERVAL=5

# ==================== 颜色输出 ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

# ==================== 工具函数 ====================

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查 Node.js 版本
check_node_version() {
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt "$NODE_VERSION_REQUIRED" ]; then
        log_error "Node.js 版本过低，需要 v${NODE_VERSION_REQUIRED}+，当前为 $(node -v)"
        exit 1
    fi
    log_info "Node.js 版本: $(node -v)"
}

# 检查环境
check_environment() {
    log_info "检查部署环境..."
    check_command "git"
    check_command "node"
    check_command "npm"
    check_node_version
    log_success "环境检查通过"
}

# ==================== 部署函数 ====================

# 首次部署
init_deploy() {
    log_info "开始首次部署..."
    
    check_environment
    
    # 创建部署目录
    if [ -d "$DEPLOY_DIR" ]; then
        log_warn "部署目录已存在: $DEPLOY_DIR"
        read -p "是否删除并重新克隆？(y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf "$DEPLOY_DIR"
        else
            log_info "跳过克隆，直接构建..."
            cd "$DEPLOY_DIR"
            build_project
            return
        fi
    fi
    
    # 克隆项目
    log_info "克隆项目: $REPO_URL"
    mkdir -p "$(dirname "$DEPLOY_DIR")"
    git clone "$REPO_URL" "$DEPLOY_DIR"
    
    cd "$DEPLOY_DIR"
    
    # 构建项目
    build_project
    
    log_success "首次部署完成！"
    log_info "网站目录: $WEB_ROOT"
    log_info "请配置 Nginx 指向该目录"
}

# 构建项目
build_project() {
    log_info "安装依赖..."
    npm install
    
    log_info "构建 Astro 项目..."
    npm run build
    
    # 复制构建产物到网站目录
    log_info "部署到网站目录..."
    mkdir -p "$WEB_ROOT"
    rm -rf "${WEB_ROOT:?}/"*
    cp -r "$BUILD_OUTPUT/"* "$WEB_ROOT/"
    
    log_success "构建完成！"
}

# 检测更新并部署
update_deploy() {
    log_info "检测项目更新..."
    
    if [ ! -d "$DEPLOY_DIR" ]; then
        log_error "项目目录不存在: $DEPLOY_DIR"
        log_info "请先执行: ./deploy.sh init"
        exit 1
    fi
    
    cd "$DEPLOY_DIR"
    
    # 获取远程更新
    git fetch origin
    
    # 比较本地和远程
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        log_info "没有检测到更新，当前已是最新版本"
        log_info "本地 commit: ${LOCAL:0:8}"
        return 0
    fi
    
    log_info "检测到更新！"
    log_info "本地: ${LOCAL:0:8} -> 远程: ${REMOTE:0:8}"
    
    # 显示更新内容
    log_info "更新内容:"
    git log --oneline "$LOCAL..$REMOTE" | head -10
    
    # 拉取更新
    log_info "拉取更新..."
    git pull origin main 2>/dev/null || git pull origin master
    
    # 重新构建
    build_project
    
    log_success "更新部署完成！"
}

# 强制重新构建
force_build() {
    log_info "强制重新构建..."
    
    if [ ! -d "$DEPLOY_DIR" ]; then
        log_error "项目目录不存在: $DEPLOY_DIR"
        exit 1
    fi
    
    cd "$DEPLOY_DIR"
    build_project
    
    log_success "重新构建完成！"
}

# 安装定时任务
install_cron() {
    log_info "安装定时任务..."
    
    SCRIPT_PATH=$(realpath "$0")
    CRON_CMD="*/$CRON_INTERVAL * * * * $SCRIPT_PATH update >> $LOG_FILE 2>&1"
    
    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "rosydawn.*update"; then
        log_warn "定时任务已存在，是否替换？"
        read -p "(y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            log_info "取消安装"
            return
        fi
        # 移除旧的
        crontab -l | grep -v "rosydawn.*update" | crontab -
    fi
    
    # 添加新的定时任务
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    
    log_success "定时任务安装完成！"
    log_info "每 $CRON_INTERVAL 分钟检测一次更新"
    log_info "日志文件: $LOG_FILE"
    
    echo ""
    log_info "当前定时任务:"
    crontab -l | grep rosydawn
}

# 显示状态
show_status() {
    echo ""
    echo "==================== Rosydawn 部署状态 ===================="
    
    if [ -d "$DEPLOY_DIR" ]; then
        cd "$DEPLOY_DIR"
        echo "项目目录: $DEPLOY_DIR ✓"
        echo "当前分支: $(git branch --show-current)"
        echo "当前版本: $(git rev-parse --short HEAD)"
        echo "最后更新: $(git log -1 --format='%ci')"
    else
        echo "项目目录: $DEPLOY_DIR ✗ (未部署)"
    fi
    
    if [ -d "$WEB_ROOT" ]; then
        echo "网站目录: $WEB_ROOT ✓"
        echo "文件数量: $(find "$WEB_ROOT" -type f | wc -l) 个文件"
    else
        echo "网站目录: $WEB_ROOT ✗ (未构建)"
    fi
    
    if crontab -l 2>/dev/null | grep -q "rosydawn.*update"; then
        echo "定时任务: 已启用 ✓"
    else
        echo "定时任务: 未启用"
    fi
    
    echo "==========================================================="
    echo ""
}

# 显示帮助
show_help() {
    echo ""
    echo "Rosydawn 博客部署脚本"
    echo ""
    echo "用法: $0 <command>"
    echo ""
    echo "命令:"
    echo "  init      首次部署（克隆项目、安装依赖、构建）"
    echo "  update    检测更新并重新部署（用于定时任务）"
    echo "  build     强制重新构建（不拉取更新）"
    echo "  cron      安装定时任务（每 ${CRON_INTERVAL} 分钟检测更新）"
    echo "  status    显示部署状态"
    echo "  help      显示此帮助信息"
    echo ""
    echo "配置说明:"
    echo "  请在脚本开头修改以下配置:"
    echo "  - REPO_URL: GitHub 仓库地址"
    echo "  - DEPLOY_DIR: 项目部署目录"
    echo "  - WEB_ROOT: Nginx 网站根目录"
    echo ""
    echo "部署流程:"
    echo "  1. 修改脚本配置"
    echo "  2. 执行 ./deploy.sh init 完成首次部署"
    echo "  3. 配置 Nginx 指向 $WEB_ROOT"
    echo "  4. 执行 ./deploy.sh cron 启用自动更新"
    echo ""
}

# ==================== 主程序 ====================

# 确保日志目录存在
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

case "${1:-help}" in
    init)
        init_deploy
        show_status
        ;;
    update)
        update_deploy
        ;;
    build)
        force_build
        ;;
    cron)
        install_cron
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "未知命令: $1"
        show_help
        exit 1
        ;;
esac
